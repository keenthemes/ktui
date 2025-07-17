# KTAlert Template Customization

> **Note:** All template customization is now done via JS and `templates.ts`. No declarative HTML is used.

## Customizing Templates
- Edit `src/components/alert/templates.ts` to change the HTML structure or classes for alerts.
- Use the `html` config option in `KTAlert.show({...})` for per-alert custom content.

## Example: Custom HTML Content
```js
KTAlert.show({
  title: 'Custom Alert',
  html: '<div class="p-4 bg-blue-100 rounded">Custom <b>HTML</b> here!</div>',
  icon: 'info',
  confirmButtonText: 'OK'
});
```

## Example: Changing the Default Template
```ts
// In templates.ts
export const ALERT_TEMPLATE = `
  <div class="kt-alert ...">
    ...
  </div>
`;
```

// In alert.ts
// KTAlert.show({ ... }) will use the updated template automatically.