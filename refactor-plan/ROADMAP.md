# Roadmap

Architect's working material. Executors use PROGRESS.md and their task file.

## Shape of the plan

The scope is large: 1 966 TypeScript files and 50 189 detected violations. The
public API also conflicts with the guide (DECISIONS.md summary). So:

- **Written in full and executable now:** Foundations T001–T005 and Safety net
  T010–T015. They change tooling, documents and tests only.
- **Written in full but waiting for Q2:** T006–T009 (dependencies, `chain`
  wrapper, shared helpers, checkpoint), status `needs-detailing`.
- **Listed with file sets, status `needs-detailing`:** everything else. An
  architect details them in a later session, after the blocking questions are
  answered and the preceding phase has landed. Executors never detail tasks.

The order follows the brief's standard sequence: Foundations → Safety net →
Structure → Rewrite (bottom-up) → Sweeps → Tightening. Each phase ends with a
checkpoint task. One deviation: phase 3 (Structure) depends on Q1, and under
Q1 option A it is almost empty, because every package file path is public.
Rewrite can then start straight after the Safety net.

## Dependency graph (phases and gates)

```text
T001 ─┐
T002 ─┤
T003 ─┼─> T005 (checkpoint 1A) ─┬─> T010 ┐
T004 ─┘                         ├─> T011 │
                                ├─> T012 ├─> T015 (checkpoint 2A)
                                ├─> T013 │
                                └─> T014 ┘
                                │
              [Q2 answered] ───>└─> T006 ─> T007 ─> T008 ─> T009 (checkpoint 1B)
                                                               │
[Q1 answered] ─> T016–T021, T030–T038 (safety net 2B/2C) ─> T029, T039 ┤
                 T100–T109 (structure) ─> T110 ────────────────┤
                 T150 (benchmark, gates hot-path rewrites) ────┤
                                                               v
       T200–T427 (rewrite, bottom-up: common → core → microservices
                  → websockets → platform-* → testing)
       checkpoints T430–T438 (one per package), T439 (phase)
                                                               v
       T600–T699 (sweeps; T680–T688 need Q4, T700+ need Q6)
                                                               v
       T900–T904 (tightening)
```

## Lanes for the tasks that can run now

| Lane | Tasks | Files touched (besides PROGRESS.md) |
| --- | --- | --- |
| A | T001 | `package.json`, `package-lock.json`, `eslint.config.mjs` |
| B | T002 | `docs/GLOSSARY.md` |
| C | T003 | `docs/FUNCTION_NAMES.md` |
| D | T004 | `packages/*/tsconfig.build.json` (9 files) |
| — | T005 | none (checkpoint) |
| A | T010 | `packages/core/helpers/context-id-factory.spec.ts` |
| B | T011 | `packages/microservices/exceptions/grpc-exception.spec.ts` |
| C | T012 | `packages/core/errors/exceptions/{runtime,invalid-class,invalid-middleware-configuration}.exception.spec.ts` |
| D | T013 | `packages/microservices/errors/{empty-response,invalid-grpc-message-decorator,invalid-message,invalid-tcp-data-reception,net-socket-closed}.exception.spec.ts` |
| E | T014 | `packages/microservices/exceptions/kafka-retriable-exception.spec.ts`, `packages/common/serializer/decorators/serialize-options.decorator.spec.ts` |
| — | T015 | none (checkpoint) |

Within one lane, run tasks in ID order. File sets in different lanes are
disjoint.

## Phase 1: Foundations

| ID | Title | Depends on | Status | Notes |
| --- | --- | --- | --- | --- |
| T001 | Add ESLint with the guide's rules as warnings | — | todo | D-19, Q8 default |
| T002 | Create the domain glossary | — | todo | D-03 |
| T003 | Create the function-name index | — | todo | D-24, R-104 |
| T004 | Exclude nested specs from package builds | — | todo | D-08 |
| T005 | Checkpoint 1A | T001–T004 | todo | |
| T006 | Add lodash-es, ts-pattern, ramda and their types | T005 | needs-detailing (awaits Q2; written in full) | D-01 |
| T007 | Create the `chain` wrapper module | T006 | needs-detailing (awaits Q2; written in full) | D-02, D-06 |
| T008 | Create the shared `tapEffect` and `getErrorMessage` helpers | T007 | needs-detailing (awaits Q2; written in full) | §5.3, §5.6 |
| T009 | Checkpoint 1B | T008, T015 | needs-detailing (awaits Q2; written in full) | |

## Phase 2: Safety net

Characterisation specs for package source files under 60 % unit line coverage
(CONTEXT §7). They must follow GUIDE §12, which bans mocks and spies, so only
modules testable with plain values are in T010–T014. All expected values were
recorded by running the current code.

| ID | Title | Depends on | Status |
| --- | --- | --- | --- |
| T010 | Characterise `ContextIdFactory` | T005 | todo |
| T011 | Characterise the gRPC exceptions | T005 | todo |
| T012 | Characterise core's runtime exceptions | T005 | todo |
| T013 | Characterise the microservices transport errors | T005 | todo |
| T014 | Characterise `KafkaRetriableException` and `SerializeOptions` | T005 | todo |
| T015 | Checkpoint 2A | T010–T014 | todo |
| T016 | Characterise `AbstractHttpAdapter` and the REPL (`core/adapters/http-adapter.ts` 49 %, `core/repl/repl.ts` 0 %, `repl-native-commands.ts` 0 %, `repl-function.ts` 40 %) | T015, Q1 | needs-detailing |
| T017 | Characterise `ExpressAdapter` (`platform-express/adapters/express-adapter.ts` 33 %) with a real Express server via `supertest` (no mocks) | T015, Q1 | needs-detailing |
| T018 | Characterise `FastifyAdapter` (`platform-fastify/adapters/fastify-adapter.ts` 59 %) with `light-my-request` | T015, Q1 | needs-detailing |
| T019 | Characterise `NestFactory` and `NestMicroservice` (`core/nest-factory.ts` 4 %, `microservices/nest-microservice.ts` 58 %) | T015, Q1 | needs-detailing |
| T020 | Characterise `SocketModule` and `WsAdapter` (`websockets/socket-module.ts` 35 %, `websockets/adapters/ws-adapter.ts` 42 %) | T015, Q1 | needs-detailing |
| T021 | Characterise `MiddlewareModule` (`core/middleware/middleware-module.ts` 56 %) | T015, Q1 | needs-detailing |
| T029 | Checkpoint 2B (also confirm a green CI `integration_tests` run) | T016–T021 | needs-detailing |
| T030 | Write specs for the 32 `common` files that export a function or class and have no spec anywhere (R-033, R-174; list in `baseline/files-without-spec.txt`) | T015, Q1 | needs-detailing |
| T031 | Same for `core` (44 files) | T015, Q1 | needs-detailing |
| T032 | Same for `microservices` (25 files) | T015, Q1 | needs-detailing |
| T033 | Same for `websockets` (11 files) | T015, Q1 | needs-detailing |
| T034 | Same for `platform-express` (1 file) | T015, Q1 | needs-detailing |
| T035 | Same for `platform-fastify` (5 files) | T015, Q1 | needs-detailing |
| T036 | Same for `platform-socket.io` (1 file) | T015, Q1 | needs-detailing |
| T037 | Same for `platform-ws` (1 file) | T015, Q1 | needs-detailing |
| T038 | Same for `testing` (3 files) | T015, Q1 | needs-detailing |
| T039 | Checkpoint 2C | T030–T038 | needs-detailing |

