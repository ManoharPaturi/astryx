---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-016
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang, imdreamrunner, josephfarina]
affects_architecture:
  [
    architecture:theme-authoring-contract,
    architecture:theme-compilation,
    architecture:theme-application,
  ]
affects_families: []
affects_contributing: []
affects_consumer_docs: [theme-build]
---

# Theme family build

## Intent

Products that ship and load a whole theme family should not repeat the base
rules in every member stylesheet. `astryx theme build <files...> --family`
builds one load-order-independent CSS bundle. It also keeps every member's
JavaScript and TypeScript artifacts complete.

Family mode is an explicit deployment choice. Using any member loads the whole
family bundle. A product that loads only one theme should use the existing
standalone build instead.

## Non-goals

- Changing `defineTheme` precedence, merge rules, or flattened standalone semantics.
- Changing ordinary single-file or multi-file batch builds.
- Adding another command, authoring field, helper, or portable token vocabulary.
- Producing per-member delta stylesheets that consumers load in a particular order.
- Serializing every JavaScript expression that `defineTheme` accepts at runtime.
- Choosing a fixed maximum family size for every product.

## Requirements

- **FR1 — Use one existing command mode.** `--family` is a boolean flag on
  `theme build`. The existing variadic `files` argument must supply exactly one
  base and at least one theme that directly `extends` that base. Every child
  source must express `extends` as a top-level imported identifier whose module
  resolves to the exact supplied base source file. A matching theme name,
  argument order, or filename does not prove membership. Ordinary builds remain
  the default.

- **FR2 — Use one compiler.** Standalone and family builds use the same shared
  Core compiler for CSS and resolved behavior. The CLI may partition and package
  the result. It must not reimplement theme-to-CSS transformations.

- **FR3 — Emit one CSS load unit.** A family build emits exactly one CSS bundle. Shared declarations appear once. Member-specific scoped overrides
  follow in the same artifact. Every member's generated usage comment and
  receipt points to that bundle. Consumers never load a separate base
  stylesheet. Stylesheet order cannot change a resolved theme.

- **FR4 — Expose and bound the cost.** A consumer of any family member loads the
  complete family bundle, including every member's overrides. Both JSON and text
  receipts report member count, bundle bytes, the sum of equivalent standalone
  CSS bytes, savings bytes, and savings percentage.

  Each additional member may add only its member-specific rules and
  selector/header overhead, never another copy of the base declarations. The
  family bundle must not exceed the standalone sum. Equality with the standalone
  sum is valid and emits a zero-savings notice; only a larger family bundle is
  rejected. Fixtures cover families with 2, 5, and 14 total themes. Products that do not want the all-member load cost use standalone
  builds.

- **FR5 — Keep member artifacts complete.** Each member emits its own complete
  JavaScript and TypeScript artifacts: token map, component overrides, on-media
  surfaces, lineage, registry references, and custom-value declarations. The
  artifacts are usable without reading the CSS source, and all name the shared
  bundle.

- **FR6 — Use an exact family registry grammar.** Family mode parses registry
  source before loading or writing.

  | Field        | Accepted form                                                                |
  | ------------ | ---------------------------------------------------------------------------- |
  | `icons`      | One top-level identifier bound directly by a named or default import.        |
  | `indicators` | The same imported whole-registry form, or an inline object literal as below. |

  Family mode rejects inline icon maps, local definitions, spreads, computed
  keys, calls, JSX, and other icon expressions. Inline indicator keys must be
  unique, non-computed identifier names or quoted string literals. Each key must
  match a current indicator registry name; numeric keys, shorthand properties,
  methods, unknown names, and duplicate keys are rejected. Every value must be a
  top-level imported component identifier; spreads, local definitions, computed
  keys, and other expressions are rejected.

  Imports may be aliased. The parser retains imported name, local name, and
  module specifier, and it ignores comments. It does not infer registry syntax
  with regular expressions. These restrictions apply only to family builds. A
  valid runtime theme outside this serializable subset may still use standalone
  build behavior.

- **FR7 — Preserve registries through inheritance.** Generated member JavaScript
  preserves every supported icon and indicator binding. A child that overrides
  one static indicator key retains all other base keys and wins for that key.
  Generated imports are collision-safe when files reuse local aliases.
  Unsupported or unresolved shapes fail before any output is staged.

- **FR8 — Make output canonical.** The same family produces byte-identical files
  regardless of CLI argument order. Canonical order is the base first, then
  members sorted by normalized invocation path. Bundle scopes, receipts,
  generated commands, imports, and output manifests all derive from that order.
  They contain no volatile timestamp.

