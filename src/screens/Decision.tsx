import { totalCost } from '../domain/cost'
import type { Product } from '../domain/types'

// Friction #3: rejection and re-review. The user can revise, switch product, or withdraw.

export function Reviewing({ attempt }: { attempt: number }) {
  return (
    <section className="center">
      <div className="spinner" aria-hidden />
      <h1>领导审阅中</h1>
      <p className="muted">第 {attempt} 次提交 · 请勿关闭页面</p>
    </section>
  )
}

interface RejectedProps {
  text: string
  attempt: number
  onRevise: () => void
  onSwitch: () => void
  onWithdraw: () => void
  onRegulations: () => void
}

export function Rejected({ text, attempt, onRevise, onSwitch, onWithdraw, onRegulations }: RejectedProps) {
  return (
    <section>
      <div className="banner reject">已驳回 · 第 {attempt} 次提交</div>
      <h2>审批意见</h2>
      <p className="opinion">{text}</p>
      <button className="link" onClick={onRegulations}>
        查看《个人钱包管理暂行办法》
      </button>
      <div className="actions">
        <button className="primary" onClick={onRevise}>
          补充材料，重新提交
        </button>
        <button className="secondary" onClick={onSwitch}>
          换个方案
        </button>
        <button className="link danger" onClick={onWithdraw}>
          撤回申请
        </button>
      </div>
    </section>
  )
}

export function Approved({ product, onCheckout }: { product: Product; onCheckout: () => void }) {
  return (
    <section>
      <div className="banner approve">审批通过</div>
      <h1>{product.name}</h1>
      <p>
        应付总额 <strong className="price">¥{totalCost(product)}</strong>（含必需配件与运费）
      </p>
      <button className="primary" onClick={onCheckout}>
        模拟下单
      </button>
      <p className="fineprint">模拟订单，不会扣款，也不会发货。</p>
    </section>
  )
}

export function Withdrawn({ onDone }: { onDone: () => void }) {
  return (
    <section className="center">
      <h1>申请已撤回</h1>
      <p className="muted">恭喜您省下了这笔钱。</p>
      <button className="primary" onClick={onDone}>
        返回首页
      </button>
    </section>
  )
}
