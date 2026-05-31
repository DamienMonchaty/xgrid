<template>
  <div class="flex items-start gap-3 p-4 rounded-xl border border-gray-200/80 bg-white hover:border-indigo-300 hover:shadow-[0_1px_2px_rgba(99,102,241,0.05),0_8px_24px_-12px_rgba(99,102,241,0.18)] transition-all">
    <div class="shrink-0 w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
      <UIcon :name="icon" class="w-4.5 h-4.5" />
    </div>
    <div class="min-w-0">
      <div class="text-sm font-semibold text-gray-900 leading-tight">{{ label }}</div>
      <div class="text-xs text-gray-500 mt-1 leading-relaxed">{{ desc }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon: string; label: string; desc: string }>()
</script>
