import { regulations } from '../domain/regulations'

export function Regulations({ onBack }: { onBack: () => void }) {
  return (
    <section className="regs">
      <h1>《{regulations.title}》</h1>
      <p className="fineprint">个人钱包审批办公室 发布</p>
      <ol>
        {regulations.articles.map((a) => (
          <li key={a.no}>
            <strong>
              {a.no}
              {a.title && `（${a.title}）`}
            </strong>{' '}
            {a.text}
          </li>
        ))}
      </ol>
      <button className="secondary" onClick={onBack}>
        已阅，返回
      </button>
    </section>
  )
}
