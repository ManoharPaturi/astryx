// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SpinnerIndicator.tsx
 * @input Indicator props of the `busy` family
 * @output Exports SpinnerIndicator — the default busy visual
 * @position Decorative loading ring rendered by every control with a busy
 *           state, and by the public Spinner
 *
 * This is the indicator a product replaces to ship its own loading visual.
 * `defineTheme({indicators: {spinner: PulsingLogo}})` changes what "working"
 * looks like in a Button, a TextInput, a Switch, a Thumbnail and every other
 * host at once, without any of them knowing it happened.
 *
 * It is DECORATIVE, like every other indicator: `aria-hidden`, no role, no
 * accessible name. The host owns `aria-busy` and the announcement — see
 * Spinner.tsx for the standalone case, which is the one place the role stays.
 *
 * It has no `shade` prop, and the omission is deliberate: the four shades were
 * four ways of saying which colour the ring paints in, which is what `color`
 * already says. A host sets `--_spinner-color` (and, if its track is not the
 * default rail, the two track vars); the indicator turns that into its own
 * `color`, so a REPLACEMENT written the obvious way — `stroke: currentColor` —
 * honours the host's shade without knowing shades exist.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars, durationVars} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import type {IndicatorProps, IndicatorSizeOf} from './types';

/**
 * Fraction of the ring the moving arc covers. The canvas ring this replaces
 * swept 135deg, not the 270deg its constant's comment claimed.
 */
const ARC_FRACTION = 0.375;

const SIZES: Record<
  IndicatorSizeOf<'busy'>,
  {diameter: number; border: number}
> = {
  sm: {diameter: 10, border: 2},
  md: {diameter: 14, border: 3},
  lg: {diameter: 18, border: 3},
  xl: {diameter: 28, border: 4},
};

/**
 * Pin every ring's rotation to the document timeline's origin instead of its
 * own start time, so spinners mounted seconds apart turn in phase.
 *
 * Setting `startTime` is exact where arithmetic on a clock read is not: a
 * negative `animation-delay` computed at mount is only as good as the gap
 * between reading the clock and the frame the animation starts in, which at
 * 10x CPU throttling measured 116deg of drift.
 *
 * Rings are collected and pinned in one frame because `getAnimations()`
 * resolves style and `startTime` dirties it again, so pinning them one at a
 * time makes each mount re-force what the previous one invalidated — 53 style
 * recalcs for 38 spinners against 19 batched.
 */
const pendingRings = new Set<SVGSVGElement>();
let flushScheduled = false;

function pinRingsToTimelineOrigin(): void {
  flushScheduled = false;
  const animations: Animation[] = [];
  for (const svg of pendingRings) {
    animations.push(...svg.getAnimations());
  }
  pendingRings.clear();
  for (const animation of animations) {
    animation.startTime = 0;
  }
}

function syncRotationPhase(
  svg: SVGSVGElement | null,
): (() => void) | undefined {
  // jsdom implements no Web Animations, and this runs in every consumer's
  // component tests.
  if (svg == null || typeof svg.getAnimations !== 'function') {
    return undefined;
  }
  pendingRings.add(svg);
  if (!flushScheduled) {
    flushScheduled = true;
    requestAnimationFrame(pinRingsToTimelineOrigin);
  }
  return () => {
    pendingRings.delete(svg);
  };
}

const rotation = stylex.keyframes({
  '0%': {transform: 'rotate(0deg)'},
  '100%': {transform: 'rotate(360deg)'},
});

const styles = stylex.create({
  root: {
    display: 'inline-grid',
    placeItems: 'center',
    overflow: 'hidden',
    verticalAlign: 'middle',
    flexShrink: 0,
    // The one knob a host turns to say what colour "busy" is here. It sets
    // `color`, not a stroke, so a REPLACEMENT painting in `currentColor` — the
    // obvious way to write one — follows the same instruction without knowing
    // the var exists. Unset, it resolves to the accent the ring has always
    // drawn in.
    color: `var(--_spinner-color, ${colorVars['--color-accent']})`,
  },
  ring: {
    backfaceVisibility: 'hidden',
    display: 'block',
    willChange: 'transform',
    // Slow the rotation dramatically under reduced-motion rather than freezing
    // it (a frozen spinner reads as broken), matching ProgressBar's approach.
    animationDuration: {
      default: durationVars['--duration-slow-min'],
      '@media (prefers-reduced-motion: reduce)': '3s',
    },
    animationIterationCount: 'infinite',
    animationName: rotation,
    animationTimingFunction: 'linear',
  },
  circle: {
    fill: 'none',
    strokeLinecap: 'round',
  },
  arc: {stroke: 'currentColor'},
  track: {
    stroke: `var(--_spinner-track-color, ${colorVars['--color-track']})`,
    strokeOpacity: 'var(--_spinner-track-opacity, 1)',
  },
  disabled: {opacity: 0.5},
});

/**
 * The default busy visual: a rotating arc over a faint track.
 *
 * Decorative and non-interactive — `aria-hidden`, no role, no accessible name.
 * The control that renders it owns `aria-busy` and whatever it announces.
 *
 * @example
 * ```
 * const Busy = useIndicator('spinner');
 * <Busy size="sm" />
 * ```
 *
 * Replace the loading visual everywhere at once:
 *
 * @example
 * ```
 * defineTheme({name: 'brand', indicators: {spinner: BouncingDots}});
 * ```
 */
export function SpinnerIndicator({
  size = 'md',
  isDisabled = false,
  children,
  ref,
  className,
  style,
  xstyle,
  ...rest
}: IndicatorProps<'busy'>) {
  const {border, diameter} = SIZES[size];
  const frameSize = diameter + border * 2;
  const center = frameSize / 2;
  const circumference = Math.PI * diameter;
  const arcLength = circumference * ARC_FRACTION;

  return (
    <span
      // `{...rest}` first, own contract after — TypeScript cannot reject a
      // hyphenated JSX attribute (see IndicatorProps), so attribute order is
      // what keeps a caller from un-hiding a decorative element.
      {...rest}
      ref={ref}
      aria-hidden="true"
      {...mergeProps(
        themeProps('spinner-indicator', {size}),
        stylex.props(styles.root, isDisabled && styles.disabled, xstyle),
        className,
        {...style, width: frameSize, height: frameSize},
      )}>
      {children ?? (
        <svg
          ref={syncRotationPhase}
          width={frameSize}
          height={frameSize}
          viewBox={`0 0 ${frameSize} ${frameSize}`}
          aria-hidden="true"
          {...stylex.props(styles.ring)}>
          <circle
            cx={center}
            cy={center}
            r={diameter / 2}
            strokeWidth={border}
            {...stylex.props(styles.circle, styles.track)}
          />
          <circle
            cx={center}
            cy={center}
            r={diameter / 2}
            strokeWidth={border}
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            transform={`rotate(-90 ${center} ${center})`}
            {...stylex.props(styles.circle, styles.arc)}
          />
        </svg>
      )}
    </span>
  );
}

SpinnerIndicator.displayName = 'SpinnerIndicator';
