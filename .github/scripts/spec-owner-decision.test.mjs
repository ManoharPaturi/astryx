// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  authorOwnsAllChangedRecords,
  canonicalRunUrl,
  newestGateRun,
  parseCanonicalRunId,
  parseOwnerCommand,
  parseOwnerFile,
  parseReadyAttestations,
  requiredApprovalGroups,
  resolveOwnerDecision,
} = require('./spec-owner-decision.cjs');

const head = 'abcdef1234567890abcdef1234567890abcdef12';
const owner = {login: 'cixzhang'};

describe('spec owner decision', () => {
  it('binds approval commands to the current head', () => {
    expect(parseOwnerCommand(`/approve-spec ${head}`, head)).toBe(true);
    expect(
      parseOwnerCommand(
        '/approve-spec 1111111111111111111111111111111111111111',
        head,
      ),
    ).toBe(null);
  });

  it('accepts an owner review only for the current head', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'imdreamrunner'],
      headSha: head,
      comments: [],
      reviews: [
        {
          user: owner,
          state: 'APPROVED',
          commit_id: head,
          submitted_at: '2026-08-30T10:00:00Z',
        },
      ],
    });
    expect(decision.approved).toBe(true);
    expect(decision.source).toBe('review');
  });

  it('requires approval only when current authority is involved', () => {
    const {requiresOwnerApproval} = require('./spec-owner-decision.cjs');
    expect(
      requiresOwnerApproval([
        {baseContent: null, headContent: 'authority: draft'},
      ]),
    ).toBe(false);
    expect(
      requiresOwnerApproval([
        {baseContent: 'authority: draft', headContent: 'authority: "current"'},
      ]),
    ).toBe(true);
    expect(
      requiresOwnerApproval([
        {baseContent: 'authority: current', headContent: 'authority: archived'},
      ]),
    ).toBe(true);
    expect(requiresOwnerApproval([], {complete: false})).toBe(true);
  });

  it('parses DESIGNOWNERS without comment examples', () => {
    expect(
      parseOwnerFile(`
# Uses @handle format and does not grant merge rights.
@rubyycheung @ernestt
# @not-an-owner
@kentonquatman @cvkxx
`),
    ).toEqual(['rubyycheung', 'ernestt', 'kentonquatman', 'cvkxx']);
  });

  it('routes current design and non-design records to separate owner groups', () => {
    expect(
      requiredApprovalGroups([
        {
          path: 'docs/design/selection.md',
          baseContent: null,
          headContent: 'kind: design\nauthority: current',
        },
      ]),
    ).toEqual({spec: false, design: true, theme: false});
    expect(
      requiredApprovalGroups([
        {
          path: 'packages/themes/neutral/neutral.spec.md',
          baseContent: null,
          headContent: 'kind: theme\nauthority: current',
        },
      ]),
    ).toEqual({spec: false, design: false, theme: true});
    expect(
      requiredApprovalGroups([
        {
          path: 'packages/core/src/Button/Button.spec.md',
          baseContent: 'kind: component\nauthority: current',
          headContent: 'kind: component\nauthority: current',
        },
      ]),
    ).toEqual({spec: true, design: false, theme: false});
    expect(
      requiredApprovalGroups(
        [
          {
            path: 'docs/design/selection.md',
            baseContent: 'kind: design\nauthority: current',
            headContent: 'kind: design\nauthority: current',
          },
          {
            path: 'docs/architecture/themes.md',
            baseContent: 'kind: architecture\nauthority: current',
            headContent: 'kind: architecture\nauthority: current',
          },
        ],
        {touchesDesignAssets: true},
      ),
    ).toEqual({spec: true, design: true, theme: false});
    expect(
      requiredApprovalGroups([
        {
          path: 'docs/design/not-a-design-record.md',
          baseContent: null,
          headContent: 'kind: architecture\nauthority: current',
        },
      ]),
    ).toEqual({spec: true, design: false, theme: false});
    expect(
      requiredApprovalGroups([
        {
          path: 'docs/design/themes.md',
          previousPath: 'docs/architecture/themes.md',
          baseContent: 'kind: architecture\nauthority: current',
          headContent: 'kind: design\nauthority: current',
        },
      ]),
    ).toEqual({spec: true, design: true, theme: false});
  });

  it('owner-gates design assets even without a text record', () => {
    expect(requiredApprovalGroups([], {touchesDesignAssets: true})).toEqual({
      spec: false,
      design: true,
      theme: false,
    });
    expect(requiredApprovalGroups([], {complete: false})).toEqual({
      spec: true,
      design: true,
      theme: true,
    });
  });

  it('accepts an exact-head repo-owner review for the theme group', () => {
    const groups = requiredApprovalGroups([
      {
        path: 'packages/themes/neutral/neutral.spec.md',
        baseContent: null,
        headContent: 'kind: theme\nauthority: current',
      },
    ]);
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'rubyycheung', 'imdreamrunner'],
      headSha: head,
      comments: [],
      reviews: [
        {
          user: {login: 'rubyycheung'},
          state: 'APPROVED',
          commit_id: head,
          submitted_at: '2026-08-30T10:00:00Z',
        },
      ],
    });

    expect(groups).toEqual({spec: false, design: false, theme: true});
    expect(decision).toMatchObject({
      approved: true,
      owner: 'rubyycheung',
      source: 'review',
    });
  });

  it('does not make a self-declared record owner an approver', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'rubyycheung', 'imdreamrunner'],
      headSha: head,
      comments: [],
      reviews: [
        {
          user: {login: 'self-declared-owner'},
          state: 'APPROVED',
          commit_id: head,
          submitted_at: '2026-08-30T10:00:00Z',
        },
      ],
    });

    expect(decision.approved).toBe(false);
  });

  it('accepts either configured owner', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'imdreamrunner'],
      headSha: head,
      comments: [],
      reviews: [
        {
          user: {login: 'imdreamrunner'},
          state: 'APPROVED',
          commit_id: head,
          submitted_at: '2026-08-30T10:00:00Z',
        },
      ],
    });
    expect(decision.approved).toBe(true);
    expect(decision.owner).toBe('imdreamrunner');
  });

  it('ignores a dismissed owner review', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'imdreamrunner'],
      headSha: head,
      comments: [],
      reviews: [
        {
          user: owner,
          state: 'DISMISSED',
          commit_id: head,
          submitted_at: '2026-08-30T10:01:00Z',
        },
        {
          user: {login: 'imdreamrunner'},
          state: 'APPROVED',
          commit_id: head,
          submitted_at: '2026-08-30T10:00:00Z',
        },
      ],
    });
    expect(decision.approved).toBe(true);
    expect(decision.owner).toBe('imdreamrunner');
  });

  it('keeps the gate blocked when either owner has a current-head objection', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'imdreamrunner'],
      headSha: head,
      comments: [],
      reviews: [
        {
          user: owner,
          state: 'APPROVED',
          commit_id: head,
          submitted_at: '2026-08-30T10:00:00Z',
        },
        {
          user: {login: 'imdreamrunner'},
          state: 'CHANGES_REQUESTED',
          commit_id: head,
          submitted_at: '2026-08-30T10:01:00Z',
        },
      ],
    });
    expect(decision.approved).toBe(false);
    expect(decision.owner).toBe('imdreamrunner');
  });

  it('rejects an approval attached to an older head', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'imdreamrunner'],
      headSha: head,
      comments: [],
      reviews: [
        {
          user: owner,
          state: 'APPROVED',
          commit_id: '1111111111111111111111111111111111111111',
          submitted_at: '2026-08-30T10:00:00Z',
        },
      ],
    });
    expect(decision.approved).toBe(false);
  });

  it('lets the latest owner action revoke an approval', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'imdreamrunner'],
      headSha: head,
      reviews: [
        {
          user: owner,
          state: 'APPROVED',
          commit_id: head,
          submitted_at: '2026-08-30T10:00:00Z',
        },
      ],
      comments: [
        {
          user: owner,
          body: `/revoke-spec ${head}`,
          created_at: '2026-08-30T10:01:00Z',
        },
      ],
    });
    expect(decision.approved).toBe(false);
    expect(decision.source).toBe('command');
  });

  it('ignores commands from other users', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'imdreamrunner'],
      headSha: head,
      reviews: [],
      comments: [
        {
          user: {login: 'someone-else'},
          body: `/approve-spec ${head}`,
          created_at: '2026-08-30T10:00:00Z',
        },
      ],
    });
    expect(decision.approved).toBe(false);
  });

  it('accepts only trusted workflow ready attestations', () => {
    const repository = 'facebook/astryx';
    const trusted = {
      context: 'spec-owner-ready/cixzhang',
      state: 'success',
      description: 'Owner ready at 2026-08-30T10:00:00.000Z.',
      target_url: canonicalRunUrl(repository, '9007199254740993', '2'),
      creator: {login: 'github-actions[bot]'},
    };
    const attestations = parseReadyAttestations(
      [
        trusted,
        {...trusted, creator: {login: 'cixzhang'}},
        {...trusted, target_url: 'https://example.com/forged'},
        {...trusted, description: 'owner says ready'},
      ],
      {repository, headSha: head},
    );

    expect(attestations).toEqual([
      {
        approved: true,
        at: '2026-08-30T10:00:00.000Z',
        headSha: head,
        owner: 'cixzhang',
        source: 'ready',
      },
    ]);
    expect(
      resolveOwnerDecision({
        owners: ['cixzhang'],
        headSha: head,
        reviews: [],
        comments: [],
        readyAttestations: attestations,
      }),
    ).toMatchObject({approved: true, owner: 'cixzhang', source: 'ready'});
  });

  it('invalidates a ready attestation on a new head', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang'],
      headSha: '1111111111111111111111111111111111111111',
      reviews: [],
      comments: [],
      readyAttestations: [
        {
          owner: 'cixzhang',
          headSha: head,
          at: '2026-08-30T10:00:00Z',
        },
      ],
    });

    expect(decision.approved).toBe(false);
  });

  it('lets a newer exact-head revoke override owner-ready', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang'],
      headSha: head,
      reviews: [],
      readyAttestations: [
        {
          owner: 'cixzhang',
          headSha: head,
          at: '2026-08-30T10:00:00Z',
        },
      ],
      comments: [
        {
          user: owner,
          body: `/revoke-spec ${head}`,
          created_at: '2026-08-30T10:01:00Z',
        },
      ],
    });

    expect(decision).toMatchObject({
      approved: false,
      owner: 'cixzhang',
      source: 'command',
    });
  });

  it('orders dismissal by updated_at instead of the original submission', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang'],
      headSha: head,
      comments: [],
      readyAttestations: [
        {
          owner: 'cixzhang',
          headSha: head,
          at: '2026-08-30T10:01:00Z',
        },
      ],
      reviews: [
        {
          id: 17,
          user: owner,
          state: 'DISMISSED',
          commit_id: head,
          submitted_at: '2026-08-30T09:00:00Z',
          updated_at: '2026-08-30T10:02:00Z',
        },
      ],
    });

    expect(decision.approved).toBe(false);
    expect(decision.source).toBe(null);
  });

  it('uses review_dismissed timeline time when it is newer', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang'],
      headSha: head,
      comments: [],
      readyAttestations: [
        {
          owner: 'cixzhang',
          headSha: head,
          at: '2026-08-30T10:01:00Z',
        },
      ],
      reviews: [
        {
          id: 17,
          user: owner,
          state: 'DISMISSED',
          commit_id: head,
          submitted_at: '2026-08-30T09:00:00Z',
          updated_at: '2026-08-30T09:30:00Z',
        },
      ],
      dismissalEvents: [
        {
          event: 'review_dismissed',
          created_at: '2026-08-30T10:02:00Z',
          dismissed_review: {review_id: 17},
        },
      ],
    });

    expect(decision.approved).toBe(false);
  });

  it('compares workflow run ids without losing integer precision', () => {
    const repository = 'facebook/astryx';
    const statuses = ['9007199254740992', '9007199254740993'].map(runId => ({
      context: 'spec-owner-approval',
      state: 'pending',
      description: `Run ${runId}`,
      target_url: canonicalRunUrl(repository, runId, '1'),
      creator: {login: 'github-actions[bot]'},
    }));

    expect(parseCanonicalRunId(statuses[1].target_url, repository)).toBe(
      9007199254740993n,
    );
    expect(newestGateRun(statuses, repository)?.runId).toBe(9007199254740993n);
  });
});

