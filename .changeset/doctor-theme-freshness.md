---
'@astryxdesign/cli': patch
---

[fix] `doctor` no longer claims a built theme is fresh when it has not established that, and no longer compiles anything to find out.

The freshness check asked one question — is the theme entry newer than the artifact? — and treated "no" as proof. It is not proof. A theme imports its tokens, so editing a token leaves the entry's mtime untouched: `doctor` reported green while `theme build --check` exited 1 on the same tree. And when the entry _was_ newer, the check recompiled to be sure, which means jiti executing the theme and its whole import graph with a filesystem cache — code execution and a write, from a command whose contract is read-only.

`theme build` now records a digest over every local file a theme is compiled from, and `doctor` verifies freshness by reading and hashing those same files. No module is loaded, nothing is written, and a changed import is caught because it is part of the input set. Where that proof is not available — an artifact built by an older CLI, or an input graph that could not be walked completely — the check reports exactly that and points at `theme build --check`, rather than passing. Fail closed: "no evidence" must not render as "fine".

Every input is accounted for, none assumed harmless. A relative import is content-hashed. A bare specifier is resolved and classified: a package is classified by how it RESOLVES, not by its version string: one that really lives under `node_modules` is immutable in place and is fingerprinted `name@version`; one whose symlink escapes `node_modules` is live linked source and is content-hashed. The version cannot make that call — a workspace package carrying a normal `1.2.3` is still live source, and treating it as immutable left the digest unmoved while its tokens changed. Treating bare specifiers as out of scope was wrong and measurably so: a changed workspace token package left the digest identical, so `doctor` reported "in step with source", the same false green this change exists to remove. Anything unresolvable, or a computed `import()` or `require()`, yields no digest rather than one that silently omits an input.

@josephfarina
