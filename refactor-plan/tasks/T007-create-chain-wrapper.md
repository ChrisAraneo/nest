# T007: Create the `chain` wrapper module

**Phase:** 1, Foundations · **Depends on:** T006 · **Lane:** A · **Size:** S

> **Status gate:** `needs-detailing` until Q2 is answered (DECISIONS.md).

## Goal

`chain` is available from `packages/common/utils/chain.ts` (relatively inside
`common`) and from `@nestjs/common/internal` (other packages), exactly as
GUIDE §10.11 prescribes. Its spec sits beside it, and ESLint exempts only this
file from the namespace-import selector.

## Files

- In scope (may edit, create or delete): `packages/common/utils/chain.ts` (new),
  `packages/common/utils/chain.spec.ts` (new), `packages/common/internal.ts`,
  `eslint.config.mjs`.
- Context (read, do not edit): `refactor-plan/DECISIONS.md` D-02, D-06.
- Every other file is out of scope. Do not touch it, even to fix something
  that is obviously wrong. Write it in the notes column of PROGRESS.md instead.

## Rules and recipes

- R-142: "`chain` must come from a local wrapper, NEVER straight from `lodash-es`. … Re-export it once, off the lodash default export, and import `chain` from that module everywhere … End every chain with `.value()`."
- R-122 / D-06: "This wrapper module is the one place a namespace import of lodash is allowed."
- C-16 for the spec.

## Current state

`packages/common/utils/chain.ts` does not exist. `packages/common/internal.ts`
has a `// Utils` block whose last line is
`export * from './utils/select-exception-filter-metadata.util.js';`.

## Steps

1. Create `packages/common/utils/chain.ts`:

   ```ts
   import * as lodashModule from 'lodash-es';

   const lodash = (lodashModule as unknown as { default: typeof lodashModule })
     .default;

   export const { chain } = lodash;
   ```

2. Create `packages/common/utils/chain.spec.ts`:

   ```ts
   import { size } from 'lodash-es';
   import { describe, expect, it } from 'vitest';

   import { chain } from './chain.js';

   const ORDER_TOTALS = [3, 5, 8];

   describe('chain', () => {
     it('should flow the value through every step when it ends with value', () => {
       expect(
         chain(ORDER_TOTALS)
           .thru(totals => size(totals))
           .value(),
       ).toBe(3);
     });

     it('should hand back the same value when there are no steps', () => {
       expect(chain(ORDER_TOTALS).value()).toBe(ORDER_TOTALS);
     });

     it('should carry an object forward when each step adds a property', () => {
       expect(
         chain({ totals: ORDER_TOTALS })
           .thru(({ totals }) => ({ totals, count: size(totals) }))
           .thru(({ count }) => count)
           .value(),
       ).toBe(3);
     });
   });
   ```

3. In `packages/common/internal.ts`, directly after the line
   `export * from './utils/select-exception-filter-metadata.util.js';`, add:

   ```ts
   export * from './utils/chain.js';
   ```

4. In `eslint.config.mjs`, add a second object to the array passed to
   `defineConfig`, after the existing object:

   ```js
     {
       files: ['packages/common/utils/chain.ts'],
       rules: {
         'no-restricted-syntax': [
           'warn',
           ...RESTRICTED_SYNTAX.filter(
             entry => !entry.selector.includes('ImportNamespaceSpecifier'),
           ),
         ],
       },
     },
   ```

5. Run `npx prettier --write packages/common/utils/chain.ts packages/common/utils/chain.spec.ts packages/common/internal.ts`.

## Must not change

Every existing export of `packages/common/internal.ts`; every other file.

## Acceptance criteria

- [ ] `npx vitest run packages/common/utils/chain.spec.ts` reports `Tests  3 passed (3)`.
- [ ] `npm run build` exits 0, and `find packages -name '*.spec.js' -not -path '*/node_modules/*' | wc -l` prints `0`.
- [ ] `npx vitest run` gives the baseline result plus 1 file and 3 tests.
- [ ] `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -c 'error TS'` prints the same number as before this task, and `… | grep -c 'utils/chain'` prints `0`.
- [ ] `npx eslint packages/common/utils/chain.ts packages/common/utils/chain.spec.ts` reports 0 problems.
- [ ] `node refactor-plan/tools/audit.mjs --files packages/common/utils/chain.ts,packages/common/utils/chain.spec.ts --format locations`
      prints exactly one line: `packages/common/utils/chain.ts:3:17 R-115 [<module>] as { default: typeof lodashModule }` (the D-06 exception).
- [ ] `git status --short` lists only the four in-scope files and `refactor-plan/PROGRESS.md`.

## Stop and escalate if

- `chain(…).thru` is not a function at runtime (the lodash default export lacks
  the wrapper methods);
- any check fails and fixing it needs a file outside this task.

If you stop, delete the two new files, run
`git restore --staged --worktree -- packages/common/internal.ts eslint.config.mjs`,
set the task to `blocked` in PROGRESS.md with a one-paragraph reason, and stop.

## Finish

Set the task to `done` in PROGRESS.md, then commit the four in-scope files and
`refactor-plan/PROGRESS.md` together with the message
`feat(common): add the chain wrapper module [T007]`.
