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
import {isRenderable, mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {
  SPINNER_SIZES,
  resolvedSpinnerSizeStyles,
} from '../Spinner/spinnerGeometry.stylex';
import type {IndicatorProps} from './types';

/**
 * Fraction of the ring the moving arc covers. The canvas ring this replaces
 * swept 135deg, not the 270deg its constant's comment claimed.
 */
const ARC_FRACTION = 0.375;
const PI = 3.141592653589793;
const ARC_DASH = PI * ARC_FRACTION;
const ARC_GAP = PI * (1 - ARC_FRACTION);

const RESOLVED_DIAMETER = '--_spinner-ring-diameter';
const RESOLVED_STROKE = '--_spinner-ring-stroke';
const BOX_SIZE = '--_spinner-box-size';

function registerSpinnerVars(): void {
  if (
    typeof CSS === 'undefined' ||
    typeof CSS.registerProperty !== 'function'
  ) {
    return;
  }
  for (const name of [RESOLVED_DIAMETER, RESOLVED_STROKE]) {
    try {
      CSS.registerProperty({
        name,
        syntax: '<length>',
        inherits: true,
        initialValue: '0px',
      });
    } catch {
      // A second package copy or fast refresh can register the same property.
    }
  }
}

registerSpinnerVars();

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
    verticalAlign: 'middle',
    flexShrink: 0,
    color: `var(--_spinner-color, var(--spinner-color, ${colorVars['--color-accent']}))`,
    [BOX_SIZE]: `calc(var(${RESOLVED_DIAMETER}) + var(${RESOLVED_STROKE}) * 2)`,
  },
  ring: {
    backfaceVisibility: 'hidden',
    display: 'block',
    width: `var(${BOX_SIZE})`,
    height: `var(${BOX_SIZE})`,
    willChange: 'transform',
    overflow: 'visible',
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
    transformBox: 'fill-box',
    transformOrigin: 'center',
    strokeLinecap: 'round',
    r: `calc(var(${RESOLVED_DIAMETER}) / 2)`,
    strokeWidth: `var(${RESOLVED_STROKE})`,
  },
  arc: {
    stroke: 'var(--spinner-color, currentColor)',
    transform: 'rotate(-90deg)',
    strokeDasharray: `calc(var(${RESOLVED_DIAMETER}) * ${ARC_DASH}) calc(var(${RESOLVED_DIAMETER}) * ${ARC_GAP})`,
  },
  track: {
    stroke: `var(--spinner-track-color, var(--_spinner-track-color, ${colorVars['--color-track']}))`,
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
type SpinnerIndicatorVisualProps = IndicatorProps<'busy'> & {
  hasLegacyTarget: boolean;
};

function SpinnerIndicatorVisual({
  size = 'md',
  isDisabled = false,
  children,
  ref,
  className,
  style,
  xstyle,
  hasLegacyTarget,
  ...rest
}: SpinnerIndicatorVisualProps) {
  const {border, diameter} = SPINNER_SIZES[size];
  const frameSize = diameter + border * 2;
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
        themeProps(
          'spinner-indicator',
          {size},
          hasLegacyTarget ? {legacyNames: ['spinner']} : undefined,
        ),
        stylex.props(
          styles.root,
          resolvedSpinnerSizeStyles[size],
          isDisabled && styles.disabled,
          xstyle,
        ),
        className,
        {
          ...style,
          width: `var(${BOX_SIZE}, ${frameSize}px)`,
          height: `var(${BOX_SIZE}, ${frameSize}px)`,
        },
      )}>
      {isRenderable(children) ? (
        children
      ) : (
        <svg
          ref={syncRotationPhase}
          width={frameSize}
          height={frameSize}
          aria-hidden="true"
          {...stylex.props(styles.ring)}>
          <circle
            cx="50%"
            cy="50%"
            r={diameter / 2}
            strokeWidth={border}
            {...stylex.props(styles.circle, styles.track)}
          />
          <circle
            cx="50%"
            cy="50%"
            r={diameter / 2}
            strokeWidth={border}
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            {...stylex.props(styles.circle, styles.arc)}
          />
        </svg>
      )}
    </span>
  );
}

export function SpinnerIndicator(props: IndicatorProps<'busy'>) {
  return <SpinnerIndicatorVisual {...props} hasLegacyTarget />;
}

/** Internal standalone-Spinner path: the wrapper already owns the legacy target. */
export function SpinnerIndicatorWithoutLegacyTarget(
  props: IndicatorProps<'busy'>,
) {
  return <SpinnerIndicatorVisual {...props} hasLegacyTarget={false} />;
}

SpinnerIndicator.displayName = 'SpinnerIndicator';
