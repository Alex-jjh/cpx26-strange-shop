import type { Application } from './domain/types'

// One state machine for the whole journey:
// shop → product → gate (mini-game) → form → reviewing → rejected ⇄ form … → approved
//   → quiz (复核单, retried until graded answers are right) → remarking (AI 批示) → receipt
// rejected also allows: switch product (→ shop) or withdraw (→ withdrawn).
// regulations can be opened from anywhere and returns to the screen it was opened from.

export type Screen =
  | { name: 'shop' }
  | { name: 'product'; productId: string }
  | { name: 'gate'; productId: string }
  | { name: 'form'; draft: Application; attempt: number }
  | { name: 'reviewing'; draft: Application; attempt: number }
  | { name: 'rejected'; draft: Application; attempt: number; text: string }
  | { name: 'approved'; draft: Application; attempt: number }
  | { name: 'quiz'; draft: Application; attempt: number }
  | { name: 'remarking'; draft: Application; attempt: number }
  | { name: 'receipt'; draft: Application; attempt: number; orderNo: string; remark: string }
  | { name: 'withdrawn' }
  | { name: 'regulations'; back: Screen }

export function emptyApplication(productId: string): Application {
  const blank = { choice: '', note: '' }
  return {
    productId,
    purpose: { ...blank },
    firstUse: '',
    frequency: 'once',
    vsRent: { ...blank },
    vsBorrow: { ...blank },
    vsExisting: { ...blank },
    declaredTotal: null,
  }
}

export function todayIso(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function newOrderNo(): string {
  return `SIM-${todayIso().replaceAll('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`
}
