// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Figma UI3 inspector, reached through theming alone.
 *
 * The rule this page holds to: **no Astryx component receives `xstyle`.**
 * Every visual difference from stock Astryx is expressed in `defineTheme` —
 * tokens, typography, component overrides, icons. Layout containers are still
 * styled, because positioning is product code, but nothing reaches inside a
 * component to repaint it.
 *
 * This only works because the dev server's cascade layers are split correctly.
 * `defineTheme({components})` writes into `@layer astryx-theme`, which sits
 * above `astryx-base` and below `product`. If Astryx's own rules land in
 * `product` — as they did until apps/template-viewer/vite.config.ts set a
 * `libraryPattern` that matches source-resolved core — every override here is
 * silently discarded.
 */

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';

import {Theme, defineTheme} from '@astryxdesign/core/theme';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Divider} from '@astryxdesign/core/Divider';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {Stack, StackItem} from '@astryxdesign/core/Stack';
import {InputGroup, InputGroupText} from '@astryxdesign/core/InputGroup';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {TextInput} from '@astryxdesign/core/TextInput';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {ToggleButton, ToggleButtonGroup} from '@astryxdesign/core/ToggleButton';

// ---------------------------------------------------------------------------
// Glyphs. Data, not components — Icon takes an IconType, so these are values
// the theme hands to Astryx rather than markup the page renders itself.
// ---------------------------------------------------------------------------

