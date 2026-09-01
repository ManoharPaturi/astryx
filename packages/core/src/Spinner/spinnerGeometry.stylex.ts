// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';
import type {IndicatorSizeOf} from '../Indicator/types';

export const SPINNER_SIZES = {
  sm: {diameter: 10, border: 2},
  md: {diameter: 14, border: 3},
  lg: {diameter: 18, border: 3},
  xl: {diameter: 28, border: 4},
} as const satisfies Record<
  IndicatorSizeOf<'busy'>,
  {diameter: number; border: number}
>;

const RESOLVED_SPINNER_DIAMETER = '--_spinner-ring-diameter';
const RESOLVED_SPINNER_STROKE = '--_spinner-ring-stroke';

export const spinnerSizeStyles = stylex.create({
  sm: {
    '--spinner-diameter': `${SPINNER_SIZES.sm.diameter}px`,
    '--spinner-stroke-width': `${SPINNER_SIZES.sm.border}px`,
  },
  md: {
    '--spinner-diameter': `${SPINNER_SIZES.md.diameter}px`,
    '--spinner-stroke-width': `${SPINNER_SIZES.md.border}px`,
  },
  lg: {
    '--spinner-diameter': `${SPINNER_SIZES.lg.diameter}px`,
    '--spinner-stroke-width': `${SPINNER_SIZES.lg.border}px`,
  },
  xl: {
    '--spinner-diameter': `${SPINNER_SIZES.xl.diameter}px`,
    '--spinner-stroke-width': `${SPINNER_SIZES.xl.border}px`,
  },
});

export const resolvedSpinnerSizeStyles = stylex.create({
  sm: {
    [RESOLVED_SPINNER_DIAMETER]: `var(--spinner-diameter, ${SPINNER_SIZES.sm.diameter}px)`,
    [RESOLVED_SPINNER_STROKE]: `var(--spinner-stroke-width, ${SPINNER_SIZES.sm.border}px)`,
  },
  md: {
    [RESOLVED_SPINNER_DIAMETER]: `var(--spinner-diameter, ${SPINNER_SIZES.md.diameter}px)`,
    [RESOLVED_SPINNER_STROKE]: `var(--spinner-stroke-width, ${SPINNER_SIZES.md.border}px)`,
  },
  lg: {
    [RESOLVED_SPINNER_DIAMETER]: `var(--spinner-diameter, ${SPINNER_SIZES.lg.diameter}px)`,
    [RESOLVED_SPINNER_STROKE]: `var(--spinner-stroke-width, ${SPINNER_SIZES.lg.border}px)`,
  },
  xl: {
    [RESOLVED_SPINNER_DIAMETER]: `var(--spinner-diameter, ${SPINNER_SIZES.xl.diameter}px)`,
    [RESOLVED_SPINNER_STROKE]: `var(--spinner-stroke-width, ${SPINNER_SIZES.xl.border}px)`,
  },
});
