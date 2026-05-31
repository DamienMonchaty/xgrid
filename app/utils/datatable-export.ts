/**
 * DataTable CSV export utility
 * Pure functions — no Vue/NuxtUI dependencies
 */

import type { Column, TableRow } from '../types/datatable.types'

/**
 * Escape a value for CSV output.
 * Wraps in double-quotes if the value contains comma, newline, or double-quote.
 */
function escapeCsvValue(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value)
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

/**
 * Convert an array of rows to a CSV string using the provided columns.
 *
 * @param rows     - Data rows to export
 * @param columns  - Column definitions (label used as header, key used to read row values)
 * @param options  - Optional settings
 */
export function rowsToCsv(
  rows: TableRow[],
  columns: Column[],
  options: {
    /** BOM prefix so Excel opens UTF-8 files correctly (default: true) */
    bom?: boolean
    /** Field separator (default: ',') */
    separator?: string
  } = {}
): string {
  const { bom = true, separator = ',' } = options

  const header = columns.map(col => escapeCsvValue(col.label)).join(separator)
  const body = rows.map(row =>
    columns.map(col => escapeCsvValue(row[col.key])).join(separator)
  )

  const csv = [header, ...body].join('\r\n')
  return bom ? '\uFEFF' + csv : csv
}

/**
 * Trigger a browser download for a CSV string.
 *
 * @param csv       - The CSV content to download
 * @param filename  - Suggested filename (should end with .csv)
 */
export function downloadCsv(csv: string, filename = 'export.csv'): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * One-shot helper: build CSV from rows + columns and trigger download.
 */
export function exportTableToCsv(
  rows: TableRow[],
  columns: Column[],
  filename = 'export.csv',
  options?: Parameters<typeof rowsToCsv>[2]
): void {
  const csv = rowsToCsv(rows, columns, options)
  downloadCsv(csv, filename)
}
