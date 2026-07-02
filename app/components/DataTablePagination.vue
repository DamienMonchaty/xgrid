<template>
  <div v-if="show" class="mt-2 px-2 pb-2">
    <!-- Classic pagination -->
    <nav
      v-if="actualMode === 'paginated'"
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      :aria-label="TEXT_LABELS.PAGINATION_NAVIGATION"
    >
      <div
        :class="`order-2 sm:order-1 min-w-0 flex-1 ${computedTheme.paginationText}`"
        role="status"
        aria-live="polite"
        :title="paginationInfo"
      >
        <!-- Indicateur de loading pour la pagination -->
        <div v-if="isInitialLoading" class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span class="truncate">{{ paginationInfo }} - {{ TEXT_LABELS.LOADING }}</span>
        </div>
        <span v-else class="block truncate">{{ paginationInfo }}</span>
      </div>

      <div class="order-1 sm:order-2 flex items-center gap-3">
        <!-- Page Size Selector -->
        <div
          v-if="pageSizeSelector && (pageSizeSelector === true || Array.isArray(pageSizeSelector))"
          class="flex items-center gap-2"
        >
          <span :class="computedTheme.paginationText" class="text-sm whitespace-nowrap">Rows:</span>
          <select
            v-model="pageSizeModel"
            class="rounded-lg border border-gray-200 py-1 pl-2.5 pr-7 text-sm bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors cursor-pointer"
          >
            <option v-for="opt in pageSizeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <!-- Page navigation -->
        <div class="flex items-center gap-1">
          <button
            type="button"
            :disabled="pageModel <= 1 || isInitialLoading"
            aria-label="Previous page"
            class="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            @click="pageModel > 1 && (pageModel = pageModel - 1)"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd"/>
            </svg>
          </button>

          <template v-for="(p, i) in pageRange" :key="i">
            <span
              v-if="p === '...'"
              class="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400 select-none"
            >…</span>
            <button
              v-else
              type="button"
              :disabled="isInitialLoading"
              :aria-current="p === pageModel ? 'page' : undefined"
              :class="[
                'inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
                p === pageModel
                  ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-700'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40'
              ]"
              @click="pageModel = (p as number)"
            >{{ p }}</button>
          </template>

          <button
            type="button"
            :disabled="pageModel >= totalPages || isInitialLoading"
            aria-label="Next page"
            class="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            @click="pageModel < totalPages && (pageModel = pageModel + 1)"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- Load More pagination -->
    <div v-else-if="actualMode === 'loadMore'" :class="ALIGNMENT_CLASSES.center">
      <div :class="`mb-4 ${computedTheme.paginationText}`">
        {{ loadMoreInfo }}
      </div>

      <button
        v-if="shouldShowLoadMoreButton"
        type="button"
        @click="onLoadMore"
        :disabled="loadingState === LoadingState.LOADING_MORE"
        :aria-label="TEXT_LABELS.PAGINATION_NAVIGATION"
        class="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
      >
        {{ getLoadMoreButtonText() }}
      </button>

      <div v-if="loadingState === LoadingState.LOADING_MORE && isServerMode" class="flex items-center justify-center gap-3">
        <div class="h-5 w-5 rounded-full animate-pulse bg-gray-200" />
        <span :class="computedTheme.loadingText">{{ TEXT_LABELS.LOADING }}</span>
      </div>

      <p v-if="!hasMoreData" :class="computedTheme.infoText">
        {{ TEXT_LABELS.ALL_LOADED }}
      </p>
    </div>

    <!-- Grid infinite scroll pagination (scroll inside the table container) -->
    <div v-else-if="actualMode === 'gridInfinite'" :class="ALIGNMENT_CLASSES.center">
      <!--
        gridInfinite uses an internal scroll container + optional page cache eviction.
        Showing "X of Y items loaded" becomes misleading because cached mode keeps a
        fixed window of rows (e.g. 50) even if the user already loaded more.
        The table already shows skeleton rows while fetching.
      -->
      <p v-if="isServerMode ? allDataLoaded : !canLoadMoreInClient" :class="computedTheme.infoText">
        {{ TEXT_LABELS.ALL_LOADED }}
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { ALIGNMENT_CLASSES, TEXT_LABELS } from '../constants/datatable.constants'
import { LoadingState } from '../composables/useDataTableCore'

type PaginationMode = 'paginated' | 'loadMore' | 'gridInfinite' | 'none'

type ThemeLike = Record<string, string | undefined>

type PageSizeOption = { value: number; label: string }

const props = defineProps<{
  show: boolean
  actualMode: PaginationMode

  computedTheme: ThemeLike

  isInitialLoading: boolean
  loadingState: LoadingState

  isServerMode: boolean
  totalItems: number

  // Models
  page: number
  pageSize: number

  // Page size selector
  pageSizeSelector?: boolean | number[]
  pageSizeOptions: PageSizeOption[]

  // Texts
  paginationInfo: string
  loadMoreInfo: string

  // LoadMore
  hasMoreData: boolean
  shouldShowLoadMoreButton: boolean
  onLoadMore: () => void
  getLoadMoreButtonText: () => string

  // Infinite/gridInfinite state
  allDataLoaded: boolean
  canLoadMoreInClient: boolean

  // Ref bridge (for IntersectionObserver in parent)
  setInfiniteScrollTrigger?: (el: HTMLElement | null) => void
}>()

const emit = defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.pageSize)))

function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)
  const items: (number | '...')[] = [1]
  if (left > 2) items.push('...')
  for (let i = left; i <= right; i++) items.push(i)
  if (right < total - 1) items.push('...')
  items.push(total)
  return items
}

const pageRange = computed(() => buildPageRange(pageModel.value, totalPages.value))

const pageModel = computed({
  get: () => props.page,
  set: (value: number) => emit('update:page', value)
})

const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (value: number) => emit('update:pageSize', value)
})

const setTriggerRef = (ref: Element | ComponentPublicInstance | null) => {
  if (!props.setInfiniteScrollTrigger) return
  props.setInfiniteScrollTrigger(ref instanceof HTMLElement ? ref : null)
}
</script>
