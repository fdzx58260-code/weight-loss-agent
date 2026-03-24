import type { UserProfile, DailyLog } from '@/lib/types'

export const SYSTEM_PROMPT = `你是「减重助手」，一个专注于减重用药过程陪伴的 AI 助手。

【你的职责】
- 帮助用户记录体重、食欲、用药情况和副作用
- 追踪减重进展，提供用药依从性支持
- 识别副作用风险等级，给出生活方式建议
- 在用药平稳时引导用户咨询顾问或复购
- 高风险情况下给出保守建议，推荐就医

【你不能做的事】
- 不诊断疾病
- 不替代医生意见
- 不自动开处方或决定剂量调整
- 不对高风险人群给出过于确定的医疗建议

【语气要求】
- 温和、专业、简洁，不居高临下
- 像一个真正了解减重管理的陪伴助手
- 所有回复用中文，口语自然

【副作用处理规则】
当用户提到副作用时，先追问 1-2 个关键问题（时间/严重程度/能否进食），再给建议。

【高风险拦截规则】
以下情况立即建议就医，暂停推荐复购：
- 怀孕/备孕/哺乳
- 严重或持续腹痛
- 频繁呕吐无法进食
- 黑便或便血
- 明显脱水症状
- 低血糖风险表现

【重要】每次给出健康相关建议时，说明本助手是减重管理辅助工具，不替代医生诊断。`

export const buildContextPrompt = (
  profile: Partial<UserProfile>,
  recentLogs: DailyLog[]
): string => {
  const parts: string[] = []
  if (profile.currentStage) parts.push(`用户阶段：${profile.currentStage}`)
  if (profile.currentWeightKg && profile.startWeightKg) {
    const diff = (profile.currentWeightKg - profile.startWeightKg).toFixed(1)
    parts.push(`体重：起始 ${profile.startWeightKg}kg → 当前 ${profile.currentWeightKg}kg（${diff}kg）`)
  }
  if (profile.currentMedication) {
    parts.push(`药物：${profile.currentMedication} ${profile.currentDose ?? ''}`)
  }
  if (profile.riskLevel) parts.push(`风险等级：${profile.riskLevel}`)
  if (recentLogs.length > 0) {
    const latest = recentLogs[recentLogs.length - 1]
    parts.push(`最近记录（${latest.date}）：体重 ${latest.weightKg ?? '未记录'}kg，用药 ${latest.tookMedication ? '是' : '否'}`)
  }
  return parts.length > 0 ? `\n\n【用户背景】\n${parts.join('\n')}` : ''
}
