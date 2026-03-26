<template>
  <component
    :is="onClick ? 'button' : 'div'"
    class="flex items-center gap-3 px-4 py-3.5 bg-card rounded-xl transition-colors text-left w-full"
    v-bind="onClick ? { onClick } : {}"
  >
    <div class="w-10 h-10 rounded-full bg-icon-bg flex items-center justify-center text-gold shrink-0">
      <slot name="icon" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-md font-semibold text-fg">{{ title }}</p>
      <p v-if="subtitle" class="text-sm text-muted truncate">{{ subtitle }}</p>
      <slot name="subtitle-slot" />
    </div>
    <slot name="right" />
  </component>
</template>

<script setup>
defineProps({
  title:    { type: String, required: true },
  subtitle: { type: String, default: '' },
  onClick:  { type: Function, default: null },
})
</script>
