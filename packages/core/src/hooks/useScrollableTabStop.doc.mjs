// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useScrollableTabStop',
  displayName: 'useScrollableTabStop',
  keywords: ['scroll', 'scrollable', 'keyboard', 'tabindex', 'a11y', 'accessibility', 'overflow', 'wcag', 'focus'],
  params: [
    {
      name: 'options.enabled',
      type: 'boolean',
      description:
        'Whether to manage the element at all. Pass the same condition that makes the element a scroll container, so a container that cannot scroll is never measured or observed.',
      default: 'true',
    },
  ],
  returns: [
    {
      name: 'ref',
      type: 'React.RefCallback<HTMLElement>',
      description: 'Ref callback to attach to the scrolling element.',
    },
  ],
  usage: {
    description:
      'Keeps `tabindex="0"` on a scroll container exactly while it actually overflows, so keyboard users can reach and scroll it (WCAG 2.1.1; axe scrollable-region-focusable). Whether an `overflow: auto` box scrolls is only knowable after layout, so the element and its direct children are watched with the shared ResizeObserver and the attribute is written from the observer callback — no state, no extra render. Both axes count, per axis and independently, so an inline overflow (RTL included) is treated the same as a block one — and an axis that clips its overflow never earns a stop, the way the axe rule itself reads scrollability. Reading layout is client-only work, so adopting this makes the consuming component client-only: free for one that already carries `use client`, a real cost for one that does not.',
    bestPractices: [
      { guidance: true, description: 'Pass `enabled` so the hook only runs for the case that scrolls — a fixed height plus `overflow: auto` or `scroll`. A height alone is not enough: a box that clips its overflow can never be scrolled, and the hook will correctly refuse it a tab stop.' },
      { guidance: true, description: 'Check whether the component already carries `use client` before adopting. `LayoutContent` with `isScrollable` (its default) is the closest fit today; a server-safe component pays a client boundary for it.' },
      { guidance: true, description: 'Give the element an accessible name (`aria-label`, or `aria-labelledby` pointing at its heading) when the content does not already say what the region is.' },
      { guidance: false, description: 'Add `tabindex` to the same element yourself; a tabindex the hook did not write is left alone and the two will disagree.' },
      { guidance: false, description: 'Reach for it to render something from the overflow state; it deliberately holds no state. Use useScrollOverflow when the answer has to reach the DOM through React.' },
    ],
  },
  relatedComponents: ['LayoutContent'],
  relatedHooks: ['useScrollOverflow', 'useOverflow'],
  importPath: '@astryxdesign/core/hooks',
  category: 'accessibility',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    'Keeps tabindex="0" on a scroll container exactly while it overflows, so keyboard users can reach + scroll it (WCAG 2.1.1; axe scrollable-region-focusable). Element + direct children watched w/ shared ResizeObserver; attribute written from observer callback — no state, no extra render. Both axes count (incl. RTL inline overflow). Reads layout, so adopting it makes the consuming component client-only.',
  returnDescriptions: {
    ref: 'ref callback for the scrolling element.',
  },
  usage: {
    description:
      'Keeps tabindex="0" on scroll container exactly while it overflows (WCAG 2.1.1; axe scrollable-region-focusable). Shared ResizeObserver on element + direct children; attribute written imperatively — no state, no extra render. Both axes, incl. RTL.',
    bestPractices: [
      { guidance: true, description: 'Pass `enabled` so hook only runs for the case that scrolls — fixed height PLUS overflow auto/scroll. Height alone is not enough; a clipping box can never scroll and gets no tab stop.' },
      { guidance: true, description: 'Check the component already carries `use client` before adopting. LayoutContent w/ isScrollable (default) is closest fit today; a server-safe component pays a client boundary.' },
      { guidance: true, description: 'Give element an accessible name (aria-label / aria-labelledby → its heading) when content does not say what region is.' },
      { guidance: false, description: 'Set tabindex on same element yourself; a tabindex the hook did not write is left alone + the two disagree.' },
      { guidance: false, description: 'Use it to render from overflow state; holds no state by design. Use useScrollOverflow when answer must reach DOM through React.' },
    ],
  },
};
