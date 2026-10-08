# Progress

Every task, in execution order. Statuses: `todo`, `in-progress`, `done`,
`blocked`, `needs-detailing`. Executors take the first `todo` task (in their
lane, if they have one) whose dependencies are all `done`. Executors never
work on `needs-detailing` tasks: an architect must detail them first (or, for
T006–T009, set them to `todo` once Q2 is answered). This file is the only plan
file executors edit.

| ID | Title | Phase | Depends on | Lane | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| T001 | Add ESLint with the guide rules as warnings | 1 Foundations | — | A | todo |  |
| T002 | Create the domain glossary | 1 Foundations | — | B | todo |  |
| T003 | Create the function-name index | 1 Foundations | — | C | todo |  |
| T004 | Exclude nested spec files from the package builds | 1 Foundations | — | D | todo |  |
| T005 | Checkpoint 1A | 1 Foundations | T001, T002, T003, T004 | — | todo |  |
| T010 | Characterise ContextIdFactory | 2 Safety net | T005 | A | todo |  |
| T011 | Characterise the gRPC exceptions | 2 Safety net | T005 | B | todo |  |
| T012 | Characterise core's runtime exceptions | 2 Safety net | T005 | C | todo |  |
| T013 | Characterise the microservices transport errors | 2 Safety net | T005 | D | todo |  |
| T014 | Characterise KafkaRetriableException and SerializeOptions | 2 Safety net | T005 | E | todo |  |
| T015 | Checkpoint 2A | 2 Safety net | T010, T011, T012, T013, T014 | — | todo |  |
| T006 | Add lodash-es, ts-pattern, ramda and their types | 1 Foundations | T005 | A | needs-detailing | written in full; awaits Q2, then the architect sets it to todo |
| T007 | Create the chain wrapper module | 1 Foundations | T006 | A | needs-detailing | written in full; awaits Q2, then the architect sets it to todo |
| T008 | Create the shared tapEffect and getErrorMessage helpers | 1 Foundations | T007 | A | needs-detailing | written in full; awaits Q2, then the architect sets it to todo |
| T009 | Checkpoint 1B | 1 Foundations | T008, T015 | — | needs-detailing | written in full; awaits Q2, then the architect sets it to todo |
| T016 | Characterise AbstractHttpAdapter and the REPL | 2 Safety net | T015 | A | needs-detailing | awaits Q1 |
| T017 | Characterise ExpressAdapter | 2 Safety net | T015 | B | needs-detailing | awaits Q1 |
| T018 | Characterise FastifyAdapter | 2 Safety net | T015 | C | needs-detailing | awaits Q1 |
| T019 | Characterise NestFactory and NestMicroservice | 2 Safety net | T015 | D | needs-detailing | awaits Q1 |
| T020 | Characterise SocketModule and WsAdapter | 2 Safety net | T015 | E | needs-detailing | awaits Q1 |
| T021 | Characterise MiddlewareModule | 2 Safety net | T015 | F | needs-detailing | awaits Q1 |
| T029 | Checkpoint 2B (with a green CI integration run) | 2 Safety net | T016, T017, T018, T019, T020, T021 | — | needs-detailing | awaits Q1 |
| T030 | Write specs for common files with no spec (32 files) | 2 Safety net | T015 | A | needs-detailing | awaits Q1; list in baseline/files-without-spec.txt |
| T031 | Write specs for core files with no spec (44 files) | 2 Safety net | T015 | B | needs-detailing | awaits Q1; list in baseline/files-without-spec.txt |
| T032 | Write specs for microservices files with no spec (25 files) | 2 Safety net | T015 | C | needs-detailing | awaits Q1; list in baseline/files-without-spec.txt |
| T033 | Write specs for websockets files with no spec (11 files) | 2 Safety net | T015 | D | needs-detailing | awaits Q1; list in baseline/files-without-spec.txt |
| T034 | Write specs for platform-express files with no spec (1 files) | 2 Safety net | T015 | E | needs-detailing | awaits Q1; list in baseline/files-without-spec.txt |
| T035 | Write specs for platform-fastify files with no spec (5 files) | 2 Safety net | T015 | F | needs-detailing | awaits Q1; list in baseline/files-without-spec.txt |
| T036 | Write specs for platform-socket.io files with no spec (1 files) | 2 Safety net | T015 | G | needs-detailing | awaits Q1; list in baseline/files-without-spec.txt |
| T037 | Write specs for platform-ws files with no spec (1 files) | 2 Safety net | T015 | H | needs-detailing | awaits Q1; list in baseline/files-without-spec.txt |
| T038 | Write specs for testing files with no spec (3 files) | 2 Safety net | T015 | I | needs-detailing | awaits Q1; list in baseline/files-without-spec.txt |
| T039 | Checkpoint 2C | 2 Safety net | T030–T038 | — | needs-detailing |  |
| T100 | Structure common | 3 Structure | T009, T029, T039 | — | needs-detailing | awaits Q1; split into moves of ≤5 files when detailed |
| T101 | Structure core | 3 Structure | T100 | — | needs-detailing | awaits Q1; split into moves of ≤5 files when detailed |
| T102 | Structure microservices | 3 Structure | T101 | — | needs-detailing | awaits Q1; split into moves of ≤5 files when detailed |
| T103 | Structure websockets | 3 Structure | T101 | — | needs-detailing | awaits Q1; split into moves of ≤5 files when detailed |
| T104 | Structure platform-express | 3 Structure | T101 | — | needs-detailing | awaits Q1; split into moves of ≤5 files when detailed |
| T105 | Structure platform-fastify | 3 Structure | T101 | — | needs-detailing | awaits Q1; split into moves of ≤5 files when detailed |
| T106 | Structure platform-socket.io | 3 Structure | T103 | — | needs-detailing | awaits Q1; split into moves of ≤5 files when detailed |
| T107 | Structure platform-ws | 3 Structure | T103 | — | needs-detailing | awaits Q1; split into moves of ≤5 files when detailed |
| T108 | Structure testing | 3 Structure | T101 | — | needs-detailing | awaits Q1; split into moves of ≤5 files when detailed |
| T109 | Move the existing specs beside their sources | 3 Structure | T100–T108 | — | needs-detailing | awaits Q1, Q6 |
| T110 | Checkpoint 3 | 3 Structure | T100–T109 | — | needs-detailing | awaits Q1 |
| T150 | Benchmark the request path and microservice (de)serialisation | 4 Rewrite | T009 | — | needs-detailing | gates every ⏱ row in ROADMAP (D-10) |
| T200 | Rewrite common: apply-decorators, bind.decorator, catch.decorator | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T201 | Rewrite common: shared.utils | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T202 | Rewrite common: controller.decorator, dependencies.decorator | 4 Rewrite | T009, T015, T110, T201 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T203 | Rewrite common: extend-metadata.util, validate-each.util | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T204 | Rewrite common: exception-filters.decorator, inject.decorator, injectable.decorator, optional.decorator, set-m | 4 Rewrite | T009, T015, T110, T201, T203 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T205 | Rewrite common: use-guards.decorator, use-interceptors.decorator, use-pipes.decorator, version.decorator | 4 Rewrite | T009, T015, T110, T201, T203 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T206 | Rewrite common: parameter-decorator-options.util | 4 Rewrite | T009, T015, T110, T201 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T207 | Rewrite common: route-params.decorator | 4 Rewrite | T009, T015, T110, T201, T206 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T208 | Rewrite common: assign-custom-metadata.util | 4 Rewrite | T009, T015, T110, T207 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T209 | Rewrite common: create-route-param-metadata.decorator, header.decorator, http-code.decorator | 4 Rewrite | T009, T015, T110, T201, T203, T206, T207, T208 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T210 | Rewrite common: request-mapping.decorator, render.decorator, redirect.decorator, sse.decorator | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T211 | Rewrite common: sse-signal.decorator | 4 Rewrite | T009, T015, T110, T209 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T212 | Rewrite common: global.decorator | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T213 | Rewrite common: validate-module-keys.util | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T214 | Rewrite common: module.decorator | 4 Rewrite | T009, T015, T110, T213 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T215 | Rewrite common: http.exception, bad-gateway.exception, bad-request.exception | 4 Rewrite | T009, T015, T110, T201 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T216 | Rewrite common: conflict.exception, forbidden.exception, gateway-timeout.exception, gone.exception, http-versi | 4 Rewrite | T009, T015, T110, T215 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T217 | Rewrite common: im-a-teapot.exception, internal-server-error.exception, method-not-allowed.exception, misdirec | 4 Rewrite | T009, T015, T110, T215 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T218 | Rewrite common: not-found.exception, not-implemented.exception, payload-too-large.exception, precondition-fail | 4 Rewrite | T009, T015, T110, T215 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T219 | Rewrite common: service-unavailable.exception, unauthorized.exception, unprocessable-entity.exception, unsuppo | 4 Rewrite | T009, T015, T110, T215 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T220 | Rewrite common: streamable-file | 4 Rewrite | T009, T015, T110, T201 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T221 | Rewrite common: cli-colors.util | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T222 | Rewrite common: is-log-level.util, filter-log-levels.util, get-env-log-levels.util, redact.util | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T223 | Rewrite common: console-logger.service | 4 Rewrite | T009, T015, T110, T201, T221, T222 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T224 | Rewrite common: logger.service | 4 Rewrite | T009, T015, T110, T201, T223 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T225 | Rewrite common: is-log-level-enabled.util | 4 Rewrite | T009, T015, T110, T224 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T226 | Rewrite common: load-package.util, random-string-generator.util, select-exception-filter-metadata.util | 4 Rewrite | T009, T015, T110, T224 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T227 | Rewrite common: configurable-module.builder | 4 Rewrite | T009, T015, T110, T224, T226 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T228 | Rewrite common: generate-options-injection-token.util, get-injection-providers.util | 4 Rewrite | T009, T015, T110, T201, T226 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T229 | Rewrite common: default-value.pipe | 4 Rewrite | T009, T015, T110, T201, T204 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T230 | Rewrite common: file-validator.interface, file-type.validator, max-file-size.validator | 4 Rewrite | T009, T015, T110, T224 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T231 | Rewrite common: parse-file.pipe, parse-file-pipe.builder | 4 Rewrite | T009, T015, T110, T201, T230 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T232 | Rewrite common: strip-proto-keys.util | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T233 | Rewrite common: validation.pipe | 4 Rewrite | T009, T015, T110, T201, T215, T226, T232 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T234 | Rewrite common: parse-array.pipe, parse-bool.pipe | 4 Rewrite | T009, T015, T110, T201, T204, T233 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T235 | Rewrite common: parse-date.pipe, parse-enum.pipe, parse-float.pipe | 4 Rewrite | T009, T015, T110, T201, T204 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T236 | Rewrite common: parse-int.pipe, parse-uuid.pipe | 4 Rewrite | T009, T015, T110, T201, T204 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T237 | Rewrite common: standard-schema-validation.pipe | 4 Rewrite | T009, T015, T110, T201, T204, T232 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T238 | Rewrite common: class-serializer.interceptor, standard-schema-serializer.interceptor | 4 Rewrite | T009, T015, T110, T201, T226 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T239 | Rewrite common: merge-with-values.util | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T430 | Checkpoint 4: common rewritten | 4 Rewrite | T200–T239 | — | needs-detailing |  |
| T240 | Rewrite core: serialize-cookie | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T241 | Rewrite core: http-adapter | 4 Rewrite | T009, T015, T016, T110, T240 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T242 | Rewrite core: get-class-scope, is-durable | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T243 | Rewrite core: deterministic-uuid-registry, uuid-factory | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T244 | Rewrite core: is-debug-mode.util, provider-classifier | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T245 | Rewrite core: runtime.exception | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T246 | Rewrite core: barrier, safe-instance-decorator | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T247 | Rewrite core: settlement-signal | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T248 | Rewrite core: initialize-on-preview.allowlist | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T249 | Rewrite core: http-adapter-host | 4 Rewrite | T009, T015, T110, T241 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T250 | Rewrite core: base-exception-filter | 4 Rewrite | T009, T015, T110, T249 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T251 | Rewrite core: execution-context-host | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T252 | Rewrite core: external-exception-filter | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T253 | Rewrite core: context-utils | 4 Rewrite | T009, T015, T110, T251 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T254 | Rewrite core: sse-stream | 4 Rewrite | T009, T015, T110, T150 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T255 | Rewrite core: circular-dependency.exception | 4 Rewrite | T009, T015, T110, T245 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T256 | Rewrite core: compiler | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T257 | Rewrite core: messages | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T258 | Rewrite core: request-providers | 4 Rewrite | T009, T015, T110, T150 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T259 | Rewrite core: inquirer-providers | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T260 | Rewrite core: internal-core-module | 4 Rewrite | T009, T015, T110, T258, T259 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T261 | Rewrite core: tree-node | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T262 | Rewrite core: metadata-scanner | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T263 | Rewrite core: silent-logger | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T264 | Rewrite core: unknown-element.exception | 4 Rewrite | T009, T015, T110, T245 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T265 | Rewrite core: reflector.service | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T266 | Rewrite core: internal-providers-storage | 4 Rewrite | T009, T015, T110, T249 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T267 | Rewrite core: by-reference-module-opaque-key-factory, deep-hashed-module-opaque-key-factory | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T268 | Rewrite core: application-config | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T269 | Rewrite core: discoverable-meta-host-collection | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T270 | Rewrite core: invalid-class-module.exception, invalid-exception-filter.exception, invalid-module.exception, in | 4 Rewrite | T009, T015, T110, T245 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T271 | Rewrite core: undefined-module.exception, unknown-dependencies.exception | 4 Rewrite | T009, T015, T110, T245 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T272 | Rewrite core: messages | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T273 | Rewrite core: base-exception-filter-context, exceptions-handler, external-exception-filter-context, external-e | 4 Rewrite | T009, T015, T110, T250, T252, T268, T270 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T274 | Rewrite core: context-creator, context-id-factory | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T275 | Rewrite core: external-context-creator | 4 Rewrite | T009, T015, T110, T150, T253, T273 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T276 | Rewrite core: external-proxy, handler-metadata-storage | 4 Rewrite | T009, T015, T110, T251, T253, T254, T273 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T277 | Rewrite core: abstract-instance-resolver | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T278 | Rewrite core: container | 4 Rewrite | T009, T015, T110, T248, T256, T260, T266, T267, T268, T269 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T279 | Rewrite core: injector | 4 Rewrite | T009, T015, T110, T244, T245, T246, T247, T270, T271 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T280 | Rewrite core: instance-links-host, instance-loader | 4 Rewrite | T009, T015, T110, T257, T260, T264, T269, T278, T279 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T281 | Rewrite core: instance-wrapper | 4 Rewrite | T009, T015, T110, T242, T243, T244, T247 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T282 | Rewrite core: internal-core-module-factory | 4 Rewrite | T009, T015, T110, T248, T249, T256, T260, T275, T278, T279, T280 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T283 | Rewrite core: lazy-module-loader | 4 Rewrite | T009, T015, T110, T256, T263, T280 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T284 | Rewrite core: module-ref | 4 Rewrite | T009, T015, T110, T242, T277, T278, T279, T280, T281 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T285 | Rewrite core: module | 4 Rewrite | T009, T015, T110, T242, T243, T246, T268, T270, T274, T278, T281, T284 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T286 | Rewrite core: modules-container | 4 Rewrite | T009, T015, T110, T285 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T287 | Rewrite core: topology-tree | 4 Rewrite | T009, T015, T110, T261, T285 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T288 | Rewrite core: graph-inspector, partial-graph.host | 4 Rewrite | T009, T015, T110, T243, T271, T278, T281, T285 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T289 | Rewrite core: serialized-graph | 4 Rewrite | T009, T015, T110, T243, T249, T265, T268, T275, T283, T284, T286 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T290 | Rewrite core: router-proxy | 4 Rewrite | T009, T015, T110, T150, T251, T273 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T291 | Rewrite core: scanner | 4 Rewrite | T009, T015, T110, T242, T243, T255, T262, T268, T270, T271, T278, T281, T282, T285, T287, T288 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T292 | Rewrite core: discovery-service | 4 Rewrite | T009, T015, T110, T269, T281, T285, T286 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T293 | Rewrite core: exception-handler, exceptions-zone | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T294 | Rewrite core: invalid-class-scope.exception, invalid-class.exception, route-conflict.exception, unknown-export | 4 Rewrite | T009, T015, T110, T245, T272 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T295 | Rewrite core: undefined-forwardref.exception, invalid-middleware-configuration.exception, invalid-middleware.e | 4 Rewrite | T009, T015, T110, T245, T272 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T296 | Rewrite core: guards-consumer, guards-context-creator | 4 Rewrite | T009, T015, T110, T150, T251, T268, T274, T278, T281 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T297 | Rewrite core: cookie-signer, parse-cookie-header, request-cookies | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T298 | Rewrite core: load-adapter, optional-require, rethrow, router-method-factory | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T299 | Rewrite core: get-instances-grouped-by-hierarchy-level, get-sorted-hierarchy-levels | 4 Rewrite | T009, T015, T110, T281 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T300 | Rewrite core: before-app-shutdown.hook, on-app-bootstrap.hook, on-app-shutdown.hook, on-module-destroy.hook | 4 Rewrite | T009, T015, T110, T285, T299 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T301 | Rewrite core: on-module-init.hook | 4 Rewrite | T009, T015, T110, T285, T299 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T302 | Rewrite core: container | 4 Rewrite | T009, T015, T110, T242, T278, T281 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T303 | Rewrite core: router-exception-filters, route-path-factory | 4 Rewrite | T009, T015, T110, T150, T268, T273, T278, T281, T290 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T304 | Rewrite core: route-info-path-extractor | 4 Rewrite | T009, T015, T110, T268, T303 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T305 | Rewrite core: paths-explorer, router-module | 4 Rewrite | T009, T015, T110, T150, T262, T285, T286, T290 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T306 | Rewrite core: routes-mapper | 4 Rewrite | T009, T015, T110, T262, T268, T278, T285, T305 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T307 | Rewrite core: legacy-route-converter | 4 Rewrite | T009, T015, T110, T150 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T308 | Rewrite core: utils, builder, resolver | 4 Rewrite | T009, T015, T110, T279, T281, T285, T302, T304, T306, T307 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T309 | Rewrite core: middleware-module | 4 Rewrite | T009, T015, T021, T110, T245, T251, T268, T274, T278, T279, T281, T285, T288, T290, T295, T302, T303, T304, T306, T308 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T310 | Rewrite core: nest-application-context | 4 Rewrite | T009, T015, T110, T256, T274, T277, T278, T279, T280, T281, T285 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T311 | Rewrite core: route-params-factory | 4 Rewrite | T009, T015, T110, T150, T268, T297 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T312 | Rewrite core: interceptors-consumer, interceptors-context-creator | 4 Rewrite | T009, T015, T110, T150, T251, T268, T274, T278, T281 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T313 | Rewrite core: params-token-factory, pipes-consumer, pipes-context-creator | 4 Rewrite | T009, T015, T110, T150, T268, T274, T278, T281 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T314 | Rewrite core: router-response-controller | 4 Rewrite | T009, T015, T110, T150, T254 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T315 | Rewrite core: router-execution-context | 4 Rewrite | T009, T015, T110, T150, T251, T253, T254, T276, T312, T313, T314 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T316 | Rewrite core: router-explorer | 4 Rewrite | T009, T015, T110, T150, T251, T257, T262, T268, T274, T278, T279, T281, T285, T288, T290, T295, T298, T303, T305, T311, T315 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T317 | Rewrite core: routes-resolver | 4 Rewrite | T009, T015, T110, T150, T257, T262, T268, T278, T279, T281, T288, T290, T303, T316 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T318 | Rewrite core: route-conflict-detector | 4 Rewrite | T009, T015, T110, T150, T272, T294 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T319 | Rewrite core: route-specificity-sorter | 4 Rewrite | T009, T015, T110, T150, T318 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T320 | Rewrite core: cross-origin-protection | 4 Rewrite | T009, T015, T110, T304, T307 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T321 | Rewrite core: http-security-hook | 4 Rewrite | T009, T015, T110, T268, T304, T320 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T322 | Rewrite core: security-headers | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T323 | Rewrite core: nest-application | 4 Rewrite | T009, T015, T110, T246, T268, T278, T279, T288, T297, T298, T302, T308, T309, T310, T317, T318, T319, T320, T321, T322 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T324 | Rewrite core: noop-graph-inspector | 4 Rewrite | T009, T015, T110, T288 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T325 | Rewrite core: nest-factory | 4 Rewrite | T009, T015, T019, T110, T241, T243, T262, T268, T278, T279, T280, T288, T291, T293, T298, T310, T323, T324 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T326 | Rewrite core: assign-to-object.util, repl-context, repl-function, repl-logger, repl-native-commands | 4 Rewrite | T009, T015, T016, T110, T260, T268, T285, T316, T317, T323 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T327 | Rewrite core: repl | 4 Rewrite | T009, T015, T016, T110, T325, T326 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T328 | Rewrite core: debug-repl-fn, get-repl-fn, help-repl-fn, resolve-repl-fn, select-relp-fn | 4 Rewrite | T009, T015, T110, T326 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T329 | Rewrite core: methods-repl-fn | 4 Rewrite | T009, T015, T110, T262, T326 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T330 | Rewrite core: exclude-route.util, flatten-route-paths.util | 4 Rewrite | T009, T015, T110, T150 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T431 | Checkpoint 4: core rewritten | 4 Rewrite | T240–T330 | — | needs-detailing |  |
| T331 | Rewrite microservices: invalid-grpc-package.exception, invalid-grpc-service.exception, invalid-proto-definitio | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T332 | Rewrite microservices: incoming-response.deserializer | 4 Rewrite | T009, T015, T110, T150 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T333 | Rewrite microservices: invalid-message.exception | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T334 | Rewrite microservices: identity.serializer | 4 Rewrite | T009, T015, T110, T150 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T335 | Rewrite microservices: client-proxy | 4 Rewrite | T009, T015, T110, T332, T333, T334 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T336 | Rewrite microservices: client-grpc | 4 Rewrite | T009, T015, T110, T331, T335 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T337 | Rewrite microservices: kafka-response.deserializer | 4 Rewrite | T009, T015, T110, T150 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T338 | Rewrite microservices: invalid-kafka-client-topic.exception | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T339 | Rewrite microservices: kafka.interface | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T340 | Rewrite microservices: kafka-request.serializer | 4 Rewrite | T009, T015, T110, T150 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T341 | Rewrite microservices: client-kafka | 4 Rewrite | T009, T015, T110, T333, T335, T337, T338, T339, T340 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T342 | Rewrite microservices: mqtt.record-builder | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T343 | Rewrite microservices: mqtt-record.serializer | 4 Rewrite | T009, T015, T110, T150 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T344 | Rewrite microservices: client-mqtt | 4 Rewrite | T009, T015, T110, T335, T342, T343 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T345 | Rewrite microservices: nats-response-json.deserializer | 4 Rewrite | T009, T015, T110, T150, T332 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T346 | Rewrite microservices: empty-response.exception | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T347 | Rewrite microservices: nats-record.serializer | 4 Rewrite | T009, T015, T110, T150 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T348 | Rewrite microservices: client-nats | 4 Rewrite | T009, T015, T110, T335, T345, T346, T347 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T349 | Rewrite microservices: client-redis | 4 Rewrite | T009, T015, T110, T335 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T350 | Rewrite microservices: rmq-record.serializer | 4 Rewrite | T009, T015, T110, T150 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T351 | Rewrite microservices: client-rmq | 4 Rewrite | T009, T015, T110, T335, T350 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T352 | Rewrite microservices: client-tcp | 4 Rewrite | T009, T015, T110, T335 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T353 | Rewrite microservices: client-proxy-factory | 4 Rewrite | T009, T015, T110, T335, T336, T341, T344, T348, T349, T351, T352 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T354 | Rewrite microservices: container | 4 Rewrite | T009, T015, T110, T335 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T355 | Rewrite microservices: rpc-exception, base-rpc-exception-filter, rpc-exceptions-handler | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T356 | Rewrite microservices: exception-filters-context | 4 Rewrite | T009, T015, T110, T355 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T357 | Rewrite microservices: base-rpc.context | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T358 | Rewrite microservices: request-context-host | 4 Rewrite | T009, T015, T110, T357 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T359 | Rewrite microservices: rpc-params-factory | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T360 | Rewrite microservices: rpc-proxy | 4 Rewrite | T009, T015, T110, T355 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T361 | Rewrite microservices: rpc-context-creator | 4 Rewrite | T009, T015, T110, T356, T359, T360 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T362 | Rewrite microservices: kafka.context, mqtt.context, nats.context, redis.context, rmq.context | 4 Rewrite | T009, T015, T110, T339, T357 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T363 | Rewrite microservices: tcp.context | 4 Rewrite | T009, T015, T110, T357 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T364 | Rewrite microservices: client.decorator | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T365 | Rewrite microservices: param.utils | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T366 | Rewrite microservices: event-pattern.decorator | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T367 | Rewrite microservices: invalid-grpc-message-decorator.exception | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T368 | Rewrite microservices: message-pattern.decorator | 4 Rewrite | T009, T015, T110, T367 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T369 | Rewrite microservices: payload.decorator | 4 Rewrite | T009, T015, T110, T365 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T370 | Rewrite microservices: identity.deserializer, incoming-request.deserializer, kafka-request.deserializer, nats- | 4 Rewrite | T009, T015, T110, T150, T340 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T371 | Rewrite microservices: corrupted-packet-length.exception, incomplete-message-timeout.exception, invalid-grpc-p | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T372 | Rewrite microservices: invalid-tcp-data-reception.exception, max-packet-length-exceeded.exception, max-send-bu | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T373 | Rewrite microservices: grpc-exception, grpc-exception-filter, kafka-retriable-exception | 4 Rewrite | T009, T015, T110, T355 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T374 | Rewrite microservices: grpc-helpers, tcp-socket | 4 Rewrite | T009, T015, T110, T371, T372 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T375 | Rewrite microservices: json-socket, kafka-logger, kafka-parser | 4 Rewrite | T009, T015, T110, T339, T371, T372, T374 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T376 | Rewrite microservices: kafka-reply-partition-assigner | 4 Rewrite | T009, T015, T110, T339, T341 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T377 | Rewrite microservices: listener-metadata-explorer | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T378 | Rewrite microservices: server | 4 Rewrite | T009, T015, T110, T334, T357, T370 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T379 | Rewrite microservices: listeners-controller | 4 Rewrite | T009, T015, T110, T353, T354, T356, T357, T358, T361, T377, T378 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T380 | Rewrite microservices: microservices-module | 4 Rewrite | T009, T015, T110, T354, T356, T360, T361, T378, T379 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T381 | Rewrite microservices: server-grpc | 4 Rewrite | T009, T015, T110, T331, T378 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T382 | Rewrite microservices: server-kafka | 4 Rewrite | T009, T015, T110, T339, T340, T370, T378 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T383 | Rewrite microservices: server-mqtt | 4 Rewrite | T009, T015, T110, T342, T343, T362, T378 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T384 | Rewrite microservices: server-nats | 4 Rewrite | T009, T015, T110, T347, T362, T370, T378 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T385 | Rewrite microservices: server-redis | 4 Rewrite | T009, T015, T110, T378 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T386 | Rewrite microservices: server-rmq | 4 Rewrite | T009, T015, T110, T350, T378 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T387 | Rewrite microservices: server-tcp | 4 Rewrite | T009, T015, T110, T363, T372, T378 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T388 | Rewrite microservices: server-factory | 4 Rewrite | T009, T015, T110, T381, T382, T383, T384, T385, T386, T387 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T389 | Rewrite microservices: nest-microservice | 4 Rewrite | T009, T015, T019, T110, T378, T380, T388 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T390 | Rewrite microservices: clients.module | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T391 | Rewrite microservices: nats.record-builder, rmq.record-builder | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T392 | Rewrite microservices: transform-pattern.utils | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T432 | Checkpoint 4: microservices rewritten | 4 Rewrite | T331–T392 | — | needs-detailing |  |
| T393 | Rewrite websockets: ws-adapter | 4 Rewrite | T009, T015, T020, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T394 | Rewrite websockets: ws-exception | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T395 | Rewrite websockets: base-ws-exception-filter, ws-exceptions-handler | 4 Rewrite | T009, T015, T110, T394 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T396 | Rewrite websockets: exception-filters-context | 4 Rewrite | T009, T015, T110, T395 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T397 | Rewrite websockets: ws-params-factory | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T398 | Rewrite websockets: ws-proxy | 4 Rewrite | T009, T015, T110, T395 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T399 | Rewrite websockets: ws-context-creator | 4 Rewrite | T009, T015, T110, T394, T396, T397, T398 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T400 | Rewrite websockets: param.utils | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T401 | Rewrite websockets: ack.decorator, gateway-server.decorator, message-body.decorator, socket-gateway.decorator, | 4 Rewrite | T009, T015, T110, T400 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T402 | Rewrite websockets: invalid-socket-port.exception | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T403 | Rewrite websockets: server-and-event-streams-factory | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T404 | Rewrite websockets: gateway-metadata-explorer, sockets-container, socket-server-provider | 4 Rewrite | T009, T015, T110, T403 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T405 | Rewrite websockets: compare-element.util | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T406 | Rewrite websockets: web-sockets-controller | 4 Rewrite | T009, T015, T110, T396, T399, T402, T404, T405 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T407 | Rewrite websockets: socket-module | 4 Rewrite | T009, T015, T020, T110, T396, T398, T399, T404, T406 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T433 | Checkpoint 4: websockets rewritten | 4 Rewrite | T393–T407 | — | needs-detailing |  |
| T408 | Rewrite platform-express: get-body-parser-options.util, get-media-type-version.util | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T409 | Rewrite platform-express: express-adapter | 4 Rewrite | T009, T015, T017, T110, T408 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T410 | Rewrite platform-express: multer.module | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T411 | Rewrite platform-express: multer.utils | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T412 | Rewrite platform-express: any-files.interceptor, file-fields.interceptor, file.interceptor, files.interceptor | 4 Rewrite | T009, T015, T110, T411 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T413 | Rewrite platform-express: no-files.interceptor | 4 Rewrite | T009, T015, T110, T411 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T434 | Checkpoint 4: platform-express rewritten | 4 Rewrite | T408–T413 | — | needs-detailing |  |
| T414 | Rewrite platform-fastify: get-media-type-version.util | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T415 | Rewrite platform-fastify: fastify-adapter | 4 Rewrite | T009, T015, T018, T110, T414 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T416 | Rewrite platform-fastify: multipart.module | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T417 | Rewrite platform-fastify: disk.storage, memory.storage | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T418 | Rewrite platform-fastify: append-field.util, multipart.error, multipart.utils | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T419 | Rewrite platform-fastify: multipart.parser | 4 Rewrite | T009, T015, T110, T417, T418 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T420 | Rewrite platform-fastify: multipart-interceptor.factory | 4 Rewrite | T009, T015, T110, T415, T418, T419 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T421 | Rewrite platform-fastify: any-files.interceptor, file-fields.interceptor, file-stream.interceptor, file.interc | 4 Rewrite | T009, T015, T110, T420 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T422 | Rewrite platform-fastify: no-files.interceptor | 4 Rewrite | T009, T015, T110, T420 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T435 | Checkpoint 4: platform-fastify rewritten | 4 Rewrite | T414–T422 | — | needs-detailing |  |
| T423 | Rewrite platform-socket.io: io-adapter | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T436 | Checkpoint 4: platform-socket.io rewritten | 4 Rewrite | T423–T423 | — | needs-detailing |  |
| T424 | Rewrite platform-ws: ws-adapter | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T437 | Checkpoint 4: platform-ws rewritten | 4 Rewrite | T424–T424 | — | needs-detailing |  |
| T425 | Rewrite testing: capturing-logger.service, testing-logger.service | 4 Rewrite | T009, T015, T110 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T426 | Rewrite testing: testing-injector, testing-instance-loader, testing-module | 4 Rewrite | T009, T015, T110, T281 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T427 | Rewrite testing: testing-module.builder, test | 4 Rewrite | T009, T015, T110, T425, T426 | — | needs-detailing | awaits Q1, Q2, Q3; file set in ROADMAP |
| T438 | Checkpoint 4: testing rewritten | 4 Rewrite | T425–T427 | — | needs-detailing |  |
| T439 | Checkpoint 4: Rewrite phase complete | 4 Rewrite | T430–T438 | — | needs-detailing |  |
| T600 | Type-only imports and re-exports (R-117) in common | 5 Sweeps | T439 | — | needs-detailing |  |
| T601 | Type-only imports and re-exports (R-117) in core | 5 Sweeps | T439 | — | needs-detailing |  |
| T602 | Type-only imports and re-exports (R-117) in microservices | 5 Sweeps | T439 | — | needs-detailing |  |
| T603 | Type-only imports and re-exports (R-117) in websockets | 5 Sweeps | T439 | — | needs-detailing |  |
| T604 | Type-only imports and re-exports (R-117) in platform-express | 5 Sweeps | T439 | — | needs-detailing |  |
| T605 | Type-only imports and re-exports (R-117) in platform-fastify | 5 Sweeps | T439 | — | needs-detailing |  |
| T606 | Type-only imports and re-exports (R-117) in platform-socket.io | 5 Sweeps | T439 | — | needs-detailing |  |
| T607 | Type-only imports and re-exports (R-117) in platform-ws | 5 Sweeps | T439 | — | needs-detailing |  |
| T608 | Type-only imports and re-exports (R-117) in testing | 5 Sweeps | T439 | — | needs-detailing |  |
| T610 | Import order, blank lines, extensions (R-150, R-161–R-163) in common | 5 Sweeps | T600 | — | needs-detailing |  |
| T611 | Import order, blank lines, extensions (R-150, R-161–R-163) in core | 5 Sweeps | T601 | — | needs-detailing |  |
| T612 | Import order, blank lines, extensions (R-150, R-161–R-163) in microservices | 5 Sweeps | T602 | — | needs-detailing |  |
| T613 | Import order, blank lines, extensions (R-150, R-161–R-163) in websockets | 5 Sweeps | T603 | — | needs-detailing |  |
| T614 | Import order, blank lines, extensions (R-150, R-161–R-163) in platform-express | 5 Sweeps | T604 | — | needs-detailing |  |
| T615 | Import order, blank lines, extensions (R-150, R-161–R-163) in platform-fastify | 5 Sweeps | T605 | — | needs-detailing |  |
| T616 | Import order, blank lines, extensions (R-150, R-161–R-163) in platform-socket.io | 5 Sweeps | T606 | — | needs-detailing |  |
| T617 | Import order, blank lines, extensions (R-150, R-161–R-163) in platform-ws | 5 Sweeps | T607 | — | needs-detailing |  |
| T618 | Import order, blank lines, extensions (R-150, R-161–R-163) in testing | 5 Sweeps | T608 | — | needs-detailing |  |
| T620 | Names: non-public R-100, R-102, glossary R-103 in common | 5 Sweeps | T439, T002 | — | needs-detailing |  |
| T621 | Names: non-public R-100, R-102, glossary R-103 in core | 5 Sweeps | T439, T002 | — | needs-detailing |  |
| T622 | Names: non-public R-100, R-102, glossary R-103 in microservices | 5 Sweeps | T439, T002 | — | needs-detailing |  |
| T623 | Names: non-public R-100, R-102, glossary R-103 in websockets | 5 Sweeps | T439, T002 | — | needs-detailing |  |
| T624 | Names: non-public R-100, R-102, glossary R-103 in platform-express | 5 Sweeps | T439, T002 | — | needs-detailing |  |
| T625 | Names: non-public R-100, R-102, glossary R-103 in platform-fastify | 5 Sweeps | T439, T002 | — | needs-detailing |  |
| T626 | Names: non-public R-100, R-102, glossary R-103 in platform-socket.io | 5 Sweeps | T439, T002 | — | needs-detailing |  |
| T627 | Names: non-public R-100, R-102, glossary R-103 in platform-ws | 5 Sweeps | T439, T002 | — | needs-detailing |  |
| T628 | Names: non-public R-100, R-102, glossary R-103 in testing | 5 Sweeps | T439, T002 | — | needs-detailing |  |
| T630 | Numbers and frozen exports (R-038, R-039) in common | 5 Sweeps | T439 | — | needs-detailing |  |
| T631 | Numbers and frozen exports (R-038, R-039) in core | 5 Sweeps | T439 | — | needs-detailing |  |
| T632 | Numbers and frozen exports (R-038, R-039) in microservices | 5 Sweeps | T439 | — | needs-detailing |  |
| T633 | Numbers and frozen exports (R-038, R-039) in websockets | 5 Sweeps | T439 | — | needs-detailing |  |
| T634 | Numbers and frozen exports (R-038, R-039) in platform-express | 5 Sweeps | T439 | — | needs-detailing |  |
| T635 | Numbers and frozen exports (R-038, R-039) in platform-fastify | 5 Sweeps | T439 | — | needs-detailing |  |
| T636 | Numbers and frozen exports (R-038, R-039) in platform-socket.io | 5 Sweeps | T439 | — | needs-detailing |  |
| T637 | Numbers and frozen exports (R-038, R-039) in platform-ws | 5 Sweeps | T439 | — | needs-detailing |  |
| T638 | Numbers and frozen exports (R-038, R-039) in testing | 5 Sweeps | T439 | — | needs-detailing |  |
| T640 | Type rules (R-053, R-110, R-112–R-115) in common | 5 Sweeps | T439 | — | needs-detailing | exported signatures need Q1 |
| T641 | Type rules (R-053, R-110, R-112–R-115) in core | 5 Sweeps | T439 | — | needs-detailing | exported signatures need Q1 |
| T642 | Type rules (R-053, R-110, R-112–R-115) in microservices | 5 Sweeps | T439 | — | needs-detailing | exported signatures need Q1 |
| T643 | Type rules (R-053, R-110, R-112–R-115) in websockets | 5 Sweeps | T439 | — | needs-detailing | exported signatures need Q1 |
| T644 | Type rules (R-053, R-110, R-112–R-115) in platform-express | 5 Sweeps | T439 | — | needs-detailing | exported signatures need Q1 |
| T645 | Type rules (R-053, R-110, R-112–R-115) in platform-fastify | 5 Sweeps | T439 | — | needs-detailing | exported signatures need Q1 |
| T646 | Type rules (R-053, R-110, R-112–R-115) in platform-socket.io | 5 Sweeps | T439 | — | needs-detailing | exported signatures need Q1 |
| T647 | Type rules (R-053, R-110, R-112–R-115) in platform-ws | 5 Sweeps | T439 | — | needs-detailing | exported signatures need Q1 |
| T648 | Type rules (R-053, R-110, R-112–R-115) in testing | 5 Sweeps | T439 | — | needs-detailing | exported signatures need Q1 |
| T680 | Remove comments (R-164) in common | 5 Sweeps | T439 | — | needs-detailing | awaits Q4 |
| T681 | Remove comments (R-164) in core | 5 Sweeps | T439 | — | needs-detailing | awaits Q4 |
| T682 | Remove comments (R-164) in microservices | 5 Sweeps | T439 | — | needs-detailing | awaits Q4 |
| T683 | Remove comments (R-164) in websockets | 5 Sweeps | T439 | — | needs-detailing | awaits Q4 |
| T684 | Remove comments (R-164) in platform-express | 5 Sweeps | T439 | — | needs-detailing | awaits Q4 |
| T685 | Remove comments (R-164) in platform-fastify | 5 Sweeps | T439 | — | needs-detailing | awaits Q4 |
| T686 | Remove comments (R-164) in platform-socket.io | 5 Sweeps | T439 | — | needs-detailing | awaits Q4 |
| T687 | Remove comments (R-164) in platform-ws | 5 Sweeps | T439 | — | needs-detailing | awaits Q4 |
| T688 | Remove comments (R-164) in testing | 5 Sweeps | T439 | — | needs-detailing | awaits Q4 |
| T700 | Rewrite existing specs to GUIDE §12 (split per spec folder when detailed) | 5 Sweeps | T109 | — | needs-detailing | awaits Q6 |
| T699 | Checkpoint 5 | 5 Sweeps | T600–T688, T700 | — | needs-detailing |  |
| T900 | Raise the ESLint rules to errors | 6 Tightening | T699 | — | needs-detailing |  |
| T901 | Turn on verbatimModuleSyntax | 6 Tightening | T900 | — | needs-detailing |  |
| T902 | Remove iterare | 6 Tightening | T900 | — | needs-detailing | awaits Q2 |
| T903 | Final audit and checkpoint 6 | 6 Tightening | T901, T902 | — | needs-detailing |  |
| T904 | Move the plan tools under tools/ (optional) | 6 Tightening | T903 | — | needs-detailing | awaits Q5 |
