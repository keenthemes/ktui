# KTDatepicker Selection Types

## Overview
KTDatepicker supports multiple selection modes to accommodate a wide range of date and time picking scenarios. Each mode is configurable and can be combined with other features for advanced use cases.

## 1. Single Date Selection
- **Description:** Allows the user to select a single date from the calendar.
- **Usage:** Default mode when no range or multi-date options are enabled.
- **Example:**
  ```html
  <div data-kt-datepicker="true">
    <input type="text" data-kt-datepicker-input />
  </div>
  ```
- **Edge Cases:**
  - Selecting the same date twice does not change the value.
  - Disabled dates cannot be selected.

## 2. Date Range Selection
- **Description:** Enables selection of a start and end date, highlighting the range in the calendar.
- **Usage:** Activate with `data-kt-datepicker-range="true"` or via config.
- **Example:**
  ```html
  <div data-kt-datepicker="true" data-kt-datepicker-range="true">
    <input type="text" data-kt-datepicker-input />
  </div>
  ```
- **Edge Cases:**
  - End date cannot be before start date.
  - Selecting the same date for start and end is allowed (single-day range).

## 3. Multi-Date Selection
- **Description:** Allows selection of multiple, non-contiguous dates.
- **Usage:** Activate with `data-kt-datepicker-multi-date="true"` or via config.
- **Example:**
  ```html
  <div data-kt-datepicker="true" data-kt-datepicker-multi-date="true">
    <input type="text" data-kt-datepicker-input />
  </div>
  ```
- **Edge Cases:**
  - Duplicate dates are ignored.
  - Maximum number of selectable dates can be limited via config.

## 4. Time Selection
- **Description:** Adds time picking (12/24 hour) to any selection mode with granularity control.
- **Usage:** Activate with `data-kt-datepicker-enable-time="true"` or via config.
- **Example:**
  ```html
  <div data-kt-datepicker="true" data-kt-datepicker-enable-time="true">
    <input type="text" data-kt-datepicker-input />
  </div>
  ```
- **Configuration Options:**
  - `timeGranularity`: 'second', 'minute', or 'hour' (default: 'minute')
  - `timeFormat`: '12h' or '24h' (default: '24h')
  - `minTime`: Minimum time constraint (format: 'HH:MM' or 'HH:MM:SS')
  - `maxTime`: Maximum time constraint (format: 'HH:MM' or 'HH:MM:SS')
  - `timeStep`: Time increment in minutes (default: 1)
- **Edge Cases:**
  - Time selection is optional unless required by config.
  - 12/24 hour format is configurable.
  - Time constraints are validated against min/max values.
  - Time granularity affects the precision of time selection.

## References
- See [configuration.md](./configuration.md) for enabling selection types via config.
- See [usage-examples.md](./usage-examples.md) for more scenarios.