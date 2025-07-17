# KTAlert Usage Examples

> **Note:** KTAlert is now JS-driven only. All alerts are triggered programmatically using the `KTAlert.show({...})` API. Declarative `[data-kt-alert]` usage is no longer supported.

## Basic Example

```js
KTAlert.show({
  title: 'Success!',
  text: 'Your work has been saved.',
  icon: 'success',
  confirmButtonText: 'OK'
});
```

## Triggering from a Button

```html
<button id="show-alert" class="kt-btn">Show Alert</button>
<script>
  document.getElementById('show-alert').addEventListener('click', () => {
    KTAlert.show({
      title: 'Hello!',
      text: 'This is a JS-driven alert.',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  });
</script>
```

## Custom Content

```js
KTAlert.show({
  title: 'Custom',
  html: '<b>Custom HTML content</b>',
  icon: 'warning',
  showCancelButton: true
});
```

---

## References
- See [alert-types.md](./alert-types.md) for feature details.
- See [configuration.md](./configuration.md) for config options.
- See [template-customization.md](./template-customization.md) for template overrides.

---

## Production Build

To generate a production-ready, minified bundle of KTUI (including the datepicker), run:

```bash
npm run build:prod
```

This will output optimized files in the `dist/` directory, including both `ktui.js` and `ktui.min.js`.

---