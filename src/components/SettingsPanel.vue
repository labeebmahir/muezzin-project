<script setup>
import { ref, computed } from 'vue'
import {
  ChevronRight, MinusCircle, PlusCircle, CheckCircle2,
  Languages, Type, Moon, BellRing, ClockPlus, MessageSquareText,
  MoonStar, MapPin, ChevronDown,
} from 'lucide-vue-next'
import PageHeader from './PageHeader.vue'
import SettingsRow from './SettingsRow.vue'
import SelectOption from './SelectOption.vue'
import { useSettings } from '../composables/useSettings.js'
import { useI18n } from '../composables/useI18n.js'
import { useNotifications } from '../composables/useNotifications.js'
import { getLocalDistrict } from '../composables/usePrayerData.js'

const emit = defineEmits(['back', 'open-location'])
const { settings } = useSettings()
const { t } = useI18n()
const { previewSound } = useNotifications()

// ── Notification permission + test ───────────────────────────────────────────
const notifPermission = ref(typeof Notification !== 'undefined' ? Notification.permission : 'denied')

async function requestNotifPermission() {
  if (typeof Notification === 'undefined') return
  const result = await Notification.requestPermission()
  notifPermission.value = result
  if (result === 'granted') settings.notificationsEnabled = true
}


function toggleNotifications() {
  if (!settings.notificationsEnabled && Notification.permission !== 'granted') {
    requestNotifPermission()
  }
  settings.notificationsEnabled = !settings.notificationsEnabled
}

// ── Sub-view navigation ─────────────────────────────────────────────────────
const view   = ref('main') // 'main' | 'language' | 'textSize' | 'reminder' | 'sound' | 'feedback'
const viewTx = ref('slide-forward')

function openView(v) { viewTx.value = 'slide-forward'; view.value = v }
function backToMain() { viewTx.value = 'slide-back';  view.value = 'main' }

defineExpose({
  isOnSubView: computed(() => view.value !== 'main'),
  swipeBack: () => { if (view.value !== 'main') backToMain() },
})

// ── Options ─────────────────────────────────────────────────────────────────
const LANGUAGES  = [{ code: 'en', label: 'English' }, { code: 'ta', label: 'தமிழ்' }, { code: 'si', label: 'සිංහල' }]
const REMINDERS  = [5, 10, 15, 20, 30]

