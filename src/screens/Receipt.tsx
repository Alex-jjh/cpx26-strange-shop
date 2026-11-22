import { formatYuan, totalCost } from '../domain/cost'
import type { Product } from '../domain/types'
import { DocHead, Stamp } from './DocHead'

interface Props {
  product: Product
  orderNo: string
  attempt: number
  /** AI leader's closing remark (falls back to a fixed line offline). */
  remark: string
  /** Satirical 文号 shown in the header (optional). */
  docNo?: string
  onDone: () => void
}

export function Receipt({ product, orderNo, attempt, remark, docNo, onDone }: Props) {
  return (
    <section className="doc receipt">
      <DocHead title="采购审批回执" docNo={docNo} />
      <dl className="doc-table">
        <dt>单号</dt>
        <dd className="mono">{orderNo}</dd>
        <dt>物品</dt>
        <dd>{product.name}</dd>
        <dt>金额</dt>
        <dd>
          <strong className="price">¥{formatYuan(totalCost(product))}</strong>
        </dd>
        <dt>提交次数</dt>
        <dd>{attempt}</dd>
        <dt className="wide">审批意见</dt>
        <dd className="wide remark">{remark}</dd>
      </dl>
      <Stamp kind="seal">{'审批\n专用章'}</Stamp>
      <p className="fineprint">模拟订单：未扣款，不发货。</p>
      <button className="primary" onClick={onDone}>
        返回首页
      </button>
    </section>
  )
}
