// Choices for the 采购申请单. The user taps instead of typing; only "其他" asks for a written note.
// Each option has a kind, and the review rules read the kind (src/domain/review.ts):
//   reason       — a real argument: counts
//   unconsidered — "I never thought about it": does not count as arguing the alternative
//   impulse      — "I just want it": perfunctory, rejected under 第二条 / 第六条
//   other        — counts only with a written note of the required length

import type { Application, Choice, FirstUse, UsageFrequency } from './types.ts'

export type OptionKind = 'reason' | 'unconsidered' | 'impulse' | 'other'

export interface ChoiceOption {
  id: string
  label: string
  kind: OptionKind
}

export const PURPOSE_OPTIONS: ChoiceOption[] = [
  { id: 'daily-self', label: '自己日常用', kind: 'reason' },
  { id: 'with-others', label: '和朋友、家人一起用', kind: 'reason' },
  { id: 'event', label: '为一次具体活动（旅行、聚会、比赛）', kind: 'reason' },
  { id: 'gift', label: '送人', kind: 'reason' },
  { id: 'try', label: '先买来试试，说不定会爱上', kind: 'impulse' },
  { id: 'everyone', label: '别人都有了', kind: 'impulse' },
  { id: 'other', label: '其他（手写说明）', kind: 'other' },
]

export const RENT_OPTIONS: ChoiceOption[] = [
  { id: 'long-term', label: '要长期用，租金会超过买价', kind: 'reason' },
  { id: 'not-nearby', label: '附近租不到', kind: 'reason' },
  { id: 'hygiene', label: '租的东西不卫生，或怕弄坏要赔', kind: 'reason' },
  { id: 'never-thought', label: '没想过可以租', kind: 'unconsidered' },
  { id: 'want-own', label: '就是想要自己的', kind: 'impulse' },
  { id: 'other', label: '其他（手写说明）', kind: 'other' },
]

export const BORROW_OPTIONS: ChoiceOption[] = [
  { id: 'nobody-has', label: '身边没人有', kind: 'reason' },
  { id: 'too-long', label: '要用很久，不好意思一直借', kind: 'reason' },
  { id: 'careful', label: '借来的不敢随便用', kind: 'reason' },
  { id: 'never-thought', label: '没想过可以借', kind: 'unconsidered' },
  { id: 'want-own', label: '就是想要自己的', kind: 'impulse' },
  { id: 'other', label: '其他（手写说明）', kind: 'other' },
]

export const EXISTING_OPTIONS: ChoiceOption[] = [
  { id: 'none-similar', label: '家里没有类似的东西', kind: 'reason' },
  { id: 'broken', label: '现有的坏了或不好用', kind: 'reason' },
  { id: 'not-enough', label: '现有的满足不了这次的需求', kind: 'reason' },
  { id: 'never-thought', label: '没想过现有的能不能用', kind: 'unconsidered' },
  { id: 'want-new', label: '就是想要新的', kind: 'impulse' },
  { id: 'other', label: '其他（手写说明）', kind: 'other' },
]

export const FIRST_USE_OPTIONS: { id: FirstUse; label: string }[] = [
  { id: 'this-week', label: '本周内' },
  { id: 'two-weeks', label: '两周内' },
  { id: 'month', label: '一个月内' },
  { id: 'unsure', label: '还没想好' },
]

export const FREQUENCY_OPTIONS: { id: UsageFrequency; label: string }[] = [
  { id: 'once', label: '只用一次' },
  { id: 'monthly', label: '每月' },
  { id: 'weekly', label: '每周' },
  { id: 'daily', label: '每天' },
]

export function findOption(options: ChoiceOption[], id: string): ChoiceOption | undefined {
  return options.find((o) => o.id === id)
}

/** What the user answered, as text: the option label, or "其他：<note>". '' when unanswered. */
export function describeChoice(answer: Choice, options: ChoiceOption[]): string {
  const option = findOption(options, answer.choice)
  if (!option) return ''
  return option.kind === 'other' ? `其他：${answer.note.trim()}` : option.label
}

/** The form as plain text fields, the shape the AI endpoint takes (it quotes these back). */
export function formAsText(app: Application) {
  return {
    purpose: describeChoice(app.purpose, PURPOSE_OPTIONS),
    frequency: app.frequency,
    vsRent: describeChoice(app.vsRent, RENT_OPTIONS),
    vsBorrow: describeChoice(app.vsBorrow, BORROW_OPTIONS),
    vsExisting: describeChoice(app.vsExisting, EXISTING_OPTIONS),
    declaredTotal: app.declaredTotal,
  }
}
