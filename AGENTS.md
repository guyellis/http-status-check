# AGENTS.md

## What this is
http-status-check — a Node.js CLI and library that checks a list of URIs from a
config file and reports which ones respond with the expected status, alerting
through pluggable output adapters (console, email). ESM + strict TypeScript,
built with Vite in library mode into `dist/`.

## Repo facts
- Public repo. Default branch: `main`. Package manager: npm (package-lock.json).
- Node is pinned in `.nvmrc` (Node 24); `engines` in package.json matches.
- Source lives in `lib/`; tests live in `test/` mirroring it, named
  `<name>.test.ts`. Tests: Vitest with the v8 coverage provider, coverage on
  by default.

## Commands
- `npm run build` — Vite library build into `dist/`
- `npm test` — the full gate: typecheck, Vitest run, build
- `npm run lint` — ESLint, zero warnings allowed
- `npm run typecheck` — `tsc --noEmit`

## Working rules
- One issue per PR. Branch per issue. The PR body links its issue (`Fixes #N`).
- Public contracts: the config file format and the CLI's report output format
  must not change unless an issue explicitly says so. For refactors, the
  acceptance bar is behavior parity — same config in, same report out.
- Tests: use `test()` not `it()`. No visible output to stdout/stderr during a
  test run — output from code under test is captured by spies and asserted,
  never printed; the global console guard in the test setup enforces this.
  The coverage table prints at the end of the run.
- Coverage thresholds are enforced in the Vitest config. New code ships with
  tests; never lower a threshold or widen an exclusion to make a run pass.
- Code style: Prettier — printWidth 100, singleQuote, semi, tabWidth 2,
  trailingComma 'all', arrowParens 'always', useTabs false. ESLint flat config
  with typescript-eslint; curly always; eqeqeq; comma-dangle always-multiline;
  no-console (warn/error allowed). Alphabetize object literal keys and other
  constructs where the configured rules require it.
- TypeScript strict mode stays on. TypeScript stays on the 6.x line. ESM only —
  no CommonJS `require`.
- HTTP requests use the built-in `fetch`. Do not add an HTTP-client dependency
  without an issue justifying it.
- No secrets in code, config, or test fixtures — environment variables only,
  and fixtures use fake credentials.
