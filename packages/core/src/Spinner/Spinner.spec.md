---
schema_version: 3
template_version: 3
kind: component
id: component:Spinner
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    .github/scripts/theme-var-reachability.js,
    apps/storybook/stories/Spinner.stories.tsx,
    packages/core/src/Spinner/Spinner.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [architecture:component-theming-surface, architecture:public-component-api]
contributing: []
system_specs: []
---

# Spinner component contract

## Intent

Spinner communicates that work of unknown duration is in progress. This draft
records its canonical consumer anatomy: one Spinner-owned status/ring part, an
optional Text-owned string label, and optional caller-owned custom label content.
It does not change runtime behavior, DOM, styling, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`.
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged.
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: none.

## Ownership boundary

**Owns**

- The indeterminate status indicator and animated ring represented by the
  `spinner` target.
- Accessible status naming and the current labelled/unlabelled root routing.
- Placement of optional label content below the Spinner.

**Does not own / non-goals**

- Text styling for a string label, which remains owned by `component:Text`.
- The structure or theming of a non-string label ReactNode, which remains owned by
  the caller and any components they compose.
- A public target for the labelled layout wrapper, or separate targets for the
  internal SVG, track, or moving arc.
- New runtime behavior, DOM, styles, props, targets, aliases, or theme variables.

## Public concepts

No new public concept is introduced. Consumer size, shade, label, accessible-name,
styling, DOM pass-through, and ref APIs remain documented in `Spinner.doc.mjs`
and governed by `architecture:public-component-api`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                  | Basis                                       | Draft review state                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| FR1 | Every render contains one Spinner-owned status indicator that presents the animated loading ring and carries `role="status"`. Accessible naming follows FR6, including its current empty-string gap.                                                                                                                                                                                                 | Current source, docs, and tests             | Status semantics verified; accessible-name gap recorded        |
| FR2 | The status indicator carries the `spinner` target and reflects `size` and `shade` in both labelled and unlabelled states. The internal SVG, track, and moving arc do not carry separate public targets.                                                                                                                                                                                              | Current source and focused regression tests | Verified current ownership                                     |
| FR3 | Without label content, the status indicator is also the public root: it receives the ref, supported DOM props, `data-testid`, and consumer `xstyle`, `className`, and `style`.                                                                                                                                                                                                                       | Current source and tests                    | Verified compatibility behavior                                |
| FR4 | With label content, a structural wrapper is the public root and receives the ref, supported DOM props, `data-testid`, and consumer styling. It carries unregistered private bridges that forward root custom-property overrides into the descendant targeted status indicator, preserving consumer precedence even when an active theme declares those public variables on the target.               | Current source and focused regression tests | Verified current root and target routing                       |
| FR5 | A string label renders below the Spinner through Text. A non-string ReactNode renders in the same label position without an added Text owner.                                                                                                                                                                                                                                                        | Current source, docs, and tests             | Verified current conditional composition                       |
| FR6 | With no label, the status indicator uses the current `Loading` fallback. A non-blank string label names it through `aria-labelledby` unless an explicit `aria-label` is supplied. A non-string label without an explicit accessible name also uses `Loading`. An empty or whitespace-only string label currently renders blank Text, sets `aria-labelledby`, and loses the fallback accessible name. | Current source and accessibility tests      | Covered paths verified; empty-string behavior is a current gap |

### Allowed variation

- **AV1 — Size and shade.** The existing size and shade values and theme overrides
  may change ring geometry and paint through the `spinner` target without changing
  anatomy ownership.
- **AV2 — Ring implementation.** Internal SVG and circle structure may change if
  the Spinner part retains its status semantics, ring presentation, and target
  ownership.
- **AV3 — Custom label content.** A caller may supply any supported ReactNode;
  Spinner positions it but does not claim its internal anatomy or theming.

### Representative states

| State                            | Required invariant                                                                                                              | Allowed variation                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Unlabelled                       | The public root/status indicator carries `spinner`, accessible naming, ref, DOM props, and consumer styling.                    | Size, shade, explicit accessible name, and consumer overrides.       |
| Labelled with non-blank string   | The wrapper remains the public root; its descendant status carries `spinner`; Text renders and names the visible label.         | Label text, size, shade, explicit accessible-name override, styling. |
| Labelled with ReactNode          | The wrapper remains the public root; its descendant status carries `spinner`; caller-owned content occupies the label position. | ReactNode structure and explicit accessible name.                    |
| Empty or whitespace string label | The wrapper and blank Text render; the status points at that Text and currently has no fallback accessible name.                | Current accessibility gap; no runtime correction in this draft.      |

### Transformation and precedence order

- **ORD1 — Root and target routing.** Resolve whether label content is present.
  Route public root/ref/DOM/styling ownership to the status indicator when absent
  or to the structural wrapper when present, while always retaining `spinner` on
  the status indicator.
- **ORD2 — Label rendering.** Render a string through Text and otherwise pass the
  ReactNode through directly; explicit `aria-label` takes precedence over naming
  from a non-blank visible string label. The current implementation does not
  normalize or reject empty and whitespace-only strings before choosing
  `aria-labelledby`.

### Performance and resources

- This draft introduces no new render, measurement, listener, observer, animation,
  or initialization requirement.

## Accessibility contract

- **AR1 — Status semantics.** The Spinner part retains `role="status"` in every
  labelled and unlabelled state.
- **AR2 — Accessible naming.** The no-label path uses `Loading`; a non-blank string
  label names the status through `aria-labelledby`; an explicit `aria-label`
  overrides either path. Empty and whitespace-only string labels currently lose
  the fallback name because they still select an empty Text label through
  `aria-labelledby`; this is an accessibility gap, not approved behavior.
- **AR3 — Decorative ring internals.** The internal ring graphic remains hidden
  from assistive technology; the status indicator owns the semantics.

## Design relationships

| Anatomy or state     | Design requirement                                                              | Representation authority       | Hierarchy role | Component contract |
| -------------------- | ------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Spinner              | Communicates indeterminate work through one animated ring and status indicator. | Current source and public docs | Prominent      | FR1-FR4, AR1, AR3  |
| Text label           | Presents a visible string description below the ring through Text.              | `component:Text`               | Supporting     | FR5, FR6, AR2      |
| Custom label content | Presents caller-composed content in the optional label position below the ring. | Caller-supplied content        | Supporting     | FR5, FR6           |

The labelled wrapper is not a separate consumer anatomy part. It exists to
arrange the Spinner and optional label and remains the labelled public root/ref
destination under FR4, but it is structural rather than a separately painted
semantic concept. The ring's SVG, track, and arc are likewise implementation
structure inside the single Spinner part.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Spinner": {"target": "spinner"},
  "Text label": {
    "delegatesTo": {"owner": "component:Text", "target": "text"}
  },
  "Custom label content": {
    "none": {
      "reason": "intentional: Non-string label content is caller-provided and remains outside Spinner's public theming ownership"
    }
  }
}
```

