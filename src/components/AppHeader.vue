<script setup>
import { MapPin, Calendar, Settings } from 'lucide-vue-next'
import { ChevronDown } from 'lucide-vue-next'

defineProps({ city: { type: String, default: '' } })
defineEmits(['openCalendar', 'openSettings', 'openLocation'])
</script>

<template>
  <header class="flex items-center justify-between px-4 pt-4 pb-2 sticky top-0 bg-bg z-10">
    <!-- Location (tappable) -->
    <button
      class="flex items-center gap-1.5 p-1 -ml-1 rounded-lg hover:bg-white/5 transition-colors"
      @click="$emit('openLocation')"
      aria-label="Change location"
    >
      <MapPin :size="15" class="text-muted shrink-0" />
      <span class="text-[15px] font-medium text-fg">{{ city || '…' }}</span>
      <ChevronDown :size="12" class="text-muted" />
    </button>

    <!-- Nav icons -->
    <nav class="flex items-center gap-1">
      <button
        @click="$emit('openCalendar')"
        aria-label="Hijiri Calendar"
        class="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-white/5 transition-colors"
      >
        <Calendar :size="22" stroke-width="1.6" />
      </button>

      <button
        @click="$emit('openSettings')"
        aria-label="Settings"
        class="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-white/5 transition-colors"
      >
        <Settings :size="22" stroke-width="1.6" />
      </button>
    </nav>
  </header>
</template>