const S = {
  viewBox: '0 0 16 16',
  // Intrinsic size matters: inside InputGroupText nothing else sizes the glyph,
  // so without this the svg lays out at zero width and silently disappears.
  width: 16,
  height: 16,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const g = (d: React.ReactNode) =>
  function Glyph() {
    return <svg {...S}>{d}</svg>;
  };

const AlignLeftIcon = g(
  <>
    <path d="M2.6 2.8v10.4" />
    <path d="M5.2 5.6h7.2M5.2 10.4h4.4" />
  </>,
);
const AlignCenterHIcon = g(
  <>
    <path d="M8 2.8v10.4" />
    <path d="M4 5.6h8M5.6 10.4h4.8" />
  </>,
);
const AlignRightIcon = g(
  <>
    <path d="M13.4 2.8v10.4" />
    <path d="M3.6 5.6h7.2M6.4 10.4h4.4" />
  </>,
);
const AlignTopIcon = g(
  <>
    <path d="M2.8 2.6h10.4" />
    <path d="M5.6 5.2v7.2M10.4 5.2v4.4" />
  </>,
);
const AlignCenterVIcon = g(
  <>
    <path d="M2.8 8h10.4" />
    <path d="M5.6 4v8M10.4 5.6v4.8" />
  </>,
);
const AlignBottomIcon = g(
  <>
    <path d="M2.8 13.4h10.4" />
    <path d="M5.6 3.6v7.2M10.4 6.4v4.4" />
  </>,
);
const AngleIcon = g(
  <>
    <path d="M4 3.5v9h9" />
    <path d="M4 8.2h3.6" />
  </>,
);
const RotateIcon = g(
  <>
    <path d="M7.2 6.3 10.7 9.8 7.2 13.3 3.7 9.8z" />
    <path d="M3.9 6.3a4.4 4.4 0 0 1 6.7-1.5" />
    <path d="M8.4 4.1 11.2 4.3 10.7 7z" fill="currentColor" />
  </>,
);
const FlipHIcon = g(
  <>
    <path d="M8 3v10" />
    <path d="M5.1 5.3v5.4L7 8z" />
    <path d="M10.9 5.3v5.4L9 8z" />
  </>,
);
const FlipVIcon = g(
  <>
    <path d="M3.2 8h9.6" />
    <path d="M5.3 5.1h5.4L8 7z" />
    <path d="M5.3 10.9h5.4L8 9z" />
  </>,
);
const AbsolutePositionIcon = g(
  <>
    <path d="M4.8 3.5h6.7" stroke="#0D99FF" strokeWidth="1.9" />
    <path d="M3.6 4.7v6" stroke="#0D99FF" strokeWidth="1.9" />
    <path d="M12.4 5.1v4.4" stroke="#9B9B9B" strokeWidth="1" />
    <path d="M5.6 12.3h5.2" stroke="#B8B8B8" strokeWidth="1.1" />
    <path d="M8 5.5v4.9M5.6 7.95h4.8" stroke="#8C8C8C" strokeWidth="1.15" />
  </>,
);
const ConstrainIcon = g(
  <>
    <path d="M6 7.1V5.2a2 2 0 1 1 4 0v1.9" />
    <path d="M6 8.9v1.9a2 2 0 1 0 4 0V8.9" />
  </>,
);
const OpacityIcon = g(
  <>
    <rect x="2.6" y="2.6" width="10.8" height="10.8" rx="1.6" />
    <circle cx="6" cy="10.6" r="0.65" fill="currentColor" />
    <circle cx="8.4" cy="10.6" r="0.65" fill="currentColor" />
    <circle cx="10.8" cy="10.6" r="0.65" fill="currentColor" />
    <circle cx="8.4" cy="8.2" r="0.55" fill="currentColor" />
    <circle cx="10.8" cy="8.2" r="0.55" fill="currentColor" />
    <circle cx="10.8" cy="5.8" r="0.45" fill="currentColor" />
  </>,
);
const CornerRadiusIcon = g(<path d="M3.4 12.6V6a2.6 2.6 0 0 1 2.6-2.6h6.6" />);
const IndependentCornersIcon = g(
  <>
    <path d="M3 6V4.4a1.4 1.4 0 0 1 1.4-1.4H6" />
    <path d="M10 3h1.6A1.4 1.4 0 0 1 13 4.4V6" />
    <path d="M13 10v1.6a1.4 1.4 0 0 1-1.4 1.4H10" />
    <path d="M6 13H4.4A1.4 1.4 0 0 1 3 11.6V10" />
  </>,
);
const BlendModeIcon = g(
  <>
    <circle cx="6.4" cy="8" r="4.6" />
    <circle cx="6.4" cy="8" r="1.1" fill="currentColor" />
    <path d="M9.6 4.6a4.6 4.6 0 0 1 0 6.8" />
  </>,
);
const EyeIcon = g(
  <>
    <path d="M1.8 8S4.1 4.2 8 4.2 14.2 8 14.2 8 11.9 11.8 8 11.8 1.8 8 1.8 8z" />
    <circle cx="8" cy="8" r="1.7" />
    <circle cx="8" cy="8" r="0.6" fill="currentColor" />
  </>,
);
const DropletIcon = g(
  <path d="M8 2.4s3.6 3.9 3.6 6.4a3.6 3.6 0 0 1-7.2 0C4.4 6.3 8 2.4 8 2.4z" />,
);
const PlayIcon = g(<path d="M5.4 3.4 12 8l-6.6 4.6z" />);
const ExpandIcon = g(
  <>
    <path d="M3 6V3h3M13 6V3h-3M3 10v3h3M13 10v3h-3" />
  </>,
);
const PlusIcon = g(<path d="M8 3.6v8.8M3.6 8h8.8" />);
const MinusIcon = g(<path d="M3.6 8h8.8" />);

// ---------------------------------------------------------------------------
// The theme. Everything the panel looks like is decided here.
// ---------------------------------------------------------------------------

const FIGMA_GREY = '#F5F5F5';
const FIGMA_INK = '#111111';
const FIGMA_MUTED = '#8C8C8C';

const figmaThemed = defineTheme({
  name: 'figma-ui3-themed',
  typography: {
    scale: {base: 14, ratio: 1.2},
    body: {
      family: 'Inter',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600&display=swap',
    },
  },
  tokens: {
    '--color-background-body': '#FFFFFF',
    '--color-background-card': '#FFFFFF',
    '--color-background-surface': FIGMA_GREY,
    '--color-background-muted': FIGMA_GREY,
    '--color-text-primary': FIGMA_INK,
    '--color-text-secondary': FIGMA_MUTED,
    '--color-text-disabled': '#B3B3B3',
    '--color-icon-primary': FIGMA_INK,
    '--color-icon-secondary': FIGMA_MUTED,
    '--color-border': '#E6E6E6',
    '--color-accent': '#0D99FF',
    '--color-on-accent': '#FFFFFF',
    '--color-neutral': FIGMA_GREY,
    '--radius-element': '6px',
    '--radius-inner': '4px',
    // Figma's 24px controls, at the reference screenshot's 1.296x.
    '--size-element-sm': '31px',
    '--size-element-md': '31px',
    '--size-element-lg': '31px',
  },
  components: {
    // Fields: one flat grey pill, no border, no seam between addon and input.
    'text-input': {
      base: {
        backgroundColor: FIGMA_GREY,
        borderColor: 'transparent',
        borderRadius: '6px',
        color: FIGMA_INK,
      },
    },
    'number-input': {
      base: {
        backgroundColor: FIGMA_GREY,
        borderColor: 'transparent',
        borderRadius: '6px',
        color: FIGMA_INK,
      },
    },
    'input-group': {base: {backgroundColor: FIGMA_GREY, borderRadius: '6px'}},
    // Addons are bare glyphs sitting on the field fill, not attached buttons.
    'input-group-text': {
      base: {
        backgroundColor: 'transparent',
        borderWidth: '0',
        minWidth: '0',
        color: FIGMA_MUTED,
        paddingInline: '0',
        marginInlineStart: '0',
      },
    },
    // Figma's tab strip has no track; only the selected tab carries a fill.
    'segmented-control': {
      base: {backgroundColor: 'transparent', padding: '0', gap: '2px'},
    },
    'segmented-control-item': {
      base: {backgroundColor: 'transparent', color: FIGMA_MUTED},
      selected: {
        backgroundColor: FIGMA_GREY,
        color: FIGMA_INK,
        boxShadow: 'none',
      },
    },
    // A dark glyph on the same grey as every other control — not an accent tile.
    'checkbox-indicator': {
      base: {
        backgroundColor: FIGMA_GREY,
        borderColor: '#E0E0E0',
        borderRadius: '4px',
      },
      checked: {
        backgroundColor: FIGMA_GREY,
        borderColor: '#E0E0E0',
        color: FIGMA_INK,
      },
    },
    'checkbox-indicator-check': {base: {color: FIGMA_INK}},
    'checkbox-label': {base: {color: FIGMA_INK}},
    'field-label': {base: {color: FIGMA_MUTED}},
    // The account chip is Figma yellow; Avatar has no colour prop, so it is
    // reached here rather than through a second nested Theme.
    'avatar-fallback': {
      base: {
        backgroundColor: '#FFCD08',
        color: FIGMA_INK,
        fontWeight: '600',
      },
    },
    // The alignment pill: grey track, and buttons that vanish into it.
    'toggle-button-group': {
      base: {
        backgroundColor: FIGMA_GREY,
        borderRadius: '6px',
        padding: '0',
        gap: '0',
        borderWidth: '0',
      },
    },
    'toggle-button': {
      base: {
        backgroundColor: 'transparent',
        borderWidth: '0',
        color: FIGMA_INK,
        boxShadow: 'none',
      },
    },
    divider: {base: {backgroundColor: '#E6E6E6'}},
    button: {
      base: {borderRadius: '6px', fontWeight: '450'},
      ghost: {backgroundColor: 'transparent'},
      primary: {backgroundColor: '#0D99FF', color: '#FFFFFF'},
    },
  },
});

// ---------------------------------------------------------------------------
// Layout. Product code, so it is styled — but nothing here reaches into a
// component; every rule below positions Astryx, it does not repaint it.
// ---------------------------------------------------------------------------

const styles = stylex.create({
  stage: {
    backgroundColor: '#E5E5E5',
    display: 'flex',
    justifyContent: 'center',
    padding: 40,
  },
  panel: {
    width: 311,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
  },
  headerTop: {height: 60, paddingLeft: 12, paddingRight: 9},
  headerTabs: {height: 44, paddingInline: 10},
  section: {
    paddingTop: 15,
    paddingBottom: 19,
    paddingLeft: 21,
    paddingRight: 11,
  },
  // The Frame section is a single row and sits tighter than the rest.
  sectionSingle: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 21,
    paddingRight: 11,
  },
  collapsed: {paddingBlock: 11, paddingLeft: 21, paddingRight: 11},
  rowHeight: {minHeight: 31},
  trailing: {width: 31, display: 'flex', justifyContent: 'center'},
  // Stack is flex-only, so the two-up field rows and the fill rows — which need
  // real column tracks that ignore intrinsic content width — are grids.
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) 31px',
    columnGap: 10,
    alignItems: 'center',
  },
  fillRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) 74px 27px 27px',
    columnGap: 6,
    alignItems: 'center',
  },
  iconTrio: {display: 'flex', justifyContent: 'flex-start'},
  swatch: {width: 16, height: 16, borderRadius: 3, flexShrink: 0},
  swatchWhite: {
    backgroundColor: '#FFFFFF',
    boxShadow: 'inset 0 0 0 1px #E0E0E0',
  },
  swatchAngular: {
    backgroundImage:
      'conic-gradient(from 180deg, #FF7A00, #FF2D55, #C724F5, #FF7A00)',
  },
  swatchImage: {
    backgroundImage:
      'linear-gradient(135deg, #E8D48A 0%, #D9C24F 45%, #2B2410 52%, #D9C24F 60%, #EFE3A8 100%)',
  },
});

