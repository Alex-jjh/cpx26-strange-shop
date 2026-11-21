import { useState, type FormEvent } from 'react'
import type { Application, Product, UsageFrequency } from '../domain/types'

// Friction #2: the procurement PRD. Useful friction — it makes the buyer think about
// purpose, timing, alternatives and the true total before ordering.

const FREQUENCIES: { value: UsageFrequency; label: string }[] = [
  { value: 'once', label: '只用一次' },
  { value: 'monthly', label: '每月' },
  { value: 'weekly', label: '每周' },
  { value: 'daily', label: '每天' },
]

interface Props {
  product: Product
  initial: Application
  attempt: number
  onSubmit: (draft: Application) => void
}

export function ProcurementForm({ product, initial, attempt, onSubmit }: Props) {
  const [draft, setDraft] = useState(initial)
  const set = <K extends keyof Application>(key: K, value: Application[K]) => setDraft((d) => ({ ...d, [key]: value }))

  function handle(e: FormEvent) {
    e.preventDefault()
    onSubmit(draft)
  }

  return (
    <form className="form" onSubmit={handle}>
      <h1>采购申请单</h1>
      <p className="muted">
        申请物品：{product.name} · 第 {attempt} 次提交
      </p>

      <label>
        采购用途
        <textarea value={draft.purpose} onChange={(e) => set('purpose', e.target.value)} placeholder="具体要用它做什么？" />
      </label>
      <label>
        首次使用日期
        <input type="date" value={draft.firstUseDate} onChange={(e) => set('firstUseDate', e.target.value)} />
      </label>
      <label>
        预计使用频率
        <select value={draft.frequency} onChange={(e) => set('frequency', e.target.value as UsageFrequency)}>
          {FREQUENCIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend>替代方案论证</legend>
        <label>
          为什么不租？
          <textarea value={draft.vsRent} onChange={(e) => set('vsRent', e.target.value)} />
        </label>
        <label>
          为什么不借？
          <textarea value={draft.vsBorrow} onChange={(e) => set('vsBorrow', e.target.value)} />
        </label>
        <label>
          为什么现有的东西不行？
          <textarea value={draft.vsExisting} onChange={(e) => set('vsExisting', e.target.value)} />
        </label>
      </fieldset>

      <label>
        申报总价（元，含必需配件与运费）
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={draft.declaredTotal ?? ''}
          onChange={(e) => set('declaredTotal', e.target.value === '' ? null : Number(e.target.value))}
        />
      </label>

      <button className="primary" type="submit">
        提交领导审批
      </button>
    </form>
  )
}
