# Lint Warning Backlog

Last updated: 2026-05-28

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

Latest checked command:

```bash
npm run lint:all -- --format stylish
```

Result: 0 errors, 181 warnings after the first cleanup pass (last checked 2026-05-28).

The cleanup pass:

- Fixed test override ordering so test-only `any` usage is not re-enabled by broader app/API overrides.
- Removed safe unused imports and variables across API routes and UI components.
- Added stricter socket payload types in `src/hooks/useSocket.ts`.

- Replace broad `any` usage in dashboard pages, hooks, search helpers, export helpers, and socket helpers.
- Remove unused imports and variables in API routes and UI components.
- React rules are enabled through `@eslint/compat` because `eslint-plugin-react@7.37.5` still uses removed ESLint rule-context APIs directly.
- React Hooks compiler-style findings are warnings for now, including `set-state-in-effect`, `immutability`, and `refs`.

## Cleanup Order

1. Hooks and shared libraries first, because they affect many callers.
2. API route unused imports next, because these are usually mechanical.
3. Dashboard page `any` values after shared data types are clarified.
4. React Hooks compiler warnings after behavior is reviewed component by component.
5. Test files last, keeping test readability ahead of type purity.
