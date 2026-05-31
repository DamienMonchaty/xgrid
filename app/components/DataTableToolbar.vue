<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <!-- Left side: Title and info -->
    <div class="flex items-center gap-3">
      <div v-if="toolbarConfig?.title" class="flex items-center gap-2">
        <!-- dynamic icon: rendered as a generic placeholder since icon names are user-supplied -->
        <span v-if="toolbarConfig?.icon" class="w-5 h-5 text-gray-600 flex items-center justify-center" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2z"/></svg>
        </span>
        <h2 class="text-xl font-semibold text-gray-900">{{ toolbarConfig.title }}</h2>
      </div>
      <span v-if="selectedCount > 0 && selectable" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-600/20">
        {{ selectedCount }} selected
      </span>
      <span v-if="totalItems" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/10">
        {{ totalItems }} item{{ totalItems > 1 ? 's' : '' }}
      </span>

      <!-- Custom filters slot -->
      <slot name="filters" />
    </div>

    <!-- Right side: Search and actions -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- Search -->
      <div v-if="toolbarConfig?.searchable" class="relative min-w-64">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          v-model="searchModel"
          type="search"
          :placeholder="toolbarConfig?.searchPlaceholder || 'Search...'"
          class="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <!-- Bulk actions when items are selected -->
      <template v-if="selectedCount > 0 && bulkActions.length">
        <button v-for="action in bulkActions" :key="action.key" type="button"
          :class="getBulkActionClasses(action)"
          @click="$emit('bulk-action', action.key, selectedIds)">
          {{ action.label }}
        </button>
      </template>

      <!-- Normal toolbar actions when no selection -->
      <template v-else>
        <!-- Custom actions slot when no selection -->
        <slot name="actions" />

        <!-- Column Menu with Tabs -->
        <div v-if="toolbarConfig?.showColumns !== false" class="relative" ref="columnsPopoverRef">
          <button type="button"
            class="inline-flex items-center justify-center p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            title="Manage columns"
            @click="columnsOpen = !columnsOpen"
          >
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 3.75a2 2 0 10-4 0 2 2 0 004 0zM17.25 4.5a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM5 3.75a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM4.25 17a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM17.25 17a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM9 10a.75.75 0 01-.75.75h-5.5a.75.75 0 010-1.5h5.5A.75.75 0 019 10zM17.25 10.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM14 10a2 2 0 10-4 0 2 2 0 004 0zM10 16.25a2 2 0 10-4 0 2 2 0 004 0z"/>
            </svg>
          </button>
          <!-- Dropdown panel -->
          <div
            v-if="columnsOpen"
            class="absolute right-0 top-full mt-1 min-w-[280px] max-w-[400px] bg-white border border-gray-200 rounded-lg shadow-lg z-[70] flex flex-col"
          >
            <div class="min-w-[280px] max-w-[400px] max-h-[500px] flex flex-col relative z-[70]">
              <!-- Tabs Navigation - Always show both tabs if there are filterable columns -->
              <div class="flex border-b border-gray-200 flex-shrink-0">
                <button @click="activeTab = 'columns'" :class="[
                  'flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors text-center flex items-center justify-center gap-2 border-l-0 border-r-0 border-t-0 outline-none focus:outline-none',
                  activeTab === 'columns'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                ]" :title="'Manage columns'">
                  <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 012 10z"/></svg>
                  <span class="hidden sm:inline">Columns</span>
                </button>
                <button v-if="hasFilterableColumns" @click="activeTab = 'filters'" :class="[
                  'flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors text-center flex items-center justify-center gap-2 border-l-0 border-r-0 border-t-0 outline-none focus:outline-none',
                  activeTab === 'filters'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                ]" :title="'Filter data'">
                  <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clip-rule="evenodd"/></svg>
                  <span class="hidden sm:inline">Filters</span>
                </button>
              </div>

              <!-- Scrollable Content Area -->
              <div class="overflow-y-auto p-3 max-h-[400px]">
                <!-- Columns Tab Content -->
                <div v-if="activeTab === 'columns'" class="space-y-3">
                  <div class="mb-2">
                    <div class="text-sm font-medium text-gray-700">Column visibility</div>
                    <div class="text-xs text-gray-500">Select and reorder columns</div>
                  </div>

                  <div class="space-y-2">
                    <div v-for="col in displayColumns" :key="col.key"
                      class="flex items-center justify-between hover:bg-gray-50 cursor-move group" draggable="true"
                      @dragstart="onColumnMenuDragStart($event, col.key)" @dragover.prevent
                      @drop="onColumnMenuDrop($event, col.key)">
                      <label class="flex items-center space-x-2 cursor-pointer py-1">
                        <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600 cursor-grab" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2a1 1 0 110 2 1 1 0 010-2zm0 6a1 1 0 110 2 1 1 0 010-2zm0 6a1 1 0 110 2 1 1 0 010-2zm6-12a1 1 0 110 2 1 1 0 010-2zm0 6a1 1 0 110 2 1 1 0 010-2zm0 6a1 1 0 110 2 1 1 0 010-2z"/></svg>
                        <input
                          type="checkbox"
                          :checked="visibleColumns[col.key]"
                          class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                          @change="(e) => toggleColumn(col.key, (e.target as HTMLInputElement).checked)"
                          @click.stop
                        />
                        <span class="text-sm text-gray-700">{{ col.label }}</span>
                      </label>
                    </div>
                  </div>

                  <hr class="my-2 border-gray-200" />
                  <div class="text-xs text-gray-400">💡 Drag items to reorder</div>
                </div>

                <!-- Filters Tab Content -->
                <div v-else-if="activeTab === 'filters'" class="space-y-3">
                  <div class="mb-2">
                    <div class="text-sm font-medium text-gray-700">Column filters</div>
                    <div class="text-xs text-gray-500">Configure filters by column</div>
                  </div>

                  <div class="space-y-3">
                    <div v-for="col in filterableColumns" :key="`filter-${col.key}`"
                      class="border border-gray-200 rounded-md p-3">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-700">{{ col.label }}</span>
                        <button v-if="hasActiveFilter(col.key)" type="button"
                          class="inline-flex items-center justify-center w-5 h-5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                          @click="clearColumnFilter(col.key)">
                          <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
                          </svg>
                        </button>
                      </div>

                      <!-- Text filter with operator selection (like in DataTable) -->
                      <div v-if="col.filterType === 'text'" class="space-y-2">
                        <select
                          :value="getFilterValue(col.key).operator"
                          class="block w-full rounded-md border border-gray-300 py-1.5 pl-3 pr-7 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          @change="(e) => setFilterField(col.key, 'operator', (e.target as HTMLSelectElement).value)"
                        >
                          <option v-for="item in getTextFilterOperators()" :key="item.value" :value="item.value">{{ item.label }}</option>
                        </select>
                        <input
                          :value="getFilterValue(col.key).value"
                          type="text"
                          :placeholder="`Search ${col.label.toLowerCase()}...`"
                          class="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          @input="(e) => setFilterField(col.key, 'value', (e.target as HTMLInputElement).value)"
                        />
                      </div>

                      <!-- Select filter (multi-select with checkboxes like in DataTable) -->
                      <div v-else-if="col.filterType === 'select'" class="space-y-1 max-h-32 overflow-y-auto">
                        <label v-for="option in col.filterOptions" :key="getOptionKey(option)"
                          class="flex items-center gap-2 cursor-pointer py-0.5">
                          <input
                            type="checkbox"
                            :checked="getSelectFilterValue(col.key)[getOptionKey(option)]"
                            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                            @change="(e) => onSelectFilterToggle(col.key, getOptionKey(option), (e.target as HTMLInputElement).checked)"
                          />
                          <span class="text-sm text-gray-700">{{ getOptionLabel(option) }}</span>
                        </label>
                      </div>

                      <!-- Boolean filter (like in DataTable) -->
                      <div v-else-if="col.filterType === 'boolean'" class="space-y-2">
                        <select
                          :value="String(getFilterValue(col.key).value)"
                          class="block w-full rounded-md border border-gray-300 py-1.5 pl-3 pr-7 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          @change="(e) => setFilterField(col.key, 'value', parseBooleanFilterValue((e.target as HTMLSelectElement).value))"
                        >
                          <option value="null">Tous</option>
                          <option value="true">Vrai</option>
                          <option value="false">Faux</option>
                        </select>
                      </div>

                      <!-- Date range filter (like in DataTable) -->
                      <div v-else-if="col.filterType === 'dateRange'" class="space-y-2">
                        <select
                          :value="getFilterValue(col.key).operator"
                          class="block w-full rounded-md border border-gray-300 py-1.5 pl-3 pr-7 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          @change="(e) => setFilterField(col.key, 'operator', (e.target as HTMLSelectElement).value)"
                        >
                          <option v-for="item in getDateFilterOperators()" :key="item.value" :value="item.value">{{ item.label }}</option>
                        </select>
                        <input :value="getFilterValue(col.key).value" type="date" placeholder="De"
                          class="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          @input="(e) => setFilterField(col.key, 'value', (e.target as HTMLInputElement).value)" />
                        <input v-if="getFilterValue(col.key).operator === 'between'"
                          :value="getFilterValue(col.key).value2" type="date" placeholder="À"
                          class="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          @input="(e) => setFilterField(col.key, 'value2', (e.target as HTMLInputElement).value)" />
                      </div>

                      <!-- Number range filter (like in DataTable) -->
                      <div v-else-if="col.filterType === 'numberRange'" class="space-y-2">
                        <select
                          :value="getFilterValue(col.key).operator"
                          class="block w-full rounded-md border border-gray-300 py-1.5 pl-3 pr-7 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          @change="(e) => setFilterField(col.key, 'operator', (e.target as HTMLSelectElement).value)"
                        >
                          <option v-for="item in getNumberFilterOperators()" :key="item.value" :value="item.value">{{ item.label }}</option>
                        </select>
                        <input :value="getFilterValue(col.key).value" type="number" placeholder="Valeur"
                          class="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          @input="(e) => setFilterField(col.key, 'value', (e.target as HTMLInputElement).value)" />
                        <input v-if="getFilterValue(col.key).operator === 'between'"
                          :value="getFilterValue(col.key).value2" type="number" placeholder="Valeur max"
                          class="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          @input="(e) => setFilterField(col.key, 'value2', (e.target as HTMLInputElement).value)" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fixed Footer -->
              <div v-if="hasFilterableColumns && activeTab === 'filters'"
                class="border-t border-gray-200 p-3 flex-shrink-0">
                <div class="flex justify-between items-center">
                  <div class="text-xs text-gray-400">{{ filterableColumns.length }} filtre{{ filterableColumns.length >
                    1 ? 's' : '' }} disponible{{ filterableColumns.length > 1 ? 's' : '' }}</div>
                  <button v-if="Object.keys(columnFilters).some(key => columnFilters[key])" type="button"
                    class="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    @click="clearAllFilters">
                    Clear all
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Export button -->
        <button v-if="toolbarConfig?.showExport" type="button"
          class="inline-flex items-center justify-center p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          title="Export"
          @click="$emit('export')">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z"/>
            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"/>
          </svg>
        </button>

        <!-- Refresh button -->
        <button v-if="toolbarConfig?.showRefresh" type="button"
          :disabled="refreshing"
          class="inline-flex items-center justify-center p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Refresh"
          @click="$emit('refresh')">
          <svg :class="['w-4 h-4', refreshing ? 'animate-spin' : '']" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 100 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd"/>
          </svg>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