const FILLS = [
  {name: 'FFFFFF', swatch: styles.swatchWhite},
  {name: 'Angular', swatch: styles.swatchAngular},
  {name: 'Image', swatch: styles.swatchImage},
] as const;

/** A grey field: prefix glyph or letter, then the value. */
function Field({
  label,
  prefix,
  glyph,
  value,
  onChange,
  format,
}: {
  label: string;
  prefix?: string;
  glyph?: React.ComponentType;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <InputGroup label={label} isLabelHidden size="md">
      <InputGroupText>{glyph ? <Icon icon={glyph} /> : prefix}</InputGroupText>
      <NumberInput
        label={label}
        isLabelHidden
        value={value}
        onChange={onChange}
        formatValue={format}
        size="md"
      />
    </InputGroup>
  );
}

export default function FigmaPanelThemed() {
  const [tab, setTab] = useState('design');
  const [x, setX] = useState(240);
  const [y, setY] = useState(120);
  const [rotation, setRotation] = useState(0);
  const [w, setW] = useState(375);
  const [h, setH] = useState(812);
  const [clip, setClip] = useState(true);
  const [opacity, setOpacity] = useState(100);
  const [corner, setCorner] = useState(0);

  return (
    <Theme theme={figmaThemed} mode="light">
      <div {...stylex.props(styles.stage)}>
        <div {...stylex.props(styles.panel)}>
          <Stack
            direction="horizontal"
            align="center"
            gap={0}
            xstyle={styles.headerTop}>
            <Avatar name="W" size={37} tooltip={false} />
            <IconButton
              label="Account menu"
              variant="ghost"
              icon={<Icon icon="chevronDown" />}
            />
            <StackItem size="fill" />
            <IconButton
              label="Present"
              variant="ghost"
              icon={<Icon icon={PlayIcon} />}
            />
            <IconButton
              label="Present options"
              variant="ghost"
              icon={<Icon icon="chevronDown" />}
            />
            <Button variant="primary">Share</Button>
          </Stack>

          <Stack
            direction="horizontal"
            align="center"
            gap={0}
            xstyle={styles.headerTabs}>
            <SegmentedControl label="Panel" value={tab} onChange={setTab}>
              <SegmentedControlItem value="design" label="Design" />
              <SegmentedControlItem value="prototype" label="Prototype" />
            </SegmentedControl>
            <StackItem size="fill" />
            <Button variant="ghost" endContent={<Icon icon="chevronDown" />}>
              100%
            </Button>
          </Stack>

          <Divider />

          <Stack direction="vertical" gap={0} xstyle={styles.sectionSingle}>
            <Stack
              direction="horizontal"
              align="center"
              xstyle={styles.rowHeight}>
              <Text type="large">Frame</Text>
              <StackItem size="fill" />
              <IconButton
                label="Frame options"
                variant="ghost"
                icon={<Icon icon="moreHorizontal" />}
              />
            </Stack>
          </Stack>

          <Divider />

          <Stack direction="vertical" gap={3} xstyle={styles.section}>
            <Stack
              direction="horizontal"
              align="center"
              xstyle={styles.rowHeight}>
              <Text type="body">Position</Text>
            </Stack>

            {/* Figma groups these on a grey pill that lines up with the X and
                Y columns below — a toggle group, themed, not a styled div. */}
            <div {...stylex.props(styles.fieldRow)}>
              <ToggleButtonGroup
                label="Horizontal alignment"
                value={null}
                onChange={() => {}}>
                <ToggleButton
                  label="Align left"
                  value="left"
                  isIconOnly
                  icon={<Icon icon={AlignLeftIcon} />}
                />
                <ToggleButton
                  label="Align horizontal centers"
                  value="center"
                  isIconOnly
                  icon={<Icon icon={AlignCenterHIcon} />}
                />
                <ToggleButton
                  label="Align right"
                  value="right"
                  isIconOnly
                  icon={<Icon icon={AlignRightIcon} />}
                />
              </ToggleButtonGroup>
              <ToggleButtonGroup
                label="Vertical alignment"
                value={null}
                onChange={() => {}}>
                <ToggleButton
                  label="Align top"
                  value="top"
                  isIconOnly
                  icon={<Icon icon={AlignTopIcon} />}
                />
                <ToggleButton
                  label="Align vertical centers"
                  value="middle"
                  isIconOnly
                  icon={<Icon icon={AlignCenterVIcon} />}
                />
                <ToggleButton
                  label="Align bottom"
                  value="bottom"
                  isIconOnly
                  icon={<Icon icon={AlignBottomIcon} />}
                />
              </ToggleButtonGroup>
              <div {...stylex.props(styles.trailing)}>
                <IconButton
                  label="More alignment options"
                  variant="ghost"
                  icon={<Icon icon="moreHorizontal" />}
                />
              </div>
            </div>

            <div {...stylex.props(styles.fieldRow)}>
              <Field label="X" prefix="X" value={x} onChange={setX} />
              <Field label="Y" prefix="Y" value={y} onChange={setY} />
              <div {...stylex.props(styles.trailing)}>
                <IconButton
                  label="Absolute position"
                  variant="ghost"
                  icon={<Icon icon={AbsolutePositionIcon} />}
                />
              </div>
            </div>

            <div {...stylex.props(styles.fieldRow)}>
              <Field
                label="Rotation"
                glyph={AngleIcon}
                value={rotation}
                onChange={setRotation}
              />
              <div {...stylex.props(styles.iconTrio)}>
                <IconButton
                  label="Rotate 90°"
                  variant="ghost"
                  icon={<Icon icon={RotateIcon} />}
                />
                <IconButton
                  label="Flip horizontal"
                  variant="ghost"
                  icon={<Icon icon={FlipHIcon} />}
                />
                <IconButton
                  label="Flip vertical"
                  variant="ghost"
                  icon={<Icon icon={FlipVIcon} />}
                />
              </div>
              <div {...stylex.props(styles.trailing)} />
            </div>
          </Stack>

          <Divider />

          <Stack direction="vertical" gap={3} xstyle={styles.section}>
            <Stack
              direction="horizontal"
              align="center"
              xstyle={styles.rowHeight}>
              <Text type="body">Layout</Text>
            </Stack>

            <div {...stylex.props(styles.fieldRow)}>
              <Field label="Width" prefix="W" value={w} onChange={setW} />
              <Field label="Height" prefix="H" value={h} onChange={setH} />
              <div {...stylex.props(styles.trailing)}>
                <IconButton
                  label="Constrain proportions"
                  variant="ghost"
                  icon={<Icon icon={ConstrainIcon} />}
                />
              </div>
            </div>

            <CheckboxInput
              label="Clip content"
              value={clip}
              onChange={setClip}
            />
          </Stack>

          <Divider />

          <Stack direction="vertical" gap={3} xstyle={styles.section}>
            <Stack
              direction="horizontal"
              align="center"
              xstyle={styles.rowHeight}>
              <Text type="body">Appearance</Text>
              <StackItem size="fill" />
              <IconButton
                label="Blend mode"
                variant="ghost"
                icon={<Icon icon={BlendModeIcon} />}
              />
              <IconButton
                label="Toggle visibility"
                variant="ghost"
                icon={<Icon icon={EyeIcon} />}
              />
              <IconButton
                label="Colour picker"
                variant="ghost"
                icon={<Icon icon={DropletIcon} />}
              />
            </Stack>

            <div {...stylex.props(styles.fieldRow)}>
              <Field
                label="Opacity"
                glyph={OpacityIcon}
                value={opacity}
                onChange={setOpacity}
                format={v => `${v}%`}
              />
              <Field
                label="Corner radius"
                glyph={CornerRadiusIcon}
                value={corner}
                onChange={setCorner}
              />
              <div {...stylex.props(styles.trailing)}>
                <IconButton
                  label="Independent corners"
                  variant="ghost"
                  icon={<Icon icon={IndependentCornersIcon} />}
                />
              </div>
            </div>
          </Stack>

          <Divider />

          <Stack direction="vertical" gap={3} xstyle={styles.section}>
            <Stack
              direction="horizontal"
              align="center"
              xstyle={styles.rowHeight}>
              <Text type="body">Fill</Text>
            </Stack>

            {FILLS.map(fill => (
              <div key={fill.name} {...stylex.props(styles.fillRow)}>
                <InputGroup label={`${fill.name} fill`} isLabelHidden size="md">
                  <InputGroupText>
                    <span {...stylex.props(styles.swatch, fill.swatch)} />
                  </InputGroupText>
                  <TextInput
                    label={`${fill.name} value`}
                    isLabelHidden
                    value={fill.name}
                    onChange={() => {}}
                    size="md"
                  />
                </InputGroup>
                <InputGroup
                  label={`${fill.name} opacity`}
                  isLabelHidden
                  size="md">
                  <NumberInput
                    label={`${fill.name} opacity value`}
                    isLabelHidden
                    value={100}
                    onChange={() => {}}
                    size="md"
                  />
                  <InputGroupText>%</InputGroupText>
                </InputGroup>
                <IconButton
                  label={`Hide ${fill.name}`}
                  variant="ghost"
                  icon={<Icon icon={EyeIcon} />}
                />
                <IconButton
                  label={`Remove ${fill.name}`}
                  variant="ghost"
                  icon={<Icon icon={MinusIcon} />}
                />
              </div>
            ))}
          </Stack>

          <Divider />

          {['Stroke', 'Effects', 'Layout grid', 'Export'].map(
            (name, i, all) => (
              <div key={name}>
                <Stack
                  direction="horizontal"
                  align="center"
                  xstyle={styles.collapsed}>
                  {/* Empty sections read muted in Figma; populated ones do not. */}
                  <Text type="body" color="secondary">
                    {name}
                  </Text>
                  <StackItem size="fill" />
                  <IconButton
                    label={`Add ${name.toLowerCase()}`}
                    variant="ghost"
                    icon={<Icon icon={PlusIcon} />}
                  />
                </Stack>
                {i < all.length - 1 ? <Divider /> : null}
              </div>
            ),
          )}
        </div>
      </div>
    </Theme>
  );
}
