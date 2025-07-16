# KTDatepicker Accessibility & Internationalization

## Overview
KTDatepicker is designed to be accessible and usable in a wide range of locales. It supports keyboard navigation, ARIA attributes, screen reader compatibility, and locale customization via both attribute and JSON config methods.

## 1. Keyboard Navigation
- **Description:** All interactive elements are accessible via keyboard.
- **Supported Keys:**
  - Arrow keys: Navigate days, months, years
  - Enter/Space: Select date or activate buttons
  - Tab/Shift+Tab: Move between focusable elements
  - Esc: Close the datepicker
- **Usage Notes:**
  - Focus is managed to ensure smooth navigation
  - Visual focus indicators are present

## 2. ARIA Attributes & Screen Reader Support
- **Description:**
  - ARIA roles and attributes are applied to all relevant elements
  - Calendar grid, buttons, and input fields are labeled for screen readers
- **Usage Notes:**
  - Announcements for selected dates and range changes
  - Descriptive labels for navigation and action buttons

## 3. Locale Support (i18n)
- **Description:**
  - Supports multiple locales for month/day names, date formats, and UI text
  - Locale can be set via `data-kt-datepicker-locale` or in JSON config
- **Example:**
  ```html
  <div data-kt-datepicker="true" data-kt-datepicker-locale="fr-FR">
    <input type="text" data-kt-datepicker-input />
  </div>
  ```
  or
  ```html
  <div data-kt-datepicker="true" data-kt-datepicker-config='{"locale": "fr-FR"}'>
    <input type="text" data-kt-datepicker-input />
  </div>
  ```
- **Usage Notes:**
  - All UI text and date formats adapt to the selected locale
  - Custom locale data can be provided via config for advanced use cases

## 4. Configuring Accessibility & i18n
- **Attributes:**
  - `data-kt-datepicker-locale` for locale
  - ARIA attributes are managed automatically
- **JSON Config:**
  - `locale` key for locale
  - Advanced ARIA/keyboard options can be set in config (future)

## References
- See [configuration.md](./configuration.md) for config options.
- See [usage-examples.md](./usage-examples.md) for i18n and accessibility scenarios.