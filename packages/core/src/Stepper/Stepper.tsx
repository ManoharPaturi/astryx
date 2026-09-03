// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Stepper.tsx
 * @input Uses React, stylex, theme tokens, StepperContext
 * @output Exports Stepper component and StepperProps
 * @position Core container component; consumed by index.ts
 *
 * Besides the props it is given, this component tracks the `activeStep` it
 * last rendered with and publishes it on the context. Steps need the distance
 * and direction of a change to choreograph their connector fill; see the
 * CONNECTOR FILL block in Step.tsx.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stepper/Stepper.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Stepper/Stepper.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Stepper/index.ts (exports if types change)
 * - /apps/storybook/stories/Stepper.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Stepper/ (showcase blocks)
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';

import {spacingVars} from '../theme/tokens.stylex';
import {mergeProps, rtlStyles} from '../utils';
import {observeResize, unobserveResize} from '../utils/sharedResizeObserver';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils';
import {Icon} from '../Icon';
import {IconButton} from '../IconButton';
import {useTranslator} from '../i18n';
import {
  StepperContext,
  type StepperOrientation,
  type StepperIndicatorPosition,
  type StepperContextValue,
} from './StepperContext';

/**
 * Width below which a step can no longer hold its own label. Under about this
 * much a one-word label starts breaking mid-word and a two-word one stacks,
 * which costs more vertical space than the row that replaces all of them — and
 * reads worse, because every step pays for text only one of them needs now.
 *
 * Applied per step rather than to the stepper, so where the collapse happens
 * follows the count: four steps hold out to 448px, seven need 784px.
 */
const MIN_STEP_WIDTH = 112;

export interface StepperProps extends BaseProps<HTMLOListElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLOListElement>;
  /**
   * Zero-based index of the active step.
   */
  activeStep: number;
  /**
   * Step elements to render.
   */
  children: ReactNode;
  /**
   * Layout direction of the stepper.
   * @default 'horizontal'
   */
  orientation?: StepperOrientation;
  /**
   * Called when a step indicator is clicked. Enables non-linear navigation.
   * When provided, completed and current steps become clickable.
   */
  onStepClick?: (index: number) => void;
  /**
   * Accessible label describing the set of steps. Defaults to a translated
   * "Progress" when unset.
   */
  label?: string;
  /**
   * Controls density (padding) of all steps.
   * @default 'balanced'
   */
  density?: 'compact' | 'balanced' | 'spacious';
  /**
   * Controls where each step's indicator sits relative to the connector track.
   * - 'separated': indicator lives in the label row, distinct from the progress
   *   bar (the original Astryx layout).
   * - 'on-track': indicator is slotted into the connector line as a node on the
   *   track (the on-track indicator design).
   * @default 'separated'
   */
  indicatorPosition?: StepperIndicatorPosition;
}

const styles = stylex.create({
  root: {
    display: 'flex',
    width: '100%',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    // Public, and declared HERE because component vars are root-owned: a theme
    // writes `stepper: {base: {'--step-connector-gap': '4px'}}`, which lands on
    // this element in `@layer astryx-theme` and beats this declaration. The
    // connectors inherit it. Declaring it on each connector instead — where it
    // started — made every one of them re-declare 0px on itself, and a value
    // declared on an element always beats an inherited one, so the generated
    // override compiled and changed nothing.
    '--step-connector-gap': '0px',
  },
  // The gap between steps is the break between connector segments, so it is
  // sized to match the connector's own thickness (BAR_WIDTH, the same token).
  // That keeps the track reading as one dashed line rather than as bars with
  // an arbitrary space between them, and holds at any theme scale.
  horizontal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-1'],
  },
  vertical: {
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
  },
  // On-track: steps must abut so their connector segments form one continuous
  // line, so the inter-step gap collapses to zero.
  horizontalOnTrack: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 0,
  },
  verticalOnTrack: {
    flexDirection: 'column',
    gap: 0,
  },
  // The element the collapse threshold is measured against, and the one that
  // stacks the track above the row naming the step it is on.
  frame: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
    width: '100%',
  },
  // Laid out as a row so the controls can bracket the step: they belong at the
  // edges the flow moves between, and the name reads between them.
  summary: {
    alignItems: 'center',
    display: 'flex',
    gap: spacingVars['--spacing-2'],
    justifyContent: 'space-between',
    minWidth: 0,
  },
  // Centred, so the name sits under the middle of the track rather than
  // drifting toward whichever control happens to be enabled.
  summaryBody: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
    textAlign: 'center',
  },
});

