// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useScrollableTabStop} from '@astryxdesign/core/hooks';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {
  colorVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';

/**
 * `useScrollableTabStop` keeps `tabindex="0"` on a scroll container exactly
 * while it actually overflows, so a keyboard user can reach it and scroll it
 * with the arrow keys (WCAG 2.1.1; axe `scrollable-region-focusable`).
 *
 * **Tab through these with the keyboard.** Focus stops on the region that
 * overflows and skips the one that fits, even though both are `overflow: auto`
 * with the same fixed height — a tab stop on a box that cannot scroll is a
 * dead stop.
 *
 * Whether a box overflows is only knowable after layout and keeps changing, so
 * the attribute is written from a shared `ResizeObserver` callback rather than
 * from React state: growing the content adds the tab stop with no re-render.
 *
 * Adopting the hook makes the consuming component client-only, because reading
 * layout is client-only work.
 */

const styles = stylex.create({
  scroller: {
    height: 140,
    width: 280,
    overflow: 'auto',
    padding: spacingVars['--spacing-3'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-background-card'],
  },
  page: {
    padding: spacingVars['--spacing-6'],
    backgroundColor: colorVars['--color-background-body'],
  },
});

interface ScrollRegionProps {
  label: string;
  paragraphs: number;
}

function ScrollRegion({label, paragraphs}: ScrollRegionProps) {
  const scrollRef = useScrollableTabStop();

  return (
    <div ref={scrollRef} aria-label={label} {...stylex.props(styles.scroller)}>
      <VStack gap={2}>
        {Array.from({length: paragraphs}, (_, index) => (
          <Text key={index}>
            {label} — paragraph {index + 1}.
          </Text>
        ))}
      </VStack>
    </div>
  );
}

const meta: Meta = {
  title: 'Hooks/useScrollableTabStop',
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div {...stylex.props(styles.page)}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

/**
 * Two regions with identical styling. The left one overflows and takes a tab
 * stop; the right one fits and stays out of the tab order.
 */
export const OverflowingAndFitting: Story = {
  render: () => (
    <HStack gap={6}>
      <ScrollRegion label="Overflowing region" paragraphs={12} />
      <ScrollRegion label="Region that fits" paragraphs={1} />
    </HStack>
  ),
};

/**
 * The tab stop follows the content. Add paragraphs until the region overflows
 * and it becomes reachable; remove them and it drops out of the tab order
 * again — no re-render is involved in either direction.
 */
export const AppearsWhenContentGrows: Story = {
  render: function GrowingRegion() {
    const [paragraphs, setParagraphs] = useState(1);
    const scrollRef = useScrollableTabStop();

    return (
      <VStack gap={3}>
        <HStack gap={2}>
          <Button
            label="Add content"
            onClick={() => setParagraphs(count => count + 3)}
          />
          <Button
            label="Reset"
            variant="secondary"
            onClick={() => setParagraphs(1)}
          />
        </HStack>
        <div
          ref={scrollRef}
          aria-label="Growing region"
          {...stylex.props(styles.scroller)}>
          <VStack gap={2}>
            {Array.from({length: paragraphs}, (_, index) => (
              <Text key={index}>Paragraph {index + 1}.</Text>
            ))}
          </VStack>
        </div>
      </VStack>
    );
  },
};

/**
 * `enabled` gates the hook on whatever makes the element a scroll container,
 * so nothing is measured or observed for a container that cannot scroll.
 */
export const GatedByEnabled: Story = {
  render: function GatedRegion() {
    const [isScrollable, setIsScrollable] = useState(true);
    const scrollRef = useScrollableTabStop({enabled: isScrollable});

    return (
      <VStack gap={3}>
        <Button
          label={isScrollable ? 'Disable the hook' : 'Enable the hook'}
          onClick={() => setIsScrollable(value => !value)}
        />
        <div
          ref={scrollRef}
          aria-label="Gated region"
          {...stylex.props(styles.scroller)}>
          <VStack gap={2}>
            {Array.from({length: 12}, (_, index) => (
              <Text key={index}>Paragraph {index + 1}.</Text>
            ))}
          </VStack>
        </div>
      </VStack>
    );
  },
};
