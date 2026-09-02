// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Pipeline Flow — a directed stage graph for one run of a process.
 *
 * Frame-first layout (see `npx astryx docs layout`):
 *
 *   Frame: header | stage graph (fill) | detail pane (38%, collapses to a bar)
 *
 * Responsive contract:
 *   > 900px   graph scrolls along its axis; detail pane at 38% height
 *   <= 900px  graph switches to the vertical axis so nodes stay readable
 *
 * Container policy (graph archetype): each stage is one discrete node a
 * builder can select, so nodes are cards; the edges between them are the
 * only decoration. Everything else — logs, artifacts, run history — is dense
 * data and renders as rows.
 *
 * Two deliberate departures from a hand-rolled node graph:
 *
 *   Edges are `Icon` arrows, not hand-drawn SVG paths. A long-arrow glyph
 *   carries direction and takes a semantic color token, so an edge inherits
 *   the source stage's status (green passed, red failed, gray pending) and
 *   stays correct in both themes with no stroke colors to maintain.
 *
 *   Log severity is a colored `Token` per row rather than ANSI escapes.
 *   The level reads as text as well as color, which color alone cannot do,
 *   and the rows align in a table instead of relying on padded columns.
 */

import {useMemo, useState} from 'react';

import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  VStack,
} from '@astryxdesign/core/Layout';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {ResizeHandle, useResizable} from '@astryxdesign/core/Resizable';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {pixel, proportional, Table} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {
  ArrowDownTrayIcon,
  ArrowLongDownIcon,
  ArrowLongRightIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ForwardIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  PaperClipIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// ─── Model ──────────────────────────────────────────────────────────────────

type StageStatus = 'passed' | 'running' | 'failed' | 'pending' | 'skipped';

type LogLevel = 'info' | 'warn' | 'error';

interface LogLine extends Record<string, unknown> {
  id: string;
  time: string;
  level: LogLevel;
  message: string;
}

interface Artifact extends Record<string, unknown> {
  id: string;
  name: string;
  size: string;
  kind: string;
}

type Stage = {
  id: string;
  name: string;
  status: StageStatus;
  /** Elapsed seconds for this run; omitted when the stage has not run. */
  seconds?: number;
  /** Completion percentage, running stages only. */
  progress?: number;
  /** Why a stage was skipped, or what a pending stage is waiting on. */
  note?: string;
  logs: LogLine[];
  artifacts: Artifact[];
  /** Duration in seconds for the last 20 runs of this stage, oldest first. */
  trend: number[];
};

/** One position on the track. More than one stage means a parallel fan-out. */
type StageGroup = {
  id: string;
  parallel: Stage[];
};

const STATUS_META: Record<
  StageStatus,
  {
    label: string;
    icon: typeof CheckCircleIcon | null;
    iconColor: 'success' | 'error' | 'accent' | 'secondary' | 'disabled';
    badge: 'success' | 'error' | 'info' | 'neutral';
    edge: 'success' | 'error' | 'accent' | 'disabled';
  }
> = {
  passed: {
    label: 'Passed',
    icon: CheckCircleIcon,
    iconColor: 'success',
    badge: 'success',
    edge: 'success',
  },
  running: {
    label: 'Running',
    icon: null,
    iconColor: 'accent',
    badge: 'info',
    edge: 'accent',
  },
  failed: {
    label: 'Failed',
    icon: XCircleIcon,
    iconColor: 'error',
    badge: 'error',
    edge: 'error',
  },
  pending: {
    label: 'Pending',
    icon: ClockIcon,
    iconColor: 'secondary',
    badge: 'neutral',
    edge: 'disabled',
  },
  skipped: {
    label: 'Skipped',
    icon: ForwardIcon,
    iconColor: 'disabled',
    badge: 'neutral',
    edge: 'disabled',
  },
};

const LEVEL_COLOR: Record<LogLevel, 'gray' | 'orange' | 'red'> = {
  info: 'gray',
  warn: 'orange',
  error: 'red',
};

const PIPELINE_NAME = 'Build Pipeline — D12345';
const RUN_NUMBER = 4821;
const RUN_META = 'Run #4821 · Started 14 min ago · Triggered by alice.chen';
const NODE_WIDTH = 180;

// ─── Run data ───────────────────────────────────────────────────────────────

const PIPELINE: StageGroup[] = [
  {
    id: 'build',
    parallel: [
      {
        id: 'build',
        name: 'Build',
        status: 'passed',
        seconds: 202,
        logs: [
          {
            id: 'build-1',
            time: '14:02:03',
            level: 'info',
            message: 'Resolving workspace at commit 8f2c1ad',
          },
          {
            id: 'build-2',
            time: '14:02:05',
            level: 'info',
            message: 'Restoring cache key linux-node22-8f2c1ad (412 MB)',
          },
          {
            id: 'build-3',
            time: '14:02:11',
            level: 'info',
            message: 'Cache hit — 1,284 of 1,310 modules reused',
          },
          {
            id: 'build-4',
            time: '14:02:12',
            level: 'warn',
            message: 'Package legacy-parser@1.4.2 is deprecated',
          },
          {
            id: 'build-5',
            time: '14:03:47',
            level: 'info',
            message: 'Compiled 1,310 modules in 94.2s',
          },
          {
            id: 'build-6',
            time: '14:05:19',
            level: 'info',
            message: 'Wrote dist/ — 4.8 MB raw, 1.2 MB gzip',
          },
          {
            id: 'build-7',
            time: '14:05:25',
            level: 'info',
            message: 'Build succeeded in 3m 22s',
          },
        ],
        artifacts: [
          {
            id: 'build-a1',
            name: 'dist-bundle.tar.gz',
            size: '4.8 MB',
            kind: 'Archive',
          },
          {
            id: 'build-a2',
            name: 'build-manifest.json',
            size: '128 KB',
            kind: 'Manifest',
          },
          {
            id: 'build-a3',
            name: 'source-maps.zip',
            size: '12.4 MB',
            kind: 'Source map',
          },
        ],
        trend: [
          188, 195, 191, 204, 199, 186, 212, 197, 193, 208, 201, 190, 215, 198,
          194, 206, 189, 200, 196, 202,
        ],
      },
    ],
  },
  {
    id: 'unit-tests',
    parallel: [
      {
        id: 'unit-tests',
        name: 'Unit Tests',
        status: 'passed',
        seconds: 125,
        logs: [
          {
            id: 'unit-1',
            time: '14:05:31',
            level: 'info',
            message: 'Running 2,418 tests across 12 shards',
          },
          {
            id: 'unit-2',
            time: '14:06:02',
            level: 'info',
            message: 'Shard 3 of 12 complete — 201 passed',
          },
          {
            id: 'unit-3',
            time: '14:06:44',
            level: 'warn',
            message: 'Slow test: renders large table took 1,204ms',
          },
          {
            id: 'unit-4',
            time: '14:07:20',
            level: 'info',
            message: 'Coverage 87.4% lines, 81.9% branches',
          },
          {
            id: 'unit-5',
            time: '14:07:36',
            level: 'info',
            message: '2,418 passed, 0 failed, 7 skipped',
          },
        ],
        artifacts: [
          {
            id: 'unit-a1',
            name: 'junit-results.xml',
            size: '1.9 MB',
            kind: 'Test report',
          },
          {
            id: 'unit-a2',
            name: 'coverage-lcov.info',
            size: '842 KB',
            kind: 'Coverage',
          },
          {
            id: 'unit-a3',
            name: 'coverage-html.zip',
            size: '3.1 MB',
            kind: 'Report',
          },
        ],
        trend: [
          131, 128, 134, 122, 126, 140, 129, 124, 133, 127, 121, 136, 130, 125,
          132, 123, 138, 126, 129, 125,
        ],
      },
    ],
  },
  {
    id: 'verify',
    parallel: [
      {
        id: 'integration',
        name: 'Integration',
        status: 'running',
        seconds: 252,
        progress: 68,
        logs: [
          {
            id: 'int-1',
            time: '14:07:41',
            level: 'info',
            message: 'Provisioning environment pr-4821.staging',
          },
          {
            id: 'int-2',
            time: '14:08:10',
            level: 'info',
            message: 'Environment ready in 29s',
          },
          {
            id: 'int-3',
            time: '14:08:12',
            level: 'info',
            message: 'Running 184 scenarios against pr-4821.staging',
          },
          {
            id: 'int-4',
            time: '14:09:55',
            level: 'warn',
            message: 'Retry 2 of 3: checkout completes with saved card',
          },
          {
            id: 'int-5',
            time: '14:10:31',
            level: 'info',
            message: '124 of 184 scenarios complete',
          },
          {
            id: 'int-6',
            time: '14:11:48',
            level: 'info',
            message: '68% complete — about 2m remaining',
          },
        ],
        artifacts: [
          {
            id: 'int-a1',
            name: 'scenario-report.html',
            size: '2.2 MB',
            kind: 'Report (partial)',
          },
          {
            id: 'int-a2',
            name: 'browser-traces.zip',
            size: '18.7 MB',
            kind: 'Trace',
          },
        ],
        trend: [
          361, 348, 372, 355, 340, 366, 358, 344, 379, 351, 363, 347, 356, 370,
          342, 359, 365, 350, 368, 252,
        ],
      },
      {
        id: 'lint',
        name: 'Lint',
        status: 'passed',
        seconds: 41,
        logs: [
          {
            id: 'lint-1',
            time: '14:07:41',
            level: 'info',
            message: 'Linting 3,904 files',
          },
          {
            id: 'lint-2',
            time: '14:08:05',
            level: 'warn',
            message: 'CartSummary.tsx:88 prefer-const',
          },
          {
            id: 'lint-3',
            time: '14:08:19',
            level: 'info',
            message: '0 errors, 1 warning',
          },
          {
            id: 'lint-4',
            time: '14:08:22',
            level: 'info',
            message: 'Lint passed in 41s',
          },
        ],
        artifacts: [
          {
            id: 'lint-a1',
            name: 'eslint-report.json',
            size: '96 KB',
            kind: 'Report',
          },
        ],
        trend: [
          44, 39, 42, 47, 40, 38, 45, 41, 43, 46, 37, 42, 44, 40, 48, 39, 43,
          41, 45, 41,
        ],
      },
      {
        id: 'security',
        name: 'Security Scan',
        status: 'failed',
        seconds: 72,
        logs: [
          {
            id: 'sec-1',
            time: '14:07:41',
            level: 'info',
            message: 'Scanning 1,310 dependencies for advisories',
          },
          {
            id: 'sec-2',
            time: '14:08:20',
            level: 'warn',
            message: 'GHSA-7f4x-mq2c high in image-resize@2.1.0',
          },
          {
            id: 'sec-3',
            time: '14:08:41',
            level: 'error',
            message: 'GHSA-9c2v-8r3p critical in xml-stream@0.8.4',
          },
          {
            id: 'sec-4',
            time: '14:08:42',
            level: 'error',
            message: 'No patched version available for xml-stream',
          },
          {
            id: 'sec-5',
            time: '14:08:44',
            level: 'error',
            message: 'Policy gate failed: 1 critical exceeds threshold high',
          },
          {
            id: 'sec-6',
            time: '14:08:53',
            level: 'info',
            message: 'Scan completed in 1m 12s',
          },
        ],
        artifacts: [
          {
            id: 'sec-a1',
            name: 'advisories.sarif',
            size: '218 KB',
            kind: 'SARIF',
          },
          {
            id: 'sec-a2',
            name: 'sbom.spdx.json',
            size: '1.1 MB',
            kind: 'SBOM',
          },
        ],
        trend: [
          68, 74, 71, 66, 79, 70, 73, 65, 77, 69, 72, 67, 75, 70, 64, 76, 71,
          68, 73, 72,
        ],
      },
    ],
  },
  {
    id: 'publish-docs',
    parallel: [
      {
        id: 'publish-docs',
        name: 'Publish Docs',
        status: 'skipped',
        note: 'No docs changed',
        logs: [
          {
            id: 'docs-1',
            time: '14:08:55',
            level: 'info',
            message: 'Evaluating condition: paths changed under docs/',
          },
          {
            id: 'docs-2',
            time: '14:08:55',
            level: 'info',
            message: 'No matching paths — stage skipped',
          },
        ],
        artifacts: [],
        trend: [
          58, 61, 55, 63, 57, 60, 54, 62, 59, 56, 64, 58, 61, 55, 60, 57, 63,
          59, 56, 58,
        ],
      },
    ],
  },
  {
    id: 'deploy-canary',
    parallel: [
      {
        id: 'deploy-canary',
        name: 'Deploy Canary',
        status: 'pending',
        note: 'Waiting on Integration',
        logs: [],
        artifacts: [],
        trend: [
          142, 138, 151, 145, 139, 148, 144, 136, 153, 141, 147, 143, 137, 150,
          146, 140, 149, 144, 138, 145,
        ],
      },
    ],
  },
  {
    id: 'deploy-prod',
    parallel: [
      {
        id: 'deploy-prod',
        name: 'Deploy Prod',
        status: 'pending',
        note: 'Waiting on Deploy Canary',
        logs: [],
        artifacts: [],
        trend: [
          296, 311, 288, 304, 299, 315, 292, 307, 301, 285, 318, 294, 309, 297,
          303, 290, 312, 300, 295, 306,
        ],
      },
    ],
  },
];

const ALL_STAGES: Stage[] = PIPELINE.flatMap(group => group.parallel);

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes > 0
    ? `${minutes}m ${String(rest).padStart(2, '0')}s`
    : `${rest}s`;
}

