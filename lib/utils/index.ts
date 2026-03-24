import { clsx, type ClassValue } from 'clsx'
import type { UserProfile, DailyLog, RefillStatus } from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function calcBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1))
}

export function getMedicationWeeks(startDate: string): number {
  const diff = Date.now() - new Date(startDate).getTime()
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
}

export function getWeightLost(profile: UserProfile): number {
  if (!profile.startWeightKg || !profile.currentWeightKg) return 0
  return parseFloat((profile.startWeightKg - profile.currentWeightKg).toFixed(1))
}

export function getProgressPercent(profile: UserProfile): number {
  if (!profile.startWeightKg || !profile.currentWeightKg || !profile.targetWeightKg) return 0
  const total = profile.startWeightKg - profile.targetWeightKg
  if (total <= 0) return 0
  const done = profile.startWeightKg - profile.currentWeightKg
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)))
}

export function calcRefillStatus(
  profile: UserProfile,
  recentLogs: DailyLog[]
): RefillStatus {
  if (profile.riskLevel === 'CRITICAL' || profile.currentStage === 'ABNORMAL_OBSERVATION') {
    return {
      userId: profile.id,
      eligible: false,
      reason: '当前存在异常情况',
      blocked: true,
      blockReason: '检测到高风险标志，暂停复购引导，请先咨询医生',
      ctaLabel: '联系医生评估',
      ctaType: 'warning',
    }
  }
  if (profile.currentStage === 'EARLY_MEDICATION') {
    return {
      userId: profile.id,
      eligible: false,
      reason: '当前处于起始适应期，建议稳定后再评估',
      blocked: false,
      ctaLabel: '咨询顾问了解方案',
      ctaType: 'secondary',
    }
  }
  const recentMissed = recentLogs.slice(-7).filter((l) => l.missedDose).length
  if (recentMissed >= 3) {
    return {
      userId: profile.id,
      eligible: false,
      reason: '近期漏药次数较多，建议先咨询顾问',
      blocked: false,
      ctaLabel: '咨询顾问评估方案',
      ctaType: 'secondary',
    }
  }
  if (profile.currentStage === 'STABLE_MAINTENANCE') {
    const medWeeks = profile.medicationStartDate
      ? getMedicationWeeks(profile.medicationStartDate)
      : 0
    if (medWeeks >= 8) {
      return {
        userId: profile.id,
        eligible: true,
        reason: `已用药 ${medWeeks} 周，状态平稳，可以评估下一疗程`,
        blocked: false,
        ctaLabel: '去咨询顾问继续购药',
        ctaType: 'primary',
      }
    }
  }
  return {
    userId: profile.id,
    eligible: false,
    reason: '继续跟踪几周后评估复购时机',
    blocked: false,
    ctaLabel: '联系顾问了解下一步',
    ctaType: 'secondary',
  }
}

export function getRiskColor(riskLevel: string): string {
  const map: Record<string, string> = {
    LOW: 'text-green-600 bg-green-50',
    MEDIUM: 'text-yellow-600 bg-yellow-50',
    HIGH: 'text-orange-600 bg-orange-50',
    CRITICAL: 'text-red-600 bg-red-50',
  }
  return map[riskLevel] ?? 'text-gray-600 bg-gray-50'
}

export function getRiskLabel(riskLevel: string): string {
  const map: Record<string, string> = {
    LOW: '风险较低',
    MEDIUM: '中等风险',
    HIGH: '需要关注',
    CRITICAL: '高风险',
  }
  return map[riskLevel] ?? '未评估'
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function getTodayLog(logs: DailyLog[]): DailyLog | undefined {
  const today = getTodayString()
  return logs.find((l) => l.date === today)
}
