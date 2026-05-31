# DataTable — Plan d'amélioration complet

> Audit effectué le 30 mai 2026.  
> Objectif : rendre la grille plus robuste, plus propre et utiliser du HTML sémantique natif avec TailwindCSS partout.

---

## 1. État actuel — Architecture

```
frontend/app/
├── components/
│   ├── DataTable.vue                   # Orchestrateur principal (~1 690 lignes)
│   ├── DataTableBody.vue               # Rendu des lignes (tbody)
│   ├── DataTableHeader.vue             # Rendu des colonnes (thead)
│   ├── DataTablePagination.vue         # Pagination / loadMore / infinite
│   ├── DataTableToolbar.vue            # Barre d'outils (search, filtres, bulk)
│   ├── DataTableColumnMenuContent.vue  # Menu popover colonnes + filtres
│   ├── DataTableSkeletonRows.vue       # Lignes squelette
│   └── DataTableRowDetailDefault.vue   # Slot master/detail par défaut
│
├── composables/
│   ├── useDataTableCore.ts             # State central + API publique
│   ├── useDataTableClientPipeline.ts   # Search global + filtres col + tri client
│   ├── useDataTableColumnInteractions.ts # Resize + drag & drop colonnes
│   ├── useDataTableColumnMenu.ts       # État + bindings menu colonnes
│   ├── useDataTableEditing.ts          # Édition inline
│   ├── useDataTableFiltersModel.ts     # Helpers modèle filtres (opérateurs…)
│   ├── useDataTableGridInfinite.ts     # Cache fenêtre gridInfinite
│   ├── useDataTableInfiniteScroll.ts   # IntersectionObserver scroll infini
│   ├── useDataTableLoadingPreservation.ts # Overlay + preservation des lignes
│   ├── useDataTableModelSync.ts        # Sync v-model:search/filters/sort
│   ├── useDataTablePagination.ts       # Calculs pagination
│   ├── useDataTableRowDetail.ts        # Master/detail lazy-load + cache
│   ├── useDataTableServerLoader.ts     # Fetch serveur + gestion pages
│   ├── useDataTableStyles.ts           # Classes CSS dynamiques
│   └── useDataTableTheme.ts            # Thème + classes conteneur/table
│
├── types/datatable.types.ts            # Tous les types TypeScript
├── constants/datatable.constants.ts    # Constantes centralisées
├── utils/
│   ├── datatable-filters.ts            # buildDefaultColumnFilterValue
│   └── structural.ts                   # deepClone, stableStringify
└── validators/datatable.validators.ts  # Validation des props
```

---

## 2. Points forts actuels ✅

- Pipeline client optimisé O(1) : `Set.has`, `Map`, `WeakMap` pour index search global
- Tri stable (Schwartz transform)
- Filtres en single-pass via prédicats compilés
- Maps `rowById`/`rowIndexById` exposées par le core → lookups O(1)
- Thème, styles, menu colonnes et pipeline dans des composables dédiés
- Support client + server, paginated / loadMore / infinite / gridInfinite
- Master/detail avec lazy-load HTTP ou resolver client-side
- TypeScript strict, typecheck `vue-tsc` OK

---

## 3. Améliorations prioritaires

### 3.1 HTML sémantique natif avec TailwindCSS

**Situation actuelle :** La table utilise bien `<table>/<thead>/<tbody>/<tr>/<th>/<td>` à certains endroits mais les composants wrapper (`DataTablePagination`, `DataTableToolbar`) utilisent des `<div>` là où des éléments sémantiques HTML seraient plus appropriés.

**Plan :**

