<template>
    <div :class="['space-y-2', { dark: resolvedOptions.variant.includes('dark') }]">
        <!-- Combined modular toolbar (includes header functionality) -->
        <DataTableToolbar 
            v-if="resolvedOptions.toolbar" 
            :columns="resolvedOptions.columns"
            :ordered-columns="orderedColumns" 
            :visible-columns="visibleCols" 
            :toolbar-config="toolbarConfig"
            :search="internalSearch" 
            :filters="columnFilters" 
            :selected-count="selectedIds.size"
            :selected-ids="Array.from(selectedIds)" 
            :total-items="isServerMode ? serverTotal : filteredData.length"
            :bulk-actions="resolvedOptions.bulkActions"
            :refreshing="loadingState === LoadingState.INITIAL_LOADING || loadingState === LoadingState.REFRESHING"
            :selectable="resolvedOptions.selectable" 
            @search="(value: string) => internalSearch = value"
            @column-toggle="(key: string, visible: boolean) => visibleCols[key] = visible"
            @column-filter="(key: string, value: unknown) => handleToolbarFilter(key, value)"
            @column-reorder="(newOrder: string[]) => columnOrder = newOrder"
            @export="() => emitAndCall('export', 'onExport', selectedRows.length > 0 ? selectedRows : undefined)"
            @refresh="handleRefresh" @bulk-action="onToolbarBulkAction">
            <template #filters>
                <slot name="toolbar-filters" />
            </template>
            <template #actions>
                <slot name="toolbar-actions" />
            </template>
        </DataTableToolbar>

        <!-- Main DataTable container -->
        <div :class="containerClasses">
            <div :class="computedTheme.wrapper">
                <!-- Table -->
                <div ref="gridScrollContainer" :class="tableScrollContainerClasses" @scroll.passive="onGridScroll">
                    <table :class="tableClasses" :style="tableStyle" role="grid"
                        :aria-label="TEXT_LABELS.TABLE_CAPTION"
                        :aria-rowcount="isServerMode ? serverTotal : filteredData.length">
                        <caption class="sr-only">{{ TEXT_LABELS.TABLE_CAPTION }}</caption>
                        <DataTableHeader
                            :header-classes="headerClasses"
                            :selectable="resolvedOptions.selectable"
                            :expandable="resolvedOptions.expandable"
                            :checkbox-column-classes="checkboxColumnClasses"
                            :checkbox-column-style="checkboxColumnStyle"
                            :expand-column-classes="expandColumnClasses"
                            :expand-column-style="expandColumnStyle"
                            :checkbox-update-key="checkboxUpdateKey"
                            :all-current-selected="allCurrentSelected"
                            :ordered-columns="orderedColumns"
                            :computed-theme="computedTheme"
                            :sort-key="sortKey"
                            :sort-dir="sortDir"
                            :get-header-cell-classes="getHeaderCellClasses"
                            :get-column-styles="getColumnStyles"
                            :get-sortable-header-classes="getSortableHeaderClasses"
                            :get-non-sortable-header-classes="getNonSortableHeaderClasses"
                            :get-checkbox-classes="getCheckboxClasses"
                            :toggle-select-all="toggleSelectAll"
                            :toggle-sort="toggleSort"
                            :sort-icon="sortIcon"
                            :get-sort-icon-class="getSortIconClass"
                            :get-filter-icon-class="getFilterIconClass"
                            :ensure-header-menu-tab="ensureHeaderMenuTab"
                            :get-column-menu-bindings="getColumnMenuBindings"
                            :start-resize="startResize"
                            :on-column-drag-start="onColumnDragStart"
                            :on-column-drop="onColumnDrop"
                        >
                            <template v-for="(_, name) in $slots" #[name]="slotProps">
                                <slot :name="name" v-bind="slotProps" />
                            </template>
                        </DataTableHeader>

                        <DataTableBody v-bind="dataTableBodyBindings">
                            <template v-for="(_, name) in $slots" #[name]="slotProps">
                                <slot :name="name" v-bind="slotProps" />
                            </template>
                        </DataTableBody>
                    </table>
                </div>

                <DataTablePagination 
                    v-if="shouldShowPagination" 
                    :show="shouldShowPagination" 
                    :actual-mode="actualMode"
                    :computed-theme="computedTheme" 
                    :is-initial-loading="isInitialLoading" 
                    :loading-state="loadingState"
                    :is-server-mode="isServerMode" 
                    :total-items="isServerMode ? serverTotal : filteredData.length"
                    v-model:page="page" 
                    v-model:page-size="pageSize" 
                    :page-size-selector="resolvedOptions.pageSizeSelector"
                    :page-size-options="pageSizeOptions" 
                    :pagination-info="paginationInfo" 
                    :load-more-info="loadMoreInfo"
                    :has-more-data="hasMoreData" 
                    :should-show-load-more-button="shouldShowLoadMoreButton"
                    :on-load-more="loadMore" 
                    :get-load-more-button-text="getLoadMoreButtonText"
                    :all-data-loaded="allDataLoaded" 
                    :can-load-more-in-client="canLoadMoreInClient"
                    :set-infinite-scroll-trigger="setInfiniteScrollTriggerEl" />
            </div>
        </div>
    </div>

    <!-- Custom slots for additional content -->
    <slot name="footer" />
</template>

/**
* DataTable - Modern & Modular Table Component
*
* @component
* @description Advanced table component with client/server modes support,
* pagination, sorting, search, filters, multiple selection and complete theming.
*
* @features
* - Client and server modes with adaptive pagination
* - Pagination types: simple, loadMore, infinite
* - Optional modular components (header, toolbar)
* - Theme system with 5 predefined variants
* - Strict TypeScript with well-defined interfaces
* - Multiple selection with bulk actions
* - Dynamic search and filters
* - Customizable and dynamic selection colors
*
* @newFeatures (v2.2.0)
* - DataTableOptions: Unified configuration object
* - Modern props system with options support
* - Enhanced event system with selection-change
* - Clean API with deprecated method marking
* - Improved TypeScript support
* - English interface by default
* - Conditional selection display based on selectable prop
*
* @usage
* ```vue
*
<DataTable :options="tableOptions" @selection-change="onSelectionChange" />
* ```
*
* @author Formation Team
* @version 2.2.0
*/

