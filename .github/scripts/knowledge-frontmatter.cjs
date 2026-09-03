// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global module */

function parseSingleField(content, field, filePath = '<knowledge record>') {
  if (content == null) return null;
  const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `^${escapedField}:\\s*['"]?([a-z-]+)['"]?\\s*$`,
    'gm',
  );
  const matches = [...content.matchAll(pattern)];
  if (matches.length > 1) {
    throw new Error(`${filePath}: duplicate ${field} fields are not allowed.`);
  }
  return matches[0]?.[1] ?? null;
}

function parseAuthority(content, filePath) {
  return parseSingleField(content, 'authority', filePath);
}

function parseKind(content, filePath) {
  return parseSingleField(content, 'kind', filePath);
}

function parseOwnerFile(content) {
  return [
    ...new Set(
      content
        .split(/\r?\n/)
        .map(line => line.replace(/#.*/, ''))
        .flatMap(line => [...line.matchAll(/@([a-z0-9-]+)/gi)])
        .map(match => match[1].toLowerCase()),
    ),
  ];
}

const GITHUB_LOGIN_PATTERN =
  /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?(?:\[bot\])?$/i;

function normalizeGitHubLogin(value) {
  if (typeof value !== 'string') return null;
  const login = value.trim();
  if (!GITHUB_LOGIN_PATTERN.test(login) || login.includes('--')) return null;
  return login.toLowerCase();
}

function parseQuotedScalar(raw, field, filePath) {
  const value = raw.trim();
  const startsQuoted = value.startsWith("'") || value.startsWith('"');
  const endsQuoted = value.endsWith("'") || value.endsWith('"');
  if (startsQuoted !== endsQuoted) {
    throw new Error(`${filePath}: ${field} has unmatched quotes.`);
  }
  if (startsQuoted && value[0] !== value.at(-1)) {
    throw new Error(`${filePath}: ${field} has mismatched quotes.`);
  }
  return startsQuoted ? value.slice(1, -1) : value;
}

function parseRecordOwnership(content, filePath = '<knowledge record>') {
  if (content == null) return null;
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) {
    throw new Error(`${filePath}: missing frontmatter.`);
  }

  const fields = new Map();
  const lines = frontmatter[1].split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s/.test(line) || line.trim() === '' || line.startsWith('#')) {
      continue;
    }
    const match = line.match(/^([a-z][a-z0-9_]*):\s*(.*)$/);
    if (!match || !['id', 'owners'].includes(match[1])) continue;
    if (fields.has(match[1])) {
      throw new Error(`${filePath}: duplicate frontmatter field ${match[1]}.`);
    }

    let raw = match[2].trim();
    if (raw === '') {
      const block = [];
      while (index + 1 < lines.length && /^\s/.test(lines[index + 1])) {
        block.push(lines[index + 1].trim());
        index += 1;
      }
      if (block.length === 1 && /^\[.*\]$/.test(block[0])) {
        raw = block[0];
      } else if (block[0] === '[' && block.at(-1) === ']') {
        raw = `[${block.slice(1, -1).join('')}]`;
      } else if (
        block.length > 0 &&
        block.every(item => item.startsWith('- '))
      ) {
        raw = `[${block.map(item => item.slice(2)).join(',')}]`;
      }
    }
    fields.set(match[1], raw);
  }

  const id = parseQuotedScalar(fields.get('id') ?? '', 'id', filePath);
  if (!/^[A-Za-z0-9][A-Za-z0-9:._/-]*$/.test(id)) {
    throw new Error(`${filePath}: id is missing or ambiguous.`);
  }

  const ownersRaw = fields.get('owners') ?? '';
  const ownersMatch = ownersRaw.match(/^\[([\s\S]*)\]$/);
  if (!ownersMatch) {
    throw new Error(`${filePath}: owners must be a non-empty list.`);
  }
  const ownerValues = ownersMatch[1]
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  const owners = ownerValues.map(value => {
    const parsed = parseQuotedScalar(value, 'owners', filePath);
    const normalized = normalizeGitHubLogin(parsed);
    if (!normalized) {
      throw new Error(`${filePath}: owners contains an invalid GitHub login.`);
    }
    return normalized;
  });
  if (owners.length === 0 || new Set(owners).size !== owners.length) {
    throw new Error(`${filePath}: owners must be non-empty and unambiguous.`);
  }

  return {id, owners};
}

module.exports = {
  normalizeGitHubLogin,
  parseAuthority,
  parseKind,
  parseOwnerFile,
  parseRecordOwnership,
  parseSingleField,
};
