# Recipes

One recipe per recurring transformation. Follow a recipe literally. If its
preconditions do not hold, stop and escalate (see your task).

Library versions used in every snippet (verified in an isolated project with
this repository's compiler settings, CONTEXT §9): `lodash-es` 4.18.1 with
`@types/lodash-es` 4.17.12, `ts-pattern` 5.9.0, `ramda` 0.32.0 with
`@types/ramda` 0.32.0, TypeScript 5.9.3. **Until task T006 has landed, none of
these packages is installed; a task that needs them depends on T006.**

Import lines, in the order R-161 requires (packages first, sorted by module
specifier in code-point order; then relative imports, sorted the same way; no
blank line between the groups in source files, exactly one in spec files):

```ts
import { filter, flow, map, size } from 'lodash-es';
import { tryCatch } from 'ramda';
import { match, P } from 'ts-pattern';
import { chain } from '../utils/chain.js';
```

Inside `packages/common`, `chain` is imported relatively from
`packages/common/utils/chain.ts`. Every other package imports it as
`import { chain } from '@nestjs/common/internal';` (D-02). Relative specifiers
always end in `.js` (D-07).

---

## C-00: Rewrite one function body (the GUIDE §13 procedure)

Preconditions: the task names the function, its file and its target design.
Tests that cover the function exist and pass (the task lists them). T006–T008
are `done`.

Steps, one construct at a time, running the package typecheck and the listed
tests after each step:

1. Read the whole file. Write down its existing imports.
2. **Name the steps.** Create each helper or step exactly as the task's design
   lists it (name, file, signature). Do not invent extra helpers.
3. **Replace every branch** with `match` (C-01, C-02, C-03) or with `??`/`?.`
   where the task says so (C-09).
4. **Wrap every thrower** (C-06). A `throw` stays until Q3 is answered (C-07).
5. **Inject ambient effects** only where the task gives the new parameter
   (R-090/R-091). Never change a public signature on your own.
6. **Thread absence** (C-09).
7. **Kill the locals** (C-08).
8. **Sweep the natives into lodash** (C-10), checking every pitfall row.
9. **Fix the imports** (C-13): one `lodash-es` line, `chain` from the wrapper,
   nothing unused.
10. **Declare return types** on helpers, not on steps or entry points (R-053).
11. **Update `docs/FUNCTION_NAMES.md`**:
    `node refactor-plan/tools/function-names.mjs --write`.
12. Run the task's acceptance checks.

Pitfalls (check every one before step 12):

- **Short-circuiting.** `a && f()` and `a ? f() : g()` evaluate `f` only
  sometimes. `match(…).with(…, () => f())` keeps that, because handlers are
  thunks. Never compute both arms up front and pick one afterwards.
- **Order of side effects.** Logging, metadata writes (`Reflect.defineMetadata`),
  event emission and subscription must happen in the same order and the same
  number of times.
- **`this`.** A method body keeps using `this` until Q1 is answered. An arrow
  function nested in a method sees the method's `this`; a `function` expression
  does not. Never turn a `function` expression that uses its own `this` into an
  arrow.
- **Async timing.** An `await` in a loop is sequential; keep it sequential (C-24).
- **Type narrowing.** `match` handlers receive the narrowed type. Where the old
  code narrowed with `if (isString(x))`, check that the handler parameter has the
  same type the old branch had.

## C-01: `if`/`else` and `?:` → `match` (booleans and open values)

Preconditions: the condition is not a type test on a union (that is C-03) and
not a pure null/undefined fallback (that is C-09).

Steps:

1. Name the value you branch on. If the condition is a boolean expression, the
   value is `true`/`false`: `match(condition)`.
2. One `.with(value, handler)` per arm, `.otherwise(handler)` for the last arm
   (R-062). Each handler is one call (R-069). If an arm needs more, the task
   gives the helper to move it into.
3. If the arms return members of a string union, annotate each handler:
   `(): Paramtype => 'body'` (R-066).
4. Use `.when(predicate, handler)` for a condition you cannot express as a value
   (R-064).

Example from this codebase, `addLeadingSlash` in
`packages/common/utils/shared.utils.ts` (baseline ~L23–28).

Before:

```ts
export const addLeadingSlash = (path?: string): string =>
  path && typeof path === 'string'
    ? path.charAt(0) !== '/' && path.substring(0, 2) !== '{/'
      ? '/' + path
      : path
    : '';
```

After (where the helper lives is decided by the task):

```ts
import { isString, startsWith } from 'lodash-es';
import { match } from 'ts-pattern';

const SLASH = '/';
const OPTIONAL_SLASH = '{/';

const prefixSlash = (path: string): string =>
  match(startsWith(path, SLASH) || startsWith(path, OPTIONAL_SLASH))
    .with(true, () => path)
    .otherwise(() => `${SLASH}${path}`);

export const addLeadingSlash = (path?: string): string =>
  match(path)
    .when(
      (value): value is string => isString(value) && value !== '',
      (value) => prefixSlash(value),
    )
    .otherwise(() => '');
```

Why this keeps behaviour: `path && …` is false for `undefined` and `''`, which
both reach `.otherwise(() => '')`. `charAt(0) !== '/'` equals
`!startsWith(path, '/')`, and `substring(0, 2) !== '{/'` equals
`!startsWith(path, '{/')`. By De Morgan, the prefix is added only when neither
holds.

Verify: the existing spec `packages/common/test/utils/shared.utils.spec.ts`
passes unchanged.

## C-02: `switch` or an `else if` chain on one value → `match`

Preconditions: every arm compares the same value with `===` against a literal
or an enum member.

Steps:

1. `match(value)`, one `.with(member, handler)` per `case`, in the same order.
2. If the value's type is a union and every member has an arm, end with
   `.exhaustive()`. If the `switch` has a `default`, end with
   `.otherwise(handler)` holding the `default` body.
3. Fall-through cases (`case A: case B: return x`) become one
   `.with(A, B, handler)`. ts-pattern accepts several patterns before the handler.
4. A `case` that only `break`s and lets code below the `switch` run becomes a
   handler that returns the value that code would produce. If that is not
   possible in one call, stop and escalate.

Example from this codebase, `ParamsTokenFactory.exchangeEnumForString` in
`packages/core/pipes/params-token-factory.ts` (baseline L5–16).

Before:

```ts
switch (type) {
  case RouteParamtypes.BODY:
    return 'body';
  case RouteParamtypes.PARAM:
    return 'param';
  case RouteParamtypes.QUERY:
    return 'query';
  default:
    return 'custom';
}
```

After (the method stays a method until Q1 is answered):

```ts
import type { Paramtype } from '@nestjs/common';
import { RouteParamtypes } from '@nestjs/common/internal';
import { match } from 'ts-pattern';

…
  public exchangeEnumForString(type: RouteParamtypes): Paramtype {
    return match(type)
      .with(RouteParamtypes.BODY, (): Paramtype => 'body')
      .with(RouteParamtypes.PARAM, (): Paramtype => 'param')
      .with(RouteParamtypes.QUERY, (): Paramtype => 'query')
      .otherwise((): Paramtype => 'custom');
  }
```

Pitfall: `switch` compares with `===`; ts-pattern 5.9.0 literal patterns behave
like `Object.is` (verified): `NaN` matches a `NaN` pattern (a `switch` never
matches it), and `-0` does **not** match a `0` pattern (a `switch` does). If the
value can be `-0` or `NaN`, stop and escalate.

## C-03: `typeof`/`instanceof` ladder → `match` with `P` patterns

Preconditions: the branches test the type or shape of one value.

Steps:

1. Right after the imports, destructure exactly the helpers you use:
   `const { instanceOf, string } = P;` (R-063, R-163).
2. One `.with(pattern, handler)` per rung, in the original order (the first
   matching rung wins, as before).
3. `typeof x === 'string'` → `string`; `'number'` → `number`; `'boolean'` →
   `boolean`; `'symbol'` → `symbol`; `'bigint'` → `bigint`;
   `x instanceof C` → `instanceOf(C)`; `x === null || x === undefined` →
   `nullish`; `'k' in x && typeof x.k === 'string'` → `{ k: string }`.
4. `typeof x === 'function'` and `typeof x === 'object'` have no `P` pattern
   with the same meaning. Use `.when(isFunction, …)` (lodash) or
   `.when(isObjectLike, …)` and check the pitfall table in C-10.

Example from this codebase, the constructor of `InvalidTcpDataReceptionException`
in `packages/microservices/errors/invalid-tcp-data-reception.exception.ts`
(baseline L4–13).

Before:

```ts
const errMsgStr =
  typeof err === 'string'
    ? err
    : err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as any).message === 'string'
      ? (err as any).message
      : String(err);
```

After:

```ts
import { match, P } from 'ts-pattern';

const { string } = P;

const getReceptionErrorText = (error: string | Error): string =>
  match<unknown, string>(error)
    .with(string, (text) => text)
    .with({ message: string }, ({ message }) => message)
    .otherwise((value) => String(value));
```

Verified behaviour of ts-pattern 5.9.0 object patterns: they match inherited
properties, as `'message' in err` does (`new Error()` with no message gives
`''`). They do not match functions, as `typeof err === 'object'` does not. They
do not match `null`, as `err && …` does not.

## C-04: Loops → `map`, `filter`, `reduce`, `times`, `range`

Preconditions: the task says what the loop computes.

| Loop shape | Replacement | Pitfall |
| --- | --- | --- |
| build a new array, one item per input | `map(items, (item) => …)` | lodash `map` on a `Set` or `Map` returns `[]`; spread it first: `map([...set], …)` |
| keep some items | `filter(items, predicate)` | |
| accumulate a value | `reduce(items, (accumulated, item) => next, initial)` | keep the original iteration order |
| loop `n` times | `times(n, (index) => …)` (index from 0) | |
| loop over a numeric range | `range(start, end)` (end exclusive) | the original `<=` bound needs `end + 1` |
| `break`/early `return` on the first hit | `find`, `some`, `every`, `takeWhile`, `dropWhile` | `find` returns `undefined` when nothing matches |
| `for…in` over own keys | `keys(record)` then the above | `for…in` also walks inherited enumerable keys; `keys` does not. Check `hasOwn` guards in the original |
| loop whose body only causes effects in order | `reduce(items, (done, item) => tapEffect(done, () => effect(item)), seed)` | only where the task approves an effect at that point (R-075) |
| `while` whose frontier changes each round | a recursive arrow helper given in the task | keep the same visiting order |

Example from this codebase, the effect-only loop in `applyDecorators`
(`packages/common/decorators/core/apply-decorators.ts`, baseline L18–28)
applies each decorator in order. Its replacement is a `reduce` over
`decorators` that returns `target` and calls each decorator through
`tapEffect`. The task supplies the exact code, because the two decorator call
shapes are a branch (C-01).

## C-05: `forEach` → `map`/`reduce`

Preconditions: as C-04. `forEach(items, …)` and `items.forEach(…)` are both
banned (R-135).

1. If the callback builds or collects something, it is C-04's first rows.
2. If the callback only causes effects, use the effect row of C-04.
3. `map.forEach((value, key) => …)` on a `Map`: iterate `[...map.entries()]`
   with C-04. lodash helpers do not iterate `Map`/`Set`.

Example from this codebase: `Bind` in
`packages/common/decorators/core/bind.decorator.ts` (baseline L17) calls
`decorators.forEach((fn, index) => fn(target, key, index))`. The order of the
calls and the index argument (from 0) must be kept.

## C-06: `try`/`catch` → `tryCatch`; promise rejection → `then(onOk, onError)`

### Part A: synchronous

Preconditions: the `try` block is one call (or the task gives the helper that
wraps it) and the `catch` block produces a value without rethrowing.

1. Assign `tryCatch(tryer, catcher)` to a `const` annotated with the function
   type (R-071).
2. The catcher's parameters are `(error, ...the tryer's arguments)`; its return
   type is the tryer's return type.
3. Normalise an unknown error with a named helper (R-072):

```ts
import { match, P } from 'ts-pattern';