/**
 * A stepper component for multi-step workflows. Displays numbered steps
 * with visual indicators for completed, active, and upcoming states.
 *
 * Each Step child must provide a `step` prop (zero-based index) so it
 * can derive its state from the parent's activeStep. The on-track layout
 * hides the leading connector on the first step and the trailing connector
 * on the last step structurally, from each step's own `<li>` position, so
 * it works regardless of how the steps are grouped.
 *
 * Rendered as an ordered list (`<ol>`/`<li>`) rather than a `nav`
 * landmark: a stepper communicates *progress through a sequence*, not a
 * set of site navigation links. The active step is marked with
 * `aria-current="step"` (handled per-step) and the list carries an
 * accessible `label`. This follows the WAI-ARIA pattern for steppers /
 * progress sequences and avoids polluting the page's landmark map.
 *
 * @example
 * ```
 * <Stepper activeStep={1}>
 *   <Step step={0} label="Account" />
 *   <Step step={1} label="Profile" />
 *   <Step step={2} label="Review" />
 * </Stepper>
 * ```
 */
export function Stepper({
  activeStep,
  children,
  orientation = 'horizontal',
  onStepClick,
  label: labelFromProps,
  density = 'balanced',
  indicatorPosition = 'separated',
  xstyle,
  className,
  style,
  ref,
  ...rest
}: StepperProps) {
  const t = useTranslator();
  const label = labelFromProps ?? t('@astryx.stepper.label');

  // Dev-mode duplicate step index detection. Steps register on mount and
  // deregister on unmount; a Map tracks count per index so we can warn when
  // two Steps share the same `step` value (which breaks aria-current).
  const stepCountsRef = useRef<Map<number, number>>(new Map());
  // How many steps there are, which the stepper needs for real and not only
  // for the warning: the width each step is getting is this divided into the
  // width the stepper got. Counted from what registers rather than from the
  // children, so grouping steps in a fragment or an array cannot change the
  // answer.
  const [stepCount, setStepCount] = useState(0);
  const registerStep = useCallback((index: number) => {
    const counts = stepCountsRef.current;
    const prev = counts.get(index) ?? 0;
    counts.set(index, prev + 1);
    if (process.env.NODE_ENV !== 'production' && prev + 1 > 1) {
      console.warn(
        `[Stepper] Duplicate step index ${index}: two <Step> elements share the same \`step\` value. ` +
          `This breaks \`aria-current="step"\` and causes both to show as active simultaneously.`,
      );
    }
    setStepCount(c => c + 1);
    return () => {
      const cur = counts.get(index) ?? 1;
      if (cur <= 1) {
        counts.delete(index);
      } else {
        counts.set(index, cur - 1);
      }
      setStepCount(c => c - 1);
    };
  }, []);

  // The step we came *from*. Steps need it to stagger their connector fill:
  // the distance and direction of the change decide which segment moves first
  // and how long the whole sweep may take (see Step.tsx's CONNECTOR FILL).
  //
  // Derived during render from state rather than written in an effect. An
  // effect runs after paint, so the browser would already have committed the
  // new fill states with last render's delays — the first frame of the sweep
  // would be wrong, and on a jump of one that is the entire animation. React
  // discards and re-runs a render that sets its own state before committing,
  // so this costs a re-render but never a wrong frame.
  //
  // Seeding both halves from the current `activeStep` is what suppresses the
  // cascade on mount: a stepper that opens on step 3 has no previous step to
  // have travelled from, so its completed segments paint filled at once. That
  // also makes the first render pure and identical on the server, so there is
  // nothing for hydration to disagree about. Storing the pair in one state
  // object keeps the update idempotent under StrictMode's double render — both
  // invocations read the same `seen` and queue the same successor.
  const [seen, setSeen] = useState(() => ({
    current: activeStep,
    previous: activeStep,
  }));
  if (seen.current !== activeStep) {
    setSeen({current: activeStep, previous: seen.current});
  }
  const previousActiveStep =
    seen.current === activeStep ? seen.previous : seen.current;

  const isHorizontal = orientation === 'horizontal';

  // A vertical stepper gives every label a row of its own and can never run
  // out of width for them, so it opts out of all of this and renders exactly
  // the DOM it always has.
  const [frameWidth, setFrameWidth] = useState(0);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const attachFrame = useCallback((el: HTMLDivElement | null) => {
    if (frameRef.current) {
      unobserveResize(frameRef.current);
    }
    frameRef.current = el;
    if (el) {
      // observeResize calls back once, synchronously, as it subscribes. That
      // is what keeps the collapse off the screen: a ref callback runs during
      // commit, so the width lands and the re-render happens before the
      // browser has painted the uncollapsed stepper it would otherwise show
      // first.
      observeResize(el, entry => setFrameWidth(entry.target.clientWidth));
    }
  }, []);
  useEffect(
    () => () => {
      if (frameRef.current) {
        unobserveResize(frameRef.current);
      }
    },
    [],
  );

  // Width is measured rather than asked of a container query because the
  // answer changes what is *rendered*, not just how it looks: the labels and
  // their click targets leave the DOM entirely. A query could only have hidden
  // them, which would leave every step's text in the tree for a consumer's
  // `getByText` to trip over and every collapsed step still holding a focus
  // stop with nothing visible to show for it.
  //
  // Either value being zero means the stepper has not been told something it
  // needs yet — on the server, and for the one commit before the observer
  // fires and the steps register — and until it has, it renders whole.
  const isCompact =
    isHorizontal &&
    frameWidth > 0 &&
    stepCount > 0 &&
    frameWidth / stepCount < MIN_STEP_WIDTH;

  const [summarySlot, setSummarySlot] = useState<HTMLElement | null>(null);

  const ctxValue = useMemo<StepperContextValue>(
    () => ({
      activeStep,
      previousActiveStep,
      orientation,
      isNonLinear: onStepClick != null,
      onStepClick: onStepClick ?? null,
      density,
      indicatorPosition,
      registerStep,
      stepCount,
      isCompact,
      summarySlot,
    }),
    [
      activeStep,
      previousActiveStep,
      orientation,
      onStepClick,
      density,
      indicatorPosition,
      registerStep,
      stepCount,
      isCompact,
      summarySlot,
    ],
  );

  const isOnTrack = indicatorPosition === 'on-track';
  const orientationStyle =
    orientation === 'horizontal'
      ? isOnTrack
        ? styles.horizontalOnTrack
        : styles.horizontal
      : isOnTrack
        ? styles.verticalOnTrack
        : styles.vertical;

  const list = (
    <ol
      ref={ref}
      aria-label={label}
      {...rest}
      {...mergeProps(
        themeProps('stepper', {orientation, indicatorPosition}),
        stylex.props(styles.root, orientationStyle, xstyle),
        className,
        style,
      )}>
      {/* Each step renders its own progress bar segment; no child
          introspection needed — steps derive state from context. */}
      {children}
    </ol>
  );

  if (!isHorizontal) {
    return <StepperContext value={ctxValue}>{list}</StepperContext>;
  }

  // Controls, and only where there is something for them to do. A linear
  // stepper is driven by the form's own Back and Continue, and a second pair
  // pointed at a step the flow will not honour is worse than none.
  //
  // Unlike TabList's scroll arrows — decorative, aria-hidden, skipped by the
  // keyboard because every tab can still be reached by arrowing the strip —
  // these are the only way through a collapsed stepper. So they are real
  // controls with real names, and they take focus.
  const control = (delta: -1 | 1) => {
    if (onStepClick == null) {
      return null;
    }
    const name =
      delta === -1
        ? t('@astryx.stepper.previousStep')
        : t('@astryx.stepper.nextStep');
    return (
      <IconButton
        variant="ghost"
        label={name}
        tooltip={name}
        icon={
          <Icon
            icon={delta === -1 ? 'chevronLeft' : 'chevronRight'}
            xstyle={rtlStyles.mirror}
          />
        }
        isDisabled={
          delta === -1 ? activeStep <= 0 : activeStep >= stepCount - 1
        }
        onClick={() => onStepClick(activeStep + delta)}
      />
    );
  };

  return (
    <StepperContext value={ctxValue}>
      <div
        ref={attachFrame}
        {...mergeProps(
          themeProps('stepper-frame'),
          stylex.props(styles.frame),
        )}>
        {list}
        {isCompact && (
          <div
            {...mergeProps(
              themeProps('stepper-summary'),
              stylex.props(styles.summary),
            )}>
            {control(-1)}
            {/* The list above still carries every step's name and status, so
                this row repeats one of them for the eye only. Hiding it keeps
                a screen reader from hearing the current step named twice,
                while leaving the controls either side of it reachable. */}
            <div
              ref={setSummarySlot}
              aria-hidden="true"
              {...stylex.props(styles.summaryBody)}
            />
            {control(1)}
          </div>
        )}
      </div>
    </StepperContext>
  );
}

Stepper.displayName = 'Stepper';
