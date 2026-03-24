import type { WeeklySummary } from '@/lib/types'

export default function SummaryCard({ summary }: { summary: WeeklySummary }) {
  const dir = summary.weightChangeKg < 0 ? 'down' : summary.weightChangeKg > 0 ? 'up' : 'flat'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h2 className="font-semibold text-gray-900">本周小结</h2>

      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
        <span className="text-2xl">{dir === 'down' ? '📉' : dir === 'up' ? '📈' : '➡️'}</span>
        <div>
          <p className="text-sm font-semibold text-gray-700">
            本周体重{' '}
            <span className={dir === 'down' ? 'text-teal-600 font-bold' : dir === 'up' ? 'text-red-500 font-bold' : 'text-gray-500 font-bold'}>
              {summary.weightChangeKg > 0 ? '+' : ''}{summary.weightChangeKg}kg
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {dir === 'down' ? '继续保持，稳步向目标前进' : dir === 'up' ? '这周略有波动，可以回顾一下饮食' : '体重平稳，继续观察趋势'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '用药依从', score: summary.adherenceScore },
          { label: '生活方式', score: summary.lifestyleScore },
          { label: '状态良好度', score: 100 - summary.symptomScore },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className={`text-base font-bold ${s.score >= 80 ? 'text-teal-600' : s.score >= 60 ? 'text-yellow-500' : 'text-red-400'}`}>
              {s.score}<span className="text-xs font-normal">%</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-teal-50 rounded-xl p-3">
        <p className="text-xs font-medium text-teal-700 mb-1">助手建议</p>
        <p className="text-xs text-teal-600 leading-relaxed">{summary.recommendation}</p>
      </div>
    </div>
  )
}
