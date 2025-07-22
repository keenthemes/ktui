# KTAlert API Reference

Complete API reference for KTAlert with all available options, methods, and return values.

## KTAlert.fire(options)

The main method to display alerts. Returns a Promise that resolves with the user's action.

### Parameters

#### `options` (object)
Configuration object for the alert.

### Return Value

Returns a Promise that resolves to:
```js
{
  isConfirmed: boolean,   // User clicked confirm button
  isDismissed: boolean,   // User dismissed (close/X/outside click)
  isCanceled: boolean,    // User clicked cancel button
  value?: string         // Input value (if input was provided)
}
```

## Configuration Options

### Content Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | `''` | Alert title |
| `message` | string | `''` | Alert message |
| `type` | string | `'info'` | Alert type: `'success'`, `'error'`, `'warning'`, `'info'`, `'question'` |
| `icon` | string | `undefined` | Custom icon HTML or name |
| `customContent` | string | `''` | Custom HTML content |

### Button Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `confirmText` | string | `'OK'` | Confirm button text |
| `cancelText` | string | `'Cancel'` | Cancel button text |
| `showConfirmButton` | boolean | `true` | Show confirm button |
| `showCancelButton` | boolean | `false` | Show cancel button |
| `showCloseButton` | boolean | `true` | Show close (X) button |

### Behavior Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `modal` | boolean | `false` | Whether alert is modal (blocks background) |
| `dismissible` | boolean | `false` | Whether alert can be dismissed |
| `timer` | number | `undefined` | Auto-dismiss timer (milliseconds) |
| `allowOutsideClick` | boolean | `true` | Allow dismiss by clicking outside |
| `allowEscapeKey` | boolean | `true` | Allow dismiss by pressing Escape |
| `focusConfirm` | boolean | `true` | Focus confirm button on open |

### Input Field Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `input` | boolean | `false` | Show input field |
| `inputType` | string | `'text'` | Input type: `'text'`, `'email'`, `'password'`, `'number'`, `'url'`, `'textarea'`, `'select'`, `'radio'`, `'checkbox'` |
| `inputPlaceholder` | string | `''` | Input placeholder text |
| `inputValue` | string | `''` | Input default value |
| `inputLabel` | string | `''` | Input label text |
| `inputAttributes` | object | `{}` | Additional input attributes |
| `inputOptions` | array | `[]` | Options for select/radio/checkbox inputs |

### Validation Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `inputValidator` | function | `undefined` | Validation function - return string for error, null for success |
| `preConfirm` | function | `undefined` | Pre-confirmation processing function |
| `inputAutoFocus` | boolean | `false` | Auto-focus input field |

### Styling Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `customClass` | string | `''` | Custom class for alert container |
| `overlayClass` | string | `''` | Custom class for overlay |
| `modalClass` | string | `''` | Custom class for modal |
| `titleClass` | string | `''` | Custom class for title |
| `messageClass` | string | `''` | Custom class for message |
| `inputClass` | string | `''` | Custom class for input |
| `confirmButtonClass` | string | `''` | Custom class for confirm button |
| `cancelButtonClass` | string | `''` | Custom class for cancel button |

## Input Types

### Text Inputs
- `'text'` - Standard text input
- `'email'` - Email input with email keyboard on mobile
- `'password'` - Password input (masked)
- `'number'` - Number input
- `'url'` - URL input
- `'textarea'` - Multi-line text area

### Selection Inputs
- `'select'` - Dropdown select
- `'radio'` - Radio button group
- `'checkbox'` - Checkbox group

## Validation Functions

### inputValidator

Function that validates input before confirmation.

**Signature:**
```js
inputValidator(value: string): string | null | undefined | Promise<string | null | undefined>
```

**Parameters:**
- `value` (string) - The input value to validate

**Return Value:**
- `null` or `undefined` - Validation passed
- `string` - Error message to display
- `Promise<string | null | undefined>` - Async validation

**Examples:**

```js
// Simple validation
inputValidator: (value) => {
  if (!value) return 'This field is required!';
  return null;
}

// Format validation
inputValidator: (value) => {
  if (!value.includes('@')) return 'Please enter a valid email!';
  return null;
}

// Async validation
inputValidator: async (value) => {
  const response = await fetch('/api/validate', {
    method: 'POST',
    body: JSON.stringify({ value })
  });

  if (!response.ok) return 'Validation failed!';
  return null;
}
```

### preConfirm

Function that processes input before resolving the promise.

**Signature:**
```js
preConfirm(value: string): string | Promise<string>
```

**Parameters:**
- `value` (string) - The input value to process

**Return Value:**
- `string` - Processed value
- `Promise<string>` - Async processing

**Examples:**

