import { getMockResponse, getInitialMessage } from './mock'
import type { Message, SessionState, UserProfile, DailyLog, ChatResponse } from '@/lib/types'

export { getInitialMessage }

export async function getAIResponse(
  userMessage: string,
  messages: Message[],
  sessionState: SessionState,
  userProfile?: UserProfile,
  recentLogs: DailyLog[] = []
): Promise<ChatResponse> {
  const hasKey = !!process.env.OPENAI_API_KEY

  if (!hasKey) {
    const { response, updatedState, profileUpdate } = getMockResponse(
      userMessage,
      messages,
      sessionState,
      userProfile
    )
    return { message: response, sessionState: updatedState, profileUpdate: profileUpdate as Partial<UserProfile> | undefined }
  }

  // OpenAI 路径（有 key 时启用）
  try {
    const { default: OpenAI } = await import('openai')
    const { SYSTEM_PROMPT, buildContextPrompt } = await import('./prompts')

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const context = buildContextPrompt(userProfile ?? {}, recentLogs)
    const sysPrompt = SYSTEM_PROMPT + context

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: sysPrompt },
        ...messages.slice(-20).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      max_tokens: 800,
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content ?? '抱歉，暂时没有收到回复，请稍后再试。'
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
    console.error('OpenAI error, fallback to mock:', err)
    const { response, updatedState, profileUpdate } = getMockResponse(userMessage, messages, sessionState, userProfile)
    return { message: response, sessionState: updatedState, profileUpdate: profileUpdate as Partial<UserProfile> | undefined }
  }
}
