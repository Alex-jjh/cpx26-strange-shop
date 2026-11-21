// Device capabilities behind one interface. Business code calls these and never checks the platform.
// Native (Capacitor APK) uses plugins; the web uses browser APIs; anything unsupported is a silent no-op.

import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { LocalNotifications } from '@capacitor/local-notifications'

const native = Capacitor.isNativePlatform()

export async function vibrate(ms = 200): Promise<void> {
  try {
    if (native) await Haptics.impact({ style: ImpactStyle.Heavy })
    else navigator.vibrate?.(ms)
  } catch {
    /* unsupported: ignore */
  }
}

let notificationId = 1

export async function notify(title: string, body: string): Promise<void> {
  try {
    if (native) {
      const { display } = await LocalNotifications.requestPermissions()
      if (display !== 'granted') return
      await LocalNotifications.schedule({ notifications: [{ id: notificationId++, title, body }] })
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body })
    }
  } catch {
    /* unsupported: ignore */
  }
}

type MotionPermission = { requestPermission?: () => Promise<'granted' | 'denied'> }

/** iOS Safari needs an explicit grant from a user tap; everywhere else this resolves true. */
export async function requestMotionPermission(): Promise<boolean> {
  const dme = (window as unknown as { DeviceMotionEvent?: MotionPermission }).DeviceMotionEvent
  if (!dme) return false
  if (typeof dme.requestPermission !== 'function') return true
  try {
    return (await dme.requestPermission()) === 'granted'
  } catch {
    return false
  }
}

const SHAKE_THRESHOLD = 15 // m/s², change in acceleration between samples
const SHAKE_COOLDOWN_MS = 350

/** Calls onShake once per shake. Returns an unsubscribe function. */
export function onShake(onShake: () => void): () => void {
  let last: { x: number; y: number; z: number } | null = null
  let lastFired = 0
  const handler = (e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity
    if (!a || a.x === null || a.y === null || a.z === null) return
    const cur = { x: a.x, y: a.y, z: a.z }
    if (last) {
      const delta = Math.abs(cur.x - last.x) + Math.abs(cur.y - last.y) + Math.abs(cur.z - last.z)
      const now = Date.now()
      if (delta > SHAKE_THRESHOLD && now - lastFired > SHAKE_COOLDOWN_MS) {
        lastFired = now
        onShake()
      }
    }
    last = cur
  }
  window.addEventListener('devicemotion', handler)
  return () => window.removeEventListener('devicemotion', handler)
}
