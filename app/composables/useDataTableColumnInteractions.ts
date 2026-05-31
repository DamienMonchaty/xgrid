import type { Column } from '../types/datatable.types'
import { DATATABLE_CONSTANTS } from '../constants/datatable.constants'

export function useDataTableColumnInteractions(opts: {
    resolvedOptions: Ref<{ columns: Column[] }>
    columnWidths: Record<string, unknown>
    columnOrder: Ref<string[]>
    draggedColumn: Ref<string>
}) {
    // Column resizing
    let isResizing = false
    let resizingColumn = ''
    let startX = 0
    let startWidth = 0

    function onResize(e: MouseEvent) {
        if (!isResizing || !resizingColumn) return

        const diff = e.clientX - startX
        let newWidth = startWidth + diff

        console.log('🔧 OnResize - diff:', diff, 'startWidth:', startWidth, 'newWidth:', newWidth)

        const columnConfig = opts.resolvedOptions.value.columns.find(col => col.key === resizingColumn)

        let minWidth = 80
        if (columnConfig?.minWidth) {
            minWidth = typeof columnConfig.minWidth === 'number'
                ? columnConfig.minWidth
                : parseInt(String(columnConfig.minWidth).replace('px', '')) || 80
        }

        let maxWidth = Infinity
        if (columnConfig?.maxWidth) {
            maxWidth = typeof columnConfig.maxWidth === 'number'
                ? columnConfig.maxWidth
                : parseInt(String(columnConfig.maxWidth).replace('px', '')) || Infinity
        }

        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
        newWidth = Math.round(Math.max(1, newWidth))

        console.log('🔧 Setting columnWidth[' + resizingColumn + '] to:', newWidth)
        opts.columnWidths[resizingColumn] = newWidth

        e.preventDefault()
    }

    function stopResize() {
        isResizing = false
        resizingColumn = ''
        document.removeEventListener('mousemove', onResize)
        document.removeEventListener('mouseup', stopResize)

        document.body.style.cursor = ''
        document.body.style.userSelect = ''
    }

    function startResize(e: MouseEvent, column: string) {
        console.log('🔧 StartResize called for column:', column)

        isResizing = true
        resizingColumn = column
        startX = e.clientX

        const columnConfig = opts.resolvedOptions.value.columns.find(col => col.key === column)
        let currentWidth = opts.columnWidths[column]

        console.log('🔧 Current width:', currentWidth, 'Column config:', columnConfig?.width)

        if (!currentWidth) {
            const headerElement = e.target as HTMLElement
            const thElement = headerElement.closest('th')

            if (thElement) {
                const computedWidth = thElement.getBoundingClientRect().width
                currentWidth = Math.round(computedWidth)
                console.log('🔧 Width measured from DOM:', currentWidth)
            } else {
                if (columnConfig?.width && typeof columnConfig.width === 'number') {
                    currentWidth = columnConfig.width
                } else if (columnConfig?.width && typeof columnConfig.width === 'string') {
                    currentWidth = parseInt(columnConfig.width.replace('px', '')) || DATATABLE_CONSTANTS.DEFAULTS.COLUMN_WIDTH
                } else {
                    currentWidth = DATATABLE_CONSTANTS.DEFAULTS.COLUMN_WIDTH
                }
                console.log('🔧 Fallback width used:', currentWidth)
            }
        }

        startWidth = typeof currentWidth === 'number'
            ? currentWidth
            : parseInt(String(currentWidth).replace('px', '')) || DATATABLE_CONSTANTS.DEFAULTS.COLUMN_WIDTH

        console.log('🔧 Final startWidth:', startWidth)

        document.addEventListener('mousemove', onResize)
        document.addEventListener('mouseup', stopResize)

        e.preventDefault()
        e.stopPropagation()

        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
    }

    function cleanupResizeListeners() {
        if (!isResizing) return
        stopResize()
    }

    // Column drag and drop
    function setDrag(e: DragEvent, column: string) {
        opts.draggedColumn.value = column
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/column', column)
        }
    }

    function reorderColumns(targetColumn: string) {
        if (opts.draggedColumn.value && opts.draggedColumn.value !== targetColumn) {
            const currentOrder = [...opts.columnOrder.value]
            const draggedIndex = currentOrder.indexOf(opts.draggedColumn.value)
            const targetIndex = currentOrder.indexOf(targetColumn)

            currentOrder.splice(draggedIndex, 1)
            currentOrder.splice(targetIndex, 0, opts.draggedColumn.value)

            opts.columnOrder.value = currentOrder
        }

        opts.draggedColumn.value = ''
    }

    function onColumnDragStart(e: DragEvent, column: string) {
        setDrag(e, column)
    }

    function onColumnDrop(e: DragEvent, targetColumn: string) {
        e.preventDefault()
        reorderColumns(targetColumn)
    }

    function onColumnMenuDragStart(e: DragEvent, column: string) {
        setDrag(e, column)
    }

    function onColumnMenuDrop(e: DragEvent, targetColumn: string) {
        e.preventDefault()
        reorderColumns(targetColumn)
    }

    return {
        startResize,
        onColumnDragStart,
        onColumnDrop,
        onColumnMenuDragStart,
        onColumnMenuDrop,
        cleanupResizeListeners
    }
}
