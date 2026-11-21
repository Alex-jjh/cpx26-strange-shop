import type { Finding } from '../domain/types'

// The decision is already made by rules; this only asks the server for nicer wording.
// Any failure (offline, no key, timeout) falls back to the rule messages, so the demo never stalls.

const API_BASE = import.meta.env.VITE_API_BASE ?? ''
const TIMEOUT_MS = 6000

export async function leaderVoice(productName: string, findings: Finding[], attempt: number): Promise<string> {
  const fallback = findings.map((f) => f.message).join('\n')
  try {
    const res = await fetch(`${API_BASE}/api/leader-voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName, rules: findings.map((f) => f.rule), attempt }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) return fallback
    const { text } = (await res.json()) as { text?: string }
    return text ? `${text}\n\n具体问题：\n${fallback}` : fallback
  } catch {
    return fallback
  }
}
