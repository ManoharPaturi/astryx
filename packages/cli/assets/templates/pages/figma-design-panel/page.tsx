// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Figma UI3 "Design" inspector panel, rebuilt with Astryx.
 *
 * Scratch fidelity study — not a shipped template. Geometry is taken from a
 * pixel measurement of the reference screenshot, which is the 240px Figma
 * panel rendered at ~1.296x (so 24px controls read as 31px, 11px text as 14px).
 */

'use client';

import {useState} from 'react';
import type {SVGProps} from 'react';
import * as stylex from '@stylexjs/stylex';

import {Theme, defineTheme} from '@astryxdesign/core/theme';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Divider} from '@astryxdesign/core/Divider';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {InputGroup, InputGroupText} from '@astryxdesign/core/InputGroup';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {TextInput} from '@astryxdesign/core/TextInput';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';

// ---------------------------------------------------------------------------
// Theme — Figma UI3 light, at the reference screenshot's 1.296x scale.
// ---------------------------------------------------------------------------

const figmaTheme = defineTheme({
  name: 'figma-ui3',
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
    // Figma paints fields with a flat fill and no border at rest. The border
    // stays 1px — Divider draws its line with --border-width — so the field
    // border is hidden by matching it to the fill instead of zeroing it.
    '--color-background-surface': '#F5F5F5',
    '--color-background-body': '#FFFFFF',
    '--border-width': '1px',
    '--radius-element': '6px',
    '--radius-inner': '4px',

    '--color-text-primary': '#111111',
    '--color-text-secondary': '#8C8C8C',
    '--color-text-disabled': '#B3B3B3',
    '--color-icon-primary': '#111111',
    '--color-icon-secondary': '#8C8C8C',

    '--color-border': '#E6E6E6',
    '--color-border-emphasized': '#F5F5F5',
    '--color-accent': '#0D99FF',
    '--color-on-accent': '#FFFFFF',
    '--color-overlay-hover': '#0000000A',
    // Secondary buttons and the segmented-control track read this.
    '--color-neutral': '#F5F5F5',

    // 24px Figma controls at 1.296x.
    '--size-element-sm': '31px',
    '--size-element-md': '31px',
    '--size-element-lg': '31px',
  },
  components: {
    // Avatar has no per-instance colour prop, so the initials are themed
    // globally.
    'avatar-fallback': {
      base: {backgroundColor: '#FFCD08', color: '#111111', fontWeight: '600'},
    },
    // Figma's tab strip has no track; only the selected tab is filled.
    'segmented-control': {
      base: {backgroundColor: 'transparent', padding: '0px', gap: '2px'},
    },
    'segmented-control-item': {
      base: {backgroundColor: 'transparent', color: '#8C8C8C'},
      selected: {backgroundColor: '#F5F5F5', color: '#111111'},
    },
    // Figma's checkmark is a dark glyph on a light fill, not an accent tile.
    'checkbox-indicator': {
      base: {backgroundColor: '#F5F5F5', borderColor: '#E6E6E6'},
      checked: {backgroundColor: '#F5F5F5', color: '#111111'},
    },
    'checkbox-label': {base: {color: '#111111'}},
  },
});

/**
 * Avatar paints its fallback from --color-neutral / --color-text-secondary and
 * exposes neither a colour prop nor xstyle, so Figma's yellow account chip has
 * to come from a theme scoped to just that subtree.
 */
const avatarTheme = defineTheme({
  name: 'figma-ui3-avatar',
  extends: figmaTheme,
  tokens: {'--color-neutral': '#FFCD08', '--color-text-secondary': '#111111'},
});

/**
 * A checked Astryx checkbox is an accent-filled tile; Figma's is a dark glyph
 * on the same grey as every other control. CheckboxInput's xstyle lands on the
 * field root, not the indicator, so the accent is retargeted for this subtree.
 */
