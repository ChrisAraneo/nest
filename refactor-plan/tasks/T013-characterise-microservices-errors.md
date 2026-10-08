# T013: Characterise the microservices transport errors

**Phase:** 2, Safety net · **Depends on:** T005 · **Lane:** D · **Size:** M

## Goal

Specs beside the five error classes in `packages/microservices/errors/` record their messages and base classes. All five had 0 % line coverage at baseline.

## Files

- In scope (may edit, create or delete): `packages/microservices/errors/empty-response.exception.spec.ts` (new), `packages/microservices/errors/invalid-grpc-message-decorator.exception.spec.ts` (new), `packages/microservices/errors/invalid-message.exception.spec.ts` (new), `packages/microservices/errors/invalid-tcp-data-reception.exception.spec.ts` (new), `packages/microservices/errors/net-socket-closed.exception.spec.ts` (new).
- Context (read, do not edit): `packages/microservices/errors/empty-response.exception.ts`, `packages/microservices/errors/invalid-grpc-message-decorator.exception.ts`, `packages/microservices/errors/invalid-message.exception.ts`, `packages/microservices/errors/invalid-tcp-data-reception.exception.ts`, `packages/microservices/errors/net-socket-closed.exception.ts`, `refactor-plan/RECIPES.md` C-16.
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

