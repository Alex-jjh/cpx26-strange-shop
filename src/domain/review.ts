import { totalCost } from './cost'
import { BORROW_OPTIONS, EXISTING_OPTIONS, findOption, PURPOSE_OPTIONS, RENT_OPTIONS, type ChoiceOption } from './formOptions'
import { citation, regulations } from './regulations'
import type { Application, Choice, Decision, Difficulty, Finding, Product } from './types'

// The AI leader's veto is decided HERE, by rules, so the demo path is deterministic.
// The LLM only rewrites the findings in the leader's voice (see api/leader-voice.ts).
// The form is multiple choice (formOptions.ts); rules read each option's kind.

/** A written note under "其他" must be at least this long. */
export const MIN_PURPOSE_NOTE_CHARS = 10
export const MIN_ANSWER_NOTE_CHARS = 8
/** How many of rent / borrow / existing must be argued properly, per difficulty (regulations.json). */
const ALTERNATIVES_NEEDED = regulations.params.alternativesNeeded

const ALTERNATIVE_FIELDS = [
  { key: 'vsRent', label: '为什么不租', options: RENT_OPTIONS },
  { key: 'vsBorrow', label: '为什么不借', options: BORROW_OPTIONS },
  { key: 'vsExisting', label: '为什么现有的东西不行', options: EXISTING_OPTIONS },
] as const

/** Ignores whitespace and punctuation, so "没人给我。" and "没人 给我" count as the same note. */
const normalise = (s: string) => s.replace(/[\s\p{P}\p{S}]/gu, '')

type Verdict = 'unanswered' | 'argued' | 'unconsidered' | 'impulse' | 'short-note'

function judge(answer: Choice, options: ChoiceOption[], minNote: number): Verdict {
  const option = findOption(options, answer.choice)
  if (!option) return 'unanswered'
  if (option.kind === 'other') return normalise(answer.note).length >= minNote ? 'argued' : 'short-note'
  if (option.kind === 'reason') return 'argued'
  return option.kind
}

export function review(app: Application, product: Product, difficulty: Difficulty, attempt: number): Decision {
  const findings: Finding[] = []

  const purpose = judge(app.purpose, PURPOSE_OPTIONS, MIN_PURPOSE_NOTE_CHARS)
  if (purpose !== 'argued') {
    const message =
      purpose === 'impulse'
        ? `「${findOption(PURPOSE_OPTIONS, app.purpose.choice)?.label}」不是用途，是借口。请选一个具体场景。`
        : purpose === 'short-note'
          ? `选「其他」的，说明不少于 ${MIN_PURPOSE_NOTE_CHARS} 个字（你写了 ${normalise(app.purpose.note).length} 个字）。`
          : '请选择这次采购的具体用途。'
    findings.push({ rule: 'purpose-unclear', message })
  }

  const total = totalCost(product)
  if (app.declaredTotal === null || Math.abs(app.declaredTotal - total) > 1) {
    findings.push({
      rule: 'total-mismatch',
      message: '申报总价与实际不符。请把必需配件和运费一并算进去，重新核算。',
    })
  }

  const answers = ALTERNATIVE_FIELDS.map((f) => ({
    ...f,
    verdict: judge(app[f.key], f.options, MIN_ANSWER_NOTE_CHARS),
    note: normalise(app[f.key].note),
    isOther: findOption(f.options, app[f.key].choice)?.kind === 'other',
  }))
  // Two "其他" notes with the same text are copy-paste, not two arguments.
  for (const a of answers) {
    if (a.verdict === 'argued' && a.isOther && answers.some((b) => b.key !== a.key && b.isOther && b.note === a.note)) {
      a.verdict = 'short-note'
    }
  }

  const perfunctory = answers.filter((a) => a.verdict === 'impulse' || a.verdict === 'short-note')
  if (perfunctory.length > 0) {
    findings.push({
      rule: 'perfunctory-answer',
      message: `${perfunctory.map((a) => `「${a.label}」`).join('')}答得太敷衍：不能选「就是想要」，手写说明不少于 ${MIN_ANSWER_NOTE_CHARS} 个字且不能互相照抄。`,
    })
  }

  const rent = answers.find((a) => a.key === 'vsRent')!
  if ((app.frequency === 'once' || app.frequency === 'monthly') && product.alternatives.rent && rent.verdict !== 'argued') {
    findings.push({
      rule: 'why-not-rent',
      message: `用得这么少（${app.frequency === 'once' ? '只用一次' : '每月一次'}），为什么不租？请在「为什么不租」里选一个站得住的理由。`,
    })
  }

  const needed = ALTERNATIVES_NEEDED[difficulty]
  if (answers.filter((a) => a.verdict === 'argued').length < needed) {
    findings.push({
      rule: 'alternatives-missing',
      message: `租、借、用现有的，至少给 ${needed} 项选一个真实理由（「没想过」不算）。`,
    })
  }

  if (difficulty === 'hard' && app.firstUse !== 'this-week' && app.firstUse !== 'two-weeks') {
    findings.push({
      rule: 'first-use-too-far',
      message: '首次使用须在两周以内：一个月后才用，或者还没想好，说明现在不急。',
    })
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
