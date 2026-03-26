import { reactive, watch } from 'vue'

const STORAGE_KEY = 'muazzin_settings'

const defaults = {
  language: 'en',           // 'en' | 'ta' | 'si'
  darkMode: true,
  textSize: 'normal',       // 'normal' | 'large' | 'xlarge'
  locationMode: 'auto',     // 'auto' | 'manual'
  zone: '01',               // ACJU timetable zone
  district: '',             // selected district name (manual mode)
  dateAdjustment: 0,        // shift Hijri display date by N days
  notificationsEnabled: true,
  reminderMinutes: 10,      // notify N minutes before prayer
  reminderSound: 'azan',       // 'azan' | 'default' | 'silent'
}

const settings = reactive({ ...defaults })

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  Object.assign(settings, saved)
} catch {}

watch(
  () => ({ ...settings }),
  (val) => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)),
  { deep: true }
)

export function useSettings() {
  return { settings }
}
