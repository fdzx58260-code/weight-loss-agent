'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import NavBar from '@/components/NavBar'
import ChatWindow from '@/components/ChatWindow'
import ProfileCard from '@/components/ProfileCard'
import TasksCard from '@/components/TasksCard'
import RefillCard from '@/components/RefillCard'
import { MOCK_USER, DEFAULT_SESSION_STATE, NEW_USER_SESSION_STATE } from '@/data/mockUser'
import { MOCK_DAILY_LOGS } from '@/data/mockLogs'
import { MOCK_INITIAL_MESSAGES } from '@/data/mockMessages'
import { calcRefillStatus, getTodayLog } from '@/lib/utils'
import { getInitialMessage } from '@/lib/ai/client'
import type { UserProfile, Message, SessionState } from '@/lib/types'

function ChatPageInner() {
  const searchParams = useSearchParams()
  const isNew = searchParams.get('mode') === 'new'

  const [profile, setProfile] = useState<UserProfile>(MOCK_USER)
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionState, setSessionState] = useState<SessionState>(DEFAULT_SESSION_STATE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (isNew) {
      const initMsg = getInitialMessage()
      setMessages([initMsg])
      setSessionState(NEW_USER_SESSION_STATE)
      setProfile({ ...MOCK_USER, currentStage: 'ASSESSMENT' })
    } else {
      try {
        const sp = localStorage.getItem('wl_profile')
        const sm = localStorage.getItem('wl_messages')
        const ss = localStorage.getItem('wl_session')
        if (sp) setProfile(JSON.parse(sp))
        if (sm) setMessages(JSON.parse(sm))
        else setMessages(MOCK_INITIAL_MESSAGES)
        if (ss) setSessionState(JSON.parse(ss))
      } catch {
        setMessages(MOCK_INITIAL_MESSAGES)
      }
    }
    setHydrated(true)
  }, [isNew])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('wl_profile', JSON.stringify(profile))
  }, [profile, hydrated])

  useEffect(() => {
    if (!hydrated || messages.length === 0) return
    localStorage.setItem('wl_messages', JSON.stringify(messages.slice(-100)))
  }, [messages, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('wl_session', JSON.stringify(sessionState))
  }, [sessionState, hydrated])

  const handleProfileUpdate = (update: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...update, updatedAt: new Date().toISOString() }))
  }

  const todayLog = getTodayLog(MOCK_DAILY_LOGS)
  const refillStatus = calcRefillStatus(profile, MOCK_DAILY_LOGS)

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-6xl mx-auto px-4 py-4" style={{ height: 'calc(100vh - 56px)', display: 'flex', gap: '1rem' }}>
        {/* 聊天主区域 */}
        <div className="flex-1 min-w-0">
          <ChatWindow
            initialMessages={messages}
            initialSessionState={sessionState}
            userProfile={profile}
            recentLogs={MOCK_DAILY_LOGS}
            onProfileUpdate={handleProfileUpdate}
          />
        </div>

        {/* 右侧边栏（桌面端） */}
        <div className="hidden lg:flex flex-col gap-3 overflow-y-auto chat-scroll pb-4" style={{ width: '280px', flexShrink: 0 }}>
          <ProfileCard profile={profile} />
          <TasksCard profile={profile} todayLog={todayLog} />
          <RefillCard refillStatus={refillStatus} />
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ChatPageInner />
    </Suspense>
  )
}
