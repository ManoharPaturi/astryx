// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Pure projection of parent-owned anatomy and theming targets onto a
 * sibling member's read-only documentation view.
 */

/**
 * Find the explicit parent-owned projection for one member.
 *
 * @param {any} parentDoc
 * @param {string} childName
 * @returns {{anatomy?: string[], targets?: string[]} | null}
 */
export function findParentOwnedMemberProjection(parentDoc, childName) {
  const matches = (parentDoc?.components ?? []).filter(
    (/** @type {any} */ component) => component?.name === childName,
  );
  if (matches.length > 1) {
    throw projectionError(
      parentDoc,
      childName,
      `the parent lists this member ${matches.length} times`,
    );
  }
  const projection = matches[0]?.projection;
  if (projection == null) return null;
  if (typeof projection !== 'object' || Array.isArray(projection)) {
    throw projectionError(parentDoc, childName, 'projection must be an object');
  }
  const unknownKeys = Object.keys(projection).filter(
    key => key !== 'anatomy' && key !== 'targets',
  );
  if (unknownKeys.length > 0) {
    throw projectionError(
      parentDoc,
      childName,
      `unknown projection field ${JSON.stringify(unknownKeys[0])}`,
    );
  }
  return projection;
}

/**
 * Materialize the read-only member view selected by its parent ComponentRef.
 * Selectors are resolved against canonical docs; optional localized views supply
 * only the displayed entries. Authored inputs are never mutated.
 *
 * @param {any} parentDoc
 * @param {any} childDoc
 * @param {{parentView?: any, childView?: any}} [views]
 * @returns {any}
 */
export function projectParentOwnedMemberDoc(
  parentDoc,
  childDoc,
  {parentView = parentDoc, childView = childDoc} = {},
) {
  const childName = childDoc?.name;
  const projection = findParentOwnedMemberProjection(parentDoc, childName);
  if (projection == null) return childView;

  if (childDoc?.subComponentOf !== parentDoc?.name) {
    throw projectionError(
      parentDoc,
      childName,
      `child subComponentOf must be ${JSON.stringify(parentDoc?.name)}`,
    );
  }

  const projectedAnatomy = selectParentEntries({
    parentDoc,
    childName,
    selectors: projection.anatomy,
    entries: parentDoc?.usage?.anatomy,
    selectorLabel: 'anatomy',
    entryKey: 'name',
  });
  const projectedAnatomyView = presentSelectedEntries(
    projectedAnatomy,
    parentDoc?.usage?.anatomy,
    parentView?.usage?.anatomy,
  );
  const projectedTargets = selectParentEntries({
    parentDoc,
    childName,
    selectors: projection.targets,
    entries: parentDoc?.theming?.targets,
    selectorLabel: 'target',
    entryKey: 'className',
  });
  const projectedTargetsView = presentSelectedEntries(
    projectedTargets,
    parentDoc?.theming?.targets,
    parentView?.theming?.targets,
  );

  const childAnatomy = childDoc?.usage?.anatomy ?? [];
  rejectChildDuplicates({
    parentDoc,
    childName,
    childEntries: childAnatomy,
    projectedEntries: projectedAnatomy,
    selectorLabel: 'anatomy',
    entryKey: 'name',
  });
  const childTargets = childDoc?.theming?.targets ?? [];
  rejectChildDuplicates({
    parentDoc,
    childName,
    childEntries: childTargets,
    projectedEntries: projectedTargets,
    selectorLabel: 'target',
    entryKey: 'className',
  });

  const childAnatomyView = childView?.usage?.anatomy ?? childAnatomy;
  const childTargetsView = childView?.theming?.targets ?? childTargets;
  const projected = {...childView};
  if (projectedAnatomyView.length > 0) {
    projected.usage = {
      ...(childView.usage ?? {description: childView.description}),
      anatomy: [...childAnatomyView, ...projectedAnatomyView],
    };
  }
  if (projectedTargetsView.length > 0) {
    projected.theming = {
      ...childView.theming,
      targets: [...childTargetsView, ...projectedTargetsView],
    };
  }
  return projected;
}

