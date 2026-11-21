import type { Product } from '../domain/types'
import { ProductImage } from './ProductImage'

export function ProductPage({ product, onApply }: { product: Product; onApply: () => void }) {
  return (
    <section>
      <ProductImage src={product.images.unboxed} label={product.category} />
      <h1>{product.name}</h1>
      <p className="price big">¥{product.price}</p>
      {product.source === null && <p className="tag">示例价格，待采集真实数据</p>}

      <h2>配件</h2>
      {product.accessories.length === 0 ? (
        <p className="muted">无</p>
      ) : (
        <ul className="plain">
          {product.accessories.map((a) => (
            <li key={a.name}>
              {a.name} ¥{a.price} {a.required && <span className="tag">必需</span>}
            </li>
          ))}
        </ul>
      )}
      <p className="muted">运费 ¥{product.shipping}</p>

      <button className="primary" onClick={onApply}>
        申请采购
      </button>
      <p className="fineprint">本页面不提供“立即购买”。</p>
    </section>
  )
}