T030–T038 exclude the files that T016–T021 cover, and are split into tasks of
at most 5 spec files when detailed. Many of
the 123 files are interfaces' companions or decorators that existing specs
cover indirectly. The detailing architect drops a file only with coverage
evidence (`baseline/coverage-by-file.csv` ≥ 80 % lines), and records it in
DECISIONS.md.

## Phase 3: Structure (depends on Q1)

Under Q1 option A, package file paths stay. Only non-public moves are allowed:
code moved into new `internal/` files that the old public file re-exports
(C-15). Under option B this phase is the redesign. Each task below is a
placeholder for one package. When detailing, the architect splits it into
moves of at most 5 files, with the exact new file names.

| ID | Title | File set | Depends on |
| --- | --- | --- | --- |
| T100 | Structure `common` (R-030, R-031, R-034, R-036) | `packages/common/**` (202 source files; 227 R-030 + 106 R-036 hits package-wide) | T009, T029, T039, Q1 |
| T101 | Structure `core` | `packages/core/**` (197) | T100 |
| T102 | Structure `microservices` | `packages/microservices/**` (137) | T101 |
| T103 | Structure `websockets` | `packages/websockets/**` (44) | T101 |
| T104 | Structure `platform-express` | `packages/platform-express/**` (25) | T101 |
| T105 | Structure `platform-fastify` | `packages/platform-fastify/**` (40) | T101 |
| T106 | Structure `platform-socket.io` | `packages/platform-socket.io/**` (3) | T103 |
| T107 | Structure `platform-ws` | `packages/platform-ws/**` (3) | T103 |
| T108 | Structure `testing` | `packages/testing/**` (13) | T101 |
| T109 | Move the 305 existing specs from `test/` beside their sources (R-033) | `packages/*/test/**` | T100–T108, Q6 |
| T110 | Checkpoint 3 | — | T100–T109 |
| T150 | Benchmark the request path and microservice (de)serialisation (`tools/benchmarks`), record numbers for §15 | `tools/benchmarks/**` | T009 |

## Phase 4: Rewrite, bottom-up (depends on Q1, Q2, Q3)

228 work packages covering the 372 package source files that break a body rule
(R-010–R-019, R-040, R-043, R-049, R-067, R-073, R-074, R-090, R-120,
R-125–R-135, R-141, R-146, R-149). Package order is common → core →
microservices → websockets → platform-express → platform-fastify →
platform-socket.io → platform-ws → testing. Inside a package, files come in
reverse dependency order, computed from value imports (`import type` and
barrel files ignored), so every package depends only on earlier ones. Files in
one import cycle (↻) are rewritten in the listed order. Converting their
`function` declarations to `const` can expose hoisting problems (C-11).

Grouping: same folder, at most 5 files and about 300 non-blank lines per task.
A single file over 300 lines is one row (✂) and is split by function when
detailed. "Depends on" lists earlier work packages that a file in the row
imports, plus T009, T015, T110, T150 for ⏱ rows, and T016–T021 for low-coverage
files. All rows: status `needs-detailing`. Each package ends with a checkpoint
(T430 common, T431 core, T432 microservices, T433 websockets, T434
platform-express, T435 platform-fastify, T436 platform-socket.io, T437
platform-ws, T438 testing). T439 closes the phase.

### Rewrite work packages

#### common

