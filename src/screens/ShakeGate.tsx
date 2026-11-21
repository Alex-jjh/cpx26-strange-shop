import { useEffect, useReducer, useRef } from 'react'
import { CALM_DURATION_MS, onShake, onStillness, onVisibleRest, requestMotionPermission, vibrate } from '../device'
import { gateReducer, initialGateState, SHAKES_NEEDED, TAPS_NEEDED } from './shakeGateState'
import './ShakeGate.css'

// Friction #1: demand movement, then accuse the applicant of being impulsive.
const CALM_SECONDS = CALM_DURATION_MS / 1000

export function ShakeGate({ onPass }: { onPass: () => void }) {
  const [state, dispatch] = useReducer(gateReducer, initialGateState)
  const requestId = useRef(0)
  const starting = useRef(false)
  const passed = useRef(false)
  const { stage, count, progress, notice } = state

  useEffect(() => () => { requestId.current += 1 }, [])

  useEffect(() => {
    if (stage === 'shake') {
      return onShake(
        () => { void vibrate(50); dispatch({ type: 'shake' }) },
        () => dispatch({ type: 'fallback', notice: '未收到有效动作数据，已改为点击验证。' }),
      )
    }
    if (stage === 'calm') {
      return onStillness(
        (ms) => dispatch({ type: 'progress', stage: 'calm', value: ms / CALM_DURATION_MS }),
        () => dispatch({ type: 'fallback', notice: `动作感应中断，改为等待 ${CALM_SECONDS} 秒即可。` }),
      )
    }
    if (stage === 'rest') {
      return onVisibleRest((ms) => dispatch({ type: 'progress', stage: 'rest', value: ms / CALM_DURATION_MS }))
    }
  }, [stage])

  async function start() {
    if (starting.current || stage !== 'idle') return
    starting.current = true
    const id = ++requestId.current
    dispatch({ type: 'start' })
    const granted = await requestMotionPermission()
    if (id === requestId.current) dispatch({ type: 'permission', granted })
  }

  function fallback() {
    requestId.current += 1
    dispatch({ type: 'fallback', notice: stage === 'calm' ? `无需保持姿势，稍等 ${CALM_SECONDS} 秒即可。` : '已切换到点击验证。' })
  }

  function finish() {
    if (stage !== 'done' || passed.current) return
    passed.current = true
    onPass()
  }

  const verifying = stage === 'shake' || stage === 'tap'
  const calming = stage === 'calm' || stage === 'rest'
  const needed = stage === 'tap' ? TAPS_NEEDED : SHAKES_NEEDED
  const showingAd = stage === 'idle' || stage === 'requesting' || verifying

  if (showingAd) {
    return (
      <section className="shake-ad" aria-labelledby="ad-close-title">
        <img
          key={count}
          className="shake-ad-image"
          src="/ads/shake-to-close-ad.webp"
          alt="闲鱼奶茶优惠广告：吃喝玩乐先上闲鱼，展示优惠券与饮品"
          loading="eager"
          fetchPriority="high"
          draggable={false}
        />
        <div className="shake-ad-top">
          <span className="shake-ad-label">广告</span>
          <span className="shake-ad-step">关闭进度 {count}/{needed}</span>
        </div>
        <div className="shake-ad-controls">
          <h1 id="ad-close-title">摇一摇关闭广告</h1>
          <p aria-live="polite">
            {stage === 'idle' && `广告正在占用您的采购页面。请轻摇手机 ${SHAKES_NEEDED} 次关闭。`}
            {stage === 'requesting' && '正在申请动作权限，也可改用点击关闭。'}
            {stage === 'shake' && `再摇 ${SHAKES_NEEDED - count} 次即可关闭，请勿用力甩动手机。`}
            {stage === 'tap' && `再点 ${TAPS_NEEDED - count} 次即可关闭。`}
          </p>
          {notice && <p className="shake-ad-notice" role="status">{notice}</p>}
          <progress aria-label="广告关闭进度" max={needed} value={count} />
          {(stage === 'idle' || stage === 'requesting') && (
            <button className="shake-ad-action" disabled={stage === 'requesting'} onClick={() => void start()}>
              {stage === 'requesting' ? '正在请求权限…' : '开始摇一摇'}
            </button>
          )}
          {stage === 'tap' && (
            <button className="shake-ad-action" onClick={() => dispatch({ type: 'tap' })}>
              点击关闭广告（还需 {TAPS_NEEDED - count} 次）
            </button>
          )}
          {(stage === 'requesting' || stage === 'shake') && (
            <button className="shake-ad-alternative" onClick={fallback}>无法摇动？改用点击关闭</button>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="center" aria-labelledby="verification-title">
      <span className="tag">采购资格审查 · 情绪复核</span>
      <h1 id="verification-title">{calming ? '检测到您疑似冲动消费' : stage === 'done' ? '情绪稳定，准予填表' : '请证明您是清醒的本人'}</h1>
      <div aria-live="polite" aria-atomic="true">
        {stage === 'calm' && <p>广告已关闭，但检测到剧烈动作，疑似冲动消费。<br />请保持手机平稳 {CALM_SECONDS} 秒，证明您具备理性采购能力。</p>}
        {stage === 'rest' && <p>采购意愿过于强烈，请先冷静 {CALM_SECONDS} 秒。<br />保持页面打开，计时结束即可继续。</p>}
        {stage === 'done' && <p>情绪稳定。现允许您填写申请表。</p>}
        {notice && stage !== 'done' && <p className="muted">{notice}</p>}
      </div>

      {calming && (
        <>
          <p className="counter">{Math.ceil((1 - progress) * CALM_SECONDS)} 秒</p>
          <progress aria-label="冷静验证进度" max={1} value={progress} />
          {stage === 'calm' && <p className="muted">容许轻微手抖，也可以将手机放在桌面上。</p>}
        </>
      )}
      {stage === 'calm' && (
        <button className="link" onClick={fallback}>
          不便保持平稳？改用普通倒计时
        </button>
      )}
      {stage === 'done' && <button className="primary" onClick={finish}>理性尚存，继续填表</button>}
    </section>
  )
}
