import type { Product } from './types'

/** True cost of ownership: price + required accessories + shipping. */
export function totalCost(p: Product): number {
  const accessories = p.accessories.filter((a) => a.required).reduce((sum, a) => sum + a.price, 0)
  return p.price + accessories + p.shipping
}

export function rentCost(p: Product, days: number): number | null {
  return p.alternatives.rent ? p.alternatives.rent.pricePerDay * days : null
}
