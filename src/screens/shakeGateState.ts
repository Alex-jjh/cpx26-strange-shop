import { CALM_DURATION_MS } from '../device/motion'

export const SHAKES_NEEDED = 8
export const TAPS_NEEDED = 30

export type GateState = {
  stage: 'idle' | 'requesting' | 'shake' | 'tap' | 'calm' | 'rest' | 'done'
  count: number
  progress: number
  notice: string
}

export type GateAction =
  | { type: 'start' }
  | { type: 'permission'; granted: boolean }
  | { type: 'shake' | 'tap' }
  | { type: 'fallback'; notice: string }
  | { type: 'progress'; stage: 'calm' | 'rest'; value: number }

export const initialGateState: GateState = { stage: 'idle', count: 0, progress: 0, notice: '' }

export function gateReducer(state: GateState, action: GateAction): GateState {
  switch (action.type) {
    case 'start':
      return state.stage === 'idle' ? { ...state, stage: 'requesting' } : state
    case 'permission':
      if (state.stage !== 'requesting') return state
      return {
        ...state,
        stage: action.granted ? 'shake' : 'tap',
        notice: action.granted ? '' : '无法使用动作感应，请改用点击完成验证。',
      }
    case 'shake':
    case 'tap': {
      if (state.stage !== action.type) return state
      const count = state.count + 1
      const complete = count >= (action.type === 'shake' ? SHAKES_NEEDED : TAPS_NEEDED)
      return { ...state, count, stage: complete ? (action.type === 'shake' ? 'calm' : 'rest') : state.stage, notice: '' }
    }
    case 'fallback':
      if (state.stage === 'calm') return { ...state, stage: 'rest', progress: 0, notice: action.notice }
      if (state.stage === 'requesting' || state.stage === 'shake') {
        return { ...state, stage: 'tap', count: 0, notice: action.notice }
      }
      return state
    case 'progress': {
      if (state.stage !== action.stage || !Number.isFinite(action.value)) return state
      const progress = Math.min(1, Math.max(0, action.value))
      return {
        ...state,
        progress,
        stage: progress === 1 ? 'done' : state.stage,
        notice: progress < state.progress ? `刚才有移动或感应中断，请重新保持平稳 ${CALM_DURATION_MS / 1000} 秒。` : state.notice,
      }
    }
  }
}
