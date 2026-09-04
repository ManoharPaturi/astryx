// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guard shared component source against component-local z-index scales.
 * @input Tracked TypeScript implementation files in Core, Lab, Charts, and RichText.
 * @output A failing test when component stacking bypasses appearance nesting tokens.
 * @position Repository contract test for the portable appearance token family.
 */

import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {describe, expect, it} from 'vitest';

const SOURCE_ROOTS = [
  'packages/core/src',
  'packages/lab/src',
  'packages/charts/src',
  'packages/richtext/src',
];

function trackedImplementationFiles() {
  return execFileSync('git', ['ls-files', ...SOURCE_ROOTS], {
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .filter(
      file =>
        /\.tsx?$/.test(file) &&
        !/\.(?:test|stories)\.tsx?$/.test(file) &&
        !file.includes('/__tests__/'),
    );
}

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) {
    return node.text;
  }
  return null;
}

describe('appearance nesting token adoption', () => {
  it('keeps component z-index values on the shared token bands', () => {
    const violations = [];

    for (const file of trackedImplementationFiles()) {
      const sourceText = readFileSync(file, 'utf8');
      const source = ts.createSourceFile(
        file,
        sourceText,
        ts.ScriptTarget.Latest,
        true,
        file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );

      function visit(node) {
        if (
          ts.isPropertyAssignment(node) &&
          propertyName(node.name) === 'zIndex'
        ) {
          const value = node.initializer.getText(source);
          if (
            value !== '0' &&
            value !== '-1' &&
            !value.includes('appearanceVars[')
          ) {
            const {line} = source.getLineAndCharacterOfPosition(
              node.getStart(source),
            );
            violations.push(`${file}:${line + 1}: zIndex: ${value}`);
          }
        }
        ts.forEachChild(node, visit);
      }

      visit(source);
    }

    expect(violations).toEqual([]);
  });
});
