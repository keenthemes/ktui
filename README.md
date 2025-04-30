# KTUI

[🌐 Visit the Official Website](https://ktui.io)

**KTUI** is a modern, modular JavaScript/TypeScript UI library for building fast, interactive, and beautiful web applications. KTUI offers a comprehensive suite of DOM-based UI components and utilities, designed for flexibility, accessibility, and seamless integration with any web project.

---

## 🚀 Quick Start

```bash
# Install dependencies
yarn install
# or
npm install

# Build the library (development mode)
yarn build
# or
npm run build
```

---

## 📦 Installation

Add KTUI to your project:

```bash
yarn add ktui
# or
npm install ktui
```

---

## ✨ Usage

### 1. Using as a Script in HTML

```html
<link rel="stylesheet" href="/path/to/ktui/styles.css" />
<script src="/path/to/ktui/dist/ktui.js"></script>
<script>
  // Initialize all KTUI components after DOM is ready
  window.KTComponents.init();
</script>
```

### 2. Using as a Module in TypeScript/JavaScript

```ts
import KTComponents from 'ktui';
KTComponents.init();
```

---

## 🧩 Available Components

KTUI provides a wide range of UI components, including:

- **Dropdown** (`KTDropdown`)
- **Modal** (`KTModal`)
- **Drawer** (`KTDrawer`)
- **Collapse** (`KTCollapse`)
- **Dismiss** (`KTDismiss`)
- **Tabs** (`KTTabs`)
- **Accordion** (`KTAccordion`)
- **Scrollspy** (`KTScrollspy`)
- **Scrollable** (`KTScrollable`)
- **Scrollto** (`KTScrollto`)
- **Sticky** (`KTSticky`)
- **Reparent** (`KTReparent`)
- **Toggle** (`KTToggle`)
- **Tooltip** (`KTTooltip`)
- **Stepper** (`KTStepper`)
- **Theme Switch** (`KTThemeSwitch`)
- **Image Input** (`KTImageInput`)
- **Toggle Password** (`KTTogglePassword`)
- **DataTable** (`KTDataTable`)
- **Datepicker** (`KTDatepicker`)
- **Select** (`KTSelect`)

---

## 🌟 Features

- Modular and customizable DOM-based components
- Built with accessibility in mind
- Theming and dark mode support
- Responsive design
- Easy integration with any web framework or static site
- TypeScript support for type safety and autocompletion

---

## 🛠 Scripts

- `npm run build` – Build the library using webpack in development mode
- `npm run build:prod` – Build the library using webpack in production mode
- `npm run build:lib` – Build the library outputs for CommonJS and ES Modules using TypeScript
- `npm run lint` – Lint the source files with ESLint
- `npm run format` – Format the source files with Prettier

---

## 🤝 Contributing

We welcome contributions! To get started:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

For guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 License

KTUI is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.