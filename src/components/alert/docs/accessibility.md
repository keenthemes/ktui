# KTAlert Accessibility

> **Note:** KTAlert is now JS-driven only. All alerts are rendered as modals via JS API (`KTAlert.show({...})`).

## ARIA Roles and Attributes
- The alert modal uses appropriate ARIA roles (e.g., `role="alertdialog"`) and attributes for accessibility.
- Focus is automatically trapped within the modal while open.
- The modal is announced to screen readers when shown.

## Keyboard Navigation
- Users can navigate the alert modal using Tab/Shift+Tab.
- Pressing Escape closes the alert (if allowed by config).
- Confirm and cancel buttons are accessible by keyboard.

## Example: Triggering an Accessible Alert
```js
KTAlert.show({
  title: 'Accessible Alert',
  text: 'This alert is fully accessible.',
  icon: 'info',
  confirmButtonText: 'OK'
});
```