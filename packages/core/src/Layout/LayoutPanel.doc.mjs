// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'LayoutPanel',
  subComponentOf: 'Layout',
  displayName: 'Layout Panel',
  isHiddenFromOverview: true,
  description: 'Sidebar for navigation, settings, or inspector panels.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Panel content.',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description: 'Border on the appropriate edge.',
      default: 'false',
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
        'Controls whether this panel owns an independent scrollport when it is a top-level rendered LayoutPanel root in the start or end slot. True keeps it pinned and independently scrollable. False makes it participate in the Layout middle scrollport in fill-height layouts; auto-height layouts remain page/ancestor-scrolled.',
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
    {
      name: 'width',
      type: 'number | string',
      description:
        'Width of the panel. Numbers are treated as pixels, strings are used as-is. Ignored when resizable is provided; the hook controls width.',
    },
    {
      name: 'resizable',
      type: 'ResizableProps',
      description:
        "Resize props from useResizable(). When provided, the hook drives the panel width and a ResizeHandle should be placed adjacent to the panel. Carries the region's axis ('horizontal' | 'vertical'), which must match the adjacent ResizeHandle's direction.",
    },
  ],
};

export const docsZh = {
  name: 'LayoutPanel',
  isHiddenFromOverview: true,
  displayName: 'Layout Panel',
  description: '用于导航、设置或检查器面板的侧边栏。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '面板内容。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description: '相应边缘的边框。',
      default: 'false',
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
        '控制此面板是否拥有独立滚动容器。true 时固定并独立滚动；false 时在填充高度的 Layout 中参与中间滚动容器，在自动高度的 Layout 中由页面或祖先滚动。',
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
    {
      name: 'width',
      type: 'number | string',
      description:
        '面板宽度。数字按像素处理，字符串按原样使用。提供 resizable 时忽略，宽度由 hook 控制。',
    },
    {
      name: 'resizable',
      type: 'ResizableProps',
      description:
        "来自 useResizable() 的调整大小属性。提供时面板宽度由 hook 驱动，应在面板旁放置 ResizeHandle。其中携带区域的轴向（'horizontal' | 'vertical'），必须与相邻 ResizeHandle 的 direction 一致。",
    },
  ],
};

export const docsDense = {
  name: 'LayoutPanel',
  isHiddenFromOverview: true,
  displayName: 'Layout Panel',
  description: 'Sidebar for navigation, settings, inspector panels.',
  propDescriptions: {
    children: 'Panel content.',
    hasDivider: 'Border on appropriate edge.',
    padding:
      'Internal padding on spacing scale. Overrides layout container default.',
    isScrollable:
      'Own an independent scrollport when true; participate in the fill-height Layout middle scrollport when false.',
    label: 'Accessible label for landmark element.',
    role: 'ARIA landmark role.',
    width:
      'Panel width. Numbers = pixels, strings as-is. Ignored when resizable provided; hook controls width.',
    resizable:
      'Resize props from useResizable(). Hook drives panel width; place ResizeHandle adjacent.',
  },
};
