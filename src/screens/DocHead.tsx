import type { ReactNode } from 'react'

// Shared header of every official document in the approval world (.world-oa).
// docNo is the satirical 文号 (CG-YYYYMMDD-NNNN) generated once by App; it is not a fact claim.

interface Props {
  title: string
  docNo?: string
  /** Extra label/value rows shown under 审批人 (e.g. application date, attempt). */
  rows?: Array<[label: string, value: ReactNode]>
}

export function DocHead({ title, docNo, rows = [] }: Props) {
  return (
    <header className="doc-head">
      <p className="doc-org">个人钱包审批办公室</p>
      <h1>{title}</h1>
      <dl className="doc-meta">
        {docNo && (
          <>
            <dt>文号</dt>
            <dd className="mono">{docNo}</dd>
          </>
        )}
        <dt>申请人</dt>
        <dd>你</dd>
        <dt>审批人</dt>
        <dd>AI 领导</dd>
        {rows.map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}
      </dl>
    </header>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  )
}

/** Round stamp in its own reserved box; never positioned over text. A newline in children breaks the line. */
export function Stamp({ kind, children }: { kind: 'reject' | 'approve' | 'seal'; children: string }) {
  return (
    <div className="stamp-slot">
      <div className={`stamp-round ${kind}`} role="img" aria-label={children.replace(/\s/g, '')}>
        {children}
      </div>
    </div>
  )
}
