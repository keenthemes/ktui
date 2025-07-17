# Alert Usage Examples

## Overview
This document provides a variety of usage examples for the Alert component, demonstrating different features and configuration methods. Each example is a standalone HTML snippet.

---

### 1. Minimal Example (Info Alert)
```html
<div data-kt-alert="true" data-kt-alert-type="info"></div>
```

---

### 2. Success Alert
```html
<div data-kt-alert="true" data-kt-alert-type="success"></div>
```

---

### 3. Error Alert
```html
<div data-kt-alert="true" data-kt-alert-type="error"></div>
```

---

### 4. Warning Alert
```html
<div data-kt-alert="true" data-kt-alert-type="warning"></div>
```

---

### 5. Question/Confirmation Dialog
```html
<div data-kt-alert="true" data-kt-alert-type="question" data-kt-alert-confirm="true"></div>
```

---

### 6. Custom Content Example
```html
<div data-kt-alert="true" data-kt-alert-config='{"customContent": "<img src=\"/path/to/image.png\" alt=\"Custom\" />"}'></div>
```

---

### 7. Template Customization Example
```html
<div data-kt-alert="true" data-kt-alert-config='{"title": "<h2 class=\"custom-title\">{{title}}</h2>"}'></div>
```

---

### 8. Dismissible Alert
```html
<div data-kt-alert="true" data-kt-alert-dismissible="true"></div>
```

---

### 9. Alert with Input Field
```html
<div data-kt-alert="true" data-kt-alert-input="true"></div>
```

---

## References
- See [alert-types.md](./alert-types.md) for feature details.
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