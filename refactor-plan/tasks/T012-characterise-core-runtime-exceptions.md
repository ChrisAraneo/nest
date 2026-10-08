# T012: Characterise core's runtime exceptions

**Phase:** 2, Safety net · **Depends on:** T005 · **Lane:** C · **Size:** S

## Goal

Specs beside three exception files in `packages/core/errors/exceptions/` record their messages and base classes. Two of them had 0 % line coverage at baseline, the third 50 %.

## Files

- In scope (may edit, create or delete): `packages/core/errors/exceptions/runtime.exception.spec.ts` (new), `packages/core/errors/exceptions/invalid-class.exception.spec.ts` (new), `packages/core/errors/exceptions/invalid-middleware-configuration.exception.spec.ts` (new).
- Context (read, do not edit): `packages/core/errors/exceptions/runtime.exception.ts`, `packages/core/errors/exceptions/invalid-class.exception.ts`, `packages/core/errors/exceptions/invalid-middleware-configuration.exception.ts`, `packages/core/errors/messages.ts` (`INVALID_CLASS_MESSAGE` ~L252, `INVALID_MIDDLEWARE_CONFIGURATION` ~L294), `refactor-plan/RECIPES.md` C-16.
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

`RuntimeException extends Error` with constructor `(message = '')` and `what()`. `InvalidClassException extends RuntimeException` builds its message with the tag `INVALID_CLASS_MESSAGE`. `InvalidMiddlewareConfigurationException extends RuntimeException` uses `INVALID_MIDDLEWARE_CONFIGURATION`. None of the three has a spec beside it.

T004 is `done`: `grep -c '"\*\*/\*\.spec\.ts"' packages/core/tsconfig.build.json` prints `1`.
Without it, the new spec would be compiled into the published package.

## Steps

1. Create each file below with exactly the content shown. These specs are
   characterisation tests: every expected value was recorded by running the
   current code at the baseline commit (`35142c3e`).
2. Run `npx prettier --check --end-of-line auto packages/core/errors/exceptions/runtime.exception.spec.ts packages/core/errors/exceptions/invalid-class.exception.spec.ts packages/core/errors/exceptions/invalid-middleware-configuration.exception.spec.ts`. It must
   report that all files use Prettier code style. If it does not, you mistyped
   something: compare your file with the block again. Running
   `npx prettier --write` on the file afterwards is harmless: it changes nothing.
3. Run `npx vitest run packages/core/errors/exceptions/runtime.exception.spec.ts packages/core/errors/exceptions/invalid-class.exception.spec.ts packages/core/errors/exceptions/invalid-middleware-configuration.exception.spec.ts`.

`packages/core/errors/exceptions/runtime.exception.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { RuntimeException } from './runtime.exception.js';

const MESSAGE = 'the module could not start';

describe('RuntimeException', () => {
  it('should keep the message when it is given one', () => {
    expect(new RuntimeException(MESSAGE).message).toBe(MESSAGE);
  });

  it('should have an empty message when it is given none', () => {
    expect(new RuntimeException().message).toBe('');
  });

  it('should return its message when it is asked what went wrong', () => {
    expect(new RuntimeException(MESSAGE).what()).toBe(MESSAGE);
  });

  it('should be an error when it is created', () => {
    expect(new RuntimeException()).toBeInstanceOf(Error);
  });
});
```

`packages/core/errors/exceptions/invalid-class.exception.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { InvalidClassException } from './invalid-class.exception.js';
import { RuntimeException } from './runtime.exception.js';

describe('InvalidClassException', () => {
  it('should name the value in the message when the value is not constructable', () => {
    expect(new InvalidClassException('OrderService').message).toBe(
      'ModuleRef cannot instantiate class (OrderService is not constructable).',
    );
  });

  it('should print undefined in the message when the value is missing', () => {
    expect(new InvalidClassException(undefined).message).toBe(
      'ModuleRef cannot instantiate class (undefined is not constructable).',
    );
  });

  it('should be a runtime exception when it is created', () => {
    expect(new InvalidClassException('OrderService')).toBeInstanceOf(
      RuntimeException,
    );
  });
});
```

`packages/core/errors/exceptions/invalid-middleware-configuration.exception.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { InvalidMiddlewareConfigurationException } from './invalid-middleware-configuration.exception.js';
import { RuntimeException } from './runtime.exception.js';

describe('InvalidMiddlewareConfigurationException', () => {
  it('should point at the configure method when it is created', () => {
    expect(new InvalidMiddlewareConfigurationException().message).toBe(
      "An invalid middleware configuration has been passed inside the module 'configure()' method.",
    );
  });

  it('should be a runtime exception when it is created', () => {
    expect(new InvalidMiddlewareConfigurationException()).toBeInstanceOf(
      RuntimeException,
    );
  });
});
```

Three of the new spec files inherit the non-kebab base name of their source (`*.exception.spec.ts`), so the audit reports one R-100 file-name hit per file. That is expected (D-22).

## Must not change

- Every source file (`.ts` files that are not specs) and every existing spec.
- The test titles, fixtures and expected values in the blocks above.

## Acceptance criteria

- [ ] `npx vitest run packages/core/errors/exceptions/runtime.exception.spec.ts packages/core/errors/exceptions/invalid-class.exception.spec.ts packages/core/errors/exceptions/invalid-middleware-configuration.exception.spec.ts` reports `Test Files  3 passed (3)` and `Tests  9 passed (9)`.
- [ ] `node refactor-plan/tools/audit.mjs --files packages/core/errors/exceptions/runtime.exception.spec.ts,packages/core/errors/exceptions/invalid-class.exception.spec.ts,packages/core/errors/exceptions/invalid-middleware-configuration.exception.spec.ts --format locations` prints exactly 3 line(s), each containing `R-100` and `not kebab-case` (inherited file names, D-22), and nothing else.
- [ ] `npm run build` exits 0, and `find packages -name '*.spec.js' -not -path '*/node_modules/*' | wc -l` prints `0`.
- [ ] `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -c 'error TS'` prints `225` (none of T010–T014 adds a typecheck error, whatever order they run in), and
      `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -cE 'runtime\.exception\.spec\.ts|invalid-class\.exception\.spec\.ts|invalid-middleware-configuration\.exception\.spec\.ts'` prints `0`.
- [ ] `npx prettier --check --end-of-line auto packages/core/errors/exceptions/runtime.exception.spec.ts packages/core/errors/exceptions/invalid-class.exception.spec.ts packages/core/errors/exceptions/invalid-middleware-configuration.exception.spec.ts` reports that all files use Prettier code style.
- [ ] `npx oxlint packages/core/errors/exceptions/runtime.exception.spec.ts packages/core/errors/exceptions/invalid-class.exception.spec.ts packages/core/errors/exceptions/invalid-middleware-configuration.exception.spec.ts` prints nothing and exits 0.
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

If you stop, delete the new file(s) (`packages/core/errors/exceptions/runtime.exception.spec.ts`, `packages/core/errors/exceptions/invalid-class.exception.spec.ts`, `packages/core/errors/exceptions/invalid-middleware-configuration.exception.spec.ts`), set the
task to `blocked` in PROGRESS.md with a one-paragraph reason, and stop.

## Finish

Set the task to `done` in PROGRESS.md, then commit `packages/core/errors/exceptions/runtime.exception.spec.ts`, `packages/core/errors/exceptions/invalid-class.exception.spec.ts`, `packages/core/errors/exceptions/invalid-middleware-configuration.exception.spec.ts` and
`refactor-plan/PROGRESS.md` together with the message
`test(core): characterise core's runtime exceptions [T012]`.
