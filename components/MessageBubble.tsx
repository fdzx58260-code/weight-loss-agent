'use client'

import type { Message } from '@/lib/types'

function renderContent(text: string) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line === '') return <div key={i} className="h-1" />

        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-teal-400 shrink-0 mt-0.5">•</span>
              <span dangerouslySetInnerHTML={{ __html: boldify(line.slice(2)) }} />
            </div>
          )
        }

        if (/^\d+\./.test(line)) {
          const num = line.match(/^(\d+)\./)?.[1]
          const rest = line.replace(/^\d+\.\s*/, '')
          return (
            <div key={i} className="flex gap-2">
              <span className="text-teal-500 font-medium shrink-0 w-4">{num}.</span>
              <span dangerouslySetInnerHTML={{ __html: boldify(rest) }} />
            </div>
          )
        }

        if (line.startsWith('⚠️')) {
          return (
            <div
              key={i}
              className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-800 text-xs"
              dangerouslySetInnerHTML={{ __html: boldify(line) }}
            />
          )
        }

        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: boldify(line) }} />
        )
      })}
    </div>
  )
}

function boldify(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse ml-auto' : 'mr-auto'} max-w-[85%]`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-teal-600 text-xs font-bold">助</span>
        </div>
      )}
      <div
        className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-teal-600 text-white rounded-tr-sm'
            : 'bg-white border border-gray-100 shadow-sm rounded-tl-sm text-gray-800'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          renderContent(message.content)
        )}
      </div>
    </div>
  )
}
