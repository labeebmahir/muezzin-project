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

// Eagerly bundle all zone files at build time
const zoneFiles = import.meta.glob('../data/zone-*.json', { eager: true })

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

export function usePrayerData() {
  const { settings } = useSettings()

  function getTodayEntry() {
    const rows = getRows(settings.zone)
    if (!rows.length) return null
    const today = new Date().toISOString().split('T')[0]
    return rows.find((r) => r.date === today) ?? null
  }

  function getZoneInfo() {
    const key = `../data/zone-${settings.zone}.json`
    const file = zoneFiles[key]
    if (!file) return null
    const raw = file.default ?? file
    return { districts: raw.districts ?? [], zone: raw.zone }
  }

  return { getTodayEntry, getZoneInfo }
}
