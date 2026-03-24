import type { UserProfile, SessionState } from '@/lib/types'

function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const MOCK_USER: UserProfile = {
  id: 'user_001',
  name: '小林',
  age: 32,
  sex: 'FEMALE',
  heightCm: 162,
  startWeightKg: 78.5,
  currentWeightKg: 74.2,
  targetWeightKg: 63.0,
  waistCm: 84,
  conditions: [],
  pregnancyStatus: 'NOT_PREGNANT',
  currentStage: 'DOSE_TITRATION',
  riskLevel: 'LOW',
  goals: ['减轻体重', '改善代谢', '维持健康生活方式'],
  currentMedication: '司美格鲁肽',
  currentDose: '0.5mg',
  medicationStartDate: daysAgoISO(35).split('T')[0],
  createdAt: daysAgoISO(35),
  updatedAt: new Date().toISOString(),
}

export const DEFAULT_SESSION_STATE: SessionState = {
  stage: 'chat',
  assessment: {
    step: 10,
    completed: true,
    collectedProfile: MOCK_USER,
  },
  awaitingFollowUp: null,
}

export const NEW_USER_SESSION_STATE: SessionState = {
  stage: 'assessment',
  assessment: {
    step: 0,
    completed: false,
    collectedProfile: {},
  },
  awaitingFollowUp: null,
}
