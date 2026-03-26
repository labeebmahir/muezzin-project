<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Share2 } from 'lucide-vue-next'
import AppHeader from './components/AppHeader.vue'
import HeroCard from './components/HeroCard.vue'
import PrayerItem from './components/PrayerItem.vue'
import CalendarView from './components/CalendarView.vue'
import LocationPage from './components/LocationPage.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import OnboardingSheet from './components/OnboardingSheet.vue'
import { useLocation } from './composables/useLocation.js'
import { initOneSignal, tagZone } from './composables/useOneSignal.js'
import { usePrayerTimes } from './composables/usePrayerTimes.js'
import { useNotifications } from './composables/useNotifications.js'
import { usePrayerData } from './composables/usePrayerData.js'
import { useSettings } from './composables/useSettings.js'
import { shareAsImage } from './composables/useShareImage.js'

const subView = ref('home') // 'home' | 'calendar' | 'settings' | 'location'
const pageTx  = ref('slide-forward')

function goTo(view) { pageTx.value = 'slide-forward'; subView.value = view }
function goBack()   { pageTx.value = 'slide-back';    subView.value = 'home' }

// ── Core composables ───────────────────────────────────────────────────────

const { city, coords, detectedZone, detectedDistrict, getLocation } = useLocation()
const { getTodayEntry } = usePrayerData()
const { prayers, nextPrayerIndex, nextPrayerName, nextPrayerKey, countdown, start: startTimer, stop: stopTimer } = usePrayerTimes(coords, getTodayEntry)
const { schedulePrayers } = useNotifications()
const { settings } = useSettings()

// ── Dates ──────────────────────────────────────────────────────────────────

const hijriDate    = ref('')
const gregorianDate = ref('')

const LOCALE_MAP = { en: 'en-US', ta: 'ta-LK', si: 'si-LK' }