The one local target is the exact current target. It stays on the status
indicator in both labelled and unlabelled states. A string label delegates to
Text's current `text` target; that ownership is established by Spinner and Text
source plus their public target records, not by cross-record validation. Custom
content retains its own owners. No wrapper, SVG, track, or arc target is
introduced.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, exact
  target mapping, delegation, factual `none` classification, and the rule that
  structural wrappers do not become targets merely because they are stable DOM.
- `architecture:public-component-api` owns Spinner's supported DOM pass-through,
  styling composition, ref destination, and compatibility boundary.

## Verification map

| Contract              | Verification                                                                                                   | Representative states                                                   | Mutation or failure expectation                                                                                                                                                                                              | Audit section                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| FR1, FR3, FR5, FR6    | `Spinner.test.tsx` render, label, root, ref/prop, and accessible-name suites plus source inspection            | Unlabelled, non-blank string label, ReactNode label                     | Removing covered status semantics, label routing, public root ownership, or accessible naming fails existing assertions. Empty/whitespace label naming and complete ref/styling routing remain gaps or source-inspected.     | `audit:Spinner/behavior`      |
| FR2, FR4              | `Spinner.test.tsx` target ownership plus `theme-var-reachability.js` / `ThemeCascadeContract` browser coverage | Labelled and unlabelled; theme, root `style`, `xstyle`, and `className` | Moving `spinner` off the status indicator, breaking theme-only fallback, or shadowing labelled root overrides fails the focused unit or Chromium guard.                                                                      | `audit:Spinner/theming`       |
| AR1-AR3               | `Spinner.test.tsx` role, name, visible-label, and SVG accessibility assertions plus source inspection          | Default, explicit name, non-blank string label                          | Removing covered status naming, duplicating a non-blank visible label, or exposing the decorative SVG fails assertions or source review. Empty/whitespace string fallback behavior has no focused test and is a current gap. | `audit:Spinner/accessibility` |
| Text label delegation | Spinner/Text source and public target-record inspection                                                        | String label                                                            | Source shows Spinner renders Text and Text emits `text`. `check:knowledge` validates delegation shape only; it does not verify that `component:Text` owns `text`.                                                            | `audit:Spinner/theming`       |
| Theming anatomy map   | `scripts/check-knowledge.mjs` and `themingTargets.test.ts`                                                     | Canonical anatomy and current local target                              | Missing, extra, prefixed, or stale local mappings fail validation; malformed delegation metadata fails syntax checks. Cross-record delegated owner/target semantics are not validated.                                       | `audit:Spinner/theming`       |

## Decision log

None. This draft records the user-directed canonical anatomy and current
ownership boundary without introducing a new component-local runtime, API, layout,
or theming decision.

## Open questions

- **OQ1 — Should empty and whitespace-only string labels fall back to `Loading`
  unless an explicit `aria-label` is supplied?** (`checkable`) Current rendering
  selects an empty Text node through `aria-labelledby` and leaves the status
  without the documented fallback accessible name. Runtime correction is outside
  this anatomy-only draft.
- **OQ2 — Should knowledge validation resolve `delegatesTo` owner/target pairs
  across current component records?** (`checkable`) It currently validates only
  the delegation object's syntax, so Text's ownership of `text` remains
  source-and-record inspection evidence.

## Content boundary

This file does not duplicate consumer prop tables/examples, release migration
instructions, current audit results, implementation steps, or shared
theming/public-API rules. It links to their owners.