<script setup lang="ts">
// Import new modules
import { useDataTableClientPipeline } from '../composables/useDataTableClientPipeline'
import { useDataTableColumnInteractions } from '../composables/useDataTableColumnInteractions'
import { useDataTableColumnMenu } from '../composables/useDataTableColumnMenu'
import { LoadingState, useDataTableCore, type DataTableCoreProps, type DataTableOptions } from '../composables/useDataTableCore'
import { useDataTableEditing } from '../composables/useDataTableEditing'
import { useDataTableGridInfinite } from '../composables/useDataTableGridInfinite'
import { useDataTableInfiniteScroll } from '../composables/useDataTableInfiniteScroll'
import { useDataTableLoadingPreservation } from '../composables/useDataTableLoadingPreservation'
import { useDataTablePagination } from '../composables/useDataTablePagination'
import { useDataTableServerLoader } from '../composables/useDataTableServerLoader'
import { useDataTableStyles } from '../composables/useDataTableStyles'
import { useDataTableTheme } from '../composables/useDataTableTheme'
import {
    DATATABLE_CONSTANTS,
    TEXT_LABELS
} from '../constants/datatable.constants'
import {
    getFilterTypeFromColumnType,
    getInputTypeFromColumnType,
    validateColumnValue,
    type Column,
    type ColumnFilter,
    type DataLoadedResult,
    type FilterValue,
    type LoadDataParams,
    type RowId,
    type TableRow
} from '../types/datatable.types'
import { buildDefaultColumnFilterValue } from '../utils/datatable-filters'

// ==========================================================
// FILE SECTIONS
// - Setup (imports / props / emits / types)
// - Core composables wiring
// - Derived data & lookups (caches/indexes)
// - Filtering / sorting
// - UI styles & bindings
// - Handlers (selection, filters, server, infinite)
// ==========================================================

const attrs = useAttrs()

// Simplified props - modern approach using DataTableOptions
// NOTE: For boolean props whose intended default is `true`, we must provide a runtime
// default here. Otherwise Vue treats absent boolean props as `false`, which prevents
// `useDataTableCore` from ever applying its own default.
const props = withDefaults(defineProps<DataTableCoreProps>(), {
    rowDetailCache: true,
    rowDetailAutoLoad: true
})

// ✅ Modern Events API - Simplified and optimized
const emit = defineEmits<{
    // ==========================================
    // 🎯 CORE EVENTS (Essential)
    // ==========================================
    'selection-change': [selectedRows: TableRow[]]  // Main selection event
    'export': [selectedRows?: TableRow[]]           // Export with optional selection
    'refresh': []                                   // Manual refresh trigger
    'bulk-action': [action: string, selectedRows: TableRow[]] // Bulk actions on selected items

    // ==========================================
    // 🔍 DATA & FILTERING EVENTS
    // ==========================================
    'data-change': [data: TableRow[]]               // When data changes (client mode)
    'filters-change': [filters: ColumnFilter]       // When any filter changes

    // ==========================================
    // 🌐 SERVER MODE EVENTS
    // ==========================================
    'server-request': [params: LoadDataParams]      // Before server request
    'server-response': [result: DataLoadedResult]   // After successful server response
    'error': [error: Error]                         // Server or processing errors

    // ==========================================
    // 🔄 LEGACY EVENTS (Deprecated but kept for compatibility)
    // ==========================================
    /** @deprecated Use 'selection-change' instead */
    'rows-selected': [rows: TableRow[]]
    /** @deprecated Use 'selection-change' instead */
    'row-select': [row: TableRow, selected: boolean]
    /** @deprecated Use 'filters-change' instead */
    'filter-change': [columnKey: string, filterValue: FilterValue | unknown]
    /** @deprecated Use 'server-request' instead */
    'load-data': [params: LoadDataParams]
    /** @deprecated Use 'server-response' instead */
    'data-loaded': [result: DataLoadedResult]

    // ==========================================
    // 🔁 V-MODEL UPDATES (Controlled state)
    // ==========================================
    'update:search': [value: string]
    'update:filters': [filters: ColumnFilter]
    'update:sort': [sort: { key: string, direction: 'asc' | 'desc' } | null]

    // Master/detail (controlled)
    'update:expanded': [expandedRowIds: Array<string | number>]

    // Master/detail UI
    'row-expand': [payload: { rowId: string | number, expanded: boolean }]

    // Row detail (master/detail lazy-load)
    'row-detail-request': [payload: { rowId: string | number, url: string, query?: Record<string, unknown> }]
    'row-detail-response': [payload: { rowId: string | number, url: string, query?: Record<string, unknown>, raw: unknown, detail: unknown }]
    'row-detail-error': [payload: { rowId: string | number, url: string, query?: Record<string, unknown>, error: string }]
}>()

const slots = useSlots()

// ==========================================
// COMPOSABLES PRINCIPAUX
// ==========================================

// Use core composable for state and configuration
const {
    // Resolved options
    resolvedOptions,

    // Main state
    loadingState,
    isInitialized,
    allDataLoaded,
    serverData,
    serverTotal,

    // Selection
    selectedIds,
    checkboxUpdateKey,

    // Sorting
    sortKey,
    sortDir,

    // Pagination
    page,
    loadedPages,
    reactivePageSize,

    // Columns
    visibleCols,
    columnWidths,
    columnOrder,
    columnsOpen,
    orderedColumns,

    // Filters
    columnFilters,

    // Drag & Drop
    draggedColumn,

    // Search
    internalSearch,
    debouncedSearch,

    // Computed properties
    isServerMode,
    actualApiUrl,
    actualServerFn,
    actualData,
    actualMode,
    colCount,
    isInitialLoading,
    hasPagination,
    rowById,

    // Configuration de la toolbar
    toolbarConfig,

    // State management methods
    startInitialLoading,
    startLoadingMore,
    startRefreshing,
    stopLoading,
    forceCheckboxUpdate,
    callEventHandler,
    // Data manipulation methods
    addRows,
    removeRows,
    updateRow,
    getRowId,
    // Editing methods
    addEmptyRow,
    startEdit,
    cancelEdit,
    saveEdit,
    updateCell
} = useDataTableCore(props)

