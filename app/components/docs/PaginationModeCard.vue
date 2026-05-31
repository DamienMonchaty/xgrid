<template>
  <button
    type="button"
    class="w-full text-left p-4 rounded-xl border transition-all space-y-1.5"
    :class="active
      ? 'border-indigo-500 bg-indigo-50/60 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]'
      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="text-sm font-semibold" :class="active ? 'text-indigo-700' : 'text-gray-900'">{{ label }}</span>
      <span
        v-if="badge"
        class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
        :class="active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'"
      >{{ badge }}</span>
    </div>
    <p class="text-xs leading-relaxed" :class="active ? 'text-indigo-700/80' : 'text-gray-500'">{{ desc }}</p>
    <code class="block text-[10.5px] font-mono mt-1" :class="active ? 'text-indigo-500' : 'text-gray-400'">mode="{{ value }}"</code>
  </button>
</template>

<script setup lang="ts">
defineProps<{ value: string; label: string; desc: string; badge?: string; active?: boolean }>()
defineEmits(['click'])
</script>
