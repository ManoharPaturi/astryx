---
'@astryxdesign/core': patch
---

[feat] `useScrollableTabStop`: make a scroll container reachable by keyboard, but only while it actually scrolls

A container with a fixed height and `overflow: auto` scrolls, and if nothing inside it is focusable, no keyboard user can reach it — Tab never stops there and everything below the fold is pointer-only. WCAG 2.1.1, the failure axe reports as `scrollable-region-focusable`. Several landed components have it: `CodeBlock`, `LayoutContent`, `LayoutPanel`, `ChatPastedTextToken`, `Stack`, `AppShell` and `Card`.

The tab stop this adds is conditional, not unconditional: `tabindex="0"` is present only while the element can really be scrolled — the content overflows an axis AND that axis is `auto` or `scroll`, which is how axe's own rule reads it. A box whose content fits is not a scroll container, and neither is one that clips its overflow; a tab stop on either is a stop the arrow keys do not answer. Overflow is only knowable after layout and keeps changing, so it is measured from the shared `ResizeObserver` and the attribute is written imperatively from the callback — no state, no second render pass. The element and its direct children are observed, because a fixed-height container does not resize when its content grows but the child holding that content does; a `childList`-only `MutationObserver` covers the change that moves no existing box.

Reading layout is client-only work, so adopting the hook makes the consuming component client-only. No component consumes it in this release.

`observeResize` now fans out to every callback registered on an element instead of only the last one to register, so two features can watch the same node. `unobserveResize` takes the callback to remove, and every caller in core passes it: the one-argument form still clears every callback on the element, which would have let one feature's cleanup silently cancel another's.

@cixzhang
