# T010: Characterise `ContextIdFactory`

**Phase:** 2, Safety net · **Depends on:** T005 · **Lane:** A · **Size:** S

## Goal

A spec beside `packages/core/helpers/context-id-factory.ts` records how `ContextIdFactory` creates context ids, finds an attached id on a request, and applies a context-id strategy. Line coverage of that file was 50 % at baseline.

## Files

- In scope (may edit, create or delete): `packages/core/helpers/context-id-factory.spec.ts` (new).
- Context (read, do not edit): `packages/core/helpers/context-id-factory.ts`, `packages/core/router/request/request-constants.ts`, `packages/core/injector/instance-wrapper.ts` (interface `ContextId` only, ~L45–49), `refactor-plan/RECIPES.md` C-16.
- Every other file is out of scope. Do not touch it, even to fix something
  that is obviously wrong. Write it in the notes column of PROGRESS.md instead.
  **Do not change any source file and do not touch the existing specs under
  `test/`.**

## Rules and recipes

- R-033: "Every file that exports a function has a spec beside it with the same base name".
- R-170: "With Vitest, `import { describe, expect, it } from 'vitest';`."
- R-171: "NEVER use mocks, spies, `beforeEach`, `afterEach`, snapshots, `.only`, `.skip` or `it.each`."
- R-172: "One `describe` per file, named exactly after the function". D-25: for a class, the class name.
- R-173: "Titles read `should … when …`, in plain everyday English about the domain".
- R-178: "Inside a test, separate the setup, the call and the `expect`s with blank lines."
- R-162: "Spec files have exactly one [blank line between the two import groups]."
- Follow recipe C-16.

## Current state

`packages/core/helpers/context-id-factory.ts` exports `createContextId()` (returns `{ id: Math.random() }`), the types `ContextIdResolverFn`, `ContextIdResolver`, `ContextIdStrategy`, and the class `ContextIdFactory` with static `create()`, `getByRequest(request, propsToInspect = ['raw'])` and `apply(strategy)`. `REQUEST_CONTEXT_ID` in `packages/core/router/request/request-constants.ts` is `Symbol('REQUEST_CONTEXT_ID')`. The existing spec `packages/core/test/helpers/context-id-factory.spec.ts` has one test for `createContextId` and stays unchanged.

T004 is `done`: `grep -c '"\*\*/\*\.spec\.ts"' packages/core/tsconfig.build.json` prints `1`.
Without it, the new spec would be compiled into the published package.

## Steps

1. Create each file below with exactly the content shown. These specs are
   characterisation tests: every expected value was recorded by running the
   current code at the baseline commit (`35142c3e`).
2. Run `npx prettier --check --end-of-line auto packages/core/helpers/context-id-factory.spec.ts`. It must
   report that all files use Prettier code style. If it does not, you mistyped
   something: compare your file with the block again. Running
   `npx prettier --write` on the file afterwards is harmless: it changes nothing.
3. Run `npx vitest run packages/core/helpers/context-id-factory.spec.ts`.

