# T002: Create the domain glossary

**Phase:** 1, Foundations · **Depends on:** — · **Lane:** B · **Size:** S

## Goal

`docs/GLOSSARY.md` exists with the repository's one-word-per-concept table
(GUIDE §8.4, adoption blank §16.3). No code changes.

## Files

- In scope (may edit, create or delete): `docs/GLOSSARY.md` (new).
- Context (read, do not edit): `refactor-plan/DECISIONS.md` D-03.
- Every other file is out of scope. Do not touch it, even to fix something
  that is obviously wrong. Write it in the notes column of PROGRESS.md instead.

## Rules and recipes

- R-103: "Keep the domain glossary in a table (section 16) and use exactly those words — never a synonym, never an abbreviation … Record which way each counter counts (`pageNumber` from 1, `index` from 0) and convert at the point of use".
- No recipe.

## Current state

`docs/` does not exist (`ls docs` fails). No glossary file exists anywhere
(`git ls-files | grep -i glossary` prints nothing).

## Steps

1. Create `docs/GLOSSARY.md` with exactly the content between the two lines
   `----8<----` below (do not copy those two lines):

----8<----
# Glossary

One word per concept, used everywhere in TypeScript names (GUIDE.md §8.4).
Never use a synonym or an abbreviation from the last column. Counters record
where they start.

| Word | Meaning | Type it names | Counts | Never write |
| --- | --- | --- | --- | --- |
| `application` | A running Nest application | `INestApplication` | — | `app` |
| `applicationContext` | A standalone Nest application context | `INestApplicationContext` | — | `appContext`, `ctx` |
| `module` | A class decorated with `@Module()`, or a dynamic module definition | `Type<unknown>`, `DynamicModule` | — | `mod` |
| `moduleRef` | The container's runtime record of one module | `Module`, `ModuleRef` | — | `moduleInstance` |
| `distance` | How deep a module sits below the root module | `number` | root module = 1, each import level + 1; global modules = `Number.MAX_VALUE`; 0 = never measured | `depth` (outside `TopologyTree.walk`), `level` |
| `metatype` | The class (constructor) that is being registered or processed | `Type<unknown>`, `Function` | — | `cls`, `klass`, `type` (for a class) |
| `provider` | One entry of a module's `providers` | `Provider` | — | `prov`, `p` |
| `token` | An injection token | `InjectionToken` | — | `key` (for a token), `injectionToken` |
| `instanceWrapper` | The container's wrapper around one provider, controller or injectable | `InstanceWrapper` | — | `wrapper`, `wrapperRef` |
| `inquirer` | The instance wrapper that requested a transient provider | `InstanceWrapper` | — | `parent` (for this meaning) |
| `contextId` | The identifier of one request's dependency-injection sub-tree | `ContextId` | — | `ctxId` |
| `container` | The dependency-injection container | `NestContainer` | — | — |
| `injector` | The object that creates instances | `Injector` | — | — |
| `scope` | The lifetime of a provider | `Scope` | — | — |
| `controller` | A class decorated with `@Controller()` | `Type<unknown>` | — | `ctrl` |
| `path` | The URL path of a route | `string` | — | `url` (for a path), `route` (for a path string) |
| `method` | The HTTP request method of a route | `RequestMethod` | — | `verb` |
| `handler` | The function that serves a route, message or event | `Function` | — | `fn`, `cb` |
| `callback` | A function passed in to be called later that is not a handler | `Function` | — | `cb`, `fn` |
| `request` | The platform's incoming request object | platform type | — | `req` |
| `response` | The platform's outgoing response object | platform type | — | `res` |
| `next` | The middleware continuation function | `Function` | — | — |
| `host` | The arguments host of a call | `ArgumentsHost` | — | — |
| `context` | The execution context of a call | `ExecutionContext` | — | `ctx`, `executionContext` |
| `contextType` | Which kind of call is running: `'http'`, `'ws'` or `'rpc'` | `ContextType` | — | `type` (for this meaning) |
| `error` | Any thrown or rejected value | `unknown`, `Error` | — | `err`, `e`, `ex` |
| `exception` | An instance of one of Nest's exception classes | `HttpException`, `RpcException`, `WsException` | — | `exc` |
| `options` | A configuration object passed to a function | `…Options` | — | `opts`, `config` (for options) |
| `metadata` | A value stored with `Reflect.defineMetadata` or read with `Reflect.getMetadata` | varies | — | `meta` |
| `enhancer` | A guard, interceptor, pipe or exception filter, when code treats them alike | varies | — | — |
| `guard`, `interceptor`, `pipe`, `filter`, `middleware` | The five request-pipeline building blocks | `CanActivate`, `NestInterceptor`, `PipeTransform`, `ExceptionFilter`, `NestMiddleware` | — | `exceptionFilter` (use `filter`) |
| `adapter` | A platform adapter (HTTP or WebSocket) | `AbstractHttpAdapter`, `WebSocketAdapter` | — | `httpServer` (for the adapter) |
| `pattern` | The message pattern a microservice handler answers | `string`, `object` | — | `pat` |
| `packet` | One message envelope sent over a transport | `ReadPacket`, `WritePacket` | — | `msg` |
| `transport` | A transport strategy identifier | `Transport`, `TransportId` | — | — |
| `client` | A microservice client proxy | `ClientProxy` | — | — |
| `server` | A microservice transport server | `Server` | — | `srv` |
| `gateway` | A WebSocket gateway class | `Type<unknown>` | — | — |
| `socket` | One network connection (WebSocket or TCP) | platform type | — | `sock`, `ws` (for a connection) |
| `index` | A position in an array or a parameter list | `number` | from 0 | `i`, `idx`, `paramIndex` |
| `retryAttempts` | How many times to retry | `number` | a count (0 = never retry) | `retries` |
| `status` | An HTTP status code | `HttpStatus`, `number` | — | `statusCode` |
| `prefix` | The global route prefix | `string` | — | `globalPrefix` (for the value) |
| `version` | An API version value | `VersionValue` | — | `ver` |
| `port` | A TCP port number | `number` | — | — |
----8<----

2. Format nothing: Markdown is not covered by the repository's formatter.

## Must not change

Every file other than `docs/GLOSSARY.md`.

## Acceptance criteria

- [ ] `test -f docs/GLOSSARY.md && echo ok` prints `ok`.
- [ ] `grep -c '^| `' docs/GLOSSARY.md` prints `45` (one row per word).
- [ ] `grep -c '8<' docs/GLOSSARY.md` prints `0`.
- [ ] `git status --short` lists only `docs/GLOSSARY.md` and `refactor-plan/PROGRESS.md`.

## Stop and escalate if

- `docs/GLOSSARY.md` already exists;
- the row count differs from 45 after you copied the block exactly.

If you stop, delete `docs/GLOSSARY.md` if you created it, set the task to
`blocked` in PROGRESS.md with a one-paragraph reason, and stop.

## Finish

Set the task to `done` in PROGRESS.md, then commit `docs/GLOSSARY.md` and
`refactor-plan/PROGRESS.md` together with the message
`docs: add the domain glossary [T002]`.
