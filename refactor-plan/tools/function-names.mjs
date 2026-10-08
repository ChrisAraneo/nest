#!/usr/bin/env node
// Generates the function-name index required by GUIDE.md §8.5.
//
// Usage (run from the repository root):
//   node refactor-plan/tools/function-names.mjs            print the index to stdout
//   node refactor-plan/tools/function-names.mjs --write    write docs/FUNCTION_NAMES.md
//   node refactor-plan/tools/function-names.mjs --check    exit 1 if docs/FUNCTION_NAMES.md is out of date
//
// Indexed: every named function in package source files (packages/<pkg>/**/*.ts,
// excluding test/, *.spec.ts and *.d.ts): function declarations, consts and
// properties holding an arrow or function expression, and class methods,
// getters and setters. Sorted alphabetically ignoring case (GUIDE.md §8.5),
// ties broken by exact name.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const ROOT = process.cwd();
const require = createRequire(path.join(ROOT, 'package.json'));
const ts = require('typescript');
const TARGET = 'docs/FUNCTION_NAMES.md';

const files = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '--', 'packages/*.ts'],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
)
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean)
  .filter(file => !file.endsWith('.d.ts') && !file.endsWith('.spec.ts'))
  .filter(file => !/^packages\/[^/]+\/test\//.test(file))
  .filter(file => fs.existsSync(path.join(ROOT, file)))
  .sort();

const index = new Map();
const add = (name, file) => {
  if (!name || name === 'constructor') return;
  if (!index.has(name)) index.set(name, new Set());
  index.get(name).add(file);
};

files.forEach(file => {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(path.join(ROOT, file), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const visit = node => {
    if (ts.isFunctionDeclaration(node) && node.name) add(node.name.text, file);
    if (
      (ts.isMethodDeclaration(node) ||
        ts.isGetAccessorDeclaration(node) ||
        ts.isSetAccessorDeclaration(node)) &&
      node.name &&
      (ts.isIdentifier(node.name) || ts.isPrivateIdentifier(node.name))
    ) {
      add(node.name.text, file);
    }
    if (
      (ts.isVariableDeclaration(node) ||
        ts.isPropertyDeclaration(node) ||
        ts.isPropertyAssignment(node)) &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) ||
        ts.isFunctionExpression(node.initializer)) &&
      ts.isIdentifier(node.name)
    ) {
      add(node.name.text, file);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
});

const names = [...index.keys()].sort((a, b) => {
  const byLower = a.toLowerCase().localeCompare(b.toLowerCase(), 'en');
  return byLower !== 0 ? byLower : a < b ? -1 : a > b ? 1 : 0;
});

const lines = [
  '# Function names',
  '',
  'Every function name in the package sources, in alphabetical order ignoring',
  'case (GUIDE.md §8.5). Check this list before you name a function and reuse its',
  'words. Regenerate it with `node refactor-plan/tools/function-names.mjs --write`',
  'whenever you add, rename or delete a function.',
  '',
  '| Name | Defined in |',
  '| --- | --- |',
  ...names.map(
    name =>
      `| \`${name}\` | ${[...index.get(name)].sort().map(file => `\`${file}\``).join(', ')} |`,
  ),
  '',
];
const output = lines.join('\n');

if (process.argv.includes('--write')) {
  fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, TARGET), output);
  process.stdout.write(`wrote ${TARGET}: ${names.length} names from ${files.length} files\n`);
} else if (process.argv.includes('--check')) {
  const current = fs.existsSync(path.join(ROOT, TARGET))
    ? fs.readFileSync(path.join(ROOT, TARGET), 'utf8').replace(/\r\n/g, '\n')
    : '';
  if (current !== output) {
    process.stdout.write(`${TARGET} is out of date; run with --write\n`);
    process.exit(1);
  }
  process.stdout.write(`${TARGET} is up to date (${names.length} names)\n`);
} else {
  process.stdout.write(output);
}
