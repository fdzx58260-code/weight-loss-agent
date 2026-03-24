import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '减重助手 — 减重用药陪伴',
  description: '陪你完成减重用药记录、进展跟踪、副作用管理和复购提醒',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
