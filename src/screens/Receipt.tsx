import { formatYuan, totalCost } from '../domain/cost'
import type { Product } from '../domain/types'

interface Props {
  product: Product
  orderNo: string
  attempt: number
  onDone: () => void
}

export function Receipt({ product, orderNo, attempt, onDone }: Props) {
  return (
    <section className="receipt">
      <h1>采购审批回执</h1>
      <dl>
        <dt>单号</dt>
        <dd>{orderNo}</dd>
        <dt>物品</dt>
        <dd>{product.name}</dd>
        <dt>金额</dt>
        <dd>¥{formatYuan(totalCost(product))}</dd>
        <dt>提交次数</dt>
        <dd>{attempt}</dd>
        <dt>审批意见</dt>
        <dd>同意。请理性消费。</dd>
      </dl>
      <div className="stamp" aria-label="审批专用章">
        审批
        <br />
        专用章
      </div>
      <p className="fineprint">模拟订单：未扣款，不发货。</p>
      <button className="primary" onClick={onDone}>
        返回首页
      </button>
    </section>
  )
}
