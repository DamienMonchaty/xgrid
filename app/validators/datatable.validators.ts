/**
 * Validators for DataTable component props
 * Ensures consistency and validity of input data
 */

import type { TableRow, ServerDatasourceFn } from '~/types/datatable.types'

export interface DataTableProps {
  datasource: TableRow[] | string | ServerDatasourceFn
  mode?: 'loadMore' | 'gridInfinite'
  gridInfiniteCachePages?: number
  columns: Column[]
  expandable?: boolean
  expanded?: Array<string | number>
  rowDetailUrl?: string | ((row: TableRow) => string)
  rowDetailQuery?: Record<string, unknown> | ((row: TableRow) => Record<string, unknown>)
  rowDetailCache?: boolean
  rowDetailAutoLoad?: boolean
  title?: string
  selectable?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  paginated?: boolean
  showPagination?: boolean
  pageSize?: number
  loading?: boolean
  debug?: boolean
  bulkActions?: BulkAction[]
  rowIdKey?: string
  useModularHeader?: boolean
  useModularToolbar?: boolean
  showExport?: boolean
  showRefresh?: boolean
  theme?: Record<string, string | undefined>
  variant?: 'default' | 'default-dark' | 'elegant' | 'elegant-dark' | 'modern' | 'modern-dark'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  stickyHeader?: boolean
  compactMode?: boolean
  wrapText?: boolean
  selectionColor?: string
  selectionColorDark?: string
  selectionHoverColor?: string
  selectionHoverColorDark?: string
}

export interface ValidationError {
  field: string
  message: string
  type: 'error' | 'warning'
}

/**
 * Validates DataTable props and returns any errors
 * @param props - Props to validate
 * @returns Array of validation errors
 */
