import { totalCost } from './cost'
import { citation, regulations } from './regulations'
import type { Application, Decision, Difficulty, Finding, Product } from './types'

// The AI leader's veto is decided HERE, by rules, so the demo path is deterministic.
// The LLM only rewrites the findings in the leader's voice (see api/leader-voice.ts).

export const MIN_PURPOSE_CHARS = 10
export const MIN_ANSWER_CHARS = 8
const MAX_DAYS_TO_FIRST_USE = 14
/** How many of rent / borrow / existing must be argued properly, per difficulty (regulations.json). */
const ALTERNATIVES_NEEDED = regulations.params.alternativesNeeded

const ALTERNATIVE_FIELDS = [
  { key: 'vsRent', label: '为什么不租' },
  { key: 'vsBorrow', label: '为什么不借' },
  { key: 'vsExisting', label: '为什么现有的东西不行' },
] as const

/** Ignores whitespace and punctuation, so "没人给我。" and "没人 给我" count as the same answer. */
const normalise = (s: string) => s.replace(/[\s\p{P}\p{S}]/gu, '')

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000)
}

export function review(
  app: Application,
  product: Product,
  difficulty: Difficulty,
  todayIso: string,
  attempt: number,
): Decision {
  const findings: Finding[] = []

  const purposeLen = app.purpose.trim().length
  if (purposeLen < MIN_PURPOSE_CHARS) {
    findings.push({
      rule: 'purpose-too-short',
      message: `采购用途不少于 ${MIN_PURPOSE_CHARS} 个字（你写了 ${purposeLen} 个字）。`,
    })
  }

  const total = totalCost(product)
  if (app.declaredTotal === null || Math.abs(app.declaredTotal - total) > 1) {
    findings.push({
      rule: 'total-mismatch',
      message: '申报总价与实际不符。请把必需配件和运费一并算进去，重新核算。',
    })
  }

  // Alternative answers: an answer counts only if it is long enough and not a copy of another one.
  const answers = ALTERNATIVE_FIELDS.map((f) => ({ ...f, text: normalise(app[f.key]) }))
  const isDuplicate = (a: (typeof answers)[number]) =>
    a.text !== '' && answers.some((b) => b.key !== a.key && b.text === a.text)
  const isSubstantive = (a: (typeof answers)[number]) => a.text.length >= MIN_ANSWER_CHARS && !isDuplicate(a)

  const perfunctory = answers.filter((a) => a.text !== '' && !isSubstantive(a))
  if (perfunctory.length > 0) {
    findings.push({
      rule: 'perfunctory-answer',
      message: `${perfunctory.map((a) => `「${a.label}」`).join('')}写得太敷衍：每项不少于 ${MIN_ANSWER_CHARS} 个字，且不能互相照抄。`,
    })
  }

  const rent = answers.find((a) => a.key === 'vsRent')!
  if ((app.frequency === 'once' || app.frequency === 'monthly') && product.alternatives.rent && !isSubstantive(rent)) {
    findings.push({
      rule: 'why-not-rent',
      message: `用得这么少（${app.frequency === 'once' ? '只用一次' : '每月一次'}），为什么不租？请在「为什么不租」里说明。`,
    })
  }

  const needed = ALTERNATIVES_NEEDED[difficulty]
  if (answers.filter(isSubstantive).length < needed) {
    findings.push({
      rule: 'alternatives-missing',
      message: `租、借、用现有的，至少认真说明 ${needed} 项为什么不行。`,
    })
  }

  if (difficulty === 'hard') {
    const days = app.firstUseDate ? daysBetween(todayIso, app.firstUseDate) : Infinity
    if (!(days >= 0 && days <= MAX_DAYS_TO_FIRST_USE)) {
      findings.push({
        rule: 'first-use-too-far',
        message: `首次使用日期须在今天起 ${MAX_DAYS_TO_FIRST_USE} 天内：太远说明现在不急，已经过去说明你填错了。`,
      })
    }
  }

  // Satire of bureaucracy: a flawless first submission is still sent back once. Deterministic,
  // and the user is told exactly what to do (submit again unchanged).
  if (findings.length === 0 && attempt === 1) {
    findings.push({
      rule: 'first-submission',
      message: '首次申请一律退回，以示慎重。内容无需修改，原样再提交一次即可。',
    })
  }

  if (findings.length === 0) return { kind: 'approved' }
  // Every message cites its article of 《个人钱包管理暂行办法》, so the fallback text (no network)
  // is as official-sounding as the AI leader.
  return { kind: 'rejected', findings: findings.map((f) => ({ ...f, message: citation(f.rule) + f.message })) }
}
