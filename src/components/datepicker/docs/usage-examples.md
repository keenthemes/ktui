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