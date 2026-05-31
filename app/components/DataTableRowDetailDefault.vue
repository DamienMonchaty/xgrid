<template>
  <div v-if="loading" class="space-y-2">
    <div class="flex items-center gap-3">
      <div class="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
      <span :class="loadingTextClass">{{ TEXT_LABELS.LOADING }}</span>
    </div>
    <div class="h-4 w-1/3 rounded bg-gray-200 animate-pulse" />
    <div class="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
  </div>

  <div v-else-if="hasError" class="space-y-2">
    <div class="text-sm text-red-600">{{ errorText }}</div>
    <button type="button" @click="onRetry"
      class="inline-flex items-center px-2.5 py-1 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
      Retry
    </button>
  </div>

  <pre v-else class="text-xs whitespace-pre-wrap">{{ jsonText }}</pre>
</template>

<script setup lang="ts">
import { TEXT_LABELS } from '../constants/datatable.constants'

const props = defineProps<{
  loading: boolean
  error: unknown
  detail: unknown
  loadingTextClass: string
  onRetry: () => void
}>()

const hasError = computed(() => !!props.error)

const errorText = computed(() => {
  if (!props.error) return ''
  if (typeof props.error === 'string') return props.error
  if (props.error instanceof Error) return props.error.message
  try {
    return JSON.stringify(props.error)
  } catch {
    return String(props.error)
  }
})

const jsonText = computed(() => {
  try {
    return JSON.stringify(props.detail, null, 2)
  } catch {
    return String(props.detail)
  }
})
</script>
