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
@import "./node_modules/ktui/styles.css";
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
