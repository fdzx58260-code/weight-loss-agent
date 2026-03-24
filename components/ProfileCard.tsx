import { getWeightLost, getProgressPercent, getMedicationWeeks, getRiskColor, getRiskLabel } from '@/lib/utils'
import { STAGE_CONFIG } from '@/lib/types'
import type { UserProfile } from '@/lib/types'

export default function ProfileCard({ profile }: { profile: UserProfile }) {
  const weightLost = getWeightLost(profile)
  const progress = getProgressPercent(profile)
  const medWeeks = profile.medicationStartDate ? getMedicationWeeks(profile.medicationStartDate) : 0
  const stageConfig = STAGE_CONFIG[profile.currentStage]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-sm">我的减重档案</h2>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stageConfig.color}`}>
          {stageConfig.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '起始', value: `${profile.startWeightKg ?? '--'}kg`, hl: false },
          { label: '当前', value: `${profile.currentWeightKg ?? '--'}kg`, hl: true },
          { label: '目标', value: `${profile.targetWeightKg ?? '--'}kg`, hl: false },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-2.5 text-center ${s.hl ? 'bg-teal-50' : 'bg-gray-50'}`}>
            <p className={`text-base font-bold ${s.hl ? 'text-teal-700' : 'text-gray-700'}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-gray-500">已减重</span>
          <span className="text-xs font-semibold text-teal-600">
            {weightLost > 0 ? `↓ ${weightLost}kg` : '待记录'}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-right">目标完成 {progress}%</p>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-50 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">当前药物</span>
          <span className="text-gray-700 font-medium">{profile.currentMedication ?? '--'} {profile.currentDose ?? ''}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">用药周数</span>
          <span className="text-gray-700 font-medium">第 {medWeeks} 周</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">当前风险</span>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${getRiskColor(profile.riskLevel)}`}>
            {getRiskLabel(profile.riskLevel)}
          </span>
        </div>
      </div>
    </div>
  )
}
