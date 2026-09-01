// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global module, require */

const {
  listLandedSpecIds,
  loadOpenPullRequests,
  reservedSpecIds,
} = require('../../scripts/lib/spec-id.cjs');

function checkSpecIdCollisions({
  openPulls,
  currentPullNumber,
  expectedHeadOid,
  landedIds,
}) {
  const current = openPulls.find(pull => pull.number === currentPullNumber);
  if (!current) {
    throw new Error(
      `PR #${currentPullNumber} is not in the open-PR inventory.`,
    );
  }
  if (current.headRefOid !== expectedHeadOid) {
    throw new Error(
      `PR #${currentPullNumber} moved from ${expectedHeadOid} to ${current.headRefOid}; rerun on the latest head.`,
    );
  }

  const candidateIds = reservedSpecIds(current.files, landedIds);
  const conflicts = [];
  for (const id of candidateIds) {
    const pulls = openPulls.filter(
      pull =>
        pull.number !== currentPullNumber &&
        reservedSpecIds(pull.files, landedIds).includes(id),
    );
    if (pulls.length > 0) conflicts.push({id, pulls});
  }
  return {candidateIds, conflicts};
}

function formatConflictMessage(conflicts) {
  const lines = ['System-spec ID reservation collision:'];
  for (const {id, pulls} of conflicts) {
    for (const pull of pulls) {
      lines.push(
        `- ${id} is also reserved by #${pull.number}: ${pull.title} (${pull.url})`,
      );
    }
  }
  lines.push(
    '',
    'Run `pnpm spec:id` again, move the new spec to the suggested path, update its frontmatter ID, and push.',
  );
  return lines.join('\n');
}

async function runSpecIdCollisionGate({github, context, core, root}) {
  const eventPull = context.payload.pull_request;
  if (!eventPull) throw new Error('This check requires a pull_request event.');
  const {owner, repo} = context.repo;
  if (eventPull.base?.repo?.full_name !== `${owner}/${repo}`) {
    throw new Error(
      'The event repository does not match the checked repository.',
    );
  }

  const openPulls = await loadOpenPullRequests({
    owner,
    repo,
    graphql: (query, variables) => github.graphql(query, variables),
  });
  const result = checkSpecIdCollisions({
    openPulls,
    currentPullNumber: eventPull.number,
    expectedHeadOid: eventPull.head.sha,
    landedIds: listLandedSpecIds(root),
  });

  if (result.conflicts.length > 0) {
    core.setFailed(formatConflictMessage(result.conflicts));
  } else if (result.candidateIds.length > 0) {
    core.info(`Reserved by this PR: ${result.candidateIds.join(', ')}`);
  } else {
    core.info('This PR does not reserve a new system-spec ID.');
  }
  return result;
}

module.exports = {
  checkSpecIdCollisions,
  formatConflictMessage,
  runSpecIdCollisionGate,
};
