// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Code} from '@astryxdesign/core/Code';
import {Grid} from '@astryxdesign/core/Grid';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Section} from '@astryxdesign/core/Section';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Heading, Text} from '@astryxdesign/core/Text';
import {ToggleButton, ToggleButtonGroup} from '@astryxdesign/core/ToggleButton';
import type {
  ShadcnRegistryEntry,
  ShadcnRegistryKind,
} from '../generated/shadcnRegistry';
import {
  shadcnRegistryIsPreview,
  shadcnRegistryOrigin,
} from '../generated/shadcnRegistry';
import {shadcnInstallCommand} from '../lib/shadcnRegistry.mjs';
import {layout} from '../layout.stylex';

const PAGE_SIZE = 48;

type RegistryFilter = 'all' | ShadcnRegistryKind;

const FILTERS: Array<{label: string; value: RegistryFilter}> = [
  {label: 'All', value: 'all'},
  {label: 'Components', value: 'component'},
  {label: 'Hooks', value: 'hook'},
  {label: 'Showcases', value: 'showcase'},
  {label: 'Examples & blocks', value: 'example'},
  {label: 'Pages', value: 'page'},
];

const KIND_LABELS: Record<ShadcnRegistryKind, string> = {
  component: 'Component',
  hook: 'Hook',
  showcase: 'Showcase',
  example: 'Example or block',
  page: 'Page',
};

const styles = stylex.create({
  section: {
    marginInline: 'auto',
  },
  filters: {
    flexWrap: 'wrap',
  },
  grid: {
    width: '100%',
  },
  card: {
    height: '100%',
  },
  command: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

interface RegistryCounts {
  components: number;
  blocks: number;
  pages: number;
  total: number;
}

interface RegistryBrowserProps {
  entries: ShadcnRegistryEntry[];
  counts: RegistryCounts;
}

function matches(entry: ShadcnRegistryEntry, query: string) {
  const haystack = [entry.name, entry.title, entry.description, entry.kind]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function RegistryBrowser({entries, counts}: RegistryBrowserProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<RegistryFilter>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const filteredEntries = useMemo(
    () =>
      entries.filter(
        entry =>
          (filter === 'all' || entry.kind === filter) && matches(entry, query),
      ),
    [entries, filter, query],
  );
  const visibleEntries = filteredEntries.slice(0, visibleCount);

  const copyCommand = (entry: ShadcnRegistryEntry) => {
    navigator.clipboard
      .writeText(shadcnInstallCommand(entry.name, shadcnRegistryOrigin))
      .then(() => {
        setCopiedItem(entry.name);
        setTimeout(() => setCopiedItem(null), 1600);
      });
  };

  return (
    <Section
      maxWidth={layout.contentMaxWidth}
      padding={6}
      xstyle={styles.section}>
      <VStack gap={8}>
        <VStack gap={2} hAlign="center">
          <Heading level={1} type="display-1">
            Astryx Registry
          </Heading>
          <Text type="body" color="secondary" justify="center">
            Browse experimental shadcn-compatible installs generated from the
            same Astryx catalog used by the CLI and documentation.
          </Text>
          <Text type="supporting" color="secondary" justify="center">
            {counts.total} items · {counts.components} components and hooks ·{' '}
            {counts.blocks} showcases, examples, and blocks · {counts.pages}{' '}
            pages
          </Text>
        </VStack>

        <Card variant="muted">
          <VStack gap={2}>
            <Text type="body" weight="bold">
              Experimental preview
            </Text>
            <Text type="body" color="secondary">
              This page is for people. The raw shadcn files live under `/r/`. A
              component install keeps Astryx as a package dependency. An
              example, block, or page install copies only editable composition
              code.
            </Text>
            {shadcnRegistryIsPreview && (
              <Text type="supporting" color="secondary">
                Commands on this preview use an expiring draft URL.
              </Text>
            )}
            <HStack gap={2}>
              <Button
                label="Compatibility guide"
                variant="secondary"
                href="/docs/shadcn-compatibility"
              />
              <Button
                label="Raw registry JSON"
                variant="ghost"
                href="/r/registry.json"
              />
            </HStack>
          </VStack>
        </Card>

        <VStack gap={3}>
          <TextInput
            label="Search the registry"
            isLabelHidden
            value={query}
            onChange={setQuery}
            placeholder="Search components, examples, blocks, and pages…"
            hasClear
          />
          <ToggleButtonGroup
            label="Filter registry items"
            type="single"
            value={filter}
            onChange={value => {
              setFilter((value as RegistryFilter | null) ?? 'all');
              setVisibleCount(PAGE_SIZE);
            }}
            xstyle={styles.filters}>
            {FILTERS.map(option => (
              <ToggleButton
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </ToggleButtonGroup>
          <Text type="supporting" color="secondary">
            Showing {visibleEntries.length} of {filteredEntries.length} matching
            items
          </Text>
        </VStack>

        <Grid
          columns={{minWidth: 360, repeat: 'fill'}}
          gap={3}
          xstyle={styles.grid}>
          {visibleEntries.map(entry => (
            <Card key={entry.name} xstyle={styles.card}>
              <VStack gap={3} height="fill">
                <VStack gap={1}>
                  <Text type="supporting" color="secondary">
                    {KIND_LABELS[entry.kind]}
                  </Text>
                  <Heading level={3}>{entry.title}</Heading>
                  <Text type="body" color="secondary" maxLines={3}>
                    {entry.description}
                  </Text>
                </VStack>
                <Code xstyle={styles.command}>
                  {shadcnInstallCommand(entry.name, shadcnRegistryOrigin)}
                </Code>
                <HStack gap={2}>
                  <Button
                    label={
                      copiedItem === entry.name ? 'Copied' : 'Copy command'
                    }
                    size="sm"
                    variant="primary"
                    onClick={() => copyCommand(entry)}
                  />
                  <Button
                    label="View source docs"
                    size="sm"
                    variant="secondary"
                    href={entry.href}
                  />
                </HStack>
              </VStack>
            </Card>
          ))}
        </Grid>

        {visibleEntries.length < filteredEntries.length && (
          <Button
            label="Show more"
            variant="secondary"
            onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
          />
        )}
      </VStack>
    </Section>
  );
}
