---
name: ktui-install
description: >
  Install, configure, and initialize KtUI (Keenthemes Tailwind UI) in any project.
  Use this skill when setting up KtUI for the first time, adding it to a new project,
  configuring Tailwind for KtUI, or troubleshooting initialization issues.
---

# KtUI Installation & Setup

## 1. Install the package

```bash
npm install @keenthemes/ktui
```

## 2. Tailwind CSS config

Add KtUI source paths to your Tailwind content array so Tailwind scans KtUI classes:

```js
// tailwind.config.js
module.exports = {
  content: [
    './node_modules/@keenthemes/ktui/src/**/*.{ts,js}',
    // your app files...
  ],
};
```

## 3. Import styles

Import KtUI's built-in CSS (or use your own build of the source):

```ts
import '@keenthemes/ktui/dist/styles.css';
```

## 4. Import and initialize components

```ts
import { KTComponents } from '@keenthemes/ktui';

// Call once after DOM is ready
KTComponents.init();
```

### Per-framework placement

| Framework | Where to call `KTComponents.init()` |
|-----------|--------------------------------------|
| Vanilla JS | `DOMContentLoaded` listener or `<script>` at bottom of `<body>` |
| React | `useEffect(() => { KTComponents.init(); }, [])` |
| Vue 3 | `onMounted(() => { KTComponents.init(); })` |
| Next.js | Inside a client component's `useEffect` (never during SSR) |
| Nuxt | Inside `onMounted` or a client-only plugin |
| Laravel Livewire | Automatic — `livewire:navigate` triggers re-init |

### SSR safety

Never call `init()` during server-side rendering. Guard with:

```ts
if (typeof window !== 'undefined') {
  KTComponents.init();
}
```

### Dynamic content (SPAs, lazy-loaded views)

After injecting new KtUI markup (route change, AJAX-loaded modal, etc.), re-initialize:

```ts
// Re-init everything (safe — existing instances are skipped)
KTComponents.init();

// Or per-component
import { KTModal } from '@keenthemes/ktui';
KTModal.init();
```

## 5. TypeScript types

All config and interface types are exported from the package root — no deep paths:

```ts
import type {
  KTModalConfigInterface,
  KTDataTableConfigInterface,
  KTDropdownConfigInterface,
  KTSelectConfigInterface,
  KTToastConfigInterface,
  // ... etc
} from '@keenthemes/ktui';
```

## 6. CSS variables (theming)

KtUI requires CSS custom variables defined on `:root`. At minimum:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(14.1% 0.005 285.823);
  --primary: oklch(62.3% 0.214 259.815);
  --primary-foreground: oklch(1 0 0);
  --border: oklch(92% 0.004 264.531);
  --radius: 0.5rem;
}
```

See the `ktui` skill or [ktui.io/docs/theming](https://ktui.io/docs/theming) for the full variable list.

## 7. Dark mode setup

Add the Tailwind dark variant:

```css
@custom-variant dark (&:is(.dark *));
```

Override the same CSS variables under `.dark`:

```css
.dark {
  --background: oklch(14.1% 0.005 285.823);
  --foreground: oklch(98.5% 0 0);
  --primary: oklch(70.7% 0.165 254.624);
  --primary-foreground: oklch(14.1% 0.005 285.823);
}
```

Toggle `.dark` on `<html>` or use the `KTThemeSwitch` component.

## 8. Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Components not interactive | `init()` not called | Call `KTComponents.init()` after DOM ready |
| Tailwind classes not applied | Missing content path | Add `ktui/src/**` to Tailwind config |
| Styles look broken | CSS variables not defined | Define required variables on `:root` |
| SSR hydration mismatch | `init()` on server | Guard with `typeof window !== 'undefined'` |
| Re-init after navigation | SPA didn't re-init | Call `KTComponents.init()` after route change |

## Documentation

- **Installation:** [ktui.io/docs/installation](https://ktui.io/docs/installation)
- **Theming:** [ktui.io/docs/theming](https://ktui.io/docs/theming)
- **Dark mode:** [ktui.io/docs/dark-mode](https://ktui.io/docs/dark-mode)
- **TypeScript:** [ktui.io/docs/typescript](https://ktui.io/docs/typescript)