- **FR9 — Treat the family as one transaction.** The default bundle path is
  `<base-source-directory>/<base-theme-name>.family.css`. The durable ownership
  manifest is `<base-source-directory>/<base-theme-name>.family.json`. Family
  mode never overwrites the base's standalone `<base-theme-name>.css`.

  The generated manifest contains a schema version, base `{name, source}`, child
  `members: Array<{name, source}>`, total `count`, `bundle`, and `ownedFiles`.
  Every path is normalized, POSIX-style, and relative to `cwd`. `members`
  excludes the base and uses canonical order. `count` is `1 + members.length`.
  The manifest is keyed by the exact base source/name identity and records the
  previously owned family outputs.

  Before writing, the build validates names, lineage, registry grammar, paths,
  output ownership, and the complete artifact plan. It stages and promotes the
  bundle, manifest, and every member artifact as one transaction. Any staging,
  promotion, or cleanup failure restores the complete previous family.

  An obsolete file is removable only when all three conditions hold:

  1. The prior generated manifest has the same base identity.
  2. That manifest lists the path in `ownedFiles`.
  3. The file has an Astryx generated header consistent with the manifest.

  This permits cleanup of a deleted former member without treating arbitrary
  nearby files as owned. Unowned files are never deleted.

- **FR10 — Check the same artifact shape.** `--family --check` writes nothing.
  It verifies the exact family bundle, manifest, all member artifacts, and
  prior-manifest-owned obsolete files. It returns `theme.build.family.check`
  with `{base, members, count, upToDate, stale, checked}`. `base`, `members`, and
  `count` use the manifest semantics above.

  `checked` is every expected cwd-relative POSIX output path in canonical order.
  Every `stale` item is `{path, reason}`. Its path is cwd-relative and POSIX,
  and `reason` is exactly `missing`, `outdated`, or `obsolete`. The result is
  stale if any expected file is missing or outdated, or if any owned obsolete
  file remains. CI must pass the same family flag and file set used by the build.

- **FR11 — Lineage stays scalar but does not prove family identity.**
  `defineTheme({extends: base})` may record the base name as internal scalar
  lineage metadata. It does not retain another theme object or weaken the
  flattened, self-contained `DefinedTheme` used by other consumers. Distinct
  themes may share a name, so family validation uses FR1's resolved source
  import, not this name, to prove the exact supplied base relationship.

- **FR12 — Keep the CLI surface closed and machine-first.** The implementation
  updates the `theme build` `CommandDoc`, generated help/manifest/README, API
  response types, and stable error-code table. It asks no questions, writes one
  JSON envelope, renders human text only as a projection of that data, and uses
  the same exit code in both output modes.

### Flag composition matrix