// ==========================================
// EMIT HELPERS (Vue emit + options handlers)
// ==========================================

function emitAndCall(eventName: string, optionHandlerName: keyof DataTableOptions, ...args: unknown[]) {
    (emit as (...args: unknown[]) => void)(eventName, ...args)
    ;(callEventHandler as (name: keyof DataTableOptions, ...a: unknown[]) => void)(optionHandlerName, ...args)
}

function emitLegacy(eventName: 'load-data' | 'data-loaded', payload: LoadDataParams | DataLoadedResult) {
    (emit as (...args: unknown[]) => void)(eventName, payload)
}

// ==========================================
// CONTROLLED MODELS (v-model:*)
// ==========================================

const {
    deepClone,
    stableStringify,
    initColumnFiltersFromProps
} = useDataTableModelSync({
    props,
    internalSearch,
    columnFilters,
    sortKey,
    sortDir,
    columns: computed(() => resolvedOptions.value.columns),
    emitUpdateSearch: (value) => emit('update:search', value),
    emitUpdateFilters: (value) => emit('update:filters', value),
    emitUpdateSort: (value) => emit('update:sort', value)
})

// ==========================================
// MASTER / DETAIL (NESTED ROWS)
// ==========================================

// Bridge ref to avoid TDZ issues (pagedRows is declared later)
const pagedRowsForRowDetail = ref<TableRow[]>([])
const pagedRowsForPreservation = ref<TableRow[]>([])

const {
    canRenderRowDetail,
    isRowExpanded,
    toggleRowExpanded,
    getDetailKey,
    rowDetailData,
    rowDetailRaw,
    rowDetailLoading,
    rowDetailError,
    loadRowDetail
} = useDataTableRowDetail({
    resolvedOptions,
    slots,
    attrs: attrs as Record<string, unknown>,
    propsExpanded: computed(() => props.expanded as Array<RowId> | undefined),
    pagedRows: pagedRowsForRowDetail,
    actualData: computed(() => actualData.value as TableRow[]),
    getRowId: (row) => getRowId(row) as RowId,
    stableStringify,
    emitAndCall,
    emitUpdateExpanded: (next) => emit('update:expanded', next),
    debugLog
})

// ==========================================
// REFRESH + HEADER MENU UI STATE
// ==========================================
const isRefreshing = ref<boolean>(false) // Flag to skip watchers during refresh

// ==========================================
// EDITING / VALIDATION
// ==========================================

const {
    isCellEditing,
    getEditingValue,
    updateEditingValue,
    validateCellValue,
    getCellValidation,
    getValidationIcon,
    getValidationIconColor,
    getInputValidationUi,
    startCellEdit,
    saveCellEdit,
    handleEditKeydown
} = useDataTableEditing({
    orderedColumns,
    getRowId: (row) => getRowId(row) as string | number,
    getColumnValue,
    validateColumnValue,
    startEdit,
    cancelEdit,
    saveEdit
})

// ==========================================
// STYLES ET COMPUTED PROPERTIES
// ==========================================
// Computed style for tbody

const {
    setTableBodyEl,
    preservedRows,
    tableBodyStyle,
    shouldShowLoadingOverlay,
    preserveCurrentState,
    clearPreservedState
} = useDataTableLoadingPreservation({
    isInitialLoading,
    pagedRows: pagedRowsForPreservation,
    debug: computed(() => resolvedOptions.value.debug)
})

const dataTableBodyBindings = computed(() => {
    return {
        setTableBodyRef: setTableBodyEl,

        tableBodyStyle: unref(tableBodyStyle),
        shouldShowLoadingOverlay: unref(shouldShowLoadingOverlay),

        isInitialLoading: unref(isInitialLoading),
        preservedRows: unref(preservedRows),

        skeleton: unref(resolvedOptions).skeleton,
        skeletonRowCount: unref(skeletonRowCount),
        loadMoreSkeletonCount: unref(loadMoreSkeletonCount),

        pagedRows: unref(pagedRows),
        orderedColumns: unref(orderedColumns),

        resolvedOptions: unref(resolvedOptions),
        computedTheme: unref(computedTheme),

        checkboxColumnClasses: unref(checkboxColumnClasses),
        checkboxColumnStyle: unref(checkboxColumnStyle),
        expandColumnClasses: unref(expandColumnClasses),
        expandColumnStyle: unref(expandColumnStyle),

        colCount: unref(colCount),

        loadingState: unref(loadingState),
        actualMode: unref(actualMode),
        gridInfiniteLoadingDirection: unref(gridInfiniteLoadingDirection),

        selectedIds: unref(selectedIds),
        checkboxUpdateKey: unref(checkboxUpdateKey),

        getRowId,
        getRowClasses,
        getBodyCellClasses,
        getColumnStyles,
        getSkeletonWidth,
        getColumnValue,
        getCheckboxClasses,

        toggleSelect,
        handleRowClick,

        canRenderRowDetail: unref(canRenderRowDetail),
        isRowExpanded,
        toggleRowExpanded,
        getDetailKey,
        rowDetailData: unref(rowDetailData),
        rowDetailRaw: unref(rowDetailRaw),
        rowDetailLoading: unref(rowDetailLoading),
        rowDetailError: unref(rowDetailError),
        loadRowDetail,

        isCellEditing,
        getEditingValue,
        updateEditingValue,
        saveCellEdit,
        handleEditKeydown,
        getColumnInputType,

        getValidationIcon,
        getValidationIconColor,
        getInputValidationUi,
        getCellValidation,

        shouldShowTooltip,
        startCellEdit
    }
})

// ==========================================
// AUTRES COMPUTED PROPERTIES
// ==========================================

// Computed properties that use composable data
const currentData = computed<TableRow[]>(() => {
    return isServerMode.value ? serverData.value : actualData.value
})

// ==========================================
// COLUMN TYPE HELPERS
// ==========================================

function getColumnFilterType(column: Column | undefined) {
    // Honor an explicit `filterType` first so that columns like
    // `{ filterType: 'select' }` (without `type: 'select'`) render the
    // matching filter UI in the per-header menu — same behavior the toolbar
    // already uses when picking which input to show.
    return column?.filterType
        ?? (column?.type ? getFilterTypeFromColumnType(column.type) : 'text')
}

