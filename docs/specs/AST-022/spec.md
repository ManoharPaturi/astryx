---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-022
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [rubyycheung]
affects_architecture:
  [architecture:theme-authoring-contract, architecture:theme-compilation]
affects_families: []
affects_contributing: []
affects_consumer_docs: [theme]
---

# Theme ownership, inheritance, and materialization system spec

## Intent

Theme authors need to know whether a theme follows another theme or merely uses
it as a starting point. `defineTheme({extends})` intentionally keeps a source
dependency on a resolved base theme. That is useful when an author wants fixes,
new component coverage, and other updates from the base, but it can also change
the child theme when the dependency is upgraded.

Astryx should therefore support two explicit workflows:

- **Follow:** retain `extends` and continue adopting changes from the base theme.
- **Own:** resolve the current authoring inputs into reviewable local source that
  no longer depends on the selected base theme or on mutable generation formulas.

Materialization is the shared technical operation behind taking an owned snapshot.
It resolves inherited and generated theme-authoring values, previews the exact
change, and writes an equivalent local theme only after the author confirms.

## Non-goals

- Change the current meaning or precedence of `defineTheme({extends})`.
- Remove `extends`, typography, motion, radius, or color configuration in this
  specification pull request.
- Define tonal palette generation, accepted palette validation, semantic color
  recommendations, or contextual contrast analysis.
- Define how authors create new typography, spacing, motion, or radius values
  beyond Astryx's built-in scales. Theme-local scale extension is owned by the
  separate AST-023 proposal.
- Promise that a snapshot freezes component implementations across Astryx package
  upgrades. It freezes theme-authoring inputs, not the library code that consumes
  them.
- Serialize arbitrary executable React nodes or functions as if they were plain
  data.
- Update, overwrite, or detach a theme without an author-visible preview and an
  explicit write decision.

## Terms

- **Following theme:** source with an `extends` relationship. Re-resolving it may
  adopt changes from the selected base theme.
- **Owned snapshot:** local theme source whose configurable values do not require
  the selected base theme or mutable scale-generation behavior to reproduce.
- **Materialize:** resolve inherited and generated authoring inputs into explicit,
  reviewable local source.
- **Detach:** materialize a following theme and remove its `extends` relationship.
- **Freeze:** materialize selected generated scales while retaining any intended
  inheritance relationship.
- **Unresolved executable value:** an inherited icon, indicator, syntax definition,
  or other value that tooling cannot safely express as generated source.

## Ownership

| Owner                      | Contract                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| AST-022                    | Follow-versus-own choice, materialization behavior, preview, writes, and equivalence evidence. |
| Theme author               | The selected lifecycle, committed output, retained dependencies, and accepted visual changes.  |
| `defineTheme` architecture | Current normalization, precedence, inheritance, and supported authoring surfaces.              |
| CLI authoring surface      | Discovery, preview, source generation, receipts, safe writes, and actionable failures.         |
| Palette specifications     | Palette generation, accepted palette ownership, and exact palette-reference behavior.          |

## Requirements

### Explicit lifecycle choice

- **FR1 — Following and owning are different promises.** Tooling that starts a
  theme from an existing theme MUST ask whether the author wants to follow that
  base or use it only as a starting point. It MUST NOT describe `extends` as a
  fully independent copy.
- **FR2 — Following preserves current `extends` semantics.** A following theme
  retains its base dependency and may adopt the base's resolved token, component,
  media-surface, icon, indicator, syntax, and local-token changes after an
  intentional dependency update. The resulting `DefinedTheme` remains flattened
  for consumption, but flattening at runtime or build time MUST NOT be presented as
  source independence.
- **FR3 — An owned start writes local source.** Choosing a base only as a starting
  point MUST create reviewable source owned by the new theme. Subsequent changes to
  the selected base MUST NOT alter that source unless the author explicitly runs an
  update or comparison workflow.

### Materialization boundary

- **FR4 — Materialization covers configurable theme surfaces.** The operation MUST
  account for inherited values and for values generated by current typography,
  motion, radius, and color configuration. It MUST preserve explicit-token and
  explicit-component precedence. It MUST also inventory local tokens, `onDark`,
  `onLight`, syntax, icons, and indicators rather than silently dropping them.
- **FR5 — Materialization produces authoring source, not only compiled output.** A
  CSS or JavaScript build artifact alone is insufficient because it does not give
  the author an editable theme definition. Output MUST be suitable for committing,
  reviewing, and rebuilding with the supported theme toolchain.