```js
// Data normalization
preConfirm: (value) => {
  return value.trim().toLowerCase();
}

// URL normalization
preConfirm: (value) => {
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    return `https://${value}`;
  }
  return value;
}

// Async processing
preConfirm: async (value) => {
  const response = await fetch('/api/process', {
    method: 'POST',
    body: JSON.stringify({ value })
  });
  return response.text();
}
```

## Input Options

For `select`, `radio`, and `checkbox` inputs, use the `inputOptions` array:

```js
inputOptions: [
  {
    value: string,      // Option value
    label: string,      // Display label
    checked?: boolean,  // Whether option is selected (radio/checkbox)
    disabled?: boolean  // Whether option is disabled
  }
]
```

**Examples:**

```js
// Select options
inputOptions: [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
]

// Radio options
inputOptions: [
  { value: 'yes', label: 'Yes', checked: true },
  { value: 'no', label: 'No', checked: false }
]

// Checkbox options
inputOptions: [
  { value: 'terms', label: 'I agree to terms', checked: false },
  { value: 'newsletter', label: 'Subscribe to newsletter', checked: true }
]
```

## Styling and Theming

### Custom Classes

Apply custom CSS classes to specific elements:

```js
KTAlert.fire({
  title: 'Custom Styled Alert',
  message: 'This alert uses custom styling',
  customClass: 'my-custom-alert',
  titleClass: 'my-custom-title',
  messageClass: 'my-custom-message',
  confirmButtonClass: 'my-custom-confirm-btn'
});
```

### Per-Type Theming

Define different styles for different alert types:

```js
theme: {
  success: {
    customClass: 'success-alert',
    confirmText: 'Great!',
    confirmButtonClass: 'btn-success'
  },
  error: {
    customClass: 'error-alert',
    confirmText: 'I Understand',
    confirmButtonClass: 'btn-danger'
  },
  warning: {
    customClass: 'warning-alert',
    confirmText: 'Proceed Anyway',
    confirmButtonClass: 'btn-warning'
  }
}
```

## Examples

### Basic Alert
```js
KTAlert.fire({
  title: 'Success!',
  message: 'Operation completed successfully.',
  type: 'success'
});
```

### Confirmation Dialog
```js
KTAlert.fire({
  title: 'Are you sure?',
  message: 'This action cannot be undone.',
  type: 'warning',
  showCancelButton: true,
  confirmText: 'Yes, delete it!',
  cancelText: 'Cancel'
}).then((result) => {
  if (result.isConfirmed) {
    deleteItem();
  }
});
```

### Input with Validation
```js
KTAlert.fire({
  title: 'Enter Email',
  message: 'Please provide a valid email:',
  input: true,
  inputType: 'email',
  inputPlaceholder: 'user@example.com',
  inputAutoFocus: true,
  inputValidator: (value) => {
    if (!value) return 'Email is required!';
    if (!value.includes('@')) return 'Please enter a valid email!';
    return null;
  },
  preConfirm: (value) => value.toLowerCase().trim()
}).then((result) => {
  if (result.isConfirmed) {
    console.log('Email:', result.value);
  }
});
```

### Select Input
```js
KTAlert.fire({
  title: 'Choose Category',
  message: 'Select a category:',
  input: true,
  inputType: 'select',
  inputOptions: [
    { value: 'tech', label: 'Technology' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' }
  ]
}).then((result) => {
  if (result.isConfirmed) {
    console.log('Category:', result.value);
  }
});
```

### Async Validation
```js
KTAlert.fire({
  title: 'Check Username',
  message: 'Enter a username:',
  input: true,
  inputType: 'text',
  inputPlaceholder: 'username',
  inputValidator: async (value) => {
    if (!value) return 'Username is required!';

    try {
      const response = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: value })
      });

      const data = await response.json();

      if (!data.available) {
        return 'Username is already taken!';
      }

      return null;
    } catch (error) {
      return 'Unable to check username. Please try again.';
    }
  }
});
```

## Error Handling

### Validation Errors
Validation errors are automatically displayed below the input field with:
- Red text color
- Warning icon
- Proper ARIA attributes
- Smooth animations

### Promise Rejection
The `KTAlert.fire()` method never rejects. It always resolves with a result object indicating the user's action.

### Async Function Errors
Errors in `inputValidator` or `preConfirm` functions are caught and displayed as validation errors.

## Accessibility

KTAlert includes comprehensive accessibility features:

- **ARIA Roles**: Proper roles for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Automatic focus handling
- **Error Announcements**: Screen reader announcements for validation errors
- **High Contrast**: Support for high contrast themes

## Browser Support

KTAlert supports all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Considerations

- **Lightweight**: Minimal bundle size impact
- **Efficient Rendering**: Optimized DOM manipulation
- **Memory Management**: Automatic cleanup of event listeners
- **Async Support**: Non-blocking async operations