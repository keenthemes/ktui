# Contributing to KTUI

Thanks for contributing to KTUI.

## Quick Start

```sh
git clone https://github.com/keenthemes/ktui.git
cd ktui
npm install
```

Optional (recommended for contributors):

```sh
git remote add upstream https://github.com/keenthemes/ktui.git
```

## Development Commands

```sh
npm run dev
npm run build
npm run format
npm run lint
npm run type-check:strict
```

- `dev`: watch mode for local development
- `build`: one-off production build

## Code Quality Rules

- Keep TypeScript strictness enabled.
- Avoid `any` in production source; prefer `unknown` + narrowing.
- Avoid broad `Function` typing; define explicit function signatures.
- Keep public API contracts typed with exported KTUI interfaces.

Before opening a PR, run:

```sh
npm run type-check:strict
npm run lint
```

## Commit Message Convention

Use conventional prefixes:

- `feat`: new feature
- `fix`: bug fix
- `refactor`: code change without feature/bug fix
- `docs`: documentation only
- `build`: tooling/dependency/build changes
- `ci`: CI configuration changes
- `chore`: maintenance changes

Example:

```sh
feat(components): add new prop to avatar
```

## Pull Requests

1. Create a branch.
2. Make focused changes.
3. Run quality checks.
4. Push and open a PR against the main repo.

If you need help, contact [@keenthemes](https://x.com/keenthemes).
