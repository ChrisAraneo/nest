# Audit

Architect's working material. Executors do not read this file.

All counts come from `node refactor-plan/tools/audit.mjs` at the baseline commit
`35142c3e` (1 966 TypeScript files). Re-run that command to reproduce them.
Baseline outputs are kept in `refactor-plan/baseline/`:

| File | Content |
| --- | --- |
| `audit-summary.txt` | totals per rule, split by file kind |
| `audit-files.csv` | one row per file: kind, area, non-blank LOC, export count, total, one column per rule |
| `audit-locations-packages-source.txt` | every violation in package source files, `path:line:col rule [enclosing symbol] detail`. These are the exact locations for the judgement rules |
| `eslint-style-warnings.txt` | the candidate T001 ESLint config at baseline |
| `coverage-by-file.csv` | unit-test line coverage per package source file |

## 1. Headline numbers

- **50 189** violations in 1 966 files. **21 681** of them are in the 664 package
  source files.
- **21** package source files already conform. All 21 are one-line `index.ts`
  barrels (`export * from './x.js'`): `common/file-stream`,
  `common/pipes/file/interfaces`, `common/serializer/decorators`,
  `core/adapters`, `core/exceptions`, `core/injector/inquirer`,
  `core/injector/internal-core-module`, `core/middleware`, `core/repl`,
  `core/services`, `microservices/module/interfaces`, `microservices/utils`,
  `platform-express/adapters`, `platform-express/multer/interfaces`,
  `platform-fastify/adapters`, `platform-socket.io/adapters`,
  `platform-ws/adapters`, `websockets/adapters`, `websockets/errors`,
  `websockets/exceptions`, `websockets/utils`.
- The rules that collide with the public API are among the largest: `this`
  (R-042) 4 339 and classes (R-041) 322 in package source; enums (R-111) 34;
  JSDoc and other comments (R-164) 2 294; `throw` (R-016) 203; non-kebab file
  names (R-100) on almost every package file.

## 2. Detector verification

Each detector was checked against real hits, and against an independent tool
where one exists.

| Check | Result |
| --- | --- |
| Audit vs ESLint `no-restricted-syntax` on `packages integration tools` (1 568 files) | `if`+`switch`+`?:`: audit 1 839 + 19 + 483 = **2 341**, ESLint **2 341**. Loops + `forEach`: audit 236 + 160 + 7 `for await` = **403**, ESLint **403**. `throw` 346 = 346. `try` 196 = 196. `let`/`var` 1 317 = 1 317. `enum` 41 = 41. Non-null 789 = 789. `any` 3 552 vs 3 551. Classes: audit 1 760 (declarations + 93 class expressions), ESLint 1 667 (declarations only). Function keyword: audit 407 (declarations + 80 expressions), ESLint 327 (declarations only). |
| R-117 vs `tsc` with `verbatimModuleSyntax` (package source) | `tsc` reports 664 TS1484. The audit misses 76 of them: 72 are in files with decorators, which the audit skips on purpose (as `consistent-type-imports` does), and 4 are in `platform-fastify/adapters/fastify-adapter.ts` and `platform-fastify/interfaces/nest-fastify-application.interface.ts` (under-match, left approximate). The audit reports 249 that `tsc` does not: classes and enums used only as types (`Observable`, `HttpStatus`, `RequestMethod`, …), which `consistent-type-imports` reports and `tsc` does not require. |
| R-117 bug found and fixed | The first version treated interface `extends` clauses as value positions and detected decorators by regex. Both were fixed before the baseline was recorded. |
| R-010 in specs | The first version counted 7 245 `it(() => { … })` callbacks. §12.8 requires statements inside a test, so test callbacks are exempt (D-12). After the fix: 1 190 in package specs. |
| Spot checks (3 hits each) | R-163 (`webhook.decorators.ts:4`, `common/decorators/http/index.ts:5`, `common/interfaces/index.ts:15`); R-043 (`middleware-run-match-route.ts:80`); R-132 (`transient-logger.service.ts:14`); R-150 (`query-method.module.ts:2` missing `.js`, `rpc-context-creator.spec.ts:11` crossing into `core`); R-161 (`core/middleware/builder.ts:1`: `@nestjs/common` after relative imports); R-049 (`cookies/src/app.controller.ts:78`, `logging.interceptor.ts:14`, `configurable-module.builder.ts:78`); R-090 (`flush.webhook.ts:7` `console.log`, `send-files/src/app.service.ts:35` `process.cwd`); R-073 (`sse/e2e/express.spec.ts:323`). All true violations. |
| R-163 re-exports | `export * from` lines in barrels were reported as missing blank lines. D-16 groups consecutive re-exports like imports, so they are exempt. |
| Clean-file spot check | The 21 conforming barrels were opened: each is one `export * from` line. |

**Approximate detectors**, to be treated as candidate lists, not counts:
R-038 (magic numbers: over-matches), R-049 (mutation: over- and under-matches),
R-053 (helper vs step unknown), R-067 (lone `instanceof` in a predicate),
R-073 (`.catch` on non-promises), R-074 (misses `isNil()`/truthiness guards),
R-090 (edge vs computing function), R-120 and R-130 (receiver type unknown),
R-132, R-170, R-172 (presence, not content). Everything else is exact for what
it claims to detect (RULES.md, "Detector accuracy").

## 3. Totals per rule

| Rule | Total | Files | packages source | packages specs + test support | integration + sample + tools |
| --- | ---: | ---: | ---: | ---: | ---: |
| R-010 | 5926 | 1133 | 2511 | 1234 | 2181 |
| R-011 | 1895 | 334 | 1627 | 62 | 206 |
| R-012 | 20 | 18 | 19 | 0 | 1 |
| R-013 | 488 | 172 | 423 | 18 | 47 |
| R-014 | 244 | 127 | 137 | 44 | 63 |
| R-015 | 208 | 101 | 105 | 73 | 30 |
| R-016 | 366 | 161 | 203 | 106 | 57 |
| R-017 | 1433 | 495 | 177 | 796 | 460 |
| R-018 | 2080 | 513 | 348 | 1104 | 628 |
| R-019 | 559 | 241 | 387 | 34 | 138 |
| R-030 | 287 | 287 | 227 | 2 | 58 |
| R-031 | 909 | 909 | 291 | 3 | 615 |
| R-032 | 3 | 3 | 0 | 0 | 3 |
| R-033 | 377 | 377 | 377 | 0 | 0 |
| R-036 | 135 | 135 | 106 | 1 | 28 |
| R-038 | 557 | 217 | 73 | 28 | 456 |
| R-039 | 24 | 20 | 14 | 1 | 9 |
| R-040 | 547 | 259 | 255 | 116 | 176 |
| R-041 | 2007 | 1084 | 322 | 709 | 976 |
| R-042 | 5062 | 411 | 4339 | 72 | 651 |
| R-043 | 90 | 56 | 19 | 14 | 57 |
| R-049 | 1105 | 283 | 905 | 8 | 192 |
| R-053 | 63 | 28 | 41 | 1 | 21 |
| R-067 | 137 | 65 | 98 | 33 | 6 |
| R-073 | 82 | 44 | 31 | 34 | 17 |
| R-074 | 112 | 46 | 99 | 3 | 10 |
| R-090 | 748 | 218 | 231 | 245 | 272 |
| R-100 | 1463 | 1275 | 562 | 152 | 749 |
| R-102 | 560 | 153 | 96 | 159 | 305 |
| R-110 | 70 | 29 | 61 | 3 | 6 |
| R-111 | 41 | 23 | 34 | 7 | 0 |
| R-112 | 3611 | 612 | 1711 | 1535 | 365 |
| R-113 | 798 | 211 | 319 | 416 | 63 |
| R-114 | 26 | 9 | 0 | 5 | 21 |
| R-115 | 2248 | 377 | 628 | 1500 | 120 |
| R-117 | 1279 | 541 | 837 | 103 | 339 |
| R-120 | 1139 | 308 | 645 | 195 | 299 |
| R-125 | 111 | 58 | 46 | 60 | 5 |
| R-126 | 6 | 6 | 0 | 5 | 1 |
| R-127 | 214 | 96 | 186 | 16 | 12 |
| R-128 | 6 | 6 | 3 | 1 | 2 |
| R-129 | 121 | 66 | 47 | 70 | 4 |
| R-130 | 217 | 76 | 131 | 33 | 53 |
| R-131 | 15 | 14 | 9 | 4 | 2 |
| R-132 | 54 | 35 | 46 | 0 | 8 |
| R-133 | 15 | 15 | 11 | 1 | 3 |
| R-135 | 162 | 77 | 126 | 23 | 13 |
| R-141 | 98 | 46 | 35 | 16 | 47 |
| R-146 | 310 | 105 | 22 | 251 | 37 |
| R-149 | 22 | 22 | 22 | 0 | 0 |
| R-150 | 148 | 53 | 0 | 132 | 16 |
| R-161 | 313 | 244 | 190 | 29 | 94 |
| R-162 | 291 | 291 | 0 | 115 | 176 |
| R-163 | 375 | 168 | 255 | 4 | 116 |
| R-164 | 3126 | 608 | 2294 | 328 | 504 |
| R-170 | 508 | 508 | 0 | 304 | 204 |
| R-171 | 2752 | 364 | 0 | 2257 | 495 |
| R-172 | 293 | 293 | 0 | 213 | 80 |
| R-173 | 4333 | 512 | 0 | 2893 | 1440 |

Rules with no row have no detector hits: R-035, R-063, R-065, R-076, R-121,
R-122, R-123, R-142 and R-145 are at 0 because lodash, ts-pattern and ramda are
absent and no `internal/` folders exist. The rest are manual rules (RULES.md).

## 4. Per package (package source only)

| Package | Files | Non-blank LOC | Violations | Line coverage |
| --- | ---: | ---: | ---: | ---: |
| common | 202 | 11 606 | 4 079 | 96.2 % |
| core | 197 | 16 788 | 7 755 | 88.5 % |
| microservices | 137 | 12 750 | 6 446 | 88.1 % |
| websockets | 44 | 2 136 | 889 | 86.9 % |
| platform-fastify | 40 | 3 099 | 1 298 | 79.4 % |
| platform-express | 25 | 1 477 | 604 | 55.6 % |
| testing | 13 | 804 | 370 | 98.3 % |
| platform-ws | 3 | 316 | 169 | 63.5 % |
| platform-socket.io | 3 | 127 | 71 | 71.4 % |

The per-area × rule matrix (including specs, integration, sample, tools) is in
`baseline/area-matrix.md`.

## 5. Judgement-rule locations

Every package-source location of every rule, with the enclosing symbol, is in
`baseline/audit-locations-packages-source.txt` (21 681 lines). For one rule in
one folder:
`node refactor-plan/tools/audit.mjs --files packages/core/injector --rules R-011 --format locations`.
Judgement tasks quote their locations from this output when the architect
details them (after Q1–Q3; see ROADMAP).

Files read in full for the judgement tasks written in this session (T010–T014):
`core/helpers/context-id-factory.ts`, `microservices/exceptions/grpc-exception.ts`,
`core/errors/exceptions/{invalid-class,invalid-middleware-configuration,runtime}.exception.ts`,
`microservices/errors/{empty-response,invalid-grpc-message-decorator,invalid-message,invalid-tcp-data-reception,net-socket-closed}.exception.ts`,
`microservices/exceptions/kafka-retriable-exception.ts`,
`common/serializer/decorators/serialize-options.decorator.ts`, and their
existing specs. Their current behaviour was recorded by executing them (values
quoted in the tasks).

## 6. Per-file table (package source)

Columns: non-blank LOC; total violations; the six most frequent rules; whether
a mirror spec `packages/<pkg>/test/<same path>.spec.ts` exists; unit-test line
coverage (`n/a` = no executable lines, such as interface-only files); fan-in =
the number of package source files that import it with a value import.

