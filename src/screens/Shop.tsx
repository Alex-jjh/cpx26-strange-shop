import { useState } from 'react'
import { findDetails, products } from '../data/catalog'
import { formatYuan } from '../domain/cost'
import type { Product } from '../domain/types'
import { ProductImage } from './ProductImage'

// Claim-free satirical badges (no facts, no numbers). Picked by list position, so a card keeps its badge.
const SATIRE = ['心动预警', '先别急', '冲动价']

const categories = [...new Set(products.map((p) => p.category))]

/** At most two badges per card: real data first, one satirical line if there is room. */
function cardBadges(p: Product, index: number): { text: string; gold?: boolean }[] {
  const details = findDetails(p.id)
  const badges: { text: string; gold?: boolean }[] = []
  badges.push(p.source === null ? { text: '示例价' } : { text: details?.quoteLabel ?? p.category })
  badges.push(p.shipping === 0 ? { text: '包邮', gold: true } : { text: SATIRE[index % SATIRE.length], gold: true })
  return badges
}

export function Shop({ onOpen }: { onOpen: (productId: string) => void }) {
  const [category, setCategory] = useState<string | null>(null)
  const shown = category === null ? products : products.filter((p) => p.category === category)

  return (
    <section className="shop">
      <div className="shop-hero">
        <h1>今日精选</h1>
        <p>好东西都在这里，想好了再点。</p>
      </div>

      <div className="shop-tabs" role="group" aria-label="分类">
        <button className={category === null ? 'shop-tab on' : 'shop-tab'} aria-pressed={category === null} onClick={() => setCategory(null)}>
          全部
        </button>
        {categories.map((c) => (
          <button key={c} className={category === c ? 'shop-tab on' : 'shop-tab'} aria-pressed={category === c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <ul className="shop-grid">
        {shown.map((p, i) => (
          <li key={p.id}>
            <button className="shop-card" onClick={() => onOpen(p.id)}>
              <ProductImage src={p.images.unboxed} label={p.category} size="thumb" eager={i < 4} />
              <span className="shop-name">{p.name}</span>
              <span className="price shop-price">
                <small>¥</small>
                {formatYuan(p.price)}
              </span>
              <span className="shop-badges">
                {cardBadges(p, i).map((b) => (
                  <span key={b.text} className={b.gold ? 'badge gold' : 'badge'}>
                    {b.text}
                  </span>
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
