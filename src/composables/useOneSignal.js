const APP_ID     = '534c151d-5409-43cf-956e-55de3110cec2'
const SAFARI_ID  = 'web.onesignal.auto.081d2360-74df-41b0-afe2-959ef72fcc8c'

let initialised = false

export async function initOneSignal() {
  if (initialised || typeof window === 'undefined') return
  if (!window.OneSignalDeferred) window.OneSignalDeferred = []

  await new Promise((resolve) => {
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
        initialised = true
      } catch (e) {
        console.warn('[OneSignal] init failed', e)
      }
      resolve()
    })
  })
}

export async function requestOneSignalPermission() {
  try {
    const OneSignal = window.OneSignal
    if (!OneSignal) return false
    await OneSignal.Notifications.requestPermission()
    return OneSignal.Notifications.permission
  } catch {
    return false
  }
}

export async function tagZone(zone) {
  try {
    const OneSignal = window.OneSignal
    if (!OneSignal || !zone) return
    await OneSignal.User.addTag('zone', zone)
  } catch {}
}
