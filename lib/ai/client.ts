import { getMockResponse, getInitialMessage } from './mock'
import type { Message, SessionState, UserProfile, DailyLog, ChatResponse } from '@/lib/types'

export { getInitialMessage }

function callElbntAI(apiKey: string, body: object): Promise<string> {
  return new Promise((resolve, reject) => {
    const https = require('https')
    const payload = JSON.stringify(body)

    const options = {
      hostname: 'www.elbnt.ai',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      timeout: 60000,
    }

    const req = https.request(options, (res: any) => {
      let data = ''
      res.on('data', (chunk: any) => { data += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.content?.[0]?.text) {
            resolve(json.content[0].text)
          } else {
            reject(new Error(`API error: ${data}`))
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data}`))
        }
      })
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timed out after 60s'))
    })

    req.on('error', (e: Error) => reject(e))
    req.write(payload)
    req.end()
  })
}

export async function getAIResponse(
  userMessage: string,
  messages: Message[],
  sessionState: SessionState,
  userProfile?: UserProfile,
  recentLogs: DailyLog[] = []
): Promise<ChatResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    const { response, updatedState, profileUpdate } = getMockResponse(
      userMessage, messages, sessionState, userProfile
    )
    return { message: response, sessionState: updatedState, profileUpdate: profileUpdate as Partial<UserProfile> | undefined }
  }

  try {
    const { SYSTEM_PROMPT, buildContextPrompt } = await import('./prompts')
    const context = buildContextPrompt(userProfile ?? {}, recentLogs)

    const content = await callElbntAI(apiKey, {
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: SYSTEM_PROMPT + context,
      messages: messages.slice(-10).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    let profileUpdate: Partial<UserProfile> | undefined
    if (/怀孕|备孕|哺乳/.test(userMessage)) {
      profileUpdate = { riskLevel: 'CRITICAL', currentStage: 'ABNORMAL_OBSERVATION' }
    } else if (/肚子很?痛|腹痛|黑便|便血/.test(userMessage)) {
      profileUpdate = { riskLevel: 'HIGH', currentStage: 'ABNORMAL_OBSERVATION' }
    }

    return {
      message: { id: `ai_${Date.now()}`, role: 'assistant', content, timestamp: new Date().toISOString() },
      sessionState,
      profileUpdate,
    }
  } catch (err) {
    console.error('AI error, fallback to mock:', err)
    const { response, updatedState, profileUpdate } = getMockResponse(userMessage, messages, sessionState, userProfile)
    return { message: response, sessionState: updatedState, profileUpdate: profileUpdate as Partial<UserProfile> | undefined }
  }
}
