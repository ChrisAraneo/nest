# T009: Checkpoint 1B: verify the library foundations

**Phase:** 1, Foundations · **Depends on:** T008, T015 · **Lane:** — · **Size:** S

> **Status gate:** `needs-detailing` until Q2 is answered (DECISIONS.md).

## Goal

Prove that T006–T008 added the libraries and helpers without changing any
existing behaviour, and that the library code works in the **built** output
(GUIDE §10.11 warns that `chain` can lose its methods in production builds).

## Files

- In scope (may edit, create or delete): none except `refactor-plan/PROGRESS.md`.
- Context (read, do not edit): `refactor-plan/CONTEXT.md` §3–4, `refactor-plan/DECISIONS.md` D-18.

## Rules and recipes

- R-142, R-181.

## Current state

T006, T007, T008 and T015 are `done`.

## Steps

1. Run every acceptance command in order and read the full output.
2. Write the key numbers into the PROGRESS.md notes column of T009.

## Must not change

Every file except `refactor-plan/PROGRESS.md`.

## Acceptance criteria

- [ ] `npm run build` exits 0.
- [ ] `node -e "import('./packages/common/utils/chain.js').then(m => console.log(m.chain([1, 2]).thru(items => items.length).value()))"`
      prints `2` (the **compiled** wrapper keeps its methods).
- [ ] `npx vitest run`: on Windows `Test Files  319 passed (320)` with the single
      baseline error; on Linux `Test Files  320 passed (320)` (305 baseline + 12
      from T010–T014 + 3 from T007–T008). Tests: on Linux `3888 passed (3888)`;
      on Windows `3851 passed (3888)` (the 37 tests of the crashing file do not run).
- [ ] `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -c 'error TS'` prints `225`.
- [ ] `npm run lint` exits 0 with the single baseline warning.
- [ ] `npm run lint:style` reports `0 errors`.
- [ ] `node refactor-plan/tools/function-names.mjs --check` exits 0.
- [ ] `git status --short` is empty apart from `refactor-plan/PROGRESS.md`.

## Stop and escalate if

Any check differs from its expected result. Record the command, the expected
result and the actual output.

If you stop, set the task to `blocked` in PROGRESS.md with a one-paragraph
reason, commit only PROGRESS.md (`chore(refactor-plan): block T009`), and stop.

## Finish

Set the task to `done` in PROGRESS.md, then commit `refactor-plan/PROGRESS.md`
with the message `chore(refactor-plan): checkpoint 1B [T009]`.
