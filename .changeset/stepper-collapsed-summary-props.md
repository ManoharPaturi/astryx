---
'@astryxdesign/core': patch
---

[feat] Stepper takes `hasCollapsedControls` and `hasCollapsedLabel`, so a flow that brings its own Back/Continue or heads its own step can drop the half of the collapsed summary row it would otherwise show twice on a phone. Both default to `true`, so a stepper that sets neither collapses exactly as it did before, and turning both off leaves the bare track with no row beneath it. Only visible copy goes either way — every step keeps its name in the accessible sequence at any width, so neither prop can shorten what a screen reader hears. Dropping the controls in the `separated` layout does leave a collapsed stepper with nothing to press, since its step targets go with its labels; `on-track` keeps its indicators pressable as nodes on the rail.

@ernestt
