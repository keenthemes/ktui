# Datepicker Click Outside to Close

The datepicker component now supports automatically closing the dropdown when clicking outside the component. This feature improves user experience by providing intuitive interaction patterns.

## Overview

When enabled, the datepicker dropdown will automatically close when a user clicks anywhere outside the datepicker element. This behavior is consistent with other dropdown components in the KTUI library.

## Configuration

### Default Behavior

By default, click-outside-to-close is **enabled** (`closeOnOutsideClick: true`).

### Disabling the Feature

You can disable click-outside-to-close behavior in several ways:

#### 1. JavaScript Configuration

```javascript
const datepicker = new KTDatepicker(element, {
  closeOnOutsideClick: false
});
```

#### 2. Data Attribute

```html
<div class="kt-datepicker" data-kt-datepicker="true" data-kt-datepicker-close-on-outside-click="false">
  <input placeholder="Select a date" />
</div>
```

#### 3. JSON Configuration via Data Attribute

```html
<div class="kt-datepicker" data-kt-datepicker="true" data-kt-datepicker-config='{"closeOnOutsideClick": false}'>
  <input placeholder="Select a date" />
</div>
```

## Implementation Details

### Event Handling

The feature is implemented using a document-level click event listener that:

1. Checks if `closeOnOutsideClick` is enabled
2. Verifies the dropdown is currently open
3. Determines if the click target is outside the datepicker element
4. Calls the `close()` method if conditions are met

### Element Containment

The click detection checks if the target element is contained within the main datepicker element (`this._element`). This ensures that clicks on:
- The input field
- The calendar button
- The dropdown content
- Any child elements

Do **not** trigger the close behavior.

### Memory Management

The document click listener is properly cleaned up when the datepicker is destroyed to prevent memory leaks.

## Testing

A test page is available at `examples/datepicker/click-outside-test.html` that demonstrates:

- Multiple datepicker instances
- Click-outside functionality with visual feedback
- Configuration testing (enabled/disabled states)
- Independent behavior between instances

## Browser Compatibility

This feature works in all modern browsers that support:
- `document.addEventListener`
- `Element.contains()`
- Event delegation

## Performance Considerations

- The document click listener is lightweight and only performs DOM containment checks
- Event delegation ensures minimal performance impact
- Proper cleanup prevents memory leaks

## Related Features

- **closeOnSelect**: Controls whether the dropdown closes when a date is selected
- **showOnFocus**: Controls whether the dropdown opens when the input receives focus
- **Keyboard navigation**: Escape key also closes the dropdown

## Migration Notes

For existing implementations:
- No changes required - the feature is enabled by default
- If you want to disable it, add the configuration option
- The feature is backward compatible with existing datepicker instances