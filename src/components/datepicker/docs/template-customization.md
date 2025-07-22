# KTDatepicker Template Customization (2025 Revamp)

## Overview
KTDatepicker is now a fully modular, template-driven component. All UI fragments are customizable via config or `data-kt-datepicker-config` attributes. The system is inspired by the select component's template merging logic for consistency and flexibility.

> **Modular Rendering:** Each template key is rendered by a dedicated, single-responsibility private method in the main class (see `datepicker.ts`). This ensures maintainability, testability, and a clean separation of concerns.

> **Note:** All internal templates must use `data-kt-datepicker-*` attributes for targeting and styling. Do not use custom classes (e.g., `kt-datepicker-*`) for internal logic or styling. Only general classes (`active`, `disabled`, `focus`) are allowed for state.
>
> **Architectural Rule:** If a UI fragment is rendered and there is no template key for it, a new key must be added to `templates.ts` and documented here. The template system must always be the single source of truth for all UI markup.

## 1. Template Keys
The following template keys can be overridden via config:
- `container`: Main dropdown container (**must use `data-kt-datepicker-container`**)
- `header`: Calendar header (month/year navigation) (**must use `data-kt-datepicker-header`**)
- `footer`: Footer actions (today, clear, apply) (**must use `data-kt-datepicker-footer`**)
- `calendarGrid`: Calendar table/grid (**must use `data-kt-datepicker-calendar-grid`**)
- `dayCell`: Individual day cell (**must use `data-kt-datepicker-day`**)
- `monthYearSelect`: Month/year selector (**must use `data-kt-datepicker-monthyear-select`**)
- `monthSelection`: Month selection view (**must use `data-kt-datepicker-month-selection`**)
- `yearSelection`: Year selection view (**must use `data-kt-datepicker-year-selection`**)
- `inputWrapper`: Input field wrapper (**must use `data-kt-datepicker-input-wrapper`**)
- `segmentedDateInput`: Segmented input for date (container for all segments) (**must use `data-kt-datepicker-segmented-input`**)
- `segmentedDateRangeInput`: Segmented input for date range (**must use `data-kt-datepicker-segmented-range-input`**)
- `dateSegment`: Template for a single date segment (e.g., day, month, year)
- `segmentOverlay`: Overlay/highlight for the active segment
- `placeholder`: Placeholder text (**must use `data-kt-datepicker-placeholder`**)
- `displayWrapper`: Display wrapper for selected value (**must use `data-kt-datepicker-display-wrapper`**)
- `displayElement`: Display element for selected value (**must use `data-kt-datepicker-display-element`**)
- `timePanel`: Time selection panel (**must use `data-kt-datepicker-time-panel`**)
- `multiDateTag`: Tag for each selected date (multi-date) (**must use `data-kt-datepicker-multidate-tag`**)
- `emptyState`: Empty state message (**must use `data-kt-datepicker-empty`**)
- `calendarButton`: Button to open the calendar dropdown (customizable icon, ARIA label) (**must use `data-kt-datepicker-calendar-btn`**)
- `multiMonthContainer`: Container for multiple calendar months (horizontal multi-month view) (**must use `data-kt-datepicker-multimonth-container`**)

## 2. Base Class + Overrideable Class Pattern

All templates now follow the established pattern from the alert component: **base class + overrideable class**. This ensures consistent default styling while allowing full customization.

### Class Structure

Each template uses the pattern: `class="kt-datepicker-{element} {{class}}"`

- **Base Class**: `kt-datepicker-{element}` - Always present, provides default styling
- **Overrideable Class**: `{{class}}` - Injected from config, allows custom styling

### Base Classes Reference

The following base classes are automatically applied to each template element:

