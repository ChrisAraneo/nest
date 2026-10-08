# Refactoring plan: Functional Pipelines Style for the NestJS monorepo

This folder is a plan for refactoring this repository to the coding guide in
`GUIDE.md` (a verbatim snapshot of *Functional Pipelines Style*) **without
changing behaviour**. An architect wrote the plan. Executors carry it out one
task at a time.

**Current state of the plan:** the guide conflicts with NestJS's public API
(classes, decorators, enums, thrown exceptions and documented file paths). Four
questions for the human block most of the work (`DECISIONS.md` §2). The tasks
that need no answer are ready: **T001–T005** (tooling and documents) and
**T010–T015** (characterisation specs). Every other task is
`needs-detailing`.

## Files

| File | What it is | Executors |
| --- | --- | --- |
| `README.md` | This file: how the plan works and the execution protocol | read first, every time |
| `PROGRESS.md` | Status of every task, in execution order | the **only** plan file you edit |
| `tasks/T###-*.md` | One task each | read yours only |
| `RULES.md` | Every guide rule, numbered `R-###`, with detectors | read the entries your task names |
| `RECIPES.md` | How to apply each fix, numbered `C-##` | read the entries your task names |
| `CONTEXT.md` | Real commands, baseline results, versions | read §3 (commands) and §4 (baseline failures) |
| `DECISIONS.md` | Decisions `D-##` and open questions `Q#` | read D-09 (branch, commits) and D-18 (baseline failures) |
| `GUIDE.md` | The guide snapshot | only the sections a rule cites |
| `AUDIT.md`, `ROADMAP.md` | The architect's working material | do not read |
| `baseline/` | Outputs recorded at the baseline commit | read only when a task points to a file |
| `tools/audit.mjs` | The style audit: `node refactor-plan/tools/audit.mjs` | run as your task says |
| `tools/function-names.mjs` | Generates `docs/FUNCTION_NAMES.md` | run as your task says |

Reading order for a human: this file → `DECISIONS.md` (summary and §2 questions)
→ `ROADMAP.md` → `CONTEXT.md` → `AUDIT.md` → `RULES.md` → `RECIPES.md`.

## Before the first executor runs (human)

1. Create the branch from the baseline commit:
   `git switch -c refactor/functional-pipelines 35142c3eca8edaaf6abc5984d915da2fbd458aa2`
   (or from `master` if it has not moved).
2. Commit this folder as the first commit on that branch:
   `git add refactor-plan && git commit -m "chore(refactor-plan): add refactoring plan"`.
3. Install dependencies: `npm ci --legacy-peer-deps`.
4. Answer the open questions in `DECISIONS.md` §2 when you can. An architect
   then details the `needs-detailing` tasks.

## Execution protocol (every executor, every task)

1. Read `README.md`, then the task, then the rules and recipes it references.
2. Check that every task it depends on is `done` in `PROGRESS.md`. If not, do
   not start.
3. Confirm that "Current state" still matches the code.
4. Do the steps.
5. Run every acceptance check and read the output.
6. Set the task to `done` in `PROGRESS.md`.
7. Commit the in-scope files and `PROGRESS.md` together, with the task's message.

Executors NEVER edit plan files other than `PROGRESS.md`.

More rules for executors:

- Work on the branch `refactor/functional-pipelines` (D-09). The working tree
  must be clean before you start.
- Set your task to `in-progress` in `PROGRESS.md` when you start it.
- Statuses are `todo`, `in-progress`, `done`, `blocked` and `needs-detailing`.
  Never start a task that is not `todo`. `needs-detailing` means an architect
  must finish the task first.
- If you stop, restore the in-scope files, set the task to `blocked` with a
  one-paragraph reason in the notes column, commit only `PROGRESS.md`
  (`chore(refactor-plan): block T###`), and end the session.
- On Windows, one test file always crashes (`nest-application-context.spec.ts`).
  That is a baseline failure, not yours (`DECISIONS.md` D-18).
- Lanes: tasks with different lane letters touch different files and may run in
  parallel, each in its own git worktree and branch (D-09). Within a lane, go in
  ID order. Without lanes, take the first eligible `todo` row from the top of
  `PROGRESS.md`.

## Size of the plan

- 137 rules (R-001–R-197; IDs are grouped by guide section and are not contiguous).
- 50 189 detected violations in 1 966 TypeScript files; 21 681 in the 664
  package source files.
- 343 tasks in 6 phases. 11 are `todo` now; 4 are written in full and wait for
  Q2; the rest are `needs-detailing`, with file sets in `ROADMAP.md`.
