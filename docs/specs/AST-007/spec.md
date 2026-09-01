---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-007
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang, rubyycheung, imdreamrunner]
affects_architecture:
  [architecture:layer-runtime, architecture:public-component-api]
affects_families: [family:overlay-dismissal]
affects_contributing: []
affects_consumer_docs: [Drawer]
---

# Drawer scope, modality, and scrim system spec

## Intent

Let a Drawer belong either to the whole page or to a caller-owned region such as
a split-view pane, dashboard card, canvas, or chart panel. A regional inspector
must remain visually and behaviorally inside that region while the rest of the
page stays available.

The candidate contract separates three questions:

1. **Scope:** which area owns the Drawer—the viewport or a supplied container.
2. **Modality:** whether content behind the Drawer inside that scope is available.
3. **Scrim:** whether that scoped background is visibly dimmed and exposes a
   visible outside-pointer dismissal plane.

#5550 establishes implementation feasibility and exposes the decisions in this
record. It does not make the proposed API or behavior current. Drawer remains a
private Lab component with no stability promise, but the contract should be
settled before its planned promotion to Core turns these choices into public
compatibility commitments.

Ownership is shared:

- `cixzhang` owns the public API, cross-overlay consistency, and whether modality
  and scrim are independent caller concepts;
- `rubyycheung` owns the regional-inspector experience, visual communication,
  and whether each proposed state is understandable; and
- `imdreamrunner` owns hosting, focus, inertness, stacking, dismissal,
  scrollport geometry, lifecycle, and browser-support implications.

## Non-goals

- Implementing or merging #5550 in this specification pull request.
- Promoting Drawer from Lab to Core.
- Defining a general portal-target API for every Astryx overlay.
- Replacing `architecture:layer-runtime` or the shared overlay-dismissal stack.
- Making a regional Drawer a document-modal dialog. `showModal()` establishes a
  document modal boundary; the browser top layer also hosts non-modal popovers.
  `aria-modal` separately communicates modal semantics to accessibility
  technology, and Astryx body scroll locking is a component behavior rather than
  a native-dialog guarantee.
- Changing Dialog, AlertDialog, Popover, BottomSheet, MobileNav, or docked-panel
  behavior in this proposal.
- Deciding #5652's visual recede treatment, `hasStackRecede` API, theme variables,
  or theming-surface participation. That proposal may build on the logical stack
  and scope rules here but needs its own design and theming decision.
- Requiring BottomSheet to rename or split `hasScrim` in the same change. If the
  independent-axis proposal is accepted as a sheet-family convention,
  BottomSheet needs a separate compatibility and migration decision.
- Adding block-axis Drawer placement; BottomSheet owns bottom-edge sheets.
- Changing Drawer width, mobile reveal, side, motion, close-button, or content
  composition APIs except where regional scope changes the containing geometry.
- Defining arbitrary nested regions or allowing a Drawer to block content
  outside its declared scope.
- Treating implementation registries, portal wrappers, observers, or z-index
  values as public API.

## Requirements

The requirements below describe the candidate contract. While this record has
`authority: draft`, they are review material rather than implementation policy.

### Public concepts

- **FR1 — Scope represents caller-owned intent.** A caller may choose viewport
  scope or supply the element that owns a regional inspector. The component
  cannot derive this boundary from viewport size, DOM ancestry, content, or
  layout, because the same rendered pane may intentionally host either a
  page-level or pane-level inspector. `family:layout-regions` and `LayoutPanel`
  own persistent in-flow page regions that reserve layout space; they do not
  express a temporary panel that overlays one region without reflowing it. This
  distinction therefore satisfies `spec:AST-002` only when the caller identifies
  the owner explicitly.
- **FR2 — Scope does not change semantic intent.** Changing scope MUST NOT
  silently change whether the Drawer is modal, whether it paints a scrim, which
  logical side it uses, whether it is open, or what content it presents. Scope
  changes the area to which those decisions apply.
