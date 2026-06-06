# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **TypeScript library**
(`@redstardev/unplugin-version-injector`), not a web app. There is no
long-running server. Development and validation are done via build + Vitest
integration tests that invoke bundlers in-process.

### Requirements

- **Node.js** >= 20
- **pnpm** >= 10 (repo pins `pnpm@10.11.0` in `package.json`; `mise.toml`
  optionally pins Node LTS and pnpm 11)

### Common commands

See `package.json` scripts and `.github/workflows/ci.yml`:

| Task                  | Command                          |
| --------------------- | -------------------------------- |
| Install deps          | `pnpm install --frozen-lockfile` |
| Lint                  | `pnpm run lint`                  |
| Fix lint/format       | `pnpm run lint:fix`              |
| Build                 | `pnpm run build`                 |
| Typecheck             | `pnpm run typecheck`             |
| Test (build + vitest) | `pnpm test`                      |
| Dev (watch rebuild)   | `pnpm run dev`                   |
| Clean test artifacts  | `pnpm run test:clean`            |

### Gotchas

- **`pnpm test` runs `build` first** — tests import from `dist/`, so always
  build before running Vitest directly (`pnpm exec vitest run`).
- **No daemon services** — Vite, Rollup, esbuild, Webpack, Rspack, Rolldown, and
  tsup are devDependencies invoked in-process by tests; nothing needs to be
  started separately.
- **Husky is skipped when `CI=true`** — see `.husky/install.mjs`; git hooks are
  optional for local dev.
- **pnpm build-script warning** — pnpm may warn that esbuild postinstall scripts
  were ignored. Integration tests still pass in this environment; if esbuild
  fails at runtime, investigate `pnpm approve-builds` or
  `pnpm.onlyBuiltDependencies` in `package.json`.
- **Farm bundler** — adapter exists (`src/farm.ts`) but has no automated tests
  in `tests/`.

### Validating core behavior manually

After `pnpm run build`, a minimal esbuild smoke test:

```sh
node --input-type=module -e "
import { build } from 'esbuild';
import VersionInjector from './dist/esbuild.js';
import { readFile } from 'node:fs/promises';
await build({
  format: 'esm',
  entryPoints: ['./tests/fixtures/build-in/javascript.mjs'],
  outfile: '/tmp/demo.mjs',
  plugins: [VersionInjector()],
});
console.log(await readFile('/tmp/demo.mjs', 'utf8'));
"
```

Expected: `[VI]{{inject}}[/VI]` is replaced with the version from
`package.json`.
