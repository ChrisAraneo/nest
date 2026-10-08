# T014: Characterise `KafkaRetriableException` and `SerializeOptions`

**Phase:** 2, Safety net · **Depends on:** T005 · **Lane:** E · **Size:** S

## Goal

Specs beside `packages/microservices/exceptions/kafka-retriable-exception.ts` (0 % line coverage at baseline) and `packages/common/serializer/decorators/serialize-options.decorator.ts` (50 %) record their behaviour.

## Files

- In scope (may edit, create or delete): `packages/microservices/exceptions/kafka-retriable-exception.spec.ts` (new), `packages/common/serializer/decorators/serialize-options.decorator.spec.ts` (new).
- Context (read, do not edit): `packages/microservices/exceptions/kafka-retriable-exception.ts`, `packages/microservices/exceptions/rpc-exception.ts`, `packages/common/serializer/decorators/serialize-options.decorator.ts`, `packages/common/decorators/core/set-metadata.decorator.ts`, `packages/common/serializer/class-serializer.constants.ts`, `refactor-plan/RECIPES.md` C-16.
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

`KafkaRetriableException extends RpcException` and overrides `getError()` to return itself. `RpcException` takes its message from a string argument, from an object's string `message`, or else by splitting its class name into words. `SerializeOptions(options)` returns `SetMetadata(CLASS_SERIALIZER_OPTIONS, options)`, where `CLASS_SERIALIZER_OPTIONS` is `'class_serializer:options'`. Neither file has a spec beside it.

T004 is `done`: `grep -c '"\*\*/\*\.spec\.ts"' packages/core/tsconfig.build.json` prints `1`.
Without it, the new spec would be compiled into the published package.

## Steps

1. Create each file below with exactly the content shown. These specs are
   characterisation tests: every expected value was recorded by running the
   current code at the baseline commit (`35142c3e`).
2. Run `npx prettier --check --end-of-line auto packages/microservices/exceptions/kafka-retriable-exception.spec.ts packages/common/serializer/decorators/serialize-options.decorator.spec.ts`. It must
   report that all files use Prettier code style. If it does not, you mistyped
   something: compare your file with the block again. Running
   `npx prettier --write` on the file afterwards is harmless: it changes nothing.
3. Run `npx vitest run packages/microservices/exceptions/kafka-retriable-exception.spec.ts packages/common/serializer/decorators/serialize-options.decorator.spec.ts`.

`packages/microservices/exceptions/kafka-retriable-exception.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { KafkaRetriableException } from './kafka-retriable-exception.js';
import { RpcException } from './rpc-exception.js';

const MESSAGE = 'the broker is busy';

const DETAILS = { code: 'BROKER_BUSY' };

describe('KafkaRetriableException', () => {
  it('should hand back itself when it is asked for the error', () => {
    const exception = new KafkaRetriableException(MESSAGE);

    expect(exception.getError()).toBe(exception);
  });

  it('should keep the message when it is given text', () => {
    expect(new KafkaRetriableException(MESSAGE).message).toBe(MESSAGE);
  });

  it('should spell out its class name when it is given details without a message', () => {
    expect(new KafkaRetriableException(DETAILS).message).toBe(
      'Kafka Retriable Exception',
    );
  });

  it('should be an rpc exception when it is created', () => {
    expect(new KafkaRetriableException(MESSAGE)).toBeInstanceOf(RpcException);
  });
});
```

`packages/common/serializer/decorators/serialize-options.decorator.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { CLASS_SERIALIZER_OPTIONS } from '../class-serializer.constants.js';
import { SerializeOptions } from './serialize-options.decorator.js';

const OPTIONS = { excludePrefixes: ['_'] };

const createHandler =
  () =>
  (orderId: string): string =>
    orderId;

describe('SerializeOptions', () => {
  it('should store the options on the target when it decorates a class', () => {
    const target = createHandler();

    SerializeOptions(OPTIONS)(target);

    expect(Reflect.getMetadata(CLASS_SERIALIZER_OPTIONS, target)).toBe(OPTIONS);
  });

  it('should store the options on the handler when it decorates a method', () => {
    const handler = createHandler();
    const descriptor = { value: handler };

    SerializeOptions(OPTIONS)({}, 'findOrder', descriptor);

    expect(Reflect.getMetadata(CLASS_SERIALIZER_OPTIONS, handler)).toBe(
      OPTIONS,
    );
  });

  it('should expose the serializer options key when it is created', () => {
    expect(SerializeOptions(OPTIONS).KEY).toBe(CLASS_SERIALIZER_OPTIONS);
  });
});
```

`serialize-options.decorator.spec.ts` inherits the non-kebab base name of its source, so the audit reports one R-100 file-name hit for it (D-22). The spec decorates plain functions instead of classes because R-041 bans classes in specs too. `SetMetadata` stores the metadata on whatever target it gets.

## Must not change

- Every source file (`.ts` files that are not specs) and every existing spec.
- The test titles, fixtures and expected values in the blocks above.

## Acceptance criteria

- [ ] `npx vitest run packages/microservices/exceptions/kafka-retriable-exception.spec.ts packages/common/serializer/decorators/serialize-options.decorator.spec.ts` reports `Test Files  2 passed (2)` and `Tests  7 passed (7)`.
- [ ] `node refactor-plan/tools/audit.mjs --files packages/microservices/exceptions/kafka-retriable-exception.spec.ts,packages/common/serializer/decorators/serialize-options.decorator.spec.ts --format locations` prints exactly 1 line(s), each containing `R-100` and `not kebab-case` (inherited file names, D-22), and nothing else.
- [ ] `npm run build` exits 0, and `find packages -name '*.spec.js' -not -path '*/node_modules/*' | wc -l` prints `0`.
- [ ] `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -c 'error TS'` prints `225` (none of T010–T014 adds a typecheck error, whatever order they run in), and
      `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -cE 'kafka-retriable-exception\.spec\.ts|serialize-options\.decorator\.spec\.ts'` prints `0`.
- [ ] `npx prettier --check --end-of-line auto packages/microservices/exceptions/kafka-retriable-exception.spec.ts packages/common/serializer/decorators/serialize-options.decorator.spec.ts` reports that all files use Prettier code style.
- [ ] `npx oxlint packages/microservices/exceptions/kafka-retriable-exception.spec.ts packages/common/serializer/decorators/serialize-options.decorator.spec.ts` prints nothing and exits 0.
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

If you stop, delete the new file(s) (`packages/microservices/exceptions/kafka-retriable-exception.spec.ts`, `packages/common/serializer/decorators/serialize-options.decorator.spec.ts`), set the
task to `blocked` in PROGRESS.md with a one-paragraph reason, and stop.

## Finish

Set the task to `done` in PROGRESS.md, then commit `packages/microservices/exceptions/kafka-retriable-exception.spec.ts`, `packages/common/serializer/decorators/serialize-options.decorator.spec.ts` and
`refactor-plan/PROGRESS.md` together with the message
`test: characterise KafkaRetriableException and SerializeOptions [T014]`.
