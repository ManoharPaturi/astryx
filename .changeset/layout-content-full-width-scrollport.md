---
'@astryxdesign/core': patch
---

[fix] Layout: let regions opt into the shared middle scrollport with `isScrollable={false}`.

`LayoutContent` and `LayoutPanel` remain independently scrollable by default. In a fill-height `Layout`, top-level `LayoutContent` and `LayoutPanel` region roots with `isScrollable={false}` now move together in a keyboard-focusable middle scrollport while independently scrollable siblings remain pinned. The full start + content + end composition stays inside `contentWidth`; for arithmetic widths the middle scrollbar can extend through the surrounding Layout gutters.

@kentonquatman
