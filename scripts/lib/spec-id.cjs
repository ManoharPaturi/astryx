// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SPEC_ID_PATTERN = /^AST-([0-9]{3})$/;
const SPEC_PATH_PATTERN = /^docs\/specs\/(AST-[0-9]{3})\/spec\.md$/;

const OPEN_PULLS_QUERY = `
  query SpecIdOpenPulls(
    $owner: String!
    $name: String!
    $cursor: String
  ) {
    repository(owner: $owner, name: $name) {
      pullRequests(
        states: OPEN
        first: 50
        after: $cursor
        orderBy: {field: UPDATED_AT, direction: DESC}
      ) {
        totalCount
        nodes {
          number
          title
          url
          headRefOid
          changedFiles
          files(first: 100) {
            nodes {
              path
              changeType
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const PULL_FILES_QUERY = `
  query SpecIdPullFiles(
    $owner: String!
    $name: String!
    $number: Int!
    $cursor: String!
  ) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $number) {
        number
        headRefOid
        changedFiles
        files(first: 100, after: $cursor) {
          nodes {
            path
            changeType
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
`;

function compareSpecIds(left, right) {
  return Number(left.slice(4)) - Number(right.slice(4));
}

function parseSpecId(value) {
  const match = String(value).match(SPEC_ID_PATTERN);
  return match ? {id: match[0], number: Number(match[1])} : null;
}

function specIdFromPath(filePath) {
  return String(filePath).match(SPEC_PATH_PATTERN)?.[1] ?? null;
}

function normalizeChangeType(file) {
  return String(file.changeType ?? file.status ?? '').toUpperCase();
}

function reservedSpecIds(files, landedIds) {
  const landed = new Set(landedIds);
  const reserved = new Set();

  for (const file of files) {
    const changeType = normalizeChangeType(file);
    if (changeType === 'DELETED' || changeType === 'REMOVED') continue;
    const id = specIdFromPath(file.path ?? file.filename ?? '');
    if (id && !landed.has(id)) reserved.add(id);
  }

  return [...reserved].sort(compareSpecIds);
}

function nextAvailableSpecId(landedIds, openReservedIds) {
  const landedNumbers = landedIds.map(id => {
    const parsed = parseSpecId(id);
    if (!parsed) throw new Error(`Invalid landed spec ID: ${id}`);
    return parsed.number;
  });
  const reserved = new Set(openReservedIds);
  let candidate = Math.max(0, ...landedNumbers) + 1;

  while (candidate <= 999) {
    const id = `AST-${String(candidate).padStart(3, '0')}`;
    if (!reserved.has(id)) return id;
    candidate += 1;
  }

  throw new Error('The AST-NNN ID range is exhausted.');
}

function listLandedSpecIds(root) {
  const directory = path.join(root, 'docs/specs');
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, {withFileTypes: true})
    .filter(
      entry =>
        entry.isDirectory() &&
        SPEC_ID_PATTERN.test(entry.name) &&
        fs.existsSync(path.join(directory, entry.name, 'spec.md')),
    )
    .map(entry => entry.name)
    .sort(compareSpecIds);
}

function requirePageInfo(pageInfo, description) {
  if (
    pageInfo == null ||
    typeof pageInfo.hasNextPage !== 'boolean' ||
    (pageInfo.hasNextPage && !pageInfo.endCursor)
  ) {
    throw new Error(`${description} returned incomplete pagination metadata.`);
  }
}

async function completePullFiles({graphql, owner, repo, pull}) {
  if (!Number.isInteger(pull.changedFiles) || pull.changedFiles < 0) {
    throw new Error(`PR #${pull.number} did not report a changed-file count.`);
  }

  const files = [...(pull.files?.nodes ?? [])];
  let pageInfo = pull.files?.pageInfo;
  requirePageInfo(pageInfo, `PR #${pull.number} files`);
  const seenCursors = new Set();

  while (pageInfo.hasNextPage) {
    if (seenCursors.has(pageInfo.endCursor)) {
      throw new Error(`PR #${pull.number} file pagination repeated a cursor.`);
    }
    seenCursors.add(pageInfo.endCursor);
    const result = await graphql(PULL_FILES_QUERY, {
      owner,
      name: repo,
      number: pull.number,
      cursor: pageInfo.endCursor,
    });
    const current = result?.repository?.pullRequest;
    if (!current) throw new Error(`PR #${pull.number} could not be reloaded.`);
    if (
      current.headRefOid !== pull.headRefOid ||
      current.changedFiles !== pull.changedFiles
    ) {
      throw new Error(
        `PR #${pull.number} changed while its files were being read; rerun the check.`,
      );
    }
    files.push(...(current.files?.nodes ?? []));
    pageInfo = current.files?.pageInfo;
    requirePageInfo(pageInfo, `PR #${pull.number} files`);
  }

  if (files.length !== pull.changedFiles) {
    throw new Error(
      `PR #${pull.number} file inventory is incomplete: expected ${pull.changedFiles}, received ${files.length}.`,
    );
  }
  return files;
}

async function loadOpenPullRequests({graphql, owner, repo}) {
  const pulls = [];
  const seenNumbers = new Set();
  const seenCursors = new Set();
  let cursor = null;
  let expectedTotal = null;

  do {
    const result = await graphql(OPEN_PULLS_QUERY, {owner, name: repo, cursor});
    const connection = result?.repository?.pullRequests;
    if (!connection) throw new Error('Open pull requests could not be loaded.');
    if (!Number.isInteger(connection.totalCount)) {
      throw new Error('Open pull request count is missing.');
    }
    if (expectedTotal == null) expectedTotal = connection.totalCount;
    else if (expectedTotal !== connection.totalCount) {
      throw new Error(
        'Open pull requests changed while they were being read; rerun the check.',
      );
    }

    for (const pull of connection.nodes ?? []) {
      if (seenNumbers.has(pull.number)) {
        throw new Error(`PR #${pull.number} appeared more than once.`);
      }
      seenNumbers.add(pull.number);
      pulls.push({
        number: pull.number,
        title: pull.title,
        url: pull.url,
        headRefOid: pull.headRefOid,
        changedFiles: pull.changedFiles,
        files: await completePullFiles({graphql, owner, repo, pull}),
      });
    }

    requirePageInfo(connection.pageInfo, 'Open pull requests');
    if (!connection.pageInfo.hasNextPage) break;
    cursor = connection.pageInfo.endCursor;
    if (seenCursors.has(cursor)) {
      throw new Error('Open pull request pagination repeated a cursor.');
    }
    seenCursors.add(cursor);
  } while (true);

  if (pulls.length !== expectedTotal) {
    throw new Error(
      `Open pull request inventory is incomplete: expected ${expectedTotal}, received ${pulls.length}.`,
    );
  }
  return pulls;
}

module.exports = {
  SPEC_ID_PATTERN,
  compareSpecIds,
  listLandedSpecIds,
  loadOpenPullRequests,
  nextAvailableSpecId,
  reservedSpecIds,
  specIdFromPath,
};