/** What the node shows under its status row. */
function durationLabel(stage: Stage): string {
  if (stage.status === 'pending') {
    return 'Waiting...';
  }
  if (stage.status === 'skipped') {
    return 'Not run';
  }
  return formatDuration(stage.seconds ?? 0);
}

/** A stage only contributes a bar for the current run once it has started. */
function hasCurrentRun(stage: Stage): boolean {
  return stage.status !== 'pending' && stage.status !== 'skipped';
}

/** The edge leaving a group takes the most urgent status in it. */
function edgeStatus(group: StageGroup): StageStatus {
  const statuses = group.parallel.map(stage => stage.status);
  if (statuses.includes('failed')) {
    return 'failed';
  }
  if (statuses.includes('running')) {
    return 'running';
  }
  if (statuses.every(status => status === 'passed')) {
    return 'passed';
  }
  return 'pending';
}

/** The run is failed only once nothing is left that could still pass. */
function overallStatus(): StageStatus {
  const statuses = ALL_STAGES.map(stage => stage.status);
  if (statuses.includes('running')) {
    return 'running';
  }
  if (statuses.includes('failed')) {
    return 'failed';
  }
  if (statuses.includes('pending')) {
    return 'pending';
  }
  return 'passed';
}

// ─── Stage node ─────────────────────────────────────────────────────────────

