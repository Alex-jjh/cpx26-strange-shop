import { formatYuan, totalCost } from '../domain/cost'
import type { Product } from '../domain/types'
import { DocHead, Stamp } from './DocHead'

// Friction #3: rejection and re-review. The user can revise, switch product, or withdraw.
// docNo is the satirical 文号 created once on the converted screen; it is optional so screens still render without it.

export function Reviewing({ attempt, docNo }: { attempt: number; docNo?: string }) {
  return (
    <section className="doc center">
      <div className="spinner" aria-hidden />
      <h1>领导审阅中</h1>
      <p className="muted">第 {attempt} 次提交 · 请勿关闭页面</p>
      {docNo && <p className="doc-no mono">文号 {docNo}</p>}
    </section>
  )
}

export function Remarking({ docNo }: { docNo?: string }) {
  return (
    <section className="doc center">
      <div className="spinner" aria-hidden />
      <h1>领导批示中</h1>
      <p className="muted">复核单已提交，正在出具审批回执</p>
      {docNo && <p className="doc-no mono">文号 {docNo}</p>}
    </section>
  )
}

interface RejectedProps {
  text: string
  attempt: number
  docNo?: string
  onRevise: () => void
  onSwitch: () => void
  onWithdraw: () => void
  onRegulations: () => void
}

export function Rejected({ text, attempt, docNo, onRevise, onSwitch, onWithdraw, onRegulations }: RejectedProps) {
  return (
    <section className="doc">
      <DocHead title="采购申请审批结果" docNo={docNo} rows={[['提交次数', `第 ${attempt} 次`]]} />
      <div className="verdict">
        <div className="banner reject">已驳回 · 第 {attempt} 次提交</div>
        <Stamp kind="reject">驳回</Stamp>
      </div>
      <h2 className="doc-section">审批意见</h2>
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

interface ApprovedProps {
  product: Product
  docNo?: string
  onCheckout: () => void
}

export function Approved({ product, docNo, onCheckout }: ApprovedProps) {
  return (
    <section className="doc">
      <DocHead title="采购申请审批结果" docNo={docNo} />
      <div className="verdict">
        <div className="banner approve">审批通过</div>
        <Stamp kind="approve">同意</Stamp>
      </div>
      <dl className="doc-table">
        <dt>申请物品</dt>
        <dd>{product.name}</dd>
        <dt>应付总额</dt>
        <dd>
          <strong className="price">¥{formatYuan(totalCost(product))}</strong>
          <span className="muted">（含必需配件与运费）</span>
        </dd>
      </dl>
      <button className="primary" onClick={onCheckout}>
        去下单
      </button>
      <p className="fineprint">下单前须完成复核单。模拟订单，不会扣款，也不会发货。</p>
    </section>
  )
}

export function Withdrawn({ product, onDone }: { product?: Product; onDone: () => void }) {
  return (
    <section className="doc center withdrawn">
      <p className="doc-org">个人钱包审批办公室</p>
      <h1>申请已撤回</h1>
      {product && (
        <p className="saved">
          本次省下 <strong>¥{formatYuan(totalCost(product))}</strong>
          <span className="muted">（{product.name}，含必需配件与运费）</span>
        </p>
      )}
      <p>恭喜你，什么都没买。</p>
      <p className="muted">没有挽留，没有优惠券，也没有「再考虑一下」。</p>
      <button className="primary" onClick={onDone}>
        返回首页
      </button>
    </section>
  )
}
