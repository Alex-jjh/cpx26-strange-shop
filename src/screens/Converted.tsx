import { formatYuan } from '../domain/cost'
import type { Product } from '../domain/types'
import { DocHead } from './DocHead'

/**
 * The key moment: tapping "立即购买" does not pay, it lands here.
 * This is the first OA-world screen, so the visual switch (orange to grey paper) is the pitch's "question on the slide".
 */
export function Converted({
  product,
  docNo,
  onStart,
  onBack,
}: {
  product: Product
  docNo: string
  onStart: () => void
  onBack: () => void
}) {
  return (
    <section className="doc converted">
      <DocHead title="您的购买请求已转为采购申请" docNo={docNo} />

      <h2 className="doc-section">申请事项</h2>
      <dl className="doc-table">
        <dt>申请物品</dt>
        <dd>{product.name}</dd>
        <dt>申报金额</dt>
        <dd className="price">¥{formatYuan(product.price)}</dd>
        <dt>状态</dt>
        <dd>待办理</dd>
      </dl>

      <p className="muted">根据《个人钱包管理暂行办法》，购买须先办理采购申请。</p>

      <button className="primary" onClick={onStart}>
        开始办理
      </button>
      <button className="link" onClick={onBack}>
        返回商品页
      </button>
    </section>
  )
}
