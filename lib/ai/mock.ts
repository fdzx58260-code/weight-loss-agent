import type { Message, SessionState, UserProfile } from '@/lib/types'

let _idCounter = 0
function uid() {
  return `msg_${Date.now()}_${++_idCounter}`
}

function assistantMsg(content: string): Message {
  return { id: uid(), role: 'assistant', content, timestamp: new Date().toISOString() }
}

// ========== 评估步骤文本 ==========

function getAssessmentQuestion(step: number, data: Record<string, unknown>): string {
  switch (step) {
    case 0:
      return `你好！我是你的减重助手 🌿

我会陪你记录整个减重用药过程，帮你管理副作用、追踪进展，在合适的时候提醒你评估下一步计划。

先做一个简单的初始了解，方便我更好地帮助你。

**请问你今年多大了？**`

    case 1:
      return `好的${data.age ? `，${data.age} 岁` : ''}。请问你的性别是？（男 / 女）`

    case 2:
      return `请问你的身高是多少厘米？`

    case 3:
      return `你目前的体重是多少公斤？`

    case 4: {
      const bmi =
        data.heightCm && data.currentWeightKg
          ? ((Number(data.currentWeightKg) / Math.pow(Number(data.heightCm) / 100, 2)).toFixed(1))
          : null
      return `明白了${bmi ? `（当前 BMI 约 ${bmi}）` : ''}。你的目标体重是多少公斤？`
    }

    case 5:
      return `你目前是否正在使用减重药物？（是 / 否）`

    case 6:
      return `在用哪种药物？用了多长时间了？目前的剂量是多少？

比如：「司美格鲁肽 0.5mg，用了 6 周」这样描述就很清楚～`

    case 7:
      return `有没有以下情况？（有就告诉我，没有就说"都没有"）

- 糖尿病
- 高血压
- 甲状腺问题
- 胰腺炎或胆囊疾病
- 其他慢性病`

    case 8:
      return `请问你目前是否处于怀孕、备孕或哺乳期？`

    case 9:
      return `最后一个问题：你目前最困扰你的是什么？

比如：体重停滞、副作用不适、食欲太低、总是漏药、不确定是否继续用药……`

    case 10: {
      const diff =
        data.targetWeightKg && data.currentWeightKg
          ? (Number(data.currentWeightKg) - Number(data.targetWeightKg)).toFixed(1)
          : null
      return `很好，初始了解完成了！我已经为你建立了减重档案。

${diff ? `你还需要减 **${diff}kg** 达到目标，我会一路陪着你。` : ''}

接下来你可以：
- 每天告诉我今日体重和用药情况
- 有任何不舒服直接告诉我
- 随时问我任何关于用药或减重的问题

**今天用药了吗？体重是多少？** 先从今天开始记录吧 😊`
    }

    default:
      return `有什么我可以帮你的吗？`
  }
}

// ========== 处理评估流程 ==========

