import type { Application, Difficulty, Finding } from '../domain/types'

// The decision is already made by rules; this only asks the server for the leader's wording.
// Any failure (offline, no key, timeout) falls back to the rule messages, so the demo never stalls.

const API_BASE = import.meta.env.VITE_API_BASE ?? ''
const TIMEOUT_MS = 10_000 // just above the server-side upstream timeout (9s)

/** Sends the user's own answers so the leader can quote them back; the server truncates each field. */
export async function leaderVoice(
  draft: Application,
  findings: Finding[],
  attempt: number,
  difficulty: Difficulty,
): Promise<string> {
  const fallback = findings.map((f) => f.message).join('\n')
  try {
    const res = await fetch(`${API_BASE}/api/leader-voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: draft.productId,
        rules: findings.map((f) => f.rule),
        attempt,
        difficulty,
        form: {
          purpose: draft.purpose,
          frequency: draft.frequency,
          vsRent: draft.vsRent,
          vsBorrow: draft.vsBorrow,
          vsExisting: draft.vsExisting,
          declaredTotal: draft.declaredTotal,
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) return fallback
    const { text } = (await res.json()) as { text?: string }
    return text ? `${text}\n\n具体问题：\n${fallback}` : fallback
  } catch {
    return fallback
  }
}

export const DEFAULT_REMARK = '同意。请理性消费。'

/**
 * The AI leader's closing remark for the receipt, based on the application and the reflective
 * answers from the 复核单. The order is already approved; this is wording only.
 */
export async function leaderRemark(
  draft: Application,
  attempt: number,
  difficulty: Difficulty,
  reflections: Record<string, string>,
  quizRetries: number,
): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/api/leader-voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'remark',
        productId: draft.productId,
        attempt,
        difficulty,
        form: {
          purpose: draft.purpose,
          frequency: draft.frequency,
          vsRent: draft.vsRent,
          vsBorrow: draft.vsBorrow,
          vsExisting: draft.vsExisting,
          declaredTotal: draft.declaredTotal,
        },
        reflections,
        quizRetries,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) return DEFAULT_REMARK
    const { text } = (await res.json()) as { text?: string }
    return text || DEFAULT_REMARK
  } catch {
    return DEFAULT_REMARK
  }
}
