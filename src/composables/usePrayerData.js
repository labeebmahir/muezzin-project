/**
 * Loads prayer times for the user's selected zone.
 *
 * Zone files live at src/data/zone-XX.json.
 * Adding a new zone = create zone-XX.json + add entry to zones.json.
 *
 * Time formats accepted: "H:MM AM/PM" or "HH:MM" (24h).
 * Column aliases: luhar → dhuhr, magrib → maghrib.
 */
import { useSettings } from './useSettings.js'
import ZONES from '../data/zones.json'

// Eagerly bundle all zone files at build time
const zoneFiles = import.meta.glob('../data/zone-*.json', { eager: true })

export function getLocalDistrict(districtEn, language) {
  if (!districtEn) return ''
  for (const zone of ZONES) {
    for (const d of zone.districts) {
      if (d.en === districtEn) return d[language] ?? d.en
    }
  }
  return districtEn
}

function normalise(row) {
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    const key = k.toLowerCase().trim()
    const canon =
      key === 'luhar'  ? 'dhuhr' :
      key === 'magrib' ? 'maghrib' : key
    out[canon] = v
  }
  return out
}

function getRows(zone) {
  const key = `../data/zone-${zone}.json`
  const file = zoneFiles[key]
  if (!file) return []
  const raw = file.default ?? file
  const arr = Array.isArray(raw) ? raw : (raw.times ?? [])
  return arr.map(normalise)
}

function localDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function usePrayerData() {
  const { settings } = useSettings()

  function getTodayEntry() {
    const rows = getRows(settings.zone)
    if (!rows.length) return null
    return rows.find((r) => r.date === localDateStr(new Date())) ?? null
  }

  function getEntryForDate(date) {
    const rows = getRows(settings.zone)
    if (!rows.length) return null
    return rows.find((r) => r.date === localDateStr(date)) ?? null
  }

  function getZoneInfo() {
    const key = `../data/zone-${settings.zone}.json`
    const file = zoneFiles[key]
    if (!file) return null
    const raw = file.default ?? file
    return { districts: raw.districts ?? [], zone: raw.zone }
  }

  return { getTodayEntry, getEntryForDate, getZoneInfo }
}
