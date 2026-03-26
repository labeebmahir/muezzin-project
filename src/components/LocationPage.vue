<script setup>
import { ref, computed } from 'vue'
import { Search, X, Navigation, Check } from 'lucide-vue-next'
import PageHeader from './PageHeader.vue'
import { useSettings } from '../composables/useSettings.js'
import { useI18n } from '../composables/useI18n.js'
import ZONES from '../data/zones.json'

defineEmits(['back'])
const { settings } = useSettings()
const { t } = useI18n()

const query = ref('')

const allDistricts = ZONES
  .flatMap(z => z.districts.map(d => ({ district: d, zone: z.zone })))
  .sort((a, b) => a.district.localeCompare(b.district))

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  return q ? allDistricts.filter(d => d.district.toLowerCase().includes(q)) : allDistricts
})

const isAutoSelected = computed(() => settings.locationMode === 'auto')

function selectAuto() {
  settings.locationMode = 'auto'
}

function selectDistrict(item) {
  settings.locationMode = 'manual'
  settings.zone = item.zone
  settings.district = item.district
  query.value = ''
}
</script>

<template>
  <div class="min-h-screen pb-10">
    <!-- Header -->
    <PageHeader :title="t.location" @back="$emit('back')" />

    <div class="flex flex-col gap-4 px-4 pt-16">
      <!-- Search bar -->
      <div class="relative">
        <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          v-model="query"
          type="search"
          :placeholder="t.searchLocation"
          class="w-full bg-card rounded-xl pl-11 pr-10 py-3.5 text-sm text-fg placeholder:text-white/20 outline-none focus:border-gold transition-colors"
        />
        <button v-if="query" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
          @click="query = ''">
          <X :size="16" />
        </button>
      </div>

      <div class="flex flex-col gap-2">
        <!-- Auto option (hidden while searching) -->
        <button
          v-if="!query"
          class="flex items-center gap-3 px-4 py-4 rounded-xl transition-colors text-left"
          :class="isAutoSelected ? 'bg-gold' : 'bg-card hover:bg-white/5'"
          @click="selectAuto"
        >
          <Navigation :size="18" stroke-width="1.5"
            :class="isAutoSelected ? 'text-nt' : 'text-muted'" />
          <span class="flex-1 text-sm font-semibold"
            :class="isAutoSelected ? 'text-nt' : 'text-fg'">Auto</span>
          <!-- Circle check -->
          <span v-if="isAutoSelected"
            class="w-7 h-7 rounded-full bg-card flex items-center justify-center shrink-0">
            <Check :size="14" stroke-width="3" class="text-white" />
          </span>
        </button>

        <!-- District list -->
        <button
          v-for="item in filtered" :key="item.district"
          class="flex items-center justify-between px-4 py-4 rounded-xl transition-colors text-left"
          :class="settings.locationMode === 'manual' && settings.district === item.district
            ? 'bg-gold'
            : 'bg-card  hover:bg-white/5'"
          @click="selectDistrict(item)"
        >
          <span class="text-sm font-semibold"
            :class="settings.locationMode === 'manual' && settings.district === item.district
              ? 'text-nt' : 'text-fg'">
            {{ item.district }}
          </span>
          <span v-if="settings.locationMode === 'manual' && settings.district === item.district"
            class="w-7 h-7 rounded-full bg-card flex items-center justify-center shrink-0">
            <Check :size="14" stroke-width="3" class="text-white" />
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
