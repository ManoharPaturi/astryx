// Copyright (c) Meta Platforms, Inc. and affiliates.

import {
  defineTheme,
  defineSyntaxTheme,
  type TokenValue,
} from '@astryxdesign/core/theme';
import {neutralIconRegistry} from './icons';
const neutralSyntax = defineSyntaxTheme({
  name: 'astryx-neutral',
  tokens: {
    keyword: ['#6b187c', '#f3bfff'],
    string: ['#0b5615', '#bce0bb'],
    comment: ['#777777', '#9e9e9e'],
    number: ['#733100', '#ffc7a1'],
    function: ['#00458c', '#b9d7ff'],
    type: ['#6b187c', '#f3bfff'],
    variable: ['#1b1b1b', '#e2e2e2'],
    operator: ['#777777', '#9e9e9e'],
    constant: ['#733100', '#ffc7a1'],
    tag: ['#8a0011', '#ffc4be'],
    attribute: ['#584400', '#efd284'],
    property: ['#005348', '#b1e0d6'],
    // #a3a3a3/#525252 (this pair's own disabled-text stop) failed WCAG AA
    // against the syntax background: 2.42:1 light, 2.53:1 dark. #5386.
    punctuation: ['#6e6e6e', '#a0a0a0'], // neutral, 4.89:1 / 7.57:1
    background: ['#f1f1f1', '#000000'],
  },
});

const neutralLocalTokens: Record<string, TokenValue> = {
  '--astryx-theme-neutral-color-status-fill-accent': ['#0074e2', '#6d9cfe'],
  '--astryx-theme-neutral-color-status-fill-success': ['#198100', '#64af4c'],
  '--astryx-theme-neutral-color-status-fill-warning': '#ffce2f',
  '--astryx-theme-neutral-color-status-fill-error': ['#c9303a', '#ff705d'],
  '--astryx-theme-neutral-color-on-tint-neutral': ['#fafafa4D', '#0a0a0a4D'],
  '--astryx-theme-neutral-color-on-tint-overlay-hover': [
    '#fafafa1A',
    '#0a0a0a1A',
  ],
  '--astryx-theme-neutral-color-on-tint-overlay-pressed': [
    '#fafafa33',
    '#0a0a0a33',
  ],
};

const statusFill = {
  accent: 'var(--astryx-theme-neutral-color-status-fill-accent)',
  success: 'var(--astryx-theme-neutral-color-status-fill-success)',
  warning: 'var(--astryx-theme-neutral-color-status-fill-warning)',
  error: 'var(--astryx-theme-neutral-color-status-fill-error)',
} as const;

