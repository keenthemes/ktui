# Selection Types and Modes

## Overview
KTDatepicker supports multiple selection modes to accommodate diverse date and time picking requirements. Each mode is designed for specific use cases and can be combined with other features for advanced scenarios.

## Single Date Selection

### Description
The default selection mode allows users to select a single date from the calendar interface. This mode provides immediate visual feedback and automatic input population upon selection.

### Use Cases
- **Form Input:** Standard date input for forms and applications
- **Event Scheduling:** Single event or appointment scheduling
- **Date Filtering:** Date-based filtering and search functionality
- **Simple Selection:** Basic date picking without complex requirements

### Behavior Characteristics
- **Immediate Selection:** Date is selected immediately upon click
- **Visual Feedback:** Selected date is highlighted in the calendar
- **Input Population:** Selected date automatically populates the input field
- **Auto-Close:** Calendar typically closes after selection (configurable)

### Edge Case Handling
- **Duplicate Selection:** Selecting the same date twice has no effect
- **Disabled Dates:** Dates outside valid ranges cannot be selected
- **Validation:** Automatic validation ensures selected dates meet requirements

## Date Range Selection

### Description
Range selection enables users to choose a start and end date, with visual highlighting of the entire range. This mode is essential for period selection and booking scenarios.

### Use Cases
- **Booking Systems:** Hotel reservations, car rentals, and service bookings
- **Date Filtering:** Range-based filtering for reports and analytics
- **Period Selection:** Financial periods, vacation planning, and project timelines
- **Availability Selection:** Selecting available time periods

### Behavior Characteristics
- **Two-Step Selection:** Start date followed by end date selection
- **Range Highlighting:** Visual indication of the selected date range
- **Validation:** End date cannot be before start date
- **Flexible Closure:** Calendar remains open until range is complete

### Edge Case Handling
- **Same Date Range:** Start and end dates can be the same (single-day range)
- **Invalid Ranges:** Automatic prevention of invalid date combinations
- **Range Limits:** Respects minimum and maximum date constraints

## Multi-Date Selection

### Description
Multi-date mode allows selection of multiple non-contiguous dates, providing flexibility for complex scheduling and availability requirements.

### Use Cases
- **Event Scheduling:** Multiple event scheduling across different dates
- **Availability Selection:** Selecting available dates from a calendar
- **Batch Operations:** Selecting multiple dates for bulk operations
- **Complex Requirements:** Scenarios requiring multiple date selections

### Behavior Characteristics
- **Additive Selection:** Each click adds or removes a date from selection
- **Visual Indicators:** Selected dates are clearly marked in the calendar
- **Apply Confirmation:** Apply button confirms final selection
- **Persistent Display:** Selected dates remain visible until confirmed

### Edge Case Handling
- **Duplicate Prevention:** Duplicate dates are automatically ignored
- **Selection Limits:** Configurable maximum number of selectable dates
- **Bulk Operations:** Support for select all/none operations

## Time Selection

### Description
Time selection adds precise time picking capabilities to any date selection mode, supporting various granularities and formats for comprehensive datetime selection.

### Use Cases
- **Appointment Scheduling:** Precise appointment time selection
- **Meeting Coordination:** Meeting scheduling with specific times
- **Service Booking:** Time-sensitive service appointments
- **Event Planning:** Events requiring specific start/end times

### Configuration Options
- **Time Granularity:** Hour, minute, or second precision
- **Time Format:** 12-hour or 24-hour format selection
- **Time Constraints:** Minimum and maximum time limits
- **Time Steps:** Configurable increment sizes for time selection

### Behavior Characteristics
- **Integrated Interface:** Time selection integrated with date selection
- **Format Flexibility:** Support for various time formats and locales
- **Constraint Validation:** Automatic validation of time constraints
- **Granularity Control:** Different precision levels for different use cases

### Edge Case Handling
- **Time Validation:** Automatic validation against min/max time constraints
- **Format Adaptation:** Automatic format switching based on locale
- **Granularity Limits:** Respects configured time step increments

## DateTime Range Selection

### Description
DateTime range selection combines date range functionality with time picking, enabling comprehensive datetime range selection for complex scheduling scenarios.

### Use Cases
- **Meeting Scheduling:** Meeting rooms with specific start/end times
- **Service Appointments:** Time-sensitive service appointments
- **Event Planning:** Events with specific duration requirements
- **Resource Booking:** Resource allocation with time constraints

### Features
- **Dual Input:** Separate start and end datetime inputs
- **Time Validation:** Comprehensive time validation for both start and end
- **Format Support:** Support for various datetime formats
- **Constraint Handling:** Respects both date and time constraints

### Behavior Characteristics
- **Sequential Selection:** Start datetime followed by end datetime
- **Visual Feedback:** Clear indication of selected datetime range
- **Validation:** End datetime cannot be before start datetime
- **Format Consistency:** Consistent formatting across start and end

### Edge Case Handling
- **Instantaneous Ranges:** Same datetime for start and end is allowed
- **Time Constraints:** Validation against configured time limits
- **Format Conflicts:** Automatic resolution of format conflicts

## Mode Combination and Flexibility

### Feature Integration
All selection modes can be combined with additional features:
- **Template Customization:** Custom appearance and behavior
- **Internationalization:** Locale-specific formatting and text
- **Validation Rules:** Custom validation and constraint handling
- **Accessibility:** Full keyboard navigation and screen reader support

### Configuration Flexibility
Each mode supports extensive configuration:
- **Behavior Customization:** Configurable selection behavior
- **Visual Customization:** Custom styling and appearance
- **Validation Customization:** Custom validation rules and messages
- **Integration Customization:** Custom integration patterns

## Performance Considerations

### Selection Efficiency
- **Optimized Rendering:** Efficient calendar rendering for large date ranges
- **State Management:** Optimized state updates for selection changes
- **Memory Management:** Proper cleanup and disposal of selection state

### Scalability
- **Large Date Ranges:** Efficient handling of extensive date ranges
- **Multiple Instances:** Optimized performance for multiple datepicker instances
- **Complex Configurations:** Efficient handling of complex configuration scenarios

## References
- See [configuration.md](./configuration.md) for mode-specific configuration options
- See [usage-examples.md](./usage-examples.md) for implementation examples
- See [state-management.md](./state-management.md) for selection state management