```html
<!-- DataTablePagination : nav sémantique -->
<nav aria-label="Pagination" class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
  <p class="text-sm text-gray-700">
    Showing <span class="font-medium">{{ from }}</span> to <span class="font-medium">{{ to }}</span>
    of <span class="font-medium">{{ total }}</span> results
  </p>
  <div class="flex items-center gap-1">
    <button type="button" :disabled="page === 1"
      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300
             bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
      <span class="sr-only">Previous</span>
      <!-- chevron left icon -->
    </button>
    <!-- pages -->
    <button type="button"
      v-for="p in pages" :key="p"
      :aria-current="p === page ? 'page' : undefined"
      :class="[
        'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
        p === page
          ? 'z-10 bg-primary-600 border-primary-600 text-white'
          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
      ]"
      @click="emit('update:page', p)">
      {{ p }}
    </button>
    <button type="button" :disabled="page === totalPages"
      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300
             bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
      <span class="sr-only">Next</span>
    </button>
  </div>
</nav>

<!-- DataTableToolbar : utiliser role="toolbar" sur la barre d'actions -->
<div role="toolbar" aria-label="Table actions"
  class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-gray-200">
  <!-- search -->
  <div class="relative max-w-sm">
    <label for="dt-search" class="sr-only">Search</label>
    <input id="dt-search" type="search" v-model="searchModel"
      class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm
             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      :placeholder="toolbarConfig?.searchPlaceholder || 'Search…'" />
    <!-- search icon -->
  </div>
  <!-- actions slot -->
</div>

<!-- DataTableHeader : th sémantiques avec scope et aria-sort -->
<thead :class="headerClasses">
  <tr>
    <th v-if="selectable" scope="col"
      class="w-12 px-3 py-3.5 text-left">
      <input type="checkbox" :checked="allCurrentSelected" :indeterminate.prop="someSelected"
        class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
        @change="toggleSelectAll($event.target.checked)" />
    </th>
    <th
      v-for="column in orderedColumns" :key="column.key"
      scope="col"
      :aria-sort="getSortAriaSort(column.key)"
      :class="getHeaderCellClasses(column)"
      :style="getColumnStyles(column)">
      <!-- contenu tri / filtre -->
    </th>
  </tr>
</thead>

<!-- DataTableBody : caption pour accessibilité -->
<table role="grid" :aria-rowcount="totalRows" :aria-colcount="colCount"
  class="min-w-full divide-y divide-gray-300">
  <caption class="sr-only">{{ caption || 'Data table' }}</caption>
  <thead>…</thead>
  <tbody class="divide-y divide-gray-200 bg-white">
    <tr v-for="(row, index) in pagedRows" :key="getRowId(row)"
      :aria-rowindex="index + 1"
      :aria-selected="selectedIds.has(getRowId(row))"
      :class="getRowClasses(index, getRowId(row))"
      @click="handleRowClick(row, $event)">
      <td v-if="selectable" role="gridcell"
        class="w-12 px-3 py-4 text-center">
        <input type="checkbox" :checked="selectedIds.has(getRowId(row))"
          class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
          @change="toggleSelect(getRowId(row), $event.target.checked)"
          @click.stop />
      </td>
      <td v-for="column in orderedColumns" :key="column.key"
        role="gridcell"
        :class="getBodyCellClasses(column.key, column)"
        :style="getColumnStyles(column)">
        <slot :name="`cell-${column.key}`" :row="row" :value="getColumnValue(row, column.key)">
          {{ getColumnValue(row, column.key) }}
        </slot>
      </td>
    </tr>
  </tbody>
</table>
```

**Gains :** accessibilité screen-reader, SEO, navigation clavier, moins de composants UI tiers nécessaires.

---

### 3.2 Remplacer les composants UI Nuxt (`USelect`, `UInput`, etc.) par du HTML + Tailwind

**Situation actuelle :** `DataTableToolbar`, `DataTablePagination`, `DataTableColumnMenuContent` dépendent de `USelect`, `UInput`, `UButton`, `UBadge`, `UPagination`, `USkeleton`, `UIcon` → couplage fort à Nuxt UI.

**Plan d'action :**

| Composant Nuxt UI | Remplacement HTML + Tailwind |
|---|---|
| `<UInput>` | `<input type="text" class="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:ring-2 focus:ring-primary-500">` |
| `<USelect>` | `<select class="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:ring-2 focus:ring-primary-500">` |
| `<UButton>` | `<button type="button" class="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium …">` |
| `<UBadge>` | `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">` |
| `<UCheckbox>` | `<input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600">` |
| `<UPagination>` | `<nav>` avec `<button>` (voir §3.1) |
| `<USkeleton>` | `<div class="animate-pulse bg-gray-200 rounded h-4 w-24">` |
| `<UIcon>` | SVG inline ou sprite — supprimer la dépendance héroicons dynamique |

---

### 3.3 DataTable.vue — Extractions restantes

**Situation actuelle :** ~1 690 lignes. Reste encore du "glue code" qui peut sortir.

| Bloc | Taille estimée | Composable cible |
|---|---|---|
| Selection / row-click / bulk actions | ~120 lignes | `useDataTableSelection` |
| Server mode watchers + refresh logic | ~80 lignes | déplacer dans `useDataTableServerLoader` |
| `applyOperatorFilter` (100 lignes) | ~100 lignes | déplacer dans `useDataTableClientPipeline` |
| `getColumnValue` / `getColumnStyles` / `getBodyCellClasses` | ~60 lignes | déjà dans `useDataTableStyles`, compléter |
| `handleBulkAction` / `onToolbarBulkAction` | ~30 lignes | `useDataTableSelection` |

