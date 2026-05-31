<template>
  <div class="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.08)]">
    <div
      v-if="title || $slots.actions"
      class="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3"
    >
      <div class="min-w-0">
        <h3 class="text-sm font-semibold text-gray-900 leading-tight">{{ title }}</h3>
        <p v-if="desc" class="text-xs text-gray-500 mt-1 leading-relaxed">{{ desc }}</p>
      </div>
      <div class="shrink-0 flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <div class="p-6">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string; desc?: string }>()
</script>
