<script setup>
import { ref, onMounted } from 'vue'
import { Bell, MapPin, Home } from 'lucide-vue-next'
import { useI18n } from '../composables/useI18n.js'
import { requestOneSignalPermission } from '../composables/useOneSignal.js'

const emit = defineEmits(['location-granted'])
const { t } = useI18n()

// Steps: null = hidden, 'notification' | 'location' | 'install'
const step = ref(null)
const installPrompt = ref(null)
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
const isStandalone = window.matchMedia('(display-mode: standalone)').matches

// Sequence of steps to check
function nextStep(current) {
  if (current === 'notification') {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted'
        && !localStorage.getItem('muezzin_loc_granted')) {
      step.value = 'location'
    } else if (!isStandalone) {
      step.value = 'install'
    } else {
      step.value = null
    }
    return
  }
  if (current === 'location') {
    if (!isStandalone) {
      step.value = 'install'
    } else {
      step.value = null
    }
    return
  }
  step.value = null
}

onMounted(() => {
  // Capture install prompt before it auto-fires
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    installPrompt.value = e
  })

  // Determine first step to show
  if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
    step.value = 'notification'
  } else if (!localStorage.getItem('muezzin_loc_granted')) {
    step.value = 'location'
  } else if (!isStandalone) {
    step.value = 'install'
  }
})

// ── Actions ──────────────────────────────────────────────────────────────────

async function allowNotification() {
  await requestOneSignalPermission()
  nextStep('notification')
}

async function allowLocation() {
  try {
    await new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 })
    })
    localStorage.setItem('muezzin_loc_granted', 'true')
    emit('location-granted')
  } catch {}
  nextStep('location')
}

async function installApp() {
  if (installPrompt.value) {
    installPrompt.value.prompt()
    const { outcome } = await installPrompt.value.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem('muezzin_install_done', 'true')
    }
    installPrompt.value = null
  }
  step.value = null
}

function dismissInstall() {
  localStorage.setItem('muezzin_install_done', 'true')
  step.value = null
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

          <!-- ── Notification Permission ── -->
          <template v-if="step === 'notification'">
            <div class="w-16 h-16 rounded-xl bg-icon-bg border border-icon-bdr flex items-center justify-center">
              <Bell :size="30" class="text-gold" stroke-width="1.5" />
            </div>
            <div>
              <p class="text-[18px] font-bold text-fg">{{ t.notifPermTitle }}</p>
              <p class="text-sm text-muted mt-2 leading-relaxed">{{ t.notifPermDesc }}</p>
            </div>
            <div class="flex gap-3 w-full pt-1">
              <button class="flex-1 py-3.5 text-sm font-bold text-gold" @click="nextStep('notification')">
                {{ t.skip }}
              </button>
              <button class="flex-1 py-3.5 rounded-xl bg-gold text-nt text-sm font-bold" @click="allowNotification">
                {{ t.allow }}
              </button>
            </div>
          </template>

          <!-- ── Location Permission ── -->
          <template v-else-if="step === 'location'">
            <div class="w-16 h-16 rounded-xl bg-icon-bg border border-icon-bdr flex items-center justify-center">
              <MapPin :size="30" class="text-gold" stroke-width="1.5" />
            </div>
            <div>
              <p class="text-[18px] font-bold text-fg">{{ t.locationPermTitle }}</p>
              <p class="text-sm text-muted mt-2 leading-relaxed">{{ t.locationPermDesc }}</p>
            </div>
            <div class="flex gap-3 w-full pt-1">
              <button class="flex-1 py-3.5 text-sm font-bold text-gold" @click="nextStep('location')">
                {{ t.skip }}
              </button>
              <button class="flex-1 py-3.5 rounded-xl bg-gold text-nt text-sm font-bold" @click="allowLocation">
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
              <button class="flex-1 py-3.5 text-sm font-bold text-gold" @click="step = null">
                {{ t.later }}
              </button>
              <button class="flex-1 py-3.5 rounded-xl bg-gold text-nt text-sm font-bold"
                @click="isIOS ? dismissInstall() : (installPrompt ? installApp() : dismissInstall())">
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
