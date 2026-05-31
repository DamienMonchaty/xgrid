<template>
  <div class="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200/80 bg-white">
    <code class="text-[12px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{{ value }}</code>
    <span class="text-xs text-gray-500">{{ desc }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ value: string; desc: string }>()
</script>
