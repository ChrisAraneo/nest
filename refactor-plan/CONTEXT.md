# Context: the repository at the baseline commit

Everything here was measured on 2026-10-08 by running the commands shown. Executors
read the **Commands** and **Baseline failures** sections. Everything else is
evidence for the architect's decisions.

## 1. Baseline

| Item | Value | Evidence |
| --- | --- | --- |
| Branch | `master` | `git branch --show-current` |
| Baseline commit | `35142c3eca8edaaf6abc5984d915da2fbd458aa2` (2026-10-02, "chore(deps): update vitest monorepo to v5.0.3 (#17899)") | `git rev-parse HEAD` |
| Working tree at start | clean | `git status --short` printed nothing before `refactor-plan/` was created |
| Machine the baseline ran on | Windows 11 Home 10.0.26200, Node v24.10.0, npm 11.6.1, Git Bash | `node -v`, `npm -v` |
| CI | CircleCI on Linux, Node 20.19 / 22.14 / 24.1 | `.circleci/config.yml` |

## 2. What the repository is

- **NestJS v12 framework monorepo.** TypeScript 5.9.3, native ESM (`"type": "module"`
  in every package), `module`/`moduleResolution: Node16`, legacy decorators
  (`experimentalDecorators` + `emitDecoratorMetadata`). Root `package.json`
  is `@nestjs/core@12.0.0` with npm workspaces `packages/*`; releases use lerna 10.
- Nine published packages: `@nestjs/common`, `core`, `microservices`,
  `websockets`, `testing`, `platform-express`, `platform-fastify`,
  `platform-socket.io`, `platform-ws`.
- **Every source file path is public API.** Each package's `exports` map
  contains `"./*": "./*.js"` (for example `packages/common/package.json`), so
  `import … from '@nestjs/common/utils/shared.utils.js'` works for users. Moving
  or renaming a file breaks those imports.
- **The public API is classes, decorators, enums and thrown exceptions.**
  Package sources have 285 `export class` / `export abstract class`
  declarations, 33 exported `enum`s and 172 exported `function` declarations.
  Most of those functions are decorators, and decorators can only be applied
  to classes. (Counted with `grep -E '^export (abstract )?class '` and similar
  over non-spec, non-test `packages/**/*.ts`.)
- `iterare` 1.2.1 (a lazy collection library) is a runtime dependency of
  `common`, `core`, `microservices` and `websockets`.

### Size (non-blank lines, from `refactor-plan/baseline/audit-files.csv`)

| Folder | Kind | Files | Lines |
| --- | --- | ---: | ---: |
| `packages/common` | source | 202 | 11 606 |
| `packages/core` | source | 197 | 16 788 |
| `packages/microservices` | source | 137 | 12 750 |
| `packages/websockets` | source | 44 | 2 136 |
| `packages/platform-fastify` | source | 40 | 3 099 |
| `packages/platform-express` | source | 25 | 1 477 |
| `packages/testing` | source | 13 | 804 |
| `packages/platform-ws` | source | 3 | 316 |
| `packages/platform-socket.io` | source | 3 | 127 |
| `packages/*/test/**` | spec (`*.spec.ts`) | 305 | 52 256 |
| `packages/*/test/**` | test support (non-spec) | 6 | 485 |
| `integration/` | e2e apps + 167 specs | 578 | 30 309 |
| `sample/` | 41 standalone example apps | 398 | 9 347 |
| `tools/` | gulp tasks (7) + benchmarks (8) | 15 | 630 |
| **Total** | | **1 966** | |

All 305 package specs live in `packages/<pkg>/test/` mirroring the source tree;
`git ls-files 'packages/*.spec.ts' | grep -vc '/test/'` prints `0`.

## 3. Commands (executors use these exactly)

Run every command from the repository root. Install once per clone.

