// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'generateTonalPalette',
  displayName: 'generateTonalPalette()',
  summary: 'Generate candidate tonal palette data without filesystem effects.',
  description:
    'Runs the versioned astryx-oklch-v1 authoring recipe. The returned candidate ' +
    'contains exact hex values for review; it does not modify a theme, write files, ' +
    'perform semantic mapping, or make accessibility claims.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'generateTonalPalette(input: TonalPaletteGenerationInput): TonalPaletteCandidate',
  keywords: ['palette', 'generate', 'OKLCH', 'authoring', 'candidate'],
  params: [
    {
      name: 'input',
      type: 'TonalPaletteGenerationInput',
      description:
        'Families and seeds plus optional modes, stops, anchors, vibrancy, and neutral profile.',
      required: true,
    },
  ],
  returns: [
    {
      type: 'TonalPaletteCandidate',
      description: 'Deterministic candidate data for author review.',
    },
  ],
  throws: [
    {
      code: 'Error',
      when: 'the request, family, seed, stop layout, mode, or anchor is invalid',
    },
  ],
  examples: [
    {
      label: 'Generate one family',
      code: "generateTonalPalette({families: [{id: 'blue', seed: '#0074e2'}]});",
    },
  ],
  command: 'theme palette generate',
  related: ['themePaletteGenerate'],
};
