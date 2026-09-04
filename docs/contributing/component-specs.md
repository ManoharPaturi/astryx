# Writing component specifications

Use this guide to create or complete an Astryx component contract. It is a
practical workflow, not product authority. Only repository records whose front
matter says `authority: current` govern implementation and review.

## Know which document owns the fact

Start with the narrowest canonical owner:

- `packages/{core,lab}/src/<Name>/<Name>.spec.md` owns aggregate behavior one
  component promises. These are the component-record locations the current
  knowledge tooling validates.
- A nested `kind: module` record owns an independently contractible public hook,
  plugin, utility, or subsystem.
- `docs/families/` owns behavior shared by sibling components.
- `docs/design/` owns human-selected visual and interaction requirements.
- `docs/architecture/` owns shipped cross-component mechanics and invariants.
- `docs/specs/AST-*` records consequential system decisions.
- `<Name>.doc.mjs` owns consumer syntax, prop reference, and usage examples.
- Audit records own current measurements and findings.

Do not copy a family, design, architecture, system, consumer-doc, or audit fact
into the component contract. Link its current owner and record only the
component-local adoption, addition, or approved exception.

## Start or recover the record

1. Look for `<Name>.spec.md` directly under the component root. A public member
   uses its own record only when the repository's public-name rules permit it.
2. If the file is missing, copy
   [`docs/templates/knowledge/component-spec.md`](../templates/knowledge/component-spec.md)
   into the component root. Keep it `authority: draft` while evidence or owner
   decisions remain unresolved.
3. If the file exists, compare it with the latest component schema and template.
   Add missing contract content without rewriting accepted history merely because
   template guidance changed.
4. Preserve the canonical `component:<Name>` id, real owners, review triggers,
   verification targets, and typed relationships.

The [knowledge map](../README.md) defines valid locations and names. The current
[knowledge contract](../architecture/knowledge-contracts.md) defines authority,
approval, conflict handling, and schema migration.

## Gather evidence without inventing intent

Read the component's public docs, exported types, source, tests, stories, release
history, and supported call sites. Then separate three kinds of claims:

- **Settled:** a current owner record, standard, or explicit approved decision
  already establishes the requirement.
- **Checkable:** source, tests, or rendered evidence can establish what happens,
  but observation alone does not prove that behavior was intentionally promised.
- **Human decision:** API meaning, ownership, compatibility, or subjective visual
  direction still needs an authorized owner.

Existing code, a merged pull request, popularity, and silence do not turn an
observed behavior into policy. Put unresolved claims in the draft requirement
basis/review-state columns or in **Open questions** rather than upgrading them.

## Fill the contract

Work through the component template in order:

1. **Intent and ownership boundary.** State the component's system job, what it
   owns, and what another component, family, system, or product owns instead.
2. **Compatibility and migration.** State released defaults, observable
   compatibility, controlled/uncontrolled behavior, and any deciding record.
3. **Public concepts.** Describe semantic concepts, closed values, defaults,
   invalid behavior, and stability. Keep prop tables and examples in `.doc.mjs`.
4. **Behavior and layout.** Write explicit requirements with their basis,
   conditions, exceptions, allowed variation, representative states, precedence,
   and durable performance/resource constraints.
5. **Accessibility and design relationships.** Link applicable standards and
   current design requirements. Do not use principles to invent an unsettled
   representation.
6. **Theming anatomy.** When present, map every exact consumer-facing anatomy name
   to one target, inheritance, delegation, or factual `none` disposition.
7. **Relationships.** Link only applicable current family, design, architecture,
   contributing, and system records. Structural module backlinks may connect
   active draft records as the knowledge contract permits.
8. **Verification map.** Connect each requirement to a test, browser receipt, or
   other evidence that would fail if the contract regressed.
9. **Decision log and open questions.** Record durable approved boundaries and
   consequential rejected alternatives. Keep review transcripts and speculative
   choices out of the contract.

Use short, direct sentences, but preserve normative verbs, qualifiers,
conditions, exceptions, ownership, and evidence state. The template's 200-line
target is a readability aid, never permission to delete contract content.

## Resolve and approve

A draft is useful context but cannot clear a review or audit finding as settled
policy. For every unresolved row:

1. Resolve checkable facts from focused tests, source, or rendered evidence.
2. Route genuine API, ownership, compatibility, or visual decisions to an
   authorized owner.
3. Update the canonical owner rather than adding a local override.
4. Remove or clearly retain rejected implementation only when the rejected
   boundary is consequential and likely to recur.
5. Promote to `authority: current` only after the contract, relationships,
   verification, prerequisites, and exact-head approval are complete.

When current records conflict, stop. Do not choose by recency, specificity, or
path proximity; follow the conflict process in the knowledge contract.

## Use this flow during a component audit

A whole-component audit starts from the component contract, not from the wiki
checklist. If the contract is missing or incomplete, create or complete it first.
Registered standalone packages whose canonical component-record location is not
yet supported remain visible in the ledger but stay out of the automated queue;
treat that as one system-level specification gap rather than auditing without a
contract. Then:

1. Read the nearest current component or module contract.
2. Follow its links to applicable current family, design, architecture, and system
   records.
3. Use the public Component Audit Rubric for audit procedure, evidence, scoring,
   and ledger format—not as reusable product authority.
4. Score only claims a current record, standard, or checkable evidence can settle.
   Keep unresolved human decisions explicit; never infer the intended answer from
   the implementation being audited.

## Validate before review

Run:

```bash
pnpm check:knowledge
```

Also run the focused tests or browser checks named in `verified_by` and the
verification map. A pure spec-record change needs no Changeset. Any guidance,
template, schema, audit, code, or mixed change runs normal CI. Request the
required owner approval on the exact final head before treating the record as
current.
