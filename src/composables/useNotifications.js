import { useSettings } from './useSettings.js'

let activeAudio = null
let timeouts = []

export function useNotifications() {
  const { settings } = useSettings()

  async function requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  function schedulePrayers(prayers) {
    timeouts.forEach((t) => clearTimeout(t))
    timeouts = []

    if (!settings.notificationsEnabled) return

    const now = Date.now()
    const offsetMs = (settings.reminderMinutes ?? 10) * 60_000

    prayers.forEach((prayer) => {
      if (!prayer.hasIqama) return // skip Sunrise

      const fireAt = prayer.time.getTime() - offsetMs
      const delay  = fireAt - now

      if (delay > 0 && delay < 86_400_000) {
        const t = setTimeout(() => {
          notify(prayer)
          if (settings.reminderSound === 'azan') {
            playAdhan(prayer.key)
          }
          // 'default' → notification plays system sound (silent: false)
          // 'silent'  → notification is silent (already handled in notify())
        }, delay)
        timeouts.push(t)
      }
    })
  }

  function notify(prayer) {
    if (Notification.permission !== 'granted') return
    const isSilent = settings.reminderSound === 'silent'
    new Notification(`Time for ${prayer.name}`, {
      body: prayer.iqamaStr ? `Iqama at ${prayer.iqamaStr}` : '',
      icon: '/icons/icon-192.png',
      tag: prayer.key,
      renotify: true,
      silent: isSilent,
    })
  }

  function playAdhan(prayerKey) {
    if (activeAudio) {
      activeAudio.pause()
      activeAudio = null
    }
    const src = prayerKey === 'fajr' ? '/audio/adhan-fajr.mp3' : '/audio/adhan.mp3'
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

  return { requestPermission, schedulePrayers, stopAdhan }
}