| Purpose | Command | Baseline result |
| --- | --- | --- |
| Install | `npm ci --legacy-peer-deps` (CI uses `npm install --legacy-peer-deps`; `ci` leaves `package-lock.json` untouched) | exit 0, 21 s |
| Build = typecheck of all package **sources** | `npm run build` | exit 0, 12 s, 0 errors. Builds all 9 project references (`packages/tsconfig.json`), emits 664 `.js` + 664 `.d.ts` next to the sources (git-ignored). |
| Typecheck one package | `npx tsc -p packages/<pkg>/tsconfig.build.json --noEmit` | not run separately; covered by the build. Use after changing files in `<pkg>`. |
| Typecheck **specs** and integration | `npx tsc -p tsconfig.spec.json --noEmit` | exit 2, 14 s, **225 errors in 60 files** (1 547 files checked). Not run in CI. Per-file counts: `refactor-plan/baseline/spec-typecheck-errors-by-file.txt`. |
| Unit tests (all) | `npx vitest run` (= `npm run test`) | exit 1, 22 s. 305 files: 304 passed, 1 crashed (see Baseline failures). 3 814 tests: 3 777 passed, 37 not run. |
| Unit tests (some) | `npx vitest run <path-or-folder> [<path> …]` | e.g. `npx vitest run packages/common/test/utils` |
| Coverage | `npx vitest run --coverage.enabled --coverage.provider=v8 --coverage.reporter=text-summary --coverage.include='packages/**/*.ts' --coverage.exclude='**/*.spec.ts' --coverage.exclude='packages/**/test/**' --coverage.exclude='**/*.d.ts'` | 87.76 % lines over 664 files. Per-file numbers in `refactor-plan/baseline/coverage-by-file.csv`. `npm run test:cov` uses a config that excludes 20 paths, so it hides gaps; do not use it to judge coverage. |
| Integration tests | `npm run test:docker:up && npm run test:docker:wait:rmq && npm run test:integration` | Needs Docker Desktop running. See §5. |
| Lint (existing) | `npm run lint` (`oxlint packages integration`) | exit 0, 1 s, 1 553 files, 67 rules, 1 warning (`packages/websockets/socket-module.ts:60`, `no-non-null-asserted-optional-chain`). `npm run lint:ci` (packages only) gives the same result. |
| Lint (guide rules) | `npx eslint <paths>`. Exists only after task T001. | Candidate config run from scratch: 1 568 files, 11 941 warnings, 0 errors, 8 s. Per-rule counts: `refactor-plan/baseline/eslint-style-warnings.txt`. |
| Format the files you changed | `npx prettier --write <file> [<file> …]` | Never run `npm run format`: it formats every file in the repository. |
| Format check | `npx prettier --check --end-of-line auto <files>` | Without `--end-of-line auto`, prettier flags 2 003 files on a Windows checkout because git checks files out with CRLF (`core.autocrlf=true`). With it, 31 files at baseline have real formatting drift. Leave those 31 alone unless a task puts them in scope. |
| Style audit | `node refactor-plan/tools/audit.mjs [--files <paths>] [--rules <ids>] [--format summary\|locations\|csv\|json] [--fail-on-any]` | 1 966 files, 50 189 violations, about 3 s. Baseline output: `refactor-plan/baseline/audit-summary.txt` and `audit-files.csv`. |

### Commit hooks

- `.husky/pre-commit` runs `npx lint-staged`, which runs prettier on staged
  `**/*.ts` and `packages/**/*.json`.
- `.husky/commit-msg` runs commitlint (`@commitlint/config-angular`).
  Allowed types: build, chore, ci, docs, feat, fix, perf, refactor, revert,
  style, test, sample. Scopes outside `common, core, sample, microservices,
  express, fastify, socket.io, ws, testing, websockets, release` only **warn**.
  Header at most 100 characters.

## 4. Baseline failures (already present; not caused by the refactor)

1. **`packages/core/test/nest-application-context.spec.ts` crashes its worker on
   Windows.** Its shutdown-hook tests call `process.kill(process.pid, 'SIGTERM')`
   (lines 96, 108 and others). On Windows that kills the process. Vitest reports
   `Worker exited unexpectedly with exit code 1`, the 37 tests in the file do not
   run, and `npx vitest run` exits 1. Reproduce with
   `npx vitest run packages/core/test/nest-application-context.spec.ts`. On Linux
   (CI) the file runs.
   - On Windows an acceptance check "the suite passes" therefore means: exit
     code 1, **304 files passed, 1 error, and the error names only
     `nest-application-context.spec.ts`**, with no failed tests.
2. **The spec typecheck has 225 errors** in 60 files (list in
   `baseline/spec-typecheck-errors-by-file.txt`). A task must not raise the
   count for any file.
