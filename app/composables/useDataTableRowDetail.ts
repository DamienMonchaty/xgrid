import type { TableRow, RowId } from '../types/datatable.types'
import type { DataTableOptions } from './useDataTableCore'

type DetailKey = string

interface ResolvedRowDetailOptions {
  expandable?: boolean
  rowDetailUrl?: string | ((row: TableRow) => string | null)
  rowDetailQuery?: Record<string, unknown> | ((row: TableRow) => Record<string, unknown>)
  rowDetailCache?: boolean
  rowDetailAutoLoad?: boolean
  rowDetailResolver?: (row: TableRow) => unknown
  [key: string]: unknown
}

export function useDataTableRowDetail(opts: {
  resolvedOptions: Ref<ResolvedRowDetailOptions>
  slots: ReturnType<typeof useSlots>
  attrs: Record<string, unknown>
  propsExpanded: Ref<Array<RowId> | undefined>
  pagedRows: Ref<TableRow[]>
  actualData: Ref<TableRow[]>
  getRowId: (row: TableRow) => RowId
  stableStringify: (value: unknown) => string
  emitAndCall: (eventName: string, optionHandlerName: keyof DataTableOptions, ...args: unknown[]) => void
  emitUpdateExpanded: (next: Array<RowId>) => void
  debugLog: (message: string, data?: unknown) => void
}) {
  const expandedRowIds = reactive(new Set<RowId>())

  const rowDetailData = reactive<Record<DetailKey, unknown>>({})
  const rowDetailRaw = reactive<Record<DetailKey, unknown>>({})
  const rowDetailLoading = reactive<Record<DetailKey, boolean>>({})
  const rowDetailError = reactive<Record<DetailKey, string | null>>({})
  const rowDetailRequestSeq = reactive<Record<DetailKey, number>>({})

  const canRenderRowDetail = computed(() => {
    return !!opts.resolvedOptions.value.expandable && (!!opts.slots['row-detail'] || !!opts.resolvedOptions.value.rowDetailUrl)
  })

  function getDetailKey(rowId: RowId): DetailKey {
    return String(rowId)
  }

  function getRowDetailUrl(row: TableRow): string | null {
    const conf =
      opts.resolvedOptions.value.rowDetailUrl ??
      opts.attrs['rowDetailUrl'] ??
      opts.attrs['row-detail-url']

    if (!conf) return null
    if (typeof conf === 'function') {
      try {
        const u = conf(row)
        return u ? String(u) : null
      } catch {
        return null
      }
    }
    return String(conf)
  }

  function getRowDetailQuery(row: TableRow): Record<string, unknown> | undefined {
    const conf = opts.resolvedOptions.value.rowDetailQuery
    if (!conf) return undefined
    if (typeof conf === 'function') {
      try {
        return conf(row)
      } catch {
        return undefined
      }
    }
    return conf
  }

  function normalizeDetailPayload(payload: unknown): unknown {
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as Record<string, unknown>).data
    }
    return payload
  }

  async function loadRowDetail(row: TableRow, opts2?: { force?: boolean }) {
    if (!canRenderRowDetail.value) return

    const url = getRowDetailUrl(row)
    const rowId = opts.getRowId(row)
    const key = getDetailKey(rowId)

    opts.debugLog('RowDetail: loadRowDetail() called', {
      rowId,
      url,
      force: opts2?.force === true,
      cacheEnabled: opts.resolvedOptions.value.rowDetailCache !== false,
      hasCached: rowDetailData[key] !== undefined,
      isLoading: !!rowDetailLoading[key],
      error: rowDetailError[key]
    })

    if (!url) {
      const message = 'Row detail URL is missing (rowDetailUrl)'
      rowDetailError[key] = message
      opts.emitAndCall('row-detail-error', 'onRowDetailError', { rowId, url: '', query: getRowDetailQuery(row), error: message })
      return
    }

    const force = opts2?.force === true
    const cacheEnabled = opts.resolvedOptions.value.rowDetailCache !== false

    if (!force && cacheEnabled && rowDetailData[key] !== undefined) {
      return
    }

    if (!force && rowDetailLoading[key]) return

    rowDetailError[key] = null
    rowDetailLoading[key] = true

    const seq = (rowDetailRequestSeq[key] ?? 0) + 1
    rowDetailRequestSeq[key] = seq

    try {
      const query = getRowDetailQuery(row)

      opts.emitAndCall('row-detail-request', 'onRowDetailRequest', { rowId, url, query })

      const raw = await $fetch<unknown>(url, { query, timeout: 30000 })

      if (rowDetailRequestSeq[key] !== seq) return

      const detail = normalizeDetailPayload(raw)

      rowDetailRaw[key] = raw
      rowDetailData[key] = detail

      opts.emitAndCall('row-detail-response', 'onRowDetailResponse', { rowId, url, query, raw, detail })
    } catch (err: unknown) {
      if (rowDetailRequestSeq[key] !== seq) return

      const message = err instanceof Error ? err.message : String(err)
      rowDetailError[key] = message

      opts.emitAndCall('row-detail-error', 'onRowDetailError', { rowId, url, query: getRowDetailQuery(row), error: message })
      opts.emitAndCall('error', 'onError', err instanceof Error ? err : new Error(message))
    } finally {
      if (rowDetailRequestSeq[key] === seq) {
        rowDetailLoading[key] = false
      }
    }
  }

  function isRowExpanded(rowId: RowId): boolean {
    return expandedRowIds.has(rowId)
  }

  function toggleRowExpanded(row: TableRow) {
    if (!canRenderRowDetail.value) return

    const rowId = opts.getRowId(row)

    opts.debugLog('RowDetail: toggleRowExpanded()', {
      rowId,
      wasExpanded: expandedRowIds.has(rowId),
      autoLoad: opts.resolvedOptions.value.rowDetailAutoLoad !== false,
      url: getRowDetailUrl(row)
    })

    if (expandedRowIds.has(rowId)) {
      expandedRowIds.delete(rowId)

      opts.emitAndCall('row-expand', 'onRowExpand', { rowId, expanded: false })

      if (opts.resolvedOptions.value.rowDetailCache === false) {
        const key = getDetailKey(rowId)
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete rowDetailData[key]
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete rowDetailRaw[key]
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete rowDetailLoading[key]
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete rowDetailError[key]
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete rowDetailRequestSeq[key]
      }
    } else {
      expandedRowIds.add(rowId)

      opts.emitAndCall('row-expand', 'onRowExpand', { rowId, expanded: true })

      if (opts.resolvedOptions.value.rowDetailAutoLoad !== false) {
        void loadRowDetail(row)
      }
    }
  }

  // Auto-load details whenever an expanded row is visible.
  watchEffect(() => {
    if (!canRenderRowDetail.value) return
    if (opts.resolvedOptions.value.rowDetailAutoLoad === false) return

    for (const row of opts.pagedRows.value) {
      const rowId = opts.getRowId(row)
      if (!isRowExpanded(rowId)) continue

      const key = getDetailKey(rowId)
      if (rowDetailData[key] !== undefined) continue
      if (rowDetailLoading[key]) continue
      if (rowDetailError[key]) continue

      void loadRowDetail(row)
    }
  }, { flush: 'post' })

  const expandedRowIdsModel = computed<Array<RowId>>(() => Array.from(expandedRowIds))

  const syncingFromModel = reactive({ expanded: false })

  watch(
    () => opts.propsExpanded.value,
    (newExpanded) => {
      if (newExpanded === undefined) return
      syncingFromModel.expanded = true
      expandedRowIds.clear()
      for (const id of newExpanded || []) {
        if (id === null || id === undefined) continue
        expandedRowIds.add(id)
      }
      syncingFromModel.expanded = false
    },
    { immediate: true, deep: true }
  )

  watch(
    expandedRowIdsModel,
    (ids) => {
      if (syncingFromModel.expanded) return

      const next = [...ids].sort((a, b) => String(a).localeCompare(String(b)))

      const current = opts.propsExpanded.value
      if (current !== undefined) {
        const currentStable = [...current].sort((a, b) => String(a).localeCompare(String(b)))
        if (opts.stableStringify(next) === opts.stableStringify(currentStable)) return
      }

      opts.emitUpdateExpanded(next)
    },
    { flush: 'post' }
  )

  // Ensure row-detail is auto-loaded whenever expansion is driven externally.
  const lastExpandedSnapshot = ref<Set<RowId>>(new Set())
  watch(
    expandedRowIdsModel,
    (ids) => {
      const nextSet = new Set<RowId>(ids)
      const prevSet = lastExpandedSnapshot.value

      if (!canRenderRowDetail.value || opts.resolvedOptions.value.rowDetailAutoLoad === false) {
        lastExpandedSnapshot.value = nextSet
        return
      }

      for (const rowId of nextSet) {
        if (prevSet.has(rowId)) continue

        const key = getDetailKey(rowId)
        if (rowDetailData[key] !== undefined) continue
        if (rowDetailLoading[key]) continue

        const row =
          opts.pagedRows.value.find(r => String(opts.getRowId(r)) === String(rowId)) ||
          (Array.isArray(opts.actualData.value)
            ? (opts.actualData.value as TableRow[]).find(r => String(opts.getRowId(r)) === String(rowId))
            : undefined)

        if (row) {
          void loadRowDetail(row)
        }
      }

      lastExpandedSnapshot.value = nextSet
    },
    { flush: 'post' }
  )

  return {
    canRenderRowDetail,
    expandedRowIds,
    expandedRowIdsModel,
    isRowExpanded,
    toggleRowExpanded,
    getDetailKey,
    rowDetailData,
    rowDetailRaw,
    rowDetailLoading,
    rowDetailError,
    loadRowDetail
  }
}
