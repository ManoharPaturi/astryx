---
'@astryxdesign/core': minor
---

[breaking] Remove the non-visual PowerSearch wrapper's `astryx-power-search` theme target.

@cixzhang

Themes that target `power-search` should migrate those styles to the existing Tokenizer `tokenizer` target. PowerSearch does not publish a replacement root target until touch-surface ownership is defined.
