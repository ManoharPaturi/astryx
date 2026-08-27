// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file scrollableTabStop.ts
 * @input DOM element; focusableSelector; ResizeObserver; MutationObserver
 * @output Exports attachScrollableTabStop — the imperative half of
 *   useScrollableTabStop
 * @position Internal behavior for keyboard access to scroll containers; used
 *   by useScrollableTabStop and tested without React
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/useScrollableTabStop.ts
 * - /packages/core/src/hooks/scrollableTabStop.test.ts
 */
import {hasFocusableDescendant} from './focusableSelector';
import {observeResize, unobserveResize} from '../utils/sharedResizeObserver';

const TOLERANCE = 1;
const SCROLLABLE = new Set(['auto', 'scroll']);
const OBSERVED_ATTRIBUTES = [
  'aria-hidden',
  'class',
  'contenteditable',
  'controls',
  'disabled',
  'hidden',
  'href',
  'inert',
  'open',
  'style',
  'tabindex',
  'type',
] as const;

/**
 * Keep `tabindex="0"` on an element exactly while it is scrollable and has no
 * visible sequential-focus descendant. Returns the detach function.
 */
export function attachScrollableTabStop(element: HTMLElement): () => void {
  const observedChildren = new Set<Element>();
  let active = true;
  let managed = false;
  let measuring = false;
  let measureFrame: number | null = null;
  let initializing = true;

  const apply = () => {
    if (managed && element.getAttribute('tabindex') !== '0') {
      managed = false;
    }

    const overflowsBlock =
      element.scrollHeight > element.clientHeight + TOLERANCE;
    const overflowsInline =
      element.scrollWidth > element.clientWidth + TOLERANCE;
    let scrollable = false;
    if (overflowsBlock || overflowsInline) {
      const style = getComputedStyle(element);
      scrollable =
        (overflowsBlock && SCROLLABLE.has(style.overflowY)) ||
        (overflowsInline && SCROLLABLE.has(style.overflowX));
    }

    const needsTabStop = scrollable && !hasFocusableDescendant(element);
    if (needsTabStop) {
      if (!managed && !element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
        managed = true;
      }
      return;
    }
    if (managed && element !== element.ownerDocument.activeElement) {
      element.removeAttribute('tabindex');
      managed = false;
    }
  };

  const syncChildren = () => {
    for (const child of observedChildren) {
      if (child.parentNode !== element) {
        unobserveResize(child, scheduleMeasure);
        observedChildren.delete(child);
      }
    }
    for (const child of element.children) {
      if (!observedChildren.has(child)) {
        observedChildren.add(child);
        observeResize(child, scheduleMeasure);
      }
    }
  };

  const measure = () => {
    if (!active || measuring) {
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

  function scheduleMeasure(): void {
    if (!active || initializing || measuring || measureFrame !== null) {
      return;
    }
    measureFrame = requestAnimationFrame(() => {
      measureFrame = null;
      measure();
    });
  }

  measure();
  observeResize(element, scheduleMeasure);
  initializing = false;

  element.addEventListener('focusout', scheduleMeasure);

  const mutations =
    typeof MutationObserver === 'undefined'
      ? null
      : new MutationObserver(records => {
          const onlyManagedTabIndex = records.every(
            record =>
              record.type === 'attributes' &&
              record.target === element &&
              record.attributeName === 'tabindex',
          );
          if (
            onlyManagedTabIndex &&
            ((managed && element.getAttribute('tabindex') === '0') ||
              (!managed && !element.hasAttribute('tabindex')))
          ) {
            return;
          }
          scheduleMeasure();
        });
  mutations?.observe(element, {
    attributes: true,
    attributeFilter: [...OBSERVED_ATTRIBUTES],
    childList: true,
    subtree: true,
  });

  return () => {
    active = false;
    mutations?.disconnect();
    element.removeEventListener('focusout', scheduleMeasure);
    if (measureFrame !== null) {
      cancelAnimationFrame(measureFrame);
      measureFrame = null;
    }
    unobserveResize(element, scheduleMeasure);
    for (const child of observedChildren) {
      unobserveResize(child, scheduleMeasure);
    }
    observedChildren.clear();
    if (managed) {
      element.removeAttribute('tabindex');
      managed = false;
    }
  };
}
