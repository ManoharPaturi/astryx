// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themeAdaptations.test.ts
 * Tests AST-012's ordered, closed, CSS-first theme adaptation contract.
 */

import {describe, expect, it} from 'vitest';
import {
  DEFAULT_WIDTH_BREAKPOINTS,
  WIDTH_BREAKPOINT_NAMES,
  defineTheme,
  generateAdaptationCSS,
  generateThemeCSS,
  type DefineThemeInput,
  type DefinedTheme,
} from './index';

function adaptationInput(
  rules: NonNullable<NonNullable<DefineThemeInput['adaptations']>['rules']>,
): DefineThemeInput {
  return {name: 'adaptive', adaptations: {rules}};
}

function mediaPreludes(css: string): string[] {
  return [...css.matchAll(/@media ([^{]+) \{/g)].map(match => match[1]);
}

function count(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

describe('width breakpoint metadata', () => {
  it('provides the accepted fixed names and defaults', () => {
    const theme = defineTheme({name: 'defaults'});

    expect(WIDTH_BREAKPOINT_NAMES).toEqual(['sm', 'md', 'lg', 'xl', '2xl']);
    expect(DEFAULT_WIDTH_BREAKPOINTS).toEqual({
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    });
    expect(theme.__adaptations).toEqual({
      widthBreakpoints: DEFAULT_WIDTH_BREAKPOINTS,
      rules: [],
    });
  });

  it('lets a theme override fixed points without emitting CSS', () => {
    const theme = defineTheme({
      name: 'points-only',
      adaptations: {widthBreakpoints: {md: 800, lg: 1100}},
    });

    expect(theme.__adaptations.widthBreakpoints).toEqual({
      ...DEFAULT_WIDTH_BREAKPOINTS,
      md: 800,
      lg: 1100,
    });
    expect(generateAdaptationCSS(theme)).toEqual({prose: '', component: ''});
    expect(generateThemeCSS(theme).component).not.toContain('@media');
  });

  it.each([
    [{phone: 500}, /phone is not supported/],
    [{md: 0}, /md must be a finite positive number/],
    [{md: Number.NaN}, /md must be a finite positive number/],
    [{md: 1100, lg: 1000}, /strictly increasing/],
  ])('rejects an invalid breakpoint map %#', (widthBreakpoints, message) => {
    expect(() =>
      defineTheme({
        name: 'bad-points',
        adaptations: {
          widthBreakpoints,
        } as unknown as DefineThemeInput['adaptations'],
      }),
    ).toThrow(message);
  });
});

describe('closed conditions and media queries', () => {
  it('lowers inclusive from and exclusive below edges', () => {
    const theme = defineTheme(
      adaptationInput([
        {
          when: {width: {below: 'sm'}},
          value: {tokens: {'--spacing-4': '12px'}},
        },
        {
          when: {width: {from: 'lg', below: 'xl'}},
          value: {tokens: {'--spacing-4': '20px'}},
        },
        {
          when: {width: {from: '2xl'}},
          value: {tokens: {'--spacing-4': '24px'}},
        },
      ]),
    );

    expect(mediaPreludes(generateAdaptationCSS(theme).component)).toEqual([
      '(width < 640px)',
      '(width >= 1024px) and (width < 1280px)',
      '(width >= 1536px)',
    ]);
  });

  it('ANDs width, pointer, contrast, and motion in a stable order', () => {
    const theme = defineTheme(
      adaptationInput([
        {
          when: {
            motion: 'reduce',
            pointer: 'coarse',
            width: {from: 'md', below: 'xl'},
            contrast: 'more',
          },
          value: {tokens: {'--duration-fast': '0ms'}},
        },
      ]),
    );

    expect(mediaPreludes(generateAdaptationCSS(theme).component)).toEqual([
      '(width >= 768px) and (width < 1280px) and (pointer: coarse) and (prefers-contrast: more) and (prefers-reduced-motion: reduce)',
    ]);
  });

  it.each([
    [{}, /must contain at least one condition/],
    [{pointer: undefined}, /must contain at least one condition/],
    [{width: {}}, /must contain `from`, `below`, or both/],
    [{width: {from: 'lg', below: 'md'}}, /must resolve to `from < below`/],
    [{hover: true}, /hover is not supported/],
    [{pointer: 'any'}, /pointer must be 'coarse' or 'fine'/],
  ])('rejects an invalid condition %#', (when, message) => {
    expect(() =>
      defineTheme(
        adaptationInput([
          {
            when,
            value: {tokens: {'--spacing-4': '12px'}},
          } as never,
        ]),
      ),
    ).toThrow(message);
  });

  it('rejects positional rules and root-owned fields in a rule value', () => {
    expect(() =>
      defineTheme({
        name: 'tuple-rule',
        adaptations: {
          rules: [[{pointer: 'coarse'}, {tokens: {'--spacing-4': '12px'}}]],
        },
      } as unknown as DefineThemeInput),
    ).toThrow(/must be an object/);

    expect(() =>
      defineTheme({
        name: 'identity-in-rule',
        adaptations: {
          rules: [{when: {pointer: 'coarse'}, value: {icons: {}}}],
        },
      } as unknown as DefineThemeInput),
    ).toThrow(/value.icons is not supported/);
  });
});

describe('rule order and writes', () => {
  it('preserves duplicate conditions and later root-restoring writes', () => {
    const theme = defineTheme({
      name: 'ordered',
      tokens: {'--spacing-4': '16px'},
      adaptations: {
        rules: [
          {
            when: {pointer: 'coarse'},
            value: {tokens: {'--spacing-4': '12px'}},
          },
          {
            when: {pointer: 'coarse'},
            value: {tokens: {'--spacing-4': '16px'}},
          },
        ],
      },
    });
    const css = generateAdaptationCSS(theme).component;

    expect(count(css, '@media (pointer: coarse)')).toBe(2);
    expect(css.indexOf('--spacing-4: 12px')).toBeLessThan(
      css.indexOf('--spacing-4: 16px'),
    );
  });

  it('uses declaration order rather than inferred condition specificity', () => {
    const theme = defineTheme(
      adaptationInput([
        {
          when: {width: {from: 'md', below: 'lg'}, pointer: 'coarse'},
          value: {tokens: {'--spacing-4': '12px'}},
        },
        {
          when: {pointer: 'coarse'},
          value: {tokens: {'--spacing-4': '20px'}},
        },
      ]),
    );
    const css = generateAdaptationCSS(theme).component;

    expect(css.indexOf('--spacing-4: 12px')).toBeLessThan(
      css.indexOf('--spacing-4: 20px'),
    );
  });

  it('emits no block for an empty value while retaining the normalized rule', () => {
    const theme = defineTheme(
      adaptationInput([
        {when: {pointer: 'coarse'}, value: {}},
        {
          when: {pointer: 'fine'},
          value: {tokens: {'--spacing-4': '18px'}},
        },
      ]),
    );

    expect(theme.__adaptations.rules).toHaveLength(2);
    expect(count(generateAdaptationCSS(theme).component, '@media')).toBe(1);
  });

  it('lets explicit values beat generated values within one rule', () => {
    const theme = defineTheme({
      name: 'rule-precedence',
      color: {accent: '#0064E0'},
      adaptations: {
        rules: [
          {
            when: {contrast: 'more'},
            value: {
              color: {accent: '#00AA00'},
              tokens: {'--color-accent': '#FF0000'},
            },
          },
        ],
      },
    });

    expect(theme.__adaptationRules?.[0].tokens['--color-accent']).toBe(
      '#FF0000',
    );
  });

  it('treats generated leaves as rule writes above root token pins', () => {
    const theme = defineTheme({
      name: 'generated-write',
      typography: {scale: {base: 14, ratio: 1.2}},
      tokens: {'--font-size-base': '2rem'},
      adaptations: {
        rules: [
          {
            when: {width: {below: 'sm'}},
            value: {typography: {scale: {base: 16}}},
          },
        ],
      },
    });

    expect(theme.tokens['--font-size-base']).toBe('2rem');
    expect(theme.__adaptationRules?.[0].tokens['--font-size-base']).toBe(
      '1rem',
    );
  });

  it('writes font families without re-expanding an untouched root scale', () => {
    const theme = defineTheme({
      name: 'family-only',
      typography: {scale: {base: 14, ratio: 1.2}},
      adaptations: {
        rules: [
          {
            when: {pointer: 'coarse'},
            value: {typography: {body: {family: 'Geist'}}},
          },
        ],
      },
    });

    const rule = theme.__adaptationRules?.[0];
    expect(rule?.tokens['--font-family-body']).toBe('Geist');
    expect(rule?.tokens['--font-size-base']).toBeUndefined();
    expect(rule?.components).toBeUndefined();
  });

  it('completes partial scales from root metadata and refuses approximations', () => {
    const complete = defineTheme({
      name: 'complete-scale',
      typography: {scale: {base: 14, ratio: 1.25}},
      radius: {base: 6, multiplier: 1},
      adaptations: {
        rules: [
          {
            when: {width: {below: 'md'}},
            value: {
              typography: {scale: {base: 16}},
              radius: {multiplier: 2},
            },
          },
        ],
      },
    });

    expect(complete.__adaptationRules?.[0].tokens['--font-size-lg']).toBe(
      '1.25rem',
    );
    expect(complete.__adaptationRules?.[0].tokens['--radius-element']).toBe(
      '24px',
    );

    expect(() =>
      defineTheme({
        name: 'missing-scale',
        adaptations: {
          rules: [
            {
              when: {pointer: 'coarse'},
              value: {motion: {fast: 100}},
            },
          ],
        },
      }),
    ).toThrow(/must supply `fast`, `medium`, and `ratio`/);
  });

  it('lowers component writes through the ordinary derived-variable path', () => {
    const theme = defineTheme(
      adaptationInput([
        {
          when: {pointer: 'coarse'},
          value: {components: {button: {base: {borderRadius: '20px'}}}},
        },
      ]),
    );

    const css = generateAdaptationCSS(theme).component;
    expect(css).toContain('--_button-radius: 20px');
  });
});

describe('theme-local adaptation values', () => {
  const localName = '--astryx-theme-local-root-control-height';

  it('replaces an enrolled exact name and permits rule references to it', () => {
    const theme = defineTheme({
      name: 'local-root',
      localTokens: {[localName]: '32px'},
      adaptations: {
        rules: [
          {
            when: {pointer: 'coarse'},
            value: {
              localTokens: {[localName]: '44px'},
              components: {
                button: {base: {minHeight: `var(${localName})`}},
              },
            },
          },
        ],
      },
    });

    expect(theme.__adaptationRules?.[0].localTokens).toEqual({
      [localName]: '44px',
    });
    expect(generateAdaptationCSS(theme).component).toContain(
      `${localName}: 44px`,
    );
  });

  it('does not let a rule enroll or misroute a local name', () => {
    expect(() =>
      defineTheme({
        name: 'rule-enroll',
        adaptations: {
          rules: [
            {
              when: {pointer: 'coarse'},
              value: {
                localTokens: {
                  '--astryx-theme-rule-enroll-new-name': '44px',
                },
              },
            },
          ],
        },
      }),
    ).toThrow(/cannot enroll a theme-local token/);

    expect(() =>
      defineTheme({
        name: 'local-root',
        localTokens: {[localName]: '32px'},
        adaptations: {
          rules: [
            {
              when: {pointer: 'coarse'},
              value: {tokens: {[localName]: '44px'}},
            },
          ],
        },
      } as unknown as DefineThemeInput),
    ).toThrow(/write it through value.localTokens/);
  });

  it('rejects undeclared references and conditional cycles', () => {
    expect(() =>
      defineTheme({
        name: 'local-root',
        localTokens: {[localName]: '32px'},
        adaptations: {
          rules: [
            {
              when: {pointer: 'coarse'},
              value: {
                components: {
                  button: {
                    base: {
                      minHeight: 'var(--astryx-theme-local-root-missing-name)',
                    },
                  },
                },
              },
            },
          ],
        },
      }),
    ).toThrow(/has no declaration/);

    const a = '--astryx-theme-cycle-local-a';
    const b = '--astryx-theme-cycle-local-b';
    expect(() =>
      defineTheme({
        name: 'cycle-local',
        localTokens: {[a]: '1px', [b]: `var(${a})`},
        adaptations: {
          rules: [
            {
              when: {pointer: 'coarse'},
              value: {localTokens: {[a]: `var(${b})`}},
            },
          ],
        },
      }),
    ).toThrow(/Theme-local token cycle detected/);
  });
});

describe('extension semantics and built metadata', () => {
  it('inherits breakpoint overrides and appends child rules', () => {
    const base = defineTheme({
      name: 'base-order',
      adaptations: {
        widthBreakpoints: {md: 800},
        rules: [
          {
            when: {width: {from: 'md'}},
            value: {tokens: {'--spacing-4': '18px'}},
          },
        ],
      },
    });
    const child = defineTheme({
      name: 'child-order',
      extends: base,
      adaptations: {
        widthBreakpoints: {md: 820},
        rules: [
          {
            when: {pointer: 'coarse'},
            value: {tokens: {'--size-element-md': '44px'}},
          },
        ],
      },
    });

    expect(child.__adaptations.widthBreakpoints.md).toBe(820);
    expect(child.__adaptations.rules).toHaveLength(2);
    expect(mediaPreludes(generateAdaptationCSS(child).component)).toEqual([
      '(width >= 820px)',
      '(pointer: coarse)',
    ]);
  });

  it("re-resolves inherited rules against the child's effective root axis", () => {
    const base = defineTheme({
      name: 'base-axis',
      typography: {scale: {base: 14, ratio: 1.2}},
      adaptations: {
        rules: [
          {
            when: {width: {below: 'sm'}},
            value: {typography: {scale: {base: 16}}},
          },
        ],
      },
    });
    const child = defineTheme({
      name: 'child-axis',
      extends: base,
      typography: {scale: {base: 15, ratio: 1.25}},
    });

    expect(child.__adaptationRules?.[0].tokens['--font-size-lg']).toBe(
      '1.25rem',
    );
  });

  it("keeps inherited rules above the child's root values", () => {
    const base = defineTheme({
      name: 'base-rule',
      adaptations: {
        rules: [
          {
            when: {pointer: 'coarse'},
            value: {tokens: {'--spacing-4': '12px'}},
          },
        ],
      },
    });
    const child = defineTheme({
      name: 'child-root',
      extends: base,
      tokens: {'--spacing-4': '20px'},
    });

    expect(child.tokens['--spacing-4']).toBe('20px');
    expect(child.__adaptationRules?.[0].tokens['--spacing-4']).toBe('12px');
  });

  it('recomputes inherited rules from built-theme metadata without CSS text', () => {
    const live = defineTheme({
      name: 'built-base',
      typography: {scale: {base: 14, ratio: 1.25}},
      adaptations: {
        widthBreakpoints: {sm: 700},
        rules: [
          {
            when: {width: {below: 'sm'}},
            value: {typography: {scale: {base: 16}}},
          },
        ],
      },
    });
    const built = {
      name: live.name,
      __built: true,
      tokens: live.tokens,
      components: live.components,
      __adaptations: live.__adaptations,
      __axes: live.__axes,
    } as DefinedTheme;

    const child = defineTheme({name: 'built-child', extends: built});
    expect(child.__adaptationRules?.[0].query).toBe('(width < 700px)');
    expect(child.__adaptationRules?.[0].tokens['--font-size-lg']).toBe(
      '1.25rem',
    );
    expect(JSON.stringify(built)).not.toContain('@media');
  });
});

describe('CSS cascade placement', () => {
  it('emits root values, then adaptations, then media-surface overrides', () => {
    const theme = defineTheme({
      name: 'surface-order',
      tokens: {'--color-background-body': '#ffffff'},
      adaptations: {
        rules: [
          {
            when: {contrast: 'more'},
            value: {tokens: {'--color-background-body': '#eeeeee'}},
          },
        ],
      },
      onDark: {tokens: {'--color-background-body': '#111111'}},
    });

    const css = generateThemeCSS(theme).component;
    expect(css.indexOf('#ffffff')).toBeLessThan(css.indexOf('#eeeeee'));
    expect(css.indexOf('#eeeeee')).toBeLessThan(css.lastIndexOf('#111111'));
  });

  it('keeps media-surface component writes above matching adaptations', () => {
    const theme = defineTheme({
      name: 'surface-component-order',
      components: {button: {base: {borderWidth: '1px'}}},
      adaptations: {
        rules: [
          {
            when: {contrast: 'more'},
            value: {components: {button: {base: {borderWidth: '2px'}}}},
          },
        ],
      },
      onDark: {components: {button: {base: {borderWidth: '3px'}}}},
    });

    const css = generateThemeCSS(theme).component;
    expect(css.indexOf('border-width: 1px')).toBeLessThan(
      css.indexOf('border-width: 2px'),
    );
    expect(css.indexOf('border-width: 2px')).toBeLessThan(
      css.lastIndexOf('border-width: 3px'),
    );
  });

  it('keeps JavaScript token reads on root values', () => {
    const theme = defineTheme({
      name: 'css-first',
      tokens: {'--spacing-4': '16px'},
      adaptations: {
        rules: [
          {
            when: {pointer: 'coarse'},
            value: {tokens: {'--spacing-4': '12px'}},
          },
        ],
      },
    });

    expect(theme.tokens['--spacing-4']).toBe('16px');
    expect(theme.__adaptationRules?.[0].tokens['--spacing-4']).toBe('12px');
  });
});
