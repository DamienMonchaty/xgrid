<template>
  <div class="min-h-screen bg-[#fafafa]">
    <!-- ===== TOP BAR ===== -->
    <header class="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-gray-200/80">
      <div class="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <UIcon name="i-lucide-table-2" class="w-4 h-4 text-white" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-900">DataTable</span>
            <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700">v2.2</span>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <a
            href="https://vuejs.org"
            target="_blank"
            rel="noopener"
            class="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 px-2.5 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <UIcon name="i-lucide-book-open" class="w-3.5 h-3.5" />
            Vue 3
          </a>
          <a
            href="https://nuxt.com"
            target="_blank"
            rel="noopener"
            class="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 px-2.5 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <UIcon name="i-lucide-rocket" class="w-3.5 h-3.5" />
            Nuxt 3
          </a>
        </div>
      </div>
    </header>

    <div class="max-w-[1400px] mx-auto flex">
      <!-- ===== SIDEBAR ===== -->
      <aside
        class="w-64 shrink-0 sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto hidden lg:flex flex-col border-r border-gray-200/80 bg-white"
      >
        <div class="px-5 py-5 border-b border-gray-100">
          <div class="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-1">Documentation</div>
          <div class="text-base font-bold text-gray-900 leading-tight">DataTable Component</div>
          <div class="text-xs text-gray-500 mt-1">Complete API reference</div>
        </div>

        <nav class="flex-1 px-3 py-4 space-y-0.5">
          <button
            v-for="section in sections"
            :key="section.id"
            type="button"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors group"
            :class="
              activeSection === section.id
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            "
            @click="setSection(section.id)"
          >
            <UIcon
              :name="section.icon"
              class="w-4 h-4 shrink-0"
              :class="activeSection === section.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'"
            />
            <span class="flex-1 truncate">{{ section.label }}</span>
            <span
              v-if="section.badge"
              class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              :class="activeSection === section.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'"
            >{{ section.badge }}</span>
          </button>
        </nav>

        <div class="px-5 py-4 border-t border-gray-100">
          <div class="text-[11px] text-gray-400 leading-relaxed">
            v2.2.0 · TypeScript strict<br/>
            Built with Nuxt 3 · Vue 3
          </div>
        </div>
      </aside>

      <!-- ===== CONTENT ===== -->
      <main class="flex-1 min-w-0 px-4 sm:px-8 py-10 max-w-5xl">
        <!-- Mobile nav -->
        <div class="lg:hidden mb-6">
          <div class="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            <button
              v-for="section in sections"
              :key="section.id"
              type="button"
              class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              :class="
                activeSection === section.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              "
              @click="setSection(section.id)"
            >
              <UIcon :name="section.icon" class="w-3.5 h-3.5" />
              {{ section.label }}
            </button>
          </div>
        </div>

        <Transition name="fade" mode="out-in">
          <div :key="activeSection" class="space-y-10">

            <!-- ==================== OVERVIEW ==================== -->
            <section v-if="activeSection === 'overview'" class="space-y-10">
              <div class="space-y-4">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold uppercase tracking-wider">
                  <UIcon name="i-lucide-sparkles" class="w-3 h-3" />
                  Component
                </div>
                <h1 class="text-4xl font-bold tracking-tight text-gray-900">DataTable</h1>
                <p class="text-base text-gray-500 max-w-2xl leading-relaxed">
                  Advanced data table component with client & server modes, multiple pagination strategies,
                  sorting, search, per-column filters, selection, inline editing, master/detail rows and full theming.
                </p>
              </div>

              <DocCard title="Installation" desc="The component is auto-imported by Nuxt — no manual import required.">
                <CodeBlock :code="codeInstall" language="vue" />
              </DocCard>

              <DocCard title="Quick start" desc="Minimal example with a static array of rows.">
                <CodeBlock :code="codeQuickStart" language="vue" />
                <div class="mt-5">
                  <DataTable
                    :datasource="quickStartRows"
                    :columns="quickStartCols"
                    :pagination="false"
                  />
                </div>
              </DocCard>

              <DocCard title="Features">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FeaturePill
                    v-for="f in featureList"
                    :key="f.label"
                    :icon="f.icon"
                    :label="f.label"
                    :desc="f.desc"
                  />
                </div>
              </DocCard>
            </section>

            <!-- ==================== MODES ==================== -->
            <section v-else-if="activeSection === 'modes'" class="space-y-8">
              <SectionHeader
                eyebrow="Data sources"
                title="Client & Server modes"
                desc="The component supports two data sources: a local array (client) or a remote API URL (server)."
              />

              <DocCard title="Client mode — local array">
                <CodeBlock :code="codeClientMode" />
                <div class="mt-5">
                  <DataTable
                    :datasource="quickStartRows"
                    :columns="quickStartCols"
                    :pagination="false"
                    size="sm"
                    :toolbar="{ title: 'Client mode', searchable: true }"
                  />
                </div>
              </DocCard>

              <DocCard title="Server mode — API URL" desc="Pass a URL string as datasource. Pagination, search, sort and filters are sent automatically.">
                <CodeBlock :code="codeServerMode" />
                <div class="mt-5">
                  <PropTable :rows="serverModeParams" title="Parameters sent to the server" />
                </div>
              </DocCard>

              <DocCard title="Expected server response">
                <CodeBlock :code="codeServerResponse" language="ts" />
              </DocCard>
            </section>

            <!-- ==================== PAGINATION ==================== -->
            <section v-else-if="activeSection === 'pagination'" class="space-y-8">
              <SectionHeader
                eyebrow="UX"
                title="Pagination"
                desc="Five pagination strategies depending on your target UX."
              />

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <PaginationModeCard
                  v-for="pm in paginationModes"
                  :key="pm.value"
                  :value="pm.value"
                  :label="pm.label"
                  :desc="pm.desc"
                  :badge="pm.badge"
                  :active="activePagMode === pm.value"
                  @click="activePagMode = pm.value"
                />
              </div>

              <DocCard :title="`Live demo — ${activePagMode}`">
                <template #actions>
                  <code class="text-[11px] font-mono text-gray-400">
                    mode="{{ paginationModes.find(p => p.value === activePagMode)?.mode ?? 'paginated' }}"<span v-if="activePagMode === 'gridInfinite'"> · server</span>
                  </code>
                </template>

                <!-- gridInfinite: server-side demo so each scroll triggers an API request -->
                <DataTable
                  v-if="activePagMode === 'gridInfinite'"
                  key="gridInfinite-server"
                  :datasource="publicationsApiUrl"
                  :columns="publicationsCols"
                  mode="gridInfinite"
                  :page-size="20"
                  :grid-infinite-cache-pages="3"
                  size="sm"
                />

                <!-- paginated / none: use `pagination` prop only -->
                <DataTable
                  v-else-if="activePagMode === 'paginated' || activePagMode === 'none'"
                  :key="`pag-${activePagMode}`"
                  :datasource="bigRows"
                  :columns="quickStartCols"
                  :pagination="activePagMode === 'paginated'"
                  :page-size="5"
                  :page-size-selector="true"
                  size="sm"
                />

                <!-- loadMore / gridInfinite: use `mode` prop only -->
                <DataTable
                  v-else
                  :key="`mode-${activePagMode}`"
                  :datasource="bigRows"
                  :columns="quickStartCols"
                  :mode="paginationModes.find(p => p.value === activePagMode)?.mode"
                  :page-size="5"
                  :page-size-selector="true"
                  size="sm"
                />
              </DocCard>

              <DocCard title="Pagination props">
                <PropTable :rows="paginationProps" />
              </DocCard>
            </section>

            <!-- ==================== COLUMNS ==================== -->
            <section v-else-if="activeSection === 'columns'" class="space-y-8">
              <SectionHeader
                eyebrow="Schema"
                title="Columns"
                desc="Each column is a Column object with many configuration options."
              />

              <DocCard title="Column interface">
                <CodeBlock :code="codeColumnInterface" language="ts" />
              </DocCard>

              <DocCard title="Column types">
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                  <TypePill v-for="ct in columnTypes" :key="ct.value" :value="ct.value" :desc="ct.desc" />
                </div>
                <DataTable
                  :datasource="columnTypesRows"
                  :columns="columnTypesCols"
                  :pagination="false"
                  size="sm"
                />
              </DocCard>

              <DocCard title="Sort · Resize · Drag &amp; drop" desc="Enable sortable, resizable and draggable per column.">
                <DataTable
                  :datasource="bigRows"
                  :columns="interactiveCols"
                  :pagination="false"
                  size="sm"
                  :toolbar="{ title: 'Drag · Resize · Sort' }"
                />
              </DocCard>

              <DocCard title="Grouping" desc="Group rows visually by a column and optionally customize the group label.">
                <CodeBlock :code="codeGroupingExample" language="vue" />
                <div class="mt-5">
                  <DataTable
                    :datasource="groupingRows"
                    :columns="groupingCols"
                    :grouping="groupingConfig"
                    :pagination="false"
                    size="sm"
                    :toolbar="{ title: 'Grouped rows' }"
                  />
                </div>
              </DocCard>

              <DocCard title="Alignment and width">
                <CodeBlock :code="codeColumnAlign" language="ts" />
              </DocCard>
            </section>

            <!-- ==================== FILTERING ==================== -->
            <section v-else-if="activeSection === 'filters'" class="space-y-8">
              <SectionHeader
                eyebrow="Filtering"
                title="Per-column filters"
                desc="Built-in filters per column type, accessible through the column header menu."
              />

              <DocCard title="Filter operators by type">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FilterTypeCard v-for="ft in filterTypes" :key="ft.type" :type="ft.type" :operators="ft.operators" />
                </div>
              </DocCard>

              <DocCard title="Interactive demo" desc="Click the filter icon in a column header.">
                <DataTable
                  :datasource="bigRows"
                  :columns="filterableCols"
                  :pagination="false"
                  size="sm"
                  :toolbar="{ searchable: true, title: 'Filterable columns' }"
                />
              </DocCard>

              <DocCard title="v-model:filters — external control">
                <CodeBlock :code="codeExternalFilters" />
              </DocCard>
            </section>

            <!-- ==================== SELECTION ==================== -->
            <section v-else-if="activeSection === 'selection'" class="space-y-8">
              <SectionHeader
                eyebrow="Interaction"
                title="Selection &amp; Bulk actions"
                desc="Multi-row selection with configurable bulk actions exposed in the toolbar."
              />

              <DocCard title="Live demo">
                <DataTable
                  :datasource="quickStartRows"
                  :columns="quickStartCols"
                  :pagination="false"
                  :selectable="true"
                  :bulk-actions="demoBulkActions"
                  size="sm"
                  :toolbar="{ title: 'Selection', searchable: true }"
                  @selection-change="(rows) => lastSelection = rows"
                  @bulk-action="(action, rows) => lastBulkAction = { action, count: rows.length }"
                />
                <div v-if="lastSelection.length || lastBulkAction" class="mt-4 flex gap-2 flex-wrap">
                  <span v-if="lastSelection.length" class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                    <UIcon name="i-lucide-check-square" class="w-3 h-3" />
                    {{ lastSelection.length }} row(s) selected
                  </span>
                  <span v-if="lastBulkAction" class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-medium">
                    <UIcon name="i-lucide-zap" class="w-3 h-3" />
                    Bulk: {{ lastBulkAction.action }} · {{ lastBulkAction.count }} row(s)
                  </span>
                </div>
              </DocCard>

              <DocCard title="Selection props &amp; events">
                <PropTable :rows="selectionProps" />
              </DocCard>

              <DocCard title="BulkAction interface">
                <CodeBlock :code="codeBulkAction" language="ts" />
              </DocCard>
            </section>

            <!-- ==================== SLOTS ==================== -->
            <section v-else-if="activeSection === 'slots'" class="space-y-8">
              <SectionHeader
                eyebrow="Customization"
                title="Slots"
                desc="Full content customization via named slots."
              />

              <DocCard title="Available slots">
                <PropTable :rows="slotsReference" />
              </DocCard>

              <DocCard title="#cell-{key} — custom cell rendering" desc="Each column exposes a #cell-{key} slot.">
                <CodeBlock :code="codeCellSlot" />
                <div class="mt-5">
                  <DataTable
                    :datasource="quickStartRows"
                    :columns="quickStartCols"
                    :pagination="false"
                    size="sm"
                  >
                    <template #cell-status="{ value }">
                      <span
                        class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                        :class="value === 'published' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" :class="value === 'published' ? 'bg-green-500' : 'bg-gray-400'" />
                        {{ value }}
                      </span>
                    </template>
                    <template #cell-title="{ value }">
                      <span class="font-medium text-gray-900">{{ value }}</span>
                    </template>
                  </DataTable>
                </div>
              </DocCard>

              <DocCard title="#row-detail — Master / Detail" desc="Show a detail panel below each expandable row.">
                <CodeBlock :code="codeRowDetailSlot" />
                <div class="mt-5">
                  <DataTable
                    :datasource="quickStartRows"
                    :columns="quickStartCols"
                    :pagination="false"
                    :expandable="true"
                    size="sm"
                  >
                    <template #row-detail="{ row }">
                      <div class="p-4 bg-gray-50 rounded-lg text-sm space-y-1 ring-1 ring-gray-200">
                        <div class="font-semibold text-gray-700 mb-2">Row detail</div>
                        <div v-for="(v, k) in row" :key="k" class="flex gap-3">
                          <span class="text-gray-400 font-mono text-xs w-24 shrink-0">{{ k }}</span>
                          <span class="text-gray-700 truncate">{{ v }}</span>
                        </div>
                      </div>
                    </template>
                  </DataTable>
                </div>
              </DocCard>

              <DocCard title="#empty — custom empty state">
                <DataTable
                  :datasource="[]"
                  :columns="quickStartCols"
                  :pagination="false"
                  size="sm"
                >
                  <template #empty>
                    <div class="py-12 text-center space-y-2">
                      <UIcon name="i-lucide-inbox" class="w-10 h-10 text-gray-300 mx-auto" />
                      <div class="text-sm font-medium text-gray-600">No data available</div>
                      <div class="text-xs text-gray-400">Adjust your filters or come back later.</div>
                    </div>
                  </template>
                </DataTable>
              </DocCard>
            </section>

            <!-- ==================== EDITING ==================== -->
            <section v-else-if="activeSection === 'editing'" class="space-y-8">
              <SectionHeader
                eyebrow="Mutation"
                title="Inline editing"
                desc="Edit values directly inside table cells with built-in validation."
              />

              <DocCard title="Live demo" desc='Enable `editable: true` on a column and click a cell to edit.'>
                <DataTable
                  :datasource="editableRows"
                  :columns="editableCols"
                  :pagination="false"
                  size="sm"
                />
              </DocCard>

              <DocCard title="Inline validation" desc='Add a `validation` object to the column definition.'>
                <CodeBlock :code="codeValidation" language="ts" />
              </DocCard>

              <DocCard title="Editing props">
                <PropTable :rows="editingProps" />
              </DocCard>
            </section>

            <!-- ==================== THEMES ==================== -->
            <section v-else-if="activeSection === 'themes'" class="space-y-8">
              <SectionHeader
                eyebrow="Appearance"
                title="Themes &amp; Variants"
                desc="Six built-in themes plus a complete override system."
              />

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button
                  v-for="v in allVariants"
                  :key="v"
                  type="button"
                  class="px-3 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2"
                  :class="activeVariant === v
                    ? 'border-indigo-500 bg-indigo-50/60 text-indigo-700 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'"
                  @click="activeVariant = v"
                >
                  <UIcon
                    v-if="activeVariant === v"
                    name="i-lucide-check"
                    class="w-3.5 h-3.5"
                  />
                  {{ v }}
                </button>
              </div>

              <DocCard :title="`Theme: ${activeVariant}`">
                <DataTable
                  :key="activeVariant"
                  :datasource="quickStartRows"
                  :columns="quickStartCols"
                  :pagination="false"
                  :selectable="true"
                  :toolbar="{ title: activeVariant, searchable: true }"
                  :variant="activeVariant"
                  size="sm"
                >
                  <template #cell-status="{ value }">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                      :class="value === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                    >{{ value }}</span>
                  </template>
                </DataTable>
              </DocCard>

              <DocCard title="Override via theme prop">
                <CodeBlock :code="codeThemeOverride" />
              </DocCard>

              <DocCard title="TableTheme interface">
                <CodeBlock :code="codeTableTheme" language="ts" />
              </DocCard>
            </section>

            <!-- ==================== TOOLBAR ==================== -->
            <section v-else-if="activeSection === 'toolbar'" class="space-y-8">
              <SectionHeader
                eyebrow="Chrome"
                title="Toolbar"
                desc="Configurable toolbar with search, column toggles, export, refresh and custom actions."
              />

              <DocCard title="Toolbar configuration">
                <CodeBlock :code="codeToolbar" language="ts" />
              </DocCard>

              <DocCard title="Full toolbar demo">
                <DataTable
                  :datasource="bigRows"
                  :columns="quickStartCols"
                  :pagination="false"
                  :selectable="true"
                  size="sm"
                  :toolbar="{
                    title: 'Full toolbar',
                    searchable: true,
                    searchPlaceholder: 'Search…',
                    showExport: true,
                    showRefresh: true
                  }"
                  @export="() => toolbarExported = true"
                  @refresh="() => toolbarRefreshed = true"
                >
                  <template #toolbar-actions>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <UIcon name="i-lucide-plus" class="w-3 h-3" />
                      Custom action
                    </button>
                  </template>
                </DataTable>
                <div class="mt-3 flex gap-2 text-xs">
                  <span v-if="toolbarExported" class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full">
                    <UIcon name="i-lucide-check" class="w-3 h-3" />
                    Export triggered
                  </span>
                  <span v-if="toolbarRefreshed" class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                    <UIcon name="i-lucide-refresh-cw" class="w-3 h-3" />
                    Refresh triggered
                  </span>
                </div>
              </DocCard>

              <DocCard title="ToolbarConfig props">
                <PropTable :rows="toolbarProps" />
              </DocCard>
            </section>

            <!-- ==================== EVENTS ==================== -->
            <section v-else-if="activeSection === 'events'" class="space-y-8">
              <SectionHeader
                eyebrow="API"
                title="Events"
                desc="Full event API: modern v2.2 events, v-model bindings and legacy aliases."
              />

              <DocCard title="Modern events" desc="Recommended event names.">
                <PropTable :rows="modernEvents" />
              </DocCard>

              <DocCard title="v-model bindings">
                <PropTable :rows="vmodelBindings" />
              </DocCard>

              <DocCard title="Legacy events" desc="Deprecated but kept for backward compatibility.">
                <PropTable :rows="legacyEvents" />
              </DocCard>

              <DocCard title="Live event log">
                <DataTable
                  :datasource="quickStartRows"
                  :columns="quickStartCols"
                  :pagination="false"
                  :selectable="true"
                  size="sm"
                  :toolbar="{ title: 'Event log', searchable: true }"
                  @selection-change="logLiveEvent('selection-change', $event)"
                  @export="logLiveEvent('export', $event)"
                  @refresh="logLiveEvent('refresh', {})"
                />
                <div class="mt-4 space-y-1 max-h-40 overflow-y-auto rounded-lg bg-[#0b1020] p-3">
                  <div
                    v-for="(ev, i) in liveEvents"
                    :key="i"
                    class="flex items-start gap-3 text-[12px] font-mono px-2 py-1 rounded"
                  >
                    <span class="text-gray-500 shrink-0">{{ ev.time }}</span>
                    <span class="text-indigo-400 shrink-0">{{ ev.name }}</span>
                    <span class="truncate text-gray-300">{{ ev.data }}</span>
                  </div>
                  <div v-if="!liveEvents.length" class="text-xs text-gray-500 italic px-2 py-1">
                    Interact with the table to see events appear here…
                  </div>
                </div>
              </DocCard>
            </section>

            <!-- ==================== PROPS ==================== -->
            <section v-else-if="activeSection === 'props'" class="space-y-8">
              <SectionHeader
                eyebrow="Reference"
                title="Full props reference"
                desc="Exhaustive list of all component props."
              />

              <DocCard title="Data source">
                <PropTable :rows="propsDataSource" />
              </DocCard>

              <DocCard title="Display &amp; UI">
                <PropTable :rows="propsDisplay" />
              </DocCard>

              <DocCard title="Behavior">
                <PropTable :rows="propsBehavior" />
              </DocCard>

              <DocCard title="Row detail (master/detail)">
                <PropTable :rows="propsRowDetail" />
              </DocCard>
            </section>

          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Column, TableRow, TableVariant, BulkAction, LoadDataParams, ServerResponse } from '~/types/datatable.types'

