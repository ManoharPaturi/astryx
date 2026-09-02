// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'page',
  name: 'Pipeline Flow',
  displayName: 'Pipeline Flow',
  description:
    'Directed graph of sequential stages that walks one run end to end: ' +
    'nodes joined by status-colored edges on a track that scrolls when it ' +
    'overflows and flips between horizontal and vertical, parallel branches ' +
    'that fork and rejoin, and a bottom pane that expands on the selected ' +
    'node to hold its log output, files, and duration history, then ' +
    'collapses to a bar. Pipeline, workflow, build, deploy, release, ' +
    'rollout, approval chain, or data flow.',
  isReady: true,
  category: 'Tools - Pipeline Flow',
};
