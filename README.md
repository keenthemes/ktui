# KTUI

[🌐 Visit the Official Website](https://ktui.io)

**KTUI** is a modern, modular JavaScript/TypeScript UI library for building fast, interactive, and beautiful web applications. KTUI offers a comprehensive suite of DOM-based UI components and utilities, designed for flexibility, accessibility, and seamless integration with any web project.

---

## Installation

Before you begin, ensure you have installed [Node.js](https://nodejs.org) and [Tailwind CSS](https://tailwindcss.com/), and have a working Tailwind based project.

### Install via NPM

```bash
npm i @keenthemes/ktui
```

---

## Variables

Include KTUI variables in your Tailwind entry file `style.css`:

```css
/** Colors **/
:root {
    /** Base Colors **/
    --background: oklch(1 0 0); /* --color-white */
    --foreground: oklch(14.1% 0.005 285.823); /* --color-zinc-950 */
    --card: oklch(1 0 0); /* --color-white */
    --card-foreground: oklch(14.1% 0.005 285.823); /* --color-zinc-950 */
    --popover: oklch(1 0 0); /* --color-white */
    --popover-foreground: oklch(14.1% 0.005 285.823); /* --color-zinc-950 */
    --primary: oklch(62.3% 0.214 259.815); /* --color-blue-500 */
    --primary-foreground: oklch(1 0 0); /* --color-white */
    --secondary: oklch(96.7% 0.003 264.542); /* --color-zinc-100 */
    --secondary-foreground: oklch(21% 0.006 285.885); /* --color-zinc-900 */
    --muted: oklch(96.7% 0.003 264.542); /* --color-zinc-100 */
    --muted-foreground: oklch(55.2% 0.016 285.938); /* --color-zinc-500 */
    --accent: oklch(96.7% 0.003 264.542); /* --color-zinc-100 */
    --accent-foreground: oklch(21% 0.006 285.885); /* --color-zinc-900 */
    --destructive: oklch(57.7% 0.245 27.325); /* --color-red-600 */
    --destructive-foreground: oklch(1 0 0); /* --color-white */
    --mono: oklch(14.1% 0.005 285.823); /* --color-zinc-950 */
    --mono-foreground: oklch(1 0 0);  /* --color-white */

    /** Base Styles **/
    --border: oklch(94% 0.004 286.32); /* between --color-zinc-100 and --color-zinc-200 */
    --input: oklch(92% 0.004 286.32); /* --color-zinc-200 */
    --ring: oklch(87.1% 0.006 286.286); /* --color-zinc-400 */
    --radius: 0.5rem;
}

.dark {
    /** Base Colors **/
    --background: oklch(14.1% 0.005 285.823); /* --color-zinc-950 */
    --foreground: oklch(98.5% 0 0); /* --color-zinc-50 */
    --card: oklch(14.1% 0.005 285.823); /* --color-zinc-950 */
    --card-foreground: oklch(98.5% 0 0); /* --color-zinc-50 */
    --popover: oklch(14.1% 0.005 285.823); /* --color-zinc-950 */
    --popover-foreground: oklch(98.5% 0 0); /* --color-zinc-50 */
    --primary: oklch(54.6% 0.245 262.881); /* --color-blue-600 */
    --primary-foreground: oklch(1 0 0); /* --color-white */
    --secondary: oklch(27.4% 0.006 286.033); /* --color-zinc-800 */
    --secondary-foreground: oklch(98.5% 0 0); /* --color-zinc-50 */
    --muted: oklch(21% 0.006 285.885); /* --color-zinc-900 */
    --muted-foreground: oklch(55.2% 0.016 285.938); /* --color-zinc-500 */
    --accent: oklch(21% 0.006 285.885); /* --color-zinc-900 */
    --accent-foreground: oklch(98.5% 0 0); /* --color-zinc-50 */
    --destructive: oklch(57.7% 0.245 27.325); /* --color-red-600 */
    --destructive-foreground: oklch(1 0 0); /* --color-white */
    --mono: oklch(87.1% 0.006 286.286); /* --color-zinc-300 */
    --mono-foreground: oklch(0 0 0); /* --color-black */

    /** Base Styles **/
    --border: oklch(27.4% 0.006 286.033); /* --color-zinc-800 */
    --input: oklch(27.4% 0.006 286.033); /* --color-zinc-800 */
    --ring: oklch(27.4% 0.006 286.033); /* --color-zinc-600 */
}

/** Theme Setup **/
@theme inline {
    /** Base Colors **/
    --color-background: var(--background);
    --color-foreground: var(--foreground);

    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);

    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);

    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);

    --color-accent: var(--accent);
    --color-accent-foreground: var(--accent-foreground);

    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);

    --color-secondary: var(--secondary);
    --color-secondary-foreground: var(--secondary-foreground);

    --color-destructive: var(--destructive);
    --color-destructive-foreground: var(--destructive-foreground);

    --color-mono: var(--mono);
    --color-mono-foreground: var(--mono-foreground);

    /** Base Styles **/
    --color-border: var(--border);
    --color-input: var(--input);
    --color-ring: var(--ring);

    --radius-xl: calc(var(--radius) + 4px);
    --radius-lg: var(--radius);
    --radius-md: calc(var(--radius) - 2px);
    --radius-sm: calc(var(--radius) - 4px);
}
```

---

## Dark Mode

To enable automated dark mode support add below Tailwind variant in your Tailwind entry file `style.css`:

```css
@custom-variant dark (&:is(.dark *));
```

---

## Styles

Include KTUI styles in your Tailwind entry file `style.css`:

```css
@import "@keenthemes/ktui/styles.css";
```

---

## Font

Specify a font family of your choice in your Tailwind entry file `style.css`:

```css
@theme  {
    --default-font-family: Inter;
}
```

Include the font file:

```html
<html>
    <head>
        ...
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        ...
    </head>
    <body className="antialiased">
        ....
    </body>
</html>
```

---

## Assets

Include KTUI JavaScript, Tailwind CSS, and fonts:

```html
<html>
    <head>
        ...
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        <link href="my_project_root/css/styles.css" rel="stylesheet"/>
        ...
    </head>
    <body className="antialiased">
        ....
    </body>
    <script src="./node_modules/@keenthemes/ktui/dist/ktui.min.js">
    </script>
</html>
```

---

## RTL Support

To globally setup the RTL direction add a `dir="rtl"` attribute on the html as shown below:

```html
<!-- Setup rtl mode -->
<html dir="rtl">
    <!-- HTML markup -->
</html>
```

KTUI utilizes the logical CSS properties as the default method for handling RTL support. This approach simplifies RTL support by using context-aware properties that adjust based on the document's text direction.

```html
<!-- Using logical properties -->
<div class="text-start ps-5">
    Example text
</div>
```

For specific cases, you can use the `rtl:*` Tailwind modifier to easily control alignments for both LTR and RTL directions.

```html
<!-- Using rtl modifier -->
<div class="text-left pl-5 rtl:text-right rtl:pr-5">
    Example text
</div>
```

---

## License

KTUI is distributed under the MIT license. See [LICENSE.md](https://github.com/keenthemes/reui/blob/main/LICENSE.md) for full details.

---

## Contributing

Please see our [CONTRIBUTING.md](https://github.com/keenthemes/reui/blob/main/CONTRIBUTING.md) for guidelines if you wish to contribute to KTUI.
