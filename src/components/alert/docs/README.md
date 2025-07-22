# KTAlert Documentation

KTAlert is a modern, accessible alert and dialog component inspired by SweetAlert2, providing actionable feedback, confirmations, and user input with comprehensive validation capabilities.

## Features

### 🎯 Core Features
- **Multiple Alert Types**: Success, error, warning, info, question
- **Modal & Non-Modal**: Flexible display options
- **Customizable Content**: Titles, messages, icons, and custom HTML
- **Promise-based API**: Clean async/await support
- **Accessibility**: Full ARIA support and keyboard navigation

### 🔧 Input Support
- **Multiple Input Types**: Text, email, password, number, URL, textarea, select, radio, checkbox
- **Input Options**: Placeholders, default values, labels, custom attributes
- **Auto-focus**: Automatic input field focus

### ✅ SweetAlert2-Style Validation
- **`inputValidator`**: Validate input before confirmation
- **`preConfirm`**: Process input before resolving
- **Async Validation**: Server-side validation support
- **Visual Error Feedback**: Clear error messages with styling
- **Error States**: Input highlighting and ARIA attributes

### 🎨 Styling & Theming
- **Custom Classes**: Granular styling control
- **Per-Type Theming**: Different styles for different alert types
- **Responsive Design**: Mobile-friendly layouts
- **Dark Mode Support**: Built-in dark theme compatibility

## Quick Start

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
  message: 'Please provide a valid email address:',
  input: true,
  inputType: 'email',
  inputPlaceholder: 'user@example.com',
  inputAutoFocus: true,
  inputValidator: (value) => {
    if (!value) return 'Email is required!';
    if (!value.includes('@')) return 'Please enter a valid email!';
    return null; // null = valid
  },
  preConfirm: (value) => value.toLowerCase().trim()
}).then((result) => {
  if (result.isConfirmed) {
    console.log('Validated email:', result.value);
  }
});
```

### Async Validation
```js
KTAlert.fire({
  title: 'Check Username',
  message: 'Enter a username to check availability:',
  input: true,
  inputType: 'text',
  inputPlaceholder: 'username',
  inputValidator: async (value) => {
    if (!value) return 'Username is required!';

    // Check availability on server
    const response = await fetch('/api/check-username', {
      method: 'POST',
      body: JSON.stringify({ username: value })
    });

    const data = await response.json();
    if (!data.available) return 'Username is already taken!';

    return null; // Username is available
  }
});
```

## Documentation

### 📚 Guides
- **[Configuration](configuration.md)** - Complete configuration options
- **[Validation](validation.md)** - Input validation guide with examples
- **[API Reference](api.md)** - Full API documentation
- **[Migration Guide](migration.md)** - Upgrade from old API

### 🎯 Examples
- **[Basic Examples](../examples/examples.html)** - Core functionality examples
- **[Validation Examples](../examples/examples.html)** - Validation patterns
- **[Class Override Examples](../examples/class-override-example.html)** - Custom styling

## Key Benefits

### 🚀 Developer Experience
- **Simple API**: Easy to use with minimal configuration
- **Type Safety**: Full TypeScript support
- **Promise-based**: Clean async/await patterns
- **Backward Compatible**: Existing code continues to work

### 🎨 User Experience
- **Immediate Feedback**: Real-time validation
- **Clear Error Messages**: Descriptive validation errors
- **Auto-focus**: Improved input flow
- **Smooth Animations**: Polished interactions

### ♿ Accessibility
- **Screen Reader Support**: Proper ARIA attributes
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Automatic focus handling
- **Error Announcements**: Screen reader error feedback

### 🔧 Flexibility
- **Custom Validation**: Any validation logic
- **Async Support**: Server-side validation
- **Data Processing**: Pre-confirmation transformations
- **Styling Control**: Granular customization

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Installation

KTAlert is part of the KTUI library. Include the library in your project:

```html
<script src="path/to/ktui.js"></script>
<link rel="stylesheet" href="path/to/ktui.css">
```

## Contributing

See the main [KTUI contributing guide](../../../CONTRIBUTING.md) for development guidelines.

## License

MIT License - see the main [LICENSE](../../../LICENSE.md) file for details.