# KTAlert Types

> **Note:** All alert types are now triggered via the JS API (`KTAlert.show({...})`).

## Success Alert
```js
KTAlert.show({
  title: 'Success!',
  text: 'Operation completed successfully.',
  icon: 'success',
  confirmButtonText: 'OK'
});
```

## Error Alert
```js
KTAlert.show({
  title: 'Error!',
  text: 'Something went wrong.',
  icon: 'error',
  confirmButtonText: 'Retry'
});
```

## Info Alert
```js
KTAlert.show({
  title: 'Info',
  text: 'Here is some information.',
  icon: 'info',
  confirmButtonText: 'Got it'
});
```

## Warning Alert
```js
KTAlert.show({
  title: 'Warning!',
  text: 'Are you sure you want to proceed?',
  icon: 'warning',
  showCancelButton: true
});
```