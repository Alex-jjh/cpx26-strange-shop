import { useEffect, useState } from 'react'
import { onShake, requestMotionPermission, vibrate } from '../device'

// Friction #1: a forced "human verification" mini-game, satirising shake-to-open ads and CAPTCHAs.
// Fallback for devices without motion sensors is deliberately worse: tap 30 times.

const SHAKES_NEEDED = 8
const TAPS_NEEDED = 30

export function ShakeGate({ onPass }: { onPass: () => void }) {
  const [mode, setMode] = useState<'idle' | 'shake' | 'tap'>('idle')
  const [count, setCount] = useState(0)
  const needed = mode === 'tap' ? TAPS_NEEDED : SHAKES_NEEDED

  useEffect(() => {
    if (mode !== 'shake') return
    return onShake(() => {
      void vibrate(50)
      setCount((c) => c + 1)
    })
  }, [mode])

  useEffect(() => {
    if (mode !== 'idle' && count >= needed) onPass()
  }, [mode, count, needed, onPass])

  async function start() {
    setCount(0)
    setMode((await requestMotionPermission()) ? 'shake' : 'tap')
  }

  return (
    <section className="center">
      <h1>真人验证</h1>
      <p className="muted">为确认您是在清醒状态下购物，请完成验证。</p>
      {mode === 'idle' && (
        <button className="primary" onClick={() => void start()}>
          开始验证
        </button>
      )}
      {mode !== 'idle' && (
        <>
          <p className="counter">
            {count} / {needed}
          </p>
          <progress max={needed} value={count} />
          {mode === 'shake' ? (
            <>
              <p>请用力摇动手机</p>
              <button className="link" onClick={() => { setCount(0); setMode('tap') }}>
                摇不动？改用点击验证
              </button>
            </>
          ) : (
            <button className="primary" onClick={() => setCount((c) => c + 1)}>
              点我（共需 {TAPS_NEEDED} 次）
            </button>
          )}
        </>
      )}
    </section>
  )
}
