/**
 * Constantes pour le composant DataTable
 * Centralise toutes les valeurs magiques pour améliorer la maintenabilité
 */

export const DATATABLE_CONSTANTS = {
  SKELETON: {
    DEFAULT_ROW_COUNT: 4,
    MAX_ROWS: 8,
    MAX_ROWS_WITHOUT_PAGINATION: 5,
    LOAD_MORE_COUNT: 3
  },
  DEFAULTS: {
    PAGE_SIZE: 10,
    COLUMN_WIDTH: 160,
    MIN_COLUMN_WIDTH: 80,
    MAX_COLUMN_WIDTH: 500
  },
  TIMEOUTS: {
    REFRESH_DELAY: 1500,
    DEBOUNCE_SEARCH: 300,
    INFINITE_SCROLL_THROTTLE: 100
  },
  TOOLTIP: {
    TEXT_LENGTH_THRESHOLD: 30
  },
  INTERSECTION_OBSERVER: {
    THRESHOLD: 0.1,
    ROOT_MARGIN: '50px'
  },
  SPECIAL_COLUMNS: {
    EXPAND: {
      WIDTH: '40px',
      WIDTH_PX: 40,
      CLASSES: 'w-10 min-w-10 max-w-10 text-center'
    },
    CHECKBOX: {
      WIDTH: '48px',
      WIDTH_PX: 48,
      CLASSES: 'w-12 min-w-12 max-w-12 text-center'
    }
  }
} as const

export const ALIGNMENT_CLASSES = {
  left: 'text-left',
  center: 'text-center', 
  right: 'text-right'
} as const

export const SIZE_CLASSES = {
  xs: {
    cellPadding: 'px-2 py-1',
    headerText: 'text-xs font-medium',
    rowText: 'text-xs'
  },
  sm: {
    cellPadding: 'px-3 py-2',
    headerText: 'text-sm font-medium',
    rowText: 'text-sm'
  },
  md: {
    cellPadding: 'px-4 py-3',
    headerText: 'text-sm font-medium',
    rowText: 'text-sm'
  },
  lg: {
    cellPadding: 'px-6 py-4',
    headerText: 'text-base font-medium',
    rowText: 'text-base'
  }
} as const

// Constantes pour les expressions régulières
export const REGEX_PATTERNS = {
  SIZE_CLASS: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/
} as const

// Constantes pour les types de filtres
export const FILTER_OPERATORS = {
  TEXT: [
    { value: 'contains', label: 'Contains' },
    { value: 'eq', label: 'Equals' },
    { value: 'ne', label: 'Not equals' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'regex', label: 'Regex' }
  ],
  NUMBER: [
    { value: 'eq', label: 'Equals' },
    { value: 'ne', label: 'Not equals' },
    { value: 'gt', label: 'Greater than' },
    { value: 'gte', label: 'Greater or equal' },
    { value: 'lt', label: 'Less than' },
    { value: 'lte', label: 'Less or equal' },
    { value: 'between', label: 'Between' }
  ],
  DATE: [
    { value: 'eq', label: 'On date' },
    { value: 'ne', label: 'Not on date' },
    { value: 'gt', label: 'After' },
    { value: 'gte', label: 'On or after' },
    { value: 'lt', label: 'Before' },
    { value: 'lte', label: 'On or before' },
    { value: 'between', label: 'Between dates' }
  ]
}

// Constantes pour les libellés (Internationalization)
export const TEXT_LABELS = {
  // Pagination
  SHOWING_PAGE: 'Showing page',
  OF: 'of',
  ITEMS: 'items',
  TOTAL: 'total',
  DISPLAYED: 'displayed',
  
  // Load More
  LOAD_MORE: 'Load more',
  SHOW_MORE: 'Show more',
  LOADING: 'Loading...',
  AUTO_LOADING: 'Auto loading...',
  ALL_LOADED: 'All items have been loaded',
  ALL_DISPLAYED: 'All items have been displayed',
  
  // Filter
  FILTER_BY: 'Filter by',
  
  // Empty state
  NO_DATA: 'No data available',
  
  // Infinite scroll
  SCROLL_TO_LOAD: 'Scroll to load more items automatically',
  
  // Accessibility
  SORT_COLUMN: 'Sort by column',
  FILTER_COLUMN: 'Filter column',
  SELECT_ROW: 'Select row',
  SELECT_ALL: 'Select all rows',
  SORT_ASCENDING: 'Sort ascending',
  SORT_DESCENDING: 'Sort descending',
  TABLE_CAPTION: 'Data table',
  PAGINATION_NAVIGATION: 'Table pagination navigation',
  ROW_SELECTED: 'Row selected',
  ROW_NOT_SELECTED: 'Row not selected'
} as const

