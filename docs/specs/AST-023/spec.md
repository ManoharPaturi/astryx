---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-023
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [rubyycheung]
affects_architecture: [architecture:theme-authoring-contract]
affects_families: []
affects_contributing: []
affects_consumer_docs: [theme, typography]
---

# Theme-local scale extension authoring system spec

## Intent

Theme authors sometimes need values beyond Astryx's built-in scales: any number
of additional display sizes, a large homepage spacing role, a product-specific
radius, or another deliberate extension. Authors can express these today with
`localTokens` and component overrides, but they must already understand the
low-level theme mechanisms, naming rules, use sites, and type-augmentation flow.

Astryx should help authors create these extensions without turning every
project-specific choice into a universal token. The authoring flow starts with the
person's design intent, proposes explicit theme-local values and their use sites,
shows the complete result for review, and saves ordinary theme source. The helper
does not run when the application loads.

## Non-goals

- Add project-specific values to Astryx's universal `TokenName` set.
- Limit typography or another supported extension to a fixed count such as two,
  eleven, or twenty-one values.
- Replace the built-in typography, spacing, motion, or radius contracts.
- Define tonal color generation, palette validation, semantic color mapping, or
  contextual contrast analysis.
- Define theme inheritance, detachment, or scale freezing; those lifecycle concerns
  belong to the separate AST-022 proposal.
- Infer whether visually prominent text is a heading or choose its document-outline
  level without author input.
- Claim that generated spacing, typography, or other values are automatically
  usable, accessible, or appropriate in every component context.

## Terms

- **Built-in scale:** the portable values and names Astryx components share across
  themes.
- **Scale extension:** one or more author-defined values beyond a built-in scale.
- **Theme-local token:** an explicit CSS custom property owned by one theme family
  and excluded from the universal token contract.
- **Use site:** a component variant, semantic role, or local style that consumes an
  extension value.
- **Candidate:** generated source proposed for author review; it is not accepted
  merely because tooling produced it.

## Ownership

| Owner                      | Contract                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| AST-023                    | Intent-led extension authoring, local output, use-site connection, preview, and safe writes.   |
| Theme author               | The number, names, values, purposes, accepted output, and semantic use of every extension.     |
| Current theme architecture | `localTokens`, component overrides, token validation, generated augmentation, and compilation. |
| CLI authoring surface      | Questions, candidate calculations, source generation, preview, diagnostics, and receipts.      |
| Universal token governance | Deciding whether repeated cross-theme needs justify a new portable Astryx token.               |

## Requirements

### Intent and scope

- **FR1 — Author intent precedes mechanism.** Interactive tooling MUST first ask
  what the author needs to add and where it will be used. It MUST explain whether
  the result is a token-only extension, a semantic component variant, or both
  before asking the author to choose low-level `defineTheme` fields.
- **FR2 — Cardinality is author-defined.** A request MAY add one or any finite
  number of values. Tooling MUST NOT encode an arbitrary product limit such as
  exactly two additional display sizes. Names MUST be unique within the target
  theme, and every requested value MUST be represented in the preview and output.
- **FR3 — Initial implementation is focused.** The first supported recipes SHOULD
  cover additional typography roles and spacing values because Astryx has concrete
  examples for both. Motion and radius MAY adopt the same contract later. Tonal
  color families remain governed by their dedicated palette contracts.
- **FR4 — Extension does not imply universal admission.** Generated names and
  values MUST be theme-local by default. Tooling MUST NOT modify Core token types or
  defaults merely because one theme requests another step. Promotion to the
  universal contract requires separate evidence and review.

### Inputs and generation

- **FR5 — Inputs are explicit and complete.** A request MUST identify the theme,
  scale domain, author-selected names or requested count, value strategy, and
  intended output mode. A strategy MAY use explicit CSS values, continue a current
  mathematical progression, or derive candidates from named anchors. Missing
  information that changes output MUST prompt the author or fail with guidance.
- **FR6 — Generated values are candidates.** Formula-derived sizes, line heights,
  or spacing values are suggestions for review. Tooling MUST NOT describe them as
  inherently correct, accessible, or semantically appropriate.
- **FR7 — Existing values remain stable.** Adding extension values MUST NOT rename,
  renumber, or change built-in or existing theme-local values unless the author
  explicitly requests a migration. Continuing a progression computes new values
  from the selected anchor and formula without rewriting earlier stops.