**Cible : < 1 000 lignes** pour DataTable.vue (orchestrateur pur).

---

### 3.4 Colonne `Column` — Améliorations du type

**Manquant actuellement :**

```ts
export interface Column {
  // Existant : key, label, type, sortable, filterable, resizable, draggable, editable…

  // À ajouter :
  hidden?: boolean                   // Permet de définir une colonne hidden par défaut sans la supprimer
  pinned?: 'left' | 'right'          // Colonnes épinglées (sticky left/right)
  headerTooltip?: string             // Tooltip sur le header
  cellRenderer?: string              // Nom d'un composant Vue enregistré globalement
  exportable?: boolean               // Inclure dans l'export CSV (default: true)
  searchable?: boolean               // Inclure dans la recherche globale (default: true)
  disableSorting?: boolean           // Alias plus explicite que !sortable
  className?: string                 // Classe CSS custom pour les cellules de cette colonne
  headerClassName?: string           // Classe CSS custom pour le <th>
}
```

---

### 3.5 Export CSV natif

**Manquant :** l'event `export` est émis mais rien ne génère réellement le CSV côté DataTable.

**Plan :**

```ts
// utils/datatable-export.ts
export function exportToCsv(
  rows: TableRow[],
  columns: Column[],
  filename = 'export.csv'
): void {
  const exportable = columns.filter(c => c.exportable !== false)
  const header = exportable.map(c => JSON.stringify(c.label)).join(',')
  const body = rows
    .map(row =>
      exportable
        .map(c => {
          const val = row[c.key] ?? ''
          return JSON.stringify(String(val))
        })
        .join(',')
    )
    .join('\n')

  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

Appel depuis DataTable.vue : `onExport` → `exportToCsv(selectedRows.length ? selectedRows : filteredData.value, columns)`.

---

### 3.6 Colonnes épinglées (sticky left/right)

**Non implémenté.** 

**Plan :**

```ts
// Dans useDataTableTheme ou useDataTableStyles
function getPinnedColumnStyle(column: Column, pinnedColumns: Column[]): string {
  if (!column.pinned) return ''

  if (column.pinned === 'left') {
    const leftOffset = pinnedColumns
      .filter(c => c.pinned === 'left')
      .slice(0, pinnedColumns.findIndex(c => c.key === column.key))
      .reduce((acc, c) => acc + (Number(c.width) || 160), 0)
    return `position: sticky; left: ${leftOffset}px; z-index: 1;`
  }

  if (column.pinned === 'right') {
    // calcul symétrique depuis la droite
    const rightOffset = pinnedColumns
      .filter(c => c.pinned === 'right')
      .slice(pinnedColumns.findIndex(c => c.key === column.key) + 1)
      .reduce((acc, c) => acc + (Number(c.width) || 160), 0)
    return `position: sticky; right: ${rightOffset}px; z-index: 1;`
  }

  return ''
}
```

Classes Tailwind à ajouter sur `<th>` et `<td>` : `sticky left-0 z-10 bg-white shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]`

---

### 3.7 Virtualisation des lignes (performance > 1 000 lignes)

**Non implémenté.** Pour les cas client-mode avec beaucoup de données.

**Plan (option légère sans librairie) :**

```ts
// useDataTableVirtualScroll.ts
export function useDataTableVirtualScroll(args: {
  rows: ComputedRef<TableRow[]>
  rowHeight: number      // hauteur fixe par ligne (px)
  containerHeight: number // hauteur visible du conteneur
}) {
  const scrollTop = ref(0)

  const visibleStart = computed(() => Math.floor(scrollTop.value / args.rowHeight))
  const visibleEnd = computed(() =>
    Math.min(
      args.rows.value.length,
      Math.ceil((scrollTop.value + args.containerHeight) / args.rowHeight) + 1
    )
  )

  const visibleRows = computed(() => args.rows.value.slice(visibleStart.value, visibleEnd.value))

  const paddingTop = computed(() => visibleStart.value * args.rowHeight)
  const paddingBottom = computed(() =>
    (args.rows.value.length - visibleEnd.value) * args.rowHeight
  )

  return { scrollTop, visibleRows, paddingTop, paddingBottom }
}
```

Activable via une prop `virtual?: boolean` sur DataTable.

---

### 3.8 Édition inline — Compléter le workflow

**Partiellement implémenté** (`useDataTableEditing`).

**Manquant :**
- Édition de cellules de type `select` (dropdown inline)
- Touche `Tab` pour passer à la cellule suivante
- Annulation avec `Escape` qui restaure la valeur originale
- Validation visuelle cohérente (border rouge / vert sur la cellule en cours)

---

### 3.9 Filtres avancés — Types manquants

**Actuellement supportés :** `text`, `select`, `dateRange`, `numberRange`, `boolean`, `custom`

**À ajouter :**

```ts
export type ColumnFilterType =
  | 'text' | 'select' | 'dateRange' | 'numberRange'
  | 'boolean' | 'custom'
  | 'multiText'    // Plusieurs valeurs texte (tags input) — filtre IN
  | 'relative'     // "il y a 7 jours", "ce mois" — filtre date relatif
  | 'color'        // Picker couleur pour filtrer par couleur de badge
