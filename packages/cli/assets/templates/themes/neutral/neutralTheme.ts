// Copyright (c) Meta Platforms, Inc. and affiliates.

import {
  defineTheme,
  defineSyntaxTheme,
  type TokenValue,
} from '@astryxdesign/core/theme';
import {neutralIconRegistry} from './icons';
import {neutralPalettes as palette} from './neutralPalettes';

const alpha = (color: string, opacity: string): string => `${color}${opacity}`;

const neutralSyntax = defineSyntaxTheme({
  name: 'astryx-neutral',
  tokens: {
    keyword: [palette.purple.light[30], palette.purple.dark[85]],
    string: [palette.green.light[30], palette.green.dark[85]],
    comment: [palette.neutral.light[50], palette.neutral.dark[65]],
    number: [palette.orange.light[30], palette.orange.dark[85]],
    function: [palette.blue.light[30], palette.blue.dark[85]],
    type: [palette.purple.light[30], palette.purple.dark[85]],
    variable: [palette.neutral.light[10], palette.neutral.dark[90]],
    operator: [palette.neutral.light[50], palette.neutral.dark[65]],
    constant: [palette.orange.light[30], palette.orange.dark[85]],
    tag: [palette.red.light[30], palette.red.dark[85]],
    attribute: [palette.yellow.light[30], palette.yellow.dark[85]],
    property: [palette.teal.light[30], palette.teal.dark[85]],
    // #a3a3a3/#525252 (this pair's own disabled-text stop) failed WCAG AA
    // against the syntax background: 2.42:1 light, 2.53:1 dark. #5386.
    punctuation: ['#6e6e6e', '#a0a0a0'], // neutral, 4.89:1 / 7.57:1
    background: [palette.neutral.light[95], palette.neutral.dark[0]],
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
    '--color-background-surface': [
      palette.neutral.light[100],
      palette.neutral.dark[20],
    ],
    '--color-background-body': [
      palette.neutral.light[95],
      palette.neutral.dark[10],
    ],
    '--color-background-card': [
      palette.neutral.light[100],
      palette.neutral.dark[10],
    ],
    '--color-background-popover': [
      palette.neutral.light[100],
      palette.neutral.dark[10],
    ],
    '--color-background-muted': [
      palette.neutral.light[95],
      palette.neutral.dark[10],
    ],

    // Accent + neutral surface tints (sit alongside backgrounds)
    '--color-accent': [palette.neutral.light[15], palette.neutral.dark[90]],
    '--color-accent-muted': [
      palette.neutral.light[95],
      palette.neutral.dark[20],
    ],
    '--color-neutral': [
      alpha(palette.neutral.light[0], '0F'),
      alpha(palette.neutral.dark[100], '1A'),
    ],

    // Overlays (modal scrims, hover/pressed tints)
    '--color-overlay': [
      alpha(palette.neutral.light[0], '80'),
      alpha(palette.neutral.dark[0], 'CC'),
    ],
    '--color-overlay-hover': [
      alpha(palette.neutral.light[0], '0D'),
      alpha(palette.neutral.dark[100], '0D'),
    ],
    '--color-overlay-pressed': [
      alpha(palette.neutral.light[0], '1A'),
      alpha(palette.neutral.dark[100], '1A'),
    ],

    // Text
    '--color-text-primary': [
      palette.neutral.light[10],
      palette.neutral.dark[95],
    ],
    // Light secondary is stop 35 (#525252), not stop 50 (#777777): stop 50 only
    // reaches 4.19:1 on the stop 95 body (#f1f1f1), just under WCAG AA 4.5:1.
    // 600 clears it (6.9:1 on body, 7.8:1 on card). Dark stays neutral-400.
    '--color-text-secondary': [
      palette.neutral.light[35],
      palette.neutral.dark[65],
    ],
    '--color-text-disabled': [
      palette.neutral.light[65],
      palette.neutral.dark[35],
    ],
    '--color-text-accent': [
      palette.neutral.light[15],
      palette.neutral.dark[90],
    ],
    '--color-on-dark': palette.neutral.dark[100],
    '--color-on-light': palette.neutral.light[10],
    '--color-on-accent': [palette.neutral.light[100], palette.neutral.dark[10]],
    '--color-on-success': [
      palette.neutral.light[100],
      palette.neutral.dark[10],
    ],
    '--color-on-error': [palette.neutral.light[100], palette.neutral.dark[10]],
    '--color-on-warning': palette.neutral.light[10],

    // Icon
    '--color-icon-accent': [
      palette.neutral.light[15],
      palette.neutral.dark[90],
    ],
    '--color-icon-primary': [
      palette.neutral.light[10],
      palette.neutral.dark[95],
    ],
    '--color-icon-secondary': [
      palette.neutral.light[50],
      palette.neutral.dark[65],
    ],
    '--color-icon-disabled': [
      palette.neutral.light[65],
      palette.neutral.dark[35],
    ],

    // Status colors pair dark foregrounds with pastel surfaces in light mode,
    // and light foregrounds with translucent hue surfaces in dark mode.
    '--color-success': [palette.green.light[30], palette.green.dark[85]],
    // Error uses stronger stops to preserve contrast through pressed overlays.
    '--color-error': [palette.red.light[25], palette.red.dark[85]],
    '--color-warning': [palette.yellow.light[30], palette.yellow.dark[85]],
    '--color-success-muted': [
      palette.green.light[85],
      alpha(palette.green.dark[75], '3D'),
    ],
    '--color-error-muted': [
      palette.red.light[85],
      alpha(palette.red.dark[75], '3D'),
    ],
    '--color-warning-muted': [
      palette.yellow.light[90],
      alpha(palette.yellow.dark[75], '3D'),
    ],

    // Borders retain the released Neutral appearance with colors selected from
    // approved stops. Components that require a 3:1 identifying boundary
    // should provide that treatment through a component-specific mapping.
    '--color-border': [
      alpha(palette.neutral.light[0], '14'),
      alpha(palette.neutral.dark[100], '1A'),
    ],
    '--color-border-emphasized': [
      palette.neutral.light[85],
      palette.neutral.dark[35],
    ],

    // Effects
    '--color-skeleton': [palette.neutral.light[90], palette.neutral.dark[35]],
    '--color-shadow': [
      alpha(palette.neutral.light[0], '1A'),
      alpha(palette.neutral.dark[0], '4D'),
    ],
    '--color-tint-hover': ['black', 'white'],

    // Categorical roles use pastel surfaces and dark text in light mode, then
    // translucent hue surfaces and light text in dark mode.
    '--color-background-red': [
      palette.red.light[85],
      alpha(palette.red.dark[75], '3D'),
    ],
    '--color-border-red': [palette.red.light[80], palette.red.dark[65]],
    '--color-icon-red': [palette.red.light[30], palette.red.dark[75]],
    '--color-text-red': [palette.red.light[25], palette.red.dark[85]],

    '--color-background-orange': [
      palette.orange.light[85],
      alpha(palette.orange.dark[75], '3D'),
    ],
    '--color-border-orange': [
      palette.orange.light[80],
      palette.orange.dark[65],
    ],
    '--color-icon-orange': [palette.orange.light[30], palette.orange.dark[75]],
    '--color-text-orange': [palette.orange.light[30], palette.orange.dark[85]],

    '--color-background-yellow': [
      palette.yellow.light[90],
      alpha(palette.yellow.dark[75], '3D'),
    ],
    '--color-border-yellow': [
      palette.yellow.light[80],
      palette.yellow.dark[65],
    ],
    '--color-icon-yellow': [palette.yellow.light[30], palette.yellow.dark[75]],
    '--color-text-yellow': [palette.yellow.light[30], palette.yellow.dark[85]],

    '--color-background-green': [
      palette.green.light[85],
      alpha(palette.green.dark[75], '3D'),
    ],
    '--color-border-green': [palette.green.light[80], palette.green.dark[65]],
    '--color-icon-green': [palette.green.light[30], palette.green.dark[75]],
    '--color-text-green': [palette.green.light[30], palette.green.dark[85]],

    '--color-background-teal': [
      palette.teal.light[85],
      alpha(palette.teal.dark[75], '3D'),
    ],
    '--color-border-teal': [palette.teal.light[80], palette.teal.dark[65]],
    '--color-icon-teal': [palette.teal.light[30], palette.teal.dark[75]],
    '--color-text-teal': [palette.teal.light[30], palette.teal.dark[85]],

    '--color-background-cyan': [
      palette.cyan.light[85],
      alpha(palette.cyan.dark[75], '3D'),
    ],
    '--color-border-cyan': [palette.cyan.light[80], palette.cyan.dark[65]],
    '--color-icon-cyan': [palette.cyan.light[30], palette.cyan.dark[75]],
    '--color-text-cyan': [palette.cyan.light[30], palette.cyan.dark[85]],

    '--color-background-blue': [
      palette.blue.light[85],
      alpha(palette.blue.dark[75], '3D'),
    ],
    '--color-border-blue': [palette.blue.light[80], palette.blue.dark[65]],
    '--color-icon-blue': [palette.blue.light[30], palette.blue.dark[75]],
    '--color-text-blue': [palette.blue.light[30], palette.blue.dark[85]],

    '--color-background-purple': [
      palette.purple.light[85],
      alpha(palette.purple.dark[75], '3D'),
    ],
    '--color-border-purple': [
      palette.purple.light[80],
      palette.purple.dark[65],
    ],
    '--color-icon-purple': [palette.purple.light[30], palette.purple.dark[75]],
    '--color-text-purple': [palette.purple.light[30], palette.purple.dark[85]],

    '--color-background-pink': [
      palette.pink.light[85],
      alpha(palette.pink.dark[75], '3D'),
    ],
    '--color-border-pink': [palette.pink.light[80], palette.pink.dark[65]],
    '--color-icon-pink': [palette.pink.light[30], palette.pink.dark[75]],
    '--color-text-pink': [palette.pink.light[30], palette.pink.dark[85]],

    // Gray uses the neutral categorical surface rather than a chromatic ramp.
    '--color-background-gray': [
      palette.neutral.light[90],
      'var(--color-neutral)',
    ],
    '--color-border-gray': [
      palette.neutral.light[85],
      palette.neutral.dark[20],
    ],
    '--color-icon-gray': [palette.neutral.light[35], palette.neutral.dark[65]],
    '--color-text-gray': [palette.neutral.light[15], palette.neutral.dark[90]],

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
    '--shadow-inset-hover': `inset 0px 0px 0px 2px ${alpha(palette.blue.light[45], '4D')}`,
    '--shadow-inset-selected': `inset 0px 0px 0px 2px ${alpha(palette.blue.light[45], '80')}`,
    '--shadow-inset-success': `inset 0px 0px 0px 2px ${alpha(palette.green.light[45], '4D')}`,
    '--shadow-inset-warning': `inset 0px 0px 0px 2px ${alpha(palette.yellow.light[85], '4D')}`,
    '--shadow-inset-error': `inset 0px 0px 0px 2px ${alpha(palette.red.light[50], '4D')}`,
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
