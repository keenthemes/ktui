---
name: ktui-theming
description: Guides KtUI theming with CSS variables, light/dark mode, and semantic colors. Use this skill when the user asks about KtUI colors, theme, dark mode, customizing appearance, or CSS variables for KtUI.
---

# KtUI Theming

Use this skill when working with [KtUI](https://ktui.io) theming—colors, dark mode, and custom appearance. KtUI uses CSS variables and a background/foreground convention; prefer these over inventing custom classes.

## Convention

- **Background/foreground:** KtUI follows a Shadcn-inspired convention. Background colors omit the `-background` suffix (e.g. `bg-primary` uses `var(--primary)`). Foreground colors use `-foreground` (e.g. `text-primary-foreground`).
- **Semantic classes:** Use KtUI semantic utilities (e.g. `bg-background`, `text-foreground`, `bg-primary`, `text-card`, `kt-btn`, `kt-card`) so theming stays consistent.

## Key CSS variables

Define or override in your Tailwind entry (e.g. `style.css`). KtUI expects at least:

- **Surfaces:** `--background`, `--foreground`; `--card`, `--card-foreground`; `--popover`, `--popover-foreground`.
- **Brand:** `--primary`, `--primary-foreground`; `--secondary`, `--secondary-foreground`.
- **Muted / accent:** `--muted`, `--muted-foreground`; `--accent`, `--accent-foreground`.
- **Destructive:** `--destructive`, `--destructive-foreground`.
- **Borders and inputs:** `--border`, `--input`, `--ring`.
- **Radius:** `--radius` (e.g. `0.5rem`).

Use `oklch()` or any valid CSS color. Example:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(14.1% 0.005 285.823);
  --primary: oklch(62.3% 0.214 259.815);
  --primary-foreground: oklch(1 0 0);
  --radius: 0.5rem;
}
```

## Dark mode

- **Variables:** Override the same variables under a `.dark` scope (or your dark-mode class). KtUI docs use `.dark` for dark theme.
- **Tailwind:** Add the dark variant, e.g. `@custom-variant dark (&:is(.dark *));` in your Tailwind entry so utilities like `dark:bg-background` work.
- **Theme switch:** Use the KTThemeSwitch component or toggle the `.dark` class on `<html>` (or a wrapper) to switch between light and dark variables.

## Documentation

- **Theming:** [ktui.io/docs/theming](https://ktui.io/docs/theming)
- **Dark mode:** [ktui.io/docs/dark-mode](https://ktui.io/docs/dark-mode)
- **Installation** (variables setup): [ktui.io/docs/installation](https://ktui.io/docs/installation)

Prefer the official variable list and examples from these pages over guessing variable names or values.
