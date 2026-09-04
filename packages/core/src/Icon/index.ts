// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Icon component/types, icon registry, and global registration
 * @output Exports Icon, extensible size types, and icon registry helpers
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Icon/Icon.doc.mjs
 */

/**
 * Public extension map for theme-owned Icon size names.
 *
 * Themes may add names through module augmentation. The generated theme CSS
 * remains responsible for styling every custom name.
 */
export interface IconSizeMap {
  xsm: true;
  sm: true;
  md: true;
  lg: true;
}

export {Icon, renderIconSlot} from './Icon';
export {useIcon} from './useIcon';
export type {IconProps, IconColor, IconSize, IconType} from './Icon';

// Global registry (RSC-compatible, no 'use client')
export {
  registerIcons,
  getIconRegistry,
  getIcon,
  getExtendedIcon,
  resetIcons,
} from './globalIconRegistry';
export type {
  IconName,
  ExtendedIconName,
  NamespacedIconName,
  IconRegistry,
  IconRegistrySource,
} from './globalIconRegistry';
