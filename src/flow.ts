import type { Application } from './domain/types'

// One state machine for the whole journey:
// shop → product → converted (购买转办页, OA world starts here; no payment happens) → gate (ad + calm step)
//   → form → reviewing → rejected ⇄ form … → approved
//   → quiz (复核单, retried until graded answers are right) → remarking (AI 批示) → receipt
// product, shop = shop world ("the slide"); every other screen = OA world (see worldOf in App.tsx).
// The 文号 (docNo) is created on converted and carried by every later OA screen.
// converted also allows: back to product.
// rejected also allows: switch product (→ shop) or withdraw (→ withdrawn).
// regulations can be opened from anywhere and returns to the screen it was opened from.

export type Screen =
  | { name: 'shop' }
  | { name: 'product'; productId: string }
  | { name: 'converted'; productId: string; docNo: string }
  | { name: 'gate'; docNo: string; productId: string }
  | { name: 'form'; docNo: string; draft: Application; attempt: number }
  | { name: 'reviewing'; docNo: string; draft: Application; attempt: number }
  | { name: 'rejected'; docNo: string; draft: Application; attempt: number; text: string }
  | { name: 'approved'; docNo: string; draft: Application; attempt: number }
  | { name: 'quiz'; docNo: string; draft: Application; attempt: number }
  | { name: 'remarking'; docNo: string; draft: Application; attempt: number }
  | { name: 'receipt'; docNo: string; draft: Application; attempt: number; orderNo: string; remark: string }
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

/** Document number shown on the 转办页, format CG-YYYYMMDD-NNNN. Generated once when the page opens. */
export function newDocNo(): string {
  return `CG-${todayIso().replaceAll('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`
}

export function newOrderNo(): string {
  return `SIM-${todayIso().replaceAll('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`
}