function getColumnInputType(column: Column | undefined) {
    return column?.type ? getInputTypeFromColumnType(column.type) : 'text'
}

const columnsByKey = computed(() => {
    const map = new Map<string, Column>()
    for (const col of resolvedOptions.value.columns) {
        if (!map.has(col.key)) {
            map.set(col.key, col)
        }
    }
    return map
})

const { filteredData, sortedData } = useDataTableClientPipeline({
    isServerMode,
    currentData,
    debouncedSearch,
    columns: computed(() => resolvedOptions.value.columns),
    columnFilters,
    sortKey,
    sortDir,
    getColumnValue,
    getColumnFilterType
})

// Computed properties for easy access to resolved options
const pageSize = computed({
    get: () => reactivePageSize.value,
    set: (value: number) => {
        // Update reactive pageSize and reset to first page
        reactivePageSize.value = value
        page.value = 1

        // Trigger data reload if in server mode
        if (isServerMode.value) {
            loadServerData(false, 'pageSize-change')
        }
    }
})

const pageSizeOptions = computed(() => {
    const current = reactivePageSize.value

    let options: { value: number; label: string }[]

    // If pageSizeSelector is an array, use those values
    if (Array.isArray(resolvedOptions.value.pageSizeSelector)) {
        options = resolvedOptions.value.pageSizeSelector.map(size => ({
            value: size,
            label: size.toString()
        }))
    } else {
        // Default values
        options = [
            { value: 10, label: '10' },
            { value: 20, label: '20' },
            { value: 50, label: '50' },
            { value: 100, label: '100' }
        ]
    }

    // Ensure the current value is always present
    if (!options.some(o => o.value === current)) {
        options = [{ value: current, label: current.toString() }, ...options].sort((a, b) => a.value - b.value)
    }

    return options
})

const selectionColors = computed(() => {
    const isDark = resolvedOptions.value.variant.includes('dark')

    return {
        selected: (isDark ? resolvedOptions.value.selectionColorDark : resolvedOptions.value.selectionColor) ||
            computedTheme.value.rowSelected,
        hover: (isDark ? resolvedOptions.value.selectionHoverColorDark : resolvedOptions.value.selectionHoverColor) ||
            computedTheme.value.rowHover
    }
})

// Initialization after composable creation
onMounted(() => {
    // Initialize column filters (do not override controlled filters)
    initColumnFiltersFromProps()

    // Load server data if in server mode
    if (isServerMode.value) {
        loadServerData(false, 'onMounted').finally(() => {
            isInitialized.value = true
        })
    } else {
        isInitialized.value = true
    }

    // Setup infinite scroll observer after DOM is ready
    nextTick(() => {
        setupInfiniteScroll()
    })
})

// Debug utility function — only logs when user opts in via the `debug` option.
function debugLog(message: string, data?: unknown) {
    if (!resolvedOptions.value.debug) return
    if (process.env.NODE_ENV !== 'development') return
    console.group(`[DataTable] ${message}`)
    if (data !== undefined) console.log(data)
    console.groupEnd()
}

const {
    computedTheme,
    containerClasses,
    tableScrollContainerClasses,
    tableClasses,
    tableStyle,
    expandColumnStyle,
    expandColumnClasses,
    checkboxColumnStyle,
    checkboxColumnClasses,
    headerClasses
} = useDataTableTheme({
    resolvedOptions,
    actualMode,
    columnWidths,
    sticky: computed(() => !!props.sticky)
})

// ==========================================
// SKELETON + PAGINATION VISIBILITY
// ==========================================

// ✅ Optimized: Skeleton configurations
const skeletonRowCount = computed<number>(() => {
    if (hasPagination.value) {
        return Math.min(reactivePageSize.value, DATATABLE_CONSTANTS.SKELETON.MAX_ROWS)
    } else {
        // Without pagination, use actual data length or smaller default
        const dataLength = filteredData.value.length
        return dataLength > 0 ? Math.min(dataLength, DATATABLE_CONSTANTS.SKELETON.MAX_ROWS_WITHOUT_PAGINATION) : DATATABLE_CONSTANTS.SKELETON.DEFAULT_ROW_COUNT
    }
})

const loadMoreSkeletonCount = computed<number>(() => {
    return Math.min(reactivePageSize.value, DATATABLE_CONSTANTS.SKELETON.LOAD_MORE_COUNT)
})

// ✅ Optimized: Pagination visibility logic with shared computed
const shouldShowPagination = computed<boolean>(() => {
    if (!hasPagination.value) return false

    // In paginated mode, always show pagination (even during loading)
    if (actualMode.value === 'paginated') return true

    // For other modes (loadMore, infinite), hide during initial loading
    return !isInitialLoading.value
})

// Get skeleton width classes based on column type/content
function getSkeletonWidth(columnKey: string): string {
    const widthMap: Record<string, string> = {
        'id': 'w-12',
        'name': 'w-32',
        'email': 'w-48',
        'role': 'w-20',
        'status': 'w-16',
        'date': 'w-24',
        'price': 'w-20',
        'actions': 'w-16'
    }

    // Check if column key contains common patterns
    if (columnKey.includes('email')) return 'w-48'
    if (columnKey.includes('name') || columnKey.includes('title')) return 'w-32'
    if (columnKey.includes('date') || columnKey.includes('time')) return 'w-24'
    if (columnKey.includes('price') || columnKey.includes('amount')) return 'w-20'
    if (columnKey.includes('status') || columnKey.includes('role')) return 'w-16'
    if (columnKey.includes('id')) return 'w-12'

    return widthMap[columnKey] || 'w-24' // Default width
}

// ==========================================
// FILTERING (client mode)
// ==========================================

// The filtering logic is now handled by the useDataTableClientPipeline composable.

// ==========================================
// SORTING (client mode)
// ==========================================

// ==========================================
// PAGINATION (shared)
// ==========================================

// ✅ Optimized: totalPages using shared pagination logic  
const totalPages = computed(() => {
    if (!hasPagination.value) return 1

    if (isServerMode.value) {
        return Math.max(1, Math.ceil(serverTotal.value / reactivePageSize.value))
    }

    return Math.max(1, Math.ceil(sortedData.value.length / reactivePageSize.value))
})