| Pair                             | Contract                                                                                                                                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--family` + `--check`           | Compose. Check verifies family-shaped output and returns `theme.build.family.check`.                                                                                                           |
| `--family` + `--icons-specifier` | Compose. The override replaces the module specifier for each supported imported whole-icon registry while preserving its binding.                                                              |
| `--family` + `--watch`           | Refuse before theme loading or writes, with a registered stable code and a message naming both flags.                                                                                          |
| `--family` + `--out`             | Cannot co-occur. Family mode needs multiple files; the existing `--out` contract names one output for one theme. The refusal names both flags and suggests the default family bundle location. |
| `--family` + global `--json`     | Compose. Build returns one `theme.build.family` envelope; check returns one `theme.build.family.check` envelope.                                                                               |

The build result is exactly:

```ts
{
  type: 'theme.build.family',
  data: {
    base: {name: string, source: string},
    members: Array<{name: string, source: string}>,
    count: number,
    bundle: string,
    manifest: string,
    bundleBytes: number,
    standaloneBytes: number,
    savingsBytes: number,
    savingsPercent: number,
    outputs: Array<{
      source: string,
      name: string,
      js: string,
      dts: string,
      variantsDts?: string,
    }>,
    warnings: string[],
    notices: string[],
  },
}
```

Family files, members, and outputs use canonical order. `base.source`, every
`members[].source`, `bundle`, `manifest`, and every output path are normalized
cwd-relative POSIX paths. `members` excludes the base. `count` is the total
number of themes. `outputs` includes the base first and every child after it.
The text formatter projects the same fields.

| Failure                                                      | Error code           |
| ------------------------------------------------------------ | -------------------- |
| Flag, member, lineage, registry, or negative-savings failure | `ERR_THEME_INVALID`  |
| Missing input                                                | `ERR_FILE_NOT_FOUND` |
| Path escape                                                  | `ERR_PATH_TRAVERSAL` |
| Unavailable Core                                             | `ERR_CORE_NOT_FOUND` |
| Staging, promotion, cleanup, or rollback failure             | `ERR_WRITE_FAILED`   |

These error codes are append-only. Every error supplies an actionable suggestion
when one exists. Callers never branch on error prose.

### Platform support

- Family output inherits the current full/reduced/no-promise browser contract in
  [`AST-013`](../AST-013/spec.md). It creates no separate browser floor.
- Every browser in AST-013's full tier receives the complete family behavior.
  Browsers in its reduced tier receive the documented theme/platform fallback
  while preserving the primary task, accessibility, stable state, and callbacks.
  The family builder must not introduce a new broken or silent degradation path.
- Structural parity is proven in compiler and CLI fixtures. Rendered parity uses
  the existing probe theme in every browser required for the affected behavior.

## Current-state impact

Current `theme build` emits a complete stylesheet for every theme. A family of
14 themes can therefore repeat the same base declarations 14 times. Current
multi-file `--out` is already refused, `--watch` is long-running, and `--check`
verifies the ordinary output shape.

A reproducible pre-implementation model using the exact #5687 compiler measured
the proposed one-bundle load unit against equivalent standalone CSS:

| Total themes | Standalone CSS | Modeled family bundle | Savings |
| -----------: | -------------: | --------------------: | ------: |
|            2 |       32,112 B |              31,046 B |    3.3% |
|            5 |       80,126 B |              41,832 B |   47.8% |
|           14 |      224,354 B |              72,202 B |   67.8% |

After the base, growth stabilized at 3.3–3.5 KiB per changed member. A zero-delta
member added 123 functional bytes and no child CSS artifact. Because the model
removes only duplicate generated headers when joining the exact base-plus-delta
output, it is an upper-bound approximation of the proposed single-file
packaging, not evidence that the final compiler already exists. These results
support a measured byte gate rather than an arbitrary member-count cap.

The family implementation must change its earlier base-plus-delta prototype to
one shared bundle, preserve per-member modules, add family response types and
receipts, replace regex registry scraping with the grammar above, and close the
full flag matrix. No package runtime or ordinary build behavior changes until a
caller opts into `--family`.

## Verification

| Contract     | Required evidence                                                                         | Failure signal                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| FR1–FR3, FR5 | Core family compiler plus CLI/API fixtures, including two same-name candidate bases       | Wrong exact base, repeated shared declarations, load-order dependence, or incomplete member module      |
| FR4          | Byte measurements for 2/5/14 members and receipt assertions                               | Bundle exceeds standalone sum, hides all-member cost, or repeats the base per member                    |
| FR6–FR7      | Parser fixtures for every accepted and rejected icon/indicator form                       | A supported binding is lost, an unsupported expression writes output, or alias collisions break imports |
| FR8          | Shuffled-path and reproducible-header fixtures                                            | Any generated byte or receipt order changes with argument order                                         |
| FR9–FR10     | Validation, staging, promotion-failure, rollback, obsolete-file, and `--check` fixtures   | Partial family remains, prior output is lost, or stale/obsolete output passes                           |
| FR11         | `defineTheme` lineage and built-base extension tests                                      | A theme object is retained or a built member loses self-containment                                     |
| FR12         | CommandDoc generation, JSON/text projection, error-code, exit-parity, and flag-pair tests | Undocumented flag, multiple JSON writes, prose-only data, unstable code, or output-mode-dependent exit  |

## Decision log

### DEC-1 — One bundle with complete per-member modules

**Reference:** `spec:AST-016/DEC-1`
**Status:** proposed for owner ratification

A family is one CSS delivery unit. Shared declarations and member overrides ship
in one bundle. Each member keeps a complete JavaScript/TypeScript artifact that
points to it. The previous base-plus-member-delta stylesheet model is rejected
because it exposes load order and requires consumers to coordinate files.

### DEC-2 — Family mode follows the existing CLI flag contract

**Reference:** `spec:AST-016/DEC-2`
**Status:** proposed for owner ratification

`--family` redirects work already owned by `theme build`; it is not a new command
or second job. Its default is off, every flag pair is decided above, machine
output is one typed envelope, and every failure carries a stable code.

### DEC-3 — No fixed family-size cap

**Reference:** `spec:AST-016/DEC-3`
**Status:** proposed for owner ratification

Family size is a product deployment decision. The builder exposes total and
comparative byte cost and enforces no-regression against equivalent standalone
CSS. Products loading only one member use standalone mode instead of imposing
an arbitrary global member limit.

## Open questions

- **OQ1 — Owner ratification.** Should DEC-1 through DEC-3 become the accepted
  family-build contract? (`human-api`; owners: `cixzhang`, `imdreamrunner`,
  `josephfarina`)
