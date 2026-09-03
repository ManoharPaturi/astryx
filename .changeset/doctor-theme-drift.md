---
'@astryxdesign/cli': patch
---

[fix] `doctor` evaluates and reports every theming finding in the package that owns it, instead of reusing the root's or the first package's state.

Two symptoms, one cause. Built-theme staleness read its "is the build wired into dev/build?" answer from the FIRST stale artifact and applied it to every other, so a monorepo whose first theme happened to sit in a wired app reported `info` for the whole tree — hiding a sibling that rebuilds nothing, which is the only case that actually renders the wrong theme. And the StyleX-compiler check read only `<root>/package.json`, so an app that declared its own compiler was reported broken, and an app with none would have been cleared by a sibling that had one.

Wiring is now resolved per owning package and aggregated so that any unwired stale artifact fails, with the self-healing ones reported alongside as context rather than as failures. The compiler lookup starts at the package that owns the swizzled component and walks up to the scan root, because a workspace dependency does hoist — and the failure names the packages that need the plugin, so the fix lands in the right `package.json`.

A bounded scan that hit its bound also stopped reporting success. `doctor` walks at most 10 built themes and 400 stylesheets; both caps were silent, so an unwired stale 11th theme and a private-var write in stylesheet 401 each came back as a clean PASS. Both now say what was actually covered and how to cover the rest. Same principle for the StyleX compiler: a plugin in `devDependencies` that no build config references compiles nothing, so a bare declaration is now reported as unverified rather than as a working setup.

Two more places where the check looked in the wrong place or believed the wrong evidence. `doctor` skipped `dist/`, `build/` and `out/` when hunting for BUILT themes — but the CLI's own documented example is `theme build ./src/themes/ocean.ts --out ./dist/ocean.css`, so a stale theme exactly where the tool puts it reported "no built theme output found". The built-theme scan now skips only dependencies and tool metadata; the CSS-escape and swizzle scans, which look for hand-written source, still skip build output. And "the compiler is wired" was a substring match, so a commented-out `// stylex()` counted — as did the same plugin named in prose. Comments are blanked before the search and a match must look like a specifier or a call. The agent block's styling detection used dependency presence alone and had the same flaw, so a project with an unwired plugin was told to write `xstyle`; it now requires real wiring too.

@josephfarina