// Constantes pour les thèmes par défaut
export const DEFAULT_THEMES = {
  default: {
    container: 'bg-white rounded-lg shadow border border-gray-200 overflow-hidden',
    wrapper: 'relative',
    headerBackground: 'bg-gray-50',
    headerText: 'text-gray-700 font-semibold',
    headerTextColor: 'text-gray-700',
    headerBorder: 'border-b border-gray-200',
    headerHover: 'hover:bg-gray-100',
    rowBackground: 'bg-white',
    rowBackgroundAlt: 'bg-gray-50',
    rowHover: 'hover:bg-blue-50',
    rowSelected: 'bg-blue-100',
    rowBorder: 'border-b border-gray-100',
    rowText: 'text-gray-900',
    cellPadding: 'px-6 py-4',
    cellBorder: '',
    loadingBackground: 'bg-gray-50',
    emptyBackground: 'bg-gray-50',
    tableBorder: '',
    borderRadius: 'rounded-lg',
    shadow: 'shadow',
    paginationText: 'text-gray-600',
    filterText: 'text-gray-500',
    emptyStateText: 'text-gray-500',
    loadingText: 'text-gray-600',
    infoText: 'text-gray-600'
  },
  'default-dark': {
    container: 'bg-gray-900 rounded-lg shadow-xl border border-gray-800 overflow-hidden',
    wrapper: 'relative',
    headerBackground: 'bg-gray-800',
    headerText: 'text-white font-semibold',
    headerTextColor: 'text-white',
    headerBorder: 'border-b border-gray-700',
    headerHover: 'hover:bg-gray-700',
    rowBackground: 'bg-gray-900',
    rowBackgroundAlt: 'bg-gray-800',
    rowHover: 'hover:bg-gray-700',
    rowSelected: 'bg-blue-900',
    rowBorder: 'border-b border-gray-800',
    rowText: 'text-white',
    cellPadding: 'px-6 py-4',
    cellBorder: '',
    loadingBackground: 'bg-gray-800',
    emptyBackground: 'bg-gray-800',
    tableBorder: '',
    borderRadius: 'rounded-lg',
    shadow: 'shadow-xl',
    paginationText: 'text-gray-300',
    filterText: 'text-gray-400',
    emptyStateText: 'text-gray-400',
    loadingText: 'text-gray-300',
    infoText: 'text-gray-300'
  },
  elegant: {
    container: 'bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden',
    wrapper: 'relative',
    headerBackground: 'bg-gray-50',
    headerText: 'text-gray-800 font-medium',
    headerTextColor: 'text-gray-800',
    headerBorder: 'border-b border-gray-300',
    headerHover: 'hover:bg-gray-100',
    rowBackground: 'bg-white',
    rowBackgroundAlt: 'bg-gray-50/50',
    rowHover: 'hover:bg-blue-50',
    rowSelected: 'bg-blue-100',
    rowBorder: 'border-b border-gray-200',
    rowText: 'text-gray-900',
    cellPadding: 'px-6 py-4',
    cellBorder: 'border-r border-gray-200 last:border-r-0',
    loadingBackground: 'bg-gray-50',
    emptyBackground: 'bg-gray-50',
    tableBorder: '',
    borderRadius: 'rounded-lg',
    shadow: 'shadow-lg',
    paginationText: 'text-gray-700',
    filterText: 'text-blue-600',
    emptyStateText: 'text-gray-600',
    loadingText: 'text-gray-700',
    infoText: 'text-gray-700',
    checkboxBackground: 'bg-white border-gray-300',
    checkboxBorder: 'border-gray-300',
    checkboxHover: 'hover:border-blue-400 hover:bg-blue-50',
    checkboxChecked: 'bg-blue-600 border-blue-600',
    checkboxCheckedHover: 'hover:bg-blue-700',
    loadingSpinner: 'text-blue-600',
  },
  'elegant-dark': {
    container: 'bg-slate-800 rounded-lg shadow-lg border border-slate-600 overflow-hidden',
    wrapper: 'relative',
    headerBackground: 'bg-slate-700',
    headerText: 'text-slate-100 font-medium',
    headerTextColor: 'text-slate-100',
    headerBorder: 'border-b border-slate-600',
    headerHover: 'hover:bg-slate-600',
    rowBackground: 'bg-slate-800',
    rowBackgroundAlt: 'bg-slate-750',
    rowHover: 'hover:bg-slate-700',
    rowSelected: 'bg-blue-800',
    rowBorder: 'border-b border-slate-700',
    rowText: 'text-slate-100',
    cellPadding: 'px-6 py-4',
    cellBorder: 'border-r border-slate-700 last:border-r-0',
    loadingBackground: 'bg-slate-750',
    emptyBackground: 'bg-slate-750',
    tableBorder: '',
    borderRadius: 'rounded-lg',
    shadow: 'shadow-lg',
    paginationText: 'text-slate-200',
    filterText: 'text-blue-400',
    emptyStateText: 'text-slate-400',
    loadingText: 'text-slate-200',
    infoText: 'text-slate-200',
    checkboxBackground: 'bg-slate-700 border-slate-500',
    checkboxBorder: 'border-slate-500',
    checkboxHover: 'hover:border-blue-400 hover:bg-slate-600',
    checkboxChecked: 'bg-blue-600 border-blue-600',
    checkboxCheckedHover: 'hover:bg-blue-700',
    loadingSpinner: 'text-blue-400',
  },
  modern: {
    container: 'bg-white shadow-2xl overflow-hidden border-l-4 border-l-emerald-500',
    wrapper: 'overflow-hidden',
    headerBackground: 'bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900',
    headerText: 'text-white font-bold uppercase tracking-wider text-sm',
    headerTextColor: 'text-white',
    headerBorder: 'border-b-2 border-emerald-500',
    headerHover: 'hover:from-gray-800 hover:via-slate-700 hover:to-gray-800',
    rowBackground: 'bg-white',
    rowBackgroundAlt: 'bg-gray-50',
    rowHover: 'hover:bg-emerald-50 hover:border-l-2 hover:border-l-emerald-400',
    rowSelected: 'bg-emerald-100 border-l-2 border-l-emerald-500',
    rowBorder: 'border-b border-gray-100',
    rowText: 'text-gray-900',
    cellPadding: 'px-6 py-4',
    cellBorder: 'border-r border-gray-100 last:border-r-0',
    loadingBackground: 'bg-gray-50',
    emptyBackground: 'bg-gray-50',
    tableBorder: '',
    borderRadius: '',
    shadow: 'shadow-2xl',
    paginationText: 'text-gray-700',
    filterText: 'text-emerald-600',
    emptyStateText: 'text-gray-600',
    loadingText: 'text-gray-700',
    infoText: 'text-gray-700',
    checkboxBackground: 'bg-white border-emerald-400',
    checkboxBorder: 'border-emerald-400',
    checkboxHover: 'hover:border-emerald-500 hover:bg-emerald-50',
    checkboxChecked: 'bg-emerald-500 border-emerald-500',
    checkboxCheckedHover: 'hover:bg-emerald-600',
    loadingSpinner: 'text-emerald-500',
  },
  'modern-dark': {
    container: 'bg-gray-900 shadow-2xl overflow-hidden border-l-4 border-l-cyan-400',
    wrapper: 'overflow-hidden',
    headerBackground: 'bg-gradient-to-r from-black via-gray-900 to-black',
    headerText: 'text-white font-bold uppercase tracking-wider text-sm',
    headerTextColor: 'text-white',
    headerBorder: 'border-b-2 border-cyan-400',
    headerHover: 'hover:from-gray-900 hover:via-gray-800 hover:to-gray-900',
    rowBackground: 'bg-gray-900',
    rowBackgroundAlt: 'bg-gray-800',
    rowHover: 'hover:bg-cyan-950/50 hover:border-l-2 hover:border-l-cyan-400',
    rowSelected: 'bg-cyan-900/40 border-l-2 border-l-cyan-400',
    rowBorder: 'border-b border-gray-700',
    rowText: 'text-gray-200',
    cellPadding: 'px-6 py-4',
    cellBorder: 'border-r border-gray-700 last:border-r-0',
    loadingBackground: 'bg-gray-800',
    emptyBackground: 'bg-gray-800',
    tableBorder: '',
    borderRadius: '',
    shadow: 'shadow-2xl',
    paginationText: 'text-gray-300',
    filterText: 'text-cyan-400',
    emptyStateText: 'text-gray-400',
    loadingText: 'text-gray-300',
    infoText: 'text-gray-300',
    checkboxBackground: 'bg-gray-800 border-cyan-400',
    checkboxBorder: 'border-cyan-400',
    checkboxHover: 'hover:border-cyan-300 hover:bg-cyan-950/50',
    checkboxChecked: 'bg-cyan-500 border-cyan-400',
    checkboxCheckedHover: 'hover:bg-cyan-400',
    loadingSpinner: 'text-cyan-400',
  }
} as const
