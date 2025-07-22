# KTAlert Configuration

> **Note:** All configuration is done via the JS API (`KTAlert.fire({...})`).

## Basic Configuration
```js
KTAlert.fire({
  title: 'Alert Title',
  message: 'Alert message.',
  type: 'info',
  confirmText: 'OK',
  showCancelButton: false
});
```

## Core Options

### Content Options
- `title`: The alert title (string)
- `message`: The alert message (string)
- `type`: Alert type - `'success' | 'error' | 'warning' | 'info' | 'question'` (string)
- `icon`: Custom icon HTML or name (string, optional)
- `customContent`: Custom HTML content (string, optional)

### Button Options
- `confirmText`: Text for the confirm button (string, default: 'OK')
- `cancelText`: Text for the cancel button (string, default: 'Cancel')
- `showConfirmButton`: Whether to show confirm button (boolean, default: true)
- `showCancelButton`: Whether to show cancel button (boolean, default: false)
- `showCloseButton`: Whether to show close (X) button (boolean, default: true)

### Behavior Options
- `modal`: Whether the alert is modal (blocks background) (boolean, default: false)
- `dismissible`: Whether the alert can be dismissed (boolean, default: false)
- `timer`: Auto-dismiss timer in milliseconds (number, optional)
- `allowOutsideClick`: Allow dismiss by clicking outside (boolean, default: true)
- `allowEscapeKey`: Allow dismiss by pressing Escape (boolean, default: true)
- `focusConfirm`: Focus confirm button on open (boolean, default: true)

## Input Field Options

### Basic Input
- `input`: Whether to show an input field (boolean, default: false)
- `inputType`: Input type - `'text' | 'email' | 'password' | 'number' | 'url' | 'textarea' | 'select' | 'radio' | 'checkbox'` (string, default: 'text')
- `inputPlaceholder`: Input placeholder text (string, optional)
- `inputValue`: Input default value (string, optional)
- `inputLabel`: Input label text (string, optional)
- `inputAttributes`: Additional input attributes (object, optional)

### Input Options (for select, radio, checkbox)
```js
inputOptions: [
  { value: 'option1', label: 'Option 1', checked: false, disabled: false },
  { value: 'option2', label: 'Option 2', checked: true, disabled: false }
]
```

## SweetAlert2-Style Validation

### Input Validation
```js
inputValidator: (value) => {
  if (!value) {
    return 'This field is required!';
  }
  if (value.length < 3) {
    return 'Must be at least 3 characters!';
  }
  return null; // null = valid
}
```

### Async Validation
```js
inputValidator: async (value) => {
  if (!value) {
    return 'This field is required!';
  }

  // Simulate server validation
  const response = await fetch('/api/validate', {
    method: 'POST',
    body: JSON.stringify({ value })
  });

  if (!response.ok) {
    return 'Validation failed on server!';
  }

  return null; // null = valid
}
```

### Pre-Confirmation Processing
```js
preConfirm: (value) => {
  // Process input before resolving
  return value.trim().toLowerCase();
}
```

### Auto-Focus
```js
inputAutoFocus: true // Automatically focus input field when alert opens
```

## Complete Example with Validation
```js
KTAlert.fire({
  title: 'Enter Email',
  message: 'Please provide a valid email address:',
  type: 'question',
  input: true,
  inputType: 'email',
  inputPlaceholder: 'user@example.com',
  inputAutoFocus: true,
  inputValidator: (value) => {
    if (!value) {
      return 'You need to enter an email!';
    }
    if (!value.includes('@')) {
      return 'Please enter a valid email address!';
    }
    return null; // null = valid
  },
  preConfirm: (value) => {
    return value.toLowerCase().trim();
  },
  showConfirmButton: true,
  showCancelButton: true,
  modal: true
}).then((result) => {
  if (result.isConfirmed) {
    console.log('Validated email:', result.value);
  }
});
```

## Styling Options

### Custom Classes
- `customClass`: Custom class for alert container (string, optional)
- `overlayClass`: Custom class for overlay (string, optional)
- `modalClass`: Custom class for modal (string, optional)
- `titleClass`: Custom class for title (string, optional)
- `messageClass`: Custom class for message (string, optional)
- `inputClass`: Custom class for input (string, optional)
- `confirmButtonClass`: Custom class for confirm button (string, optional)
- `cancelButtonClass`: Custom class for cancel button (string, optional)

### Per-Type Theming
```js
theme: {
  success: {
    customClass: 'custom-success-alert',
    confirmText: 'Great!',
    confirmButtonClass: 'btn-success'
  },
  error: {
    customClass: 'custom-error-alert',
    confirmText: 'I Understand',
    confirmButtonClass: 'btn-danger'
  }
}
```

## Return Values

The `KTAlert.fire()` method returns a Promise that resolves with:

```js
{
  isConfirmed: boolean,   // User clicked confirm
  isDismissed: boolean,   // User dismissed (close/X/outside click)
  isCanceled: boolean,    // User clicked cancel
  value?: string         // Input value (if input was provided)
}
```

## Examples

### Basic Confirmation
```js
KTAlert.fire({
  title: 'Delete Item',
  message: 'Are you sure you want to delete this item?',
  type: 'warning',
  showCancelButton: true,
  confirmText: 'Yes, delete it!',
  cancelText: 'Cancel'
}).then((result) => {
  if (result.isConfirmed) {
    // User confirmed
    deleteItem();
  }
});
```

### Input with Validation
```js
KTAlert.fire({
  title: 'Enter Username',
  message: 'Choose a unique username:',
  input: true,
  inputType: 'text',
  inputPlaceholder: 'username',
  inputAutoFocus: true,
  inputValidator: async (value) => {
    if (!value) return 'Username is required!';
    if (value.length < 3) return 'Username must be at least 3 characters!';

    // Check availability
    const available = await checkUsernameAvailability(value);
    if (!available) return 'Username is already taken!';

    return null;
  }
}).then((result) => {
  if (result.isConfirmed) {
    console.log('Username:', result.value);
  }
});
```