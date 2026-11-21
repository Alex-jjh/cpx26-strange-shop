import { describe, expect, it } from 'vitest'
import { findProduct, products } from '../data/catalog'
import { formatYuan, totalCost } from './cost'
import { review } from './review'
import type { Application, Choice, Decision } from './types'

const projector = findProduct('projector')!
const massageGun = findProduct('massage-gun')!

const rules = (d: Decision) => (d.kind === 'rejected' ? d.findings.map((f) => f.rule) : [])
const pick = (choice: string, note = ''): Choice => ({ choice, note })
const none = pick('')

// The pitch demo: first submission is "with friends, one game" and skips every alternative.
const firstSubmission: Application = {
  productId: 'projector',
  purpose: pick('with-others'),
  firstUse: 'this-week',
  frequency: 'once',
  vsRent: none,
  vsBorrow: none,
  vsExisting: none,
  declaredTotal: projector.price,
}

const resubmission: Application = {
  ...firstSubmission,
  frequency: 'weekly',
  vsRent: pick('long-term'),
  vsBorrow: pick('nobody-has'),
  declaredTotal: totalCost(projector),
}

describe('demo path (normal difficulty)', () => {
  it('rejects the first submission: total, rent and alternatives', () => {
    expect(rules(review(firstSubmission, projector, 'normal', 1))).toEqual([
      'total-mismatch',
      'why-not-rent',
      'alternatives-missing',
    ])
  })

  it('approves the resubmission', () => {
    expect(review(resubmission, projector, 'normal', 2)).toEqual({ kind: 'approved' })
  })
})

describe('purpose', () => {
  it.each([
    ['unanswered', none],
    ['an excuse ("别人都有了")', pick('everyone')],
    ['an excuse ("先买来试试")', pick('try')],
    ['"其他" with a short note', pick('other', '放松肩膀')],
  ])('rejects %s', (_, purpose) => {
    expect(rules(review({ ...resubmission, purpose }, projector, 'normal', 2))).toEqual(['purpose-unclear'])
  })

  it('accepts "其他" with a 10+ character note', () => {
    const purpose = pick('other', '久坐之后放松肩颈肌肉用')
    expect(review({ ...resubmission, purpose }, projector, 'normal', 2)).toEqual({ kind: 'approved' })
  })

  it('names the excuse in the message', () => {
    const d = review({ ...resubmission, purpose: pick('everyone') }, projector, 'normal', 2)
    expect(d.kind === 'rejected' && d.findings[0].message).toContain('「别人都有了」不是用途')
  })
})

describe('alternatives', () => {
  it('"就是想要" is perfunctory, and does not count as an argument', () => {
    const d = review({ ...resubmission, vsBorrow: pick('want-own'), vsRent: none }, projector, 'normal', 2)
    expect(rules(d)).toEqual(['perfunctory-answer', 'alternatives-missing'])
  })

  it('"没想过" is not perfunctory, but does not count either', () => {
    const d = review({ ...resubmission, vsRent: pick('never-thought'), vsBorrow: none }, projector, 'normal', 2)
    expect(rules(d)).toEqual(['alternatives-missing'])
  })

  it('copy-pasted "其他" notes are perfunctory', () => {
    const same = '身边的朋友都没有这个东西'
    const app = { ...resubmission, vsRent: pick('other', same), vsBorrow: pick('other', `${same}。`) }
    expect(rules(review(app, projector, 'normal', 2))).toContain('perfunctory-answer')
  })

  it('a short "其他" note is perfunctory', () => {
    expect(rules(review({ ...resubmission, vsExisting: pick('other', '没人给我') }, projector, 'normal', 2))).toContain(
      'perfunctory-answer',
    )
  })

  it('asks "why not rent" for monthly use too', () => {
    expect(rules(review({ ...resubmission, frequency: 'monthly', vsRent: none }, projector, 'normal', 2))).toContain(
      'why-not-rent',
    )
  })

  it('does not ask "why not rent" for a product nobody rents out', () => {
    const app: Application = {
      ...resubmission,
      productId: 'massage-gun',
      frequency: 'once',
      vsRent: none,
      declaredTotal: massageGun.price,
    }
    expect(rules(review(app, massageGun, 'normal', 2))).not.toContain('why-not-rent')
  })
})

describe('first submission', () => {
  it('sends a flawless first submission back once, then approves it unchanged', () => {
    expect(rules(review(resubmission, projector, 'normal', 1))).toEqual(['first-submission'])
    expect(review(resubmission, projector, 'normal', 2)).toEqual({ kind: 'approved' })
  })
})

describe('hard difficulty', () => {
  it('also approves the demo resubmission', () => {
    expect(review(resubmission, projector, 'hard', 2)).toEqual({ kind: 'approved' })
  })

  it.each(['month', 'unsure', ''] as const)('rejects first use "%s"', (firstUse) => {
    expect(rules(review({ ...resubmission, firstUse }, projector, 'hard', 2))).toContain('first-use-too-far')
  })

  it('requires two argued alternatives', () => {
    expect(rules(review({ ...resubmission, vsBorrow: none }, projector, 'hard', 2))).toContain('alternatives-missing')
  })
})

describe('catalog', () => {
  it('has unique ids', () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length)
  })

  it('keeps the demo product rentable (the "why not rent" beat depends on it)', () => {
    expect(projector.alternatives.rent).toBeDefined()
  })

  it('total cost = price + required accessories + shipping', () => {
    // 2699 + HDMI cable 29.90, free shipping. Changing this changes the pitch demo (README).
    expect(totalCost(projector)).toBe(2728.9)
  })
})

describe('citations', () => {
  it('rule messages cite their article of 《个人钱包管理暂行办法》', () => {
    const d = review({ ...firstSubmission, purpose: none }, projector, 'normal', 1)
    expect(d.kind === 'rejected' && d.findings[0].message).toMatch(/^依据第二条（用途）：/)
  })
})

describe('money', () => {
  it('formats whole and fractional yuan', () => {
    expect(formatYuan(2699)).toBe('2699')
    expect(formatYuan(2728.9)).toBe('2728.90')
    expect(formatYuan(0.1 + 0.2)).toBe('0.30')
  })

  it('accepts the decimal total the user types for the demo', () => {
    expect(review({ ...resubmission, declaredTotal: 2728.9 }, projector, 'normal', 2)).toEqual({ kind: 'approved' })
  })
})
