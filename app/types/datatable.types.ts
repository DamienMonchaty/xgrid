/**
 * Types TypeScript pour le composant DataTable
 * Définit toutes les interfaces et types utilisés
 */

// Types de base
export type FilterOperator = 
    | 'eq' | 'ne' | 'contains' | 'startsWith' | 'endsWith' 
    | 'gt' | 'gte' | 'lt' | 'lte' 
    | 'in' | 'notIn' 
    | 'between' | 'notBetween'
    | 'isNull' | 'isNotNull'
    | 'regex' | 'custom'

export type ColumnAlign = 'left' | 'center' | 'right'
export type RowId = string | number
export type ColumnFilterType = 'text' | 'select' | 'dateRange' | 'numberRange' | 'boolean' | 'custom'
export type TableVariant = 'default' | 'default-dark' | 'elegant' | 'elegant-dark' | 'modern' | 'modern-dark'
export type TableSize = 'xs' | 'sm' | 'md' | 'lg'
export type PaginationType = 'paginated' | 'loadMore' | 'infinite' | 'gridInfinite' | 'none'
export type LoadingState = 'idle' | 'initial_loading' | 'loading_more' | 'refreshing'

// Interfaces principales
export interface FilterOption {
    value: string | number | boolean
    label: string
}

export interface FilterValue {
    operator: FilterOperator
    value: unknown
    value2?: unknown  // For range filters (between, notBetween)
}

export interface ValueGetterParams {
    row: TableRow
    data: TableRow
    column: Column
    value: unknown
    rowIndex?: number
}

export interface TooltipValueGetterParams extends ValueGetterParams {}

export interface Column {
    key: string
    label: string
    type?: string
    sortable?: boolean
    resizable?: boolean
    draggable?: boolean
    filterable?: boolean
    editable?: boolean
    filterType?: ColumnFilterType
    filterOperator?: FilterOperator
    filterOptions?: string[] | FilterOption[]
    align?: ColumnAlign
    width?: string | number
    maxWidth?: string | number
    minWidth?: string | number
    showTooltip?: boolean
    valueGetter?: (params: ValueGetterParams) => unknown
    tooltipValueGetter?: (params: TooltipValueGetterParams) => string | number | boolean | null | undefined
    wrap?: boolean  // Allow text wrapping in cells
    // Custom filter — client-side predicate
    filterFn?: (row: TableRow, value: unknown) => boolean
    // Custom filter props for server mode
    customFilterComponent?: string
    customFilterProps?: Record<string, unknown>
    validation?: {
        enabled?: boolean
        required?: boolean
        min?: number
        max?: number
        pattern?: RegExp
        customMessage?: string
    }
}

export interface BulkAction {
    key: string
    label: string
    variant?: 'link' | 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost'
    color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
}

export interface TableGrouping {
    key?: string
    keys?: string[]
    valueGetter?: (params: ValueGetterParams) => string | number | boolean | null | undefined
    labelGetter?: (value: unknown, rows: TableRow[], key: string) => string
}

export interface TableRow {
    [key: string]: unknown
}

export interface ServerResponse {
    success: boolean
    data: TableRow[]
    total: number
    page: number
    totalPages: number
    error?: string
}

export interface LoadDataParams {
    page: number
    pageSize: number
    search: string
    sort?: { key: string, direction: 'asc' | 'desc' }
    filters: ColumnFilter
}

export interface DataLoadedResult {
    data: TableRow[]
    total: number
    page: number
    totalPages: number
    isLoadMore?: boolean
}

/**
 * Custom server-side data loader. Use this when your remote API does not
 * speak our default `{ page, pageSize, search, sort, filters }` query format
 * or does not return our `ServerResponse` envelope (e.g. JSONPlaceholder,
 * REST APIs returning a raw array + total in a header).
 *
 * Receives the same `LoadDataParams` we would normally serialize to the URL
 * and must resolve to a `ServerResponse`-shaped object.
 */
export type ServerDatasourceFn = (params: LoadDataParams) => Promise<ServerResponse> | ServerResponse

// Filter types
export interface ColumnFilter {
    [key: string]: FilterValue | string | number | boolean | Record<string, boolean> | undefined
}

export interface TableTheme {
    [key: string]: string | undefined
    // Container
    container?: string
    wrapper?: string
    // Header
    headerBackground?: string
    headerText?: string
    headerTextColor?: string
    headerBorder?: string
    headerHover?: string
    // Rows
    rowBackground?: string
    rowBackgroundAlt?: string
    rowHover?: string
    rowSelected?: string
    rowBorder?: string
    rowText?: string
    // Cells
    cellPadding?: string
    cellBorder?: string
    // States
    loadingBackground?: string
    emptyBackground?: string
    // Borders
    tableBorder?: string
    borderRadius?: string
    // Shadows
    shadow?: string
    // Responsive
    mobileBreakpoint?: string
    tabletBreakpoint?: string
    // Text colors for various elements
    paginationText?: string
    filterText?: string
    emptyStateText?: string
    loadingText?: string
    infoText?: string
}

