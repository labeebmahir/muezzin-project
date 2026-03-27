<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, X } from 'lucide-vue-next'
import PageHeader from './PageHeader.vue'
import SelectOption from './SelectOption.vue'
import { useSettings } from '../composables/useSettings.js'
import { useI18n } from '../composables/useI18n.js'
import ZONES from '../data/zones.json'

const emit = defineEmits(['back', 'locate'])
const { settings } = useSettings()
const { t } = useI18n()

const locationPermission = ref('prompt') // 'granted' | 'denied' | 'prompt'

onMounted(async () => {
  const perm = await navigator.permissions?.query({ name: 'geolocation' }).catch(() => null)
  if (perm) {
    locationPermission.value = perm.state
    perm.onchange = () => { locationPermission.value = perm.state }
  }
})

const query = ref('')

const allDistricts = ZONES
  .flatMap(z => z.districts.map(d => ({ ...d, zone: z.zone })))
  .sort((a, b) => a.en.localeCompare(b.en))

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  const lang = settings.language ?? 'en'
  return q
    ? allDistricts.filter(d =>
        d.en.toLowerCase().includes(q) ||
        (d[lang] ?? '').toLowerCase().includes(q)
      )
    : allDistricts
})

function localName(d) {
  return d[settings.language ?? 'en'] ?? d.en
}

const locating = ref(false)

async function selectAuto() {
  settings.locationMode = 'auto'
  locating.value = true
  emit('locate')
}

defineExpose({ doneLocating: () => { locating.value = false } })

function selectDistrict(item) {
  settings.locationMode = 'manual'
  settings.zone = item.zone
  settings.district = item.en  // always store English key
  query.value = ''
}
</script>

<template>
  <div class="min-h-screen pb-10 page-content">
    <PageHeader :title="t.location" @back="$emit('back')" />

    <div class="flex flex-col gap-4 px-4">
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
        <div v-if="!query" :class="locationPermission !== 'granted' && 'opacity-40 pointer-events-none'">
          <SelectOption
            :label="locating ? t.locationDetecting ?? 'Detecting…' : t.locationAuto"
            :selected="settings.locationMode === 'auto'"
            @select="selectAuto"
          />
        </div>

        <!-- District list -->
        <SelectOption
          v-for="item in filtered" :key="item.en"
          :label="localName(item)"
          :selected="settings.locationMode === 'manual' && settings.district === item.en"
          @select="selectDistrict(item)"
        />
      </div>
    </div>
  </div>
</template>