| ID | Files (package source) | LOC | Depends on | Flags |
| --- | --- | ---: | --- | --- |
| T200 | `decorators/core/apply-decorators.ts`<br>`decorators/core/bind.decorator.ts`<br>`decorators/core/catch.decorator.ts` | 77 | T009, T015, T110 |  |
| T201 | `utils/shared.utils.ts` | 58 | T009, T015, T110 |  |
| T202 | `decorators/core/controller.decorator.ts`<br>`decorators/core/dependencies.decorator.ts` | 192 | T009, T015, T110, T201 |  |
| T203 | `utils/extend-metadata.util.ts`<br>`utils/validate-each.util.ts` | 36 | T009, T015, T110 | ⚠T throw/try (Q3) |
| T204 | `decorators/core/exception-filters.decorator.ts`<br>`decorators/core/inject.decorator.ts`<br>`decorators/core/injectable.decorator.ts`<br>`decorators/core/optional.decorator.ts`<br>`decorators/core/set-metadata.decorator.ts` | 256 | T009, T015, T110, T201, T203 |  |
| T205 | `decorators/core/use-guards.decorator.ts`<br>`decorators/core/use-interceptors.decorator.ts`<br>`decorators/core/use-pipes.decorator.ts`<br>`decorators/core/version.decorator.ts` | 184 | T009, T015, T110, T201, T203 |  |
| T206 | `utils/parameter-decorator-options.util.ts` | 28 | T009, T015, T110, T201 |  |
| T207 | `decorators/http/route-params.decorator.ts` | 1098 | T009, T015, T110, T201, T206 | ✂ >300 LOC: split when detailing |
| T208 | `utils/assign-custom-metadata.util.ts` | 28 | T009, T015, T110, T207 |  |
| T209 | `decorators/http/create-route-param-metadata.decorator.ts`<br>`decorators/http/header.decorator.ts`<br>`decorators/http/http-code.decorator.ts` | 154 | T009, T015, T110, T201, T203, T206, T207, T208 |  |
| T210 | `decorators/http/request-mapping.decorator.ts`<br>`decorators/http/render.decorator.ts`<br>`decorators/http/redirect.decorator.ts`<br>`decorators/http/sse.decorator.ts` | 248 | T009, T015, T110 |  |
| T211 | `decorators/http/sse-signal.decorator.ts` | 56 | T009, T015, T110, T209 |  |
| T212 | `decorators/modules/global.decorator.ts` | 17 | T009, T015, T110 |  |
| T213 | `utils/validate-module-keys.util.ts` | 20 | T009, T015, T110 | ⚠T throw/try (Q3) |
| T214 | `decorators/modules/module.decorator.ts` | 27 | T009, T015, T110, T213 |  |
| T215 | `exceptions/http.exception.ts`<br>`exceptions/bad-gateway.exception.ts`<br>`exceptions/bad-request.exception.ts` | 296 | T009, T015, T110, T201 |  |
| T216 | `exceptions/conflict.exception.ts`<br>`exceptions/forbidden.exception.ts`<br>`exceptions/gateway-timeout.exception.ts`<br>`exceptions/gone.exception.ts`<br>`exceptions/http-version-not-supported.exception.ts` | 262 | T009, T015, T110, T215 |  |
| T217 | `exceptions/im-a-teapot.exception.ts`<br>`exceptions/internal-server-error.exception.ts`<br>`exceptions/method-not-allowed.exception.ts`<br>`exceptions/misdirected.exception.ts`<br>`exceptions/not-acceptable.exception.ts` | 265 | T009, T015, T110, T215 |  |
| T218 | `exceptions/not-found.exception.ts`<br>`exceptions/not-implemented.exception.ts`<br>`exceptions/payload-too-large.exception.ts`<br>`exceptions/precondition-failed.exception.ts`<br>`exceptions/request-timeout.exception.ts` | 260 | T009, T015, T110, T215 |  |
| T219 | `exceptions/service-unavailable.exception.ts`<br>`exceptions/unauthorized.exception.ts`<br>`exceptions/unprocessable-entity.exception.ts`<br>`exceptions/unsupported-media-type.exception.ts` | 212 | T009, T015, T110, T215 |  |
| T220 | `file-stream/streamable-file.ts` | 87 | T009, T015, T110, T201 |  |
| T221 | `utils/cli-colors.util.ts` | 15 | T009, T015, T110 |  |
| T222 | `services/utils/is-log-level.util.ts`<br>`services/utils/filter-log-levels.util.ts`<br>`services/utils/get-env-log-levels.util.ts`<br>`services/utils/redact.util.ts` | 284 | T009, T015, T110 | ⚠T throw/try (Q3) |
| T223 | `services/console-logger.service.ts` | 865 | T009, T015, T110, T201, T221, T222 | ✂ >300 LOC: split when detailing; ↻ import cycle (C-11 hoisting); ⚠T throw/try (Q3) |
| T224 | `services/logger.service.ts` | 321 | T009, T015, T110, T201, T223 | ✂ >300 LOC: split when detailing; ↻ import cycle (C-11 hoisting); ⚠T throw/try (Q3) |
| T225 | `services/utils/is-log-level-enabled.util.ts` | 32 | T009, T015, T110, T224 | ↻ import cycle (C-11 hoisting) |
| T226 | `utils/load-package.util.ts`<br>`utils/random-string-generator.util.ts`<br>`utils/select-exception-filter-metadata.util.ts` | 122 | T009, T015, T110, T224 | ⚠T throw/try (Q3) |
| T227 | `module-utils/configurable-module.builder.ts` | 354 | T009, T015, T110, T224, T226 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T228 | `module-utils/utils/generate-options-injection-token.util.ts`<br>`module-utils/utils/get-injection-providers.util.ts` | 54 | T009, T015, T110, T201, T226 |  |
| T229 | `pipes/default-value.pipe.ts` | 29 | T009, T015, T110, T201, T204 |  |
| T230 | `pipes/file/file-validator.interface.ts`<br>`pipes/file/file-type.validator.ts`<br>`pipes/file/max-file-size.validator.ts` | 274 | T009, T015, T110, T224 | ⚠T throw/try (Q3) |
| T231 | `pipes/file/parse-file.pipe.ts`<br>`pipes/file/parse-file-pipe.builder.ts` | 113 | T009, T015, T110, T201, T230 | ⚠T throw/try (Q3) |
| T232 | `utils/strip-proto-keys.util.ts` | 36 | T009, T015, T110 |  |
| T233 | `pipes/validation.pipe.ts` | 345 | T009, T015, T110, T201, T215, T226, T232 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T234 | `pipes/parse-array.pipe.ts`<br>`pipes/parse-bool.pipe.ts` | 286 | T009, T015, T110, T201, T204, T233 | ⚠T throw/try (Q3) |
| T235 | `pipes/parse-date.pipe.ts`<br>`pipes/parse-enum.pipe.ts`<br>`pipes/parse-float.pipe.ts` | 283 | T009, T015, T110, T201, T204 | ⚠T throw/try (Q3) |
| T236 | `pipes/parse-int.pipe.ts`<br>`pipes/parse-uuid.pipe.ts` | 201 | T009, T015, T110, T201, T204 | ⚠T throw/try (Q3) |
| T237 | `pipes/standard-schema-validation.pipe.ts` | 159 | T009, T015, T110, T201, T204, T232 | ⚠T throw/try (Q3) |
| T238 | `serializer/class-serializer.interceptor.ts`<br>`serializer/standard-schema-serializer.interceptor.ts` | 228 | T009, T015, T110, T201, T226 | ⚠T throw/try (Q3) |
| T239 | `utils/merge-with-values.util.ts` | 17 | T009, T015, T110 |  |

#### core