function StageNode({
  stage,
  isSelected,
  onSelect,
}: {
  stage: Stage;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
}) {
  const meta = STATUS_META[stage.status];

  return (
    <SelectableCard
      label={`${stage.name} — ${meta.label}`}
      isSelected={isSelected}
      onChange={selected => onSelect(selected ? stage.id : null)}
      width={NODE_WIDTH}
      padding={3}>
      <VStack gap={2}>
        <Text weight="semibold" maxLines={1}>
          {stage.name}
        </Text>
        <HStack gap={1.5} align="center">
          {meta.icon ? (
            <Icon icon={meta.icon} size="sm" color={meta.iconColor} />
          ) : (
            <Spinner size="sm" />
          )}
          <Text type="supporting" color="primary">
            {meta.label}
          </Text>
        </HStack>
        <Text type="supporting" hasTabularNumbers>
          {durationLabel(stage)}
        </Text>
        {stage.status === 'running' && stage.progress !== undefined ? (
          <ProgressBar
            label={`${stage.name} progress`}
            value={stage.progress}
            isLabelHidden
            variant="accent"
          />
        ) : null}
      </VStack>
    </SelectableCard>
  );
}

/** The line and arrowhead joining one position on the track to the next. */
function StageEdge({
  status,
  isVertical,
}: {
  status: StageStatus;
  isVertical: boolean;
}) {
  return (
    <Icon
      icon={isVertical ? ArrowLongDownIcon : ArrowLongRightIcon}
      size="lg"
      color={STATUS_META[status].edge}
    />
  );
}