- **FR3 — The proposed scope API identifies one region.** The candidate API is
  `containerRef?: React.RefObject<HTMLElement | null>`. Omission means viewport
  scope. A supplied ref identifies the element whose visible scrollport,
  descendants, and own interaction make up the regional background. It does not
  require the Drawer panel to be a DOM child of that element; hosting must remain
  outside any subtree the Drawer makes inert.
- **FR4 — Modality describes availability behind the Drawer.** The candidate
  `modality?: 'modal' | 'nonModal'` API defaults to `'modal'`. Within the active
  scope, `modal` makes content behind the Drawer unavailable to pointer,
  keyboard, scrolling, and the accessibility tree; `nonModal` leaves it
  available.
- **FR5 — Scrim describes presentation and its visible activation plane.** The
  candidate `hasScrim?: boolean` API controls visible dimming and defaults to
  `modality === 'modal'`. A visible modal scrim may also be the outside-pointer
  dismissal surface. Explicitly setting `hasScrim` MUST NOT change focus
  containment, inertness, document-modal presentation, scroll locking, or
  accessibility semantics. OQ2 decides whether this separate presentation and
  dismissal concept belongs in the public contract.
- **FR6 — Every supported combination must be understandable and correct.** The
  default modal-with-scrim and non-modal-without-scrim states MUST be complete.
  If the independent-axis proposal is accepted, modal-without-scrim and
  non-modal-with-scrim MUST also be complete, documented states rather than
  partially wired escape hatches. OQ2 decides whether those two states belong in
  the public contract at all.
- **FR7 — The regional target has a stable presented lifetime.** The target MUST
  be connected and expose a rendered client box when regional presentation begins,
  then remain the same element through exit. A missing, detached, or non-rendered
  target MUST clean up regional ownership and suspend presentation rather than
  move the Drawer into an unrelated ancestor. Changing `containerRef.current`
  while the Drawer is presented is unsupported; callers close, change the target,
  and reopen. Drawer MUST NOT continue with stale regional ownership when the
  presented target no longer matches the adopted one: it cleans up the old
  region, suspends presentation, and produces a development warning. Detection
  timing remains an implementation detail.

### Viewport and regional semantics

- **FR8 — A viewport-modal Drawer uses the document modal boundary.** In viewport
  scope with `modality="modal"`, the Drawer uses `showModal()` to establish the
  native document modal and focus boundary and exposes matching modal semantics.
  Astryx separately holds the body scroll lock for the rendered modal lifetime.
  As an active native modal, it also supplies the modal outlet required by
  `spec:AST-003/FR18` so admitted global systems do not fall behind it.
- **FR9 — A regional Drawer never uses the document modal boundary.**
  `showModal()` is viewport-scoped and cannot express an arbitrary regional
  boundary. A regional Drawer therefore remains in the document rendering
  context even when it blocks its declared region; top-layer participation by
  itself would not provide regional clipping or modality.
- **FR10 — Regional modality is scoped, not downgraded.** A regional
  `modality="modal"` Drawer makes the target element and content behind the
  Drawer inside that region unavailable while content outside the region remains
  operable. The Drawer MUST be hosted outside the subtree it blocks so interaction
  attached to the regional root itself is included in that boundary. It MUST NOT
  claim `aria-modal="true"` or lock body scrolling because the document is not
  modal. OQ3 decides whether `modal` is the accepted public name for this scoped
  guarantee.
- **FR11 — Blocking is consistent across input and accessibility channels.** A
  regional modal MUST NOT dim or pointer-block a control while leaving it
  tabbable, programmatically focusable, keyboard-activatable, scrollable, or
  exposed as available in the accessibility tree. The region root, current
  descendants, and newly inserted descendants are held to the same rule for the
  full blocking lifetime.
- **FR12 — Existing inert ownership is preserved.** Drawer removes only the
  blocking state it established. A region or descendant already inert for
  another owner remains inert when the Drawer closes, changes modality, or
  unmounts.
- **FR13 — A non-modal scrim is presentation only.** If this state is accepted,
  its scrim MUST be pointer-transparent and MUST NOT prevent scrolling, focus,
  activation, or accessibility access to the scoped background. It MUST NOT
  imply that background controls are unavailable.