| ID | Files (package source) | LOC | Depends on | Flags |
| --- | --- | ---: | --- | --- |
| T240 | `helpers/cookies/serialize-cookie.ts` | 129 | T009, T015, T110 | ⚠T throw/try (Q3) |
| T241 | `adapters/http-adapter.ts` | 644 | T009, T015, T016, T110, T240 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3); low coverage: http-adapter.ts 49% |
| T242 | `helpers/get-class-scope.ts`<br>`helpers/is-durable.ts` | 13 | T009, T015, T110 |  |
| T243 | `inspector/deterministic-uuid-registry.ts`<br>`inspector/uuid-factory.ts` | 37 | T009, T015, T110 |  |
| T244 | `injector/helpers/is-debug-mode.util.ts`<br>`injector/helpers/provider-classifier.ts` | 26 | T009, T015, T110 |  |
| T245 | `errors/exceptions/runtime.exception.ts` | 8 | T009, T015, T110 | low coverage: runtime.exception.ts 50% |
| T246 | `helpers/barrier.ts`<br>`helpers/safe-instance-decorator.ts` | 75 | T009, T015, T110 | ⚠T throw/try (Q3) |
| T247 | `injector/settlement-signal.ts` | 77 | T009, T015, T110 |  |
| T248 | `inspector/initialize-on-preview.allowlist.ts` | 10 | T009, T015, T110 |  |
| T249 | `helpers/http-adapter-host.ts` | 71 | T009, T015, T110, T241 |  |
| T250 | `exceptions/base-exception-filter.ts` | 108 | T009, T015, T110, T249 |  |
| T251 | `helpers/execution-context-host.ts` | 53 | T009, T015, T110 |  |
| T252 | `exceptions/external-exception-filter.ts` | 13 | T009, T015, T110 | ⚠T throw/try (Q3) |
| T253 | `helpers/context-utils.ts` | 87 | T009, T015, T110, T251 |  |
| T254 | `router/sse-stream.ts` | 167 | T009, T015, T110, T150 | ⏱ hot path (T150) |
| T255 | `errors/exceptions/circular-dependency.exception.ts` | 9 | T009, T015, T110, T245 |  |
| T256 | `injector/compiler.ts` | 58 | T009, T015, T110 |  |
| T257 | `helpers/messages.ts` | 37 | T009, T015, T110 |  |
| T258 | `router/request/request-providers.ts` | 8 | T009, T015, T110, T150 | ⏱ hot path (T150) |
| T259 | `injector/inquirer/inquirer-providers.ts` | 8 | T009, T015, T110 |  |
| T260 | `injector/internal-core-module/internal-core-module.ts` | 39 | T009, T015, T110, T258, T259 |  |
| T261 | `injector/topology-tree/tree-node.ts` | 52 | T009, T015, T110 |  |
| T262 | `metadata-scanner.ts` | 99 | T009, T015, T110 |  |
| T263 | `injector/helpers/silent-logger.ts` | 11 | T009, T015, T110 |  |
| T264 | `errors/exceptions/unknown-element.exception.ts` | 11 | T009, T015, T110, T245 |  |
| T265 | `services/reflector.service.ts` | 263 | T009, T015, T110 |  |
| T266 | `injector/internal-providers-storage.ts` | 15 | T009, T015, T110, T249 |  |
| T267 | `injector/opaque-key-factory/by-reference-module-opaque-key-factory.ts`<br>`injector/opaque-key-factory/deep-hashed-module-opaque-key-factory.ts` | 171 | T009, T015, T110 |  |
| T268 | `application-config.ts` | 153 | T009, T015, T110 | ↻ import cycle (C-11 hoisting) |
| T269 | `discovery/discoverable-meta-host-collection.ts` | 150 | T009, T015, T110 | ↻ import cycle (C-11 hoisting) |
| T270 | `errors/exceptions/invalid-class-module.exception.ts`<br>`errors/exceptions/invalid-exception-filter.exception.ts`<br>`errors/exceptions/invalid-module.exception.ts`<br>`errors/exceptions/invalid-provider.exception.ts`<br>`errors/exceptions/undefined-dependency.exception.ts` | 59 | T009, T015, T110, T245 | ↻ import cycle (C-11 hoisting) |
| T271 | `errors/exceptions/undefined-module.exception.ts`<br>`errors/exceptions/unknown-dependencies.exception.ts` | 23 | T009, T015, T110, T245 | ↻ import cycle (C-11 hoisting) |
| T272 | `errors/messages.ts` | 251 | T009, T015, T110 | ↻ import cycle (C-11 hoisting) |
| T273 | `exceptions/base-exception-filter-context.ts`<br>`exceptions/exceptions-handler.ts`<br>`exceptions/external-exception-filter-context.ts`<br>`exceptions/external-exceptions-handler.ts` | 213 | T009, T015, T110, T250, T252, T268, T270 | ↻ import cycle (C-11 hoisting); ⚠T throw/try (Q3) |
| T274 | `helpers/context-creator.ts`<br>`helpers/context-id-factory.ts` | 152 | T009, T015, T110 | ↻ import cycle (C-11 hoisting); low coverage: context-id-factory.ts 50% |
| T275 | `helpers/external-context-creator.ts` | 349 | T009, T015, T110, T150, T253, T273 | ✂ >300 LOC: split when detailing; ↻ import cycle (C-11 hoisting); ⚠T throw/try (Q3); ⏱ hot path (T150) |
| T276 | `helpers/external-proxy.ts`<br>`helpers/handler-metadata-storage.ts` | 78 | T009, T015, T110, T251, T253, T254, T273 | ↻ import cycle (C-11 hoisting); ⚠T throw/try (Q3) |
| T277 | `injector/abstract-instance-resolver.ts` | 80 | T009, T015, T110 | ↻ import cycle (C-11 hoisting); ⚠T throw/try (Q3) |
| T278 | `injector/container.ts` | 328 | T009, T015, T110, T248, T256, T260, T266, T267, T268, T269 | ✂ >300 LOC: split when detailing; ↻ import cycle (C-11 hoisting); ⚠T throw/try (Q3) |
| T279 | `injector/injector.ts` | 1270 | T009, T015, T110, T244, T245, T246, T247, T270, T271 | ✂ >300 LOC: split when detailing; ↻ import cycle (C-11 hoisting); ⚠T throw/try (Q3) |
| T280 | `injector/instance-links-host.ts`<br>`injector/instance-loader.ts` | 195 | T009, T015, T110, T257, T260, T264, T269, T278, T279 | ↻ import cycle (C-11 hoisting); ⚠T throw/try (Q3) |
| T281 | `injector/instance-wrapper.ts` | 535 | T009, T015, T110, T242, T243, T244, T247 | ✂ >300 LOC: split when detailing; ↻ import cycle (C-11 hoisting) |
| T282 | `injector/internal-core-module/internal-core-module-factory.ts` | 72 | T009, T015, T110, T248, T249, T256, T260, T275, T278, T279, T280 | ↻ import cycle (C-11 hoisting) |
| T283 | `injector/lazy-module-loader/lazy-module-loader.ts` | 73 | T009, T015, T110, T256, T263, T280 | ↻ import cycle (C-11 hoisting); ⚠T throw/try (Q3) |
| T284 | `injector/module-ref.ts` | 200 | T009, T015, T110, T242, T277, T278, T279, T280, T281 | ↻ import cycle (C-11 hoisting) |
| T285 | `injector/module.ts` | 609 | T009, T015, T110, T242, T243, T246, T268, T270, T274, T278, T281, T284 | ✂ >300 LOC: split when detailing; ↻ import cycle (C-11 hoisting); ⚠T throw/try (Q3) |
| T286 | `injector/modules-container.ts` | 36 | T009, T015, T110, T285 | ↻ import cycle (C-11 hoisting) |
| T287 | `injector/topology-tree/topology-tree.ts` | 49 | T009, T015, T110, T261, T285 | ↻ import cycle (C-11 hoisting) |
| T288 | `inspector/graph-inspector.ts`<br>`inspector/partial-graph.host.ts` | 230 | T009, T015, T110, T243, T271, T278, T281, T285 | ↻ import cycle (C-11 hoisting) |
| T289 | `inspector/serialized-graph.ts` | 142 | T009, T015, T110, T243, T249, T265, T268, T275, T283, T284, T286 | ↻ import cycle (C-11 hoisting) |
| T290 | `router/router-proxy.ts` | 51 | T009, T015, T110, T150, T251, T273 | ↻ import cycle (C-11 hoisting); ⚠T throw/try (Q3); ⏱ hot path (T150) |
| T291 | `scanner.ts` | 704 | T009, T015, T110, T242, T243, T255, T262, T268, T270, T271, T278, T281, T282, T285, T287, T288 | ✂ >300 LOC: split when detailing; ↻ import cycle (C-11 hoisting); ⚠T throw/try (Q3) |
| T292 | `discovery/discovery-service.ts` | 152 | T009, T015, T110, T269, T281, T285, T286 |  |
| T293 | `errors/exception-handler.ts`<br>`errors/exceptions-zone.ts` | 43 | T009, T015, T110 | ⚠T throw/try (Q3) |
| T294 | `errors/exceptions/invalid-class-scope.exception.ts`<br>`errors/exceptions/invalid-class.exception.ts`<br>`errors/exceptions/route-conflict.exception.ts`<br>`errors/exceptions/unknown-export.exception.ts`<br>`errors/exceptions/unknown-module.exception.ts` | 44 | T009, T015, T110, T245, T272 | low coverage: invalid-class.exception.ts 0% |
| T295 | `errors/exceptions/undefined-forwardref.exception.ts`<br>`errors/exceptions/invalid-middleware-configuration.exception.ts`<br>`errors/exceptions/invalid-middleware.exception.ts`<br>`errors/exceptions/unknown-request-mapping.exception.ts` | 30 | T009, T015, T110, T245, T272 | low coverage: invalid-middleware-configuration.exception.ts 0% |
| T296 | `guards/guards-consumer.ts`<br>`guards/guards-context-creator.ts` | 170 | T009, T015, T110, T150, T251, T268, T274, T278, T281 | ⏱ hot path (T150) |
| T297 | `helpers/cookies/cookie-signer.ts`<br>`helpers/cookies/parse-cookie-header.ts`<br>`helpers/cookies/request-cookies.ts` | 227 | T009, T015, T110 | ⚠T throw/try (Q3) |
| T298 | `helpers/load-adapter.ts`<br>`helpers/optional-require.ts`<br>`helpers/rethrow.ts`<br>`helpers/router-method-factory.ts` | 63 | T009, T015, T110 | ⚠T throw/try (Q3) |
| T299 | `hooks/utils/get-instances-grouped-by-hierarchy-level.ts`<br>`hooks/utils/get-sorted-hierarchy-levels.ts` | 45 | T009, T015, T110, T281 |  |
| T300 | `hooks/before-app-shutdown.hook.ts`<br>`hooks/on-app-bootstrap.hook.ts`<br>`hooks/on-app-shutdown.hook.ts`<br>`hooks/on-module-destroy.hook.ts` | 292 | T009, T015, T110, T285, T299 | ⚠T throw/try (Q3) |
| T301 | `hooks/on-module-init.hook.ts` | 55 | T009, T015, T110, T285, T299 |  |
| T302 | `middleware/container.ts` | 63 | T009, T015, T110, T242, T278, T281 |  |
| T303 | `router/router-exception-filters.ts`<br>`router/route-path-factory.ts` | 223 | T009, T015, T110, T150, T268, T273, T278, T281, T290 | ⏱ hot path (T150) |
| T304 | `middleware/route-info-path-extractor.ts` | 114 | T009, T015, T110, T268, T303 |  |
| T305 | `router/paths-explorer.ts`<br>`router/router-module.ts` | 159 | T009, T015, T110, T150, T262, T285, T286, T290 | ⏱ hot path (T150) |
| T306 | `middleware/routes-mapper.ts` | 158 | T009, T015, T110, T262, T268, T278, T285, T305 |  |
| T307 | `router/legacy-route-converter.ts` | 77 | T009, T015, T110, T150 | ⏱ hot path (T150) |
| T308 | `middleware/utils.ts`<br>`middleware/builder.ts`<br>`middleware/resolver.ts` | 279 | T009, T015, T110, T279, T281, T285, T302, T304, T306, T307 | ⚠T throw/try (Q3) |
| T309 | `middleware/middleware-module.ts` | 347 | T009, T015, T021, T110, T245, T251, T268, T274, T278, T279, T281, T285, T288, T290, T295, T302, T303, T304, T306, T308 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3); low coverage: middleware-module.ts 56% |
| T310 | `nest-application-context.ts` | 481 | T009, T015, T110, T256, T274, T277, T278, T279, T280, T281, T285 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T311 | `router/route-params-factory.ts` | 66 | T009, T015, T110, T150, T268, T297 | ⏱ hot path (T150) |
| T312 | `interceptors/interceptors-consumer.ts`<br>`interceptors/interceptors-context-creator.ts` | 198 | T009, T015, T110, T150, T251, T268, T274, T278, T281 | ⏱ hot path (T150) |
| T313 | `pipes/params-token-factory.ts`<br>`pipes/pipes-consumer.ts`<br>`pipes/pipes-context-creator.ts` | 164 | T009, T015, T110, T150, T268, T274, T278, T281 | ⏱ hot path (T150) |
| T314 | `router/router-response-controller.ts` | 267 | T009, T015, T110, T150, T254 | ⚠T throw/try (Q3); ⏱ hot path (T150) |
| T315 | `router/router-execution-context.ts` | 572 | T009, T015, T110, T150, T251, T253, T254, T276, T312, T313, T314 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3); ⏱ hot path (T150) |
| T316 | `router/router-explorer.ts` | 489 | T009, T015, T110, T150, T251, T257, T262, T268, T274, T278, T279, T281, T285, T288, T290, T295, T298, T303, T305, T311, T315 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3); ⏱ hot path (T150) |
| T317 | `router/routes-resolver.ts` | 202 | T009, T015, T110, T150, T257, T262, T268, T278, T279, T281, T288, T290, T303, T316 | ⚠T throw/try (Q3); ⏱ hot path (T150) |
| T318 | `router/route-conflict-detector.ts` | 397 | T009, T015, T110, T150, T272, T294 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3); ⏱ hot path (T150) |
| T319 | `router/route-specificity-sorter.ts` | 71 | T009, T015, T110, T150, T318 | ⏱ hot path (T150) |
| T320 | `security/cross-origin-protection.ts` | 365 | T009, T015, T110, T304, T307 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T321 | `security/http-security-hook.ts` | 53 | T009, T015, T110, T268, T304, T320 |  |
| T322 | `security/security-headers.ts` | 468 | T009, T015, T110 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T323 | `nest-application.ts` | 680 | T009, T015, T110, T246, T268, T278, T279, T288, T297, T298, T302, T308, T309, T310, T317, T318, T319, T320, T321, T322 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T324 | `inspector/noop-graph-inspector.ts` | 8 | T009, T015, T110, T288 |  |
| T325 | `nest-factory.ts` | 376 | T009, T015, T019, T110, T241, T243, T262, T268, T278, T279, T280, T288, T291, T293, T298, T310, T323, T324 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3); low coverage: nest-factory.ts 4% |
| T326 | `repl/assign-to-object.util.ts`<br>`repl/repl-context.ts`<br>`repl/repl-function.ts`<br>`repl/repl-logger.ts`<br>`repl/repl-native-commands.ts` | 272 | T009, T015, T016, T110, T260, T268, T285, T316, T317, T323 | ↻ import cycle (C-11 hoisting); low coverage: repl-function.ts 40%, repl-native-commands.ts 0% |
| T327 | `repl/repl.ts` | 33 | T009, T015, T016, T110, T325, T326 | low coverage: repl.ts 0% |
| T328 | `repl/native-functions/debug-repl-fn.ts`<br>`repl/native-functions/get-repl-fn.ts`<br>`repl/native-functions/help-repl-fn.ts`<br>`repl/native-functions/resolve-repl-fn.ts`<br>`repl/native-functions/select-relp-fn.ts` | 131 | T009, T015, T110, T326 |  |
| T329 | `repl/native-functions/methods-repl-fn.ts` | 27 | T009, T015, T110, T262, T326 |  |
| T330 | `router/utils/exclude-route.util.ts`<br>`router/utils/flatten-route-paths.util.ts` | 49 | T009, T015, T110, T150 | ⏱ hot path (T150) |

