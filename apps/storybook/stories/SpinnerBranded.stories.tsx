// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * The argument for making the busy visual replaceable, in one frame.
 *
 * Four replacements, each swapped in by `defineTheme({indicators: {spinner}})`
 * and nothing else — no prop, no host change, no per-component styling. Each
 * row renders the same three hosts as the default row above it, so what
 * changes between rows is exactly one registry entry.
 *
 * They are deliberately not four recolours of our ring: a row of dots, a
 * square, a reversed arc with a flat cap, and a rotating mark. Two of them are
 * not circles and one of them is not square, which is the point — a
 * replacement is not constrained to the shape we ship, and the demos are where
 * that gets tested rather than asserted.
 */

import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {Button} from '@astryxdesign/core/Button';
import type {IndicatorProps} from '@astryxdesign/core/Indicator';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Switch} from '@astryxdesign/core/Switch';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Theme, defineTheme} from '@astryxdesign/core/theme';
import {HStack, VStack} from '@astryxdesign/core/Layout';

const meta: Meta = {
  title: 'Core/Spinner/Branded Replacements',
};

export default meta;
type Story = StoryObj;

// The busy family has no state to draw, so a replacement is a function of
// `size` alone. `md` is the fallback every indicator defaults to.
const PX: Record<string, number> = {sm: 10, md: 14, lg: 18, xl: 28};

// -- 1. Bouncing dots — a ROW. Three times as wide as it is tall, which is the
//       demo that probes whether a host's busy slot assumes a square.

const bounce = stylex.keyframes({
  '0%, 80%, 100%': {transform: 'translateY(0)', opacity: 0.4},
  '40%': {transform: 'translateY(-40%)', opacity: 1},
});

const dotStyles = stylex.create({
  row: {display: 'inline-flex', alignItems: 'center', gap: '2px'},
  dot: {
    backgroundColor: 'currentColor',
    borderRadius: '50%',
    animationName: bounce,
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  },
  d2: {animationDelay: '0.15s'},
  d3: {animationDelay: '0.3s'},
});

function BouncingDots({size = 'md'}: IndicatorProps<'busy'>) {
  const d = Math.round(PX[size] / 2.2);
  return (
    <span aria-hidden="true" {...stylex.props(dotStyles.row)}>
      <span {...stylex.props(dotStyles.dot)} style={{width: d, height: d}} />
      <span
        {...stylex.props(dotStyles.dot, dotStyles.d2)}
        style={{width: d, height: d}}
      />
      <span
        {...stylex.props(dotStyles.dot, dotStyles.d3)}
        style={{width: d, height: d}}
      />
    </span>
  );
}

// -- 2. Pulsing square — no rotation at all, and not round.

const pulse = stylex.keyframes({
  '0%, 100%': {transform: 'scale(0.6) rotate(0deg)', opacity: 0.45},
  '50%': {transform: 'scale(1) rotate(45deg)', opacity: 1},
});

