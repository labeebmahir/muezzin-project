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
    class="flex items-center justify-between px-4 py-4 rounded-2xl transition-colors"
    :class="isNext
      ? 'bg-next'
      : isPast
        ? 'bg-card border border-(--bdr) opacity-40'
        : 'bg-card border border-(--bdr)'"
  >
    <!-- Left: icon + name -->
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 flex items-center justify-center shrink-0"
        :class="isNext ? 'text-white' : 'text-muted'">
        <PrayerIcon :prayer-key="prayer.key" :size="22" />
      </div>

      <div class="flex flex-col leading-tight">
        <span v-if="isNext"
          class="text-[10px] font-semibold tracking-wide uppercase opacity-75 text-white">
          {{ t.next }}
        </span>
        <span class="text-base font-semibold"
          :class="isNext ? 'text-white' : 'text-fg'">
          {{ displayName }}
        </span>
      </div>
    </div>

    <!-- Right: time -->
    <span class="text-[15px] font-semibold"
      :class="isNext ? 'text-white' : 'text-fg'">
      {{ prayer.timeStr }}
    </span>
  </div>
</template>
