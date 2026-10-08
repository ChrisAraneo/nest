# T004: Exclude nested spec files from the package builds

**Phase:** 1, Foundations · **Depends on:** — · **Lane:** D · **Size:** S

## Goal

A `*.spec.ts` file placed beside a source file at any depth of a package (for
example `packages/core/helpers/context-id-factory.spec.ts`) is never compiled
into the published package. This lets later tasks put specs beside their
sources (R-033, D-08).

## Files

- In scope (may edit, create or delete):
  `packages/common/tsconfig.build.json`, `packages/core/tsconfig.build.json`,
  `packages/microservices/tsconfig.build.json`,
  `packages/platform-express/tsconfig.build.json`,
  `packages/platform-fastify/tsconfig.build.json`,
  `packages/platform-socket.io/tsconfig.build.json`,
  `packages/platform-ws/tsconfig.build.json`,
  `packages/testing/tsconfig.build.json`,
  `packages/websockets/tsconfig.build.json`.
- Context (read, do not edit): `refactor-plan/DECISIONS.md` D-08, `refactor-plan/CONTEXT.md` §6.
- Every other file is out of scope. Do not touch it, even to fix something
  that is obviously wrong. Write it in the notes column of PROGRESS.md instead.

## Rules and recipes

- R-033: "Every file that exports a function has a spec beside it with the same base name".
- No recipe.

## Current state

Each of the nine files contains exactly this line:

```json
  "exclude": ["node_modules", "dist", "test/**/*", "*.spec.ts"],
```

Check: `grep -h '"exclude"' packages/*/tsconfig.build.json | sort | uniq -c`
prints one line starting with `9`.

## Steps

1. In each of the nine files, replace that line with:

   ```json
     "exclude": ["node_modules", "dist", "test/**/*", "**/*.spec.ts"],
   ```

   Change nothing else in the files.
2. Run `npx prettier --write packages/*/tsconfig.build.json`.

## Must not change

Every other key in the nine files; every other file.

## Acceptance criteria

- [ ] `grep -h '"exclude"' packages/*/tsconfig.build.json | sort | uniq -c`
      prints exactly one line, starting with `9` and containing `"**/*.spec.ts"`.
- [ ] `git diff --stat` shows 9 files changed, 9 insertions(+), 9 deletions(-)
      (ignore `refactor-plan/PROGRESS.md`).
- [ ] `npm run build` exits 0.
- [ ] `find packages -name '*.js' -not -path '*/node_modules/*' | wc -l` prints `664`.
- [ ] `npx tsc -p packages/core/tsconfig.build.json --listFilesOnly | grep -c 'spec\.ts'` prints `0`.
- [ ] `npx vitest run packages/common` passes as at baseline.

## Stop and escalate if

- any of the nine files does not contain the exact line in "Current state";
- the build fails or emits a different number of `.js` files.

If you stop, run
`git restore --staged --worktree -- packages/common/tsconfig.build.json packages/core/tsconfig.build.json packages/microservices/tsconfig.build.json packages/platform-express/tsconfig.build.json packages/platform-fastify/tsconfig.build.json packages/platform-socket.io/tsconfig.build.json packages/platform-ws/tsconfig.build.json packages/testing/tsconfig.build.json packages/websockets/tsconfig.build.json`,
set the task to `blocked` in PROGRESS.md with a one-paragraph reason, and stop.

## Finish

Set the task to `done` in PROGRESS.md, then commit the nine
`tsconfig.build.json` files and `refactor-plan/PROGRESS.md` together with the
message `build: exclude nested spec files from package builds [T004]`.
