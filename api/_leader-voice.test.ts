import { describe, expect, it } from 'vitest'
import catalog from '../src/data/products.json' with { type: 'json' }
import type { Product } from '../src/domain/types.ts'
import { buildPrompt } from './leader-voice.ts'

const projector = (catalog as Product[]).find((p) => p.id === 'projector')!
const prompt = buildPrompt(projector, ['purpose-too-short', 'total-mismatch', 'why-not-rent'], 1)

describe('leader prompt', () => {
  it('frames the approval as personal shopping, not a company', () => {
    expect(prompt).toContain('个人消费')
    expect(prompt).toContain('没有公司')
  })

  it('names required accessories but not optional ones', () => {
    expect(prompt).toContain('支架')
    expect(prompt).toContain('HDMI 线')
    expect(prompt).not.toContain('幕布')
  })

  it('tells the model it cannot see what the user typed', () => {
    expect(prompt).toContain('看不到申请人填写的内容')
  })

  it('does not leak the total, so the user still has to compute it', () => {
    expect(prompt).not.toContain('2667')
  })

  it('includes the rent price for the "why not rent" quip', () => {
    expect(prompt).toContain('每天 59 元')
  })
})