`packages/core/helpers/context-id-factory.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { REQUEST_CONTEXT_ID } from '../router/request/request-constants.js';
import {
  ContextIdFactory,
  type ContextIdResolverFn,
  type ContextIdStrategy,
  createContextId,
} from './context-id-factory.js';

const CONTEXT_ID = { id: 1 };

const PARENT_CONTEXT_ID = { id: 2 };

const PAYLOAD = { tenant: 'acme' };

const resolveParent: ContextIdResolverFn = () => PARENT_CONTEXT_ID;

const NO_STRATEGY = undefined as unknown as ContextIdStrategy;

const FUNCTION_STRATEGY: ContextIdStrategy = { attach: () => resolveParent };

const PAYLOAD_STRATEGY: ContextIdStrategy = {
  attach: () => ({ resolve: resolveParent, payload: PAYLOAD }),
};

describe('ContextIdFactory', () => {
  it('should give a context id with only a numeric id when it creates one', () => {
    expect(ContextIdFactory.create()).toEqual({ id: expect.any(Number) });
  });

  it('should draw the id between zero and one when it creates a context id', () => {
    const contextId = createContextId();

    expect(contextId.id).toBeGreaterThanOrEqual(0);
    expect(contextId.id).toBeLessThan(1);
  });

  it('should give a new context id when there is no request', () => {
    const request = undefined as unknown as Record<string, unknown>;

    expect(ContextIdFactory.getByRequest(request)).toEqual({
      id: expect.any(Number),
    });
  });

  it('should give a new context id when the request is empty', () => {
    expect(ContextIdFactory.getByRequest({})).toEqual({
      id: expect.any(Number),
    });
  });

  it('should give the attached context id when the request carries one', () => {
    const request = { [REQUEST_CONTEXT_ID]: CONTEXT_ID };

    expect(ContextIdFactory.getByRequest(request)).toBe(CONTEXT_ID);
  });

  it('should give the context id of the raw request when the request wraps one', () => {
    const request = { raw: { [REQUEST_CONTEXT_ID]: CONTEXT_ID } };

    expect(ContextIdFactory.getByRequest(request)).toBe(CONTEXT_ID);
  });

  it('should give the context id of a listed property when the caller names that property', () => {
    const request = { socket: { [REQUEST_CONTEXT_ID]: CONTEXT_ID } };

    expect(ContextIdFactory.getByRequest(request, ['socket'])).toBe(CONTEXT_ID);
  });

  it('should give a new context id when the attached id sits in a property nobody listed', () => {
    const request = { socket: { [REQUEST_CONTEXT_ID]: CONTEXT_ID } };

    const contextId = ContextIdFactory.getByRequest(request);

    expect(contextId).not.toBe(CONTEXT_ID);
    expect(contextId).toEqual({ id: expect.any(Number) });
  });

  it('should use the resolver function as the parent when the strategy returns a function', () => {
    ContextIdFactory.apply(FUNCTION_STRATEGY);

    const contextId = ContextIdFactory.getByRequest({});
    ContextIdFactory.apply(NO_STRATEGY);

    expect(contextId.getParent).toBe(resolveParent);
    expect(contextId.payload).toBeUndefined();
  });

  it('should use the resolver and its payload when the strategy returns a resolver object', () => {
    ContextIdFactory.apply(PAYLOAD_STRATEGY);

    const contextId = ContextIdFactory.getByRequest({});
    ContextIdFactory.apply(NO_STRATEGY);

    expect(contextId.getParent).toBe(resolveParent);
    expect(contextId.payload).toBe(PAYLOAD);
  });

  it('should ignore the strategy when the request already carries a context id', () => {
    ContextIdFactory.apply(PAYLOAD_STRATEGY);

    const contextId = ContextIdFactory.getByRequest({
      [REQUEST_CONTEXT_ID]: CONTEXT_ID,
    });
    ContextIdFactory.apply(NO_STRATEGY);

    expect(contextId).toBe(CONTEXT_ID);
  });
});
```

The strategy tests call `ContextIdFactory.apply(NO_STRATEGY)` right after the call under test, because the strategy is static state shared by every test in the file. Keep that line exactly where it is.

## Must not change

- Every source file (`.ts` files that are not specs) and every existing spec.
- The test titles, fixtures and expected values in the blocks above.

## Acceptance criteria

- [ ] `npx vitest run packages/core/helpers/context-id-factory.spec.ts` reports `Test Files  1 passed (1)` and `Tests  11 passed (11)`.
- [ ] `node refactor-plan/tools/audit.mjs --files packages/core/helpers/context-id-factory.spec.ts --fail-on-any` prints only `files scanned: 1` and the header line, and exits 0.
- [ ] `npm run build` exits 0, and `find packages -name '*.spec.js' -not -path '*/node_modules/*' | wc -l` prints `0`.
- [ ] `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -c 'error TS'` prints `225` (none of T010–T014 adds a typecheck error, whatever order they run in), and
      `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -cE 'context-id-factory\.spec\.ts'` prints `0`.
- [ ] `npx prettier --check --end-of-line auto packages/core/helpers/context-id-factory.spec.ts` reports that all files use Prettier code style.
- [ ] `npx oxlint packages/core/helpers/context-id-factory.spec.ts` prints nothing and exits 0.
- [ ] `npx vitest run` passes as at baseline (D-18), with more test files and tests than before this task by exactly the numbers above.
- [ ] No source file changed: `git status --short` lists only the new spec file(s) above and `refactor-plan/PROGRESS.md`.
- [ ] No test was deleted or skipped, no expectation differs from the blocks above, and the new files contain no `any`, no cast other than `as unknown as`, and no comment.

## Stop and escalate if

- a spec file already exists at one of the paths above;
- a test fails. The expected values were recorded by running the current code
  at the baseline commit. A failure means the code is not at baseline, or you
  mistyped the spec. Compare your file with the block above character by
  character. **Never change an expectation to make a test pass**;
- the spec typecheck reports an error in a new file.

If you stop, delete the new file(s) (`packages/core/helpers/context-id-factory.spec.ts`), set the
task to `blocked` in PROGRESS.md with a one-paragraph reason, and stop.

## Finish

Set the task to `done` in PROGRESS.md, then commit `packages/core/helpers/context-id-factory.spec.ts` and
`refactor-plan/PROGRESS.md` together with the message
`test(core): characterise ContextIdFactory [T010]`.
