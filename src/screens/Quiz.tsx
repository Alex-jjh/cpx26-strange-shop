import { useMemo, useState } from 'react'
import { vibrate } from '../device'
import { buildQuiz, gradeQuiz, reflections } from '../domain/quiz'
import type { Application, Difficulty, Product, ProductDetails } from '../domain/types'

// Friction #4 (useful): a multiple-choice 复核单 between approval and the simulated order.
// Graded questions are checked by rules; reflective answers go to the AI leader's closing remark.

interface Props {
  product: Product
  details: ProductDetails | undefined
  draft: Application
  difficulty: Difficulty
  onPass: (reflections: Record<string, string>, retries: number) => void
}

export function Quiz({ product, details, draft, difficulty, onPass }: Props) {
  const quiz = useMemo(() => buildQuiz(product, details, draft, difficulty), [product, details, draft, difficulty])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ReturnType<typeof gradeQuiz> | null>(null)
  const [retries, setRetries] = useState(0)

  function submit() {
    const graded = gradeQuiz(quiz, answers)
    if (graded.passed) {
      onPass(reflections(quiz, answers), retries)
      return
    }
    if (graded.wrong.length > 0) {
      setRetries((r) => r + 1)
      void vibrate()
    }
    setResult(graded)
  }

  const isWrong = (id: string) => result?.wrong.some((q) => q.id === id)
  const isMissing = (id: string) => result?.unanswered.some((q) => q.id === id)

  return (
    <section className="quiz">
      <span className="tag">下单前复核 · 第 {retries + 1} 次作答</span>
      <h1>采购复核单</h1>
      <p className="muted">审批已通过，但下单前须完成复核。选择即可，无需手写；答完后由 AI 领导出具批示。</p>

      {quiz.map((q, i) => (
        <fieldset key={q.id} className={isWrong(q.id) ? 'question wrong' : isMissing(q.id) ? 'question missing' : 'question'}>
          <legend>
            {i + 1}. {q.title}
            {q.kind === 'reflective' && <span className="tag">没有标准答案</span>}
          </legend>
          <p>{q.prompt}</p>
          {q.options.map((o) => (
            <label key={o.id} className={answers[q.id] === o.id ? 'option chosen' : 'option'}>
              <input
                type="radio"
                name={q.id}
                value={o.id}
                checked={answers[q.id] === o.id}
                onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
              />
              {o.text}
            </label>
          ))}
          {isWrong(q.id) && <p className="explain">答错了。{q.explain}</p>}
          {isMissing(q.id) && <p className="explain">此题未作答。</p>}
        </fieldset>
      ))}

      <button className="primary" onClick={submit}>
        提交复核
      </button>
    </section>
  )
}