- **FR8 — CSS values remain expressive.** Explicit extensions MAY use supported CSS
  values such as `rem`, `px`, `calc()`, `clamp()`, or references to existing tokens.
  Tooling MUST preserve author-provided valid expressions rather than forcing every
  value through one numeric generator.

### Theme-owned output

- **FR9 — Output is explicit local source.** Accepted extensions MUST be written as
  reviewable theme-local tokens or other existing supported theme constructs. The
  application build MUST NOT rerun the extension generator.
- **FR10 — Local naming follows the owning theme.** Generated custom properties
  MUST satisfy the current theme-local namespace and collision rules. Names SHOULD
  describe intent, such as `spacing-hero`, when the value has one specific role.
  Sequential names such as `display-4` are valid when the author intends a reusable
  continuation of an existing scale.
- **FR11 — Token-only output is an explicit choice.** An author MAY request reusable
  local tokens without assigning them to a component. Tooling MUST label that mode
  clearly. Otherwise, every generated value MUST identify or create at least one
  selected use site; an unexplained list of unused properties is insufficient.
- **FR12 — Use sites use supported theme mechanisms.** Typography roles SHOULD use
  typed `Text` or `Heading` component variants. Component-specific spacing SHOULD
  use component overrides or a documented local style. Tooling MUST NOT invent a
  parallel runtime resolver for extensions.
- **FR13 — Custom component values are typed.** When generated output introduces a
  custom component prop value, the supported theme-build augmentation MUST make it
  available to TypeScript consumers. The preview MUST identify the build step and
  fail when the requested value cannot participate in that flow.

### Semantics and accessibility

- **FR14 — Visual typography does not infer document semantics.** A display role
  controls appearance only. Tooling MUST ask whether an example is a heading and,
  when it is, generate a `Heading` example with an author-selected semantic level.
  It MUST NOT map `display-1`, `hero`, or any other visual name automatically to
  `h1`.
- **FR15 — Examples preserve hierarchy choices.** Documentation and generated
  examples MUST demonstrate that heading level and visual type are independent.
  They MUST NOT recommend skipping heading levels to obtain a larger visual style.
- **FR16 — Spacing roles describe purpose or progression.** A one-purpose value MAY
  use a semantic name such as `spacing-hero`; a reusable scale continuation MAY use
  an ordered name. Tooling SHOULD flag two differently named values with identical
  output for review but MUST NOT merge intentional aliases automatically.

### Preview and writes

- **FR17 — Preview shows the extension in context.** Typography previews MUST show
  the existing and proposed roles together, including names, values, line heights,
  and representative text. Spacing previews MUST show measured gaps alongside the
  existing scale and at least one selected use context when one exists.
- **FR18 — Changes remain reviewable.** A revision preview MUST distinguish existing,
  added, changed, and removed values without separating corresponding comparisons.
  A new-extension preview MAY omit change labels but MUST use the same underlying
  layout so agents and people receive consistent evidence.
- **FR19 — Writes are atomic and opt-in.** Preview is the default. The CLI writes
  only after explicit confirmation, validates the complete source before replacing
  files, and refuses to overwrite unrelated edits without an explicit decision.
- **FR20 — Results are deterministic.** The same normalized request, recipe version,
  and input theme MUST produce byte-identical candidate source and receipt except
  for an explicitly excluded invocation time.
- **FR21 — Receipts describe assistance, not ownership.** A receipt MUST record the
  tool and recipe versions, normalized request, added names and values, selected use
  sites, output digest, and retained manual decisions. The receipt is authoring
  evidence and MUST NOT be required at runtime.

## Representative flows

### Add display roles

```text
Author requests additional display roles (any finite count)
                         |
                         +-- chooses names, or accepts proposed names
                         +-- chooses explicit values or scale continuation
                         +-- identifies heading and non-heading uses
                         v
Preview existing + proposed typography together
                         v
Write theme-local tokens + typed component variants + reviewed examples
```

For example, an author may request two roles today and five later. Neither request
changes Astryx's built-in display-role count for other themes.

### Add homepage spacing

```text
Author requests a larger homepage gap
                  |
                  +-- fixed value, existing-token calculation, or responsive clamp
                  +-- semantic role such as spacing-hero
                  v
Preview against the existing spacing scale and homepage context
                  v
Write one explicit theme-local token and its selected local use site
```

## Current-state impact

