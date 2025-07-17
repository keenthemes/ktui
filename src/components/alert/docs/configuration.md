# Alert Configuration

## Overview
The Alert component supports flexible configuration via HTML attributes and a JSON config attribute. This dual approach allows for both simple and advanced customization, with clear precedence rules.

## 1. Attribute-Based Configuration
- **Description:** Use individual HTML attributes for common options.
- **Example:**
  ```html
  <div
    data-kt-alert="true"
    data-kt-alert-type="success"
    data-kt-alert-title="Success!"
    data-kt-alert-message="Your action was successful."
    data-kt-alert-dismissible="true">
  </div>
  ```
- **Notes:**
  - Best for simple use cases.
  - Each option is set via a separate attribute.

## 2. JSON Config Attribute
- **Description:** Use a single `data-kt-alert-config` attribute for advanced/custom options.
- **Example:**
  ```html
  <div
    data-kt-alert="true"
    data-kt-alert-config='{
      "type": "error",
      "title": "Error!",
      "message": "Something went wrong.",
      "dismissible": true,
      "customContent": "<img src=\"/error.png\" alt=\"Error\" />"
    }'>
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
    data-kt-alert="true"
    data-kt-alert-title="Default Title"
    data-kt-alert-config='{"title": "Overridden by config!"}'>
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

## 5. Dismissible and Modal Options
- **dismissible:** Whether the alert can be closed by the user.
- **modal:** Whether the alert is modal (blocks background interaction).
- **input:** Whether to show an input field for prompt dialogs.

## References
- See [template-customization.md](./template-customization.md) for template-related config.
- See [usage-examples.md](./usage-examples.md) for real-world scenarios.