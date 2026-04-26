# Lint Warning Backlog

ESLint 10 is active and CI uses:

```bash
npm run lint
```

That script runs `eslint . --quiet`, so CI fails on lint errors without flooding GitHub logs with the existing warning backlog.

Use this command during cleanup work:

```bash
npm run lint:all
```

## Current Warning Themes

- Replace broad `any` usage in dashboard pages, hooks, search helpers, export helpers, socket helpers, and tests.
- Remove unused imports and variables in API routes and UI components.
- Remove stale eslint-disable comments where the warning no longer exists.
- Revisit React-specific lint rules after `eslint-plugin-react` supports ESLint 10 cleanly in this project.

## Cleanup Order

1. Hooks and shared libraries first, because they affect many callers.
2. API route unused imports next, because these are usually mechanical.
3. Dashboard page `any` values after shared data types are clarified.
4. Test files last, keeping test readability ahead of type purity.
