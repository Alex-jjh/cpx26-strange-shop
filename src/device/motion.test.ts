import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createShakeDetector, createStillnessDetector, onShake, onStillness, onVisibleRest, readAcceleration, requestMotionPermission } from './motion'

const steady = { x: 0, y: 0, z: 9.8 }

describe('motion measurements', () => {
  it('ignores missing and non-finite axes', () => {
    expect(readAcceleration(null)).toBeNull()
    expect(readAcceleration({ ...steady, x: null })).toBeNull()
    expect(readAcceleration({ ...steady, y: NaN })).toBeNull()
    expect(readAcceleration({ ...steady, z: Infinity })).toBeNull()
    expect(readAcceleration(steady)).toEqual(steady)
  })

  it('debounces shakes and discards comparisons across sample gaps', () => {
    const detect = createShakeDetector()
    expect(detect(steady, 0)).toBe(false)
    expect(detect({ ...steady, x: 20 }, 100)).toBe(true)
    expect(detect(steady, 200)).toBe(false)
    expect(detect({ ...steady, x: 20 }, 450)).toBe(true)
    expect(detect(steady, 2000)).toBe(false)
  })

  it('allows small hand tremors for three seconds', () => {
    const measure = createStillnessDetector()
    expect(measure(steady, 0)).toBe(0)
    for (let t = 250; t <= 3000; t += 250) {
      expect(measure({ ...steady, x: t % 500 ? 0.3 : -0.3 }, t)).toBe(t)
    }
  })

  it('resets for movement, slow drift, gaps and backwards clock changes', () => {
    const measure = createStillnessDetector()
    measure(steady, 0)
    expect(measure({ ...steady, x: 1 }, 500)).toBe(500)
    expect(measure({ ...steady, x: 2 }, 1000)).toBe(1000)
    expect(measure({ ...steady, x: 3 }, 1500)).toBe(0)
    expect(measure({ ...steady, x: 3 }, 3000)).toBe(0)
    expect(measure({ ...steady, x: 3 }, 2900)).toBe(0)
  })
})

describe('device subscriptions and permissions', () => {
  let motionTarget: EventTarget & { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }
  let page: EventTarget & { hidden: boolean }

  function emit(sample: DeviceMotionEventAcceleration | null = steady) {
    const event = new Event('devicemotion')
    Object.defineProperty(event, 'accelerationIncludingGravity', { value: sample })
    motionTarget.dispatchEvent(event)
  }

  function hide(hidden: boolean) {
    page.hidden = hidden
    page.dispatchEvent(new Event('visibilitychange'))
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval', 'performance'] })
    vi.setSystemTime(0)
    motionTarget = new EventTarget()
    page = Object.assign(new EventTarget(), { hidden: false })
    vi.stubGlobal('window', motionTarget)
    vi.stubGlobal('document', page)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('handles absent APIs, denied permissions and exceptions', async () => {
    expect(await requestMotionPermission()).toBe(false)
    motionTarget.DeviceMotionEvent = {}
    expect(await requestMotionPermission()).toBe(true)
    motionTarget.DeviceMotionEvent = { requestPermission: async () => 'denied' }
    expect(await requestMotionPermission()).toBe(false)
    motionTarget.DeviceMotionEvent = { requestPermission: async () => { throw new Error('blocked') } }
    expect(await requestMotionPermission()).toBe(false)
    motionTarget.DeviceMotionEvent = { requestPermission: async () => 'granted' }
    expect(await requestMotionPermission()).toBe(true)
  })

  it('falls back once when the API exists but no valid readings arrive', () => {
    const unavailable = vi.fn()
    const stop = onShake(vi.fn(), unavailable)
    for (let i = 0; i < 6; i++) {
      emit({ ...steady, x: null })
      vi.advanceTimersByTime(500)
    }
    expect(unavailable).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
    stop()
  })

  it('never completes stillness from sensor silence', () => {
    const progress = vi.fn()
    const unavailable = vi.fn()
    const stop = onStillness(progress, unavailable)
    emit()
    vi.advanceTimersByTime(3500)
    expect(progress.mock.calls.every(([ms]) => ms === 0)).toBe(true)
    expect(unavailable).toHaveBeenCalledTimes(1)
    stop()
  })

  it('breaks the calm window immediately when a reading becomes invalid', () => {
    const progress = vi.fn()
    const stop = onStillness(progress, vi.fn())
    emit()
    vi.advanceTimersByTime(500)
    emit()
    expect(progress).toHaveBeenLastCalledWith(500)
    vi.advanceTimersByTime(250)
    emit(null)
    expect(progress).toHaveBeenLastCalledWith(0)
    vi.advanceTimersByTime(250)
    emit()
    expect(progress).toHaveBeenLastCalledWith(0)
    stop()
  })

  it('requires fresh steady time after returning from the background', () => {
    const progress = vi.fn()
    const unavailable = vi.fn()
    const stop = onStillness(progress, unavailable)
    emit()
    vi.advanceTimersByTime(500)
    emit()
    expect(progress).toHaveBeenLastCalledWith(500)
    hide(true)
    vi.advanceTimersByTime(10000)
    expect(unavailable).not.toHaveBeenCalled()
    hide(false)
    emit()
    expect(progress).toHaveBeenLastCalledWith(0)
    for (let i = 0; i < 6; i++) {
      vi.advanceTimersByTime(500)
      emit()
    }
    expect(progress).toHaveBeenLastCalledWith(3000)
    stop()
  })

  it('does not count wall-clock adjustments as steady time', () => {
    const progress = vi.fn()
    const stop = onStillness(progress, vi.fn())
    emit()
    for (let i = 0; i < 9; i++) {
      vi.advanceTimersByTime(100)
      emit()
    }
    vi.setSystemTime(Date.now() + 500)
    vi.advanceTimersByTime(100)
    emit()
    expect(progress).toHaveBeenLastCalledWith(1000)
    stop()
  })

  it('removes listeners and timers when leaving the gate', () => {
    const progress = vi.fn()
    const unavailable = vi.fn()
    const stop = onStillness(progress, unavailable)
    stop()
    emit()
    hide(true)
    vi.advanceTimersByTime(4000)
    expect(progress).not.toHaveBeenCalled()
    expect(unavailable).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('counts only visible time in the accessible rest alternative', () => {
    const progress = vi.fn()
    const stop = onVisibleRest(progress)
    vi.advanceTimersByTime(1000)
    expect(progress).toHaveBeenLastCalledWith(1000)
    hide(true)
    vi.advanceTimersByTime(10000)
    expect(progress).toHaveBeenLastCalledWith(1000)
    hide(false)
    vi.advanceTimersByTime(2000)
    expect(progress).toHaveBeenLastCalledWith(3000)
    stop()
    expect(vi.getTimerCount()).toBe(0)
  })
})