const pagedRows = computed(() => {
    // ✅ Optimized: Use shared pagination logic
    if (!hasPagination.value) return sortedData.value

    // In server mode, data is already paginated/loaded
    if (isServerMode.value) {
        return sortedData.value
    }

    // Client mode pagination
    if (actualMode.value === 'loadMore' || actualMode.value === 'infinite' || actualMode.value === 'gridInfinite') {
        // Client mode: implement loadMore/infinite - show first X items * loadedPages
        const itemsToShow = loadedPages.value * reactivePageSize.value
        return sortedData.value.slice(0, itemsToShow)
    } else {
        // Classic pagination - show only current page
        const start = (page.value - 1) * reactivePageSize.value
        return sortedData.value.slice(start, start + reactivePageSize.value)
    }
})

// Keep the row-detail composable input in sync without creating TDZ issues.
watchEffect(() => {
    pagedRowsForRowDetail.value = pagedRows.value
    pagedRowsForPreservation.value = pagedRows.value
})

// For loadMore/infinite in client mode
const canLoadMoreInClient = computed(() => {
    if (isServerMode.value) return false
    if (!['loadMore', 'infinite', 'gridInfinite'].includes(actualMode.value)) return false

    const itemsShown = loadedPages.value * reactivePageSize.value
    return itemsShown < sortedData.value.length
})

// gridInfinite: state + scroll orchestration extracted
const buildApiParamsRef = ref<((page: number) => LoadDataParams) | null>(null)
const buildFetchQueryRef = ref<((params: LoadDataParams) => Record<string, unknown>) | null>(null)

const {
    gridScrollContainer,
    isGridInfiniteCached,
    gridInfiniteMinPageLoaded,
    gridInfiniteMaxPageLoaded,
    gridInfiniteTotalPages,
    gridInfinitePageSizes,
    gridInfiniteLoadingDirection,
    measureGridInfiniteRowHeight,
    resetGridInfiniteState,
    pruneGridInfiniteCache,
    maybeTriggerGridInfiniteLoadMore,
    onGridScroll,
    onGridInfiniteDataMaybeChanged,
    cleanupGridInfiniteScroll
} = useDataTableGridInfinite({
    actualMode,
    resolvedOptions,
    isServerMode,
    isInitialLoading,
    loadingState,
    actualApiUrl,
    serverData,
    serverTotal,
    reactivePageSize,
    allDataLoaded,
    canLoadMoreInClient,
    loadMore,
    buildApiParamsRef,
    buildFetchQueryRef,
    startLoadingMore,
    stopLoading,
    forceCheckboxUpdate,
    debugLog,
    emitAndCall,
    emitLegacy
})

const allCurrentSelected = computed(() => {
    return pagedRows.value.length > 0 && pagedRows.value.every(row => selectedIds.has(getRowId(row)))
})

// Computed property for selected rows with all their properties
const selectedRows = computed(() => {
    return currentData.value.filter(row => selectedIds.has(getRowId(row)))
})

// ✅ Initialize the styles composable after the computed properties
const stylesComposable = useDataTableStyles()

// Wrapper functions to use the composable with the right signatures
function getSortableHeaderClasses(column: Column): string {
    return stylesComposable.getSortableHeaderClasses(column)
}

function getNonSortableHeaderClasses(column: Column): string {
    return stylesComposable.getNonSortableHeaderClasses(column)
}

function getHeaderCellClasses(key: string, column?: Column): string {
    return stylesComposable.getHeaderCellClasses(
        key,
        column,
        computedTheme.value,
        draggedColumn.value
    )
}

function getBodyCellClasses(key: string, column?: Column): string {
    return stylesComposable.getBodyCellClasses(
        key,
        column,
        computedTheme.value,
        props.wrap
    )
}

// ✅ Initialize the pagination composable after the computed properties
const {
    paginationInfo,
    loadMoreInfo,
    hasMoreData,
    shouldShowLoadMoreButton,
    getLoadMoreButtonText,
    statusSummary
} = useDataTablePagination(
    isServerMode,
    actualMode,
    page,
    totalPages,
    serverTotal,
    serverData,
    filteredData,
    pagedRows,
    allDataLoaded,
    canLoadMoreInClient,
    loadedPages,
    reactivePageSize.value
)

// Watchers for reactive updates (optimized to prevent cascades)
watch(() => currentData.value, () => {
    // Force checkbox updates when data changes
    forceCheckboxUpdate()
}, { flush: 'post' })

// Filter helpers (shared)
const {
    getFilterValue,
    ensureFilterValue,
    getSelectFilterValue,
    getOptionKey,
    getOptionLabel,
    getTextFilterOperators,
    getNumberFilterOperators,
    getDateFilterOperators,
    isFilterActive
} = useDataTableFiltersModel({
    columnFilters,
    columns: computed(() => resolvedOptions.value.columns)
})

function onFilterChange(columnKey: string) {
    // ✅ Modern API: Primary event
    emitAndCall('filters-change', 'onFiltersChange', columnFilters)

    // ✅ Legacy compatibility
    emit('filter-change', columnKey, columnFilters[columnKey])
}

function onCustomFilterChange(columnKey: string, value: unknown) {
    columnFilters[columnKey] = value as FilterValue
    onFilterChange(columnKey)
}

// Materialize the FilterValue entry before mutating a single field, otherwise
// v-model on getFilterValue(...).{operator,value,value2} for boolean / text /
// dateRange / numberRange filters would mutate a throwaway object and never
// reach columnFilters. Used by DataTableColumnMenuContent.
function setFilterField(
    columnKey: string,
    field: 'operator' | 'value' | 'value2',
    value: unknown
) {
    const entry = ensureFilterValue(columnKey)
    ;(entry as unknown as Record<string, unknown>)[field] = value
    onFilterChange(columnKey)
}

function onSelectFilterToggle(columnKey: string, optionKey: string, checked: boolean) {
    const current = columnFilters[columnKey]
    const map: Record<string, boolean> =
        (typeof current === 'object' && current !== null && !('operator' in current))
            ? (current as Record<string, boolean>)
            : {}
    map[optionKey] = checked
    columnFilters[columnKey] = map as unknown as FilterValue
    onFilterChange(columnKey)
}

