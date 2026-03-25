<script setup>
import { useSettings } from '../composables/useSettings.js'
import { LANGUAGES } from '../constants/prayerNames.js'

defineEmits(['close'])
const { settings } = useSettings()
</script>

<template>
  <div class="fixed inset-0 bg-black/60 z-50 flex items-end" @click.self="$emit('close')">
    <div class="w-full max-w-md mx-auto bg-card rounded-t-[20px] px-4 pt-5 pb-10">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-fg">Language</h2>
        <button class="p-1.5 rounded-lg text-muted hover:text-fg transition-colors"
          @click="$emit('close')" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="flex flex-col gap-1">
        <button
          v-for="lang in LANGUAGES" :key="lang.code"
          class="flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-colors"
          :class="settings.language === lang.code ? 'bg-next text-nt' : 'hover:bg-white/5 text-fg'"
          @click="settings.language = lang.code; $emit('close')"
        >
          <span class="text-[17px] font-medium">{{ lang.native }}</span>
          <svg v-if="settings.language === lang.code" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
