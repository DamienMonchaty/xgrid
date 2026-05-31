import { DATATABLE_CONSTANTS } from '../constants/datatable.constants'
import type { DataLoadedResult, LoadDataParams, ServerResponse, TableRow } from '../types/datatable.types'
import { LoadingState, type DataTableOptions } from './useDataTableCore'

export function useDataTableGridInfinite(opts: {
    // Mode/options
    actualMode: Ref<string>
    resolvedOptions: Ref<{ gridInfiniteCachePages?: number }>

    // Server/client + loading
    isServerMode: Ref<boolean>
    isInitialLoading: Ref<boolean>
    loadingState: Ref<LoadingState>

    // Server fetch
    actualApiUrl: Ref<string | undefined>
    serverData: Ref<TableRow[]>
    serverTotal: Ref<number>
    reactivePageSize: Ref<number>

    // Load-more flags
    allDataLoaded: Ref<boolean>
    canLoadMoreInClient: Ref<boolean>
    loadMore: () => void | Promise<void>

    // Builders come from server-loader; set after it is created
    buildApiParamsRef: Ref<((page: number) => LoadDataParams) | null>
    buildFetchQueryRef: Ref<((params: LoadDataParams) => Record<string, unknown>) | null>

    // Side-effects
    startLoadingMore: () => void
    stopLoading: () => void
    forceCheckboxUpdate: () => void
    debugLog: (message: string, data?: unknown) => void

    // Events
    emitAndCall: (eventName: string, optionHandlerName: keyof DataTableOptions, ...args: unknown[]) => void
    emitLegacy: (eventName: 'load-data' | 'data-loaded', payload: LoadDataParams | DataLoadedResult) => void
}) {
    const isGridInfiniteMode = computed(() => opts.actualMode.value === 'gridInfinite')

    const gridScrollContainer = ref<HTMLElement | null>(null)

    const gridInfiniteCachePages = computed<number>(() => {
        const v = Number(opts.resolvedOptions.value.gridInfiniteCachePages ?? 0)
        return Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0
    })

    const isGridInfiniteCached = computed<boolean>(() => {
        return isGridInfiniteMode.value && opts.isServerMode.value && gridInfiniteCachePages.value > 0
    })

    const gridInfiniteMinPageLoaded = ref<number>(1)
    const gridInfiniteMaxPageLoaded = ref<number>(1)
    const gridInfiniteTotalPages = ref<number>(1)
    const gridInfinitePageSizes = reactive<Record<number, number>>({})
    const gridInfiniteLoadingDirection = ref<'up' | 'down' | null>(null)

    const gridInfiniteMeasuredRowHeightPx = ref<number | null>(null)

    function getGridInfiniteRowHeightPx(): number {
        if (gridInfiniteMeasuredRowHeightPx.value && gridInfiniteMeasuredRowHeightPx.value > 0) {
            return gridInfiniteMeasuredRowHeightPx.value
        }
        return 44
    }

    function measureGridInfiniteRowHeight() {
        if (!isGridInfiniteMode.value) return
        if (gridInfiniteMeasuredRowHeightPx.value) return

        const el = gridScrollContainer.value
        if (!el) return

        const rowEl = el.querySelector('tbody tr') as HTMLElement | null
        if (!rowEl) return

        const h = rowEl.getBoundingClientRect().height
        if (h && Number.isFinite(h) && h > 0) {
            gridInfiniteMeasuredRowHeightPx.value = h
        }
    }

    function resetGridInfiniteState() {
        gridInfiniteMinPageLoaded.value = 1
        gridInfiniteMaxPageLoaded.value = 1
        gridInfiniteTotalPages.value = 1
        gridInfiniteLoadingDirection.value = null
        for (const k of Object.keys(gridInfinitePageSizes)) {
            delete gridInfinitePageSizes[Number(k)]
        }
    }

    function pruneGridInfiniteCache(direction: 'up' | 'down') {
        if (!isGridInfiniteCached.value) return

        const cachePages = gridInfiniteCachePages.value
        const el = gridScrollContainer.value

        while ((gridInfiniteMaxPageLoaded.value - gridInfiniteMinPageLoaded.value + 1) > cachePages) {
            if (direction === 'down') {
                const pageToDrop = gridInfiniteMinPageLoaded.value
                const dropCount = gridInfinitePageSizes[pageToDrop] ?? opts.reactivePageSize.value

                // 'down' prune is typically chained right after an append (handleLoadMoreData),
                // so the appended rows are not yet in the DOM. We MUST defer through nextTick
                // so prevScrollHeight reflects the real post-append height, otherwise the
                // compensation delta collapses to ~0 and the viewport visibly jumps.
                if (el) {
                    nextTick(() => {
                        const prevScrollTop = el.scrollTop
                        const prevScrollHeight = el.scrollHeight

                        opts.serverData.value = (opts.serverData.value || []).slice(dropCount)
                        delete gridInfinitePageSizes[pageToDrop]
                        gridInfiniteMinPageLoaded.value = pageToDrop + 1

                        nextTick(() => {
                            const removedPx = Math.max(0, prevScrollHeight - el.scrollHeight)
                            adjustScrollTopProgrammatically(el, Math.max(0, prevScrollTop - removedPx))
                        })
                    })
                } else {
                    opts.serverData.value = (opts.serverData.value || []).slice(dropCount)
                    delete gridInfinitePageSizes[pageToDrop]
                    gridInfiniteMinPageLoaded.value = pageToDrop + 1
                }
                // We mutated min within nextTick above; break the while loop so we don't
                // over-prune on stale counters. The next loadMore will re-evaluate.
                break
            } else {
                const pageToDrop = gridInfiniteMaxPageLoaded.value
                const dropCount = gridInfinitePageSizes[pageToDrop] ?? opts.reactivePageSize.value

                opts.serverData.value = (opts.serverData.value || []).slice(0, Math.max(0, (opts.serverData.value || []).length - dropCount))
                delete gridInfinitePageSizes[pageToDrop]
                gridInfiniteMaxPageLoaded.value = pageToDrop - 1
            }
        }
    }

    const GRID_INFINITE_BOTTOM_THRESHOLD_PX = 140
    const GRID_INFINITE_TOP_THRESHOLD_PX = 140
    const GRID_INFINITE_SUPPRESS_AFTER_ADJUST_MS = 250

    let gridInfiniteScrollThrottleTimer: NodeJS.Timeout | null = null
    let gridInfiniteAutoCheckTimer: NodeJS.Timeout | null = null
    // Set whenever we programmatically change scrollTop (prune / prepend compensation).
    // While this is in the future, scroll events do not trigger load-more / load-previous,
    // otherwise a programmatic jump can land near a threshold and cause an infinite loop.
    let gridInfiniteSuppressTriggersUntil = 0

    function adjustScrollTopProgrammatically(el: HTMLElement, newTop: number) {
        gridInfiniteSuppressTriggersUntil = Date.now() + GRID_INFINITE_SUPPRESS_AFTER_ADJUST_MS
        el.scrollTop = newTop
        // Refresh after one more frame: the 'scroll' event from this assignment is
        // queued by the browser, so we want the guard to still be active when it fires.
        gridInfiniteSuppressTriggersUntil = Date.now() + GRID_INFINITE_SUPPRESS_AFTER_ADJUST_MS
    }

    function maybeTriggerGridInfiniteLoadMore(source: string) {
        if (opts.actualMode.value !== 'gridInfinite') return
        if (opts.isInitialLoading.value) return
        if (opts.loadingState.value === LoadingState.LOADING_MORE) return
        if (Date.now() < gridInfiniteSuppressTriggersUntil) return

        const el = gridScrollContainer.value
        if (!el) return

        const canLoad = opts.isServerMode.value ? !opts.allDataLoaded.value : opts.canLoadMoreInClient.value
        if (!canLoad) return

        const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
        if (distanceToBottom <= GRID_INFINITE_BOTTOM_THRESHOLD_PX) {
            opts.debugLog('GridInfinite: near bottom -> loadMore()', { source, distanceToBottom })
            opts.loadMore()
        }
    }

    function maybeTriggerGridInfiniteLoadPrevious(source: string) {
        if (!isGridInfiniteCached.value) return
        if (gridInfiniteMinPageLoaded.value <= 1) return
        if (opts.isInitialLoading.value) return
        if (opts.loadingState.value === LoadingState.LOADING_MORE) return
        if (Date.now() < gridInfiniteSuppressTriggersUntil) return

        const el = gridScrollContainer.value
        if (!el) return

        if (el.scrollTop <= GRID_INFINITE_TOP_THRESHOLD_PX) {
            opts.debugLog('GridInfinite: near top -> load previous page', { source, scrollTop: el.scrollTop })
            loadGridInfinitePreviousPage()
        }
    }

    function onGridScroll() {
        if (opts.actualMode.value !== 'gridInfinite') return

        // Throttle to avoid calling loadMore too often while scrolling
        if (gridInfiniteScrollThrottleTimer) return
        gridInfiniteScrollThrottleTimer = setTimeout(() => {
            gridInfiniteScrollThrottleTimer = null
            nextTick(() => {
                maybeTriggerGridInfiniteLoadMore('scroll')
                maybeTriggerGridInfiniteLoadPrevious('scroll')
            })
        }, DATATABLE_CONSTANTS.TIMEOUTS.INFINITE_SCROLL_THROTTLE)
    }

    async function loadGridInfinitePreviousPage() {
        if (!isGridInfiniteCached.value) return
        if (!opts.isServerMode.value || !opts.actualApiUrl.value) return
        if (opts.loadingState.value === LoadingState.LOADING_MORE) return
        if (gridInfiniteMinPageLoaded.value <= 1) return

        const buildApiParams = opts.buildApiParamsRef.value
        const buildFetchQuery = opts.buildFetchQueryRef.value
        if (!buildApiParams || !buildFetchQuery) return

        const prevPage = gridInfiniteMinPageLoaded.value - 1
        const el = gridScrollContainer.value

        gridInfiniteLoadingDirection.value = 'up'

        opts.startLoadingMore()
        try {
            const params = buildApiParams(prevPage)

            opts.debugLog('GridInfinite: Fetch previous page', { prevPage, params })

            opts.emitAndCall('server-request', 'onServerRequest', params)
            opts.emitLegacy('load-data', params)

            const apiData = await $fetch<ServerResponse>(opts.actualApiUrl.value, {
                query: buildFetchQuery(params),
                timeout: 30000
            })

            if (apiData?.success) {
                const newRows = apiData.data || []

                // Snapshot DOM AFTER the await (= just before the mutation):
                // the user may have scrolled during the fetch, so we must use the
                // current scrollTop/scrollHeight, not a stale value captured before.
                const prevScrollTop = el?.scrollTop ?? 0
                const prevScrollHeight = el?.scrollHeight ?? 0

                // Prepend new rows
                opts.serverData.value = [...newRows, ...(opts.serverData.value || [])]
                gridInfinitePageSizes[prevPage] = newRows.length
                gridInfiniteMinPageLoaded.value = prevPage
                gridInfiniteTotalPages.value = apiData.totalPages || gridInfiniteTotalPages.value

                // Keep max in sync
                gridInfiniteMaxPageLoaded.value = Math.max(gridInfiniteMaxPageLoaded.value, prevPage)

                // Compensate scroll using the exact pixel delta from the DOM,
                // anchoring on whatever the user is looking at RIGHT NOW.
                if (el) {
                    nextTick(() => {
                        const addedPx = Math.max(0, el.scrollHeight - prevScrollHeight)
                        adjustScrollTopProgrammatically(el, prevScrollTop + addedPx)
                    })
                }

                // Cache eviction from bottom when going up
                pruneGridInfiniteCache('up')

                const result: DataLoadedResult = {
                    data: apiData.data,
                    total: apiData.total,
                    page: apiData.page,
                    totalPages: apiData.totalPages,
                    isLoadMore: true
                }

                opts.emitAndCall('server-response', 'onServerResponse', result)
                opts.emitLegacy('data-loaded', result)

                opts.serverTotal.value = apiData.total || opts.serverTotal.value
                opts.allDataLoaded.value = gridInfiniteMaxPageLoaded.value >= (apiData.totalPages || gridInfiniteTotalPages.value)

                opts.forceCheckboxUpdate()
            } else {
                console.error('API error:', apiData?.error)
                opts.forceCheckboxUpdate()
            }
        } catch (fetchError) {
            console.error('Failed to load server data:', fetchError)
            opts.emitAndCall('error', 'onError', fetchError instanceof Error ? fetchError : new Error(String(fetchError)))
        } finally {
            opts.stopLoading()
            gridInfiniteLoadingDirection.value = null
            opts.forceCheckboxUpdate()

            nextTick(() => {
                measureGridInfiniteRowHeight()
            })
        }
    }

    function onGridInfiniteDataMaybeChanged() {
        if (opts.actualMode.value !== 'gridInfinite') return

        if (gridInfiniteAutoCheckTimer) {
            clearTimeout(gridInfiniteAutoCheckTimer)
        }

        gridInfiniteAutoCheckTimer = setTimeout(() => {
            nextTick(() => {
                maybeTriggerGridInfiniteLoadMore('data-change')
            })
        }, DATATABLE_CONSTANTS.TIMEOUTS.INFINITE_SCROLL_THROTTLE)
    }

    function cleanupGridInfiniteScroll() {
        if (gridInfiniteScrollThrottleTimer) {
            clearTimeout(gridInfiniteScrollThrottleTimer)
            gridInfiniteScrollThrottleTimer = null
        }
        if (gridInfiniteAutoCheckTimer) {
            clearTimeout(gridInfiniteAutoCheckTimer)
            gridInfiniteAutoCheckTimer = null
        }
    }

    return {
        // DOM + mode
        gridScrollContainer,
        isGridInfiniteMode,
        isGridInfiniteCached,
        gridInfiniteCachePages,

        // State
        gridInfiniteMinPageLoaded,
        gridInfiniteMaxPageLoaded,
        gridInfiniteTotalPages,
        gridInfinitePageSizes,
        gridInfiniteLoadingDirection,

        // Helpers used by server-loader
        getGridInfiniteRowHeightPx,
        measureGridInfiniteRowHeight,
        resetGridInfiniteState,
        pruneGridInfiniteCache,

        // Scroll orchestration
        maybeTriggerGridInfiniteLoadMore,
        maybeTriggerGridInfiniteLoadPrevious,
        onGridScroll,
        onGridInfiniteDataMaybeChanged,
        cleanupGridInfiniteScroll
    }
}
