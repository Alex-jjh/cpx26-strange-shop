import { totalCost } from './cost'
import type { Application, Decision, Difficulty, Finding, Product } from './types'

// The AI leader's veto is decided HERE, by rules, so the demo path is deterministic.
// The LLM only rewrites the findings in the leader's voice (see src/llm/leaderVoice.ts).

const MIN_PURPOSE_CHARS = 10
const MAX_DAYS_TO_FIRST_USE = 14
const MIN_JUSTIFICATION_CHARS = 4

const filled = (s: string) => s.trim().length >= MIN_JUSTIFICATION_CHARS

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000)
}

export function review(
  app: Application,
  product: Product,
  difficulty: Difficulty,
  todayIso: string,
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

  if (app.frequency === 'once' && product.alternatives.rent && !filled(app.vsRent)) {
    findings.push({ rule: 'why-not-rent', message: '只用一次，为什么不租？' })
  }

  if (difficulty === 'hard') {
    const days = app.firstUseDate ? daysBetween(todayIso, app.firstUseDate) : Infinity
    if (!(days >= 0 && days <= MAX_DAYS_TO_FIRST_USE)) {
      findings.push({
        rule: 'first-use-too-far',
        message: `两周内用不上，为什么现在就买？首次使用日期须在 ${MAX_DAYS_TO_FIRST_USE} 天内。`,
      })
    }
    const considered = [app.vsRent, app.vsBorrow, app.vsExisting].filter(filled).length
    if (considered < 2) {
      findings.push({
        rule: 'alternatives-missing',
        message: '替代方案论证不足：租、借、用现有的，至少说明其中两项为什么不行。',
      })
    }
  }

  return findings.length === 0 ? { kind: 'approved' } : { kind: 'rejected', findings }
}
