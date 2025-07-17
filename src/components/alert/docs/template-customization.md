# Alert Template Customization

## Overview
The Alert component is fully modular and template-driven. All UI fragments are customizable via a one-level config attribute (`data-kt-alert-config`) or JS config. This matches the datepicker pattern: each template override is a top-level key in the config object, not nested under a `templates` object. This approach ensures a single source of truth for all UI markup and easy extensibility.

> **Modular Rendering:** Each template key is rendered by a dedicated, single-responsibility method in the main class. This ensures maintainability, testability, and a clean separation of concerns.

> **Note:** All internal templates must use `data-kt-alert-*` attributes for targeting and styling. Only general classes (`active`, `disabled`, `focus`) are allowed for state.

> **Architectural Rule:** If a UI fragment is rendered and there is no template key for it, a new key must be added to `templates.ts` and documented here. The template system must always be the single source of truth for all UI markup.

## 1. Template Customization via One-Level Config Attribute

Templates for each alert UI fragment are set as string values using top-level keys in the `data-kt-alert-config` attribute (or JS config). This matches the datepicker pattern and allows for clean, scalable overrides.

### Example: Customizing Templates via One-Level Config Attribute
```html
<div
  data-kt-alert="true"
  data-kt-alert-config='{
    "icon": "<span class=\"custom-icon\">{{icon}}</span>",
    "title": "<h2 class=\"custom-title\">{{title}}</h2>",
    "confirmButton": "<button class=\"btn-confirm\">{{confirmText}}</button>"
  }'>
</div>
```

- Each key in the config corresponds to a UI fragment (see Supported Fragments below).
- You can override as many or as few fragments as needed.
- This approach is preferred for maintainability and consistency.

### Supported Fragments
- icon
- title
- message
- actions
- confirmButton
- cancelButton
- input
- closeButton
- customContent

## 2. Merging/Fallback Logic

When rendering a template fragment (e.g., icon, title), the system checks for:
1. User-provided config key (e.g., `icon`, `title`, ...)
2. Default templates (hardcoded)

The first match is used.

## 3. Usage Examples

#### JS Config Example
```js
{
  icon: "<span class='icon-success'>✔️</span>",
  title: "<h2 class='custom-title'>{{title}}</h2>"
}
```

#### HTML Attribute Example (Preferred)
```html
<div
  data-kt-alert="true"
  data-kt-alert-config='{
    "icon": "<span class=\"icon-success\">✔️</span>",
    "title": "<h2 class=\"custom-title\">{{title}}</h2>"
  }'>
</div>
```

#### Overriding Multiple Templates
```html
<div
  data-kt-alert="true"
  data-kt-alert-config='{
    "icon": "<span class=\"icon-error\">❌</span>",
    "message": "<div class=\"custom-message\">{{message}}</div>",
    "actions": "<button class=\"btn-confirm\">OK</button><button class=\"btn-cancel\">Cancel</button>"
  }'>
</div>
```

### Using Placeholders
Each template supports specific placeholders. Common examples include:
- `{{icon}}`, `{{title}}`, `{{message}}`, `{{confirmText}}`, `{{cancelText}}`, `{{input}}`, `{{customContent}}`, `{{closeIcon}}`
- `{{actions}}`, `{{type}}`, `{{ariaLabel}}`, `{{isActive}}`

---

## 4. Advanced Features & SweetAlert2 Parity

The Alert component is designed to support a wide range of features inspired by SweetAlert2. Many of these can be achieved or extended via the template system and configuration options:

### Custom Images & Icons
- Use the `customContent` or `icon` template fragment to inject custom images or SVGs.
- Example:
  ```html
  <div data-kt-alert="true" data-kt-alert-config='{"icon": "<img src=\"/success.png\" alt=\"Success\" />"}'></div>
  ```
- For advanced use cases, combine with `customContent` for full HTML flexibility.

### Multiple & Custom Buttons
- The `actions` template fragment can include multiple buttons with custom text, color, class, and value.
- Example:
  ```html
  <div data-kt-alert="true" data-kt-alert-config='{"actions": "<button class=\"btn-confirm\">OK</button><button class=\"btn-secondary\">More Info</button>"}'></div>
  ```
- Button actions can be handled via event delegation or by extending the component logic.

### Input Types
- The `input` template fragment supports various input types (text, password, textarea, select, range, etc.).
- Example:
  ```html
  <div data-kt-alert="true" data-kt-alert-config='{"input": "<input type=\"password\" placeholder=\"Enter password\" />"}'></div>
  ```
- For select/range, provide the appropriate HTML markup in the template.

### Theming & Layout
- Use the `container`, `customContent`, and `actions` fragments to control modal width, padding, background, and overlay.
- Add custom classes via the `class` attribute or in the template markup.
- Example:
  ```html
  <div data-kt-alert="true" data-kt-alert-config='{"container": "<div class=\"swal-modal custom-bg\">{{content}}</div>"}'></div>
  ```
- Overlay and animation can be customized via CSS or by extending the template system.

### Dismissal Controls
- Control dismiss behavior via config (e.g., `dismissible`, `closeOnEsc`, `closeOnClickOutside`, `timer`).
- Example:
  ```html
  <div data-kt-alert="true" data-kt-alert-dismissible="false" data-kt-alert-close-on-esc="false"></div>
  ```
- Timer/auto-close can be set via config (see [configuration.md](./configuration.md)).

### Loader/Spinner for Async
- The `customContent` or a dedicated `loader` fragment can be used to show a spinner or loading state.
- Example:
  ```html
  <div data-kt-alert="true" data-kt-alert-config='{"customContent": "<div class=\"spinner\"></div>"}'></div>
  ```
- Programmatically update the alert to show/hide the loader as needed.

### Programmatic API
- The Alert component exposes methods for programmatic control (e.g., open, close, update, setActionValue, stopLoading).
- See the main API documentation for details on available methods and usage patterns.

### Accessibility & Keyboard Navigation
- All templates and custom content should maintain ARIA roles and keyboard accessibility.
- See [accessibility.md](./accessibility.md) for best practices and configuration.

---

## 5. Extending the Template System
- If you need to support additional SweetAlert2 features not covered above, you can add new template fragments or extend the component logic.
- Please contribute improvements or suggestions to the project!

## 6. References
- See [usage-examples.md](./usage-examples.md) for real-world scenarios.
- See [configuration.md](./configuration.md) for config options.
- See [accessibility.md](./accessibility.md) for accessibility and i18n.