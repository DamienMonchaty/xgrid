import type { Column } from '../types/datatable.types'

export function buildDefaultColumnFilterValue(args: {
  column: Column | undefined
  filterType: string
}): any {
  const { column, filterType } = args

  if (filterType === 'select' && column?.filterOptions) {
    const selectFilter: Record<string, boolean> = {}
    for (const option of column.filterOptions) {
      const optionValue = typeof option === 'string' ? option : String(option.value)
      selectFilter[optionValue] = true
    }
    return selectFilter
  }

  if (filterType === 'boolean') {
    return { operator: 'eq', value: null }
  }

  if (filterType === 'numberRange' || filterType === 'dateRange') {
    return { operator: 'between', value: null, value2: null }
  }

  if (filterType === 'custom') {
    return null
  }

  return { operator: column?.filterOperator || 'contains', value: '' }
}
