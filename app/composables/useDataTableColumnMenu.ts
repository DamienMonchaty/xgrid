import { computed, ref, type ComputedRef, type Ref } from 'vue'

import type { Column, ColumnFilter, FilterOption, FilterValue } from '../types/datatable.types'
import type { FilterOperatorOption } from './useDataTableFiltersModel'

type ColumnMenuVariant = 'sortable' | 'plain'

type ColumnMenuTab = 'columns' | 'filters'

export function useDataTableColumnMenu(args: {
  orderedColumns: ComputedRef<Column[]>
  visibleCols: Record<string, boolean>
  getCheckboxClasses: () => Record<string, string>
  onColumnMenuDragStart: (e: DragEvent, column: string) => void
  onColumnMenuDrop: (e: DragEvent, targetColumn: string) => void

  getColumnFilterType: (column: Column | undefined) => string
  getFilterValue: (columnKey: string) => FilterValue
  getSelectFilterValue: (columnKey: string) => Record<string, boolean>
  getTextFilterOperators: () => FilterOperatorOption[]
  getDateFilterOperators: () => FilterOperatorOption[]
  getNumberFilterOperators: () => FilterOperatorOption[]
  getOptionKey: (option: FilterOption | string) => string
  getOptionLabel: (option: FilterOption | string) => string
  onFilterChange: (columnKey: string) => void
  onCustomFilterChange: (columnKey: string, value: unknown) => void
  clearColumnFilter: (key: string) => void
  setFilterField: (columnKey: string, field: 'operator' | 'value' | 'value2', value: unknown) => void
  onSelectFilterToggle: (columnKey: string, optionKey: string, checked: boolean) => void
  columnFilters: ColumnFilter
  computedTheme: Ref<Record<string, string | undefined>>
}) {
  const headerMenuActiveTab = ref<Record<string, ColumnMenuTab>>({})

  const menuColumns = computed(() => {
    return args.orderedColumns.value.filter(c => c.key !== 'actions')
  })

  function ensureHeaderMenuTab(columnKey: string) {
    if (!headerMenuActiveTab.value[columnKey]) {
      headerMenuActiveTab.value[columnKey] = 'columns'
    }
  }

  const getColumnMenuBindings = (column: Column, variant: ColumnMenuVariant) => {
    const isSortable = variant === 'sortable'

    return {
      column,
      menuColumns: menuColumns.value,
      visibleCols: args.visibleCols,
      setVisibleCol: (key: string, visible: boolean) => {
        args.visibleCols[key] = visible
      },
      activeTab: headerMenuActiveTab.value[column.key] || 'columns',
      setActiveTab: (key: string, tab: ColumnMenuTab) => {
        headerMenuActiveTab.value[key] = tab
      },
      menuItemClass: 'flex items-center justify-between rounded-md hover:bg-gray-50 cursor-move group',
      menuDragIcon: isSortable ? 'i-heroicons-adjustments-vertical' : 'i-heroicons-bars-3',
      menuDragIconClass: 'w-4 h-4 text-gray-400 group-hover:text-gray-600',
      onColumnMenuDragStart: args.onColumnMenuDragStart,
      onColumnMenuDrop: args.onColumnMenuDrop,
      getColumnFilterType: args.getColumnFilterType,
      getFilterValue: args.getFilterValue,
      getSelectFilterValue: args.getSelectFilterValue,
      getTextFilterOperators: args.getTextFilterOperators,
      getDateFilterOperators: args.getDateFilterOperators,
      getNumberFilterOperators: args.getNumberFilterOperators,
      getOptionKey: args.getOptionKey,
      getOptionLabel: args.getOptionLabel,
      getCheckboxClasses: args.getCheckboxClasses,
      onFilterChange: args.onFilterChange,
      onCustomFilterChange: args.onCustomFilterChange,
      clearColumnFilter: args.clearColumnFilter,
      setFilterField: args.setFilterField,
      onSelectFilterToggle: args.onSelectFilterToggle,
      columnFilters: args.columnFilters,
      computedTheme: args.computedTheme.value
    }
  }

  return {
    headerMenuActiveTab,
    menuColumns,
    ensureHeaderMenuTab,
    getColumnMenuBindings
  }
}

export type ColumnMenuBindings = ReturnType<ReturnType<typeof useDataTableColumnMenu>['getColumnMenuBindings']>
