import { computed, type ComputedRef, type Ref } from 'vue'

import type { Column, ColumnFilterType, FilterOperator, FilterValue, TableRow } from '../types/datatable.types'

// ---------------------------------------------------------------------------
// Filter helpers (moved from DataTable.vue to co-locate with filter pipeline)
// ---------------------------------------------------------------------------

function applyEqualsFilter(
  filterType: ColumnFilterType,
  cellValue: unknown, value: unknown,
  cellStr: string, filterStr: string,
  cellNum: number, filterNum: number,
  cellDate: Date, filterDate: Date
): boolean {
  if (filterType === 'boolean') return cellValue === value
  if (filterType === 'numberRange') return cellNum === filterNum
  if (filterType === 'dateRange') return cellDate.toDateString() === filterDate.toDateString()
  return cellStr === filterStr
}

function applyNotEqualsFilter(
  filterType: ColumnFilterType,
  cellValue: unknown, value: unknown,
  cellStr: string, filterStr: string,
  cellNum: number, filterNum: number,
  cellDate: Date, filterDate: Date
): boolean {
  if (filterType === 'boolean') return cellValue !== value
  if (filterType === 'numberRange') return cellNum !== filterNum
  if (filterType === 'dateRange') return cellDate.toDateString() !== filterDate.toDateString()
  return cellStr !== filterStr
}

function applyComparisonFilter(
  filterType: ColumnFilterType,
  operator: FilterOperator,
  cellNum: number, filterNum: number,
  cellDate: Date, filterDate: Date
): boolean {
  if (filterType === 'numberRange') {
    switch (operator) {
      case 'gt': return cellNum > filterNum
      case 'gte': return cellNum >= filterNum
      case 'lt': return cellNum < filterNum
      case 'lte': return cellNum <= filterNum
    }
  }
  if (filterType === 'dateRange') {
    switch (operator) {
      case 'gt': return cellDate > filterDate
      case 'gte': return cellDate >= filterDate
      case 'lt': return cellDate < filterDate
      case 'lte': return cellDate <= filterDate
    }
  }
  return false
}

function applyBetweenFilter(
  filterType: ColumnFilterType,
  value2: unknown,
  cellNum: number, filterNum: number,
  cellDate: Date, filterDate: Date
): boolean {
  if (!value2) return true
  if (filterType === 'numberRange') {
    const filterNum2 = Number(value2)
    return cellNum >= filterNum && cellNum <= filterNum2
  }
  if (filterType === 'dateRange') {
    const filterDate2 = new Date(String(value2))
    return cellDate >= filterDate && cellDate <= filterDate2
  }
  return false
}

function applyRegexFilter(cellStr: string, filterStr: string): boolean {
  try {
    const regex = new RegExp(filterStr, 'i')
    return regex.test(cellStr)
  } catch {
    return false
  }
}

export function applyOperatorFilter(
  cellValue: unknown,
  filter: FilterValue,
  column: Column,
  filterTypeOverride?: ColumnFilterType,
  getColumnFilterType?: (col: Column | undefined) => ColumnFilterType
): boolean {
  const { operator, value, value2 } = filter
  const filterType = filterTypeOverride ?? getColumnFilterType?.(column) ?? 'text'

  if (value === null || value === undefined || value === '') return true

  const cellStr = String(cellValue).toLowerCase()
  const filterStr = String(value).toLowerCase()
  const cellNum = Number(cellValue)
  const filterNum = Number(value)
  const cellDate = new Date(String(cellValue))
  const filterDate = new Date(String(value))

  switch (operator) {
    case 'eq':   return applyEqualsFilter(filterType, cellValue, value, cellStr, filterStr, cellNum, filterNum, cellDate, filterDate)
    case 'ne':   return applyNotEqualsFilter(filterType, cellValue, value, cellStr, filterStr, cellNum, filterNum, cellDate, filterDate)
    case 'contains':   return cellStr.includes(filterStr)
    case 'startsWith': return cellStr.startsWith(filterStr)
    case 'endsWith':   return cellStr.endsWith(filterStr)
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':  return applyComparisonFilter(filterType, operator, cellNum, filterNum, cellDate, filterDate)
    case 'between': return applyBetweenFilter(filterType, value2, cellNum, filterNum, cellDate, filterDate)
    case 'regex':   return applyRegexFilter(cellStr, filterStr)
    default: return true
  }
}

