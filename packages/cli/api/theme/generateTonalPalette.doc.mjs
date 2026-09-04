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
    'perform semantic mapping, or make accessibility claims. Stop numbers remain ' +
    'stable across layouts, and requested decimal stops are emitted explicitly.',
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
    {
      label: 'Preserve a required brand color',
      code: "generateTonalPalette({stops: [50], families: [{id: 'brand', seed: '#0074e2', anchors: [{mode: 'light', stop: 50, color: '#1682d5', policy: 'exact'}]}]});",
    },
    {
      label: 'Generate an optional accent family',
      code: "generateTonalPalette({families: [{id: 'accent', seed: '#ff4db8'}]});",
    },
    {
      label: 'Generate an explicit intermediate stop',
      code: "generateTonalPalette({stops: [12.5, 50], families: [{id: 'blue', seed: '#0074e2'}]});",
    },
  ],
  command: 'theme palette generate',
  related: ['themePaletteGenerate'],
};
