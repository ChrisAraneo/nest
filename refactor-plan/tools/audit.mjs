#!/usr/bin/env node
// Functional Pipelines Style audit for this repository. Read-only: it never
// writes outside the path given to --out.
//
// Usage (run from the repository root):
//   node refactor-plan/tools/audit.mjs                       summary per rule
//   node refactor-plan/tools/audit.mjs --files <p1,p2>       restrict to paths (exact file or folder prefix)
//   node refactor-plan/tools/audit.mjs --rules R-011,R-013   restrict to rules
//   node refactor-plan/tools/audit.mjs --format locations    one line per violation: path:line:col rule [symbol] detail
//   node refactor-plan/tools/audit.mjs --format json --out x.json
//   node refactor-plan/tools/audit.mjs --format csv  --out x.csv    per-file counts
//   node refactor-plan/tools/audit.mjs --fail-on-any          exit 1 when any violation is selected
//
// Rule IDs match refactor-plan/RULES.md. Detector accuracy is documented there.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const ROOT = process.cwd();
const require = createRequire(path.join(ROOT, 'package.json'));
const ts = require('typescript');

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const FILTER_FILES = opt('--files', '')
  .split(',')
  .map(s => s.trim().replace(/\\/g, '/'))
  .filter(Boolean);
const FILTER_RULES = new Set(
  opt('--rules', '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
);
const FORMAT = opt('--format', 'summary');
const OUT = opt('--out', '');
const FAIL_ON_ANY = args.includes('--fail-on-any');

const ARRAY_METHODS = new Set([
  'map', 'filter', 'reduce', 'reduceRight', 'find', 'findIndex', 'findLast',
  'findLastIndex', 'some', 'every', 'includes', 'flatMap', 'flat', 'sort',
  'indexOf', 'lastIndexOf', 'join', 'slice', 'concat', 'at',
]);
const STRING_METHODS = new Set([
  'trim', 'trimStart', 'trimEnd', 'toUpperCase', 'toLowerCase', 'charAt',
  'padStart', 'padEnd', 'repeat', 'startsWith', 'endsWith', 'split', 'replace',
]);
const MUTATING_METHODS = new Set([
  'push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'fill', 'copyWithin',
]);
const LOG_METHODS = new Set(['log', 'error', 'warn', 'debug', 'verbose', 'fatal', 'info']);
const SECOND_LIBRARIES = new Set([
  'iterare', 'lodash', 'underscore', 'ramda-adjunct', 'immutable', 'date-fns',
  'dayjs', 'moment', 'luxon',
]);
const DIRECTIVE_COMMENT =
  /^\s*(\/\/|\/\*)\s*(eslint|oxlint|prettier-ignore|@ts-|istanbul|c8 |v8 |#region|#endregion|<reference)/;

const listFiles = () => {
  const out = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '--', '*.ts'],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  return [...new Set(out.split('\n').map(s => s.trim()).filter(Boolean))]
    .filter(f => !f.endsWith('.d.ts'))
    .filter(f => !f.startsWith('refactor-plan/'))
    .filter(f => fs.existsSync(path.join(ROOT, f)))
    .filter(
      f =>
        FILTER_FILES.length === 0 ||
        FILTER_FILES.some(p => f === p || f.startsWith(p.endsWith('/') ? p : p + '/')),
    )
    .sort();
};

export const classify = file => {
  if (file.startsWith('sample/')) return 'sample';
  if (file.startsWith('integration/')) return 'integration';
  if (file.startsWith('tools/')) return 'tools';
  if (file.endsWith('.spec.ts')) return 'spec';
  if (/^packages\/[^/]+\/test\//.test(file)) return 'test-support';
  if (file.startsWith('packages/')) return 'source';
  return 'other';
};

const area = file => {
  const m = /^packages\/([^/]+)\//.exec(file);
  return m ? `packages/${m[1]}` : file.split('/')[0];
};

const kebab = name =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();

const isKebab = s => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);
const isUpperSnake = s => /^[A-Z0-9]+(_[A-Z0-9]+)*$/.test(s);
const isCamel = s => /^[a-z][a-zA-Z0-9]*$/.test(s);

const hasModifier = (node, kind) =>
  !!(ts.canHaveModifiers(node) && ts.getModifiers(node)?.some(m => m.kind === kind));

const isFunctionLike = node =>
  ts.isFunctionDeclaration(node) ||
  ts.isFunctionExpression(node) ||
  ts.isArrowFunction(node) ||
  ts.isMethodDeclaration(node) ||
  ts.isConstructorDeclaration(node) ||
  ts.isGetAccessorDeclaration(node) ||
  ts.isSetAccessorDeclaration(node);

const isInTypePosition = node => {
  let current = node.parent;
  while (current) {
    if (ts.isExpressionWithTypeArguments(current) && current.parent && ts.isHeritageClause(current.parent)) {
      const clause = current.parent;
      return clause.token === ts.SyntaxKind.ImplementsKeyword || ts.isInterfaceDeclaration(clause.parent);
    }
    if (ts.isTypeNode(current) && !ts.isExpressionWithTypeArguments(current)) return true;
    if (ts.isInterfaceDeclaration(current) || ts.isTypeAliasDeclaration(current)) return true;
    if (ts.isExpression(current) && !ts.isTypeNode(current)) return false;
    if (ts.isStatement(current) || isFunctionLike(current)) return false;
    current = current.parent;
  }
  return false;
};

const symbolName = node => {
  if (ts.isFunctionDeclaration(node) && node.name) return node.name.text;
  if ((ts.isMethodDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) && node.name) {
    const owner = node.parent && ts.isClassLike(node.parent) && node.parent.name ? node.parent.name.text + '.' : '';
    return owner + node.name.getText();
  }
  if (ts.isConstructorDeclaration(node)) {
    return (node.parent?.name?.text ?? '<class>') + '.constructor';
  }
  if (ts.isClassLike(node)) return node.name?.text ?? '<anonymous class>';
  if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && node.parent) {
    if (ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) return node.parent.name.text;
    if (ts.isPropertyAssignment(node.parent) || ts.isPropertyDeclaration(node.parent)) return node.parent.name.getText();
  }
  return undefined;
};