```

---

### 3.10 Accessibilité — Checklist à compléter

| Critère | État actuel | Action |
|---|---|---|
| `role="grid"` sur `<table>` | ✅ `role="table"` | Passer à `role="grid"` (table interactive) |
| `aria-sort` sur les `<th>` triables | ⚠️ absent | Ajouter `aria-sort="ascending/descending/none"` |
| `aria-colcount` | ✅ | OK |
| `aria-rowcount` | ✅ | OK |
| `aria-rowindex` sur chaque `<tr>` | ✅ | OK |
| `<caption>` avec description | ⚠️ absent | Ajouter via prop `caption` |
| Navigation clavier dans les filtres | ⚠️ partiel | Ajouter `role="dialog"` sur le popover menu |
| Focus trap dans le popover colonnes | ⚠️ absent | Implémenter focus trap |
| `aria-label` sur les boutons de tri | ⚠️ partiel | Compléter avec la direction actuelle |
| `<input type="checkbox">` avec labels | ⚠️ labels SR-only | Renforcer les `aria-label` |

---

## 4. Feuille de route

### Sprint 1 — HTML sémantique + Tailwind natif (sans Nuxt UI)
1. [ ] Remplacer `<UInput>` → `<input>` dans Toolbar + ColumnMenu
2. [ ] Remplacer `<USelect>` → `<select>` dans Toolbar + Pagination
3. [ ] Remplacer `<UButton>` → `<button>` dans Toolbar + Pagination
4. [ ] Remplacer `<UCheckbox>` → `<input type="checkbox">` dans Body + Header
5. [ ] Remplacer `<UPagination>` → `<nav>` + `<button>` (§3.1)
6. [ ] Remplacer `<USkeleton>` → `<div class="animate-pulse …">` dans SkeletonRows
7. [ ] Ajouter `aria-sort` sur tous les `<th>` triables
8. [ ] Ajouter `<caption class="sr-only">` dans `<table>`

### Sprint 2 — DataTable.vue < 1 000 lignes
1. [ ] Extraire `useDataTableSelection` (selection + bulk actions)
2. [ ] Déplacer `applyOperatorFilter` dans `useDataTableClientPipeline`
3. [ ] Consolider server-mode watchers dans `useDataTableServerLoader`

### Sprint 3 — Nouvelles fonctionnalités
1. [ ] Export CSV natif (`utils/datatable-export.ts`)
2. [ ] Colonnes épinglées (sticky left/right) — prop `pinned`
3. [ ] Prop `caption` pour la table (accessibilité)
4. [ ] Compléter édition inline (Tab, Escape, select inline)

### Sprint 4 — Performance & Edge cases
1. [ ] Virtualisation lignes (`useDataTableVirtualScroll`) — activable via `virtual: true`
2. [ ] Filtres avancés (multiText, relative)
3. [ ] Focus trap dans le popover colonnes

---

## 5. Exemple cible — Usage HTML sémantique + Tailwind pur

```vue
<template>
  <!-- Barre d'outils -->
  <div role="toolbar" aria-label="Publications table actions"
    class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
    
    <div class="flex items-center gap-3">
      <h2 class="text-lg font-semibold text-gray-900">Publications</h2>
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        {{ total }} items
      </span>
    </div>

    <div class="flex items-center gap-2">
      <div class="relative">
        <label for="publications-search" class="sr-only">Search publications</label>
        <input
          id="publications-search"
          type="search"
          v-model="search"
          placeholder="Search…"
          class="block w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm
                 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500
                 focus:border-primary-500 sm:text-sm"
        />
        <svg class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>

      <button type="button"
        class="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-md
               text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none
               focus:ring-2 focus:ring-primary-500">
        <svg class="h-4 w-4" …/>
        Export CSV
      </button>
    </div>
  </div>

  <!-- Table -->
  <div class="overflow-x-auto">
    <table role="grid" aria-rowcount="total"
      class="min-w-full divide-y divide-gray-300">
      
      <caption class="sr-only">Publications — liste des articles avec statut et métriques</caption>

      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="w-12 px-3 py-3.5 text-center">
            <input type="checkbox" :checked="allSelected" :indeterminate.prop="someSelected"
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              @change="toggleSelectAll($event.target.checked)"
              aria-label="Select all rows" />
          </th>
          <th
            v-for="col in columns" :key="col.key"
            scope="col"
            :aria-sort="getSortAriaSort(col.key)"
            :class="[
              'px-3 py-3.5 text-left text-sm font-semibold text-gray-900',
              col.sortable ? 'cursor-pointer select-none hover:bg-gray-100 group' : ''
            ]"
            @click="col.sortable ? toggleSort(col.key) : undefined">
            <div class="flex items-center gap-1">
              {{ col.label }}
              <svg v-if="col.sortable" class="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-opacity"
                :class="sortKey === col.key ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
                …/>
            </div>
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-200 bg-white">
        <tr
          v-for="(row, index) in pagedRows" :key="row.id"
          :aria-rowindex="index + 1"
          :aria-selected="selectedIds.has(row.id)"
          :class="[
            'transition-colors',
            selectedIds.has(row.id) ? 'bg-primary-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50',
            'hover:bg-primary-50/60 cursor-pointer'
          ]"
          @click="handleRowClick(row, $event)">

          <td role="gridcell" class="w-12 px-3 py-4 text-center">
            <input type="checkbox" :checked="selectedIds.has(row.id)"
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              @change="toggleSelect(row.id, $event.target.checked)"
              @click.stop
              :aria-label="`Select row ${index + 1}`" />
          </td>

          <td v-for="col in columns" :key="col.key"
            role="gridcell"
            :class="getBodyCellClasses(col.key, col)">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              <span class="text-sm text-gray-900">{{ row[col.key] }}</span>
            </slot>
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-if="pagedRows.length === 0 && !loading">
          <td :colspan="colCount + 1" class="px-3 py-12 text-center">
            <p class="text-sm text-gray-500">No results found.</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  <nav aria-label="Table pagination"
    class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
    
    <p class="text-sm text-gray-700">
      Showing <span class="font-medium">{{ from }}</span>–<span class="font-medium">{{ to }}</span>
      of <span class="font-medium">{{ total }}</span>
    </p>

    <div class="flex items-center gap-1">
      <button type="button"
        :disabled="page === 1"
        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300
               bg-white text-sm text-gray-500 hover:bg-gray-50
               disabled:opacity-40 disabled:cursor-not-allowed focus:z-10 focus:outline-none
               focus:ring-2 focus:ring-primary-500"
        @click="emit('update:page', page - 1)"
        aria-label="Previous page">
        <svg class="h-5 w-5" …/>
      </button>

      <button
        v-for="p in pageRange" :key="p"
        type="button"
        :aria-current="p === page ? 'page' : undefined"
        :class="[
          'relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary-500',
          p === page
            ? 'z-10 bg-primary-600 border-primary-600 text-white'
            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
        ]"
        @click="emit('update:page', p)">
        {{ p }}
      </button>

      <button type="button"
        :disabled="page === totalPages"
        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300
               bg-white text-sm text-gray-500 hover:bg-gray-50
               disabled:opacity-40 disabled:cursor-not-allowed focus:z-10 focus:outline-none
               focus:ring-2 focus:ring-primary-500"
        @click="emit('update:page', page + 1)"
        aria-label="Next page">
        <svg class="h-5 w-5" …/>
      </button>
    </div>
  </nav>
</template>
```

---

## 6. Résumé des bénéfices attendus

| Amélioration | Bénéfice principal |
|---|---|
| HTML sémantique natif | Accessibilité, SEO, moins de JS |
| Tailwind pur (sans Nuxt UI) | Moins de dépendances, bundle plus léger, plus de contrôle |
| Export CSV | Fonctionnalité attendue par les users |
| Colonnes épinglées | UX meilleure sur tables larges |
| Virtualisation | Perf sur > 1 000 lignes client-side |
| DataTable.vue < 1 000 lignes | Maintenabilité, onboarding dev |
| `aria-sort` + `<caption>` | Accessibilité WCAG 2.1 AA |
| Édition inline complète | UX édition in-place robuste |
