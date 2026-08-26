// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file scrollableTabStop.ts
 * @input DOM element; sharedResizeObserver
 * @output Exports attachScrollableTabStop — the imperative half of
 *   useScrollableTabStop
 * @position Internal; the DOM work behind /packages/core/src/hooks/
 *   useScrollableTabStop.ts, split out so it can be tested without React and
 *   reused by a non-React caller. Not exported from the public barrel.
 *
 * A scroll container that no keyboard can reach fails WCAG 2.1.1 (axe:
 * scrollable-region-focusable). The fix is `tabindex="0"`, but only while the
 * element really overflows: `overflow: auto` on a box whose content fits is
 * not a scroll container, and a tab stop there is a dead stop for every
 * keyboard user.
 *
 * Whether it overflows is only knowable after layout and changes afterwards,
 * so the attribute is written from the observer callback rather than from
 * render — no state, no second render pass.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/useScrollableTabStop.ts
 * - /packages/core/src/hooks/scrollableTabStop.test.ts
 */

import {observeResize, unobserveResize} from '../utils/sharedResizeObserver';

/**
 * Sub-pixel slack, matching useScrollOverflow. axe uses 13px before it calls a
 * region scrollable; the stricter threshold only ever adds a tab stop axe
 * would not have demanded, never removes one it would.
 */
const TOLERANCE = 1;

/**
 * Keep `tabindex="0"` on `element` exactly while it can actually be scrolled,
 * and return the detach function.
 *
 * Both axes are measured, so an inline overflow (a long unbroken token, RTL
 * included) counts the same as a block one.
 *
 * The container itself is observed for resize, and so is each of its direct
 * children: a fixed-height container does NOT resize when its content grows,
 * but the child holding that content does — including when it is replaced,
 * because removal fires the observer for the outgoing child and the callback
 * re-syncs the set. What that leaves uncovered is content that changes size
 * without any element changing size: a bare text node child, or absolutely
 * positioned content.
 */
export function attachScrollableTabStop(element: HTMLElement): () => void {
  const observedChildren = new Set<Element>();
  let managed = false;
  let measuring = false;

  const apply = () => {
    const overflowing =
      element.scrollHeight > element.clientHeight + TOLERANCE ||
      element.scrollWidth > element.clientWidth + TOLERANCE;

    if (overflowing) {
      // A tabindex we did not write belongs to the consumer; leave it.
      if (!managed && !element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
        managed = true;
      }
      return;
    }
    // Dropping the attribute while the element has focus would throw the
    // keyboard user back to the body mid-interaction. The stale tab stop
    // costs less than the lost place, and the next measure clears it.
    if (managed && element !== element.ownerDocument.activeElement) {
      element.removeAttribute('tabindex');
      managed = false;
    }
  };

  const measure = () => {
    // observeResize fires synchronously on registration, so syncing children
    // re-enters here once per child; the outer call finishes the work.
    if (measuring) {
      return;
    }
    measuring = true;
    try {
      syncChildren();
      apply();
    } finally {
      measuring = false;
    }
  };

  const syncChildren = () => {
    for (const child of observedChildren) {
      if (child.parentNode !== element) {
        unobserveResize(child, measure);
        observedChildren.delete(child);
      }
    }
    for (const child of element.children) {
      if (!observedChildren.has(child)) {
        observedChildren.add(child);
        observeResize(child, measure);
      }
    }
  };

  observeResize(element, measure);

  return () => {
    unobserveResize(element, measure);
    for (const child of observedChildren) {
      unobserveResize(child, measure);
    }
    observedChildren.clear();
    if (managed) {
      element.removeAttribute('tabindex');
      managed = false;
    }
  };
}