- **FR14 — Outside-pointer dismissal requires a visible modal scrim.** A modal
  Drawer with no scrim MUST NOT close from an invisible backdrop or invisible
  full-scope hit plane. A non-modal scrim is presentation only and therefore does
  not dismiss. A visible modal scrim may request close when activated. That
  pointer path participates in the associated-branch resolver and claims the
  gesture before visibility changes, as required by `spec:AST-003/FR7` and
  `spec:AST-003/FR11–FR13`, so the same press cannot close and immediately reopen
  the Drawer.
  Escape, the close button, and caller-controlled close requests remain separate
  channels.

### Geometry and lifecycle

- **FR15 — Regional geometry follows the visible scrollport.** The panel and
  scrim remain pinned to the target's visible client box. In non-modal mode, or
  when application code changes scroll position, background scrolling MUST NOT
  carry the Drawer out of view, change its height, or expose an uncovered strip.
  In regional modal mode, user wheel, touch, and keyboard input MUST NOT scroll
  the blocked background region; Drawer content may keep its own scrolling.
- **FR16 — Width resolves against the active scope.** Viewport Drawer percentages,
  maximum width, and mobile reveal use viewport geometry. Regional Drawer
  percentages, maximum width, and reveal use the supplied region. A regional
  Drawer MUST NOT overflow its region merely because the viewport is wider.
- **FR17 — The region is a clipping boundary.** A regional panel, scrim, hit
  plane, shadow, and transition MUST remain inside the target's visible box
  without requiring the caller to change that element's positioning, overflow,
  or scroll behavior. The target supplies scope and geometry; implementation
  hosting remains outside the subtree regional modality blocks.
- **FR18 — Closed regional Drawers have bounded idle cost.** A regional Drawer
  that has never opened MUST NOT perform ongoing measurement, observation, or
  event work against its target. Target-dependent work begins only when
  presentation requires it and ends after exit cleanup.
- **FR19 — Target loss cleans up before later presentation.** If the stable target
  detaches while the Drawer is rendered, the panel suspends and releases its
  blocking, scroll, and presentation ownership from that region. A later target
  is adopted only after the caller closes and reopens or otherwise starts a new
  rendered lifetime under the accepted API contract.
- **FR20 — Exit retains the visible contract.** Geometry, blocking, scrim
  presentation, content, side, and focus-return target remain stable through the
  exit transition. Background content MUST NOT become active beneath a Drawer
  that is still visibly leaving.

### Stacking and dismissal

- **FR21 — One visible order governs each logical Drawer stack.** Drawers in the
  same scope and drill-in flow share one visual/enforcement ordering. It
  determines which Drawer paints in front, receives direct panel input, and owns
  regional blocking. Internal structures may retain different lifetimes, but
  MUST NOT produce a different front-most Drawer. Escape/platform close follows
  the eligible-owner resolver, and outside-pointer interaction follows the
  associated-branch resolver; neither channel is inferred from visual order.
- **FR22 — The front Drawer remains operable through ownership transfer.** A
  Drawer behind another modal Drawer is unavailable with the scoped background.
  The front Drawer and any later Drawer above the blocking owner remain operable,
  including when modality changes. Closing, unmounting, or changing modality
  transfers enforcement without making background content live for a frame or
  inerting the Drawer that remains visually in front.
- **FR23 — Unrelated scopes do not become one stack.** Drawers in different
  regional targets MUST NOT change one another's stack ordering, any depth
  treatment built on that ordering, regional blocking, or regional geometry. While a viewport `showModal()` Drawer is active, a
  regional target outside that modal's DOM subtree is part of the blocked
  document and cannot host an operable Drawer above it. A target inside the
  active modal subtree remains operable and may host a regional child only under
  the accepted explicit owner/branch relationship. OQ4 decides whether the
  initial Core contract supports that nested case or prohibits mixed-scope
  drill-in until the association is available.
