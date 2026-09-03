---
'@astryxdesign/core': minor
---

[feat] `Collapsible` and `CollapsibleGroup` accept `chevronPlacement`, moving the disclosure chevron to the start of the trigger. The default stays `'end'`, the trailing indicator, and nothing about it changes. `'start'` puts the arrow ahead of the label, which is the tree and file-browser convention and what you want when the labels form a scannable column the arrows sit in front of — previously the only components with a leading arrow were `TreeList` and the Table row-expansion column, so a card or accordion header had no way to match them.

The side changes the glyph, not just the order. A trailing chevron points down and flips up; a leading one points into the row and turns down, so `'start'` swaps `chevronDown` for `chevronRight` and rotates a quarter turn instead of a half. That matches `TreeList`, including its RTL mirroring, so a closed arrow points towards the content in both directions.

Set it on the group when there is one: arrows that change sides row to row read as a bug, so `CollapsibleGroup` carries it through the same presentation context as `hasDividers` and `density`. An individual `Collapsible` still wins over the group, and a collapsible nested inside an item's body keeps its own default rather than inheriting the group's.

A leading chevron also makes the label fill the rest of the row. The trigger is `space-between`, which separates the label and a trailing arrow on its own; with the arrow leading there is no third child to absorb the free space, so an unfilled label would be thrown to the opposite edge with a gap behind the arrow. Filling it also gives a trigger that spreads its own contents — `hAlign="between"` and the like — the whole row to spread across.

@ernestt
