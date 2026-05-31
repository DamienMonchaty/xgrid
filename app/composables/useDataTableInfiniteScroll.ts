import { DATATABLE_CONSTANTS } from '../constants/datatable.constants'
import type { TableRow } from '../types/datatable.types'
import { LoadingState } from './useDataTableCore'

export type DataTableInfiniteScrollDeps = {
  actualMode: Ref<string>
  isServerMode: Ref<boolean>
  allDataLoaded: Ref<boolean>
  canLoadMoreInClient: Ref<boolean>
  loadingState: Ref<LoadingState>
  loadMore: () => void
  debugLog: (message: string, data?: unknown) => void

  // Optional: used to auto-orchestrate infinite/gridInfinite re-setup
  serverData?: Ref<TableRow[]>
  actualData?: Ref<TableRow[]>
  loadedPages?: Ref<number>
  onGridInfiniteDataMaybeChanged?: () => void
  maybeTriggerGridInfiniteLoadMore?: (reason: string) => void
}

export function useDataTableInfiniteScroll(deps: DataTableInfiniteScrollDeps) {
  const infiniteScrollTrigger = ref<HTMLElement>()
  const setInfiniteScrollTriggerEl = (el: HTMLElement | null) => {
    infiniteScrollTrigger.value = el ?? undefined
  }

  let intersectionObserver: IntersectionObserver | null = null

  const isInfiniteScrollSetup = ref(false)
  let lastTriggerElement: HTMLElement | null = null
  let resizeObserver: ResizeObserver | null = null

  // Throttle timer for DOM re-setup
  let infiniteScrollThrottleTimer: NodeJS.Timeout | null = null

  function cleanupInfiniteScroll() {
    if (intersectionObserver) {
      intersectionObserver.disconnect()
      intersectionObserver = null
    }
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    if (infiniteScrollThrottleTimer) {
      clearTimeout(infiniteScrollThrottleTimer)
      infiniteScrollThrottleTimer = null
    }
    lastTriggerElement = null
    isInfiniteScrollSetup.value = false
  }

  function setupInfiniteScroll() {
    if (deps.actualMode.value !== 'infinite') {
      cleanupInfiniteScroll()
      return
    }

    if (!infiniteScrollTrigger.value) {
      deps.debugLog('Infinite scroll: Element trigger non trouvé')
      return
    }

    if (
      intersectionObserver &&
      lastTriggerElement === infiniteScrollTrigger.value &&
      isInfiniteScrollSetup.value
    ) {
      deps.debugLog('Infinite scroll: Observer already setup for this element, skipping...')
      return
    }

    cleanupInfiniteScroll()

    deps.debugLog('Infinite scroll: Setting up new observer', {
      mode: deps.isServerMode.value ? 'server' : 'client',
      hasMoreData: deps.isServerMode.value ? !deps.allDataLoaded.value : deps.canLoadMoreInClient.value,
      elementExists: !!infiniteScrollTrigger.value
    })

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && deps.loadingState.value !== LoadingState.LOADING_MORE) {
          const canLoad = deps.isServerMode.value ? !deps.allDataLoaded.value : deps.canLoadMoreInClient.value

          deps.debugLog('Infinite scroll: Trigger visible', {
            mode: deps.isServerMode.value ? 'server' : 'client',
            intersecting: entry.isIntersecting,
            loadingState: deps.loadingState.value,
            canLoad,
            allDataLoaded: deps.allDataLoaded.value,
            canLoadMoreInClient: deps.canLoadMoreInClient.value
          })

          if (canLoad) {
            deps.debugLog('Infinite scroll: Déclenchement du chargement...')
            deps.loadMore()
          } else {
            deps.debugLog('Infinite scroll: Pas de données supplémentaires disponibles')
          }
        }
      },
      {
        threshold: DATATABLE_CONSTANTS.INTERSECTION_OBSERVER.THRESHOLD,
        rootMargin: DATATABLE_CONSTANTS.INTERSECTION_OBSERVER.ROOT_MARGIN
      }
    )

    if (typeof window !== 'undefined' && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        if (intersectionObserver && infiniteScrollTrigger.value) {
          intersectionObserver.unobserve(infiniteScrollTrigger.value)
          intersectionObserver.observe(infiniteScrollTrigger.value)
        }
      })
      resizeObserver.observe(infiniteScrollTrigger.value)
    }

    intersectionObserver.observe(infiniteScrollTrigger.value)
    lastTriggerElement = infiniteScrollTrigger.value
    isInfiniteScrollSetup.value = true

    deps.debugLog('Infinite scroll: Observer configuré avec succès')
  }

  // ==========================================
  // WATCHERS (moved from DataTable.vue)
  // ==========================================

  watch(() => deps.actualMode.value, (newType, oldType) => {
    if (oldType === 'infinite') {
      cleanupInfiniteScroll()
    }

    if (newType === 'infinite') {
      nextTick(() => {
        setupInfiniteScroll()
      })
    }

    if (newType === 'gridInfinite') {
      nextTick(() => {
        deps.maybeTriggerGridInfiniteLoadMore?.('mode-change')
      })
    }
  })

  watch([
    () => deps.serverData?.value,
    () => deps.actualData?.value,
    () => deps.canLoadMoreInClient.value,
    () => deps.loadedPages?.value
  ], () => {
    if (deps.actualMode.value === 'infinite') {
      if (infiniteScrollThrottleTimer) {
        clearTimeout(infiniteScrollThrottleTimer)
      }

      infiniteScrollThrottleTimer = setTimeout(() => {
        nextTick(() => {
          setupInfiniteScroll()
        })
      }, DATATABLE_CONSTANTS.TIMEOUTS.INFINITE_SCROLL_THROTTLE)
    }

    if (deps.actualMode.value === 'gridInfinite') {
      deps.onGridInfiniteDataMaybeChanged?.()
    }
  }, {
    deep: false,
    flush: 'post'
  })

  return {
    infiniteScrollTrigger,
    setInfiniteScrollTriggerEl,
    setupInfiniteScroll,
    cleanupInfiniteScroll
  }
}
