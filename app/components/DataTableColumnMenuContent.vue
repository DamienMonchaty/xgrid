<template>
  <div class="min-w-[280px] max-w-[400px] max-h-[500px] flex flex-col relative z-[70]">
    <!-- Tabs Navigation -->
    <div class="flex border-b border-gray-200 flex-shrink-0">
      <button
        type="button"
        @click="setActiveTab(column.key, 'columns')"
        :class="[
          'flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors text-center flex items-center justify-center gap-2 border-l-0 border-r-0 border-t-0 outline-none focus:outline-none',
          (activeTab || 'columns') === 'columns'
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 012 10z"/></svg>
        <span>Columns</span>
      </button>

      <button
        type="button"
        @click="setActiveTab(column.key, 'filters')"
        :class="[
          'flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors text-center flex items-center justify-center gap-2 border-l-0 border-r-0 border-t-0 outline-none focus:outline-none',
          (activeTab || 'columns') === 'filters'
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clip-rule="evenodd"/></svg>
        <span>Filters</span>
      </button>
    </div>

    <!-- Scrollable Content Area -->
    <div class="overflow-y-auto p-3 max-h-[400px]">
      <!-- Columns Tab Content -->
      <div v-if="(activeTab || 'columns') === 'columns'" class="space-y-3">
        <div class="mb-2">
          <div class="text-sm font-medium text-gray-700">Column visibility</div>
          <div class="text-xs text-gray-500">Select and reorder columns</div>
        </div>

        <div class="space-y-2">
          <div
            v-for="col in menuColumns"
            :key="col.key"
            :class="menuItemClass"
            draggable="true"
            @dragstart="onColumnMenuDragStart($event, col.key)"
            @dragover.prevent
            @drop="onColumnMenuDrop($event, col.key)"
          >
            <label class="flex items-center space-x-2 cursor-pointer">
              <svg :class="menuDragIconClass" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2a1 1 0 110 2 1 1 0 010-2zm0 6a1 1 0 110 2 1 1 0 010-2zm0 6a1 1 0 110 2 1 1 0 010-2zm6-12a1 1 0 110 2 1 1 0 010-2zm0 6a1 1 0 110 2 1 1 0 010-2zm0 6a1 1 0 110 2 1 1 0 010-2z"/></svg>
              <input
                type="checkbox"
                :checked="visibleCols[col.key]"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                @change="(e) => setVisibleCol(col.key, (e.target as HTMLInputElement).checked)"
                @click.stop
              />
              <span class="text-sm text-gray-700">{{ col.label }}</span>
            </label>
          </div>
        </div>

        <USeparator />
        <div class="text-xs text-gray-400">💡 Drag items to reorder</div>
      </div>

      <!-- Filters Tab Content -->
      <div v-else-if="(activeTab || 'columns') === 'filters'" class="space-y-3">
        <div class="mb-2">
          <div class="text-sm font-medium text-gray-700">Filter for {{ column.label }}</div>
          <div class="text-xs text-gray-500">Configure the filter for this column</div>
        </div>

        <!-- Text filter with operator selection -->
        <div v-if="getColumnFilterType(column) === 'text'" class="space-y-2">
          <select
            :value="getFilterValue(column.key).operator"
            class="block w-full rounded-md border border-gray-300 py-1.5 pl-3 pr-7 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @change="(e) => setFilterField(column.key, 'operator', (e.target as HTMLSelectElement).value)"
          >
            <option v-for="item in getTextFilterOperators()" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
          <input
            :value="getFilterValue(column.key).value"
            type="text"
            :placeholder="`Search ${column.label.toLowerCase()}...`"
            class="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @input="(e) => setFilterField(column.key, 'value', (e.target as HTMLInputElement).value)"
          />
        </div>

        <!-- Select filter (multi-select) -->
        <div v-else-if="getColumnFilterType(column) === 'select'" class="space-y-1 max-h-32 overflow-y-auto">
          <label
            v-for="option in column.filterOptions"
            :key="getOptionKey(option)"
            class="flex items-center gap-2 cursor-pointer py-0.5"
          >
            <input
              type="checkbox"
              :checked="getSelectFilterValue(column.key)[getOptionKey(option)]"
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
              @change="(e) => onSelectFilterToggle(column.key, String(getOptionKey(option)), (e.target as HTMLInputElement).checked)"
            />
            <span class="text-sm text-gray-700">{{ getOptionLabel(option) }}</span>
          </label>
        </div>

        <!-- Boolean filter -->
        <div v-else-if="getColumnFilterType(column) === 'boolean'" class="space-y-2">
          <select
            :value="String(getFilterValue(column.key).value)"
            class="block w-full rounded-md border border-gray-300 py-1.5 pl-3 pr-7 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @change="(e) => {
              const raw = (e.target as HTMLSelectElement).value
              setFilterField(column.key, 'value', raw === 'true' ? true : raw === 'false' ? false : null)
            }"
          >
            <option value="null">All</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>

        <!-- Date range filter -->
        <div v-else-if="getColumnFilterType(column) === 'dateRange'" class="space-y-2">
          <select
            :value="getFilterValue(column.key).operator"
            class="block w-full rounded-md border border-gray-300 py-1.5 pl-3 pr-7 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @change="(e) => setFilterField(column.key, 'operator', (e.target as HTMLSelectElement).value)"
          >
            <option v-for="item in getDateFilterOperators()" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
          <input
            :value="getFilterValue(column.key).value"
            type="date"
            placeholder="De"
            class="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @input="(e) => setFilterField(column.key, 'value', (e.target as HTMLInputElement).value)"
          />
          <input
            v-if="getFilterValue(column.key).operator === 'between'"
            :value="getFilterValue(column.key).value2"
            type="date"
            placeholder="À"
            class="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @input="(e) => setFilterField(column.key, 'value2', (e.target as HTMLInputElement).value)"
          />
        </div>

        <!-- Number range filter -->
        <div v-else-if="getColumnFilterType(column) === 'numberRange'" class="space-y-2">
          <select
            :value="getFilterValue(column.key).operator"
            class="block w-full rounded-md border border-gray-300 py-1.5 pl-3 pr-7 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @change="(e) => setFilterField(column.key, 'operator', (e.target as HTMLSelectElement).value)"
          >
            <option v-for="item in getNumberFilterOperators()" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
          <input
            :value="getFilterValue(column.key).value"
            type="number"
            placeholder="Valeur"
            class="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @input="(e) => setFilterField(column.key, 'value', (e.target as HTMLInputElement).value)"
          />
          <input
            v-if="getFilterValue(column.key).operator === 'between'"
            :value="getFilterValue(column.key).value2"
            type="number"
            placeholder="Valeur max"
            class="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @input="(e) => setFilterField(column.key, 'value2', (e.target as HTMLInputElement).value)"
          />
        </div>

        <!-- Custom filter slot -->
        <div v-else-if="getColumnFilterType(column) === 'custom'">
          <slot
            :name="`filter-${column.key}`"
            :column="column"
            :filter-value="columnFilters[column.key]"
            :on-change="(value: unknown) => onCustomFilterChange(column.key, value)"
          >
            <div :class="computedTheme.filterText">Custom filter not implemented</div>
          </slot>
        </div>

        <div class="flex gap-2 mt-4">
          <button type="button"
            class="px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-medium border border-transparent hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            @click="clearColumnFilter(column.key)">Clear</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Column, ColumnFilter, FilterOption, FilterValue } from '../types/datatable.types'

