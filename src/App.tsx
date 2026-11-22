import { useState } from 'react'
import { findDetails, findProduct } from './data/catalog'
import { notify, vibrate } from './device'
import { review } from './domain/review'
import type { Application, Difficulty } from './domain/types'
import { emptyApplication, newDocNo, newOrderNo, type Screen } from './flow'
import { leaderRemark, leaderVoice } from './llm/leaderVoice'
import { Approved, Rejected, Remarking, Reviewing, Withdrawn } from './screens/Decision'
import { Converted } from './screens/Converted'
import { ProcurementForm } from './screens/ProcurementForm'
import { ProductPage } from './screens/ProductPage'
import { Quiz } from './screens/Quiz'
import { Receipt } from './screens/Receipt'
import { Regulations } from './screens/Regulations'
import { ShakeGate } from './screens/ShakeGate'
import { Shop } from './screens/Shop'

const REVIEW_DELAY_MS = 2500 // "领导审阅中" — part of the friction
const REMARK_DELAY_MS = 1500 // "领导批示中"

/** The product being applied for, on OA screens where 不买了 is offered (before the order is placed). */
function exitableProduct(screen: Screen): string | null {
  switch (screen.name) {
    case 'converted':
    case 'gate':
      return screen.productId
    case 'form':
    case 'reviewing':
    case 'rejected':
    case 'approved':
    case 'quiz':
      return screen.draft.productId
    default:
      return null
  }
}

/** Shop list + product page are the shop world ("the slide"); everything else is the OA world. */
function worldOf(screen: Screen): 'shop' | 'oa' {
  return screen.name === 'shop' || screen.name === 'product' ? 'shop' : 'oa'
}

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'shop' })
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')

  async function submit(docNo: string, draft: Application, attempt: number) {
    setScreen({ name: 'reviewing', docNo, draft, attempt })
    const product = findProduct(draft.productId)!
    const decision = review(draft, product, difficulty, attempt)
    const [text] = await Promise.all([
      decision.kind === 'rejected' ? leaderVoice(draft, decision.findings, attempt, difficulty) : Promise.resolve(''),
      new Promise((r) => setTimeout(r, REVIEW_DELAY_MS)),
    ])
    if (decision.kind === 'rejected') {
      void vibrate()
      void notify('采购申请被驳回', `「${product.name}」第 ${attempt} 次提交未通过`)
      setScreen({ name: 'rejected', docNo, draft, attempt, text })
    } else {
      void notify('采购申请已批准', `「${product.name}」已解锁下单`)
      setScreen({ name: 'approved', docNo, draft, attempt })
    }
  }

  async function finishQuiz(docNo: string, draft: Application, attempt: number, answers: Record<string, string>, retries: number) {
    setScreen({ name: 'remarking', docNo, draft, attempt })
    const [remark] = await Promise.all([
      leaderRemark(draft, attempt, difficulty, answers, retries),
      new Promise((r) => setTimeout(r, REMARK_DELAY_MS)),
    ])
    setScreen({ name: 'receipt', docNo, draft, attempt, orderNo: newOrderNo(), remark })
  }

  const home = () => setScreen({ name: 'shop' })
  const openRegulations = () => setScreen((s) => (s.name === 'regulations' ? s : { name: 'regulations', back: s }))

  // The regulations page is OA-world; the topbar follows the screen you are looking at.
  const world = worldOf(screen)
  const exitProduct = exitableProduct(screen)

  return (
    <div className={`app world-${world}`}>
      <header className="topbar">
        <button className={world === 'shop' ? 'link brand' : 'link'} onClick={home}>
          {world === 'shop' ? (
            <>
              奇怪小店 <small className="brand-en">Strange Shop</small>
            </>
          ) : (
            '奇怪小店 · 审批办公室'
          )}
        </button>
        <button className="link" onClick={openRegulations}>
          规章
        </button>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} aria-label="领导难度">
          <option value="normal">普通领导</option>
          <option value="hard">难缠领导</option>
        </select>
      </header>
      {exitProduct && (
        // The reverse of a shopping app: buying needs approval, leaving needs nothing. No "are you sure?".
        <div className="exit-bar">
          <span>不想买了？随时可以走，没有挽留。</span>
          <button className="exit" onClick={() => setScreen({ name: 'withdrawn', productId: exitProduct })}>
            不买了
          </button>
        </div>
      )}
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
            onApply={() => setScreen({ name: 'converted', productId: screen.productId, docNo: newDocNo() })}
          />
        )
      case 'converted':
        return (
          <Converted
            product={findProduct(screen.productId)!}
            docNo={screen.docNo}
            onStart={() => setScreen({ name: 'gate', docNo: screen.docNo, productId: screen.productId })}
            onBack={() => setScreen({ name: 'product', productId: screen.productId })}
          />
        )
      case 'gate':
        return (
          <ShakeGate
            onPass={() => setScreen({ name: 'form', docNo: screen.docNo, draft: emptyApplication(screen.productId), attempt: 1 })}
          />
        )
      case 'form':
        return (
          <ProcurementForm
            product={findProduct(screen.draft.productId)!}
            initial={screen.draft}
            attempt={screen.attempt}
            docNo={screen.docNo}
            onSubmit={(draft) => void submit(screen.docNo, draft, screen.attempt)}
          />
        )
      case 'reviewing':
        return <Reviewing attempt={screen.attempt} docNo={screen.docNo} />
      case 'rejected':
        return (
          <Rejected
            text={screen.text}
            attempt={screen.attempt}
            docNo={screen.docNo}
            onRevise={() => setScreen({ name: 'form', docNo: screen.docNo, draft: screen.draft, attempt: screen.attempt + 1 })}
            onSwitch={home}
            onWithdraw={() => setScreen({ name: 'withdrawn', productId: screen.draft.productId })}
            onRegulations={openRegulations}
          />
        )
      case 'approved':
        return (
          <Approved
            product={findProduct(screen.draft.productId)!}
            docNo={screen.docNo}
            onCheckout={() => setScreen({ name: 'quiz', docNo: screen.docNo, draft: screen.draft, attempt: screen.attempt })}
          />
        )
      case 'quiz':
        return (
          <Quiz
            product={findProduct(screen.draft.productId)!}
            details={findDetails(screen.draft.productId)}
            draft={screen.draft}
            difficulty={difficulty}
            docNo={screen.docNo}
            onPass={(answers, retries) => void finishQuiz(screen.docNo, screen.draft, screen.attempt, answers, retries)}
          />
        )
      case 'remarking':
        return <Remarking docNo={screen.docNo} />
      case 'receipt':
        return (
          <Receipt
            product={findProduct(screen.draft.productId)!}
            orderNo={screen.orderNo}
            docNo={screen.docNo}
            attempt={screen.attempt}
            remark={screen.remark}
            onDone={home}
          />
        )
      case 'withdrawn':
        return <Withdrawn product={screen.productId ? findProduct(screen.productId) : undefined} onDone={home} />
      case 'regulations':
        return <Regulations onBack={() => setScreen(screen.back)} />
    }
  }
}