definePageMeta({ ssr: false })

// ========== SECTION NAV ==========
const sections = [
  { id: 'overview',   icon: 'i-lucide-home',          label: 'Overview' },
  { id: 'modes',      icon: 'i-lucide-database',      label: 'Data modes' },
  { id: 'pagination', icon: 'i-lucide-layers',        label: 'Pagination',     badge: '5' },
  { id: 'columns',    icon: 'i-lucide-columns-3',     label: 'Columns' },
  { id: 'filters',    icon: 'i-lucide-filter',        label: 'Filters' },
  { id: 'selection',  icon: 'i-lucide-check-square',  label: 'Selection' },
  { id: 'slots',      icon: 'i-lucide-puzzle',        label: 'Slots' },
  { id: 'editing',    icon: 'i-lucide-pencil-line',   label: 'Inline editing' },
  { id: 'themes',     icon: 'i-lucide-palette',       label: 'Themes',         badge: '6' },
  { id: 'toolbar',    icon: 'i-lucide-wrench',        label: 'Toolbar' },
  { id: 'events',     icon: 'i-lucide-radio',         label: 'Events' },
  { id: 'props',      icon: 'i-lucide-list',          label: 'Props ref.' },
]
const activeSection = ref('overview')

function setSection(id: string) {
  activeSection.value = id
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ========== DATA FIXTURES ==========
const quickStartRows: TableRow[] = [
  { id: 1, title: 'Introduction to Vue 3',     status: 'published', views: 4821 },
  { id: 2, title: 'Nuxt 3 Deep Dive',          status: 'draft',     views: 0    },
  { id: 3, title: 'Tailwind CSS Mastery',      status: 'published', views: 2310 },
  { id: 4, title: 'TypeScript Best Practices', status: 'published', views: 1590 },
  { id: 5, title: 'State Management Patterns', status: 'draft',     views: 0    },
]

const quickStartCols: Column[] = [
  { key: 'id',     label: 'ID',     type: 'number', width: 60,  align: 'center' },
  { key: 'title',  label: 'Title',  sortable: true, minWidth: 200 },
  { key: 'status', label: 'Status', type: 'select', width: 110, align: 'center', filterable: true, filterType: 'select', filterOptions: ['published', 'draft'] },
  { key: 'views',  label: 'Views',  type: 'number', width: 90,  align: 'right',  sortable: true },
]

const groupingRows: TableRow[] = [
  { id: 1, owner: 'Alicia', team: 'Core', category: 'Frontend', bronze: 2, silver: 1, gold: 0 },
  { id: 2, owner: 'Benoît', team: 'Core', category: 'Frontend', bronze: 1, silver: 2, gold: 1 },
  { id: 3, owner: 'Camille', team: 'Platform', category: 'Backend', bronze: 0, silver: 3, gold: 1 },
  { id: 4, owner: 'Dina', team: 'Platform', category: 'Backend', bronze: 2, silver: 0, gold: 2 },
  { id: 5, owner: 'Eli', team: 'Design', category: 'UX', bronze: 1, silver: 1, gold: 0 },
]

const groupingCols: Column[] = [
  { key: 'owner', label: 'Owner', sortable: true, minWidth: 140 },
  { key: 'team', label: 'Team', sortable: true, width: 120 },
  { key: 'category', label: 'Category', sortable: true, width: 130 },
  {
    key: 'total',
    label: 'Total medals',
    type: 'number',
    align: 'right',
    width: 130,
    valueGetter: (params) => Number(params.data.bronze ?? 0) + Number(params.data.silver ?? 0) + Number(params.data.gold ?? 0),
  },
]

const groupingConfig = {
  key: 'category',
  labelGetter: (value: unknown) => `Category · ${String(value)}`,
}

const codeGroupingExample = `const groupingRows = [
  { owner: 'Alicia', team: 'Core', category: 'Frontend', bronze: 2, silver: 1, gold: 0 },
  { owner: 'Benoît', team: 'Core', category: 'Frontend', bronze: 1, silver: 2, gold: 1 },
  { owner: 'Camille', team: 'Platform', category: 'Backend', bronze: 0, silver: 3, gold: 1 },
]

const groupingCols = [
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'team', label: 'Team', sortable: true, width: 120 },
  { key: 'category', label: 'Category', sortable: true, width: 130 },
  {
    key: 'total',
    label: 'Total medals',
    type: 'number',
    align: 'right',
    valueGetter: (params) => Number(params.data.bronze ?? 0) + Number(params.data.silver ?? 0) + Number(params.data.gold ?? 0),
  },
]

const groupingConfig = {
  key: 'category',
  labelGetter: (value) => \`Category · \${value}\`,
}

<DataTable
  :datasource="groupingRows"
  :columns="groupingCols"
  :grouping="groupingConfig"
  :pagination="false"
/>`

const bigRows: TableRow[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  title: `Article #${i + 1} — ${['Vue 3', 'Nuxt', 'TypeScript', 'Tailwind', 'Vite'][i % 5]}`,
  status: i % 3 === 0 ? 'draft' : 'published',
  views: (i * 397 + 113) % 5000,
}))

