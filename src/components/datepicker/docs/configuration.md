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

## References
- See [template-customization.md](./template-customization.md) for template-related config.
- See [usage-examples.md](./usage-examples.md) for real-world scenarios.