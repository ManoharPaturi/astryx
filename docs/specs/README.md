# System specs

This directory contains records for consequential shared-system changes. Each
spec lives under `docs/specs/AST-NNN/spec.md`; an optional sibling `plan.md`
is used only for multi-step implementation.

Templates live separately under `docs/templates/knowledge/`. Existing records
are validated against `docs/schemas/knowledge/`; changing a template does not
silently change accepted history.

A system spec is appropriate when work changes more than one component, a
shared primitive, architecture, public API policy, theming, accessibility
policy, distribution, or lifecycle. Focused fixes that restore an existing
contract do not need a new spec.

Only records with `authority: current` are authoritative. Draft records may
carry unresolved evidence or owner decisions; they do not govern review.
Archived records state why they no longer govern and link a replacement when
one exists. Initial promotion to `current` requires explicit owner approval.

## Reserve an ID

Run `pnpm spec:id` before starting a system spec. The read-only default checks
landed specs and complete file inventories for every open pull request, then
prints the lowest available ID at or above the next landed number. Run
`pnpm spec:id -- --write` to scaffold that proposal from the system-spec
template.

An ID is reserved only after a pull request adds or renames its exact
`docs/specs/AST-NNN/spec.md` path. Re-run the helper immediately before opening
the pull request. The **Spec ID collision** check rejects duplicate open
reservations; when that happens, re-run the helper and move the spec to its new
suggested path. Changes to an ID that already exists on `main` are not new
reservations.
