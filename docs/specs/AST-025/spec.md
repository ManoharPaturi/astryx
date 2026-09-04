---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-025
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
affects_consumer_docs: [theme]
---

# Theme-extensible Icon sizes system spec

## Intent

Astryx ships four portable Icon sizes: `xsm`, `sm`, `md`, and `lg`. Product
themes sometimes need another reusable glyph size, while individual screens may
need a one-off adjustment or a different icon size inside one component slot.

Those are different needs. Astryx should let a theme add a named, type-safe Icon
size without adding that name to every theme, while continuing to support direct
`xstyle` adjustments and component-owned icon targets for narrowly scoped cases.
The resulting size must behave the same for supplied SVG components and icons
resolved from the registry.

## Non-goals

- Add one product's size names to Astryx's universal Icon API.
- Require custom icons to follow a generated mathematical scale.
- Automatically add a new Icon size to Button, IconButton, or any other
  component's separate size API.
- Resize interactive hit targets merely because their glyph becomes larger.
- Treat icon stroke weight or artwork style as an Icon-size concern.
- Replace `xstyle` for one-off caller-owned adjustments.
- Reach into component internals with structural selectors when the component has
  not exposed the relevant icon slot.

## Terms

- **Built-in size:** `xsm`, `sm`, `md`, or `lg`, available in every theme.
- **Custom size:** a named Icon box size enrolled by one theme and made available
  through that theme's generated TypeScript declaration.
- **Direct icon:** an `Icon` rendered by application source, where the caller owns
  its props and `xstyle`.
- **Component-owned icon:** an Icon rendered inside another Astryx component. Its
  sizing is controlled by that component's public props or documented theming
  target.
- **Icon box:** the rendered width and height. Registry-backed 1em artwork also
  requires a matching font size.

## Current limitation

`IconSize` is currently derived from a closed StyleX object containing only the
four built-in names. A new value such as `size="2xl"` is rejected by TypeScript;
if the type error is bypassed, both direct-SVG and registry size lookups return no
baseline style. The theme builder also has no `IconSizeMap` augmentation point, so
it cannot make a custom size type-safe.

Authors can already apply a one-off width and height to a direct Icon through
`xstyle`. They can change an icon nested in another component only when that
component exposes an appropriate prop or theming target. Adding a global named
Icon size is unnecessary for those narrow cases and would not automatically make
the parent component's layout accommodate it.

## Requirements

### Choosing the correct scope

- **FR1 — Authoring starts with use scope.** Tooling and documentation MUST first
  distinguish a reusable theme-wide Icon size, a one-off direct Icon adjustment,
  and a component-owned icon adjustment. It MUST NOT turn every isolated size into
  a new named variant.
- **FR2 — Direct one-off sizing remains supported.** A caller that owns an `Icon`
  MAY use `xstyle` for a valid one-off width and height. Guidance SHOULD prefer a
  named theme size when the same choice is intentionally reused.
- **FR3 — Component-owned icons respect component ownership.** When another
  component renders the icon, tooling MUST use that component's public prop or
  documented icon target. If neither exists, it MUST report the missing extension
  point or generate a copyable proposal; it MUST NOT inject a structural selector
  or rewrite unrelated component source.
- **FR4 — Parent layout is a separate decision.** Applying a larger glyph MUST NOT
  silently enlarge a Button, IconButton, input, row, or other interactive target.
  Preview and guidance MUST identify clipping, alignment, and hit-target risks and
  let the author choose the corresponding parent-component change explicitly.

### Extensible named sizes

- **FR5 — Icon exposes a real augmentation point.** The public Icon subpath MUST
  export an interface whose keys form `IconSize`. It contains the four built-in
  sizes and may be widened through module augmentation. The component and
  `renderIconSlot` MUST consume that same map-backed union.
- **FR6 — Theme build enrolls declared custom sizes.** When a theme contains an
  `icon['size:<name>']` override, `astryx theme build` MUST emit and load an
  augmentation for the public Icon size map. Failure to produce usable typing MUST
  fail with actionable guidance rather than emit CSS for an unusable prop value.
- **FR7 — Custom names remain theme-owned.** Importing the owning built theme makes
  its size names available to that consumer. A custom name MUST NOT become a
  built-in value or require unrelated themes to define it.
- **FR8 — Built-in behavior remains stable.** Themes that declare no custom Icon
  size retain the current four names, `md` default, rendered dimensions, and build
  output.

### Size values and rendering

- **FR9 — Exact values are first-class.** Authors MAY provide any valid supported
  CSS length or expression for a custom size. A generator or scale continuation is
  optional assistance, never a requirement. The accepted value is saved explicitly
  in theme source and is not regenerated at application runtime.
- **FR10 — Both rendering paths agree.** Every custom size MUST resolve the same
  icon box for a supplied SVG component and a registry-backed icon. A complete
  declaration sets width and height and supplies the font-size behavior required by
  1em registry artwork.
- **FR11 — Missing theme CSS has a safe fallback.** Before the owning theme CSS is
  available, a custom size MUST use the built-in `md` box rather than render without
  dimensions or inherit an unrelated ambient font size.
- **FR12 — Relative units are recommended, not forced.** Guidance SHOULD recommend
  `rem` when the icon should respond to root text scaling. Valid fixed or responsive
  values such as `px`, `em`, `calc()`, and `clamp()` remain available when the
  author deliberately chooses them and reviews the result.