#### microservices

| ID | Files (package source) | LOC | Depends on | Flags |
| --- | --- | ---: | --- | --- |
| T331 | `errors/invalid-grpc-package.exception.ts`<br>`errors/invalid-grpc-service.exception.ts`<br>`errors/invalid-proto-definition.exception.ts` | 27 | T009, T015, T110 |  |
| T332 | `deserializers/incoming-response.deserializer.ts` | 42 | T009, T015, T110, T150 | ⏱ hot path (T150) |
| T333 | `errors/invalid-message.exception.ts` | 9 | T009, T015, T110 | low coverage: invalid-message.exception.ts 0% |
| T334 | `serializers/identity.serializer.ts` | 6 | T009, T015, T110, T150 | ⏱ hot path (T150) |
| T335 | `client/client-proxy.ts` | 235 | T009, T015, T110, T332, T333, T334 | ⚠T throw/try (Q3) |
| T336 | `client/client-grpc.ts` | 352 | T009, T015, T110, T331, T335 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T337 | `deserializers/kafka-response.deserializer.ts` | 33 | T009, T015, T110, T150 | ⏱ hot path (T150) |
| T338 | `errors/invalid-kafka-client-topic.exception.ts` | 11 | T009, T015, T110 |  |
| T339 | `external/kafka.interface.ts` | 1178 | T009, T015, T110 | ✂ >300 LOC: split when detailing |
| T340 | `serializers/kafka-request.serializer.ts` | 52 | T009, T015, T110, T150 | ⏱ hot path (T150) |
| T341 | `client/client-kafka.ts` | 454 | T009, T015, T110, T333, T335, T337, T338, T339, T340 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T342 | `record-builders/mqtt.record-builder.ts` | 81 | T009, T015, T110 |  |
| T343 | `serializers/mqtt-record.serializer.ts` | 15 | T009, T015, T110, T150 | ⏱ hot path (T150) |
| T344 | `client/client-mqtt.ts` | 384 | T009, T015, T110, T335, T342, T343 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T345 | `deserializers/nats-response-json.deserializer.ts` | 20 | T009, T015, T110, T150, T332 | ⏱ hot path (T150) |
| T346 | `errors/empty-response.exception.ts` | 10 | T009, T015, T110 | low coverage: empty-response.exception.ts 0% |
| T347 | `serializers/nats-record.serializer.ts` | 21 | T009, T015, T110, T150 | ⏱ hot path (T150) |
| T348 | `client/client-nats.ts` | 339 | T009, T015, T110, T335, T345, T346, T347 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T349 | `client/client-redis.ts` | 372 | T009, T015, T110, T335 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T350 | `serializers/rmq-record.serializer.ts` | 24 | T009, T015, T110, T150 | ⏱ hot path (T150) |
| T351 | `client/client-rmq.ts` | 526 | T009, T015, T110, T335, T350 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T352 | `client/client-tcp.ts` | 237 | T009, T015, T110, T335 | ⚠T throw/try (Q3) |
| T353 | `client/client-proxy-factory.ts` | 79 | T009, T015, T110, T335, T336, T341, T344, T348, T349, T351, T352 |  |
| T354 | `container.ts` | 13 | T009, T015, T110, T335 |  |
| T355 | `exceptions/rpc-exception.ts`<br>`exceptions/base-rpc-exception-filter.ts`<br>`exceptions/rpc-exceptions-handler.ts` | 116 | T009, T015, T110 | ⚠T throw/try (Q3) |
| T356 | `context/exception-filters-context.ts` | 69 | T009, T015, T110, T355 |  |
| T357 | `ctx-host/base-rpc.context.ts` | 19 | T009, T015, T110 |  |
| T358 | `context/request-context-host.ts` | 32 | T009, T015, T110, T357 |  |
| T359 | `factories/rpc-params-factory.ts` | 22 | T009, T015, T110 |  |
| T360 | `context/rpc-proxy.ts` | 50 | T009, T015, T110, T355 | ⚠T throw/try (Q3) |
| T361 | `context/rpc-context-creator.ts` | 307 | T009, T015, T110, T356, T359, T360 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T362 | `ctx-host/kafka.context.ts`<br>`ctx-host/mqtt.context.ts`<br>`ctx-host/nats.context.ts`<br>`ctx-host/redis.context.ts`<br>`ctx-host/rmq.context.ts` | 153 | T009, T015, T110, T339, T357 |  |
| T363 | `ctx-host/tcp.context.ts` | 30 | T009, T015, T110, T357 |  |
| T364 | `decorators/client.decorator.ts` | 25 | T009, T015, T110 |  |
| T365 | `utils/param.utils.ts` | 85 | T009, T015, T110 |  |
| T366 | `decorators/event-pattern.decorator.ts` | 94 | T009, T015, T110 |  |
| T367 | `errors/invalid-grpc-message-decorator.exception.ts` | 16 | T009, T015, T110 | low coverage: invalid-grpc-message-decorator.exception.ts 0% |
| T368 | `decorators/message-pattern.decorator.ts` | 219 | T009, T015, T110, T367 | ⚠T throw/try (Q3) |
| T369 | `decorators/payload.decorator.ts` | 102 | T009, T015, T110, T365 |  |
| T370 | `deserializers/identity.deserializer.ts`<br>`deserializers/incoming-request.deserializer.ts`<br>`deserializers/kafka-request.deserializer.ts`<br>`deserializers/nats-request-json.deserializer.ts` | 103 | T009, T015, T110, T150, T340 | ⏱ hot path (T150) |
| T371 | `errors/corrupted-packet-length.exception.ts`<br>`errors/incomplete-message-timeout.exception.ts`<br>`errors/invalid-grpc-package-definition-missing-package-definition.exception.ts`<br>`errors/invalid-grpc-package-definition-mutex.exception.ts`<br>`errors/invalid-json-format.exception.ts` | 42 | T009, T015, T110 |  |
| T372 | `errors/invalid-tcp-data-reception.exception.ts`<br>`errors/max-packet-length-exceeded.exception.ts`<br>`errors/max-send-buffer-size-exceeded.exception.ts`<br>`errors/net-socket-closed.exception.ts` | 44 | T009, T015, T110 | low coverage: invalid-tcp-data-reception.exception.ts 0%, net-socket-closed.exception.ts 0% |
| T373 | `exceptions/grpc-exception.ts`<br>`exceptions/grpc-exception-filter.ts`<br>`exceptions/kafka-retriable-exception.ts` | 179 | T009, T015, T110, T355 | low coverage: grpc-exception.ts 25%, kafka-retriable-exception.ts 0% |
| T374 | `helpers/grpc-helpers.ts`<br>`helpers/tcp-socket.ts` | 94 | T009, T015, T110, T371, T372 | ⚠T throw/try (Q3) |
| T375 | `helpers/json-socket.ts`<br>`helpers/kafka-logger.ts`<br>`helpers/kafka-parser.ts` | 297 | T009, T015, T110, T339, T371, T372, T374 | ⚠T throw/try (Q3) |
| T376 | `helpers/kafka-reply-partition-assigner.ts` | 174 | T009, T015, T110, T339, T341 |  |
| T377 | `listener-metadata-explorer.ts` | 98 | T009, T015, T110 |  |
| T378 | `server/server.ts` | 416 | T009, T015, T110, T334, T357, T370 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T379 | `listeners-controller.ts` | 337 | T009, T015, T110, T353, T354, T356, T357, T358, T361, T377, T378 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T380 | `microservices-module.ts` | 120 | T009, T015, T110, T354, T356, T360, T361, T378, T379 | ⚠T throw/try (Q3) |
| T381 | `server/server-grpc.ts` | 789 | T009, T015, T110, T331, T378 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T382 | `server/server-kafka.ts` | 428 | T009, T015, T110, T339, T340, T370, T378 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T383 | `server/server-mqtt.ts` | 320 | T009, T015, T110, T342, T343, T362, T378 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T384 | `server/server-nats.ts` | 254 | T009, T015, T110, T347, T362, T370, T378 | ⚠T throw/try (Q3) |
| T385 | `server/server-redis.ts` | 268 | T009, T015, T110, T378 | ⚠T throw/try (Q3) |
| T386 | `server/server-rmq.ts` | 456 | T009, T015, T110, T350, T378 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T387 | `server/server-tcp.ts` | 260 | T009, T015, T110, T363, T372, T378 | ⚠T throw/try (Q3) |
| T388 | `server/server-factory.ts` | 42 | T009, T015, T110, T381, T382, T383, T384, T385, T386, T387 |  |
| T389 | `nest-microservice.ts` | 391 | T009, T015, T019, T110, T378, T380, T388 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3); low coverage: nest-microservice.ts 58% |
| T390 | `module/clients.module.ts` | 108 | T009, T015, T110 |  |
| T391 | `record-builders/nats.record-builder.ts`<br>`record-builders/rmq.record-builder.ts` | 74 | T009, T015, T110 |  |
| T392 | `utils/transform-pattern.utils.ts` | 53 | T009, T015, T110 |  |