/**
 * Remove projection-only authoring metadata from a public parent doc.
 *
 * @param {any} parentDoc
 * @returns {any}
 */
export function stripMemberProjectionMetadata(parentDoc) {
  if (!Array.isArray(parentDoc?.components)) return parentDoc;
  let changed = false;
  const components = parentDoc.components.map((/** @type {any} */ component) => {
    if (component?.projection === undefined) return component;
    changed = true;
    const {projection: _projection, ...publicComponent} = component;
    return publicComponent;
  });
  return changed ? {...parentDoc, components} : parentDoc;
}

/**
 * Resolve exact selected parent entries while preserving parent order.
 *
 * @param {{
 *   parentDoc: any,
 *   childName: string,
 *   selectors: unknown,
 *   entries: unknown,
 *   selectorLabel: string,
 *   entryKey: string,
 * }} options
 * @returns {any[]}
 */
function selectParentEntries({
  parentDoc,
  childName,
  selectors,
  entries,
  selectorLabel,
  entryKey,
}) {
  if (selectors === undefined) return [];
  if (!Array.isArray(selectors)) {
    throw projectionError(
      parentDoc,
      childName,
      `${selectorLabel} selectors must be an array`,
    );
  }
  const duplicateSelectors = selectors.filter(
    (selector, index) => selectors.indexOf(selector) !== index,
  );
  if (duplicateSelectors.length > 0) {
    throw projectionError(
      parentDoc,
      childName,
      `duplicate ${selectorLabel} selector ${JSON.stringify(duplicateSelectors[0])}`,
    );
  }

  const sourceEntries = Array.isArray(entries) ? entries : [];
  for (const selector of selectors) {
    if (typeof selector !== 'string') {
      throw projectionError(
        parentDoc,
        childName,
        `${selectorLabel} selectors must be strings`,
      );
    }
    const matches = sourceEntries.filter(entry => entry?.[entryKey] === selector);
    if (matches.length !== 1) {
      throw projectionError(
        parentDoc,
        childName,
        `${selectorLabel} selector ${JSON.stringify(selector)} matched ${matches.length} parent entries; expected exactly one`,
      );
    }
  }

  const selected = new Set(selectors);
  return sourceEntries.filter(entry => selected.has(entry?.[entryKey]));
}

/**
 * Return the presentation entry at each selected canonical index.
 *
 * @param {any[]} selected
 * @param {unknown} canonicalEntries
 * @param {unknown} presentedEntries
 * @returns {any[]}
 */
function presentSelectedEntries(selected, canonicalEntries, presentedEntries) {
  if (!Array.isArray(presentedEntries)) return selected;
  const canonical = Array.isArray(canonicalEntries) ? canonicalEntries : [];
  return selected.map(entry => {
    const index = canonical.indexOf(entry);
    return presentedEntries[index] ?? entry;
  });
}

/**
 * Reject a selected entry that remains independently authored by the child.
 *
 * @param {{
 *   parentDoc: any,
 *   childName: string,
 *   childEntries: any[],
 *   projectedEntries: any[],
 *   selectorLabel: string,
 *   entryKey: string,
 * }} options
 * @returns {void}
 */
function rejectChildDuplicates({
  parentDoc,
  childName,
  childEntries,
  projectedEntries,
  selectorLabel,
  entryKey,
}) {
  const projectedKeys = new Set(projectedEntries.map(entry => entry?.[entryKey]));
  const duplicate = childEntries.find(entry => projectedKeys.has(entry?.[entryKey]));
  if (duplicate) {
    throw projectionError(
      parentDoc,
      childName,
      `child authors projected ${selectorLabel} ${JSON.stringify(duplicate[entryKey])}; it is owned by the parent`,
    );
  }
}

/**
 * @param {any} parentDoc
 * @param {string} childName
 * @param {string} detail
 * @returns {Error}
 */
function projectionError(parentDoc, childName, detail) {
  return new Error(
    `Invalid component projection ${JSON.stringify(parentDoc?.name)} -> ${JSON.stringify(childName)}: ${detail}.`,
  );
}