- `kt-datepicker-container` - Main container element
- `kt-datepicker-header` - Calendar header
- `kt-datepicker-footer` - Footer actions
- `kt-datepicker-calendar-grid` - Calendar grid table
- `kt-datepicker-day-cell` - Individual day cells
- `kt-datepicker-monthyear-select` - Month/year selector
- `kt-datepicker-month-selection` - Month selection view
- `kt-datepicker-year-selection` - Year selection view
- `kt-datepicker-input-wrapper` - Input wrapper
- `kt-datepicker-segmented-input` - Segmented input container
- `kt-datepicker-segmented-range-input` - Range segmented input container
- `kt-datepicker-date-segment` - Date segment elements
- `kt-datepicker-segment-separator` - Segment separators
- `kt-datepicker-placeholder` - Placeholder text
- `kt-datepicker-display-wrapper` - Display wrapper
- `kt-datepicker-display-element` - Display element
- `kt-datepicker-time-panel` - Time selection panel
- `kt-datepicker-multidate-tag` - Multi-date tags
- `kt-datepicker-empty-state` - Empty state message
- `kt-datepicker-calendar-button` - Calendar button
- `kt-datepicker-dropdown` - Dropdown container
- `kt-datepicker-prev-button` - Previous month button
- `kt-datepicker-next-button` - Next month button
- `kt-datepicker-calendar-table` - Calendar table
- `kt-datepicker-calendar-row` - Calendar table rows
- `kt-datepicker-calendar-body` - Calendar table body
- `kt-datepicker-today-button` - Today button
- `kt-datepicker-clear-button` - Clear button
- `kt-datepicker-apply-button` - Apply button
- `kt-datepicker-multimonth-container` - Multi-month container

## 3. Class Customization via Config

You can customize classes for any template element using the `classes` object in the config:

```html
<div
  data-kt-datepicker="true"
  data-kt-datepicker-config='{
    "classes": {
      "container": "custom-container-class",
      "header": "bg-blue-500 text-white",
      "dayCell": "hover:bg-gray-100",
      "calendarButton": "btn btn-primary",
      "dropdown": "shadow-lg border-2"
    }
  }'>
  <input type="text" data-kt-datepicker-input />
</div>
```

### Available Class Properties

The following class properties can be set in the `classes` object:

- `container`: Main container element
- `header`: Calendar header
- `footer`: Footer actions
- `calendarGrid`: Calendar grid table
- `dayCell`: Individual day cells
- `monthYearSelect`: Month/year selector
- `monthSelection`: Month selection view
- `yearSelection`: Year selection view
- `inputWrapper`: Input wrapper
- `segmentedDateInput`: Segmented input container
- `segmentedDateRangeInput`: Range segmented input container
- `dateSegment`: Date segment elements
- `segmentSeparator`: Segment separators
- `placeholder`: Placeholder text
- `displayWrapper`: Display wrapper
- `displayElement`: Display element
- `timePanel`: Time selection panel
- `multiDateTag`: Multi-date tags
- `emptyState`: Empty state message
- `calendarButton`: Calendar button
- `dropdown`: Dropdown container
- `prevButton`: Previous month button
- `nextButton`: Next month button
- `calendarTable`: Calendar table
- `calendarRow`: Calendar table rows
- `calendarBody`: Calendar table body
- `todayButton`: Today button
- `clearButton`: Clear button
- `applyButton`: Apply button
- `multiMonthContainer`: Multi-month container

## 4. Overriding Templates
Override any template by providing a matching key in the `data-kt-datepicker-config` JSON attribute or via the JS config:
```html
<div
  data-kt-datepicker="true"
  data-kt-datepicker-config='{
    "dayCell": "<td class=\"kt-datepicker-day-cell custom-day {{class}}\">{{day}}</td>",
    "header": "<div class=\"kt-datepicker-header custom-header {{class}}\">{{month}} {{year}}</div>",
    "dateSegment": "<span class=\"kt-datepicker-date-segment segment {{isActive}} {{class}}\">{{value}}</span>",
    "segmentOverlay": "<span class=\"absolute inset-0 bg-blue-100 opacity-50 pointer-events-none\"></span>"
  }'>
  <input type="text" data-kt-datepicker-input />
</div>
```

## 5. Template Merging Logic
- Templates are merged in this order:
  1. Core templates (defaults)
  2. User overrides (via config/templates object)
- For each render, the merged template set is used, just like select's `getTemplateStrings()`.
- If a key exists in both, the user override takes precedence.

## 6. Placeholders
Each template supports specific placeholders. Common examples include:
- `{{day}}`, `{{month}}`, `{{year}}`, `{{isToday}}`, `{{isSelected}}`, `{{isInRange}}`
- `{{prevButton}}`, `{{nextButton}}`, `{{todayButton}}`, `{{clearButton}}`, `{{applyButton}}`
- `{{input}}`, `{{icon}}`, `{{segments}}`, `{{start}}`, `{{end}}`, `{{separator}}`, `{{placeholder}}`, `{{value}}`
- `{{hours}}`, `{{minutes}}`, `{{seconds}}`, `{{amPm}}`, `{{date}}`, `{{removeButton}}`, `{{message}}`
- `{{segmentType}}` (e.g., 'day', 'month', 'year'), `{{isActive}}` (active segment class), `{{segmentValue}}` (value for the segment)
- `{{class}}` (dynamic class injection from config)