#### websockets

| ID | Files (package source) | LOC | Depends on | Flags |
| --- | --- | ---: | --- | --- |
| T393 | `adapters/ws-adapter.ts` | 52 | T009, T015, T020, T110 | low coverage: ws-adapter.ts 42% |
| T394 | `errors/ws-exception.ts` | 24 | T009, T015, T110 |  |
| T395 | `exceptions/base-ws-exception-filter.ts`<br>`exceptions/ws-exceptions-handler.ts` | 175 | T009, T015, T110, T394 | ⚠T throw/try (Q3) |
| T396 | `context/exception-filters-context.ts` | 43 | T009, T015, T110, T395 |  |
| T397 | `factories/ws-params-factory.ts` | 24 | T009, T015, T110 |  |
| T398 | `context/ws-proxy.ts` | 37 | T009, T015, T110, T395 | ⚠T throw/try (Q3) |
| T399 | `context/ws-context-creator.ts` | 277 | T009, T015, T110, T394, T396, T397, T398 | ⚠T throw/try (Q3) |
| T400 | `utils/param.utils.ts` | 85 | T009, T015, T110 |  |
| T401 | `decorators/ack.decorator.ts`<br>`decorators/gateway-server.decorator.ts`<br>`decorators/message-body.decorator.ts`<br>`decorators/socket-gateway.decorator.ts`<br>`decorators/subscribe-message.decorator.ts` | 192 | T009, T015, T110, T400 |  |
| T402 | `errors/invalid-socket-port.exception.ts` | 6 | T009, T015, T110 |  |
| T403 | `factories/server-and-event-streams-factory.ts` | 16 | T009, T015, T110 |  |
| T404 | `gateway-metadata-explorer.ts`<br>`sockets-container.ts`<br>`socket-server-provider.ts` | 209 | T009, T015, T110, T403 |  |
| T405 | `utils/compare-element.util.ts` | 7 | T009, T015, T110 |  |
| T406 | `web-sockets-controller.ts` | 567 | T009, T015, T110, T396, T399, T402, T404, T405 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T407 | `socket-module.ts` | 174 | T009, T015, T020, T110, T396, T398, T399, T404, T406 | low coverage: socket-module.ts 35% |

