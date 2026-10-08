# T001: Add ESLint with the guide's rules as warnings

**Phase:** 1, Foundations · **Depends on:** — · **Lane:** A · **Size:** S

## Goal

`npx eslint packages integration tools` runs the GUIDE §16 rule set as
**warnings** and reports exactly the baseline number of findings. Nothing else
in the repository changes.

## Files

- In scope (may edit, create or delete): `package.json`, `package-lock.json`,
  `eslint.config.mjs` (new, repository root).
- Context (read, do not edit): `refactor-plan/CONTEXT.md` §3, `refactor-plan/DECISIONS.md` D-19, D-20.
- Every other file is out of scope. Do not touch it, even to fix something
  that is obviously wrong. Write it in the notes column of PROGRESS.md instead.

## Rules and recipes

- R-197: "Enforce what a linter can. … Turn them on as warnings, fix per folder, and only then raise them to errors".
- R-004: "never relax a rule to make a file pass".
- No recipe: the steps below are complete.

## Current state

- `node -e "console.log(require('./package.json').devDependencies.eslint)"` prints `undefined`.
- `typescript-eslint` 8.71.0 is already a devDependency (`package.json`).
- There is no `eslint.config.mjs` at the repository root.

## Steps

1. Install ESLint, exactly this version, as a dev dependency:

   ```sh
   npm install --save-dev --save-exact --legacy-peer-deps eslint@10.11.0
   ```

   Do not edit `package-lock.json` by hand.

2. In `package.json`, in `"scripts"`, add this line directly after the
   `"lint:ci": "oxlint packages",` line:

   ```json
       "lint:style": "eslint packages integration tools",
   ```

3. Create `eslint.config.mjs` at the repository root with exactly this content:

   ```js
   import { defineConfig, globalIgnores } from 'eslint/config';
   import tseslint from 'typescript-eslint';

   const RESTRICTED_SYNTAX = [
     { selector: 'IfStatement', message: 'Use match() from ts-pattern.' },
     { selector: 'SwitchStatement', message: 'Use match() from ts-pattern.' },
     { selector: 'ConditionalExpression', message: 'Use match() from ts-pattern.' },
     { selector: 'ForStatement', message: 'Use map/filter/reduce.' },
     { selector: 'ForOfStatement', message: 'Use map/filter/reduce.' },
     { selector: 'ForInStatement', message: 'Use map/filter/reduce.' },
     { selector: 'WhileStatement', message: 'Use map/filter/reduce.' },
     { selector: 'DoWhileStatement', message: 'Use map/filter/reduce.' },
     { selector: 'TryStatement', message: 'Use tryCatch from ramda.' },
     { selector: 'ThrowStatement', message: 'Return a fallback value instead.' },
     { selector: 'VariableDeclaration[kind="let"]', message: 'Thread the value.' },
     { selector: 'VariableDeclaration[kind="var"]', message: 'Thread the value.' },
     { selector: 'FunctionDeclaration', message: 'Use an arrow const.' },
     { selector: 'ClassDeclaration', message: 'Use functions.' },
     { selector: 'TSEnumDeclaration', message: 'Use a string union.' },
     {
       selector: "CallExpression[callee.property.name='forEach']",
       message: 'Use map/filter/reduce.',
     },
     { selector: "CallExpression[callee.name='forEach']", message: 'Use map/filter/reduce.' },
     { selector: "ImportDeclaration[source.value='lodash']", message: 'Use lodash-es.' },
     {
       selector: "ImportDeclaration[source.value=/^lodash/] ImportDefaultSpecifier",
       message: 'Use named imports.',
     },
     {
       selector: "ImportDeclaration[source.value=/^lodash/] ImportNamespaceSpecifier",
       message: 'Use named imports (the chain wrapper is the one exception).',
     },
     { selector: "MemberExpression[object.name='_']", message: 'No _ namespace.' },
     {
       selector:
         "ImportDeclaration[source.value='lodash-es'] ImportSpecifier[imported.name='chain']",
       message: 'Import chain from the local wrapper.',
     },
   ];

   export default defineConfig([
     globalIgnores(['**/node_modules/**', '**/*.d.ts', '**/*.js', 'sample/**']),
     {
       files: ['packages/**/*.ts', 'integration/**/*.ts', 'tools/**/*.ts'],
       languageOptions: {
         parser: tseslint.parser,
         parserOptions: {
           emitDecoratorMetadata: true,
           experimentalDecorators: true,
         },
       },
       linterOptions: { reportUnusedDisableDirectives: 'off' },
       plugins: { '@typescript-eslint': tseslint.plugin },
       rules: {
         'no-restricted-syntax': ['warn', ...RESTRICTED_SYNTAX],
         'prefer-const': 'warn',
         'no-param-reassign': 'warn',
         '@typescript-eslint/no-explicit-any': 'warn',
         '@typescript-eslint/no-non-null-assertion': 'warn',
         '@typescript-eslint/consistent-type-imports': 'warn',
       },
     },
   ]);
   ```

   The `parserOptions` lines are required: they make `consistent-type-imports`
   skip files that contain decorators, so it can never suggest an `import type`
   that would break dependency injection (CONTEXT §9).

4. Run `npx eslint packages integration tools` and read the last lines of the output.

## Must not change

- Every existing entry in `package.json` (`dependencies`, `devDependencies`,
  scripts other than the new `lint:style` line).
- `.oxlintrc.json`, every `tsconfig*.json`, every `.ts` file.
- Never run `eslint --fix`. ESLint reports 863 warnings as fixable; fixing is
  not this task.

## Acceptance criteria

- [ ] `node -e "const p=require('./package.json');console.log(p.devDependencies.eslint, '|', p.scripts['lint:style'])"`
      prints `10.11.0 | eslint packages integration tools`.
- [ ] `git diff package.json` shows exactly two added lines (the `eslint`
      devDependency and the `lint:style` script) and no removed lines.
- [ ] `npx eslint packages integration tools` exits 0, and its last summary line
      is exactly `✖ 11909 problems (0 errors, 11909 warnings)`.
- [ ] `npm run lint:style` gives the same summary line.
- [ ] `npm run lint` exits 0 with the same single warning as at baseline
      (`packages/websockets/socket-module.ts:60`).
- [ ] `npm run build` exits 0.
- [ ] `git status --short` lists only `package.json`, `package-lock.json`,
      `eslint.config.mjs` and `refactor-plan/PROGRESS.md`.

## Stop and escalate if

- `npm install` changes the version of any package already listed in
  `package.json`, or fails;
- ESLint reports any **error**, or a warning count other than 11909;
- ESLint cannot load `typescript-eslint` or `eslint/config`;
- the code does not match "Current state".

If you stop, restore the in-scope files to how they were at the start
(`git restore --staged --worktree -- package.json package-lock.json`, delete
`eslint.config.mjs`, then run `npm ci --legacy-peer-deps`), set the task to
`blocked` in PROGRESS.md with a one-paragraph reason, and stop.

## Finish

Set the task to `done` in PROGRESS.md, then commit `package.json`,
`package-lock.json`, `eslint.config.mjs` and `refactor-plan/PROGRESS.md`
together with the message
`build: add eslint with the functional pipelines rules as warnings [T001]`.