// ─── Detail tabs ────────────────────────────────────────────────────────────

function LogsTab({stage}: {stage: Stage}) {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return stage.logs.filter(line => {
      const matchesLevel = level === 'all' || line.level === level;
      const matchesQuery =
        needle === '' || line.message.toLowerCase().includes(needle);
      return matchesLevel && matchesQuery;
    });
  }, [stage.logs, query, level]);

  const columns: TableColumn<LogLine>[] = [
    {
      key: 'time',
      header: 'Time',
      width: pixel(112),
      renderCell: line => (
        <Text type="code" color="secondary">
          {line.time}
        </Text>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      width: pixel(96),
      renderCell: line => (
        <Token
          size="sm"
          color={LEVEL_COLOR[line.level]}
          label={line.level.toUpperCase()}
        />
      ),
    },
    {
      key: 'message',
      header: 'Message',
      width: proportional(1),
      renderCell: line => <Text type="code">{line.message}</Text>,
    },
  ];

  return (
    <VStack gap={3}>
      <HStack gap={2} align="center" wrap="wrap">
        <TextInput
          label="Search log output"
          isLabelHidden
          placeholder="Search log output"
          value={query}
          onChange={setQuery}
          size="sm"
          startIcon={MagnifyingGlassIcon}
          hasClear
        />
        <SegmentedControl
          label="Severity filter"
          value={level}
          onChange={setLevel}
          size="sm">
          <SegmentedControlItem value="all" label="All" />
          <SegmentedControlItem value="error" label="Error" />
          <SegmentedControlItem value="warn" label="Warning" />
        </SegmentedControl>
      </HStack>
      {stage.logs.length === 0 ? (
        <EmptyState
          isCompact
          icon={<Icon icon={DocumentTextIcon} size="lg" color="secondary" />}
          title="No output yet"
          description={stage.note ?? 'This stage has not started.'}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          isCompact
          icon={<Icon icon={MagnifyingGlassIcon} size="lg" color="secondary" />}
          title="No matching lines"
          description="No log line matches this search and severity."
        />
      ) : (
        <Table
          data={rows}
          columns={columns}
          idKey="id"
          density="compact"
          dividers="none"
          hasHover
        />
      )}
    </VStack>
  );
}

