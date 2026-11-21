import { findDetails } from '../data/catalog'
import { formatYuan } from '../domain/cost'
import { rentalLine } from '../domain/rental'
import type { Product } from '../domain/types'
import { ProductImage } from './ProductImage'

export function ProductPage({ product, onApply }: { product: Product; onApply: () => void }) {
  const details = findDetails(product.id)
  const rental = rentalLine(details?.rental ?? null)

  return (
    <section>
      <ProductImage src={product.images.unboxed} label={product.category} size="large" eager />
      <h1>{product.name}</h1>
      <p className="price big">¥{formatYuan(product.price)}</p>
      {product.source === null ? (
        <p className="tag">示例价格，待采集真实数据</p>
      ) : (
        <p className="fineprint left">
          {details?.quoteLabel ?? '报价'} · 采集于 {product.source.capturedAt}
          {details?.priceNote && <> · {details.priceNote}</>}
        </p>
      )}

      <h2>配件</h2>
      {product.accessories.length === 0 ? (
        <p className="muted">无</p>
      ) : (
        <ul className="plain">
          {product.accessories.map((a) => (
            <li key={a.name}>
              {a.name} ¥{formatYuan(a.price)} {a.required && <span className="tag">必需</span>}
            </li>
          ))}
        </ul>
      )}
      <p className="muted">运费 ¥{formatYuan(product.shipping)}</p>
      {details?.scenario && <p className="fineprint left">核算场景：{details.scenario}</p>}

      {rental && (
        <>
          <h2>替代方案</h2>
          <p>{rental}</p>
        </>
      )}

      {product.images.dusty && (
        <>
          <h2>一个月后</h2>
          <ProductImage src={product.images.dusty} label="一个月后" size="large" />
          {details?.imageNote && <p className="fineprint">{details.imageNote}</p>}
        </>
      )}

      <button className="primary" onClick={onApply}>
        申请采购
      </button>
      <p className="fineprint">本页面不提供“立即购买”。</p>
    </section>
  )
}
