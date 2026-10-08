# Decisions

Executors read **D-09** (branch and commits) and **D-18** (baseline failures).
Everything else explains why tasks look the way they do.

## Summary

The guide (GUIDE.md) and this repository disagree at the root. The guide bans
classes, `this`, the `function` keyword, `throw`, `enum`, comments and non-kebab
file names, and it requires one export per file. NestJS's **public API** is made
of classes, decorators applied to classes, enums, thrown exception classes and
documented deep-import paths (CONTEXT §2, §10). Applying the guide to the
package sources as written changes that API, which a behaviour-preserving
refactor may not do without the human's approval. The guide also allows no
exception except measured ones (§15), and a sibling document "may not relax"
its rules (preamble).

The plan therefore runs in two stages:

1. **Now (no human answer needed):** tooling and documents (T001–T005) and a
   first safety net of characterisation specs (T010–T015). They change no
   published code.
2. **After the blocking questions Q1–Q4 are answered:** dependencies, the
   wrapper module, then Structure, Rewrite, Sweeps and Tightening. Those tasks
   are listed in ROADMAP.md with their file sets and are `needs-detailing` in
   PROGRESS.md. T006–T009 are already written in full but stay
   `needs-detailing` until Q2 is answered.

---

## 1. Decisions made

### D-01: Dependencies (adoption blank §16.1)

- **Question:** which versions, and where do they go?
- **Decision:** `lodash-es@4.18.1`, `ts-pattern@5.9.0` and `ramda@0.32.0` as
  exact versions (the repo pins exact versions, see `package.json` and
  `renovate.json`) in the `dependencies` of the **root** `package.json` and of
  each published package whose sources import them (initially
  `packages/common/package.json`, because the wrapper lives there, D-02).
  `@types/lodash-es@4.17.12` and `@types/ramda@0.32.0` go in the root
  `devDependencies`. Each package's `dependencies` gets the libraries when a
  task first imports them in that package.
- **Evidence:** CONTEXT §9. All versions are at least two weeks old, and the
  snippets compile and run with them. `ramda` ships no types, so
  `@types/ramda` is needed even though the guide names only `@types/lodash-es`
  (the guide requires that named imports type-check, §10.2).
- **Rejected:** `ramda`'s bundled `types-ramda` alone (not resolvable from the
  `ramda` import without `@types/ramda`); peer dependencies (users would have to
  install three libraries by hand).
- **Status:** needs approval, **Q2**.

### D-02: The `chain` wrapper module (adoption blank §16.2)

- **Decision:** `packages/common/utils/chain.ts`, exactly the GUIDE §10.11 code,
  with its spec `packages/common/utils/chain.spec.ts`. Re-exported from
  `packages/common/internal.ts` (`export { chain } from './utils/chain.js';`).
  Inside `packages/common`, import it relatively; every other package uses
  `import { chain } from '@nestjs/common/internal';`.
- **Evidence:** every other package already depends on `@nestjs/common`, and
  `@nestjs/common/internal` is the existing channel for code shared between
  packages that is not public API (`packages/common/internal.ts` header). The
  file name follows R-031 (`chain` → `chain.ts`).
- **Rejected:** one wrapper per package (the guide says "Re-export it once");
  a new shared package (adds a published package).

### D-03: Domain glossary (adoption blank §16.3)

- **Decision:** `docs/GLOSSARY.md`, contents given in full in task T002. Words
  were chosen by majority use in the package sources at baseline, and every
  abbreviation was rejected (§8.4). The counters recorded are `index` (from 0),
  module `distance` (root module = 1, global modules = `Number.MAX_VALUE`,
  unmeasured = 0; `packages/core/scanner.ts` ~L414–433,
  `packages/core/injector/topology-tree/topology-tree.ts` L17–22) and
  `retryAttempts` (a count, not an index).

### D-04: Where constants live (adoption blank §16.4)

- **Decision:** each package's existing `constants.ts` at the package root
  (`packages/common/constants.ts`, `packages/core/constants.ts`, …) is that
  package's "nearest `consts.ts`". A feature folder that later needs its own
  file gets `consts.ts` in that folder.
- **Evidence:** `@nestjs/common/constants` and similar are public deep-import
  paths (`exports` `"./*"`), and 23 package source files import
  `packages/common/constants.ts` (fan-in, AUDIT §6). Renaming it to `consts.ts`
  breaks users.
- **Status:** default for non-blocking question **Q7**.

### D-05: The real commands (adoption blank §16.5)

CONTEXT.md §3, including the quirks: the build typechecks sources but never
specs; specs need `npx tsc -p tsconfig.spec.json --noEmit`; prettier needs
`--end-of-line auto` on Windows; one test file crashes on Windows.

