import { NextRequest, NextResponse } from 'next/server'
import { getAIResponse } from '@/lib/ai/client'
import type { ChatRequest } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json()
    const { messages, sessionState, userProfile, recentLogs } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'messages 不能为空' }, { status: 400 })
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUserMessage) {
      return NextResponse.json({ error: '未找到用户消息' }, { status: 400 })
    }

    const result = await getAIResponse(
      lastUserMessage.content,
      messages,
      sessionState,
      userProfile,
      recentLogs ?? []
    )

    return NextResponse.json(result)
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: '服务暂时不可用，请稍后重试' }, { status: 500 })
  }
}
