import { ref, watch } from 'vue'
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan'

const PRAYER_META = [
  { key: 'fajr',    name: 'Fajr',    icon: 'fajr',    hasIqama: true  },
  { key: 'sunrise', name: 'Sunrise', icon: 'sunrise', hasIqama: false },
  { key: 'dhuhr',   name: 'Luhar',   icon: 'dhuhr',   hasIqama: true  },
  { key: 'asr',     name: 'Asar',    icon: 'asr',     hasIqama: true  },
  { key: 'maghrib', name: 'Magrib',  icon: 'maghrib', hasIqama: true  },
  { key: 'isha',    name: 'Isha',    icon: 'isha',    hasIqama: true  },
]

const IQAMA_OFFSETS = { fajr: 20, dhuhr: 15, asr: 15, maghrib: 5, isha: 15 }

function fmt(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/** Convert "HH:MM" or "H:MM AM/PM" to a Date on the given day */
function timeStrToDate(str, ref = new Date()) {
  if (!str) return null
  const s = str.trim()
  // 24h "HH:MM" or "H:MM"
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/)
  if (m24) {
    const d = new Date(ref)
    d.setHours(parseInt(m24[1]), parseInt(m24[2]), 0, 0)
    return d
  }
  // 12h "H:MM AM/PM"
  const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (m12) {
    let h = parseInt(m12[1])
    const min = parseInt(m12[2])
    const isPM = m12[3].toUpperCase() === 'PM'
    if (isPM && h !== 12) h += 12
    if (!isPM && h === 12) h = 0
    const d = new Date(ref)
    d.setHours(h, min, 0, 0)
    return d
  }
  return null
}

/**
 * @param {Ref<{lat,lon}|null>} coordsRef
 * @param {Function}            getTodayEntry  — () => timetable entry for today or null
 */
export function usePrayerTimes(coordsRef, getTodayEntry = () => null) {
  const prayers = ref([])
  const nextPrayerIndex = ref(-1)
  const nextPrayerName = ref('')
  const nextPrayerKey = ref('dhuhr')
  const countdown = ref({ h: 0, m: 0, s: 0 })
  const source = ref('calculated') // 'calculated' | 'timetable'

  let intervalId = null
  let coordinates = null
  let params = null

  function buildFromCalculation(date) {
    const times = new PrayerTimes(coordinates, date, params)
    return PRAYER_META.map((p) => {
      const time = times[p.key]
      const offset = IQAMA_OFFSETS[p.key] ?? 15
      const iqamaTime = p.hasIqama ? new Date(time.getTime() + offset * 60000) : null
      return { ...p, time, timeStr: fmt(time), iqamaStr: iqamaTime ? fmt(iqamaTime) : null }
    })
  }

  function buildFromTimetable(entry, date) {
    return PRAYER_META.map((p) => {
      const timeStr = entry[p.key] ?? ''
      const iqamaStr = entry[`${p.key}_iqama`] ?? ''
      const time = timeStrToDate(timeStr, date)
      const iqamaTime = iqamaStr ? timeStrToDate(iqamaStr, date) : null

      // Fall back to calculation if time is missing
      if (!time && coordinates && params) {
        const calc = new PrayerTimes(coordinates, date, params)
        const fallbackTime = calc[p.key]
        const offset = IQAMA_OFFSETS[p.key] ?? 15
        const fallbackIqama = p.hasIqama ? new Date(fallbackTime.getTime() + offset * 60000) : null
        return { ...p, time: fallbackTime, timeStr: fmt(fallbackTime), iqamaStr: fallbackIqama ? fmt(fallbackIqama) : null }
      }

      return {
        ...p,
        time: time ?? new Date(0),
        timeStr: time ? fmt(time) : '--:--',
        iqamaStr: iqamaTime ? fmt(iqamaTime) : (p.hasIqama ? null : null),
      }
    })
  }

  function calculate() {
    const date = new Date()
    const entry = getTodayEntry()

    if (entry) {
      source.value = 'timetable'
      prayers.value = buildFromTimetable(entry, date)
    } else if (coordsRef.value) {
      const { lat, lon } = coordsRef.value
      coordinates = new Coordinates(lat, lon)
      params = CalculationMethod.MoonsightingCommittee()
      source.value = 'calculated'
      prayers.value = buildFromCalculation(date)
    }

    updateNext()
  }

  function updateNext() {
    const now = new Date()
    const idx = prayers.value.findIndex((p) => p.time > now)
    if (idx === -1) {
      nextPrayerIndex.value = 0
      nextPrayerName.value = 'Fajr'
      nextPrayerKey.value = 'fajr'
    } else {
      nextPrayerIndex.value = idx
      nextPrayerName.value = prayers.value[idx].name
      nextPrayerKey.value = prayers.value[idx].key
    }
  }

  function tick() {
    const now = new Date()
    updateNext()

    let target
    const idx = nextPrayerIndex.value

    if (idx === -1 || (idx === 0 && prayers.value[0]?.time <= now)) {
      if (coordinates && params) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params)
        target = tomorrowTimes.fajr
      }
    } else {
      target = prayers.value[idx]?.time
    }

    if (!target) return

    const diff = Math.max(0, target - now)
    countdown.value = {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    }

    if (diff < 1000) calculate()
  }

  function start() {
    if (intervalId) clearInterval(intervalId)
    calculate()
    tick()
    intervalId = setInterval(tick, 1000)
  }

  function stop() {
    if (intervalId) clearInterval(intervalId)
  }

  watch(coordsRef, (val) => { if (val) start() })

  return { prayers, nextPrayerIndex, nextPrayerName, nextPrayerKey, countdown, source, start, stop, calculate }
}
