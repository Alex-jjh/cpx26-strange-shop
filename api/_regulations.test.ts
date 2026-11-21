import { describe, expect, it } from 'vitest'
import catalog from '../src/data/products.json' with { type: 'json' }
import regulations from '../src/domain/regulations.json' with { type: 'json' }
import type { Article, Product } from '../src/domain/types.ts'
import { buildMessages, RULE_IDS } from './leader-voice.ts'

// Lives under api/ because it checks the server's rule list against the shared regulations.
const articles = regulations.articles as Article[]

describe('《个人钱包管理暂行办法》', () => {
  it('has exactly one article per review rule', () => {
    for (const rule of RULE_IDS) expect(articles.filter((a) => a.rule === rule), rule).toHaveLength(1)
  })

  it('only references rules that exist', () => {
    for (const a of articles) if (a.rule) expect(RULE_IDS).toContain(a.rule)
  })

  it('has unique article numbers', () => {
    const nos = articles.map((a) => a.no)
    expect(new Set(nos).size).toBe(nos.length)
  })

  it('is given to the AI leader in full, and each issue names its article', () => {
    const projector = (catalog as Product[]).find((p) => p.id === 'projector')!
    const form = { purpose: '看球', frequency: 'once' as const, vsRent: '', vsBorrow: '', vsExisting: '', declaredTotal: null }
    const [system, user] = buildMessages(projector, ['why-not-rent'], 1, form)
    for (const a of articles) expect(system.content).toContain(a.text)
    expect(user.content).toContain('（对应第四条）')
  })
})