`EmptyResponseException(pattern)` and `NetSocketClosedException()` extend `Error`. `InvalidGrpcDecoratorException(metadata)`, `InvalidMessageException()` and `InvalidTcpDataReceptionException(err)` extend `RuntimeException` from `@nestjs/core/internal`. `InvalidTcpDataReceptionException` picks one of two messages depending on whether the text (or the error's string `message`) contains `Corrupted length value`. None of the five has a spec beside it.

T004 is `done`: `grep -c '"\*\*/\*\.spec\.ts"' packages/core/tsconfig.build.json` prints `1`.
Without it, the new spec would be compiled into the published package.

## Steps

1. Create each file below with exactly the content shown. These specs are
   characterisation tests: every expected value was recorded by running the
   current code at the baseline commit (`35142c3e`).
2. Run `npx prettier --check --end-of-line auto packages/microservices/errors/empty-response.exception.spec.ts packages/microservices/errors/invalid-grpc-message-decorator.exception.spec.ts packages/microservices/errors/invalid-message.exception.spec.ts packages/microservices/errors/invalid-tcp-data-reception.exception.spec.ts packages/microservices/errors/net-socket-closed.exception.spec.ts`. It must
   report that all files use Prettier code style. If it does not, you mistyped
   something: compare your file with the block again. Running
   `npx prettier --write` on the file afterwards is harmless: it changes nothing.
3. Run `npx vitest run packages/microservices/errors/empty-response.exception.spec.ts packages/microservices/errors/invalid-grpc-message-decorator.exception.spec.ts packages/microservices/errors/invalid-message.exception.spec.ts packages/microservices/errors/invalid-tcp-data-reception.exception.spec.ts packages/microservices/errors/net-socket-closed.exception.spec.ts`.

`packages/microservices/errors/empty-response.exception.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { EmptyResponseException } from './empty-response.exception.js';

const PATTERN = 'sum';

describe('EmptyResponseException', () => {
  it('should name the pattern in the message when nobody answers it', () => {
    expect(new EmptyResponseException(PATTERN).message).toBe(
      'Empty response. There are no subscribers listening to that message ("sum")',
    );
  });

  it('should show empty quotes in the message when the pattern is empty', () => {
    expect(new EmptyResponseException('').message).toBe(
      'Empty response. There are no subscribers listening to that message ("")',
    );
  });

  it('should be an error when it is created', () => {
    expect(new EmptyResponseException(PATTERN)).toBeInstanceOf(Error);
  });
});
```

`packages/microservices/errors/invalid-grpc-message-decorator.exception.spec.ts`:

```ts
import { RuntimeException } from '@nestjs/core/internal';
import { describe, expect, it } from 'vitest';

import { InvalidGrpcDecoratorException } from './invalid-grpc-message-decorator.exception.js';

const METADATA = {
  service: 'OrderService',
  rpc: 'FindOne',
  streaming: 'NO_STREAMING',
};

describe('InvalidGrpcDecoratorException', () => {
  it('should name the method and the service when the decorator is invalid', () => {
    expect(new InvalidGrpcDecoratorException(METADATA).message).toBe(
      'The invalid gRPC decorator (method "FindOne" in service "OrderService")',
    );
  });

  it('should be a runtime exception when it is created', () => {
    expect(new InvalidGrpcDecoratorException(METADATA)).toBeInstanceOf(
      RuntimeException,
    );
  });
});
```

`packages/microservices/errors/invalid-message.exception.spec.ts`:

```ts
import { RuntimeException } from '@nestjs/core/internal';
import { describe, expect, it } from 'vitest';

import { InvalidMessageException } from './invalid-message.exception.js';

describe('InvalidMessageException', () => {
  it('should blame a missing pattern or payload when it is created', () => {
    expect(new InvalidMessageException().message).toBe(
      'The invalid data or message pattern (undefined/null)',
    );
  });

  it('should be a runtime exception when it is created', () => {
    expect(new InvalidMessageException()).toBeInstanceOf(RuntimeException);
  });
});
```

`packages/microservices/errors/invalid-tcp-data-reception.exception.spec.ts`:

```ts
import { RuntimeException } from '@nestjs/core/internal';
import { describe, expect, it } from 'vitest';

import { InvalidTcpDataReceptionException } from './invalid-tcp-data-reception.exception.js';

const CORRUPTED_LENGTH_TEXT = 'Corrupted length value: 12abc';

const CORRUPTED_LENGTH_MESSAGE =
  'Corrupted length value of the received data supplied in a packet';

const INVALID_MESSAGE = 'The invalid received message from tcp server';

describe('InvalidTcpDataReceptionException', () => {
  it('should report a corrupted length when the text says the length is corrupted', () => {
    expect(
      new InvalidTcpDataReceptionException(CORRUPTED_LENGTH_TEXT).message,
    ).toBe(CORRUPTED_LENGTH_MESSAGE);
  });

  it('should report an invalid message when the text says anything else', () => {
    expect(new InvalidTcpDataReceptionException('socket hang up').message).toBe(
      INVALID_MESSAGE,
    );
  });

  it('should report a corrupted length when the error says the length is corrupted', () => {
    const error = new Error(CORRUPTED_LENGTH_TEXT);

    expect(new InvalidTcpDataReceptionException(error).message).toBe(
      CORRUPTED_LENGTH_MESSAGE,
    );
  });

  it('should report an invalid message when the error says anything else', () => {
    const error = new Error('socket hang up');

    expect(new InvalidTcpDataReceptionException(error).message).toBe(
      INVALID_MESSAGE,
    );
  });

  it('should report an invalid message when the error message is not text', () => {
    const error = { message: 12 } as unknown as Error;

    expect(new InvalidTcpDataReceptionException(error).message).toBe(
      INVALID_MESSAGE,
    );
  });

  it('should report an invalid message when the error is missing', () => {
    const error = null as unknown as Error;

    expect(new InvalidTcpDataReceptionException(error).message).toBe(
      INVALID_MESSAGE,
    );
  });

  it('should be a runtime exception when it is created', () => {
    expect(
      new InvalidTcpDataReceptionException('socket hang up'),
    ).toBeInstanceOf(RuntimeException);
  });
});
```

`packages/microservices/errors/net-socket-closed.exception.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { NetSocketClosedException } from './net-socket-closed.exception.js';

describe('NetSocketClosedException', () => {
  it('should say the socket is closed when it is created', () => {
    expect(new NetSocketClosedException().message).toBe(
      'The net socket is closed.',
    );
  });

  it('should be an error when it is created', () => {
    expect(new NetSocketClosedException()).toBeInstanceOf(Error);
  });
});
```

All five new spec files inherit the non-kebab base name of their source, so the audit reports one R-100 file-name hit per file (D-22). `as unknown as Error` builds two fixtures that the constructor's type does not allow. R-180 permits it in specs.

## Must not change

- Every source file (`.ts` files that are not specs) and every existing spec.
- The test titles, fixtures and expected values in the blocks above.

## Acceptance criteria

- [ ] `npx vitest run packages/microservices/errors/empty-response.exception.spec.ts packages/microservices/errors/invalid-grpc-message-decorator.exception.spec.ts packages/microservices/errors/invalid-message.exception.spec.ts packages/microservices/errors/invalid-tcp-data-reception.exception.spec.ts packages/microservices/errors/net-socket-closed.exception.spec.ts` reports `Test Files  5 passed (5)` and `Tests  16 passed (16)`.
- [ ] `node refactor-plan/tools/audit.mjs --files packages/microservices/errors/empty-response.exception.spec.ts,packages/microservices/errors/invalid-grpc-message-decorator.exception.spec.ts,packages/microservices/errors/invalid-message.exception.spec.ts,packages/microservices/errors/invalid-tcp-data-reception.exception.spec.ts,packages/microservices/errors/net-socket-closed.exception.spec.ts --format locations` prints exactly 5 line(s), each containing `R-100` and `not kebab-case` (inherited file names, D-22), and nothing else.
- [ ] `npm run build` exits 0, and `find packages -name '*.spec.js' -not -path '*/node_modules/*' | wc -l` prints `0`.
- [ ] `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -c 'error TS'` prints `225` (none of T010–T014 adds a typecheck error, whatever order they run in), and
      `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -cE 'empty-response\.exception\.spec\.ts|invalid-grpc-message-decorator\.exception\.spec\.ts|invalid-message\.exception\.spec\.ts|invalid-tcp-data-reception\.exception\.spec\.ts|net-socket-closed\.exception\.spec\.ts'` prints `0`.
- [ ] `npx prettier --check --end-of-line auto packages/microservices/errors/empty-response.exception.spec.ts packages/microservices/errors/invalid-grpc-message-decorator.exception.spec.ts packages/microservices/errors/invalid-message.exception.spec.ts packages/microservices/errors/invalid-tcp-data-reception.exception.spec.ts packages/microservices/errors/net-socket-closed.exception.spec.ts` reports that all files use Prettier code style.
- [ ] `npx oxlint packages/microservices/errors/empty-response.exception.spec.ts packages/microservices/errors/invalid-grpc-message-decorator.exception.spec.ts packages/microservices/errors/invalid-message.exception.spec.ts packages/microservices/errors/invalid-tcp-data-reception.exception.spec.ts packages/microservices/errors/net-socket-closed.exception.spec.ts` prints nothing and exits 0.
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

If you stop, delete the new file(s) (`packages/microservices/errors/empty-response.exception.spec.ts`, `packages/microservices/errors/invalid-grpc-message-decorator.exception.spec.ts`, `packages/microservices/errors/invalid-message.exception.spec.ts`, `packages/microservices/errors/invalid-tcp-data-reception.exception.spec.ts`, `packages/microservices/errors/net-socket-closed.exception.spec.ts`), set the
task to `blocked` in PROGRESS.md with a one-paragraph reason, and stop.

## Finish

Set the task to `done` in PROGRESS.md, then commit `packages/microservices/errors/empty-response.exception.spec.ts`, `packages/microservices/errors/invalid-grpc-message-decorator.exception.spec.ts`, `packages/microservices/errors/invalid-message.exception.spec.ts`, `packages/microservices/errors/invalid-tcp-data-reception.exception.spec.ts`, `packages/microservices/errors/net-socket-closed.exception.spec.ts` and
`refactor-plan/PROGRESS.md` together with the message
`test(microservices): characterise the transport errors [T013]`.
