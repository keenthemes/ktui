---
name: ktui-datatable
description: >
  KtUI DataTable (KTDataTable) — local/remote data, sorting, filtering, pagination,
  checkbox selection, state persistence, fixed layouts, event system, and architecture.
  Use this skill when building, debugging, or customizing DataTable components.
---

# KTDataTable — AI Agent Reference

Full reference for the DataTable component in [KtUI](https://ktui.io).
Package: `@keenthemes/ktui`. Class: `KTDataTable`. Root attribute: `data-kt-datatable`.

> **Always prefer [ktui.io/docs/datatable](https://ktui.io/docs/datatable) docs and examples over guessing markup or options.**

---

## 1. Basic Usage

```html
<div data-kt-datatable="true">
  <table>
    <thead>
      <tr>
        <th data-kt-datatable-column="name">Name</th>
        <th data-kt-datatable-column="email">Email</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</div>
```

```ts
import { KTDataTable } from '@keenthemes/ktui';

const dt = KTDataTable.getInstance(tableEl);
```

---

## 2. Config Options

| Option | Type | Description |
|--------|------|-------------|
| `apiEndpoint` | string | Remote data URL |
| `requestMethod` | string | HTTP method (default `'POST'`) |
| `requestHeaders` | object | Custom headers |
| `mapResponse` | function | Transform API response |
| `mapRequest` | function | Transform request params |
| `pageSize` | number | Rows per page |
| `pageSizes` | number[] | Page size options |
| `stateSave` | boolean | Persist state in localStorage |
| `columns` | object | Column config (render, checkbox, sortType, sortValue, createdCell) |
| `sort` | object | Sort config with classes and callback |
| `search` | object | Search config with delay and callback |
| `pagination` | object | Pagination markup config |
| `loading` | object | Spinner template |
| `checkbox` | object | Row checkbox config (checkedClass, preserveSelection) |
| `lockedLayout` | object | Sticky headers/columns |
| `tableLayout` | string | `'fixed'` for fixed column widths (use with `<colgroup>`) |
| `filter` | object | Column filter config (type, value) |
| `infoEmpty` | string | Empty state HTML (supports innerHTML) |

---

## 3. Programmatic API

```ts
const dt = KTDataTable.getInstance(tableEl);

dt.sort('name');
dt.sort('name', 'desc');           // explicit sort order
dt.goPage(2);
dt.setPageSize(25);
dt.search('query');
dt.setFilter({ column: 'status', type: 'text', value: 'active' });
dt.reload();        // re-fetch from API
dt.redraw();        // re-render current data
dt.getState();      // { page, sortField, sortOrder, pageSize, ... }
dt.check(value);    // check a row by value
dt.uncheck(value);  // uncheck a row by value
dt.getChecked();    // get array of checked row values
dt.dispose();
```

### Instance management

| Static method | Returns |
|--------------|---------|
| `KTDataTable.getInstance(el)` | Existing instance or `null` |
| `KTDataTable.getOrCreateInstance(el, config?)` | Existing or new instance |
| `KTDataTable.init()` | Scans DOM, creates instances |

---

## 4. Column Config

```ts
columns: {
  name: {
    title: 'Full Name',
    render: (item, data, ctx) => `<strong>${item}</strong>`,
    sortType: 'string', // or 'numeric'
    sortValue: (cellValue, rowData) => rowData.firstName + ' ' + rowData.lastName,
    createdCell: (cell, cellData, rowData, row) => {
      cell.classList.add('text-primary');
    },
  },
  actions: {
    checkbox: true,
  },
}
```

---

## 5. Remote Data Provider

### Response shape

```ts
interface KTDataTableResponseDataInterface {
  data: KTDataTableDataInterface[];
  totalCount: number;
}
```

### Config

```ts
{
  apiEndpoint: 'https://api.example.com/users',
  requestMethod: 'POST',
  requestHeaders: { 'Authorization': 'Bearer ...' },
  mapResponse: (response) => ({ data: response.items, totalCount: response.total }),
  mapRequest: (params) => ({ ...params, page: params.page + 1 }),
}
```

---

## 6. Fixed Column Widths

Use `tableLayout: 'fixed'` with `<colgroup>` for consistent column widths across pages:

```html
<table data-kt-datatable-table="true" style="table-layout: fixed; width: 100%;">
  <colgroup>
    <col style="width: 40px">    <!-- checkbox -->
    <col style="width: 70px">    <!-- ID -->
    <col>                         <!-- Name (auto-fill) -->
    <col style="width: 120px">   <!-- Status -->
  </colgroup>
</table>
```

---

## 7. Column Filters

Client-side filtering with `setFilter()`:

```ts
dt.setFilter({ column: 'status', type: 'text', value: 'active' });
dt.setFilter({ column: 'price', type: 'numeric', value: { min: 10, max: 100 } });
```

Filter pipeline runs between search and sort.

---

## 8. Empty State

**Default:** When `data.length === 0`, renders a single row with `infoEmpty` text (default: `"No records found"`). Supports HTML.

**Custom via data attribute:**

```html
<div data-kt-datatable="true"
     data-kt-datatable-info-empty='<div class="py-10 text-center">No records found</div>'>
```

**Pitfall — never hardcode empty state HTML in `<tbody>`:** The DataTable reads tbody rows as "data" on init. Hardcoded content gets treated as 1 row and disappears on re-render. Always use `data-kt-datatable-info-empty` or the JS `infoEmpty` config.

---

## 9. Event System

All events dispatch through dual channel:
1. **Internal callbacks** (`.on()`) — bare name
2. **DOM CustomEvents** (`addEventListener`) — namespaced as `kt.datatable.<event>`

| Event | Payload | When |
|-------|---------|------|
| `update` | — | Data changed. Call `getState()` for details. |
| `sort` | `{ field, order }` | Column header click |
| `change` | `{ cancel }` | Before checkbox toggle (cancelable) |
| `changed` | — | After checkbox change. Call `getChecked()`. |
| `checked` | `{ value }` | Row checked |
| `unchecked` | `{ value }` | Row unchecked |
| `fetchError` | `{ response, error, status, statusText }` | Remote JSON parse failure |
| `error` | `{ error }` | Network fetch failure |

```ts
// Internal callback
dt.on('sort', (payload) => { console.log(payload.field); });

// DOM CustomEvent
el.addEventListener('kt.datatable.sort', (e) => {
  console.log(e.detail.payload.field);
});
```

---

## 10. Architecture

Source: `src/components/datatable/`

| File | Purpose |
|------|---------|
| `datatable.ts` | Main class — constructor, `_updateData()`, `_draw()`, `_finalize()`, `_dispose()` |
| `datatable-local-provider.ts` | Local mode data fetch with checksum-based DOM invalidation |
| `datatable-remote-provider.ts` | Remote API mode with AbortController |
| `datatable-state-store.ts` | State management — `patchState()`, `setPage()`, `setSort()` |
| `datatable-checkbox.ts` | Checkbox handler — header check, row check, `reapplyCheckedStates()` |
| `datatable-table-renderer.ts` | Renders data rows into `<tbody>` |
| `datatable-pagination-renderer.ts` | Renders pagination buttons, page size selector |
| `datatable-sort.ts` | Column sort handler with AbortController-based cleanup |
| `datatable-defaults.ts` | `DATATABLE_DEFAULTS` — static config constants |
| `datatable-utils.ts` | Shared `stripHtml()` utility |
| `datatable-search-handler.ts` | Debounced search input handler |
| `datatable-state-persistence.ts` | localStorage save/load with try/catch guards |
| `datatable-registry.ts` | Instance Map + DOM fallback |
| `datatable-layout-plugin.ts` | Sticky header/locked columns plugin |
| `datatable-spinner.ts` | Loading spinner show/hide |
| `datatable-contracts.ts` | Interfaces and type contracts |
| `datatable-column-utils.ts` | Column resolution utilities |
| `types.ts` | Type definitions (config, state, data interfaces) |
| `index.ts` | Barrel exports |

### Lifecycle (Critical)

Every data update follows this sequence:

```
_updateData()
  ├── fetchSync() or fetch()     ← reads from DOM or API
  ├── _draw()
  │     ├── _cleanupForRedraw()  ← cleans listeners + DOM artifacts (NOT registry)
  │     ├── _updateTable()       ← re-renders tbody rows
  │     ├── _updatePagination()  ← re-renders pagination buttons
  │     ├── afterDraw layoutPlugin hook
  │     └── _saveState()         ← persists to localStorage
  ├── _finalize()
  │     ├── _checkbox.init()     ← re-queries DOM, calls reapplyCheckedStates()
  │     ├── _sortHandler.initSort()
  │     ├── searchHandler.attach()
  │     ├── KTComponents.init()
  │     ├── spinner.hide()
  │     └── update _contentChecksum  ← MUST be last (after DOM modifications)
  └── emit 'update'
```

**ORDER MATTERS.** `_finalize()` modifies the DOM. Any checksum saved before `_finalize()` will be stale.

---

## 11. Pitfalls

| Problem | Cause | Fix |
|---------|-------|-----|
| Empty pagination after checkbox select | `_contentChecksum` saved before `_finalize()` | Save checksum at END of `_finalize()` |
| Corrupted localStorage persists | State shrank `originalData` to current page | `localStorage.removeItem('kt_datatable_<id>')` |
| Sort listener leak | `cloneNode(true)` destroys th attrs | Uses AbortController pattern internally |
| Filter stored but never applied | `setFilter()` writes to state but `fetchSync()` ignores it | Filter pipeline runs between search and sort |
| Hardcoded empty state in `<tbody>` | DataTable reads tbody rows as "data" on init | Use `data-kt-datatable-info-empty` attribute instead |
| Column widths shift on pagination | `table-layout: auto` recalculates per page | Use `table-layout: fixed` with `<colgroup>` |
| Checkbox events invisible to `addEventListener` | Was only internal callbacks | Now dispatches as `kt.datatable.*` CustomEvents |
| Parallel refactoring on shared repo fails | Tight coupling between files | Execute sequentially on single branch |

---

## 12. Build & Testing

```bash
cd ~/Sites/keenthemes/ktui/ktui
npx vitest run src/components/datatable    # all pass
npx tsc --noEmit                           # typecheck
npm run build:webpack                      # full bundle
npm run build:lib                          # ESM + CJS library builds
```

**Do NOT edit `lib/esm/` or `lib/cjs/` directly** — they're generated from `npm run build:lib`.

---

## 13. Documentation

- **DataTable docs:** [ktui.io/docs/datatable](https://ktui.io/docs/datatable)
- **Changelog:** [ktui.io/docs/changelog](https://ktui.io/docs/changelog)
