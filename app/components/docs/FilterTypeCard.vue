<template>
  <div class="p-4 rounded-xl border border-gray-200/80 bg-white">
    <div class="flex items-center gap-2 mb-2.5">
      <code class="text-[12px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">{{ type }}</code>
    </div>
    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="op in operators"
        :key="op"
        class="text-[11px] font-mono px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-gray-600"
      >{{ op }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ type: string; operators: string[] }>()
</script>
