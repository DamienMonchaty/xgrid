<template>
    <thead :class="headerClasses">
        <tr class="group" role="row">
            <th v-if="selectable"
                :class="[getHeaderCellClasses('checkbox'), checkboxColumnClasses]"
                :style="checkboxColumnStyle" scope="col">
                <div class="flex items-center justify-center w-full">
                    <input
                        type="checkbox"
                        :checked="allCurrentSelected"
                        :aria-label="TEXT_LABELS.SELECT_ALL"
                        aria-describedby="select-all-description"
                        class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                        @change="(e) => toggleSelectAll((e.target as HTMLInputElement).checked)"
                    />
                    <span id="select-all-description" class="sr-only">
                        {{ allCurrentSelected ? 'Unselect all rows' : 'Select all rows' }}
                    </span>
                </div>
            </th>

            <th v-if="expandable"
                :class="[getHeaderCellClasses('expand'), expandColumnClasses]"
                :style="expandColumnStyle" scope="col">
                <span class="sr-only">Expand row</span>
            </th>

            <th v-for="column in orderedColumns" :key="column.key"
                :aria-sort="column.sortable ? (sortKey === column.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined"
                :class="getHeaderCellClasses(column.key, column)" :style="getColumnStyles(column)"
                :draggable="column.draggable" @dragstart="onColumnDragStart($event, column.key)"
                @dragover.prevent @drop="onColumnDrop($event, column.key)" scope="col">
                <!-- Sortable column header -->
                <div v-if="column.sortable" :class="getSortableHeaderClasses(column)">
                    <button type="button"
                        :class="`group/sort inline-flex items-center gap-1 transition-colors ${computedTheme.headerHover} ${computedTheme.headerText}`"
                        :aria-label="`${TEXT_LABELS.SORT_COLUMN} ${column.label}`"
                        :aria-pressed="sortKey === column.key"
                        :aria-describedby="`sort-${column.key}-description`"
                        @click="toggleSort(column.key)">
                        {{ column.label }}
                        <!-- sort icon: arrows-up-down / chevron-up / chevron-down -->
                        <template v-if="sortKey === column.key">
                            <svg v-if="sortDir === 'asc'" :class="getSortIconClass(column.key)" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832l-3.71 3.938a.75.75 0 01-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clip-rule="evenodd"/></svg>
                            <svg v-else :class="getSortIconClass(column.key)" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
                        </template>
                        <svg v-else :class="getSortIconClass(column.key)" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.24a.75.75 0 011.06.02L10 15.148l2.7-2.888a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
                    </button>
                    <span :id="`sort-${column.key}-description`" class="sr-only">
                        {{ sortKey === column.key ?
                            `Currently sorted by ${column.label} in ${sortDir === 'asc' ?
                                TEXT_LABELS.SORT_ASCENDING : TEXT_LABELS.SORT_DESCENDING} order` :
                            `Click to sort by ${column.label}`
                        }}
                    </span>

                    <!-- Column filter - positioned differently based on alignment -->
                    <div v-if="column.filterable"
                        :class="column.align === 'center'
                            ? 'group/filter absolute right-0 top-1/2 transform -translate-y-1/2'
                            : 'group/filter flex-shrink-0'
                            ">
                        <div class="relative" @click.stop>
                            <button type="button" @click="toggleHeaderMenu(column.key)">
                                <svg :class="getFilterIconClass(column.key)" viewBox="0 0 20 20" fill="currentColor"><path d="M17 3a1 1 0 00-1-1H4a1 1 0 00-.894 1.447l4.5 9A1 1 0 008.5 13h3a1 1 0 00.894-.553l4.5-9A1 1 0 0017 3zM8.5 15a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm3 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/></svg>
                            </button>
                            <div v-if="openMenuKey === column.key" :class="[
                                'absolute top-full mt-1 z-[70] bg-white border border-gray-200 rounded-lg shadow-lg',
                                column.align === 'right' ? 'right-0' : 'left-0'
                            ]">
                                <DataTableColumnMenuContent v-bind="getColumnMenuBindings(column, 'sortable')">
                                    <template v-for="(_, name) in $slots" #[name]="slotProps">
                                        <slot :name="name" v-bind="slotProps" />
                                    </template>
                                </DataTableColumnMenuContent>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Non-sortable column header -->
                <div v-else
                    :class="`${getNonSortableHeaderClasses(column)} ${computedTheme.headerText} relative`">
                    <span>{{ column.label }}</span>

                    <!-- Column filter for non-sortable columns -->
                    <div v-if="column.filterable"
                        :class="column.align === 'center'
                            ? 'group/filter absolute right-0 top-1/2 transform -translate-y-1/2'
                            : 'group/filter flex-shrink-0 ml-2'
                            ">
                        <div class="relative" @click.stop>
                            <button type="button" @click="toggleHeaderMenu(column.key)">
                                <svg :class="getFilterIconClass(column.key)" viewBox="0 0 20 20" fill="currentColor"><path d="M17 3a1 1 0 00-1-1H4a1 1 0 00-.894 1.447l4.5 9A1 1 0 008.5 13h3a1 1 0 00.894-.553l4.5-9A1 1 0 0017 3zM8.5 15a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm3 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/></svg>
                            </button>
                            <div v-if="openMenuKey === column.key" :class="[
                                'absolute top-full mt-1 z-[70] bg-white border border-gray-200 rounded-lg shadow-lg',
                                column.align === 'right' ? 'right-0' : 'left-0'
                            ]">
                                <DataTableColumnMenuContent v-bind="getColumnMenuBindings(column, 'plain')">
                                    <template v-for="(_, name) in $slots" #[name]="slotProps">
                                        <slot :name="name" v-bind="slotProps" />
                                    </template>
                                </DataTableColumnMenuContent>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resize handle -->
                <div v-if="column.resizable"
                    class="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize bg-transparent hover:bg-blue-400 opacity-0 group-hover/column:opacity-100 transition-opacity z-20"
                    @mousedown.stop.prevent="startResize($event, column.key)"
                    title="Drag to resize column"></div>
            </th>
        </tr>
    </thead>