// Server-side demo (gridInfinite): JSONPlaceholder /photos.
// Custom datasource function adapts DataTable's request params to
// JSONPlaceholder's `_start` / `_limit` / `_sort` / `_order` query, and
// repeats `albumId=X` for multi-select filtering. The response is a raw
// array; we read the total from the `x-total-count` header.
const publicationsApiUrl = async (params: LoadDataParams): Promise<ServerResponse> => {
  const start = (params.page - 1) * params.pageSize
  const url = new URL('https://jsonplaceholder.typicode.com/photos')
  url.searchParams.set('_start', String(start))
  url.searchParams.set('_limit', String(params.pageSize))

  if (params.sort?.key) {
    url.searchParams.set('_sort', params.sort.key)
    url.searchParams.set('_order', params.sort.direction)
  }

  // Filters → repeated query params (jsonplaceholder convention).
  for (const [key, value] of Object.entries(params.filters || {})) {
    if (!value || typeof value !== 'object') continue
    // Multi-select filter: { '1': true, '2': false, ... }
    if (!('operator' in value)) {
      for (const [optKey, checked] of Object.entries(value as Record<string, boolean>)) {
        if (checked) url.searchParams.append(key, optKey)
      }
      continue
    }
    // Structured filter: { operator, value }
    const fv = value as { operator: string, value: unknown }
    if (fv.value !== null && fv.value !== undefined && fv.value !== '') {
      url.searchParams.append(key, String(fv.value))
    }
  }

  const res = await fetch(url.toString())
  const data = (await res.json()) as TableRow[]
  const total = Number(res.headers.get('x-total-count') ?? data.length)
  const totalPages = Math.max(1, Math.ceil(total / params.pageSize))

  return {
    success: true,
    data,
    total,
    page: params.page,
    totalPages,
  }
}

