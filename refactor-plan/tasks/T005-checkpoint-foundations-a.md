# T005: Checkpoint 1A: verify the foundations against the baseline

**Phase:** 1, Foundations · **Depends on:** T001, T002, T003, T004 · **Lane:** — · **Size:** S

## Goal

Prove that T001–T004 changed tooling and documents only: every check gives the
baseline result.

## Files

- In scope (may edit, create or delete): none except `refactor-plan/PROGRESS.md`.
- Context (read, do not edit): `refactor-plan/CONTEXT.md` §3–4,
  `refactor-plan/DECISIONS.md` D-18, `refactor-plan/baseline/*`.
- Every other file is out of scope. If a check fails, do not fix anything.

## Rules and recipes

- R-181: "Know the command that actually runs them."
- R-118: "Run the typecheck the way the repository is wired".

## Current state

T001, T002, T003 and T004 are `done` in PROGRESS.md, and `git log --oneline -5`
shows their four commits.

## Steps

1. Run every command in "Acceptance criteria", in order, and read the full
   output of each.
2. Write the key numbers into the PROGRESS.md notes column of T005, in one line:
   test files passed / tests passed, spec typecheck error count, ESLint
   warning count, audit file count.

## Must not change

Every file except `refactor-plan/PROGRESS.md`.

## Acceptance criteria

- [ ] `npm run build` exits 0.
- [ ] `npx vitest run` gives the baseline result. On Windows: `Test Files  304 passed (305)`,
      `Tests  3777 passed (3814)`, `Errors  1 error`, and the error names only
      `packages/core/test/nest-application-context.spec.ts`. On Linux:
      `Test Files  305 passed (305)`, `Tests  3814 passed (3814)`.
- [ ] `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -c 'error TS'` prints `225`.
- [ ] `npm run lint` exits 0 with exactly one warning (`packages/websockets/socket-module.ts:60`).
- [ ] `npm run lint:style` ends with `✖ 11909 problems (0 errors, 11909 warnings)`.
- [ ] `node refactor-plan/tools/audit.mjs | diff --strip-trailing-cr - refactor-plan/baseline/audit-summary.txt`
      prints nothing.
- [ ] `node refactor-plan/tools/function-names.mjs --check` exits 0.
- [ ] `git status --short` is empty apart from `refactor-plan/PROGRESS.md`.

## Stop and escalate if

Any check differs from its expected result. Do not try to fix it. Record the
command, the expected result and the actual output in the notes.

If you stop, set the task to `blocked` in PROGRESS.md with a one-paragraph
reason, commit only PROGRESS.md (`chore(refactor-plan): block T005`), and stop.

## Finish

Set the task to `done` in PROGRESS.md, then commit `refactor-plan/PROGRESS.md`
with the message `chore(refactor-plan): checkpoint 1A [T005]`.
