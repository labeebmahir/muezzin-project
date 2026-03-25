import { computed } from 'vue'
import { useSettings } from './useSettings.js'
import { translations } from '../constants/translations.js'

export function useI18n() {
  const { settings } = useSettings()
  // t auto-unwraps in templates — use as t.someKey
  const t = computed(() => translations[settings.language] ?? translations.en)
  return { t }
}
