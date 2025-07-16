# KTDatepicker Template Customization

## Overview
KTDatepicker offers a powerful template customization system, allowing users to override the appearance and structure of all major UI fragments. This system is inspired by the select component’s template merging logic for consistency and flexibility.

## 1. Template Keys
The following template keys can be overridden via config:
- `container`: Main dropdown container
- `header`: Calendar header (month/year navigation)
- `footer`: Footer actions (today, clear, apply)
- `calendarGrid`: Calendar table/grid
- `dayCell`: Individual day cell
- `monthYearSelect`: Month/year selector
- `monthSelection`: Month selection view
- `yearSelection`: Year selection view
- `inputWrapper`: Input field wrapper
- `segmentedDateInput`: Segmented input for date
- `segmentedDateRangeInput`: Segmented input for date range
- `placeholder`: Placeholder text
- `displayWrapper`: Display wrapper for selected value
- `displayElement`: Display element for selected value
- `timePanel`: Time selection panel
- `multiDateTag`: Tag for each selected date (multi-date)
- `emptyState`: Empty state message

## 2. Overriding Templates
Override any template by providing a matching key in the `data-kt-datepicker-config` JSON attribute:
```html
<div
  data-kt-datepicker="true"
  data-kt-datepicker-config='{
    "dayCell": "<td class=\"custom-day\">{{day}}</td>",
    "header": "<div class=\"custom-header\">{{month}} {{year}}</div>"
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

> **Note:** The PRD and code should document which placeholders are available for each template key.

## 5. Granular Customization
- Per-segment and per-cell customization is supported (e.g., `dayCell`, `monthCell`, `yearCell`).
- Custom classes, icons, or badges can be injected via placeholders.

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
### Using Placeholders
```html
<div data-kt-datepicker="true" data-kt-datepicker-config='{"multiDateTag": "<span class=\"tag\">{{date}} <button>{{removeButton}}</button></span>"}'>
  <input type="text" data-kt-datepicker-input />
</div>
```

## 7. Consistency with Select
- The template customization and merging logic follows the same pattern as the select component. See the select component’s templates for reference.

## References
- See [configuration.md](./configuration.md) for config options.
- See [usage-examples.md](./usage-examples.md) for real-world scenarios.