// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createHash} from 'node:crypto';
import {describe, expect, it} from 'vitest';
import {
  generatePaletteSet as generatePrototypePaletteSet,
  DEFAULT_19_STOPS as PROTOTYPE_DEFAULT_19_STOPS,
} from '../../../../../../apps/sandbox/src/app/(sandbox)/pages/palette-generator/generator.ts';
import {
  DEFAULT_19_STOPS,
  PALETTE_RECIPE,
  generatePaletteSet,
  generateTonalPalette,
  validateStops,
} from './generator.mjs';

const families = [
  {id: 'neutral', name: 'Neutral', seed: '#777777', kind: 'neutral'},
  {id: 'blue', name: 'Blue', seed: '#0074e2'},
  {id: 'orange', name: 'Orange', seed: '#d57113'},
];

function candidateDigest(request) {
  const candidate = generateTonalPalette(request);
  return createHash('sha256')
    .update(`${JSON.stringify(candidate, null, 2)}\n`)
    .digest('hex');
}

describe('astryx-oklch-v1 palette generator', () => {
  it('matches the pinned Sandbox OKLCH result for the default recipe', () => {
    const production = generatePaletteSet({families});
    const prototype = generatePrototypePaletteSet({
      algorithm: 'oklch-v1-experimental',
      vibrancy: 50,
      neutralProfile: 'neutral-v1',
      modeStrategy: 'light-and-dark',
      stops: [...PROTOTYPE_DEFAULT_19_STOPS],
      families,
    });

    expect(production.recipe).toBe(PALETTE_RECIPE);
    expect(production.status).toBe('candidate');
    expect(production.families).toEqual(prototype.families);
    expect(production.coordination).toEqual(prototype.coordination);
    expect(production.errors).toEqual([]);
  });

  it('returns directly usable candidate data without filesystem work', () => {
    const candidate = generateTonalPalette({
      families: [families[1]],
      stops: [40],
    });

    expect(candidate).toMatchObject({
      schemaVersion: 1,
      status: 'candidate',
      recipe: 'astryx-oklch-v1',
    });
    expect(candidate.palette.blue.light[40]).toMatch(/^#[0-9a-f]{6}$/);
    expect(candidate.palette.blue.dark[40]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('locks the normative recipe fixtures independently from the Sandbox', () => {
    expect(candidateDigest({families})).toBe(
      '72f2fca4236dfc76e3fc60444fd6268583f05a840b5e8aa7631b8da126d0cc78',
    );
    expect(
      candidateDigest({
        modeStrategy: 'light-only',
        stops: [20, 50, 80],
        families: [
          {
            id: 'blue',
            name: 'Blue',
            seed: '#0074e2',
            anchors: [
              {
                mode: 'light',
                stop: 50,
                color: '#1682d5',
                policy: 'exact',
              },
            ],
          },
        ],
      }),
    ).toBe('e3dbd30b3eb1e4c2a0350e1321ef44bf16c3ae48ac46ada0dad04368cdd6e4a1');
    expect(
      candidateDigest({
        modeStrategy: 'dark-only',
        stops: [40],
        families: [{id: 'red', name: 'Red', seed: '#d62830'}],
      }),
    ).toBe('d54fe4d202d7bd49f8a286e97eadf9786fe71e21f15e0058975877581b7e025b');
  });

  it('defaults to 19 family-specific stops without requiring that layout', () => {
    expect(generatePaletteSet({families: [families[1]]}).request.stops).toEqual(
      DEFAULT_19_STOPS,
    );
    expect(DEFAULT_19_STOPS).not.toContain(0);
    expect(DEFAULT_19_STOPS).not.toContain(100);
    expect(
      generatePaletteSet({families: [families[1]], stops: [15, 40, 72]}).request
        .stops,
    ).toEqual([15, 40, 72]);
    expect(
      generatePaletteSet({families: [families[1]], stops: [40]}).families[0]
        .light.colors,
    ).toEqual({40: expect.stringMatching(/^#[0-9a-f]{6}$/)});
  });

  it('rejects invalid stop layouts without prescribing a count', () => {
    expect(() => validateStops([])).toThrow('at least one stop');
    expect(() => validateStops([0, 40, 40, 100])).toThrow(
      'unique and strictly increasing',
    );
    expect(() => validateStops([-1, 50])).toThrow('from 0 to 100');
    expect(() => validateStops([0, Number.NaN, 100])).toThrow('finite number');
    expect(validateStops([0.5, 37.25, 99.75])).toEqual([0.5, 37.25, 99.75]);
  });

  it('uses literal stop tones in dark mode', () => {
    const candidate = generateTonalPalette({
      modeStrategy: 'light-and-dark',
      stops: [0, 5, 100],
      families: [families[1]],
    });

    expect(candidate.palette.blue.light[0]).toBe('#000000');
    expect(candidate.palette.blue.dark[0]).toBe('#000000');
    expect(candidate.palette.blue.dark[5]).toBe('#000f30');
    expect(candidate.palette.blue.light[100]).toBe('#ffffff');
    expect(candidate.palette.blue.dark[100]).toBe('#ffffff');
  });

  it('preserves exact anchors and reports family-local failures', () => {
    const result = generatePaletteSet({
      modeStrategy: 'light-only',
      stops: [20, 50, 80],
      families: [
        {
          id: 'blue',
          name: 'Blue',
          seed: '#0074e2',
          anchors: [
            {
              mode: 'light',
              stop: 50,
              color: '#1682d5',
              policy: 'exact',
            },
          ],
        },
        {
          id: 'broken',
          name: 'Broken',
          seed: '#ff0000',
          anchors: [
            {
              mode: 'light',
              stop: 30,
              color: '#ff0000',
              policy: 'exact',
            },
          ],
        },
      ],
    });

    expect(result.families[0].light.colors[50]).toBe('#1682d5');
    expect(result.errors).toEqual([
      {
        familyId: 'broken',
        message: 'Anchor stop 30 is not present in the requested stop layout.',
      },
    ]);
  });
});