const publicationsCols: Column[] = [
  { key: 'id',           label: 'ID',        type: 'number', width: 70,  align: 'center', sortable: true },
  { key: 'albumId',      label: 'Album',     type: 'number', width: 90,  align: 'right',  sortable: true, filterable: true, filterType: 'numberRange' },
  { key: 'thumbnailUrl', label: 'Thumbnail', width: 110, align: 'center' },
  { key: 'title',        label: 'Title',     sortable: true, minWidth: 320 },
]

const columnTypesRows: TableRow[] = [
  { id: 1, name: 'Alice',  age: 28, joined: '2023-03-15', active: true,  score: 92.5 },
  { id: 2, name: 'Bob',    age: 34, joined: '2022-11-01', active: false, score: 78.1 },
  { id: 3, name: 'Claire', age: 25, joined: '2024-01-20', active: true,  score: 88.9 },
]
const columnTypesCols: Column[] = [
  { key: 'id',     label: 'ID',     type: 'number', width: 60,  align: 'center' },
  { key: 'name',   label: 'Name',   sortable: true, width: 120 },
  { key: 'age',    label: 'Age',    type: 'number', width: 80,  align: 'right' },
  { key: 'joined', label: 'Joined', type: 'date',   width: 150 },
  { key: 'score',  label: 'Score',  type: 'number', width: 100, align: 'right' },
]

