// Device capabilities behind one interface. Business code calls these and never checks the platform.
// Native (Capacitor APK) uses plugins; the web uses browser APIs; anything unsupported is a silent no-op.

import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { LocalNotifications } from '@capacitor/local-notifications'

export { onShake, onStillness, onVisibleRest, requestMotionPermission, CALM_DURATION_MS } from './motion'

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
