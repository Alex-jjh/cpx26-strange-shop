import { findDetails } from '../data/catalog'
import { formatYuan } from '../domain/cost'
import { rentalLine } from '../domain/rental'
import type { Product } from '../domain/types'
import { ProductImage } from './ProductImage'

export function ProductPage({ product, onApply }: { product: Product; onApply: () => void }) {
  const details = findDetails(product.id)
  const rental = rentalLine(details?.rental ?? null)
  const requiredCount = product.accessories.filter((a) => a.required).length

  return (
    <section className="shop-product">
      <ProductImage src={product.images.unboxed} label={product.category} size="large" eager />

      <div className="shop-block">
        <p className="price big shop-price">
          <small>¥</small>
          {formatYuan(product.price)}
        </p>
        {product.source === null ? (
          <p className="shop-note">示例价格，待采集真实数据</p>
        ) : (
          <p className="shop-note">
            {details?.quoteLabel ?? '报价'} · 采集于 {product.source.capturedAt}
            {details?.priceNote && <> · {details.priceNote}</>}
          </p>
        )}
        {details?.scenario && <p className="shop-note">核算场景：{details.scenario}</p>}

        <h1>{product.name}</h1>
        <p className="shop-badges">
          {product.source === null ? (
            <span className="badge">示例价</span>
          ) : (
            details?.quoteLabel && <span className="badge">{details.quoteLabel}</span>
          )}
          <span className="badge">{product.category}</span>
          {requiredCount > 0 && <span className="badge">必需配件 {requiredCount} 件</span>}
          <span className="badge gold">{product.shipping === 0 ? '包邮' : `运费 ¥${formatYuan(product.shipping)}`}</span>
        </p>
      </div>

      <div className="shop-block shop-detail">
        <h2>商品详情</h2>

        <h3>配件</h3>
        {product.accessories.length === 0 ? (
          <p className="muted">无</p>
        ) : (
          <ul className="shop-list">
            {product.accessories.map((a) => (
              <li key={a.name}>
                <span>
                  {a.name} {a.required && <span className="badge">必需</span>}
                </span>
                <span>¥{formatYuan(a.price)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="muted">运费 ¥{formatYuan(product.shipping)}</p>

        {rental && (
          <>
            <h3>替代方案</h3>
            <p>{rental}</p>
          </>
        )}

        {product.images.dusty && (
          <>
            <h3>一个月后</h3>
            <ProductImage src={product.images.dusty} label="一个月后" size="large" />
            {details?.imageNote && <p className="shop-note">{details.imageNote}</p>}
          </>
        )}
      </div>

      <div className="buybar">
        {/* List price only, like a real store: the true total (accessories, shipping) is the user's
            job on the form — showing it here would give away the 第三条 rejection. */}
        <div className="buybar-total">
          <span className="price shop-price">
            <small>¥</small>
            {formatYuan(product.price)}
          </span>
        </div>
        <button className="buy-btn" onClick={onApply}>
          立即购买
        </button>
      </div>
    </section>
  )
}
