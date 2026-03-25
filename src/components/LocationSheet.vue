<script setup>
import { ref, computed } from 'vue'
import { Search, X, Navigation, MapPinOff, Check } from 'lucide-vue-next'
import { useSettings } from '../composables/useSettings.js'
import { useI18n } from '../composables/useI18n.js'
import ZONES from '../data/zones.json'

const props = defineProps({ visible: { type: Boolean, default: false } })
const emit = defineEmits(['close'])

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

function selectDistrict(item) {
  settings.locationMode = 'manual'
  settings.zone = item.zone
  settings.district = item.district
  query.value = ''
  emit('close')
}

function selectAuto() {
  settings.locationMode = 'auto'
  emit('close')
}
</script>

<template>
  <Transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-40 bg-black/50" @click="emit('close')" />
  </Transition>

  <Transition name="slide-up">
    <div
      v-if="visible"
      class="fixed bottom-0 inset-x-0 mx-auto w-full z-50 bg-card rounded-t-2xl border-t border-x border-(--bdr) flex flex-col max-h-[75vh]"
      style="max-width: 480px"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
        <h2 class="text-[15px] font-bold text-fg">{{ t.selectLocation }}</h2>
        <button class="p-1.5 rounded-lg text-muted hover:text-fg transition-colors" @click="emit('close')">
          <X :size="18" stroke-width="2.2" />
        </button>
      </div>

      <!-- Search -->
      <div class="relative px-4 pb-3 shrink-0">
        <Search :size="15" class="absolute left-7 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          v-model="query"
          type="search"
          v-bind:placeholder="t.searchLocation"
          class="w-full bg-bg border border-(--bdr) rounded-xl pl-8 pr-8 py-2.5 text-[14px] text-fg placeholder:text-muted outline-none focus:border-gold transition-colors"
        />
        <button v-if="query" class="absolute right-7 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
          @click="query = ''">
          <X :size="14" />
        </button>
      </div>

      <!-- List -->
      <div class="flex flex-col gap-1 px-4 pb-6 overflow-y-auto">
        <!-- Auto GPS (only when not searching) -->
        <button v-if="!query"
          class="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-colors text-left"
          :class="settings.locationMode === 'auto'
            ? 'bg-next text-nt border-transparent'
            : 'border-(--bdr) text-muted hover:text-fg'"
          @click="selectAuto">
          <Navigation :size="14" />
          <span class="text-sm font-semibold flex-1">{{ t.locationAuto }}</span>
          <Check v-if="settings.locationMode === 'auto'" :size="14" stroke-width="2.5" />
        </button>

        <!-- Districts -->
        <button
          v-for="item in filtered" :key="item.district"
          class="flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-colors text-left"
          :class="settings.locationMode === 'manual' && settings.district === item.district
            ? 'bg-next text-nt border-transparent'
            : 'border-(--bdr) text-muted hover:text-fg'"
          @click="selectDistrict(item)">
          <span class="text-sm font-semibold">{{ item.district }}</span>
          <div class="flex items-center gap-2">
            <span class="text-[11px] opacity-60">{{ t.zone }} {{ item.zone }}</span>
            <Check v-if="settings.locationMode === 'manual' && settings.district === item.district"
              :size="13" stroke-width="2.5" />
          </div>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
</style>
