# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This is **setup-cangjie**, a GitHub Action that installs the Cangjie (仓颉) programming language SDK into GitHub Actions runners. It is a single TypeScript project (not a monorepo).

- **Runtime**: Node.js 24 (specified in `action.yml`)
- **Package manager**: pnpm 10.33.0 (see `packageManager` in `package.json`)
- **Build**: Rollup bundles `src/index.ts` → `dist/index.js`

### Available commands

| Command | Description |
|---|---|
| `pnpm run lint` | Run ESLint |
| `pnpm run lint:fix` | Run ESLint with auto-fix |
| `pnpm run build` | Bundle TypeScript via Rollup to `dist/index.js` |
| `pnpm run dev` | Run source directly via `tsx` (requires GitHub Actions env) |

### Caveats

- `pnpm run dev` will always fail outside a GitHub Actions runner because it depends on `@actions/core` environment variables (`RUNNER_TEMP`, `INPUT_*`, etc.). This is expected.
- End-to-end testing can only be done through GitHub Actions CI (`.github/workflows/test.yml`). Locally, validate via `pnpm run lint` and `pnpm run build`.
- Build warnings about `"this" has been rewritten to "undefined"` and circular dependencies are from upstream `@actions/*` packages and are harmless.
- The `pnpm.onlyBuiltDependencies` field in `package.json` restricts native builds to `esbuild` only; no interactive `pnpm approve-builds` is needed.