- **FR13 — Artwork is visually reviewed.** Equal boxes do not guarantee equal
  perceived glyph size. A preview MUST show representative filled, outline, and
  registry-backed artwork at every proposed size and report clipping or alignment
  without claiming automatic optical balance.

### Generated artifacts and safety

- **FR14 — Generated declarations load with the built theme.** The primary theme
  declaration MUST reference the optional custom-variant declaration so importing
  the built theme activates the Icon size augmentation.
- **FR15 — Source, runtime, and static builds agree.** A custom size MUST pass
  TypeScript, reflect through the Icon `data-size` theming target, and compute the
  same box in runtime-injected and statically built themes.
- **FR16 — References fail closed.** Before renaming or removing a custom Icon
  size, supported tooling MUST report every direct use, theme rule, and known slot
  reference. Remaining references MUST fail validation or type checking rather than
  silently fall back to another named size.
- **FR17 — Accessibility semantics do not change.** Size changes MUST NOT alter
  whether an icon is decorative, its accessible label, role, registry key, or the
  accessible name and hit target of an interactive parent.

## Proposed API

```ts
// @astryxdesign/core/Icon
export interface IconSizeMap {
  xsm: true;
  sm: true;
  md: true;
  lg: true;
}

export type IconSize = keyof IconSizeMap;
```

A theme may enroll a reusable local size with explicit values:

```ts
defineTheme({
  name: 'product',
  localTokens: {
    '--astryx-theme-product-icon-size-hero': '3rem',
  },
  components: {
    icon: {
      'size:hero': {
        width: 'var(--astryx-theme-product-icon-size-hero)',
        height: 'var(--astryx-theme-product-icon-size-hero)',
        fontSize: 'var(--astryx-theme-product-icon-size-hero)',
      },
    },
  },
});
```

After importing the owning built theme, direct use is typed:

```tsx
<Icon icon="info" size="hero" />
```

This does not make `size="hero"` a Button size, enlarge a surrounding control, or
override an internally selected icon size in a component that exposes no such API.

## Current-state impact

The accepted spec changes no runtime or public API by itself. Its implementation
will replace Icon's closed StyleX-derived size union with a public map-backed union,
teach theme build to augment it, add a safe fallback for custom names, and ensure
direct-SVG and registry rendering share the same custom-size contract.

The current Icon component specification describes the four sizes as closed. The
implementation PR MUST update that component record and consumer documentation in
the same change. Existing size names and values remain portable and unchanged.

## Verification

| Contract  | Verification                                                              | Representative failure                                                                                                    |
| --------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR4   | Authoring and component-slot fixtures                                     | A one-off creates a global variant, a private descendant selector is emitted, or the glyph outgrows its control silently. |
| FR5–FR8   | Public-subpath augmentation and compatibility type tests                  | `size="hero"` remains a type error after importing the theme, or a built-in size changes.                                 |
| FR9–FR13  | Exact-value fixtures and visual/browser matrices for both rendering paths | The tool forces a formula, registry and direct icons differ, or equal boxes are called optically equivalent.              |
| FR14–FR16 | Generated-artifact, runtime/static parity, and reference-removal tests    | The augmentation is not loaded, one build path loses the size, or removal silently falls back.                            |
| FR17      | Existing Icon and interactive-parent accessibility contracts              | Sizing changes decoration, naming, role, focus, or hit-target semantics.                                                  |

### Completion criteria

This spec moves from `proposed` to `shipped` only when:

- Icon and `renderIconSlot` consume one public augmentable size map;
- theme build emits and loads declarations for custom Icon sizes;
- custom sizes render equivalently for direct and registry icons;
- exact author values are supported without requiring a generated scale;
- custom names fall back safely when theme CSS has not applied;
- built-in sizes and themes without custom sizes remain unchanged;
- component-owned icon guidance prevents accidental parent-layout changes; and
- rename and removal checks fail closed for remaining references.

## Open questions

- Should a component with an internal icon expose a dedicated `iconSize` prop, a
  documented icon-slot target, or choose between them based on whether the size is
  part of its public layout contract?
- Should theme build require `fontSize` explicitly for every custom Icon size, or
  synthesize it from width when width and height are equal?
- Should a future authoring command generate a named Icon size alongside a matching
  parent-component size, or always keep those as two separately confirmed changes?

## Decision log

### DEC-1 — Distinguish reusable, one-off, and component-owned sizing

**Reference:** `spec:AST-025/DEC-1`
**Decider:** pending

A named global Icon size is useful only when the choice is reused. Direct `xstyle`
and component targets remain the smaller mechanisms for local needs. Tooling asks
for scope before proposing a new variant.

### DEC-2 — Make Icon size extensible through a public map

**Reference:** `spec:AST-025/DEC-2`
**Decider:** pending

Use the existing map-based module-augmentation model so generated CSS and
TypeScript agree. A closed union or an unrelated generated interface cannot make a
theme-owned name usable by `IconProps`.

### DEC-3 — Accept exact values without forcing a scale

**Reference:** `spec:AST-025/DEC-3`
**Decider:** pending

Authors may supply exact values and review them. Formula-based suggestions may be
added as optional authoring assistance but are never required and never rerun in
the application build.
