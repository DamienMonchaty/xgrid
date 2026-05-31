import { watch, nextTick, type Ref } from 'vue'
import { LoadingState, type DataTableOptions } from './useDataTableCore'
import type { ServerDatasourceFn } from '../types/datatable.types'

export function useDataTableServerLoader(opts: {
    // Mode / url
    isServerMode: Ref<boolean>
    actualApiUrl: Ref<string | undefined>
    actualServerFn: Ref<ServerDatasourceFn | null>
    actualMode: Ref<string>

    // Loading state
    loadingState: Ref<LoadingState>
    isInitialized: Ref<boolean>

    // Pagination / sorting / filtering / search
    page: Ref<number>
    loadedPages: Ref<number>
    reactivePageSize: Ref<number>
    debouncedSearch: Ref<string>
    sortKey: Ref<string>
    sortDir: Ref<'asc' | 'desc'>
    columnFilters: ColumnFilter

    deepClone: <T>(value: T) => T

    // Data
    pagedRows: Ref<TableRow[]>
    serverData: Ref<TableRow[]>
    serverTotal: Ref<number>
    allDataLoaded: Ref<boolean>

    // gridInfinite state
    isGridInfiniteCached: Ref<boolean>
    gridInfiniteMinPageLoaded: Ref<number>
    gridInfiniteMaxPageLoaded: Ref<number>
    gridInfiniteTotalPages: Ref<number>
    gridInfinitePageSizes: Record<number, number>
    gridInfiniteLoadingDirection: Ref<'up' | 'down' | null>

    resetGridInfiniteState: () => void
    pruneGridInfiniteCache: (direction: 'up' | 'down') => void
    measureGridInfiniteRowHeight: () => void

    // Side effects
    preserveCurrentState: () => void
    startInitialLoading: () => void
    startLoadingMore: () => void
    stopLoading: () => void
    forceCheckboxUpdate: () => void

    debugLog: (message: string, data?: unknown) => void

    // Events
    emitAndCall: (eventName: string, optionHandlerName: keyof DataTableOptions, ...args: unknown[]) => void
    emitLegacy: (eventName: 'load-data' | 'data-loaded', payload: LoadDataParams | DataLoadedResult) => void

    // Extra context for watchers
    isRefreshing: Ref<boolean>
}) {
    function calculateCurrentPage(isLoadMore: boolean): number {
        if (opts.actualMode.value === 'gridInfinite') {
            const base = opts.isGridInfiniteCached.value ? opts.gridInfiniteMaxPageLoaded.value : opts.loadedPages.value
            return isLoadMore ? base + 1 : 1
        }

        if (opts.actualMode.value === 'loadMore' || opts.actualMode.value === 'infinite') {
            return isLoadMore ? opts.loadedPages.value + 1 : 1
        } else {
            return opts.page.value
        }
    }

    function buildApiParams(currentPage: number): LoadDataParams {
        const rawFilters = opts.deepClone(opts.columnFilters)

        const compactFiltersForRequest = (filters: ColumnFilter): ColumnFilter => {
            const out: ColumnFilter = {}

            for (const [key, raw] of Object.entries(filters || {})) {
                if (raw == null) continue

                if (typeof raw === 'string') {
                    if (raw.trim() === '') continue
                    out[key] = raw
                    continue
                }

                if (typeof raw === 'object') {
                    // Operator filter (text/number/date/boolean)
                    if ('operator' in (raw as object)) {
                        const rawFilter = raw as { operator?: unknown; value?: unknown; value2?: unknown }
                        const op = String(rawFilter.operator ?? '')
                        const v1 = rawFilter.value
                        const v2 = rawFilter.value2

                        const v1Empty = v1 == null || String(v1).trim() === ''
                        const v2Empty = v2 == null || String(v2).trim() === ''

                        const isRange = op === 'between' || op === 'notBetween'
                        if (isRange) {
                            if (v1Empty && v2Empty) continue
                        } else {
                            if (v1Empty) continue
                        }

                        out[key] = raw
                        continue
                    }

                    // Select filter map: { optionKey: boolean }
                    const values = Object.values(raw as Record<string, unknown>)
                    if (!values.length) continue

                    // All true = no filtering, don't send.
                    if (values.every(v => v === true)) continue

                    out[key] = raw
                    continue
                }

                // numbers/booleans: always consider active
                out[key] = raw
            }

            return out
        }

        return {
            page: currentPage,
            pageSize: opts.reactivePageSize.value,
            search: opts.debouncedSearch.value,
            sort: opts.sortKey.value ? { key: opts.sortKey.value, direction: opts.sortDir.value } : undefined,
            // Keep defaults internally for UI, but only send active filters.
            filters: compactFiltersForRequest(rawFilters)
        }
    }

    function buildFetchQuery(params: LoadDataParams): Record<string, unknown> {
        const query: Record<string, unknown> = {
            page: params.page,
            pageSize: params.pageSize
        }

        const search = String(params.search ?? '').trim()
        if (search) query.search = search

        if (params.sort?.key) query.sort = params.sort

        const filters = params.filters ?? {}
        if (filters && typeof filters === 'object' && Object.keys(filters).length > 0) {
            query.filters = filters
        }

        return query
    }

    function handleLoadMoreData(apiData: ServerResponse, currentPage: number): void {
        opts.debugLog('LoadMore: BEFORE loadedPages update', {
            loadedPagesBefore: opts.loadedPages.value,
            currentPage,
            serverDataLength: opts.serverData.value.length
        })

        opts.serverData.value = [...opts.serverData.value, ...(apiData.data || [])]
        opts.loadedPages.value = currentPage

        if (opts.actualMode.value === 'gridInfinite') {
            opts.gridInfiniteMaxPageLoaded.value = Math.max(opts.gridInfiniteMaxPageLoaded.value, currentPage)
            opts.gridInfiniteTotalPages.value = apiData.totalPages || Math.max(1, Math.ceil((apiData.total || 0) / opts.reactivePageSize.value))
            opts.gridInfinitePageSizes[currentPage] = (apiData.data || []).length

            if (opts.gridInfiniteMinPageLoaded.value > opts.gridInfiniteMaxPageLoaded.value) {
                opts.gridInfiniteMinPageLoaded.value = opts.gridInfiniteMaxPageLoaded.value
            }
        }

        opts.debugLog('LoadMore: AFTER loadedPages update', {
            loadedPagesAfter: opts.loadedPages.value,
            currentPage,
            serverDataLength: opts.serverData.value.length
        })

        const totalLoadedItems = opts.serverData.value.length

        // Check if all data is loaded
        if (opts.actualMode.value === 'gridInfinite' && opts.isGridInfiniteCached.value) {
            opts.allDataLoaded.value = opts.gridInfiniteMaxPageLoaded.value >= opts.gridInfiniteTotalPages.value
        } else {
            opts.allDataLoaded.value = totalLoadedItems >= (apiData.total || 0) || (apiData.data || []).length < opts.reactivePageSize.value
        }

        opts.debugLog('LoadMore: Data appended', {
            newDataLength: (apiData.data || []).length,
            totalLoadedItems,
            apiTotal: apiData.total,
            pageSize: opts.reactivePageSize.value,
            allDataLoaded: opts.allDataLoaded.value,
            currentPage: opts.loadedPages.value
        })

        // Cache eviction (gridInfinite cached mode)
        if (opts.actualMode.value === 'gridInfinite') {
            opts.pruneGridInfiniteCache('down')
        }
    }

    function handleInitialLoadMore(apiData: ServerResponse): void {
        opts.serverData.value = apiData.data || []
        opts.loadedPages.value = 1

        if (opts.actualMode.value === 'gridInfinite') {
            opts.resetGridInfiniteState()
            opts.gridInfiniteMinPageLoaded.value = 1
            opts.gridInfiniteMaxPageLoaded.value = 1
            opts.gridInfiniteTotalPages.value = apiData.totalPages || Math.max(1, Math.ceil((apiData.total || 0) / opts.reactivePageSize.value))
            opts.gridInfinitePageSizes[1] = (apiData.data || []).length

            if (opts.isGridInfiniteCached.value) {
                opts.allDataLoaded.value = opts.gridInfiniteMaxPageLoaded.value >= opts.gridInfiniteTotalPages.value
            } else {
                opts.allDataLoaded.value = (apiData.data || []).length < opts.reactivePageSize.value || (apiData.data || []).length >= (apiData.total || 0)
            }
        } else {
            opts.allDataLoaded.value = (apiData.data || []).length < opts.reactivePageSize.value || (apiData.data || []).length >= (apiData.total || 0)
        }

        opts.debugLog('Initial load for loadMore/infinite', {
            dataLength: (apiData.data || []).length,
            pageSize: opts.reactivePageSize.value,
            apiTotal: apiData.total,
            allDataLoaded: opts.allDataLoaded.value,
            loadedPages: opts.loadedPages.value
        })
    }

    function handlePaginationData(apiData: ServerResponse, currentPage: number): void {
        opts.serverData.value = apiData.data || []
        opts.debugLog('Classic pagination - data replaced', {
            dataLength: (apiData.data || []).length,
            currentPage
        })
    }

    function handleApiError(apiData: ServerResponse | null, isLoadMore: boolean): void {
        console.error('API error:', apiData?.error)
        if (!isLoadMore) {
            opts.serverData.value = []
            opts.serverTotal.value = 0
        }
        opts.forceCheckboxUpdate()
    }

    function handleFetchError(error: unknown, isLoadMore: boolean): void {
        console.error('Failed to load server data:', error)
        if (!isLoadMore) {
            opts.serverData.value = []
            opts.serverTotal.value = 0
        }
    }

    async function loadServerData(isLoadMore = false, source = 'unknown'): Promise<void> {
        if (!opts.isServerMode.value || (!opts.actualApiUrl.value && !opts.actualServerFn.value)) return

        opts.debugLog(`LoadServerData: Called from ${source}`, {
            isLoadMore,
            isInitialized: opts.isInitialized.value,
            loadingState: opts.loadingState.value
        })

        // Prevent concurrent API calls, except for explicit refresh
        if (opts.loadingState.value !== LoadingState.IDLE && !isLoadMore && source !== 'handleRefresh') {
            opts.debugLog('LoadServerData: API call already in progress, skipped')
            return
        }

        // If refresh and loading already in progress, force stop
        if (source === 'handleRefresh' && opts.loadingState.value !== LoadingState.IDLE) {
            opts.debugLog('LoadServerData: Refresh - stopping previous loading')
            opts.stopLoading()
        }

        // Preserve current state if not loadMore, has data, and not a refresh (already done in handleRefresh)
        if (!isLoadMore && opts.pagedRows.value.length > 0 && source !== 'handleRefresh') {
            opts.preserveCurrentState()
        }

        // Set loading state and reset data if needed
        if (isLoadMore) {
            opts.startLoadingMore()
        } else {
            // Always start initial loading for non-loadMore calls
            opts.debugLog('LoadServerData: Starting initial loading')
            opts.startInitialLoading()

            // Only reset data for loadMore/infinite/gridInfinite modes
            if (opts.actualMode.value === 'loadMore' || opts.actualMode.value === 'infinite' || opts.actualMode.value === 'gridInfinite') {
                opts.serverData.value = []
                opts.loadedPages.value = 1
                opts.allDataLoaded.value = false

                if (opts.actualMode.value === 'gridInfinite') {
                    opts.resetGridInfiniteState()
                }
            }
        }

        try {
            const currentPage = calculateCurrentPage(isLoadMore)
            const params = buildApiParams(currentPage)

            opts.debugLog('LoadServerData: Page calculation', {
                isLoadMore,
                paginationType: opts.actualMode.value,
                loadedPages: opts.loadedPages.value,
                pageValue: opts.page.value,
                currentPage,
                serverDataLength: opts.serverData.value.length
            })

            opts.debugLog('LoadServerData: API params', params)

            // ✅ Emit server request event
            opts.emitAndCall('server-request', 'onServerRequest', params)
            // ✅ Legacy compatibility
            opts.emitLegacy('load-data', params)

            try {
                // 30s safety timeout
                let timeoutId: ReturnType<typeof setTimeout> | undefined
                const timeoutPromise = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => reject(new Error('API call timeout after 30 seconds')), 30000)
                })

                const fetchPromise: Promise<ServerResponse> = opts.actualServerFn.value
                    ? Promise.resolve(opts.actualServerFn.value(params))
                    : ($fetch<ServerResponse>(opts.actualApiUrl.value as string, {
                        query: buildFetchQuery(params),
                        timeout: 30000
                    }) as Promise<ServerResponse>)

                const apiData = (await Promise.race([fetchPromise, timeoutPromise]).finally(() => {
                    if (timeoutId) clearTimeout(timeoutId)
                })) as ServerResponse

                opts.debugLog('LoadServerData: API response received', { success: apiData?.success, dataLength: apiData?.data?.length })

                if (apiData?.success) {
                    // Handle different data loading scenarios
                    if (isLoadMore) {
                        handleLoadMoreData(apiData, currentPage)
                    } else if (opts.actualMode.value === 'loadMore' || opts.actualMode.value === 'infinite' || opts.actualMode.value === 'gridInfinite') {
                        handleInitialLoadMore(apiData)
                    } else {
                        handlePaginationData(apiData, currentPage)
                    }

                    opts.serverTotal.value = apiData.total || 0

                    const result: DataLoadedResult = {
                        data: apiData.data,
                        total: apiData.total,
                        page: apiData.page,
                        totalPages: apiData.totalPages,
                        isLoadMore
                    }

                    // ✅ Emit modern server response event
                    opts.emitAndCall('server-response', 'onServerResponse', result)
                    // ✅ Legacy compatibility
                    opts.emitLegacy('data-loaded', result)

                    opts.forceCheckboxUpdate()
                } else {
                    handleApiError(apiData, isLoadMore)
                }
            } catch (fetchError) {
                console.error('LoadServerData: Fetch error:', fetchError)
                opts.debugLog('LoadServerData: Error details', {
                    error: fetchError,
                    url: opts.actualApiUrl.value,
                    params,
                    isLoadMore
                })
                handleFetchError(fetchError, isLoadMore)
                opts.emitAndCall('error', 'onError', fetchError instanceof Error ? fetchError : new Error(String(fetchError)))
            }
        } finally {
            opts.stopLoading()
            if (opts.actualMode.value === 'gridInfinite') {
                opts.gridInfiniteLoadingDirection.value = null
            }
            opts.forceCheckboxUpdate()

            nextTick(() => {
                opts.measureGridInfiniteRowHeight()
            })
        }
    }

    function setupServerWatchers() {
        watch(opts.page, () => {
            if (!opts.isInitialized.value) return
            if (opts.isRefreshing.value) return
            if (opts.isServerMode.value && opts.actualMode.value === 'paginated') {
                loadServerData(false, 'page-watcher')
            }
        }, { flush: 'post' })

        watch(
            [opts.debouncedSearch, opts.sortKey, opts.sortDir, () => opts.columnFilters, opts.reactivePageSize],
            () => {
                if (!opts.isInitialized.value) return
                if (opts.isRefreshing.value) return
                if (!opts.isServerMode.value) return

                if (opts.actualMode.value === 'paginated') {
                    if (opts.page.value !== 1) {
                        opts.page.value = 1
                        return
                    }
                    loadServerData(false, 'server-params-watcher')
                    return
                }

                loadServerData(false, 'server-params-watcher')
            },
            { deep: true, flush: 'post' }
        )
    }

    return {
        calculateCurrentPage,
        buildApiParams,
        buildFetchQuery,
        loadServerData,
        setupServerWatchers
    }
}
