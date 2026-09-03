// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'LayoutContent',
  subComponentOf: 'Layout',
  displayName: 'Layout Content',
  isHiddenFromOverview: true,
  description: 'Scrollable main content area.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content.',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        'Internal padding using the spacing scale. Overrides the default padding from the layout container.',
    },
    {
      name: 'isScrollable',
      type: 'boolean',
      description:
        'Controls whether this content area owns an independent scrollport when it is the top-level rendered LayoutContent root for the content slot. True keeps it pinned and independently scrollable. False makes it participate in the Layout middle scrollport in fill-height layouts; auto-height layouts remain page/ancestor-scrolled.',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the landmark element.',
    },
    {
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA landmark role.',
    },
  ],
};

export const docsZh = {
  name: 'LayoutContent',
  isHiddenFromOverview: true,
  displayName: 'Layout Content',
  description: '可滚动的主内容区域。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '内容。',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '使用间距比例的内边距。覆盖布局容器的默认内边距。',
    },
    {
      name: 'isScrollable',
      type: 'boolean',
      description:
        '控制此内容区域是否拥有独立滚动容器。true 时固定并独立滚动；false 时在填充高度的 Layout 中参与中间滚动容器，在自动高度的 Layout 中由页面或祖先滚动。',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description: '地标元素的无障碍标签。',
    },
    {
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA 地标角色。',
    },
  ],
};

export const docsDense = {
  name: 'LayoutContent',
  isHiddenFromOverview: true,
  displayName: 'Layout Content',
  description: 'Scrollable main content area.',
  propDescriptions: {
    children: 'Content.',
    padding:
      'Internal padding on spacing scale. Overrides layout container default.',
    isScrollable:
      'Own an independent scrollport when true; participate in the fill-height Layout middle scrollport when false.',
    label: 'Accessible label for landmark element.',
    role: 'ARIA landmark role.',
  },
};
