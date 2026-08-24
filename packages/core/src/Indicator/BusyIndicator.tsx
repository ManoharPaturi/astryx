// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BusyIndicator.tsx
 * @input Indicator props of the `busy` family
 * @output Exports BusyIndicator — the resolved `spinner` indicator as a component
 * @position What a control renders while work is in flight
 *
 * `useIndicator('spinner')` returns a component, so every host that wanted one
 * would have to call the hook and bind a capitalised local before its JSX. This
 * does that once. A host swaps `<Spinner size="sm" />` for
 * `<BusyIndicator size="sm" />` and nothing else moves — no hook to place, no
 * render-order constraint, and the theme's replacement reaches it.
 *
 * It is DECORATIVE. The control keeps `aria-busy` and the announcement; that is
 * the whole difference from rendering `<Spinner>`, which brings a `role="status"`
 * of its own into a control that already has an accessible name.
 */

import {useIndicator} from './useIndicator';
import type {IndicatorProps} from './types';

export function BusyIndicator(props: IndicatorProps<'busy'>) {
  const Indicator = useIndicator('spinner');
  return <Indicator {...props} />;
}

BusyIndicator.displayName = 'BusyIndicator';
