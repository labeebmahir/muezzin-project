<script setup>
import { computed } from 'vue'
import PrayerIcon from './PrayerIcon.vue'
import { useSettings } from '../composables/useSettings.js'
import { useI18n } from '../composables/useI18n.js'
import { PRAYER_NAMES } from '../constants/prayerNames.js'

const props = defineProps({
  prayer: { type: Object, required: true },
  isNext: { type: Boolean, default: false },
  isPast: { type: Boolean, default: false },
})

const { settings } = useSettings()
const { t } = useI18n()

const displayName = computed(() =>
  PRAYER_NAMES[settings.language]?.[props.prayer.key] ?? props.prayer.name
)
</script>

<template>
  <div
    class="flex items-center justify-between px-4 py-4 rounded-xl transition-colors"
    :class="isNext
      ? 'bg-gold'
      : isPast
        ? 'bg-card opacity-40'
        : 'bg-card'"
  >
    <!-- Left: icon + name -->
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 flex items-center justify-center shrink-0"
        :class="isNext ? 'text-white' : 'text-gold'">
        <PrayerIcon :prayer-key="prayer.key" :size="22" />
      </div>

      <div class="flex flex-col leading-tight">
        <span v-if="isNext"
          class="text-sm font-semibold tracking-wide uppercase text-white">
          {{ t.next }}
        </span>
        <span class="font-semibold"
          :class="isNext ? 'text-white text-lg' : 'text-fg'">
          {{ displayName }}
        </span>
      </div>
    </div>

    <!-- Right: time -->
    <span class="font-semibold"
      :class="isNext ? 'text-white text-lg' : 'text-fg text-sm'">
      {{ prayer.timeStr }}
    </span>
  </div>
</template>
