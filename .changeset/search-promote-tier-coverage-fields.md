---
'@astryxdesign/cli': patch
---

[fix] Restore `pnpm build`: the exact-keyword promote tier in `scoreQuery` returned a hit without the `matched`/`total` fields its own signature declares, so `sync:api-types` failed to compile on main.

@josephfarina