const { instanceOf, string } = P;

const getErrorMessage = (error: unknown): string =>
  match(error)
    .with(instanceOf(Error), (error) => error.message)
    .with(string, (text) => text)
    .otherwise(() => 'Unknown error occurred');
```

Example from this codebase: in `ParseArrayPipe.transform`
(`packages/common/pipes/parse-array.pipe.ts`, inner function `toClassInstance`,
baseline ~L112–117), `try { item = JSON.parse(item); } catch { /* Do nothing */ }`
becomes:

```ts
import { tryCatch } from 'ramda';

const parseArrayItem: (item: string) => unknown = tryCatch(
  (item: string): unknown => JSON.parse(item),
  (_error: unknown, item: string): unknown => item,
);
```

(verified: `parseArrayItem('{"a":1}')` → `{ a: 1 }`, `parseArrayItem('{oops')` → `'{oops'`).

### Part B: asynchronous

1. `try { await p } catch (e) { return fallback(e) }` →
   `p.then((value) => onOk(value), (error) => fallback(error))`.
2. A `.catch(handler)` call → `.then(undefined, handler)` is the same; prefer
   `.then(onOk, onError)` when there is an `onOk`.
3. **A catcher that rethrows is not a fallback.** If the `catch` block contains
   `throw`, it is C-07: stop.

## C-07: `throw` (blocked)

Nest's contract is to throw (`HttpException`, `RuntimeException` and dozens of
subclasses that users and the exceptions layer catch). Replacing a `throw` with
a returned fallback changes error behaviour. Until open question Q3 is answered
there is **no** recipe: a task that meets a `throw` leaves it unchanged, and
says so in its "Must not change" section.

## C-08: `let`, reassignment and `const` staircases → `chain` carrying an object

Preconditions: T007 (`chain` wrapper) is `done`.

1. Find the values the body computes in sequence.
2. Start `chain({ first })` with the first value as a named property.
3. Each later value is one `.thru(({ …needed }) => ({ …stillNeeded, next: step(…) }))`.
   Pass on only what later steps read (R-083).
4. The last `.thru` returns the result itself; end with `.value()` (R-142).
5. A `let` updated in a loop is a `reduce` (C-04) whose accumulator is the `let`.
6. An arrow whose body is `{ return x; }` becomes `=> x` (R-043). Wrap an
   object literal in parentheses: `=> ({ … })`.

Example from this codebase: `getInjectionProviders`
(`packages/common/module-utils/utils/get-injection-providers.util.ts`, baseline
~L34–52) keeps `result` and `search` in a `while` loop. Its rewrite is a
recursive helper `collectInjectionProviders(providers, search, found)` that
returns `found` when `size(search) === 0`. The task gives the full code.

Pitfalls: `chain(x).thru(() => void f())` and `.thru(() => null)` collapse the
wrapper type (R-076). A `const` that the original reads after an `await` must
stay in scope; never move work across an `await`.

## C-09: Null guards → thread `X | undefined`

1. `if (x == null) return fallback;` → `x ?? fallback` when the fallback is the
   whole result, or `match(x).with(nullish, () => fallback).otherwise(rest)`.
2. `a && a.b && a.b.c` → `a?.b?.c` (or `get(a, 'b.c')` when the path is a string).
3. `x === undefined ? d : x` → `x ?? d` **only if `x` can never be `null`**:
   `??` also replaces `null`.
4. Truthiness guards (`if (!x)`) also catch `0`, `''`, `false` and `NaN`. Keep
   them as `.when((value) => !value, …)`; never turn them into `nullish`.

## C-10: Natives → lodash

Use the GUIDE §10.3 table. For each swap, check this pitfall table (each row
verified against lodash-es 4.18.1):

| Native | lodash | Differs when |
| --- | --- | --- |
| `arr.length` | `size(arr)` | `size` also measures strings, objects (own keys) and `Set`/`Map` |
| `arr.map/filter/find/some/every` | `map/filter/find/some/every(arr, fn)` | the receiver is a `Set`/`Map` (lodash returns `[]`/`undefined`), an object (lodash iterates its values), or a string (lodash iterates characters) |
| `arr.includes(x)` | `includes(arr, x)` | on strings lodash checks a substring, the same as `String#includes` |
| `arr.sort(cmp)` | `sortBy(arr, key)` | `sort` mutates and returns the same array; `sortBy` returns a new one. Callers that relied on the in-place sort must get the new array. A comparator must become a key function (negate for descending; key list for ties) |
| `arr.reverse()` | `reverse([...arr])` | lodash `reverse` mutates too, so copy first |
| `Object.keys(x)` | `keys(x)` | `keys(null)` → `[]`; `Object.keys(null)` throws |
| `Math.max(...nums)` | `max(nums)` | `max([])` → `undefined`; `Math.max()` → `-Infinity` |
| `{ ...a, ...b }` | `assign({}, a, b)` | `assign` **drops symbol keys**; spread copies them |
| `JSON.parse(JSON.stringify(x))` | `cloneDeep(x)` | `cloneDeep` keeps `undefined` values, `Date`, `Map` and prototypes; the JSON round trip drops or converts them |
| `str.trim()` | `trim(str)` | `trim(undefined)` → `''`; `undefined.trim()` throws |
| `typeof x === 'string'` | `isString(x)` | `isString(new String('x'))` is `true` |
| `typeof x === 'number'` | `isNumber(x)` | `isNumber(new Number(1))` is `true` |
| `typeof x === 'object' && x !== null` | `isObjectLike(x)` | — (do **not** use `isObject`: it is also `true` for functions) |
| `Object.hasOwn(o, k)` | `has(o, [k])` | without the array, `has(o, 'a.b')` follows the path `o.a.b` |
| `iterate(x).map(f).toArray()` (`iterare`) | `map([...x], f)` | iterare accepts any iterable and is lazy; spread it into an array first |