> **Note:** The codebase is now fully modular and template-driven. All UI fragments are rendered via templates and can be customized.

## 7. Granular Customization
- Per-segment and per-cell customization is supported (e.g., `dayCell`, `monthCell`, `yearCell`, `dateSegment`).
- Custom classes, icons, or badges can be injected via placeholders.
- The `segmentOverlay` template allows for custom highlighting of the active segment using Tailwind CSS or custom markup.
- Class placeholders enable dynamic styling based on component state or user preferences.
- Base classes ensure consistent default styling across all instances.

## 8. Usage Examples
### Override a Single Template
```html
<div data-kt-datepicker="true" data-kt-datepicker-config='{"dayCell": "<td class=\"kt-datepicker-day-cell rounded bg-blue-100 {{class}}\">{{day}}</td>"}'>
  <input type="text" data-kt-datepicker-input />
</div>
```

### Override Multiple Templates
```html
<div data-kt-datepicker="true" data-kt-datepicker-config='{"header": "<div class=\"kt-datepicker-header flex justify-between {{class}}\">{{prevButton}}<span>{{month}} {{year}}</span>{{nextButton}}</div>", "footer": "<div class=\"kt-datepicker-footer {{class}}\">{{todayButton}} {{clearButton}} {{applyButton}}</div>"}'>
  <input type="text" data-kt-datepicker-input />
</div>
```

### Customizing Segment Highlighting
```html
<div data-kt-datepicker="true" data-kt-datepicker-config='{"dateSegment": "<span class=\"kt-datepicker-date-segment segment {{isActive}} {{class}}\">{{value}}</span>"}'>
  <input type="text" data-kt-datepicker-input />
</div>
```

### Class Customization Examples
```html
<!-- Custom styling for specific elements -->
<div data-kt-datepicker="true" data-kt-datepicker-config='{
  "classes": {
    "header": "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg",
    "dayCell": "hover:bg-blue-100 transition-colors",
    "todayButton": "bg-green-500 hover:bg-green-600 text-white",
    "calendarButton": "bg-blue-500 hover:bg-blue-600 text-white rounded"
  }
}'>
  <input type="text" data-kt-datepicker-input />
</div>

<!-- Responsive design with classes -->
<div data-kt-datepicker="true" data-kt-datepicker-config='{
  "classes": {
    "container": "max-w-sm mx-auto",
    "dropdown": "shadow-xl border-2 border-gray-200",
    "calendarGrid": "w-full text-sm"
  }
}'>
  <input type="text" data-kt-datepicker-input />
</div>

<!-- Styling base classes directly -->
<style>
.kt-datepicker-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 0.5rem 0.5rem 0 0;
}

.kt-datepicker-day-cell {
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.kt-datepicker-day-cell:hover {
  background-color: #e3f2fd;
  transform: scale(1.05);
}
</style>
```

## 9. Consistency with Alert Component
- The template customization and merging logic follows the same pattern as the alert component. See the alert component's templates for reference.
- Both components use the base class + overrideable class pattern: `class="kt-{component}-{element} {{class}}"`

## 10. Multi-Month Display

KTDatepicker supports displaying multiple months side by side using the `visibleMonths` config option (default: 1). When set to 2 or more, the datepicker will render that many consecutive months horizontally in the dropdown, wrapped in the `multiMonthContainer` template.

### Multi-Month Configuration
```html
<div data-kt-datepicker="true" data-kt-datepicker-config='{"visibleMonths": 3}'>
  <input type="text" data-kt-datepicker-input />
</div>
```

### Multi-Month Template Customization
```html
<div data-kt-datepicker="true" data-kt-datepicker-config='{
  "visibleMonths": 2,
  "classes": {
    "multiMonthContainer": "grid grid-cols-2 gap-4"
  }
}'>
  <input type="text" data-kt-datepicker-input />
</div>
```

### Notes
- The multi-month view is always horizontal by default.
- Each month uses the same template structure as single-month view.
- The `multiMonthContainer` template wraps all calendar months.

## 11. Multi-Month Rendering: Event Listeners & Debugging

### Real DOM Node Rendering
- Each calendar month is rendered as a real DOM node, not a string.
- Event listeners are properly attached to each month's elements.
- State changes are synchronized across all visible months.

### Debugging Multi-Month Issues
- Check that `visibleMonths` is set correctly in config
- Verify that `multiMonthContainer` template is properly structured
- Ensure event listeners are attached to all month elements
- Test navigation between months in multi-month view