export function validateDataTableProps(props: DataTableProps): ValidationError[] {
  const errors: ValidationError[] = []
  
  // Validate pageSize
  if (props.pageSize !== undefined && props.pageSize <= 0) {
    errors.push({
      field: 'pageSize',
      message: 'pageSize must be greater than 0',
      type: 'error'
    })
  }
  
  if (props.pageSize !== undefined && props.pageSize > 1000) {
    errors.push({
      field: 'pageSize',
      message: 'pageSize is very high (max recommended: 1000), this may impact performance',
      type: 'warning'
    })
  }
  
  // Validate columns
  if (!props.columns || props.columns.length === 0) {
    errors.push({
      field: 'columns',
      message: 'At least one column must be defined',
      type: 'error'
    })
  } else {
    // Validate each column individually
    props.columns.forEach((col, index) => {
      if (!col.key) {
        errors.push({
          field: 'columns',
          message: `Column at index ${index} must have a 'key' property`,
          type: 'error'
        })
      }
      
      if (!col.label) {
        errors.push({
          field: 'columns',
          message: `Column ${index} (${col.key || 'no key'}) must have a 'label' property`,
          type: 'error'
        })
      }
      
      // Validate column width
      if (col.width !== undefined) {
        const width = typeof col.width === 'number' ? col.width : parseInt(String(col.width))
        if (isNaN(width) || width <= 0) {
          errors.push({
            field: 'columns',
            message: `Column '${col.key}' width must be a positive number`,
            type: 'error'
          })
        }
      }
      
      // Validate filter types
      if (col.filterable && col.filterType) {
        const validFilterTypes = ['text', 'select', 'dateRange', 'numberRange', 'boolean', 'custom']
        if (!validFilterTypes.includes(col.filterType)) {
          errors.push({
            field: 'columns',
            message: `Invalid filterType for column '${col.key}': ${col.filterType}. Valid types: ${validFilterTypes.join(', ')}`,
            type: 'error'
          })
        }
        
        // Warn if custom filter has no filterFn (client mode)
        if (col.filterType === 'custom' && !col.filterFn) {
          errors.push({
            field: 'columns',
            message: `Column '${col.key}' uses filterType 'custom' without filterFn — rows will not be filtered in client mode. Add filterFn: (row, value) => boolean`,
            type: 'warning'
          })
        }

        // Validate options for select filters
        if (col.filterType === 'select' && (!col.filterOptions || col.filterOptions.length === 0)) {
          errors.push({
            field: 'columns',
            message: `Column '${col.key}' with filterType 'select' must have filterOptions defined`,
            type: 'error'
          })
        }
      }
      
      // Validate alignment
      if (col.align && !['left', 'center', 'right'].includes(col.align)) {
        errors.push({
          field: 'columns',
          message: `Invalid alignment for column '${col.key}': ${col.align}. Valid values: left, center, right`,
          type: 'error'
        })
      }
    })
    
    // Check for duplicate column keys
    const columnKeys = props.columns.map(col => col.key).filter(Boolean)
    const duplicateKeys = columnKeys.filter((key, index) => columnKeys.indexOf(key) !== index)
    if (duplicateKeys.length > 0) {
      errors.push({
        field: 'columns',
        message: `Duplicate column keys detected: ${[...new Set(duplicateKeys)].join(', ')}`,
        type: 'error'
      })
    }
  }
  
  // Validate datasource
  if (!props.datasource) {
    errors.push({
      field: 'datasource',
      message: 'datasource is required',
      type: 'error'
    })
  } else if (typeof props.datasource === 'string' && props.datasource.trim() === '') {
    errors.push({
      field: 'datasource',
      message: 'datasource URL cannot be empty',
      type: 'error'
    })
  } else if (typeof props.datasource === 'string' && !isValidUrl(props.datasource)) {
    errors.push({
      field: 'datasource',
      message: 'datasource must be a valid URL for server mode',
      type: 'warning'
    })
  }
  
  // Validate mode vs pagination
  if (props.mode && props.paginated) {
    errors.push({
      field: 'mode',
      message: 'Do not use "mode" and "paginated" together. Use "paginated: true" for classic pagination or "mode" for loadMore/gridInfinite',
      type: 'warning'
    })
  }
  
  // Validate bulk actions
  if (props.bulkActions && props.bulkActions.length > 0 && !props.selectable) {
    errors.push({
      field: 'bulkActions',
      message: 'Bulk actions require "selectable" to be enabled',
      type: 'warning'
    })
  }
  
  // Validate rowIdKey
  if (props.selectable && typeof props.datasource !== 'string' && Array.isArray(props.datasource)) {
    const sampleRow = props.datasource[0]
    if (sampleRow && props.rowIdKey && !(props.rowIdKey in sampleRow)) {
      errors.push({
        field: 'rowIdKey',
        message: `Property '${props.rowIdKey}' does not exist in the data. Make sure all rows have this property.`,
        type: 'warning'
      })
    }
  }
  
  // Validate variant
  const validVariants = ['default', 'default-dark', 'elegant', 'elegant-dark', 'modern', 'modern-dark']
  if (props.variant && !validVariants.includes(props.variant)) {
    errors.push({
      field: 'variant',
      message: `Invalid variant: ${props.variant}. Valid variants: ${validVariants.join(', ')}`,
      type: 'error'
    })
  }
  
  // Validate size
  const validSizes = ['xs', 'sm', 'md', 'lg']
  if (props.size && !validSizes.includes(props.size)) {
    errors.push({
      field: 'size',
      message: `Invalid size: ${props.size}. Valid sizes: ${validSizes.join(', ')}`,
      type: 'error'
    })
  }
  
  return errors
}

/**
 * Checks whether a string is a valid URL
 * @param url - URL to validate
 * @returns true if the URL is valid
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    // If not an absolute URL, check if it's a valid relative path
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../')
  }
}

/**
 * Prints validation errors to the console (development mode only)
 * @param errors - Errors to display
 * @param componentName - Component name for logging
 */
export function logValidationErrors(errors: ValidationError[], componentName = 'DataTable'): void {
  if (process.env.NODE_ENV !== 'development' || errors.length === 0) {
    return
  }
  
  const errorCount = errors.filter(e => e.type === 'error').length
  const warningCount = errors.filter(e => e.type === 'warning').length
  
  if (errorCount > 0) {
    console.group(`🚨 ${componentName} - Validation errors (${errorCount})`)
    errors.filter(e => e.type === 'error').forEach(error => {
      console.error(`[${error.field}] ${error.message}`)
    })
    console.groupEnd()
  }
  
  if (warningCount > 0) {
    console.group(`⚠️ ${componentName} - Warnings (${warningCount})`)
    errors.filter(e => e.type === 'warning').forEach(warning => {
      console.warn(`[${warning.field}] ${warning.message}`)
    })
    console.groupEnd()
  }
}

/**
 * Validates and logs DataTable props
 * @param props - Props to validate
 * @returns true if no critical errors were found
 */
export function validateAndLogDataTableProps(props: DataTableProps): boolean {
  const errors = validateDataTableProps(props)
  logValidationErrors(errors)
  
  // Retourne false s'il y a des erreurs critiques
  return !errors.some(error => error.type === 'error')
}