- **FR6 — Theme ownership has an honest boundary.** Materialization freezes the
  theme values expressible through the current public authoring contract. It MUST
  state the Astryx version used and MUST NOT claim to freeze internal component
  markup, default styles outside the theme contract, browser rendering, or future
  package behavior.
- **FR7 — Theme-owned palette references remain owned.** A reference to an exact
  value in the same theme's committed palette file MAY remain a reference; it does
  not need to be replaced with a copied hex value. A reference to another package's
  mutable palette or theme MUST remain visible as an external dependency or be
  resolved according to the author's selected ownership mode.

### Executable values and failure behavior

- **FR8 — Executable values require source-preserving handling.** When an inherited
  icon, indicator, syntax definition, or other value has a stable public export,
  generated source MAY preserve it through an explicit import. When tooling cannot
  reconstruct a supported source reference, the operation MUST report the exact
  field and stop before writing. It MUST NOT stringify, omit, or replace executable
  values with placeholders.
- **FR9 — Writes are atomic and opt-in.** Preview is the default. Writing requires
  an explicit author action, uses a temporary destination, validates the complete
  result, and replaces target files only after success. Existing modified output
  MUST NOT be overwritten without explicit confirmation.
- **FR10 — Partial ownership is explicit.** An author MAY choose to freeze only
  selected generated scales while continuing to follow a base. The preview and
  receipt MUST identify every retained dependency. A partial operation MUST NOT be
  labeled detached or fully owned.

### Equivalence and review

- **FR11 — Before and after resolve equivalently.** A successful full
  materialization MUST compare the original and proposed themes under the same
  Astryx version. Tokens, component overrides, media-surface overrides, local-token
  declarations, and registry selections MUST match. A difference blocks the write
  unless the author explicitly chooses a separate migration that records the
  intended change.
- **FR12 — The preview explains consequences.** Before writing, tooling MUST show
  the removed base or generator dependencies, files to be created or changed,
  unresolved executable values, retained dependencies, and an exact semantic
  summary. Visual comparison MAY supplement this evidence but MUST NOT replace the
  structural comparison.
- **FR13 — Every write has a receipt.** The receipt MUST include the tool and
  Astryx versions, source theme identity, selected operation and surfaces, input and
  output digests, retained dependencies, generated file paths, and verification
  result. It MUST NOT be required at runtime.
- **FR14 — Repeated output is stable.** With the same source, versions, options,
  and environment-independent inputs, materialization MUST produce byte-identical
  generated files and receipts except for an explicitly excluded invocation time.

### Compatibility and migration

- **FR15 — Existing convenience APIs remain stable until migration exists.** The
  implementation behind an existing `defineTheme` typography, motion, radius, or
  color configuration MUST NOT silently adopt incompatible generation behavior.
  Versioning, deprecation, or replacement requires a supported comparison and
  materialization path first.
- **FR16 — Legacy color migration is explicit.** Migrating
  `defineTheme({color})` to an author-owned tonal palette MUST use the current
  supported palette generator, produce a reviewable palette and token mapping, and
  present the resulting visual and structural delta. It MUST NOT swap the legacy
  HCT implementation for a new recipe underneath unchanged source.
- **FR17 — Lifecycle commands use plain language.** The CLI MAY expose distinct
  `detach` and `freeze` commands or another reviewed vocabulary. Help and prompts
  MUST explain the outcome in terms of following updates versus owning a snapshot;
  the internal term `materialize` alone is insufficient user guidance.
- **FR18 — No current palette work is blocked.** AST-022 governs later lifecycle
  tooling. It MUST NOT delay accepted-palette, palette-generation, validation, or
  theme-adoption work that preserves the current `defineTheme` boundary.

## Proposed author flow

### Start a theme

```text
Choose Neutral as a base
            |
            +-- Follow Neutral
            |      Keep extends; receive reviewed Neutral changes on upgrade
            |
            +-- Use as a starting point
                   Generate owned local source; no Neutral theme dependency
```

### Change an existing theme

```text
Inspect dependencies
        |
        +-- Detach from a base
        |      Resolve inheritance and remove extends
        |
        +-- Freeze generated values
               Replace selected scale config with explicit local values

Preview -> verify equivalence -> author confirms -> atomic write -> receipt
```

The exact command names remain an implementation decision. A possible split is
`astryx theme detach` for inheritance and `astryx theme freeze` for generated
scales, both backed by the same materialization engine.

## Current-state impact

Today, `defineTheme({extends})` correctly flattens a base into the resolved
`DefinedTheme`, which lets runtime and static builds consume one self-contained
result. Source authors nevertheless retain a dependency on the imported base.
Updating that package and rebuilding may therefore change inherited theme values.