function ArtifactsTab({stage}: {stage: Stage}) {
  const columns: TableColumn<Artifact>[] = [
    {
      key: 'name',
      header: 'Artifact',
      width: proportional(2),
      renderCell: artifact => (
        <HStack gap={2} align="center">
          <Icon icon={PaperClipIcon} size="sm" color="secondary" />
          <Text>{artifact.name}</Text>
        </HStack>
      ),
    },
    {key: 'kind', header: 'Type', width: proportional(1)},
    {
      key: 'size',
      header: 'Size',
      width: pixel(96),
      align: 'end',
      renderCell: artifact => (
        <Text hasTabularNumbers color="secondary">
          {artifact.size}
        </Text>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: pixel(232),
      align: 'end',
      renderCell: artifact => (
        <HStack gap={1} justify="end">
          <Button
            label="View"
            variant="ghost"
            size="sm"
            tooltip={`View ${artifact.name}`}
          />
          <Button
            label="Download"
            variant="ghost"
            size="sm"
            icon={<Icon icon={ArrowDownTrayIcon} size="sm" />}
          />
        </HStack>
      ),
    },
  ];

  if (stage.artifacts.length === 0) {
    return (
      <EmptyState
        isCompact
        icon={<Icon icon={PaperClipIcon} size="lg" color="secondary" />}
        title="No artifacts"
        description={
          stage.note ?? 'This stage produced no files in the current run.'
        }
      />
    );
  }

  return (
    <Table
      data={stage.artifacts}
      columns={columns}
      idKey="id"
      density="compact"
      hasHover
    />
  );
}

function MetricsTab({stage}: {stage: Stage}) {
  const slowest = Math.max(...stage.trend);
  const isCurrent = hasCurrentRun(stage);
  const newestRun = isCurrent ? RUN_NUMBER : RUN_NUMBER - 1;
  const median = [...stage.trend].sort((a, b) => a - b)[
    Math.floor(stage.trend.length / 2)
  ];

  // Prior runs are plain accent bars; the current run takes the stage's own
  // status color so it reads out of the stack. `neutral` is not an option for
  // the prior runs: its fill resolves to the same token as the track in dark
  // mode, which erases the bar.
  const currentVariant =
    stage.status === 'failed'
      ? 'error'
      : stage.status === 'passed'
        ? 'success'
        : 'accent';

  return (
    <VStack gap={3} maxWidth={640}>
      <HStack gap={4} wrap="wrap">
        <Text type="supporting">
          Duration across the last {stage.trend.length} runs
        </Text>
        <Text type="supporting" hasTabularNumbers>
          Median {formatDuration(median)} · Slowest {formatDuration(slowest)}
        </Text>
      </HStack>
      <VStack gap={1.5}>
        {stage.trend.map((seconds, index) => {
          const runNumber = newestRun - (stage.trend.length - 1 - index);
          const isThisRun = isCurrent && index === stage.trend.length - 1;
          return (
            <ProgressBar
              key={runNumber}
              label={
                isThisRun ? `Run #${runNumber} (current)` : `Run #${runNumber}`
              }
              value={seconds}
              max={slowest}
              variant={isThisRun ? currentVariant : 'accent'}
              hasValueLabel
              formatValueLabel={value => formatDuration(value)}
            />
          );
        })}
      </VStack>
    </VStack>
  );
}

// ─── Detail pane ────────────────────────────────────────────────────────────

function StageDetail({stage, onClose}: {stage: Stage; onClose: () => void}) {
  const [tab, setTab] = useState('logs');
  const meta = STATUS_META[stage.status];

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader>
          <VStack gap={2}>
            <HStack gap={3} align="center" justify="between" wrap="wrap">
              <HStack gap={2} align="center" wrap="wrap">
                <Heading level={3}>{stage.name}</Heading>
                <Badge variant={meta.badge} label={meta.label} />
                <Text type="supporting" hasTabularNumbers>
                  {durationLabel(stage)}
                </Text>
                {stage.note ? (
                  <Text type="supporting">{stage.note}</Text>
                ) : null}
              </HStack>
              <IconButton
                label="Close stage details"
                variant="ghost"
                size="sm"
                icon={<Icon icon={XMarkIcon} size="sm" />}
                onClick={onClose}
              />
            </HStack>
            <Divider isFullBleed />
            <TabList value={tab} onChange={setTab} role="tablist" size="sm">
              <Tab
                value="logs"
                label="Logs"
                panelId="stage-detail-panel"
                icon={<Icon icon={DocumentTextIcon} size="sm" />}
              />
              <Tab
                value="artifacts"
                label="Artifacts"
                panelId="stage-detail-panel"
                icon={<Icon icon={PaperClipIcon} size="sm" />}
              />
              <Tab
                value="metrics"
                label="Metrics"
                panelId="stage-detail-panel"
                icon={<Icon icon={ChartBarIcon} size="sm" />}
              />
            </TabList>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={3} id="stage-detail-panel" role="tabpanel">
          {tab === 'logs' ? <LogsTab stage={stage} /> : null}
          {tab === 'artifacts' ? <ArtifactsTab stage={stage} /> : null}
          {tab === 'metrics' ? <MetricsTab stage={stage} /> : null}
        </LayoutContent>
      }
    />
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PipelineFlow() {
  const [selectedId, setSelectedId] = useState<string | null>('security');
  const [axis, setAxis] = useState('horizontal');
  const isNarrow = useMediaQuery('(max-width: 900px)');

  // Roughly a third of the frame, draggable between a peek and half the page.
  const detailPane = useResizable({
    defaultSize: 320,
    minSizePx: 168,
    maxSizePx: 560,
  });

  const isVertical = axis === 'vertical' || isNarrow;
  const selectedStage = ALL_STAGES.find(stage => stage.id === selectedId);
  const runStatus = STATUS_META[overallStatus()];

  // One position on the track, then the edge leading to the next position.
  const track = PIPELINE.flatMap((group, index) => {
    const nodes = group.parallel.map(stage => (
      <StageNode
        key={stage.id}
        stage={stage}
        isSelected={stage.id === selectedId}
        onSelect={setSelectedId}
      />
    ));

    // Parallel branches fan out across the axis the track does not use.
    const position =
      group.parallel.length === 1 ? (
        nodes
      ) : isVertical ? (
        <HStack key={group.id} gap={3} align="start" wrap="wrap">
          {nodes}
        </HStack>
      ) : (
        <VStack key={group.id} gap={3} align="center">
          {nodes}
        </VStack>
      );

    if (index === PIPELINE.length - 1) {
      return [position];
    }

    return [
      position,
      <StageEdge
        key={`${group.id}-edge`}
        status={edgeStatus(group)}
        isVertical={isVertical}
      />,
    ];
  });

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} align="center" justify="between" wrap="wrap">
            <VStack gap={1}>
              <HStack gap={2} align="center" wrap="wrap">
                <Heading level={2}>{PIPELINE_NAME}</Heading>
                <Badge variant={runStatus.badge} label={runStatus.label} />
              </HStack>
              <Text type="supporting">{RUN_META}</Text>
            </VStack>
            <HStack gap={2} align="center" wrap="wrap">
              <SegmentedControl
                label="Pipeline direction"
                value={isVertical ? 'vertical' : 'horizontal'}
                onChange={setAxis}
                size="sm"
                isDisabled={isNarrow}
                disabledMessage="Narrow viewports always stack the pipeline vertically.">
                <SegmentedControlItem value="horizontal" label="Horizontal" />
                <SegmentedControlItem value="vertical" label="Vertical" />
              </SegmentedControl>
              <Button
                label="Re-run"
                variant="primary"
                icon={<Icon icon={ArrowPathIcon} size="sm" />}
              />
              <Button
                label="Cancel"
                variant="destructive"
                icon={<Icon icon={NoSymbolIcon} size="sm" />}
              />
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={4}>
          {isVertical ? (
            <VStack gap={2} align="start">
              {track}
            </VStack>
          ) : (
            <HStack
              gap={2}
              align="center"
              height="100%"
              isScrollable
              paddingBlockEnd={2}>
              {track}
            </HStack>
          )}
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider>
          {selectedStage ? (
            // A definite pixel height on the pane is what lets the detail
            // Layout inside it fill and scroll: `height="fill"` is height:100%,
            // which needs a definite height to resolve against.
            <VStack>
              <ResizeHandle
                direction="vertical"
                isReversed
                // Park the grip above the divider: on the panel side its grab
                // zone sits over this pane's own header row and swallows
                // clicks meant for the close button.
                pillPlacement="start"
                resizable={detailPane.props}
                label="Resize stage details"
              />
              <VStack height={detailPane.size}>
                <StageDetail
                  stage={selectedStage}
                  onClose={() => setSelectedId(null)}
                />
              </VStack>
            </VStack>
          ) : (
            <HStack padding={3} gap={2} align="center">
              <Icon icon={ChartBarIcon} size="sm" color="secondary" />
              <Text type="supporting">Select a stage to view details</Text>
            </HStack>
          )}
        </LayoutFooter>
      }
    />
  );
}
