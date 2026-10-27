---
'@astryxdesign/core': patch
---

[fix] Split Markdown URL sanitization into a navigation contract for link hrefs, which keeps blocking `javascript:`, `vbscript:`, and `data:text/html` exactly as before, and a stricter resource contract for image sources, which now rejects every `data:` URL, closing the gap where non-HTML data URIs like SVG with embedded scripts reached parser AST image nodes despite the documented contract naming `data:` as rejected. (#6323)
