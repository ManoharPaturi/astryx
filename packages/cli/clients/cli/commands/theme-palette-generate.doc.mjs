// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'theme palette generate',
  displayName: 'astryx theme palette generate',
  namespace: 'cli',
  summary: 'Generate an OKLCH palette candidate for human review',
  description:
    'Reads an explicit JSON request and runs the versioned astryx-oklch-v1 recipe. ' +
    'The command defaults to 21 stops but accepts any non-empty ordered numeric stop list. ' +
    'Without --out it prints a preview. With --out it writes candidate JSON and a detached ' +
    'receipt. --preview writes a standardized, self-contained HTML review artifact. ' +
    'TypeScript output is directly importable and contains no generator dependency. ' +
    'JSON is also supported. Existing author-owned files are left untouched unless --overwrite is explicit.',
  fn: 'themePaletteGenerate',
  args: [{name: 'config', param: 'configPath', required: true}],
  options: [
    {
      flag: '-o, --out <path>',
      param: 'options.out',
      description: 'Write candidate JSON and a sibling receipt file',
    },
    {
      flag: '--preview <path>',
      param: 'options.preview',
      description: 'Write a standardized self-contained HTML preview',
    },
    {
      flag: '-f, --overwrite',
      param: 'options.overwrite',
      description: 'Replace existing candidate and receipt files',
    },
  ],
  examples: [
    {
      label: 'Preview candidate JSON',
      cli: 'astryx theme palette generate palette.config.json',
    },
    {
      label: 'Write candidate and receipt',
      cli: 'astryx theme palette generate palette.config.json --out ocean.palette.ts',
    },
    {
      label: 'Write candidate, receipt, and review preview',
      cli: 'astryx theme palette generate palette.config.json --out ocean.palette.ts --preview ocean.palette.html',
    },
  ],
  exitCodes: [
    {
      code: 0,
      when: 'a candidate is produced or existing output is left untouched',
    },
    {
      code: 1,
      when: 'the request is invalid or output cannot be written safely',
    },
  ],
  related: ['theme build', 'theme template'],
};
