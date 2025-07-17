# KTDatepicker Configuration

## Overview
KTDatepicker supports flexible configuration via HTML attributes and a JSON config attribute. This dual approach allows for both simple and advanced customization, with clear precedence rules.

## 1. Attribute-Based Configuration
- **Description:** Use individual HTML attributes for common options.
- **Example:**
  ```html
  <div
    data-kt-datepicker="true"
    data-kt-datepicker-range="true"
    data-kt-datepicker-enable-time="true"
    data-kt-datepicker-placeholder="Select a date..."
    data-kt-datepicker-locale="en-US">
    <input type="text" data-kt-datepicker-input />
  </div>
  ```
- **Notes:**
  - Best for simple use cases.
  - Each option is set via a separate attribute.

## 2. JSON Config Attribute
- **Description:** Use a single `data-kt-datepicker-config` attribute for advanced/custom options.
- **Example:**
  ```html
  <div
    data-kt-datepicker="true"
    data-kt-datepicker-config='{
      "calendarTemplate": "<div class=\"custom-calendar\">{{calendar}}</div>",
      "locale": "fr-FR",
      "placeholder": "Sélectionnez une date..."
    }'>
    <input type="text" data-kt-datepicker-input />
  </div>
  ```
- **Notes:**
  - Supports advanced and custom options.
  - All options are grouped in a single JSON object.

## 3. Combined Usage & Precedence
- **Description:** Both methods can be used together. If a key exists in both, the JSON config value takes precedence.
- **Example:**
  ```html
  <div
    data-kt-datepicker="true"
    data-kt-datepicker-placeholder="Select a date..."
    data-kt-datepicker-config='{"placeholder": "Overridden by config!"}'>
    <input type="text" data-kt-datepicker-input />
  </div>
  ```
- **Notes:**
  - Attribute values are parsed first.
  - JSON config values override attribute values for matching keys.

## 4. Config Merging Logic
- **Order of Precedence:**
  1. Default values
  2. Attribute-based values
  3. JSON config values (highest)
- **Implementation:**
  - At initialization, all sources are merged according to the above order.
  - This ensures maximum flexibility and backward compatibility.

## 5. showOnFocus and closeOnSelect Options

KTDatepicker provides fine-grained control over dropdown behavior with the following options:

| Option           | Type    | Default (Single) | Default (Range) | Default (Multi-Date) | Description |
|------------------|---------|------------------|-----------------|----------------------|-------------|
| showOnFocus      | boolean | true             | true            | true                 | Whether the calendar opens when the input receives focus. |
| closeOnSelect    | boolean | true             | false           | false                | Whether the calendar closes after selection. For multi-date, closes only when the Apply button is clicked. |

### Usage via Data Attributes

```html
<div
  data-kt-datepicker="true"
  data-kt-datepicker-show-on-focus="false"
  data-kt-datepicker-close-on-select="true">
  <input type="text" data-kt-datepicker-input />
</div>
```

- Use `data-kt-datepicker-show-on-focus` to control whether the calendar opens on input focus.
- Use `data-kt-datepicker-close-on-select` to control whether the calendar closes after selection.
- Omit the attribute or set to `""`/`"true"` for true, set to `"false"` for false.

### Usage via JSON Config

```html
<div
  data-kt-datepicker="true"
  data-kt-datepicker-config='{"showOnFocus": false, "closeOnSelect": true}'>
  <input type="text" data-kt-datepicker-input />
</div>
```

### Behavior by Mode
- **Single Date:** Opens on focus by default, closes after selection.
- **Range:** Opens on focus by default, closes only after both start and end are selected.
- **Multi-Date:** Opens on focus by default, closes only when the Apply button is clicked.

### Range Mode Dropdown Close Behavior

- When `range: true` is enabled, the dropdown **remains open after selecting the start date** and **closes automatically after selecting the end date** (when both start and end are set).
- This matches best-practice UX for date range pickers (see Airbnb, Google Flights, etc.).
- `closeOnSelect` is now **true by default** for range mode, so you do not need to set it explicitly unless you want to override this behavior.

### Accessibility & Best Practices
- The calendar will not open on focus if the input is disabled or readonly.
- Always ensure the Apply button is accessible via keyboard in multi-date mode.
- These options can be changed at runtime via the API if needed.

## References
- See [template-customization.md](./template-customization.md) for template-related config.
- See [usage-examples.md](./usage-examples.md) for real-world scenarios.