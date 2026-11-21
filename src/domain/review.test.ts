import { describe, expect, it } from 'vitest'
import { findProduct, products } from '../data/catalog'
import { totalCost } from './cost'
import { review } from './review'
import type { Application, Decision } from './types'

const TODAY = '2026-11-21'
const projector = findProduct('projector')!
const massageGun = findProduct('massage-gun')!

const rules = (d: Decision) => (d.kind === 'rejected' ? d.findings.map((f) => f.rule) : [])

// The pitch demo: first submission says "one game" and skips every alternative.
const firstSubmission: Application = {
  productId: 'projector',
  purpose: '周末在家和朋友一起看一场球赛直播',
  firstUseDate: '2026-11-28',
  frequency: 'once',
  vsRent: '',
  vsBorrow: '',
  vsExisting: '',
  declaredTotal: projector.price,
}

const resubmission: Application = {
  ...firstSubmission,
  purpose: '每周五家庭电影夜，并用于周末看球赛直播',
  frequency: 'weekly',
  vsRent: '每周都用，租一个月就超过买的价格',
  vsBorrow: '朋友的投影仪只能借一晚',
  declaredTotal: totalCost(projector),
}

describe('demo path (normal difficulty)', () => {
  it('rejects the first submission: total, rent and alternatives', () => {
    expect(rules(review(firstSubmission, projector, 'normal', TODAY, 1))).toEqual([
      'total-mismatch',
      'why-not-rent',
      'alternatives-missing',
    ])
  })

  it('approves the resubmission', () => {
    expect(review(resubmission, projector, 'normal', TODAY, 2)).toEqual({ kind: 'approved' })
  })
})

describe('no free pass', () => {
  // Real submission from testing that used to be approved on attempt 3.
  const lazy: Application = {
    productId: 'massage-gun',
    purpose: '我要放松肩膀',
    firstUseDate: '2026-11-16',
    frequency: 'monthly',
    vsRent: '没人给我',
    vsBorrow: '没人给我',
    vsExisting: '没有东西触碰到我的背部。我需要使用这个设备进行身体上的放松。',
    declaredTotal: 399,
  }

  it('rejects a short purpose and copy-pasted short answers', () => {
    expect(rules(review(lazy, massageGun, 'normal', TODAY, 3))).toEqual(['purpose-too-short', 'perfunctory-answer'])
  })

  it('treats duplicates as perfunctory even when long enough', () => {
    const same = '身边的朋友都没有这个东西'
    const d = review({ ...resubmission, vsRent: same, vsBorrow: `${same}。` }, projector, 'normal', TODAY, 2)
    expect(rules(d)).toContain('perfunctory-answer')
  })

  it('asks "why not rent" for monthly use too', () => {
    expect(rules(review({ ...resubmission, frequency: 'monthly', vsRent: '' }, projector, 'normal', TODAY, 2))).toContain(
      'why-not-rent',
    )
  })

  it('requires at least one argued alternative in normal mode', () => {
    const none = { ...resubmission, vsRent: '', vsBorrow: '', vsExisting: '' }
    expect(rules(review(none, projector, 'normal', TODAY, 2))).toEqual(['alternatives-missing'])
  })

  it('sends a flawless first submission back once, then approves it unchanged', () => {
    expect(rules(review(resubmission, projector, 'normal', TODAY, 1))).toEqual(['first-submission'])
    expect(review(resubmission, projector, 'normal', TODAY, 2)).toEqual({ kind: 'approved' })
  })
})

describe('hard difficulty', () => {
  it('also approves the demo resubmission', () => {
    expect(review(resubmission, projector, 'hard', TODAY, 2)).toEqual({ kind: 'approved' })
  })

  it('rejects a first use more than two weeks away, or in the past', () => {
    expect(rules(review({ ...resubmission, firstUseDate: '2027-01-01' }, projector, 'hard', TODAY, 2))).toContain(
      'first-use-too-far',
    )
    expect(rules(review({ ...resubmission, firstUseDate: '2026-11-16' }, projector, 'hard', TODAY, 2))).toContain(
      'first-use-too-far',
    )
  })

  it('requires at least two argued alternatives', () => {
    expect(rules(review({ ...resubmission, vsBorrow: '' }, projector, 'hard', TODAY, 2))).toContain(
      'alternatives-missing',
    )
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
    expect(totalCost(projector)).toBe(2499 + 129 + 39 + 0)
  })
})

describe('citations', () => {
  it('rule messages cite their article of 《个人钱包管理暂行办法》', () => {
    const d = review({ ...firstSubmission, purpose: '看球' }, projector, 'normal', TODAY, 1)
    expect(d.kind === 'rejected' && d.findings[0].message).toMatch(/^依据第二条（用途）：/)
  })
})
