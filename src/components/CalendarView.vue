<script setup>
import { ref, computed } from 'vue'
import { Share2, ChevronRight,ChevronLeft } from 'lucide-vue-next'
import PrayerIcon from './PrayerIcon.vue'
import PageHeader from './PageHeader.vue'
import { useSettings } from '../composables/useSettings.js'
import { useI18n } from '../composables/useI18n.js'
import { usePrayerData, getLocalDistrict } from '../composables/usePrayerData.js'
import { PRAYER_NAMES } from '../constants/prayerNames.js'
import { shareAsImage } from '../composables/useShareImage.js'

defineEmits(['back'])

const { settings } = useSettings()
const { t } = useI18n()
const { getEntryForDate } = usePrayerData()

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
  for (const cal of CAL) { try { const s = new Intl.DateTimeFormat(`${lang}-u-ca-${cal}`, { month: 'long' }).format(date); if (s) return s } catch {} }
  if (lang !== 'en') {
    for (const cal of CAL) { try { const s = new Intl.DateTimeFormat(`en-u-ca-${cal}`, { month: 'long' }).format(date); if (s) return s } catch {} }
  }
  return ''
}

function adj(d) {
  const n = settings.dateAdjustment ?? 0
  if (!n) return d
  const a = new Date(d); a.setDate(a.getDate() + n); return a
}

function monthStart(anchor) {
  const { day, year } = hijriParts(adj(anchor))
  if (year < 1400) return anchor  // Intl Islamic calendar unsupported
  const est = new Date(anchor); est.setDate(est.getDate() - day + 1); est.setHours(12, 0, 0, 0)
  for (let o = -4; o <= 4; o++) {
    const c = new Date(est); c.setDate(c.getDate() + o)
    const prev = new Date(c); prev.setDate(prev.getDate() - 1)
    if (hijriParts(adj(c)).day === 1 && hijriParts(adj(prev)).day !== 1) return c
  }
  return est
}

// ── Calendar grid ──────────────────────────────────────────────────────────
const mStart = computed(() => monthStart(monthAnchor.value))

const calDays = computed(() => {
  const start = mStart.value
  const { month: mth, year: yr } = hijriParts(adj(start))
  if (yr < 1400) return []  // Intl Islamic calendar unsupported on this device
  const days = []
  const startDow = (start.getDay() + 6) % 7
  for (let i = 0; i < startDow; i++) days.push(null)
  const d = new Date(start)
  let limit = 0
  while (limit++ < 32) {
    const { day, month, year } = hijriParts(adj(d))
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

const monthHeader = computed(() => `${hijriMonthName(adj(monthAnchor.value), langPrefix.value)} ${hijriParts(adj(monthAnchor.value)).year}`)
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

function parseTime(str, refDate) {
  if (!str) return null
  const s = str.trim()
  const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (m12) {
    let h = parseInt(m12[1])
    const min = parseInt(m12[2])
    const isPM = m12[3].toUpperCase() === 'PM'
    if (isPM && h !== 12) h += 12
    if (!isPM && h === 12) h = 0
    const d = new Date(refDate)
    d.setHours(h, min, 0, 0)
    return d
  }
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/)
  if (m24) {
    const d = new Date(refDate)
    d.setHours(parseInt(m24[1]), parseInt(m24[2]), 0, 0)
    return d
  }
  return null
}

function fmtDate(d) { return d.toLocaleTimeString(locale.value, { hour: 'numeric', minute: '2-digit', hour12: true }) }

const selPrayers = computed(() => {
  const entry = getEntryForDate(selectedDate.value)
  if (!entry) return []
  const names = PRAYER_NAMES[settings.language] ?? PRAYER_NAMES.en
  return KEYS.map(k => {
    const time = parseTime(entry[k], selectedDate.value)
    return { key: k, name: names[k] ?? k, timeStr: time ? fmtDate(time) : '--:--' }
  })
})

const nextIdx = computed(() => {
  if (selectedDate.value.toDateString() !== today.toDateString()) return -1
  const entry = getEntryForDate(today)
  if (!entry) return -1
  const now = new Date()
  return KEYS.findIndex(k => {
    const t = parseTime(entry[k], today)
    return t && t > now
  })
})

const selHijri = computed(() => { const { day, year } = hijriParts(adj(selectedDate.value)); return `${day} ${hijriMonthName(adj(selectedDate.value), langPrefix.value)} ${year}` })
const selGreg  = computed(() => selectedDate.value.toLocaleDateString(locale.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

async function share() {
  await shareAsImage({
    prayers:       selPrayers.value,
    hijriDate:     selHijri.value,
    gregorianDate: selGreg.value,
    city:          getLocalDistrict(settings.district, settings.language) || '',
    language:      settings.language,
  })
}
</script>

<template>
  <div class="min-h-screen pb-10 page-content">
    <!-- Header -->
    <PageHeader :title="t.calendarTitle" @back="$emit('back')" />

    <div class="flex flex-col gap-8 px-4">

      <div v-if="!weeks.length" class="bg-card rounded-xl p-6 text-center text-muted text-sm">
        Hijri calendar is not supported on this browser.
      </div>

      <div v-else class="bg-card rounded-xl">
        <!-- Month navigator -->
        <div class="flex items-center justify-between p-4">
          <button class="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-white/10 transition-colors"" @click="prevMonth">
            <ChevronLeft :size="22" stroke-width="1.5" />
          </button>
          <div class="text-center">
            <p class="text-base font-bold text-gold">{{ monthHeader }}</p>
            <p class="text-sm mt-1">{{ gregRange }}</p>
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
                :class="day.isToday ? 'text-card' : 'text-muted'">
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
