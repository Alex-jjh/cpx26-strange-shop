import { products } from '../data/catalog'
import { formatYuan } from '../domain/cost'
import { ProductImage } from './ProductImage'

export function Shop({ onOpen }: { onOpen: (productId: string) => void }) {
  return (
    <section>
      <h1>今日精选</h1>
      <p className="muted">所有购买均需提交采购申请，经领导审批后方可下单。</p>
      <ul className="grid">
        {products.map((p, i) => (
          <li key={p.id}>
            <button className="card" onClick={() => onOpen(p.id)}>
              <ProductImage src={p.images.unboxed} label={p.category} size="thumb" eager={i < 4} />
              <span className="name">{p.name}</span>
              <span className="price">¥{formatYuan(p.price)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
