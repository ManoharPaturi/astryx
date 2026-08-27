// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file focusableSelector.ts
 * @input Uses DOM focusability and visibility
 * @output Exports the canonical focusable selector and descendant helpers
 * @position Internal utility shared by focus-management hooks so their model of
 *   visible sequential focus stays aligned. Not exported from the public barrel.
 */

/**
 * Canonical CSS selector for potentially focusable elements. Visibility and
 * sequential-focus checks are applied separately by the helpers below.
 */
export const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([disabled]), [contenteditable]:not([contenteditable="false"]), audio[controls], video[controls], iframe, details > summary:first-child';

function isVisiblySequentiallyFocusable(element: HTMLElement): boolean {
  if (
    (element.hasAttribute('tabindex') && element.tabIndex < 0) ||
    element.matches(':disabled')
  ) {
    return false;
  }
  if (
    element.closest('[inert]') != null ||
    element.closest('[hidden]') != null ||
    element.closest('[aria-hidden="true"]') != null
  ) {
    return false;
  }
  if (typeof element.checkVisibility === 'function') {
    return element.checkVisibility({
      checkOpacity: false,
      checkVisibilityCSS: true,
    });
  }
  if (typeof window !== 'undefined' && window.getComputedStyle) {
    for (let current: HTMLElement | null = element; current != null;) {
      const style = window.getComputedStyle(current);
      if (style.visibility === 'hidden' || style.display === 'none') {
        return false;
      }
      current = current.parentElement;
    }
  }
  return true;
}

/** Get the visible descendants that participate in sequential focus order. */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(isVisiblySequentiallyFocusable);
}

/** Whether a container has a visible sequential-focus descendant. */
export function hasFocusableDescendant(container: HTMLElement): boolean {
  for (const candidate of container.querySelectorAll<HTMLElement>(
    FOCUSABLE_SELECTOR,
  )) {
    if (isVisiblySequentiallyFocusable(candidate)) {
      return true;
    }
  }
  return false;
}
