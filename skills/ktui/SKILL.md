---
name: ktui
description: >
  Comprehensive guide to KtUI (Keenthemes Tailwind UI) — components, theming,
  initialization, data-attribute API, event system, helpers, and common patterns.
  Use this skill when building UI with KtUI, adding/customizing components,
  working with KtUI theming/colors/dark-mode, or when the user mentions
  KtUI, ktui, Keenthemes components, or Tailwind UI components from Keenthemes.
---

# KtUI — AI Agent Reference

[KtUI](https://ktui.io) is a free, open-source Tailwind CSS component library by Keenthemes.
Package: `@keenthemes/ktui` (npm).

> **Always prefer [ktui.io](https://ktui.io) docs and examples over guessing markup or options.**

---

## 1. Installation & Setup

> **See the `ktui-install` skill** for full installation, Tailwind config, framework integration, SSR, dark mode setup, and troubleshooting.

```bash
npm install @keenthemes/ktui
```

```ts
import { KTComponents } from '@keenthemes/ktui';
import '@keenthemes/ktui/dist/styles.css';
KTComponents.init();
```

---

## 2. Initialization

> **See the `ktui-install` skill** for framework-specific init patterns, SSR safety, and dynamic content handling.

```ts
// Global init
KTComponents.init();

// Per-component re-init after dynamic content
import { KTModal } from '@keenthemes/ktui';
KTModal.init();
```

---

## 3. Data-Attribute API (Declarative)

KtUI uses `data-kt-*` attributes for declarative wiring. This is the primary way to add behavior without writing JS.

### Naming convention

| Attribute | Purpose |
|-----------|---------|
| `data-kt-{component}` | Marks the root element (triggers instance creation on init) |
| `data-kt-{component}-initialized` | Added automatically after init (don't set manually) |
| `data-kt-{component}-toggle` | Click target to toggle show/hide (value = CSS selector of target) |
| `data-kt-{component}-dismiss` | Click target to close/dismiss |
| `data-kt-{component}-{option}` | Config override via HTML attribute |

### Example — Modal

```html
<!-- Toggle button -->
<button data-kt-modal-toggle="#my-modal">Open Modal</button>

<!-- Modal root -->
<div data-kt-modal="true" id="my-modal">
  <div class="kt-modal-content">
    <h2>Hello</h2>
    <button data-kt-modal-dismiss="true">Close</button>
  </div>
</div>
```

### Example — Dropdown

```html
<div data-kt-dropdown="true">
  <button data-kt-dropdown-toggle="true">Menu</button>
  <div data-kt-dropdown-menu="true" class="hidden">
    <a data-kt-dropdown-item="true" href="#">Item 1</a>
    <a data-kt-dropdown-item="true" href="#">Item 2</a>
  </div>
</div>
```

### Config via data attributes

Any config option can be set as a data attribute using kebab-case with the `data-kt-{component}-` prefix:

```html
<!-- JS config: { zindex: '100', backdrop: true, persistent: true } -->
<div data-kt-modal="true"
     data-kt-modal-zindex="100"
     data-kt-modal-backdrop="true"
     data-kt-modal-persistent="true">
```

### Config via CSS custom properties

Config can also be overridden with CSS custom properties:

```css
.my-modal {
  --kt-modal-zindex: 200;
  --kt-modal-backdrop: true;
}
```

---

## 4. Component Programmatic API

Every component follows this pattern:

```ts
// Get existing instance
const instance = KTModal.getInstance(element);

// Get or create
const instance = KTModal.getOrCreateInstance(element, config);

// Instance methods
instance.show();
instance.hide();
instance.toggle();
instance.isOpen();
instance.dispose();

// Events
const eventId = instance.on('show', (payload) => { /* ... */ });
instance.off('show', eventId);
```

### Instance management

| Static method | Returns |
|--------------|---------|
| `KTComponent.getInstance(el)` | Existing instance or `null` |
| `KTComponent.getOrCreateInstance(el, config?)` | Existing or new instance |
| `KTComponent.init()` | Scans DOM, creates instances, registers global handlers |

### Event system

Events fire in two ways:

1. **Callback registration** (via `on`/`off`):
   ```ts
   const id = modal.on('show', (payload) => {
     if (payload.cancel) return; // cancelable events
     console.log('showing');
   });
   modal.off('show', id);
   ```

2. **Custom DOM events** (bubbling, cancelable):
   ```ts
   element.addEventListener('show', (e) => {
     console.log(e.detail.payload);
     e.preventDefault(); // cancels the action
   });
   ```

**Event lifecycle** (most components):
- `toggle` → `show` → `shown` (after transition)
- `toggle` → `hide` → `hidden` (after transition)

Payload for cancelable events: `{ cancel: false }`. Set `cancel = true` to prevent the action.

---

## 5. Component Reference

### Exported components from `@keenthemes/ktui`

| Component | Class | Root attribute |
|-----------|-------|---------------|
| Dropdown | `KTDropdown` | `data-kt-dropdown` |
| Context Menu | `KTContextMenu` | `data-kt-context-menu` |
| Modal | `KTModal` | `data-kt-modal` |
| Drawer | `KTDrawer` | `data-kt-drawer` |
| Collapse | `KTCollapse` | `data-kt-collapse` |
| Dismiss | `KTDismiss` | `data-kt-dismiss` |
| Tabs | `KTTabs` | `data-kt-tabs` |
| Accordion | `KTAccordion` | `data-kt-accordion` |
| Scrollspy | `KTScrollspy` | `data-kt-scrollspy` |
| Scrollable | `KTScrollable` | `data-kt-scrollable` |
| Scroll To | `KTScrollto` | `data-kt-scrollto` |
| Sticky | `KTSticky` | `data-kt-sticky` |
| Reparent | `KTReparent` | `data-kt-reparent` |
| Toggle | `KTToggle` | `data-kt-toggle` |
| Tooltip | `KTTooltip` | `data-kt-tooltip` |
| Stepper | `KTStepper` | `data-kt-stepper` |
| Theme Switch | `KTThemeSwitch` | `data-kt-theme-switch` |
| Image Input | `KTImageInput` | `data-kt-image-input` |
| Toggle Password | `KTTogglePassword` | `data-kt-toggle-password` |
| DataTable | `KTDataTable` | `data-kt-datatable` |
| Select | `KTSelect` | `data-kt-select` |
| Toast | `KTToast` | (static API, no root attr) |
| Rating | `KTRating` | `data-kt-rating` |
| Repeater | `KTRepeater` | `data-kt-repeater` |
| Clipboard | `KTClipboard` | `data-kt-clipboard` |
| Range Slider | `KTRangeSlider` | `data-kt-range-slider` |
| Pin Input | `KTPinInput` | `data-kt-pin-input` |
| Input Number | `KTInputNumber` | `data-kt-input-number` |
| Carousel | `KTCarousel` | `data-kt-carousel` |

---

## 6. Key Components — Detailed

### 6.1 Modal (`KTModal`)

```html
<button data-kt-modal-toggle="#myModal">Open</button>
<div id="myModal" data-kt-modal="true" class="hidden">
  <div class="kt-modal-content">
    <button data-kt-modal-dismiss="true">×</button>
    <p>Content</p>
  </div>
</div>
```

**Config options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `zindex` | string | `'90'` | Base z-index |
| `backdrop` | boolean | `true` | Show backdrop overlay |
| `backdropClass` | string | `'kt-modal-backdrop'` | Backdrop CSS class |
| `backdropStatic` | boolean | `false` | Static backdrop (no close on click) |
| `keyboard` | boolean | `true` | Close on Escape |
| `disableScroll` | boolean | `true` | Lock body scroll |
| `persistent` | boolean | `false` | Prevent close on outside click |
| `focus` | boolean | `true` | Auto-focus first `[data-kt-modal-input-focus]` |
| `hiddenClass` | string | `'hidden'` | Class to add when hidden |

**Events:** `toggle`, `show`, `shown`, `hide`, `hidden`

**Programmatic:**

```ts
const modal = KTModal.getInstance(document.getElementById('myModal'));
modal.show();
modal.hide();
modal.isOpen(); // boolean
modal.getTargetElement(); // the toggle button that opened it
```

**Auto-focus:** Add `data-kt-modal-input-focus` to an input inside the modal.

### 6.2 Dropdown (`KTDropdown`)

Uses [Popper.js](https://popper.js.org/) for positioning.

```html
<div data-kt-dropdown="true">
  <button data-kt-dropdown-toggle="true">Click me</button>
  <div data-kt-dropdown-menu="true" class="hidden">
    <a data-kt-dropdown-item="true" href="#">Option 1</a>
    <a data-kt-dropdown-item="true" href="#">Option 2</a>
  </div>
</div>
```

**Config options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `trigger` | `'click'` \| `'hover'` | `'click'` | Open trigger |
| `placement` | string | `'bottom-start'` | Popper.js placement |
| `permanent` | boolean | `false` | Prevent auto-close |
| `dismiss` | boolean | `false` | Dismiss on item click |
| `zindex` | number | `105` | Dropdown z-index |
| `hoverTimeout` | number | `200` | Delay before close on hover (ms) |
| `offset` | string | `'0px, 5px'` | Popper offset `[skidding, distance]` |
| `container` | string | `''` | Move menu to container (e.g. `'body'`) |
| `keyboard` | boolean | `true` | Keyboard navigation |

**Events:** `show`, `shown`, `hide`, `hidden`

**Programmatic:**

```ts
const dd = KTDropdown.getInstance(el);
dd.show();
dd.hide();
dd.toggle();
dd.isOpen();
dd.disable(); // prevent interaction
dd.enable();
```

### 6.3 Drawer (`KTDrawer`)

Similar to Modal but slides from an edge.

```html
<button data-kt-drawer-toggle="#myDrawer">Open Drawer</button>
<div id="myDrawer" data-kt-drawer="true" class="hidden">
  <div class="kt-drawer-content">
    <button data-kt-drawer-dismiss="true">×</button>
    <p>Drawer content</p>
  </div>
</div>
```

### 6.4 Collapse / Accordion

```html
<button data-kt-collapse-toggle="#myCollapse">Toggle</button>
<div id="myCollapse" data-kt-collapse="true" class="hidden">
  Collapsed content
</div>
```

Accordion groups multiple collapses — only one open at a time.

### 6.5 Tabs (`KTTabs`)

```html
<div data-kt-tabs="true">
  <div data-kt-tabs-toggle="true" data-kt-tab="#tab1">Tab 1</div>
  <div data-kt-tabs-toggle="true" data-kt-tab="#tab2">Tab 2</div>
</div>
<div id="tab1">Content 1</div>
<div id="tab2" class="hidden">Content 2</div>
```

### 6.6 Tooltip (`KTTooltip`)

```html
<button data-kt-tooltip="true" data-kt-tooltip-content="Hello!">
  Hover me
</button>
```

### 6.7 Toast (`KTToast`) — Static API

Toast is unique: **it uses a static API**, not instance-based.

```ts
import { KTToast } from '@keenthemes/ktui';

// Basic usage
KTToast.show({ message: 'Saved!', variant: 'success' });

// Full options
KTToast.show({
  message: 'Item deleted',
  variant: 'error',
  appearance: 'solid',      // 'solid' | 'outline' | 'light'
  size: 'md',               // 'sm' | 'md' | 'lg'
  position: 'top-end',      // 'top-end' | 'top-center' | 'top-start' |
                            // 'bottom-end' | 'bottom-center' | 'bottom-start' |
                            // 'middle-end' | 'middle-center' | 'middle-start'
  duration: 5000,           // ms, auto-dismiss
  important: false,         // if true, no auto-dismiss
  progress: true,           // show progress bar
  pauseOnHover: true,       // pause timer on hover
  dismiss: true,            // show close button
  icon: '<svg>...</svg>',   // leading icon HTML
  action: {
    label: 'Undo',
    onClick: (id) => { /* ... */ },
    className: 'btn btn-sm',
  },
  cancel: {
    label: 'Cancel',
    onClick: (id) => { /* ... */ },
  },
  beep: true,               // play notification sound
  onAutoClose: (id) => {},
  onDismiss: (id) => {},
});

// Global config
KTToast.config({
  position: 'bottom-end',
  duration: 4000,
  maxToasts: 5,
  offset: 15,
  gap: 10,
});
```

**Variants:** `info`, `success`, `error`, `warning`, `primary`, `secondary`, `destructive`, `mono`

**Custom content:**

```ts
KTToast.show({
  content: document.getElementById('my-toast-template'),
  // or: content: () => document.createElement('div'),
  // or: content: '<div>HTML string</div>',
});
```

### 6.8 DataTable (`KTDataTable`)

Supports **local data** and **remote API** modes.

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

**Config options (key ones):**

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

**Programmatic:**

```ts
const dt = KTDataTable.getInstance(tableEl);
dt.sort('name');
dt.goPage(2);
dt.setPageSize(25);
dt.search('query');
dt.setFilter({ column: 'status', type: 'text', value: 'active' });
dt.reload();        // re-fetch from API
dt.redraw();        // re-render current data
dt.getState();      // { page, sortField, sortOrder, pageSize, ... }
dt.dispose();
```

**Column config:**

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

**Remote provider response shape:**

```ts
interface KTDataTableResponseDataInterface {
  data: KTDataTableDataInterface[];
  totalCount: number;
}
```

### 6.9 Select (`KTSelect`)

Replaces native `<select>` with a rich, searchable, multi-select dropdown.

```html
<select data-kt-select="true" data-kt-select-enable-search="true">
  <option value="">Select...</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

**Key features:**
- **Search:** `data-kt-select-enable-search="true"`
- **Multi-select:** `multiple` attribute on `<select>`
- **Tags mode:** `data-kt-select-tags="true"` — shows selected items as removable tags
- **Combobox mode:** `data-kt-select-combobox="true"` — allows free text input
- **Remote data:** `data-kt-select-remote="true"` with `data-kt-select-remote-url`
- **Pagination:** `data-kt-select-pagination="true"` — adds "Load More" button
- **Placeholder:** `data-kt-select-placeholder="Choose..."`
- **Select all:** `data-kt-select-select-all="true"` — adds "Select All" button in multi-mode

**Global config:**

```ts
KTSelect.config({
  enableSearch: true,
  searchPlaceholder: 'Type to search...',
  dropdownZindex: 9999,
  height: 300,
});
```

**Events** (dispatched on both element and document):

| Event | When |
|-------|------|
| `show` | Dropdown opening |
| `shown` | Dropdown opened |
| `hide` | Dropdown closing |
| `hidden` | Dropdown closed |
| `change` | Selection changed |

Events are also dispatched with `kt-select:` namespace on document:

```ts
document.addEventListener('kt-select:change', (e) => {
  console.log(e.detail.instance.getSelectedOptions());
});
```

### 6.10 Input Number (`KTInputNumber`)

```html
<input type="number"
       data-kt-input-number="true"
       data-kt-input-number-min="0"
       data-kt-input-number-max="100"
       data-kt-input-number-step="5" />
```

### 6.11 Range Slider (`KTRangeSlider`)

```html
<input type="range"
       data-kt-range-slider="true"
       data-kt-range-slider-min="0"
       data-kt-range-slider-max="100" />
```

### 6.12 Pin Input (`KTPinInput`)

```html
<div data-kt-pin-input="true"
     data-kt-pin-input-length="6">
</div>
```

### 6.13 Carousel (`KTCarousel`)

```html
<div data-kt-carousel="true"
     data-kt-carousel-infinite="true">
  <div data-kt-carousel-item="true">Slide 1</div>
  <div data-kt-carousel-item="true">Slide 2</div>
</div>
```

### 6.14 Clipboard (`KTClipboard`)

```html
<button data-kt-clipboard="true"
        data-kt-clipboard-target="#code-block">
  Copy
</button>
<pre id="code-block">text to copy</pre>
```

### 6.15 Repeater (`KTRepeater`)

Dynamic form field groups — add/remove rows.

```html
<div data-kt-repeater="true">
  <div data-kt-repeater-item="true">
    <input name="items[0][name]" />
    <button data-kt-repeater-delete="true">×</button>
  </div>
  <button data-kt-repeater-add="true">+ Add</button>
</div>
```

### 6.16 Rating (`KTRating`)

```html
<div data-kt-rating="true"
     data-kt-rating-value="3"
     data-kt-rating-max="5">
</div>
```

---

## 7. Helpers (Internal, but useful to know)

### `KTDom`

- `KTDom.getElement(el)` — resolve string selector or element
- `KTDom.getCssProp(el, prop)` — get computed CSS custom property
- `KTDom.getDataAttributes(el, prefix)` — extract `data-{prefix}-*` attributes as config object
- `KTDom.isRTL()` — check if document is RTL
- `KTDom.reflow(el)` — force reflow (used before class changes)
- `KTDom.transitionEnd(el, callback)` — listen for transition end
- `KTDom.getHighestZindex(el)` — find highest z-index in parent tree

### `KTData`

- `KTData.set(el, key, value)` — store data on element (WeakMap-based)
- `KTData.get(el, key)` — retrieve stored data
- `KTData.has(el, key)` — check if data exists
- `KTData.remove(el, key)` — remove stored data

### `KTEventHandler`

- `KTEventHandler.on(el, selector, eventType, handler)` — delegated event binding
- `KTEventHandler.off(el, eventId)` — remove delegated handler

### `KTUtils`

- `KTUtils.geUID(prefix?)` — generate unique ID
- `KTUtils.stringToBoolean(str)` — parse string to boolean
- `KTUtils.camelReverseCase(str)` — `camelCase` → `kebab-case`

---

## 8. Global Configuration

### Per-component static config

```ts
// Set defaults for all future instances
KTSelect.config({ enableSearch: true });
KTToast.config({ position: 'bottom-end', duration: 5000 });
```

### Window-level global config

```ts
window.KTGlobalComponentsConfig = {
  modal: { zindex: '100' },
  dropdown: { placement: 'bottom-end' },
};
```

This is merged into every component's config (lowest priority).

### Config merge priority (lowest → highest)

1. `window.KTGlobalComponentsConfig[component]`
2. Component class `_defaultConfig`
3. Static `.config()` (per-component)
4. `data-kt-{component}-*` HTML attributes
5. `--kt-{component}-{option}` CSS custom properties
6. Constructor `config` argument (highest)

---

## 9. Theming

### CSS Variables

KtUI follows a Shadcn-inspired convention. Define in your Tailwind entry:

```css
:root {
  /* Surfaces */
  --background: oklch(1 0 0);
  --foreground: oklch(14.1% 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(14.1% 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(14.1% 0.005 285.823);

  /* Brand */
  --primary: oklch(62.3% 0.214 259.815);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(96.7% 0.001 264.542);
  --secondary-foreground: oklch(20.5% 0.002 285.823);

  /* Muted / Accent */
  --muted: oklch(96.7% 0.001 264.542);
  --muted-foreground: oklch(55.6% 0.005 285.823);
  --accent: oklch(96.7% 0.001 264.542);
  --accent-foreground: oklch(20.5% 0.002 285.823);

  /* Destructive */
  --destructive: oklch(63.7% 0.237 25.331);
  --destructive-foreground: oklch(1 0 0);

  /* Borders */
  --border: oklch(92% 0.004 264.531);
  --input: oklch(92% 0.004 264.531);
  --ring: oklch(62.3% 0.214 259.815);

  /* Radius */
  --radius: 0.5rem;
}
```

### Background/foreground convention

- Background colors **omit** the `-background` suffix: `bg-primary` uses `var(--primary)`
- Foreground colors use `-foreground`: `text-primary-foreground` uses `var(--primary-foreground)`

### Semantic classes

Use KtUI utilities for consistency:

- `bg-background`, `text-foreground`
- `bg-primary`, `text-primary-foreground`
- `bg-card`, `text-card`
- `kt-btn`, `kt-card`, `kt-input`

### Dark mode

> **See the `ktui-install` skill** for the full dark mode setup (Tailwind variant, CSS overrides).

Theme switch: Use `KTThemeSwitch` component or toggle `.dark` class on `<html>`.

---

## 10. RTL Support

KtUI has built-in RTL support:

- `KTDom.isRTL()` checks `dir="rtl"` on `<html>`
- Dropdowns auto-switch placement (`placementRtl` config)
- Use logical properties in your CSS (`inset-inline-start` instead of `left`)

---

## 11. Common Pitfalls

| Problem | Cause | Fix |
|---------|-------|-----|
| Components not working | `init()` not called or called before DOM ready | Call `KTComponents.init()` after DOM is ready |
| Dropdown/Modal not opening | Missing `data-kt-*-toggle` attribute | Ensure toggle attribute value is a valid CSS selector |
| Styles missing | KtUI CSS or variables not loaded | Import `styles.css` and define CSS variables |
| SSR hydration errors | `init()` called on server | Guard: `if (typeof window !== 'undefined')` |
| Re-init not working | Existing instance blocks re-init | Call `dispose()` first, or use `getOrCreateInstance()` |
| DataTable not sorting | Missing `data-kt-datatable-column` on `<th>` | Add column attribute to each header cell |
| Select not searchable | Missing `data-kt-select-enable-search` | Add the attribute to the `<select>` element |
| Toast not appearing | No container created | Toast auto-creates containers; check z-index conflicts |
| Popper positioning wrong | Container not in DOM or overflow hidden | Use `data-kt-dropdown-container="body"` to portal |
| Dynamic content not interactive | `init()` not re-called after DOM mutation | Call `KTComponents.init()` or per-component init after adding markup |
| `getInstance()` returns null | Element not initialized | Use `getOrCreateInstance()` or ensure `init()` was called |

---

## 12. Source Code Structure

```
ktui/src/
├── index.ts                    # Main exports + KTComponents.init()
├── init-all.ts                 # Auto-init on DOMContentLoaded
├── types.ts                    # Shared types (KTOptionType, etc.)
├── legacy.ts                   # Legacy compatibility
├── helpers/
│   ├── dom.ts                  # DOM utilities (KTDom)
│   ├── data.ts                 # WeakMap data store (KTData)
│   ├── event-handler.ts        # Delegated events (KTEventHandler)
│   └── utils.ts                # General utilities (KTUtils)
└── components/
    ├── component.ts            # Base class (KTComponent)
    ├── accordion/
    ├── carousel/
    ├── clipboard/
    ├── collapse/
    ├── context-menu/
    ├── datatable/              # Complex — has local/remote providers, sort, search, pagination
    ├── dismiss/
    ├── drawer/
    ├── dropdown/               # Uses @popperjs/core
    ├── image-input/
    ├── input-number/
    ├── modal/
    ├── pin-input/
    ├── range-slider/
    ├── rating/
    ├── repeater/
    ├── reparent/
    ├── scrollable/
    ├── scrollspy/
    ├── scrollto/
    ├── select/                 # Complex — has search, remote, tags, combobox modules
    ├── sticky/
    ├── stepper/
    ├── tabs/
    ├── theme-switch/
    ├── toast/                  # Static API
    ├── toggle/
    ├── toggle-password/
    └── tooltip/
```

---

## 13. Documentation Links

- **Home:** [ktui.io](https://ktui.io)
- **Installation:** [ktui.io/docs/installation](https://ktui.io/docs/installation)
- **Theming:** [ktui.io/docs/theming](https://ktui.io/docs/theming)
- **Dark Mode:** [ktui.io/docs/dark-mode](https://ktui.io/docs/dark-mode)
- **TypeScript:** [ktui.io/docs/typescript](https://ktui.io/docs/typescript)
- **RTL:** [ktui.io/docs/rtl](https://ktui.io/docs/rtl)
- **Changelog:** [ktui.io/docs/changelog](https://ktui.io/docs/changelog)
- **Components:** `ktui.io/docs/{component}` (e.g. `ktui.io/docs/modal`, `ktui.io/docs/datatable`, `ktui.io/docs/select`)
