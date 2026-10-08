# T008: Create the shared `tapEffect` and `getErrorMessage` helpers

**Phase:** 1, Foundations · **Depends on:** T007 · **Lane:** A · **Size:** S

> **Status gate:** `needs-detailing` until Q2 is answered (DECISIONS.md).

## Goal

The two helpers the guide prescribes exist once, in `@nestjs/common`, with
specs beside them, and are reachable from `@nestjs/common/internal`.

## Files

- In scope (may edit, create or delete): `packages/common/utils/tap-effect.ts`,
  `packages/common/utils/tap-effect.spec.ts`,
  `packages/common/utils/get-error-message.ts`,
  `packages/common/utils/get-error-message.spec.ts` (all new),
  `packages/common/internal.ts`, `docs/FUNCTION_NAMES.md`.
- Context (read, do not edit): `refactor-plan/RECIPES.md` C-06, C-16.
- Every other file is out of scope. Do not touch it, even to fix something
  that is obviously wrong. Write it in the notes column of PROGRESS.md instead.

## Rules and recipes

- R-075: "When a chain step must run an effect and pass its value on, use a `tapEffect` helper of your own".
- R-072: "Normalize an unknown error with `match`, in its own named helper".
- R-063: "Destructure every pattern helper off `P` at the top of the file."
- R-104: regenerate the function-name index.
- C-16 for the specs.

## Current state

None of the four new files exists. `packages/common/internal.ts` contains
`export * from './utils/chain.js';` (added by T007).

## Steps

1. `packages/common/utils/tap-effect.ts`:

   ```ts
   import { match } from 'ts-pattern';

   export const tapEffect = <T>(value: T, effect: (value: T) => void): T =>
     match(effect(value)).otherwise(() => value);
   ```

2. `packages/common/utils/tap-effect.spec.ts`:

   ```ts
   import { describe, expect, it } from 'vitest';

   import { tapEffect } from './tap-effect.js';

   const ORDER = { id: 'order-1' };

   describe('tapEffect', () => {
     it('should hand back the same value when it runs the effect', () => {
       expect(tapEffect(ORDER, String)).toBe(ORDER);
     });

     it('should run the effect once with the value when it taps the value', () => {
       const seen: unknown[] = [];

       tapEffect(ORDER, order => seen.push(order));

       expect(seen).toEqual([ORDER]);
     });

     it('should hand back nothing when the value is missing', () => {
       expect(tapEffect(undefined, String)).toBeUndefined();
     });
   });
   ```

3. `packages/common/utils/get-error-message.ts`:

   ```ts
   import { match, P } from 'ts-pattern';

   const { instanceOf, string } = P;

   export const getErrorMessage = (error: unknown): string =>
     match(error)
       .with(instanceOf(Error), error => error.message)
       .with(string, text => text)
       .otherwise(() => 'Unknown error occurred');
   ```

4. `packages/common/utils/get-error-message.spec.ts`:

   ```ts
   import { describe, expect, it } from 'vitest';

   import { getErrorMessage } from './get-error-message.js';

   const MESSAGE = 'the order is gone';

   const UNKNOWN_ERROR_MESSAGE = 'Unknown error occurred';

   describe('getErrorMessage', () => {
     it('should give the error message when it gets an error', () => {
       expect(getErrorMessage(new Error(MESSAGE))).toBe(MESSAGE);
     });

     it('should give the text itself when it gets text', () => {
       expect(getErrorMessage(MESSAGE)).toBe(MESSAGE);
     });

     it('should give an empty message when the error has no message', () => {
       expect(getErrorMessage(new Error())).toBe('');
     });

     it('should give the unknown-error message when it gets anything else', () => {
       expect(getErrorMessage({ message: MESSAGE })).toBe(UNKNOWN_ERROR_MESSAGE);
     });

     it('should give the unknown-error message when the error is missing', () => {
       expect(getErrorMessage(undefined)).toBe(UNKNOWN_ERROR_MESSAGE);
     });
   });
   ```

5. In `packages/common/internal.ts`, directly after
   `export * from './utils/chain.js';`, add:

   ```ts
   export * from './utils/get-error-message.js';
   export * from './utils/tap-effect.js';
   ```

6. Run `npx prettier --write` on the five `.ts` files you created or changed.
7. Run `node refactor-plan/tools/function-names.mjs --write`.

## Must not change

Every existing export of `packages/common/internal.ts`; every other file.

## Acceptance criteria

- [ ] `npx vitest run packages/common/utils` reports `Test Files  3 passed (3)` and `Tests  11 passed (11)`.
- [ ] `npm run build` exits 0, and `find packages -name '*.spec.js' -not -path '*/node_modules/*' | wc -l` prints `0`.
- [ ] `npx vitest run` gives the T007 result plus 2 files and 8 tests.
- [ ] `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -c 'error TS'` is unchanged from before this task.
- [ ] `node refactor-plan/tools/audit.mjs --files packages/common/utils/tap-effect.ts,packages/common/utils/tap-effect.spec.ts,packages/common/utils/get-error-message.ts,packages/common/utils/get-error-message.spec.ts --fail-on-any`
      prints only the two header lines (`files scanned: 4`, `rule      total   files  by kind`) and exits 0.
- [ ] `node refactor-plan/tools/function-names.mjs --check` exits 0 and reports 1 403 names.
- [ ] `git status --short` lists only the in-scope files and `refactor-plan/PROGRESS.md`.

## Stop and escalate if

- a test fails or the build fails;
- the function-name count is not 1 403.

If you stop, delete the four new files, run
`git restore --staged --worktree -- packages/common/internal.ts docs/FUNCTION_NAMES.md`,
set the task to `blocked` in PROGRESS.md with a one-paragraph reason, and stop.

## Finish

Set the task to `done` in PROGRESS.md, then commit the in-scope files and
`refactor-plan/PROGRESS.md` together with the message
`feat(common): add the tapEffect and getErrorMessage helpers [T008]`.