const checkboxTheme = defineTheme({
  name: 'figma-ui3-checkbox',
  extends: figmaTheme,
  tokens: {
    '--color-accent': '#E9E9E9',
    '--color-on-accent': '#111111',
    // FieldLabel renders secondary; Figma's checkbox label is primary.
    '--color-text-secondary': '#111111',
  },
});

// ---------------------------------------------------------------------------
// Icons — hand-drawn approximations of Figma's set (see notes in the summary).
// ---------------------------------------------------------------------------

type IconProps = SVGProps<SVGSVGElement>;

const svg = (children: React.ReactNode) =>
  function FigmaGlyph(props: IconProps) {
    return (
      <svg viewBox="0 0 16 16" fill="none" {...props}>
        {children}
      </svg>
    );
  };

const S = {
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
const BAR = {fill: 'currentColor'};

const AlignLeftIcon = svg(
  <>
    <path d="M2.6 3v10" {...S} />
    <rect x="4.6" y="5" width="8.4" height="2" rx="0.6" {...BAR} />
    <rect x="4.6" y="9" width="5" height="2" rx="0.6" {...BAR} />
  </>,
);

const AlignCenterHIcon = svg(
  <>
    <path d="M8 2.4v11.2" {...S} />
    <rect x="2.6" y="5" width="10.8" height="2" rx="0.6" {...BAR} />
    <rect x="4.8" y="9" width="6.4" height="2" rx="0.6" {...BAR} />
  </>,
);

const AlignRightIcon = svg(
  <>
    <path d="M13.4 3v10" {...S} />
    <rect x="3" y="5" width="8.4" height="2" rx="0.6" {...BAR} />
    <rect x="6.4" y="9" width="5" height="2" rx="0.6" {...BAR} />
  </>,
);

const AlignTopIcon = svg(
  <>
    <path d="M3 2.6h10" {...S} />
    <rect x="5" y="4.6" width="2" height="8.4" rx="0.6" {...BAR} />
    <rect x="9" y="4.6" width="2" height="5" rx="0.6" {...BAR} />
  </>,
);

const AlignCenterVIcon = svg(
  <>
    <path d="M2.4 8h11.2" {...S} />
    <rect x="5" y="2.6" width="2" height="10.8" rx="0.6" {...BAR} />
    <rect x="9" y="4.8" width="2" height="6.4" rx="0.6" {...BAR} />
  </>,
);

const AlignBottomIcon = svg(
  <>
    <path d="M3 13.4h10" {...S} />
    <rect x="5" y="3" width="2" height="8.4" rx="0.6" {...BAR} />
    <rect x="9" y="6.4" width="2" height="5" rx="0.6" {...BAR} />
  </>,
);

const AngleIcon = svg(
  <>
    <path d="M4 3.5v9h9" {...S} />
    <path d="M4 8.2h3.6" {...S} />
  </>,
);

// A diamond with a clockwise arc sweeping over its top-right corner.
const Rotate90Icon = svg(
  <>
    <path d="M7.2 6.3 10.7 9.8 7.2 13.3 3.7 9.8z" {...S} />
    <path d="M3.9 6.3a4.4 4.4 0 0 1 6.7-1.5" {...S} />
    <path d="M8.4 4.1 11.2 4.3 10.7 7z" fill="currentColor" />
  </>,
);

// Two outlined triangles nosing into a centre rule.
const FlipHorizontalIcon = svg(
  <>
    <path d="M8 3v10" {...S} />
    <path d="M5.1 5.3v5.4L7 8z" {...S} />
    <path d="M10.9 5.3v5.4L9 8z" {...S} />
  </>,
);

const FlipVerticalIcon = svg(
  <>
    <path d="M3.2 8h9.6" {...S} />
    <path d="M5.3 5.1h5.4L8 7z" {...S} />
    <path d="M5.3 10.9h5.4L8 9z" {...S} />
  </>,
);

// A frame whose top and left edges are pinned (accent) while the opposite
// edges stay loose (muted), with a crosshair in the middle.
const AbsolutePositionIcon = svg(
  <>
    <path d="M4.8 3.5h6.7" stroke="#0D99FF" strokeWidth="1.9" />
    <path d="M3.6 4.7v6" stroke="#0D99FF" strokeWidth="1.9" />
    <path d="M12.4 5.1v4.4" stroke="#9B9B9B" strokeWidth="1" />
    <path d="M5.6 12.3h5.2" stroke="#B8B8B8" strokeWidth="1.1" />
    <path d="M8 5.5v4.9M5.6 7.95h4.8" stroke="#8C8C8C" strokeWidth="1.15" />
  </>,
);

const ConstrainIcon = svg(
  <>
    <path d="M6.1 6.6V4.9a1.9 1.9 0 1 1 3.8 0v1.7" {...S} />
    <path d="M6.1 9.4v1.7a1.9 1.9 0 1 0 3.8 0V9.4" {...S} />
  </>,
);

const OpacityIcon = svg(
  <>
    <rect x="2.6" y="2.6" width="10.8" height="10.8" rx="1.6" {...S} />
    <circle cx="6" cy="10.6" r="0.65" {...BAR} />
    <circle cx="8.4" cy="10.6" r="0.65" {...BAR} />
    <circle cx="10.8" cy="10.6" r="0.65" {...BAR} />
    <circle cx="8.4" cy="8.2" r="0.55" {...BAR} />
    <circle cx="10.8" cy="8.2" r="0.55" {...BAR} />
    <circle cx="10.8" cy="5.8" r="0.45" {...BAR} />
  </>,
);

const CornerRadiusIcon = svg(
  <path d="M3.4 12.6V6a2.6 2.6 0 0 1 2.6-2.6h6.6" {...S} />,
);

const IndependentCornersIcon = svg(
  <>
    <path d="M3 6V4.4a1.4 1.4 0 0 1 1.4-1.4H6" {...S} />
    <path d="M10 3h1.6A1.4 1.4 0 0 1 13 4.4V6" {...S} />
    <path d="M13 10v1.6a1.4 1.4 0 0 1-1.4 1.4H10" {...S} />
    <path d="M6 13H4.4A1.4 1.4 0 0 1 3 11.6V10" {...S} />
  </>,
);

const BlendModeIcon = svg(
  <>
    <circle cx="6.4" cy="8" r="4.6" {...S} />
    <circle cx="6.4" cy="8" r="1.1" {...BAR} />
    <path d="M9.6 4.6a4.6 4.6 0 0 1 0 6.8" {...S} />
  </>,
);

const EyeIcon = svg(
  <>
    <path
      d="M1.8 8S4.1 4.2 8 4.2 14.2 8 14.2 8 11.9 11.8 8 11.8 1.8 8 1.8 8z"
      {...S}
    />
    <circle cx="8" cy="8" r="1.5" {...BAR} />
  </>,
);

const DropletIcon = svg(
  <path
    d="M8 2.4s3.6 3.9 3.6 6.4a3.6 3.6 0 0 1-7.2 0C4.4 6.3 8 2.4 8 2.4z"
    {...S}
  />,
);

const MinusIcon = svg(<path d="M3 8h10" {...S} />);
const PlusIcon = svg(<path d="M8 3v10M3 8h10" {...S} />);
const PlayIcon = svg(<path d="M4.6 2.8 12.6 8l-8 5.2z" {...S} />);
const CheckIcon = svg(<path d="M3.2 8.4 6.4 11.6 12.8 4.8" {...S} />);

// ---------------------------------------------------------------------------
// Layout primitives
// ---------------------------------------------------------------------------

const styles = stylex.create({
  // Figma's canvas grey, so the panel reads against something. Sized to the
  // panel rather than the viewport so the page can be embedded in a comparison
  // without trailing a screen of empty grey.
  stage: {
    backgroundColor: '#E5E5E5',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 40,
  },
  panel: {
    width: 311,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 8px 32px rgba(0,0,0,.10)',
    fontFeatureSettings: '"cv08", "ss03"',
  },

  // Header
  headerTop: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    paddingLeft: 12,
    paddingRight: 9,
  },
  headerTabs: {
    height: 44,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingInline: 10,
    paddingTop: 2,
  },
  spacer: {flex: 1},

  // A section body: 20px in from the left, 10px from the right so the trailing
  // icon buttons sit flush, matching Figma.
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingTop: 16,
    paddingBottom: 21,
    paddingLeft: 21,
    paddingRight: 11,
  },
  sectionTight: {paddingTop: 16, paddingBottom: 16},
  sectionCollapsed: {paddingTop: 11, paddingBottom: 11},

  // [field | field | trailing icon] — the panel's master grid. minmax(0,1fr)
  // keeps InputGroup's intrinsic width from blowing the columns apart.
  row: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) 31px',
    columnGap: 10,
    alignItems: 'center',
    minHeight: 31,
  },
  rowHeader: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 31,
  },
  fillRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) 67px 31px 31px',
    columnGap: 6,
    alignItems: 'center',
    minHeight: 31,
  },
  // Three equal actions sharing one 114px track, hairline-separated.
  triad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    columnGap: 2,
  },
  triadFirst: {borderStartEndRadius: 0, borderEndEndRadius: 0},
  triadMid: {borderRadius: 0},
  triadLast: {borderStartStartRadius: 0, borderEndStartRadius: 0},

  iconBtn: {width: 31, height: 31, borderRadius: 6},
  fullWidthBtn: {width: '100%', height: 31, borderRadius: 6},
  shareBtn: {
    width: 76,
    height: 32,
    borderRadius: 6,
    paddingInline: 0,
    fontSize: 14,
    fontWeight: 600,
  },
  avatarWrap: {display: 'flex', alignItems: 'center', gap: 0},
  // The account caret sits tight against the avatar, well inside a 31px slot.
  iconBtnNarrow: {width: 20, minWidth: 20, paddingInline: 0},

  // Field internals. In Figma one grey pill wraps the prefix and the value, so
  // the fill lives on the group and every child inside it runs transparent.
  field: {
    width: '100%',
    minWidth: 0,
    height: 31,
    paddingInline: 6,
    gap: 0,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  // Inner controls paint their own fill and pad themselves; both have to go or
  // the pill shows seams and the value drifts off Figma's 27/53/57 columns.
  inner: {backgroundColor: 'transparent', paddingInline: 0, minWidth: 0},
  // InputGroupText ships as a visible addon (muted fill, border, 8px padding).
  // Figma's unit labels sit directly on the field fill, so strip that chrome.
  addon: {
    paddingInline: 0,
    minWidth: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginInlineStart: 0,
    lineHeight: 1,
  },
  // Prefix slots are sized so the value starts on Figma's column, not so the
  // glyph is snug — the gap is baked into the slot.
  fieldPrefix: {color: '#8C8C8C', width: 26},
  fieldSuffix: {color: '#8C8C8C', paddingInlineStart: 6},
  glyphPrefix: {color: '#111111', width: 30},
  swatchSlot: {width: 26},

  // Fill swatches
  swatch: {
    width: 20,
    height: 20,
    borderRadius: 3,
    flexShrink: 0,
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.10)',
  },
  swatchWhite: {backgroundColor: '#FFFFFF'},
  swatchAngular: {
    backgroundImage:
      'conic-gradient(from 180deg at 50% 50%, #FF7A00, #FF2D55, #C724F5, #FF7A00)',
  },
  swatchImage: {
    backgroundImage:
      'linear-gradient(135deg, #E8D48A 0%, #D9C24F 45%, #2B2410 52%, #D9C24F 60%, #EFE3A8 100%)',
  },

  zoomTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    height: 31,
    marginRight: 10,
  },
  // Checkbox rows run shorter than field rows in Figma's panel.
  clipRow: {display: 'flex', alignItems: 'center', height: 27},
  // Figma's tab strip has no track behind the segments.
  tabStrip: {backgroundColor: 'transparent', padding: 0, gap: 2},
  checkbox: {marginLeft: -1},
  iconSm: {width: 16, height: 16},
  iconXs: {width: 11, height: 11, color: '#111111'},
  iconPlay: {width: 20, height: 20},
});

