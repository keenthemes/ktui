# Alert Accessibility

## Overview
The Alert component is designed to be accessible and usable by all users. It supports keyboard navigation, ARIA attributes, and screen reader compatibility. Internationalization (i18n) is supported for alert text and button labels.

## 1. Keyboard Navigation
- **Description:** All interactive elements (buttons, inputs) are accessible via keyboard.
- **Supported Keys:**
  - Tab/Shift+Tab: Move between focusable elements
  - Enter/Space: Activate buttons
  - Esc: Dismiss/close the alert
- **Usage Notes:**
  - Focus is managed to ensure smooth navigation
  - Visual focus indicators are present

## 2. ARIA Attributes & Screen Reader Support
- **Description:**
  - ARIA roles and attributes are applied to all relevant elements
  - Alert container, buttons, and input fields are labeled for screen readers
- **Usage Notes:**
  - Announcements for alert type and message
  - Descriptive labels for confirm/cancel/close buttons

## 3. Internationalization (i18n)
- **Description:**
  - Supports multiple locales for button labels and messages
  - Locale can be set via config or data attribute
- **Example:**
  ```html
  <div data-kt-alert="true" data-kt-alert-locale="fr-FR"></div>
  ```
  or
  ```html
  <div data-kt-alert="true" data-kt-alert-config='{"locale": "fr-FR"}'></div>
  ```
- **Usage Notes:**
  - All UI text and button labels adapt to the selected locale
  - Custom locale data can be provided via config for advanced use cases

## 4. Configuring Accessibility & i18n
- **Attributes:**
  - `data-kt-alert-locale` for locale
  - ARIA attributes are managed automatically
- **JSON Config:**
  - `locale` key for locale
  - Advanced ARIA/keyboard options can be set in config (future)

## References
- See [configuration.md](./configuration.md) for config options.
- See [usage-examples.md](./usage-examples.md) for accessibility scenarios.