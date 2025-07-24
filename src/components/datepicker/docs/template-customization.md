# Unified Template System

## Overview
KTDatepicker implements a unified template system that consolidates all template functionality into a single, comprehensive system. All UI fragments are customizable via configuration, with a focus on maintainability, extensibility, and consistency.

The template system follows a modular architecture where each template key is rendered by dedicated, single-responsibility methods in the main component. This ensures clean separation of concerns and improved testability.

## Architecture Principles

### Attribute-Driven Design
All internal templates use `data-kt-datepicker-*` attributes for targeting and styling. Custom CSS classes (e.g., `kt-datepicker-*`) are not permitted for internal logic or styling. Only general classes (`active`, `disabled`, `focus`) are allowed for state management.

### Single Source of Truth
The template system serves as the single source of truth for all UI markup. If a UI fragment is rendered without a corresponding template key, a new key must be added to the template system and documented.

### Base Class + Overrideable Class Pattern
All templates follow the established pattern: `class="kt-datepicker-{element} {{class}}"`. This ensures consistent default styling while allowing full customization through configuration.

## Template System Components

### Core Template Manager
The `TemplateRenderer` class provides the central interface for all template operations:
- **String Rendering:** Convert templates to HTML strings
- **DOM Element Rendering:** Create HTMLElements from templates
- **Document Fragment Rendering:** Generate DocumentFragments for complex structures
- **Template Management:** Update and retrieve templates dynamically

### Template Merging System
The system supports hierarchical template merging with clear precedence:
1. **Default Templates:** Core templates providing baseline functionality
2. **Configuration Templates:** Templates specified in component configuration
3. **User Templates:** Runtime template overrides for maximum flexibility

### Rendering Utilities
Comprehensive utilities support various rendering scenarios:
- **String Replacement:** Simple placeholder replacement for basic templates
- **Function Templates:** Dynamic templates using JavaScript functions
- **Class Injection:** Automatic class merging from configuration
- **Validation:** Template validation and error handling

## Template Categories

### Input and Display Templates
- **Input Wrapper:** Container for input elements with calendar button
- **Segmented Input:** Date/time input with editable segments
- **Range Input:** Dual segmented inputs for date ranges
- **Display Elements:** Value display and placeholder templates

### Calendar Templates
- **Calendar Grid:** Main calendar table structure
- **Day Cells:** Individual day selection elements
- **Navigation:** Previous/next month buttons
- **Header/Footer:** Calendar navigation and action buttons

### Time Selection Templates
- **Time Panel:** Container for time selection interface
- **Time Units:** Hour, minute, and second selection controls
- **AM/PM Control:** 12-hour format toggle
- **Time Display:** Current time value display

### Multi-Date Templates
- **Date Tags:** Individual selected date representations
- **Tag Management:** Add/remove functionality for selected dates
- **Empty State:** No selection state messaging

## Template Customization Methods

### Configuration-Based Customization
Templates can be customized through the component configuration object, allowing for both simple class overrides and complex template replacements.

### Runtime Template Updates
The template system supports dynamic template updates, enabling runtime customization and theme switching without component reinitialization.

### Class-Based Customization
The `classes` configuration object allows fine-grained control over styling while maintaining the base class structure for consistency.

## Template Validation and Error Handling

### Template Validation
The system includes comprehensive validation to ensure template integrity:
- **Required Attributes:** Validation of essential data attributes
- **Accessibility Compliance:** Automatic ARIA attribute inclusion
- **Structure Validation:** Template structure and nesting validation

### Error Recovery
Robust error handling ensures graceful degradation:
- **Fallback Templates:** Default templates used when custom templates fail
- **Error Reporting:** Detailed error messages for debugging
- **Graceful Degradation:** Component continues to function with invalid templates

## Performance Considerations

### Template Caching
The system implements intelligent template caching to minimize rendering overhead:
- **Template Compilation:** Templates are compiled once and reused
- **Fragment Reuse:** Document fragments are reused when possible
- **Memory Management:** Proper cleanup prevents memory leaks

### Rendering Optimization
Optimized rendering strategies improve performance:
- **Batch Updates:** Multiple template updates are batched
- **Selective Rendering:** Only changed templates are re-rendered
- **Efficient DOM Operations:** Minimal DOM manipulation for updates

## Integration with State Management

### State-Driven Templates
Templates automatically respond to state changes through the unified state management system:
- **Dynamic Content:** Template content updates based on component state
- **Conditional Rendering:** Templates adapt to different selection modes
- **Real-time Updates:** UI updates automatically when state changes

### Observer Pattern Integration
The template system integrates with the observer pattern for seamless state synchronization:
- **Automatic Updates:** Templates update when relevant state changes
- **Priority-Based Updates:** Template updates follow observer priority
- **Clean Synchronization:** Proper cleanup prevents update conflicts

## Best Practices

### Template Design
- **Semantic Structure:** Use semantic HTML elements and attributes
- **Accessibility First:** Include ARIA attributes and keyboard navigation
- **Consistent Naming:** Follow established naming conventions
- **Modular Design:** Keep templates focused and reusable

### Customization Guidelines
- **Preserve Structure:** Maintain essential data attributes and structure
- **Use Base Classes:** Leverage the base class system for consistency
- **Test Thoroughly:** Validate custom templates across different scenarios
- **Document Changes:** Document any template modifications

### Performance Optimization
- **Minimize DOM Queries:** Use efficient template structures
- **Batch Updates:** Group related template changes
- **Reuse Templates:** Leverage template caching and reuse
- **Monitor Performance:** Track template rendering performance

## References
- See [configuration.md](./configuration.md) for template configuration options
- See [state-management.md](./state-management.md) for state-driven template updates
- See [usage-examples.md](./usage-examples.md) for template customization examples