type TabKey = 'columns' | 'filters'

type FilterOptionLike = string | FilterOption

type FilterOperatorsProvider = () => Array<{ value: string; label: string }>

type ColumnFilterTypeResolver = (column: Column) => string

type FilterValueProvider = (columnKey: string) => FilterValue

type SelectFilterValueProvider = (columnKey: string) => Record<string, boolean>

type OptionKeyResolver = (option: FilterOptionLike) => string | number

type OptionLabelResolver = (option: FilterOptionLike) => string

type CheckboxClassesProvider = () => Record<string, string>

type DragHandler = (event: DragEvent, columnKey: string) => void

type ColumnFilterChangeHandler = (columnKey: string) => void

type CustomFilterChangeHandler = (columnKey: string, value: FilterValue | unknown) => void

type ClearFilterHandler = (columnKey: string) => void

type SetVisibleColHandler = (columnKey: string, visible: boolean) => void

type SetActiveTabHandler = (columnKey: string, tab: TabKey) => void

type FilterFieldSetter = (columnKey: string, field: 'operator' | 'value' | 'value2', value: unknown) => void

type SelectFilterToggler = (columnKey: string, optionKey: string, checked: boolean) => void

const props = defineProps<{
  column: Column
  menuColumns: Column[]
  visibleCols: Record<string, boolean>
  setVisibleCol: SetVisibleColHandler
  activeTab?: TabKey
  setActiveTab: SetActiveTabHandler

  menuItemClass: string
  menuDragIcon: string
  menuDragIconClass: string

  onColumnMenuDragStart: DragHandler
  onColumnMenuDrop: DragHandler

  getColumnFilterType: ColumnFilterTypeResolver
  getFilterValue: FilterValueProvider
  getSelectFilterValue: SelectFilterValueProvider

  getTextFilterOperators: FilterOperatorsProvider
  getDateFilterOperators: FilterOperatorsProvider
  getNumberFilterOperators: FilterOperatorsProvider

  getOptionKey: OptionKeyResolver
  getOptionLabel: OptionLabelResolver

  getCheckboxClasses: CheckboxClassesProvider

  onFilterChange: ColumnFilterChangeHandler
  onCustomFilterChange: CustomFilterChangeHandler
  clearColumnFilter: ClearFilterHandler

  // Setters that materialize the filter entry in columnFilters before mutating,
  // so the v-model bindings for boolean / text / date / number range filters
  // actually persist (getFilterValue alone returns a throwaway object on first
  // access).
  setFilterField: FilterFieldSetter
  onSelectFilterToggle: SelectFilterToggler

  columnFilters: ColumnFilter
  computedTheme: { filterText?: string }
}>()
</script>
