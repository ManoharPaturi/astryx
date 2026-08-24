// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Spinner.tsx
 * @input Uses React, StyleX, the `spinner` indicator from the registry
 * @output Exports Spinner component, SpinnerProps, SpinnerSize, SpinnerShade types
 * @position The standalone, announced loading indicator; the busy visual
 *           itself now lives in Indicator/SpinnerIndicator.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Spinner/Spinner.doc.mjs
 * - /packages/core/src/Spinner/Spinner.test.tsx
 * - /packages/core/src/Spinner/index.ts
 * - /apps/storybook/stories/Spinner.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Spinner/ (showcase blocks)
 *
 * Spinner is now two things layered, and the split is the whole point:
 *
 *   - the PICTURE is `SpinnerIndicator`, resolved through the registry, so
 *     `defineTheme({indicators: {spinner: X}})` replaces it here and in every
 *     control that renders a busy visual, together;
 *   - the ANNOUNCEMENT is this component's `role="status"`, which stays,
 *     because a spinner a product renders by itself has no host to own it.
 *
 * A control that renders a busy visual inside itself uses the indicator
 * directly and keeps the announcement on the control, where its accessible
 * name already lives. Rendering `<Spinner>` inside one announced "Loading"
 * next to a control that was already `aria-busy`.
 */

import {useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useIndicator} from '../Indicator';
import type {IndicatorSizeOf} from '../Indicator';
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {Text} from '../Text/Text';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  wrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  status: {
    display: 'inline-flex',
  },
});

/**
 * A shade resolves to the foreground the indicator paints with, plus the two
 * private vars its track reads. Colour reaches a replacement the same way it
 * reaches ours — through `currentColor` — so a branded visual honours `shade`
 * without knowing the prop exists.
 *
 * `onMedia` keeps the 77/255 its token's `4D` hex suffix used to encode.
 */
const shadeStyles = stylex.create({
  default: {
    color: colorVars['--color-accent'],
    '--_spinner-track-color': colorVars['--color-track'],
    '--_spinner-track-opacity': '1',
  },
  subtle: {
    color: colorVars['--color-text-secondary'],
    '--_spinner-track-color': colorVars['--color-track'],
    '--_spinner-track-opacity': '1',
  },
  onMedia: {
    color: colorVars['--color-on-dark'],
    '--_spinner-track-color': 'currentColor',
    '--_spinner-track-opacity': `${77 / 255}`,
  },
  inherit: {
    color: 'currentColor',
    '--_spinner-track-color': 'currentColor',
    '--_spinner-track-opacity': '0.3',
  },
});

export type SpinnerSize = IndicatorSizeOf<'busy'>;

export type SpinnerShade = 'default' | 'onMedia' | 'subtle' | 'inherit';

export interface SpinnerProps extends BaseProps<HTMLSpanElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
  /**
   * Spinner size.
   * - 'sm': 10px diameter
   * - 'md': 14px diameter
   * - 'lg': 18px diameter
   * - 'xl': 28px diameter
   * @default 'md'
   */
  size?: SpinnerSize;
  /**
   * Color shade.
   * - 'default': accent color on light backgrounds
   * - 'onMedia': white on dark/accent backgrounds
   * - 'subtle': secondary text color, less prominent — for inline use in lists
   * - 'inherit': inherits the parent's `currentColor` (with a translucent
   *   track) — use inside colored elements like buttons so the ring matches
   *   the resolved foreground regardless of theme/variant
   * @default 'default'
   */
  shade?: SpinnerShade;
  /**
   * Visible content displayed below the spinner.
   * Accepts a string or ReactNode for rich content.
   *
   * When `label` is a string, the visible text also provides the accessible
   * name of the status element (via aria-labelledby, avoiding a duplicate
   * announcement) unless `aria-label` is explicitly set.
   *
   * @example
   * ```
   * <Spinner label="Loading..." />
   * <Spinner label={<><strong>Fetching data</strong><br/>This may take a moment</>} aria-label="Fetching data" />
   * ```
   */
  label?: ReactNode;
  /**
   * Test ID for the root element.
   */
  'data-testid'?: string;
}

/**
 * An animated loading indicator that announces itself. Available in four sizes
 * and four color shades.
 *
 * Use this where the loading state belongs to the page rather than to a
 * control — a pending panel, a route transition, a standalone "working" state.
 * A control with its own busy state renders the `spinner` indicator instead
 * and keeps the announcement on itself.
 *
 * @example
 * ```
 * <Spinner />
 * <Spinner size="sm" />
 * <Spinner size="lg" shade="onMedia" />
 * <Spinner label="Loading..." />
 * <Spinner aria-label="Loading data" />
 * ```
 */
export function Spinner({
  size = 'md',
  shade = 'default',
  label,
  xstyle,
  className,
  style,
  'aria-label': ariaLabel,
  'data-testid': testId,
  ref,
  ...restProps
}: SpinnerProps) {
  const BusyIndicator = useIndicator('spinner');
  const hasLabel = label != null;
  const labelId = useId();

  // When a visible string label renders (and no explicit aria-label is set),
  // name the status element from the visible Text via aria-labelledby instead
  // of duplicating the same string as aria-label — the duplicate would be
  // announced twice by screen readers (WCAG 4.1.2).
  const namedByVisibleLabel =
    hasLabel && typeof label === 'string' && ariaLabel == null;

  // Resolve accessible name: explicit aria-label > string label > "Loading"
  const resolvedAriaLabel =
    ariaLabel ?? (typeof label === 'string' ? label : undefined) ?? 'Loading';

  const spinner = (
    <span
      ref={hasLabel ? undefined : ref}
      role="status"
      aria-label={namedByVisibleLabel ? undefined : resolvedAriaLabel}
      aria-labelledby={namedByVisibleLabel ? labelId : undefined}
      data-testid={hasLabel ? undefined : testId}
      {...(hasLabel ? {} : restProps)}
      {...mergeProps(
        hasLabel ? '' : themeProps('spinner', {size, shade}),
        stylex.props(styles.status, shadeStyles[shade], !hasLabel && xstyle),
        hasLabel ? undefined : className,
        hasLabel ? undefined : style,
      )}>
      <BusyIndicator size={size} />
    </span>
  );

  if (!hasLabel) {
    return spinner;
  }

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      data-testid={testId}
      {...restProps}
      {...mergeProps(
        themeProps('spinner', {size, shade}),
        stylex.props(styles.wrapper, xstyle),
        className,
        style,
      )}>
      {spinner}
      {typeof label === 'string' ? (
        <Text id={labelId} type="body" weight="bold">
          {label}
        </Text>
      ) : (
        label
      )}
    </div>
  );
}

Spinner.displayName = 'Spinner';
