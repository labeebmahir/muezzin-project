import { useSettings } from './useSettings.js'
import { getLocalDistrict } from './usePrayerData.js'

let activeAudio = null
let timeouts = []

export function useNotifications() {
  const { settings } = useSettings()

  async function requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  // Send scheduled prayers to the service worker (fires even when app is closed)
  async function scheduleViaSW(prayers, offsetMs) {
    if (!('serviceWorker' in navigator)) return false
    try {
      const reg = await navigator.serviceWorker.ready
      if (!reg.active) return false

      // Check if the browser supports TimestampTrigger (Chrome Android)
      const supportsTimestampTrigger = 'TimestampTrigger' in window

      const payload = prayers
        .filter((p) => p.hasIqama)
        .map((p) => ({
          key: p.key,
          name: p.name,
          hasIqama: p.hasIqama,
          fireAt: p.time.getTime() - offsetMs,
        }))

      reg.active.postMessage({
        type: 'SCHEDULE_NOTIFICATIONS',
        prayers: payload,
        offsetMs,
        silent: settings.reminderSound === 'silent',
      })

      return supportsTimestampTrigger // true = background scheduling available
    } catch {
      return false
    }
  }

  // setTimeout fallback — fires only while app/tab is open
  function scheduleViaTimeout(prayers, offsetMs) {
    timeouts.forEach((t) => clearTimeout(t))
    timeouts = []

    const now = Date.now()

    prayers.forEach((prayer) => {
      if (!prayer.hasIqama) return

      const fireAt = prayer.time.getTime() - offsetMs
      const delay = fireAt - now

      if (delay > 0 && delay < 86_400_000) {
        const t = setTimeout(() => {
          notify(prayer)
          if (settings.reminderSound === 'azan') playAdhan(prayer.key)
        }, delay)
        timeouts.push(t)
      }
    })
  }

  async function schedulePrayers(prayers) {
    if (!settings.notificationsEnabled) {
      // Clear any previously scheduled notifications
      timeouts.forEach((t) => clearTimeout(t))
      timeouts = []
      const reg = await navigator.serviceWorker?.ready.catch(() => null)
      reg?.active?.postMessage({ type: 'CLEAR_NOTIFICATIONS' })
      return
    }

    if (Notification.permission !== 'granted') return

    const offsetMs = (settings.reminderMinutes ?? 10) * 60_000

    // Try service worker background scheduling first
    const swBackground = await scheduleViaSW(prayers, offsetMs)

    // Always keep setTimeout as fallback (works when app is open)
    scheduleViaTimeout(prayers, offsetMs)

    if (!swBackground) {
      console.info('[Muezzin] Background notifications not supported on this browser. Notifications will only fire while the app is open.')
    }
  }

  function notify(prayer) {
    if (Notification.permission !== 'granted') return
    const mins = settings.reminderMinutes ?? 10
    const district = getLocalDistrict(settings.district, settings.language) || 'your area'
    new Notification(`${prayer.name} in ${mins} min`, {
      body: `${prayer.name} prayer is at ${prayer.timeStr} in ${district}.`,
      icon: '/icons/icon-192.png',
      tag: `prayer-${prayer.key}`,
      renotify: true,
      silent: settings.reminderSound === 'silent',
    })
  }

  function playAdhan(prayerKey) {
    if (activeAudio) {
      activeAudio.pause()
      activeAudio = null
    }
    const src = '/audio/adhan.mp3'
    const audio = new Audio(src)
    audio.play().catch(() => {})
    activeAudio = audio
  }

  function stopAdhan() {
    if (activeAudio) {
      activeAudio.pause()
      activeAudio.currentTime = 0
      activeAudio = null
    }
  }

  function previewSound(soundType) {
    stopAdhan()
    if (soundType === 'azan') playAdhan('dhuhr')
  }

  return { requestPermission, schedulePrayers, stopAdhan, previewSound }
}