// Import types from DataTable to ensure compatibility
import { getFilterTypeFromColumnType } from '../types/datatable.types'
import type {
  Column,
  ColumnFilter,
  FilterValue,
  FilterOption,
  FilterOperator
} from '../types/datatable.types'
import type { ToolbarConfig } from '../composables/useDataTableCore'
import { buildDefaultColumnFilterValue } from '../utils/datatable-filters'
import { deepClone } from '../utils/structural'

interface BulkAction {
  key: string
  label: string
  variant?: 'link' | 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost'
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
}

// Props
const props = withDefaults(defineProps<{
  columns?: Column[]
  orderedColumns?: Column[]
  visibleColumns?: Record<string, boolean>
  toolbarConfig?: ToolbarConfig | null
  search?: string
  filters?: ColumnFilter
  selectedCount?: number
  selectedIds?: (string | number)[]
  totalItems?: number
  bulkActions?: BulkAction[]
  refreshing?: boolean
  selectable?: boolean
}>(), {
  columns: () => [],
  orderedColumns: () => [],
  visibleColumns: () => ({}),
  toolbarConfig: null,
  search: '',
  filters: () => ({}),
  selectedCount: 0,
  selectedIds: () => [],
  totalItems: 0,
  bulkActions: () => [],
  refreshing: false,
  selectable: false
})