- **FR24 — Dismissal follows the shared family contract.** Drawer participates in
  `family:overlay-dismissal`: one Escape or platform close request affects only
  the topmost eligible surface. Local stacking behavior MUST NOT bypass a deeper
  nested overlay or close two surfaces from one request.
- **FR25 — Open state remains caller-owned.** Dismissal requests call
  `onOpenChange(false)`; they do not make native dialog state a second source of
  truth. Controlled state decides whether the Drawer stays open.
- **FR26 — Focus entry and return match the active scope.** On open, focus enters
  the Drawer through its documented autofocus/default path. On final close,
  focus returns to the captured opener when that target is still connected and
  eligible. A live modality change MUST NOT replace the original focus-return
  target.

### Implementation boundaries

- **IR1 — Presentation does not select modality.** Scope and the accepted modality
  concept jointly select the documented viewport or regional enforcement path.
  Scrim presentation MUST NOT silently select or change modality. Portal
  placement, document-modal hosting, regional blocking, and scroll locking remain
  implementation mechanisms rather than additional public concepts.
- **IR2 — Browser-owned state is reconciled.** Switching a rendered viewport
  Drawer between modal and non-modal presentation, if supported, MUST reconcile
  `showModal()` and `show()` without leaving stale native state or firing an
  extra consumer close.
- **IR3 — Regional resource cost is bounded.** Regional synchronization runs only
  while presentation needs it, does not make component-render work proportional
  to scroll input, and releases all target-owned resources after exit, target
  loss, or unmount.
- **IR4 — Shared architecture stays authoritative.** Drawer-specific code may
  own panel geometry, regional blocking, and whether a visible modal scrim
  dismisses. Shared eligible-owner and associated-branch resolution, gesture
  claims, and modal outlets remain owned by `spec:AST-003`; current
  Escape/platform membership remains owned by `family:overlay-dismissal`; and
  document-level hosting rules remain owned by `architecture:layer-runtime`.
- **IR5 — Consumer documentation states semantic differences.** Drawer docs must
  explain what scope, modality, and scrim each mean; which combinations are
  supported; why a regional modal is not `aria-modal`; how background and Drawer
  scrolling behave; what target stability is required; and how stacking and
  dismissal work. Docs MUST NOT describe portal wrappers, registries, or
  observers as API.

### Platform support

- Supported feature/engine floor: Astryx browser-support Tier 1 and Tier 2,
  including native dialog support and standards-based `inert` on supported
  regional-modal paths.
- Unsupported behavior: a browser without the required regional blocking
  primitive MUST NOT present a visually modal regional Drawer while leaving its
  background operable. The implementation must fail closed, choose a documented
  non-modal fallback, or hold promotion until support exists; silent partial
  modality is not allowed.
- Browser evidence: native top-layer behavior, focus containment and return,
  accessibility-tree exclusion, inert stacking, scrollport geometry, pointer hit
  testing, live modality changes, and exit timing require real Chromium and real
  Safari evidence. jsdom assertions alone are not sufficient.

## Current-state impact

Current `main` has a private Lab Drawer with viewport-only scope. Its public
`hasScrim` prop combines three outcomes: scrim paint, `showModal()` versus
`show()`, and body/focus blocking. It maintains a Drawer-local open-order stack
for Escape and non-modal z-index, while `family:overlay-dismissal` records Drawer
as a local-only adoption gap.

#5550 proposes the candidate API in this spec:

```ts
containerRef?: React.RefObject<HTMLElement | null>;
modality?: 'modal' | 'nonModal';
hasScrim?: boolean;
```

It demonstrates regional geometry, scoped blocking, late-content handling, live
modality changes, and stacked regional Drawers. Review also exposes four
contract gaps that an accepted implementation must close:

1. a region root's own interaction cannot be blocked by inerting only its
   children while the Drawer remains inside that same subtree;
2. mutating `RefObject.current` between already-connected elements is not a
   reactive host-change signal;
3. paint and enforcement can disagree after a live modality change; and
4. a viewport modal with `hasScrim={false}` can still dismiss from an invisible
   native backdrop while the equivalent regional state does not.