Also: when a public file must keep its path while its content moves (C-15),
the old file keeps `export { … } from './new-file.js';` lines. That is
conditional on **Q1**.

### D-06: The wrapper module's namespace import and cast

GUIDE §10.11 prescribes `import * as lodashModule from 'lodash-es'` and
`(lodashModule as unknown as { default: typeof lodashModule }).default`. That
contradicts R-115 (no `as`) and R-122 (no namespace import). §10.11 says "This
wrapper module is the one place a namespace import of lodash is allowed", so
the wrapper file is exempt from both, and only that file.
`eslint.config.mjs` gets a file-specific override in T007.

### D-07: Import specifier spelling (GUIDE §10.19 "pick one per repository")

Relative imports **with** the `.js` extension. `module: Node16` with
`"type": "module"` requires it (TS2835 otherwise; the spec typecheck already
reports 26 TS2835 errors where specs omit it). Cross-package imports use the
`@nestjs/<pkg>[/…]` aliases from `tsconfig.json` `paths`.

### D-08: Specs beside their sources

- **Question:** R-033 wants `x.spec.ts` beside `x.ts`, but each package's
  `tsconfig.build.json` excludes only the root-level `"*.spec.ts"`, so a nested
  spec would be compiled and published (CONTEXT §6).
- **Decision:** change the exclude entry to `"**/*.spec.ts"` in all 9
  `packages/*/tsconfig.build.json` (task T004). Verified in a scratch copy of
  the repository: the build still emits exactly 664 `.js` files and no `.spec.js`.
  `vitest.config.mts` (`packages/**/*.spec.ts`), `tsconfig.spec.json`
  (`packages/**/*.spec.ts`) and the root `tsconfig.json`
  (`exclude: **/*.spec.ts`) already handle nested specs.
- **Existing specs** stay in `test/` until the Structure phase moves them (and
  until Q6 decides how they are rewritten).

### D-09: Branch, commits and parallel work (executors read this)

- **Branch:** `refactor/functional-pipelines`, created from the baseline commit
  `35142c3eca8edaaf6abc5984d915da2fbd458aa2`. The human creates it and commits
  `refactor-plan/` on it as the first commit
  (`chore(refactor-plan): add refactoring plan`). Executors work only on this
  branch.
- **One commit per task**, containing exactly the task's in-scope files and
  `refactor-plan/PROGRESS.md`, with the message the task gives. Messages follow
  `.commitlintrc.json` (angular types; the header is at most 100 characters).
  The husky pre-commit hook runs prettier on staged `.ts` files. Never skip it.
- **Parallel lanes:** tasks in different lanes have disjoint file sets apart from
  `PROGRESS.md`. Run parallel lanes in separate git worktrees on separate
  branches (`refactor/functional-pipelines-lane-<X>`), and merge them back into
  `refactor/functional-pipelines` after each checkpoint. Conflicts can only
  occur in `PROGRESS.md` rows; keep both sides.
- **Merging to `master`:** a human opens a pull request after each phase
  checkpoint. CI (`.circleci/config.yml`: build, unit tests on Node 20/22/24,
  lint, **integration tests with Docker**) must be green before merging.

### D-10: No measured exceptions are granted

GUIDE §15 permits imperative code only with a recorded measurement. None
exists. Candidates are the per-request paths in `packages/core/router/`,
`packages/core/pipes/`, `packages/core/guards/`, `packages/core/interceptors/`
and `packages/core/helpers/external-context-creator.ts`, plus the
serializers and deserializers in `packages/microservices/`. ROADMAP schedules
a benchmark task (T150) before any of them is rewritten, using the existing
`tools/benchmarks/`. A rewrite task that touches them stops if T150 is not
`done`.

### D-11: Standard step names (GUIDE §6.8)

The guide's own order: `get…` (parameters), `find…` (candidates),
`sort…`/`shuffle…`, `pick…`, `create…` (edits), `apply…`. Steps carry the
feature name (R-101), e.g. `findRouteCandidates`.

### D-12: Test callbacks may hold statements

§12.8 ("separate the setup, the call and the `expect`s with blank lines")
requires statements inside a test, which contradicts the single-expression
rule. Decision: callbacks passed directly to `it`, `test`, `describe` (and to
the hooks, in existing specs) are exempt from R-010 and R-019. Everything else
in a spec follows R-010.

### D-13: Type parameters may be one letter

R-102 ("NEVER use one-letter names") is about values: its examples are callback
parameters. The guide itself writes `<T>(value: T, effect: (value: T) => void)`
(§5.6). Type parameters such as `T` are not reported.

### D-14: `as const` counts as an `as` cast

§9.3 bans "`as` casts" with no exception. `as const` is reported under R-115.
The replacement is an explicitly typed `readonly` declaration (C-19). Rejected:
exempting it (that would relax a rule the guide states without exceptions).