const interactiveCols: Column[] = [
  { key: 'id',    label: 'ID',     type: 'number', width: 60,  align: 'center', sortable: true },
  { key: 'title', label: 'Title',  sortable: true, resizable: true, draggable: true, minWidth: 200 },
  { key: 'status',label: 'Status', width: 110, draggable: true, filterable: true, filterType: 'select', filterOptions: ['published', 'draft'] },
  { key: 'views', label: 'Views',  type: 'number', width: 90, align: 'right', sortable: true, resizable: true },
]

const filterableCols: Column[] = [
  { key: 'id',    label: 'ID',     type: 'number', width: 60, align: 'center' },
  { key: 'title', label: 'Title',  filterable: true, filterType: 'text',   sortable: true, minWidth: 180 },
  { key: 'status',label: 'Status', filterable: true, filterType: 'select', filterOptions: ['published', 'draft'], width: 120 },
  { key: 'views', label: 'Views',  filterable: true, filterType: 'numberRange', type: 'number', width: 100, align: 'right' },
]

const editableRows = ref<TableRow[]>([
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob',   email: 'bob@example.com',   role: 'Editor' },
  { id: 3, name: 'Carol', email: 'carol@example.com', role: 'Viewer' },
])
const editableCols: Column[] = [
  { key: 'id',    label: 'ID',    type: 'number', width: 60,  align: 'center' },
  { key: 'name',  label: 'Name',  editable: true, minWidth: 160, validation: { enabled: true, required: true, min: 2 } },
  { key: 'email', label: 'Email', editable: true, minWidth: 220, validation: { enabled: true, required: true } },
  { key: 'role',  label: 'Role',  editable: true, width: 120 },
]