/** A 31px ghost icon button — the panel's only button shape. */
function PanelIcon({
  label,
  icon,
  tone = 'primary',
}: {
  label: string;
  icon: React.ComponentType<IconProps>;
  tone?: 'primary' | 'secondary';
}) {
  return (
    <IconButton
      label={label}
      variant="ghost"
      xstyle={styles.iconBtn}
      icon={
        <Icon
          icon={icon}
          color={tone === 'primary' ? 'primary' : 'secondary'}
          xstyle={styles.iconSm}
        />
      }
    />
  );
}

/** A numeric field with a text or glyph label sitting inside the fill. */
function ValueField({
  label,
  prefix,
  glyph,
  value,
  onChange,
  suffix,
  formatValue,
}: {
  label: string;
  prefix?: string;
  glyph?: React.ComponentType<IconProps>;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  formatValue?: (v: number) => string;
}) {
  return (
    <InputGroup label={label} isLabelHidden size="md" xstyle={styles.field}>
      {glyph ? (
        <InputGroupText xstyle={[styles.addon, styles.glyphPrefix]}>
          <Icon icon={glyph} xstyle={styles.iconSm} />
        </InputGroupText>
      ) : (
        <InputGroupText xstyle={[styles.addon, styles.fieldPrefix]}>
          {prefix}
        </InputGroupText>
      )}
      <NumberInput
        label={label}
        isLabelHidden
        value={value}
        onChange={onChange}
        formatValue={formatValue}
        size="md"
        xstyle={styles.inner}
      />
      {suffix ? (
        <InputGroupText xstyle={[styles.addon, styles.fieldSuffix]}>
          {suffix}
        </InputGroupText>
      ) : null}
    </InputGroup>
  );
}

