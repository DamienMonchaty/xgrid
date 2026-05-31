import { FILTER_OPERATORS } from '../constants/datatable.constants'
import type { Column, ColumnFilter, FilterOption, FilterValue } from '../types/datatable.types'

export type FilterOperatorOption = { value: string; label: string }

export type DataTableOperatorLists = {
  text: FilterOperatorOption[]
  number: FilterOperatorOption[]
  date: FilterOperatorOption[]
}

export function useDataTableFiltersModel(opts: {
  columnFilters: ColumnFilter | Ref<ColumnFilter>
  columns?: Ref<Column[]> | Column[]
  getColumnFilterType?: (column: Column | undefined) => string
  operatorLists?: Partial<DataTableOperatorLists>
}) {
  const getColumns = (): Column[] => {
    const cols = opts.columns
    return (Array.isArray(cols) ? cols : (unref(cols) as Column[])) || []
  }

  const getFiltersMap = (): ColumnFilter => {
    return (unref(opts.columnFilters) || {}) as ColumnFilter
  }

  function getFilterValue(columnKey: string): FilterValue {
    const filters = getFiltersMap()
    const filterValue = filters[columnKey]
    if (typeof filterValue === 'object' && filterValue !== null && 'operator' in filterValue) {
      return filterValue as FilterValue
    }
    return { operator: 'contains', value: filterValue || '' }
  }

  /**
   * Ensure a structured FilterValue entry exists in columnFilters for the given
   * column, and return the live reference. Use this from event handlers (not
   * inside render getters) to safely mutate `.value` / `.operator` and have the
   * change persist.
   */
  function ensureFilterValue(columnKey: string): FilterValue {
    const filters = getFiltersMap()
    const current = filters[columnKey]
    if (typeof current === 'object' && current !== null && 'operator' in current) {
      return current as FilterValue
    }
    const initial: FilterValue = { operator: 'contains', value: current ?? '' }
    ;(filters as Record<string, unknown>)[columnKey] = initial
    return initial
  }

  function getSelectFilterValue(columnKey: string): Record<string, boolean> {
    const filters = getFiltersMap()
    const filterValue = filters[columnKey]
    if (typeof filterValue === 'object' && filterValue !== null && !('operator' in filterValue)) {
      return filterValue as Record<string, boolean>
    }
    return {}
  }

  function getOptionKey(option: string | FilterOption): string {
    return typeof option === 'string' ? option : String(option.value)
  }

  function getOptionLabel(option: string | FilterOption): string {
    return typeof option === 'string' ? option : option.label
  }

  function getTextFilterOperators() {
    return opts.operatorLists?.text ?? FILTER_OPERATORS.TEXT
  }

  function getNumberFilterOperators() {
    return opts.operatorLists?.number ?? FILTER_OPERATORS.NUMBER
  }

  function getDateFilterOperators() {
    return opts.operatorLists?.date ?? FILTER_OPERATORS.DATE
  }

  function isFilterActive(columnKey: string): boolean {
    const filters = getFiltersMap()
    const filterValue = filters[columnKey]

    if (!filterValue) return false

    // Check for select filters
    if (typeof filterValue === 'object' && !('operator' in filterValue)) {
      const selectFilter = filterValue as Record<string, boolean>
      const selectedOptions = Object.keys(selectFilter).filter(key => selectFilter[key])
      const column = getColumns().find(col => col.key === columnKey)
      const totalOptions = column?.filterOptions?.length || 0
      return selectedOptions.length > 0 && selectedOptions.length < totalOptions
    }

    // Check for structured filters with operators
    if (typeof filterValue === 'object' && 'operator' in filterValue) {
      const filter = filterValue as FilterValue
      return filter.value !== null && filter.value !== undefined && filter.value !== ''
    }

    // Check for simple string/number filters
    return filterValue !== null && filterValue !== undefined && filterValue !== ''
  }

  return {
    getFilterValue,
    ensureFilterValue,
    getSelectFilterValue,
    getOptionKey,
    getOptionLabel,
    getTextFilterOperators,
    getNumberFilterOperators,
    getDateFilterOperators,
    isFilterActive
  }
}
