# T011: Characterise the gRPC exceptions

**Phase:** 2, Safety net · **Depends on:** T005 · **Lane:** B · **Size:** S

## Goal

A spec beside `packages/microservices/exceptions/grpc-exception.ts` records the code and default message of `GrpcException` and each of its 16 status-specific subclasses. Line coverage of that file was 25 % at baseline.

## Files

- In scope (may edit, create or delete): `packages/microservices/exceptions/grpc-exception.spec.ts` (new).
- Context (read, do not edit): `packages/microservices/exceptions/grpc-exception.ts`, `packages/microservices/enums/grpc-status.enum.ts`, `refactor-plan/RECIPES.md` C-16.
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

`packages/microservices/exceptions/grpc-exception.ts` exports `GrpcException` (constructor `(message, code = GrpcStatus.UNKNOWN)`, methods `getCode()` and `getError()`) and 16 subclasses, from `GrpcCancelledException` to `GrpcUnauthenticatedException`, each with a default message. The existing spec `packages/microservices/test/exceptions/grpc-exception.spec.ts` covers two cases and stays unchanged.

T004 is `done`: `grep -c '"\*\*/\*\.spec\.ts"' packages/core/tsconfig.build.json` prints `1`.
Without it, the new spec would be compiled into the published package.

## Steps

1. Create each file below with exactly the content shown. These specs are
   characterisation tests: every expected value was recorded by running the
   current code at the baseline commit (`35142c3e`).
2. Run `npx prettier --check --end-of-line auto packages/microservices/exceptions/grpc-exception.spec.ts`. It must
   report that all files use Prettier code style. If it does not, you mistyped
   something: compare your file with the block again. Running
   `npx prettier --write` on the file afterwards is harmless: it changes nothing.
3. Run `npx vitest run packages/microservices/exceptions/grpc-exception.spec.ts`.

