// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @input The review-signal event policy and trusted workflow source.
 * @output Regression coverage for duplicate events, superseded heads, and guarded writes.
 * @position Mutation-sensitive contract tests for review-signal.yml.
 */

import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  mutateIfCurrentHead,
  reviewSignalEventPlan,
} = require('./review-signal-policy.cjs');

const HEAD = 'a'.repeat(40);
const NEW_HEAD = 'b'.repeat(40);
const WORKFLOW = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../workflows/review-signal.yml',
);

function pullRequestPlan(
  eventAction,
  eventHeadSha = HEAD,
  currentHeadSha = HEAD,
) {
  return reviewSignalEventPlan({
    eventName: 'pull_request_target',
    eventAction,
    eventHeadSha,
    currentHeadSha,
  });
}

describe('review signal event policy', () => {
  it('runs only the effect-bearing event in the synchronize plus ready duplicate', () => {
    expect(pullRequestPlan('synchronize')).toEqual({
      shouldMutate: true,
      reason: 'current-head',
    });
    expect(pullRequestPlan('ready_for_review')).toEqual({
      shouldMutate: false,
      reason: 'no-op-action',
    });
  });

  it('skips an effect-bearing event after its head is superseded', () => {
    expect(pullRequestPlan('synchronize', HEAD, NEW_HEAD)).toEqual({
      shouldMutate: false,
      reason: 'superseded-head',
    });
  });

  it('keeps current head updates and explicit recovery effect-bearing', () => {
    expect(pullRequestPlan('opened').shouldMutate).toBe(true);
    expect(pullRequestPlan('reopened').shouldMutate).toBe(true);
    expect(
      reviewSignalEventPlan({eventName: 'workflow_dispatch'}).shouldMutate,
    ).toBe(true);
  });
});

describe('review signal mutation guard', () => {
  it('applies an effect for the current head', async () => {
    const writes = [];
    const result = await mutateIfCurrentHead({
      expectedHead: HEAD,
      getCurrentHead: async () => HEAD,
      mutate: async () => writes.push('status'),
    });

    expect(result).toEqual({applied: true, currentHead: HEAD});
    expect(writes).toEqual(['status']);
  });

  it('does not write after the planned head has been superseded', async () => {
    const plan = pullRequestPlan('synchronize');
    expect(plan.shouldMutate).toBe(true);
    const writes = [];

    const result = await mutateIfCurrentHead({
      expectedHead: HEAD,
      getCurrentHead: async () => NEW_HEAD,
      mutate: async () => writes.push('stale-status'),
    });

    expect(result).toEqual({applied: false, currentHead: NEW_HEAD});
    expect(writes).toEqual([]);
  });

  it('rechecks the head before every separate mutation', async () => {
    let currentHead = HEAD;
    const writes = [];
    const first = await mutateIfCurrentHead({
      expectedHead: HEAD,
      getCurrentHead: async () => currentHead,
      mutate: async () => writes.push('label'),
    });
    currentHead = NEW_HEAD;
    const second = await mutateIfCurrentHead({
      expectedHead: HEAD,
      getCurrentHead: async () => currentHead,
      mutate: async () => writes.push('status'),
    });

    expect(first.applied).toBe(true);
    expect(second.applied).toBe(false);
    expect(writes).toEqual(['label']);
  });
});

describe('review signal workflow contract', () => {
  it('loads the policy through the dependency-free trusted-base boundary', () => {
    const source = fs.readFileSync(
      fileURLToPath(new URL('./review-signal-policy.cjs', import.meta.url)),
      'utf8',
    );
    const mod = {exports: {}};
    new Function('module', 'exports', 'require', source)(
      mod,
      mod.exports,
      () => {
        throw new Error('review-signal-policy.cjs must stay dependency-free');
      },
    );

    expect(mod.exports.reviewSignalEventPlan).toBeTypeOf('function');
    expect(mod.exports.mutateIfCurrentHead).toBeTypeOf('function');
  });

  it('does not start lifecycle-only duplicates or let review anchors cancel flagging', () => {
    const workflow = fs.readFileSync(WORKFLOW, 'utf8');
    const [header, jobs] = workflow.split('\njobs:\n');
    const flag = jobs.slice(0, jobs.indexOf('\n  review-anchor:'));
    const anchor = jobs.slice(jobs.indexOf('\n  review-anchor:'));

    expect(header).toContain('types: [opened, synchronize, reopened]');
    expect(header).not.toContain('ready_for_review');
    expect(header).not.toContain('converted_to_draft');
    expect(header).not.toContain('\nconcurrency:');
    expect(flag).toContain('group: review-signal-');
    expect(flag).toContain('cancel-in-progress: false');
    expect(anchor).not.toContain('concurrency:');
  });

  it('plans from the event head and guards every mutation against the live head', () => {
    const workflow = fs.readFileSync(WORKFLOW, 'utf8');
    const flag = workflow.slice(
      workflow.indexOf('  flag:'),
      workflow.indexOf('  review-anchor:'),
    );

    expect(flag).toContain("path: '.github/scripts/review-signal-policy.cjs'");
    expect(flag).toContain('reviewSignalEventPlan({');
    expect(flag).toContain('eventHeadSha: eventPr.head.sha');
    expect(flag).toContain('currentHeadSha: currentPr.head.sha');
    expect(flag).toContain('mutateIfCurrentHead({');
    expect(flag).not.toContain('actions/checkout');

    const mutationMethods = [
      'github.rest.issues.addLabels',
      'github.rest.issues.removeLabel',
      'github.rest.pulls.requestReviewers',
      'github.rest.repos.createCommitStatus',
      'github.rest.checks.update',
      'github.graphql',
    ];
    for (const method of mutationMethods) {
      const indexes = [];
      let index = flag.indexOf(method);
      while (index !== -1) {
        indexes.push(index);
        index = flag.indexOf(method, index + method.length);
      }
      expect(indexes.length).toBeGreaterThan(0);
      for (const mutationIndex of indexes) {
        expect(
          flag.slice(Math.max(0, mutationIndex - 240), mutationIndex),
        ).toContain('applyForCurrentHead(');
      }
    }
  });
});
