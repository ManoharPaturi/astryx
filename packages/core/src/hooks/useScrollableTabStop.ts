// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useScrollableTabStop.ts
 * @input Uses React useCallback; attachScrollableTabStop
 * @output Exports useScrollableTabStop and UseScrollableTabStopOptions
 * @position Core hook; not yet consumed in-tree — available to any component
 *   that turns itself into a scroll container
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 * - /packages/core/src/hooks/useScrollableTabStop.doc.mjs
 * - /packages/core/src/hooks/scrollableTabStop.ts (the DOM half)
 */

import {useCallback, type RefCallback} from 'react';
import {attachScrollableTabStop} from './scrollableTabStop';

export interface UseScrollableTabStopOptions {
  /**
   * Whether to manage the element at all. Pass the same condition that makes
   * the element a scroll container, so a container that cannot scroll is
   * never measured or observed.
   * @default true
   */
  enabled?: boolean;
}

/**
 * Make a scroll container reachable by keyboard, and only while it is one.
 *
 * Returns a ref callback for the scrolling element. While that element can
 * actually be scrolled — either axis, meaning the content overflows AND that
 * axis is `auto` or `scroll` — it carries `tabindex="0"`, so Tab stops on it
 * and the arrow keys scroll it (WCAG 2.1.1; axe
 * `scrollable-region-focusable`). Otherwise the attribute is not there,
 * because a tab stop the arrow keys do not answer is a dead stop.
 *
 * The attribute is written from a shared ResizeObserver callback, not from
 * state, so a container that starts overflowing does not cost a render.
 *
 * Give the element an accessible name (`aria-label`, or `aria-labelledby`
 * pointing at its heading) when its content does not already say what the
 * region is: a focus stop that announces nothing is its own problem.
 *
 * Adopting this makes the consuming component client-only — it reads layout,
 * which a server component cannot do. That is free for a component that
 * already carries `'use client'` (`LayoutContent` with `isScrollable`, which
 * is its default, is the closest fit today) and a real cost for one that does
 * not.
 *
 * @example
 * ```
 * const scrollRef = useScrollableTabStop({enabled: hasFixedHeight});
 *
 * <div ref={scrollRef} style={{height: 200, overflow: 'auto'}}>
 *   {children}
 * </div>
 * ```
 */
export function useScrollableTabStop(
  options: UseScrollableTabStopOptions = {},
): RefCallback<HTMLElement> {
  const {enabled = true} = options;

  // The ref callback returns its own cleanup (React 19), so its identity is
  // the whole lifecycle: it is stable while `enabled` is, and flipping
  // `enabled` detaches through the same path an unmount does.
  return useCallback(
    (element: HTMLElement | null) => {
      if (!element || !enabled) {
        return;
      }
      return attachScrollableTabStop(element);
    },
    [enabled],
  );
}