function handleAssessment(
  userMessage: string,
  sessionState: SessionState
): { response: Message; updatedState: SessionState; profileUpdate?: Record<string, unknown> } {
  const { assessment } = sessionState
  const step = assessment.step
  const collected: Record<string, unknown> = { ...assessment.collectedProfile }
  let profileUpdate: Record<string, unknown> = {}

  if (step === 1) {
    const ageMatch = userMessage.match(/\d+/)
    if (ageMatch) { collected.age = parseInt(ageMatch[0]); profileUpdate.age = collected.age }
  } else if (step === 2) {
    if (/女/.test(userMessage)) { collected.sex = 'FEMALE'; profileUpdate.sex = 'FEMALE' }
    else if (/男/.test(userMessage)) { collected.sex = 'MALE'; profileUpdate.sex = 'MALE' }
  } else if (step === 3) {
    const m = userMessage.match(/(\d+\.?\d*)/)
    if (m) { collected.heightCm = parseFloat(m[1]); profileUpdate.heightCm = collected.heightCm }
  } else if (step === 4) {
    const m = userMessage.match(/(\d+\.?\d*)/)
    if (m) {
      collected.currentWeightKg = parseFloat(m[1])
      collected.startWeightKg = parseFloat(m[1])
      profileUpdate = { ...profileUpdate, currentWeightKg: collected.currentWeightKg, startWeightKg: collected.startWeightKg }
    }
  } else if (step === 5) {
    const m = userMessage.match(/(\d+\.?\d*)/)
    if (m) { collected.targetWeightKg = parseFloat(m[1]); profileUpdate.targetWeightKg = collected.targetWeightKg }
  } else if (step === 6) {
    collected.usingMedication = /是|在用|有在用|有|yes/i.test(userMessage)
  } else if (step === 7) {
    if (collected.usingMedication) {
      const doseMatch = userMessage.match(/(\d+\.?\d*)\s*mg/i)
      if (doseMatch) { collected.currentDose = doseMatch[0]; profileUpdate.currentDose = doseMatch[0] }
      const meds = ['司美格鲁肽', 'ozempic', 'wegovy', '利拉鲁肽', '替尔泊肽', 'mounjaro', 'tirzepatide']
      for (const kw of meds) {
        if (userMessage.toLowerCase().includes(kw.toLowerCase())) {
          collected.currentMedication = kw
          profileUpdate.currentMedication = kw
          break
        }
      }
      if (!collected.currentMedication && userMessage.trim()) {
        collected.currentMedication = userMessage.split(/[，,。\s]/)[0].trim()
        profileUpdate.currentMedication = collected.currentMedication
      }
    }
  } else if (step === 8) {
    const conditions: string[] = []
    if (/糖尿病/.test(userMessage)) conditions.push('糖尿病')
    if (/高血压/.test(userMessage)) conditions.push('高血压')
    if (/甲状腺/.test(userMessage)) conditions.push('甲状腺问题')
    if (/胰腺炎/.test(userMessage)) conditions.push('胰腺炎')
    if (/胆囊/.test(userMessage)) conditions.push('胆囊疾病')
    collected.conditions = conditions
    profileUpdate.conditions = conditions
  } else if (step === 9) {
    if (/怀孕|孕期/.test(userMessage)) { collected.pregnancyStatus = 'PREGNANT'; profileUpdate.pregnancyStatus = 'PREGNANT' }
    else if (/备孕/.test(userMessage)) { collected.pregnancyStatus = 'TRYING'; profileUpdate.pregnancyStatus = 'TRYING' }
    else if (/哺乳/.test(userMessage)) { collected.pregnancyStatus = 'BREASTFEEDING'; profileUpdate.pregnancyStatus = 'BREASTFEEDING' }
    else { collected.pregnancyStatus = 'NOT_PREGNANT'; profileUpdate.pregnancyStatus = 'NOT_PREGNANT' }

    // 高风险拦截
    if (['PREGNANT', 'TRYING', 'BREASTFEEDING'].includes(collected.pregnancyStatus as string)) {
      return {
        response: assistantMsg(`非常重要的提醒：**怀孕、备孕或哺乳期间不建议使用减重药物**。

请暂停用药，并尽快咨询你的妇产科或全科医生，由医生评估后决定如何处理。

⚠️ 这是本助手必须给你的提醒，不代表对你情况的完整评估。`),
        updatedState: {
          ...sessionState,
          stage: 'chat',
          assessment: { step: 10, completed: true, collectedProfile: collected as SessionState['assessment']['collectedProfile'] },
        },
        profileUpdate: { ...profileUpdate, riskLevel: 'CRITICAL', currentStage: 'ABNORMAL_OBSERVATION' },
      }
    }
  }

  // 计算下一步
  let nextStep = step + 1
  // 没在用药跳过药物详情
  if (step === 6 && !collected.usingMedication) nextStep = 8

  const isComplete = nextStep > 10
  const responseText = getAssessmentQuestion(nextStep > 10 ? 10 : nextStep, collected)

  const stageForProfile = collected.usingMedication ? 'EARLY_MEDICATION' : 'INTENT'

  return {
    response: assistantMsg(responseText),
    updatedState: {
      ...sessionState,
      stage: isComplete ? 'chat' : 'assessment',
      assessment: {
        step: nextStep,
        completed: isComplete,
        collectedProfile: collected as SessionState['assessment']['collectedProfile'],
      },
    },
    profileUpdate: isComplete
      ? { ...profileUpdate, currentStage: stageForProfile, riskLevel: 'LOW' }
      : profileUpdate,
  }
}