// ========== STATE ==========
const activePagMode = ref<string>('paginated')
const activeVariant = ref<TableVariant>('default')
const lastSelection = ref<TableRow[]>([])
const lastBulkAction = ref<{ action: string; count: number } | null>(null)
const liveEvents = ref<Array<{ time: string; name: string; data: string }>>([])
const toolbarExported = ref(false)
const toolbarRefreshed = ref(false)

const allVariants: TableVariant[] = ['default', 'default-dark', 'elegant', 'elegant-dark', 'modern', 'modern-dark']

const demoBulkActions: BulkAction[] = [
  { key: 'publish', label: 'Publish', color: 'success' },
  { key: 'archive', label: 'Archive', color: 'neutral' },
  { key: 'delete',  label: 'Delete',  color: 'error'   },
]

function logLiveEvent(name: string, data: unknown) {
  liveEvents.value.unshift({
    time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    name,
    data: JSON.stringify(data, null, 0).slice(0, 80),
  })
  if (liveEvents.value.length > 20) liveEvents.value.pop()
}

// ========== METADATA ==========
const featureList = [
  { icon: 'i-lucide-zap',           label: 'Client & Server',  desc: 'Local array or remote API URL.' },
  { icon: 'i-lucide-layers',        label: '5 pagination modes', desc: 'paginated, loadMore, gridInfinite, grid…' },
  { icon: 'i-lucide-filter',        label: 'Column filters',     desc: 'text, select, number, date, boolean.' },
  { icon: 'i-lucide-arrow-up-down', label: 'Typed sorting',      desc: 'Native string, number, date.' },
  { icon: 'i-lucide-check-square',  label: 'Selection + Bulk',   desc: 'Configurable bulk actions.' },
  { icon: 'i-lucide-pencil-line',   label: 'Inline editing',     desc: 'Per-column validation built-in.' },
  { icon: 'i-lucide-puzzle',        label: 'Full slot API',      desc: 'cell, header, detail, empty…' },
  { icon: 'i-lucide-palette',       label: '6 themes',           desc: 'default, elegant, modern + dark.' },
  { icon: 'i-lucide-move-horizontal', label: 'Resize & drag',    desc: 'Resize and reorder columns.' },
  { icon: 'i-lucide-chevrons-down', label: 'Master / detail',    desc: 'Expandable rows with lazy fetch.' },
  { icon: 'i-lucide-shield-check',  label: 'Strict TypeScript',  desc: 'Zero any, noUncheckedIndexedAccess.' },
  { icon: 'i-lucide-wrench',        label: 'Modular toolbar',    desc: 'Search, columns, export, actions.' },
]

const paginationModes: Array<{ value: string; label: string; desc: string; badge: string; mode: 'loadMore' | 'gridInfinite' | undefined }> = [
  { value: 'paginated',    label: 'Paginated',     desc: 'Classic pages with page navigation.',                badge: 'default', mode: undefined     },
  { value: 'loadMore',     label: 'Load more',     desc: 'A "Load more" button below the table.',              badge: '',        mode: 'loadMore'    },
  { value: 'gridInfinite', label: 'Grid infinite', desc: 'Infinite scroll inside the table (fixed height).',   badge: 'new',     mode: 'gridInfinite' },
  { value: 'none',         label: 'None',          desc: 'All data rendered with no pagination.',              badge: '',        mode: undefined     },
]

const columnTypes = [
  { value: 'text',   desc: 'String (default)' },
  { value: 'number', desc: 'Numeric sorting' },
  { value: 'date',   desc: 'Date sorting' },
  { value: 'select', desc: 'Discrete values' },
  { value: 'email',  desc: 'Email input' },
  { value: 'url',    desc: 'URL input' },
]

const filterTypes = [
  { type: 'text',        operators: ['contains', 'eq', 'ne', 'startsWith', 'endsWith', 'regex'] },
  { type: 'select',      operators: ['eq', 'ne', 'in', 'notIn'] },
  { type: 'numberRange', operators: ['eq', 'gt', 'gte', 'lt', 'lte', 'between'] },
  { type: 'dateRange',   operators: ['eq', 'gt', 'gte', 'lt', 'lte', 'between'] },
  { type: 'boolean',     operators: ['eq'] },
]

// ========== CODE SAMPLES ==========
const codeInstall = `<!-- Auto-imported by Nuxt — no manual import needed -->
<DataTable :datasource="rows" :columns="cols" />`

const codeQuickStart = `<script setup lang="ts">
import type { Column, TableRow } from '~/types/datatable.types'

const rows: TableRow[] = [
  { id: 1, title: 'Hello World',     status: 'published', views: 1234 },
  { id: 2, title: 'Getting Started', status: 'draft',     views: 0    },
]

const columns: Column[] = [
  { key: 'id',     label: 'ID',     type: 'number', width: 60 },
  { key: 'title',  label: 'Title',  sortable: true },
  { key: 'status', label: 'Status', width: 110 },
  { key: 'views',  label: 'Views',  type: 'number', align: 'right', sortable: true },
]
<\/script>

<template>
  <DataTable
    :datasource="rows"
    :columns="columns"
    :toolbar="{ title: 'My table', searchable: true }"
  />
</template>`

const codeClientMode = `<!-- Local array -->
<DataTable
  :datasource="myRows"
  :columns="columns"
  :pagination="true"
  :page-size="10"
/>`

const codeServerMode = `<!-- Server mode: pass a URL string -->
<DataTable
  datasource="https://api.example.com/data"
  :columns="columns"
  :pagination="true"
  :page-size="10"
  @server-request="onRequest"
  @server-response="onResponse"
/>`

const codeServerResponse = `// Expected server response
interface ServerResponse {
  success: boolean
  data: TableRow[]   // Rows for the current page
  total: number      // Total items (for pagination)
  page: number       // Current page (1-based)
  totalPages: number // Total number of pages
  error?: string
}`

