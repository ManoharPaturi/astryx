// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @input A review-signal event identity, the current PR head, and a proposed mutation.
 * @output A fail-closed event plan and a current-head-guarded mutation result.
 * @position Trusted policy shared by review-signal.yml and its workflow contract tests.
 *
 * SYNC: review-signal.yml loads this file with new Function(module, exports,
 * require) — keep it dependency-free CJS with a plain module.exports object.
 */

const EFFECT_BEARING_PULL_REQUEST_ACTIONS = new Set([
  'opened',
  'synchronize',
  'reopened',
]);

function reviewSignalEventPlan({
  eventName,
  eventAction,
  eventHeadSha,
  currentHeadSha,
}) {
  if (eventName === 'workflow_dispatch') {
    return {shouldMutate: true, reason: 'manual-dispatch'};
  }
  if (eventName !== 'pull_request_target') {
    return {shouldMutate: false, reason: 'non-mutating-event'};
  }
  if (!EFFECT_BEARING_PULL_REQUEST_ACTIONS.has(eventAction)) {
    return {shouldMutate: false, reason: 'no-op-action'};
  }
  if (!eventHeadSha || !currentHeadSha || eventHeadSha !== currentHeadSha) {
    return {shouldMutate: false, reason: 'superseded-head'};
  }
  return {shouldMutate: true, reason: 'current-head'};
}

async function mutateIfCurrentHead({expectedHead, getCurrentHead, mutate}) {
  if (
    !expectedHead ||
    typeof getCurrentHead !== 'function' ||
    typeof mutate !== 'function'
  ) {
    throw new TypeError(
      'mutateIfCurrentHead requires an expected head and read/mutation functions.',
    );
  }
  const currentHead = await getCurrentHead();
  if (currentHead !== expectedHead) {
    return {applied: false, currentHead};
  }
  await mutate();
  return {applied: true, currentHead};
}

module.exports = {
  mutateIfCurrentHead,
  reviewSignalEventPlan,
};
