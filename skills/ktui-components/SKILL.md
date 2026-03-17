---
name: ktui-components
description: Guides correct use of KtUI (Keenthemes Tailwind UI) components—imports from @keenthemes/ktui, init pattern, and docs. Use this skill when building UI with KtUI, adding or customizing KtUI components, or when the user mentions KtUI, ktui, Keenthemes components, or Tailwind UI components from Keenthemes.
---

# KtUI Components

Use this skill when working with [KtUI](https://ktui.io)—free Tailwind UI components by Keenthemes. It ensures correct package usage, initialization, and reference to official docs.

## Package and imports

- **Package:** `@keenthemes/ktui` (npm install `@keenthemes/ktui`).
- **Import pattern (ESM):** Import components and/or the init helper from the package root:
  - Single component: `import { KTModal } from '@keenthemes/ktui';`
  - Init all: `import { KTComponents } from '@keenthemes/ktui';` then call `KTComponents.init()` after DOM ready.
- **Types (TypeScript):** Types are exported from the same entry; use the package root (e.g. `@keenthemes/ktui`) for types, not deep `lib/esm` paths.
- **Styles:** Include KtUI CSS (e.g. from the package or built `dist/styles.css`) and ensure Tailwind and CSS variables are set up as in the [installation docs](https://ktui.io/docs/getting-started/installation).

## Initialization

- Call `KTComponents.init()` once after the DOM is ready so that data-attribute–driven components (dropdowns, modals, tabs, etc.) are initialized.
- **Frameworks (React, Vue, Next):** Run init after the root is mounted (e.g. `useEffect` with empty deps, or `onMounted`) so the DOM with `data-kt-*` attributes exists before init.
- For dynamically added markup (e.g. after route change or lazy load), run `KTComponents.init()` again or use per-component init (e.g. `KTModal.init()` on the new container).
- **SSR:** Call init only on the client (e.g. inside `useEffect` or when `typeof document !== 'undefined'`), never during server render.
- Per-component init is also available (e.g. `KTModal.init()`) when not using the full init.

## Documentation

- **Official docs:** [https://ktui.io](https://ktui.io) — use for component APIs, examples, and markup.
- **Doc paths:** Getting started: `ktui.io/docs/installation`, `ktui.io/docs/theming`, `ktui.io/docs/typescript`, `ktui.io/docs/dark-mode`, `ktui.io/docs/rtl`, `ktui.io/docs/changelog`. Components: `ktui.io/docs/<component>` (e.g. `ktui.io/docs/modal`, `ktui.io/docs/tooltip`, `ktui.io/docs/datatable`, `ktui.io/docs/dropdown`).
- Prefer docs and examples from ktui.io over inferring markup or options.

## Common pitfalls

- **Components not opening or reacting:** Ensure `KTComponents.init()` ran after the relevant DOM was in the page; for SPAs, run init after navigation or after injecting KtUI markup.
- **Styles missing or wrong:** Confirm KtUI CSS and CSS variables are loaded (see [installation](https://ktui.io/docs/installation), [theming](https://ktui.io/docs/theming)).
- **SSR/hydration:** Do not call init during server render; run it only in the browser after mount.

## Component list (reference)

Components exported from `@keenthemes/ktui` include: KTDropdown, KTModal, KTDrawer, KTCollapse, KTDismiss, KTTabs, KTAccordion, KTScrollspy, KTScrollable, KTScrollto, KTSticky, KTReparent, KTToggle, KTTooltip, KTStepper, KTThemeSwitch, KTImageInput, KTTogglePassword, KTDataTable, KTSelect, KTToast, KTRating. See the package exports or ktui.io for the full list and usage.
