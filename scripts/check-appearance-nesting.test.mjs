// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guard shared component source against positive numeric z-index values.
 * @input Tracked TypeScript implementation files in Core, Lab, Charts, and RichText.
 * @output A failing test when component stacking bypasses the appearance nesting tokens.
 * @position Repository contract test for the portable appearance token family.
 */

import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
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

describe('appearance nesting token adoption', () => {
  it('keeps positive component z-index values on the shared token bands', () => {
    const violations = [];

    for (const file of trackedImplementationFiles()) {
      const source = readFileSync(file, 'utf8');
      const declarations = source.matchAll(/\bzIndex:\s*([^,]+),/g);

      for (const declaration of declarations) {
        const value = declaration[1].trim();
        if (
          value !== '0' &&
          value !== '-1' &&
          !value.includes('appearanceVars[')
        ) {
          const line = source.slice(0, declaration.index).split('\n').length;
          violations.push(`${file}:${line}: zIndex: ${value}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
