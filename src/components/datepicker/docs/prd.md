# KTDatepicker Component - Product Requirements Document (MVP)

## Overview
KTDatepicker is a customizable, framework-agnostic date and time selection component written in TypeScript. It enhances standard HTML form inputs with a rich calendar interface, supporting single date, date range, multi-date, and time selection. The MVP now features a HeroUI-style segmented input field with advanced keyboard navigation, real-time validation, and a fully extensible template/config system. The focus is on accessibility, internationalization, and ease of integration.

## Modular Code Structure (2025+)
KTDatepicker is architected with a strict modular approach:
- All major UI fragments and state updates are handled by dedicated, single-responsibility private methods in the main class (see `datepicker.ts`).
- Example modular methods:
  - `_renderContainer()`: Renders the main container
  - `_renderInputWrapper()`: Renders the input wrapper and calendar button
  - `_bindCalendarButtonEvent()`: Binds event to the calendar button
  - `_renderDropdown()`: Renders the dropdown container
  - `_renderDropdownContent()`: Renders header, calendar, and footer into the dropdown
  - `_attachDropdown()`: Attaches the dropdown to the DOM
  - `_updatePlaceholder()`: Updates the input placeholder
  - `_updateDisabledState()`: Updates the disabled state of input and button
  - `_enforceMinMaxDates()`: Disables day buttons outside min/max range
- This modular structure ensures:
  - High maintainability and readability
  - Easy extensibility for new features
  - Improved testability and isolation of logic
  - Clean separation of concerns, following best practices

## MVP Focus
- HeroUI-style segmented input for date (and time) with segment navigation and editing
- Core features for date and time selection
- Extensibility and template customization for all UI fragments
- Ease of integration and configuration
- Accessibility and internationalization as first-class concerns

## Feature Summary
KTDatepicker provides the following major features:
- **Segmented Input:** Single input field visually divided into editable segments (day, month, year, [hour, minute, second, AM/PM if enabled]), with keyboard and mouse navigation, input masking, and real-time validation
- **Selection Types:** Single date, date range, multi-date, and time selection ([See: selection-types.md](./selection-types.md))
- **Configuration:** Attribute-based, JSON config, and merging logic ([See: configuration.md](./configuration.md))
- **Template Customization:** Overridable templates for all UI fragments, including segmented input and segment overlays ([See: template-customization.md](./template-customization.md))
- **Accessibility & Internationalization:** Keyboard navigation, ARIA, screen reader, locale/RTL support ([See: accessibility-i18n.md](./accessibility-i18n.md))
- **Usage Examples:** Standalone HTML snippets for all major scenarios, including segmented input and advanced navigation ([See: usage-examples.md](./usage-examples.md))
- **Testing:** Automated test requirements and structure ([See: testing.md](./testing.md))
- **Future Roadmap:** Planned features and improvements ([See: roadmap.md](./roadmap.md))

## Attribute-Driven Architecture (2025+)
- All internal DOM elements must use `data-kt-datepicker-*` attributes for targeting, logic, and styling.
- Custom CSS classes (e.g., `kt-datepicker-*`) are not permitted for internal logic or styling.
- Only general, well-known classes (`active`, `disabled`, `focus`, etc.) are allowed for state.
- This ensures robust, conflict-free integration and easier customization.
- If a UI fragment is rendered and there is no template key for it, a new key must be added to `templates.ts` and documented. The template system must always be the single source of truth for all UI markup.

## Directory & File Structure
- All documentation is modularized in `ktui/src/components/datepicker/docs/`.
- Each major feature or concern is documented in its own markdown file for clarity and maintainability.
- Example HTML files are located in `ktui/examples/datepicker/` ([See: usage-examples.md](./usage-examples.md)).
- Automated tests are located in `ktui/src/components/datepicker/tests/` ([See: testing.md](./testing.md)).

## References
- [selection-types.md](./selection-types.md): Selection modes and behaviors
- [configuration.md](./configuration.md): Configuration methods and merging logic
- [template-customization.md](./template-customization.md): Template keys, overrides, and usage
- [accessibility-i18n.md](./accessibility-i18n.md): Accessibility and internationalization
- [usage-examples.md](./usage-examples.md): Usage scenarios and HTML examples
- [testing.md](./testing.md): Test requirements and structure
- [roadmap.md](./roadmap.md): Future features and planned improvements

---

> For detailed information on any feature, configuration, or implementation detail, please refer to the corresponding markdown file listed above. This PRD serves as the single source of truth for KTDatepicker's high-level requirements and as a navigational hub for all related documentation.
