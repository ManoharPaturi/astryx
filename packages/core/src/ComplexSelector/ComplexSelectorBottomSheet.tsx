// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ComplexSelectorBottomSheet.tsx
 * @input Uses BottomSheet, Heading, Section, and the shared focusable selector
 * @output Internal mobile host for rich ComplexSelector content
 * @position ComplexSelector presentation primitive
 */

import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Heading} from '../Heading';
import {Section} from '../Section';
import {FOCUSABLE_SELECTOR} from '../hooks/focusableSelector';
import {spacingVars} from '../theme/tokens.stylex';
import {stableClassName} from '../naming';

const LazyBottomSheet = lazy(async () =>
  import('../BottomSheet/BottomSheet').then(module => ({
    default: module.BottomSheet,
  })),
);

const styles = stylex.create({
  content: {
    width: '100%',
  },
  heading: {
    marginBlockEnd: spacingVars['--spacing-3'],
  },
});

interface ComplexSelectorBottomSheetProps {
  children: ReactNode;
  finalFocusRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  label: string;
  onOpenChange: (isOpen: boolean) => void;
}

function ComplexSelectorBottomSheetContent({
  children,
  isOpen,
  label,
}: Pick<ComplexSelectorBottomSheetProps, 'children' | 'isOpen' | 'label'>) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      const content = contentRef.current;
      const focusTarget =
        content?.querySelector<HTMLElement>('[data-autofocus]') ??
        content?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      focusTarget?.focus({preventScroll: true});
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  return (
    <Section padding={4}>
      <div ref={contentRef} {...stylex.props(styles.content)}>
        <Heading level={3} xstyle={styles.heading}>
          {label}
        </Heading>
        {children}
      </div>
    </Section>
  );
}

export function ComplexSelectorBottomSheet({
  children,
  finalFocusRef,
  isOpen,
  label,
  onOpenChange,
}: ComplexSelectorBottomSheetProps) {
  return (
    <Suspense fallback={null}>
      <LazyBottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        finalFocusRef={finalFocusRef}
        label={label}
        height="tall"
        purpose="info"
        className={stableClassName('complex-selector-popup')}>
        <ComplexSelectorBottomSheetContent isOpen={isOpen} label={label}>
          {children}
        </ComplexSelectorBottomSheetContent>
      </LazyBottomSheet>
    </Suspense>
  );
}

ComplexSelectorBottomSheet.displayName = 'ComplexSelectorBottomSheet';