// Methods
function getColumnValue(row: TableRow, key: string): unknown {
    return row[key]
}

// Computed property for column styles to ensure reactivity
// ✅ Optimized: Memoized columnStyles with better caching strategy
const columnStyles = computed(() => {
    const stylesMap: Record<string, Record<string, string>> = {}

    // ✅ Optimized: Use for...of instead of forEach for better performance
    for (const column of resolvedOptions.value.columns) {
        stylesMap[column.key] = stylesComposable.getOptimizedColumnStyles(
            column.key,
            column,
            columnWidths as Record<string, number>
        )
    }

    return stylesMap
})

// ✅ Optimized: Simplified helper function
function getColumnStyles(column: Column): string {
    let styles: string[] = []

    // Get base styles from columnStyles
    const baseStyles = columnStyles.value[column.key] || {}
    Object.entries(baseStyles).forEach(([key, value]) => {
        styles.push(`${key}: ${value}`)
    })

    const toWidthString = (w: string | number): string => (typeof w === 'number' ? `${w}px` : String(w))
    const hasPxUnit = (w: string | number): boolean => typeof w === 'number' || String(w).trim().endsWith('px')

    // Use dynamic width from columnWidths (resizing) first, then column.width, then column.minWidth, then default.
    const dynamicWidth = columnWidths[column.key]
    const widthCandidate = dynamicWidth || column.width || column.minWidth || DATATABLE_CONSTANTS.DEFAULTS.COLUMN_WIDTH
    const widthValue = toWidthString(widthCandidate as string | number)

    // For table-fixed we must provide a width, otherwise columns can collapse to unusable sizes.
    styles.push(`width: ${widthValue} !important`)

    // Keep a minimum width so wrapped content doesn't break character-by-character.
    if (hasPxUnit(widthCandidate as string | number)) {
        styles.push(`min-width: ${widthValue} !important`)
    }

    // Respect explicit min/max constraints (when not actively resizing)
    if (!dynamicWidth) {
        if (column.minWidth !== undefined) {
            const minW = toWidthString(column.minWidth as string | number)
            styles.push(`min-width: ${minW} !important`)
        }
        if (column.maxWidth !== undefined) {
            const maxW = toWidthString(column.maxWidth as string | number)
            styles.push(`max-width: ${maxW} !important`)
        }
    }

    return styles.join('; ')
}

// Tooltip helper function
function shouldShowTooltip(value: unknown): boolean {
    // Only show tooltip for non-empty string values
    if (typeof value !== 'string') return false
    if (!value || value.trim() === '') return false

    // Show tooltip for long text based on configured threshold
    return value.length > DATATABLE_CONSTANTS.TOOLTIP.TEXT_LENGTH_THRESHOLD
}

// Checkbox styling function
function getCheckboxClasses(): Record<string, string> {
    // Get checkbox colors that match the current theme
    const theme = resolvedOptions.value.variant

    if (theme.includes('dark')) {
        return {
            'ui-checkbox-wrapper': 'bg-gray-800 border-gray-600 hover:border-gray-500',
            'ui-checkbox-inner': 'text-white bg-gray-800',
            'ui-checkbox-checked': 'bg-blue-600 border-blue-600'
        }
    } else if (theme === 'elegant') {
        return {
            'ui-checkbox-wrapper': 'bg-white border-blue-300 hover:border-blue-400',
            'ui-checkbox-inner': 'text-blue-700',
            'ui-checkbox-checked': 'bg-blue-600 border-blue-600'
        }
    } else if (theme.startsWith('modern')) {
        return {
            'ui-checkbox-wrapper': 'bg-white border-purple-300 hover:border-purple-400',
            'ui-checkbox-inner': 'text-purple-700',
            'ui-checkbox-checked': 'bg-purple-600 border-purple-600'
        }
    } else {
        // Default theme
        return {
            'ui-checkbox-wrapper': 'bg-white border-gray-300 hover:border-gray-400',
            'ui-checkbox-inner': 'text-gray-700',
            'ui-checkbox-checked': 'bg-blue-600 border-blue-600'
        }
    }
}

function getRowClasses(index: number, rowId: string | number): string {
    const classes = [
        'transition-colors duration-150 cursor-pointer group'
    ]

    // Check if theme has alternate row backgrounds and apply them
    const hasAlternateRows = computedTheme.value.rowBackgroundAlt !== computedTheme.value.rowBackground

    if (hasAlternateRows && index % 2 === 1) {
        classes.push(computedTheme.value.rowBackgroundAlt ?? '')
    } else {
        classes.push(computedTheme.value.rowBackground ?? '')
    }

    // Selected state with dynamic colors
    if (selectedIds.has(rowId)) {
        // Replace background with selection color
        classes.pop() // Remove the background we added earlier
        classes.push(selectionColors.value.selected as string)
    } else {
        // For non-selected rows, add hover class (CSS will handle the hover state)
        classes.push(selectionColors.value.hover as string)
    }

    // Row border
    if (computedTheme.value.rowBorder) {
        classes.push(computedTheme.value.rowBorder as string)
    }

    return classes.filter(Boolean).join(' ')
}

function toggleSort(key: string) {
    if (sortKey.value === key) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortKey.value = key
        sortDir.value = 'asc'
    }
}

function sortIcon(key: string) {
    if (sortKey.value !== key) return 'i-heroicons-arrows-up-down-20-solid'
    return sortDir.value === 'asc' ? 'i-heroicons-chevron-up-20-solid' : 'i-heroicons-chevron-down-20-solid'
}

function getFilterIconClass(columnKey: string): string {
    const isActive = isFilterActive(columnKey)
    const baseClasses = `w-4 h-4 cursor-pointer ${computedTheme.value.headerTextColor || 'text-gray-700'} transition-opacity`

    if (isActive) {
        // Filter is active - make icon visible
        return `${baseClasses} opacity-100`
    } else {
        // Filter is not active - show on hover like sort icon
        return `${baseClasses} opacity-0 group-hover/filter:opacity-100`
    }
}

function getSortIconClass(columnKey: string): string {
    const isActive = sortKey.value === columnKey
    const baseClasses = `w-4 h-4 cursor-pointer ${computedTheme.value.headerTextColor || 'text-gray-700'} transition-opacity`

    if (isActive) {
        // Sort is active - make icon visible
        return `${baseClasses} opacity-100`
    } else {
        // Sort is not active - show on hover
        return `${baseClasses} opacity-0 group-hover/sort:opacity-100`
    }
}