// Emits
const emit = defineEmits<{
  'search': [value: string]
  'column-toggle': [key: string, visible: boolean]
  'column-filter': [key: string, value: FilterValue | unknown]
  'column-reorder': [newOrder: string[]]
  'export': []
  'refresh': []
  'bulk-action': [action: string, ids: (string | number)[]]
}>()

// Local state
const columnsOpen = ref(false)
const columnsPopoverRef = ref<HTMLElement | null>(null)
onClickOutside(columnsPopoverRef, () => { columnsOpen.value = false })
const activeTab = ref<'columns' | 'filters'>('columns')
const columnFilters = ref<ColumnFilter>({})
const draggedColumn = ref('')

const searchModel = computed({
  get: () => props.search ?? '',
  set: (value: string) => emit('search', value)
})

// Keep toolbar filters UI in sync with DataTable (single source of truth)
watch(
  () => props.filters,
  (newFilters) => {
    columnFilters.value = deepClone((newFilters || {}) as ColumnFilter)
  },
  { immediate: true, deep: true }
)

// Computed properties
const hasFilterableColumns = computed(() => {
  return props.columns.some(col => col.filterable)
})

const filterableColumns = computed(() => {
  return props.columns.filter(col => col.filterable)
})

// Display columns in the correct order for the menu
const displayColumns = computed(() => {
  const columnOrder = props.orderedColumns.map(col => col.key)
  return props.columns
    .filter(c => c.key !== 'actions')
    .sort((a, b) => {
      const aIndex = columnOrder.indexOf(a.key)
      const bIndex = columnOrder.indexOf(b.key)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
})

// Methods
function toggleColumn(key: string, visible: boolean) {
  emit('column-toggle', key, visible)
}

const BULK_VARIANTS: Record<string, Record<string, string>> = {
  solid:   { primary: 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700', error: 'bg-red-600 border-red-600 text-white hover:bg-red-700', success: 'bg-green-600 border-green-600 text-white hover:bg-green-700', warning: 'bg-yellow-500 border-yellow-500 text-white hover:bg-yellow-600', neutral: 'bg-gray-600 border-gray-600 text-white hover:bg-gray-700', secondary: 'bg-secondary-600 border-secondary-600 text-white hover:bg-secondary-700' },
  outline: { primary: 'border-primary-300 text-primary-700 bg-white hover:bg-primary-50', error: 'border-red-300 text-red-700 bg-white hover:bg-red-50', success: 'border-green-300 text-green-700 bg-white hover:bg-green-50', warning: 'border-yellow-300 text-yellow-700 bg-white hover:bg-yellow-50', neutral: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50', secondary: 'border-secondary-300 text-secondary-700 bg-white hover:bg-secondary-50' },
  soft:    { primary: 'border-transparent bg-primary-50 text-primary-700 hover:bg-primary-100', error: 'border-transparent bg-red-50 text-red-700 hover:bg-red-100', success: 'border-transparent bg-green-50 text-green-700 hover:bg-green-100', warning: 'border-transparent bg-yellow-50 text-yellow-700 hover:bg-yellow-100', neutral: 'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200', secondary: 'border-transparent bg-secondary-50 text-secondary-700 hover:bg-secondary-100' },
  ghost:   { primary: 'border-transparent text-primary-600 hover:bg-primary-50', error: 'border-transparent text-red-600 hover:bg-red-50', success: 'border-transparent text-green-600 hover:bg-green-50', warning: 'border-transparent text-yellow-600 hover:bg-yellow-50', neutral: 'border-transparent text-gray-600 hover:bg-gray-100', secondary: 'border-transparent text-secondary-600 hover:bg-secondary-50' },
}

function getBulkActionClasses(action: BulkAction): string {
  const base = 'inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
  const variant = action.variant || 'solid'
  const color = action.color || 'neutral'
  const variantMap = BULK_VARIANTS[variant] || BULK_VARIANTS.solid
  const colorClass = (variantMap ?? BULK_VARIANTS['solid']!)[color] ?? (variantMap ?? BULK_VARIANTS['solid']!)['neutral'] ?? ''
  return `${base} ${colorClass}`
}

// Filter helpers (shared)
const operatorLists = {
  text: [
    { value: 'contains', label: 'Contient' },
    { value: 'eq', label: 'Égal à' },
    { value: 'ne', label: 'Différent de' },
    { value: 'startsWith', label: 'Commence par' },
    { value: 'endsWith', label: 'Finit par' },
    { value: 'regex', label: 'Expression régulière' }
  ],
  date: [
    { value: 'eq', label: 'Égal à' },
    { value: 'ne', label: 'Différent de' },
    { value: 'gt', label: 'Après' },
    { value: 'gte', label: 'Après ou égal' },
    { value: 'lt', label: 'Avant' },
    { value: 'lte', label: 'Avant ou égal' },
    { value: 'between', label: 'Entre' }
  ],
  number: [
    { value: 'eq', label: 'Égal à' },
    { value: 'ne', label: 'Différent de' },
    { value: 'gt', label: 'Supérieur à' },
    { value: 'gte', label: 'Supérieur ou égal' },
    { value: 'lt', label: 'Inférieur à' },
    { value: 'lte', label: 'Inférieur ou égal' },
    { value: 'between', label: 'Entre' }
  ]
}

const {
  getFilterValue,
  ensureFilterValue,
  getSelectFilterValue,
  getOptionKey,
  getOptionLabel,
  getTextFilterOperators,
  getDateFilterOperators,
  getNumberFilterOperators,
  isFilterActive
} = useDataTableFiltersModel({
  columnFilters,
  columns: computed(() => props.columns),
  operatorLists
})

function hasActiveFilter(columnKey: string): boolean {
  return isFilterActive(columnKey)
}

function onFilterChange(columnKey: string) {
  // Emit filter change event to parent DataTable
  emit('column-filter', columnKey, columnFilters.value[columnKey])
}

// Convert the native <select> string value for boolean filters back to a real
// boolean / null (the <option value="..."> attribute always serializes to a
// string).
function parseBooleanFilterValue(raw: string): boolean | null {
  if (raw === 'true') return true
  if (raw === 'false') return false
  return null
}

// Materialize the FilterValue entry in columnFilters then assign one of its
// fields. Used by the structured filters (text / boolean / dateRange /
// numberRange) where v-model on a freshly-built object would otherwise be lost.
function setFilterField(
  columnKey: string,
  field: 'operator' | 'value' | 'value2',
  value: unknown
) {
  const entry = ensureFilterValue(columnKey)
  ;(entry as unknown as Record<string, unknown>)[field] = value
  emit('column-filter', columnKey, columnFilters.value[columnKey])
}

// Toggle a single checkbox in a multi-select column filter.
// Materializes the entry in columnFilters first so the mutation persists
// (getSelectFilterValue returns a fresh {} when no entry exists yet).
function onSelectFilterToggle(columnKey: string, optionKey: string, checked: boolean) {
  const current = columnFilters.value[columnKey]
  const map: Record<string, boolean> =
    (typeof current === 'object' && current !== null && !('operator' in current))
      ? (current as Record<string, boolean>)
      : {}
  map[optionKey] = checked
  columnFilters.value[columnKey] = map as unknown as FilterValue
  emit('column-filter', columnKey, columnFilters.value[columnKey])
}

function clearColumnFilter(key: string) {
  const column = props.columns.find(col => col.key === key)
  const filterType = column?.filterType ?? (column?.type ? getFilterTypeFromColumnType(column.type) : 'text')

  columnFilters.value[key] = buildDefaultColumnFilterValue({ column, filterType })

  emit('column-filter', key, columnFilters.value[key])
}

function clearAllFilters() {
  props.columns
    .filter(col => col.filterable)
    .forEach(col => {
      clearColumnFilter(col.key)
    })
}

// Column menu drag and drop functions (same as DataTable)
function onColumnMenuDragStart(e: DragEvent, column: string) {
  draggedColumn.value = column
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/column', column)
  }
}

function onColumnMenuDrop(e: DragEvent, targetColumn: string) {
  e.preventDefault()

  if (draggedColumn.value && draggedColumn.value !== targetColumn) {
    const currentOrder = props.orderedColumns.map(col => col.key)
    const draggedIndex = currentOrder.indexOf(draggedColumn.value)
    const targetIndex = currentOrder.indexOf(targetColumn)

    currentOrder.splice(draggedIndex, 1)
    currentOrder.splice(targetIndex, 0, draggedColumn.value)

    emit('column-reorder', currentOrder)
  }

  draggedColumn.value = ''
}

</script>
