import type { Product } from './types'

/** True cost of ownership: price + required accessories + shipping. */
export function totalCost(p: Product): number {
  const accessories = p.accessories.filter((a) => a.required).reduce((sum, a) => sum + a.price, 0)
  // Round to cents: 2699 + 29.9 must be 2728.9, not 2728.8999999.
  return Math.round((p.price + accessories + p.shipping) * 100) / 100
}

/** Money for display: whole yuan stay whole (2699), fractions get two decimals (2728.90). */
export function formatYuan(n: number): string {
  const rounded = Math.round(n * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2)
}