### D-15: `() => {}` counts as a hand-written no-op

§10.15 says `noop` is "the only way to write a no-op thunk". `() => {}` is the
same thunk as `() => undefined`, so both are R-146.

### D-16: Collation and grouping for imports

- "Sort each group by path" (§11.2): ascending code-point order of the module
  specifier string.
- A side-effect import (`import 'reflect-metadata';`, in
  `packages/common/index.ts`) keeps its position: moving it changes the module
  evaluation order.
- Consecutive `export … from '…'` re-exports form a group like imports. R-163
  ("one blank line between top-level statements") does not apply inside the
  group.

### D-17: `beforeAll`/`afterAll`

§12.1 lists `beforeEach` and `afterEach`, not `beforeAll`/`afterAll`. The plan
does not add a rule (R-003). New specs written by this plan use none of the
four.

### D-18: Baseline failures (executors read this)

1. On **Windows**, `npx vitest run` exits **1** at baseline because
   `packages/core/test/nest-application-context.spec.ts` crashes its worker
   (CONTEXT §4). A test run "passes as at baseline" when **every test file
   except that one passes and that file is the only error**. On Linux the
   whole suite must pass.
2. `npx tsc -p tsconfig.spec.json --noEmit` reports **225** errors at baseline.
   A task passes this check when the total is unchanged (225, or the number the
   task states) and none is in a file the task created or changed.
3. Prettier: 31 files already drift at baseline. Format only your own files
   (`npx prettier --write <your files>`).
4. `npm run lint` has 1 warning at baseline (`packages/websockets/socket-module.ts:60`).
5. Integration tests: not runnable locally without Docker (CONTEXT §5). CI is
   the gate (D-09).

### D-19: Lint tooling for the guide's rules

oxlint 1.86 cannot express the guide's `no-restricted-syntax` selectors
(CONTEXT §8). Decision: add `eslint@10.11.0` as an exact devDependency, with a
flat config `eslint.config.mjs` holding **only** the §16 rules, as warnings,
plus `parserOptions.emitDecoratorMetadata`/`experimentalDecorators` so that
`consistent-type-imports` skips decorated files (CONTEXT §9). Keep oxlint for
its correctness rules. New script: `"lint:style": "eslint packages integration tools"`.
Verified with the exact config on 1 568 files: 11 909 warnings, 0 errors, 8 s.
Status: default for non-blocking question **Q8**.

### D-20: Lint scope

ESLint covers `packages/**`, `integration/**` and `tools/**`. `sample/**` is
ignored: 41 standalone apps with their own `package.json` and tooling. Whether
integration, sample and tools must comply at all is **Q5**.

### D-21: Integration safety net