const auditFile = file => {
  const abs = path.join(ROOT, file);
  const text = fs.readFileSync(abs, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const kind = classify(file);
  const isSpec = file.endsWith('.spec.ts');
  const hits = [];
  const stack = [];
  const currentSymbol = () => {
    for (let i = stack.length - 1; i >= 0; i--) if (stack[i]) return stack[i];
    return '<module>';
  };
  const hit = (rule, node, detail = '') => {
    const pos = node ? sf.getLineAndCharacterOfPosition(node.getStart(sf)) : { line: 0, character: 0 };
    hits.push({ rule, line: pos.line + 1, col: pos.character + 1, symbol: currentSymbol(), detail });
  };

  const findDecorator = n => ts.isDecorator(n) || !!ts.forEachChild(n, findDecorator);
  const hasDecorators = findDecorator(sf);
  const lodashEsImports = [];
  let importsP = false;

  const blockExempt = body => {
    const statements = body.statements;
    if (statements.length < 2) return false;
    const last = statements[statements.length - 1];
    if (!ts.isReturnStatement(last)) return false;
    const decls = statements.slice(0, -1);
    if (!decls.every(s => ts.isVariableStatement(s) && (s.declarationList.flags & ts.NodeFlags.Const))) return false;
    const names = decls.flatMap(s => s.declarationList.declarations.map(d => d.name.getText(sf)));
    const bodyText = body.getText(sf);
    return names.every(n => (bodyText.match(new RegExp(`\\b${n.replace(/[$]/g, '\\$')}\\b`, 'g')) ?? []).length >= 3);
  };

  const visit = node => {
    const pushed = isFunctionLike(node) || ts.isClassLike(node);
    if (pushed) stack.push(symbolName(node));

    // R-010 / R-019 / R-043: function bodies
    const isTestCallback = isSpec && node.parent && ts.isCallExpression(node.parent) && /^(it|test|describe|beforeEach|afterEach|beforeAll|afterAll)(\.|$)/.test(node.parent.expression.getText(sf));
    if (isFunctionLike(node) && node.body && ts.isBlock(node.body) && !isTestCallback) {
      const body = node.body;
      if (!blockExempt(body)) hit('R-010', node, `block body with ${body.statements.length} statement(s)`);
      const consts = body.statements.filter(
        s => ts.isVariableStatement(s) && s.declarationList.flags & ts.NodeFlags.Const,
      ).length;
      if (consts >= 2) hit('R-019', node, `${consts} const statements in one body`);
      if (ts.isArrowFunction(node) && body.statements.length === 1 && ts.isReturnStatement(body.statements[0])) {
        hit('R-043', node, 'arrow `{ return …; }`');
      }
      if (ts.isArrowFunction(node) && body.statements.length === 0) hit('R-146', node, '`() => {}`');
    }
    if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) {
      const b = node.body;
      if ((ts.isIdentifier(b) && b.text === 'undefined') || (ts.isVoidExpression(b) && b.expression.getText(sf) === '0')) {
        hit('R-146', node, '`() => undefined`');
      }
    }

    if (ts.isIfStatement(node)) hit('R-011', node);
    if (ts.isSwitchStatement(node)) hit('R-012', node);
    if (ts.isConditionalExpression(node)) hit('R-013', node);
    if (ts.isForStatement(node) || ts.isForInStatement(node) || ts.isWhileStatement(node) || ts.isDoStatement(node)) {
      hit('R-014', node, ts.SyntaxKind[node.kind]);
    }
    if (ts.isForOfStatement(node)) {
      if (node.awaitModifier) hit('R-141', node, 'for await');
      else hit('R-014', node, 'ForOfStatement');
    }
    if (ts.isTryStatement(node)) hit('R-015', node);
    if (ts.isThrowStatement(node)) hit('R-016', node);
    if (ts.isVariableDeclarationList(node)) {
      const isLet = node.flags & ts.NodeFlags.Let;
      const isConst = node.flags & ts.NodeFlags.Const;
      const isUsing = node.flags & (ts.NodeFlags.Using | ts.NodeFlags.AwaitUsing);
      if (isLet) hit('R-017', node, 'let');
      else if (!isConst && !isUsing) hit('R-017', node, 'var');
    }
    if (ts.isBinaryExpression(node)) {
      const op = node.operatorToken.kind;
      const isAssign = op >= ts.SyntaxKind.FirstAssignment && op <= ts.SyntaxKind.LastAssignment;
      if (isAssign) {
        if (ts.isIdentifier(node.left) || ts.isArrayLiteralExpression(node.left) || ts.isObjectLiteralExpression(node.left)) {
          hit('R-018', node, `reassign ${node.left.getText(sf).slice(0, 40)}`);
        } else if (ts.isPropertyAccessExpression(node.left) || ts.isElementAccessExpression(node.left)) {
          if (!(isSpec)) hit('R-049', node, `write ${node.left.getText(sf).slice(0, 40)}`);
        }
      }
      if (op === ts.SyntaxKind.InstanceOfKeyword) hit('R-067', node);
      if ([ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(op)) {
        const sides = [node.left, node.right];
        const nullish = sides.some(s => s.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(s) && s.text === 'undefined'));
        const typeofSide = sides.find(ts.isTypeOfExpression);
        const strSide = sides.find(s => ts.isStringLiteral(s) || ts.isNoSubstitutionTemplateLiteral(s));
        if (nullish) hit('R-074', node, node.getText(sf).slice(0, 50));
        if (typeofSide && strSide) {
          if (strSide.text === 'undefined') hit('R-074', node, node.getText(sf).slice(0, 50));
          else hit('R-127', node, `typeof === '${strSide.text}'`);
        }
      }
      if (op === ts.SyntaxKind.AmpersandAmpersandToken && ts.isPropertyAccessExpression(node.right)) {
        const leftmost = node.left;
        const leftText = ts.isBinaryExpression(leftmost) ? leftmost.right.getText(sf) : leftmost.getText(sf);
        if (node.right.expression.getText(sf) === leftText) hit('R-132', node, node.getText(sf).slice(0, 50));
      }
    }
    if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
        (node.operator === ts.SyntaxKind.PlusPlusToken || node.operator === ts.SyntaxKind.MinusMinusToken)) {
      if (ts.isIdentifier(node.operand)) hit('R-018', node, node.getText(sf));
      else if (!isSpec) hit('R-049', node, node.getText(sf));
    }
    if (ts.isDeleteExpression(node) && !isSpec) hit('R-049', node, 'delete');

    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) hit('R-040', node, 'function keyword');
    if ((ts.isMethodDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) &&
        node.parent && ts.isObjectLiteralExpression(node.parent)) {
      hit('R-040', node, 'object-literal method');
    }
    if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) hit('R-041', node, node.name?.text ?? '');
    if (node.kind === ts.SyntaxKind.ThisKeyword) hit('R-042', node);

    if (ts.isEnumDeclaration(node)) hit('R-111', node, node.name.text);
    if (node.kind === ts.SyntaxKind.AnyKeyword) hit('R-112', node);
    if (ts.isNonNullExpression(node)) hit('R-113', node);
    if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
      const typeText = node.type.getText(sf);
      const isAsConst = typeText === 'const';
      const isUnknownChain = ts.isAsExpression(node.expression) && node.expression.type.getText(sf) === 'unknown';
      const isInnerOfUnknownChain = typeText === 'unknown' && ts.isAsExpression(node.parent);
      if (isSpec && (isUnknownChain || isInnerOfUnknownChain)) {
        // §12.10: specs may cast with `as unknown as`.
      } else if (!isInnerOfUnknownChain) {
        hit('R-115', node, isAsConst ? 'as const' : `as ${typeText.slice(0, 40)}`);
      }
    }
    if (ts.isTypeAliasDeclaration(node)) {
      if (ts.isTypeLiteralNode(node.type)) hit('R-110', node, node.name.text);
      if (ts.isUnionTypeNode(node.type)) {
        node.type.types.forEach(t => {
          if (ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal) && !isUpperSnake(t.literal.text)) {
            hit('R-100', t, `union member '${t.literal.text}' not UPPER_SNAKE_CASE`);
          }
        });
      }
    }

    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (ts.isPropertyAccessExpression(callee)) {
        const name = callee.name.text;
        const recv = callee.expression.getText(sf);
        if (name === 'forEach') hit('R-135', node, `${recv.slice(0, 30)}.forEach`);
        else if (ARRAY_METHODS.has(name) && !['Promise', 'Object', 'Array', 'Reflect', 'JSON', 'Math', 'path', 'rxjs'].includes(recv)) {
          hit('R-120', node, `.${name}(`);
        }
        if (STRING_METHODS.has(name)) hit('R-130', node, `.${name}(`);
        if (MUTATING_METHODS.has(name) && !isSpec) hit('R-049', node, `.${name}(`);
        if (name === 'catch' && node.arguments.length === 1) hit('R-073', node, '.catch(');
        if (recv === 'Object' && ['keys', 'values', 'entries'].includes(name)) hit('R-125', node, `Object.${name}`);
        if (recv === 'Object' && name === 'assign') {
          hit('R-129', node, 'Object.assign');
          if (node.arguments[0] && !ts.isObjectLiteralExpression(node.arguments[0]) && !isSpec) hit('R-049', node, 'Object.assign into existing object');
        }
        if (recv === 'Object' && ['defineProperty', 'defineProperties', 'setPrototypeOf'].includes(name) && !isSpec) hit('R-049', node, `Object.${name}`);
        if (recv === 'Reflect' && ['defineMetadata', 'set', 'deleteMetadata', 'defineProperty'].includes(name) && !isSpec) hit('R-049', node, `Reflect.${name}`);
        if (recv === 'Object' && name === 'hasOwn') hit('R-131', node, 'Object.hasOwn');
        if (name === 'call' && ts.isPropertyAccessExpression(callee.expression) && callee.expression.name.text === 'hasOwnProperty') hit('R-131', node, 'hasOwnProperty.call');
        if (name === 'hasOwnProperty' && !ts.isPropertyAccessExpression(callee.expression)) hit('R-131', node, '.hasOwnProperty(');
        if (recv === 'Array' && name === 'isArray') hit('R-127', node, 'Array.isArray');
        if (recv === 'JSON' && name === 'parse' && node.arguments[0] && ts.isCallExpression(node.arguments[0]) && node.arguments[0].expression.getText(sf) === 'JSON.stringify') hit('R-126', node);
        if (recv === 'Math') {
          if (['round', 'floor', 'ceil'].includes(name)) hit('R-128', node, `Math.${name}`);
          if (['max', 'min'].includes(name) && (node.arguments.length !== 2 || node.arguments.some(ts.isSpreadElement))) hit('R-128', node, `Math.${name} not on two numbers`);
          if (name === 'random') hit('R-090', node, 'Math.random');
        }
        if (recv === 'Date' && name === 'now') hit('R-090', node, 'Date.now');
        if (recv === 'performance' && name === 'now') hit('R-090', node, 'performance.now');
        if (/^(crypto|webcrypto)$/.test(recv) && ['randomUUID', 'randomBytes', 'getRandomValues'].includes(name)) hit('R-090', node, `${recv}.${name}`);
        if (recv === 'process' && ['hrtime', 'cwd', 'exit', 'on', 'once', 'kill', 'removeListener', 'emitWarning'].includes(name)) hit('R-090', node, `process.${name}`);
        if (recv === 'console') hit('R-090', node, `console.${name}`);
        else if (LOG_METHODS.has(name) && /logger/i.test(recv)) hit('R-090', node, `${recv.slice(0, 30)}.${name}`);
        if (recv === '_' ) hit('R-122', node, '_. call');
        if (name === 'thru' && node.arguments[0] && ts.isArrowFunction(node.arguments[0])) {
          const b = node.arguments[0].body;
          if (ts.isVoidExpression(b) || b.kind === ts.SyntaxKind.NullKeyword) hit('R-076', node);
        }
        if (name === 'with' && node.arguments[0] && ts.isNumericLiteral(node.arguments[0])) hit('R-065', node);
        if (isSpec && ['fn', 'spyOn', 'mock', 'doMock', 'stubGlobal', 'stubEnv', 'useFakeTimers', 'mocked', 'hoisted'].includes(name) && recv === 'vi') hit('R-171', node, `vi.${name}`);
        if (isSpec && recv === 'sinon') hit('R-171', node, `sinon.${name}`);
        if (isSpec && ['toMatchSnapshot', 'toMatchInlineSnapshot', 'toMatchFileSnapshot'].includes(name)) hit('R-171', node, name);
        if (isSpec && ['only', 'skip', 'each', 'todo', 'skipIf', 'runIf'].includes(name) && /^(it|test|describe)$/.test(recv)) hit('R-171', node, `${recv}.${name}`);
      }
      if (ts.isIdentifier(callee)) {
        const name = callee.text;
        if (name === 'forEach') hit('R-135', node, 'forEach(');
        if (name === 'fetch') hit('R-090', node, 'fetch');
        if (['randomUUID', 'uid', 'randomStringGenerator'].includes(name)) hit('R-090', node, name);
        if (name === 'require' && node.arguments[0] && ts.isStringLiteral(node.arguments[0]) && /^lodash(\/|$)/.test(node.arguments[0].text)) hit('R-123', node, "require('lodash')");
        if (isSpec && ['beforeEach', 'afterEach'].includes(name)) hit('R-171', node, name);
      }
    }
    if (ts.isPropertyAccessExpression(node) && node.name.text === 'length' && !(ts.isCallExpression(node.parent) && node.parent.expression === node)) {
      if (!isInTypePosition(node)) hit('R-120', node, '.length');
    }
    if (ts.isPropertyAccessExpression(node) && node.expression.getText(sf) === 'process' && node.name.text === 'env') hit('R-090', node, 'process.env');
    if (ts.isNewExpression(node) && node.expression.getText(sf) === 'Date') hit('R-090', node, 'new Date');
    if (ts.isNewExpression(node) && /^Logger$/.test(node.expression.getText(sf))) hit('R-090', node, 'new Logger');
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'P' && importsP) hit('R-063', node, `P.${node.name.text}`);

    if (ts.isObjectLiteralExpression(node) && node.properties.filter(ts.isSpreadAssignment).length >= 2) hit('R-129', node, 'object spread merge');
    if (ts.isObjectBindingPattern(node) && node.elements.some(e => e.dotDotDotToken)) hit('R-133', node, 'object rest');

    const isLoopBody = n => {
      let current = n.parent;
      while (current && !isFunctionLike(current)) {
        if (ts.isForStatement(current) || ts.isForOfStatement(current) || ts.isForInStatement(current) || ts.isWhileStatement(current) || ts.isDoStatement(current)) return true;
        current = current.parent;
      }
      return false;
    };
    if (ts.isAwaitExpression(node) && isLoopBody(node)) hit('R-141', node, 'await in loop');

    const oneLetter = n => n && ts.isIdentifier(n) && n.text.length === 1 && n.text !== '_';
    if ((ts.isParameter(node) || ts.isVariableDeclaration(node) || ts.isBindingElement(node)) && oneLetter(node.name)) {
      if (!(ts.isParameter(node) && ts.isFunctionTypeNode(node.parent))) hit('R-102', node, node.name.text);
    }

    if (pushed) {
      ts.forEachChild(node, visit);
      stack.pop();
    } else {
      ts.forEachChild(node, visit);
    }
  };

  // Module-level analysis
  const exported = [];
  let hasFunctionExport = false;
  let declaresType = false;
  let declaresFunction = false;
  const importDecls = [];
  sf.statements.forEach(st => {
    if (ts.isImportDeclaration(st)) {
      importDecls.push(st);
      const spec = st.moduleSpecifier.text;
      if (spec === 'ts-pattern' && st.importClause?.namedBindings && ts.isNamedImports(st.importClause.namedBindings) &&
          st.importClause.namedBindings.elements.some(e => e.name.text === 'P')) importsP = true;
      if (/^lodash(\/|$)/.test(spec)) hit('R-123', st, `import from '${spec}'`);
      if (spec === 'lodash-es') {
        lodashEsImports.push(st);
        const clause = st.importClause;
        const isWrapper = file.endsWith('lodash-chain.ts') || file.endsWith('/chain.ts');
        if (clause?.name) hit('R-122', st, 'default import of lodash-es');
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings) && !isWrapper) hit('R-122', st, 'namespace import of lodash-es');
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings) && clause.namedBindings.elements.some(e => (e.propertyName ?? e.name).text === 'chain')) hit('R-142', st, 'chain from lodash-es');
      }
      if (spec === 'ramda' && st.importClause?.namedBindings && ts.isNamespaceImport(st.importClause.namedBindings)) hit('R-145', st, 'namespace import of ramda');
      if (SECOND_LIBRARIES.has(spec)) hit('R-149', st, spec);
      if (spec.startsWith('.')) {
        const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), spec));
        if (file.startsWith('packages/') && area(target + '/x') !== area(file)) hit('R-150', st, `relative import crosses package: ${spec}`);
        if (!/\.(js|json)$/.test(spec)) hit('R-150', st, `relative import without .js: ${spec}`);
        if (/\/internal\//.test(spec + '/') && !target.startsWith(path.posix.dirname(file))) {
          const internalDir = target.slice(0, target.indexOf('/internal/') + 1);
          if (!file.startsWith(internalDir)) hit('R-035', st, spec);
        }
      }
    }
    if (ts.isExportDeclaration(st)) {
      if (st.exportClause && ts.isNamedExports(st.exportClause)) st.exportClause.elements.forEach(e => exported.push(e.name.text));
      else exported.push(`* from ${st.moduleSpecifier?.getText(sf) ?? ''}`);
    }
    if (ts.isExportAssignment(st)) {
      if (!st.isExportEquals) hit('R-032', st, 'export default');
      exported.push('default');
    }
    const isExported = hasModifier(st, ts.SyntaxKind.ExportKeyword);
    if (hasModifier(st, ts.SyntaxKind.DefaultKeyword)) hit('R-032', st, 'export default');
    if (ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st) || ts.isEnumDeclaration(st)) {
      declaresType = true;
      if (isExported) exported.push(st.name.text);
    }
    if (ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) {
      declaresFunction = true;
      if (isExported) {
        exported.push(st.name?.text ?? 'default');
        hasFunctionExport = true;
      }
      if (st.name && ts.isFunctionDeclaration(st) && !isCamel(st.name.text)) hit('R-100', st, `function '${st.name.text}' not camelCase`);
    }
    if (ts.isVariableStatement(st)) {
      st.declarationList.declarations.forEach(d => {
        const init = d.initializer;
        const isFn = init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init));
        if (isFn) declaresFunction = true;
        if (ts.isIdentifier(d.name)) {
          if (isExported) {
            exported.push(d.name.text);
            if (isFn) hasFunctionExport = true;
            if (init && (ts.isArrayLiteralExpression(init) || ts.isObjectLiteralExpression(init))) hit('R-039', d, `${d.name.text} not frozen`);
          }
          if (isFn && !isCamel(d.name.text)) hit('R-100', d, `function value '${d.name.text}' not camelCase`);
          const primitive = init && (ts.isStringLiteral(init) || ts.isNumericLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init));
          if (primitive && st.declarationList.flags & ts.NodeFlags.Const && !isUpperSnake(d.name.text)) hit('R-100', d, `module constant '${d.name.text}' not UPPER_SNAKE_CASE`);
          if (isExported && isFn && !init.type) hit('R-053', d, `exported ${d.name.text} has no declared return type (correct only if it is a helper)`);
        } else if (isExported) {
          d.name.elements?.forEach(e => exported.push(e.name.getText(sf)));
        }
      });
    }
  });

  if (kind !== 'spec' && exported.length > 1) hit('R-030', null, `${exported.length} exports`);
  if (kind !== 'spec' && exported.length === 1 && !exported[0].startsWith('* from') && exported[0] !== 'default') {
    const base = path.posix.basename(file, '.ts');
    if (kebab(exported[0]) !== base) hit('R-031', null, `export '${exported[0]}' → expected ${kebab(exported[0])}.ts`);
  }
  if (kind === 'source' && hasFunctionExport) {
    const sibling = file.replace(/\.ts$/, '.spec.ts');
    if (!fs.existsSync(path.join(ROOT, sibling))) hit('R-033', null, `no ${path.posix.basename(sibling)} beside it`);
  }
  if (kind !== 'spec' && declaresType && declaresFunction) hit('R-036', null, 'types and functions in one file');
  const base = path.posix.basename(file).replace(/\.spec\.ts$|\.ts$/, '');
  if (!isKebab(base)) hit('R-100', null, `file name '${path.posix.basename(file)}' not kebab-case`);
  if (lodashEsImports.length > 1) hit('R-121', lodashEsImports[1], 'more than one lodash-es import line');

  // R-117: value imports used only as types (skipped in decorated files, like typescript-eslint).
  if (!hasDecorators) {
    const idents = [];
    const collect = n => {
      if (ts.isIdentifier(n)) idents.push(n);
      ts.forEachChild(n, collect);
    };
    sf.statements.filter(s => !ts.isImportDeclaration(s)).forEach(collect);
    importDecls.forEach(st => {
      const clause = st.importClause;
      if (!clause || clause.isTypeOnly || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) return;
      clause.namedBindings.elements.forEach(e => {
        if (e.isTypeOnly) return;
        const name = e.name.text;
        const uses = idents.filter(i => i.text === name && !(ts.isPropertyAccessExpression(i.parent) && i.parent.name === i) && !(ts.isPropertyAssignment(i.parent) && i.parent.name === i));
        const exportedOnly = uses.length > 0 && uses.every(i => ts.isExportSpecifier(i.parent));
        if (uses.length > 0 && !exportedOnly && uses.every(isInTypePosition)) hit('R-117', e, `'${name}' used only as a type`);
      });
    });
  }

  // R-161 / R-162 import order and spacing
  if (importDecls.length > 1) {
    const isRel = st => st.moduleSpecifier.text.startsWith('.');
    const specs = importDecls.map(st => st.moduleSpecifier.text);
    const firstRel = importDecls.findIndex(isRel);
    const lastPkg = importDecls.map(isRel).lastIndexOf(false);
    if (firstRel !== -1 && lastPkg > firstRel) hit('R-161', importDecls[firstRel], 'relative import before package import');
    const pkg = specs.filter(s => !s.startsWith('.'));
    const rel = specs.filter(s => s.startsWith('.'));
    const sorted = arr => arr.every((s, i) => i === 0 || arr[i - 1] <= s);
    if (!sorted(pkg) || !sorted(rel)) hit('R-161', importDecls[0], 'import group not sorted by path');
    if (firstRel > 0 && lastPkg < firstRel) {
      const prevEnd = sf.getLineAndCharacterOfPosition(importDecls[firstRel - 1].getEnd()).line;
      const nextStart = sf.getLineAndCharacterOfPosition(importDecls[firstRel].getStart(sf)).line;
      const blank = nextStart - prevEnd - 1;
      if (isSpec && blank !== 1) hit('R-162', importDecls[firstRel], `spec: ${blank} blank lines between import groups (want 1)`);
      if (!isSpec && blank !== 0) hit('R-162', importDecls[firstRel], `source: ${blank} blank lines between import groups (want 0)`);
    }
  }
  // R-163 one blank line between top-level statements
  sf.statements.forEach((st, i) => {
    if (i === 0) return;
    const prev = sf.statements[i - 1];
    if (ts.isImportDeclaration(prev) && ts.isImportDeclaration(st)) return;
    const isReExport = n => ts.isExportDeclaration(n) && !!n.moduleSpecifier;
    if (isReExport(prev) && isReExport(st)) return;
    const prevEnd = sf.getLineAndCharacterOfPosition(prev.getEnd()).line;
    const start = sf.getLineAndCharacterOfPosition(st.getFullStart() + st.getLeadingTriviaWidth(sf)).line;
    const triviaText = text.slice(prev.getEnd(), st.getStart(sf));
    const blankLines = triviaText.split(/\r?\n/).slice(1, -1).filter(l => l.trim() === '').length;
    if (start > prevEnd && blankLines !== 1) hit('R-163', st, `${blankLines} blank lines before statement`);
  });

  // R-164 comments, R-114 ts directives
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, text);
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
    if (token === ts.SyntaxKind.SingleLineCommentTrivia || token === ts.SyntaxKind.MultiLineCommentTrivia) {
      const c = scanner.getTokenText();
      const pos = sf.getLineAndCharacterOfPosition(scanner.getTokenStart());
      if (/@ts-(ignore|expect-error|nocheck)/.test(c)) hits.push({ rule: 'R-114', line: pos.line + 1, col: pos.character + 1, symbol: '<comment>', detail: c.slice(0, 40) });
      if (!DIRECTIVE_COMMENT.test(c)) hits.push({ rule: 'R-164', line: pos.line + 1, col: pos.character + 1, symbol: '<comment>', detail: c.startsWith('/**') ? 'JSDoc' : c.startsWith('/*') ? 'block' : 'line' });
    }
  }

  // Spec-only checks
  if (isSpec) {
    const vitestImport = importDecls.find(st => st.moduleSpecifier.text === 'vitest');
    if (!vitestImport) hit('R-170', null, "no import { describe, expect, it } from 'vitest'");
    let describes = 0;
    const walkSpec = n => {
      if (ts.isCallExpression(n)) {
        const c = n.expression.getText(sf);
        if (c === 'describe' || c.startsWith('describe.')) describes++;
        if ((c === 'it' || c === 'test' || c.startsWith('it.') || c.startsWith('test.')) && n.arguments[0]) {
          const a = n.arguments[0];
          const title = ts.isStringLiteral(a) || ts.isNoSubstitutionTemplateLiteral(a) ? a.text : null;
          if (title === null || !/^should .+ when .+/.test(title)) {
            const pos = sf.getLineAndCharacterOfPosition(n.getStart(sf));
            hits.push({ rule: 'R-173', line: pos.line + 1, col: pos.character + 1, symbol: '<test>', detail: (title ?? '<dynamic title>').slice(0, 60) });
          }
        }
      }
      ts.forEachChild(n, walkSpec);
    };
    walkSpec(sf);
    if (describes !== 1) hit('R-172', null, `${describes} describe blocks`);
  }

  // R-038 magic numbers (approximate)
  const walkNumbers = n => {
    if (ts.isNumericLiteral(n) && !['0', '1'].includes(n.text)) {
      const p = n.parent;
      const inConstInit = ts.isVariableDeclaration(p) && ts.isIdentifier(p.name) && isUpperSnake(p.name.text);
      const negInConst = ts.isPrefixUnaryExpression(p) && ts.isVariableDeclaration(p.parent) && ts.isIdentifier(p.parent.name) && isUpperSnake(p.parent.name.text);
      const inEnum = ts.isEnumMember(p) || (ts.isPrefixUnaryExpression(p) && ts.isEnumMember(p.parent));
      const inType = ts.isLiteralTypeNode(p);
      if (!inConstInit && !negInConst && !inEnum && !inType && !isSpec) {
        const pos = sf.getLineAndCharacterOfPosition(n.getStart(sf));
        hits.push({ rule: 'R-038', line: pos.line + 1, col: pos.character + 1, symbol: '', detail: n.text });
      }
    }
    ts.forEachChild(n, walkNumbers);
  };
  walkNumbers(sf);

  visit(sf);

  const lines = text.split(/\r?\n/);
  const loc = lines.filter(l => l.trim() !== '').length;
  return { file, kind, area: area(file), loc, exports: exported.length, hits };
};

