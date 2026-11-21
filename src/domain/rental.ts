import type { RentalOffer } from './types.ts'

// One-line, human-readable rental alternative for the product page.
// api/leader-voice.ts has its own copy for the prompt (it cannot import app code at runtime);
// both are covered by tests.

const shortModel = (model: string | null) => (model ?? '').split('（')[0].trim()

export function rentalLine(r: RentalOffer | null): string | null {
  if (!r) return null
  const what = r.modelMatch ? '同款' : `同类款（${shortModel(r.model)}）`
  if (r.kind === 'onsite-practice-room' && r.pricePerHour) {
    return `可以去琴房练：每小时 ${r.pricePerHour} 元，到店使用，不外借`
  }
  if (r.kind !== 'equipment-rental') return null
  if (r.packagePrice && r.packageDaysIncluded) {
    const extra = r.extraDayPrice ? `，超期每天 ${r.extraDayPrice} 元` : ''
    return `可以租${what}：${r.packagePrice} 元包 ${r.packageDaysIncluded} 天${extra}`
  }
  if (r.pricePerDay) {
    const min = r.minimumDays && r.minimumDays > 1 ? `，${r.minimumDays} 天起租` : ''
    return `可以租${what}：每天 ${r.pricePerDay} 元${min}`
  }
  return null
}
