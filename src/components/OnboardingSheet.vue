<script setup>
import { ref, onMounted } from 'vue'
import { Home, MapPin, Bell } from 'lucide-vue-next'
import { useI18n } from '../composables/useI18n.js'
import { installPromptEvent } from '../composables/useInstallPrompt.js'
import { requestOneSignalPermission } from '../composables/useOneSignal.js'
import { useSettings } from '../composables/useSettings.js'

const emit = defineEmits(['location-granted'])
const { t } = useI18n()
const { settings } = useSettings()

const step = ref(null)
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
const geoPermState = ref('prompt')

const locationDone = !!localStorage.getItem('muezzin_location_done')

onMounted(async () => {

  const geoPerm = await navigator.permissions?.query({ name: 'geolocation' }).catch(() => null)
  if (geoPerm) {
    geoPermState.value = geoPerm.state
    geoPerm.onchange = () => { geoPermState.value = geoPerm.state }
  }

  const needsInstall = !isStandalone
  const needsLocation = !locationDone && (geoPermState.value === 'prompt' || !geoPerm)
  const needsNotif = typeof Notification !== 'undefined' && Notification.permission !== 'granted'

  if (needsInstall) {
    step.value = 'install'
  } else if (needsLocation) {
    step.value = 'location'
  } else if (needsNotif) {
    step.value = 'notification'
  }
})

// ── Actions ──────────────────────────────────────────────────────────────────

function notifNeeded() {
  return typeof Notification !== 'undefined' && Notification.permission !== 'granted'
}

function nextAfterLocation() {
  step.value = notifNeeded() ? 'notification' : null
}

function afterInstall() {
  const needsLocation = !locationDone && (geoPermState.value === 'prompt' || !navigator.permissions)
  if (needsLocation) { step.value = 'location'; return }
  nextAfterLocation()
}

async function installApp() {
  if (installPromptEvent.value) {
    installPromptEvent.value.prompt()
    const { outcome } = await installPromptEvent.value.userChoice
    installPromptEvent.value = null
    if (outcome === 'accepted') { step.value = null; return }
  }
  afterInstall()
}

function skipLocation() {
  localStorage.setItem('muezzin_location_done', 'true')
  nextAfterLocation()
}

function allowLocation() {
  skipLocation()
  navigator.geolocation.getCurrentPosition(
    () => { geoPermState.value = 'granted'; emit('location-granted') },
    async () => {
      const perm = await navigator.permissions?.query({ name: 'geolocation' }).catch(() => null)
      if (perm) geoPermState.value = perm.state
    },
    { timeout: 10000 }
  )
}

async function allowNotification() {
  step.value = null
  const granted = await requestOneSignalPermission()
  if (granted) settings.notificationsEnabled = true
}
</script>

<template>
  <Transition name="fade">
    <div v-if="step" class="fixed inset-0 z-50 flex items-end justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <!-- Sheet -->
      <Transition name="slide-up" appear>
        <div class="relative w-full max-w-120 bg-card rounded-t-3xl px-6 pt-8 pb-10 flex flex-col items-center gap-5 text-center">

          <!-- ── Location Permission ── -->
          <template v-if="step === 'location'">
            <div class="w-16 h-16 rounded-xl bg-icon-bg border border-icon-bdr flex items-center justify-center">
              <MapPin :size="30" class="text-gold" stroke-width="1.5" />
            </div>
            <div>
              <p class="text-[18px] font-bold text-fg">{{ t.locationPermTitle }}</p>
              <p class="text-sm text-muted mt-2 leading-relaxed">{{ t.locationPermDesc }}</p>
            </div>
            <div class="flex gap-3 w-full pt-1">
              <button class="flex-1 py-3.5 text-sm font-bold text-gold" @click="skipLocation">
                {{ t.skip }}
              </button>
              <button class="flex-1 py-3.5 rounded-xl bg-gold text-nt text-sm font-bold" @click="allowLocation">
                {{ t.allow }}
              </button>
            </div>
          </template>

          <!-- ── Notification Permission ── -->
          <template v-else-if="step === 'notification'">
            <div class="w-16 h-16 rounded-xl bg-icon-bg border border-icon-bdr flex items-center justify-center">
              <Bell :size="30" class="text-gold" stroke-width="1.5" />
            </div>
            <div>
              <p class="text-[18px] font-bold text-fg">{{ t.notifPermTitle }}</p>
              <p class="text-sm text-muted mt-2 leading-relaxed">{{ t.notifPermDesc }}</p>
            </div>
            <div class="flex gap-3 w-full pt-1">
              <button class="flex-1 py-3.5 text-sm font-bold text-gold" @click="step = null">
                {{ t.skip }}
              </button>
              <button class="flex-1 py-3.5 rounded-xl bg-gold text-nt text-sm font-bold" @click="allowNotification">
                {{ t.allow }}
              </button>
            </div>
          </template>

          <!-- ── Add to Home Screen ── -->
          <template v-else-if="step === 'install'">
            <!-- Icon: house + phone -->
            <div class="w-16 h-16 rounded-xl bg-icon-bg border border-icon-bdr flex items-center justify-center">
              <Home :size="30" stroke-width="1.5" class="text-gold" />
            </div>
            <div>
              <p class="text-[18px] font-bold text-fg">{{ t.installTitle }}</p>
              <p class="text-sm text-muted mt-2 leading-relaxed">
                {{ t.installDesc }}
                <template v-if="isIOS">
                  <br/><span class="mt-1 block">{{ t.installDescIOS }}</span>
                </template>
              </p>
            </div>
            <div class="flex gap-3 w-full pt-1">
              <button class="flex-1 py-3.5 text-sm font-bold text-gold" @click="afterInstall">
                {{ t.later }}
              </button>
              <button class="flex-1 py-3.5 rounded-xl bg-gold text-nt text-sm font-bold"
                @click="isIOS ? afterInstall() : (installPromptEvent ? installApp() : afterInstall())">
                {{ isIOS ? t.done : t.add }}
              </button>
            </div>
          </template>

        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
</style>
