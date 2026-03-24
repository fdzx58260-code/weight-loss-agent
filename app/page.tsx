import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* 导航 */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">减</span>
          </div>
          <span className="font-semibold text-gray-900">减重助手</span>
        </div>
        <Link href="/chat" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          进入助手 →
        </Link>
      </nav>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full inline-block"></span>
          减重用药陪伴工具，不替代医生诊断
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          你的减重用药
          <br />
          <span className="text-teal-600">专属陪伴助手</span>
        </h1>

        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          帮你记录减重进展、管理副作用、保持用药依从性，
          在正确的时机提醒你评估下一步计划。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/chat?mode=new"
            className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            开始评估 →
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-xl border border-gray-200 transition-colors"
          >
            继续我的减重计划
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          本工具为减重管理辅助工具，不提供医疗诊断，不替代医生意见。
        </p>
      </main>

      {/* 功能卡片 */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { emoji: '💬', title: '智能对话陪伴', desc: '随时记录体重、用药情况，AI 助手实时响应你的疑问' },
            { emoji: '📉', title: '进展可视追踪', desc: '体重趋势、用药依从性、食欲变化，一目了然' },
            { emoji: '🛡️', title: '副作用识别与分流', desc: '智能识别常见副作用，判断风险等级，必要时引导就医' },
            { emoji: '🔔', title: '阶段提醒与复购引导', desc: '在合适时机提醒你评估下一疗程，对接既有购药链路' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        减重助手仅为减重管理辅助工具 · 遇到不适请及时就医 · 不构成医疗建议
      </footer>
    </div>
  )
}