// ── Labels ──────────────────────────────────────────────────────────────────
const langLabel  = computed(() => LANGUAGES.find(l => l.code === settings.language)?.label ?? 'English')
const sizeLabel  = computed(() => {
  const map = { normal: t.value.textSizeNormal, large: t.value.textSizeLarge, xlarge: t.value.textSizeXLarge }
  return map[settings.textSize ?? 'normal'] ?? t.value.textSizeNormal
})
const soundLabel = computed(() => {
  const map = { azan: t.value.soundAzan, default: t.value.soundDefault, silent: t.value.soundSilent }
  return map[settings.reminderSound] ?? t.value.soundAzan
})
const hijriLabel = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + (settings.dateAdjustment ?? 0))
  const lang = { en: 'en', ta: 'ta', si: 'si' }[settings.language] ?? 'en'
  const cals = ['islamic-umalqura', 'islamic-civil', 'islamic']
  for (const cal of cals) {
    try {
      const s = d.toLocaleDateString(`${lang}-u-ca-${cal}`, { day: 'numeric', month: 'long', year: 'numeric' })
      if (s) return s
    } catch {}
  }
  if (lang !== 'en') {
    for (const cal of cals) {
      try {
        const s = d.toLocaleDateString(`en-u-ca-${cal}`, { day: 'numeric', month: 'long', year: 'numeric' })
        if (s) return s
      } catch {}
    }
  }
  return ''
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
        subject:    `MuezzinFeedback – ${feedbackType.value.charAt(0).toUpperCase() + feedbackType.value.slice(1)}`,
        from_name:  'MuezzinApp',
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
    <div v-if="view === 'main'" key="main" class="min-h-screen page-content">
      <PageHeader :title="t.settingsTitle" @back="emit('back')" />

      <div class="flex flex-col px-4 pb-12">

        <!-- GENERAL -->
        <p class="text-xs uppercase tracking-widest text-muted px-1 pb-2">{{ t.general }}</p>
        <div class="flex flex-col gap-2">

          <!-- Language -->
          <SettingsRow :title="t.language" :subtitle="langLabel" :on-click="() => openView('language')">
            <template #icon><Languages :size="18" stroke-width="1.5" /></template>
            <template #right><ChevronRight :size="15" class="text-muted shrink-0" /></template>
          </SettingsRow>

          <!-- Dark Mode -->
          <SettingsRow :title="t.darkMode" :subtitle="settings.darkMode ? t.on : t.off">
            <template #icon><Moon :size="18" stroke-width="1.5" /></template>
            <template #right>
              <button
                class="relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0"
                :class="settings.darkMode ? 'bg-gold' : 'bg-fg/20'"
                role="switch" :aria-checked="settings.darkMode"
                @click="settings.darkMode = !settings.darkMode"
              >
                <span class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200"
                  :class="settings.darkMode ? 'translate-x-5' : 'translate-x-0'" />
              </button>
            </template>
          </SettingsRow>

          <!-- Text Size -->
          <SettingsRow :title="t.textSize" :subtitle="sizeLabel" :on-click="() => openView('textSize')">
            <template #icon><Type :size="18" stroke-width="1.5" /></template>
            <template #right><ChevronRight :size="15" class="text-muted shrink-0" /></template>
          </SettingsRow>

          <!-- Location -->
          <SettingsRow :title="t.location" :subtitle="getLocalDistrict(settings.district, settings.language) || t.locationAuto" :on-click="() => emit('open-location')">
            <template #icon><MapPin :size="18" stroke-width="1.5" /></template>
            <template #right><ChevronRight :size="15" class="text-muted shrink-0" /></template>
          </SettingsRow>

          <!-- Date Adjustment -->
          <SettingsRow :title="t.dateAdjustment" :subtitle="hijriLabel">
            <template #icon><MoonStar :size="18" stroke-width="1.5" /></template>
            <template #right>
              <div class="flex items-center gap-2 shrink-0">
                <button class="text-muted hover:text-fg transition-colors p-0.5"
                  @click="settings.dateAdjustment = Math.max(-5, settings.dateAdjustment - 1)">
                  <MinusCircle :size="18" stroke-width="2" />
                </button>
                <span class="text-sm font-bold text-fg w-6 text-center">
                  {{ settings.dateAdjustment > 0 ? '+' + settings.dateAdjustment : settings.dateAdjustment }}
                </span>
                <button class="text-muted hover:text-fg transition-colors p-0.5"
                  @click="settings.dateAdjustment = Math.min(5, settings.dateAdjustment + 1)">
                  <PlusCircle :size="18" stroke-width="2" />
                </button>
              </div>
            </template>
          </SettingsRow>
        </div>

        <!-- NOTIFICATION -->
        <!-- Notification header with toggle -->
        <div class="flex items-center justify-between px-1 pt-8 pb-2">
          <p class="text-xs uppercase tracking-widest text-muted">{{ t.notification }}</p>
          <button
            class="relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0"
            :class="settings.notificationsEnabled && notifPermission === 'granted' ? 'bg-gold' : 'bg-fg/20'"
            @click="toggleNotifications"
          >
            <span class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200"
              :class="settings.notificationsEnabled && notifPermission === 'granted' ? 'translate-x-5' : 'translate-x-0'" />
          </button>
        </div>
        <div class="flex flex-col gap-2 transition-opacity duration-200"
          :class="!(settings.notificationsEnabled && notifPermission === 'granted') && 'opacity-40 pointer-events-none'">

          <!-- Reminder timing -->
          <SettingsRow :title="t.prayerReminder" :subtitle="`${settings.reminderMinutes} ${t.minutesBefore}`" :on-click="() => openView('reminder')">
            <template #icon><ClockPlus :size="18" stroke-width="1.5" /></template>
            <template #right><ChevronRight :size="15" class="text-muted shrink-0" /></template>
          </SettingsRow>

          <!-- Reminder Sound -->
          <SettingsRow :title="t.reminderSound" :subtitle="soundLabel" :on-click="() => openView('sound')">
            <template #icon><BellRing :size="18" stroke-width="1.5" /></template>
            <template #right><ChevronRight :size="15" class="text-muted shrink-0" /></template>
          </SettingsRow>
        </div>

        <!-- OTHER -->
        <p class="text-xs uppercase tracking-widest text-muted px-1 pt-8 pb-2">{{ t.other }}</p>
        <!-- Feedback -->
        <SettingsRow :title="t.feedback" :on-click="() => openView('feedback')">
          <template #icon><MessageSquareText :size="18" stroke-width="1.5" /></template>
          <template #right><ChevronRight :size="15" class="text-muted shrink-0" /></template>
        </SettingsRow>

        <!-- Footer -->
        <div class="flex flex-col items-center gap-2 pt-8 pb-2">
          <!-- Horizontal logo -->
          <div class="flex items-center gap-2">
            <svg width="36" height="36" viewBox="0 0 160 162" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-gold">
              <path d="M55.9448 27.5066C65.4171 14.2636 83.0246 5.60278 100.811 5.60278C114.687 5.60278 127.994 10.986 137.806 20.5683C147.618 30.1506 153.131 43.1472 153.133 56.6996C153.133 83.6964 131.694 105.921 104.547 107.796" stroke="currentColor" stroke-width="11.2054" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17.5102 107.415C7.34312 95.0442 5.60254 82.6136 20.1547 67.5311C35.4389 53.8978 44.2389 47.451 46.5846 43.5664C48.9303 47.451 57.8722 53.8978 73.1564 67.5311C87.0063 79.887 86.1398 95.0367 75.9727 107.415M17.5102 107.415H13.6032M17.5102 107.415H75.9727M75.9727 107.415H79.4091M13.6032 107.415H5.60254M13.6032 107.415V148.83C13.902 153.82 13.6032 156.151 22.6498 155.494H46.4427M79.4091 107.415H87.6189M79.4091 107.415L79.4016 149.592C80.2756 156.368 74.8821 155.18 71.4308 155.494H46.4352L46.6966 139.552" stroke="currentColor" stroke-width="11.2054" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M98.9736 43.5664V62.2496L110.187 69.7199" stroke="currentColor" stroke-width="11.2054" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p class="text-[18px] text-fg">Muezzin</p>
          </div>
          <p class="text-xs text-muted">{{ t.version }} 1.0.0</p>
          <p class="text-xs text-muted text-center px-8 leading-relaxed mt-2">
            {{ t.disclaimer }}
          </p>
        </div>
      </div>
    </div>

    <!-- ════════════════════ LANGUAGE ════════════════════ -->
    <div v-else-if="view === 'language'" key="language" class="min-h-screen page-content">
      <PageHeader :title="t.language" @back="backToMain" />
      <div class="flex flex-col gap-2.5 px-4">
        <SelectOption
          v-for="lang in LANGUAGES" :key="lang.code"
          :label="lang.label"
          :selected="settings.language === lang.code"
          @select="settings.language = lang.code"
        />
      </div>
    </div>

    <!-- ════════════════════ TEXT SIZE ════════════════════ -->
    <div v-else-if="view === 'textSize'" key="textSize" class="min-h-screen page-content">
      <PageHeader :title="t.textSize" @back="backToMain" />
      <div class="flex flex-col gap-2.5 px-4">
        <SelectOption
          v-for="opt in [{value:'normal',label:t.textSizeNormal},{value:'large',label:t.textSizeLarge},{value:'xlarge',label:t.textSizeXLarge}]" :key="opt.value"
          :label="opt.label"
          :selected="(settings.textSize ?? 'normal') === opt.value"
          @select="settings.textSize = opt.value"
        />
      </div>
    </div>

    <!-- ════════════════════ PRAYER REMINDER ════════════════════ -->
    <div v-else-if="view === 'reminder'" key="reminder" class="min-h-screen page-content">
      <PageHeader :title="t.prayerReminder" @back="backToMain" />
      <div class="flex flex-col gap-2.5 px-4">
        <SelectOption
          v-for="m in REMINDERS" :key="m"
          :label="m + ' ' + t.minutesBefore"
          :selected="settings.reminderMinutes === m"
          @select="settings.reminderMinutes = m"
        />
      </div>
    </div>

    <!-- ════════════════════ REMINDER SOUND ════════════════════ -->
    <div v-else-if="view === 'sound'" key="sound" class="min-h-screen page-content">
      <PageHeader :title="t.reminderSound" @back="backToMain" />
      <div class="flex flex-col gap-2.5 px-4">
        <SelectOption
          v-for="opt in [{value:'azan',label:t.soundAzan},{value:'default',label:t.soundDefault},{value:'silent',label:t.soundSilent}]" :key="opt.value"
          :label="opt.label"
          :selected="settings.reminderSound === opt.value"
          @select="settings.reminderSound = opt.value; previewSound(opt.value)"
        />
      </div>
    </div>

    <!-- ════════════════════ FEEDBACK ════════════════════ -->
    <div v-else-if="view === 'feedback'" key="feedback" class="min-h-screen page-content">
      <PageHeader :title="t.feedback" @back="backToMain" />
      <div>
        <Transition name="fade-up">
          <div v-if="feedbackSuccess"
            class="fixed inset-x-0 bottom-8 mx-auto w-fit z-50 px-6 py-3.5 rounded-xl bg-gold text-nt flex items-center gap-2.5 shadow-xl"
            style="max-width: 320px">
            <CheckCircle2 :size="20" stroke-width="2.5" />
            <span class="text-sm font-semibold">{{ t.feedbackSuccess }}</span>
          </div>
        </Transition>

        <div class="flex flex-col p-5 gap-5 bg-card rounded-xl mx-4 mt-2">
          <div class="text-center">
            <p class="text-md font-bold text-gold tracking-wide">{{ t.letUsKnow }}</p>
            <p class="text-sm text-muted leading-relaxed mt-1">{{ t.feedbackDesc }}</p>
          </div>
          <div class="relative">
            <select
              v-model="feedbackType"
              class="w-full appearance-none bg-nt rounded-xl px-4 py-3 text-sm text-fg outline-none transition-colors cursor-pointer pr-10"
            >
              <option value="bug">{{ t.feedbackBug }}</option>
              <option value="suggestion">{{ t.feedbackSuggestion }}</option>
              <option value="other">{{ t.feedbackOther }}</option>
            </select>
            <ChevronDown class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" :size="16" stroke-width="2" />
          </div>
          <textarea
            v-model="feedbackText"
            rows="6"
            v-bind:placeholder="t.feedbackPlaceholder"
            class="w-full bg-nt rounded-xl px-4 py-3 text-sm text-fg placeholder:text-muted outline-none transition-colors resize-none"
          />
          <button
            class="w-full py-3.5 rounded-xl font-bold text-sm bg-gold text-nt transition-opacity"
            :class="!feedbackText.trim() || submitting ? 'opacity-50 cursor-not-allowed' : 'opacity-100'"
            :disabled="!feedbackText.trim() || submitting"
            @click="submitFeedback"
          >
            {{ t.feedbackSubmit }}
          </button>
        </div>
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