Typography, motion, radius, and legacy color helpers also generate values during
normalization. Their concise intent is useful and remains supported, but changing a
formula under unchanged source can change output. This spec introduces no such
change. It defines the future escape hatch that lets an author keep the concise
configuration or freeze its current result deliberately.

The CLI has theme templates and build output, but it does not currently provide a
general operation that removes `extends`, expands every supported generated scale,
preserves source-level registry references, and verifies equivalent authoring
source. That implementation follows this proposed contract. Creating new values
beyond built-in scales is related authoring work but is specified independently by
AST-023.

## Verification

| Contract  | Verification                                                                                                 | Representative failure                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR3   | CLI prompt and source-output fixtures for follow and owned-start choices                                     | A copied theme still imports its selected base, or a following theme is described as independent.                                 |
| FR4–FR7   | Full-surface fixtures covering generators, inheritance, local tokens, media surfaces, and palette references | A supported surface disappears, precedence changes, or a theme-owned palette reference is needlessly severed.                     |
| FR8–FR10  | Executable-registry, overwrite, partial-freeze, and injected-failure tests                                   | An icon is stringified, a target is partly overwritten, or retained inheritance is hidden.                                        |
| FR11–FR14 | Normalized-theme equivalence, deterministic snapshots, receipt schema, and preview tests                     | Before and after differ silently, output changes across identical runs, or a receipt omits a dependency.                          |
| FR15–FR18 | Compatibility fixtures and legacy-color migration comparison                                                 | An unchanged convenience config renders differently, migration hides a color delta, or lifecycle work blocks palette foundations. |

### Completion criteria

This spec moves from `proposed` to `shipped` only when:

- theme creation offers an explicit follow-versus-owned-start choice;
- the supported detach/freeze surface is documented with non-destructive defaults;
- full and partial materialization account for every current `DefineThemeInput`
  surface;
- unrepresentable executable values fail before writes with actionable guidance;
- before/after structural equivalence is tested under one pinned Astryx version;
- generated source and receipts are deterministic;
- legacy color migration uses the supported palette generator without silently
  changing existing `defineTheme({color})` behavior; and
- consumer guidance clearly distinguishes theme-source ownership from freezing the
  Astryx component library itself.

## Open questions

- Should new theme creation recommend an owned snapshot by default, or should the
  default vary between application themes, reusable theme packages, and local
  variants of another owned theme?
- Should the CLI expose one ownership-oriented command or separate `detach` and
  `freeze` commands backed by the same materialization engine?
- Does detaching replace the original theme source, create a sibling owned theme,
  or require the author to choose? Which default is least likely to disrupt an
  existing import graph?
- Which inherited icon, indicator, and syntax exports are stable enough for the
  CLI to preserve as source imports, and what guided fallback should exist for
  project-local executable values?
- Should an owned-start template materialize every resolved token or only values
  that differ from Core defaults? The former is more independent; the latter is
  smaller but continues to follow Core default changes.
- What source format best keeps large materialized component maps understandable
  and reviewable without weakening equivalence?
- What constitutes equivalence for values that are textually different but compute
  the same today, such as a palette reference versus a copied hex value or a
  `calc()` expression versus its current result?
- Should a theme-owned palette reference be preserved by default during detach, or
  should the author choose between retaining the reference and copying its current
  value?
- How should a later Astryx upgrade report the difference between the owned snapshot
  and the latest base without turning ownership back into an implicit dependency?
- At what release boundary can `defineTheme({color})` be marked deprecated, and
  what migration evidence must exist before that warning appears?

## Decision log

### DEC-1 — Make follow versus own an explicit author choice

**Reference:** `spec:AST-022/DEC-1`
**Decider:** pending

Inheritance is useful when authors want ongoing base-theme improvements. A copied
starting point is useful when visual stability and local control matter more. The
tooling must present both honestly rather than treating one as universally better.

### DEC-2 — Use one materialization engine for inheritance and generated scales

**Reference:** `spec:AST-022/DEC-2`
**Decider:** pending

Base-theme detachment and scale freezing both convert resolved authoring behavior
into explicit source. One engine provides consistent preview, equivalence, write,
and receipt guarantees even if the CLI uses different user-facing verbs.

### DEC-3 — Preserve existing generator behavior until migration is reviewable

**Reference:** `spec:AST-022/DEC-3`
**Decider:** pending

Replacing a formula behind unchanged theme source is a visual compatibility break.
Existing helpers remain stable until authors can compare, materialize, and accept a
replacement explicitly.
