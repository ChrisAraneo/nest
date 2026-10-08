# T006: Add lodash-es, ts-pattern, ramda and their type packages

**Phase:** 1, Foundations · **Depends on:** T005 · **Lane:** A · **Size:** S

> **Status gate:** this task stays `needs-detailing` until the human answers
> Q2 (DECISIONS.md). The architect then sets it to `todo`. Executors never run
> a `needs-detailing` task.

## Goal

The three libraries the guide prescribes are installed at the versions in
D-01: as runtime dependencies of the repository root and of `@nestjs/common`,
with their type packages as root dev dependencies.

## Files

- In scope (may edit, create or delete): `package.json`, `package-lock.json`,
  `packages/common/package.json`.
- Context (read, do not edit): `refactor-plan/DECISIONS.md` D-01, `refactor-plan/CONTEXT.md` §9.
- Every other file is out of scope. Do not touch it, even to fix something
  that is obviously wrong. Write it in the notes column of PROGRESS.md instead.

## Rules and recipes

- R-196 / GUIDE §16.1: "`lodash-es`, `ts-pattern` and `ramda` in `dependencies`; `@types/lodash-es` in `devDependencies`, without which the named lodash imports do not type-check."
- R-124: "`@types/lodash-es` MUST be a dev dependency".

## Current state

`npm ls lodash-es ts-pattern ramda @types/lodash-es @types/ramda` lists none of them.

## Steps

1. Root runtime dependencies:
   `npm install --save-exact --legacy-peer-deps lodash-es@4.18.1 ts-pattern@5.9.0 ramda@0.32.0`
2. Root dev dependencies:
   `npm install --save-dev --save-exact --legacy-peer-deps @types/lodash-es@4.17.12 @types/ramda@0.32.0`
3. `@nestjs/common` runtime dependencies:
   `npm install --save-exact --legacy-peer-deps lodash-es@4.18.1 ts-pattern@5.9.0 ramda@0.32.0 -w packages/common`
4. Do not edit `package-lock.json` by hand.

## Must not change

The version of every package already listed in any `package.json`.

## Acceptance criteria

- [ ] `node -e "const r=require('./package.json'),c=require('./packages/common/package.json');console.log(r.dependencies['lodash-es'],r.dependencies['ts-pattern'],r.dependencies.ramda,r.devDependencies['@types/lodash-es'],r.devDependencies['@types/ramda'],c.dependencies['lodash-es'],c.dependencies['ts-pattern'],c.dependencies.ramda)"`
      prints `4.18.1 5.9.0 0.32.0 4.17.12 0.32.0 4.18.1 5.9.0 0.32.0`.
- [ ] `git diff package.json packages/common/package.json` shows only added lines.
- [ ] `npm run build` exits 0.
- [ ] `npx vitest run` gives the baseline result (CONTEXT §4; 305 files).
- [ ] `git status --short` lists only the three in-scope files and `refactor-plan/PROGRESS.md`.

## Stop and escalate if

- npm changes the version of any existing dependency, or fails;
- the build or the tests differ from the baseline.

If you stop, run `git restore --staged --worktree -- package.json package-lock.json packages/common/package.json`
and `npm ci --legacy-peer-deps`, set the task to `blocked` in PROGRESS.md with a
one-paragraph reason, and stop.

## Finish

Set the task to `done` in PROGRESS.md, then commit the three in-scope files and
`refactor-plan/PROGRESS.md` together with the message
`build: add lodash-es, ts-pattern and ramda [T006]`.