function getFilterButtonClass(): string {
    const isDark = resolvedOptions.value.variant.includes('dark')

    if (isDark) {
        return 'inline-flex items-center gap-1 transition-colors p-1 rounded hover:bg-gray-700'
    } else {
        return 'inline-flex items-center gap-1 transition-colors p-1 rounded hover:bg-gray-100'
    }
}

function toggleSelect(id: string | number, checked: boolean) {
    if (checked) {
        selectedIds.add(id)
    } else {
        selectedIds.delete(id)
    }

    // Force checkbox update
    forceCheckboxUpdate()

    // ✅ Modern API: Primary event
    emitAndCall('selection-change', 'onSelectionChange', selectedRows.value)

    // ✅ Legacy compatibility
    const row = rowById.value.get(id)
    if (row) {
        emit('row-select', row, checked)
    }
    emit('rows-selected', selectedRows.value)

    // Debug mode
    debugLog('Toggle Select', {
        rowId: id,
        checked,
        selectedCount: selectedIds.size,
        checkboxUpdateKey: checkboxUpdateKey.value
    })
}

function toggleSelectAll(checked: boolean) {
    pagedRows.value.forEach(row => {
        const id = getRowId(row)
        if (checked) {
            selectedIds.add(id)
        } else {
            selectedIds.delete(id)
        }
    })

    // Force checkbox update
    forceCheckboxUpdate()

    // ✅ Modern API: Primary event
    emitAndCall('selection-change', 'onSelectionChange', selectedRows.value)

    // ✅ Legacy compatibility
    emit('rows-selected', selectedRows.value)

    // Debug mode
    debugLog('Toggle Select All', {
        checked,
        pagedRowsCount: pagedRows.value.length,
        selectedCount: selectedIds.size,
        allCurrentSelected: allCurrentSelected.value
    })
}

function handleRowClick(row: TableRow, event: MouseEvent) {
    // Ignore clicks on interactive elements (buttons, links, etc.)
    const target = event.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button, a, input, select')) {
        return
    }

    const rowId = getRowId(row)
    const isSelected = selectedIds.has(rowId)

    // Toggle selection
    if (resolvedOptions.value.selectable) {
        toggleSelect(rowId, !isSelected)
    } else {
        // Even if not selectable, we can still highlight the row
        // Clear previous selections and select this row
        selectedIds.clear()
        selectedIds.add(rowId)
        forceCheckboxUpdate()
        emit('row-select', row, true)
        emit('rows-selected', [row])
        emitAndCall('selection-change', 'onSelectionChange', [row]) // Alias for compatibility
    }

    // Debug mode
    debugLog('Row Clicked', {
        rowId,
        wasSelected: isSelected,
        rowData: row
    })
}

function clearColumnFilter(key: string) {
    const column = columnsByKey.value.get(key)
    const filterType = getColumnFilterType(column)

    columnFilters[key] = buildDefaultColumnFilterValue({ column, filterType })

    // Emit filter change
    emit('filter-change', key, columnFilters[key])
    emitAndCall('filters-change', 'onFiltersChange', columnFilters)
}

// Server mode functions
const serverLoader = useDataTableServerLoader({
    isServerMode,
    actualApiUrl,
    actualServerFn,
    actualMode,
    loadingState,
    isInitialized,
    page,
    loadedPages,
    reactivePageSize,
    debouncedSearch,
    sortKey,
    sortDir,
    columnFilters,
    deepClone,
    pagedRows,
    serverData,
    serverTotal,
    allDataLoaded,
    isGridInfiniteCached,
    gridInfiniteMinPageLoaded,
    gridInfiniteMaxPageLoaded,
    gridInfiniteTotalPages,
    gridInfinitePageSizes,
    gridInfiniteLoadingDirection,
    resetGridInfiniteState,
    pruneGridInfiniteCache,
    measureGridInfiniteRowHeight,
    preserveCurrentState,
    startInitialLoading,
    startLoadingMore,
    stopLoading,
    forceCheckboxUpdate,
    debugLog,
    emitAndCall,
    emitLegacy,
    isRefreshing
})

const {
    calculateCurrentPage,
    buildApiParams,
    buildFetchQuery,
    loadServerData,
    setupServerWatchers
} = serverLoader

// Register server-mode watchers inside the loader composable
setupServerWatchers()

// Provide builders to gridInfinite previous-page loader (defined in composable)
buildApiParamsRef.value = buildApiParams
buildFetchQueryRef.value = buildFetchQuery

// Load more function for loadMore mode
async function loadMore() {
    debugLog('LoadMore: Function called', {
        paginationType: actualMode.value,
        isServerMode: isServerMode.value,
        loadingState: loadingState.value,
        allDataLoaded: allDataLoaded.value,
        canLoadMoreInClient: canLoadMoreInClient.value
    })

    if (actualMode.value !== 'loadMore' && actualMode.value !== 'infinite' && actualMode.value !== 'gridInfinite') {
        debugLog('LoadMore: Incompatible pagination type')
        return
    }

    if (isServerMode.value) {
        if (loadingState.value === LoadingState.LOADING_MORE || allDataLoaded.value) {
            debugLog('LoadMore: Cannot load - loading or allDataLoaded', {
                loadingState: loadingState.value,
                allDataLoaded: allDataLoaded.value
            })
            return
        }
        if (actualMode.value === 'gridInfinite') {
            gridInfiniteLoadingDirection.value = 'down'
        }
        debugLog('LoadMore: Calling loadServerData(true)')
        await loadServerData(true, 'loadMore')
    } else {
        // Client mode
        debugLog('LoadMore: Client mode - calling loadMoreClient()')
        loadMoreClient()
    }
}

