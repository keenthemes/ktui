# KTAlert Input Validation

KTAlert provides SweetAlert2-style input validation with support for both synchronous and asynchronous validation, pre-confirmation processing, and auto-focus functionality.

## Overview

The validation system consists of three main components:

1. **`inputValidator`** - Validates input before confirmation
2. **`preConfirm`** - Processes input before resolving
3. **`inputAutoFocus`** - Automatically focuses input fields

## Basic Validation

### Simple Required Field Validation

```js
KTAlert.fire({
  title: 'Enter Your Name',
  message: 'Please provide your name:',
  input: true,
  inputType: 'text',
  inputPlaceholder: 'Your name here...',
  inputValidator: (value) => {
    if (!value || value.trim().length === 0) {
      return 'Name is required!';
    }
    return null; // null = valid
  }
}).then((result) => {
  if (result.isConfirmed) {
    console.log('Name:', result.value);
  }
});
```

### Email Validation

```js
KTAlert.fire({
  title: 'Enter Email',
  message: 'Please provide a valid email address:',
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
    if (!value.includes('.')) {
      return 'Please enter a valid email address!';
    }
    return null;
  }
});
```

### Length and Format Validation

```js
KTAlert.fire({
  title: 'Create Password',
  message: 'Enter a strong password:',
  input: true,
  inputType: 'password',
  inputPlaceholder: 'Enter password...',
  inputValidator: (value) => {
    if (!value) {
      return 'Password is required!';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters!';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter!';
    }
    if (!/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter!';
    }
    if (!/\d/.test(value)) {
      return 'Password must contain at least one number!';
    }
    return null;
  }
});
```

## Async Validation

### Server-Side Validation

```js
KTAlert.fire({
  title: 'Check Username',
  message: 'Enter a username to check availability:',
  input: true,
  inputType: 'text',
  inputPlaceholder: 'username',
  inputAutoFocus: true,
  inputValidator: async (value) => {
    if (!value || value.trim().length === 0) {
      return 'Username is required!';
    }
    if (value.trim().length < 3) {
      return 'Username must be at least 3 characters!';
    }

    try {
      // Simulate API call
      const response = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: value })
      });

      const data = await response.json();

      if (!data.available) {
        return 'Username is already taken!';
      }

      return null; // Username is available
    } catch (error) {
      return 'Unable to check username availability. Please try again.';
    }
  }
});
```

### Complex Async Validation

```js
KTAlert.fire({
  title: 'Enter Domain',
  message: 'Enter a domain name to check:',
  input: true,
  inputType: 'url',
  inputPlaceholder: 'example.com',
  inputValidator: async (value) => {
    if (!value) {
      return 'Domain is required!';
    }

    // Basic format validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(value)) {
      return 'Please enter a valid domain name!';
    }

    try {
      // Check if domain is available
      const dnsResponse = await fetch(`/api/check-domain?domain=${encodeURIComponent(value)}`);
      const dnsData = await dnsResponse.json();

      if (dnsData.exists) {
        return 'This domain is already registered!';
      }

      // Check trademark database
      const trademarkResponse = await fetch(`/api/check-trademark?domain=${encodeURIComponent(value)}`);
      const trademarkData = await trademarkResponse.json();

      if (trademarkData.trademarked) {
        return 'This domain may violate trademark rights!';
      }

      return null; // Domain is available
    } catch (error) {
      return 'Unable to verify domain. Please try again.';
    }
  }
});
```

## Pre-Confirmation Processing

### Data Normalization

