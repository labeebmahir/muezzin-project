<template>
  <header
    class="flex items-center justify-center px-4 pb-3 fixed top-0 left-0 right-0 z-20 transition-all duration-200 max-w-120 mx-auto"
    style="padding-top: calc(env(safe-area-inset-top) + 0.5rem)"
    :class="scrolled ? 'backdrop-blur-md bg-bg/80' : 'bg-transparent'"
  >
    <button
      v-if="showBack"
      @click="$emit('back')"
      class="absolute left-4 p-1.5 rounded-lg text-muted hover:text-fg hover:bg-white/10 transition-colors"
    >
      <ChevronLeft :size="22" stroke-width="1.5" />
    </button>
    <h1 class="text-lg font-bold text-fg">{{ title }}</h1>
    <slot name="right" />
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'

defineProps({
  title:    { type: String, required: true },
  showBack: { type: Boolean, default: true },
})
defineEmits(['back'])

const scrolled = ref(false)
function onScroll() { scrolled.value = window.scrollY > 8 }
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>
