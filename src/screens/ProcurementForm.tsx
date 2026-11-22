import { useState, type FormEvent } from 'react'
import {
  BORROW_OPTIONS,
  EXISTING_OPTIONS,
  FIRST_USE_OPTIONS,
  FREQUENCY_OPTIONS,
  PURPOSE_OPTIONS,
  RENT_OPTIONS,
  findOption,
  type ChoiceOption,
} from '../domain/formOptions'
import type { Application, Choice, FirstUse, Product, UsageFrequency } from '../domain/types'
import { todayIso } from '../flow'
import { DocHead } from './DocHead'

// Friction #2: the procurement form. Useful friction — it makes the buyer think about purpose,
// timing, alternatives and the true total. Multiple choice; only "其他" asks for a written note.

interface Props {
  product: Product
  initial: Application
  attempt: number
  /** Satirical 文号 shown in the header (optional). */
  docNo?: string
  onSubmit: (draft: Application) => void
}

type ChoiceKey = 'purpose' | 'vsRent' | 'vsBorrow' | 'vsExisting'

export function ProcurementForm({ product, initial, attempt, docNo, onSubmit }: Props) {
  const [draft, setDraft] = useState(initial)
  const set = <K extends keyof Application>(key: K, value: Application[K]) => setDraft((d) => ({ ...d, [key]: value }))

  function handle(e: FormEvent) {
    e.preventDefault()
    onSubmit(draft)
  }

  const choiceGroup = (key: ChoiceKey, title: string, options: ChoiceOption[], notePlaceholder: string) => (
    <ChoiceGroup
      name={key}
      title={title}
      options={options}
      value={draft[key]}
      notePlaceholder={notePlaceholder}
      onChange={(v) => set(key, v)}
    />
  )

  return (
    <form className="form choices" onSubmit={handle}>
      <div className="doc">
        <DocHead
          title="采购申请单"
          docNo={docNo}
          rows={[
            ['申请日期', todayIso()],
            ['申请物品', product.name],
            ['提交次数', `第 ${attempt} 次提交`],
          ]}
        />
        <p className="fineprint left">点选即可。只有选「其他」时才需要写说明。</p>

        <h2 className="doc-section">一、申请事项</h2>
        {choiceGroup('purpose', '采购用途', PURPOSE_OPTIONS, '具体要用它做什么？（不少于 10 个字）')}

        <fieldset>
          <legend>首次使用</legend>
          <div className="chips short">
            {FIRST_USE_OPTIONS.map((o) => (
              <Chip key={o.id} name="firstUse" label={o.label} checked={draft.firstUse === o.id} onChange={() => set('firstUse', o.id as FirstUse)} />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>预计使用频率</legend>
          <div className="chips short">
            {FREQUENCY_OPTIONS.map((o) => (
              <Chip key={o.id} name="frequency" label={o.label} checked={draft.frequency === o.id} onChange={() => set('frequency', o.id as UsageFrequency)} />
            ))}
          </div>
        </fieldset>

        <h2 className="doc-section">二、替代方案论证</h2>
        {choiceGroup('vsRent', '为什么不租？', RENT_OPTIONS, '为什么不租？（不少于 8 个字）')}
        {choiceGroup('vsBorrow', '为什么不借？', BORROW_OPTIONS, '为什么不借？（不少于 8 个字）')}
        {choiceGroup('vsExisting', '为什么现有的东西不行？', EXISTING_OPTIONS, '现有的为什么不行？（不少于 8 个字）')}

        <h2 className="doc-section">三、金额申报</h2>
        <label className="total">
          申报总价（含必需配件与运费）
          <span className="input-unit">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={draft.declaredTotal ?? ''}
              onChange={(e) => set('declaredTotal', e.target.value === '' ? null : Number(e.target.value))}
            />
            <span className="unit">元</span>
          </span>
        </label>
      </div>

      {/* Sticky, so the presenter can submit without scrolling to the very bottom. */}
      <div className="form-submit">
        <button className="primary" type="submit">
          提交领导审批
        </button>
      </div>
    </form>
  )
}

function Chip({ name, label, checked, onChange }: { name: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className={checked ? 'chip chosen' : 'chip'}>
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      {label}
    </label>
  )
}

interface GroupProps {
  name: string
  title: string
  options: ChoiceOption[]
  value: Choice
  notePlaceholder: string
  onChange: (value: Choice) => void
}

function ChoiceGroup({ name, title, options, value, notePlaceholder, onChange }: GroupProps) {
  const isOther = findOption(options, value.choice)?.kind === 'other'
  return (
    <fieldset>
      <legend>{title}</legend>
      <div className="chips">
        {options.map((o) => (
          <Chip key={o.id} name={name} label={o.label} checked={value.choice === o.id} onChange={() => onChange({ ...value, choice: o.id })} />
        ))}
      </div>
      {isOther && (
        <textarea
          aria-label={`${title}（其他）`}
          value={value.note}
          placeholder={notePlaceholder}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
        />
      )}
    </fieldset>
  )
}
