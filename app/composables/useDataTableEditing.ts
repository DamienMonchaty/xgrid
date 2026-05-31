import type { Column, TableRow, ValidationResult, RowId } from '../types/datatable.types'

type CellKey = string

type EditingCellData = {
    row: TableRow
    column: string
    value: unknown
}

export function useDataTableEditing(opts: {
    orderedColumns: Ref<Column[]>
    getRowId: (row: TableRow) => RowId
    getColumnValue: (row: TableRow, columnKey: string) => unknown
    validateColumnValue: (value: unknown, column: Column) => ValidationResult | null

    // Core editing hooks (emit/call handlers)
    startEdit: (row: TableRow, columnKey: string) => boolean
    cancelEdit: (row: TableRow, columnKey: string) => void
    saveEdit: (row: TableRow, columnKey: string, newValue: unknown) => boolean
}) {
    const editingCells = ref<Map<CellKey, EditingCellData>>(new Map())
    const cellValidations = ref<Map<CellKey, ValidationResult>>(new Map())

    function getCellKey(row: TableRow, columnKey: string): CellKey {
        const rowId = opts.getRowId(row)
        return `${rowId}_${columnKey}`
    }

    function isCellEditing(row: TableRow, columnKey: string): boolean {
        const cellKey = getCellKey(row, columnKey)
        return editingCells.value.has(cellKey)
    }

    function getEditingValue(row: TableRow, columnKey: string): unknown {
        const cellKey = getCellKey(row, columnKey)
        const editingData = editingCells.value.get(cellKey)
        return editingData?.value ?? opts.getColumnValue(row, columnKey)
    }

    function getCellValidation(row: TableRow, columnKey: string): ValidationResult | null {
        const cellKey = getCellKey(row, columnKey)
        return cellValidations.value.get(cellKey) || null
    }

    function validateCellValue(row: TableRow, columnKey: string, value: unknown) {
        const column = opts.orderedColumns.value.find(col => col.key === columnKey)
        if (!column) return

        const cellKey = getCellKey(row, columnKey)
        const validationResult = opts.validateColumnValue(value, column)

        if (validationResult) {
            cellValidations.value.set(cellKey, validationResult)
        } else {
            cellValidations.value.delete(cellKey)
        }
    }

    function updateEditingValue(row: TableRow, columnKey: string, value: unknown) {
        const cellKey = getCellKey(row, columnKey)
        const currentData = editingCells.value.get(cellKey)
        if (currentData) {
            currentData.value = value
            editingCells.value.set(cellKey, currentData)
            validateCellValue(row, columnKey, value)
        }
    }

    function getValidationIcon(row: TableRow, columnKey: string): boolean {
        return getCellValidation(row, columnKey) !== null
    }

    function getValidationIconColor(row: TableRow, columnKey: string): string {
        const validation = getCellValidation(row, columnKey)
        if (!validation) return ''

        switch (validation.type) {
            case 'success':
                return 'text-green-500'
            case 'error':
                return 'text-red-500'
            case 'warning':
                return 'text-yellow-500'
            default:
                return ''
        }
    }

    function getInputValidationUi(row: TableRow, columnKey: string): Record<string, string> {
        const validation = getCellValidation(row, columnKey)
        if (!validation) return {}

        switch (validation.type) {
            case 'success':
                return {
                    input: 'border-green-500 focus:border-green-500 focus:ring-green-500',
                    select: 'border-green-500 focus:border-green-500 focus:ring-green-500'
                }
            case 'error':
                return {
                    input: 'border-red-500 focus:border-red-500 focus:ring-red-500',
                    select: 'border-red-500 focus:border-red-500 focus:ring-red-500'
                }
            case 'warning':
                return {
                    input: 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500',
                    select: 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500'
                }
            default:
                return {}
        }
    }

    function startCellEdit(row: TableRow, columnKey: string) {
        const column = opts.orderedColumns.value.find(col => col.key === columnKey)
        if (!column?.editable) {
            console.warn('startCellEdit: Column is not editable:', columnKey)
            return false
        }

        const cellKey = getCellKey(row, columnKey)
        const currentValue = opts.getColumnValue(row, columnKey)

        editingCells.value.set(cellKey, { row, column: columnKey, value: currentValue })
        cellValidations.value.delete(cellKey)

        return opts.startEdit(row, columnKey)
    }

    function cancelCellEdit(row: TableRow, columnKey: string) {
        const cellKey = getCellKey(row, columnKey)
        editingCells.value.delete(cellKey)
        cellValidations.value.delete(cellKey)
        opts.cancelEdit(row, columnKey)
    }

    function saveCellEdit(row: TableRow, columnKey: string) {
        const cellKey = getCellKey(row, columnKey)
        const editingData = editingCells.value.get(cellKey)

        if (!editingData) {
            console.warn('saveCellEdit: No editing data found for cell:', cellKey)
            return false
        }

        const newValue = editingData.value
        const column = opts.orderedColumns.value.find(col => col.key === columnKey)

        if (column?.validation?.enabled) {
            const validationResult = opts.validateColumnValue(newValue, column)

            if (validationResult) {
                cellValidations.value.set(cellKey, validationResult)

                if (!validationResult.isValid) {
                    console.warn('saveCellEdit: Validation failed:', validationResult.message)
                    return false
                }
            } else {
                cellValidations.value.delete(cellKey)
            }
        }

        editingCells.value.delete(cellKey)
        cellValidations.value.delete(cellKey)

        return opts.saveEdit(row, columnKey, newValue)
    }

    function handleEditKeydown(event: KeyboardEvent, row: TableRow, columnKey: string) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            saveCellEdit(row, columnKey)
        } else if (event.key === 'Escape') {
            event.preventDefault()
            cancelCellEdit(row, columnKey)
        }
    }

    return {
        // State
        editingCells,
        cellValidations,

        // Helpers
        getCellKey,
        isCellEditing,
        getEditingValue,
        updateEditingValue,

        // Validation
        validateCellValue,
        getCellValidation,
        getValidationIcon,
        getValidationIconColor,
        getInputValidationUi,

        // Editing
        startCellEdit,
        cancelCellEdit,
        saveCellEdit,
        handleEditKeydown
    }
}
