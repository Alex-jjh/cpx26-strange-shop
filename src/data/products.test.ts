import { describe, expect, it } from 'vitest'
import { products } from './catalog'

// Guards for hand-collected product data (role A). CI runs these on every PR.

const imageFiles = new Set(
  Object.keys(import.meta.glob('../../public/products/*', { eager: false })).map((p) =>
    p.replace('../../public', ''),
  ),
)

describe.each(products)('product $id', (p) => {
  it('has positive prices and non-negative shipping', () => {
    expect(p.price).toBeGreaterThan(0)
    expect(p.shipping).toBeGreaterThanOrEqual(0)
    for (const a of p.accessories) expect(a.price).toBeGreaterThan(0)
    if (p.alternatives.rent) expect(p.alternatives.rent.pricePerDay).toBeGreaterThan(0)
  })

  it('has a name, category and typical usage', () => {
    expect(p.name.trim()).not.toBe('')
    expect(p.category.trim()).not.toBe('')
    expect(p.typicalUsage.trim()).not.toBe('')
  })

  // Real data (source set) must be traceable and have its image in public/products/.
  it.runIf(p.source !== null)('real data: has source URL, capture date and images', () => {
    expect(p.source!.url).toMatch(/^https?:\/\//)
    expect(p.source!.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(imageFiles).toContain(p.images.unboxed)
    if (p.images.dusty) expect(imageFiles).toContain(p.images.dusty)
  })
})