const codeColumnInterface = `interface Column {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select' | 'email' | 'url' | 'password'
  sortable?: boolean
  resizable?: boolean
  draggable?: boolean
  filterable?: boolean
  editable?: boolean
  filterType?: 'text' | 'select' | 'dateRange' | 'numberRange' | 'boolean' | 'custom'
  filterOperator?: FilterOperator
  filterOptions?: string[] | FilterOption[]
  align?: 'left' | 'center' | 'right'
  width?: string | number
  minWidth?: string | number
  maxWidth?: string | number
  showTooltip?: boolean
  wrap?: boolean
  validation?: {
    enabled?: boolean
    required?: boolean
    min?: number
    max?: number
    pattern?: RegExp
    customMessage?: string
  }
}`

const codeColumnAlign = `const columns: Column[] = [
  { key: 'id',    label: 'ID',    align: 'center', width: 60 },
  { key: 'title', label: 'Title', align: 'left',   minWidth: 200 },  // default
  { key: 'price', label: 'Price', align: 'right',  width: 100, type: 'number' },
]`

const codeExternalFilters = `<script setup>
const filters = ref({})
<\/script>

<DataTable
  :datasource="rows"
  :columns="columns"
  v-model:filters="filters"
/>

<!-- Filter from outside -->
<button @click="filters = { status: { operator: 'eq', value: 'published' } }">
  Published only
</button>`

const codeBulkAction = `interface BulkAction {
  key: string
  label: string
  variant?: 'solid' | 'outline' | 'soft' | 'ghost' | 'subtle' | 'link'
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'neutral'
}

// Usage:
<DataTable
  :selectable="true"
  :bulk-actions="[
    { key: 'publish', label: 'Publish', color: 'success' },
    { key: 'delete',  label: 'Delete',  color: 'error'   },
  ]"
  @bulk-action="(action, rows) => handleBulk(action, rows)"
/>`

const codeCellSlot = `<DataTable :datasource="rows" :columns="columns">
  <!-- Named slot #cell-{columnKey} -->
  <template #cell-status="{ value, row, column }">
    <span :class="value === 'published' ? 'text-green-600' : 'text-gray-400'">
      {{ value }}
    </span>
  </template>

  <!-- Custom header slot -->
  <template #header-title>
    <span class="flex items-center gap-1">Title</span>
  </template>
</DataTable>`

const codeRowDetailSlot = `<DataTable
  :datasource="rows"
  :columns="columns"
  :expandable="true"
  :row-detail-url="(row) => \`/api/items/\${row.id}\`"
>
  <template #row-detail="{ row, detail, loading, error, reload }">
    <div v-if="loading">Loading…</div>
    <div v-else-if="error">
      Error: {{ error }}
      <button @click="reload">Retry</button>
    </div>
    <div v-else>
      <pre>{{ detail }}</pre>
    </div>
  </template>
</DataTable>`

const codeValidation = `const columns: Column[] = [
  {
    key: 'email',
    label: 'Email',
    editable: true,
    validation: {
      enabled: true,
      required: true,
      pattern: /^[^@]+@[^@]+\\.[^@]+$/,
      customMessage: 'Invalid email',
    }
  },
  {
    key: 'name',
    label: 'Name',
    editable: true,
    validation: {
      enabled: true,
      required: true,
      min: 2,
      max: 50,
    }
  }
]`

const codeThemeOverride = `// Override only the keys you need
const theme = {
  container: 'bg-slate-900 rounded-xl border border-slate-700 overflow-hidden',
  headerBackground: 'bg-slate-800',
  rowHover: 'hover:bg-slate-700/50',
  rowSelected: 'bg-blue-900/40',
}

<DataTable :theme="theme" variant="default-dark" />`

const codeTableTheme = `interface TableTheme {
  // Container
  container?: string
  wrapper?: string
  borderRadius?: string
  shadow?: string
  tableBorder?: string
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
  // Text colors
  paginationText?: string
  filterText?: string
  emptyStateText?: string
  loadingText?: string
  infoText?: string
}`

const codeToolbar = `// Config object (recommended)
const toolbar = {
  title: 'My table',
  searchable: true,
  searchPlaceholder: 'Search…',
  showColumns: true,   // Toggle visible columns
  showExport: true,    // Export button
  showRefresh: true,   // Refresh button
}

// Disable entirely
<DataTable :toolbar="false" />

// Enable with defaults
<DataTable :toolbar="true" />`

// ========== PROP TABLES DATA ==========
const serverModeParams = [
  { name: 'page',     type: 'number', desc: 'Current page (1-based).' },
  { name: 'pageSize', type: 'number', desc: 'Items per page.' },
  { name: 'search',   type: 'string', desc: 'Global search term.' },
  { name: 'sort',     type: 'object', desc: '{ key, direction } or null.' },
  { name: 'filters',  type: 'object', desc: 'Active per-column filters.' },
]

const paginationProps = [
  { name: 'pagination',       type: 'boolean',             default: 'true',      desc: 'Enable pagination.' },
  { name: 'mode',             type: 'string',              default: 'paginated', desc: 'loadMore | gridInfinite.' },
  { name: 'pageSize',         type: 'number',              default: '10',        desc: 'Initial page size.' },
  { name: 'pageSizeSelector', type: 'boolean | number[]',  default: 'false',     desc: 'Page size selector.' },
]

const selectionProps = [
  { name: 'selectable',  type: 'boolean',      default: 'false', desc: 'Enable multi-row selection.' },
  { name: 'bulkActions', type: 'BulkAction[]', default: '[]',    desc: 'Bulk actions exposed in the toolbar.' },
  { name: 'rowIdKey',    type: 'string',       default: 'id',    desc: 'Unique identifier key per row.' },
]

const editingProps = [
  { name: 'column.editable',   type: 'boolean', default: 'false', desc: 'Make the column editable on click.' },
  { name: 'column.validation', type: 'object',  default: 'null',  desc: 'Inline validation rules.' },
  { name: 'column.type',       type: 'string',  default: 'text',  desc: 'Determines the input type.' },
]

