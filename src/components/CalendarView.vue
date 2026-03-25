<script setup>
import { ref, computed } from 'vue'
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan'
import { Share2 } from 'lucide-vue-next'
import PrayerIcon from './PrayerIcon.vue'
import { useSettings } from '../composables/useSettings.js'
import { useI18n } from '../composables/useI18n.js'
import { PRAYER_NAMES } from '../constants/prayerNames.js'
import { shareAsImage } from '../composables/useShareImage.js'

const props = defineProps({ coords: { type: Object, default: null } })
defineEmits(['back'])

const { settings } = useSettings()
const { t } = useI18n()

const today         = new Date()
const selectedDate  = ref(new Date(today))
const monthAnchor   = ref(new Date(today))

// ── Hijri helpers ──────────────────────────────────────────────────────────
const CAL        = ['islamic-umalqura', 'islamic-civil', 'islamic']
const LOCALE_MAP = { en: 'en-US', ta: 'ta-LK', si: 'si-LK' }
const locale     = computed(() => LOCALE_MAP[settings.language] ?? 'en-US')
const langPrefix = computed(() => locale.value.split('-')[0])

function hijriParts(date) {
  for (const cal of CAL) {
    try {
      const parts = new Intl.DateTimeFormat(`en-u-ca-${cal}`, { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(date)
      const m = {}; parts.forEach(p => m[p.type] = p.value)
      if (m.day && m.month && m.year) return { day: +m.day, month: +m.month, year: +m.year }
    } catch {}
  }
  return { day: 1, month: 1, year: 1 }
}
function hijriMonthName(date, lang) {
  for (const cal of CAL) { try { return new Intl.DateTimeFormat(`${lang}-u-ca-${cal}`, { month: 'long' }).format(date) } catch {} }
  return ''
}
function monthStart(anchor) {
  const { day } = hijriParts(anchor)
  const est = new Date(anchor); est.setDate(est.getDate() - day + 1); est.setHours(12, 0, 0, 0)
  for (let o = -2; o <= 2; o++) {
    const c = new Date(est); c.setDate(c.getDate() + o)
    const prev = new Date(c); prev.setDate(prev.getDate() - 1)
    if (hijriParts(c).day === 1 && hijriParts(prev).day !== 1) return c
  }
  return est
}

// ── Calendar grid ──────────────────────────────────────────────────────────
const mStart = computed(() => monthStart(monthAnchor.value))

const calDays = computed(() => {
  const start = mStart.value
  const { month: mth, year: yr } = hijriParts(start)
  const days = []
  const startDow = (start.getDay() + 6) % 7
  for (let i = 0; i < startDow; i++) days.push(null)
  const d = new Date(start)
  while (true) {
    const { day, month, year } = hijriParts(d)
    if (month !== mth || year !== yr) break
    days.push({
      gregorianDate: new Date(d),
      hijriDay: day,
      gregShort: d.toLocaleDateString(locale.value, { month: 'short', day: 'numeric' }),
      isToday:    d.toDateString() === today.toDateString(),
      isSelected: d.toDateString() === selectedDate.value.toDateString(),
    })
    d.setDate(d.getDate() + 1)
  }
  while (days.length % 7 !== 0) days.push(null)
  return days
})

const weeks = computed(() => {
  const out = []; const d = calDays.value
  for (let i = 0; i < d.length; i += 7) out.push(d.slice(i, i + 7))
  return out
})

const monthHeader = computed(() => `${hijriMonthName(monthAnchor.value, langPrefix.value)} ${hijriParts(monthAnchor.value).year}`)
const gregRange   = computed(() => {
  const real = calDays.value.filter(Boolean)
  if (!real.length) return ''
  const f = real[0].gregorianDate, l = real[real.length - 1].gregorianDate
  if (f.getMonth() === l.getMonth()) return f.toLocaleDateString(locale.value, { month: 'long', year: 'numeric' })
  return `${f.toLocaleDateString(locale.value, { month: 'long' })} – ${l.toLocaleDateString(locale.value, { month: 'long', year: 'numeric' })}`
})

function prevMonth() { const s = new Date(mStart.value); s.setDate(s.getDate() - 15); monthAnchor.value = s }
function nextMonth() {
  const real = calDays.value.filter(Boolean)
  if (!real.length) return
  const n = new Date(real[real.length - 1].gregorianDate); n.setDate(n.getDate() + 2); monthAnchor.value = n
}

// ── Prayer times for selected day ──────────────────────────────────────────
const KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
function fmt(d) { return d.toLocaleTimeString(locale.value, { hour: 'numeric', minute: '2-digit', hour12: true }) }

const selPrayers = computed(() => {
  if (!props.coords) return []
  const { lat, lon } = props.coords
  const times = new PrayerTimes(new Coordinates(lat, lon), selectedDate.value, CalculationMethod.MoonsightingCommittee())
  const names = PRAYER_NAMES[settings.language] ?? PRAYER_NAMES.en
  return KEYS.map(k => ({ key: k, name: names[k] ?? k, timeStr: fmt(times[k]) }))
})

const nextIdx = computed(() => {
  if (!props.coords || selectedDate.value.toDateString() !== today.toDateString()) return -1
  const times = new PrayerTimes(new Coordinates(props.coords.lat, props.coords.lon), today, CalculationMethod.MoonsightingCommittee())
  const now = new Date()
  return KEYS.findIndex(k => times[k] > now)
})

const selHijri = computed(() => { const { day, year } = hijriParts(selectedDate.value); return `${day} ${hijriMonthName(selectedDate.value, langPrefix.value)} ${year}` })
const selGreg  = computed(() => selectedDate.value.toLocaleDateString(locale.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

async function share() {
  await shareAsImage({
    prayers:       selPrayers.value,
    hijriDate:     selHijri.value,
    gregorianDate: selGreg.value,
    city:          settings.district || '',
    language:      settings.language,
  })
}
</script>

<template>
  <div class="min-h-screen pb-10">
    <!-- Header -->
    <header class="flex items-center gap-3 px-4 pt-4 pb-2 sticky top-0 bg-bg z-10">
      <button class="p-1.5 rounded-lg text-muted hover:text-fg transition-colors" @click="$emit('back')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1 class="text-lg font-bold text-fg">{{ t.calendarTitle }}</h1>
    </header>

    <div class="flex flex-col gap-3 px-4 pt-2">

      <!-- Month navigator -->
      <div class="bg-card border border-(--bdr) rounded-2xl flex items-center justify-between px-4 py-3.5">
        <button class="p-2 rounded-lg text-muted hover:text-fg transition-colors" @click="prevMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="text-center">
          <p class="text-base font-bold text-gold">{{ monthHeader }}</p>
          <p class="text-xs text-muted mt-0.5">{{ gregRange }}</p>
        </div>
        <button class="p-2 rounded-lg text-muted hover:text-fg transition-colors" @click="nextMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <!-- Calendar grid -->
      <div class="bg-card border border-(--bdr) rounded-2xl p-3">
        <!-- DOW headers -->
        <div class="grid grid-cols-7 mb-1">
          <span v-for="d in t.dow" :key="d"
            class="text-center text-[11px] font-semibold text-muted py-1">{{ d }}</span>
        </div>
        <!-- Weeks -->
        <div v-for="(week, wi) in weeks" :key="wi" class="grid grid-cols-7">
          <button
            v-for="(day, di) in week" :key="di"
            class="flex flex-col items-center justify-center min-h-13 rounded-xl gap-0.5 transition-colors"
            :class="[
              !day ? 'cursor-default' : 'cursor-pointer',
              day?.isToday    ? 'bg-next' : '',
              day?.isSelected && !day?.isToday ? 'bg-gold/15 ring-1 ring-gold/40' : '',
              !day?.isToday && !day?.isSelected && day ? 'hover:bg-white/5' : '',
            ]"
            @click="day && (selectedDate = new Date(day.gregorianDate))"
          >
            <template v-if="day">
              <span class="text-base font-semibold leading-none"
                :class="day.isToday ? 'text-white font-extrabold' : 'text-fg'">
                {{ day.hijriDay }}
              </span>
              <span class="text-[9px] leading-none"
                :class="day.isToday ? 'text-white/70' : 'text-muted'">
                {{ day.gregShort }}
              </span>
            </template>
          </button>
        </div>
      </div>

      <!-- Selected date info -->
      <div class="flex items-center justify-between px-1">
        <div>
          <p class="text-[15px] font-semibold text-gold">{{ selHijri }}</p>
          <p class="text-sm text-muted mt-0.5">{{ selGreg }}</p>
        </div>
        <button class="p-2 rounded-lg text-muted hover:text-fg transition-colors" aria-label="Share" @click="share">
          <Share2 :size="20" stroke-width="1.8" />
        </button>
      </div>

      <!-- Prayer cards grid -->
      <div v-if="selPrayers.length" class="grid grid-cols-3 gap-2">
        <div
          v-for="(p, i) in selPrayers" :key="p.key"
          class="flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-2xl border"
          :class="i === nextIdx
            ? 'bg-next border-transparent'
            : 'bg-card border-(--bdr)'"
        >
          <div :class="i === nextIdx ? 'text-white' : 'text-gold'">
            <PrayerIcon :prayer-key="p.key" :size="22" />
          </div>
          <span class="text-[13px] font-semibold" :class="i === nextIdx ? 'text-white' : 'text-fg'">{{ p.name }}</span>
          <span class="text-sm font-extrabold"     :class="i === nextIdx ? 'text-white' : 'text-fg'">{{ p.timeStr }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