#5652 builds visual recede depth on the same stack and shows the related scope
boundary: unrelated Drawers in separate regional targets must not affect one
another's depth or interaction. These are contract gaps captured by FR3, FR5,
FR7, FR10, FR14, and FR21–FR23, not decisions to preserve a particular portal,
registry, or observer implementation.

The proposal changes Lab-only API and therefore has no released migration
obligation today. Planned Core promotion changes that bar: the accepted component
contract, consumer docs, cross-overlay naming, and family adoption must be in
place before release.

Current architecture remains authoritative:

- `architecture:public-component-api` and `spec:AST-002` own prop admission,
  caller intent, understandable semantics, and dependable outcomes;
- `architecture:layer-runtime` owns the distinction between DOM hosting, portals,
  native top-layer promotion, and current dismissal plumbing;
- `spec:AST-003` owns the accepted eligible-owner and associated-branch
  resolvers, pointer-gesture claims, migration of local Drawer dismissal, and
  modal outlets for admitted global systems; and
- `family:overlay-dismissal` owns membership and topmost Escape/platform-close
  behavior while leaving focus, modality, positioning, and outside-dismiss policy
  to the component.

These current records do not backlink to this draft. If AST-007 is accepted, the
implementation change must update the affected current architecture/family and
Drawer component records only when the behavior and verification are ready to
ship.

### Compatibility and migration

- Drawer is private in `@astryxdesign/lab`; the proposal may remove or replace
  its current `hasScrim` semantics before Core promotion without a published
  package migration.
- Existing omitted/default usage remains modal with a visible scrim under the
  candidate API.
- Existing `hasScrim={false}` callsites require an explicit semantic migration:
  use `modality="nonModal"` when the intended meaning is background availability,
  and set `hasScrim={false}` only when the intended meaning is no dimming.
- No automated migration should guess between those intents from syntax alone.
  Branch-owned examples and callsites may be migrated with human-reviewed intent.
- If modality and scrim remain independent for Drawer and later become a
  sheet-family convention, BottomSheet requires a separate public compatibility
  plan because it is already released and currently uses `hasScrim` as a combined
  semantic switch.
- This specification-only pull request has no Changeset. A later released package
  change supplies the appropriate Changeset and migration guidance.

### Rollout order

1. Resolve OQ1–OQ4 and promote AST-007 only with exact-head owner approval.
2. Align #5550 with the accepted API and semantics, including region-root
   blocking, stable target lifetime, regional scroll blocking, invisible-scrim
   dismissal, scope isolation, and live-modality stacking cases.
3. Add or update `component:Drawer` to own the complete component-level contract
   and link accepted AST-007 decisions without duplicating this system rationale.
4. Adopt `spec:AST-003`'s shared eligible-owner, associated-branch, gesture-claim,
   and modal-outlet infrastructure as that accepted migration reaches Drawer.
   This spec supplies Drawer policy and regional stack inputs; it does not create
   a parallel migration owner.
5. Run the unit, mutation, and real-browser matrices below in viewport and
   regional scopes.
6. Update affected current architecture/family records when implementation and
   verification agree, then complete Core promotion and release documentation in
   a separate change.
7. Decide BottomSheet consistency through its own compatibility review if OQ2
   accepts independent modality and scrim as the intended sheet-family model.

## Verification

