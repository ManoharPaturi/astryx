---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-012
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [rubyycheung]
affects_architecture:
  [
    architecture:theme-authoring-contract,
    architecture:theme-application,
    architecture:theme-tokens,
    architecture:container-padding,
  ]
affects_families: [family:layout-regions, family:layout-primitives]
affects_contributing: []
affects_consumer_docs: [Theme, Layout, Section, Card, Dialog]
---

# Mobile semantic spacing theme

## Intent

Astryx's mobile theme should make structural spacing feel appropriate on small
viewports without changing the geometry of every component that happens to use a
spacing token. The theme needs a clear spacing contract that separates primitive
spacing values from semantic spacing roles such as page padding, section gaps,
container insets, and overlay insets.

The accepted direction is to keep primitive spacing stable and add mobile
semantic spacing values for layout and container roles. This lets maintained
themes provide recommended mobile behavior while allowing product teams to
override or add semantic roles for product-specific surfaces.

## Non-goals

- Redefining every primitive `--spacing-*` token for mobile.
- Shrinking buttons, inputs, chips, segmented controls, icons, or other
  component internals merely because the viewport is mobile.
- Tying the mobile spacing theme to touch capability, pointer type, or input
  modality. Mobile spacing is about screen/layout constraints, not whether the
  user is using touch, mouse, keyboard, or trackpad.
- Making arbitrary `Stack`, `HStack`, `VStack`, `Grid`, or `Center` gaps
  automatically responsive. A generic `gap={4}` should continue to mean
  "use spacing-4"; it should not secretly become smaller on mobile unless the
  author opts into a semantic mobile spacing role.
- Changing desktop or tablet spacing behavior when the mobile theme is not
  active.
- Reinterpreting existing component theme properties in a way that changes
  already-authored themes.
- Defining one permanent value for every possible product-specific layout area.

## Requirements

- **FR1 — Primitive spacing remains primitive.** The mobile spacing contract
  MUST NOT require theme authors to redefine the portable `--spacing-*` scale in
  order to get mobile layout spacing. Components that consume primitive spacing
  for their own internal geometry MUST keep their existing behavior unless that
  component is explicitly themed.
- **FR2 — Mobile spacing is semantic and role-based.** Shared mobile spacing
  MUST be expressed through semantic roles whose names describe layout intent,
  not raw scale position. Initial roles SHOULD cover page padding, page or
  section gaps, container/card/panel insets, container-owned region gaps, and
  overlay/dialog/drawer/bottom-sheet insets.
- **FR3 — Mobile overrides are scoped to the active mobile theme.** Mobile
  spacing values MUST apply only inside a mobile theme boundary or equivalent
  supported screen-size based theme-application mechanism. The trigger MUST be
  based on viewport/layout size, not touch capability, pointer type, or input
  modality. Desktop and tablet themes MUST retain their existing spacing unless
  they opt into the same semantic values.
- **FR4 — Component internals do not opt in automatically.** Buttons, inputs,
  badges, icons, segmented controls, menus, thumbnails, and other control
  internals MUST NOT consume mobile semantic spacing by default. Any
  mobile-only change to a component internal MUST be an explicit component theme
  override.
- **FR5 — Layout and container components may consume semantic spacing.** Layout
  regions, Section, Card, Panel-like surfaces, Dialog, Drawer, and Bottom Sheet
  MAY consume mobile semantic spacing for omitted default insets and owned region
  gaps. Explicit spacing props on those components MUST continue to win.
- **FR6 — Product-specific roles remain possible.** A product or maintained theme
  MAY define additional semantic custom properties for spacing roles not covered
  by Core. Such roles are owned by that theme or product surface unless promoted
  into the shared Astryx contract through a later spec.
- **FR7 — Published values are explicit tokens, not an implementation formula.**
  A proportional or exponential formula MAY be used to explore candidate mobile
  values, but the shipped theme MUST publish explicit semantic values so authors
  can inspect, override, and reason about the contract without reverse
  engineering an algorithm.
- **FR8 — Ordered spacing steps remain distinct.** If Astryx publishes an
  ordered mobile semantic spacing scale, adjacent steps in that scale MUST NOT
  resolve to the same pixel value. Formula-generated duplicates MUST be removed,
  merged, or hand-tuned before publication. Different semantic roles MAY share a
  value intentionally, but duplicated values MUST NOT be presented as separate
  size steps in the same ordered scale.
- **IR1 — Compatibility is additive.** Existing theme properties MUST keep their
  previous meaning. If a legacy component theme property previously emitted raw
  CSS, adopting mobile semantic spacing MUST NOT silently convert that property
  into a derived or internal variable path.
- **IR2 — Override priority is documented and testable.** Implementations MUST
  preserve the priority order: explicit component prop, then component-specific
  theme override, then semantic mobile spacing value, then default primitive
  token fallback.

### Platform support

- Supported feature/engine floor: every browser supported by Astryx Core's theme
  runtime.
