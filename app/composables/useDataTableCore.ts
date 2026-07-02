import type { TableRow, Column, BulkAction, TableTheme, ColumnFilter, LoadDataParams, DataLoadedResult, ServerDatasourceFn, TableGrouping } from '../types/datatable.types'
import { validateAndLogDataTableProps } from '../validators/datatable.validators'
import { DATATABLE_CONSTANTS } from '../constants/datatable.constants'

/**
 * Enum pour gérer les états de chargement
 */
export enum LoadingState {
  IDLE = 'idle',
  INITIAL_LOADING = 'initial_loading',
  LOADING_MORE = 'loading_more',
  REFRESHING = 'refreshing'
}

/**
 * Interface pour la configuration de la toolbar
 */
export interface ToolbarConfig {
  title?: string
  icon?: string
  searchable?: boolean
  searchPlaceholder?: string
  showColumns?: boolean
  showExport?: boolean
  showRefresh?: boolean
}

/**
 * Interface pour les options de configuration du tableau
 */
export interface DataTableOptions {
  // Source de données simplifiée - détection automatique du mode
  datasource: TableRow[] | string | ServerDatasourceFn // Array = client mode, String = URL serveur, Function = loader serveur custom
  // Mode pour loadMore/infinite uniquement - pagination classique = paginated: true
  mode?: 'loadMore' | 'infinite' | 'gridInfinite'

  /**
   * gridInfinite only: number of pages to keep in memory.
   * When set (> 0), older pages are evicted and will be re-fetched when scrolling back.
    * 5 (default) keeps the last 5 pages (windowed cache).
    * 0 keeps all loaded rows (classic loadMore behavior).
   */
  gridInfiniteCachePages?: number
  // Props communs
  columns: Column[]
  /** Enable master/detail (expandable) rows. Use the `row-detail` slot in DataTable to render the nested content. */
  expandable?: boolean

  /**
   * Master/detail lazy-load: URL (or factory) to fetch row detail when a row is expanded.
   * If provided, DataTable will call `$fetch(url, { query })` on expand (unless disabled).
   */
  rowDetailUrl?: string | ((row: TableRow) => string)

  /** Optional query params (or factory) for the detail request. */
  rowDetailQuery?: Record<string, unknown> | ((row: TableRow) => Record<string, unknown>)

  /** Cache detail per rowId (default: true). */
  rowDetailCache?: boolean

  /** Auto-load detail when expanding (default: true). */
  rowDetailAutoLoad?: boolean

  /**
   * Master/detail lazy-load (client-side): resolver (sync or async) used to compute/load
   * row detail when expanded. If provided, it takes precedence over `rowDetailUrl`.
   */
  rowDetailResolver?: (row: TableRow) => unknown
  selectable?: boolean
  pagination?: boolean
  pageSize?: number
  pageSizeSelector?: boolean | number[]
  loading?: boolean
  skeleton?: boolean
  debug?: boolean
  bulkActions?: BulkAction[]
  rowIdKey?: string
  grouping?: TableGrouping
  // Composants modulaires
  toolbar?: boolean | ToolbarConfig
  // Props de style
  theme?: TableTheme
  variant?: 'default' | 'default-dark' | 'elegant' | 'elegant-dark' | 'modern' | 'modern-dark'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  sticky?: boolean
  wrap?: boolean
  // Props de couleurs de sélection
  selectionColor?: string
  selectionColorDark?: string
  selectionHoverColor?: string
  selectionHoverColorDark?: string

  
  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  onSelectionChange?: (selectedRows: TableRow[]) => void
  onExport?: (selectedRows?: TableRow[]) => void
  onRefresh?: () => void
  onBulkAction?: (action: string, selectedRows: TableRow[]) => void
  onDataChange?: (data: TableRow[]) => void
  onFiltersChange?: (filters: ColumnFilter) => void
  onServerRequest?: (params: LoadDataParams) => void
  onServerResponse?: (result: DataLoadedResult) => void
  onError?: (error: Error) => void
  // Row detail / expand events
  onRowExpand?: (payload: { rowId: string | number, expanded: boolean }) => void
  onRowDetailRequest?: (payload: { rowId: string | number, url: string, query?: Record<string, unknown> }) => void
  onRowDetailResponse?: (payload: { rowId: string | number, url: string, query?: Record<string, unknown>, raw: unknown, detail: unknown }) => void
  onRowDetailError?: (payload: { rowId: string | number, url: string, query?: Record<string, unknown>, error: string }) => void
  // Editing events
  onAddRow?: () => void
  onEditStart?: (row: TableRow, column: string) => void
  onEditCancel?: (row: TableRow, column: string) => void
  onEditSave?: (row: TableRow, column: string, oldValue: unknown, newValue: unknown) => void
  onCellUpdate?: (row: TableRow, column: string, value: unknown) => void
}