| Contract  | Verification                                      | Representative states                                                                                                                           | Mutation or failure expectation                                                                                                                                                                               |
| --------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR7   | Type-level, docs, and controlled-render tests     | omitted/default; each explicit scope/modality/scrim value; missing, stable, and detached target                                                 | Scope silently changes modality/presentation, a target disappears without cleanup, or an unsupported combination partially works.                                                                             |
| FR8–FR14  | Real-browser interaction and accessibility matrix | viewport/regional × modal/non-modal × scrim/clear; interactive region root; late child; pre-inert child; same-gesture trigger; global outlet    | Pointer, keyboard, scroll, focus, and accessibility availability disagree; regional mode claims document modality; invisible presentation dismisses; the same press reopens; an admitted global falls behind. |
| FR15–FR20 | Real-browser geometry, performance, and lifecycle | static and scrolling target; modal scroll input; resize; narrow region; unopened N=1/3/10; target detachment; reduced motion                    | Panel moves with content, escapes clipping, performs ongoing closed work, leaves stale blocking, scrolls blocked background, or releases before exit.                                                         |
| FR21–FR23 | Stacked Drawer browser matrix and mutation tests  | two/three Drawers; unrelated targets; mixed modality; front/rear close; live modality flip; regional target inside/outside active modal subtree | Unrelated stacks affect each other, paint and enforcement diverge, the front Drawer becomes inert, or a regional Drawer crosses a document-modal boundary without association.                                |
| FR24–FR26 | Shared owner/branch dismissal and focus tests     | Drawer over/under Dialog, Popover, Tooltip, and another Drawer; controlled close; scrim branch; detached opener                                 | One Escape closes two surfaces, outside interaction uses visual order, a gesture reopens, native state overrides the caller, or focus returns to the wrong target.                                            |
| IR1–IR4   | Source-ownership, resource, and mutation audit    | hosting/document-modal/blocking/scrim/scroll-lock paths; inactive/active resource lifetime; shared-stack registration                           | One presentation flag silently selects modality, scroll input drives proportional render work, resources leak, or Drawer bypasses shared ordering.                                                            |
| IR5       | Consumer-doc and CLI snapshot checks              | default, regional inspector, non-modal inspector, accepted independent combinations                                                             | Docs teach implementation mechanics, omit the regional accessibility boundary, or describe unsupported combinations.                                                                                          |

### Completion criteria

AST-007 may move from `accepted` to `shipped` only when:

- the public scope, modality, and scrim concepts—and whether the latter two are
  independent—are explicitly accepted;
- every supported combination has matching pointer, keyboard, scrolling, focus,
  and accessibility behavior in viewport and regional scope;
- regional geometry remains fixed to the target scrollport through scroll,
  resize, narrow-region, target-detachment, and exit cases;
- a regional modal includes the target root and descendants in its blocking
  boundary while the Drawer itself remains operable outside that blocked subtree;
- one ordering governs paint, direct panel input, blocking, and ownership transfer
  for related stacked Drawers, including live modality changes, while shared
  resolvers govern dismissal and unrelated regional targets remain independent;
- the accepted mixed-scope rule distinguishes regional targets inside versus
  outside an active document-modal subtree and rejects any unsupported
  association;
- preexisting and late inert content is preserved and cleaned up correctly;
- closed regional Drawers perform no ongoing target work and active regional
  resources clean up after exit, target loss, and unmount;
- Drawer adopts `spec:AST-003`'s eligible-owner and associated-branch
  coordination, claims visible-scrim pointer dismissals before closing, and
  supplies the required outlet while it is a viewport native modal, without
  regressing nested overlays or global systems;
- real Chromium and real Safari evidence covers native and regional paths; and
- the current Drawer component record, affected architecture/family records, and
  consumer guidance describe the shipped result.

## Decision log

No decision below is accepted while this record has `authority: draft`.

### Proposed DEC-1 — Make regional ownership an explicit Drawer scope

**Reference:** `spec:AST-007/DEC-1`
**Status:** proposed; requires OQ1

Add one explicit regional target. Omission keeps the current viewport scope;
`containerRef` identifies the stable region whose edge, scrollport, presentation,
and background availability the Drawer owns. It does not require the panel to be
mounted inside the subtree that regional modality blocks. Scope does not select
modality or scrim presentation.

Recommended because the same pane can host either a page-level or pane-level
inspector and Drawer cannot derive product ownership from geometry. Recommended
over a boolean `contained` mode because the component needs the actual owner, not
just a rendering hint. Existing `LayoutPanel` composition is not equivalent: it
owns a persistent in-flow region that reserves space, while Drawer temporarily
overlays one region without reflowing it.

### Proposed DEC-2 — Keep scope, modality, and scrim as separate concepts

**Reference:** `spec:AST-007/DEC-2`
**Status:** proposed; requires OQ2 and OQ3