</template>

<script setup lang="ts">
import { useEventListener } from '@vueuse/core';

import { TEXT_LABELS } from '../constants/datatable.constants';
import type { CSSProperties } from 'vue';
import type { Column, TableTheme } from '../types/datatable.types';
import type { ColumnMenuBindings } from '../composables/useDataTableColumnMenu';

type ColumnMenuVariant = 'sortable' | 'plain'

const props = defineProps<{
    headerClasses: string

    selectable: boolean
    expandable: boolean

    checkboxColumnClasses: string
    checkboxColumnStyle: string | CSSProperties
    expandColumnClasses: string
    expandColumnStyle: string | CSSProperties

    checkboxUpdateKey: string | number
    allCurrentSelected: boolean

    orderedColumns: Column[]

    computedTheme: TableTheme

    sortKey: string
    sortDir: 'asc' | 'desc'

    getHeaderCellClasses: (key: string, column?: Column) => string
    getColumnStyles: (column: Column) => string | CSSProperties
    getSortableHeaderClasses: (column: Column) => string
    getNonSortableHeaderClasses: (column: Column) => string

    getCheckboxClasses: () => Record<string, string>

    toggleSelectAll: (checked: boolean) => void

    toggleSort: (key: string) => void
    sortIcon: (key: string) => string
    getSortIconClass: (columnKey: string) => string

    getFilterIconClass: (columnKey: string) => string
    ensureHeaderMenuTab: (columnKey: string) => void

    getColumnMenuBindings: (column: Column, variant: ColumnMenuVariant) => ColumnMenuBindings

    startResize: (e: MouseEvent, column: string) => void

    onColumnDragStart: (e: DragEvent, column: string) => void
    onColumnDrop: (e: DragEvent, column: string) => void
}>()

const openMenuKey = ref<string | null>(null)

function toggleHeaderMenu(key: string) {
    if (openMenuKey.value === key) {
        openMenuKey.value = null
    } else {
        props.ensureHeaderMenuTab(key)
        openMenuKey.value = key
    }
}

useEventListener('click', () => { openMenuKey.value = null })
</script>