/**
 * Interface pour les props du DataTable avec support pour les deux approches :
 * 1. Configuration via objet DataTableOptions (recommandé)
 * 2. Props individuelles (rétrocompatibilité)
 */
export interface DataTableCoreProps {
  // ==========================================
  // NOUVELLE APPROCHE : Configuration via objet
  // ==========================================
  options?: DataTableOptions
  
  // ==========================================
  // APPROCHE TRADITIONNELLE : Props individuelles
  // ==========================================
  // Source de données simplifiée - détection automatique du mode
  datasource?: TableRow[] | string | ServerDatasourceFn // Array = client mode, String = URL serveur, Function = loader serveur custom
  // Mode pour loadMore/infinite uniquement - pagination classique = paginated: true
  mode?: 'loadMore' | 'infinite' | 'gridInfinite'

  /**
   * gridInfinite only: number of pages to keep in memory.
   * When set (> 0), older pages are evicted and will be re-fetched when scrolling back.
    * Defaults to 5.
   */
  gridInfiniteCachePages?: number
  // Props communs
  columns?: Column[]
  /** Enable master/detail (expandable) rows. Use the `row-detail` slot in DataTable to render the nested content. */
  expandable?: boolean

  /** Master/detail lazy-load URL (or factory). */
  rowDetailUrl?: string | ((row: TableRow) => string)

  /** Master/detail lazy-load query (or factory). */
  rowDetailQuery?: Record<string, unknown> | ((row: TableRow) => Record<string, unknown>)

  /** Cache detail per rowId (default: true). */
  rowDetailCache?: boolean

  /** Auto-load detail when expanding (default: true). */
  rowDetailAutoLoad?: boolean

  /** Client-side resolver for row detail (sync or async). */
  rowDetailResolver?: (row: TableRow) => unknown
  selectable?: boolean
  pagination?: boolean
  pageSize?: number
  pageSizeSelector?: boolean | number[]
  loading?: boolean
  skeleton?: boolean
  debug?: boolean
  bulkActions?: BulkAction[]
  rowIdKey?: string
  grouping?: TableGrouping
  // Composants modulaires
  toolbar?: boolean | ToolbarConfig
  // Props de style
  theme?: TableTheme
  variant?: 'default' | 'default-dark' | 'elegant' | 'elegant-dark' | 'modern' | 'modern-dark'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  sticky?: boolean
  wrap?: boolean
  // Props de couleurs de sélection
  selectionColor?: string
  selectionColorDark?: string
  selectionHoverColor?: string
  selectionHoverColorDark?: string
  
  // Editing props

  // ==========================================
  // CONTROLLED MODELS (v-model:*)
  // ==========================================
  /** Controlled search value (use with v-model:search) */
  search?: string
  /** Controlled filters object (use with v-model:filters) */
  filters?: ColumnFilter
  /** Controlled sort model (use with v-model:sort). Use null to clear sort. */
  sort?: { key: string; direction: 'asc' | 'desc' } | null

  /** Controlled expanded row ids (use with v-model:expanded). */
  expanded?: Array<string | number>
}

/**
 * Composable principal pour l'état et la configuration du DataTable
 * 
 * @param props - Les props du composant DataTable
 * @returns État et méthodes de gestion du DataTable
 */
