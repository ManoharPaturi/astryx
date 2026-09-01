// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import {describe, expect, it, vi} from 'vitest';

const require = createRequire(import.meta.url);
const {
  loadOpenPullRequests,
  nextAvailableSpecId,
  reservedSpecIds,
} = require('./spec-id.cjs');

function file(path, changeType = 'ADDED') {
  return {path, changeType};
}

function pull({
  number,
  headRefOid = `head-${number}`,
  files = [],
  changedFiles = files.length,
}) {
  return {
    number,
    title: `PR ${number}`,
    url: `https://github.com/facebook/astryx/pull/${number}`,
    headRefOid,
    changedFiles,
    files: {
      nodes: files,
      pageInfo: {hasNextPage: false, endCursor: null},
    },
  };
}

function openPullPage(nodes, options = {}) {
  return {
    repository: {
      pullRequests: {
        totalCount: options.totalCount ?? nodes.length,
        nodes,
        pageInfo: {
          hasNextPage: options.hasNextPage ?? false,
          endCursor: options.endCursor ?? null,
        },
      },
    },
  };
}

describe('spec ID allocation', () => {
  it('skips current open reservations AST-006 through AST-012', () => {
    const landed = ['AST-001', 'AST-002', 'AST-003', 'AST-004', 'AST-005'];
    const open = [
      'AST-006',
      'AST-007',
      'AST-008',
      'AST-009',
      'AST-010',
      'AST-011',
      'AST-012',
    ];
    expect(nextAvailableSpecId(landed, open)).toBe('AST-013');
  });

  it('does not reserve a modification to an already-landed spec', () => {
    expect(
      reservedSpecIds(
        [file('docs/specs/AST-002/spec.md', 'MODIFIED')],
        ['AST-002'],
      ),
    ).toEqual([]);
  });

  it('treats a rename to a new exact spec path as a reservation', () => {
    expect(
      reservedSpecIds(
        [file('docs/specs/AST-013/spec.md', 'RENAMED')],
        ['AST-001'],
      ),
    ).toEqual(['AST-013']);
  });
});

describe('open PR inventory', () => {
  it('paginates both pull requests and changed files', async () => {
    const firstHundred = Array.from({length: 100}, (_, index) =>
      file(`packages/core/src/F${index}.ts`),
    );
    const firstPull = pull({
      number: 1,
      files: firstHundred,
      changedFiles: 101,
    });
    firstPull.files.pageInfo = {hasNextPage: true, endCursor: 'files-1'};
    const secondPull = pull({number: 2, files: [file('README.md')]});

    const graphql = vi.fn(async (_query, variables) => {
      if (variables.number === 1) {
        return {
          repository: {
            pullRequest: {
              number: 1,
              headRefOid: 'head-1',
              changedFiles: 101,
              files: {
                nodes: [file('docs/specs/AST-013/spec.md')],
                pageInfo: {hasNextPage: false, endCursor: null},
              },
            },
          },
        };
      }
      if (variables.cursor === 'pulls-1') {
        return openPullPage([secondPull], {totalCount: 2});
      }
      return openPullPage([firstPull], {
        totalCount: 2,
        hasNextPage: true,
        endCursor: 'pulls-1',
      });
    });

    const pulls = await loadOpenPullRequests({
      graphql,
      owner: 'facebook',
      repo: 'astryx',
    });
    expect(pulls).toHaveLength(2);
    expect(pulls[0].files).toHaveLength(101);
    expect(graphql).toHaveBeenCalledTimes(3);
  });

  it('fails closed when a file inventory is incomplete', async () => {
    const graphql = vi.fn(async () =>
      openPullPage([
        pull({
          number: 1,
          files: [file('docs/specs/AST-013/spec.md')],
          changedFiles: 2,
        }),
      ]),
    );

    await expect(
      loadOpenPullRequests({graphql, owner: 'facebook', repo: 'astryx'}),
    ).rejects.toThrow(
      'PR #1 file inventory is incomplete: expected 2, received 1.',
    );
  });

  it('fails closed when the GitHub API fails', async () => {
    const graphql = vi.fn(async () => {
      throw new Error('rate limited');
    });
    await expect(
      loadOpenPullRequests({graphql, owner: 'facebook', repo: 'astryx'}),
    ).rejects.toThrow('rate limited');
  });
});
