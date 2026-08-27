---
'@astryxdesign/core': patch
---

[fix] Make text-only Bottom Sheets keyboard-scrollable with `useScrollableTabStop`

`useScrollableTabStop` gives a scroll container `tabindex="0"` only while it actually scrolls and has no visible control already in the sequential focus order. It follows content, focusability, and `overflow` mode changes, and coalesces a resize delivery to one measurement.

BottomSheet now uses the hook on its scrolling body. A text-only sheet can be reached and scrolled with the keyboard, while a sheet with a visible control adds no extra stop.

The shared resize observer now supports independent callbacks on the same element without one cleanup removing another.

@cixzhang
@jiunshinn