export function useDataTableCore(props: DataTableCoreProps) {
  // ==========================================
  // RÉSOLUTION DES OPTIONS
  // ==========================================
  
  /**
   * Fonction utilitaire pour résoudre les valeurs avec priorité aux props individuelles
   * Ordre de priorité : props individuelles > options > valeurs par défaut
   */
  const resolveOption = <T>(
    individualProp: T | undefined,
    optionKey: keyof DataTableOptions,
    defaultValue: T
  ): T => {
    // 1. Si la prop individuelle est définie, elle a toujours priorité.
    // Cela permet d'override explicitement une option avec `false`, `''`, `[]`, ou une valeur égale au défaut.
    if (individualProp !== undefined) return individualProp
    
    // 2. Sinon, vérifier dans l'objet options
    if (props.options && props.options[optionKey] !== undefined) {
      return props.options[optionKey] as T
    }
    
    // 3. Sinon, utiliser la valeur par défaut
    return defaultValue
  }
  
  // Résolution des options finales avec gestion des valeurs obligatoires
  const resolvedDatasource = computed(() => 
    resolveOption(props.datasource, 'datasource', [] as TableRow[])
  )
  
  const resolvedColumns = computed(() => 
    resolveOption(props.columns, 'columns', [] as Column[])
  )
  
  const resolvedMode = computed(() => 
    resolveOption(props.mode, 'mode', undefined)
  )
  
  const resolvedSelectable = computed(() => 
    resolveOption(props.selectable, 'selectable', false)
  )

  const resolvedExpandable = computed(() =>
    resolveOption(props.expandable, 'expandable', false)
  )

  const resolvedRowDetailUrl = computed(() =>
    resolveOption(props.rowDetailUrl, 'rowDetailUrl', undefined)
  )

  const resolvedRowDetailQuery = computed(() =>
    resolveOption(props.rowDetailQuery, 'rowDetailQuery', undefined)
  )

  const resolvedRowDetailCache = computed(() =>
    resolveOption(props.rowDetailCache, 'rowDetailCache', true)
  )

  const resolvedRowDetailAutoLoad = computed(() =>
    resolveOption(props.rowDetailAutoLoad, 'rowDetailAutoLoad', true)
  )

  const resolvedRowDetailResolver = computed(() =>
    resolveOption(props.rowDetailResolver, 'rowDetailResolver', undefined)
  )
  
  
  const resolvedPagination = computed(() => 
    resolveOption(props.pagination, 'pagination', false)
  )
  
  const resolvedPageSize = computed(() => 
    resolveOption(props.pageSize, 'pageSize', 10)
  )
  
  const resolvedPageSizeSelector = computed(() => 
    resolveOption(props.pageSizeSelector, 'pageSizeSelector', true)
  )
  
  const resolvedLoading = computed(() => 
    resolveOption(props.loading, 'loading', false)
  )
  
  const resolvedSkeleton = computed(() => 
    resolveOption(props.skeleton, 'skeleton', false)
  )
  
  const resolvedDebug = computed(() => 
    resolveOption(props.debug, 'debug', false)
  )
  
  const resolvedBulkActions = computed(() => 
    resolveOption(props.bulkActions, 'bulkActions', [] as BulkAction[])
  )
  
  const resolvedRowIdKey = computed(() => 
    resolveOption(props.rowIdKey, 'rowIdKey', 'id')
  )

  const resolvedGrouping = computed(() =>
    resolveOption(props.grouping, 'grouping', undefined as TableGrouping | undefined)
  )
  
  const resolvedToolbar = computed(() => 
    resolveOption(props.toolbar, 'toolbar', false)
  )
  
  // Configuration de la toolbar résolue
  const toolbarConfig = computed(() => {
    const toolbar = resolvedToolbar.value
    if (typeof toolbar === 'boolean') {
      return toolbar ? {
        title: '',
        icon: undefined,
        searchable: true,
        searchPlaceholder: 'Search...',
        showColumns: true,
        showExport: false,
        showRefresh: false
      } : null
    }
    return toolbar as ToolbarConfig
  })
  
  const resolvedTheme = computed(() => 
    resolveOption(props.theme, 'theme', {} as TableTheme)
  )
  
  const resolvedVariant = computed(() => 
    resolveOption(props.variant, 'variant', 'default' as const)
  )
  
  const resolvedSize = computed(() => 
    resolveOption(props.size, 'size', 'md' as const)
  )
  
  const resolvedSticky = computed(() => 
    resolveOption(props.sticky, 'sticky', false)
  )
  
  const resolvedWrap = computed(() => 
    resolveOption(props.wrap, 'wrap', false)
  )

  const resolvedGridInfiniteCachePages = computed(() =>
    resolveOption(props.gridInfiniteCachePages, 'gridInfiniteCachePages', 5)
  )
  
  const resolvedSelectionColor = computed(() => 
    resolveOption(props.selectionColor, 'selectionColor', '')
  )
  
  const resolvedSelectionColorDark = computed(() => 
    resolveOption(props.selectionColorDark, 'selectionColorDark', '')
  )
  
  const resolvedSelectionHoverColor = computed(() => 
    resolveOption(props.selectionHoverColor, 'selectionHoverColor', '')
  )
  
  const resolvedSelectionHoverColorDark = computed(() => 
    resolveOption(props.selectionHoverColorDark, 'selectionHoverColorDark', '')
  )


  // ==========================================
  // ÉTATS PRINCIPAUX
  // ==========================================
  
  // Unified loading state
  const loadingState = ref<LoadingState>(LoadingState.IDLE)
  const isInitialized = ref<boolean>(false)
  const allDataLoaded = ref<boolean>(false)
  
  // Data management
  const serverData = ref<TableRow[]>([])
  const serverTotal = ref<number>(0)
  
  // Selection
  const selectedIds = reactive(new Set<string | number>())
  const checkboxUpdateKey = ref<number>(0) // Force checkbox updates

  // Sorting
  const sortKey = ref<string>('')
  const sortDir = ref<'asc' | 'desc'>('asc')
  
  // Pagination
  const page = ref<number>(1)
  const loadedPages = ref<number>(1) // Pour le mode loadMore
  const reactivePageSize = ref<number>(10) // Reactive pageSize for dynamic updates
  
  // Column management
  const visibleCols = reactive<Record<string, boolean>>({})
  const columnWidths = reactive<Record<string, number | string>>({})
  const columnOrder = ref<string[]>([])
  const columnsOpen = ref<boolean>(false)

  // Column filters
  const columnFilters = reactive<ColumnFilter>({})
  
  // Drag and drop
  const draggedColumn = ref<string>('')
  
  // Search
  const internalSearch = ref<string>('')
  const debouncedSearch = ref<string>('')

  // Debounced search to prevent excessive API calls (single source of truth)
  let searchTimeout: ReturnType<typeof setTimeout> | null = null
  watch(
    internalSearch,
    (newValue) => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }

      searchTimeout = setTimeout(() => {
        debouncedSearch.value = newValue
      }, DATATABLE_CONSTANTS.TIMEOUTS.DEBOUNCE_SEARCH)
    },
    { flush: 'post' }
  )

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================
  
  /**
   * Détecte automatiquement si on est en mode serveur (URL string OU fonction loader custom).
   */
  const isServerMode = computed(() => {
    const ds = resolvedDatasource.value
    if (typeof ds === 'string') return ds.trim() !== ''
    if (typeof ds === 'function') return true
    return false
  })

  /**
   * URL de l'API actuelle (vide en mode fonction)
   */
  const actualApiUrl = computed(() => {
    const ds = resolvedDatasource.value
    return typeof ds === 'string' ? ds : ''
  })

  /**
   * Fonction loader custom (mode serveur via fonction).
   */
  const actualServerFn = computed<ServerDatasourceFn | null>(() => {
    const ds = resolvedDatasource.value
    return typeof ds === 'function' ? (ds as ServerDatasourceFn) : null
  })

  /**
   * Données actuelles basées sur le mode
   */
  const actualData = computed(() => {
    return isServerMode.value ? serverData.value : (resolvedDatasource.value as TableRow[] || [])
  })

  /**
   * Lookup caches for fast id->row/index access.
   * - Uses first occurrence semantics (same as findIndex)
   * - Recomputes when actualData or rowIdKey changes
   */
  const rowLookup = computed(() => {
    const byId = new Map<string | number, TableRow>()
    const indexById = new Map<string | number, number>()
    const rows = actualData.value || []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row) continue
      const rowId = getRowId(row)
      if (!indexById.has(rowId)) {
        indexById.set(rowId, i)
        byId.set(rowId, row)
      }
    }

    return { byId, indexById }
  })

  const rowById = computed(() => rowLookup.value.byId)
  const rowIndexById = computed(() => rowLookup.value.indexById)
  
  /**
   * Type de pagination actuel
   */
  const actualMode = computed(() => {
    if (resolvedMode.value) {
      return resolvedMode.value // 'loadMore' | 'infinite' | 'gridInfinite'
    }
    return resolvedPagination.value ? 'paginated' : 'none'
  })
  
  /**
   * Colonnes ordonnées selon l'ordre défini
   */
  const orderedColumns = computed(() => {
    const order = columnOrder.value
    const columns = resolvedColumns.value
    const baseColumns = order.length ? 
      order.map(key => columns.find(col => col.key === key)).filter(Boolean) as Column[] :
      columns
    
    // Filter by visibility
    return baseColumns.filter(col => visibleCols[col.key] !== false)
  })
  
  /**
   * Nombre total de colonnes (incluant selection si applicable)
   */
  const colCount = computed(() => {
    const baseCount = orderedColumns.value.length
    const selectableCount = resolvedSelectable.value ? 1 : 0
    const expandableCount = resolvedExpandable.value ? 1 : 0
    return baseCount + selectableCount + expandableCount
  })
  
  /**
   * État de chargement interne
   */
  const isInternalLoading = computed(() => {
    return loadingState.value === LoadingState.INITIAL_LOADING || 
           loadingState.value === LoadingState.REFRESHING
  })
  
  /**
   * État de chargement général
   */
  const isLoading = computed(() => {
    return resolvedLoading.value || loadingState.value !== LoadingState.IDLE
  })
  
  /**
   * État de chargement initial
   */
  const isInitialLoading = computed(() => {
    // Props loading externe a toujours priorité (même en mode client)
    if (resolvedLoading.value) {
      return true
    }
    
    // En mode serveur, rester en loading tant que pas initialisé
    if (isServerMode.value && !isInitialized.value) {
      return true
    }
    
    return loadingState.value === LoadingState.INITIAL_LOADING || 
           loadingState.value === LoadingState.REFRESHING
  })
  
  /**
   * Détermine s'il y a une pagination
   */
  const hasPagination = computed(() => {
    return resolvedPagination.value || 
           actualMode.value === 'loadMore' || 
           actualMode.value === 'infinite' ||
           actualMode.value === 'gridInfinite'
  })
  
  // ==========================================
  // MÉTHODES DE GESTION DES ÉTATS
  // ==========================================
  
  /**
   * Met à jour l'état de chargement
   */
  const setLoadingState = (state: LoadingState) => {
    loadingState.value = state
  }
  
  /**
   * Démarre le chargement initial
   */
  const startInitialLoading = () => setLoadingState(LoadingState.INITIAL_LOADING)
  
  /**
   * Démarre le chargement de plus de données
   */
  const startLoadingMore = () => setLoadingState(LoadingState.LOADING_MORE)
  
  /**
   * Démarre le rafraîchissement
   */
  const startRefreshing = () => setLoadingState(LoadingState.REFRESHING)
  
  /**
   * Arrête tous les chargements
   */
  const stopLoading = () => setLoadingState(LoadingState.IDLE)
  
  /**
   * Force la mise à jour des checkboxes
   */
  const forceCheckboxUpdate = () => {
    checkboxUpdateKey.value++
  }
  
  /**
   * Réinitialise l'état du DataTable
   */
  const resetState = () => {
    loadingState.value = LoadingState.IDLE
    isInitialized.value = false
    allDataLoaded.value = false
    selectedIds.clear()
    page.value = 1
    loadedPages.value = 1
    sortKey.value = ''
    sortDir.value = 'asc'
    internalSearch.value = ''
    debouncedSearch.value = ''
    forceCheckboxUpdate()
  }
  
  /**
   * Initialise les colonnes visibles et leurs largeurs
   */
  const initializeColumns = () => {
    // Initialize visible columns
    const columns = resolvedColumns.value
    columns.forEach(col => {
      visibleCols[col.key] = true
      if (col.width) {
        // Preserve relative units (%, em, rem) and only convert pixel values to numbers
        if (typeof col.width === 'string' && (col.width.includes('%') || col.width.includes('em') || col.width.includes('rem'))) {
          columnWidths[col.key] = col.width
        } else {
          columnWidths[col.key] = typeof col.width === 'number' ? col.width : parseInt(col.width)
        }
      }
    })
    
    // Initialize column order
    if (!columnOrder.value.length) {
      columnOrder.value = columns.map(col => col.key)
    }
  }
  
  // ==========================================
  // WATCHERS
  // ==========================================
  
  // Initialize reactive pageSize with resolved value
  watch(() => resolvedPageSize.value, (newPageSize) => {
    if (reactivePageSize.value !== newPageSize) {
      reactivePageSize.value = newPageSize
    }
  }, { immediate: true })
  
  // ==========================================
  // LIFECYCLE
  // ==========================================
  
  onMounted(() => {
    // Validation des props en mode développement
    if (process.env.NODE_ENV === 'development') {
      // Adapter les props pour le validateur
      const propsForValidation = {
        datasource: resolvedDatasource.value,
        mode: resolvedMode.value,
        columns: resolvedColumns.value,
        title: toolbarConfig.value?.title || '',
        selectable: resolvedSelectable.value,
        searchable: toolbarConfig.value?.searchable || false,
        searchPlaceholder: toolbarConfig.value?.searchPlaceholder || 'Search...',
        paginated: resolvedPagination.value,
        pageSize: resolvedPageSize.value,
        loading: resolvedLoading.value,
        debug: resolvedDebug.value,
        bulkActions: resolvedBulkActions.value,
        rowIdKey: resolvedRowIdKey.value,
        variant: resolvedVariant.value,
        size: resolvedSize.value,
        stickyHeader: resolvedSticky.value,
        wrapText: resolvedWrap.value,
        selectionColor: resolvedSelectionColor.value,
        selectionColorDark: resolvedSelectionColorDark.value,
        selectionHoverColor: resolvedSelectionHoverColor.value,
        selectionHoverColorDark: resolvedSelectionHoverColorDark.value,
      }
      validateAndLogDataTableProps(propsForValidation as DataTableProps)
    }
    
    // Initialize columns
    initializeColumns()
  })

  onUnmounted(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
      searchTimeout = null
    }
  })
  
  // ==========================================
  // RETOUR DU COMPOSABLE
  // ==========================================
  
  // ==========================================
  // EVENT HANDLERS UTILITIES
  // ==========================================
  
  /**
   * Utilitaire pour appeler les event handlers définis dans les options
   */
  function callEventHandler<K extends keyof DataTableOptions>(
    handlerName: K,
    ...args: DataTableOptions[K] extends ((...a: infer A) => void) | undefined ? A : never[]
  ) {
    const handler = props.options?.[handlerName]
    if (typeof handler === 'function') {
      try {
        (handler as (...a: unknown[]) => void)(...args)
      } catch (error) {
        console.error(`Error in ${handlerName} handler:`, error)
      }
    }
  }

  // ==========================================
  // DATA MANIPULATION METHODS
  // ==========================================
  
  /**
   * Ajoute une ou plusieurs lignes au tableau (mode client uniquement)
   */
  function addRows(newRows: TableRow | TableRow[]) {
    if (isServerMode.value) {
      console.warn('addRows: This method only works in client mode')
      return false
    }
    
    const currentData = resolvedDatasource.value as TableRow[]
    const rowsToAdd = Array.isArray(newRows) ? newRows : [newRows]
    
    // Mutate in place so the parent's reactive array stays in sync
    currentData.push(...rowsToAdd)
    
    if (props.options) {
      ;(props.options.datasource as TableRow[]) = currentData
    }
    
    // Déclencher l'événement onDataChange
    callEventHandler('onDataChange', currentData)
    
    return true
  }

  /**
   * Supprime des lignes du tableau par ID (mode client uniquement)
   */
  function removeRows(ids: (string | number) | (string | number)[]) {
    if (isServerMode.value) {
      console.warn('removeRows: This method only works in client mode')
      return false
    }
    
    const currentData = resolvedDatasource.value as TableRow[]
    const idsToRemove = Array.isArray(ids) ? ids : [ids]
    const idsToRemoveSet = new Set(idsToRemove)
    
    // Remove in place (iterate from the end) to keep the parent's array reference
    for (let i = currentData.length - 1; i >= 0; i--) {
      if (idsToRemoveSet.has(getRowId(currentData[i] as TableRow))) {
        currentData.splice(i, 1)
      }
    }
    const updatedData = currentData
    
    if (props.options) {
      ;(props.options.datasource as TableRow[]) = updatedData
    }
    
    // Désélectionner les lignes supprimées
    const remainingSelectedIds = new Set(
      Array.from(selectedIds).filter((id: string | number) => !idsToRemoveSet.has(id))
    )
    selectedIds.clear()
    remainingSelectedIds.forEach(id => selectedIds.add(id))
    
    // Déclencher l'événement onDataChange
    callEventHandler('onDataChange', updatedData)
    
    return true
  }

  /**
   * Met à jour une ligne existante par ID
   */
  function updateRow(id: string | number, updatedData: Partial<TableRow>) {
    if (isServerMode.value) {
      console.warn('updateRow: This method only works in client mode')
      return false
    }
    
    const currentData = resolvedDatasource.value as TableRow[]
    const rowIndex = rowIndexById.value.get(id)
    
    if (rowIndex === undefined) {
      console.warn('updateRow: Row with ID', id, 'not found')
      return false
    }
    
    // Mutate in place so the parent's reactive array picks up the change
    // (works whether the array was passed via :datasource or :options.datasource)
    currentData[rowIndex] = { ...currentData[rowIndex], ...updatedData }
    
    // Keep options.datasource reference in sync when caller used the options API
    if (props.options) {
      ;(props.options.datasource as TableRow[]) = currentData
    }
    
    // Déclencher l'événement onDataChange
    callEventHandler('onDataChange', currentData)
    
    return true
  }

  /**
   * Obtient l'ID d'une ligne selon la configuration
   */
  function getRowId(row: TableRow): string | number {
    const idKey = resolvedRowIdKey.value
    const id = row[idKey] ?? row.id ?? row.key
    return typeof id === 'string' || typeof id === 'number' ? id : String(id ?? JSON.stringify(row))
  }

  /**
   * Récupère les données actuelles d'une ligne par ID (incluant les modifications en cours)
   */
  function getCurrentRowData(id: string | number): TableRow | null {
    const row = rowById.value.get(id) || null

    if (!row) {
      console.warn('getCurrentRowData: Row with ID', id, 'not found')
      return null
    }

    return row
  }

  // ==========================================
  // MÉTHODES D'ÉDITION
  // ==========================================

  /**
   * Ajoute une ligne vide pour édition
   */
  function addEmptyRow() {
    console.log('🔍 addEmptyRow called - isServerMode:', isServerMode.value)
    
    const emptyRow: TableRow = {}
    
    // Créer une ligne vide avec les colonnes définies
    resolvedColumns.value.forEach(col => {
      emptyRow[col.key] = ''
    })
    
    // Générer un ID temporaire pour la nouvelle ligne
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    emptyRow[resolvedRowIdKey.value] = tempId
    
    console.log('🔍 Empty row created:', emptyRow)
    console.log('🔍 Current actualData:', actualData.value)
    
    if (isServerMode.value) {
      // En mode serveur, ajouter directement aux données actuelles
      const currentData = actualData.value as TableRow[]
      const updatedData = [emptyRow, ...currentData]
      
      console.log('🔍 Updated data for server mode:', updatedData)
      
      // Mettre à jour actualData directement - utiliser une approche différente
      if (Array.isArray(serverData.value)) {
        serverData.value = updatedData
        console.log('🔍 Updated serverData.value')
      }
      
    } else {
      // En mode client, utiliser addRows
      addRows(emptyRow)
    }
    
    // Déclencher l'événement
    callEventHandler('onAddRow')
    
    console.log('🔍 addEmptyRow completed, returning:', tempId)
    return tempId
  }

  /**
   * Démarre l'édition d'une cellule
   */
  function startEdit(row: TableRow, columnKey: string) {
    const column = resolvedColumns.value.find(col => col.key === columnKey)
    if (!column?.editable) {
      console.warn('startEdit: Column', columnKey, 'is not editable')
      return false
    }
    
    callEventHandler('onEditStart', row, columnKey)
    return true
  }

  /**
   * Annule l'édition d'une cellule
   */
  function cancelEdit(row: TableRow, columnKey: string) {
    callEventHandler('onEditCancel', row, columnKey)
  }

  /**
   * Sauvegarde l'édition d'une cellule
   */
  function saveEdit(row: TableRow, columnKey: string, newValue: unknown) {
    const column = resolvedColumns.value.find(col => col.key === columnKey)
    if (!column?.editable) {
      console.warn('saveEdit: Column', columnKey, 'is not editable')
      return false
    }
    
    const oldValue = row[columnKey]
    const rowId = getRowId(row)
    
    let success = false
        
    // Mettre à jour les données locales
    if (isServerMode.value) {
      // En mode serveur, mettre à jour directement les données affichées
      const currentData = actualData.value as TableRow[]
      const rowIndex = rowIndexById.value.get(rowId)
      
      if (rowIndex !== undefined) {
        // Mettre à jour la ligne dans les données actuelles
        currentData[rowIndex] = { ...currentData[rowIndex], [columnKey]: newValue }
        
        // Déclencher une mise à jour réactive
        serverData.value = [...currentData]
        
        success = true
      }
    } else {
      // En mode client, utiliser updateRow
      success = updateRow(rowId, { [columnKey]: newValue })
    }
    
    if (success) {
      callEventHandler('onEditSave', row, columnKey, oldValue, newValue)
      callEventHandler('onCellUpdate', row, columnKey, newValue)
    }
    
    return success
  }

  /**
   * Met à jour directement une cellule
   */
  function updateCell(row: TableRow, columnKey: string, value: unknown) {
    const column = resolvedColumns.value.find(col => col.key === columnKey)
    if (!column?.editable) {
      console.warn('updateCell: Column', columnKey, 'is not editable')
      return false
    }
    
    const rowId = getRowId(row)
    let success = false
    
    if (isServerMode.value) {
      // En mode serveur, mettre à jour directement les données affichées
      const currentData = actualData.value as TableRow[]
      const rowIndex = rowIndexById.value.get(rowId)
      
      if (rowIndex !== undefined) {
        // Mettre à jour la ligne dans les données actuelles
        currentData[rowIndex] = { ...currentData[rowIndex], [columnKey]: value }
        
        // Déclencher une mise à jour réactive
        serverData.value = [...currentData]
        
        success = true
      }
    } else {
      // En mode client, utiliser updateRow
      success = updateRow(rowId, { [columnKey]: value })
    }
    
    if (success) {
      callEventHandler('onCellUpdate', row, columnKey, value)
    }
    
    return success
  }

  // ==========================================
  // WATCHERS POUR ÉVÉNEMENTS AUTOMATIQUES
  // ==========================================
  
  // Watcher pour déclencher onDataChange automatiquement
  watch(actualData, (newData) => {
    if (newData && Array.isArray(newData)) {
      callEventHandler('onDataChange', newData)
    }
  }, { immediate: false, deep: false })

  // ==========================================
  // RETOUR DE L'API PUBLIQUE
  // ==========================================
  
  return {
    // ==========================================
    // OPTIONS RÉSOLUES (pour utilisation dans le composant)
    // ==========================================
    resolvedOptions: computed(() => ({
      datasource: resolvedDatasource.value,
      mode: resolvedMode.value,
      columns: resolvedColumns.value,
      title: toolbarConfig.value?.title || '',
      expandable: resolvedExpandable.value,
      rowDetailUrl: resolvedRowDetailUrl.value,
      rowDetailQuery: resolvedRowDetailQuery.value,
      rowDetailCache: resolvedRowDetailCache.value,
      rowDetailAutoLoad: resolvedRowDetailAutoLoad.value,
      rowDetailResolver: resolvedRowDetailResolver.value,
      selectable: resolvedSelectable.value,
      searchable: toolbarConfig.value?.searchable || false,
      searchPlaceholder: toolbarConfig.value?.searchPlaceholder || 'Search...',
      pagination: resolvedPagination.value,
      pageSize: resolvedPageSize.value,
      pageSizeSelector: resolvedPageSizeSelector.value,
      loading: resolvedLoading.value,
      skeleton: resolvedSkeleton.value,
      debug: resolvedDebug.value,
      bulkActions: resolvedBulkActions.value,
      rowIdKey: resolvedRowIdKey.value,
      grouping: resolvedGrouping.value,
      toolbar: resolvedToolbar.value,
      export: toolbarConfig.value?.showExport || false,
      refresh: toolbarConfig.value?.showRefresh || false,
      theme: resolvedTheme.value,
      variant: resolvedVariant.value,
      size: resolvedSize.value,
      sticky: resolvedSticky.value,
      wrap: resolvedWrap.value,
      gridInfiniteCachePages: resolvedGridInfiniteCachePages.value,
      selectionColor: resolvedSelectionColor.value,
      selectionColorDark: resolvedSelectionColorDark.value,
      selectionHoverColor: resolvedSelectionHoverColor.value,
      selectionHoverColorDark: resolvedSelectionHoverColorDark.value,
    })),
    
    // ==========================================
    // ÉTATS PRINCIPAUX
    // ==========================================
    loadingState,
    isInitialized,
    allDataLoaded,
    serverData,
    serverTotal,
    
    // Sélection
    selectedIds,
    checkboxUpdateKey,
    
    // Tri
    sortKey,
    sortDir,
    
    // Pagination
    page,
    loadedPages,
    reactivePageSize,
    
    // Colonnes
    visibleCols,
    columnWidths,
    columnOrder,
    columnsOpen,
    orderedColumns,
    
    // Filtres
    columnFilters,
    
    // Drag & Drop
    draggedColumn,
    
    // Recherche
    internalSearch,
    debouncedSearch,
    
    // Computed properties
    isServerMode,
    actualApiUrl,
    actualServerFn,
    actualData,
    rowById,
    rowIndexById,
    actualMode,
    colCount,
    isInternalLoading,
    isLoading,
    isInitialLoading,
    hasPagination,
    
    // Configuration de la toolbar
    toolbarConfig,
    
    // Méthodes de gestion des états
    setLoadingState,
    startInitialLoading,
    startLoadingMore,
    startRefreshing,
    stopLoading,
    forceCheckboxUpdate,
    resetState,
    initializeColumns,
    
    // Event handlers utility
    callEventHandler,
    
    // Data manipulation methods
    addRows,
    removeRows,
    updateRow,
    getRowId,
    getCurrentRowData,
    
    // Editing methods
    addEmptyRow,
    startEdit,
    cancelEdit,
    saveEdit,
    updateCell,
    
    // Enum pour usage externe
    LoadingState
  }
}

/**
 * Type pour le retour du composable
 */
export type DataTableCoreReturn = ReturnType<typeof useDataTableCore>