export const neutralTheme = defineTheme({
  name: 'neutral',
  localTokens: neutralLocalTokens,

  // Typography: Figtree across body, heading, and display sizes (display
  // size tokens inherit from heading.family). Monospace stays as the
  // platform default for code.
  // Scale: base=14, ratio=1.2. Bold weights on h3/h4 for subsection hierarchy.
  typography: {
    scale: {base: 14, ratio: 1.2},
    body: {
      family: 'Figtree',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'Figtree',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      weights: {3: 'bold', 4: 'bold'},
    },
    code: {
      family: 'ui-monospace',
      fallbacks:
        '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
  },

  // Motion: snappier than default to match shadcn/Tailwind conventions.
  // Produces: fast-min=95ms, fast=125ms, fast-max=165ms,
  //           medium-min=225ms, medium=300ms, medium-max=400ms.
  motion: {fast: 125, medium: 300, slow: 700, ratio: 0.75},

  syntax: neutralSyntax,

  tokens: {
    // Core neutrals

    // Dark cards and popovers match the body and rely on elevation; interactive
    // surfaces use the next lighter neutral stop.
    '--color-background-surface': ['#ffffff', '#303030'],
    '--color-background-body': ['#f1f1f1', '#1b1b1b'],
    '--color-background-card': ['#ffffff', '#1b1b1b'],
    '--color-background-popover': ['#ffffff', '#1b1b1b'],
    '--color-background-muted': ['#f1f1f1', '#1b1b1b'],

    // Accent + neutral surface tints (sit alongside backgrounds)
    '--color-accent': ['#262626', '#e2e2e2'],
    '--color-accent-muted': ['#f1f1f1', '#303030'],
    '--color-neutral': ['#0000000F', '#ffffff1A'],

    // Overlays (modal scrims, hover/pressed tints)
    '--color-overlay': ['#00000080', '#000000CC'],
    '--color-overlay-hover': ['#0000000D', '#ffffff0D'],
    '--color-overlay-pressed': ['#0000001A', '#ffffff1A'],

    // Text
    '--color-text-primary': ['#1b1b1b', '#f1f1f1'],
    // Light secondary is stop 35 (#525252), not stop 50 (#777777): stop 50 only
    // reaches 4.19:1 on the stop 95 body (#f1f1f1), just under WCAG AA 4.5:1.
    // Stop 35 clears it (6.9:1 on body, 7.8:1 on card).
    '--color-text-secondary': ['#525252', '#9e9e9e'],
    '--color-text-disabled': ['#9e9e9e', '#525252'],
    '--color-text-accent': ['#262626', '#e2e2e2'],
    '--color-on-dark': '#ffffff',
    '--color-on-light': '#1b1b1b',
    '--color-on-accent': ['#ffffff', '#1b1b1b'],
    '--color-on-success': ['#ffffff', '#1b1b1b'],
    '--color-on-error': ['#ffffff', '#1b1b1b'],
    '--color-on-warning': '#1b1b1b',

    // Icon
    '--color-icon-accent': ['#262626', '#e2e2e2'],
    '--color-icon-primary': ['#1b1b1b', '#f1f1f1'],
    '--color-icon-secondary': ['#777777', '#9e9e9e'],
    '--color-icon-disabled': ['#9e9e9e', '#525252'],

    // Status colors pair dark foregrounds with pastel surfaces in light mode,
    // and light foregrounds with translucent hue surfaces in dark mode.
    '--color-success': ['#0b5615', '#bce0bb'],
    // Error uses stronger stops to preserve contrast through pressed overlays.
    '--color-error': ['#76000c', '#ffc4be'],
    '--color-warning': ['#584400', '#efd284'],
    '--color-success-muted': ['#b7e2b6', '#97c8973D'],
    '--color-error-muted': ['#ffc4be', '#ff98903D'],
    '--color-warning-muted': ['#ffe193', '#d7b5543D'],

    // Borders retain the released Neutral appearance with colors selected from
    // approved stops. Components that require a 3:1 identifying boundary
    // should provide that treatment through a component-specific mapping.
    '--color-border': ['#00000014', '#ffffff1A'],
    '--color-border-emphasized': ['#d4d4d4', '#525252'],

    // Effects
    '--color-skeleton': ['#e2e2e2', '#525252'],
    '--color-shadow': ['#0000001A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // Categorical roles use pastel surfaces and dark text in light mode, then
    // translucent hue surfaces and light text in dark mode.
    '--color-background-red': ['#ffc4be', '#ff98903D'],
    '--color-border-red': ['#ffaea7', '#ee736c'],
    '--color-icon-red': ['#8a0011', '#ff9890'],
    '--color-text-red': ['#76000c', '#ffc4be'],

    '--color-background-orange': ['#ffc7a1', '#f7a2663D'],
    '--color-border-orange': ['#ffb37e', '#df843f'],
    '--color-icon-orange': ['#733100', '#f7a266'],
    '--color-text-orange': ['#733100', '#ffc7a1'],

    '--color-background-yellow': ['#ffe193', '#d7b5543D'],
    '--color-border-yellow': ['#eec448', '#be9921'],
    '--color-icon-yellow': ['#584400', '#d7b554'],
    '--color-text-yellow': ['#584400', '#efd284'],

    '--color-background-green': ['#b7e2b6', '#97c8973D'],
    '--color-border-green': ['#a4d6a3', '#74af75'],
    '--color-icon-green': ['#0b5615', '#97c897'],
    '--color-text-green': ['#0b5615', '#bce0bb'],

    '--color-background-teal': ['#a9e2d6', '#81c9bb3D'],
    '--color-border-teal': ['#90d7c8', '#4fb1a0'],
    '--color-icon-teal': ['#005348', '#81c9bb'],
    '--color-text-teal': ['#005348', '#b1e0d6'],

    '--color-background-cyan': ['#8ee4f9', '#71c7dd3D'],
    '--color-border-cyan': ['#75d7ef', '#49adc4'],
    '--color-icon-cyan': ['#00505f', '#71c7dd'],
    '--color-text-cyan': ['#00505f', '#9ae2f4'],

    '--color-background-blue': ['#b9d7ff', '#88bcff3D'],
    '--color-border-blue': ['#a1caff', '#5aa0f8'],
    '--color-icon-blue': ['#00458c', '#88bcff'],
    '--color-text-blue': ['#00458c', '#b9d7ff'],

    '--color-background-purple': ['#f3bfff', '#de9ced3D'],
    '--color-border-purple': ['#efa8ff', '#c57ed5'],
    '--color-icon-purple': ['#6b187c', '#de9ced'],
    '--color-text-purple': ['#6b187c', '#f3bfff'],

    '--color-background-pink': ['#ffc0d7', '#fd92bd3D'],
    '--color-border-pink': ['#ffa9ca', '#e572a3'],
    '--color-icon-pink': ['#83004b', '#fd92bd'],
    '--color-text-pink': ['#83004b', '#ffc0d7'],

    // Gray uses the neutral categorical surface rather than a chromatic ramp.
    '--color-background-gray': ['#e2e2e2', 'var(--color-neutral)'],
    '--color-border-gray': ['#d4d4d4', '#303030'],
    '--color-icon-gray': ['#525252', '#9e9e9e'],
    '--color-text-gray': ['#262626', '#e2e2e2'],

    // =========================================================================
    // Radius — slightly larger than default (kept as-is)
    // --radius-none and --radius-full are always fixed and must never be
    // scaled by a theme (see defineTheme's radius config docs) — 0 and
    // 9999px respectively, matching @astryxdesign/core's own defaults.
    // =========================================================================
    '--radius-none': '0px',
    '--radius-inner': '0.375rem',
    '--radius-element': '0.625rem',
    '--radius-container': '0.75rem',
    '--radius-page': '1.75rem',
    '--radius-full': '9999px',

    // =========================================================================
    // Shadows
    //
    // Light mode: matches origin/main exactly (5%/10% low+med, 10%/15% high).
    // Subtle drops; light surfaces don't need rim highlights.
    //
    // Dark mode: deepened drops + an all-around 1px white inset that wraps
    // every edge ("Figma-style bezel"). The inset mimics ambient light
    // catching the surface's rim on every side, giving cards/popovers/modals
    // a substantial "lit from above" feel that drop shadows alone can't
    // achieve against a dark canvas.
    //   low  :  drops 25%/40% + 8%  white all-around inset
    //   med  :  drops 35%/50% + 12% white all-around inset
    //   high :  drops 50%/70% + 15% white all-around inset
    //
    // The inset layer uses light-dark(transparent, ...) so light mode is
    // unaffected — main's exact light values are preserved.
    // =========================================================================
    '--shadow-low':
      '0 2px 4px light-dark(oklch(0 0 0 / 5%), oklch(0 0 0 / 25%)), ' +
      '0 4px 8px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 40%)), ' +
      'inset 0 0 0 1px light-dark(transparent, oklch(1 0 0 / 8%))',
    '--shadow-med':
      '0 2px 4px light-dark(oklch(0 0 0 / 5%), oklch(0 0 0 / 35%)), ' +
      '0 4px 12px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 50%)), ' +
      'inset 0 0 0 1px light-dark(transparent, oklch(1 0 0 / 12%))',
    '--shadow-high':
      '0 4px 6px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 50%)), ' +
      '0 12px 24px light-dark(oklch(0 0 0 / 15%), oklch(0 0 0 / 70%)), ' +
      'inset 0 0 0 1px light-dark(transparent, oklch(1 0 0 / 15%))',
    '--shadow-inset-hover': `inset 0px 0px 0px 2px ${'#0067ce4D'}`,
    '--shadow-inset-selected': `inset 0px 0px 0px 2px ${'#0067ce80'}`,
    '--shadow-inset-success': `inset 0px 0px 0px 2px ${'#2f7d334D'}`,
    '--shadow-inset-warning': `inset 0px 0px 0px 2px ${'#f8d36a4D'}`,
    '--shadow-inset-error': `inset 0px 0px 0px 2px ${'#cf37384D'}`,
  },

  components: {
    button: {
      'variant:destructive': {
        backgroundColor: 'var(--color-error-muted)',
        color: 'var(--color-error)',
      },
    },

    badge: {
      'variant:info': {
        backgroundColor: statusFill.accent,
        color: 'var(--color-on-accent)',
      },
      'variant:neutral': {
        backgroundColor: 'var(--color-background-gray)',
        color: 'var(--color-text-gray)',
      },
      'variant:success': {
        backgroundColor: statusFill.success,
        color: 'var(--color-on-success)',
      },
      'variant:warning': {
        backgroundColor: statusFill.warning,
        color: 'var(--color-on-warning)',
      },
      'variant:error': {
        backgroundColor: statusFill.error,
        color: 'var(--color-on-error)',
      },

      'variant:red': {
        backgroundColor: 'var(--color-background-red)',
        color: 'var(--color-text-red)',
      },
      'variant:orange': {
        backgroundColor: 'var(--color-background-orange)',
        color: 'var(--color-text-orange)',
      },
      'variant:yellow': {
        backgroundColor: 'var(--color-background-yellow)',
        color: 'var(--color-text-yellow)',
      },
      'variant:green': {
        backgroundColor: 'var(--color-background-green)',
        color: 'var(--color-text-green)',
      },
      'variant:teal': {
        backgroundColor: 'var(--color-background-teal)',
        color: 'var(--color-text-teal)',
      },
      'variant:cyan': {
        backgroundColor: 'var(--color-background-cyan)',
        color: 'var(--color-text-cyan)',
      },
      'variant:blue': {
        backgroundColor: 'var(--color-background-blue)',
        color: 'var(--color-text-blue)',
      },
      'variant:purple': {
        backgroundColor: 'var(--color-background-purple)',
        color: 'var(--color-text-purple)',
      },
      'variant:pink': {
        backgroundColor: 'var(--color-background-pink)',
        color: 'var(--color-text-pink)',
      },
      'variant:gray': {
        backgroundColor: 'var(--color-background-gray)',
        color: 'var(--color-text-gray)',
      },
    },

    statusdot: {
      'variant:success': {backgroundColor: statusFill.success},
      'variant:warning': {backgroundColor: statusFill.warning},
      'variant:error': {backgroundColor: statusFill.error},
      'variant:accent': {backgroundColor: statusFill.accent},
    },

    'avatar-status-dot': {
      'variant:success': {backgroundColor: statusFill.success},
      'variant:error': {backgroundColor: statusFill.error},
    },

    // Give the Neutral segmented control a roomier inset without changing its
    // outside height. The selected item stays flat against the tinted track.
    'segmented-control': {
      base: {
        padding: 'var(--spacing-1)',
      },
    },
    'segmented-control-item': {
      'size:sm': {
        height: 'calc(var(--size-element-sm) - 8px)',
      },
      'size:md': {
        height: 'calc(var(--size-element-md) - 8px)',
      },
      'size:lg': {
        height: 'calc(var(--size-element-lg) - 8px)',
      },
      selected: {
        boxShadow: 'none',
      },
    },

    banner: {
      base: {
        '--color-neutral': 'var(--astryx-theme-neutral-color-on-tint-neutral)',
        '--color-overlay-hover':
          'var(--astryx-theme-neutral-color-on-tint-overlay-hover)',
        '--color-overlay-pressed':
          'var(--astryx-theme-neutral-color-on-tint-overlay-pressed)',
      },
      'status:info': {
        '--color-accent-muted': 'var(--color-background-blue)',
        '--color-text-primary': 'var(--color-text-blue)',
        '--color-text-secondary': 'var(--color-text-blue)',
        '--color-accent': 'var(--color-text-blue)',
      },
      'status:success': {
        '--color-text-primary': 'var(--color-text-green)',
        '--color-text-secondary': 'var(--color-text-green)',
        '--color-success': 'var(--color-text-green)',
      },
      'status:warning': {
        '--color-text-primary': 'var(--color-text-yellow)',
        '--color-text-secondary': 'var(--color-text-yellow)',
        '--color-warning': 'var(--color-text-yellow)',
      },
      'status:error': {
        '--color-error-muted': 'var(--color-background-red)',
        '--color-text-primary': 'var(--color-text-red)',
        '--color-text-secondary': 'var(--color-text-red)',
        '--color-error': 'var(--color-text-red)',
      },
    },

    'step-indicator': {
      'status:accent': {'--color-accent': statusFill.accent},
      'status:success': {'--color-success': statusFill.success},
      'status:warning': {'--color-warning': statusFill.warning},
      'status:error': {'--color-error': statusFill.error},
    },

    switch: {
      base: {
        '--color-background-gray': 'var(--color-border-emphasized)',
      },
    },

    progressbar: {
      base: {
        '--color-background-muted': 'var(--color-border-emphasized)',
      },
      'variant:accent': {
        '--color-accent': statusFill.accent,
      },
      'variant:success': {
        '--color-success': statusFill.success,
      },
      'variant:warning': {
        '--color-warning': statusFill.warning,
      },
      'variant:error': {
        '--color-error': statusFill.error,
      },
    },

    card: {
      base: {
        padding: 'var(--spacing-3)',
      },
    },

    section: {
      base: {
        padding: 'var(--spacing-3)',
      },
    },

    // Heading and text component overrides are auto-generated by typography.scale.
    // h3/h4 bold weights come from typography.heading.weights above.
  },

  icons: neutralIconRegistry,
});
