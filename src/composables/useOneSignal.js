const APP_ID     = '534c151d-5409-43cf-956e-55de3110cec2'
const SAFARI_ID  = 'web.onesignal.auto.081d2360-74df-41b0-afe2-959ef72fcc8c'

let initialised = false
let oneSignalInstance = null
let initPromise = null

export async function initOneSignal() {
  if (initialised || typeof window === 'undefined') return
  if (initPromise) return initPromise
  if (!window.OneSignalDeferred) window.OneSignalDeferred = []

  initPromise = new Promise((resolve) => {
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.init({
          appId:          APP_ID,
          safari_web_id:  SAFARI_ID,
          // Use a separate scope so it doesn't conflict with our Workbox SW
          serviceWorkerParam: { scope: '/push/onesignal/' },
          serviceWorkerPath:  '/push/onesignal/OneSignalSDKWorker.js',
          notifyButton: { enable: false }, // we handle permission in onboarding
          promptOptions: {
            slidedown: { prompts: [] }, // disable default prompts
          },
        })
        oneSignalInstance = OneSignal
        initialised = true
      } catch (e) {
        console.warn('[OneSignal] init failed', e)
      }
      resolve()
    })
  })

  return initPromise
}

export async function requestOneSignalPermission() {
  // On iOS the gesture context is lost after any async op, so request native first
  let granted = false
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const result = await Notification.requestPermission()
      granted = result === 'granted'
    } else {
      granted = Notification?.permission === 'granted'
    }
  } catch {}

  if (granted) {
    // Wait up to 4 s for OneSignal to finish initialising, then register subscription
    try {
      if (!initialised && initPromise) await Promise.race([initPromise, new Promise(r => setTimeout(r, 4000))])
      const os = oneSignalInstance ?? window.OneSignal
      if (os?.Notifications) {
        await os.Notifications.requestPermission().catch(() => {})
      }
    } catch {}
  }

  return granted
}

export async function tagZone(zone) {
  try {
    const OneSignal = window.OneSignal
    if (!OneSignal || !zone) return
    await OneSignal.User.addTag('zone', zone)
  } catch {}
}