/** Section header: a label, then trailing actions flush to the right edge. */
function SectionHeader({
  title,
  tone = 'primary',
  actions,
}: {
  title: string;
  tone?: 'primary' | 'secondary';
  actions?: React.ReactNode;
}) {
  return (
    <div {...stylex.props(styles.rowHeader)}>
      <Text type="body" color={tone === 'primary' ? 'primary' : 'secondary'}>
        {title}
      </Text>
      <div {...stylex.props(styles.spacer)} />
      {actions}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FigmaDesignPanel() {
  const [tab, setTab] = useState('design');
  const [x, setX] = useState(240);
  const [y, setY] = useState(120);
  const [rotation, setRotation] = useState(0);
  const [w, setW] = useState(375);
  const [h, setH] = useState(812);
  const [clip, setClip] = useState(true);
  const [opacity, setOpacity] = useState(100);
  const [corner, setCorner] = useState(0);

  const fills = [
    {name: 'FFFFFF', swatch: styles.swatchWhite},
    {name: 'Angular', swatch: styles.swatchAngular},
    {name: 'Image', swatch: styles.swatchImage},
  ];

  return (
    <Theme theme={figmaTheme} mode="light">
      <div {...stylex.props(styles.stage)}>
        <div {...stylex.props(styles.panel)}>
          {/* ---------------- Header ---------------- */}
          <div {...stylex.props(styles.headerTop)}>
            <div {...stylex.props(styles.avatarWrap)}>
              <Theme theme={avatarTheme} mode="light">
                <Avatar name="W" size={37} tooltip={false} />
              </Theme>
              <IconButton
                label="Account menu"
                variant="ghost"
                xstyle={styles.iconBtnNarrow}
                icon={<Icon icon="chevronDown" xstyle={styles.iconXs} />}
              />
            </div>
            <div {...stylex.props(styles.spacer)} />
            <IconButton
              label="Present"
              variant="ghost"
              xstyle={styles.iconBtn}
              icon={<Icon icon={PlayIcon} xstyle={styles.iconPlay} />}
            />
            <IconButton
              label="Present options"
              variant="ghost"
              xstyle={styles.iconBtn}
              icon={<Icon icon="chevronDown" xstyle={styles.iconXs} />}
            />
            <Button variant="primary" xstyle={styles.shareBtn}>
              Share
            </Button>
          </div>

          <div {...stylex.props(styles.headerTabs)}>
            <SegmentedControl
              label="Panel"
              value={tab}
              onChange={setTab}
              xstyle={styles.tabStrip}>
              <SegmentedControlItem value="design" label="Design" />
              <SegmentedControlItem value="prototype" label="Prototype" />
            </SegmentedControl>
            <button type="button" {...stylex.props(styles.zoomTrigger)}>
              <Text type="body">100%</Text>
              <Icon icon="chevronDown" xstyle={styles.iconXs} />
            </button>
          </div>

          <Divider />

          {/* ---------------- Frame ---------------- */}
          <div {...stylex.props(styles.section, styles.sectionTight)}>
            <div {...stylex.props(styles.rowHeader)}>
              <Text type="large">Frame</Text>
              <div {...stylex.props(styles.spacer)} />
              <PanelIcon label="Frame options" icon={MoreIcon} />
            </div>
          </div>

          <Divider />

          {/* ---------------- Position ---------------- */}
          <div {...stylex.props(styles.section)}>
            <SectionHeader title="Position" />

            <div {...stylex.props(styles.row)}>
              <Triad
                items={[
                  ['Align left', AlignLeftIcon],
                  ['Align horizontal centers', AlignCenterHIcon],
                  ['Align right', AlignRightIcon],
                ]}
              />
              <Triad
                items={[
                  ['Align top', AlignTopIcon],
                  ['Align vertical centers', AlignCenterVIcon],
                  ['Align bottom', AlignBottomIcon],
                ]}
              />
              <PanelIcon label="More align options" icon={MoreIcon} />
            </div>

            <div {...stylex.props(styles.row)}>
              <ValueField
                label="X position"
                prefix="X"
                value={x}
                onChange={setX}
              />
              <ValueField
                label="Y position"
                prefix="Y"
                value={y}
                onChange={setY}
              />
              <PanelIcon
                label="Absolute position"
                icon={AbsolutePositionIcon}
              />
            </div>

            <div {...stylex.props(styles.row)}>
              <ValueField
                label="Rotation"
                glyph={AngleIcon}
                value={rotation}
                onChange={setRotation}
              />
              <Triad
                items={[
                  ['Rotate 90°', Rotate90Icon],
                  ['Flip horizontal', FlipHorizontalIcon],
                  ['Flip vertical', FlipVerticalIcon],
                ]}
              />
              <span />
            </div>
          </div>

          <Divider />

          {/* ---------------- Layout ---------------- */}
          <div {...stylex.props(styles.section)}>
            <SectionHeader title="Layout" />

            <div {...stylex.props(styles.row)}>
              <ValueField label="Width" prefix="W" value={w} onChange={setW} />
              <ValueField label="Height" prefix="H" value={h} onChange={setH} />
              <PanelIcon label="Constrain proportions" icon={ConstrainIcon} />
            </div>

            <div {...stylex.props(styles.clipRow)}>
              <Theme theme={checkboxTheme} mode="light">
                <CheckboxInput
                  label="Clip content"
                  value={clip}
                  onChange={setClip}
                  xstyle={styles.checkbox}
                />
              </Theme>
            </div>
          </div>

          <Divider />

          {/* ---------------- Appearance ---------------- */}
          <div {...stylex.props(styles.section)}>
            <SectionHeader
              title="Appearance"
              actions={
                <>
                  <PanelIcon label="Blend mode" icon={BlendModeIcon} />
                  <PanelIcon label="Visibility" icon={EyeIcon} />
                  <PanelIcon label="Tint" icon={DropletIcon} />
                </>
              }
            />

            <div {...stylex.props(styles.row)}>
              <ValueField
                label="Opacity"
                glyph={OpacityIcon}
                value={opacity}
                onChange={setOpacity}
                formatValue={v => `${v}%`}
              />
              <ValueField
                label="Corner radius"
                glyph={CornerRadiusIcon}
                value={corner}
                onChange={setCorner}
              />
              <PanelIcon
                label="Independent corners"
                icon={IndependentCornersIcon}
              />
            </div>
          </div>

          <Divider />

          {/* ---------------- Fill ---------------- */}
          <div {...stylex.props(styles.section)}>
            <SectionHeader title="Fill" />

            {fills.map(fill => (
              <div key={fill.name} {...stylex.props(styles.fillRow)}>
                <InputGroup
                  label={`${fill.name} fill`}
                  isLabelHidden
                  size="md"
                  xstyle={styles.field}>
                  <InputGroupText xstyle={[styles.addon, styles.swatchSlot]}>
                    <span {...stylex.props(styles.swatch, fill.swatch)} />
                  </InputGroupText>
                  <TextInput
                    label={`${fill.name} value`}
                    isLabelHidden
                    value={fill.name}
                    onChange={() => {}}
                    size="md"
                    xstyle={styles.inner}
                  />
                </InputGroup>

                <InputGroup
                  label={`${fill.name} opacity`}
                  isLabelHidden
                  size="md"
                  xstyle={styles.field}>
                  <NumberInput
                    label={`${fill.name} opacity value`}
                    isLabelHidden
                    value={100}
                    onChange={() => {}}
                    size="md"
                    xstyle={styles.inner}
                  />
                  <InputGroupText xstyle={[styles.addon, styles.fieldSuffix]}>
                    %
                  </InputGroupText>
                </InputGroup>

                <PanelIcon label={`Hide ${fill.name}`} icon={EyeIcon} />
                <PanelIcon label={`Remove ${fill.name}`} icon={MinusIcon} />
              </div>
            ))}
          </div>

          <Divider />

          {/* ---------------- Empty sections ---------------- */}
          {['Stroke', 'Effects', 'Layout grid', 'Export'].map(
            (name, i, all) => (
              <div key={name}>
                <div {...stylex.props(styles.section, styles.sectionCollapsed)}>
                  <SectionHeader
                    title={name}
                    tone="secondary"
                    actions={
                      <PanelIcon label={`Add ${name}`} icon={PlusIcon} />
                    }
                  />
                </div>
                {i < all.length - 1 ? <Divider /> : null}
              </div>
            ),
          )}
        </div>
      </div>
    </Theme>
  );
}

/** Three connected 31px actions filling one grid column. */
function Triad({
  items,
}: {
  items: Array<[label: string, icon: React.ComponentType<IconProps>]>;
}) {
  const shape = [styles.triadFirst, styles.triadMid, styles.triadLast];
  return (
    <div {...stylex.props(styles.triad)}>
      {items.map(([label, icon], i) => (
        <IconButton
          key={label}
          label={label}
          variant="secondary"
          xstyle={[styles.fullWidthBtn, shape[i]]}
          icon={<Icon icon={icon} xstyle={styles.iconSm} />}
        />
      ))}
    </div>
  );
}

const MoreIcon = svg(
  <>
    <circle cx="3.4" cy="8" r="1.15" {...BAR} />
    <circle cx="8" cy="8" r="1.15" {...BAR} />
    <circle cx="12.6" cy="8" r="1.15" {...BAR} />
  </>,
);

void CheckIcon;
