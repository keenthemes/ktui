# Alert Types

## Overview
The Alert component supports multiple types to accommodate a wide range of notification and dialog scenarios. Each type is configurable and can be combined with other features for advanced use cases.

## 1. Info Alert
- **Description:** Used for informational messages.
- **Usage:**
  ```html
  <div data-kt-alert="true" data-kt-alert-type="info"></div>
  ```
- **Edge Cases:**
  - Should not be used for critical or destructive actions.

## 2. Success Alert
- **Description:** Indicates successful completion of an action.
- **Usage:**
  ```html
  <div data-kt-alert="true" data-kt-alert-type="success"></div>
  ```
- **Edge Cases:**
  - Should be visually distinct from info alerts.

## 3. Error Alert
- **Description:** Used for error or failure messages.
- **Usage:**
  ```html
  <div data-kt-alert="true" data-kt-alert-type="error"></div>
  ```
- **Edge Cases:**
  - Should be prominent and clearly indicate a problem.

## 4. Warning Alert
- **Description:** Warns the user about a potential issue or risk.
- **Usage:**
  ```html
  <div data-kt-alert="true" data-kt-alert-type="warning"></div>
  ```
- **Edge Cases:**
  - Should not be overused to avoid desensitizing users.

## 5. Question/Confirmation Alert
- **Description:** Used for confirmation dialogs or questions.
- **Usage:**
  ```html
  <div data-kt-alert="true" data-kt-alert-type="question" data-kt-alert-confirm="true"></div>
  ```
- **Edge Cases:**
  - Should provide clear confirm and cancel actions.

## 6. Custom Alert
- **Description:** Allows for custom content, icons, and actions.
- **Usage:**
  ```html
  <div data-kt-alert="true" data-kt-alert-config='{"customContent": "<img src=\"/custom.png\" alt=\"Custom\" />"}'></div>
  ```
- **Edge Cases:**
  - Ensure accessibility and clarity for custom content.

## References
- See [configuration.md](./configuration.md) for enabling types via config.
- See [usage-examples.md](./usage-examples.md) for more scenarios.