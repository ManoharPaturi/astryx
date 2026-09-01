// Copyright (c) Meta Platforms, Inc. and affiliates.

import {TONAL_PALETTE_TONES} from '@astryxdesign/core/theme';
import {describe, expect, it} from 'vitest';
import {neutralPalettes, neutralTheme} from './neutralTheme';

describe('neutral theme palette contract', () => {
  it('ships every approved palette with the theme', () => {
    expect(neutralTheme.palettes).toBe(neutralPalettes);
    expect(Object.keys(neutralPalettes)).toEqual([
      'neutral',
      'red',
      'orange',
      'yellow',
      'green',
      'teal',
      'cyan',
      'blue',
      'purple',
      'pink',
    ]);

    for (const family of Object.values(neutralPalettes)) {
      for (const stop of TONAL_PALETTE_TONES) {
        expect(family.light[stop]).toMatch(/^#[0-9a-f]{6}$/i);
        expect(family.dark[stop]).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it('maps representative semantic tokens to numbered palette stops', () => {
    expect(neutralTheme.tokens['--color-background-body']).toBe(
      `light-dark(${neutralPalettes.neutral.light[95]}, ${neutralPalettes.neutral.dark[5]})`,
    );
    expect(neutralTheme.tokens['--color-background-blue']).toBe(
      `light-dark(${neutralPalettes.blue.light[90]}, ${neutralPalettes.blue.dark[70]}3D)`,
    );
  });

  it('keeps semantic status colors mapped independently of status icon shapes', () => {
    expect(neutralTheme.tokens['--color-success']).toBe(
      `light-dark(${neutralPalettes.green.light[30]}, ${neutralPalettes.green.dark[80]})`,
    );
    expect(neutralTheme.tokens['--color-warning']).toBe(
      `light-dark(${neutralPalettes.yellow.light[30]}, ${neutralPalettes.yellow.dark[80]})`,
    );
    expect(neutralTheme.tokens['--color-error']).toBe(
      `light-dark(${neutralPalettes.red.light[25]}, ${neutralPalettes.red.dark[85]})`,
    );
  });

  it('owns reusable status fills through exact Neutral-local token names', () => {
    expect(neutralTheme.localTokens).toMatchObject({
      '--astryx-theme-neutral-color-status-fill-accent':
        'light-dark(#0074e2, #6d9cfe)',
      '--astryx-theme-neutral-color-status-fill-success':
        'light-dark(#198100, #64af4c)',
      '--astryx-theme-neutral-color-status-fill-warning': '#ffce2f',
      '--astryx-theme-neutral-color-status-fill-error':
        'light-dark(#c9303a, #ff705d)',
    });
    expect(neutralTheme.tokens).not.toHaveProperty(
      '--astryx-theme-neutral-color-status-fill-accent',
    );
  });

  it('maps warning Stepper and ProgressBar states to the Neutral fill role', () => {
    const warningFill = 'var(--astryx-theme-neutral-color-status-fill-warning)';

    expect(
      neutralTheme.components?.['step-indicator']?.['status:warning'],
    ).toEqual({'--color-warning': warningFill});
    expect(
      neutralTheme.components?.['progress-bar']?.['variant:warning'],
    ).toEqual({'--color-warning': warningFill});
  });
});
