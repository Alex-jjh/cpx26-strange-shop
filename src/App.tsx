import { useState } from 'react'
import { findProduct } from './data/catalog'
import { notify, vibrate } from './device'
import { review } from './domain/review'
import type { Application, Difficulty } from './domain/types'
import { emptyApplication, newOrderNo, todayIso, type Screen } from './flow'
import { leaderVoice } from './llm/leaderVoice'
import { Approved, Rejected, Reviewing, Withdrawn } from './screens/Decision'
import { ProcurementForm } from './screens/ProcurementForm'
import { ProductPage } from './screens/ProductPage'
import { Receipt } from './screens/Receipt'
import { ShakeGate } from './screens/ShakeGate'
import { Shop } from './screens/Shop'

const REVIEW_DELAY_MS = 2500 // "领导审阅中" — part of the friction

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'shop' })
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')

  async function submit(draft: Application, attempt: number) {
    setScreen({ name: 'reviewing', draft, attempt })
    const product = findProduct(draft.productId)!
    const decision = review(draft, product, difficulty, todayIso())
    const [text] = await Promise.all([
      decision.kind === 'rejected' ? leaderVoice(product.id, decision.findings, attempt) : Promise.resolve(''),
      new Promise((r) => setTimeout(r, REVIEW_DELAY_MS)),
    ])
    if (decision.kind === 'rejected') {
      void vibrate()
      void notify('采购申请被驳回', `「${product.name}」第 ${attempt} 次提交未通过`)
      setScreen({ name: 'rejected', draft, attempt, text })
    } else {
      void notify('采购申请已批准', `「${product.name}」已解锁下单`)
      setScreen({ name: 'approved', draft, attempt })
    }
  }

  const home = () => setScreen({ name: 'shop' })

  return (
    <div className="app">
      <header className="topbar">
        <button className="link" onClick={home}>
          个人采购 OA
        </button>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} aria-label="领导难度">
          <option value="normal">普通领导</option>
          <option value="hard">难缠领导</option>
        </select>
      </header>
      <main>{render()}</main>
    </div>
  )

  function render() {
    switch (screen.name) {
      case 'shop':
        return <Shop onOpen={(productId) => setScreen({ name: 'product', productId })} />
      case 'product':
        return (
          <ProductPage
            product={findProduct(screen.productId)!}
            onApply={() => setScreen({ name: 'gate', productId: screen.productId })}
          />
        )
      case 'gate':
        return (
          <ShakeGate
            onPass={() => setScreen({ name: 'form', draft: emptyApplication(screen.productId), attempt: 1 })}
          />
        )
      case 'form':
        return (
          <ProcurementForm
            product={findProduct(screen.draft.productId)!}
            initial={screen.draft}
            attempt={screen.attempt}
            onSubmit={(draft) => void submit(draft, screen.attempt)}
          />
        )
      case 'reviewing':
        return <Reviewing attempt={screen.attempt} />
      case 'rejected':
        return (
          <Rejected
            text={screen.text}
            attempt={screen.attempt}
            onRevise={() => setScreen({ name: 'form', draft: screen.draft, attempt: screen.attempt + 1 })}
            onSwitch={home}
            onWithdraw={() => setScreen({ name: 'withdrawn' })}
          />
        )
      case 'approved':
        return (
          <Approved
            product={findProduct(screen.draft.productId)!}
            onCheckout={() => setScreen({ ...screen, name: 'receipt', orderNo: newOrderNo() })}
          />
        )
      case 'receipt':
        return (
          <Receipt
            product={findProduct(screen.draft.productId)!}
            orderNo={screen.orderNo}
            attempt={screen.attempt}
            onDone={home}
          />
        )
      case 'withdrawn':
        return <Withdrawn onDone={home} />
    }
  }
}
