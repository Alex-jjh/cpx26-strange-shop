import { describe, expect, it } from 'vitest'
import { BORROW_OPTIONS, EXISTING_OPTIONS, formAsText, PURPOSE_OPTIONS, RENT_OPTIONS } from './formOptions'

describe.each([
  ['purpose', PURPOSE_OPTIONS],
  ['rent', RENT_OPTIONS],
  ['borrow', BORROW_OPTIONS],
  ['existing', EXISTING_OPTIONS],
])('%s options', (_, options) => {
  it('have unique ids and exactly one "其他"', () => {
    expect(new Set(options.map((o) => o.id)).size).toBe(options.length)
    expect(options.filter((o) => o.kind === 'other')).toHaveLength(1)
  })

  it('offer at least one real reason and at least one excuse to be roasted', () => {
    expect(options.some((o) => o.kind === 'reason')).toBe(true)
    expect(options.some((o) => o.kind === 'impulse')).toBe(true)
  })
})

it('turns the form into the text the AI leader quotes', () => {
  const text = formAsText({
    productId: 'projector',
    purpose: { choice: 'other', note: ' 久坐之后放松肩颈 ' },
    firstUse: 'this-week',
    frequency: 'weekly',
    vsRent: { choice: 'never-thought', note: 'ignored for non-other options' },
    vsBorrow: { choice: '', note: '' },
    vsExisting: { choice: 'want-new', note: '' },
    declaredTotal: 399,
  })
  expect(text).toEqual({
    purpose: '其他：久坐之后放松肩颈',
    frequency: 'weekly',
    vsRent: '没想过可以租',
    vsBorrow: '',
    vsExisting: '就是想要新的',
    declaredTotal: 399,
  })
})
