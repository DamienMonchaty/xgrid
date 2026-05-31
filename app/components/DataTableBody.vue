<template>
  <tbody
    :ref="setBodyRef"
    :class="[
      'relative',
      { 'divide-y': !isInitialLoading || preservedRows.length === 0 },
      computedTheme.rowBorder
    ]"
    :style="tableBodyStyle"
  >
    <!-- Loading overlay pour toute la grille -->
    <div
      v-if="shouldShowLoadingOverlay"
      class="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-gray-900/75 z-20"
    >
      <div class="flex flex-col items-center justify-center">
        <svg class="animate-spin h-8 w-8 text-primary-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p :class="computedTheme.loadingText || 'text-gray-600'">{{ TEXT_LABELS.LOADING }}</p>
      </div>
    </div>

    <!-- Initial loading state -->
    <template v-if="isInitialLoading">
      <!-- Show existing rows during refresh (without individual overlays) -->
      <template v-if="preservedRows.length > 0">
        <tr
          v-for="(row, index) in preservedRows"
          :key="`preserved-${getRowId(row)}`"
          :class="[getRowClasses(index, getRowId(row)), 'opacity-60']"
          role="row"
        >
          <!-- Preserved row content (dimmed) -->
          <td
            v-if="resolvedOptions.selectable"
            :class="[getBodyCellClasses('checkbox'), checkboxColumnClasses]"
            :style="checkboxColumnStyle"
            role="gridcell"
          >
            <div class="flex items-center justify-center w-full">
              <input type="checkbox" :checked="false" disabled
                class="h-4 w-4 rounded border-gray-300 text-primary-600 opacity-50 cursor-not-allowed"
              />
            </div>
          </td>
          <td
            v-if="resolvedOptions.expandable"
            :class="[getBodyCellClasses('expand'), expandColumnClasses]"
            :style="expandColumnStyle"
            role="gridcell"
          >
            <!-- Empty in preserved state -->
          </td>
          <td
            v-for="column in orderedColumns"
            :key="column.key"
            :class="getBodyCellClasses(column.key, column)"
            :style="getColumnStyles(column)"
            role="gridcell"
          >
            <span :class="`${computedTheme.rowText}`">
              {{ getColumnValue(row, column.key) }}
            </span>
          </td>
        </tr>
      </template>

      <!-- Skeleton mode (when no preserved rows) -->
      <template v-else-if="skeleton">
        <DataTableSkeletonRows
          :count="skeletonRowCount"
          key-prefix="skeleton"
          :row-index-offset="0"
          :selectable="!!resolvedOptions.selectable"
          :expandable="!!resolvedOptions.expandable"
          :ordered-columns="orderedColumns"
          :checkbox-column-classes="checkboxColumnClasses"
          :checkbox-column-style="checkboxColumnStyle"
          :expand-column-classes="expandColumnClasses"
          :expand-column-style="expandColumnStyle"
          :get-row-classes="getRowClasses"
          :get-body-cell-classes="getBodyCellClasses"
          :get-column-styles="getColumnStyles"
          :get-skeleton-width="getSkeletonWidth"
        />
      </template>

      <!-- Loading simple (par défaut) -->
      <template v-else>
        <tr>
          <td :colspan="colCount" :class="getBodyCellClasses('loading')" class="text-center py-12">
            <div class="flex flex-col items-center justify-center">
              <svg class="animate-spin h-8 w-8 text-primary-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p :class="computedTheme.loadingText || 'text-gray-600'">{{ TEXT_LABELS.LOADING }}</p>
            </div>
          </td>
        </tr>
      </template>
    </template>

    <!-- Data rows -->
    <template v-else>
      <!-- GridInfinite: loading previous page (top skeleton) -->
      <template
        v-if="
          loadingState === LoadingState.LOADING_MORE &&
          actualMode === 'gridInfinite' &&
          gridInfiniteLoadingDirection === 'up'
        "
      >
        <DataTableSkeletonRows
          :count="loadMoreSkeletonCount"
          key-prefix="loading-more-up"
          :row-index-offset="0"
          :selectable="!!resolvedOptions.selectable"
          :expandable="!!resolvedOptions.expandable"
          :ordered-columns="orderedColumns"
          :checkbox-column-classes="checkboxColumnClasses"
          :checkbox-column-style="checkboxColumnStyle"
          :expand-column-classes="expandColumnClasses"
          :expand-column-style="expandColumnStyle"
          :get-row-classes="getRowClasses"
          :get-body-cell-classes="getBodyCellClasses"
          :get-column-styles="getColumnStyles"
          :get-skeleton-width="getSkeletonWidth"
          :pulse="true"
        />
      </template>

      <template v-for="(row, index) in pagedRows" :key="getRowId(row)">
        <tr
          :class="getRowClasses(index, getRowId(row))"
          role="row"
          :aria-rowindex="index + 1"
          :aria-selected="selectedIds.has(getRowId(row))"
          @click="handleRowClick(row, $event)"
        >
          <td
            v-if="resolvedOptions.selectable"
            :class="[getBodyCellClasses('checkbox'), checkboxColumnClasses]"
            :style="checkboxColumnStyle"
            role="gridcell"
          >
            <div class="flex items-center justify-center w-full">
              <input
                type="checkbox"
                :checked="selectedIds.has(getRowId(row))"
                :aria-label="`${TEXT_LABELS.SELECT_ROW} ${index + 1}`"
                :aria-describedby="`row-${getRowId(row)}-description`"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                @change="(e: Event) => toggleSelect(getRowId(row), (e.target as HTMLInputElement).checked)"
                @click.stop
              />
              <span :id="`row-${getRowId(row)}-description`" class="sr-only">
                {{ selectedIds.has(getRowId(row)) ? TEXT_LABELS.ROW_SELECTED : TEXT_LABELS.ROW_NOT_SELECTED }}
              </span>
            </div>
          </td>

          <td
            v-if="resolvedOptions.expandable"
            :class="[getBodyCellClasses('expand'), expandColumnClasses]"
            :style="expandColumnStyle"
            role="gridcell"
          >
            <div class="flex items-center justify-center w-full">
              <button
                v-if="canRenderRowDetail"
                type="button"
                class="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                :aria-label="isRowExpanded(getRowId(row)) ? 'Collapse row details' : 'Expand row details'"
                :aria-expanded="isRowExpanded(getRowId(row))"
                :aria-controls="`row-detail-${getRowId(row)}`"
                @click.stop="toggleRowExpanded(row)"
              >
                <svg
                  :class="['w-4 h-4 transition-transform duration-150', isRowExpanded(getRowId(row)) ? 'rotate-90' : '']"
                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                >
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </td>

          <td
            v-for="column in orderedColumns"
            :key="column.key"
            :class="getBodyCellClasses(column.key, column)"
            :style="getColumnStyles(column)"
            role="gridcell"
          >
            <!-- Custom cell content via slot -->
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :column="column"
              :value="getColumnValue(row, column.key)"
            >
              <!-- Editable cell content -->
              <template v-if="column.editable && isCellEditing(row, column.key)">
                <!-- select type -->
                <div v-if="column.type === 'select' && column.filterOptions" class="relative w-full">
                  <select
                    :value="getEditingValue(row, column.key)"
                    @change="(e) => { updateEditingValue(row, column.key, (e.target as HTMLSelectElement).value); saveCellEdit(row, column.key) }"
                    :class="['w-full rounded-md border py-1 pl-2 pr-7 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-500', getInputValidationUi(row, column.key)?.select || 'border-gray-300']"
                  >
                    <option
                      v-for="opt in column.filterOptions.map(o => typeof o === 'string' ? { value: o, label: o } : o)"
                      :key="String(opt.value)"
                      :value="opt.value"
                    >{{ opt.label }}</option>
                  </select>
                  <span
                    v-if="getValidationIcon(row, column.key)"
                    :title="getCellValidation(row, column.key)?.message || ''"
                    class="absolute right-6 top-1/2 -translate-y-1/2 cursor-help flex items-center"
                  >
                    <svg v-if="getCellValidation(row, column.key)?.type === 'success'" :class="['w-4 h-4', getValidationIconColor(row, column.key)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <svg v-else-if="getCellValidation(row, column.key)?.type === 'error'" :class="['w-4 h-4', getValidationIconColor(row, column.key)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <svg v-else :class="['w-4 h-4', getValidationIconColor(row, column.key)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
                  </span>
                </div>

                <!-- boolean type -->
                <div v-else-if="column.type === 'boolean'" class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :checked="!!getEditingValue(row, column.key)"
                    @change="(e) => { updateEditingValue(row, column.key, (e.target as HTMLInputElement).checked); saveCellEdit(row, column.key) }"
                    class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span
                    v-if="getValidationIcon(row, column.key)"
                    :title="getCellValidation(row, column.key)?.message || ''"
                    class="cursor-help flex items-center"
                  >
                    <svg v-if="getCellValidation(row, column.key)?.type === 'success'" :class="['w-4 h-4 transition-opacity duration-150', getValidationIconColor(row, column.key)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <svg v-else-if="getCellValidation(row, column.key)?.type === 'error'" :class="['w-4 h-4 transition-opacity duration-150', getValidationIconColor(row, column.key)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <svg v-else :class="['w-4 h-4 transition-opacity duration-150', getValidationIconColor(row, column.key)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
                  </span>
                </div>

                <!-- all other input types (text, date, number, email, url, password, …) -->
                <div v-else class="relative w-full">
                  <input
                    :value="getEditingValue(row, column.key)"
                    @input="(e) => updateEditingValue(row, column.key, (e.target as HTMLInputElement).value)"
                    @keydown="handleEditKeydown($event, row, column.key)"
                    @blur="saveCellEdit(row, column.key)"
                    :type="getColumnInputType(column)"
                    :class="['w-full rounded-md border py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500', getInputValidationUi(row, column.key)?.input || 'border-gray-300', getValidationIcon(row, column.key) ? 'pl-2 pr-8' : 'px-2']"
                    autofocus
                  />
                  <span
                    v-if="getValidationIcon(row, column.key)"
                    :title="getCellValidation(row, column.key)?.message || ''"
                    class="absolute right-2 top-1/2 -translate-y-1/2 cursor-help flex items-center"
                  >
                    <svg v-if="getCellValidation(row, column.key)?.type === 'success'" :class="['w-4 h-4', getValidationIconColor(row, column.key)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <svg v-else-if="getCellValidation(row, column.key)?.type === 'error'" :class="['w-4 h-4', getValidationIconColor(row, column.key)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <svg v-else :class="['w-4 h-4', getValidationIconColor(row, column.key)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
                  </span>
                </div>
              </template>

              <!-- Non-editable or view mode -->
              <template v-else>
                <div
                  :class="[
                    column.editable
                      ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-1 py-0.5 rounded'
                      : '',
                    'transition-colors duration-150 flex items-center w-full',
                    column.editable ? 'justify-between' : ''
                  ]"
                  @click="column.editable ? startCellEdit(row, column.key) : undefined"
                >
                  <div class="flex-1 min-w-0">
                    <span
                      v-if="column.showTooltip && shouldShowTooltip(getColumnValue(row, column.key))"
                      :title="String(getColumnValue(row, column.key))"
                      :class="['truncate', 'block', computedTheme.rowText]"
                    >
                      {{ getColumnValue(row, column.key) }}
                    </span>
                    <span v-else :class="`${computedTheme.rowText}`">
                      {{ getColumnValue(row, column.key) }}
                    </span>
                  </div>

                  <div v-if="column.editable" class="flex items-center gap-1 flex-shrink-0 ml-2">
                    <span
                      v-if="getValidationIcon(row, column.key)"
                      :title="getCellValidation(row, column.key)?.message || ''"
                      class="cursor-help flex items-center"
                    >
                      <svg v-if="getCellValidation(row, column.key)?.type === 'success'" :class="['w-4 h-4 transition-opacity duration-150', getValidationIconColor(row, column.key)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <svg v-else-if="getCellValidation(row, column.key)?.type === 'error'" :class="['w-4 h-4 transition-opacity duration-150', getValidationIconColor(row, column.key)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <svg v-else :class="['w-4 h-4 transition-opacity duration-150', getValidationIconColor(row, column.key)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
                    </span>
                    <!-- pencil edit indicator -->
                    <svg class="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity duration-150" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
                  </div>
                </div>
              </template>
            </slot>
          </td>
        </tr>

        <!-- Detail row (nested content) -->
        <tr v-if="canRenderRowDetail && isRowExpanded(getRowId(row))" :id="`row-detail-${getRowId(row)}`" role="row">
          <td :colspan="colCount" :class="getBodyCellClasses('detail')">
            <div class="py-3">
              <slot
                name="row-detail"
                :row="row"
                :index="index"
                :row-id="getRowId(row)"
                :detail="rowDetailData[getDetailKey(getRowId(row))]"
                :detail-raw="rowDetailRaw[getDetailKey(getRowId(row))]"
                :loading="!!rowDetailLoading[getDetailKey(getRowId(row))]"
                :error="rowDetailError[getDetailKey(getRowId(row))]"
                :reload="() => loadRowDetail(row, { force: true })"
              >
                <DataTableRowDetailDefault
                  :loading="!!rowDetailLoading[getDetailKey(getRowId(row))]"
                  :error="rowDetailError[getDetailKey(getRowId(row))]"
                  :detail="rowDetailData[getDetailKey(getRowId(row))]"
                  :loading-text-class="computedTheme.loadingText ?? ''"
                  :on-retry="() => loadRowDetail(row, { force: true })"
                />
              </slot>
            </div>
          </td>
        </tr>
      </template>

      <!-- Loading more rows skeleton (for loadMore/infinite) -->
      <template
        v-if="
          loadingState === LoadingState.LOADING_MORE &&
          (actualMode === 'loadMore' ||
            actualMode === 'infinite' ||
            (actualMode === 'gridInfinite' && gridInfiniteLoadingDirection !== 'up'))
        "
      >
        <DataTableSkeletonRows
          :count="loadMoreSkeletonCount"
          key-prefix="loading-more"
          :row-index-offset="pagedRows.length"
          :selectable="!!resolvedOptions.selectable"
          :expandable="!!resolvedOptions.expandable"
          :ordered-columns="orderedColumns"
          :checkbox-column-classes="checkboxColumnClasses"
          :checkbox-column-style="checkboxColumnStyle"
          :expand-column-classes="expandColumnClasses"
          :expand-column-style="expandColumnStyle"
          :get-row-classes="getRowClasses"
          :get-body-cell-classes="getBodyCellClasses"
          :get-column-styles="getColumnStyles"
          :get-skeleton-width="getSkeletonWidth"
          :pulse="true"
        />
      </template>

      <!-- Empty state -->
      <tr v-if="!pagedRows.length && loadingState !== LoadingState.LOADING_MORE">
        <td :colspan="colCount" :class="getBodyCellClasses('empty')">
          <slot name="empty">
            <div :class="`${ALIGNMENT_CLASSES.center} py-8 ${computedTheme.emptyStateText}`">
              {{ TEXT_LABELS.NO_DATA }}
            </div>
          </slot>
        </td>
      </tr>
    </template>
  </tbody>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance, CSSProperties, StyleValue } from 'vue'

import type { DataTableOptions } from '../composables/useDataTableCore'
import { LoadingState as LoadingStateEnum } from '../composables/useDataTableCore'
import { ALIGNMENT_CLASSES, TEXT_LABELS } from '../constants/datatable.constants'
import type {
  Column,
  RowId,
  TableRow,
  TableTheme,
  ValidationResult
} from '../types/datatable.types'

const props = defineProps<{
  setTableBodyRef?: (el: HTMLElement | null) => void

  tableBodyStyle: StyleValue
  shouldShowLoadingOverlay: boolean

  isInitialLoading: boolean
  preservedRows: TableRow[]

  skeleton: boolean
  skeletonRowCount: number

  loadMoreSkeletonCount: number

  pagedRows: TableRow[]

  orderedColumns: Column[]

  resolvedOptions: DataTableOptions
  computedTheme: TableTheme

  checkboxColumnClasses: string | string[] | Record<string, boolean>
  checkboxColumnStyle: StyleValue
  expandColumnClasses: string | string[] | Record<string, boolean>
  expandColumnStyle: StyleValue

  colCount: number

  loadingState: LoadingStateEnum
  actualMode: string
  gridInfiniteLoadingDirection: 'up' | 'down' | null

  selectedIds: Set<RowId>
  checkboxUpdateKey: number | string

  // Functions
  getRowId: (row: TableRow) => RowId
  getRowClasses: (index: number, rowId: RowId) => string
  getBodyCellClasses: (key: string, column?: Column) => string
  getColumnStyles: (column: Column) => string | CSSProperties
  getSkeletonWidth: (columnKey: string) => string
  getColumnValue: (row: TableRow, key: string) => unknown
  getCheckboxClasses: () => Record<string, string>

  toggleSelect: (rowId: RowId, selected: boolean) => void
  handleRowClick: (row: TableRow, event: MouseEvent) => void

  // Expand/detail
  canRenderRowDetail: boolean
  isRowExpanded: (rowId: RowId) => boolean
  toggleRowExpanded: (row: TableRow) => void
  getDetailKey: (rowId: RowId) => string
  rowDetailData: Record<string, unknown>
  rowDetailRaw: Record<string, unknown>
  rowDetailLoading: Record<string, boolean>
  rowDetailError: Record<string, unknown>
  loadRowDetail: (row: TableRow, opts?: { force?: boolean }) => Promise<unknown> | unknown

  // Editing
  isCellEditing: (row: TableRow, key: string) => boolean
  getEditingValue: (row: TableRow, key: string) => unknown
  updateEditingValue: (row: TableRow, key: string, value: unknown) => void
  saveCellEdit: (row: TableRow, key: string) => unknown
  handleEditKeydown: (event: KeyboardEvent, row: TableRow, key: string) => void
  getColumnInputType: (column: Column | undefined) => string

  // Validation helpers
  getValidationIcon: (row: TableRow, key: string) => boolean
  getValidationIconColor: (row: TableRow, key: string) => string
  getInputValidationUi: (row: TableRow, key: string) => Record<string, string>
  getCellValidation: (row: TableRow, key: string) => ValidationResult | null

  // Tooltip helper
  shouldShowTooltip: (value: unknown) => boolean

  // Start edit
  startCellEdit: (row: TableRow, key: string) => unknown
}>()

// Re-export enum for template usage (keep template variable name stable)
const LoadingState = LoadingStateEnum

const setBodyRef = (ref: Element | ComponentPublicInstance | null) => {
  if (!props.setTableBodyRef) return
  props.setTableBodyRef(ref instanceof HTMLElement ? ref : null)
}
</script>