**Name clashes with Nest's own helpers.** `packages/common/utils/shared.utils.ts`
exports `isUndefined`, `isObject`, `isPlainObject`, `isFunction`, `isString`,
`isNumber`, `isNil`, `isEmpty` and `isSymbol`. Some behave differently from the
lodash functions with the same names:

| Nest helper | lodash with the same behaviour |
| --- | --- |
| `isUndefined`, `isNil`, `isString`*, `isNumber`*, `isSymbol`*, `isFunction` | same name (*lodash also accepts boxed primitives) |
| `isObject` (non-null `typeof 'object'`; **false for functions**) | `isObjectLike`, **not** `isObject` |
| `isEmpty` (nil → true; array → `length === 0`; **anything else → false**) | none: lodash `isEmpty('')`, `isEmpty({})` and `isEmpty(5)` are all `true` |
| `isPlainObject` | not guaranteed: lodash also checks `Symbol.toStringTag` |

Never swap a Nest helper for a lodash one unless this table says they behave the
same. Where they differ, keep calling the Nest helper. Import a lodash function
whose name clashes under an alias given by the task.

## C-11: `function` declaration → arrow `const`

Preconditions: the function does not use `this` or `arguments`, or the task
says how to replace them.

1. `export function f(a: A): R { … }` → `export const f = (a: A): R => …`
   (keep the return type only if the function is a helper, R-053).
