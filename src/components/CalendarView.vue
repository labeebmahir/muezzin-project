<script setup>
import { ref, computed } from 'vue'
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan'
import { Share2, ChevronRight,ChevronLeft } from 'lucide-vue-next'
import PrayerIcon from './PrayerIcon.vue'
import PageHeader from './PageHeader.vue'
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
    <PageHeader :title="t.calendarTitle" @back="$emit('back')" />

    <div class="flex flex-col gap-8 px-4 pt-16">

      <div class="bg-card rounded-xl">
        <!-- Month navigator -->
        <div class="flex items-center justify-between p-4">
          <button class="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-white/10 transition-colors"" @click="prevMonth">
            <ChevronLeft :size="22" stroke-width="1.5" />
          </button>
          <div class="text-center">
            <p class="text-base font-bold text-gold">{{ monthHeader }}</p>
            <p class="text-sm mt-q">{{ gregRange }}</p>
          </div>
          <button class="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-white/10 transition-colors"" @click="nextMonth">
            <ChevronRight :size="22" stroke-width="1.5" />
          </button>
        </div>
        <!-- Calendar grid -->
        <div class="p-4">
          <!-- DOW headers -->
          <div class="grid grid-cols-7 mb-1">
            <span v-for="d in t.dow" :key="d"
              class="text-center text-sm font-semibold py-1">{{ d }}</span>
          </div>
          <!-- Weeks -->
          <div v-for="(week, wi) in weeks" :key="wi" class="grid grid-cols-7">
            <button
              v-for="(day, di) in week" :key="di"
              class="flex flex-col items-center justify-center min-h-13 rounded-xl gap-0.5 transition-colors"
              :class="[
                !day ? 'cursor-default' : 'cursor-pointer',
                day?.isToday    ? 'bg-gold' : '',
                day?.isSelected && !day?.isToday ? 'bg-gold/15 ring-1 ring-gold/40' : '',
                !day?.isToday && !day?.isSelected && day ? 'hover:bg-white/5' : '',
              ]"
              @click="day && (selectedDate = new Date(day.gregorianDate))"
            >
              <template v-if="day">
                <span class="text-lg font-medium"
                :class="day.isToday ? 'text-card font-extrabold' : 'text-gold'">
                {{ day.hijriDay }}
              </span>
              <span class="text-xs leading-none"
                :class="day.isToday ? 'text-card' : 'text-white'">
                {{ day.gregShort }}
              </span>
              </template>
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <!-- Selected date info -->
        <div class="flex items-center justify-between px-1">
          <div>
            <p class="text-sm font-semibold text-gold">{{ selHijri }}</p>
            <p class="text-sm text-muted mt-0.5">{{ selGreg }}</p>
          </div>
          <button class="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-white/10 transition-colors" aria-label="Share" @click="share">
            <Share2 :size="22" stroke-width="1.5" />
          </button>
        </div>

        <!-- Prayer cards grid -->
        <div v-if="selPrayers.length" class="grid grid-cols-3 gap-4">
          <div
            v-for="(p, i) in selPrayers" :key="p.key"
            class="flex flex-col items-center gap-4 py-3.5 px-2 rounded-xl"
            :class="i === nextIdx
              ? 'bg-gold'
              : 'bg-card'"
          >
            <div :class="i === nextIdx ? 'text-white' : 'text-gold'">
              <PrayerIcon :prayer-key="p.key" :size="22" />
            </div>
            <div class="flex flex-col items-center gap-1">
              <span class="text-md font-semibold" :class="i === nextIdx ? 'text-white' : 'text-fg'">{{ p.name }}</span>
              <span class="text-sm" :class="i === nextIdx ? 'text-white' : 'text-fg'">{{ p.timeStr }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
