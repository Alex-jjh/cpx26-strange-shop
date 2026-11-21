import raw from './products.json'
import type { Product } from '../domain/types'

export const products = raw as Product[]

export function findProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}