2. **Overloads.** Nest's decorators are overloaded (for example `Controller`
   in `packages/common/decorators/core/controller.decorator.ts`). An arrow cannot
   carry overloads. The task gives an interface with one call signature per
   overload, in its own type file (R-036), and annotates the const with it:
   `export const Controller: ControllerDecorator = (prefixOrOptions?) => …`.
3. **Hoisting and import cycles.** A `function` declaration exists before its
   module finishes evaluating; a `const` does not (TDZ). The core package has a
   14-folder import cycle (CONTEXT §11), so a module in a cycle may call the
   function while the module that defines it is still loading. After the
   change, run the **whole** package's tests and `npm run build`. A
   `ReferenceError: Cannot access 'f' before initialization` means stop and
   escalate.
4. Generic functions keep their type parameters: `<T>(value: T): T => …`.

## C-12: Type-only imports (R-117)

1. Run `npx eslint --rule '{"@typescript-eslint/consistent-type-imports":"warn"}' <files>`
   or `node refactor-plan/tools/audit.mjs --rules R-117 --files <files> --format locations`.
2. For each reported specifier: if **every** imported name of that import line
   is type-only, write `import type { … } from '…';`. Otherwise mark the
   type-only names inline: `import { type A, B } from '…';`.
3. Re-exports of types: `export type { A } from '…';`.
4. **Never** convert an import in a file that contains a decorator (`@Something`
   on a class, member or parameter) unless `npx tsc` with
   `verbatimModuleSyntax` reports it (TS1484). A class imported with `import type`
   and used as a constructor parameter type loses its DI metadata silently
   (CONTEXT §9).
