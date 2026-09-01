#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file spec-id.mjs
 * @input Reads landed spec directories and open pull-request file inventories
 *   from GitHub through the authenticated `gh` CLI
 * @output Prints the next collision-free AST-NNN reservation and optionally
 *   scaffolds docs/specs/AST-NNN/spec.md from the system-spec template
 * @position Contributor helper for reserving system-spec IDs without a central
 *   registry; opening the pull request is what reserves the proposed path
 */

/* global console, process */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const {
  loadOpenPullRequests,
  nextAvailableSpecId,
  reservedSpecIds,
} = require('./lib/spec-id.cjs');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_REPOSITORY = 'facebook/astryx';
const DEFAULT_REF = 'main';

function usage() {
  return `Usage: node scripts/spec-id.mjs [options]

Find the next system-spec ID that is absent from both landed specs and open PRs.
The default is read-only. Opening a PR that adds the proposed spec.md reserves it.

Options:
  --write          Scaffold docs/specs/AST-NNN/spec.md
  --repo OWNER/REPO  GitHub repository (default: ${DEFAULT_REPOSITORY})
  --ref REF         Landed base ref (default: ${DEFAULT_REF})
  --help            Show this help
`;
}

function parseArguments(argv) {
  const options = {
    write: false,
    repository: DEFAULT_REPOSITORY,
    ref: DEFAULT_REF,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--write') options.write = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else if (argument === '--repo' || argument === '--ref') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`${argument} requires a value.`);
      }
      index += 1;
      if (argument === '--repo') options.repository = value;
      else options.ref = value;
    } else if (argument.startsWith('--repo=')) {
      options.repository = argument.slice('--repo='.length);
    } else if (argument.startsWith('--ref=')) {
      options.ref = argument.slice('--ref='.length);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!/^[^/\s]+\/[^/\s]+$/.test(options.repository)) {
    throw new Error('--repo must use OWNER/REPO format.');
  }
  if (!options.ref) throw new Error('--ref must not be empty.');
  return options;
}

function runGhJson(args) {
  try {
    return JSON.parse(
      execFileSync('gh', args, {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }),
    );
  } catch (error) {
    const detail = error.stderr?.trim() || error.message;
    throw new Error(`GitHub query failed: ${detail}`);
  }
}

function loadLandedIds({repository, ref}) {
  const entries = runGhJson([
    'api',
    '--method',
    'GET',
    `repos/${repository}/contents/docs/specs`,
    '-f',
    `ref=${ref}`,
  ]);
  if (!Array.isArray(entries)) {
    throw new Error('GitHub returned an invalid docs/specs directory listing.');
  }
  if (entries.length >= 1000) {
    throw new Error(
      'GitHub may have truncated docs/specs at 1,000 entries; no ID was allocated.',
    );
  }
  return entries
    .filter(entry => entry.type === 'dir' && /^AST-[0-9]{3}$/.test(entry.name))
    .map(entry => entry.name);
}

async function loadOpenPulls(repository) {
  const [owner, repo] = repository.split('/');
  return loadOpenPullRequests({
    owner,
    repo,
    graphql: async (query, variables) => {
      const args = ['api', 'graphql', '-f', `query=${query}`];
      for (const [name, value] of Object.entries(variables)) {
        if (value == null) continue;
        args.push(typeof value === 'number' ? '-F' : '-f', `${name}=${value}`);
      }
      const result = runGhJson(args);
      if (!result?.data)
        throw new Error('GitHub GraphQL response has no data.');
      return result.data;
    },
  });
}

function scaffoldSpec(id) {
  const target = path.join(ROOT, 'docs/specs', id, 'spec.md');
  if (fs.existsSync(target)) {
    throw new Error(`${path.relative(ROOT, target)} already exists.`);
  }
  const template = fs.readFileSync(
    path.join(ROOT, 'docs/templates/knowledge/system-spec.md'),
    'utf8',
  );
  fs.mkdirSync(path.dirname(target), {recursive: false});
  fs.writeFileSync(target, template.replaceAll('AST-000', id));
  return path.relative(ROOT, target);
}

export async function allocateSpecId(options) {
  const landedIds = loadLandedIds(options);
  const pulls = await loadOpenPulls(options.repository);
  const openIds = new Set();
  const reservations = new Map();

  for (const pull of pulls) {
    for (const id of reservedSpecIds(pull.files, landedIds)) {
      openIds.add(id);
      const current = reservations.get(id) ?? [];
      current.push(pull);
      reservations.set(id, current);
    }
  }

  const id = nextAvailableSpecId(landedIds, [...openIds]);
  return {id, landedIds, reservations};
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(usage());
    return;
  }

  const {id, landedIds, reservations} = await allocateSpecId(options);
  const target = `docs/specs/${id}/spec.md`;
  console.log(`Next available system-spec ID: ${id}`);
  console.log(`Proposed path: ${target}`);
  console.log(
    `Checked ${landedIds.length} landed IDs and ${reservations.size} IDs reserved by open PRs.`,
  );

  if (options.write) {
    console.log(`Scaffolded ${scaffoldSpec(id)}.`);
  } else {
    console.log('Dry run only; no files were changed.');
    console.log('Run `pnpm spec:id -- --write` to scaffold this proposal.');
  }
  console.log(
    'Opening a PR that adds this exact path reserves the ID. Re-run this helper immediately before opening the PR.',
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(`Could not allocate a system-spec ID: ${error.message}`);
    process.exitCode = 1;
  });
}
