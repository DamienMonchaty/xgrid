import type { Ref } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'

import type { TableRow } from '../types/datatable.types'

export type DataTableLoadingPreservationDeps = {
  isInitialLoading: Ref<boolean>
  pagedRows: Ref<TableRow[]>
  debug?: Ref<boolean> | boolean
}

function isDebugEnabled(debug: DataTableLoadingPreservationDeps['debug']) {
  return typeof debug === 'boolean' ? debug : !!debug?.value
}

export function useDataTableLoadingPreservation(deps: DataTableLoadingPreservationDeps) {
  const tableBody = ref<HTMLElement>()
  const setTableBodyEl = (el: HTMLElement | null) => {
    tableBody.value = el ?? undefined
  }

  const preservedHeight = ref<number>(0)
  const preservedRows = ref<TableRow[]>([])

  const tableBodyStyle = computed(() => {
    if (deps.isInitialLoading.value && preservedHeight.value > 0) {
      return {
        minHeight: `${preservedHeight.value}px`,
        transition: 'min-height 0.2s ease'
      }
    }
    return {}
  })

  const shouldShowLoadingOverlay = computed(() => {
    const result = deps.isInitialLoading.value && preservedRows.value.length > 0

    if (process.env.NODE_ENV === 'development' && isDebugEnabled(deps.debug)) {
      // Keep debug-only logging; no functional side effects.
      console.log('🔍 Loading overlay debug:', {
        isInitialLoading: deps.isInitialLoading.value,
        preservedRowsLength: preservedRows.value.length,
        shouldShow: result
      })
    }

    return result
  })

  const preserveCurrentState = () => {
    if (tableBody.value && deps.pagedRows.value.length > 0) {
      preservedHeight.value = tableBody.value.offsetHeight
      preservedRows.value = [...deps.pagedRows.value]

      if (process.env.NODE_ENV === 'development' && isDebugEnabled(deps.debug)) {
        console.log('🔒 State preserved:', {
          height: preservedHeight.value,
          rowsCount: preservedRows.value.length,
          isInitialLoading: deps.isInitialLoading.value
        })
      }
    } else if (process.env.NODE_ENV === 'development' && isDebugEnabled(deps.debug)) {
      console.log('🔒 State not preserved:', {
        tableBodyExists: !!tableBody.value,
        pagedRowsLength: deps.pagedRows.value.length
      })
    }
  }

  const clearPreservedState = () => {
    nextTick(() => {
      preservedHeight.value = 0
      preservedRows.value = []

      if (process.env.NODE_ENV === 'development' && isDebugEnabled(deps.debug)) {
        console.log('🧹 Preserved state cleared')
      }
    })
  }

  watch(
    () => deps.isInitialLoading.value,
    (newIsLoading, oldIsLoading) => {
      if (newIsLoading && !oldIsLoading) {
        preserveCurrentState()
      } else if (!newIsLoading && oldIsLoading) {
        clearPreservedState()
      }
    }
  )

  return {
    setTableBodyEl,
    preservedRows,
    tableBodyStyle,
    shouldShowLoadingOverlay,
    preserveCurrentState,
    clearPreservedState
  }
}
