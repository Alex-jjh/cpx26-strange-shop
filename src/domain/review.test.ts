import { describe, expect, it } from 'vitest'
import { findProduct, products } from '../data/catalog'
import { totalCost } from './cost'
import { review } from './review'
import type { Application, Decision } from './types'

const TODAY = '2026-11-21'
const projector = findProduct('projector')!

const rules = (d: Decision) => (d.kind === 'rejected' ? d.findings.map((f) => f.rule) : [])

// The pitch demo: first submission says "one night" and skips the rent question.
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
  it('rejects the first submission with "why not rent" and a total mismatch', () => {
    expect(rules(review(firstSubmission, projector, 'normal', TODAY))).toEqual([
      'total-mismatch',
      'why-not-rent',
    ])
  })

  it('approves the resubmission', () => {
    expect(review(resubmission, projector, 'normal', TODAY)).toEqual({ kind: 'approved' })
  })
})

describe('hard difficulty', () => {
  it('also approves the demo resubmission', () => {
    expect(review(resubmission, projector, 'hard', TODAY)).toEqual({ kind: 'approved' })
  })

  it('rejects a first use more than two weeks away', () => {
    expect(rules(review({ ...resubmission, firstUseDate: '2027-01-01' }, projector, 'hard', TODAY))).toContain(
      'first-use-too-far',
    )
  })

  it('requires at least two alternatives argued', () => {
    expect(rules(review({ ...resubmission, vsBorrow: '' }, projector, 'hard', TODAY))).toContain(
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
