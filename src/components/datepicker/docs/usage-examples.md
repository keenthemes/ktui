# KTDatepicker Usage Examples

## Overview
This document provides a variety of usage examples for KTDatepicker, demonstrating different features and configuration methods. Each example is a standalone HTML snippet.

---

### 1. Minimal Example (Single Date)
```html
<div data-kt-datepicker="true">
  <input type="text" data-kt-datepicker-input />
</div>
```

---

### 2. Date Range Example
```html
<div data-kt-datepicker="true" data-kt-datepicker-range="true">
  <input type="text" data-kt-datepicker-input />
</div>
```

---

### 3. Multi-Date Example
```html
<div data-kt-datepicker="true" data-kt-datepicker-multi-date="true">
  <input type="text" data-kt-datepicker-input />
</div>
```

---

### 4. Time Selection Example
```html
<div data-kt-datepicker="true" data-kt-datepicker-enable-time="true">
  <input type="text" data-kt-datepicker-input />
</div>
```

---

### 5. Template Customization Example
```html
<div data-kt-datepicker="true" data-kt-datepicker-config='{"dayCell": "<td class=\"rounded bg-blue-100\">{{day}}</td>"}'>
  <input type="text" data-kt-datepicker-input />
</div>
```

---

### 6. Disabled Example
```html
<div data-kt-datepicker="true">
  <input type="text" data-kt-datepicker-input disabled />
</div>
```

---

### 7. Internationalization (i18n) Example
```html
<div data-kt-datepicker="true" data-kt-datepicker-locale="fr-FR">
  <input type="text" data-kt-datepicker-input />
</div>
```

---

### 8. All Features Example
```html
<div
  data-kt-datepicker="true"
  data-kt-datepicker-range="true"
  data-kt-datepicker-multi-date="true"
  data-kt-datepicker-enable-time="true"
  data-kt-datepicker-locale="fr-FR"
  data-kt-datepicker-config='{"header": "<div class=\"custom-header\">{{month}} {{year}}</div>"}'>
  <input type="text" data-kt-datepicker-input />
</div>
```

---

## Segmented Input & Advanced Features Examples

### 9. Segmented Input with Custom Segment Highlighting
```html
<div data-kt-datepicker="true" data-kt-datepicker-config='{"segmentOverlay": "<span class=\"absolute inset-0 bg-yellow-200 opacity-40 pointer-events-none rounded\"></span>"}'>
  <input type="text" data-kt-datepicker-input />
</div>
```

---

### 10. Segmented Input with Time Segments
```html
<div data-kt-datepicker="true" data-kt-datepicker-enable-time="true" data-kt-datepicker-config='{"dateSegment": "<span class=\"segment {{isActive}}\">{{segmentValue}}</span>"}'>
  <input type="text" data-kt-datepicker-input />
</div>
```

---

### 11. Segmented Input with Advanced Keyboard Navigation
```html
<div data-kt-datepicker="true" data-kt-datepicker-config='{"dateSegment": "<span class=\"segment {{isActive}}\">{{segmentValue}}</span>"}'>
  <input type="text" data-kt-datepicker-input />
</div>
<!--
  Keyboard navigation:
  - Arrow Left/Right: Move between segments
  - Arrow Up/Down: Increment/decrement segment value
  - Typing: Overwrite active segment, auto-advance
  - Home/End: Jump to first/last segment
-->
```

---

## References
- See [selection-types.md](./selection-types.md) for feature details.
- See [configuration.md](./configuration.md) for config options.
- See [template-customization.md](./template-customization.md) for template overrides.

---

## Production Build

To generate a production-ready, minified bundle of KTUI (including the datepicker), run:

```bash
npm run build:prod
```

This will output optimized files in the `dist/` directory, including both `ktui.js` and `ktui.min.js`.

---