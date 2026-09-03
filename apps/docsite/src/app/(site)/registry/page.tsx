// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {RegistryBrowser} from '../../../components/RegistryBrowser';
import {
  shadcnRegistryCounts,
  shadcnRegistryEntries,
} from '../../../generated/shadcnRegistry';
import {CURRENT_TARGET} from '../../../lib/docsVersions';
import {pageMetadata} from '../../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata({
  title: 'Astryx Registry',
  description:
    'Browse experimental shadcn-compatible installs for Astryx components, examples, blocks, and pages.',
  path: '/registry',
});

export default function RegistryPage() {
  if (CURRENT_TARGET !== 'canary') {
    notFound();
  }

  return (
    <RegistryBrowser
      entries={shadcnRegistryEntries}
      counts={shadcnRegistryCounts}
    />
  );
}
