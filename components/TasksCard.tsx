import { STAGE_CONFIG } from '@/lib/types'
import type { UserProfile, DailyLog } from '@/lib/types'

export default function TasksCard({ profile, todayLog }: { profile: UserProfile; todayLog?: DailyLog }) {
  const stageConfig = STAGE_CONFIG[profile.currentStage]
  const tasks = [
    { label: '记录今日体重', done: !!todayLog?.weightKg },
    { label: '确认今日用药', done: todayLog ? todayLog.tookMedication : false },
    { label: '记录今日食欲', done: !!todayLog?.appetiteScore },
    { label: '有不适？告诉我', done: false, urgent: profile.currentStage === 'ABNORMAL_OBSERVATION' },
  ]
  const doneCnt = tasks.filter((t) => t.done).length

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-900 text-sm">今日待办</h2>
        <span className="text-xs text-gray-400">{doneCnt}/{tasks.length} 完成</span>
      </div>
      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.label} className="flex items-center gap-2.5">
            <span className={`text-base ${t.done ? 'text-teal-500' : t.urgent ? 'text-red-400' : 'text-gray-300'}`}>
              {t.done ? '✓' : t.urgent ? '⚠' : '○'}
            </span>
            <span className={`text-sm ${t.done ? 'line-through text-gray-400' : t.urgent ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
              {t.label}
            </span>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-gray-50">
        <p className="text-xs text-gray-400">{stageConfig.description}</p>
      </div>
    </div>
  )
}