// Load more function for client mode
function loadMoreClient() {
    if (isServerMode.value) {
        debugLog('LoadMoreClient: Error - server mode detected')
        return
    }

    if (!canLoadMoreInClient.value) {
        debugLog('LoadMoreClient: No more data to load', {
            loadedPages: loadedPages.value,
            pageSize: reactivePageSize.value,
            totalData: sortedData.value.length,
            currentlyShown: pagedRows.value.length
        })
        return
    }

    debugLog('LoadMoreClient: Loading next page', {
        currentPage: loadedPages.value,
        nextPage: loadedPages.value + 1,
        pageSize: reactivePageSize.value,
        totalData: sortedData.value.length
    })

    loadedPages.value++

    debugLog('LoadMoreClient: Page loaded successfully', {
        newPage: loadedPages.value,
        newItemsShown: loadedPages.value * reactivePageSize.value,
        actualItemsShown: pagedRows.value.length
    })
}

// Handle toolbar filter changes
function handleToolbarFilter(key: string, value: unknown) {
    // Update the column filter
    columnFilters[key] = value as FilterValue

    // Emit the filter change events
    emit('filter-change', key, value as FilterValue)
    emitAndCall('filters-change', 'onFiltersChange', columnFilters)
}

// ✅ Handle bulk actions
function handleBulkAction(action: string, ids: (string | number)[]) {
    const idsSet = new Set(ids)
    const selectedRowsData = currentData.value.filter(row => idsSet.has(getRowId(row)))

    // Log for debugging
    debugLog('Bulk Action', { action, idsCount: ids.length, selectedRowsData })

    // Emit the bulk-action event to parent - let the parent handle the logic
    emitAndCall('bulk-action', 'onBulkAction', action, selectedRowsData)

    // Legacy support for export action
    if (action === 'export') {
        emitAndCall('export', 'onExport', selectedRowsData)
    }
}

function onToolbarBulkAction(action: string, ids: (string | number)[]) {
    handleBulkAction(action, ids)
}

// Handle refresh action
function handleRefresh() {
    // Mark refresh in progress to skip watchers
    isRefreshing.value = true

    // Preserve current state before starting refresh
    preserveCurrentState()

    // Emit the refresh event for parent components to handle (optional)
    emitAndCall('refresh', 'onRefresh')

    // Handle refresh internally based on mode
    if (isServerMode.value) {
        // Reset pagination state for loadMore/infinite types
        if (actualMode.value === 'loadMore' || actualMode.value === 'infinite' || actualMode.value === 'gridInfinite') {
            serverData.value = []
            loadedPages.value = 1
            allDataLoaded.value = false

            if (actualMode.value === 'gridInfinite') {
                resetGridInfiniteState()
            }
        }

        // Reset to first page for classic pagination
        if (actualMode.value === 'paginated') {
            page.value = 1
        }

        // Short pause so watchers fire and get ignored
        nextTick(() => {
            // Reload data (loadServerData will handle startInitialLoading internally)
            loadServerData(false, 'handleRefresh').finally(() => {
                isRefreshing.value = false
            })
        })
    } else {
        // Client mode: simulate refresh with temporary loading state
        startRefreshing()

        // Simulate a refresh delay
        setTimeout(() => {
            stopLoading()

            // Force checkbox updates after refresh
            forceCheckboxUpdate()

            // Optional: You could trigger data re-computation here
            // For example, re-sorting, re-filtering, etc.

            debugLog('DataTable Refreshed', { mode: 'client' })
            isRefreshing.value = false
        }, DATATABLE_CONSTANTS.TIMEOUTS.REFRESH_DELAY)
    }
}

const {
    startResize,
    onColumnDragStart,
    onColumnDrop,
    onColumnMenuDragStart,
    onColumnMenuDrop,
    cleanupResizeListeners
} = useDataTableColumnInteractions({
    resolvedOptions: computed(() => ({ columns: resolvedOptions.value.columns })),
    columnWidths,
    columnOrder,
    draggedColumn
})

const {
    ensureHeaderMenuTab,
    getColumnMenuBindings
} = useDataTableColumnMenu({
    orderedColumns,
    visibleCols,
    getCheckboxClasses,
    onColumnMenuDragStart,
    onColumnMenuDrop,

    getColumnFilterType,
    getFilterValue,
    getSelectFilterValue,
    getTextFilterOperators,
    getDateFilterOperators,
    getNumberFilterOperators,
    getOptionKey,
    getOptionLabel,
    onFilterChange,
    onCustomFilterChange,
    clearColumnFilter,
    setFilterField,
    onSelectFilterToggle,
    columnFilters,
    computedTheme
})

// Reset page when data changes
watch([filteredData, sortKey, sortDir, reactivePageSize], () => {
    if (page.value > totalPages.value) {
        page.value = Math.max(1, totalPages.value)
    }

    // Reset loadedPages for loadMore/infinite when data changes in CLIENT mode only
    // In server mode, data changes when we accumulate it, so we must not reset
    if (!isServerMode.value && (actualMode.value === 'loadMore' || actualMode.value === 'infinite' || actualMode.value === 'gridInfinite')) {
        loadedPages.value = 1
    }
})

// Sync reactivePageSize with resolvedOptions.value.pageSize
watch(() => resolvedOptions.value.pageSize, (newPageSize) => {
    if (newPageSize !== reactivePageSize.value) {
        reactivePageSize.value = newPageSize
    }
})

// ==========================================
// GRID INFINITE SCROLL (scroll inside table)
// ==========================================

const {
    setInfiniteScrollTriggerEl,
    setupInfiniteScroll,
    cleanupInfiniteScroll
} = useDataTableInfiniteScroll({
    actualMode,
    isServerMode,
    allDataLoaded,
    canLoadMoreInClient,
    loadingState,
    loadMore,
    debugLog,
    serverData,
    actualData,
    loadedPages,
    onGridInfiniteDataMaybeChanged,
    maybeTriggerGridInfiniteLoadMore
})

onUnmounted(() => {
    // ✅ Use consolidated cleanup function
    cleanupInfiniteScroll()

    cleanupGridInfiniteScroll()

    cleanupResizeListeners()

})

// ==========================================
// PUBLIC IMPERATIVE API
// ==========================================
defineExpose({
    // Data manipulation
    addRows,
    removeRows,
    updateRow,
    // Editing
    addEmptyRow,
    startEdit,
    cancelEdit,
    saveEdit,
    updateCell,
    // Refresh
    handleRefresh
})
</script>

<style scoped>
/* Accessibility - Screen reader only content */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
</style>
