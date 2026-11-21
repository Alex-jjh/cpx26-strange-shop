import { formatYuan, totalCost } from './cost.ts'
import type { Application, Difficulty, Product, ProductDetails, UsageFrequency } from './types.ts'

// 复核单: a short multiple-choice check shown after approval, before the simulated order.
// "Useful friction": graded questions make the buyer do the maths (break-even, cost per use);
// reflective questions have no wrong answer and feed the AI leader's closing remark.
// Everything here is deterministic, so the demo is stable and grading never depends on the LLM.

export interface QuizOption {
  id: string
  text: string
}

export interface QuizQuestion {
  id: 'money' | 'frequency-check' | 'total-check' | 'one-month' | 'last-impulse'
  kind: 'graded' | 'reflective'
  title: string
  prompt: string
  options: QuizOption[]
  /** Graded only. */
  answerId?: string
  /** Graded only: shown when answered wrong. */
  explain?: string
}

const USES_PER_YEAR: Record<UsageFrequency, number> = { once: 1, monthly: 12, weekly: 52, daily: 365 }
const FREQUENCY_TEXT: Record<UsageFrequency, string> = { once: '只用一次', monthly: '每月', weekly: '每周', daily: '每天' }

/** Stable shuffle so the right answer is not always first, and the same product always looks the same. */
function seededOrder<T>(items: T[], seed: string): T[] {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return items
    .map((item, i) => ({ item, key: Math.imul(h ^ (i + 1), 2654435761) >>> 0 }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.item)
}

/** Correct value plus three distinct, plausible wrong ones. */
function numericOptions(correct: number, seed: string, format: (n: number) => string): QuizOption[] {
  const candidates = [correct, Math.max(1, Math.round(correct / 10)), Math.round(correct / 2), Math.round(correct * 3)]
  const seen = new Set<string>()
  const options: QuizOption[] = []
  for (const [i, n] of candidates.entries()) {
    const text = format(n)
    if (seen.has(text)) continue
    seen.add(text)
    options.push({ id: i === 0 ? 'correct' : `wrong-${i}`, text })
  }
  // Tiny numbers can collide; pad with obviously different values.
  for (let k = 4; options.length < 4; k++) options.push({ id: `wrong-${k}`, text: format(correct * k + k) })
  return seededOrder(options, seed)
}

function moneyQuestion(product: Product, details: ProductDetails | undefined, app: Application): QuizQuestion {
  const total = totalCost(product)
  const r = details?.rental
  const seed = `${product.id}:money`

  if (r?.kind === 'equipment-rental' && r.pricePerDay) {
    const days = Math.ceil(total / r.pricePerDay)
    return {
      id: 'money',
      kind: 'graded',
      title: '回本测算',
      prompt: `买要 ${formatYuan(total)} 元；同类款租一天 ${r.pricePerDay} 元。租满多少天，租金才追上买的钱？`,
      options: numericOptions(days, seed, (n) => `${n} 天`),
      answerId: 'correct',
      explain: `${formatYuan(total)} ÷ ${r.pricePerDay} ≈ ${days} 天。在用满之前，租都更划算。`,
    }
  }
  if (r?.kind === 'onsite-practice-room' && r.pricePerHour) {
    const hours = Math.ceil(total / r.pricePerHour)
    return {
      id: 'money',
      kind: 'graded',
      title: '回本测算',
      prompt: `买要 ${formatYuan(total)} 元；去琴房练每小时 ${r.pricePerHour} 元。练满多少小时，琴房钱才追上买的钱？`,
      options: numericOptions(hours, seed, (n) => `${n} 小时`),
      answerId: 'correct',
      explain: `${formatYuan(total)} ÷ ${r.pricePerHour} ≈ ${hours} 小时。`,
    }
  }
  const uses = USES_PER_YEAR[app.frequency]
  const perUse = Math.round(total / uses)
  return {
    id: 'money',
    kind: 'graded',
    title: '单次成本',
    prompt: `总价 ${formatYuan(total)} 元。按你申报的「${FREQUENCY_TEXT[app.frequency]}」，第一年里平均每用一次花多少钱？`,
    options: numericOptions(perUse, seed, (n) => `约 ${n} 元`),
    answerId: 'correct',
    explain: `一年约用 ${uses} 次，${formatYuan(total)} ÷ ${uses} ≈ ${perUse} 元一次。`,
  }
}

function frequencyCheck(app: Application, seed: string): QuizQuestion {
  const options = (Object.keys(FREQUENCY_TEXT) as UsageFrequency[]).map((f) => ({ id: f, text: FREQUENCY_TEXT[f] }))
  return {
    id: 'frequency-check',
    kind: 'graded',
    title: '本人申报核对',
    prompt: '为防止冒名采购，请核对：你在申请单里填的预计使用频率是？',
    options: seededOrder(options, `${seed}:freq`),
    answerId: app.frequency,
    explain: `你填的是「${FREQUENCY_TEXT[app.frequency]}」。连自己填的都记不住，本领导很难相信你会记得用它。`,
  }
}

function totalCheck(product: Product): QuizQuestion {
  const total = totalCost(product)
  const options = [
    { id: 'correct', text: `${formatYuan(total)} 元` },
    { id: 'price-only', text: `${formatYuan(product.price)} 元（只算标价）` },
    { id: 'double', text: `${formatYuan(total * 2)} 元（再给朋友带一台）` },
    { id: 'zero', text: '0 元（花呗分期，不算花钱）' },
  ]
  return {
    id: 'total-check',
    kind: 'graded',
    title: '全口径总价',
    prompt: '本次采购含必需配件和运费，一共要花多少钱？',
    options: seededOrder(
      options.filter((o, i) => i === 0 || o.text !== options[0].text),
      `${product.id}:total`,
    ),
    answerId: 'correct',
    explain: `标价加必需配件和运费，一共 ${formatYuan(total)} 元。`,
  }
}

function oneMonth(product: Product): QuizQuestion {
  return {
    id: 'one-month',
    kind: 'reflective',
    title: '一个月后',
    prompt: `同类商品的典型命运是「${product.typicalUsage}」。你觉得一个月后它在哪？`,
    options: [
      { id: 'daily', text: '天天在用，我和别人不一样' },
      { id: 'sometimes', text: '偶尔想起来用一下' },
      { id: 'corner', text: '在角落安静吃灰' },
      { id: 'resale', text: '已经挂上二手平台' },
    ],
  }
}

function lastImpulse(): QuizQuestion {
  return {
    id: 'last-impulse',
    kind: 'reflective',
    title: '历史采购回顾',
    prompt: '你上一次冲动买下的东西，现在在哪？',
    options: [
      { id: 'using', text: '还在用，物尽其用' },
      { id: 'cabinet', text: '在柜子里，包装都没拆完' },
      { id: 'gone', text: '送人或者卖掉了' },
      { id: 'forgot', text: '想不起来买过什么' },
    ],
  }
}

export function buildQuiz(
  product: Product,
  details: ProductDetails | undefined,
  app: Application,
  difficulty: Difficulty,
): QuizQuestion[] {
  const questions = [moneyQuestion(product, details, app), frequencyCheck(app, product.id), oneMonth(product), lastImpulse()]
  if (difficulty === 'hard') questions.splice(1, 0, totalCheck(product))
  return questions
}

/** Graded questions answered wrong (or unanswered), and whether any question is unanswered. */
export function gradeQuiz(quiz: QuizQuestion[], answers: Record<string, string>) {
  const unanswered = quiz.filter((q) => !answers[q.id])
  const wrong = quiz.filter((q) => q.kind === 'graded' && answers[q.id] && answers[q.id] !== q.answerId)
  return { unanswered, wrong, passed: unanswered.length === 0 && wrong.length === 0 }
}

/** The reflective answers as text, for the AI leader's closing remark. */
export function reflections(quiz: QuizQuestion[], answers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const q of quiz) {
    if (q.kind !== 'reflective') continue
    const chosen = q.options.find((o) => o.id === answers[q.id])
    if (chosen) out[q.id] = chosen.text
  }
  return out
}
