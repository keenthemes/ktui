# KTDatepicker Template Customization (2025 Revamp)

## Overview
KTDatepicker is now a fully modular, template-driven component. All UI fragments are customizable via config or `data-kt-datepicker-config` attributes. The system is inspired by the select component’s template merging logic for consistency and flexibility.

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

## 2. Overriding Templates
Override any template by providing a matching key in the `data-kt-datepicker-config` JSON attribute or via the JS config:
```html
<div
  data-kt-datepicker="true"
  data-kt-datepicker-config='{
    "dayCell": "<td class=\"custom-day\">{{day}}</td>",
    "header": "<div class=\"custom-header\">{{month}} {{year}}</div>",
    "dateSegment": "<span class=\"segment {{isActive}}\">{{value}}</span>",
    "segmentOverlay": "<span class=\"absolute inset-0 bg-blue-100 opacity-50 pointer-events-none\"></span>"
  }'>
  <input type="text" data-kt-datepicker-input />
</div>
```

## 3. Template Merging Logic
- Templates are merged in this order:
  1. Core templates (defaults)
  2. User overrides (via config/templates object)
- For each render, the merged template set is used, just like select’s `getTemplateStrings()`.
- If a key exists in both, the user override takes precedence.

## 4. Placeholders
Each template supports specific placeholders. Common examples include:
- `{{day}}`, `{{month}}`, `{{year}}`, `{{isToday}}`, `{{isSelected}}`, `{{isInRange}}`
- `{{prevButton}}`, `{{nextButton}}`, `{{todayButton}}`, `{{clearButton}}`, `{{applyButton}}`
- `{{input}}`, `{{icon}}`, `{{segments}}`, `{{start}}`, `{{end}}`, `{{separator}}`, `{{placeholder}}`, `{{value}}`
- `{{hours}}`, `{{minutes}}`, `{{seconds}}`, `{{amPm}}`, `{{date}}`, `{{removeButton}}`, `{{message}}`
- `{{segmentType}}` (e.g., 'day', 'month', 'year'), `{{isActive}}` (active segment class), `{{segmentValue}}` (value for the segment)

> **Note:** The codebase is now fully modular and template-driven. All UI fragments are rendered via templates and can be customized.

## 5. Granular Customization
- Per-segment and per-cell customization is supported (e.g., `dayCell`, `monthCell`, `yearCell`, `dateSegment`).
- Custom classes, icons, or badges can be injected via placeholders.
- The `segmentOverlay` template allows for custom highlighting of the active segment using Tailwind CSS or custom markup.

## 6. Usage Examples
### Override a Single Template
```html
<div data-kt-datepicker="true" data-kt-datepicker-config='{"dayCell": "<td class=\"rounded bg-blue-100\">{{day}}</td>"}'>
  <input type="text" data-kt-datepicker-input />
</div>
```
### Override Multiple Templates
```html
<div data-kt-datepicker="true" data-kt-datepicker-config='{"header": "<div class=\"flex justify-between\">{{prevButton}}<span>{{month}} {{year}}</span>{{nextButton}}</div>", "footer": "<div>{{todayButton}} {{clearButton}} {{applyButton}}</div>"}'>
  <input type="text" data-kt-datepicker-input />
</div>
```
### Customizing Segment Highlighting
```html
<div data-kt-datepicker="true" data-kt-datepicker-config='{"segmentOverlay": "<span class=\"absolute inset-0 bg-yellow-200 opacity-40 pointer-events-none rounded\"></span>"}'>
  <input type="text" data-kt-datepicker-input />
</div>
```
### Using Placeholders
```html
<div data-kt-datepicker="true" data-kt-datepicker-config='{"multiDateTag": "<span class=\"tag\">{{date}} <button>{{removeButton}}</button></span>"}'>
  <input type="text" data-kt-datepicker-input />
</div>
```
### Customizing the Calendar Button
```html
<div data-kt-datepicker="true" data-kt-datepicker-config='{"calendarButton": "<button type=\"button\" aria-label=\"Pick date\"><svg><!-- custom icon --></svg></button>"}'>
  <input type="text" data-kt-datepicker-input />
</div>
```

## 7. Consistency with Select
- The template customization and merging logic follows the same pattern as the select component. See the select component’s templates for reference.

## References
- See [configuration.md](./configuration.md) for config options.
- See [usage-examples.md](./usage-examples.md) for real-world scenarios.