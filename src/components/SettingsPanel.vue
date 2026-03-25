<script setup>
import { ref, computed } from 'vue'
import {
  ChevronLeft, ChevronRight, Check,
  Languages, CaseSensitive, Moon, Bell, Volume2, MessageSquare,
  CalendarDays, Navigation, Search, X, MapPin,
} from 'lucide-vue-next'
import { useSettings } from '../composables/useSettings.js'
import { useI18n } from '../composables/useI18n.js'
import ZONES from '../data/zones.json'

const emit = defineEmits(['back', 'openLocation'])
const { settings } = useSettings()
const { t } = useI18n()

// ── Sub-view navigation ─────────────────────────────────────────────────────
const view   = ref('main') // 'main' | 'language' | 'textSize' | 'location' | 'reminder' | 'sound' | 'feedback'
const viewTx = ref('slide-forward')

function openView(v) { viewTx.value = 'slide-forward'; view.value = v }
function backToMain() { viewTx.value = 'slide-back';  view.value = 'main' }

// ── Options ─────────────────────────────────────────────────────────────────
const LANGUAGES  = [{ code: 'en', label: 'English' }, { code: 'ta', label: 'தமிழ்' }, { code: 'si', label: 'සිංහල' }]
const REMINDERS  = [5, 10, 15, 20, 30]

// ── Location sub-view ───────────────────────────────────────────────────────
const locationSearch = ref('')
const allDistricts = ZONES
  .flatMap(z => z.districts.map(d => ({ district: d, zone: z.zone })))
  .sort((a, b) => a.district.localeCompare(b.district))

const filteredDistricts = computed(() => {
  const q = locationSearch.value.toLowerCase().trim()
  return q ? allDistricts.filter(d => d.district.toLowerCase().includes(q)) : allDistricts
})

function selectDistrict(item) {
  settings.locationMode = 'manual'
  settings.zone = item.zone
  settings.district = item.district
  locationSearch.value = ''
}

function selectGPS() {
  settings.locationMode = 'auto'
}

// ── Labels ──────────────────────────────────────────────────────────────────
const langLabel  = computed(() => LANGUAGES.find(l => l.code === settings.language)?.label ?? 'English')
const sizeLabel  = computed(() => {
  const map = { large: t.value.textSizeLarge, normal: t.value.textSizeNormal, small: t.value.textSizeSmall }
  return map[settings.textSize ?? 'normal'] ?? t.value.textSizeNormal
})
const soundLabel = computed(() => {
  const map = { azan: t.value.soundAzan, default: t.value.soundDefault, silent: t.value.soundSilent }
  return map[settings.reminderSound] ?? t.value.soundAzan
})

// ── Feedback ────────────────────────────────────────────────────────────────
// Get your free access key at https://web3forms.com → enter labeebmahir@gmail.com
const WEB3FORMS_KEY = '9212d206-9827-4aef-a7fd-c5077ba63f7f'

const feedbackType    = ref('bug')
const feedbackText    = ref('')
const feedbackSuccess = ref(false)
const feedbackError   = ref(false)
const submitting      = ref(false)

