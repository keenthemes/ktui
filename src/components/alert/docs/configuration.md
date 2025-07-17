# KTAlert Configuration

> **Note:** All configuration is now done via the JS API (`KTAlert.show({...})`).

## Basic Configuration
```js
KTAlert.show({
  title: 'Alert Title',
  text: 'Alert message.',
  icon: 'info',
  confirmButtonText: 'OK',
  showCancelButton: false
});
```

## Available Options
- `title`: The alert title (string)
- `text`: The alert message (string)
- `html`: Custom HTML content (string, optional)
- `icon`: One of `'success' | 'error' | 'info' | 'warning' | 'question'`
- `confirmButtonText`: Text for the confirm button (string)
- `cancelButtonText`: Text for the cancel button (string, optional)
- `showCancelButton`: Whether to show a cancel button (boolean, default: false)
- ... (add more as needed)

## Example: Custom Buttons
```js
KTAlert.show({
  title: 'Delete Item',
  text: 'Are you sure?',
  icon: 'warning',
  confirmButtonText: 'Yes, delete it!',
  cancelButtonText: 'Cancel',
  showCancelButton: true
});
```