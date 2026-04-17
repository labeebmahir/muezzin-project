<template>
  <button
    class="flex items-center justify-between px-4 py-4 rounded-xl transition-colors w-full"
    :class="selected ? 'bg-gold border-transparent text-nt' : 'bg-card text-fg'"
    @click="$emit('select')"
  >
    <span class="text-md font-semibold">{{ label }}</span>
    <span
      class="w-7 h-7 rounded-full bg-card flex items-center justify-center shrink-0"
      :class="!selected && 'invisible'"
    >
      <Check :size="14" stroke-width="3" class="text-gold" />
    </span>
  </button>
</template>

<script setup>
import { Check } from 'lucide-vue-next'

defineProps({
  label:    { type: String, required: true },
  selected: { type: Boolean, default: false },
})
defineEmits(['select'])
</script>
