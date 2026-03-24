import type { RefillStatus } from '@/lib/types'

export default function RefillCard({ refillStatus }: { refillStatus: RefillStatus }) {
  const consultUrl = process.env.NEXT_PUBLIC_CONSULT_URL ?? '#'
  const refillUrl = process.env.NEXT_PUBLIC_REFILL_URL ?? '#'

  if (refillStatus.blocked) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          <h2 className="font-semibold text-red-700 text-sm">暂缓复购</h2>
        </div>
        <p className="text-xs text-red-600 leading-relaxed">{refillStatus.blockReason}</p>
        <a href={consultUrl} target="_blank" rel="noopener noreferrer"
          className="block text-center text-sm font-medium text-red-600 border border-red-200 rounded-xl py-2 hover:bg-red-100 transition-colors">
          联系医生评估
        </a>
      </div>
    )
  }

  if (!refillStatus.eligible) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
        <h2 className="font-semibold text-gray-600 text-sm">复购建议</h2>
        <p className="text-xs text-gray-500 leading-relaxed">{refillStatus.reason}</p>
        <a href={consultUrl} target="_blank" rel="noopener noreferrer"
          className="block text-center text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2 hover:bg-gray-100 transition-colors">
          {refillStatus.ctaLabel}
        </a>
      </div>
    )
  }

  return (
    <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span>🛍️</span>
        <h2 className="font-semibold text-teal-700 text-sm">可以复购了</h2>
      </div>
      <p className="text-xs text-teal-600 leading-relaxed">{refillStatus.reason}</p>
      <a href={refillUrl} target="_blank" rel="noopener noreferrer"
        className="block text-center text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-2.5 transition-colors">
        {refillStatus.ctaLabel}
      </a>
      <a href={consultUrl} target="_blank" rel="noopener noreferrer"
        className="block text-center text-xs text-teal-500 hover:text-teal-700">
        或联系顾问评估方案
      </a>
    </div>
  )
}