5. Verify: `npm run build` exits 0, and the package's unit tests pass.

## C-13: Import order, blank lines and extensions

1. Package imports first (`'@nestjs/…'`, `'rxjs'`, `'lodash-es'`, Node built-ins
   such as `'node:fs'`), sorted by module specifier in ascending code-point
   order (`'@…'` < `'l…'` < `'r…'` < `'t…'`; uppercase sorts before lowercase).
2. Then relative imports, sorted the same way (`'../…'` sorts before `'./…'`).
3. A side-effect import (`import 'reflect-metadata';`) stays where it is (D-16).
4. Source files: no blank line between the groups. Specs: exactly one.
5. One blank line between top-level statements. Consecutive `import`s, and
   consecutive `export … from` re-exports, have none.
6. Relative specifiers end in `.js` (D-07). A cross-package import uses the alias
   `@nestjs/<pkg>/…`, never `../../../<pkg>/…` (R-150).
7. Pitfall: reordering imports reorders module evaluation. If a test fails only
   after reordering, restore the order and escalate.

## C-14: `enum` → string union (blocked)

Exported enums (`HttpStatus`, `RequestMethod`, `Scope`, `Transport`,
`GrpcStatus`, …) are runtime objects users read (`HttpStatus.OK === 200`).
Replacing them changes the public API. Blocked by Q1.

