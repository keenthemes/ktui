# KTUI

KTUI is a modular JavaScript/TypeScript UI utility and component library for building fast, interactive, and beautiful web applications. It provides a wide range of DOM-based UI components and utilities that can be easily initialized and customized.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build the library (development mode)
npm run build
```

## 🛠 Available Scripts

- `npm test` – Run tests (currently a placeholder)
- `npm run build` – Build the library using webpack in development mode
- `npm run build:prod` – Build the library using webpack in production mode
- `npm run build:lib` – Build the library outputs for CommonJS and ES Modules using TypeScript
- `npm run lint` – Lint the source files with ESLint
- `npm run format` – Format the source files with Prettier

## 📦 Installation

```bash
npm install ktui
# or
yarn add ktui
```

## ✨ Usage

Include the KTUI bundle in your HTML and initialize components:

```html
<!-- Example: Include KTUI JS and CSS -->
<link rel="stylesheet" href="/path/to/ktui/styles.css" />
<script src="/path/to/ktui/dist/ktui.js"></script>
<script>
  // Initialize all KTUI components after DOM is ready
  window.KTComponents.init();
</script>
```

Or, if using modules in your project:

```js
import KTComponents from 'ktui';
KTComponents.init();
```

## 📚 Available Components

- Dropdown (`KTDropdown`)
- Modal (`KTModal`)
- Drawer (`KTDrawer`)
- Collapse (`KTCollapse`)
- Dismiss (`KTDismiss`)
- Tabs (`KTTabs`)
- Accordion (`KTAccordion`)
- Scrollspy (`KTScrollspy`)
- Scrollable (`KTScrollable`)
- Scrollto (`KTScrollto`)
- Sticky (`KTSticky`)
- Reparent (`KTReparent`)
- Toggle (`KTToggle`)
- Tooltip (`KTTooltip`)
- Stepper (`KTStepper`)
- Theme Switch (`KTThemeSwitch`)
- Image Input (`KTImageInput`)
- Toggle Password (`KTTogglePassword`)
- DataTable (`KTDataTable`)
- Datepicker (`KTDatepicker`)
- Select (`KTSelect`)

## Features
- Modular and customizable DOM-based components
- Built with accessibility in mind
- Theming support
- Responsive design
- Easy integration with any web framework

## Contributing

Contributions are welcome! Please open issues or submit pull requests for new features, bug fixes, or improvements.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.