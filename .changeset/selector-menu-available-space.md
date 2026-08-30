---
'@astryxdesign/core': patch
---

[fix] usePopover now carries the block-size clamp through its painted surface so composed popovers cannot overflow the constrained positioning layer. Selectors and menus adopt that behavior: long option lists choose the roomier side, stay inside the viewport, and scroll within the available space; short lists keep their natural height.

@cixzhang
