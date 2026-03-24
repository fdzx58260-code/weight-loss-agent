import NavBar from '@/components/NavBar'
import SummaryCard from '@/components/SummaryCard'
import { MOCK_DAILY_LOGS, MOCK_WEEKLY_SUMMARY } from '@/data/mockLogs'
import { MOCK_USER } from '@/data/mockUser'
import { formatDate } from '@/lib/utils'

export default function SummaryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">阶段总结</h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(MOCK_WEEKLY_SUMMARY.weekStart)} — {formatDate(MOCK_WEEKLY_SUMMARY.weekEnd)}
          </p>
        </div>

        <SummaryCard summary={MOCK_WEEKLY_SUMMARY} />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">本周每日记录</h2>
          <div className="space-y-3">
            {MOCK_DAILY_LOGS.map((log) => (
              <div key={log.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-400 w-14 shrink-0">{formatDate(log.date)}</span>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {log.weightKg && <Tag text={`${log.weightKg}kg`} />}
                  <Tag text={log.tookMedication ? '已用药' : '⚠️ 漏药'} warn={log.missedDose} />
                  {log.appetiteScore && <Tag text={`食欲${log.appetiteScore}/5`} />}
                  {!!log.exerciseMinutes && <Tag text={`运动${log.exerciseMinutes}min`} />}
                </div>
                {log.notes ? <span className="text-xs text-gray-400 max-w-[100px] truncate">{log.notes}</span> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100">
          <h2 className="font-semibold text-teal-800 mb-2">下一步建议</h2>
          <ul className="space-y-2 text-sm text-teal-700">
            <li>• 继续保持每日体重记录，趋势数据越多越有参考价值</li>
            <li>• 建议本周运动目标提升到每天 30 分钟以上</li>
            <li>• 如果近期体重停滞超过 2 周，可以聊聊当前的饮食情况</li>
            <li>• 用药 {MOCK_USER.currentDose} 阶段基本稳定，继续观察 2 周后可评估下一步</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

function Tag({ text, warn }: { text: string; warn?: boolean }) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${warn ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-gray-100 text-gray-500'}`}>
      {text}
    </span>
  )
}
