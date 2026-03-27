<script setup>
import { computed } from 'vue'
import { useI18n } from '../composables/useI18n.js'

const props = defineProps({
  nextPrayer:    { type: String, default: '' },
  countdown:     { type: String, default: '0m 00s' },
  nextPrayerKey: { type: String, default: 'dhuhr' },
})

const { t } = useI18n()

const THEMES = {
  fajr:    { gradient: 'linear-gradient(180deg,#1c1a4b 0%,#3d3585 100%)', sun: '#c9c0e8', ring: 'rgba(201,192,232,0.2)', size: 64, moon: true,  bottom: false, stars: true  },
  sunrise: { gradient: 'linear-gradient(180deg,#7ec8e3 0%,#f5c97a 100%)', sun: '#f9c74f', ring: 'rgba(249,199,79,0.28)', size: 72, moon: false, bottom: true,  stars: false },
  dhuhr:   { gradient: 'linear-gradient(180deg,#0295DA 0%,#CEE5FF 100%)', sun: '#f9c74f', ring: 'rgba(249,199,79,0.24)', size: 84, moon: false, bottom: false, stars: false },
  asr:     { gradient: 'linear-gradient(180deg,#2BA1DA 0%,#FFFFFF 100%)', sun: '#f9c74f', ring: 'rgba(249,199,79,0.2)',  size: 64, moon: false, bottom: false, stars: false },
  maghrib: { gradient: 'linear-gradient(180deg,#f4845f 0%,#9b1b2f 100%)', sun: '#f9c74f', ring: 'rgba(249,199,79,0.28)', size: 72, moon: false, bottom: true,  stars: false },
  isha:    { gradient: 'linear-gradient(180deg,#060c1e 0%,#0d1a3a 100%)', sun: '#e8d5a3', ring: 'rgba(232,213,163,0.15)',size: 60, moon: true,  bottom: false, stars: true  },
}

const theme = computed(() => THEMES[props.nextPrayerKey] ?? THEMES.dhuhr)
</script>

<template>
  <div
    class="relative mx-4 mt-2 rounded-[20px] overflow-hidden flex flex-col items-center gap-1.5 pt-7 transition-all duration-1000"
    :style="{ background: theme.gradient, minHeight: '260px' }"
  >
    <!-- Stars -->
    <template v-if="theme.stars">
      <span class="absolute rounded-full bg-[#ffe9c2] animate-twinkle"       style="top:18%;left:15%;width:3px;height:3px;opacity:.6" />
      <span class="absolute rounded-full bg-[#ffe9c2] animate-twinkle"       style="top:12%;left:72%;width:2px;height:2px;opacity:.4;animation-delay:.8s" />
      <span class="absolute rounded-full bg-[#ffe9c2] animate-twinkle"       style="top:32%;left:88%;width:2px;height:2px;opacity:.5;animation-delay:1.6s" />
      <span class="absolute rounded-full bg-[#ffe9c2] animate-twinkle"       style="top:55%;left:8%; width:2px;height:2px;opacity:.3;animation-delay:.4s" />
      <span class="absolute rounded-full bg-[#ffe9c2] animate-twinkle"       style="top:22%;left:42%;width:1.5px;height:1.5px;opacity:.4;animation-delay:2.1s" />
    </template>

    <!-- Labels -->
    <p class="relative z-10 text-xl font-bold tracking-[1.5px] text-white/90 uppercase">
      {{ nextPrayer }} {{ t.in }}
    </p>
    <p class="relative z-10 font-medium text-white leading-none tracking-tight"
       style="font-size: clamp(36px,10vw,52px)">
      {{ countdown }}
    </p>

    <!-- Celestial body -->
    <div
      class="relative flex items-center justify-center"
      :class="theme.bottom ? 'mt-auto' : 'mt-7 mb-2'"
      :style="theme.bottom ? 'transform: translateY(42%)' : ''"
    >
      <!-- Outer ring -->
      <div
        class="absolute rounded-full animate-pulse-ring"
        :style="{ width: theme.size + 52 + 'px', height: theme.size + 52 + 'px', background: theme.ring }"
      />
      <!-- Inner ring -->
      <div
        class="absolute rounded-full animate-pulse-ring-delay"
        :style="{ width: theme.size + 26 + 'px', height: theme.size + 26 + 'px', background: theme.ring }"
      />
      <!-- Body -->
      <div
        class="relative z-10 rounded-full flex items-center justify-center"
        :style="{ width: theme.size + 'px', height: theme.size + 'px', background: theme.sun, boxShadow: `0 0 28px ${theme.ring}` }"
      >
        <svg v-if="theme.moon" viewBox="0 0 24 24" fill="currentColor"
          :width="theme.size * 0.55" :height="theme.size * 0.55"
          style="color:#111612;opacity:0.65">
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>
        </svg>
      </div>
    </div>
  </div>
</template>
