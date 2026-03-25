<script setup>
defineProps({ prayerKey: { type: String, required: true }, size: { type: Number, default: 22 } })

const paths = {
  fajr:    `<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>`,
  sunrise: `<path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M19.07 4.93l-1.41 1.41M20 12h2" stroke-linecap="round"/><path d="M8 12a4 4 0 018 0" stroke-linecap="round"/><line x1="2" y1="17" x2="22" y2="17" stroke-linecap="round"/>`,
  dhuhr:   `<circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke-linecap="round"/>`,
  asr:     `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" stroke-linecap="round"/><path d="M3 17h18" stroke-linecap="round" stroke-dasharray="2 3"/>`,
  maghrib: `<path d="M17 18a5 5 0 00-10 0"/><line x1="2" y1="18" x2="22" y2="18" stroke-linecap="round"/><path d="M12 2v9M4.22 10.22l1.42 1.42M18.36 11.64l1.42-1.42" stroke-linecap="round"/>`,
  isha:    `<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>`,
}
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
    v-html="paths[prayerKey] || ''" />
</template>