`packages/microservices/exceptions/grpc-exception.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { GrpcStatus } from '../enums/grpc-status.enum.js';
import {
  GrpcAbortedException,
  GrpcAlreadyExistsException,
  GrpcCancelledException,
  GrpcDataLossException,
  GrpcDeadlineExceededException,
  GrpcException,
  GrpcFailedPreconditionException,
  GrpcInternalException,
  GrpcInvalidArgumentException,
  GrpcNotFoundException,
  GrpcOutOfRangeException,
  GrpcPermissionDeniedException,
  GrpcResourceExhaustedException,
  GrpcUnauthenticatedException,
  GrpcUnavailableException,
  GrpcUnimplementedException,
  GrpcUnknownException,
} from './grpc-exception.js';

const MESSAGE = 'the order is gone';

describe('GrpcException', () => {
  it('should keep the message and report the unknown status when no status is given', () => {
    const exception = new GrpcException(MESSAGE);

    expect(exception.message).toBe(MESSAGE);
    expect(exception.getCode()).toBe(GrpcStatus.UNKNOWN);
    expect(exception.getError()).toEqual({
      code: GrpcStatus.UNKNOWN,
      message: MESSAGE,
    });
  });

  it('should report the given status when one is given', () => {
    const exception = new GrpcException(MESSAGE, GrpcStatus.NOT_FOUND);

    expect(exception.getCode()).toBe(GrpcStatus.NOT_FOUND);
    expect(exception.getError()).toEqual({
      code: GrpcStatus.NOT_FOUND,
      message: MESSAGE,
    });
  });

  it('should be an error when it is created', () => {
    expect(new GrpcException(MESSAGE)).toBeInstanceOf(Error);
  });

  it('should keep a custom message when a status-specific exception gets one', () => {
    expect(new GrpcNotFoundException(MESSAGE).getError()).toEqual({
      code: GrpcStatus.NOT_FOUND,
      message: MESSAGE,
    });
  });

  it('should describe a cancelled call when it is a cancelled exception', () => {
    expect(new GrpcCancelledException().getError()).toEqual({
      code: GrpcStatus.CANCELLED,
      message: 'Cancelled',
    });
  });

  it('should describe an unknown failure when it is an unknown exception', () => {
    expect(new GrpcUnknownException().getError()).toEqual({
      code: GrpcStatus.UNKNOWN,
      message: 'Unknown',
    });
  });

  it('should describe a bad argument when it is an invalid-argument exception', () => {
    expect(new GrpcInvalidArgumentException().getError()).toEqual({
      code: GrpcStatus.INVALID_ARGUMENT,
      message: 'Invalid argument',
    });
  });

  it('should describe a missed deadline when it is a deadline-exceeded exception', () => {
    expect(new GrpcDeadlineExceededException().getError()).toEqual({
      code: GrpcStatus.DEADLINE_EXCEEDED,
      message: 'Deadline exceeded',
    });
  });

  it('should describe a missing resource when it is a not-found exception', () => {
    expect(new GrpcNotFoundException().getError()).toEqual({
      code: GrpcStatus.NOT_FOUND,
      message: 'Not found',
    });
  });

  it('should describe a duplicate when it is an already-exists exception', () => {
    expect(new GrpcAlreadyExistsException().getError()).toEqual({
      code: GrpcStatus.ALREADY_EXISTS,
      message: 'Already exists',
    });
  });

  it('should describe a refusal when it is a permission-denied exception', () => {
    expect(new GrpcPermissionDeniedException().getError()).toEqual({
      code: GrpcStatus.PERMISSION_DENIED,
      message: 'Permission denied',
    });
  });

  it('should describe a used-up quota when it is a resource-exhausted exception', () => {
    expect(new GrpcResourceExhaustedException().getError()).toEqual({
      code: GrpcStatus.RESOURCE_EXHAUSTED,
      message: 'Resource exhausted',
    });
  });

  it('should describe an unmet precondition when it is a failed-precondition exception', () => {
    expect(new GrpcFailedPreconditionException().getError()).toEqual({
      code: GrpcStatus.FAILED_PRECONDITION,
      message: 'Failed precondition',
    });
  });

  it('should describe an aborted call when it is an aborted exception', () => {
    expect(new GrpcAbortedException().getError()).toEqual({
      code: GrpcStatus.ABORTED,
      message: 'Aborted',
    });
  });

  it('should describe a value out of range when it is an out-of-range exception', () => {
    expect(new GrpcOutOfRangeException().getError()).toEqual({
      code: GrpcStatus.OUT_OF_RANGE,
      message: 'Out of range',
    });
  });

  it('should describe a missing method when it is an unimplemented exception', () => {
    expect(new GrpcUnimplementedException().getError()).toEqual({
      code: GrpcStatus.UNIMPLEMENTED,
      message: 'Unimplemented',
    });
  });

  it('should describe a server fault when it is an internal exception', () => {
    expect(new GrpcInternalException().getError()).toEqual({
      code: GrpcStatus.INTERNAL,
      message: 'Internal',
    });
  });

  it('should describe a down service when it is an unavailable exception', () => {
    expect(new GrpcUnavailableException().getError()).toEqual({
      code: GrpcStatus.UNAVAILABLE,
      message: 'Unavailable',
    });
  });

  it('should describe lost data when it is a data-loss exception', () => {
    expect(new GrpcDataLossException().getError()).toEqual({
      code: GrpcStatus.DATA_LOSS,
      message: 'Data loss',
    });
  });

  it('should describe a missing login when it is an unauthenticated exception', () => {
    expect(new GrpcUnauthenticatedException().getError()).toEqual({
      code: GrpcStatus.UNAUTHENTICATED,
      message: 'Unauthenticated',
    });
  });
});
```

One test per subclass is deliberate: `it.each` and loops are banned (R-171, R-014).

## Must not change

- Every source file (`.ts` files that are not specs) and every existing spec.
- The test titles, fixtures and expected values in the blocks above.

## Acceptance criteria

- [ ] `npx vitest run packages/microservices/exceptions/grpc-exception.spec.ts` reports `Test Files  1 passed (1)` and `Tests  20 passed (20)`.
- [ ] `node refactor-plan/tools/audit.mjs --files packages/microservices/exceptions/grpc-exception.spec.ts --fail-on-any` prints only `files scanned: 1` and the header line, and exits 0.
- [ ] `npm run build` exits 0, and `find packages -name '*.spec.js' -not -path '*/node_modules/*' | wc -l` prints `0`.
- [ ] `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -c 'error TS'` prints `225` (none of T010–T014 adds a typecheck error, whatever order they run in), and
      `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -cE 'grpc-exception\.spec\.ts'` prints `0`.
- [ ] `npx prettier --check --end-of-line auto packages/microservices/exceptions/grpc-exception.spec.ts` reports that all files use Prettier code style.
- [ ] `npx oxlint packages/microservices/exceptions/grpc-exception.spec.ts` prints nothing and exits 0.
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

If you stop, delete the new file(s) (`packages/microservices/exceptions/grpc-exception.spec.ts`), set the
task to `blocked` in PROGRESS.md with a one-paragraph reason, and stop.

## Finish

Set the task to `done` in PROGRESS.md, then commit `packages/microservices/exceptions/grpc-exception.spec.ts` and
`refactor-plan/PROGRESS.md` together with the message
`test(microservices): characterise the gRPC exceptions [T011]`.
