// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {themePaletteGenerate} from './generate.mjs';

const temporaryDirectories = [];

function fixture() {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-palette-'));
  temporaryDirectories.push(cwd);
  fs.writeFileSync(
    path.join(cwd, 'palette.config.json'),
    JSON.stringify({
      modeStrategy: 'light-only',
      stops: [20, 50, 80],
      families: [{id: 'blue', seed: '#0074e2'}],
    }),
  );
  return cwd;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

describe('themePaletteGenerate', () => {
  it('returns a candidate without writing when no output is requested', () => {
    const cwd = fixture();
    const result = themePaletteGenerate('palette.config.json', {}, {cwd});

    expect(result.type).toBe('theme.palette.generate');
    expect(result.data).toMatchObject({
      recipe: 'astryx-oklch-v1',
      status: 'candidate',
      familyCount: 1,
      stopCount: 3,
      modes: ['light'],
      output: null,
      written: false,
    });
    expect(result.data.candidate.palette.blue.light).toEqual({
      20: expect.stringMatching(/^#[0-9a-f]{6}$/),
      50: expect.stringMatching(/^#[0-9a-f]{6}$/),
      80: expect.stringMatching(/^#[0-9a-f]{6}$/),
    });
  });

  it('writes a candidate and detached reproducibility receipt together', () => {
    const cwd = fixture();
    const result = themePaletteGenerate(
      'palette.config.json',
      {out: 'ocean.palette.ts'},
      {cwd},
    );

    expect(result.data).toMatchObject({
      output: 'ocean.palette.ts',
      receipt: 'ocean.palette.receipt.json',
      written: true,
      reason: null,
    });
    const candidate = fs.readFileSync(
      path.join(cwd, 'ocean.palette.ts'),
      'utf-8',
    );
    const receipt = JSON.parse(
      fs.readFileSync(path.join(cwd, 'ocean.palette.receipt.json'), 'utf-8'),
    );
    expect(receipt.recipe).toBe('astryx-oklch-v1');
    expect(receipt.candidateSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(candidate).toContain('export const palette =');
    expect(candidate).not.toContain('generateTonalPalette');
  });

  it('supports JSON when an interoperable artifact is requested', () => {
    const cwd = fixture();
    const result = themePaletteGenerate(
      'palette.config.json',
      {out: 'ocean.palette.json'},
      {cwd},
    );

    const written = JSON.parse(
      fs.readFileSync(path.join(cwd, 'ocean.palette.json'), 'utf-8'),
    );
    expect(written).toEqual(result.data.candidate);
    expect(result.data.receipt).toBe('ocean.palette.receipt.json');
  });

  it('rejects output formats that cannot preserve the palette contract', () => {
    const cwd = fixture();
    expect(() =>
      themePaletteGenerate(
        'palette.config.json',
        {out: 'ocean.palette.js'},
        {cwd},
      ),
    ).toThrow('must end in .ts or .json');
  });

  it('leaves author-owned output untouched unless overwrite is explicit', () => {
    const cwd = fixture();
    fs.writeFileSync(path.join(cwd, 'ocean.palette.ts'), 'author edit\n');

    const skipped = themePaletteGenerate(
      'palette.config.json',
      {out: 'ocean.palette.ts'},
      {cwd},
    );
    expect(skipped.data).toMatchObject({written: false, reason: 'exists'});
    expect(fs.readFileSync(path.join(cwd, 'ocean.palette.ts'), 'utf-8')).toBe(
      'author edit\n',
    );

    const replaced = themePaletteGenerate(
      'palette.config.json',
      {out: 'ocean.palette.ts', overwrite: true},
      {cwd},
    );
    expect(replaced.data.written).toBe(true);
    expect(
      fs.readFileSync(path.join(cwd, 'ocean.palette.ts'), 'utf-8'),
    ).not.toBe('author edit\n');
  });

  it('returns stable errors for invalid input', () => {
    const cwd = fixture();
    fs.writeFileSync(path.join(cwd, 'palette.config.json'), '{');
    expect(() =>
      themePaletteGenerate('palette.config.json', {}, {cwd}),
    ).toThrow('Could not parse palette config');
  });
});