#### platform-express

| ID | Files (package source) | LOC | Depends on | Flags |
| --- | --- | ---: | --- | --- |
| T408 | `adapters/utils/get-body-parser-options.util.ts`<br>`adapters/utils/get-media-type-version.util.ts` | 61 | T009, T015, T110 |  |
| T409 | `adapters/express-adapter.ts` | 560 | T009, T015, T017, T110, T408 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3); low coverage: express-adapter.ts 33% |
| T410 | `multer/multer.module.ts` | 73 | T009, T015, T110 |  |
| T411 | `multer/multer/multer.utils.ts` | 73 | T009, T015, T110 |  |
| T412 | `multer/interceptors/any-files.interceptor.ts`<br>`multer/interceptors/file-fields.interceptor.ts`<br>`multer/interceptors/file.interceptor.ts`<br>`multer/interceptors/files.interceptor.ts` | 247 | T009, T015, T110, T411 |  |
| T413 | `multer/interceptors/no-files.interceptor.ts` | 56 | T009, T015, T110, T411 |  |

#### platform-fastify

| ID | Files (package source) | LOC | Depends on | Flags |
| --- | --- | ---: | --- | --- |
| T414 | `adapters/utils/get-media-type-version.util.ts` | 29 | T009, T015, T110 |  |
| T415 | `adapters/fastify-adapter.ts` | 1145 | T009, T015, T018, T110, T414 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3); low coverage: fastify-adapter.ts 59% |
| T416 | `multipart/multipart.module.ts` | 80 | T009, T015, T110 |  |
| T417 | `multipart/storage/disk.storage.ts`<br>`multipart/storage/memory.storage.ts` | 120 | T009, T015, T110 | ⚠T throw/try (Q3) |
| T418 | `multipart/multipart/append-field.util.ts`<br>`multipart/multipart/multipart.error.ts`<br>`multipart/multipart/multipart.utils.ts` | 248 | T009, T015, T110 |  |
| T419 | `multipart/multipart/multipart.parser.ts` | 493 | T009, T015, T110, T417, T418 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |
| T420 | `multipart/multipart/multipart-interceptor.factory.ts` | 184 | T009, T015, T110, T415, T418, T419 | ⚠T throw/try (Q3) |
| T421 | `multipart/interceptors/any-files.interceptor.ts`<br>`multipart/interceptors/file-fields.interceptor.ts`<br>`multipart/interceptors/file-stream.interceptor.ts`<br>`multipart/interceptors/file.interceptor.ts`<br>`multipart/interceptors/files.interceptor.ts` | 129 | T009, T015, T110, T420 |  |
| T422 | `multipart/interceptors/no-files.interceptor.ts` | 20 | T009, T015, T110, T420 |  |