Use `containerRef` for where, `modality` for whether scoped background content is
available, and `hasScrim` for whether a visible scrim is presented. A visible
modal scrim may own outside-pointer dismissal; it does not own modality. The
default scrim follows modality so ordinary callers set neither or only modality.

Recommended because the three concepts have different mechanisms and observable
outcomes, and because scope must not silently change semantics. Not yet accepted:
independent modality and scrim add states whose durable product need and
cross-sheet consistency require owner judgment under `spec:AST-002`.

### Proposed DEC-3 — Define regional modal as a scoped blocking guarantee

**Reference:** `spec:AST-007/DEC-3`
**Status:** proposed; requires OQ3

A regional modal makes the target root and background descendants unavailable
through a scoped blocking boundary while leaving the rest of the document live.
The Drawer stays outside the blocked subtree. It never claims `aria-modal`, uses
`showModal()`, or locks body scroll.

Recommended over silently downgrading regional mode to non-modal because scope
would otherwise change the meaning of the modality choice. The public name remains
open because platform and accessibility terminology usually reserve “modal” for a
document-level boundary.

### Proposed DEC-4 — Isolate logical stacks by scope

**Reference:** `spec:AST-007/DEC-4`
**Status:** proposed; requires OQ4

Drawers in one viewport flow or one regional target may form a logical stack;
unrelated regional targets do not. Within that stack, one visible order governs
paint, regional blocking, and handoff, while shared resolvers govern dismissal.
A regional target outside an active `showModal()` subtree remains blocked by that
document modal. A target inside the modal subtree may host a regional child only
through the accepted explicit owner/branch relationship.

Recommended because a global Drawer registry makes unrelated inspectors affect
one another, while two independently updated visual/enforcement orders can make
the visible front Drawer inert. Shared eligible-owner, branch, gesture-claim, and
modal-outlet behavior remains the already settled responsibility of
`spec:AST-003`.

## Open questions

- **OQ1 — Should Drawer expose
  `containerRef?: React.RefObject<HTMLElement | null>` as the explicit
  caller-owned regional target, with viewport scope on omission, a target that
  remains stable through the rendered lifetime, and no requirement that the
  panel mount inside the subtree it blocks?** (`human-api`) Cindy owns prop
  admission and naming; Ruby owns the pane-inspector experience; Ivor owns target
  lifetime and geometry. The recommendation is Proposed DEC-1.
- **OQ2 — Should `modality` and `hasScrim` remain independent public concepts,
  supporting modal-without-scrim and non-modal-with-scrim, or should Drawer expose
  one combined modal-presentation choice?** (`human-api`) Under the independent
  proposal, `hasScrim` also decides whether a visible modal outside-pointer
  dismissal plane exists; it still does not decide modality. Cindy owns API and
  cross-overlay consistency; Ruby owns whether the separated states communicate
  correctly; Ivor owns the behavioral contract. If independent axes are accepted,
  each state must satisfy FR5, FR6, FR13, and FR14, and BottomSheet needs a later
  compatibility decision rather than an automatic rename.
- **OQ3 — Should a region-scoped blocking state be publicly named `modal` even
  though it is not an ARIA modal, does not use `showModal()` or establish the
  document modal boundary, does not trap the rest of the document, and does not
  lock body scroll?** (`human-api`) The recommendation is to keep one semantic
  name only if docs state that modality is relative to the declared scope;
  otherwise choose terminology that cannot be mistaken for document modality.
- **OQ4 — Should the initial Core contract support a regional Drawer whose target
  is inside an active viewport modal subtree as an explicitly associated child
  branch, or prohibit that mixed-scope drill-in until the association ships?**
  (`human-api`) A target outside the active modal subtree is already blocked and
  cannot host an operable Drawer above it. The recommendation is to support the
  inside-subtree case only through `spec:AST-003`'s explicit owner/branch model
  and otherwise prohibit it; a global open-order registry is not sufficient.
  Drawer joining the shared Escape/platform-close owner is already required and
  is not reopened here.