## C-15: Move code without changing it

Preconditions: the task names the source file, the moved declarations, the
new file names and how the old path keeps working. Q1 must allow it for package
files.

1. Create each new file with exactly the moved declaration, plus the imports it
   needs.
2. In the old file, replace the declaration with
   `export { Name } from './new-file.js';` when the old path must keep exporting
   it (D-05), or delete it and update every importer listed in the task.
3. Do not change one character of the moved code beyond its imports.
4. Verify: `npm run build`, the package's tests, and
   `git diff --stat` showing only the listed files.

## C-16: Write a spec the GUIDE §12 way (characterisation tests)

Preconditions: T005 is `done` (specs beside sources are excluded from the build).

1. File: `<source base name>.spec.ts` **beside** the source file (R-033).
2. Imports: `import { describe, expect, it } from 'vitest';` first (package
   group, sorted), then one blank line, then relative imports of the module under
   test using `.js` specifiers.
3. Exactly one `describe`, titled exactly with the exported name under test
   (for a class, the class name, D-25).
4. Every `it` title reads `should … when …` in plain English (R-173). Call the
   unit under test "it".
5. Inside each `it`: setup, call and `expect`s separated by one blank line
   (R-178). A one-line test has no blank lines.
6. Never `vi.fn`, `vi.spyOn`, `vi.mock`, `beforeEach`, `afterEach`, snapshots,
   `.only`, `.skip`, `.each` (R-171). Pass stub functions instead.