function recordContent(id, owners) {
  return `---\nid: ${id}\nowners: ${owners}\n---\n`;
}

function changedRecord({
  id = 'component:Button',
  baseOwners = '[cixzhang]',
  headId = id,
  headOwners = baseOwners,
  path = 'packages/core/src/Button/Button.spec.md',
  previousPath = path,
  baseIsAuthorizableRecord = true,
  headIsAuthorizableRecord = true,
  baseIsKnowledgeRecord = baseIsAuthorizableRecord,
  headIsKnowledgeRecord = headIsAuthorizableRecord,
} = {}) {
  return {
    path,
    previousPath,
    baseIsKnowledgeRecord,
    headIsKnowledgeRecord,
    baseIsAuthorizableRecord,
    headIsAuthorizableRecord,
    baseContent: baseIsAuthorizableRecord
      ? recordContent(id, baseOwners)
      : null,
    headContent: headIsAuthorizableRecord
      ? recordContent(headId, headOwners)
      : null,
  };
}

describe('record owner author decision', () => {
  it('accepts one existing record owner case-insensitively', () => {
    expect(
      authorOwnsAllChangedRecords(
        [changedRecord({baseOwners: '[CiXzHaNg]'})],
        'CIXZHANG',
      ),
    ).toEqual({
      approved: true,
      author: 'cixzhang',
      reason: null,
      recordIds: ['component:Button'],
    });
  });

  it('accepts validator-supported multiline owner arrays', () => {
    const multilineOwners = '\n  [\n    cixzhang,\n  ]';
    expect(
      authorOwnsAllChangedRecords(
        [
          changedRecord({
            baseOwners: multilineOwners,
            headOwners: multilineOwners,
          }),
        ],
        'cixzhang',
      ).approved,
    ).toBe(true);
  });

  it('requires the author to own every changed record and sorts record ids', () => {
    const records = [
      changedRecord({
        id: 'family:inputs',
        path: 'docs/families/inputs.md',
      }),
      changedRecord({
        id: 'architecture:buttons',
        path: 'docs/architecture/buttons.md',
      }),
    ];
    expect(authorOwnsAllChangedRecords(records, 'cixzhang')).toMatchObject({
      approved: true,
      recordIds: ['architecture:buttons', 'family:inputs'],
    });

    records[1] = changedRecord({
      id: 'architecture:buttons',
      baseOwners: '[imdreamrunner]',
      headOwners: '[imdreamrunner]',
      path: 'docs/architecture/buttons.md',
    });
    expect(authorOwnsAllChangedRecords(records, 'cixzhang')).toMatchObject({
      approved: false,
      reason: expect.stringContaining('author is not a base owner'),
    });
  });

  it('does not let a new record self-admit its author', () => {
    const record = changedRecord({baseIsAuthorizableRecord: false});
    expect(authorOwnsAllChangedRecords([record], 'cixzhang')).toMatchObject({
      approved: false,
      reason: expect.stringContaining('no trusted base record'),
    });
  });

  it('handles preserving renames and owner-authored deletions', () => {
    const renamed = changedRecord({
      path: 'docs/architecture/new-name.md',
      previousPath: 'docs/architecture/old-name.md',
    });
    const deleted = changedRecord({headIsAuthorizableRecord: false});

    expect(authorOwnsAllChangedRecords([renamed], 'cixzhang').approved).toBe(
      true,
    );
    expect(authorOwnsAllChangedRecords([deleted], 'cixzhang').approved).toBe(
      true,
    );
  });

  it.each([
    {
      name: 'unsafe knowledge-path rename',
      record: changedRecord({
        path: 'docs/design/assets/button.md',
        previousPath: 'docs/design/button.md',
        headIsKnowledgeRecord: true,
        headIsAuthorizableRecord: false,
      }),
      reason: 'head path is not author-authorizable',
    },
    {
      name: 'changed identity',
      record: changedRecord({headId: 'component:OtherButton'}),
      reason: 'record identity changed',
    },
    {
      name: 'missing owners',
      record: changedRecord({headOwners: '[]'}),
      reason: 'owners must be non-empty',
    },
    {
      name: 'duplicate owners',
      record: changedRecord({headOwners: '[cixzhang, CIXZHANG]'}),
      reason: 'owners must be non-empty and unambiguous',
    },
    {
      name: 'invalid owner login',
      record: changedRecord({headOwners: '[not a login]'}),
      reason: 'invalid GitHub login',
    },
  ])('fails closed for $name', ({record, reason}) => {
    expect(authorOwnsAllChangedRecords([record], 'cixzhang')).toMatchObject({
      approved: false,
      reason: expect.stringContaining(reason),
    });
  });

  it('accepts a bot only when the trusted record names its exact identity', () => {
    const botOwned = changedRecord({
      baseOwners: '[dependabot[bot]]',
      headOwners: '[dependabot[bot]]',
    });
    expect(
      authorOwnsAllChangedRecords([botOwned], 'dependabot[bot]').approved,
    ).toBe(true);
    expect(
      authorOwnsAllChangedRecords([botOwned], 'app/dependabot'),
    ).toMatchObject({
      approved: false,
      reason: 'missing or invalid pull request author',
    });
  });
});