#### platform-socket.io

| ID | Files (package source) | LOC | Depends on | Flags |
| --- | --- | ---: | --- | --- |
| T423 | `adapters/io-adapter.ts` | 119 | T009, T015, T110 | ⚠T throw/try (Q3) |

#### platform-ws

| ID | Files (package source) | LOC | Depends on | Flags |
| --- | --- | ---: | --- | --- |
| T424 | `adapters/ws-adapter.ts` | 308 | T009, T015, T110 | ✂ >300 LOC: split when detailing; ⚠T throw/try (Q3) |

#### testing

| ID | Files (package source) | LOC | Depends on | Flags |
| --- | --- | ---: | --- | --- |
| T425 | `services/capturing-logger.service.ts`<br>`services/testing-logger.service.ts` | 292 | T009, T015, T110 | ⚠T throw/try (Q3) |
| T426 | `testing-injector.ts`<br>`testing-instance-loader.ts`<br>`testing-module.ts` | 267 | T009, T015, T110, T281 | ⚠T throw/try (Q3) |
| T427 | `testing-module.builder.ts`<br>`test.ts` | 204 | T009, T015, T110, T425, T426 | ↻ import cycle (C-11 hoisting) |

## Phase 5: Sweeps (per package; split per folder when detailed)

| IDs | Rules | Per package (common, core, microservices, websockets, platform-express, platform-fastify, platform-socket.io, platform-ws, testing) | Depends on |
| --- | --- | --- | --- |
| T600–T608 | R-117 type-only imports and type re-exports (C-12). Package-source hits: 837 audit + TS1205 re-exports | one task per package, in package order | T439 |
| T610–T618 | R-150, R-161, R-162, R-163 import order, blank lines, extensions (C-13). 190 + 255 hits in package source | one task per package | T600–T608 |
| T620–T628 | R-100 (non-public names), R-102 one-letter names, R-103 glossary synonyms (C-21). 96 R-102 hits in package source | one task per package | T439, T002 |
| T630–T638 | R-038 magic numbers (approximate list, each judged), R-039 freezing (C-22, C-23) | one task per package | T439 |
| T640–T648 | R-110, R-112, R-113, R-114, R-115, R-053 type rules (C-17, C-18, C-19); exported signatures need Q1 | one task per package | T439 |
| T680–T688 | R-164 comments (C-20). 2 294 hits in package source. **Q4** | one task per package | T439, Q4 |
| T700+ | §12 spec rules R-170–R-179 for the 305 existing specs (2 257 R-171, 2 893 R-173, 304 R-170, 213 R-172). **Q6** | one task per spec folder | T109, Q6 |
| T699 | Checkpoint 5 | — | all of the above |

## Phase 6: Tightening

| ID | Title | Depends on |
| --- | --- | --- |
| T900 | Raise every rule in `eslint.config.mjs` from `warn` to `error`; `npx eslint packages` must report 0 problems outside documented exclusions | T699 |
| T901 | Turn on `verbatimModuleSyntax` in `packages/tsconfig.build.json` and the root `tsconfig.json`; `npm run build` and the spec typecheck must report no TS1484/TS1205 | T900 |
| T902 | Remove `iterare` from `packages/{common,core,microservices,websockets}/package.json` and the root `package.json` (D-23); `grep -rl "from 'iterare'" packages` prints nothing | T900, Q2 |
| T903 | Final audit: `node refactor-plan/tools/audit.mjs --files packages` reports 0 for every rule except documented exclusions; full suite and CI green | T901, T902 |
| T904 | Move `refactor-plan/tools/*.mjs` to `tools/style/` and add `package.json` scripts, if the human wants to keep them (Q5) | T903 |

Tasks T950+ for `integration/`, `sample/` and `tools/` exist only if Q5 puts
them in scope.

## Coverage check

### Every rule has an enforcer

| Rules | Enforced by |
| --- | --- |
| R-001–R-004, R-118, R-160, R-181, R-190–R-192, R-196, R-197 | the plan itself: CONTEXT (commands), D-01–D-05 (blanks), T001 (lint as warnings), T900 (errors), every task's acceptance criteria |
| R-010–R-021, R-040, R-043–R-050, R-060–R-076, R-080–R-087, R-090–R-096, R-116, R-120–R-149 | Rewrite T200–T427 (designs follow C-00); T006–T009 install the tools; R-149 also T902 |
| R-041, R-042, R-111, and R-100 for public names | Rewrite/Structure under Q1 option B, or a recorded exception under option A |
| R-030–R-037 | Structure T100–T109 (Q1); R-033 also T010–T014, T030–T038 |
| R-038, R-039 | Sweeps T630–T638 |
| R-100 (non-public), R-101–R-104 | Sweeps T620–T628; T002 (glossary), T003 (index), every Rewrite task (index update) |
| R-110, R-112–R-115, R-053 | Sweeps T640–T648 |
| R-117 | Sweeps T600–T608; T901 (`verbatimModuleSyntax`) |
| R-150, R-161–R-163 | Sweeps T610–T618 |
| R-164 | Sweeps T680–T688 (Q4) |
| R-170–R-180 | every new spec (C-16: T007, T008, T010–T014, T016–T021, T030–T038); existing specs T700 (Q6) |
| R-195 | T150 (measurement) and D-10 |

### Every file is accounted for

- **664 package source files:** 372 are in Rewrite rows; all 664 are in the
  per-package Structure (T100–T108) and Sweep (T600–T688) tasks. 21 already
  conform (AUDIT §1).
- **305 package specs and 6 test-support files:** T109 (move beside sources)
  and T700 (rewrite to §12), both conditional on Q6.
- **New specs:** T007, T008, T010–T014, T016–T021, T030–T038 (written to §12).
- **`integration/` (578), `sample/` (398), `tools/` (15):** excluded pending
  **Q5**. ESLint reports on `integration/` and `tools/` as warnings (T001).