- Unsupported behavior: a mobile semantic spacing value MUST NOT leak outside
  its theme scope or apply to desktop/tablet layouts that do not activate the
  mobile theme.
- Browser evidence: visual verification SHOULD include at least one small
  viewport and one non-mobile viewport for every template used as release
  evidence.

## Current-state impact

The current Astryx spacing preset changes the primitive spacing scale. That is
useful for broad theme density, but it is too blunt for the mobile theme because
component internals and layout containers may share the same primitives.

Some generated templates also hardcode layout-region spacing through component
props. Those props correctly win at runtime, but they prevent a mobile theme from
changing the template's structural spacing. Templates intended to demonstrate or
consume theme-level layout spacing should omit hardcoded default insets or use
semantic spacing roles.

This spec affects:

- theme authoring, because mobile spacing needs a scoped semantic authoring path;
- theme application, because mobile values must only apply in the mobile theme
  scope;
- theme tokens, because the recommended published values are semantic spacing
  roles rather than primitive scale replacements;
- container padding, because layout/container components may need edge
  compensation and owned-region gap behavior; and
- layout-region and layout-primitive families, because structural regions may
  consume semantic spacing while arbitrary child arrangement remains explicit.

## Candidate mobile spacing derivation

The current exploration uses a proportional compression formula to generate
candidate values for semantic mobile spacing roles:

```txt
mobileCandidate(space) = roundTo2px(space / √2)
```

Where:

- `space` is the current desktop/default value for a semantic spacing role, in
  pixels.
- In the Astryx playground, the spacing control sets a base value and builds the
  primitive scale as `--spacing-N = round(base × N)`. The current default bases
  are S = 2px, M = 4px, L = 6px, and XL = 8px.
- `√2` is the compression ratio. Dividing by `√2` makes the mobile value about
  70.7% of the default value.
- `roundTo2px(...)` snaps the result to the nearest 2px so adjacent values remain
  visually usable and do not collapse into the same number too often.

This formula is a design tool, not the public theme API. The shipped mobile
theme should publish explicit semantic token values derived from the formula and
then hand-reviewed for awkward values, duplicate values, and real-template fit.
If two adjacent candidate steps produce the same value, the final ordered scale
should either merge those steps or tune one of them so each published step keeps
a distinct purpose.

The main design constraint is that Astryx's existing desktop/default spacing
scale is linear, while the mobile candidate compression is proportional. That
means mobile values will not always preserve a clean step-for-step relationship
with the desktop primitive scale. The mobile theme should therefore avoid
presenting the formula output as a mirrored primitive scale; it should use the
formula to inform explicit semantic values that are reviewed in real layouts.

Using a semantic role whose default value is `--spacing-4`, the candidate values
across the playground spacing defaults are:

| Source spacing preset | Default semantic value | Formula candidate |
| --------------------- | ---------------------- | ----------------- |
| S / 2px base          | 8px                    | 6px               |
| M / 4px base          | 16px                   | 12px              |
| L / 6px base          | 24px                   | 16px              |
| XL / 8px base         | 32px                   | 22px              |

The table below shows the formula across the full playground spacing ramp. This
is intentionally a derivation table, not a proposal to replace every primitive
token or publish repeated numeric steps. Small primitive values can round down
aggressively, which is another reason the formula should not be applied globally
to component internals.

| Primitive token | S / 2px base | M / 4px base | L / 6px base | XL / 8px base |
| --------------- | ------------ | ------------ | ------------ | ------------- |
| `--spacing-0`   | 0px → 0px    | 0px → 0px    | 0px → 0px    | 0px → 0px     |
| `--spacing-0-5` | 1px → 0px    | 2px → 2px    | 3px → 2px    | 4px → 2px     |
| `--spacing-1`   | 2px → 2px    | 4px → 2px    | 6px → 4px    | 8px → 6px     |
| `--spacing-1-5` | 3px → 2px    | 6px → 4px    | 9px → 6px    | 12px → 8px    |
| `--spacing-2`   | 4px → 2px    | 8px → 6px    | 12px → 8px   | 16px → 12px   |
| `--spacing-3`   | 6px → 4px    | 12px → 8px   | 18px → 12px  | 24px → 16px   |
| `--spacing-4`   | 8px → 6px    | 16px → 12px  | 24px → 16px  | 32px → 22px   |
| `--spacing-5`   | 10px → 8px   | 20px → 14px  | 30px → 22px  | 40px → 28px   |
| `--spacing-6`   | 12px → 8px   | 24px → 16px  | 36px → 26px  | 48px → 34px   |
| `--spacing-7`   | 14px → 10px  | 28px → 20px  | 42px → 30px  | 56px → 40px   |
| `--spacing-8`   | 16px → 12px  | 32px → 22px  | 48px → 34px  | 64px → 46px   |
| `--spacing-9`   | 18px → 12px  | 36px → 26px  | 54px → 38px  | 72px → 50px   |
| `--spacing-10`  | 20px → 14px  | 40px → 28px  | 60px → 42px  | 80px → 56px   |
| `--spacing-11`  | 22px → 16px  | 44px → 32px  | 66px → 46px  | 88px → 62px   |
| `--spacing-12`  | 24px → 16px  | 48px → 34px  | 72px → 50px  | 96px → 68px   |

