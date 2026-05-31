import { computed, type Ref, unref } from 'vue'

import {
  DATATABLE_CONSTANTS,
  DEFAULT_THEMES,
  REGEX_PATTERNS,
  SIZE_CLASSES
} from '../constants/datatable.constants'

import type { Column, TableTheme } from '../types/datatable.types'

type ResolvedOptionsLike = {
  variant: keyof typeof DEFAULT_THEMES | string
  size: keyof typeof SIZE_CLASSES | string
  theme?: TableTheme
  columns: Column[]
  expandable?: boolean
  selectable?: boolean
}

export function useDataTableTheme(args: {
  resolvedOptions: Ref<ResolvedOptionsLike>
  actualMode: Ref<string>
  columnWidths: Record<string, string | number | undefined>
  sticky: Ref<boolean> | boolean
}) {
  const computedTheme = computed<Record<string, string | undefined>>(() => {
    const resolved = args.resolvedOptions.value
    const baseTheme = (DEFAULT_THEMES as Record<string, Record<string, string>>)[resolved.variant] ?? (DEFAULT_THEMES as Record<string, Record<string, string>>)['default'] ?? {} as Record<string, string>
    const sizeTheme = (SIZE_CLASSES as Record<string, Record<string, string>>)[resolved.size] ?? (SIZE_CLASSES as Record<string, Record<string, string>>)['md'] ?? {} as Record<string, string>

    const combineTextClasses = (sizeClass: string, colorClass: string) => {
      const sizeMatch = sizeClass.match(REGEX_PATTERNS.SIZE_CLASS)
      const actualSizeClass = sizeMatch ? sizeMatch[0] : 'text-sm'

      const colorParts = colorClass
        .split(' ')
        .filter(cls => cls.startsWith('text-') && !REGEX_PATTERNS.SIZE_CLASS.test(cls))
      const actualColorClass = colorParts[0] || 'text-gray-900'

      return `${actualSizeClass} ${actualColorClass}`
    }

    // Extract just the text-size class from the size theme
    const extractSizeClass = (cls: string): string => {
      const m = cls.match(REGEX_PATTERNS.SIZE_CLASS)
      return m ? m[0] : 'text-sm'
    }

    // Rebuild headerText: preserve ALL non-size classes from the base theme (uppercase, tracking, font-weight…)
    // but replace/inject the responsive size from the size theme.
    const buildHeaderText = (): string => {
      const sizeClass = extractSizeClass(sizeTheme.headerText ?? '')
      const baseHeaderText = baseTheme.headerText || ''
      const nonSizeClasses = baseHeaderText
        .split(' ')
        .filter(cls => cls && !REGEX_PATTERNS.SIZE_CLASS.test(cls))
        .join(' ')
      return nonSizeClasses
        ? `${sizeClass} ${nonSizeClasses}`
        : `${sizeClass} ${baseTheme.headerTextColor || 'text-gray-700'} font-semibold`
    }

    return {
      ...baseTheme,
      cellPadding: sizeTheme.cellPadding,
      headerText: buildHeaderText(),
      headerTextColor: baseTheme.headerTextColor || 'text-gray-700',
      rowText: combineTextClasses(sizeTheme.rowText ?? '', baseTheme.rowText || 'text-gray-900'),
      paginationText: combineTextClasses(sizeTheme.rowText ?? '', baseTheme.paginationText || 'text-gray-600'),
      filterText: combineTextClasses(sizeTheme.rowText ?? '', baseTheme.filterText || 'text-gray-500'),
      emptyStateText: combineTextClasses(sizeTheme.rowText ?? '', baseTheme.emptyStateText || 'text-gray-500'),
      loadingText: combineTextClasses(sizeTheme.rowText ?? '', baseTheme.loadingText || 'text-gray-600'),
      infoText: combineTextClasses(sizeTheme.rowText ?? '', baseTheme.infoText || 'text-gray-600'),
      ...(resolved.theme || {})
    }
  })

  const containerClasses = computed<string>(() => {
    const classes = [computedTheme.value.container]
    return classes.filter(Boolean).join(' ')
  })

  const tableScrollContainerClasses = computed<string>(() => {
    const classes = ['overflow-x-auto']

    if (args.actualMode.value === 'gridInfinite') {
      // overflow-anchor-none disables the browser's built-in scroll anchoring,
      // which would otherwise fight with our manual scrollTop compensation
      // when we prepend or prune rows during lazy load.
      classes.push('overflow-y-auto', 'max-h-[560px]', '[overflow-anchor:none]')
    }

    return classes.filter(Boolean).join(' ')
  })

  const tableClasses = computed<string>(() => {
    const classes = ['table-fixed', 'w-full']

    if (computedTheme.value.tableBorder) {
      classes.push(computedTheme.value.tableBorder)
    }

    return classes.filter(Boolean).join(' ')
  })

  const tableStyle = computed(() => {
    const resolved = args.resolvedOptions.value

    const getWidthCandidate = (col: Column): string | number | undefined => {
      const dynamicWidth = args.columnWidths[col.key]
      return dynamicWidth || col.width || col.minWidth
    }

    const columnsWithWidth = resolved.columns.filter(col => getWidthCandidate(col) !== undefined)
    const columnsWithoutWidth = resolved.columns.filter(col => getWidthCandidate(col) === undefined)

    if (columnsWithoutWidth.length === 0) {
      let totalWidth = 0

      if (resolved.expandable) {
        totalWidth += DATATABLE_CONSTANTS.SPECIAL_COLUMNS.EXPAND.WIDTH_PX
      }
      if (resolved.selectable) {
        totalWidth += DATATABLE_CONSTANTS.SPECIAL_COLUMNS.CHECKBOX.WIDTH_PX
      }

      for (const col of resolved.columns) {
        const widthToUse = getWidthCandidate(col)

        if (typeof widthToUse === 'number') {
          totalWidth += widthToUse
        } else if (typeof widthToUse === 'string' && widthToUse.includes('px')) {
          totalWidth += parseInt(widthToUse.replace('px', '')) || DATATABLE_CONSTANTS.DEFAULTS.COLUMN_WIDTH
        } else {
          totalWidth += DATATABLE_CONSTANTS.DEFAULTS.COLUMN_WIDTH
        }
      }

      return { minWidth: `${Math.max(totalWidth, 600)}px` }
    }

    return { width: '100%' }
  })

  const expandColumnStyle = computed<string>(() => {
    const width = DATATABLE_CONSTANTS.SPECIAL_COLUMNS.EXPAND.WIDTH
    return `width: ${width} !important; min-width: ${width} !important; max-width: ${width} !important; text-align: center;`
  })

  const expandColumnClasses = computed<string>(() => DATATABLE_CONSTANTS.SPECIAL_COLUMNS.EXPAND.CLASSES)

  const checkboxColumnStyle = computed<string>(() => {
    const width = DATATABLE_CONSTANTS.SPECIAL_COLUMNS.CHECKBOX.WIDTH
    return `width: ${width} !important; min-width: ${width} !important; max-width: ${width} !important; text-align: center;`
  })

  const checkboxColumnClasses = computed<string>(() => DATATABLE_CONSTANTS.SPECIAL_COLUMNS.CHECKBOX.CLASSES)

  const headerClasses = computed<string>(() => {
    const classes = [
      computedTheme.value.headerBackground,
      computedTheme.value.headerText,
      computedTheme.value.headerBorder
    ]

    if (unref(args.sticky)) {
      classes.push('sticky top-0 z-10')
    }

    return classes.filter(Boolean).join(' ')
  })

  return {
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
  }
}