async function submitFeedback() {
  if (!feedbackText.value.trim() || submitting.value) return

  submitting.value    = true
  feedbackError.value = false

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject:    `Muazzin Feedback – ${feedbackType.value.charAt(0).toUpperCase() + feedbackType.value.slice(1)}`,
        from_name:  'Muazzin App',
        message:    `Type: ${feedbackType.value.charAt(0).toUpperCase() + feedbackType.value.slice(1)}\n\n${feedbackText.value}`,
      }),
    })
    const data = await res.json()
    if (data.success) {
      feedbackText.value    = ''
      feedbackSuccess.value = true
      setTimeout(() => { feedbackSuccess.value = false; view.value = 'main' }, 2500)
    } else {
      feedbackError.value = true
    }
  } catch {
    feedbackError.value = true
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen overflow-x-hidden relative">
  <Transition :name="viewTx">

    <!-- ════════════════════ MAIN ════════════════════ -->
    <div v-if="view === 'main'" key="main" class="min-h-screen">
      <header class="flex items-center justify-center px-4 pt-4 pb-3 sticky top-0 bg-bg z-10">
        <button class="absolute left-4 p-1.5 rounded-lg text-muted hover:text-fg transition-colors" @click="emit('back')">
          <ChevronLeft :size="22" stroke-width="2.2" />
        </button>
        <h1 class="text-[17px] font-bold text-fg">{{ t.settingsTitle }}</h1>
      </header>

      <div class="flex flex-col px-4 pt-1 pb-12">

        <!-- GENERAL -->
        <p class="text-[11px] font-semibold uppercase tracking-widest text-muted px-1 pt-4 pb-2">{{ t.general }}</p>
        <div class="bg-card rounded-2xl border border-(--bdr) overflow-hidden flex flex-col divide-y divide-(--bdr)">

          <!-- Language -->
          <button class="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors" @click="openView('language')">
            <div class="w-9 h-9 rounded-xl bg-icon-bg border border-icon-bdr flex items-center justify-center text-gold shrink-0">
              <Languages :size="17" stroke-width="1.8" />
            </div>
            <div class="flex-1 text-left">
              <p class="text-[15px] font-semibold text-fg">{{ t.language }}</p>
              <p class="text-xs text-muted">{{ langLabel }}</p>
            </div>
            <ChevronRight :size="15" class="text-muted shrink-0" />
          </button>

          <!-- Dark Mode -->
          <div class="flex items-center gap-3 px-4 py-3.5">
            <div class="w-9 h-9 rounded-xl bg-icon-bg border border-icon-bdr flex items-center justify-center text-gold shrink-0">
              <Moon :size="17" stroke-width="1.8" />
            </div>
            <div class="flex-1">
              <p class="text-[15px] font-semibold text-fg">{{ t.darkMode }}</p>
              <p class="text-xs text-muted">{{ settings.darkMode ? t.on : t.off }}</p>
            </div>
            <button
              class="relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0"
              :class="settings.darkMode ? 'bg-gold' : 'bg-fg/20'"
              role="switch" :aria-checked="settings.darkMode"
              @click="settings.darkMode = !settings.darkMode"
            >
              <span class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200"
                :class="settings.darkMode ? 'translate-x-5' : 'translate-x-0'" />
            </button>
          </div>

          <!-- Text Size -->
          <button class="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors" @click="openView('textSize')">
            <div class="w-9 h-9 rounded-xl bg-icon-bg border border-icon-bdr flex items-center justify-center text-gold shrink-0">
              <CaseSensitive :size="17" stroke-width="1.8" />
            </div>
            <div class="flex-1 text-left">
              <p class="text-[15px] font-semibold text-fg">{{ t.textSize }}</p>
              <p class="text-xs text-muted">{{ sizeLabel }}</p>
            </div>
            <ChevronRight :size="15" class="text-muted shrink-0" />
          </button>

          <!-- Location -->
          <button class="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors" @click="openView('location')">
            <div class="w-9 h-9 rounded-xl bg-icon-bg border border-icon-bdr flex items-center justify-center text-gold shrink-0">
              <MapPin :size="17" stroke-width="1.8" />
            </div>
            <div class="flex-1 text-left">
              <p class="text-[15px] font-semibold text-fg">{{ t.location }}</p>
              <p class="text-xs text-muted">{{ settings.locationMode === 'auto' ? t.locationAuto : settings.district }}</p>
            </div>
            <ChevronRight :size="15" class="text-muted shrink-0" />
          </button>

          <!-- Date Adjustment -->
          <div class="flex items-center gap-3 px-4 py-3.5">
            <div class="w-9 h-9 rounded-xl bg-icon-bg border border-icon-bdr flex items-center justify-center text-gold shrink-0">
              <CalendarDays :size="17" stroke-width="1.8" />
            </div>
            <div class="flex-1">
              <p class="text-[15px] font-semibold text-fg">{{ t.dateAdjustment }}</p>
              <p class="text-xs text-muted">{{ t.shiftHijri }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button class="text-muted hover:text-fg transition-colors p-0.5"
                @click="settings.dateAdjustment = Math.max(-5, settings.dateAdjustment - 1)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </button>
              <span class="text-sm font-bold text-fg w-6 text-center">
                {{ settings.dateAdjustment > 0 ? '+' + settings.dateAdjustment : settings.dateAdjustment }}
              </span>
              <button class="text-muted hover:text-fg transition-colors p-0.5"
                @click="settings.dateAdjustment = Math.min(5, settings.dateAdjustment + 1)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- NOTIFICATION -->
        <p class="text-[11px] font-semibold uppercase tracking-widest text-muted px-1 pt-5 pb-2">{{ t.notification }}</p>
        <div class="bg-card rounded-2xl border border-(--bdr) overflow-hidden flex flex-col divide-y divide-(--bdr)">

          <!-- Prayer Reminder -->
          <button class="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors" @click="openView('reminder')">
            <div class="w-9 h-9 rounded-xl bg-icon-bg border border-icon-bdr flex items-center justify-center text-gold shrink-0">
              <Bell :size="17" stroke-width="1.8" />
            </div>
            <div class="flex-1 text-left">
              <p class="text-[15px] font-semibold text-fg">{{ t.prayerReminder }}</p>
              <p class="text-xs text-muted">{{ settings.reminderMinutes }} {{ t.minutesBefore }}</p>
            </div>
            <ChevronRight :size="15" class="text-muted shrink-0" />
          </button>

          <!-- Reminder Sound -->
          <button class="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors" @click="openView('sound')">
            <div class="w-9 h-9 rounded-xl bg-icon-bg border border-icon-bdr flex items-center justify-center text-gold shrink-0">
              <Volume2 :size="17" stroke-width="1.8" />
            </div>
            <div class="flex-1 text-left">
              <p class="text-[15px] font-semibold text-fg">{{ t.reminderSound }}</p>
              <p class="text-xs text-muted">{{ soundLabel }}</p>
            </div>
            <ChevronRight :size="15" class="text-muted shrink-0" />
          </button>
        </div>

        <!-- OTHER -->
        <p class="text-[11px] font-semibold uppercase tracking-widest text-muted px-1 pt-5 pb-2">{{ t.other }}</p>
        <div class="bg-card rounded-2xl border border-(--bdr) overflow-hidden flex flex-col divide-y divide-(--bdr)">

          <!-- Feedback -->
          <button class="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors" @click="openView('feedback')">
            <div class="w-9 h-9 rounded-xl bg-icon-bg border border-icon-bdr flex items-center justify-center text-gold shrink-0">
              <MessageSquare :size="17" stroke-width="1.8" />
            </div>
            <div class="flex-1 text-left">
              <p class="text-[15px] font-semibold text-fg">{{ t.feedback }}</p>
            </div>
            <ChevronRight :size="15" class="text-muted shrink-0" />
          </button>
        </div>

        <!-- Footer -->
        <div class="flex flex-col items-center gap-3 pt-8 pb-2">
          <!-- Horizontal logo -->
          <div class="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 160 162" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M55.9448 27.5066C65.4171 14.2636 83.0246 5.60278 100.811 5.60278C114.687 5.60278 127.994 10.986 137.806 20.5683C147.618 30.1506 153.131 43.1472 153.133 56.6996C153.133 83.6964 131.694 105.921 104.547 107.796" stroke="#C6AA57" stroke-width="11.2054" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17.5102 107.415C7.34312 95.0442 5.60254 82.6136 20.1547 67.5311C35.4389 53.8978 44.2389 47.451 46.5846 43.5664C48.9303 47.451 57.8722 53.8978 73.1564 67.5311C87.0063 79.887 86.1398 95.0367 75.9727 107.415M17.5102 107.415H13.6032M17.5102 107.415H75.9727M75.9727 107.415H79.4091M13.6032 107.415H5.60254M13.6032 107.415V148.83C13.902 153.82 13.6032 156.151 22.6498 155.494H46.4427M79.4091 107.415H87.6189M79.4091 107.415L79.4016 149.592C80.2756 156.368 74.8821 155.18 71.4308 155.494H46.4352L46.6966 139.552" stroke="#C6AA57" stroke-width="11.2054" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M98.9736 43.5664V62.2496L110.187 69.7199" stroke="#C6AA57" stroke-width="11.2054" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p class="text-[18px] font-bold text-fg">Muezzin</p>
          </div>
          <p class="text-xs text-muted">{{ t.version }} 1.0.0</p>
          <p class="text-[11px] text-muted text-center px-8 leading-relaxed">
            {{ t.disclaimer }}
          </p>
        </div>
      </div>
    </div>

    <!-- ════════════════════ LANGUAGE ════════════════════ -->
    <div v-else-if="view === 'language'" key="language" class="min-h-screen">
      <header class="flex items-center justify-center px-4 pt-4 pb-3 sticky top-0 bg-bg z-10">
        <button class="absolute left-4 p-1.5 rounded-lg text-muted hover:text-fg transition-colors" @click="backToMain">
          <ChevronLeft :size="22" stroke-width="2.2" />
        </button>
        <h1 class="text-[17px] font-bold text-fg">{{ t.language }}</h1>
      </header>
      <div class="flex flex-col gap-2.5 px-4 pt-2">
        <button
          v-for="lang in LANGUAGES" :key="lang.code"
          class="flex items-center justify-between px-4 py-4 rounded-2xl border transition-colors"
          :class="settings.language === lang.code
            ? 'bg-next border-transparent text-nt'
            : 'bg-card border-(--bdr) text-fg hover:bg-white/5'"
          @click="settings.language = lang.code"
        >
          <span class="text-[16px] font-semibold">{{ lang.label }}</span>
          <Check v-if="settings.language === lang.code" :size="18" stroke-width="2.5" />
        </button>
      </div>
    </div>

    <!-- ════════════════════ TEXT SIZE ════════════════════ -->
    <div v-else-if="view === 'textSize'" key="textSize" class="min-h-screen">
      <header class="flex items-center justify-center px-4 pt-4 pb-3 sticky top-0 bg-bg z-10">
        <button class="absolute left-4 p-1.5 rounded-lg text-muted hover:text-fg transition-colors" @click="backToMain">
          <ChevronLeft :size="22" stroke-width="2.2" />
        </button>
        <h1 class="text-[17px] font-bold text-fg">{{ t.textSize }}</h1>
      </header>
      <div class="flex flex-col gap-2.5 px-4 pt-2">
        <button
          v-for="opt in [{value:'large',label:t.textSizeLarge},{value:'normal',label:t.textSizeNormal},{value:'small',label:t.textSizeSmall}]" :key="opt.value"
          class="flex items-center justify-between px-4 py-4 rounded-2xl border transition-colors"
          :class="(settings.textSize ?? 'normal') === opt.value
            ? 'bg-next border-transparent text-nt'
            : 'bg-card border-(--bdr) text-fg hover:bg-white/5'"
          @click="settings.textSize = opt.value"
        >
          <span class="text-[16px] font-semibold">{{ opt.label }}</span>
          <Check v-if="(settings.textSize ?? 'normal') === opt.value" :size="18" stroke-width="2.5" />
        </button>
      </div>
    </div>

    <!-- ════════════════════ LOCATION ════════════════════ -->
    <div v-else-if="view === 'location'" key="location" class="min-h-screen">
      <header class="flex items-center justify-center px-4 pt-4 pb-3 sticky top-0 bg-bg z-10">
        <button class="absolute left-4 p-1.5 rounded-lg text-muted hover:text-fg transition-colors" @click="backToMain">
          <ChevronLeft :size="22" stroke-width="2.2" />
        </button>
        <h1 class="text-[17px] font-bold text-fg">{{ t.location }}</h1>
      </header>

      <div class="flex flex-col gap-2 px-4 pt-1 pb-10">
        <div class="relative">
          <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            v-model="locationSearch"
            type="search"
            v-bind:placeholder="t.searchLocation"
            class="w-full bg-card border border-(--bdr) rounded-2xl pl-11 pr-10 py-3.5 text-[15px] text-fg placeholder:text-muted outline-none focus:border-gold transition-colors"
          />
          <button v-if="locationSearch" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
            @click="locationSearch = ''">
            <X :size="16" />
          </button>
        </div>
        <button
          v-if="!locationSearch"
          class="flex items-center gap-3 px-4 py-4 rounded-2xl transition-colors text-left"
          :class="settings.locationMode === 'auto' ? 'bg-gold' : 'bg-card border border-(--bdr) hover:bg-white/5'"
          @click="selectGPS"
        >
          <Navigation :size="18" stroke-width="1.8"
            :class="settings.locationMode === 'auto' ? 'text-nt' : 'text-muted'" />
          <span class="flex-1 text-[15px] font-semibold"
            :class="settings.locationMode === 'auto' ? 'text-nt' : 'text-fg'">Auto</span>
          <span v-if="settings.locationMode === 'auto'"
            class="w-7 h-7 rounded-full bg-card flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
              stroke-linecap="round" stroke-linejoin="round" class="text-gold">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
        </button>
        <button
          v-for="item in filteredDistricts" :key="item.district"
          class="flex items-center justify-between px-4 py-4 rounded-2xl transition-colors text-left"
          :class="settings.locationMode === 'manual' && settings.district === item.district
            ? 'bg-gold' : 'bg-card border border-(--bdr) hover:bg-white/5'"
          @click="selectDistrict(item)"
        >
          <span class="text-[15px] font-semibold"
            :class="settings.locationMode === 'manual' && settings.district === item.district
              ? 'text-nt' : 'text-fg'">{{ item.district }}</span>
          <span v-if="settings.locationMode === 'manual' && settings.district === item.district"
            class="w-7 h-7 rounded-full bg-card flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
              stroke-linecap="round" stroke-linejoin="round" class="text-gold">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
        </button>
      </div>
    </div>

    <!-- ════════════════════ PRAYER REMINDER ════════════════════ -->
    <div v-else-if="view === 'reminder'" key="reminder" class="min-h-screen">
      <header class="flex items-center justify-center px-4 pt-4 pb-3 sticky top-0 bg-bg z-10">
        <button class="absolute left-4 p-1.5 rounded-lg text-muted hover:text-fg transition-colors" @click="backToMain">
          <ChevronLeft :size="22" stroke-width="2.2" />
        </button>
        <h1 class="text-[17px] font-bold text-fg">{{ t.prayerReminder }}</h1>
      </header>
      <div class="flex flex-col gap-2.5 px-4 pt-2">
        <button
          v-for="m in REMINDERS" :key="m"
          class="flex items-center justify-between px-4 py-4 rounded-2xl border transition-colors"
          :class="settings.reminderMinutes === m
            ? 'bg-next border-transparent text-nt'
            : 'bg-card border-(--bdr) text-fg hover:bg-white/5'"
          @click="settings.reminderMinutes = m"
        >
          <span class="text-[16px] font-semibold">{{ m }} minutes before</span>
          <Check v-if="settings.reminderMinutes === m" :size="18" stroke-width="2.5" />
        </button>
      </div>
    </div>

    <!-- ════════════════════ REMINDER SOUND ════════════════════ -->
    <div v-else-if="view === 'sound'" key="sound" class="min-h-screen">
      <header class="flex items-center justify-center px-4 pt-4 pb-3 sticky top-0 bg-bg z-10">
        <button class="absolute left-4 p-1.5 rounded-lg text-muted hover:text-fg transition-colors" @click="backToMain">
          <ChevronLeft :size="22" stroke-width="2.2" />
        </button>
        <h1 class="text-[17px] font-bold text-fg">{{ t.reminderSound }}</h1>
      </header>
      <div class="flex flex-col gap-2.5 px-4 pt-2">
        <button
          v-for="opt in [{value:'azan',label:t.soundAzan},{value:'default',label:t.soundDefault},{value:'silent',label:t.soundSilent}]" :key="opt.value"
          class="flex items-center justify-between px-4 py-4 rounded-2xl border transition-colors"
          :class="settings.reminderSound === opt.value
            ? 'bg-next border-transparent text-nt'
            : 'bg-card border-(--bdr) text-fg hover:bg-white/5'"
          @click="settings.reminderSound = opt.value"
        >
          <span class="text-[16px] font-semibold">{{ opt.label }}</span>
          <Check v-if="settings.reminderSound === opt.value" :size="18" stroke-width="2.5" />
        </button>
      </div>
    </div>

    <!-- ════════════════════ FEEDBACK ════════════════════ -->
    <div v-else-if="view === 'feedback'" key="feedback" class="min-h-screen">
      <header class="flex items-center justify-center px-4 pt-4 pb-3 sticky top-0 bg-bg z-10">
        <button class="absolute left-4 p-1.5 rounded-lg text-muted hover:text-fg transition-colors" @click="backToMain">
          <ChevronLeft :size="22" stroke-width="2.2" />
        </button>
        <h1 class="text-[17px] font-bold text-fg">{{ t.feedback }}</h1>
      </header>

      <Transition name="fade-up">
        <div v-if="feedbackSuccess"
          class="fixed inset-x-0 bottom-8 mx-auto w-fit z-50 px-6 py-3.5 rounded-2xl bg-next text-nt flex items-center gap-2.5 shadow-xl"
          style="max-width: 320px">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
          </svg>
          <span class="text-[14px] font-semibold">{{ t.feedbackSuccess }}</span>
        </div>
      </Transition>

      <div class="flex flex-col px-4 pt-4 gap-5">
        <div>
          <p class="text-[17px] font-bold text-gold tracking-wide">{{ t.letUsKnow }}</p>
          <p class="text-[13px] text-muted leading-relaxed mt-1">{{ t.feedbackDesc }}</p>
        </div>
        <div class="relative">
          <select
            v-model="feedbackType"
            class="w-full appearance-none bg-card border border-(--bdr) rounded-xl px-4 py-3 text-[14px] text-fg outline-none focus:border-gold transition-colors cursor-pointer pr-10"
          >
            <option value="bug">{{ t.feedbackBug }}</option>
            <option value="suggestion">{{ t.feedbackSuggestion }}</option>
            <option value="other">{{ t.feedbackOther }}</option>
          </select>
          <svg class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <textarea
          v-model="feedbackText"
          rows="6"
          v-bind:placeholder="t.feedbackPlaceholder"
          class="w-full bg-card border border-(--bdr) rounded-2xl px-4 py-3 text-[14px] text-fg placeholder:text-muted outline-none focus:border-gold transition-colors resize-none"
        />
        <button
          class="w-full py-3.5 rounded-2xl font-bold text-[15px] bg-next text-nt transition-opacity"
          :class="!feedbackText.trim() || submitting ? 'opacity-50 cursor-not-allowed' : 'opacity-100'"
          :disabled="!feedbackText.trim() || submitting"
          @click="submitFeedback"
        >
          {{ t.feedbackSubmit }}
        </button>
      </div>
    </div>

  </Transition>
  </div>
</template>

<style scoped>
/* Sub-view slide transitions */
.slide-forward-enter-active,
.slide-forward-leave-active,
.slide-back-enter-active,
.slide-back-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
              opacity   0.28s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
  top: 0; left: 0;
}
.slide-forward-enter-from  { transform: translateX(100%); opacity: 0; }
.slide-forward-enter-to    { transform: translateX(0);    opacity: 1; }
.slide-forward-leave-from  { transform: translateX(0);    opacity: 1; }
.slide-forward-leave-to    { transform: translateX(-30%); opacity: 0; }

.slide-back-enter-from  { transform: translateX(-30%); opacity: 0; }
.slide-back-enter-to    { transform: translateX(0);    opacity: 1; }
.slide-back-leave-from  { transform: translateX(0);    opacity: 1; }
.slide-back-leave-to    { transform: translateX(100%); opacity: 0; }

/* Toast */
.fade-up-enter-active, .fade-up-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-up-enter-from, .fade-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
