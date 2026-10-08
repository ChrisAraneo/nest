# Rule catalogue

Every rule in `GUIDE.md` is listed here once, with an ID that `tools/audit.mjs`
uses. Quotes are verbatim from GUIDE.md. "Detect" names what finds violations:

- **audit**: `node refactor-plan/tools/audit.mjs --rules <ID>` (a TypeScript-AST
  detector; `--format locations` lists each hit as `path:line:col rule [symbol] detail`);
- **eslint**: the rule in `eslint.config.mjs` after task T001 (`npx eslint <paths>`);
- **tsc**: a compiler setting;
- **manual**: a reviewer, or the architect when writing the task, checks it.

"Applies to" uses these file kinds (the audit's `kind` column): **source** =
`packages/<pkg>/**/*.ts` outside `test/`; **spec** = `*.spec.ts` anywhere;
**test-support** = non-spec files in `packages/<pkg>/test/`; **integration**,
**sample**, **tools** = files under those folders. Whether integration, sample
and tools are in scope at all is open question Q5 in DECISIONS.md.

Accuracy: **exact** = a hit is always a violation and every violation is a
hit. **over-matches** = some hits are not violations. **under-matches** = some
violations are missed.

---

## Meta rules

### R-001: The guide applies to every TypeScript file
- Source: GUIDE.md preamble. "These rules apply to every TypeScript file in a repository that adopts this guide."
- Applies to: all `*.ts` files (not `.mts`/`.mjs`/`.d.ts`).
- Detect: audit scans `git ls-files --cached --others --exclude-standard -- '*.ts'` minus `*.d.ts` and `refactor-plan/`.
- Detector accuracy: exact.
- Fix: —. Kind: mechanical. Ordering: —.

### R-002: Exceptions only as listed in §15, with a measurement
- Source: GUIDE.md preamble. "A rule may only be broken where this guide names the exception; section 15 is the only list of exceptions, and anything added to it carries a measurement."
- Applies to: all files.
- Detect: manual. Every exception must appear in DECISIONS.md with its measurement.
- Detector accuracy: manual. Fix: R-195. Kind: judgement. Ordering: —.

### R-003: A sibling document may add rules but never relax them
- Source: GUIDE.md preamble. "A repository may add its own rules in a sibling document; it may not relax the ones here."
- Applies to: the plan itself. Detect: manual. Kind: judgement.

### R-004: Never relax a rule to make a file pass
- Source: GUIDE.md §16. "Turn them on as warnings, fix per folder, and only then raise them to errors — and never relax a rule to make a file pass. Bring the file in line instead."
- Applies to: `eslint.config.mjs`, `.oxlintrc.json`, tsconfig files.
- Detect: manual (`git diff` of lint/tsconfig files in every task).
- Fix: —. Kind: mechanical. Ordering: T001 adds rules as warnings; the Tightening phase raises them.

## §1 The single expression rule

### R-010: A function body is a single expression
- Source: GUIDE.md §1. "A function body is a single expression: one pipeline that composes small named steps. A body contains no statement-level control flow." §3.2: "Write `(items) => …`, not `(items) => { return …; }`."
- Applies to: source, test-support, integration, sample, tools; in specs to every function except the callbacks passed to `it`/`test`/`describe` (and hooks), because §12.8 prescribes setup, call and `expect` statements inside a test (decision D-12).
- Detect: audit R-010 = every function-like (`function`, arrow, method, constructor, accessor) with a `{ … }` body, **except** a body that meets R-048.
- Detector accuracy: over-matches slightly: the R-048 test counts name occurrences textually, so a name that appears three times in strings or properties counts as "read more than once".
- Fix: recipe C-00 (the whole §13 procedure). Kind: judgement. Ordering: last step of a body rewrite (after R-011…R-018).

### R-011: No `if`/`else`; branch with `match`
- Source: GUIDE.md §1. "NEVER write `if`, `else`, …". §4.1: "`match` from `ts-pattern` does every branch. There is no arm-count threshold: a two-way `if` and a ten-way `switch` are both a `match`."
- Applies to: all kinds.
- Detect: audit R-011 (`IfStatement`); eslint `no-restricted-syntax` `IfStatement`.
- Detector accuracy: exact.
- Fix: C-01 (boolean/open), C-02 (union), C-03 (type ladder), C-09 (null guard). Kind: judgement (choosing the arm values). Ordering: before R-017/R-018/R-019 (§13 step 2 before step 6).

### R-012: No `switch`; branch with `match`
- Source: GUIDE.md §1 table. "`if / else if / else`, `switch` → `match(x).with(…).with(…).exhaustive()` or `.otherwise(…)`"
- Applies to: all kinds. Detect: audit R-012; eslint `SwitchStatement`. Accuracy: exact.
- Fix: C-02. Kind: mechanical when the subject is a union, judgement otherwise. Ordering: as R-011.

### R-013: No `?:`; branch with `match` (or `??`, `?.`, `&&`, `||` for small cases)
- Source: GUIDE.md §1 table. "`cond ? a : b` → `match(x).with(…).otherwise(…)`". §4.9: "Small cases need no `match`. Use `??` for a fallback …, `?.` for reads that may fall off the structure …, and `&&`, `||` and `!` inside predicates."
- Applies to: all kinds. Detect: audit R-013; eslint `ConditionalExpression`. Accuracy: exact.
- Fix: C-01. Kind: judgement (decide whether `??`/`?.` keeps the semantics). Ordering: as R-011.

### R-014: No loops
- Source: GUIDE.md §1. "NEVER write … `for`, `while`, `for…of`, `forEach` …". §3.9: "No loops. Use lodash `map`, `flatMap`, `filter`, `reduce`, `times` and `range`."
- Applies to: all kinds (except a §15 measured exception, R-195).
- Detect: audit R-014 (`for`, `for…in`, `for…of` without `await`, `while`, `do…while`); eslint `ForStatement`, `ForOfStatement`, `ForInStatement`, `WhileStatement`, `DoWhileStatement`.
- Detector accuracy: exact. (`for await` is counted under R-141.)
- Fix: C-04. Kind: judgement (early exits, accumulation order). Ordering: after R-011 inside the same body.

### R-015: No `try`/`catch`
- Source: GUIDE.md §1. "NEVER write … `try`, `catch` …". §5.1: "`tryCatch` from `ramda` replaces `try`/`catch` and `throw`."
- Applies to: all kinds. Detect: audit R-015; eslint `TryStatement`. Accuracy: exact.
- Fix: C-06. Kind: judgement. Ordering: §13 step 3, after branches.

### R-016: No `throw`
- Source: GUIDE.md §1 table. "`throw new Error(…)` → return the fallback from the `tryCatch` catcher". §14: "A `try`, `catch` or `throw` anywhere in a body."
- Applies to: all kinds. Detect: audit R-016; eslint `ThrowStatement`. Accuracy: exact.
- Fix: C-07. **Removing a `throw` changes error behaviour** (callers stop receiving the exception), so every R-016 fix needs human approval (open question Q3). Kind: judgement. Ordering: blocked by Q3.

### R-017: No `let`, no `var`
- Source: GUIDE.md §1. "NEVER write … `let`, `var` …". §3.4: "NEVER introduce a `let`."
- Applies to: all kinds. Detect: audit R-017; eslint `VariableDeclaration[kind="let"]`, `[kind="var"]`. Accuracy: exact.
- Fix: C-08. Kind: judgement. Ordering: §13 step 6, after branches, throws and loops in that body.

### R-018: No reassignment
- Source: GUIDE.md §1. "NEVER write … a reassignment …". §3.8: "NEVER reassign a name or change an argument."
- Applies to: all kinds. Detect: audit R-018 (assignment operators with an identifier or destructuring target; `++`/`--` on an identifier); eslint `no-param-reassign` covers parameters only.
- Detector accuracy: exact for identifiers. Property writes are R-049.
- Fix: C-08. Kind: judgement. Ordering: with R-017.

### R-019: No staircase of intermediate `const`s
- Source: GUIDE.md §1. "NEVER write … a staircase of intermediate `const`s." §3.3: "Name a value mid-expression with `chain`, never with a local".
- Applies to: all kinds (spec test callbacks excepted, D-12).
- Detect: audit R-019 = a function body with two or more `const` statements.
- Detector accuracy: over-matches (a body that meets R-048 is still listed; R-010 then exempts it); under-matches a staircase of one `const` plus other statements.
- Fix: C-08. Kind: judgement. Ordering: §13 step 6.

### R-020: An exported function names and orders steps; it does no logic itself
- Source: GUIDE.md §1. "The exported function names and orders the steps; it does no logic of its own." §14: "An exported function that does real logic itself instead of only composing named steps."
- Applies to: all kinds. Detect: manual (a reviewer reads the exported body: it must be one `flow(…)(…)` or `chain(…)…value()` of named steps).
- Detector accuracy: manual. Fix: C-00 step 1. Kind: judgement. Ordering: last in a module rewrite.

### R-021: The four tools do all the work
- Source: GUIDE.md §1. "Four tools do all of the work:" `match` (ts-pattern), `chain` (local lodash wrapper), `flow` (lodash-es), `tryCatch` (ramda).
- Applies to: all kinds. Detect: covered by R-011…R-016, R-142, R-143, R-145. Kind: mechanical.

## §2 Files and folders

### R-030: One export per file
- Source: GUIDE.md §2.1. "One export per file. Name the file after its export, in kebab-case".
- Applies to: source, test-support, integration, sample, tools (not specs).
- Detect: audit R-030 (one hit per file with more than one exported name; `export * from` counts as one).
- Detector accuracy: exact.
- Fix: C-15 (split a file without changing code). **Every package file path is public** (CONTEXT §2), so splitting a public file needs Q1. Kind: judgement (target names). Ordering: Structure phase, before any rewrite of that file.

### R-031: Name the file after its export, in kebab-case
- Source: GUIDE.md §2.1. "`findEligibleItems` → `find-eligible-items.ts`, `ProductCategory` → `product-category.ts`."
- Applies to: as R-030. Detect: audit R-031 (files with exactly one export whose base name ≠ kebab-case of the export).
- Detector accuracy: exact for one-export files; files with several exports are counted under R-030 only.
- Fix: C-15. Blocked by Q1 for package files. Kind: mechanical. Ordering: Structure phase.

### R-032: Named exports only; never `export default`
- Source: GUIDE.md §2.2. "Named exports only. NEVER use `export default`."
- Applies to: all kinds. Detect: audit R-032. Accuracy: exact (3 hits, all in `sample/`).
- Fix: C-15. Kind: mechanical. Ordering: Structure phase.

### R-033: Every file that exports a function has a spec beside it
- Source: GUIDE.md §2.3. "Every file that exports a function has a spec beside it with the same base name: `find-eligible-items.spec.ts`. Files in `internal/` get specs too."
- Applies to: source (the audit checks source only; integration/sample/tools are covered by Q5).
- Detect: audit R-033 (a source file exporting a function or class with no `<base>.spec.ts` in the same folder).
- Detector accuracy: exact. A class counts as exporting a function.
- Fix: C-16 (write a spec) and C-15 (move a spec from `test/` beside the source). Kind: mechanical (move) or judgement (new spec). Ordering: needs D-08's build-exclude change first (T005). Moving the 305 existing specs is in the Structure phase.

### R-034: Each feature gets its own folder: entry points at the root, private code in `internal/`, public types in `types/`
- Source: GUIDE.md §2.4–2.5. "Files at the root of a feature folder are its entry points. Code outside the folder imports only those."
- Applies to: source, integration, sample, tools. Detect: manual (folder design). Kind: judgement. Blocked by Q1 (paths are public). Ordering: Structure phase.

### R-035: Never import from another folder's `internal/`
- Source: GUIDE.md §2.5. "NEVER import from another folder's `internal/`."
- Applies to: all kinds. Detect: audit R-035 (a relative specifier containing `/internal/` from outside that folder's parent). Accuracy: exact for relative imports; under-matches alias imports. 0 hits at baseline (no `internal/` folders exist).
- Fix: import the folder's entry point instead. Kind: mechanical. Ordering: after the Structure phase.

### R-036: Types get their own file; never declare a type in a file that holds a function
- Source: GUIDE.md §2.6. "A type used only inside a feature goes in `internal/<name>.ts`. A type that callers use goes in `types/<name>.ts`. NEVER declare a type in a file that holds a function."
- Applies to: all kinds except specs (§12.10 lets specs "declare small local types").
- Detect: audit R-036 (a file declaring an `interface`/`type`/`enum` and also a function, arrow const or class).
- Detector accuracy: exact.
- Fix: C-15 (move the type to its own file and re-export it from the old path when the old path is public, D-05). Kind: mechanical. Ordering: Structure phase.

### R-037: Shared helpers move up a level; no flag parameter just to share
- Source: GUIDE.md §2.7. "A helper that two features need in the same form lives in their parent folder. If each feature needs a slightly different version, each keeps its own copy in its `internal/`. NEVER add a flag parameter just so two features can share one function."
- Applies to: all kinds. Detect: manual. Kind: judgement. Ordering: Structure phase design.

### R-038: Constants: shared values in `consts.ts`; single-file values as top-of-file `UPPER_SNAKE_CASE`; name every unclear number
- Source: GUIDE.md §2.8. "A tuning value that several files or tests need goes in the nearest `consts.ts`. A value only one file needs is a non-exported `UPPER_SNAKE_CASE` constant at the top of that file … Name every number whose meaning is not plain from the line it sits on."
- Applies to: all kinds (specs: fixtures per R-176).
- Detect: audit R-038 (numeric literals other than `0` and `1` that are not the initializer of an `UPPER_SNAKE_CASE` const, an enum member or a literal type).
- Detector accuracy: **over-matches** ("plain from the line" is a judgement; e.g. `slice(0, 2)` is reported). The task writer decides each hit.
- Fix: C-22. Kind: judgement. Ordering: Sweep phase. The `consts.ts` location is blank §16.4, decided in D-04.

### R-039: Freeze exported arrays and objects and type them `readonly`
- Source: GUIDE.md §2.9. "Freeze exported arrays and objects and type them `readonly`".
- Applies to: all kinds. Detect: audit R-039 (an exported `const` initialised with an array/object literal not wrapped in `Object.freeze`).
- Detector accuracy: under-matches (does not check the `readonly` type; misses values built by calls).
- Fix: C-23. **Freezing changes behaviour if any caller mutates the value**, so each hit needs evidence that nothing writes to it. Kind: judgement. Ordering: Sweep phase.

## §3 Functions

### R-040: Arrow functions only, assigned to a `const`; never the `function` keyword
- Source: GUIDE.md §3.1. "Arrow functions only, assigned to a `const`. NEVER use the `function` keyword, a class, or `this`."
- Applies to: all kinds. Detect: audit R-040 (function declarations, function expressions, object-literal methods and accessors); eslint `FunctionDeclaration`.
- Detector accuracy: exact. Class methods are counted under R-041.
- Fix: C-11. Pitfalls: hoisting, overload signatures (many decorators are overloaded), `arguments`, `this`. Kind: judgement for overloaded functions, mechanical otherwise. Ordering: before R-010 in the same function.

### R-041: Never a class
- Source: GUIDE.md §3.1 (as R-040). §16 lint: `{ selector: 'ClassDeclaration', message: 'Use functions.' }`.
- Applies to: all kinds. Detect: audit R-041 (class declarations and expressions); eslint `ClassDeclaration`.
- Detector accuracy: exact (eslint misses class expressions).
- Fix: no recipe. **Blocked by Q1**: 285 exported classes are public API. Kind: judgement. Ordering: blocked.

### R-042: Never `this`
- Source: GUIDE.md §3.1 (as R-040).
- Applies to: all kinds. Detect: audit R-042 (`this` expressions). Accuracy: exact.
- Fix: none until Q1. Kind: judgement. Ordering: blocked with R-041.

### R-043: Single-expression arrow bodies
- Source: GUIDE.md §3.2. "Single-expression bodies. Write `(items) => …`, not `(items) => { return …; }`."
- Applies to: all kinds. Detect: audit R-043 (an arrow whose block body is exactly one `return`).
- Detector accuracy: exact.
- Fix: C-08 step "drop the braces". Kind: mechanical. Ordering: any time; the cheapest rule.

### R-044: Name a value mid-expression with `chain`, never with a local
- Source: GUIDE.md §3.3. "Name a value mid-expression with `chain`, never with a local".
- Applies to: all kinds. Detect: covered by R-019/R-017. Fix: C-08. Kind: judgement.

### R-045: Carry extra state forward as an object, one property per step
- Source: GUIDE.md §3.4. "Carry extra state forward as an object, adding one property per step. This is the replacement for a staircase of `const`s; NEVER introduce a `let`."
- Applies to: all kinds. Detect: manual. Fix: C-08. Kind: judgement.

### R-046: `chain` for a value you hold; `flow` to name a composition
- Source: GUIDE.md §3.5. "Use `chain` when you hold a value and want to flow it through steps. Use `flow` when you want to name a new function that _is_ the composition of existing ones".
- Applies to: all kinds. Detect: manual. Fix: C-08. Kind: judgement.

### R-047: Extract each meaningful step into its own named function; reuse first
- Source: GUIDE.md §3.6. "Extract each meaningful step into its own named function so the chain reads as a sentence. Reuse an existing step before writing a new one."
- Applies to: all kinds. Detect: manual (check `docs/FUNCTION_NAMES.md`, R-104). Fix: C-00 step 1. Kind: judgement.

### R-048: Block bodies are a narrow exception
- Source: GUIDE.md §3.7. "A block body is allowed only when a function needs several named values that are each read more than once, and then it holds nothing but `const` declarations and one `return`. Prefer `chain`."
- Applies to: all kinds. Detect: the audit applies it as R-010's exemption (at least one `const` statement before a final `return`, each declared name appearing at least three times in the body text).
- Detector accuracy: over-permissive (see R-010). Kind: judgement.

### R-049: No mutation
- Source: GUIDE.md §3.8. "No mutation. NEVER reassign a name or change an argument. Return new arrays and objects. Copy with `[...items]` or `{ ...record }`. Lodash `reverse` changes the array it is given, so copy first".
- Applies to: all kinds except specs (§12.10 lets specs "write into a fixture they have just made, collect calls in a local array").
- Detect: audit R-049 (property/element assignment, `delete`, `++`/`--` on a property, calls to `push`, `pop`, `shift`, `unshift`, `splice`, `reverse`, `fill`, `copyWithin`, `Object.assign` into a non-literal, `Object.defineProperty`/`setPrototypeOf`, `Reflect.defineMetadata`/`set`/`deleteMetadata`/`defineProperty`); eslint `no-param-reassign` (parameters only).
- Detector accuracy: **over-matches** (writes into an object the function just created are not mutation of an argument) and **under-matches** (`Map#set`, `Set#add`, mutation through aliases). `.sort(` is reported under R-120.
- Fix: C-08 / C-10 (build new values). Decorators exist to write metadata onto the decorated class (`Reflect.defineMetadata`), which is Nest's public mechanism; see Q1. Kind: judgement. Ordering: with the body rewrite.

### R-050: No loops (§3.9)
- Source: GUIDE.md §3.9. "No loops. Use lodash `map`, `flatMap`, `filter`, `reduce`, `times` and `range`. For the one kind of measured exception, see section 15."
- Same as R-014; counted there.

### R-051: Argument order is fixed per domain and never varies
- Source: GUIDE.md §3.10. "Pick the order once — the subject the function works on first, then its coordinates, then the injected effects last — and keep it identical in arguments and in object literals".
- Applies to: all kinds. Detect: manual. Changing the order of a public function's parameters is an API change (Q1). Kind: judgement.

### R-052: Entry points and helpers take plain arguments; pipeline steps take one object
- Source: GUIDE.md §3.11. "Entry points and helpers take plain arguments. Pipeline steps take one object (section 6)."
- Applies to: all kinds. Detect: manual. Kind: judgement.

### R-053: Helpers declare their return type; pipeline steps and entry points do not
- Source: GUIDE.md §3.12. "Helpers MUST declare their return type, including `| undefined` variants. Pipeline steps and entry points MUST NOT, because their types are inferred and the next step reads them through `ReturnType<typeof …>`."
- Applies to: all kinds. Detect: audit R-053 lists exported arrow consts **without** a return type. That is a violation only if the function is a helper.
- Detector accuracy: approximate (it cannot know helper versus step; it does not look at `function` declarations, which R-040 converts first).
- Fix: C-00 step 9. Kind: judgement. Ordering: last step of a body rewrite.

## §4 Branching

### R-060: `match` does every branch, with no arm-count threshold
- Source: GUIDE.md §4.1 (quoted at R-011). Enforced by R-011, R-012, R-013.

### R-061: Unions: one `.with()` per member, ending in `.exhaustive()`
- Source: GUIDE.md §4.2. "Unions: one `.with()` per member, ending in `.exhaustive()`".
- Applies to: all kinds. Detect: manual (code review of each `match` on a union). Fix: C-02. Kind: mechanical.

### R-062: Booleans and open values end in `.otherwise(…)`
- Source: GUIDE.md §4.3. "Booleans and other open values: `.with(true, …)` or `.with(value, …)`, ending in `.otherwise(…)`."
- Applies to: all kinds. Detect: manual. Fix: C-01. Kind: mechanical.

### R-063: Destructure every pattern helper off `P` at the top of the file; never `P.` in a pattern
- Source: GUIDE.md §4.4. "Destructure every pattern helper off `P` at the top of the file. NEVER write `P.` in a pattern position — not `P.nullish`, `P.union`, `P.not`, `P.string`, `P.number`, `P.instanceOf`, `P.when`".
- Applies to: all kinds. Detect: audit R-063 (`P.<name>` in a file that imports `P` from `ts-pattern`). Accuracy: exact (it also reports `P.` outside pattern positions, which the rule's §11.4 placement forbids too). 0 at baseline.
- Fix: C-01 imports block. Kind: mechanical.

### R-064: Conditions use `.when(predicate, handler)` or a `P` pattern such as `number.lt(0)`
- Source: GUIDE.md §4.5. "Conditions: use `.when(predicate, handler)`, or a `P` pattern such as `number.lt(0)` after `const { number } = P;`."
- Applies to: all kinds. Detect: manual. Fix: C-01. Kind: mechanical.

### R-065: Name special values before matching on them
- Source: GUIDE.md §4.6. "Name special values before you match on them: `const NOT_FOUND = -1;`, then `.with(NOT_FOUND, () => 0)`."
- Applies to: all kinds. Detect: audit R-065 (`.with(<number literal>`). Accuracy: under-matches (strings, negative numbers). 0 at baseline.
- Fix: C-22. Kind: mechanical.

### R-066: Keep unions typed: annotate the handler's return type
- Source: GUIDE.md §4.7. "When handlers return members of a string union, put the type on the handler: `.with(true, (): Layout => 'VERTICAL')`."
- Applies to: all kinds. Detect: manual; `npm run build` fails when a union widens to `string` at a typed boundary. Kind: mechanical.

### R-067: Shape and type patterns replace object checks and `instanceof` ladders
- Source: GUIDE.md §4.8. "Shape and type patterns replace object checks and `instanceof` ladders". §1 table: "`instanceof` / `typeof` ladder → `match(x).with(instanceOf(Error), …)` after `const { instanceOf } = P;`".
- Applies to: all kinds. Detect: audit R-067 (every `instanceof`; the `typeof` half is R-127).
- Detector accuracy: over-matches (a lone `instanceof` inside a predicate is allowed by §4.9 when it is not a branch).
- Fix: C-03. Kind: judgement. Ordering: with R-011.

### R-068: Small cases need no `match`
- Source: GUIDE.md §4.9 (quoted at R-013). A permission, not a ban. Recipes C-01 and C-09 use it.

### R-069: Keep each branch to one call
- Source: GUIDE.md §4.10. "Keep each branch to one call. When a branch needs more, move it into its own helper file and call that."
- Applies to: all kinds. Detect: manual (a `.with`/`.otherwise` handler longer than one call). Fix: C-01 step 4. Kind: judgement.

## §5 Failure, absence and effects

### R-070: `tryCatch` from ramda replaces `try`/`catch` and `throw`
- Source: GUIDE.md §5.1. "`tryCatch(tryer, catcher)` returns a function that runs `tryer`; when it throws, `catcher` receives the error and returns the value the caller continues with. There is no second channel to fold."
- Enforced by R-015 and R-016. Fix: C-06.

### R-071: Annotate the `const` a `tryCatch` is assigned to; the catcher returns the same type
- Source: GUIDE.md §5.2. "Annotate the `const` you assign a `tryCatch` to, because its inference is weak, and give the catcher a fallback of the same type as the tryer's result".
- Applies to: all kinds. Detect: manual (every `tryCatch(` is the initializer of a `const` with a function type annotation). Fix: C-06. Kind: mechanical.

### R-072: Normalise an unknown error with `match`, in its own named helper
- Source: GUIDE.md §5.3. "Normalize an unknown error with `match`, in its own named helper".
- Applies to: all kinds. Detect: manual. Fix: C-06. Kind: mechanical.

### R-073: Async failure folds on the promise with `then(onOk, onError)`
- Source: GUIDE.md §5.4. "`tryCatch` is synchronous and cannot catch a rejection. Pass both handlers to `then`".
- Applies to: all kinds. Detect: audit R-073 (`.catch(handler)` calls) plus R-015 for `try` around `await`.
- Detector accuracy: over-matches non-promise `.catch` methods; under-matches `try { await … }` (reported as R-015).
- Fix: C-06 part B. Kind: judgement.

### R-074: Thread absence as `X | undefined`; never scatter `x == null` guards
- Source: GUIDE.md §5.5. "Thread absence as `X | undefined` and let later steps short-circuit with `?.` or lodash `get`. NEVER scatter `x == null` guards". §10.3: "`x === null || x === undefined` → `isNil(x)`".
- Applies to: all kinds. Detect: audit R-074 (`==`/`===`/`!=`/`!==` against `null` or `undefined`, and `typeof x === 'undefined'`).
- Detector accuracy: under-matches guards written with helpers (`isNil(x)`, `isUndefined(x)` from `common/utils/shared.utils.ts`) or truthiness (`if (!x) return`).
- Fix: C-09. Kind: judgement. Ordering: §13 step 5.

### R-075: Side effects live at the edge; use a `tapEffect` helper mid-chain
- Source: GUIDE.md §5.6. "Side effects live at the edge, in the outermost handler, never mid-chain. When a chain step must run an effect and pass its value on, use a `tapEffect` helper of your own". §7.7: "IO and rendering happen at the edge — in the handler, the component, the CLI entry — and never inside a step."
- Applies to: all kinds. Detect: manual (logging, IO, `Reflect.defineMetadata` and similar inside a step). R-090 lists the ambient calls. Fix: C-06/C-08 with `tapEffect` (created in T008). Kind: judgement.

### R-076: Never `.thru(() => void expr)` or `.thru(() => null)`
- Source: GUIDE.md §5.6. "NEVER write `.thru(() => void expr)` or `.thru(() => null)` — both collapse the lodash wrapper type to `never` and `.value()` disappears. When a step really must yield `null`, type it: `.thru((): Shader | null => null)`."
- Applies to: all kinds. Detect: audit R-076. Accuracy: exact. 0 at baseline. Kind: mechanical.

## §6 Pipelines

### R-080: The entry point packs its arguments into one object and runs the steps with `flow`
- Source: GUIDE.md §6.1. "The entry point takes plain arguments, packs them into one object and runs the steps with `flow` from `lodash-es`. It does nothing else."
- Applies to: every multi-step change ("A change made in more than one step is a pipeline."). Detect: manual. Fix: C-00. Kind: judgement.

### R-081: One step per file, in `internal/`; a step takes one object, destructures it and returns a new object
- Source: GUIDE.md §6.2. "One step per file, in `internal/`. A step takes one object, destructures it in its parameter list and returns a new object."
- Detect: manual. Kind: judgement. Blocked by Q1 where `internal/` would hold code moved out of public files.

### R-082: The first step types its input inline; later steps use `ReturnType<typeof previousStep>` via `import type`
- Source: GUIDE.md §6.3. "The first step writes its input type inline. Every later step uses the return type of the step before it, imported with `import type`".
- Detect: manual. Kind: mechanical.

### R-083: Pass on only what later steps read, unchanged, and drop fields as soon as possible
- Source: GUIDE.md §6.4. "Pass on only what later steps read. Pass each field on unchanged: the same object, not a copy. Drop a field as soon as no later step reads it."
- Detect: manual; spec rule R-175 asserts `toBe`. Kind: judgement.

### R-084: The last step returns the result itself
- Source: GUIDE.md §6.5. "The last step returns the result itself, not an object." Detect: manual. Kind: mechanical.

### R-085: Change data through collected edits
- Source: GUIDE.md §6.6. "Describe each change as a value in a `create…` step, then apply them all in the last step. NEVER write into the structure you were given".
- Detect: manual (R-049 lists writes). Kind: judgement.

### R-086: One pipeline per operation, not per variant
- Source: GUIDE.md §6.7. "Variants go through the same steps; branch on the variant inside the steps that differ, never in the entry point."
- Detect: manual. Kind: judgement.

### R-087: Standard step names in a fixed order
- Source: GUIDE.md §6.8. "A repository fixes one order for the recurring shape — `get…` the parameters, `find…` the candidates, `shuffle…`/`sort…` them, `pick…` the winners, `create…` the edits, `apply…` them — and every pipeline follows it."
- Detect: manual. The order is fixed in D-11. Kind: judgement.

## §7 Determinism and injected effects

### R-090: Never call an ambient source of truth inside a function that computes
- Source: GUIDE.md §7.1. "No `Math.random`, `Date.now`, `new Date()`, `crypto.randomUUID`, `performance.now`, `localStorage`, `process.env`, `fetch`, or logging. Take what you need as an argument. … lodash `random`, `now` and `uniqueId` are ambient in exactly the same way". §10.5: "NEVER call lodash `random`, `now` or `uniqueId` inside a function that computes".
- Applies to: all kinds. Detect: audit R-090 (`Math.random`, `Date.now`, `new Date`, `performance.now`, `crypto.randomUUID/randomBytes/getRandomValues`, `randomUUID()`, `uid()`, `randomStringGenerator()`, `process.env`, `process.hrtime/cwd/exit/on/once/kill/removeListener/emitWarning`, `fetch()`, `console.*`, `*logger*.log/error/warn/debug/verbose/fatal/info`, `new Logger`).
- Detector accuracy: over-matches (a call at the edge is allowed) and under-matches (lodash `random`/`now`/`uniqueId` once lodash exists; injected `Logger` instances under other names).
- Fix: C-08 with an injected argument. **Changing a public function to take a clock, generator or logger argument changes its signature** (Q1). Kind: judgement. Ordering: §13 step 4.

### R-091: The injected effect is the last argument, named for what it is, passed down unchanged
- Source: GUIDE.md §7.2. "The injected effect is the last argument, named for what it is (`random`, `now`, `fetchJson`). It is passed down unchanged; NEVER build a second one part-way down." Detect: manual. Kind: judgement.

### R-092: One generator per run, created at the outermost entry point from an explicit seed
- Source: GUIDE.md §7.3. "One generator per run, created at the outermost entry point, from an explicit seed, so the same seed MUST always give the same output". Detect: manual. Kind: judgement.

### R-093: A pipeline carries the generator as a field until its last draw
- Source: GUIDE.md §7.4. "A pipeline carries the generator as a field until the last step that draws from it, then drops it." Detect: manual.

### R-094: The order of draws is part of the output
- Source: GUIDE.md §7.5. "Treat a reordering as a behaviour change and re-record the expectations." Detect: manual (R-175 seed tests).

### R-095: Shuffle through the injected generator
- Source: GUIDE.md §7.6. "Shuffle through the injected generator: `sortBy(items, () => random())`." Detect: manual.

### R-096: IO and rendering happen at the edge
- Source: GUIDE.md §7.7 (quoted at R-075). Enforced with R-075.

## §8 Naming

### R-100: Case conventions
- Source: GUIDE.md §8.1. "`camelCase` for functions and values, `PascalCase` for types, `UPPER_SNAKE_CASE` for module constants and for string-union members (`'HORIZONTAL'`), `kebab-case` for files and folders."
- Applies to: all kinds.
- Detect: audit R-100 = (a) file base names that are not kebab-case (`*.decorator.ts`, `shared.utils.ts` and the like); (b) string-literal union members not in `UPPER_SNAKE_CASE`; (c) function declarations and function-valued consts not in camelCase; (d) module-level `const`s holding a string/number literal not in `UPPER_SNAKE_CASE`.
- Detector accuracy: under-matches (does not check type names, folder names, or values that are not literals).
- Fix: C-21 for locals; file names via C-15. **Public decorators are PascalCase functions (`Injectable`, `Get`), public unions use lower-case members (`ContextType = 'http' | 'ws' | 'rpc'`) and file paths are public**, so most hits need Q1. Kind: mechanical. Ordering: Sweep phase.

### R-101: Pipeline steps carry the feature's name; no two steps share a name
- Source: GUIDE.md §8.2. "Steps carry the feature's name, so no two steps in the repository share a name: `findOrderCandidates`, never `findCandidates`."
- Detect: manual, with `docs/FUNCTION_NAMES.md` (duplicate check). Kind: judgement.

### R-102: Words, not letters
- Source: GUIDE.md §8.3. "Callback parameters say what they hold … NEVER use one-letter names. Name a parameter you do not use `_`."
- Applies to: all kinds. Detect: audit R-102 (one-letter parameters, variables and binding elements other than `_`, outside function *type* signatures).
- Detector accuracy: exact for value names; type parameters (`T`) are not counted, because §8.3 is about values (D-13).
- Fix: C-21. Kind: mechanical (the name comes from the glossary). Ordering: Sweep phase, or with the body rewrite.

### R-103: One word per concept, repository-wide; a glossary records the words and counter directions
- Source: GUIDE.md §8.4. "Keep the domain glossary in a table (section 16) and use exactly those words — never a synonym, never an abbreviation … Record which way each counter counts (`pageNumber` from 1, `index` from 0) and convert at the point of use".
- Applies to: all kinds. Detect: manual against `docs/GLOSSARY.md` (T002). Synonyms found at baseline: `req`/`request`, `res`/`response`, `err`/`error`, `ctx`/`context`, `cb`/`callback`, `opts`/`options`, `fn`/`function`. Kind: judgement. Ordering: glossary first (T002), renames in the Sweep phase.

### R-104: Keep a function-name index in alphabetical order
- Source: GUIDE.md §8.5. "Keep a function-name index (for example `docs/FUNCTION_NAMES.md`) in alphabetical order, ignoring case. Check it before you name a function and reuse its words. Add every name you add and remove every name you delete."
- Applies to: all kinds. Detect: `node refactor-plan/tools/function-names.mjs --check` (after T003). Fix: re-run the generator. Kind: mechanical. Ordering: T003 creates it; every later task that adds or removes a function updates it.

## §9 Types

### R-110: `interface` for object shapes; `type` for unions, aliases, records and function types
- Source: GUIDE.md §9.1. "`interface` for object shapes; `type` for unions, aliases, records and function types".
- Applies to: all kinds. Detect: audit R-110 (a `type X = { … }` alias). Accuracy: exact for literal shapes; misses intersections of shapes.
- Fix: C-19 part B (rewrite `type X = { … }` as `interface X { … }`). Pitfall: an interface merges declarations and cannot be a mapped type. Kind: mechanical. Ordering: Sweep phase.

### R-111: String unions for fixed sets; never `enum`
- Source: GUIDE.md §9.2. "String unions for fixed sets of values. NEVER use `enum`."
- Applies to: all kinds. Detect: audit R-111; eslint `TSEnumDeclaration`. Accuracy: exact.
- Fix: C-14. **Exported enums (`HttpStatus`, `RequestMethod`, `Scope`, `Transport`, …) are runtime values in the public API**; blocked by Q1. Kind: judgement.

### R-112: Never `any`
- Source: GUIDE.md §9.3. "NEVER use `any`, non-null assertions (`!`), `@ts-ignore`, `@ts-expect-error` or `as` casts in source files."
- Applies to: all kinds (specs too, §12.10 grants only `as unknown as`). Detect: audit R-112; eslint `@typescript-eslint/no-explicit-any`. Accuracy: exact.
- Fix: C-17. `any` in an exported signature changes users' type-checking (Q1). Kind: judgement.

### R-113: Never a non-null assertion
- Source: GUIDE.md §9.3 (as R-112). Detect: audit R-113; eslint `@typescript-eslint/no-non-null-assertion`. Accuracy: exact.
- Fix: C-18. Kind: judgement (absence threading may change behaviour). Ordering: with R-074.

### R-114: Never `@ts-ignore` or `@ts-expect-error`
- Source: GUIDE.md §9.3 (as R-112). Detect: audit R-114 (comments containing `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`). Accuracy: exact. 0 in package source; 26 in integration, sample and specs.
- Fix: fix the type error the directive hides. Kind: judgement.

### R-115: Never an `as` cast (specs may use `as unknown as` for fixtures)
- Source: GUIDE.md §9.3 (as R-112). §12.10: "Specs may also: cast with `as unknown as` to build a fixture that is hard to type".
- Applies to: all kinds. Detect: audit R-115 (`as` and `<T>` assertions; `as const` is included and labelled `as const`; in specs `x as unknown as T` is skipped).
- Detector accuracy: exact. (`as const` is counted. D-14 decides that it is a violation.) The GUIDE §10.11 wrapper module is excepted (D-06).
- Fix: C-19. Kind: judgement.

### R-116: Reuse types instead of writing them out again
- Source: GUIDE.md §9.4. "Reuse types instead of writing them out again: `ReturnType<typeof step>` for step inputs, `ReturnType<typeof createRandom>` for an injected generator, `Parameters<typeof fn>` for a wrapper." Detect: manual. Kind: mechanical.

### R-117: Import types as types; turn on `verbatimModuleSyntax`
- Source: GUIDE.md §9.5. "Import types as types: `import type { Item } from './types/item';`, or `import { type Item, EMPTY_ITEM } from './types/item';` when one line brings in both. Turn on `verbatimModuleSyntax` so the compiler checks it."
- Applies to: all kinds.
- Detect: (1) audit R-117 (a value import whose every use is in a type position; files that contain a decorator are skipped, exactly like `@typescript-eslint/consistent-type-imports` with `emitDecoratorMetadata`); (2) eslint `@typescript-eslint/consistent-type-imports`; (3) tsc with `verbatimModuleSyntax: true` (TS1484 for imports, TS1205 for re-exports).
- Detector accuracy: (1) and (2) agree. (1) also reports classes and enums used only as types, which tsc does not require. tsc reports pure types in decorated files, which (1) and (2) skip. Use C-12 for both.
- Fix: C-12. **Never convert a class import to `import type` in a file that has decorators** (DI hazard, CONTEXT §9). Kind: mechanical. Ordering: Sweep phase; `verbatimModuleSyntax` is switched on in the Tightening phase.

### R-118: Run the typecheck the way the repository is wired; check each package
- Source: GUIDE.md §9.6. "In a monorepo without a root project reference, a root `tsc -b` can report nothing while packages are broken; check each package."
- This repository: `npm run build` uses project references and checks all 9 packages (CONTEXT §6); specs need the separate `tsconfig.spec.json` check. Encoded in every task's acceptance criteria.

## §10 Libraries

### R-120: `lodash-es` for everything it covers; never array methods; never `.length`
- Source: GUIDE.md §10.1. "NEVER call array methods (`items.map(…)`) and NEVER read `.length`; use `size()`. Reach for a lodash helper before writing one of your own."
- Applies to: all kinds.
- Detect: audit R-120 = calls `.map .filter .reduce .reduceRight .find .findIndex .findLast .findLastIndex .some .every .includes .flatMap .flat .sort .indexOf .lastIndexOf .join .slice .concat .at` on any receiver except `Promise`, `Object`, `Array`, `Reflect`, `JSON`, `Math`, `path`, `rxjs`; and every `.length` read.
- Detector accuracy: **over-matches** (string methods with the same names, RxJS operators called as methods, `Buffer#slice`; a reviewer checks the receiver).
- Fix: C-10. Kind: judgement (receiver type, semantics). Ordering: §13 step 7, after the control-flow steps.

### R-121: One named `import { … } from 'lodash-es'` per file, in sync with what is used
- Source: GUIDE.md §10.2. "One `import { … } from 'lodash-es';` per file, kept in sync with the helpers actually used."
- Detect: audit R-121 (more than one `lodash-es` import line); the compiler flags missing names, and unused names are visible in review. Kind: mechanical.

### R-122: Never the `_` namespace, a default import or a namespace import of lodash
- Source: GUIDE.md §10.2. "NEVER `import _ from 'lodash-es'`, NEVER `import * as _ from 'lodash-es'`, NEVER a `_.`-prefixed call."
- Detect: audit R-122; eslint `ImportDefaultSpecifier`/`ImportNamespaceSpecifier` under `/^lodash/` and `MemberExpression[object.name='_']`. The wrapper module of D-06 is exempt. Kind: mechanical. 0 at baseline.

### R-123: Never the CommonJS `lodash` package or `require('lodash')`
- Source: GUIDE.md §10.2. "NEVER the CommonJS `lodash` package, and NEVER `require('lodash')`."
- Detect: audit R-123; eslint `ImportDeclaration[source.value='lodash']`. 0 at baseline.

### R-124: `@types/lodash-es` is a dev dependency
- Source: GUIDE.md §10.2. "`lodash-es` ships no types: `@types/lodash-es` MUST be a dev dependency, or the named imports do not type-check." §16.1.
- Detect: `node -e "console.log(require('./package.json').devDependencies['@types/lodash-es'])"` prints a version. Fix: T006 (blocked by Q2).

### R-125: `Object.keys`/`values`/`entries` → lodash `keys`/`values`/`entries`
- Source: GUIDE.md §10.3 table. "`Object.keys` / `.values` / `.entries` → `keys` / `values` / `entries` (alias `toPairs`)".
- Detect: audit R-125. Accuracy: exact.
- Fix: C-10. Pitfall: lodash `keys` on an array-like or a string differs from `Object.keys` only for non-objects; `keys(null)` returns `[]`, where `Object.keys(null)` throws.

### R-126: `JSON.parse(JSON.stringify(x))` → `cloneDeep(x)`
- Source: GUIDE.md §10.3. "`JSON.parse(JSON.stringify(obj))` → `cloneDeep(obj)`".
- Detect: audit R-126. Accuracy: exact. Pitfall: `cloneDeep` keeps `undefined`, `Date`, `Map` and class prototypes, which the JSON round trip drops or converts. **Not behaviour-preserving in general**; each hit needs a decision.

### R-127: `typeof x === '…'` and `Array.isArray(x)` → lodash type checks
- Source: GUIDE.md §10.3. "`Array.isArray(x)`, `typeof x === 'string'` → `isArray(x)`, `isString(x)`".
- Detect: audit R-127 (`typeof` compared to a string other than `'undefined'`; `Array.isArray`). `typeof x === 'undefined'` is R-074.
- Detector accuracy: exact.
- Fix: C-10 table. Pitfall: lodash `isObject` is true for functions, unlike `typeof x === 'object'`; `isFunction` matches classes; `isNumber(NaN)` is true.

### R-128: Arithmetic through lodash; `Math` keeps only `abs` and two-number `min`/`max`
- Source: GUIDE.md §10.3. "`Math.round`, `Math.floor`, `Math.ceil` → `round`, `floor`, `ceil`"; "`Math.max(...nums)`, `Math.min(...nums)` → `max(nums)`, `min(nums)`". §10.16: "`Math` keeps only the scalar cases lodash does not cover: `Math.abs`, and `Math.min`/`Math.max` on two single numbers."
- Detect: audit R-128. Accuracy: exact. Pitfall: lodash `max([])` returns `undefined`; `Math.max()` returns `-Infinity`.

### R-129: `Object.assign({}, a, b)` / `{ ...a, ...b }` → `assign({}, a, b)` (or `merge({}, …)` for deep)
- Source: GUIDE.md §10.3. "`Object.assign({}, a, b)`, `{ ...a, ...b }` → `assign({}, a, b)`; `merge({}, a, b)` when the merge is deep".
- Detect: audit R-129 (`Object.assign` calls; object literals with two or more spreads). Accuracy: exact for the forms listed. A single spread `{ ...record, key }` is allowed (§3.8, §10.6).
- Fix: C-10. Pitfall: `assign` copies own enumerable string keys **and** skips symbol keys, while spread copies symbols; check for symbol keys first.

### R-130: String natives → lodash string helpers
- Source: GUIDE.md §10.3. "`str.trim()`, `str.charAt(0).toUpperCase() + …` → `trim(str)`, `upperFirst(str)`"; "hand-rolled case conversion → `camelCase`, `kebabCase`, … `pad`, `truncate`, `repeat`".
- Detect: audit R-130 (`.trim .trimStart .trimEnd .toUpperCase .toLowerCase .charAt .padStart .padEnd .repeat .startsWith .endsWith .split .replace`).
- Detector accuracy: over-matches (receiver may not be a string).
- Fix: C-10. Pitfall: lodash `trim(undefined)` returns `''` where `undefined.trim()` throws.

### R-131: `hasOwnProperty`/`Object.hasOwn` → `has`
- Source: GUIDE.md §10.3. "`Object.prototype.hasOwnProperty.call(obj, 'id')` → `has(obj, 'id')`".
- Detect: audit R-131. Pitfall: lodash `has(obj, 'a.b')` also follows the path `obj.a.b` when no literal key `'a.b'` exists (`has({ a: { b: 1 } }, 'a.b')` is `true`; `Object.hasOwn` gives `false`). Pass the key as a one-element array, `has(obj, [key])`, whenever the key is not a literal without dots.

### R-132: `a && a.b && a.b.c` → `get(a, 'b.c')`
- Source: GUIDE.md §10.3. "`a && a.b && a.b.c` → `get(a, 'b.c')`".
- Detect: audit R-132 (`x && x.y`). Accuracy: over-matches (`a && a.b` used as a boolean) — `?.` (R-068) is equally allowed.

### R-133: Rest-destructuring to drop keys → `omit`/`pick`
- Source: GUIDE.md §10.3. "`const { password, ...safe } = user` → `omit(user, ['password'])`, `pick(user, [...])`".
- Detect: audit R-133 (object rest in a binding pattern). Pitfall: `omit` deep-clones nothing but does copy inherited enumerable keys.

### R-135: `forEach` is banned, in both forms
- Source: GUIDE.md §10.4. "`items.forEach(…)` and `forEach(items, …)` are statement-level loops that exist only for their side effects, and a body holds no side effects".
- Detect: audit R-135; eslint `CallExpression[callee.property.name='forEach']` and `[callee.name='forEach']`. Accuracy: exact (includes `Map#forEach`, which the rule also bans).
- Fix: C-05. Kind: judgement.

### R-137: Mutating lodash helpers are banned on values you were given
- Source: GUIDE.md §10.6. "`merge` and `assign` write into their first argument, so the first argument MUST be a new literal … NEVER use `set`, `unset`, `pull`, `remove`, `fill` or `reverse` on a value you were given".
- Detect: manual review of every `merge`/`assign`/`set`/`unset`/`pull`/`remove`/`fill`/`reverse` call (none exist at baseline).

### R-138: Prefer the arrow over the property shorthand
- Source: GUIDE.md §10.7. "`map(users, 'name')` type-checks but infers loosely; `map(users, (user) => user.name)` keeps the tighter type."
- Detect: manual (none at baseline). Kind: mechanical.

### R-139: lodash type guards narrow; inside `match` prefer `P` patterns
- Source: GUIDE.md §10.8. "Inside a `match`, prefer the `P` pattern (`string`, `number`, `array()`); use a lodash guard where you need it outside a pattern position, or inside `.when`."
- Detect: manual. Fix: C-03.

### R-140: Dates are not lodash's job
- Source: GUIDE.md §10.9. "NEVER invent a lodash date helper or force arithmetic through `add`/`subtract` where real date semantics are meant; take a date library (`date-fns`, `dayjs`) and say so."
- Detect: manual. Package source uses `new Date` (reported under R-090) but no date arithmetic library. Kind: judgement.

### R-141: Async stays out of collection helpers; no `for await`, no `await` in a loop
- Source: GUIDE.md §10.10. "Run independent work with `Promise.all(map(items, loadOne))`; sequence dependent work by folding with `reduce` over a promise … NEVER write `for await` or an `await` inside a loop in a body."
- Detect: audit R-141 (`for await`; `await` inside a loop body). Accuracy: exact.
- Fix: C-24. **Sequential and parallel are different behaviour**: a sequential loop becomes the `reduce` form, never `Promise.all`. Kind: judgement.

### R-142: `chain` comes from the local wrapper; every chain ends with `.value()`
- Source: GUIDE.md §10.11. "`chain` must come from a local wrapper, NEVER straight from `lodash-es`. … import `chain` from that module everywhere … End every chain with `.value()`."
- Detect: audit R-142 (`chain` imported from `lodash-es`); eslint selector. `.value()` is checked in review (a missing `.value()` usually fails the typecheck). 0 at baseline.

### R-143: `flow` from `lodash-es` runs pipelines and composes steps
- Source: GUIDE.md §10.12. Detect: manual.

### R-144: `match` and `P` from `ts-pattern` do all branching
- Source: GUIDE.md §10.13. Enforced with R-011…R-013.

### R-145: `tryCatch` from ramda, imported by name; never the `R` namespace
- Source: GUIDE.md §10.14. "Import ramda functions by name and call them bare: NEVER `import * as R from 'ramda'`, NEVER `R.tryCatch`."
- Detect: audit R-145. 0 at baseline.

### R-146: `noop` from lodash-es is the only no-op thunk; never `() => undefined`
- Source: GUIDE.md §10.15. "`noop` from `lodash-es` is the only way to write a no-op thunk. NEVER write `() => undefined`."
- Detect: audit R-146 (`() => undefined`, `() => void 0`, `() => {}`).
- Detector accuracy: over-matches only where a typed function must return something other than `undefined`. `() => {}` is counted because it is the same no-op thunk (D-15).
- Fix: replace with `noop` (needs Q2). Kind: mechanical.

### R-148: Sorting: `sortBy` (stable); negate the key to sort descending; tie-break with a key list
- Source: GUIDE.md §10.17. "`sortBy` is stable: it keeps tied items in their old order, and tests depend on it. Sort from high to low by negating the key … `sortBy` returns a new array; `reverse` does not, so copy first."
- Detect: audit R-120 hits whose detail is `.sort(`. `Array#sort` sorts in place and is stable in Node ≥ 12; `sortBy` returns a new array.
- Fix: C-10 (sorting). Pitfall: the comparator → key translation; and in-place mutation that callers may rely on.

### R-149: One library per job
- Source: GUIDE.md §10.18. "Do not add a second collection, pattern-matching or date library beside the ones above; extend the local wrapper module instead."
- Detect: audit R-149 (imports of `iterare`, `lodash`, `underscore`, `immutable`, `date-fns`, `dayjs`, `moment`, `luxon`, `ramda-adjunct`). 22 package files import `iterare`.
- Fix: C-10 (`iterate(x).map(f).filter(g).toArray()` → `filter(map(x, f), g)`), then remove `iterare` from `package.json` (Tightening). Pitfall: `iterare` is lazy and accepts any iterable (`Set`, `Map` values); lodash `map` on a `Set` returns `[]`, so convert with `[...set]` first. Kind: judgement.

### R-150: Cross-package imports use the path aliases; in-package imports are relative and spelled one way
- Source: GUIDE.md §10.19. "Imports across package boundaries use the repository's path aliases. Imports inside a package use relative paths, spelled the way its neighbours spell them (with or without the file extension — pick one per repository)."
- Detect: audit R-150 (a relative import that leaves its package; a relative import without `.js`). Decision D-07: always with `.js` (Node16 ESM requires it).
- Detector accuracy: exact.
- Fix: C-13. Kind: mechanical. Ordering: Sweep phase.

## §11 Layout and comments

### R-160: Prettier decides the formatting
- Source: GUIDE.md §11.1. "Prettier decides the formatting. Keep its defaults close to: single quotes, semicolons, trailing commas, two-space indents, 80 columns. Never hand-format."
- Detect: `npx prettier --check --end-of-line auto <files>`. The repo's `.prettierrc` already agrees (CONTEXT §8). Every task formats its own files.

### R-161: Package imports first, then relative imports; each group sorted by path
- Source: GUIDE.md §11.2. "Import order: package imports first, then relative imports. Sort each group by path."
- Detect: audit R-161 (a relative import before a package import; a group not in ascending code-point order of the module specifier, D-16). Accuracy: exact.
- Fix: C-13. Kind: mechanical. Pitfall: moving an import changes module evaluation order. Side-effect imports such as `import 'reflect-metadata';` keep their position (D-16).

### R-162: No blank line between the two import groups in source files; exactly one in specs
- Source: GUIDE.md §11.3. "Source files have no blank line between the two import groups. Spec files have exactly one."
- Detect: audit R-162. Accuracy: exact. Prettier preserves single blank lines, so this survives formatting.

### R-163: One blank line between top-level statements; the `P` destructuring right after the imports
- Source: GUIDE.md §11.4. "One blank line between top-level statements. The `P` destructuring (`const { nullish } = P;`) goes right after the imports."
- Detect: audit R-163 (not exactly one blank line between consecutive top-level statements; consecutive imports and consecutive `export … from` re-exports are exempt, D-16).
- Detector accuracy: exact for blank lines. The `P` placement is checked in review.

### R-164: No comments, except tool directives and §15 notes
- Source: GUIDE.md §11.5. "No comments. Names and tests explain the code. The only comments allowed are tool directives, such as `// eslint-disable-next-line`, and the note on each exception in section 15."
- Detect: audit R-164 (every comment that does not start with `eslint`, `oxlint`, `prettier-ignore`, `@ts-`, `istanbul`, `c8`, `v8`, `#region`, `<reference`).
- Detector accuracy: exact. Licence headers and JSDoc count.
- Fix: C-20. **JSDoc in package sources is emitted into the published `.d.ts` files and shown to users in their editors** (`removeComments: false`); blocked by Q4. Kind: mechanical once decided.

## §12 Tests

### R-170: One runner, imported by name
- Source: GUIDE.md §12.1. "With Vitest, `import { describe, expect, it } from 'vitest';`."
- Applies to: specs. Detect: audit R-170 (a spec without any import from `vitest`). Accuracy: under-matches (checks that the import exists, not which names).
- Fix: C-16. Kind: mechanical. Vitest runs with `globals: true`; the named import works either way.

### R-171: No mocks, spies, `beforeEach`, `afterEach`, snapshots, `.only`, `.skip` or `it.each`
- Source: GUIDE.md §12.1. "NEVER use mocks, spies, `beforeEach`, `afterEach`, snapshots, `.only`, `.skip` or `it.each`. A body that takes its effects as arguments (section 7) needs no mock: pass a stub function."
- Applies to: specs. Detect: audit R-171 (`vi.fn/spyOn/mock/doMock/stubGlobal/stubEnv/useFakeTimers/mocked/hoisted`, `sinon.*`, `beforeEach`, `afterEach`, `toMatchSnapshot`/`toMatchInlineSnapshot`/`toMatchFileSnapshot`, `it|test|describe` `.only/.skip/.each/.todo/.skipIf/.runIf`).
- Detector accuracy: over-matches `vi.fn()` used as a plain stub function with no assertions on its calls (still a mock by Vitest's definition). `beforeAll`/`afterAll` are not listed by the guide and are not counted (D-17).
- Fix: C-16. Rewriting the existing 2 257 hits in package specs is a test rewrite (Q6). New specs never use them. Kind: judgement.

### R-172: One `describe` per file, named exactly after the function
- Source: GUIDE.md §12.2. "One `describe` per file, named exactly after the function: `describe('pickCandidate', …)`. Only a spec that checks behaviour across several features uses a plain-English title."
- Applies to: specs. Detect: audit R-172 (a spec with ≠ 1 `describe` call). Accuracy: under-matches (does not check the title).

### R-173: Test titles read `should … when …`
- Source: GUIDE.md §12.3. "Titles read `should … when …`, in plain everyday English about the domain, not the code. Call the function "it"."
- Applies to: specs. Detect: audit R-173 (an `it`/`test` title not matching `^should .+ when .+`). Accuracy: exact for the shape; the wording is reviewed.

### R-174: Test each step on its own; the entry point's spec checks the whole feature
- Source: GUIDE.md §12.4. "Every step in `internal/` has its own spec. The entry point's spec checks the feature as a whole." Detect: manual (R-033 finds the missing files).

### R-175: What every spec covers
- Source: GUIDE.md §12.5. "the main behaviour, and the empty case …; for a pipeline step: one test for each field it passes on, using `toBe` …; for an entry point or an `apply…` step: that the input it was given is unchanged …; for anything that draws from an injected generator: the same seed gives the same result, and another seed gives a different one …; for anything that branches on a variant: every member of the union; for anything wrapped in `tryCatch`: that the failing path returns the fallback."
- Detect: manual (the task lists the cases). Kind: judgement.

### R-176: Fixtures
- Source: GUIDE.md §12.6. "Shared read-only fixtures are `UPPER_SNAKE_CASE` constants … When a test checks that the input is left alone, build the fixture with a factory so every call makes a fresh one … Write a bulky fixture in compact literal notation and expand it through a legend … Wrap the call in a helper that returns only the field under test".
- Detect: manual. Kind: judgement.

### R-177: Assertions
- Source: GUIDE.md §12.7. "`toEqual` for values. `toBe` for primitives and to show the same object came back. `toBeCloseTo` for fractions. When you check many cases inside `times(…)`, pass a message so a failure names the case".
- Detect: manual.

### R-178: Blank lines separate setup, call and `expect`s inside a test
- Source: GUIDE.md §12.8. "Inside a test, separate the setup, the call and the `expect`s with blank lines." Detect: manual.

### R-179: A slow test passes its timeout as the third argument of `it`
- Source: GUIDE.md §12.9. "A slow test that needs more than the default time passes a timeout as the third argument of `it`: `120000`." Detect: manual.

### R-180: What specs may additionally do
- Source: GUIDE.md §12.10. "Specs may also: cast with `as unknown as` to build a fixture that is hard to type, write into a fixture they have just made, collect calls in a local array (`offsets.push(offset)`), and declare small local types. Every other rule in this guide applies to specs too." A permission; the audit applies it in R-049, R-115 and R-036.

### R-181: Know the command that actually runs the tests
- Source: GUIDE.md §12.11. "In a monorepo whose task runner is misconfigured, a green root command can mean nothing ran; run the runner inside the package." This repo: `npx vitest run` runs 305 files and 3 814 tests (CONTEXT §3). Every acceptance check states the expected file and test counts.

## §13–§16 Procedure, exceptions, adoption

### R-190: Rewrite a body in the §13 order
- Source: GUIDE.md §13. "Read the whole file first and note its existing imports. Then work in this order, one construct at a time." Steps 1–11. Encoded as recipe C-00.

### R-191: The result behaves exactly as before; change style, not logic
- Source: GUIDE.md §13. "The result MUST behave exactly as the code did before: same outputs, same short-circuiting, same mutation or non-mutation. Change the style, not the logic — do not rename variables or restructure anything the refactor does not touch."
- Applies to: every task. Detect: tests plus review. Every task's "Must not change" section.

### R-192: The "Remove these on sight" list
- Source: GUIDE.md §14. Every item maps to a rule above: const staircase/loops/let/reassignment → R-010/R-014/R-017/R-018/R-019; if/else/switch/?: → R-011–R-013; try/catch/throw → R-015/R-016; `import * as R` → R-145; `chain` from lodash-es → R-142; CommonJS lodash/`_.` → R-122/R-123; `forEach` → R-135; mutating lodash calls → R-137; Object.keys/JSON round trip/Array.isArray/typeof/case conversion → R-125–R-127, R-130; `map(users, 'name')` → R-138; `for await`/await in loop → R-141; invented lodash date helper → R-140; inline `P.*` → R-063; instanceof/typeof ladder → R-067; `.length`/array methods → R-120; scattered null guards → R-074; `() => undefined` → R-146; mid-pipeline side effect → R-075; exported function doing logic → R-020; `Math.random`/`Date.now`/`process.env`/second generator → R-090/R-092; explaining comment → R-164.

### R-195: Measured exceptions only
- Source: GUIDE.md §15. "Imperative code survives in exactly two shapes, and only where a measurement says it must. Each one carries a comment naming the measurement." (1) "A hot numeric kernel whose mutation never leaves the function …" (2) "A single mutable state cell inside a generator or iterator, where the state _is_ the semantics". "Measure before assuming. … Record your own numbers in the comment, and add nothing to this list without them."
- Applies to: all kinds. Detect: manual. **No exception is granted in this plan**: no measurement exists yet (D-10). A task that hits a performance-sensitive path stops and asks for a benchmark task.

### R-196: Fill the five adoption blanks
- Source: GUIDE.md §16. "Fill in these five blanks, then the guide is complete for that repository: 1. The dependencies. … 2. The `chain` wrapper module … 3. The domain glossary … 4. Where constants live … 5. The real commands". Filled in DECISIONS.md D-01–D-05 and CONTEXT §3.

### R-197: Enforce with the listed lint rules; warnings first, errors last
- Source: GUIDE.md §16. "Enforce what a linter can. These `no-restricted-syntax` selectors are verified to fire on the constructs they name, under ESLint flat config … Add to that: `prefer-const`, `no-param-reassign`, `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-non-null-assertion`, and `@typescript-eslint/consistent-type-imports`. … Turn them on as warnings, fix per folder, and only then raise them to errors".
- Fix: T001 (warnings); Tightening phase (errors).
