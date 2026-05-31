import type { Column, ColumnFilter } from '../types/datatable.types'
import { getFilterTypeFromColumnType } from '../types/datatable.types'
import { deepClone, stableStringify } from '../utils/structural'

export type SortModel = { key: string, direction: 'asc' | 'desc' } | null

export type DataTableModelSyncDeps = {
  props: {
    search?: string
    filters?: ColumnFilter
    sort?: SortModel | undefined
  }
  internalSearch: Ref<string>
  columnFilters: ColumnFilter
  sortKey: Ref<string>
  sortDir: Ref<'asc' | 'desc'>
  columns: Ref<Column[]>
  emitUpdateSearch: (value: string) => void
  emitUpdateFilters: (value: ColumnFilter) => void
  emitUpdateSort: (value: SortModel) => void
}

export function useDataTableModelSync(deps?: DataTableModelSyncDeps) {
  const syncingFromModel = reactive({
    search: false,
    filters: false,
    sort: false,
    expanded: false
  })

  function syncColumnFiltersFromModel(modelFilters: ColumnFilter) {
    if (!deps) return

    for (const key of Object.keys(deps.columnFilters)) {
      if (!(key in modelFilters)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete deps.columnFilters[key]
      }
    }

    for (const [key, value] of Object.entries(modelFilters)) {
      deps.columnFilters[key] = value
    }
  }

  function ensureDefaultColumnFilters() {
    if (!deps) return

    deps.columns.value.forEach(col => {
      if (!col.filterable) return

      // Prefer an explicit `filterType` over the derived one from `col.type`,
      // otherwise a column like `{ filterType: 'select' }` without `type: 'select'`
      // would be initialized as a text filter and the select UI (checkboxes,
      // boolean dropdown, range inputs) would never reflect or persist its state.
      const filterType = col.filterType || (col.type ? getFilterTypeFromColumnType(col.type) : 'text')
      const currentValue = deps.columnFilters[col.key]

      if (filterType === 'select' && col.filterOptions) {
        const base: Record<string, boolean> =
          (typeof currentValue === 'object' && currentValue !== null && !('operator' in currentValue))
            ? (currentValue as Record<string, boolean>)
            : {}
        col.filterOptions.forEach(option => {
          const optionValue = typeof option === 'string' ? option : String(option.value)
          if (base[optionValue] === undefined) base[optionValue] = true
        })
        deps.columnFilters[col.key] = base
        return
      }

      if (typeof currentValue === 'object' && currentValue !== null && 'operator' in currentValue) {
        return
      }

      if (currentValue !== undefined) {
        return
      }

      if (filterType === 'boolean') {
        deps.columnFilters[col.key] = { operator: 'eq', value: null }
      } else if (filterType === 'numberRange' || filterType === 'dateRange') {
        deps.columnFilters[col.key] = { operator: 'between', value: null, value2: null }
      } else if (filterType === 'custom') {
        deps.columnFilters[col.key] = undefined
      } else {
        deps.columnFilters[col.key] = { operator: col.filterOperator || 'contains', value: '' }
      }
    })
  }

  function initColumnFiltersFromProps() {
    if (!deps) return
    if (deps.props.filters !== undefined) {
      syncingFromModel.filters = true
      syncColumnFiltersFromModel(deps.props.filters)
      syncingFromModel.filters = false
    }
    ensureDefaultColumnFilters()
  }

  if (deps) {
    watch(
      () => deps.props.search,
      (newSearch) => {
        if (newSearch === undefined) return
        syncingFromModel.search = true
        deps.internalSearch.value = newSearch ?? ''
        syncingFromModel.search = false
      },
      { immediate: true }
    )

    watch(
      deps.internalSearch,
      (value) => {
        if (syncingFromModel.search) return
        if (deps.props.search !== undefined && deps.props.search === value) return
        deps.emitUpdateSearch(value)
      },
      { flush: 'post' }
    )

    watch(
      () => deps.props.filters,
      (newFilters) => {
        if (newFilters === undefined) return
        syncingFromModel.filters = true
        syncColumnFiltersFromModel(newFilters)
        ensureDefaultColumnFilters()
        syncingFromModel.filters = false
      },
      { immediate: true, deep: true }
    )

    watch(
      () => deps.columnFilters,
      () => {
        if (syncingFromModel.filters) return
        const nextModel = deepClone(deps.columnFilters)
        if (deps.props.filters !== undefined) {
          const nextStable = stableStringify(nextModel)
          const currentStable = stableStringify(deps.props.filters)
          if (nextStable === currentStable) return
        }
        deps.emitUpdateFilters(nextModel)
      },
      { deep: true, flush: 'post' }
    )

    watch(
      () => deps.props.sort as SortModel | undefined,
      (newSort) => {
        if (newSort === undefined) return
        syncingFromModel.sort = true
        if (!newSort) {
          deps.sortKey.value = ''
          deps.sortDir.value = 'asc'
        } else {
          deps.sortKey.value = newSort.key
          deps.sortDir.value = newSort.direction
        }
        syncingFromModel.sort = false
      },
      { immediate: true, deep: true }
    )

    watch(
      [deps.sortKey, deps.sortDir],
      () => {
        if (syncingFromModel.sort) return
        const model: SortModel = deps.sortKey.value ? { key: deps.sortKey.value, direction: deps.sortDir.value } : null
        if (deps.props.sort !== undefined) {
          const current = deps.props.sort as SortModel | undefined
          const same = (!current && !model) || (
            !!current && !!model && current.key === model.key && current.direction === model.direction
          )
          if (same) return
        }
        deps.emitUpdateSort(model)
      },
      { flush: 'post' }
    )
  }

  return {
    deepClone,
    stableStringify,
    syncColumnFiltersFromModel,
    ensureDefaultColumnFilters,
    initColumnFiltersFromProps
  }
}
