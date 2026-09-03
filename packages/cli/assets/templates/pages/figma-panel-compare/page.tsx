// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Side-by-side: the same inspector panel built two ways.
 *
 * Left  — `figma-design-panel`, chasing Figma UI3 pixel-for-pixel.
 * Right — `figma-design-panel-native`, built the way Astryx wants.
 *
 * The point of the page is the delta. Left matches the reference to ~4% of
 * pixels but overrides ~20 colours, pins every size token to 31px, strips
 * InputGroupText to nothing and nests two extra <Theme>s purely to defeat
 * component styling. Right holds to tokens and defaults and looks like the
 * design system it is built from.
 */

'use client';

import * as stylex from '@stylexjs/stylex';

import {Text} from '@astryxdesign/core/Text';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@astryxdesign/core/theme/tokens.stylex';

import PixelFaithfulPanel from '../figma-design-panel/page';
import NativePanel from '../figma-design-panel-native/page';
import ThemedPanel from '../figma-panel-themed/page';

const styles = stylex.create({
  page: {
    minHeight: '100vh',
    backgroundColor: colorVars['--color-background-body'],
    padding: spacingVars['--spacing-6'],
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-5'],
  },
  columns: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-8'],
    flexWrap: 'wrap',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-3'],
    // Bounded so the notes wrap instead of stretching the row past three up.
    width: 400,
  },
  caption: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    maxWidth: 380,
  },
  /** Neutralises the pixel-faithful page's own full-bleed stage. */
  bare: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  note: {
    borderInlineStartWidth: 2,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border'],
    paddingInlineStart: spacingVars['--spacing-3'],
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    maxWidth: 380,
  },
  swatchRow: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
    alignItems: 'center',
    borderRadius: radiusVars['--radius-inner'],
  },
});

function Column({
  title,
  summary,
  notes,
  children,
}: {
  title: string;
  summary: string;
  notes: string[];
  children: React.ReactNode;
}) {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.caption)}>
        <Text type="large">{title}</Text>
        <Text type="supporting" color="secondary">
          {summary}
        </Text>
      </div>
      <div {...stylex.props(styles.bare)}>{children}</div>
      <div {...stylex.props(styles.note)}>
        {notes.map(n => (
          <Text key={n} type="supporting" color="secondary">
            {n}
          </Text>
        ))}
      </div>
    </div>
  );
}

export default function FigmaPanelCompare() {
  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.caption)}>
        <Text type="display-3">Three ways to build the same panel</Text>
      </div>

      <div {...stylex.props(styles.columns)}>
        <Column
          title="Pixel-faithful"
          summary="Matches Figma UI3 to ~4% of pixels."
          notes={[
            '~20 hardcoded colours; no token resolves to the theme.',
            'sm / md / lg size tokens all pinned to 31px.',
            'InputGroupText stripped of padding, fill, border and min-width.',
            'Two nested <Theme>s exist only to defeat Avatar and Checkbox styling.',
            '23 of 26 icons hand-drawn inline.',
          ]}>
          <PixelFaithfulPanel />
        </Column>

        <Column
          title="Astryx-native"
          summary="Same information architecture, built on the system."
          notes={[
            'Zero hardcoded colours — every value is a token var.',
            'Components render at their own sm / md sizes.',
            'InputGroup, SegmentedControl and Button keep their real appearance.',
            'No theme overrides and no nested <Theme>.',
            '15 custom glyphs remain — Astryx has no canvas icon vocabulary.',
          ]}>
          <NativePanel />
        </Column>

        <Column
          title="Theme-only"
          summary="Matches Figma to ~4.8% of pixels, with nothing repainted by hand."
          notes={[
            'Every colour, border, radius and fill comes from defineTheme.',
            'No Astryx component receives paint via xstyle — only Stack padding.',
            'Overrides target real slots: text-input, input-group-text, toggle-button-group, checkbox-indicator, avatar-fallback.',
            'No nested <Theme> — avatar-fallback and checkbox-indicator are reachable directly.',
            'Alignment clusters are a themed ToggleButtonGroup, not a styled div.',
            'Icons remain the one true gap: 26 glyphs still hand-drawn.',
          ]}>
          <ThemedPanel />
        </Column>
      </div>
    </div>
  );
}
