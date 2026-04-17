import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

// OneSignal must be imported before any Workbox code runs
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js')

self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// ── Notification click: open/focus the app ───────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if ('focus' in client) return client.focus()
        }
        return self.clients.openWindow('/')
      })
  )
})

// ── Message: schedule notifications from app ─────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleAll(event.data.prayers, event.data.offsetMs, event.data.silent)
  }
  if (event.data?.type === 'CLEAR_NOTIFICATIONS') {
    clearScheduled()
  }
})

async function clearScheduled() {
  const notifications = await self.registration.getNotifications()
  notifications.forEach((n) => n.close())
}

async function scheduleAll(prayers, offsetMs, silent) {
  // Clear any previously scheduled prayer notifications
  await clearScheduled()

  const supportsTimestampTrigger = 'TimestampTrigger' in self

  for (const prayer of prayers) {
    if (!prayer.hasIqama) continue // skip Sunrise

    const fireAt = prayer.fireAt // epoch ms (already offset applied)
    if (fireAt <= Date.now()) continue

    const options = {
      body: `${prayer.name} prayer time`,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: `prayer-${prayer.key}`,
      renotify: true,
      silent: silent,
      data: { prayerKey: prayer.key },
    }

    if (supportsTimestampTrigger) {
      // Schedule natively — fires even when app is closed
      options.showTrigger = new TimestampTrigger(fireAt)
      await self.registration.showNotification(`🕌 ${prayer.name}`, options)
    }
    // setTimeout fallback is handled in the main thread (useNotifications.js)
  }
}
