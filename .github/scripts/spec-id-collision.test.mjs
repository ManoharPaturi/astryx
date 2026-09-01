// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  checkSpecIdCollisions,
  formatConflictMessage,
} = require('./spec-id-collision.cjs');

const root = path.resolve(import.meta.dirname, '../..');

function pull(number, files, headRefOid = `head-${number}`) {
  return {
    number,
    title: `PR ${number}`,
    url: `https://github.com/facebook/astryx/pull/${number}`,
    headRefOid,
    changedFiles: files.length,
    files,
  };
}

function added(id) {
  return {path: `docs/specs/${id}/spec.md`, changeType: 'ADDED'};
}

describe('spec ID collision gate', () => {
  it('reports two open additions of the same new ID', () => {
    const result = checkSpecIdCollisions({
      openPulls: [pull(10, [added('AST-013')]), pull(20, [added('AST-013')])],
      currentPullNumber: 10,
      expectedHeadOid: 'head-10',
      landedIds: ['AST-001'],
    });

    expect(result.conflicts).toEqual([
      {id: 'AST-013', pulls: [expect.objectContaining({number: 20})]},
    ]);
    expect(formatConflictMessage(result.conflicts)).toContain(
      'AST-013 is also reserved by #20',
    );
    expect(formatConflictMessage(result.conflicts)).toContain('pnpm spec:id');
  });

  it('allows a modification to an already-landed ID', () => {
    const result = checkSpecIdCollisions({
      openPulls: [
        pull(10, [
          {path: 'docs/specs/AST-002/spec.md', changeType: 'MODIFIED'},
        ]),
        pull(20, [added('AST-002')]),
      ],
      currentPullNumber: 10,
      expectedHeadOid: 'head-10',
      landedIds: ['AST-002'],
    });
    expect(result).toEqual({candidateIds: [], conflicts: []});
  });

  it('detects a rename into an ID reserved by another PR', () => {
    const result = checkSpecIdCollisions({
      openPulls: [
        pull(10, [
          {
            path: 'docs/specs/AST-013/spec.md',
            changeType: 'RENAMED',
          },
        ]),
        pull(20, [added('AST-013')]),
      ],
      currentPullNumber: 10,
      expectedHeadOid: 'head-10',
      landedIds: ['AST-001'],
    });
    expect(result.conflicts).toHaveLength(1);
  });

  it('excludes the current PR from its collision set', () => {
    const result = checkSpecIdCollisions({
      openPulls: [pull(10, [added('AST-013')])],
      currentPullNumber: 10,
      expectedHeadOid: 'head-10',
      landedIds: ['AST-001'],
    });
    expect(result).toEqual({candidateIds: ['AST-013'], conflicts: []});
  });

  it('fails when the queried head no longer matches the event head', () => {
    expect(() =>
      checkSpecIdCollisions({
        openPulls: [pull(10, [added('AST-013')], 'new-head')],
        currentPullNumber: 10,
        expectedHeadOid: 'event-head',
        landedIds: [],
      }),
    ).toThrow('moved from event-head to new-head');
  });

  it('keeps the workflow trusted and read-only', () => {
    const workflow = fs.readFileSync(
      path.join(root, '.github/workflows/spec-id-reservation.yml'),
      'utf8',
    );
    expect(workflow).toContain('pull_request_target:');
    expect(workflow).toContain(
      'ref: ${{ github.event.repository.default_branch }}',
    );
    expect(workflow).toContain('persist-credentials: false');
    expect(workflow).toContain('pull-requests: read');
    expect(workflow).not.toContain('pull-requests: write');
    expect(workflow).not.toContain('github.event.pull_request.head.sha }}');
  });
});
