<template>
  <div class="group rounded-xl overflow-hidden bg-[#0b1020] border border-gray-800/80 shadow-sm">
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-gray-800/80 bg-[#0f172a]">
      <div class="flex items-center gap-2">
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span class="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span class="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </span>
        <span class="ml-2 text-[11px] font-mono uppercase tracking-wider text-gray-400 select-none">{{ language }}</span>
      </div>
      <button
        type="button"
        class="text-[11px] text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5"
        @click="copy"
      >
        <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" class="w-3.5 h-3.5" />
        <span>{{ copied ? 'Copied' : 'Copy' }}</span>
      </button>
    </div>
    <pre class="overflow-x-auto text-[12.5px] leading-relaxed text-gray-100 p-4 font-mono"><code>{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ code: string; language?: string }>(), {
  language: 'vue'
})

const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    // ignore
  }
}
</script>