const files = listFiles();
const results = files.map(auditFile).map(r => ({
  ...r,
  hits: FILTER_RULES.size ? r.hits.filter(h => FILTER_RULES.has(h.rule)) : r.hits,
}));

const ruleIds = [...new Set(results.flatMap(r => r.hits.map(h => h.rule)))].sort();
let output = '';
if (FORMAT === 'json') {
  output = JSON.stringify({ generatedAt: new Date().toISOString(), files: results }, null, 0);
} else if (FORMAT === 'csv') {
  const allRules = FILTER_RULES.size ? [...FILTER_RULES].sort() : ruleIds;
  output = ['file,kind,area,loc,exports,total,' + allRules.join(',')]
    .concat(results.map(r => {
      const counts = allRules.map(id => r.hits.filter(h => h.rule === id).length);
      return [r.file, r.kind, r.area, r.loc, r.exports, r.hits.length, ...counts].join(',');
    }))
    .join('\n');
} else if (FORMAT === 'locations') {
  output = results
    .flatMap(r => r.hits.map(h => `${r.file}:${h.line}:${h.col} ${h.rule} [${h.symbol}] ${h.detail}`))
    .join('\n');
} else {
  const byRule = new Map();
  results.forEach(r => r.hits.forEach(h => {
    const e = byRule.get(h.rule) ?? { total: 0, files: new Set(), kinds: {} };
    e.total++;
    e.files.add(r.file);
    e.kinds[r.kind] = (e.kinds[r.kind] ?? 0) + 1;
    byRule.set(h.rule, e);
  }));
  output = [`files scanned: ${results.length}`, 'rule      total   files  by kind']
    .concat([...byRule.entries()].sort().map(([id, e]) =>
      `${id.padEnd(8)} ${String(e.total).padStart(7)} ${String(e.files.size).padStart(7)}  ${Object.entries(e.kinds).map(([k, v]) => `${k}=${v}`).join(' ')}`))
    .join('\n');
}
if (OUT) fs.writeFileSync(OUT, output + '\n');
else process.stdout.write(output + '\n');
const total = results.reduce((n, r) => n + r.hits.length, 0);
if (FAIL_ON_ANY && total > 0) process.exit(1);