// Props interface
export interface DataTableProps {
    // Source de données
    datasource: TableRow[] | string | ServerDatasourceFn
    mode?: 'loadMore' | 'infinite' | 'gridInfinite'

    /** Enable master/detail rows (nested content rendered via `row-detail` slot). */
    expandable?: boolean

    /** Lazy-load detail: URL (or factory) fetched when expanding a row. */
    rowDetailUrl?: string | ((row: TableRow) => string)

    /** Lazy-load detail: query (or factory) for the detail request. */
    rowDetailQuery?: Record<string, unknown> | ((row: TableRow) => Record<string, unknown>)

    /** Cache detail per rowId (default: true). */
    rowDetailCache?: boolean

    /** Auto-load detail when expanding (default: true). */
    rowDetailAutoLoad?: boolean
    
        /** Resolver function for row details. */
        rowDetailResolver?: (row: TableRow) => unknown

    /** Controlled expanded row ids (use with v-model:expanded). */
    expanded?: Array<string | number>

    /** gridInfinite only: pages kept in memory (0 = keep all). */
    gridInfiniteCachePages?: number
    
    // Configuration de base
    columns: Column[]
    title?: string
    selectable?: boolean
    searchable?: boolean
    searchPlaceholder?: string
    paginated?: boolean
    showPagination?: boolean
    pageSize?: number
    pageSizeSelector?: boolean
    loading?: boolean
    debug?: boolean
    bulkActions?: BulkAction[]
    rowIdKey?: string
    
    // Composants modulaires
    useModularHeader?: boolean
    useModularToolbar?: boolean
    showExport?: boolean
    showRefresh?: boolean
    
    // Styles et thèmes
    theme?: TableTheme
    variant?: TableVariant
    size?: TableSize
    stickyHeader?: boolean
    compactMode?: boolean
    wrapText?: boolean
    
    // Couleurs de sélection personnalisées
    selectionColor?: string
    selectionColorDark?: string
    selectionHoverColor?: string
    selectionHoverColorDark?: string
}

// Events interfaces
export interface DataTableEmits {
    'bulk-action': [action: string, ids: (string | number)[]]
    'row-action': [action: string, row: TableRow]
    'row-select': [row: TableRow, selected: boolean]
    'rows-selected': [rows: TableRow[]]
    'export': []
    'refresh': []
    'load-data': [params: LoadDataParams]
    'data-loaded': [result: DataLoadedResult]
    'filter-change': [columnKey: string, filterValue: FilterValue | Record<string, boolean> | string]
    'filters-change': [filters: ColumnFilter]
}

// Validation result type
export interface ValidationResult {
    type: 'success' | 'error' | 'warning'
    message: string
    isValid: boolean
}

// Utility functions
export function getFilterTypeFromColumnType(columnType?: string): ColumnFilterType {
    switch (columnType) {
        case 'number':
            return 'numberRange'
        case 'date':
            return 'dateRange'
        case 'select':
            return 'select'
        default:
            return 'text'
    }
}

export function getInputTypeFromColumnType(columnType?: string): string {
    switch (columnType) {
        case 'number':
            return 'number'
        case 'date':
            return 'date'
        case 'email':
            return 'email'
        case 'url':
            return 'url'
        case 'password':
            return 'password'
        default:
            return 'text'
    }
}

export function validateColumnValue(value: unknown, column: Column): ValidationResult | null {
    if (!column.validation?.enabled) return null
    
    const validation = column.validation
    const stringValue = String(value || '').trim()
    
    // Required validation
    if (validation.required && !stringValue) {
        return {
            type: 'error',
            message: validation.customMessage || `${column.label} is required`,
            isValid: false
        }
    }
    
    // Skip other validations if value is empty and not required
    if (!stringValue && !validation.required) return null
    
    // Min length validation
    if (validation.min && stringValue.length < validation.min) {
        return {
            type: 'error',
            message: validation.customMessage || `${column.label} must be at least ${validation.min} characters`,
            isValid: false
        }
    }
    
    // Max length validation
    if (validation.max && stringValue.length > validation.max) {
        return {
            type: 'warning',
            message: validation.customMessage || `${column.label} should not exceed ${validation.max} characters`,
            isValid: false
        }
    }
    
    // Pattern validation
    if (validation.pattern && !validation.pattern.test(stringValue)) {
        return {
            type: 'error',
            message: validation.customMessage || `${column.label} format is invalid`,
            isValid: false
        }
    }
    
    // Success validation
    return {
        type: 'success',
        message: 'Valid',
        isValid: true
    }
}