| File | LOC | Violations | Top rules (count) | Mirror spec | Line cov. | Fan-in |
| --- | ---: | ---: | --- | :---: | ---: | ---: |
| `packages/common/constants.ts` | 43 | 30 | R-163×27 R-039×1 R-030×1 R-115×1 | N | 100% | 23 |
| `packages/common/decorators/core/apply-decorators.ts` | 30 | 12 | R-010×2 R-115×2 R-113×2 R-033×1 R-164×1 R-040×1 | N | 100% | 1 |
| `packages/common/decorators/core/bind.decorator.ts` | 20 | 10 | R-100×2 R-010×2 R-031×1 R-033×1 R-164×1 R-040×1 | N | 100% | 1 |
| `packages/common/decorators/core/catch.decorator.ts` | 27 | 14 | R-100×2 R-117×2 R-010×2 R-112×2 R-049×2 R-031×1 | N | 100% | 1 |
| `packages/common/decorators/core/controller.decorator.ts` | 170 | 34 | R-164×7 R-100×5 R-049×5 R-040×4 R-013×3 R-117×2 | N | 100% | 1 |
| `packages/common/decorators/core/dependencies.decorator.ts` | 22 | 16 | R-100×2 R-112×2 R-120×2 R-115×2 R-010×2 R-030×1 | N | 100% | 1 |
| `packages/common/decorators/core/exception-filters.decorator.ts` | 59 | 15 | R-112×3 R-100×2 R-010×2 R-053×1 R-031×1 R-033×1 | N | 100% | 1 |
| `packages/common/decorators/core/index.ts` | 14 | 1 | R-030×1 | N | n/a | 9 |
| `packages/common/decorators/core/inject.decorator.ts` | 66 | 26 | R-017×3 R-113×3 R-018×3 R-100×2 R-117×2 R-164×2 | N | 100% | 1 |
| `packages/common/decorators/core/injectable.decorator.ts` | 59 | 20 | R-164×3 R-010×3 R-049×3 R-100×2 R-117×2 R-040×2 | N | 100% | 8 |
| `packages/common/decorators/core/optional.decorator.ts` | 37 | 11 | R-100×2 R-010×2 R-049×2 R-031×1 R-033×1 R-164×1 | N | 100% | 7 |
| `packages/common/decorators/core/set-metadata.decorator.ts` | 35 | 15 | R-112×3 R-049×3 R-100×2 R-010×2 R-030×1 R-033×1 | N | 100% | 1 |
| `packages/common/decorators/core/use-guards.decorator.ts` | 52 | 13 | R-112×3 R-100×2 R-010×2 R-031×1 R-033×1 R-117×1 | N | 100% | 1 |
| `packages/common/decorators/core/use-interceptors.decorator.ts` | 65 | 13 | R-112×3 R-100×2 R-010×2 R-031×1 R-033×1 R-117×1 | N | 100% | 1 |
| `packages/common/decorators/core/use-pipes.decorator.ts` | 46 | 14 | R-112×3 R-100×2 R-010×2 R-031×1 R-033×1 R-117×1 | N | 100% | 1 |
| `packages/common/decorators/core/version.decorator.ts` | 21 | 16 | R-100×2 R-164×2 R-010×2 R-112×2 R-031×1 R-033×1 | N | 100% | 1 |
| `packages/common/decorators/http/create-route-param-metadata.decorator.ts` | 104 | 57 | R-018×9 R-112×7 R-115×7 R-117×4 R-164×4 R-013×3 | N | 100% | 2 |
| `packages/common/decorators/http/header.decorator.ts` | 29 | 9 | R-100×2 R-010×2 R-031×1 R-033×1 R-164×1 R-040×1 | N | 100% | 1 |
| `packages/common/decorators/http/http-code.decorator.ts` | 21 | 10 | R-100×2 R-010×2 R-031×1 R-033×1 R-164×1 R-040×1 | N | 100% | 1 |
| `packages/common/decorators/http/index.ts` | 9 | 1 | R-030×1 | N | n/a | 1 |
| `packages/common/decorators/http/redirect.decorator.ts` | 20 | 10 | R-100×2 R-010×2 R-031×1 R-033×1 R-164×1 R-040×1 | N | 100% | 1 |
| `packages/common/decorators/http/render.decorator.ts` | 22 | 10 | R-100×2 R-010×2 R-031×1 R-033×1 R-164×1 R-040×1 | N | 100% | 1 |
| `packages/common/decorators/http/request-mapping.decorator.ts` | 173 | 33 | R-164×17 R-010×3 R-100×2 R-049×2 R-030×1 R-033×1 | N | 100% | 1 |
| `packages/common/decorators/http/route-params.decorator.ts` | 1098 | 172 | R-100×36 R-040×36 R-163×22 R-010×14 R-013×11 R-164×9 | N | 100% | 4 |
| `packages/common/decorators/http/sse-signal.decorator.ts` | 56 | 7 | R-164×2 R-030×1 R-100×1 R-117×1 R-010×1 R-019×1 | N | 100% | 1 |
| `packages/common/decorators/http/sse.decorator.ts` | 33 | 16 | R-049×3 R-100×2 R-010×2 R-031×1 R-033×1 R-164×1 | N | 100% | 1 |
| `packages/common/decorators/index.ts` | 3 | 1 | R-030×1 | N | n/a | 3 |
| `packages/common/decorators/modules/global.decorator.ts` | 17 | 9 | R-100×2 R-010×2 R-031×1 R-033×1 R-164×1 R-040×1 | N | 100% | 1 |
| `packages/common/decorators/modules/index.ts` | 2 | 1 | R-030×1 | N | n/a | 1 |
| `packages/common/decorators/modules/module.decorator.ts` | 27 | 16 | R-100×2 R-010×2 R-031×1 R-033×1 R-117×1 R-164×1 | N | 100% | 1 |
| `packages/common/enums/http-status.enum.ts` | 60 | 4 | R-031×1 R-100×1 R-164×1 R-111×1 | N | 100% | 29 |
| `packages/common/enums/index.ts` | 4 | 1 | R-030×1 | N | n/a | 7 |
| `packages/common/enums/request-method.enum.ts` | 19 | 3 | R-031×1 R-100×1 R-111×1 | N | 100% | 3 |
| `packages/common/enums/route-paramtypes.enum.ts` | 18 | 3 | R-031×1 R-100×1 R-111×1 | N | 100% | 2 |
| `packages/common/enums/shutdown-signal.enum.ts` | 16 | 4 | R-031×1 R-100×1 R-164×1 R-111×1 | N | 100% | 2 |
| `packages/common/enums/version-type.enum.ts` | 9 | 4 | R-031×1 R-100×1 R-164×1 R-111×1 | N | 100% | 2 |
| `packages/common/exceptions/bad-gateway.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/bad-request.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/conflict.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/forbidden.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/gateway-timeout.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/gone.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/http-version-not-supported.exception.ts` | 54 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/http.exception.ts` | 192 | 78 | R-042×24 R-010×11 R-011×9 R-049×8 R-164×6 R-013×4 | Y | 100% | 22 |
| `packages/common/exceptions/im-a-teapot.exception.ts` | 55 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/index.ts` | 23 | 1 | R-030×1 | N | n/a | 2 |
| `packages/common/exceptions/internal-server-error.exception.ts` | 54 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/intrinsic.exception.ts` | 7 | 5 | R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 | N | n/a | 2 |
| `packages/common/exceptions/method-not-allowed.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/misdirected.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/not-acceptable.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/not-found.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/not-implemented.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/payload-too-large.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/precondition-failed.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/request-timeout.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/service-unavailable.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/unauthorized.exception.ts` | 52 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/unprocessable-entity.exception.ts` | 54 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/exceptions/unsupported-media-type.exception.ts` | 54 | 9 | R-164×2 R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 | Y | 100% | 1 |
| `packages/common/file-stream/index.ts` | 1 | 0 |  | N | n/a | 3 |
| `packages/common/file-stream/interfaces/index.ts` | 2 | 1 | R-030×1 | N | n/a | 1 |
| `packages/common/file-stream/interfaces/streamable-handler-response.interface.ts` | 12 | 7 | R-164×5 R-031×1 R-100×1 | N | n/a | 1 |
| `packages/common/file-stream/interfaces/streamable-options.interface.ts` | 22 | 6 | R-164×4 R-031×1 R-100×1 | N | n/a | 1 |
| `packages/common/file-stream/streamable-file.ts` | 87 | 46 | R-042×16 R-010×9 R-049×8 R-011×4 R-117×2 R-090×2 | Y | 100% | 1 |
| `packages/common/index.ts` | 81 | 2 | R-030×1 R-164×1 | N | n/a | 96 |
| `packages/common/interfaces/abstract.interface.ts` | 3 | 2 | R-031×1 R-100×1 | N | n/a | 3 |
| `packages/common/interfaces/controllers/controller-metadata.interface.ts` | 3 | 2 | R-031×1 R-100×1 | N | n/a | 2 |
| `packages/common/interfaces/controllers/controller.interface.ts` | 1 | 2 | R-031×1 R-100×1 | N | n/a | 2 |
| `packages/common/interfaces/controllers/index.ts` | 2 | 1 | R-030×1 | N | n/a | 0 |
| `packages/common/interfaces/exceptions/exception-filter-metadata.interface.ts` | 6 | 6 | R-117×2 R-031×1 R-100×1 R-161×1 R-112×1 | N | n/a | 1 |
| `packages/common/interfaces/exceptions/exception-filter.interface.ts` | 18 | 7 | R-164×2 R-112×2 R-031×1 R-100×1 R-117×1 | N | n/a | 4 |
| `packages/common/interfaces/exceptions/index.ts` | 5 | 1 | R-030×1 | N | n/a | 1 |
| `packages/common/interfaces/exceptions/rpc-exception-filter-metadata.interface.ts` | 6 | 6 | R-117×2 R-031×1 R-100×1 R-161×1 R-112×1 | N | n/a | 1 |
| `packages/common/interfaces/exceptions/rpc-exception-filter.interface.ts` | 19 | 8 | R-117×2 R-164×2 R-112×2 R-031×1 R-100×1 | N | n/a | 3 |
| `packages/common/interfaces/exceptions/ws-exception-filter.interface.ts` | 18 | 8 | R-164×2 R-112×2 R-031×1 R-100×1 R-117×1 R-163×1 | N | n/a | 2 |
| `packages/common/interfaces/external/class-transform-options.interface.ts` | 65 | 15 | R-164×12 R-031×1 R-100×1 R-112×1 | N | n/a | 4 |
| `packages/common/interfaces/external/cors-options.interface.ts` | 60 | 13 | R-164×10 R-030×1 R-100×1 R-163×1 | N | n/a | 1 |
| `packages/common/interfaces/external/https-options.interface.ts` | 105 | 25 | R-164×14 R-112×9 R-031×1 R-100×1 | N | n/a | 1 |
| `packages/common/interfaces/external/transformer-package.interface.ts` | 13 | 6 | R-117×2 R-112×2 R-031×1 R-100×1 | N | n/a | 2 |
| `packages/common/interfaces/external/validation-error.interface.ts` | 42 | 12 | R-164×7 R-112×3 R-031×1 R-100×1 | N | n/a | 3 |
| `packages/common/interfaces/external/validator-options.interface.ts` | 76 | 18 | R-164×16 R-031×1 R-100×1 | N | n/a | 2 |
| `packages/common/interfaces/external/validator-package.interface.ts` | 8 | 4 | R-117×2 R-031×1 R-100×1 | N | n/a | 1 |
| `packages/common/interfaces/features/arguments-host.interface.ts` | 88 | 32 | R-164×17 R-112×10 R-100×4 R-030×1 | N | n/a | 5 |
| `packages/common/interfaces/features/can-activate.interface.ts` | 24 | 6 | R-117×2 R-164×2 R-031×1 R-100×1 | N | n/a | 3 |
| `packages/common/interfaces/features/custom-route-param-factory.interface.ts` | 8 | 6 | R-112×2 R-031×1 R-100×1 R-117×1 R-164×1 | N | n/a | 3 |
| `packages/common/interfaces/features/execution-context.interface.ts` | 20 | 8 | R-164×3 R-117×2 R-031×1 R-100×1 R-112×1 | N | n/a | 5 |
| `packages/common/interfaces/features/nest-interceptor.interface.ts` | 37 | 12 | R-164×4 R-112×3 R-117×2 R-030×1 R-100×1 R-163×1 | N | n/a | 3 |
| `packages/common/interfaces/features/paramtype.interface.ts` | 4 | 7 | R-100×5 R-031×1 R-164×1 | N | n/a | 2 |
| `packages/common/interfaces/features/pipe-transform.interface.ts` | 48 | 17 | R-164×7 R-112×5 R-117×2 R-030×1 R-100×1 R-161×1 | N | n/a | 13 |
| `packages/common/interfaces/global-prefix-options.interface.ts` | 7 | 4 | R-031×1 R-100×1 R-117×1 R-164×1 | N | n/a | 2 |
| `packages/common/interfaces/hooks/before-application-shutdown.interface.ts` | 3 | 3 | R-031×1 R-100×1 R-112×1 | N | n/a | 1 |
| `packages/common/interfaces/hooks/index.ts` | 5 | 1 | R-030×1 | N | n/a | 1 |
| `packages/common/interfaces/hooks/on-application-bootstrap.interface.ts` | 11 | 4 | R-031×1 R-100×1 R-164×1 R-112×1 | N | n/a | 1 |
| `packages/common/interfaces/hooks/on-application-shutdown.interface.ts` | 11 | 4 | R-031×1 R-100×1 R-164×1 R-112×1 | N | n/a | 1 |
| `packages/common/interfaces/hooks/on-destroy.interface.ts` | 12 | 4 | R-031×1 R-100×1 R-164×1 R-112×1 | N | n/a | 1 |
| `packages/common/interfaces/hooks/on-init.interface.ts` | 10 | 4 | R-031×1 R-100×1 R-164×1 R-112×1 | N | n/a | 1 |
| `packages/common/interfaces/http/cookie-options.interface.ts` | 79 | 15 | R-164×13 R-030×1 R-100×1 | N | n/a | 3 |
| `packages/common/interfaces/http/csrf-protection-options.interface.ts` | 47 | 6 | R-164×3 R-031×1 R-100×1 R-112×1 | N | n/a | 2 |
| `packages/common/interfaces/http/http-exception-body.interface.ts` | 7 | 2 | R-030×1 R-100×1 | N | n/a | 2 |
| `packages/common/interfaces/http/http-redirect-response.interface.ts` | 5 | 3 | R-031×1 R-100×1 R-117×1 | N | n/a | 1 |
| `packages/common/interfaces/http/http-server.interface.ts` | 672 | 144 | R-112×82 R-164×55 R-117×5 R-030×1 R-100×1 | N | n/a | 2 |
| `packages/common/interfaces/http/index.ts` | 8 | 1 | R-030×1 | N | n/a | 1 |
| `packages/common/interfaces/http/message-event.interface.ts` | 7 | 2 | R-031×1 R-100×1 | N | n/a | 1 |
| `packages/common/interfaces/http/raw-body-request.interface.ts` | 4 | 3 | R-031×1 R-100×1 R-164×1 | N | n/a | 1 |
| `packages/common/interfaces/http/security-headers-options.interface.ts` | 155 | 35 | R-164×24 R-100×10 R-030×1 | N | n/a | 2 |
| `packages/common/interfaces/index.ts` | 33 | 1 | R-030×1 | N | n/a | 22 |
| `packages/common/interfaces/injectable.interface.ts` | 1 | 2 | R-031×1 R-100×1 | N | n/a | 1 |
| `packages/common/interfaces/microservices/nest-hybrid-application-options.interface.ts` | 7 | 3 | R-031×1 R-100×1 R-164×1 | N | n/a | 1 |
| `packages/common/interfaces/microservices/nest-microservice-options.interface.ts` | 5 | 4 | R-031×1 R-100×1 R-117×1 R-164×1 | N | n/a | 0 |
| `packages/common/interfaces/microservices/pre-request-hook.interface.ts` | 25 | 5 | R-117×2 R-031×1 R-100×1 R-164×1 | N | n/a | 2 |
| `packages/common/interfaces/microservices/transport-server.interface.ts` | 18 | 8 | R-164×3 R-112×3 R-031×1 R-100×1 | N | n/a | 2 |
| `packages/common/interfaces/middleware/index.ts` | 4 | 1 | R-030×1 | N | n/a | 2 |
| `packages/common/interfaces/middleware/middleware-config-proxy.interface.ts` | 24 | 9 | R-117×3 R-164×3 R-031×1 R-100×1 R-112×1 | N | n/a | 2 |
| `packages/common/interfaces/middleware/middleware-configuration.interface.ts` | 12 | 7 | R-117×3 R-112×2 R-030×1 R-100×1 | N | n/a | 2 |
| `packages/common/interfaces/middleware/middleware-consumer.interface.ts` | 18 | 7 | R-117×2 R-164×2 R-031×1 R-100×1 R-112×1 | N | n/a | 3 |
| `packages/common/interfaces/middleware/nest-middleware.interface.ts` | 8 | 7 | R-112×4 R-031×1 R-100×1 R-164×1 | N | n/a | 1 |
| `packages/common/interfaces/modules/dynamic-module.interface.ts` | 25 | 8 | R-164×3 R-117×2 R-031×1 R-100×1 R-112×1 | N | n/a | 2 |
| `packages/common/interfaces/modules/forward-reference.interface.ts` | 3 | 3 | R-031×1 R-100×1 R-112×1 | N | n/a | 3 |
| `packages/common/interfaces/modules/index.ts` | 8 | 1 | R-030×1 | N | n/a | 2 |
| `packages/common/interfaces/modules/injection-token.interface.ts` | 11 | 6 | R-117×2 R-031×1 R-100×1 R-164×1 R-112×1 | N | n/a | 3 |
| `packages/common/interfaces/modules/introspection-result.interface.ts` | 10 | 5 | R-164×2 R-031×1 R-100×1 R-117×1 | N | n/a | 1 |
| `packages/common/interfaces/modules/module-metadata.interface.ts` | 44 | 15 | R-117×5 R-164×5 R-112×3 R-031×1 R-100×1 | N | n/a | 3 |
| `packages/common/interfaces/modules/nest-module.interface.ts` | 7 | 4 | R-031×1 R-100×1 R-117×1 R-164×1 | N | n/a | 1 |
| `packages/common/interfaces/modules/optional-factory-dependency.interface.ts` | 8 | 5 | R-031×1 R-100×1 R-117×1 R-164×1 R-110×1 | N | n/a | 2 |
| `packages/common/interfaces/modules/provider.interface.ts` | 161 | 34 | R-164×20 R-112×8 R-117×4 R-030×1 R-100×1 | N | n/a | 2 |
| `packages/common/interfaces/nest-application-context-options.interface.ts` | 68 | 17 | R-164×11 R-117×2 R-031×1 R-033×1 R-100×1 R-041×1 | N | n/a | 3 |
| `packages/common/interfaces/nest-application-context.interface.ts` | 154 | 38 | R-164×19 R-112×10 R-117×7 R-030×1 R-100×1 | N | n/a | 3 |
| `packages/common/interfaces/nest-application-options.interface.ts` | 63 | 20 | R-164×10 R-117×7 R-031×1 R-100×1 R-112×1 | N | n/a | 2 |
| `packages/common/interfaces/nest-application.interface.ts` | 192 | 42 | R-164×20 R-117×13 R-112×7 R-031×1 R-100×1 | N | n/a | 1 |
| `packages/common/interfaces/nest-microservice.interface.ts` | 98 | 27 | R-164×13 R-117×9 R-112×2 R-031×1 R-100×1 R-161×1 | N | n/a | 1 |
| `packages/common/interfaces/router-options.interface.ts` | 28 | 10 | R-100×6 R-164×3 R-030×1 | N | n/a | 2 |
| `packages/common/interfaces/scope-options.interface.ts` | 37 | 10 | R-164×7 R-030×1 R-100×1 R-111×1 | N | 100% | 4 |
| `packages/common/interfaces/shutdown-hooks-options.interface.ts` | 21 | 4 | R-164×2 R-031×1 R-100×1 | N | n/a | 2 |
| `packages/common/interfaces/type.interface.ts` | 3 | 4 | R-112×2 R-031×1 R-100×1 | N | n/a | 15 |
| `packages/common/interfaces/version-options.interface.ts` | 100 | 18 | R-164×15 R-030×1 R-100×1 R-117×1 | N | 100% | 5 |
| `packages/common/interfaces/websockets/web-socket-adapter.interface.ts` | 27 | 17 | R-112×12 R-164×2 R-030×1 R-100×1 R-117×1 | N | n/a | 3 |
| `packages/common/internal.ts` | 53 | 7 | R-164×6 R-030×1 | N | n/a | 121 |
| `packages/common/module-utils/configurable-module.builder.ts` | 354 | 143 | R-042×31 R-010×17 R-049×16 R-115×16 R-164×9 R-011×8 | Y | 92% | 1 |
| `packages/common/module-utils/constants.ts` | 16 | 5 | R-163×2 R-030×1 R-164×1 R-115×1 | N | 100% | 3 |
| `packages/common/module-utils/index.ts` | 2 | 1 | R-030×1 | N | n/a | 1 |
| `packages/common/module-utils/interfaces/configurable-module-async-options.interface.ts` | 61 | 9 | R-117×5 R-030×1 R-100×1 R-164×1 R-112×1 | N | n/a | 3 |
| `packages/common/module-utils/interfaces/configurable-module-cls.interface.ts` | 38 | 8 | R-117×4 R-031×1 R-100×1 R-164×1 R-112×1 | N | n/a | 2 |
| `packages/common/module-utils/interfaces/configurable-module-host.interface.ts` | 77 | 9 | R-164×5 R-117×2 R-031×1 R-100×1 | N | n/a | 1 |
| `packages/common/module-utils/interfaces/index.ts` | 3 | 1 | R-030×1 | N | n/a | 2 |
| `packages/common/module-utils/utils/generate-options-injection-token.util.ts` | 5 | 6 | R-031×1 R-033×1 R-100×1 R-010×1 R-040×1 R-090×1 | N | 100% | 1 |
| `packages/common/module-utils/utils/get-injection-providers.util.ts` | 49 | 47 | R-120×9 R-115×7 R-117×4 R-164×4 R-112×4 R-102×4 | Y | 100% | 1 |
| `packages/common/module-utils/utils/index.ts` | 2 | 1 | R-030×1 | N | n/a | 1 |
| `packages/common/pipes/default-value.pipe.ts` | 29 | 12 | R-112×2 R-010×2 R-031×1 R-033×1 R-100×1 R-164×1 | Y | 100% | 1 |
| `packages/common/pipes/file/file-type.validator.ts` | 180 | 69 | R-042×19 R-011×15 R-164×7 R-010×3 R-013×3 R-127×3 | Y | 81% | 2 |
| `packages/common/pipes/file/file-validator-context.interface.ts` | 5 | 4 | R-031×1 R-100×1 R-117×1 R-110×1 | N | n/a | 2 |
| `packages/common/pipes/file/file-validator.interface.ts` | 25 | 11 | R-164×3 R-112×2 R-031×1 R-033×1 R-100×1 R-117×1 | N | 100% | 6 |
| `packages/common/pipes/file/index.ts` | 6 | 1 | R-030×1 | N | n/a | 1 |
| `packages/common/pipes/file/interfaces/file.interface.ts` | 5 | 2 | R-031×1 R-100×1 | N | n/a | 1 |
| `packages/common/pipes/file/interfaces/index.ts` | 1 | 0 |  | N | n/a | 4 |
| `packages/common/pipes/file/max-file-size.validator.ts` | 69 | 29 | R-042×6 R-164×4 R-011×4 R-117×2 R-010×2 R-013×2 | Y | 100% | 2 |
| `packages/common/pipes/file/parse-file-options.interface.ts` | 15 | 7 | R-117×2 R-164×2 R-031×1 R-100×1 R-112×1 | N | n/a | 3 |
| `packages/common/pipes/file/parse-file-pipe.builder.ts` | 37 | 21 | R-042×6 R-117×4 R-010×4 R-049×2 R-031×1 R-033×1 | Y | 100% | 1 |
| `packages/common/pipes/file/parse-file.pipe.ts` | 76 | 48 | R-042×14 R-010×7 R-112×4 R-011×4 R-049×3 R-164×2 | Y | 96% | 2 |
| `packages/common/pipes/index.ts` | 11 | 1 | R-030×1 | N | n/a | 1 |
| `packages/common/pipes/parse-array.pipe.ts` | 194 | 126 | R-042×23 R-011×20 R-164×15 R-112×8 R-018×8 R-010×6 | Y | 94% | 1 |
| `packages/common/pipes/parse-bool.pipe.ts` | 92 | 30 | R-164×8 R-042×5 R-010×4 R-011×3 R-112×2 R-030×1 | Y | 100% | 1 |
| `packages/common/pipes/parse-date.pipe.ts` | 80 | 35 | R-164×8 R-042×6 R-011×5 R-112×2 R-010×2 R-016×2 | Y | 100% | 1 |
| `packages/common/pipes/parse-enum.pipe.ts` | 113 | 65 | R-042×14 R-164×10 R-112×7 R-010×6 R-115×6 R-127×4 | Y | 100% | 1 |
| `packages/common/pipes/parse-float.pipe.ts` | 90 | 38 | R-164×7 R-130×7 R-011×5 R-042×4 R-010×3 R-112×2 | Y | 94% | 1 |
| `packages/common/pipes/parse-int.pipe.ts` | 84 | 30 | R-164×7 R-042×4 R-112×3 R-010×3 R-011×2 R-030×1 | Y | 92% | 1 |
| `packages/common/pipes/parse-uuid.pipe.ts` | 117 | 46 | R-042×10 R-164×8 R-038×7 R-010×3 R-011×3 R-100×2 | Y | 100% | 1 |
| `packages/common/pipes/standard-schema-validation.pipe.ts` | 159 | 54 | R-042×12 R-164×8 R-010×8 R-112×4 R-049×4 R-120×4 | Y | 100% | 1 |
| `packages/common/pipes/validation.pipe.ts` | 345 | 202 | R-042×40 R-164×31 R-011×24 R-010×16 R-049×14 R-112×12 | Y | 90% | 2 |
| `packages/common/serializer/class-serializer.constants.ts` | 1 | 2 | R-031×1 R-100×1 | N | 100% | 3 |
| `packages/common/serializer/class-serializer.interceptor.ts` | 108 | 44 | R-164×6 R-112×6 R-042×6 R-010×5 R-011×4 R-115×2 | Y | 96% | 1 |
| `packages/common/serializer/class-serializer.interfaces.ts` | 8 | 6 | R-117×2 R-031×1 R-100×1 R-164×1 R-112×1 | N | n/a | 3 |
| `packages/common/serializer/decorators/index.ts` | 1 | 0 |  | N | n/a | 1 |
| `packages/common/serializer/decorators/serialize-options.decorator.ts` | 12 | 8 | R-100×2 R-117×2 R-053×1 R-031×1 R-033×1 R-164×1 | N | 50% | 1 |
| `packages/common/serializer/index.ts` | 5 | 1 | R-030×1 | N | n/a | 1 |
| `packages/common/serializer/standard-schema-serializer.interceptor.ts` | 120 | 41 | R-164×8 R-042×7 R-112×4 R-010×4 R-011×3 R-120×3 | Y | 100% | 1 |
| `packages/common/serializer/standard-schema-serializer.interfaces.ts` | 18 | 5 | R-164×3 R-031×1 R-100×1 | N | n/a | 3 |
| `packages/common/services/console-logger.service.ts` | 865 | 458 | R-042×111 R-011×59 R-112×41 R-164×39 R-010×39 R-049×28 | N | 98% | 2 |
| `packages/common/services/index.ts` | 3 | 1 | R-030×1 | N | n/a | 2 |
| `packages/common/services/log-levels.constant.ts` | 12 | 4 | R-030×1 R-100×1 R-164×1 R-115×1 | N | 100% | 4 |
| `packages/common/services/logger.service.ts` | 321 | 247 | R-112×82 R-042×47 R-164×33 R-010×23 R-049×12 R-011×11 | Y | 87% | 8 |
| `packages/common/services/utils/filter-log-levels.util.ts` | 21 | 22 | R-120×4 R-011×3 R-013×3 R-130×2 R-031×1 R-033×1 | Y | 90% | 3 |
| `packages/common/services/utils/get-env-log-levels.util.ts` | 26 | 17 | R-130×3 R-164×2 R-013×2 R-030×1 R-033×1 R-100×1 | N | 100% | 1 |
| `packages/common/services/utils/index.ts` | 3 | 1 | R-030×1 | N | n/a | 1 |
| `packages/common/services/utils/is-log-level-enabled.util.ts` | 32 | 21 | R-038×4 R-011×3 R-120×2 R-031×1 R-033×1 R-100×1 | Y | 100% | 2 |
| `packages/common/services/utils/is-log-level.util.ts` | 7 | 9 | R-031×1 R-033×1 R-100×1 R-117×1 R-164×1 R-010×1 | N | 100% | 3 |
| `packages/common/services/utils/redact.util.ts` | 230 | 141 | R-011×23 R-120×14 R-164×13 R-049×13 R-018×12 R-010×11 | Y | 100% | 1 |
| `packages/common/utils/assign-custom-metadata.util.ts` | 28 | 11 | R-117×5 R-031×1 R-033×1 R-100×1 R-010×1 R-040×1 | Y | 100% | 1 |
| `packages/common/utils/cli-colors.util.ts` | 15 | 10 | R-163×2 R-053×1 R-039×1 R-030×1 R-033×1 R-036×1 | Y | 100% | 2 |
| `packages/common/utils/extend-metadata.util.ts` | 9 | 7 | R-031×1 R-033×1 R-100×1 R-010×1 R-019×1 R-040×1 | Y | 100% | 5 |
| `packages/common/utils/forward-ref.util.ts` | 7 | 6 | R-031×1 R-033×1 R-100×1 R-117×1 R-164×1 R-112×1 | Y | 100% | 1 |
| `packages/common/utils/http-error-by-code.util.ts` | 70 | 4 | R-039×1 R-030×1 R-100×1 R-117×1 | Y | 100% | 11 |
| `packages/common/utils/index.ts` | 2 | 1 | R-030×1 | N | n/a | 1 |
| `packages/common/utils/load-package.util.ts` | 108 | 43 | R-164×7 R-090×5 R-112×5 R-011×5 R-010×4 R-040×4 | Y | 66% | 3 |
| `packages/common/utils/merge-with-values.util.ts` | 17 | 19 | R-112×4 R-010×3 R-100×2 R-049×2 R-053×1 R-030×1 | Y | 88% | 0 |
| `packages/common/utils/parameter-decorator-options.util.ts` | 28 | 8 | R-031×1 R-033×1 R-100×1 R-164×1 R-112×1 R-010×1 | N | 100% | 3 |
| `packages/common/utils/random-string-generator.util.ts` | 2 | 6 | R-053×1 R-031×1 R-033×1 R-100×1 R-038×1 R-090×1 | Y | 100% | 3 |
| `packages/common/utils/select-exception-filter-metadata.util.ts` | 12 | 9 | R-120×3 R-031×1 R-033×1 R-100×1 R-117×1 R-112×1 | Y | 100% | 1 |
| `packages/common/utils/shared.utils.ts` | 58 | 37 | R-127×9 R-011×5 R-013×4 R-130×4 R-074×3 R-010×3 | Y | 100% | 29 |
| `packages/common/utils/strip-proto-keys.util.ts` | 36 | 27 | R-164×5 R-011×4 R-049×3 R-127×2 R-120×2 R-014×2 | Y | 100% | 3 |
| `packages/common/utils/validate-each.util.ts` | 27 | 16 | R-010×3 R-042×2 R-011×2 R-030×1 R-033×1 R-100×1 | Y | 90% | 4 |
| `packages/common/utils/validate-module-keys.util.ts` | 20 | 12 | R-100×2 R-010×2 R-053×1 R-030×1 R-033×1 R-040×1 | Y | 100% | 1 |
| `packages/core/adapters/http-adapter.ts` | 644 | 213 | R-112×64 R-164×63 R-010×36 R-042×31 R-049×4 R-011×3 | N | 49% | 3 |
| `packages/core/adapters/index.ts` | 1 | 0 |  | N | n/a | 4 |
| `packages/core/application-config.ts` | 153 | 115 | R-042×41 R-010×37 R-049×21 R-120×5 R-112×3 R-117×2 | Y | 100% | 19 |
| `packages/core/constants.ts` | 26 | 7 | R-163×4 R-039×1 R-030×1 R-115×1 | N | 100% | 7 |
| `packages/core/discovery/discoverable-meta-host-collection.ts` | 150 | 52 | R-164×19 R-042×9 R-010×8 R-011×4 R-117×2 R-113×2 | Y | 100% | 3 |
| `packages/core/discovery/discovery-module.ts` | 11 | 3 | R-033×1 R-164×1 R-041×1 | N | 100% | 1 |
| `packages/core/discovery/discovery-service.ts` | 152 | 53 | R-164×12 R-010×8 R-042×7 R-011×5 R-113×4 R-120×4 | Y | 100% | 2 |
| `packages/core/discovery/index.ts` | 2 | 1 | R-030×1 | N | n/a | 1 |
| `packages/core/errors/exception-handler.ts` | 7 | 5 | R-090×2 R-033×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/core/errors/exceptions-zone.ts` | 36 | 16 | R-010×2 R-112×2 R-015×2 R-102×2 R-042×2 R-011×2 | N | 100% | 1 |
| `packages/core/errors/exceptions/circular-dependency.exception.ts` | 9 | 6 | R-031×1 R-033×1 R-100×1 R-041×1 R-010×1 R-013×1 | N | 100% | 2 |
| `packages/core/errors/exceptions/index.ts` | 9 | 1 | R-030×1 | N | n/a | 6 |
| `packages/core/errors/exceptions/invalid-class-module.exception.ts` | 17 | 7 | R-112×2 R-031×1 R-033×1 R-100×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/core/errors/exceptions/invalid-class-scope.exception.ts` | 13 | 12 | R-112×2 R-031×1 R-033×1 R-100×1 R-161×1 R-041×1 | N | 100% | 1 |
| `packages/core/errors/exceptions/invalid-class.exception.ts` | 7 | 6 | R-031×1 R-033×1 R-100×1 R-041×1 R-010×1 R-112×1 | N | 0% | 1 |
| `packages/core/errors/exceptions/invalid-exception-filter.exception.ts` | 7 | 6 | R-031×1 R-033×1 R-100×1 R-161×1 R-041×1 R-010×1 | N | 100% | 3 |
| `packages/core/errors/exceptions/invalid-middleware-configuration.exception.ts` | 7 | 6 | R-031×1 R-033×1 R-100×1 R-161×1 R-041×1 R-010×1 | N | 0% | 0 |
| `packages/core/errors/exceptions/invalid-middleware.exception.ts` | 7 | 5 | R-031×1 R-033×1 R-100×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/core/errors/exceptions/invalid-module.exception.ts` | 12 | 7 | R-112×2 R-031×1 R-033×1 R-100×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/core/errors/exceptions/invalid-provider.exception.ts` | 8 | 6 | R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/core/errors/exceptions/route-conflict.exception.ts` | 7 | 5 | R-031×1 R-033×1 R-100×1 R-041×1 R-010×1 | N | 100% | 2 |
| `packages/core/errors/exceptions/runtime.exception.ts` | 8 | 7 | R-010×2 R-031×1 R-033×1 R-100×1 R-041×1 R-042×1 | N | 50% | 22 |
| `packages/core/errors/exceptions/undefined-dependency.exception.ts` | 15 | 7 | R-117×2 R-031×1 R-033×1 R-100×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/core/errors/exceptions/undefined-forwardref.exception.ts` | 8 | 7 | R-031×1 R-033×1 R-100×1 R-161×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/core/errors/exceptions/undefined-module.exception.ts` | 7 | 8 | R-112×2 R-031×1 R-033×1 R-100×1 R-161×1 R-041×1 | N | 100% | 1 |
| `packages/core/errors/exceptions/unknown-dependencies.exception.ts` | 16 | 9 | R-117×2 R-031×1 R-033×1 R-100×1 R-041×1 R-010×1 | N | 100% | 2 |
| `packages/core/errors/exceptions/unknown-element.exception.ts` | 11 | 6 | R-031×1 R-033×1 R-100×1 R-041×1 R-010×1 R-018×1 | N | 100% | 2 |
| `packages/core/errors/exceptions/unknown-export.exception.ts` | 7 | 5 | R-031×1 R-033×1 R-100×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/core/errors/exceptions/unknown-module.exception.ts` | 10 | 6 | R-031×1 R-033×1 R-100×1 R-041×1 R-010×1 R-013×1 | N | 100% | 1 |
| `packages/core/errors/exceptions/unknown-request-mapping.exception.ts` | 8 | 6 | R-031×1 R-033×1 R-100×1 R-161×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/core/errors/messages.ts` | 251 | 125 | R-018×18 R-164×15 R-100×14 R-053×14 R-112×9 R-115×8 | N | 95% | 16 |
| `packages/core/exceptions/base-exception-filter-context.ts` | 75 | 43 | R-042×7 R-115×6 R-010×5 R-011×5 R-112×4 R-120×4 | N | 100% | 3 |
| `packages/core/exceptions/base-exception-filter.ts` | 108 | 49 | R-011×7 R-127×6 R-010×5 R-042×5 R-164×4 R-067×4 | Y | 88% | 2 |
| `packages/core/exceptions/exceptions-handler.ts` | 35 | 18 | R-042×4 R-010×3 R-011×3 R-161×2 R-033×1 R-041×1 | Y | 100% | 3 |
| `packages/core/exceptions/external-exception-filter-context.ts` | 69 | 36 | R-042×6 R-115×5 R-117×4 R-120×4 R-010×3 R-011×3 | Y | 100% | 1 |
| `packages/core/exceptions/external-exception-filter.ts` | 13 | 11 | R-112×2 R-090×2 R-067×2 R-033×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/core/exceptions/external-exceptions-handler.ts` | 34 | 21 | R-042×4 R-010×3 R-112×3 R-011×3 R-161×2 R-033×1 | Y | 100% | 2 |
| `packages/core/exceptions/index.ts` | 1 | 0 |  | N | n/a | 1 |
| `packages/core/guards/constants.ts` | 1 | 1 | R-031×1 | N | 100% | 3 |
| `packages/core/guards/guards-consumer.ts` | 53 | 21 | R-011×5 R-010×3 R-161×2 R-042×2 R-033×1 R-041×1 | Y | 83% | 2 |
| `packages/core/guards/guards-context-creator.ts` | 117 | 58 | R-042×12 R-115×12 R-011×7 R-120×7 R-010×6 R-117×3 | Y | 100% | 2 |
| `packages/core/guards/index.ts` | 3 | 1 | R-030×1 | N | n/a | 3 |
| `packages/core/helpers/barrier.ts` | 49 | 30 | R-042×12 R-010×5 R-049×5 R-164×4 R-011×2 R-033×1 | Y | 100% | 1 |
| `packages/core/helpers/context-creator.ts` | 61 | 27 | R-042×7 R-112×6 R-010×4 R-115×3 R-117×2 R-033×1 | N | 100% | 4 |
| `packages/core/helpers/context-id-factory.ts` | 91 | 45 | R-164×7 R-112×6 R-010×5 R-011×5 R-042×4 R-049×4 | Y | 50% | 5 |
| `packages/core/helpers/context-utils.ts` | 87 | 38 | R-010×10 R-112×7 R-120×3 R-161×2 R-013×2 R-102×2 | Y | 100% | 5 |
| `packages/core/helpers/cookies/cookie-signer.ts` | 76 | 43 | R-120×10 R-042×5 R-010×4 R-011×4 R-164×3 R-013×3 | Y | 100% | 1 |
| `packages/core/helpers/cookies/parse-cookie-header.ts` | 53 | 34 | R-120×7 R-011×5 R-130×4 R-164×2 R-010×2 R-040×2 | Y | 100% | 1 |
| `packages/core/helpers/cookies/request-cookies.ts` | 98 | 48 | R-164×7 R-011×7 R-040×5 R-112×5 R-010×4 R-115×3 | Y | 100% | 1 |
| `packages/core/helpers/cookies/serialize-cookie.ts` | 129 | 65 | R-011×18 R-016×11 R-018×10 R-164×5 R-074×5 R-127×4 | Y | 100% | 1 |
| `packages/core/helpers/execution-context-host.ts` | 53 | 50 | R-042×18 R-010×10 R-112×6 R-049×4 R-115×3 R-129×3 | Y | 100% | 9 |
| `packages/core/helpers/external-context-creator.ts` | 349 | 110 | R-042×30 R-010×17 R-112×14 R-013×8 R-117×7 R-019×7 | Y | 95% | 3 |
| `packages/core/helpers/external-proxy.ts` | 20 | 13 | R-112×3 R-010×2 R-031×1 R-033×1 R-117×1 R-161×1 | Y | 100% | 1 |
| `packages/core/helpers/get-class-scope.ts` | 7 | 4 | R-033×1 R-161×1 R-040×1 R-132×1 | N | 100% | 5 |
| `packages/core/helpers/handler-metadata-storage.ts` | 58 | 29 | R-112×10 R-117×5 R-042×4 R-010×3 R-161×2 R-030×1 | N | 100% | 3 |
| `packages/core/helpers/http-adapter-host.ts` | 71 | 31 | R-042×10 R-164×7 R-010×6 R-117×2 R-049×2 R-033×1 | Y | 100% | 5 |
| `packages/core/helpers/index.ts` | 3 | 1 | R-030×1 | N | n/a | 1 |
| `packages/core/helpers/interfaces/external-handler-metadata.interface.ts` | 12 | 7 | R-117×2 R-112×2 R-031×1 R-100×1 R-163×1 | N | n/a | 2 |
| `packages/core/helpers/interfaces/index.ts` | 2 | 1 | R-030×1 | N | n/a | 1 |
| `packages/core/helpers/interfaces/params-metadata.interface.ts` | 6 | 3 | R-030×1 R-100×1 R-163×1 | N | n/a | 2 |
| `packages/core/helpers/is-durable.ts` | 6 | 4 | R-033×1 R-161×1 R-040×1 R-132×1 | N | 100% | 4 |
| `packages/core/helpers/load-adapter.ts` | 19 | 10 | R-090×3 R-100×1 R-033×1 R-010×1 R-040×1 R-015×1 | Y | 100% | 2 |
| `packages/core/helpers/messages.ts` | 37 | 28 | R-100×6 R-053×6 R-013×4 R-120×4 R-010×2 R-019×2 | N | 94% | 3 |
| `packages/core/helpers/optional-require.ts` | 10 | 6 | R-033×1 R-010×1 R-040×1 R-015×1 R-013×1 R-102×1 | Y | 100% | 2 |
| `packages/core/helpers/rethrow.ts` | 3 | 4 | R-053×1 R-033×1 R-010×1 R-016×1 | Y | 100% | 1 |
| `packages/core/helpers/router-method-factory.ts` | 31 | 7 | R-030×1 R-033×1 R-115×1 R-041×1 R-010×1 R-019×1 | Y | 100% | 2 |
| `packages/core/helpers/safe-instance-decorator.ts` | 26 | 11 | R-090×2 R-010×2 R-031×1 R-033×1 R-036×1 R-164×1 | Y | 100% | 4 |
| `packages/core/hooks/before-app-shutdown.hook.ts` | 79 | 36 | R-115×5 R-120×4 R-164×3 R-010×3 R-040×3 R-112×2 | Y | 100% | 1 |
| `packages/core/hooks/index.ts` | 5 | 1 | R-030×1 | N | n/a | 1 |
| `packages/core/hooks/on-app-bootstrap.hook.ts` | 61 | 33 | R-164×6 R-010×3 R-040×3 R-115×3 R-112×3 R-120×3 | Y | 100% | 1 |
| `packages/core/hooks/on-app-shutdown.hook.ts` | 78 | 40 | R-164×6 R-115×5 R-120×4 R-010×3 R-040×3 R-112×3 | Y | 100% | 1 |
| `packages/core/hooks/on-module-destroy.hook.ts` | 74 | 40 | R-164×6 R-115×5 R-120×4 R-010×3 R-040×3 R-112×3 | Y | 100% | 1 |
| `packages/core/hooks/on-module-init.hook.ts` | 55 | 32 | R-164×6 R-010×3 R-040×3 R-115×3 R-120×3 R-112×2 | Y | 100% | 1 |
| `packages/core/hooks/utils/get-instances-grouped-by-hierarchy-level.ts` | 34 | 19 | R-011×4 R-117×2 R-014×2 R-120×2 R-102×2 R-049×2 | N | 89% | 5 |
| `packages/core/hooks/utils/get-sorted-hierarchy-levels.ts` | 11 | 10 | R-102×4 R-033×1 R-010×1 R-019×1 R-040×1 R-013×1 | N | 100% | 5 |
| `packages/core/index.ts` | 28 | 2 | R-030×1 R-164×1 | N | n/a | 11 |
| `packages/core/injector/abstract-instance-resolver.ts` | 80 | 35 | R-117×5 R-011×5 R-010×4 R-042×4 R-112×3 R-019×3 | N | 86% | 2 |
| `packages/core/injector/compiler.ts` | 58 | 28 | R-010×5 R-042×5 R-115×5 R-013×2 R-030×1 R-033×1 | Y | 100% | 4 |
| `packages/core/injector/constants.ts` | 6 | 3 | R-030×1 R-117×1 R-163×1 | N | 100% | 17 |
| `packages/core/injector/container.ts` | 328 | 181 | R-042×57 R-010×32 R-011×17 R-112×13 R-113×10 R-049×9 | Y | 93% | 23 |
| `packages/core/injector/helpers/is-debug-mode.util.ts` | 3 | 6 | R-031×1 R-033×1 R-100×1 R-010×1 R-040×1 R-090×1 | N | 100% | 2 |
| `packages/core/injector/helpers/provider-classifier.ts` | 23 | 14 | R-010×3 R-040×3 R-112×3 R-115×3 R-030×1 R-033×1 | Y | 100% | 1 |
| `packages/core/injector/helpers/silent-logger.ts` | 11 | 5 | R-033×1 R-163×1 R-010×1 R-146×1 R-041×1 | Y | 100% | 1 |
| `packages/core/injector/index.ts` | 6 | 1 | R-030×1 | N | n/a | 3 |
| `packages/core/injector/injector.ts` | 1270 | 439 | R-042×107 R-010×58 R-011×58 R-112×26 R-164×25 R-049×21 | Y | 92% | 17 |
| `packages/core/injector/inquirer/index.ts` | 1 | 0 |  | N | n/a | 2 |
| `packages/core/injector/inquirer/inquirer-constants.ts` | 1 | 1 | R-031×1 | N | 100% | 3 |
| `packages/core/injector/inquirer/inquirer-providers.ts` | 8 | 5 | R-039×1 R-031×1 R-163×1 R-010×1 R-146×1 | N | 100% | 1 |
| `packages/core/injector/instance-links-host.ts` | 82 | 51 | R-042×10 R-010×6 R-112×5 R-011×4 R-135×4 R-117×3 | N | 89% | 3 |
| `packages/core/injector/instance-loader.ts` | 113 | 66 | R-042×25 R-010×17 R-117×4 R-135×4 R-120×4 R-019×3 | Y | 94% | 4 |
| `packages/core/injector/instance-wrapper.ts` | 535 | 330 | R-042×141 R-010×43 R-011×41 R-049×29 R-113×13 R-164×10 | Y | 97% | 34 |
| `packages/core/injector/internal-core-module/index.ts` | 1 | 0 |  | N | n/a | 1 |
| `packages/core/injector/internal-core-module/internal-core-module-factory.ts` | 72 | 11 | R-117×5 R-010×2 R-033×1 R-041×1 R-019×1 R-090×1 | Y | 100% | 1 |
| `packages/core/injector/internal-core-module/internal-core-module.ts` | 39 | 5 | R-033×1 R-161×1 R-041×1 R-010×1 R-120×1 | N | 100% | 5 |
| `packages/core/injector/internal-providers-storage.ts` | 15 | 10 | R-010×3 R-042×3 R-033×1 R-117×1 R-041×1 R-049×1 | N | 100% | 1 |
| `packages/core/injector/lazy-module-loader/lazy-module-loader-options.interface.ts` | 6 | 3 | R-031×1 R-100×1 R-164×1 | N | n/a | 1 |
| `packages/core/injector/lazy-module-loader/lazy-module-loader.ts` | 73 | 40 | R-042×13 R-117×7 R-010×5 R-011×3 R-164×2 R-120×2 | Y | 100% | 3 |
| `packages/core/injector/module-ref.ts` | 200 | 66 | R-164×15 R-112×14 R-042×10 R-010×8 R-011×4 R-117×3 | Y | 100% | 4 |
| `packages/core/injector/module.ts` | 609 | 317 | R-042×114 R-010×61 R-011×27 R-115×26 R-112×25 R-049×10 | Y | 87% | 29 |
| `packages/core/injector/modules-container.ts` | 36 | 20 | R-164×4 R-010×4 R-042×4 R-117×2 R-033×1 R-038×1 | Y | 100% | 9 |
| `packages/core/injector/opaque-key-factory/by-reference-module-opaque-key-factory.ts` | 50 | 29 | R-042×9 R-010×6 R-161×2 R-049×2 R-011×2 R-018×2 | Y | 100% | 1 |
| `packages/core/injector/opaque-key-factory/deep-hashed-module-opaque-key-factory.ts` | 121 | 70 | R-042×15 R-011×11 R-010×7 R-112×6 R-090×5 R-067×5 | Y | 85% | 1 |
| `packages/core/injector/opaque-key-factory/interfaces/module-opaque-key-factory.interface.ts` | 23 | 4 | R-164×2 R-031×1 R-100×1 | N | n/a | 4 |
| `packages/core/injector/settlement-signal.ts` | 77 | 38 | R-042×13 R-010×8 R-164×7 R-049×4 R-011×2 R-033×1 | Y | 100% | 2 |
| `packages/core/injector/topology-tree/topology-tree.ts` | 49 | 28 | R-042×10 R-010×5 R-011×5 R-135×2 R-033×1 R-117×1 | Y | 96% | 1 |
| `packages/core/injector/topology-tree/tree-node.ts` | 52 | 38 | R-042×11 R-010×6 R-113×4 R-049×3 R-017×3 R-018×3 | Y | 100% | 1 |
| `packages/core/inspector/deterministic-uuid-registry.ts` | 20 | 23 | R-042×6 R-010×3 R-102×3 R-017×2 R-018×2 R-033×1 | Y | 100% | 3 |
| `packages/core/inspector/graph-inspector.ts` | 217 | 88 | R-042×29 R-010×14 R-117×9 R-049×9 R-135×6 R-113×6 | Y | 88% | 10 |
| `packages/core/inspector/index.ts` | 4 | 1 | R-030×1 | N | n/a | 2 |
| `packages/core/inspector/initialize-on-preview.allowlist.ts` | 10 | 8 | R-010×2 R-042×2 R-031×1 R-033×1 R-100×1 R-041×1 | N | 100% | 3 |
| `packages/core/inspector/interfaces/edge.interface.ts` | 27 | 4 | R-031×1 R-100×1 R-164×1 R-110×1 | N | n/a | 2 |
| `packages/core/inspector/interfaces/enhancer-metadata-cache-entry.interface.ts` | 12 | 4 | R-031×1 R-100×1 R-117×1 R-161×1 | N | n/a | 1 |
| `packages/core/inspector/interfaces/entrypoint.interface.ts` | 21 | 5 | R-110×3 R-030×1 R-100×1 | N | n/a | 5 |
| `packages/core/inspector/interfaces/extras.interface.ts` | 18 | 4 | R-164×2 R-030×1 R-100×1 | N | n/a | 3 |
| `packages/core/inspector/interfaces/node.interface.ts` | 44 | 7 | R-164×3 R-110×2 R-030×1 R-100×1 | N | n/a | 3 |
| `packages/core/inspector/interfaces/serialized-graph-json.interface.ts` | 14 | 8 | R-117×6 R-031×1 R-100×1 | N | n/a | 1 |
| `packages/core/inspector/interfaces/serialized-graph-metadata.interface.ts` | 10 | 4 | R-031×1 R-100×1 R-117×1 R-112×1 | N | n/a | 2 |
| `packages/core/inspector/noop-graph-inspector.ts` | 8 | 3 | R-163×1 R-010×1 R-146×1 | Y | 100% | 2 |
| `packages/core/inspector/partial-graph.host.ts` | 13 | 12 | R-010×3 R-042×3 R-031×1 R-033×1 R-100×1 R-117×1 | Y | 100% | 2 |
| `packages/core/inspector/serialized-graph.ts` | 142 | 73 | R-042×22 R-010×12 R-049×9 R-117×7 R-011×7 R-120×3 | Y | 100% | 6 |
| `packages/core/inspector/uuid-factory.ts` | 17 | 13 | R-010×2 R-042×2 R-030×1 R-033×1 R-036×1 R-161×1 | Y | 100% | 5 |
| `packages/core/interceptors/index.ts` | 2 | 1 | R-030×1 | N | n/a | 2 |
| `packages/core/interceptors/interceptors-consumer.ts` | 79 | 40 | R-164×9 R-010×8 R-011×4 R-161×2 R-042×2 R-112×2 | Y | 100% | 3 |
| `packages/core/interceptors/interceptors-context-creator.ts` | 119 | 61 | R-042×12 R-115×11 R-011×7 R-120×7 R-010×6 R-117×3 | Y | 97% | 3 |
| `packages/core/interfaces/index.ts` | 2 | 1 | R-030×1 | N | n/a | 0 |
| `packages/core/interfaces/module-definition.interface.ts` | 7 | 2 | R-031×1 R-100×1 | N | n/a | 4 |
| `packages/core/interfaces/module-override.interface.ts` | 5 | 3 | R-031×1 R-100×1 R-117×1 | N | n/a | 5 |
| `packages/core/internal.ts` | 55 | 15 | R-164×14 R-030×1 | N | n/a | 32 |
| `packages/core/metadata-scanner.ts` | 99 | 36 | R-011×8 R-164×4 R-014×4 R-113×4 R-042×4 R-010×3 | Y | 100% | 9 |
| `packages/core/middleware/builder.ts` | 121 | 67 | R-042×18 R-010×13 R-120×8 R-112×5 R-164×4 R-019×3 | Y | 100% | 2 |
| `packages/core/middleware/container.ts` | 63 | 31 | R-042×10 R-010×7 R-113×3 R-011×2 R-120×2 R-031×1 | Y | 100% | 3 |
| `packages/core/middleware/index.ts` | 1 | 0 |  | N | n/a | 1 |
| `packages/core/middleware/middleware-module.ts` | 347 | 141 | R-042×38 R-010×15 R-049×13 R-011×13 R-117×10 R-019×9 | Y | 56% | 1 |
| `packages/core/middleware/resolver.ts` | 25 | 15 | R-117×4 R-010×3 R-042×3 R-031×1 R-033×1 R-041×1 | Y | 100% | 1 |
| `packages/core/middleware/route-info-path-extractor.ts` | 114 | 80 | R-042×27 R-120×14 R-011×8 R-010×6 R-013×6 R-049×4 | Y | 100% | 3 |
| `packages/core/middleware/routes-mapper.ts` | 158 | 75 | R-042×15 R-010×11 R-120×10 R-011×9 R-117×4 R-112×4 | Y | 88% | 2 |
| `packages/core/middleware/utils.ts` | 133 | 74 | R-112×12 R-010×9 R-120×8 R-011×8 R-019×5 R-013×3 | Y | 81% | 2 |
| `packages/core/nest-application-context.ts` | 481 | 246 | R-042×72 R-164×41 R-010×31 R-049×13 R-090×12 R-112×12 | Y | 77% | 3 |
| `packages/core/nest-application.ts` | 680 | 457 | R-042×203 R-010×55 R-164×42 R-011×40 R-112×31 R-049×15 | Y | 66% | 3 |
| `packages/core/nest-factory.ts` | 376 | 120 | R-042×33 R-010×21 R-011×10 R-164×9 R-013×8 R-112×7 | N | 4% | 2 |
| `packages/core/pipes/index.ts` | 3 | 1 | R-030×1 | N | n/a | 2 |
| `packages/core/pipes/params-token-factory.ts` | 16 | 4 | R-033×1 R-041×1 R-010×1 R-012×1 | Y | 100% | 3 |
| `packages/core/pipes/pipes-consumer.ts` | 36 | 15 | R-161×2 R-010×2 R-042×2 R-115×2 R-033×1 R-041×1 | Y | 100% | 3 |
| `packages/core/pipes/pipes-context-creator.ts` | 112 | 63 | R-042×13 R-115×11 R-010×7 R-011×7 R-120×7 R-112×4 | Y | 100% | 3 |
| `packages/core/repl/assign-to-object.util.ts` | 17 | 12 | R-010×2 R-049×2 R-031×1 R-033×1 R-100×1 R-164×1 | Y | 100% | 1 |
| `packages/core/repl/constants.ts` | 1 | 1 | R-031×1 | N | 100% | 1 |
| `packages/core/repl/index.ts` | 1 | 0 |  | N | n/a | 1 |
| `packages/core/repl/native-functions/debug-repl-fn.ts` | 53 | 29 | R-042×12 R-010×3 R-011×3 R-125×2 R-033×1 R-161×1 | Y | 95% | 1 |
| `packages/core/repl/native-functions/get-repl-fn.ts` | 15 | 6 | R-112×2 R-033×1 R-041×1 R-010×1 R-042×1 | Y | 100% | 1 |
| `packages/core/repl/native-functions/help-repl-fn.ts` | 28 | 16 | R-120×4 R-161×2 R-013×2 R-042×2 R-102×2 R-149×1 | Y | 100% | 1 |
| `packages/core/repl/native-functions/index.ts` | 6 | 1 | R-030×1 | N | n/a | 1 |
| `packages/core/repl/native-functions/methods-repl-fn.ts` | 27 | 14 | R-042×6 R-033×1 R-161×1 R-041×1 R-010×1 R-019×1 | Y | 100% | 1 |
| `packages/core/repl/native-functions/resolve-repl-fn.ts` | 17 | 7 | R-112×3 R-033×1 R-041×1 R-010×1 R-042×1 | Y | 100% | 1 |
| `packages/core/repl/native-functions/select-relp-fn.ts` | 18 | 5 | R-031×1 R-033×1 R-041×1 R-010×1 R-042×1 | N | 100% | 1 |
| `packages/core/repl/repl-context.ts` | 162 | 76 | R-042×21 R-010×13 R-049×9 R-135×5 R-011×5 R-117×3 | Y | 94% | 2 |
| `packages/core/repl/repl-function.ts` | 29 | 14 | R-164×3 R-010×2 R-042×2 R-033×1 R-117×1 R-161×1 | N | 40% | 7 |
| `packages/core/repl/repl-logger.ts` | 18 | 10 | R-112×2 R-033×1 R-041×1 R-010×1 R-011×1 R-120×1 | Y | 100% | 1 |
| `packages/core/repl/repl-native-commands.ts` | 46 | 25 | R-042×9 R-010×4 R-040×3 R-011×3 R-031×1 R-033×1 | N | 0% | 1 |
| `packages/core/repl/repl.interfaces.ts` | 16 | 7 | R-164×4 R-030×1 R-100×1 R-110×1 | N | n/a | 0 |
| `packages/core/repl/repl.ts` | 33 | 8 | R-161×2 R-010×2 R-033×1 R-019×1 R-040×1 R-090×1 | N | 0% | 1 |
| `packages/core/router/index.ts` | 3 | 1 | R-030×1 | N | n/a | 1 |
| `packages/core/router/interfaces/exceptions-filter.interface.ts` | 12 | 5 | R-117×2 R-031×1 R-100×1 R-161×1 | N | n/a | 1 |
| `packages/core/router/interfaces/exclude-route-metadata.interface.ts` | 15 | 5 | R-164×3 R-031×1 R-100×1 | N | n/a | 4 |
| `packages/core/router/interfaces/index.ts` | 4 | 1 | R-030×1 | N | n/a | 2 |
| `packages/core/router/interfaces/resolved-route.interface.ts` | 32 | 7 | R-117×3 R-164×2 R-030×1 R-100×1 | N | n/a | 9 |
| `packages/core/router/interfaces/resolver.interface.ts` | 13 | 5 | R-117×3 R-031×1 R-100×1 | N | n/a | 2 |
| `packages/core/router/interfaces/route-conflict.interface.ts` | 14 | 8 | R-100×3 R-164×3 R-030×1 R-117×1 | N | n/a | 2 |
| `packages/core/router/interfaces/route-params-factory.interface.ts` | 12 | 7 | R-112×5 R-031×1 R-100×1 | N | n/a | 2 |
| `packages/core/router/interfaces/route-path-metadata.interface.ts` | 32 | 9 | R-164×7 R-031×1 R-100×1 | N | n/a | 3 |
| `packages/core/router/interfaces/route-resolution-options.interface.ts` | 24 | 6 | R-164×3 R-031×1 R-100×1 R-117×1 | N | n/a | 4 |
| `packages/core/router/interfaces/routes.interface.ts` | 7 | 4 | R-112×2 R-030×1 R-100×1 | N | n/a | 2 |
| `packages/core/router/legacy-route-converter.ts` | 77 | 38 | R-130×8 R-011×6 R-010×4 R-013×4 R-042×4 R-164×3 | Y | 100% | 3 |
| `packages/core/router/paths-explorer.ts` | 74 | 23 | R-010×3 R-117×2 R-161×2 R-013×2 R-120×2 R-042×2 | Y | 94% | 2 |
| `packages/core/router/request/index.ts` | 1 | 1 | R-031×1 | N | n/a | 1 |
| `packages/core/router/request/request-constants.ts` | 2 | 2 | R-030×1 R-163×1 | N | 100% | 8 |
| `packages/core/router/request/request-providers.ts` | 8 | 5 | R-039×1 R-031×1 R-163×1 R-010×1 R-146×1 | N | 100% | 1 |
| `packages/core/router/route-conflict-detector.ts` | 397 | 188 | R-011×34 R-120×31 R-164×25 R-010×22 R-013×10 R-019×9 | Y | 96% | 2 |
| `packages/core/router/route-params-factory.ts` | 66 | 31 | R-112×9 R-013×7 R-115×5 R-161×2 R-010×2 R-033×1 | Y | 100% | 1 |
| `packages/core/router/route-path-factory.ts` | 156 | 72 | R-011×14 R-042×10 R-010×9 R-120×9 R-018×8 R-127×5 | Y | 94% | 3 |
| `packages/core/router/route-specificity-sorter.ts` | 71 | 31 | R-010×5 R-120×5 R-100×4 R-164×3 R-011×3 R-038×2 | Y | 100% | 1 |
| `packages/core/router/router-exception-filters.ts` | 67 | 32 | R-042×6 R-117×4 R-120×4 R-010×3 R-115×3 R-161×2 | Y | 100% | 2 |
| `packages/core/router/router-execution-context.ts` | 572 | 198 | R-042×46 R-010×29 R-164×19 R-112×19 R-117×16 R-011×16 | Y | 97% | 1 |
| `packages/core/router/router-explorer.ts` | 489 | 176 | R-042×35 R-010×21 R-117×17 R-011×16 R-049×11 R-112×10 | Y | 71% | 2 |
| `packages/core/router/router-module.ts` | 85 | 43 | R-042×12 R-010×8 R-011×4 R-112×3 R-049×2 R-120×2 | Y | 93% | 2 |
| `packages/core/router/router-proxy.ts` | 51 | 13 | R-010×4 R-015×2 R-102×2 R-030×1 R-033×1 R-036×1 | Y | 100% | 7 |
| `packages/core/router/router-response-controller.ts` | 267 | 133 | R-164×28 R-010×23 R-011×16 R-042×12 R-112×9 R-013×5 | Y | 95% | 1 |
| `packages/core/router/routes-resolver.ts` | 202 | 91 | R-042×33 R-010×16 R-117×9 R-019×7 R-135×5 R-113×5 | Y | 91% | 2 |
| `packages/core/router/sse-stream.ts` | 167 | 84 | R-042×23 R-010×10 R-049×8 R-011×7 R-013×5 R-018×5 | Y | 98% | 3 |
| `packages/core/router/utils/exclude-route.util.ts` | 21 | 14 | R-010×3 R-053×1 R-030×1 R-033×1 R-100×1 R-117×1 | N | 100% | 1 |
| `packages/core/router/utils/flatten-route-paths.util.ts` | 28 | 22 | R-049×4 R-010×3 R-011×3 R-115×3 R-135×2 R-031×1 | N | 100% | 1 |
| `packages/core/router/utils/index.ts` | 2 | 1 | R-030×1 | N | n/a | 6 |
| `packages/core/scanner.ts` | 704 | 325 | R-042×100 R-010×45 R-115×29 R-011×27 R-112×16 R-120×13 | Y | 94% | 4 |
| `packages/core/security/cross-origin-protection.ts` | 365 | 152 | R-011×27 R-164×19 R-042×15 R-010×11 R-120×11 R-100×8 | Y | 97% | 1 |
| `packages/core/security/http-security-hook.ts` | 53 | 22 | R-042×7 R-010×4 R-164×3 R-049×2 R-014×2 R-033×1 | N | 100% | 1 |
| `packages/core/security/security-headers.ts` | 468 | 169 | R-011×43 R-120×16 R-164×12 R-010×12 R-013×12 R-040×9 | Y | 99% | 1 |
| `packages/core/services/index.ts` | 1 | 0 |  | N | n/a | 2 |
| `packages/core/services/reflector.service.ts` | 263 | 112 | R-112×42 R-164×22 R-010×7 R-115×6 R-011×6 R-120×5 | Y | 100% | 2 |
| `packages/microservices/client/client-grpc.ts` | 352 | 236 | R-042×46 R-112×33 R-010×33 R-011×25 R-016×11 R-049×10 | Y | 82% | 2 |
| `packages/microservices/client/client-kafka.ts` | 454 | 306 | R-042×133 R-010×32 R-049×28 R-011×19 R-117×18 R-164×12 | Y | 82% | 3 |
| `packages/microservices/client/client-mqtt.ts` | 384 | 261 | R-042×96 R-010×38 R-049×20 R-011×20 R-112×14 R-018×10 | Y | 94% | 2 |
| `packages/microservices/client/client-nats.ts` | 339 | 233 | R-042×76 R-164×27 R-010×21 R-011×16 R-115×13 R-112×13 | Y | 83% | 2 |
| `packages/microservices/client/client-proxy-factory.ts` | 79 | 35 | R-115×13 R-117×11 R-010×2 R-030×1 R-033×1 R-036×1 | Y | 85% | 2 |
| `packages/microservices/client/client-proxy.ts` | 235 | 101 | R-010×18 R-112×18 R-042×15 R-117×14 R-164×9 R-011×5 | Y | 100% | 10 |
| `packages/microservices/client/client-redis.ts` | 372 | 267 | R-042×119 R-010×33 R-011×21 R-049×18 R-112×12 R-090×11 | Y | 96% | 2 |
| `packages/microservices/client/client-rmq.ts` | 526 | 368 | R-042×160 R-010×36 R-164×32 R-049×25 R-112×20 R-011×16 | Y | 89% | 2 |
| `packages/microservices/client/client-tcp.ts` | 237 | 190 | R-042×80 R-010×22 R-011×14 R-164×13 R-049×13 R-117×8 | Y | 94% | 2 |
| `packages/microservices/client/index.ts` | 9 | 1 | R-030×1 | N | n/a | 5 |
| `packages/microservices/constants.ts` | 60 | 53 | R-163×42 R-100×4 R-053×4 R-039×1 R-030×1 R-033×1 | N | 98% | 21 |
| `packages/microservices/container.ts` | 13 | 12 | R-010×3 R-042×3 R-049×2 R-031×1 R-033×1 R-117×1 | Y | 100% | 2 |
| `packages/microservices/context/exception-filters-context.ts` | 69 | 31 | R-042×5 R-120×4 R-010×3 R-112×3 R-115×3 R-161×2 | Y | 100% | 3 |
| `packages/microservices/context/request-context-host.ts` | 32 | 18 | R-112×5 R-010×5 R-042×3 R-117×2 R-033×1 R-164×1 | Y | 100% | 1 |
| `packages/microservices/context/rpc-context-creator.ts` | 307 | 100 | R-042×28 R-010×16 R-112×12 R-120×8 R-011×6 R-164×5 | Y | 98% | 2 |
| `packages/microservices/context/rpc-metadata-constants.ts` | 9 | 5 | R-039×2 R-030×1 R-163×1 R-038×1 | N | 100% | 2 |
| `packages/microservices/context/rpc-proxy.ts` | 50 | 15 | R-010×3 R-117×2 R-161×2 R-042×2 R-033×1 R-041×1 | Y | 100% | 2 |
| `packages/microservices/ctx-host/base-rpc.context.ts` | 19 | 12 | R-164×3 R-010×3 R-042×2 R-031×1 R-033×1 R-100×1 | N | 100% | 11 |
| `packages/microservices/ctx-host/index.ts` | 7 | 1 | R-030×1 | N | n/a | 4 |
| `packages/microservices/ctx-host/kafka.context.ts` | 58 | 32 | R-164×7 R-010×7 R-042×6 R-038×4 R-117×3 R-031×1 | Y | 100% | 1 |
| `packages/microservices/ctx-host/mqtt.context.ts` | 22 | 14 | R-164×3 R-010×3 R-042×2 R-031×1 R-033×1 R-036×1 | Y | 100% | 2 |
| `packages/microservices/ctx-host/nats.context.ts` | 22 | 14 | R-164×3 R-010×3 R-042×2 R-031×1 R-033×1 R-036×1 | Y | 100% | 2 |
| `packages/microservices/ctx-host/redis.context.ts` | 23 | 14 | R-164×3 R-010×3 R-042×2 R-031×1 R-033×1 R-036×1 | Y | 100% | 1 |
| `packages/microservices/ctx-host/rmq.context.ts` | 28 | 19 | R-164×4 R-010×4 R-042×3 R-112×2 R-031×1 R-033×1 | Y | 100% | 1 |
| `packages/microservices/ctx-host/tcp.context.ts` | 30 | 19 | R-164×4 R-010×4 R-042×3 R-117×2 R-031×1 R-033×1 | Y | 100% | 2 |
| `packages/microservices/decorators/client.decorator.ts` | 25 | 12 | R-049×3 R-100×2 R-010×2 R-031×1 R-033×1 R-117×1 | Y | 100% | 1 |
| `packages/microservices/decorators/ctx.decorator.ts` | 5 | 2 | R-031×1 R-100×1 | Y | 100% | 1 |
| `packages/microservices/decorators/event-pattern.decorator.ts` | 94 | 41 | R-112×14 R-018×4 R-049×4 R-100×2 R-010×2 R-017×2 | Y | 100% | 1 |
| `packages/microservices/decorators/grpc-service.decorator.ts` | 6 | 3 | R-031×1 R-100×1 R-164×1 | N | 100% | 1 |
| `packages/microservices/decorators/index.ts` | 6 | 1 | R-030×1 | N | n/a | 2 |
| `packages/microservices/decorators/message-pattern.decorator.ts` | 219 | 105 | R-010×12 R-100×11 R-040×11 R-112×10 R-164×9 R-011×7 | Y | 88% | 1 |
| `packages/microservices/decorators/payload.decorator.ts` | 102 | 26 | R-100×7 R-040×6 R-163×5 R-164×5 R-030×1 R-033×1 | Y | 100% | 1 |
| `packages/microservices/deserializers/identity.deserializer.ts` | 9 | 8 | R-031×1 R-033×1 R-100×1 R-117×1 R-164×1 R-041×1 | Y | 100% | 1 |
| `packages/microservices/deserializers/incoming-request.deserializer.ts` | 47 | 25 | R-112×5 R-117×3 R-010×3 R-011×3 R-042×2 R-115×2 | Y | 89% | 4 |
| `packages/microservices/deserializers/incoming-response.deserializer.ts` | 42 | 27 | R-164×4 R-112×4 R-010×3 R-117×2 R-042×2 R-011×2 | Y | 89% | 3 |
| `packages/microservices/deserializers/index.ts` | 7 | 1 | R-030×1 | N | n/a | 1 |
| `packages/microservices/deserializers/kafka-request.deserializer.ts` | 23 | 11 | R-117×3 R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 | N | 67% | 2 |
| `packages/microservices/deserializers/kafka-response.deserializer.ts` | 33 | 14 | R-112×3 R-117×2 R-011×2 R-031×1 R-033×1 R-100×1 | Y | 100% | 2 |
| `packages/microservices/deserializers/nats-request-json.deserializer.ts` | 24 | 17 | R-164×6 R-117×2 R-112×2 R-031×1 R-033×1 R-036×1 | N | 100% | 2 |
| `packages/microservices/deserializers/nats-response-json.deserializer.ts` | 20 | 16 | R-164×6 R-112×2 R-031×1 R-033×1 R-036×1 R-100×1 | N | 100% | 2 |
| `packages/microservices/enums/grpc-status.enum.ts` | 22 | 4 | R-031×1 R-100×1 R-164×1 R-111×1 | N | 100% | 3 |
| `packages/microservices/enums/index.ts` | 3 | 1 | R-030×1 | N | n/a | 15 |
| `packages/microservices/enums/kafka-headers.enum.ts` | 41 | 5 | R-164×2 R-031×1 R-100×1 R-111×1 | N | 100% | 2 |
| `packages/microservices/enums/pattern-handler.enum.ts` | 4 | 3 | R-031×1 R-100×1 R-111×1 | N | 100% | 3 |
| `packages/microservices/enums/rpc-paramtype.enum.ts` | 6 | 3 | R-031×1 R-100×1 R-111×1 | N | 100% | 5 |
| `packages/microservices/enums/transport.enum.ts` | 9 | 3 | R-031×1 R-100×1 R-111×1 | N | 100% | 6 |
| `packages/microservices/errors/corrupted-packet-length.exception.ts` | 8 | 6 | R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/microservices/errors/empty-response.exception.ts` | 10 | 6 | R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 R-010×1 | N | 0% | 1 |
| `packages/microservices/errors/incomplete-message-timeout.exception.ts` | 10 | 6 | R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/microservices/errors/invalid-grpc-message-decorator.exception.ts` | 16 | 7 | R-030×1 R-033×1 R-036×1 R-100×1 R-164×1 R-041×1 | N | 0% | 1 |
| `packages/microservices/errors/invalid-grpc-package-definition-missing-package-definition.exception.ts` | 8 | 5 | R-031×1 R-033×1 R-100×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/microservices/errors/invalid-grpc-package-definition-mutex.exception.ts` | 8 | 5 | R-031×1 R-033×1 R-100×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/microservices/errors/invalid-grpc-package.exception.ts` | 9 | 6 | R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 R-010×1 | N | 100% | 2 |
| `packages/microservices/errors/invalid-grpc-service.exception.ts` | 9 | 6 | R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/microservices/errors/invalid-json-format.exception.ts` | 8 | 6 | R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/microservices/errors/invalid-kafka-client-topic.exception.ts` | 11 | 6 | R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/microservices/errors/invalid-message.exception.ts` | 9 | 6 | R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 R-010×1 | N | 0% | 2 |
| `packages/microservices/errors/invalid-proto-definition.exception.ts` | 9 | 6 | R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 R-010×1 | N | 100% | 2 |
| `packages/microservices/errors/invalid-tcp-data-reception.exception.ts` | 18 | 17 | R-013×3 R-127×3 R-115×2 R-112×2 R-031×1 R-033×1 | N | 0% | 1 |
| `packages/microservices/errors/max-packet-length-exceeded.exception.ts` | 8 | 6 | R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/microservices/errors/max-send-buffer-size-exceeded.exception.ts` | 10 | 6 | R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 R-010×1 | N | 100% | 1 |
| `packages/microservices/errors/net-socket-closed.exception.ts` | 8 | 6 | R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 R-010×1 | N | 0% | 1 |
| `packages/microservices/events/index.ts` | 6 | 1 | R-030×1 | N | n/a | 4 |
| `packages/microservices/events/kafka.events.ts` | 7 | 3 | R-031×1 R-100×1 R-111×1 | N | 100% | 1 |
| `packages/microservices/events/mqtt.events.ts` | 36 | 9 | R-163×2 R-111×2 R-030×1 R-100×1 R-164×1 R-112×1 | N | 100% | 3 |
| `packages/microservices/events/nats.events.ts` | 25 | 9 | R-112×2 R-110×2 R-111×2 R-030×1 R-100×1 R-164×1 | N | 100% | 3 |
| `packages/microservices/events/redis.events.ts` | 31 | 9 | R-163×2 R-111×2 R-030×1 R-100×1 R-164×1 R-112×1 | N | 100% | 3 |
| `packages/microservices/events/rmq.events.ts` | 28 | 8 | R-163×2 R-111×2 R-030×1 R-100×1 R-164×1 R-110×1 | N | 100% | 3 |
| `packages/microservices/events/tcp.events.ts` | 36 | 8 | R-163×2 R-111×2 R-030×1 R-100×1 R-164×1 R-110×1 | N | 100% | 5 |
| `packages/microservices/exceptions/base-rpc-exception-filter.ts` | 39 | 22 | R-112×3 R-010×3 R-161×2 R-090×2 R-011×2 R-067×2 | N | 92% | 2 |
| `packages/microservices/exceptions/grpc-exception-filter.ts` | 58 | 18 | R-011×6 R-010×3 R-067×2 R-042×2 R-115×2 R-033×1 | Y | 94% | 1 |
| `packages/microservices/exceptions/grpc-exception.ts` | 105 | 43 | R-010×19 R-041×17 R-042×3 R-030×1 R-033×1 R-036×1 | Y | 25% | 2 |
| `packages/microservices/exceptions/index.ts` | 5 | 1 | R-030×1 | N | n/a | 3 |
| `packages/microservices/exceptions/kafka-retriable-exception.ts` | 16 | 5 | R-033×1 R-164×1 R-041×1 R-010×1 R-042×1 | N | 0% | 1 |
| `packages/microservices/exceptions/rpc-exception.ts` | 27 | 30 | R-042×12 R-010×3 R-011×3 R-049×3 R-115×2 R-112×2 | Y | 100% | 5 |
| `packages/microservices/exceptions/rpc-exceptions-handler.ts` | 50 | 27 | R-042×4 R-011×4 R-010×3 R-112×3 R-161×2 R-164×2 | Y | 100% | 2 |
| `packages/microservices/external/grpc-options.interface.ts` | 22 | 4 | R-031×1 R-100×1 R-164×1 R-112×1 | N | n/a | 3 |
| `packages/microservices/external/kafka.interface.ts` | 1178 | 136 | R-110×36 R-163×26 R-041×22 R-112×13 R-102×11 R-111×8 | N | 100% | 7 |
| `packages/microservices/external/mqtt-options.interface.ts` | 178 | 55 | R-164×39 R-112×9 R-163×4 R-030×1 R-100×1 R-102×1 | N | n/a | 1 |
| `packages/microservices/external/nats-codec.interface.ts` | 9 | 5 | R-102×2 R-031×1 R-100×1 R-164×1 | N | n/a | 0 |
| `packages/microservices/external/redis.interface.ts` | 199 | 36 | R-164×29 R-112×4 R-031×1 R-100×1 R-117×1 | N | n/a | 1 |
| `packages/microservices/external/rmq-url.interface.ts` | 65 | 13 | R-112×5 R-164×3 R-117×2 R-030×1 R-100×1 R-161×1 | N | n/a | 2 |
| `packages/microservices/factories/rpc-params-factory.ts` | 22 | 8 | R-033×1 R-038×1 R-041×1 R-010×1 R-011×1 R-012×1 | Y | 86% | 1 |
| `packages/microservices/helpers/grpc-helpers.ts` | 20 | 11 | R-011×2 R-016×2 R-031×1 R-033×1 R-117×1 R-010×1 | Y | 100% | 1 |
| `packages/microservices/helpers/index.ts` | 6 | 1 | R-030×1 | N | n/a | 10 |
| `packages/microservices/helpers/json-socket.ts` | 215 | 183 | R-042×78 R-164×23 R-049×19 R-011×13 R-010×12 R-038×8 | Y | 97% | 1 |
| `packages/microservices/helpers/kafka-logger.ts` | 28 | 13 | R-018×4 R-100×1 R-053×1 R-033×1 R-112×1 R-010×1 | Y | 100% | 1 |
| `packages/microservices/helpers/kafka-parser.ts` | 54 | 39 | R-011×6 R-164×5 R-049×5 R-042×5 R-010×3 R-112×2 | Y | 100% | 1 |
| `packages/microservices/helpers/kafka-reply-partition-assigner.ts` | 174 | 98 | R-164×21 R-010×14 R-120×11 R-049×9 R-042×7 R-011×7 | Y | 100% | 1 |
| `packages/microservices/helpers/tcp-socket.ts` | 74 | 64 | R-042×26 R-010×10 R-112×9 R-049×3 R-102×3 R-117×2 | N | 90% | 2 |
| `packages/microservices/index.ts` | 21 | 2 | R-030×1 R-164×1 | N | n/a | 0 |
| `packages/microservices/interfaces/client-grpc.interface.ts` | 17 | 6 | R-164×3 R-031×1 R-100×1 R-112×1 | N | n/a | 1 |
| `packages/microservices/interfaces/client-kafka-proxy.interface.ts` | 34 | 11 | R-117×5 R-164×4 R-031×1 R-100×1 | N | n/a | 1 |
| `packages/microservices/interfaces/client-metadata.interface.ts` | 65 | 20 | R-117×12 R-164×5 R-030×1 R-100×1 R-112×1 | N | n/a | 4 |
| `packages/microservices/interfaces/custom-transport-strategy.interface.ts` | 19 | 10 | R-164×4 R-112×3 R-031×1 R-100×1 R-117×1 | N | n/a | 2 |
| `packages/microservices/interfaces/deserializer.interface.ts` | 19 | 12 | R-112×5 R-117×3 R-030×1 R-100×1 R-163×1 R-164×1 | N | n/a | 6 |
| `packages/microservices/interfaces/index.ts` | 12 | 1 | R-030×1 | N | n/a | 34 |
| `packages/microservices/interfaces/message-handler.interface.ts` | 16 | 8 | R-112×4 R-031×1 R-100×1 R-117×1 R-164×1 | N | n/a | 1 |
| `packages/microservices/interfaces/microservice-configuration.interface.ts` | 368 | 78 | R-164×40 R-117×19 R-112×15 R-110×2 R-030×1 R-100×1 | N | n/a | 9 |
| `packages/microservices/interfaces/microservice-entrypoint-metadata.interface.ts` | 8 | 6 | R-117×2 R-031×1 R-100×1 R-110×1 R-112×1 | N | n/a | 1 |
| `packages/microservices/interfaces/packet.interface.ts` | 26 | 12 | R-163×5 R-112×4 R-030×1 R-100×1 R-164×1 | N | n/a | 7 |
| `packages/microservices/interfaces/pattern-metadata.interface.ts` | 1 | 3 | R-031×1 R-100×1 R-112×1 | N | n/a | 3 |
| `packages/microservices/interfaces/pattern.interface.ts` | 6 | 3 | R-030×1 R-100×1 R-163×1 | N | n/a | 1 |
| `packages/microservices/interfaces/request-context.interface.ts` | 12 | 7 | R-112×4 R-031×1 R-100×1 R-117×1 | N | n/a | 1 |
| `packages/microservices/interfaces/serializer.interface.ts` | 19 | 12 | R-112×5 R-117×3 R-030×1 R-100×1 R-163×1 R-164×1 | N | n/a | 9 |
| `packages/microservices/listener-metadata-explorer.ts` | 98 | 24 | R-117×3 R-112×3 R-010×3 R-011×3 R-120×2 R-042×2 | N | 96% | 1 |
| `packages/microservices/listeners-controller.ts` | 337 | 109 | R-042×22 R-117×13 R-010×12 R-011×10 R-120×5 R-018×5 | Y | 98% | 1 |
| `packages/microservices/microservices-module.ts` | 120 | 39 | R-042×13 R-010×8 R-135×4 R-011×3 R-049×2 R-016×2 | N | 62% | 1 |
| `packages/microservices/module/clients.module.ts` | 108 | 46 | R-010×8 R-042×7 R-120×6 R-127×4 R-113×4 R-019×3 | Y | 89% | 1 |
| `packages/microservices/module/index.ts` | 2 | 1 | R-030×1 | N | n/a | 1 |
| `packages/microservices/module/interfaces/clients-module.interface.ts` | 32 | 7 | R-117×2 R-112×2 R-030×1 R-100×1 R-161×1 | N | n/a | 1 |
| `packages/microservices/module/interfaces/index.ts` | 1 | 0 |  | N | n/a | 2 |
| `packages/microservices/nest-microservice.ts` | 391 | 240 | R-042×111 R-010×27 R-164×22 R-011×22 R-049×10 R-090×9 | Y | 58% | 1 |
| `packages/microservices/record-builders/index.ts` | 3 | 1 | R-030×1 | N | n/a | 7 |
| `packages/microservices/record-builders/mqtt.record-builder.ts` | 81 | 43 | R-042×16 R-010×8 R-164×7 R-049×5 R-041×2 R-030×1 | N | 100% | 3 |
| `packages/microservices/record-builders/nats.record-builder.ts` | 27 | 24 | R-042×6 R-010×5 R-112×4 R-164×2 R-041×2 R-049×2 | N | 100% | 1 |
| `packages/microservices/record-builders/rmq.record-builder.ts` | 47 | 23 | R-042×6 R-010×5 R-164×3 R-041×2 R-049×2 R-030×1 | N | 100% | 1 |
| `packages/microservices/serializers/identity.serializer.ts` | 6 | 7 | R-031×1 R-033×1 R-100×1 R-117×1 R-041×1 R-010×1 | Y | 100% | 3 |
| `packages/microservices/serializers/index.ts` | 5 | 1 | R-030×1 | N | n/a | 0 |
| `packages/microservices/serializers/kafka-request.serializer.ts` | 52 | 29 | R-112×5 R-011×5 R-049×3 R-164×2 R-010×2 R-042×2 | Y | 100% | 4 |
| `packages/microservices/serializers/mqtt-record.serializer.ts` | 15 | 10 | R-117×2 R-031×1 R-033×1 R-100×1 R-161×1 R-041×1 | Y | 100% | 3 |
| `packages/microservices/serializers/nats-record.serializer.ts` | 21 | 9 | R-117×2 R-031×1 R-033×1 R-100×1 R-041×1 R-112×1 | Y | 100% | 3 |
| `packages/microservices/serializers/rmq-record.serializer.ts` | 24 | 10 | R-117×2 R-031×1 R-033×1 R-100×1 R-161×1 R-041×1 | Y | 100% | 3 |
| `packages/microservices/server/index.ts` | 8 | 1 | R-030×1 | N | n/a | 2 |
| `packages/microservices/server/server-factory.ts` | 42 | 19 | R-117×8 R-115×7 R-033×1 R-041×1 R-010×1 R-012×1 | Y | 100% | 1 |
| `packages/microservices/server/server-grpc.ts` | 789 | 422 | R-042×77 R-164×74 R-010×56 R-011×42 R-112×29 R-018×22 | Y | 92% | 2 |
| `packages/microservices/server/server-kafka.ts` | 428 | 254 | R-042×100 R-010×31 R-049×22 R-011×18 R-117×16 R-113×11 | Y | 88% | 2 |
| `packages/microservices/server/server-mqtt.ts` | 320 | 204 | R-042×73 R-010×31 R-049×12 R-011×12 R-164×10 R-112×9 | Y | 84% | 2 |
| `packages/microservices/server/server-nats.ts` | 254 | 150 | R-042×57 R-010×20 R-115×11 R-164×10 R-011×8 R-049×6 | Y | 71% | 2 |
| `packages/microservices/server/server-redis.ts` | 268 | 189 | R-042×83 R-010×27 R-011×12 R-112×11 R-164×9 R-049×8 | Y | 83% | 2 |
| `packages/microservices/server/server-rmq.ts` | 456 | 306 | R-042×128 R-010×29 R-011×28 R-164×18 R-112×14 R-049×12 | Y | 76% | 2 |
| `packages/microservices/server/server-tcp.ts` | 260 | 202 | R-042×100 R-010×23 R-049×18 R-011×13 R-117×11 R-164×10 | Y | 84% | 2 |
| `packages/microservices/server/server.ts` | 416 | 170 | R-010×28 R-042×27 R-117×20 R-112×18 R-164×13 R-049×11 | Y | 96% | 11 |
| `packages/microservices/tokens.ts` | 2 | 1 | R-031×1 | N | 100% | 1 |
| `packages/microservices/utils/index.ts` | 1 | 0 |  | N | n/a | 2 |
| `packages/microservices/utils/param.utils.ts` | 85 | 34 | R-113×6 R-010×3 R-049×3 R-011×3 R-115×3 R-018×3 | N | 95% | 2 |
| `packages/microservices/utils/transform-pattern.utils.ts` | 53 | 30 | R-011×5 R-120×4 R-102×3 R-163×2 R-130×2 R-010×2 | Y | 100% | 1 |
| `packages/platform-express/adapters/express-adapter.ts` | 560 | 313 | R-042×61 R-010×55 R-011×45 R-112×40 R-164×14 R-120×13 | Y | 33% | 1 |
| `packages/platform-express/adapters/index.ts` | 1 | 0 |  | N | n/a | 1 |
| `packages/platform-express/adapters/utils/get-body-parser-options.util.ts` | 32 | 9 | R-010×2 R-011×2 R-031×1 R-033×1 R-100×1 R-049×1 | Y | 100% | 1 |
| `packages/platform-express/adapters/utils/get-media-type-version.util.ts` | 29 | 18 | R-120×4 R-130×4 R-014×2 R-031×1 R-033×1 R-100×1 | Y | 100% | 1 |
| `packages/platform-express/index.ts` | 9 | 2 | R-030×1 R-164×1 | N | n/a | 0 |
| `packages/platform-express/interfaces/index.ts` | 3 | 1 | R-030×1 | N | n/a | 1 |
| `packages/platform-express/interfaces/nest-express-application.interface.ts` | 135 | 25 | R-164×12 R-112×6 R-117×3 R-161×2 R-031×1 R-100×1 | N | n/a | 1 |
| `packages/platform-express/interfaces/nest-express-body-parser-options.interface.ts` | 28 | 8 | R-164×5 R-031×1 R-100×1 R-112×1 | N | n/a | 1 |
| `packages/platform-express/interfaces/nest-express-body-parser.interface.ts` | 31 | 5 | R-164×3 R-030×1 R-100×1 | N | n/a | 3 |
| `packages/platform-express/interfaces/serve-static-options.interface.ts` | 69 | 17 | R-164×12 R-112×3 R-031×1 R-100×1 | N | n/a | 2 |
| `packages/platform-express/multer/files.constants.ts` | 1 | 2 | R-031×1 R-100×1 | N | 100% | 6 |
| `packages/platform-express/multer/index.ts` | 3 | 1 | R-030×1 | N | n/a | 1 |
| `packages/platform-express/multer/interceptors/any-files.interceptor.ts` | 56 | 21 | R-112×4 R-010×4 R-100×2 R-042×2 R-031×1 R-033×1 | Y | 100% | 1 |
| `packages/platform-express/multer/interceptors/file-fields.interceptor.ts` | 64 | 21 | R-112×4 R-010×4 R-100×2 R-042×2 R-031×1 R-033×1 | Y | 83% | 1 |
| `packages/platform-express/multer/interceptors/file.interceptor.ts` | 62 | 21 | R-112×4 R-010×4 R-100×2 R-042×2 R-031×1 R-033×1 | Y | 100% | 1 |
| `packages/platform-express/multer/interceptors/files.interceptor.ts` | 65 | 21 | R-112×4 R-010×4 R-100×2 R-042×2 R-031×1 R-033×1 | Y | 100% | 1 |
| `packages/platform-express/multer/interceptors/index.ts` | 5 | 1 | R-030×1 | N | n/a | 1 |
| `packages/platform-express/multer/interceptors/no-files.interceptor.ts` | 56 | 21 | R-112×4 R-010×4 R-100×2 R-042×2 R-031×1 R-033×1 | Y | 100% | 1 |
| `packages/platform-express/multer/interfaces/files-upload-module.interface.ts` | 23 | 8 | R-164×2 R-112×2 R-030×1 R-100×1 R-117×1 R-161×1 | N | n/a | 2 |
| `packages/platform-express/multer/interfaces/index.ts` | 1 | 0 |  | N | n/a | 7 |
| `packages/platform-express/multer/interfaces/multer-options.interface.ts` | 73 | 30 | R-164×25 R-112×3 R-030×1 R-100×1 | N | n/a | 7 |
| `packages/platform-express/multer/multer.constants.ts` | 1 | 2 | R-031×1 R-100×1 | N | 100% | 1 |
| `packages/platform-express/multer/multer.module.ts` | 73 | 20 | R-010×4 R-042×3 R-113×3 R-090×2 R-011×2 R-031×1 | N | 100% | 1 |
| `packages/platform-express/multer/multer/multer.constants.ts` | 24 | 9 | R-164×5 R-039×2 R-030×1 R-100×1 | N | 100% | 1 |
| `packages/platform-express/multer/multer/multer.utils.ts` | 73 | 28 | R-164×5 R-010×3 R-040×3 R-011×3 R-117×2 R-129×2 | Y | 100% | 5 |
| `packages/platform-fastify/adapters/fastify-adapter.ts` | 1145 | 619 | R-042×133 R-010×91 R-011×68 R-112×45 R-164×34 R-115×31 | Y | 59% | 1 |
| `packages/platform-fastify/adapters/index.ts` | 1 | 0 |  | N | n/a | 1 |
| `packages/platform-fastify/adapters/utils/get-media-type-version.util.ts` | 29 | 18 | R-120×4 R-130×4 R-014×2 R-031×1 R-033×1 R-100×1 | Y | 100% | 1 |
| `packages/platform-fastify/constants.ts` | 4 | 3 | R-163×2 R-030×1 | N | 100% | 4 |
| `packages/platform-fastify/decorators/index.ts` | 3 | 1 | R-030×1 | N | n/a | 1 |
| `packages/platform-fastify/decorators/route-config.decorator.ts` | 9 | 7 | R-100×2 R-053×1 R-031×1 R-033×1 R-164×1 R-112×1 | N | 100% | 1 |
| `packages/platform-fastify/decorators/route-constraints.decorator.ts` | 11 | 8 | R-100×2 R-053×1 R-031×1 R-033×1 R-117×1 R-161×1 | N | 100% | 1 |
| `packages/platform-fastify/decorators/route-schema.decorator.ts` | 14 | 8 | R-100×2 R-053×1 R-031×1 R-033×1 R-117×1 R-161×1 | N | 100% | 1 |
| `packages/platform-fastify/index.ts` | 10 | 2 | R-030×1 R-164×1 | N | n/a | 0 |
| `packages/platform-fastify/interfaces/external/fastify-multipart-options.interface.ts` | 57 | 16 | R-164×14 R-031×1 R-100×1 | N | n/a | 1 |
| `packages/platform-fastify/interfaces/external/fastify-static-options.interface.ts` | 95 | 11 | R-164×5 R-117×4 R-030×1 R-100×1 | N | n/a | 1 |
| `packages/platform-fastify/interfaces/external/fastify-view-options.interface.ts` | 31 | 13 | R-112×10 R-031×1 R-100×1 R-164×1 | N | n/a | 1 |
| `packages/platform-fastify/interfaces/external/index.ts` | 3 | 1 | R-030×1 | N | n/a | 2 |
| `packages/platform-fastify/interfaces/index.ts` | 2 | 1 | R-030×1 | N | n/a | 2 |
| `packages/platform-fastify/interfaces/nest-fastify-application.interface.ts` | 120 | 30 | R-117×18 R-164×9 R-031×1 R-100×1 R-112×1 | N | n/a | 1 |
| `packages/platform-fastify/interfaces/nest-fastify-body-parser-options.interface.ts` | 5 | 2 | R-031×1 R-100×1 | N | n/a | 2 |
| `packages/platform-fastify/multipart/files.constants.ts` | 1 | 2 | R-031×1 R-100×1 | N | 100% | 2 |
| `packages/platform-fastify/multipart/index.ts` | 4 | 1 | R-030×1 | N | n/a | 1 |
| `packages/platform-fastify/multipart/interceptors/any-files.interceptor.ts` | 20 | 7 | R-100×2 R-031×1 R-033×1 R-164×1 R-010×1 R-040×1 | Y | 100% | 1 |
| `packages/platform-fastify/multipart/interceptors/file-fields.interceptor.ts` | 22 | 7 | R-100×2 R-031×1 R-033×1 R-164×1 R-010×1 R-040×1 | Y | 100% | 1 |
| `packages/platform-fastify/multipart/interceptors/file-stream.interceptor.ts` | 37 | 7 | R-100×2 R-031×1 R-033×1 R-164×1 R-010×1 R-040×1 | Y | 100% | 1 |
| `packages/platform-fastify/multipart/interceptors/file.interceptor.ts` | 26 | 7 | R-100×2 R-031×1 R-033×1 R-164×1 R-010×1 R-040×1 | Y | 100% | 1 |
| `packages/platform-fastify/multipart/interceptors/files.interceptor.ts` | 24 | 7 | R-100×2 R-031×1 R-033×1 R-164×1 R-010×1 R-040×1 | Y | 100% | 1 |
| `packages/platform-fastify/multipart/interceptors/index.ts` | 6 | 1 | R-030×1 | N | n/a | 1 |
| `packages/platform-fastify/multipart/interceptors/no-files.interceptor.ts` | 20 | 7 | R-100×2 R-031×1 R-033×1 R-164×1 R-010×1 R-040×1 | Y | 100% | 1 |
| `packages/platform-fastify/multipart/interfaces/files-upload-module.interface.ts` | 29 | 5 | R-164×2 R-030×1 R-100×1 R-112×1 | N | n/a | 1 |
| `packages/platform-fastify/multipart/interfaces/index.ts` | 3 | 1 | R-030×1 | N | n/a | 1 |
| `packages/platform-fastify/multipart/interfaces/multipart-file.interface.ts` | 70 | 24 | R-164×22 R-030×1 R-100×1 | N | n/a | 1 |
| `packages/platform-fastify/multipart/interfaces/multipart-options.interface.ts` | 92 | 26 | R-164×19 R-112×5 R-030×1 R-100×1 | N | n/a | 1 |
| `packages/platform-fastify/multipart/multipart.constants.ts` | 1 | 2 | R-031×1 R-100×1 | N | 100% | 1 |
| `packages/platform-fastify/multipart/multipart.module.ts` | 80 | 19 | R-010×4 R-042×3 R-113×3 R-090×2 R-011×2 R-031×1 | Y | 100% | 1 |
| `packages/platform-fastify/multipart/multipart/append-field.util.ts` | 144 | 86 | R-049×14 R-011×12 R-018×8 R-112×8 R-120×7 R-010×6 | Y | 99% | 1 |
| `packages/platform-fastify/multipart/multipart/multipart-interceptor.factory.ts` | 184 | 66 | R-164×16 R-010×10 R-042×9 R-011×6 R-040×3 R-016×3 | Y | 100% | 6 |
| `packages/platform-fastify/multipart/multipart/multipart.constants.ts` | 78 | 18 | R-164×11 R-115×3 R-039×2 R-030×1 R-100×1 | N | 100% | 4 |
| `packages/platform-fastify/multipart/multipart/multipart.error.ts` | 17 | 8 | R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 R-010×1 | N | 100% | 2 |
| `packages/platform-fastify/multipart/multipart/multipart.parser.ts` | 493 | 170 | R-011×34 R-010×24 R-040×19 R-016×13 R-164×10 R-049×10 | N | 95% | 1 |
| `packages/platform-fastify/multipart/multipart/multipart.utils.ts` | 87 | 30 | R-011×8 R-010×3 R-040×3 R-164×2 R-129×2 R-067×2 | Y | 100% | 2 |
| `packages/platform-fastify/multipart/storage/disk.storage.ts` | 96 | 41 | R-164×5 R-010×5 R-040×4 R-049×4 R-112×3 R-019×2 | Y | 94% | 2 |
| `packages/platform-fastify/multipart/storage/index.ts` | 2 | 1 | R-030×1 | N | n/a | 1 |
| `packages/platform-fastify/multipart/storage/memory.storage.ts` | 24 | 15 | R-010×4 R-040×3 R-049×2 R-120×2 R-031×1 R-033×1 | Y | 100% | 2 |
| `packages/platform-socket.io/adapters/index.ts` | 1 | 0 |  | N | n/a | 1 |
| `packages/platform-socket.io/adapters/io-adapter.ts` | 119 | 70 | R-042×12 R-010×10 R-164×9 R-011×9 R-112×7 R-117×4 | N | 71% | 1 |
| `packages/platform-socket.io/index.ts` | 7 | 1 | R-164×1 | N | n/a | 0 |
| `packages/platform-ws/adapters/index.ts` | 1 | 0 |  | N | n/a | 1 |
| `packages/platform-ws/adapters/ws-adapter.ts` | 308 | 168 | R-042×32 R-164×28 R-112×22 R-010×16 R-011×15 R-163×7 | N | 63% | 1 |
| `packages/platform-ws/index.ts` | 7 | 1 | R-164×1 | N | n/a | 0 |
| `packages/testing/index.ts` | 11 | 2 | R-030×1 R-164×1 | N | n/a | 0 |
| `packages/testing/interfaces/index.ts` | 3 | 1 | R-030×1 | N | n/a | 4 |
| `packages/testing/interfaces/mock-factory.ts` | 2 | 1 | R-112×1 | N | n/a | 1 |
| `packages/testing/interfaces/override-by-factory-options.interface.ts` | 7 | 6 | R-112×3 R-031×1 R-100×1 R-164×1 | N | n/a | 2 |
| `packages/testing/interfaces/override-by.interface.ts` | 10 | 7 | R-117×2 R-112×2 R-031×1 R-100×1 R-164×1 | N | n/a | 1 |
| `packages/testing/interfaces/override-module.interface.ts` | 8 | 5 | R-031×1 R-100×1 R-117×1 R-161×1 R-164×1 | N | n/a | 1 |
| `packages/testing/services/capturing-logger.service.ts` | 276 | 150 | R-042×24 R-164×19 R-010×17 R-120×17 R-112×13 R-011×11 | N | 100% | 1 |
| `packages/testing/services/testing-logger.service.ts` | 16 | 12 | R-010×6 R-031×1 R-033×1 R-100×1 R-164×1 R-041×1 | N | 100% | 1 |
| `packages/testing/test.ts` | 15 | 6 | R-033×1 R-117×1 R-161×1 R-041×1 R-010×1 R-042×1 | Y | 100% | 1 |
| `packages/testing/testing-injector.ts` | 109 | 31 | R-042×7 R-010×5 R-011×3 R-016×3 R-049×2 R-112×2 | Y | 95% | 2 |
| `packages/testing/testing-instance-loader.ts` | 13 | 10 | R-042×4 R-117×2 R-033×1 R-161×1 R-041×1 R-010×1 | Y | 100% | 1 |
| `packages/testing/testing-module.builder.ts` | 189 | 97 | R-042×38 R-010×21 R-112×9 R-049×6 R-117×4 R-164×2 | N | 100% | 4 |
| `packages/testing/testing-module.ts` | 145 | 42 | R-042×13 R-010×8 R-164×4 R-112×4 R-115×3 R-011×3 | Y | 94% | 2 |
| `packages/websockets/adapters/index.ts` | 1 | 0 |  | N | n/a | 2 |
| `packages/websockets/adapters/ws-adapter.ts` | 52 | 35 | R-112×8 R-010×7 R-042×4 R-049×3 R-161×2 R-011×2 | N | 42% | 1 |
| `packages/websockets/constants.ts` | 13 | 11 | R-163×10 R-030×1 | N | 100% | 10 |
| `packages/websockets/context/exception-filters-context.ts` | 43 | 20 | R-112×4 R-010×3 R-161×2 R-049×2 R-042×2 R-115×2 | N | 100% | 3 |
| `packages/websockets/context/ws-context-creator.ts` | 277 | 87 | R-042×27 R-010×15 R-112×14 R-120×6 R-019×4 R-013×4 | Y | 97% | 2 |
| `packages/websockets/context/ws-metadata-constants.ts` | 6 | 3 | R-039×1 R-031×1 R-038×1 | N | 100% | 1 |
| `packages/websockets/context/ws-proxy.ts` | 37 | 17 | R-010×4 R-161×2 R-112×2 R-042×2 R-033×1 R-117×1 | Y | 100% | 2 |
| `packages/websockets/decorators/ack.decorator.ts` | 27 | 7 | R-100×2 R-031×1 R-033×1 R-164×1 R-010×1 R-040×1 | Y | 100% | 1 |
| `packages/websockets/decorators/connected-socket.decorator.ts` | 8 | 3 | R-031×1 R-100×1 R-164×1 | Y | 100% | 1 |
| `packages/websockets/decorators/gateway-server.decorator.ts` | 12 | 10 | R-100×2 R-010×2 R-049×2 R-031×1 R-033×1 R-164×1 | N | 100% | 1 |
| `packages/websockets/decorators/index.ts` | 6 | 1 | R-030×1 | N | n/a | 1 |
| `packages/websockets/decorators/message-body.decorator.ts` | 104 | 26 | R-100×7 R-040×6 R-163×5 R-164×5 R-030×1 R-033×1 | Y | 100% | 1 |
| `packages/websockets/decorators/socket-gateway.decorator.ts` | 32 | 29 | R-100×5 R-040×4 R-163×3 R-112×3 R-049×3 R-010×2 | N | 100% | 1 |
| `packages/websockets/decorators/subscribe-message.decorator.ts` | 17 | 10 | R-100×2 R-010×2 R-049×2 R-031×1 R-033×1 R-164×1 | N | 100% | 1 |
| `packages/websockets/enums/ws-paramtype.enum.ts` | 6 | 3 | R-031×1 R-100×1 R-111×1 | N | 100% | 7 |
| `packages/websockets/errors/index.ts` | 1 | 0 |  | N | n/a | 1 |
| `packages/websockets/errors/invalid-socket-port.exception.ts` | 6 | 6 | R-031×1 R-033×1 R-100×1 R-041×1 R-010×1 R-112×1 | N | 100% | 1 |
| `packages/websockets/errors/ws-exception.ts` | 24 | 29 | R-042×12 R-010×3 R-011×3 R-049×3 R-115×2 R-112×2 | N | 100% | 4 |
| `packages/websockets/exceptions/base-ws-exception-filter.ts` | 138 | 59 | R-042×14 R-164×8 R-010×7 R-011×7 R-112×4 R-049×4 | N | 97% | 2 |
| `packages/websockets/exceptions/index.ts` | 1 | 0 |  | N | n/a | 1 |
| `packages/websockets/exceptions/ws-exceptions-handler.ts` | 37 | 19 | R-042×4 R-010×3 R-011×3 R-033×1 R-117×1 R-161×1 | Y | 100% | 2 |
| `packages/websockets/factories/server-and-event-streams-factory.ts` | 16 | 6 | R-033×1 R-117×1 R-041×1 R-010×1 R-019×1 R-112×1 | Y | 100% | 1 |
| `packages/websockets/factories/ws-params-factory.ts` | 24 | 9 | R-033×1 R-161×1 R-041×1 R-010×1 R-011×1 R-012×1 | Y | 100% | 1 |
| `packages/websockets/gateway-metadata-explorer.ts` | 87 | 34 | R-010×5 R-112×4 R-042×4 R-011×4 R-120×3 R-117×2 | Y | 100% | 2 |
| `packages/websockets/index.ts` | 13 | 2 | R-030×1 R-164×1 | N | n/a | 2 |
| `packages/websockets/interfaces/gateway-metadata.interface.ts` | 122 | 30 | R-164×23 R-112×5 R-031×1 R-100×1 | N | n/a | 3 |
| `packages/websockets/interfaces/hooks/index.ts` | 3 | 1 | R-030×1 | N | n/a | 1 |
| `packages/websockets/interfaces/hooks/on-gateway-connection.interface.ts` | 6 | 6 | R-112×3 R-031×1 R-100×1 R-164×1 | N | n/a | 1 |
| `packages/websockets/interfaces/hooks/on-gateway-disconnect.interface.ts` | 6 | 5 | R-112×2 R-031×1 R-100×1 R-164×1 | N | n/a | 1 |
| `packages/websockets/interfaces/hooks/on-gateway-init.interface.ts` | 6 | 5 | R-112×2 R-031×1 R-100×1 R-164×1 | N | n/a | 1 |
| `packages/websockets/interfaces/index.ts` | 5 | 1 | R-030×1 | N | n/a | 3 |
| `packages/websockets/interfaces/nest-gateway.interface.ts` | 8 | 6 | R-112×3 R-031×1 R-100×1 R-164×1 | N | n/a | 3 |
| `packages/websockets/interfaces/server-and-event-streams-host.interface.ts` | 10 | 8 | R-112×3 R-117×2 R-031×1 R-100×1 R-164×1 | N | n/a | 4 |
| `packages/websockets/interfaces/web-socket-server.interface.ts` | 7 | 3 | R-031×1 R-100×1 R-164×1 | N | n/a | 1 |
| `packages/websockets/interfaces/websockets-entrypoint-metadata.interface.ts` | 4 | 3 | R-031×1 R-100×1 R-110×1 | N | n/a | 1 |
| `packages/websockets/interfaces/ws-response.interface.ts` | 7 | 4 | R-031×1 R-100×1 R-164×1 R-112×1 | N | n/a | 1 |
| `packages/websockets/internal.ts` | 8 | 1 | R-164×1 | N | n/a | 2 |
| `packages/websockets/socket-module.ts` | 174 | 75 | R-042×26 R-049×10 R-010×6 R-120×6 R-011×5 R-019×4 | N | 35% | 0 |
| `packages/websockets/socket-server-provider.ts` | 87 | 34 | R-042×10 R-010×6 R-112×4 R-117×3 R-011×3 R-019×2 | Y | 96% | 2 |
| `packages/websockets/sockets-container.ts` | 35 | 19 | R-042×6 R-010×5 R-112×3 R-117×2 R-033×1 R-041×1 | N | 100% | 2 |
| `packages/websockets/utils/compare-element.util.ts` | 7 | 5 | R-031×1 R-033×1 R-100×1 R-010×1 R-040×1 | Y | 100% | 1 |
| `packages/websockets/utils/index.ts` | 1 | 0 |  | N | n/a | 0 |
| `packages/websockets/utils/param.utils.ts` | 85 | 34 | R-113×6 R-010×3 R-049×3 R-011×3 R-115×3 R-018×3 | N | 100% | 4 |
| `packages/websockets/web-sockets-controller.ts` | 567 | 223 | R-042×53 R-115×26 R-112×25 R-010×23 R-011×18 R-013×17 | Y | 86% | 1 |