const squareStyles = stylex.create({
  box: {
    display: 'inline-block',
    backgroundColor: 'currentColor',
    borderRadius: '2px',
    animationName: pulse,
    animationDuration: '1.1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  },
});

function PulsingSquare({size = 'md'}: IndicatorProps<'busy'>) {
  const d = PX[size];
  return (
    <span
      aria-hidden="true"
      {...stylex.props(squareStyles.box)}
      style={{width: d, height: d}}
    />
  );
}

// -- 3. Counter-rotating arc — our geometry, run the other way, with a butt
//       cap and a much longer sweep. The nearest thing to a "restyle", and the
//       one that shows a product can keep the ring and still own it.

const counterSpin = stylex.keyframes({
  '0%': {transform: 'rotate(360deg)'},
  '100%': {transform: 'rotate(0deg)'},
});

const arcStyles = stylex.create({
  svg: {
    display: 'block',
    animationName: counterSpin,
    animationDuration: '0.9s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
  arc: {fill: 'none', stroke: 'currentColor', strokeLinecap: 'butt'},
});

function ReverseArc({size = 'md'}: IndicatorProps<'busy'>) {
  const frame = PX[size] + 6;
  const r = frame / 2 - 2;
  const c = 2 * Math.PI * r;
  return (
    <svg
      aria-hidden="true"
      width={frame}
      height={frame}
      viewBox={`0 0 ${frame} ${frame}`}
      {...stylex.props(arcStyles.svg)}>
      <circle
        cx={frame / 2}
        cy={frame / 2}
        r={r}
        strokeWidth={2}
        strokeDasharray={`${c * 0.75} ${c * 0.25}`}
        {...stylex.props(arcStyles.arc)}
      />
    </svg>
  );
}

// -- 4. A rotating logo mark — an arbitrary glyph, which is the case Cindy
//       described: a brand's own shape standing in for a loading ring.

const markSpin = stylex.keyframes({
  '0%': {transform: 'rotate(0deg) scale(1)'},
  '50%': {transform: 'rotate(180deg) scale(0.75)'},
  '100%': {transform: 'rotate(360deg) scale(1)'},
});

const markStyles = stylex.create({
  svg: {
    display: 'block',
    animationName: markSpin,
    animationDuration: '1.4s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  },
});

function LogoMark({size = 'md'}: IndicatorProps<'busy'>) {
  const d = PX[size] + 4;
  return (
    <svg
      aria-hidden="true"
      width={d}
      height={d}
      viewBox="0 0 24 24"
      {...stylex.props(markStyles.svg)}>
      <path
        d="M12 1.5 22.5 20.5H1.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinejoin="round"
      />
    </svg>
  );
}

const brandThemes = [
  {
    label: "indicators: {spinner: BouncingDots}   ← wide, not square",
    theme: defineTheme({
      name: 'brand-dots',
      indicators: {spinner: BouncingDots},
    }),
  },
  {
    label: 'indicators: {spinner: PulsingSquare}',
    theme: defineTheme({
      name: 'brand-square',
      indicators: {spinner: PulsingSquare},
    }),
  },
  {
    label: 'indicators: {spinner: ReverseArc}',
    theme: defineTheme({name: 'brand-arc', indicators: {spinner: ReverseArc}}),
  },
  {
    label: 'indicators: {spinner: LogoMark}',
    theme: defineTheme({name: 'brand-mark', indicators: {spinner: LogoMark}}),
  },
];

const themes = [
  {label: 'default — the ring we ship', theme: null},
  ...brandThemes,
];

const layout = stylex.create({
  page: {display: 'flex', flexDirection: 'column', gap: '20px', padding: 8},
  row: {
    display: 'grid',
    gridTemplateColumns: '260px 120px 220px 90px 70px',
    alignItems: 'center',
    gap: '16px',
  },
  head: {opacity: 0.6},
  mono: {fontFamily: 'ui-monospace, monospace', fontSize: '11px'},
});

/**
 * One registry entry, four hosts, five rows. The hosts are unchanged between
 * rows and none of them knows which visual it is rendering.
 */
export const BrandedSpinners: Story = {
  render: () => (
    <div {...stylex.props(layout.page)}>
      <div {...stylex.props(layout.row, layout.head)}>
        <Text type="supporting">theme</Text>
        <Text type="supporting">Button (loading)</Text>
        <Text type="supporting">TextInput (busy)</Text>
        <Text type="supporting">Switch</Text>
        <Text type="supporting">standalone</Text>
      </div>
      {themes.map(({label, theme}) => {
        const row = (
          <div {...stylex.props(layout.row)} key={label}>
            <span {...stylex.props(layout.mono)}>{label}</span>
            <Button label="Save" isLoading />
            <TextInput label="Search" value="astryx" isLoading />
            <Switch label="Sync" isLabelHidden value isLoading />
            <Spinner size="md" />
          </div>
        );
        return theme == null ? (
          row
        ) : (
          <Theme theme={theme} mode="light" key={label}>
            {row}
          </Theme>
        );
      })}
    </div>
  ),
};

/**
 * The same replacement at every size the busy family declares. `lg` and `xl`
 * exist only for a standalone spinner; no control passes them.
 */
export const BrandedSizes: Story = {
  render: () => (
    <VStack gap={6}>
      {brandThemes.map(({label, theme}) => (
        <Theme theme={theme} mode="light" key={label}>
          <HStack gap={6} vAlign="center">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner size="xl" />
          </HStack>
        </Theme>
      ))}
    </VStack>
  ),
};
