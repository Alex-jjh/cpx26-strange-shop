type Vector = { x: number; y: number; z: number }
type MotionPermission = { requestPermission?: () => Promise<string> }

const SAMPLE_GAP_MS = 1000
const SENSOR_TIMEOUT_MS = 3000
const SHAKE_THRESHOLD = 15 // m/s², summed change in acceleration between samples
const SHAKE_COOLDOWN_MS = 350
export const CALM_DURATION_MS = 3000

export async function requestMotionPermission(): Promise<boolean> {
  try {
    const motion = (window as unknown as { DeviceMotionEvent?: MotionPermission }).DeviceMotionEvent
    if (!motion) return false
    return typeof motion.requestPermission !== 'function' || (await motion.requestPermission()) === 'granted'
  } catch {
    return false
  }
}

export function readAcceleration(value: DeviceMotionEventAcceleration | null): Vector | null {
  if (!value) return null
  const { x, y, z } = value
  if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') return null
  return [x, y, z].every(Number.isFinite) ? { x, y, z } : null
}

export function createShakeDetector() {
  let last: Vector | null = null
  let lastAt = 0
  let lastFired = -Infinity
  return (sample: Vector, now: number): boolean => {
    let delta = 0
    if (last && now >= lastAt && now - lastAt <= SAMPLE_GAP_MS) {
      delta = Math.abs(sample.x - last.x) + Math.abs(sample.y - last.y) + Math.abs(sample.z - last.z)
    }
    last = sample
    lastAt = now
    if (delta > SHAKE_THRESHOLD && now - lastFired >= SHAKE_COOLDOWN_MS) {
      lastFired = now
      return true
    }
    return false
  }
}

export function createStillnessDetector() {
  let anchor: Vector | null = null
  let startedAt = 0
  let lastAt = 0
  return (sample: Vector, now: number): number => {
    // A fixed anchor catches slow drift while allowing small hand tremors.
    const moved = anchor && Math.hypot(sample.x - anchor.x, sample.y - anchor.y, sample.z - anchor.z) > 2.5
    if (!anchor || moved || now < lastAt || now - lastAt > SAMPLE_GAP_MS) {
      anchor = sample
      startedAt = now
    }
    lastAt = now
    return Math.min(CALM_DURATION_MS, now - startedAt)
  }
}

function watchMotion(
  onSample: (sample: Vector, now: number) => void,
  onReset: () => void,
  onUnavailable: () => void,
): () => void {
  let lastReceivedAt = performance.now()
  let active = true
  let timer: ReturnType<typeof setInterval> | undefined

  function stop() {
    active = false
    clearInterval(timer)
    window.removeEventListener('devicemotion', handleMotion)
    document.removeEventListener('visibilitychange', handleVisibility)
  }

  function handleMotion(event: DeviceMotionEvent) {
    if (!active || document.hidden) return
    const sample = readAcceleration(event.accelerationIncludingGravity)
    if (!sample) {
      onReset()
      return
    }
    const now = performance.now()
    if (now - lastReceivedAt > SAMPLE_GAP_MS) onReset()
    lastReceivedAt = now
    onSample(sample, now)
  }

  function handleVisibility() {
    lastReceivedAt = performance.now()
    onReset()
  }

  try {
    window.addEventListener('devicemotion', handleMotion)
    document.addEventListener('visibilitychange', handleVisibility)
    timer = setInterval(() => {
      if (!active || document.hidden) return
      const silence = performance.now() - lastReceivedAt
      if (silence > SAMPLE_GAP_MS) onReset()
      if (silence >= SENSOR_TIMEOUT_MS) {
        stop()
        onUnavailable()
      }
    }, 250)
  } catch {
    stop()
    onUnavailable()
  }
  return stop
}

/** Calls once per debounced shake; missing readings trigger a fallback. */
export function onShake(onDetected: () => void, onUnavailable: () => void = () => {}): () => void {
  let detect = createShakeDetector()
  return watchMotion(
    (sample, now) => { if (detect(sample, now)) onDetected() },
    () => { detect = createShakeDetector() },
    onUnavailable,
  )
}

/** Progress requires continuous valid samples; silence and hidden time never count. */
export function onStillness(onProgress: (ms: number) => void, onUnavailable: () => void): () => void {
  let measure = createStillnessDetector()
  return watchMotion(
    (sample, now) => onProgress(measure(sample, now)),
    () => { measure = createStillnessDetector(); onProgress(0) },
    onUnavailable,
  )
}

/** Accessible alternative: count foreground time, without requiring a fixed pose. */
export function onVisibleRest(onProgress: (ms: number) => void): () => void {
  let elapsed = 0
  let last = performance.now()
  const resetClock = () => { last = performance.now() }
  const timer = setInterval(() => {
    const now = performance.now()
    if (!document.hidden) elapsed += now - last
    last = now
    onProgress(Math.min(CALM_DURATION_MS, elapsed))
  }, 100)
  document.addEventListener('visibilitychange', resetClock)
  return () => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', resetClock)
  }
}
