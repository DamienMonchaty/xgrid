<template>
  <tr
    v-for="i in count"
    :key="`${keyPrefix}-${i}`"
    :class="getRowClasses(rowIndexOffset + i - 1, `${keyPrefix}-${i}`)"
  >
    <td
      v-if="selectable"
      :class="[getBodyCellClasses('checkbox'), checkboxColumnClasses]"
      :style="checkboxColumnStyle"
    >
      <div class="flex items-center justify-center w-full">
        <div :class="['h-4 w-4 rounded bg-gray-200', pulse ? 'animate-pulse' : '']" />
      </div>
    </td>

    <td
      v-if="expandable"
      :class="[getBodyCellClasses('expand'), expandColumnClasses]"
      :style="expandColumnStyle"
    >
      <div class="flex items-center justify-center w-full">
        <div :class="['h-4 w-4 rounded bg-gray-200', pulse ? 'animate-pulse' : '']" />
      </div>
    </td>

    <td
      v-for="column in orderedColumns"
      :key="column.key"
      :class="getBodyCellClasses(column.key, column)"
      :style="getColumnStyles(column)"
    >
      <div :class="['h-4 rounded bg-gray-200', pulse ? 'animate-pulse' : '', getSkeletonWidth(column.key)]" />
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { CSSProperties, StyleValue } from 'vue'
import type { Column, RowId } from '../types/datatable.types'

type RowClassesFn = (index: number, rowId: RowId) => string

type BodyCellClassesFn = (key: string, column?: Column) => string

type ColumnStylesFn = (column: Column) => string | CSSProperties

type SkeletonWidthFn = (key: string) => string

const props = defineProps<{
  count: number
  keyPrefix: string
  rowIndexOffset: number

  selectable: boolean
  expandable: boolean

  orderedColumns: Column[]

  checkboxColumnClasses: string | string[] | Record<string, boolean>
  checkboxColumnStyle: StyleValue
  expandColumnClasses: string | string[] | Record<string, boolean>
  expandColumnStyle: StyleValue

  getRowClasses: RowClassesFn
  getBodyCellClasses: BodyCellClassesFn
  getColumnStyles: ColumnStylesFn
  getSkeletonWidth: SkeletonWidthFn

  pulse?: boolean
}>()

// checkboxSkeletonClass inlined in template
</script>