3. **Prettier drift in 31 files** (see the format check above).
4. **oxlint warning** in `packages/websockets/socket-module.ts:60`.
5. **Integration tests** cannot run here without Docker (see §5).

## 5. Integration tests at baseline

- Docker 29.1.2 is installed, but the daemon was **not running**
  (`docker info` → "failed to connect to the docker API at
  npipe:////./pipe/dockerDesktopLinuxEngine"). Starting it is outside the
  architect's read-only remit.
- `npx vitest run --config vitest.config.integration.mts` was run anyway, with a
  900 s cap. It was killed at the cap (exit 124) after 84 of the 167 spec files
  (the config runs files one at a time with 30 s timeouts, and every broker test
  waits out its timeout). Of those 84: **77 passed, 7 failed**.
  - Four need brokers: `microservices/e2e/binary-redis`, `sum-mqtt`, `sum-nats`,
    `sum-rmq` (each test times out after 30 s).
  - Three fail without a broker, cause not investigated (likely Windows or
    timing): `file-upload/e2e/parity.spec.ts` (3 tests about writing to and
    cleaning up `dest`), `scopes/e2e/durable-providers.spec.ts` (2
    overlapping-request tests), `scopes/e2e/request-scope.spec.ts`.
  - Full list: `refactor-plan/baseline/integration-windows-partial.txt`.
- **Consequence:** there is no trustworthy local integration baseline. CI
  (CircleCI job `integration_tests`, Linux with Docker) is the integration
  safety net (D-21).

## 6. What each command really checks

- `npm run build` is a real typecheck: `packages/tsconfig.json` has 9 project
  references, and the log shows `Building project …` 9 times. It excludes
  `*.spec.ts` at each package root and `test/**`. So **specs are never
  typechecked by the build**, and a spec placed beside a source file below the
  package root (for example `packages/core/helpers/x.spec.ts`) would be
  **compiled into the published package**: each package's
  `tsconfig.build.json` excludes only the root-level pattern `"*.spec.ts"`, and
  the root `.npmignore` drops `*.ts` but keeps `*.js`.
- `npx vitest run` runs every `packages/**/*.spec.ts` (`vitest.config.mts`,
  `include`), with globals on and decorators transformed by Oxc. It does not
  typecheck.
- `npm run lint` checks correctness rules only (`categories.correctness:
  error`); `typescript/no-explicit-any` is off. It enforces nothing from the guide.

## 7. Test coverage

- Lines: 87.76 % overall. Per package: common 96.2 %, core 88.5 %,
  microservices 88.1 %, platform-express 55.6 %, platform-fastify 79.4 %,
  platform-socket.io 71.4 %, platform-ws 63.5 %, testing 98.3 %, websockets 86.9 %.
- Source files under 60 % line coverage (unit tests only):
  `core/errors/exceptions/invalid-class.exception.ts` (0 %),
  `core/errors/exceptions/invalid-middleware-configuration.exception.ts` (0 %),
  `core/repl/repl-native-commands.ts` (0 %), `core/repl/repl.ts` (0 %),
  `microservices/errors/{empty-response,invalid-grpc-message-decorator,invalid-message,invalid-tcp-data-reception,net-socket-closed}.exception.ts` (0 %),
  `microservices/exceptions/kafka-retriable-exception.ts` (0 %),
  `core/nest-factory.ts` (4 %), `microservices/exceptions/grpc-exception.ts` (25 %),
  `platform-express/adapters/express-adapter.ts` (33 %),
  `websockets/socket-module.ts` (35 %), `core/repl/repl-function.ts` (40 %),
  `websockets/adapters/ws-adapter.ts` (42 %), `core/adapters/http-adapter.ts` (49 %),
  `common/serializer/decorators/serialize-options.decorator.ts` (50 %),
  `core/errors/exceptions/runtime.exception.ts` (50 %),
  `core/helpers/context-id-factory.ts` (50 %),
  `core/middleware/middleware-module.ts` (56 %),
  `microservices/nest-microservice.ts` (58 %),
  `platform-fastify/adapters/fastify-adapter.ts` (59 %).
  The adapters, factories and `*-module.ts` files are exercised mainly by the
  Docker-based integration suite.
- 377 source files that export a function or class have no spec **beside**
  them (rule R-033). Every package source file has its spec, if any, under
  `test/`.

## 8. Conventions and tooling, compared with the guide

| Tool or doc | What it says | Against the guide |
| --- | --- | --- |
| `.prettierrc` | `singleQuote`, `trailingComma: all`, `arrowParens: avoid`, default `printWidth` 80 | Agrees with GUIDE §11.1. `arrowParens: avoid` is not mentioned by the guide; Prettier decides. |
| `CONTRIBUTING.md` "Coding Rules" | Google JS style, wrap at 100 columns, every change tested | Prettier is configured for 80, which matches §11.1. The 100-column sentence is stale. |
| `.oxlintrc.json` | correctness rules only, `no-explicit-any` **off** | Conflicts with §9.3/§16 (`no-explicit-any`). The guide's selectors need ESLint (oxlint 1.86 has no `no-restricted-syntax`: `oxlint --rules -f json` lists 871 rules and none of them is `no-restricted-syntax`). |
| `typescript-eslint` 8.71.0 | already a devDependency, but `eslint` itself is not installed (peer missing) | The guide's §16 config needs `eslint`. |
| Root `tsconfig.json` | `noImplicitAny: false`, `strictNullChecks: true`, no `verbatimModuleSyntax` | §9.5 asks for `verbatimModuleSyntax`. |
| `packages/tsconfig.build.json` | `strict: true`, `importHelpers: true`, `removeComments: false` | JSDoc comments are emitted into the published `.d.ts` files; §11.5 bans those comments. |
| Spec layout | specs under `packages/<pkg>/test/` | §2.3 wants a spec beside each file with the same base name. |
| Specs | Vitest **globals** (`globals: true`), heavy `vi.fn`/`vi.spyOn`/`sinon`-style stubs, `beforeEach` | §12.1 bans mocks, spies, `beforeEach`, `afterEach` and requires `import { describe, expect, it } from 'vitest'`. |
| Commitlint | angular types, warning-only scopes | The task commit message `refactor(<area>): … [T###]` is accepted. |
| Agent instruction files | none (`CLAUDE.md`, `AGENTS.md`, `.cursorrules` absent) | — |

## 9. Libraries the guide prescribes

None is installed (`npm ls lodash lodash-es ramda ts-pattern` → empty). Versions
proposed in DECISIONS.md, each published at least two weeks before 2026-10-08:

| Package | Version | Published | Notes |
| --- | --- | --- | --- |
| `lodash-es` | 4.18.1 | 2026-04-01 | ESM. Its `default` export is the full lodash object with the wrapper methods mixed in. |
| `@types/lodash-es` | 4.17.12 | 2023-11-21 | |
| `ts-pattern` | 5.9.0 | 2025-10-26 | `match`, `P`, `P.instanceOf`, `P.string`, `P.nullish`, `P.number.lt` exist. |
| `ramda` | 0.32.0 | 2025-10-10 | ESM via `exports.import` → `es/index.js`. Ships **no** type definitions. |
| `@types/ramda` | 0.32.0 | 2026-06-19 | Needed for `import { tryCatch } from 'ramda'` to type-check. The guide names only `@types/lodash-es`. |
| `eslint` | 10.11.0 | 2026-09-18 | engines `^20.19.0 \|\| ^22.13.0 \|\| >=24`; satisfies typescript-eslint 8.71.0's peer range `^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0`. 10.12.0 is under two weeks old. |

**Snippets verified.** In an isolated scratch project with this repo's compiler
settings (`module: Node16`, ESM, `strict`, legacy decorators, plus
`verbatimModuleSyntax: true`), TypeScript 5.9.3 compiled with exit 0, and Node
24 ran correctly, all of the following: the GUIDE §10.11 `chain` wrapper;
`chain(…).thru(…).value()`; `match` with `instanceOf`, `string`, `nullish` and
`number.lt(0)` destructured from `P`; `.when(isString, …)`; `tryCatch` assigned
to an annotated `const`; the §5.6 `tapEffect`; `flow`; `sortBy` with a negated
key; and `noop`. Output:
`[3,"boom","s","Unknown error occurred",42,0,"nothing","negative","text 2","other",[3,2,1],2,5]`.

**Hazard: `import type` and dependency injection (verified).** With
`emitDecoratorMetadata`, a class imported with `import type` and used as a
constructor parameter type of a decorated class compiles **without error**, but
emits `__metadata("design:paramtypes", [Function])` instead of `[Dep]`. Nest's
injector reads that metadata, so DI breaks at runtime and no check catches it.
`@typescript-eslint/consistent-type-imports` 8.71.0 handles this: when
`parserOptions.emitDecoratorMetadata` and `experimentalDecorators` are both
true, it reports nothing in any file that contains a decorator
(`node_modules/@typescript-eslint/eslint-plugin/dist/rules/consistent-type-imports.js`, lines 88–94 and 215–252).
A typecheck with `verbatimModuleSyntax: true` over package sources reports
664 × TS1484 (a type-only import must use `import type`), 76 × TS1205 (a type
re-export must use `export type`) and 1 × TS1485. These are interfaces and types,
which never carry runtime metadata, so fixing them is safe.

## 10. Files whose shape a framework or tool dictates

| Files | Why they cannot follow every rule as written |
| --- | --- |
| `packages/*/index.ts`, `packages/{common,core,websockets}/internal.ts`, `packages/platform-fastify/multipart/index.ts` and the `index.ts` barrels below them | Package entry points named in `exports`. They exist to re-export many names (R-030), and their file names are fixed. |
| Every other file under `packages/*/` | Its path is public through `"./*": "./*.js"`, so R-031, R-100 (file names) and R-034 (folder layout) cannot change it without breaking users. |
| Exported classes, decorators, enums and exception classes (`HttpException` and subclasses, `ValidationPipe`, `NestFactory`, `Test`, `ClientProxy`, …) | User code extends, instantiates, decorates and `instanceof`-checks them. R-041/R-042 (no classes, no `this`), R-111 (no enums), R-016 (no `throw`) and R-100 (string-union member case, e.g. `ContextType = 'http' \| 'ws' \| 'rpc'`) would change the public API. |
| `sample/**` | 41 standalone example apps with their own `package.json`, showing users how to write Nest code (classes and decorators). |
| `integration/**` | End-to-end apps built with Nest's class and decorator API. |
| `tools/gulp/**` | gulp task modules; `tools/benchmarks/**` benchmark apps for several frameworks. |
| `**/*.d.ts` (generated) | Build output; git-ignored. |
| `vitest.config*.mts`, `gulpfile.mjs`, `eslint.config.mjs` | Not TypeScript (`.mts`/`.mjs`); outside the guide's "every TypeScript file". |

## 11. Internal dependency graph

Value imports only (`import type` ignored), resolved from relative paths and
`@nestjs/<pkg>[/…]` aliases. 3 020 edges.

- **Package level (a DAG):** `common` imports nothing internal. `core` → common.
  `microservices` → common, core. `websockets` → common, core.
  `platform-express` and `platform-fastify` → common, core. `platform-socket.io`
  and `platform-ws` → common, websockets. `testing` → common, core.
  Bottom-up order: **common → core → {microservices, websockets} → {platform-*,
  testing}**.
- **Folder level, inside packages (cycles exist):**
  - common: `(root)`, `decorators`, `interfaces`, `services`, `utils` form one
    cycle. `enums`, `exceptions`, `file-stream`, `module-utils`, `pipes` and
    `serializer` sit outside it.
  - core: 14 folders form one cycle: `(root)`, `adapters`, `discovery`, `errors`,
    `exceptions`, `guards`, `helpers`, `injector`, `inspector`, `interceptors`,
    `middleware`, `pipes`, `router`, `security`.
  - microservices: `{ctx-host, interfaces}` and `{(root), client, context, server}`.
  - websockets: `{(root), context, utils}`. testing: `{(root), interfaces}`.
- Fan-in per file (how many package source files import it) is in the AUDIT.md
  file table. Highest: `common/internal.ts` 121, `common/index.ts` 96,
  `core/injector/instance-wrapper.ts` 34, `microservices/interfaces/index.ts` 34,
  `core/internal.ts` 32, `common/utils/shared.utils.ts` 29,
  `common/enums/http-status.enum.ts` 29, `core/injector/module.ts` 29.
