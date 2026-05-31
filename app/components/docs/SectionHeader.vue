<template>
  <div class="space-y-1.5 mb-2">
    <div v-if="eyebrow" class="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-600">
      {{ eyebrow }}
    </div>
    <h2 class="text-2xl font-bold tracking-tight text-gray-900">{{ title }}</h2>
    <p v-if="desc" class="text-sm text-gray-500 max-w-2xl leading-relaxed">{{ desc }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; desc?: string; eyebrow?: string }>()
</script>
