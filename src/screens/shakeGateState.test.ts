import { describe, expect, it } from 'vitest'
import { gateReducer, initialGateState, type GateState } from './shakeGateState'

function start(granted: boolean): GateState {
  return gateReducer(gateReducer(initialGateState, { type: 'start' }), { type: 'permission', granted })
}

function repeat(state: GateState, type: 'shake' | 'tap', times: number): GateState {
  for (let i = 0; i < times; i++) state = gateReducer(state, { type })
  return state
}

describe('shake-then-calm verification', () => {
  it('requires all eight shakes, then a separate calm stage', () => {
    const shaking = repeat(start(true), 'shake', 7)
    expect(shaking.stage).toBe('shake')
    expect(shaking.count).toBe(7)
    const calm = repeat(shaking, 'shake', 1)
    expect(calm.stage).toBe('calm')
    expect(repeat(calm, 'shake', 10)).toEqual(calm)
    const partial = gateReducer(calm, { type: 'progress', stage: 'calm', value: 0.99 })
    expect(partial.stage).toBe('calm')
    expect(gateReducer(partial, { type: 'progress', stage: 'calm', value: 1 }).stage).toBe('done')
  })

  it('requires 30 taps and a rest after permission denial', () => {
    const tapping = repeat(start(false), 'tap', 29)
    expect(tapping.stage).toBe('tap')
    const rest = repeat(tapping, 'tap', 1)
    expect(rest.stage).toBe('rest')
    expect(gateReducer(rest, { type: 'progress', stage: 'rest', value: 1 }).stage).toBe('done')
  })

  it('ignores late permissions after the user selects the fallback', () => {
    const pending = gateReducer(initialGateState, { type: 'start' })
    const fallback = gateReducer(pending, { type: 'fallback', notice: 'manual' })
    expect(gateReducer(fallback, { type: 'permission', granted: true })).toEqual(fallback)
    expect(gateReducer(pending, { type: 'start' })).toEqual(pending)
  })

  it('starts a fresh tap count when sensing fails partway through shaking', () => {
    const shaking = repeat(start(true), 'shake', 4)
    const fallback = gateReducer(shaking, { type: 'fallback', notice: 'unavailable' })
    expect(fallback.stage).toBe('tap')
    expect(fallback.count).toBe(0)
    expect(repeat(fallback, 'tap', 30).stage).toBe('rest')
  })

  it('allows calm fallback without repeating the shake challenge', () => {
    const calm = repeat(start(true), 'shake', 8)
    const partial = gateReducer(calm, { type: 'progress', stage: 'calm', value: 0.5 })
    const rest = gateReducer(partial, { type: 'fallback', notice: 'manual' })
    expect(rest.stage).toBe('rest')
    expect(rest.progress).toBe(0)
    expect(gateReducer(rest, { type: 'progress', stage: 'calm', value: 1 })).toEqual(rest)
  })

  it('explains a reset and rejects invalid progress', () => {
    const calm = repeat(start(true), 'shake', 8)
    const partial = gateReducer(calm, { type: 'progress', stage: 'calm', value: 0.5 })
    const reset = gateReducer(partial, { type: 'progress', stage: 'calm', value: 0 })
    expect(reset.notice).toContain('重新保持平稳')
    expect(gateReducer(reset, { type: 'progress', stage: 'calm', value: NaN })).toEqual(reset)
    expect(gateReducer(reset, { type: 'progress', stage: 'calm', value: Infinity })).toEqual(reset)
  })

  it('does not leave done on late sensor events', () => {
    const rest = repeat(start(false), 'tap', 30)
    const done = gateReducer(rest, { type: 'progress', stage: 'rest', value: 1 })
    expect(gateReducer(done, { type: 'fallback', notice: 'late' })).toEqual(done)
    expect(gateReducer(done, { type: 'progress', stage: 'rest', value: 0 })).toEqual(done)
  })
})