```js
KTAlert.fire({
  title: 'Enter URL',
  message: 'Please provide a website URL:',
  input: true,
  inputType: 'url',
  inputPlaceholder: 'https://example.com',
  inputValidator: (value) => {
    if (!value) {
      return 'URL is required!';
    }
    return null;
  },
  preConfirm: (value) => {
    // Normalize URL (add protocol if missing)
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      return `https://${value}`;
    }
    return value;
  }
});
```

### Data Transformation

```js
KTAlert.fire({
  title: 'Enter Phone Number',
  message: 'Enter your phone number:',
  input: true,
  inputType: 'tel',
  inputPlaceholder: '+1 (555) 123-4567',
  inputValidator: (value) => {
    if (!value) {
      return 'Phone number is required!';
    }
    // Basic phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number!';
    }
    return null;
  },
  preConfirm: (value) => {
    // Clean and format phone number
    const cleaned = value.replace(/[\s\-\(\)]/g, '');
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }
});
```

## Auto-Focus

### Basic Auto-Focus

```js
KTAlert.fire({
  title: 'Quick Input',
  message: 'Enter something quickly:',
  input: true,
  inputType: 'text',
  inputAutoFocus: true, // Automatically focus the input
  inputValidator: (value) => {
    if (!value) return 'Input is required!';
    return null;
  }
});
```

### Auto-Focus with Custom Behavior

```js
KTAlert.fire({
  title: 'Search',
  message: 'Enter your search term:',
  input: true,
  inputType: 'text',
  inputPlaceholder: 'Search...',
  inputAutoFocus: true,
  inputValidator: (value) => {
    if (!value || value.trim().length < 2) {
      return 'Search term must be at least 2 characters!';
    }
    return null;
  }
}).then((result) => {
  if (result.isConfirmed) {
    // Perform search
    performSearch(result.value);
  }
});
```

## Advanced Patterns

### Conditional Validation

```js
KTAlert.fire({
  title: 'User Registration',
  message: 'Enter your information:',
  input: true,
  inputType: 'text',
  inputPlaceholder: 'username',
  inputValidator: (value) => {
    if (!value) {
      return 'Username is required!';
    }

    // Check for reserved words
    const reservedWords = ['admin', 'root', 'system', 'test', 'guest'];
    if (reservedWords.includes(value.toLowerCase())) {
      return 'Username cannot be a reserved word!';
    }

    // Check for special characters
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores!';
    }

    return null;
  }
});
```

### Multi-Step Validation

```js
async function showMultiStepValidation() {
  // Step 1: Get email
  const emailResult = await KTAlert.fire({
    title: 'Step 1: Email',
    message: 'Enter your email address:',
    input: true,
    inputType: 'email',
    inputPlaceholder: 'user@example.com',
    inputAutoFocus: true,
    inputValidator: (value) => {
      if (!value) return 'Email is required!';
      if (!value.includes('@')) return 'Please enter a valid email!';
      return null;
    }
  });

  if (!emailResult.isConfirmed) return;

  // Step 2: Get password
  const passwordResult = await KTAlert.fire({
    title: 'Step 2: Password',
    message: 'Create a strong password:',
    input: true,
    inputType: 'password',
    inputPlaceholder: 'Enter password...',
    inputAutoFocus: true,
    inputValidator: (value) => {
      if (!value) return 'Password is required!';
      if (value.length < 8) return 'Password must be at least 8 characters!';
      return null;
    }
  });

  if (!passwordResult.isConfirmed) return;

  // Step 3: Confirm password
  const confirmResult = await KTAlert.fire({
    title: 'Step 3: Confirm',
    message: 'Confirm your password:',
    input: true,
    inputType: 'password',
    inputPlaceholder: 'Confirm password...',
    inputAutoFocus: true,
    inputValidator: (value) => {
      if (!value) return 'Please confirm your password!';
      if (value !== passwordResult.value) return 'Passwords do not match!';
      return null;
    }
  });

  if (confirmResult.isConfirmed) {
    console.log('Registration complete:', {
      email: emailResult.value,
      password: passwordResult.value
    });
  }
}
```

## Best Practices

### 1. Clear Error Messages
- Use specific, actionable error messages
- Explain what the user needs to do to fix the issue
- Keep messages concise but informative

### 2. Progressive Validation
- Start with basic format validation
- Then perform more complex checks
- Provide immediate feedback for obvious errors

### 3. Async Validation Considerations
- Show loading states for long-running validations
- Handle network errors gracefully
- Cache validation results when appropriate

### 4. Accessibility
- Use descriptive error messages for screen readers
- Ensure keyboard navigation works properly
- Provide clear focus indicators

### 5. Performance
- Debounce validation for real-time feedback
- Limit server calls for async validation
- Use client-side validation when possible

## Error Handling

### Validation Error Display

Validation errors are automatically displayed below the input field with:
- Red text color
- Warning icon
- Proper ARIA attributes for accessibility
- Smooth animation when appearing/disappearing

### Error States

The input field automatically gets:
- Red border when validation fails
- `aria-invalid="true"` attribute
- Focus remains on the input for easy correction

### Error Clearing

Errors are automatically cleared when:
- User starts typing (for real-time validation)
- Validation passes
- User clicks confirm successfully