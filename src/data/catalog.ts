import raw from './products.json'
import rawDetails from './product-details.json'
import type { Product, ProductDetails } from '../domain/types'

export const products = raw as Product[]

export function findProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

const details = rawDetails as unknown as Record<string, ProductDetails>

export function findDetails(id: string): ProductDetails | undefined {
  return details[id]
}