function updateDates() {
  const now      = new Date()
  const adjusted = new Date(now)
  adjusted.setDate(adjusted.getDate() + (settings.dateAdjustment ?? 0))
  const locale = LOCALE_MAP[settings.language] ?? 'en-US'
  gregorianDate.value = now.toLocaleDateString(locale, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  try {
    hijriDate.value = adjusted.toLocaleDateString(`${locale.split('-')[0]}-u-ca-islamic-umalqura`, {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch {
    try {
      hijriDate.value = adjusted.toLocaleDateString(`${locale.split('-')[0]}-u-ca-islamic`, {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    } catch {
      hijriDate.value = ''
    }
  }
}

const countdownStr = computed(() => {
  const { h, m, s } = countdown.value
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}h ${mm}m ${ss}s` : `${mm}m ${ss}s`
})

// ── Share ──────────────────────────────────────────────────────────────────

async function share() {
  await shareAsImage({
    prayers:         prayers.value,
    hijriDate:       hijriDate.value,
    gregorianDate:   gregorianDate.value,
    city:            settings.district || city.value,
    nextPrayerIndex: nextPrayerIndex.value,
    language:        settings.language,
  })
}

// ── Watchers ───────────────────────────────────────────────────────────────

watch(prayers, (val) => { if (val.length) schedulePrayers(val) }, { deep: true })
watch(() => settings.dateAdjustment, updateDates)
watch(() => settings.language, updateDates)

// ── Theme ──────────────────────────────────────────────────────────────────

function applyTheme() {
  document.documentElement.classList.toggle('light', !settings.darkMode)
}

function applyTextSize() {
  document.getElementById('app')?.setAttribute('data-text-size', settings.textSize ?? 'normal')
}

watch(() => settings.darkMode, applyTheme)
watch(() => settings.textSize, applyTextSize)

// ── Lifecycle ──────────────────────────────────────────────────────────────

// Tag zone in OneSignal whenever it changes (so server knows who to notify)
watch(() => settings.zone, (zone) => tagZone(zone), { immediate: false })

onMounted(async () => {
  applyTheme()
  applyTextSize()
  updateDates()
  await getLocation()
  if (settings.locationMode === 'auto' && detectedZone.value) {
    settings.zone = detectedZone.value
    settings.district = detectedDistrict.value
  }
  startTimer()
  // Init OneSignal after app is ready
  await initOneSignal()
  tagZone(settings.zone)
})

onUnmounted(() => stopTimer())

// ── Swipe-back gesture ─────────────────────────────────────────────────────

let touchStartX = 0
let touchStartY = 0

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function onTouchEnd(e) {
  if (subView.value === 'home') return
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = Math.abs(e.changedTouches[0].clientY - touchStartY)
  // Right swipe: horizontal ≥ 60px, more horizontal than vertical
  if (dx >= 60 && dy < dx * 0.8) goBack()
}
</script>

<template>
  <!-- Onboarding -->
  <OnboardingSheet />

  <div class="relative overflow-x-hidden min-h-screen"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
  <Transition :name="pageTx">
    <!-- Calendar view -->
    <CalendarView
      v-if="subView === 'calendar'"
      key="calendar"
      :coords="coords"
      @back="goBack"
    />

    <!-- Location view -->
    <LocationPage
      v-else-if="subView === 'location'"
      key="location"
      @back="goBack"
    />

    <!-- Settings view -->
    <SettingsPanel
      v-else-if="subView === 'settings'"
      key="settings"
      @back="goBack"
      @open-location="goTo('location')"
    />

    <!-- Home -->
    <div v-else key="home" class="pb-8 flex flex-col gap-6" style="padding-top: calc(env(safe-area-inset-top) + 4rem)">
      <AppHeader
        :city="settings.district || city"
        @open-calendar="goTo('calendar')"
        @open-settings="goTo('settings')"
        @open-location="goTo('location')"
      />

      <HeroCard :next-prayer="nextPrayerName" :countdown="countdownStr" :next-prayer-key="nextPrayerKey" />

      <!-- Date row -->
      <div class="flex items-center justify-between px-4">
        <div>
          <p class="text-sm font-semibold text-gold mb-0.5">{{ hijriDate }}</p>
          <p class="text-[13px] text-muted">{{ gregorianDate }}</p>
        </div>
        
        <button
          @click="share"
          aria-label="Share prayer times"
          class="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-white/10 transition-colors"
        >
          <Share2 :size="22" stroke-width="1.5" />
        </button>
      </div>

      <!-- Prayer list -->
      <div class="flex flex-col gap-2 px-4">
        <PrayerItem
          v-for="(prayer, i) in prayers"
          :key="prayer.key"
          :prayer="prayer"
          :is-next="i === nextPrayerIndex"
          :is-past="nextPrayerIndex === -1 || (nextPrayerIndex >= 0 && i < nextPrayerIndex)"
        />
      </div>
    </div>
  </Transition>
  </div>
</template>

<style>
/* ── App-level page transitions ─────────────────────────────── */
.slide-forward-enter-active,
.slide-forward-leave-active,
.slide-back-enter-active,
.slide-back-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity   0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
  top: 0; left: 0;
}

/* Forward: new slides in from right, old exits to left */
.slide-forward-enter-from  { transform: translateX(100%); opacity: 0; }
.slide-forward-enter-to    { transform: translateX(0);    opacity: 1; }
.slide-forward-leave-from  { transform: translateX(0);    opacity: 1; }
.slide-forward-leave-to    { transform: translateX(-30%); opacity: 0; }

/* Back: new slides in from left, old exits to right */
.slide-back-enter-from  { transform: translateX(-30%); opacity: 0; }
.slide-back-enter-to    { transform: translateX(0);    opacity: 1; }
.slide-back-leave-from  { transform: translateX(0);    opacity: 1; }
.slide-back-leave-to    { transform: translateX(100%); opacity: 0; }
</style>