The final mobile theme may tune individual semantic values after reviewing real
templates; the published contract remains the explicit semantic token value, not
the formula or the primitive-token derivation table.

## Verification

| Contract | Verification                                                                                                         | Representative states                                                                    | Mutation or failure expectation                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| FR1, FR4 | Component visual or unit tests showing controls keep internal spacing when only mobile semantic layout values change | Button, Input, segmented control, badge/icon-like components                             | A mobile layout value changes a control's internal padding, gap, or geometry         |
| FR2, FR5 | Layout/container tests showing omitted default insets consume semantic spacing                                       | LayoutHeader, LayoutContent, LayoutFooter, LayoutPanel, Section, Card or overlay surface | A layout/container region with no explicit spacing ignores the semantic mobile value |
| FR3      | Theme-scope test or browser evidence comparing mobile and non-mobile theme boundaries                                | Mobile, tablet, desktop widths or equivalent scoped theme containers                     | Mobile semantic spacing appears outside the mobile theme boundary                    |
| FR6      | Theme build/runtime test accepting an additional custom semantic property in a maintained theme or product surface   | Product-specific gallery or sidebar spacing role                                         | Custom semantic spacing cannot be authored or is treated as a Core portable token    |
| FR7      | Theme package snapshot or CSS artifact check listing explicit semantic values                                        | Default mobile theme output                                                              | Published output depends on an opaque formula instead of explicit values             |
| FR8      | Token table or artifact check showing adjacent ordered mobile spacing steps remain distinct                          | Published mobile semantic spacing scale                                                  | Two adjacent published scale steps resolve to the same pixel value                   |
| IR1      | Theme-generation test for existing component theme properties                                                        | Existing `layout.base.padding` or comparable compatibility-sensitive property            | A pre-existing theme property changes emitted CSS meaning                            |
| IR2      | Component tests covering explicit prop, component theme, semantic value, and fallback                                | Layout/container region with and without `padding` prop                                  | Override order changes or an explicit prop no longer wins                            |

## Decision log

### DEC-1 — Mobile spacing uses semantic roles rather than global primitive replacement

**Reference:** `spec:AST-012/DEC-1`
**Decider:** `<pending>`, `<pending>`

Changing primitive spacing globally makes the mobile theme easy to implement but
too broad: it changes component internals, not just layout. Semantic roles let
the mobile theme compact the spaces that define page structure while preserving
component geometry.

Rejected: globally compressing the full `--spacing-*` scale for mobile because
the same primitives are used by both structural containers and component
internals.

### DEC-2 — Published mobile values are explicit

**Reference:** `spec:AST-012/DEC-2`
**Decider:** `<pending>`, `<pending>`

A proportional or exponential curve can guide exploration, but shipped mobile
theme values should be concrete semantic token values. Astryx's desktop spacing
scale is linear, so a proportional mobile compression will not always align with
desktop token steps. Explicit values are easier to review, document, override,
and keep compatible across themes.

Rejected: shipping only a formula as the public contract because authors would
need to infer which semantic roles exist and how to override individual values.

### DEC-3 — Existing theme properties keep their meaning

**Reference:** `spec:AST-012/DEC-3`
**Decider:** `<pending>`, `<pending>`

Mobile spacing should be additive. Existing theme properties should not be
repurposed into new derived-variable behavior when doing so could change current
theme output.

Rejected: converting compatibility-sensitive existing properties into semantic
mobile spacing entry points because that can make existing themes behave
differently without an explicit opt-in.

## Open questions

- **OQ1 — Which semantic spacing roles belong in v1?** (`human-api`) Candidate
  roles are page padding, section gap, container inset, container region gap,
  overlay inset, and overlay region gap.
- **OQ2 — Which components consume v1 roles?** (`human-api`) Layout regions,
  Section, Card, Dialog, Drawer, and Bottom Sheet are likely; Banner may depend
  on whether it is acting as content or as a container.
- **OQ3 — How is the mobile theme activated?** (`human-api`) The contract needs
  to name whether values are applied through a viewport-scoped theme, a mobile
  theme package, responsive screen-size conditions, or another existing
  theme-application mechanism. The activation model should not be tied to touch
  or pointer modality.
- **OQ4 — What candidate scale should seed the explicit values?**
  (`human-design`) Current exploration favors a proportional/exponential
  candidate scale rounded to the Astryx grid, then hand-tuned to avoid duplicate
  or awkward values.
- **OQ5 — Should any arbitrary Stack/Grid usage be able to opt into semantic
  spacing?** (`human-api`) The default should remain explicit gaps, but a later
  API could allow authors to assign a semantic spacing role intentionally.