The Docker-based integration suite covers the adapters, factories and
`*-module.ts` files that unit tests barely reach (CONTEXT §7). It cannot run on
the baseline machine (CONTEXT §5). Decision: any rewrite of a file under 60 %
unit line coverage either gets a characterisation-spec task first (where the
guide's no-mock rule allows one, T010–T014) or is merged only after CI's
`integration_tests` job passes (D-09).

### D-22: Characterisation specs follow the guide

New specs (T010–T014) sit beside their sources (R-033, after T004) and follow
§12 completely (C-16). Their file names copy the source's base name (R-033),
so nine of them inherit the source's non-kebab name (`*.exception.spec.ts`).
Those R-100 hits disappear when the Structure phase renames the source
(conditional on Q1).

### D-23: `iterare`

R-149 forbids a second collection library. `iterare` is a runtime dependency of
`common`, `core`, `microservices` and `websockets` and is imported by 22 files.
Each Rewrite task that touches one of those files replaces `iterate(…)` with
lodash (C-10). Tightening removes `iterare` from the four `package.json`
files. That needs Q2 (dependency changes).

### D-24: Audit and index commands live in the plan

`node refactor-plan/tools/audit.mjs` (the audit, Foundations item "one command
that re-runs the audit") and `node refactor-plan/tools/function-names.mjs`
(the §8.5 index generator) live in `refactor-plan/tools/`. They use only the
repo's `typescript` devDependency. They are not wired into `package.json`, so
the repository diff stays minimal. The Tightening phase moves them under
`tools/` if the human wants to keep them (part of Q5).

### D-25: `describe` title in a spec for a class or a multi-export file

§12.2: "named exactly after the function". For a file that exports a class,
the `describe` is the class name. While a file still has several exports
(before Structure), its spec has one `describe`, named after the export the
task names, and its other exports are tested inside it.

### D-26: Coverage measurement

Use the full-include coverage command in CONTEXT §3, not `npm run test:cov`,
which excludes 20 paths.

---

## 2. Open questions for the human

### Q1 (BLOCKING): Classes, decorators, `this`, enums, file paths and other public API

The guide bans classes (R-041), `this` (R-042), the `function` keyword (R-040),
enums (R-111) and lower-case union members (R-100), and it requires one export
per file, kebab-case file names and `internal/` folders (R-030, R-031, R-034).
In this repository those are the **public API**: 285 exported classes, 33
exported enums, decorators that only work on classes, `ContextType = 'http' |
'ws' | 'rpc'`, and every file path (`exports` `"./*"`). The guide grants no
exception for them and forbids relaxing rules.

Options:

- **A. Internal adoption.** Keep every exported class, enum, decorator, union
  member, signature and file path. Apply the guide to function and method
  **bodies** and to non-exported code. This needs your explicit, recorded
  exception to R-040, R-041, R-042, R-100 (public names and paths), R-111,
  R-030, R-031 and R-034 for public API. **The guide itself does not allow
  this**; it would be a project decision to deviate from it.
- **B. Full adoption as a redesign.** Replace classes and decorators with
  functions, enums with unions, and files with the guide's layout. Every
  NestJS user breaks. That is a new major version, not a refactor, and outside
  this plan's "behaviour unchanged" contract.
- **C. Do not adopt the guide for `packages/`.** Keep the tooling and the
  safety net (T001–T015). Stop there, or apply the guide only to new code or to
  `tools/`.

Blocks: T006–T009 (they only make sense under A or B), every task from T100 on.

### Q2 (BLOCKING): New runtime dependencies for every Nest user

Adopting the guide adds `lodash-es`, `ts-pattern` and `ramda` to the
`dependencies` of the published `@nestjs/*` packages (D-01). Every application
that installs NestJS would then install them. Do you approve? (Removing
`iterare`, D-23, is part of the same change.)

Blocks: T006, T007, T008, T009 and every Rewrite task (T200–T427).

### Q3 (BLOCKING): `throw` and `try`/`catch` that rethrows

R-016 replaces `throw` with "the fallback from the `tryCatch` catcher". Nest's
contract is to throw: `HttpException` and subclasses, `RuntimeException`,
`UnknownDependenciesException` and others reach user code and Nest's exception
filters. Package sources have 203 `throw` statements and 105 `try` blocks. Options:

- keep every `throw` whose exception can reach a caller (a recorded exception
  to R-016);
- a single `throwError(error): never` helper that contains the only `throw`
  (still an exception to R-016, but in one place);
- convert to returned values (a behaviour change for every caller).

Blocks: the C-07 recipe and every Rewrite task whose files contain `throw`
(listed with ⚠T in ROADMAP).

### Q4 (BLOCKING): JSDoc in published type definitions

R-164 bans every comment except tool directives. The package sources have 2 294
comments, mostly JSDoc that `tsc` copies into the published `.d.ts` files
(`removeComments: false` in `packages/tsconfig.build.json`). Users see it in
their editors, and the docs site uses `@publicApi` tags. Remove it?

Blocks: the comment sweep T680–T688.

### Q5 (BLOCKING for those folders): `integration/`, `sample/`, `tools/`

The guide covers "every TypeScript file". `integration/` (578 files) and
`sample/` (398 files) are Nest applications written with the class and
decorator API, and `sample/` is user-facing documentation. Are they in scope?
Default planned: **no tasks** for them; ESLint reports on `integration/` and
`tools/` as warnings only.

Blocks: nothing in the current plan. It decides whether T950+ exist.

### Q6 (BLOCKING for the spec rewrite): Existing specs

The 305 package specs use mocks, spies, `beforeEach` and snapshots (R-171: 2 257
hits), titles that do not read "should … when …" (R-173: 2 893) and globals
(R-170: 304 files). Rewriting them is required by §12, but they are also the
safety net for the code rewrite. Options: (a) rewrite each spec right after its
module's Rewrite task lands and passes; (b) rewrite them all after the Rewrite
phase; (c) exclude existing specs. Default if unanswered: none of them is
touched, and new specs follow §12.

Blocks: the spec-rewrite sweep T700+.

### Q7 (non-blocking): `constants.ts` instead of `consts.ts`

Default: keep each package's existing public `constants.ts` as its constants
file (D-04).

### Q8 (non-blocking): Add ESLint as a devDependency

Default: yes, `eslint@10.11.0` exact (D-19, task T001).

### Q9 (non-blocking): Performance

Default: no §15 exception without a benchmark. T150 measures the request
path with `tools/benchmarks` before any of the D-10 files is rewritten.

### Q10 (non-blocking): Where executors run

Default: Windows is acceptable with the D-18 baseline. Every checkpoint is
confirmed by a green CI run on Linux before the next phase starts.
