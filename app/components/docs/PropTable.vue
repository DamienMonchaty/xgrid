<template>
  <div class="overflow-x-auto -mx-1 px-1">
    <div v-if="title" class="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500 mb-3">
      {{ title }}
    </div>
    <table class="w-full text-sm border-separate border-spacing-0">
      <thead>
        <tr>
          <th class="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-50/80 border-y border-gray-200 first:border-l first:rounded-l-lg w-52">Property</th>
          <th class="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-50/80 border-y border-gray-200 w-44">Type</th>
          <th v-if="hasDefault" class="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-50/80 border-y border-gray-200 w-24">Default</th>
          <th class="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-50/80 border-y border-gray-200 last:border-r last:rounded-r-lg">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in rows"
          :key="i"
          class="group"
        >
          <td class="py-2.5 px-3 border-b border-gray-100 group-hover:bg-gray-50/60 transition-colors">
            <code class="font-mono text-[12px] text-indigo-600 font-semibold">{{ row.name }}</code>
          </td>
          <td class="py-2.5 px-3 border-b border-gray-100 group-hover:bg-gray-50/60 transition-colors">
            <code class="font-mono text-[12px] text-gray-500">{{ row.type }}</code>
          </td>
          <td v-if="hasDefault" class="py-2.5 px-3 border-b border-gray-100 group-hover:bg-gray-50/60 transition-colors">
            <code class="font-mono text-[12px] text-amber-600">{{ row.default ?? '—' }}</code>
          </td>
          <td class="py-2.5 px-3 border-b border-gray-100 group-hover:bg-gray-50/60 transition-colors text-[13px] text-gray-700 leading-relaxed">
            {{ row.desc }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  rows: Array<{ name: string; type: string; default?: string; desc: string }>
  title?: string
  color?: string
}>()

const hasDefault = computed(() => props.rows.some(r => r.default !== undefined))
</script>
