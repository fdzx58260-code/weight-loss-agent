import type { DailyLog, WeeklySummary } from '@/lib/types'

const userId = 'user_001'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

let _id = 0
const uid = () => `log_${++_id}`

export const MOCK_DAILY_LOGS: DailyLog[] = [
  { id: uid(), userId, date: daysAgo(6), weightKg: 75.1, appetiteScore: 3, tookMedication: true, missedDose: false, exerciseMinutes: 20, dietAdherenceScore: 4, notes: '轻微恶心，饭后好些' },
  { id: uid(), userId, date: daysAgo(5), weightKg: 74.9, appetiteScore: 3, tookMedication: true, missedDose: false, exerciseMinutes: 0, dietAdherenceScore: 3, notes: '' },
  { id: uid(), userId, date: daysAgo(4), weightKg: 74.8, appetiteScore: 4, tookMedication: false, missedDose: true, exerciseMinutes: 30, dietAdherenceScore: 4, notes: '忘了用药' },
  { id: uid(), userId, date: daysAgo(3), weightKg: 74.6, appetiteScore: 4, tookMedication: true, missedDose: false, exerciseMinutes: 25, dietAdherenceScore: 5, notes: '' },
  { id: uid(), userId, date: daysAgo(2), weightKg: 74.4, appetiteScore: 4, tookMedication: true, missedDose: false, exerciseMinutes: 40, dietAdherenceScore: 4, notes: '今天状态不错' },
  { id: uid(), userId, date: daysAgo(1), weightKg: 74.3, appetiteScore: 4, tookMedication: true, missedDose: false, exerciseMinutes: 20, dietAdherenceScore: 4, notes: '' },
  { id: uid(), userId, date: daysAgo(0), weightKg: 74.2, appetiteScore: 4, tookMedication: true, missedDose: false, exerciseMinutes: 0, dietAdherenceScore: 3, notes: '' },
]

export const MOCK_WEEKLY_SUMMARY: WeeklySummary = {
  id: 'ws_001',
  userId,
  weekStart: daysAgo(6),
  weekEnd: daysAgo(0),
  weightChangeKg: -0.9,
  adherenceScore: 86,
  symptomScore: 20,
  lifestyleScore: 72,
  recommendation: '本周整体状况良好，体重稳步下降。有一次漏药，注意设置提醒。下周继续保持当前剂量，建议增加每日步行时间到 30 分钟以上。',
}
