---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-019
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang, imdreamrunner]
affects_architecture:
  [architecture:interaction-modality, architecture:public-component-api]
affects_families: []
affects_contributing: []
affects_consumer_docs:
  [accessibility-checklist, BottomSheet, useScrollableTabStop]
---

# Keyboard-reachable scroll containers system spec

## Intent

People using a keyboard must be able to reach and scroll Astryx-owned scroll
containers. Astryx adds a fallback sequential-focus stop only when real overflow
needs one. A fitting box, a box that only clips content, or a region already
reachable through a visible sequential-focus descendant must not gain a dead or
duplicate stop.

This shared rule prevents each component from making a different `tabindex`
decision. BottomSheet is the first proposed adopter in
[#5553](https://github.com/facebook/astryx/pull/5553), following the defect in
[#5207](https://github.com/facebook/astryx/issues/5207).

## Non-goals

- Making every element with `overflow: auto` a tab stop before it actually
  overflows.
- Treating clipped or hidden overflow as keyboard-scrollable.
- Adding a generic stop before a visible descendant already in the sequential
  focus order.
- Assigning a landmark role or accessible name when the content already
  identifies the region.
- Defining scroll geometry, scrollbars, overscroll behavior, or focus-indicator
  design.
- Requiring real assistive-technology evidence for an ordinary browser Tab-order
  and keyboard-scrolling claim.

## Requirements

| ID  | Rule                                                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR1 | An Astryx-owned container with user-scrollable overflow on either axis MUST have a route in the sequential keyboard focus order.                                                                                                                             |
| FR2 | A visible sequential-focus descendant satisfies that route. The container MUST NOT add a generic fallback stop before it. Hidden, inert, disabled, or negative-`tabindex` descendants do not satisfy the route.                                              |
| FR3 | When no descendant satisfies FR2, the scroll container MUST own one fallback stop with `tabindex="0"`.                                                                                                                                                       |
| FR4 | The fallback condition MUST be derived per axis. Content must exceed the available box on that axis, and that axis must use a user-scrollable overflow mode such as `auto` or `scroll`. `hidden`, `clip`, and fitting content MUST NOT create the stop.      |
| FR5 | The route MUST stay current when content size, container size, overflow mode, descendant visibility, or descendant focusability changes.                                                                                                                     |
| FR6 | If the container itself is focused when the fallback condition becomes false, it MUST keep focus and its temporary stop until focus leaves. It MUST then remove the stale stop.                                                                              |
| FR7 | A managed fallback MUST NOT overwrite or remove a `tabindex` owned by the component or consumer. Disabling or detaching the shared behavior removes only the stop it created.                                                                                |
| FR8 | Keyboard focus on the fallback container MUST have one visible shared focus indicator in every supported theme. `architecture:interaction-modality` continues to own when keyboard focus indication is visible; the adopting component owns where it paints. |
| FR9 | The container MUST have an accessible name when its content does not already identify the focused region. The shared behavior does not infer or generate that name.                                                                                          |

### Public primitive and resources

- **IR1 — One shared primitive.** Components that need this behavior MUST use the
  shared implementation rather than repeat overflow, descendant-focus, and
  cleanup logic.
- **IR2 — Derive the answer.** The proposed public hook is
  `useScrollableTabStop(options?: {enabled?: boolean})`. It returns a ref for the
  scrolling element. `enabled` controls whether the behavior participates; the
  caller does not mirror overflow or descendant-focus state in React props.
- **IR3 — Compose ownership.** An adopting component composes the returned ref
  with existing gesture, measurement, or consumer refs on the same scrolling
  element.
- **IR4 — Bound measurement.** One observer delivery MUST schedule at most one
  pending measurement for an instance. Detach MUST cancel pending work and
  release every observer and listener owned by that instance.
- **IR5 — Client boundary is explicit.** The primitive reads rendered layout and
  is client-only. Adoption MUST NOT move a server-safe component behind a client
  boundary without a separate component or API decision.

### Platform support

- Supported feature/engine floor: [AST-013](../AST-013/spec.md) owns supported
  browsers. Each adopter must work in every browser covered by that record.
- Unsupported behavior: no fallback stop is added where the browser reports no
  user-scrollable overflow. Content access must not depend on a stop whose scroll
  operation the browser cannot perform.
- Browser evidence: a real browser must prove Tab reachability, visible focus,
  and keyboard scrolling for overflowing content, plus the unchanged fitting and
  descendant-owned paths. Under [AST-009](../AST-009/spec.md), this is ordinary
  browser focus and keyboard behavior, so it does not require a real-AT matrix
  unless the change makes an additional AT-specific claim.

## Current-state impact

The proposed implementation in
[#5553](https://github.com/facebook/astryx/pull/5553) introduces the shared hook
and uses BottomSheet's existing scrolling content element as the first owner.
Text-only overflowing sheets gain the fallback stop. Sheets with a visible
button, link, input, or other sequential-focus descendant keep their existing
Tab order.

The current Accessibility Checklist does not state this rule and cannot create
policy by itself. After this spec is accepted, that worksheet should add the
shared primitive and link back here. The BottomSheet component draft links this
spec directly so its accessibility section no longer says focus behavior is
unchanged.

This is additive behavior and an additive public hook. Existing component and
consumer-owned `tabindex` values retain precedence under FR7.

## Verification

| Contract               | Verification                                                                | Representative states                                                                                                                              | Mutation or failure expectation                                                                                                            |
| ---------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| FR1–FR4                | Unit decision tests plus real-browser keyboard probe                        | block or inline overflow; fitting content; `auto`/`scroll`; `hidden`/`clip`; visible, hidden, inert, disabled, and negative-`tabindex` descendants | An unreachable scroller remains, or a dead or duplicate stop enters Tab order.                                                             |
| FR5–FR7                | Mutation, resize, focus-exit, author-ownership, and detach tests            | content grows/fits; overflow changes; descendant appears/disappears; focused fallback becomes unnecessary; explicit `tabindex`; unmount            | State becomes stale, focus is dropped, author state is overwritten, or cleanup changes an unowned attribute.                               |
| FR8–FR9                | Real-browser focus-visible check plus accessibility-tree/name review        | every supported theme; content-identified and explicitly named regions                                                                             | Focus has no visible owner, two indicators paint, or an otherwise unidentified region receives a silent stop.                              |
| IR1–IR5                | Source, export, ref-composition, observer-count, and server-boundary review | direct hook use; component adoption; resize batch; detach; server-safe candidate                                                                   | Logic forks by component, one delivery causes repeated measurement, resources survive detach, or adoption silently adds a client boundary. |
| AST-009 classification | PR accessibility statement                                                  | browser-only keyboard claim; later AT-specific claim                                                                                               | A browser claim is over-gated, or an AT-specific claim ships without its required matrix.                                                  |

## Decision log

### DEC-1 — The scroll owner is a fallback, not an unconditional stop

**Reference:** `spec:AST-019/DEC-1`
**Decider:** pending owner approval

A visible sequential-focus descendant owns keyboard entry when one exists.
Otherwise, and only while the container actually scrolls, the container owns a
fallback stop. This gives keyboard users access to read-only overflow without
adding an extra stop to control-bearing or fitting regions.

Rejected: unconditional `tabindex="0"`, because it adds dead and duplicate stops;
and component-local checks, because content, focusability, overflow changes,
focus stability, and cleanup would drift between adopters.

### DEC-2 — Scrollability is derived from rendered behavior

**Reference:** `spec:AST-019/DEC-2`
**Decider:** pending owner approval

Astryx derives the fallback from actual per-axis overflow and the rendered
overflow mode. Callers may enable or disable participation, but they do not
maintain a second source of truth for whether content currently scrolls or
whether a descendant owns entry.

Rejected: a caller-maintained `isOverflowing` or `hasFocusableChild` API, because
those values duplicate DOM state and become stale across nested updates.

## Open questions

None. Both decisions remain proposals until an authorized owner approves this
record and it becomes `current`.
