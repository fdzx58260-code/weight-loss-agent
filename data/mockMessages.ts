import type { Message } from '@/lib/types'

export const MOCK_INITIAL_MESSAGES: Message[] = [
  {
    id: 'init_001',
    role: 'assistant',
    content: `你好，小林！我是你的减重助手 🌿

你已经坚持用药 5 周了，体重从 78.5kg 降到了 74.2kg，减了 **4.3kg** — 这个进展很稳定，继续保持！

今天有什么想记录的，或者有什么问题想聊聊吗？`,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
]
