'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import MessageBubble from './MessageBubble'
import type { Message, SessionState, UserProfile, DailyLog, ChatResponse } from '@/lib/types'

const QUICK_REPLIES = ['今天体重记录一下', '我有点恶心', '今天按时用药了', '我想了解复购']

interface Props {
  initialMessages: Message[]
  initialSessionState: SessionState
  userProfile?: UserProfile
  recentLogs?: DailyLog[]
  onProfileUpdate?: (update: Partial<UserProfile>) => void
}

export default function ChatWindow({ initialMessages, initialSessionState, userProfile, recentLogs = [], onProfileUpdate }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [sessionState, setSessionState] = useState<SessionState>(initialSessionState)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isLoading])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, sessionState, userProfile, recentLogs }),
      })
      if (!res.ok) throw new Error('请求失败')
      const data: ChatResponse = await res.json()
      setMessages((prev) => [...prev, data.message])
      setSessionState(data.sessionState)
      if (data.profileUpdate && onProfileUpdate) onProfileUpdate(data.profileUpdate)
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err_${Date.now()}`, role: 'assistant', content: '抱歉，暂时连接不上服务，请稍后再试。', timestamp: new Date().toISOString() },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [messages, sessionState, userProfile, recentLogs, isLoading, onProfileUpdate])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      {/* 消息列表 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll p-4 space-y-4">
        {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
              <span className="text-teal-600 text-xs font-bold">助</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-teal-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-teal-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-teal-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 快捷回复 */}
      {messages.length <= 2 && !isLoading && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {QUICK_REPLIES.map((qr) => (
            <button key={qr} onClick={() => sendMessage(qr)}
              className="shrink-0 text-xs bg-white border border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-600 px-3 py-1.5 rounded-full transition-colors">
              {qr}
            </button>
          ))}
        </div>
      )}

      {/* 输入区 */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-end gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-teal-300 transition-colors">
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="告诉我今天的状况，或者问我任何问题..."
            rows={1} className="flex-1 resize-none bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none max-h-32"
            style={{ minHeight: '24px' }} />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}
            className="w-8 h-8 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 rounded-lg flex items-center justify-center transition-colors shrink-0">
            <span className="text-white text-sm">↑</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">本助手为减重管理辅助工具，不替代医疗诊断</p>
      </div>
    </div>
  )
}
