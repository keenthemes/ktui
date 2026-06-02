---
name: ktui-select
description: >
  KtUI Select (KTSelect) — rich searchable multi-select dropdown replacing native select.
  Tags, combobox, remote data, pagination, select-all, events, and programmatic API.
  Use this skill when building, debugging, or customizing Select components.
---

# KTSelect — AI Agent Reference

Full reference for the Select component in [KtUI](https://ktui.io).
Package: `@keenthemes/ktui`. Class: `KTSelect`. Root attribute: `data-kt-select`.

> **Always prefer [ktui.io/docs/select](https://ktui.io/docs/select) docs and examples over guessing markup or options.**

---

## 1. Basic Usage

```html
<select data-kt-select="true" data-kt-select-enable-search="true">
  <option value="">Select...</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

```ts
import { KTSelect } from '@keenthemes/ktui';

const select = KTSelect.getInstance(el);
```

---

## 2. Key Features

| Feature | Attribute | Description |
|---------|-----------|-------------|
| Search | `data-kt-select-enable-search="true"` | Adds search input in dropdown |
| Multi-select | `multiple` attribute on `<select>` | Allow multiple selections |
| Tags mode | `data-kt-select-tags="true"` | Shows selected items as removable tags |
| Combobox | `data-kt-select-combobox="true"` | Allows free text input |
| Remote data | `data-kt-select-remote="true"` | Load options from API |
| Remote URL | `data-kt-select-remote-url="..."` | API endpoint for remote data |
| Pagination | `data-kt-select-pagination="true"` | Adds "Load More" button |
| Placeholder | `data-kt-select-placeholder="Choose..."` | Placeholder text |
| Select all | `data-kt-select-select-all="true"` | Adds "Select All" button (multi-mode) |
| Close on Enter | `data-kt-select-close-on-enter="true"` | Close dropdown when Enter pressed |
| Close on other open | `data-kt-select-close-on-other-open="true"` | Close when another select opens |
| Search autofocus | `data-kt-select-search-autofocus="true"` | Focus search input on open |
| Dispatch global events | `data-kt-select-dispatch-global-events="true"` | Dispatch events on document |

---

## 3. Global Config

Set defaults for all future instances:

```ts
KTSelect.config({
  enableSearch: true,
  searchPlaceholder: 'Type to search...',
  dropdownZindex: 9999,
  height: 300,
  closeOnEnter: true,
  closeOnOtherOpen: true,
  searchAutofocus: true,
  dispatchGlobalEvents: true,
});
```

---

## 4. Programmatic API

```ts
const select = KTSelect.getInstance(el);

// Dropdown control
select.openDropdown();
select.closeDropdown();
select.toggleSelection(value);

// Selection
select.getSelectedOptions();      // array of selected option objects
select.setSelectedOptions([opt]); // set selection programmatically
select.clearSelection();          // clear all

// Lifecycle
select.dispose();
```

### Instance management

| Static method | Returns |
|--------------|---------|
| `KTSelect.getInstance(el)` | Existing instance or `null` |
| `KTSelect.getOrCreateInstance(el, config?)` | Existing or new instance |
| `KTSelect.init()` | Scans DOM, creates instances |
| `KTSelect.config(opts)` | Set global defaults |

---

## 5. Events

Events fire through dual channel:
1. **Internal callbacks** (`.on()`) — bare name
2. **DOM CustomEvents** — dispatched on both element and document

### Confirmed events (from source)

| Event | When |
|-------|------|
| `show` | Dropdown opening |
| `close` | Dropdown closing |
| `change` | Selection changed |
| `enabled` | Component enabled |
| `disabled` | Component disabled |
| `updated` | Options updated |
| `updateError` | Options update failed |
| `reloadStart` | Remote reload started |
| `reloadComplete` | Remote reload finished |
| `reloadError` | Remote reload failed |
| `refreshed` | Options refreshed |
| `refreshError` | Options refresh failed |

### Namespaced events on document

```ts
document.addEventListener('kt-select:change', (e) => {
  console.log(e.detail.instance.getSelectedOptions());
});

document.addEventListener('kt-select:show', (e) => {
  console.log('Select opened', e.detail.element);
});
```

### Element-level events

```ts
el.addEventListener('change', (e) => {
  console.log(e.detail.instance.getSelectedOptions());
});
```

### Event detail shape

```ts
{
  instance: KTSelect,   // the select instance
  element: HTMLElement,  // the root element
  payload: { ... }       // event-specific data
}
```

---

## 6. Remote Data

```html
<select data-kt-select="true"
        data-kt-select-remote="true"
        data-kt-select-remote-url="https://api.example.com/options"
        data-kt-select-pagination="true">
</select>
```

The remote provider fetches options from the URL. Use `pagination: true` for paginated APIs.

---

## 7. Tags Mode

```html
<select data-kt-select="true"
        data-kt-select-tags="true"
        multiple>
  <option value="1">Tag 1</option>
  <option value="2">Tag 2</option>
  <option value="3">Tag 3</option>
</select>
```

Selected items appear as removable tag chips. Works with search and remote data.

---

## 8. Combobox Mode

```html
<input type="text"
       data-kt-select="true"
       data-kt-select-combobox="true"
       data-kt-select-remote="true"
       data-kt-select-remote-url="https://api.example.com/search" />
```

Allows free text input alongside selecting from dropdown options.

---

## 9. Select All

```html
<select data-kt-select="true"
        data-kt-select-select-all="true"
        data-kt-select-enable-search="true"
        multiple>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
  <option value="3">Option 3</option>
</select>
```

Adds a "Select All" button at the top of the dropdown in multi-select mode.

---

## 10. Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter` | Select focused option, close dropdown (if `closeOnEnter` enabled) |
| `ArrowDown` | Focus next option |
| `ArrowUp` | Focus previous option |
| `Escape` | Close dropdown |
| `Backspace` | Remove last tag (tags mode) |

---

## 11. Architecture

Source: `src/components/select/`

| File | Purpose |
|------|---------|
| `select.ts` | Main class — `openDropdown()`, `closeDropdown()`, `clearSelection()`, `dispose()` |
| `dropdown.ts` | Dropdown positioning and visibility |
| `search.ts` | Search input filtering |
| `tags.ts` | Tags mode rendering and removal |
| `combobox.ts` | Free text input mode |
| `remote.ts` | Remote data provider |
| `option.ts` | Option element management |
| `templates.ts` | HTML template generation |
| `config.ts` | Default config constants |
| `utils.ts` | Shared utilities |
| `types.ts` | Type definitions |
| `index.ts` | Barrel exports |

---

## 12. Common Pitfalls

| Problem | Cause | Fix |
|---------|-------|-----|
| Select not searchable | Missing `enable-search` attribute | Add `data-kt-select-enable-search="true"` |
| No tags shown | Missing `tags` attribute | Add `data-kt-select-tags="true"` |
| Remote not loading | Missing remote attributes | Add both `data-kt-select-remote="true"` and `data-kt-select-remote-url="..."` |
| Dropdown wrong position | Container overflow hidden | Use `data-kt-dropdown-container="body"` to portal |
| Select All not appearing | Not in multi-mode | Add `multiple` attribute to `<select>` |
| Events not firing on document | `dispatchGlobalEvents` disabled | Enable via config or attribute |
| `shown`/`hide`/`hidden` events not working | Wrong event names | Use `show`, `close`, `change` (actual events from source) |

---

## 13. Documentation

- **Select docs:** [ktui.io/docs/select](https://ktui.io/docs/select)
- **Changelog:** [ktui.io/docs/changelog](https://ktui.io/docs/changelog)
