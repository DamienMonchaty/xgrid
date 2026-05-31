/**
 * Composable pour optimiser les informations de pagination du DataTable
 * Centralise la logique de calcul et de formatage des informations de pagination
 */
import { TEXT_LABELS } from '../constants/datatable.constants'
import type { TableRow } from '../types/datatable.types'

export interface PaginationInfo {
  showingPage: string
  loadedInfo: string
  hasMoreData: boolean
  canLoadMore: boolean
  currentPage: number
  totalPages: number
  totalItems: number
  displayedItems: number
}

export const useDataTablePagination = (
  isServerMode: Ref<boolean>,
  actualPaginationType: Ref<string>,
  page: Ref<number>,
  totalPages: Ref<number>,
  serverTotal: Ref<number>,
  serverData: Ref<TableRow[]>,
  filteredData: Ref<TableRow[]>,
  pagedRows: Ref<TableRow[]>,
  allDataLoaded: Ref<boolean>,
  canLoadMoreInClient: Ref<boolean>,
  loadedPages: Ref<number>,
  pageSize: number
) => {
  /**
   * Informations de pagination pour l'affichage classique par pages
   */
  const paginationInfo = computed((): string => {
    if (isServerMode.value) {
      return `${TEXT_LABELS.SHOWING_PAGE} ${page.value} ${TEXT_LABELS.OF} ${totalPages.value} · ${serverTotal.value} ${TEXT_LABELS.ITEMS} ${TEXT_LABELS.TOTAL}`
    }
    return `${TEXT_LABELS.SHOWING_PAGE} ${page.value} ${TEXT_LABELS.OF} ${totalPages.value} · ${filteredData.value.length} ${TEXT_LABELS.ITEMS}`
  })

  /**
   * Informations pour les modes loadMore et infinite
   */
  const loadMoreInfo = computed((): string => {
    if (isServerMode.value) {
      return `${serverData.value.length} ${TEXT_LABELS.OF} ${serverTotal.value} ${TEXT_LABELS.ITEMS} loaded`
    }
    return `${pagedRows.value.length} ${TEXT_LABELS.OF} ${filteredData.value.length} ${TEXT_LABELS.ITEMS} ${TEXT_LABELS.DISPLAYED}`
  })

  /**
   * Texte pour le bouton "Load More" en mode serveur
   */
  const loadMoreButtonTextServer = computed((): string => {
    const remainingItems = serverTotal.value - serverData.value.length
    const itemsToLoad = Math.min(pageSize, remainingItems)
    return `${TEXT_LABELS.LOAD_MORE} (${itemsToLoad} ${TEXT_LABELS.ITEMS})`
  })

  /**
   * Texte pour le bouton "Show More" en mode client
   */
  const loadMoreButtonTextClient = computed((): string => {
    const remainingItems = filteredData.value.length - pagedRows.value.length
    const itemsToShow = Math.min(pageSize, remainingItems)
    return `${TEXT_LABELS.SHOW_MORE} (${itemsToShow} ${TEXT_LABELS.ITEMS})`
  })

  /**
   * Détermine s'il y a plus de données à charger
   */
  const hasMoreData = computed((): boolean => {
    if (isServerMode.value) {
      return !allDataLoaded.value
    }
    return canLoadMoreInClient.value
  })

  /**
   * Détermine si le bouton "Load More" doit être affiché
   */
  const shouldShowLoadMoreButton = computed((): boolean => {
    if (actualPaginationType.value !== 'loadMore') {
      return false
    }

    if (isServerMode.value) {
      return hasMoreData.value
    }
    
    return canLoadMoreInClient.value
  })

  /**
   * Informations complètes de pagination
   */
  const fullPaginationInfo = computed((): PaginationInfo => {
    return {
      showingPage: paginationInfo.value,
      loadedInfo: loadMoreInfo.value,
      hasMoreData: hasMoreData.value,
      canLoadMore: shouldShowLoadMoreButton.value,
      currentPage: page.value,
      totalPages: totalPages.value,
      totalItems: isServerMode.value ? serverTotal.value : filteredData.value.length,
      displayedItems: pagedRows.value.length
    }
  })

  /**
   * Calcule le nombre d'éléments affichés par rapport au total
   */
  const itemsDisplayedRatio = computed((): { displayed: number; total: number; percentage: number } => {
    const displayed = pagedRows.value.length
    const total = isServerMode.value ? serverTotal.value : filteredData.value.length
    const percentage = total > 0 ? Math.round((displayed / total) * 100) : 0

    return { displayed, total, percentage }
  })

  /**
   * Génère un résumé textuel de l'état actuel des données
   */
  const statusSummary = computed((): string => {
    const ratio = itemsDisplayedRatio.value

    if (actualPaginationType.value === 'pages') {
      return paginationInfo.value
    }

    if (actualPaginationType.value === 'loadMore' || actualPaginationType.value === 'infinite' || actualPaginationType.value === 'gridInfinite') {
      const baseInfo = loadMoreInfo.value
      
      if (hasMoreData.value) {
        return `${baseInfo} (${ratio.percentage}% loaded)`
      } else {
        return `${baseInfo} (${TEXT_LABELS.ALL_LOADED})`
      }
    }

    return `${ratio.displayed} ${TEXT_LABELS.ITEMS} ${TEXT_LABELS.DISPLAYED}`
  })

  /**
   * Retourne le texte approprié pour le bouton load more selon le contexte
   */
  const getLoadMoreButtonText = (): string => {
    if (isServerMode.value) {
      return loadMoreButtonTextServer.value
    }
    return loadMoreButtonTextClient.value
  }

  /**
   * Calcule les informations de page pour l'accessibilité
   */
  const accessibilityInfo = computed(() => {
    const info = fullPaginationInfo.value
    
    return {
      currentPage: info.currentPage,
      totalPages: info.totalPages,
      currentItems: info.displayedItems,
      totalItems: info.totalItems,
      ariaLabel: `Page ${info.currentPage} of ${info.totalPages}, showing ${info.displayedItems} of ${info.totalItems} items`
    }
  })

  /**
   * Détermine si on est sur la première page
   */
  const isFirstPage = computed((): boolean => {
    return page.value === 1
  })

  /**
   * Détermine si on est sur la dernière page
   */
  const isLastPage = computed((): boolean => {
    if (actualPaginationType.value === 'pages') {
      return page.value === totalPages.value
    }
    
    // Pour loadMore/infinite, on considère qu'on est sur la "dernière page" s'il n'y a plus de données
    return !hasMoreData.value
  })

  /**
   * Calcule la progression en pourcentage pour les modes loadMore/infinite
   */
  const loadingProgress = computed((): number => {
    if (actualPaginationType.value === 'pages') {
      return (page.value / totalPages.value) * 100
    }
    
    return itemsDisplayedRatio.value.percentage
  })

  return {
    // Computed properties
    paginationInfo,
    loadMoreInfo,
    loadMoreButtonTextServer,
    loadMoreButtonTextClient,
    hasMoreData,
    shouldShowLoadMoreButton,
    fullPaginationInfo,
    itemsDisplayedRatio,
    statusSummary,
    accessibilityInfo,
    isFirstPage,
    isLastPage,
    loadingProgress,
    
    // Methods
    getLoadMoreButtonText
  }
}