// ========== 意图识别 ==========

function detectIntent(text: string): string {
  if (/怀孕|备孕|哺乳|孕期/.test(text)) return 'HIGH_RISK_PREGNANCY'
  if (/肚子很?痛|腹部?疼痛|腹痛|剧烈.*痛|持续.*肚子/.test(text)) return 'HIGH_RISK_ABDOMINAL'
  if (/黑便|便血|血便/.test(text)) return 'HIGH_RISK_BLEEDING'
  if (/恶心|想吐|反胃/.test(text)) return 'NAUSEA'
  if (/呕吐|吐了|吐出来/.test(text)) return 'VOMITING'
  if (/便秘|大便.*干|排不出|排便困难/.test(text)) return 'CONSTIPATION'
  if (/腹泻|拉肚子|拉稀/.test(text)) return 'DIARRHEA'
  if (/反酸|烧心|胃酸/.test(text)) return 'ACID'
  if (/食欲.*差|吃不下|不想吃|食欲.*低/.test(text)) return 'LOW_APPETITE'
  if (/肚子.*不舒服|胃不舒服|胃胀|腹胀/.test(text)) return 'GI'
  if (/漏针|漏药|忘打|忘了打|忘记打|没打|没用药/.test(text)) return 'MISSED_DOSE'
  if (/今天.*体重|体重.*今天|我.*\d+\.?\d*\s*kg|我.*\d+\.?\d*公斤/.test(text)) return 'WEIGHT_RECORD'
  if (/今天.*用药|打了|注射了|用了药/.test(text)) return 'MEDICATION_RECORD'
  if (/继续买|复购|还有多少|快用完|下一盒|下一支|还要买|能不能继续|可以继续/.test(text)) return 'REFILL'
  if (/没有瘦|没瘦|不见效|没效果|停滞|平台期|放弃/.test(text)) return 'PLATEAU'
  if (/想开始|想减肥|适不适合|能不能用|要怎么开始/.test(text)) return 'INTENT'
  return 'GENERAL'
}

// ========== 各场景回复 ==========

