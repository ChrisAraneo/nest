# T015: Checkpoint 2A: verify the first safety net

**Phase:** 2, Safety net · **Depends on:** T010, T011, T012, T013, T014 · **Lane:** — · **Size:** S

## Goal

Prove that T010–T014 added 12 spec files and 63 tests and changed nothing
else, and that the audit moved exactly as predicted.

## Files

- In scope (may edit, create or delete): none except `refactor-plan/PROGRESS.md`.
- Context (read, do not edit): `refactor-plan/CONTEXT.md` §3–4,
  `refactor-plan/DECISIONS.md` D-18, D-22, `refactor-plan/baseline/audit-summary.txt`.
- Every other file is out of scope. If a check fails, do not fix anything.

## Rules and recipes

- R-181: "Know the command that actually runs them."

## Current state

T005, T010, T011, T012, T013 and T014 are `done` in PROGRESS.md.

## Steps

1. Run every command in "Acceptance criteria", in order, and read the full output.
2. Write the key numbers into the PROGRESS.md notes column of T015.
3. Tell the human, in the notes column, that this is a good point to merge the
   lanes and open a pull request so CI (Linux, integration tests) confirms the
   checkpoint (D-09).

## Must not change

Every file except `refactor-plan/PROGRESS.md`.

## Acceptance criteria

- [ ] `npm run build` exits 0, and `find packages -name '*.spec.js' -not -path '*/node_modules/*' | wc -l` prints `0`.
- [ ] `npx vitest run`: on Windows `Test Files  316 passed (317)`, `Tests  3840 passed (3877)`,
      and the single error names only `packages/core/test/nest-application-context.spec.ts`.
      On Linux `Test Files  317 passed (317)`, `Tests  3877 passed (3877)`.
- [ ] `npx tsc -p tsconfig.spec.json --noEmit 2>&1 | grep -c 'error TS'` prints `225`.
- [ ] `npm run lint` exits 0 with the single baseline warning.
- [ ] `npm run lint:style` ends with `✖ 11909 problems (0 errors, 11909 warnings)`.
- [ ] `node refactor-plan/tools/audit.mjs | diff --strip-trailing-cr refactor-plan/baseline/audit-summary.txt -` prints exactly these changed lines and nothing else:

      ```text
      1c1
      < files scanned: 1966
      ---
      > files scanned: 1978
      16c16
      < R-033        377     377  source=377
      ---
      > R-033        365     365  source=365
      30c30
      < R-100       1463    1275  integration=394 source=562 spec=150 test-support=2 sample=347 tools=8
      ---
      > R-100       1472    1284  integration=394 source=562 spec=159 test-support=2 sample=347 tools=8
      ```

- [ ] `node refactor-plan/tools/function-names.mjs --check` exits 0 (1401 names).
- [ ] `git status --short` is empty apart from `refactor-plan/PROGRESS.md`.

## Stop and escalate if

Any check differs from its expected result. Record the command, the expected
result and the actual output in the notes.

If you stop, set the task to `blocked` in PROGRESS.md with a one-paragraph
reason, commit only PROGRESS.md (`chore(refactor-plan): block T015`), and stop.

## Finish

Set the task to `done` in PROGRESS.md, then commit `refactor-plan/PROGRESS.md`
with the message `chore(refactor-plan): checkpoint 2A [T015]`.
