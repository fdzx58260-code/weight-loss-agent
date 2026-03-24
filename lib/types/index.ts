// ========== 枚举 / 联合类型 ==========

export type UserStage =
  | 'INTENT'
  | 'ASSESSMENT'
  | 'EARLY_MEDICATION'
  | 'DOSE_TITRATION'
  | 'STABLE_MAINTENANCE'
  | 'ABNORMAL_OBSERVATION'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type Sex = 'MALE' | 'FEMALE' | 'OTHER'
export type PregnancyStatus = 'NOT_PREGNANT' | 'PREGNANT' | 'TRYING' | 'BREASTFEEDING' | 'UNKNOWN'
export type MessageRole = 'user' | 'assistant' | 'system'
export type MessageIntent =
  | 'DATA_RECORDING'
  | 'SIDE_EFFECT_INQUIRY'
  | 'REFILL_INQUIRY'
  | 'ASSESSMENT'
  | 'ANXIETY_SUPPORT'
  | 'GENERAL'

export type SymptomType =
  | 'NAUSEA' | 'VOMITING' | 'CONSTIPATION' | 'DIARRHEA'
  | 'LOW_APPETITE' | 'ACID_REFLUX' | 'ABDOMINAL_PAIN' | 'FATIGUE' | 'OTHER'

export type SeverityLevel = 'MILD' | 'MODERATE' | 'SEVERE'

// ========== 用户档案 ==========

export interface UserProfile {
  id: string
  name: string
  age?: number
  sex?: Sex
  heightCm?: number
  startWeightKg?: number
  currentWeightKg?: number
  targetWeightKg?: number
  waistCm?: number
  conditions: string[]
  pregnancyStatus: PregnancyStatus
  currentStage: UserStage
  riskLevel: RiskLevel
  goals: string[]
  currentMedication?: string
  currentDose?: string
  medicationStartDate?: string
  createdAt: string
  updatedAt: string
}

export interface DailyLog {
  id: string
  userId: string
  date: string
  weightKg?: number
  appetiteScore?: number
  tookMedication: boolean
  missedDose: boolean
  exerciseMinutes?: number
  dietAdherenceScore?: number
  notes?: string
}

export interface SymptomLog {
  id: string
  userId: string
  date: string
  symptomType: SymptomType
  severity: SeverityLevel
  duration?: string
  canEat: boolean
  canDrink: boolean
  hasVomiting: boolean
  hasAbdominalPain: boolean
  note?: string
  redFlag: boolean
}

export interface WeeklySummary {
  id: string
  userId: string
  weekStart: string
  weekEnd: string
  weightChangeKg: number
  adherenceScore: number
  symptomScore: number
  lifestyleScore: number
  recommendation: string
}

export interface RefillStatus {
  userId: string
  eligible: boolean
  reason: string
  blocked: boolean
  blockReason?: string
  ctaLabel: string
  ctaType: 'primary' | 'secondary' | 'warning'
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  intent?: MessageIntent
  metadata?: Record<string, unknown>
}

export interface AssessmentData {
  step: number
  completed: boolean
  collectedProfile: Partial<UserProfile>
}

export interface SessionState {
  stage: 'assessment' | 'chat'
  assessment: AssessmentData
  awaitingFollowUp: string | null
  lastIntent?: MessageIntent
}

export interface ChatRequest {
  messages: Message[]
  sessionState: SessionState
  userProfile?: UserProfile
  recentLogs?: DailyLog[]
}

export interface ChatResponse {
  message: Message
  sessionState: SessionState
  profileUpdate?: Partial<UserProfile>
  refillStatus?: RefillStatus
}

// ========== 状态机配置 ==========

export interface StageConfig {
  label: string
  description: string
  chatFocus: string
  taskFocus: string[]
  allowRefillCta: boolean
  color: string
}

export const STAGE_CONFIG: Record<UserStage, StageConfig> = {
  INTENT: {
    label: '意向了解',
    description: '正在了解减重用药是否适合你',
    chatFocus: '了解目标与基本情况',
    taskFocus: ['完成初始评估', '了解减重计划'],
    allowRefillCta: false,
    color: 'text-gray-500 bg-gray-100',
  },
  ASSESSMENT: {
    label: '初始评估',
    description: '正在收集你的基本信息',
    chatFocus: '完成评估问卷',
    taskFocus: ['完成健康评估', '提交基础数据'],
    allowRefillCta: false,
    color: 'text-blue-600 bg-blue-50',
  },
  EARLY_MEDICATION: {
    label: '起始用药',
    description: '刚开始用药，重点关注适应情况',
    chatFocus: '监测副作用与适应情况',
    taskFocus: ['记录今日体重', '记录用药情况', '报告任何不适'],
    allowRefillCta: false,
    color: 'text-teal-600 bg-teal-50',
  },
  DOSE_TITRATION: {
    label: '剂量爬坡',
    description: '剂量调整阶段，保持节奏稳定',
    chatFocus: '依从性与副作用管理',
    taskFocus: ['记录今日体重', '记录副作用', '保持饮食计划'],
    allowRefillCta: false,
    color: 'text-indigo-600 bg-indigo-50',
  },
  STABLE_MAINTENANCE: {
    label: '稳定维持',
    description: '用药平稳，重点关注长期效果',
    chatFocus: '效果追踪与复购引导',
    taskFocus: ['记录本周体重', '评估下一疗程', '维持生活方式'],
    allowRefillCta: true,
    color: 'text-green-600 bg-green-50',
  },
  ABNORMAL_OBSERVATION: {
    label: '异常观察',
    description: '出现异常情况，暂缓转化，优先处理',
    chatFocus: '副作用评估与分流',
    taskFocus: ['持续观察症状', '联系医生评估', '暂停自行用药决策'],
    allowRefillCta: false,
    color: 'text-red-600 bg-red-50',
  },
}