const RESPONSES: Record<string, string> = {
  HIGH_RISK_PREGNANCY: `非常重要：**怀孕、备孕或哺乳期间不建议使用减重药物**。

请暂停用药，并尽快咨询你的妇产科或全科医生，由医生评估后决定如何处理。

⚠️ 这是本助手的严格建议，不是一般性提醒。`,

  HIGH_RISK_BLEEDING: `**黑便或便血是需要立即重视的症状。**

请不要继续等待观察，**今天就去消化科或急诊做评估**。

停止用药，尽快就医。这类情况需要专业检查才能判断原因。`,

  NAUSEA_INIT: `恶心的感觉确实不好受。我先问几个问题，帮我更准确地了解情况：

1. 恶心是从什么时候开始的？
2. 有没有出现呕吐？
3. 现在还能正常喝水吃东西吗？
4. 最近一次用药是什么时候？`,

  NAUSEA_FOLLOWUP: `明白了。对于用药引起的恶心，通常可以尝试：

- **用药时机**：可以在进食后注射，减少胃肠刺激
- **饮食**：少量多餐，避免油腻和辛辣，先从清淡流食开始
- **节奏**：短时间内避免剧烈运动
- **观察**：轻度恶心通常会随适应期（2-4周）逐渐改善

⚠️ **如果持续呕吐无法喝水、明显脱水或腹痛加重，请及时就医。**

这是辅助建议，不替代医生判断。`,

  CONSTIPATION_INIT: `便秘是 GLP-1 类药物常见的副作用之一。先了解一下：

1. 大概多少天没有正常排便了？
2. 有没有明显腹胀或腹部不适？
3. 最近每天喝水量够吗？`,

  CONSTIPATION_FOLLOWUP: `好的，给你一些实用建议：

- **补水**：每天至少 1500-2000ml 温水，这是最基本的
- **膳食纤维**：多吃蔬菜、燕麦、全谷物，减少精制碳水
- **适当运动**：每天 20-30 分钟散步可以促进肠胃蠕动
- **规律如厕**：固定时间，不要忍着

如果 3 天以上没有排便，或者有明显腹痛，建议联系医生评估是否需要临时用药辅助。`,

  DIARRHEA_INIT: `腹泻也是比较常见的适应期反应。跟我说说：

1. 大概一天几次？
2. 有没有腹痛？
3. 还能正常喝水吗？`,

  DIARRHEA_FOLLOWUP: `了解了。轻度腹泻建议：

- **饮食**：以米粥、面条等易消化食物为主，避免乳制品和高脂肪食物
- **补液**：少量多次喝水，或口服补液盐
- **用药时机**：可以尝试饭后注射

⚠️ **以下情况请及时就医**：一天超过 5-6 次、有便血、无法进食喝水、出现脱水症状。`,

  HIGH_RISK_ABDOMINAL_INIT: `你提到腹痛，我需要先了解一下：

1. 疼痛在哪个位置？（上腹/中间/下腹）
2. 是持续性的，还是一阵一阵的？
3. 疼痛有多严重？（1-10 分，10 分最严重）
4. 有没有发烧或背部放射痛？`,

  HIGH_RISK_ABDOMINAL_SEVERE: `根据你描述的情况，这可能不是普通的用药适应期反应。

**我强烈建议你立即停止用药，并尽快就医或去急诊评估。**

持续性或剧烈腹痛可能与胰腺炎或其他消化系统问题有关，需要专业检查才能排除。

⚠️ 请不要因为不确定就拖延，腹痛评估越早越好。`,

  ACID: `反酸/烧心也是比较常见的适应期症状。可以尝试：

- 吃饭后不要马上平躺，保持直立 1-2 小时
- 避免睡前 2-3 小时内进食
- 减少咖啡、浓茶、碳酸饮料
- 少量多餐，不要一次吃太多

如果症状持续超过 1 周或明显影响睡眠，建议联系医生评估。`,

  LOW_APPETITE: `食欲很低是 GLP-1 类药物的正常效果，但如果完全吃不下东西就需要注意了。

先告诉我：
1. 每天大概能吃多少？（和正常时候相比）
2. 勉强吃一点的话，有没有恶心或不舒服？
3. 还能正常喝水吗？`,

  GI: `胃肠不适在适应期比较常见。能具体描述一下吗？

- 是腹胀/胃胀？
- 消化感觉变慢了？
- 还是有其他不舒服？

了解清楚后我来帮你分析。`,

  VOMITING: `呕吐了需要关注一下：

1. 呕吐发生了几次？
2. 呕吐后还能喝水吗？
3. 是否有腹痛？

如果**持续呕吐无法喝水、出现明显脱水（极度口渴/尿少/头晕）**，请尽快就医，不要等待。`,

  MISSED_DOSE: `漏药的情况比较常见，别太担心。处理原则是：

**GLP-1 类药物（如司美格鲁肽、替尔泊肽）漏注射时：**
- 距离原定注射时间 **≤5 天**：尽快补打，然后按正常周期继续
- 距离原定注射时间 **>5 天**：等到下次正常注射日再打，不要补打
- 下次注射时间不变，不需要因为漏打就提前或推迟

**注意**：具体处理方式请以你使用药物的说明书或医生建议为准。`,

  PLATEAU: `减重过程中体重停滞是非常正常的阶段，很多人都经历过这个平台期。

可能的原因：
- **代谢适应**：身体会在一定程度上调低代谢来应对热量减少
- **体成分变化**：脂肪在减少，但可能伴随水分变化
- **饮食无意识增加**：食欲受抑制后容易忽视饮食质量

**建议关注的不只是体重，还有：**
- 腰围是否在变化？
- 衣服是否开始宽松？
- 食欲控制是否比之前好？

你最近大概多久没有体重变化了？`,

  REFILL_STABLE: `根据你最近的用药情况，整体还比较平稳 👍

如果你打算继续下一个疗程，可以联系顾问咨询方案。

建议告诉顾问：当前体重变化、当前剂量、近期有无明显副作用，这样评估会更准确。`,

  REFILL_CHECK: `关于继续购药，我先帮你确认几个情况：

1. 你目前还剩多少药？大概什么时候会用完？
2. 最近 2 周有没有明显的副作用？
3. 体重变化怎么样？

了解这些之后，我可以帮你判断是否适合直接复购，还是建议先咨询顾问评估一下。`,

  MEDICATION_RECORD: `✅ 好的，今天的用药情况记录下来了！

今天体重是多少？顺便记录一下会更完整。`,

  GENERAL: ``,

  INTENT: `想开始减重用药，先做初步了解是对的。

减重用药（如 GLP-1 类）适合有一定减重需求且没有特定禁忌症的人群，不是每个人都适合。

**我来帮你做一个简单的初步评估**，了解你的基本情况后，再给你更有针对性的建议。

你今年多大了？`,
}