const slotsReference = [
  { name: '#cell-{key}',      type: '{ value, row, column }',                  desc: 'Custom cell content.' },
  { name: '#header-{key}',    type: '{ column }',                              desc: 'Custom column header.' },
  { name: '#row-detail',      type: '{ row, detail, loading, error, reload }', desc: 'Expandable row detail.' },
  { name: '#empty',           type: '{}',                                      desc: 'Custom empty state.' },
  { name: '#toolbar-actions', type: '{}',                                      desc: 'Custom toolbar buttons.' },
  { name: '#toolbar-filters', type: '{}',                                      desc: 'Custom toolbar filters.' },
  { name: '#footer',          type: '{}',                                      desc: 'Content rendered after the table.' },
]

const modernEvents = [
  { name: 'selection-change', type: '(rows: TableRow[]) => void',                desc: 'Selection changed.' },
  { name: 'export',           type: '(rows?: TableRow[]) => void',               desc: 'Export triggered.' },
  { name: 'refresh',          type: '() => void',                                desc: 'Manual refresh.' },
  { name: 'bulk-action',      type: '(action: string, rows: TableRow[]) => void', desc: 'Bulk action triggered.' },
  { name: 'data-change',      type: '(data: TableRow[]) => void',                desc: 'Data changed (client mode).' },
  { name: 'filters-change',   type: '(filters: ColumnFilter) => void',           desc: 'Filters changed.' },
  { name: 'server-request',   type: '(params: LoadDataParams) => void',          desc: 'Before server request.' },
  { name: 'server-response',  type: '(result: DataLoadedResult) => void',        desc: 'After server response.' },
  { name: 'error',            type: '(error: Error) => void',                    desc: 'Server error.' },
]

const vmodelBindings = [
  { name: 'v-model:search',   type: 'string',                       desc: 'Global search (controlled).' },
  { name: 'v-model:filters',  type: 'ColumnFilter',                 desc: 'Column filters (controlled).' },
  { name: 'v-model:sort',     type: '{ key, direction } | null',    desc: 'Active sort (controlled).' },
  { name: 'v-model:expanded', type: 'Array<string | number>',       desc: 'Expanded rows (controlled).' },
]

const legacyEvents = [
  { name: 'rows-selected', type: '(rows: TableRow[]) => void', desc: 'Use selection-change instead.' },
  { name: 'row-select',    type: '(row, selected) => void',    desc: 'Use selection-change instead.' },
  { name: 'filter-change', type: '(key, value) => void',       desc: 'Use filters-change instead.' },
  { name: 'load-data',     type: '(params) => void',           desc: 'Use server-request instead.' },
  { name: 'data-loaded',   type: '(result) => void',           desc: 'Use server-response instead.' },
]

const toolbarProps = [
  { name: 'title',             type: 'string',  default: '',        desc: 'Title displayed in the toolbar.' },
  { name: 'searchable',        type: 'boolean', default: 'false',   desc: 'Enable the search input.' },
  { name: 'searchPlaceholder', type: 'string',  default: 'Search…', desc: 'Placeholder of the search input.' },
  { name: 'showColumns',       type: 'boolean', default: 'false',   desc: 'Column visibility toggle.' },
  { name: 'showExport',        type: 'boolean', default: 'false',   desc: 'Export button.' },
  { name: 'showRefresh',       type: 'boolean', default: 'false',   desc: 'Refresh button.' },
]

const propsDataSource = [
  { name: 'datasource', type: 'TableRow[] | string', default: '—',     desc: 'Local data array or API URL.' },
  { name: 'columns',    type: 'Column[]',            default: '—',     desc: 'Column definitions (required).' },
  { name: 'rowIdKey',   type: 'string',              default: 'id',    desc: 'Unique key per row.' },
  { name: 'loading',    type: 'boolean',             default: 'false', desc: 'Force the loading state.' },
]

const propsDisplay = [
  { name: 'variant', type: 'TableVariant',            default: 'default', desc: 'Predefined visual theme.' },
  { name: 'size',    type: 'TableSize',               default: 'md',      desc: 'xs | sm | md | lg.' },
  { name: 'theme',   type: 'TableTheme',              default: '{}',      desc: 'Custom theme override.' },
  { name: 'sticky',  type: 'boolean',                 default: 'false',   desc: 'Sticky header on scroll.' },
  { name: 'wrap',    type: 'boolean',                 default: 'false',   desc: 'Wrap text in cells.' },
  { name: 'toolbar', type: 'boolean | ToolbarConfig', default: 'false',   desc: 'Enable / configure the toolbar.' },
]

const propsBehavior = [
  { name: 'selectable',  type: 'boolean',      default: 'false',     desc: 'Enable selection.' },
  { name: 'expandable',  type: 'boolean',      default: 'false',     desc: 'Enable master / detail.' },
  { name: 'searchable',  type: 'boolean',      default: 'false',     desc: 'Enable global search.' },
  { name: 'pagination',  type: 'boolean',      default: 'true',      desc: 'Enable pagination.' },
  { name: 'mode',        type: 'string',       default: 'paginated', desc: 'loadMore | gridInfinite.' },
  { name: 'pageSize',    type: 'number',       default: '10',        desc: 'Rows per page.' },
  { name: 'bulkActions', type: 'BulkAction[]', default: '[]',        desc: 'Bulk actions.' },
  { name: 'debug',       type: 'boolean',      default: 'false',     desc: 'Verbose console logs.' },
]

const propsRowDetail = [
  { name: 'expandable',        type: 'boolean',                  default: 'false',     desc: 'Enable expandable row detail.' },
  { name: 'rowDetailUrl',      type: 'string | ((row)=>string)', default: 'undefined', desc: 'Fetch URL for the detail.' },
  { name: 'rowDetailQuery',    type: 'object | ((row)=>object)', default: '{}',        desc: 'Detail query parameters.' },
  { name: 'rowDetailCache',    type: 'boolean',                  default: 'true',      desc: 'Cache the detail by rowId.' },
  { name: 'rowDetailAutoLoad', type: 'boolean',                  default: 'true',      desc: 'Auto-fetch on expand.' },
  { name: 'rowDetailResolver', type: '(row) => unknown',         default: 'undefined', desc: 'Custom resolver (no fetch).' },
]
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
