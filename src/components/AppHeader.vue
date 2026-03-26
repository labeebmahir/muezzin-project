<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { MapPin, Calendar, Settings, ChevronDown } from 'lucide-vue-next'

defineProps({ city: { type: String, default: '' } })
defineEmits(['openCalendar', 'openSettings', 'openLocation'])

const scrolled = ref(false)
function onScroll() { scrolled.value = window.scrollY > 8 }
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="flex items-center justify-between px-4 pt-4 pb-2 fixed top-0 left-0 right-0 z-20 transition-all duration-200 max-w-120 mx-auto"
    :class="scrolled ? 'backdrop-blur-md bg-bg/70' : 'bg-transparent'">
    <!-- Location (tappable) -->
    <button
      class="flex items-center gap-1.5 p-1 -ml-1 rounded-lg transition-colors"
      @click="$emit('openLocation')"
      aria-label="Change location"
    >
      <MapPin :size="22" class="text-muted shrink-0" />
      <span class="text-sm font-medium text-muted">{{ city || '…' }}</span>
    </button>

    <!-- Nav icons -->
    <nav class="flex items-center gap-4">
      <button
        @click="$emit('openCalendar')"
        aria-label="Hijiri Calendar"
        class="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-white/10 transition-colors"
      >
        <Calendar :size="22" stroke-width="1.5" />
      </button>

      <button
        @click="$emit('openSettings')"
        aria-label="Settings"
        class="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-white/10 transition-colors"
      >
        <Settings :size="22" stroke-width="1.5" />
      </button>
    </nav>
  </header>
</template>