Astryx currently provides fixed portable font-size and spacing tokens. A type-scale
configuration changes the values of the existing typography ramp; it does not add
an arbitrary number of new named steps. Authors can already create project-specific
values with `localTokens`, and component overrides can introduce custom Text types
that the theme build exposes through type augmentation.

That capability is flexible but not discoverable. Authors must manually construct
the namespace, calculate values and line heights, wire component targets, run the
build, and understand that visual text type does not determine heading semantics.
This spec adds an authoring contract around those existing primitives rather than
adding another runtime scale system.

## Verification

| Contract  | Verification                                                                   | Representative failure                                                                                               |
| --------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| FR1–FR4   | Intent-routing and cardinality fixtures                                        | The CLI assumes two values, expands Core's universal tokens, or routes a color-family request into this workflow.    |
| FR5–FR8   | Explicit, progression, anchor, and CSS-expression fixtures                     | An omitted choice silently changes output, an existing step changes, or `clamp()` is replaced with a guessed number. |
| FR9–FR13  | Generated-source, namespace, token-only, use-site, and type-augmentation tests | Output requires the generator at runtime, collides with another token, or creates an untyped component value.        |
| FR14–FR16 | Heading-semantic and spacing-naming examples plus lint fixtures                | A display role becomes `h1` automatically, an example skips heading levels, or an intentional alias is deleted.      |
| FR17–FR21 | New/revision preview, atomic-failure, determinism, and receipt tests           | Values cannot be compared, a failed run partly writes, or identical input produces different source.                 |

### Completion criteria

This spec moves from `proposed` to `shipped` only when:

- the CLI supports an author-selected finite number of typography or spacing
  extensions without a fixed cardinality limit;
- explicit values and a documented scale-continuation strategy produce reviewable
  theme-local source;
- authors can choose token-only output or connect values to supported use sites;
- custom component values pass the existing type-augmentation workflow;
- typography examples keep visual roles separate from heading semantics;
- existing scale values remain unchanged unless a migration is explicitly selected;
- new and revision previews use one consistent comparison layout; and
- failures are atomic and successful output is deterministic.

## Open questions

- What CLI verb best describes adding values without implying that the universal
  Astryx scale changes: `theme scale extend`, `theme tokens add`, or an intent-led
  prompt under `theme create` and `theme edit`?
- Should the first typography recipe accept an author-selected count and propose
  names, require explicit names, or support both?
- How should proposed display names preserve the current ordering, where
  `display-1` is larger than `display-2` and `display-3`? Would role names such as
  `hero` and `hero-large` be clearer than implying that `display-4` is larger?
- Which progression rules should typography and spacing offer initially, and which
  should remain explicit-value-only until there is enough design evidence?
- Should monotonic progression, minimum differentiation, and duplicate values be
  hard requirements or review warnings? A specialized scale may intentionally
  repeat or reverse values.
- Should responsive expressions such as `clamp()` participate in a numeric scale
  preview, or appear as separately identified semantic roles because they do not
  have one fixed size?
- How should tooling discover application-owned style use sites without rewriting
  source the author did not select?
- How should custom component values remain typed for projects that do not run
  `astryx theme build` during local development?
- When an extension value is renamed or removed, which command or validation step
  should locate every remaining token and component reference?
- Should light/dark tuples be supported for every extension domain, or only when a
  demonstrated use case justifies mode-dependent typography or spacing?
- What practical resource guard should prevent accidental generation of thousands
  of values while preserving the contract that Astryx imposes no design-level
  cardinality limit?
- How should previews expose the CSS and type-output cost of a large extension so
  authors can distinguish legitimate breadth from accidental token proliferation?

## Decision log

### DEC-1 — Do not impose a fixed extension count

**Reference:** `spec:AST-023/DEC-1`
**Decider:** pending

The number of additional values follows the theme's needs. Two display roles are a
motivating example, not an API boundary. A finite request is required for reviewable
output, but the system does not impose an arbitrary count.

### DEC-2 — Keep extensions theme-local by default

**Reference:** `spec:AST-023/DEC-2`
**Decider:** pending

Project-specific values should not enlarge the portable contract for every Astryx
consumer. Repeated cross-theme demand may justify a separate universal-token
proposal later.

### DEC-3 — Generate source and use existing runtime mechanisms

**Reference:** `spec:AST-023/DEC-3`
**Decider:** pending

The CLI assists with intent, calculation, preview, and source generation. Accepted
values use `localTokens`, component variants, local styles, and the existing theme
build rather than adding another runtime scale resolver.