7. Shared read-only fixtures are top-level `UPPER_SNAKE_CASE` constants (R-176).
8. Assert values with `toEqual`, identity and primitives with `toBe` (R-177).
9. All other rules apply: arrow functions only, no `if`/`?:`/loops/`let`, no
   `.length` (use `toHaveLength`), no array methods, no `any`, casts only as
   `as unknown as T` (R-180), no comments.
10. **Assert current behaviour, even if it looks wrong.** A characterisation test
    records what the code does today. If a value surprises you, write the
    observed value and note it in PROGRESS.md.
11. Verify: `npx vitest run <spec>` passes and reports the expected test count;
    `node refactor-plan/tools/audit.mjs --files <spec> --fail-on-any` prints a
    summary with no rule rows and exits 0.

## C-17: Remove `any`

1. A parameter that accepts anything → `unknown`, then narrow with `match`/C-03.
2. A value passed through unchanged → a type parameter `<T>`.
3. `Record<any, any>` → `Record<PropertyKey, unknown>`.
4. **An `any` in an exported signature is public API**: changing it can break
   users' compilation. Blocked by Q1 for exported signatures.

## C-18: Remove non-null assertions (`x!`)

1. If the value is guaranteed by an earlier check, restructure so the type
   carries the guarantee (narrow with `match`, pass the narrowed value).
2. Never replace `x!.y` with `x?.y`: that changes a `TypeError` into
   `undefined` (behaviour change). If no guarantee exists, stop and escalate.

## C-19: Remove `as` casts; `type` object shapes → `interface`

Part A (casts): replace the cast with a narrowing `match`/type guard, a
correctly typed declaration, or a generic. If none is possible without changing
behaviour, stop and escalate.

Part B (`type X = { … }` → `interface X { … }`): keep every member and its
modifiers. Do not convert when the alias is used in a mapped or conditional
type that an interface cannot express (`build` fails); escalate instead.

## C-20: Remove comments (blocked)

JSDoc in package sources is published in `.d.ts` files and shown to users.
Blocked by Q4. Tool directives (`// eslint-disable-next-line`, `// @ts-…`,
`/* istanbul ignore */`) are not comments for this rule.

## C-21: Rename locals and parameters

1. One-letter names → the glossary word for what the value holds
   (`docs/GLOSSARY.md`); an unused parameter → `_`.
2. Rename only locals and parameters, never exported names, object keys or
   names used through strings (`'transform'`, decorator metadata keys).
3. Verify: `npm run build`, the package's tests.

## C-22: Name a number

1. Add a non-exported `UPPER_SNAKE_CASE` const at the top of the file (after
   imports and the `P` destructuring): `const DEFAULT_RETRY_DELAY = 3000;`.
2. If two or more files need it, the task names the package's constants file
   instead (D-04).
3. Replace the literal with the name. Same value, same type (`3_000` and `3000`
   are the same number).

## C-23: Freeze an exported array or object

Preconditions: the task lists evidence (a search) that no code in the
repository writes to the value, and that it is not documented as user-mutable.

`export const X = Object.freeze([…])` typed `readonly T[]`, or
`Object.freeze({…})` with `Readonly<…>` or an interface with `readonly` members.
Pitfall: writing to a frozen object throws in strict mode (all ESM is strict).

## C-24: `await` in a loop, `for await`

1. Independent iterations that the original ran **sequentially** stay
   sequential:
   `reduce(items, (done, item) => done.then(() => handle(item)), Promise.resolve())`.
   Never switch to `Promise.all` unless the task says the order does not
   matter (that is a behaviour change).
2. Iterations that the original ran in parallel (`Promise.all(items.map(…))`)
   → `Promise.all(map(items, …))`.
3. `for await (const x of asyncIterable)` has no lodash form. Stop and escalate.