// ========== 主入口 ==========

export function getMockResponse(
  userMessage: string,
  messages: Message[],
  sessionState: SessionState,
  userProfile?: UserProfile
): { response: Message; updatedState: SessionState; profileUpdate?: Partial<UserProfile> } {
  // 评估流程
  if (sessionState.stage === 'assessment') {
    return handleAssessment(userMessage, sessionState) as ReturnType<typeof getMockResponse>
  }

  // 等待副作用追问回复
  if (sessionState.awaitingFollowUp) {
    const fw = sessionState.awaitingFollowUp
    const newState = { ...sessionState, awaitingFollowUp: null }

    if (fw === 'HIGH_RISK_ABDOMINAL') {
      const isSevere = /[7-9]|10|非常|很严重|剧烈|受不了|难忍/.test(userMessage)
      return {
        response: assistantMsg(isSevere ? RESPONSES.HIGH_RISK_ABDOMINAL_SEVERE : `了解了。腹痛${userMessage}，先观察是否加重。

如果疼痛**持续超过 2 小时**、**逐渐加重**或**伴有发烧/呕吐**，请及时就医。不要拖延。

现在有其他不适吗？`),
        updatedState: isSevere
          ? { ...newState }
          : newState,
        profileUpdate: isSevere
          ? { riskLevel: 'HIGH', currentStage: 'ABNORMAL_OBSERVATION' }
          : undefined,
      }
    }

    const followupMap: Record<string, string> = {
      NAUSEA: RESPONSES.NAUSEA_FOLLOWUP,
      CONSTIPATION: RESPONSES.CONSTIPATION_FOLLOWUP,
      DIARRHEA: RESPONSES.DIARRHEA_FOLLOWUP,
    }
    const text = followupMap[fw] ?? RESPONSES.GENERAL
    return { response: assistantMsg(text), updatedState: newState }
  }

  const intent = detectIntent(userMessage)

  switch (intent) {
    case 'HIGH_RISK_PREGNANCY':
      return {
        response: assistantMsg(RESPONSES.HIGH_RISK_PREGNANCY),
        updatedState: sessionState,
        profileUpdate: { riskLevel: 'CRITICAL', currentStage: 'ABNORMAL_OBSERVATION' },
      }
    case 'HIGH_RISK_BLEEDING':
      return {
        response: assistantMsg(RESPONSES.HIGH_RISK_BLEEDING),
        updatedState: sessionState,
        profileUpdate: { riskLevel: 'CRITICAL', currentStage: 'ABNORMAL_OBSERVATION' },
      }
    case 'HIGH_RISK_ABDOMINAL':
      return {
        response: assistantMsg(RESPONSES.HIGH_RISK_ABDOMINAL_INIT),
        updatedState: { ...sessionState, awaitingFollowUp: 'HIGH_RISK_ABDOMINAL' },
        profileUpdate: { riskLevel: 'HIGH' },
      }
    case 'NAUSEA':
      return {
        response: assistantMsg(RESPONSES.NAUSEA_INIT),
        updatedState: { ...sessionState, awaitingFollowUp: 'NAUSEA' },
      }
    case 'CONSTIPATION':
      return {
        response: assistantMsg(RESPONSES.CONSTIPATION_INIT),
        updatedState: { ...sessionState, awaitingFollowUp: 'CONSTIPATION' },
      }
    case 'DIARRHEA':
      return {
        response: assistantMsg(RESPONSES.DIARRHEA_INIT),
        updatedState: { ...sessionState, awaitingFollowUp: 'DIARRHEA' },
      }
    case 'VOMITING':
      return { response: assistantMsg(RESPONSES.VOMITING), updatedState: sessionState }
    case 'ACID':
      return { response: assistantMsg(RESPONSES.ACID), updatedState: sessionState }
    case 'LOW_APPETITE':
      return { response: assistantMsg(RESPONSES.LOW_APPETITE), updatedState: sessionState }
    case 'GI':
      return { response: assistantMsg(RESPONSES.GI), updatedState: sessionState }
    case 'MISSED_DOSE':
      return { response: assistantMsg(RESPONSES.MISSED_DOSE), updatedState: sessionState }
    case 'WEIGHT_RECORD': {
      const m = userMessage.match(/(\d+\.?\d*)/)
      const w = m ? parseFloat(m[1]) : null
      return {
        response: assistantMsg(
          w
            ? `✅ 已记录今日体重：**${w}kg**\n\n今天用药了吗？食欲感觉如何？（1-5 分，5 分是完全正常）`
            : `好的，你今天的体重是多少公斤？`
        ),
        updatedState: sessionState,
        profileUpdate: w ? { currentWeightKg: w } : undefined,
      }
    }
    case 'MEDICATION_RECORD':
      return { response: assistantMsg(RESPONSES.MEDICATION_RECORD), updatedState: sessionState }
    case 'REFILL': {
      const isStable =
        userProfile?.currentStage === 'STABLE_MAINTENANCE' &&
        userProfile?.riskLevel === 'LOW'
      if (userProfile?.riskLevel === 'CRITICAL' || userProfile?.currentStage === 'ABNORMAL_OBSERVATION') {
        return {
          response: assistantMsg(`关于继续购药，根据你最近的情况，目前**不建议直接自行复购**。\n\n建议先联系顾问或医生做一个人工评估，确认当前状态适合继续后再做决定。`),
          updatedState: sessionState,
        }
      }
      return {
        response: assistantMsg(isStable ? RESPONSES.REFILL_STABLE : RESPONSES.REFILL_CHECK),
        updatedState: sessionState,
      }
    }
    case 'PLATEAU':
      return { response: assistantMsg(RESPONSES.PLATEAU), updatedState: sessionState }
    case 'INTENT':
      return {
        response: assistantMsg(RESPONSES.INTENT),
        updatedState: { ...sessionState, stage: 'assessment', assessment: { step: 1, completed: false, collectedProfile: {} } },
      }
    default: {
      // 根据用户消息内容生成有针对性的兜底回复
      const msg = userMessage.trim()
      let fallback = ''
      if (/买|购|哪里|怎么买|渠道/.test(msg)) {
        fallback = '购药建议通过正规渠道或原来开药的顾问咨询，他们可以帮你确认当前情况是否适合继续用药并提供购买方案。'
      } else if (/介绍|什么是|怎么用|怎样/.test(msg)) {
        fallback = '这个问题我需要了解更多细节才能回答准确。你可以描述得更具体一些，比如你目前用的是哪种药、用了多久，我来帮你分析。'
      } else if (/整理|帮我|总结/.test(msg)) {
        fallback = '好的，你希望我帮你整理哪方面的内容？可以再说具体一点。'
      } else if (/改|更新|修改/.test(msg)) {
        fallback = '你想修改什么内容？可以告诉我具体是哪项数据，比如体重、目标体重或者用药信息。'
      } else {
        fallback = '收到。你能说得再具体一点吗？比如是关于用药副作用、体重记录，还是复购咨询——这样我能给你更准确的帮助。'
      }
      return { response: assistantMsg(fallback), updatedState: sessionState }
    }
  }
}

// ========== 初始消息 ==========

export function getInitialMessage(): Message {
  return assistantMsg(getAssessmentQuestion(0, {}))
}