export function useDataTableClientPipeline(args: {
  isServerMode: Ref<boolean>
  currentData: ComputedRef<TableRow[]>
  debouncedSearch: Ref<string>
  columns: ComputedRef<Column[]>
  columnFilters: Record<string, unknown>

  sortKey: Ref<string>
  sortDir: Ref<'asc' | 'desc'>

  getColumnValue: (row: TableRow, key: string) => unknown
  getColumnFilterType: (column: Column | undefined) => ColumnFilterType
}) {
  const globalSearchColumnsKey = computed(() => args.columns.value.map(c => c.key).join('|'))
  const globalSearchTextCache = new WeakMap<TableRow, { colsKey: string; text: string }>()

  function getRowGlobalSearchText(row: TableRow, colsKey: string, columns: Column[]): string {
    const cached = globalSearchTextCache.get(row)
    if (cached && cached.colsKey === colsKey) return cached.text

    let text = ''
    for (const col of columns) {
      const value = args.getColumnValue(row, col.key)
      if (value === null || value === undefined) continue
      text += ' ' + String(value).toLowerCase()
    }

    globalSearchTextCache.set(row, { colsKey, text })
    return text
  }

  const activeColumnFilterPredicates = computed(() => {
    const predicates: Array<(row: TableRow) => boolean> = []

    for (const col of args.columns.value) {
      if (!col.filterable) continue
      const filterValue = args.columnFilters[col.key]
      if (!filterValue) continue

      const filterType = args.getColumnFilterType(col)

      // Custom filter with filterFn — takes full priority
      if (filterType === 'custom') {
        if (col.filterFn && filterValue !== null && filterValue !== undefined) {
          const fn = col.filterFn
          const val = filterValue
          predicates.push(row => fn(row, val))
        }
        continue
      }

      // Select filters (multi-select)
      if (filterType === 'select' && typeof filterValue === 'object' && !('operator' in filterValue)) {
        const selectedOptions = Object.keys(filterValue).filter(key => !!(filterValue as Record<string, unknown>)[key])
        const totalOptions = col.filterOptions?.length || 0
        if (selectedOptions.length === 0 || (totalOptions > 0 && selectedOptions.length === totalOptions)) {
          continue
        }
        const selectedSet = new Set(selectedOptions.map(String))
        predicates.push(row => selectedSet.has(String(args.getColumnValue(row, col.key))))
        continue
      }

      // Structured filters with operators
      if (typeof filterValue === 'object' && 'operator' in filterValue) {
        const filterObj = filterValue as FilterValue
        if (filterObj.value === null || filterObj.value === undefined || filterObj.value === '') {
          continue
        }
        predicates.push(row =>
          applyOperatorFilter(args.getColumnValue(row, col.key), filterObj, col, filterType, args.getColumnFilterType)
        )
        continue
      }

      // Simple string filters (backward compatibility)
      if (typeof filterValue === 'string') {
        const filterLower = filterValue.toLowerCase()
        if (!filterLower) continue
        predicates.push(row => String(args.getColumnValue(row, col.key)).toLowerCase().includes(filterLower))
      }
    }

    return predicates
  })

  const filteredData = computed(() => {
    if (args.isServerMode.value) {
      return args.currentData.value
    }

    let filtered = args.currentData.value

    if (args.debouncedSearch.value) {
      const searchTerm = args.debouncedSearch.value.toLowerCase()
      const columns = args.columns.value
      const colsKey = globalSearchColumnsKey.value
      filtered = filtered.filter(row => getRowGlobalSearchText(row, colsKey, columns).includes(searchTerm))
    }

    const predicates = activeColumnFilterPredicates.value
    if (predicates.length) {
      filtered = filtered.filter(row => {
        for (const predicate of predicates) {
          if (!predicate(row)) return false
        }
        return true
      })
    }

    return filtered
  })

  const sortedData = computed(() => {
    if (args.isServerMode.value) {
      return filteredData.value
    }

    if (!args.sortKey.value) return filteredData.value

    const key = args.sortKey.value
    const direction = args.sortDir.value === 'asc' ? 1 : -1
    const col = args.columns.value.find(c => c.key === key)
    const colType = col?.type ?? col?.filterType ?? 'text'
    const isNumeric = colType === 'number' || colType === 'numberRange'
    const isDate = colType === 'date' || colType === 'dateRange'

    const decorated = filteredData.value.map((row, index) => ({
      row,
      index,
      raw: args.getColumnValue(row, key)
    }))

    decorated.sort((a, b) => {
      let cmp = 0
      if (isNumeric) {
        const na = Number(a.raw)
        const nb = Number(b.raw)
        cmp = (isNaN(na) ? -Infinity : na) - (isNaN(nb) ? -Infinity : nb)
      } else if (isDate) {
        const da = new Date(a.raw as string).getTime()
        const db = new Date(b.raw as string).getTime()
        cmp = (isNaN(da) ? -Infinity : da) - (isNaN(db) ? -Infinity : db)
      } else {
        cmp = String(a.raw ?? '').localeCompare(String(b.raw ?? ''), undefined, { numeric: true, sensitivity: 'base' })
      }
      return cmp !== 0 ? cmp * direction : a.index - b.index
    })

    return decorated.map(d => d.row)
  })

  return {
    filteredData,
    sortedData
  }
}
