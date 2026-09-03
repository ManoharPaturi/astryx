// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * The same design-tool inspector, built the way Astryx wants it built.
 *
 * Companion to `figma-design-panel`, which chases Figma pixel-for-pixel. This
 * one keeps the information architecture and drops the pixel target: default
 * component sizes, real tokens, visible labels, no theme overrides, and the
 * built-in icon set wherever it reaches. The gap between the two pages is the
 * honest cost of pixel-matching a foreign design language.
 *
 * Rules held to deliberately:
 *   - no hardcoded colours — every value resolves through a token var
 *   - no hardcoded spacing — spacingVars only
 *   - no size-token overrides — components render at their own sm/md
 *   - no nested <Theme> to defeat a component's own styling
 *   - no inline SVG in this file — custom glyphs come from ./icons
 */

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';

import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Divider} from '@astryxdesign/core/Divider';
import {Text} from '@astryxdesign/core/Text';
import {InputGroup, InputGroupText} from '@astryxdesign/core/InputGroup';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {TextInput} from '@astryxdesign/core/TextInput';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Icon} from '@astryxdesign/core/Icon';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@astryxdesign/core/theme/tokens.stylex';

// ---------------------------------------------------------------------------
// Icon set extension.
//
// Astryx ships ~27 icons, all product-shaped: chevrons, status, search,
// filter. A design tool needs a canvas vocabulary it has none of — align,
// rotate, flip, corner radius, opacity, add. Templates are single-file by
// contract, so these live here; in an app they'd be a module registered via
// defineTheme({icons}) and resolved by name.
// ---------------------------------------------------------------------------

/** Icons inherit colour and are sized by Icon's `size` prop. */
const box = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const glyph = (children: React.ReactNode) =>
  function Glyph() {
    return <svg {...box}>{children}</svg>;
  };

const AlignLeft = glyph(
  <>
    <path d="M2.5 2.5v11" />
    <path d="M5 5.5h7M5 10.5h4" />
  </>,
);

const AlignCenterHorizontal = glyph(
  <>
    <path d="M8 2.5v11" />
    <path d="M4 5.5h8M5.5 10.5h5" />
  </>,
);

const AlignRight = glyph(
  <>
    <path d="M13.5 2.5v11" />
    <path d="M4 5.5h7M7 10.5h4" />
  </>,
);

const AlignTop = glyph(
  <>
    <path d="M2.5 2.5h11" />
    <path d="M5.5 5v7M10.5 5v4" />
  </>,
);

const AlignCenterVertical = glyph(
  <>
    <path d="M2.5 8h11" />
    <path d="M5.5 4v8M10.5 5.5v5" />
  </>,
);

const AlignBottom = glyph(
  <>
    <path d="M2.5 13.5h11" />
    <path d="M5.5 4v7M10.5 7v4" />
  </>,
);

const Rotate = glyph(
  <>
    <path d="M7.2 6.3 10.7 9.8 7.2 13.3 3.7 9.8z" />
    <path d="M3.9 6.3a4.4 4.4 0 0 1 6.7-1.5" />
    <path d="M8.4 4.1 11.2 4.3 10.7 7z" fill="currentColor" />
  </>,
);

const FlipHorizontal = glyph(
  <>
    <path d="M8 3v10" />
    <path d="M5.1 5.3v5.4L7 8z" />
    <path d="M10.9 5.3v5.4L9 8z" />
  </>,
);

const FlipVertical = glyph(
  <>
    <path d="M3.2 8h9.6" />
    <path d="M5.3 5.1h5.4L8 7z" />
    <path d="M5.3 10.9h5.4L8 9z" />
  </>,
);

const ConstrainProportions = glyph(
  <>
    <path d="M6 7.1V5.2a2 2 0 1 1 4 0v1.9" />
    <path d="M6 8.9v1.9a2 2 0 1 0 4 0V8.9" />
  </>,
);

const CornerRadius = glyph(<path d="M3.4 12.6V6a2.6 2.6 0 0 1 2.6-2.6h6.6" />);

const Opacity = glyph(
  <>
    <rect x="2.6" y="2.6" width="10.8" height="10.8" rx="2" />
    <path d="M2.6 9.8 9.8 2.6M2.6 13.4 13.4 2.6M6.2 13.4l7.2-7.2M9.8 13.4l3.6-3.6" />
  </>,
);

const Eye = glyph(
  <>
    <path d="M1.8 8S4.1 4.2 8 4.2 14.2 8 14.2 8 11.9 11.8 8 11.8 1.8 8 1.8 8z" />
    <circle cx="8" cy="8" r="1.6" />
  </>,
);

const Plus = glyph(<path d="M8 3.5v9M3.5 8h9" />);

const Minus = glyph(<path d="M3.5 8h9" />);

const styles = stylex.create({
  panel: {
    width: 380,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colorVars['--color-background-card'],
    borderRadius: radiusVars['--radius-container'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    padding: spacingVars['--spacing-3'],
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-3'],
    padding: spacingVars['--spacing-4'],
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
  },
  /** Two equal fields per line — the panel's dominant rhythm. */
  pair: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
    gap: spacingVars['--spacing-3'],
    alignItems: 'end',
  },
  /** Two fields plus a trailing action that aligns to the control, not the label. */
  pairWithAction: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) auto',
    gap: spacingVars['--spacing-3'],
    alignItems: 'end',
  },
  iconRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  /** Alignment actions read as two clusters, so the gap between them is wider. */
  iconCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    marginInlineEnd: spacingVars['--spacing-3'],
  },
  spacer: {flexGrow: 1},
  fillRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) 104px auto auto',
    gap: spacingVars['--spacing-2'],
    alignItems: 'center',
  },
  swatch: {
    width: spacingVars['--spacing-5'],
    height: spacingVars['--spacing-5'],
    borderRadius: radiusVars['--radius-inner'],
    flexShrink: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
  },
  swatchWhite: {backgroundColor: colorVars['--color-background-body']},
  // Gradient and image previews have no token equivalent — a swatch is content,
  // not chrome, so these are the one place raw colour is legitimate.
  swatchAngular: {
    backgroundImage:
      'conic-gradient(from 180deg, #FF7A00, #FF2D55, #C724F5, #FF7A00)',
  },
  swatchImage: {
    backgroundImage:
      'linear-gradient(135deg, #E8D48A 0%, #D9C24F 45%, #2B2410 52%, #D9C24F 60%, #EFE3A8 100%)',
  },
  collapsed: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
  },
});

const ALIGNMENTS = [
  {icon: AlignLeft, label: 'Align left'},
  {icon: AlignCenterHorizontal, label: 'Align horizontal centers'},
  {icon: AlignRight, label: 'Align right'},
] as const;

const ALIGNMENTS_VERTICAL = [
  {icon: AlignTop, label: 'Align top'},
  {icon: AlignCenterVertical, label: 'Align vertical centers'},
  {icon: AlignBottom, label: 'Align bottom'},
] as const;

const FILLS = [
  {name: 'FFFFFF', swatch: styles.swatchWhite},
  {name: 'Angular', swatch: styles.swatchAngular},
  {name: 'Image', swatch: styles.swatchImage},
] as const;

/** A section title with optional trailing actions. */
function SectionHeader({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div {...stylex.props(styles.sectionHeader)}>
      <Text type="label">{title}</Text>
      {actions ? <div {...stylex.props(styles.iconRow)}>{actions}</div> : null}
    </div>
  );
}

export default function FigmaDesignPanelNative() {
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
    <div {...stylex.props(styles.panel)}>
      <div {...stylex.props(styles.header)}>
        <SegmentedControl label="Panel" value={tab} onChange={setTab}>
          <SegmentedControlItem value="design" label="Design" />
          <SegmentedControlItem value="prototype" label="Prototype" />
        </SegmentedControl>
        <div {...stylex.props(styles.spacer)} />
        <Button
          variant="secondary"
          size="sm"
          icon={<Icon icon="chevronDown" />}>
          100%
        </Button>
      </div>

      <Divider />

      <div {...stylex.props(styles.section)}>
        <SectionHeader
          title="Frame"
          actions={
            <IconButton
              label="Frame options"
              icon={<Icon icon="moreHorizontal" />}
            />
          }
        />
      </div>

      <Divider />

      <div {...stylex.props(styles.section)}>
        <SectionHeader title="Position" />

        <div {...stylex.props(styles.iconRow)}>
          <div {...stylex.props(styles.iconCluster)}>
            {ALIGNMENTS.map(({icon, label}) => (
              <IconButton
                key={label}
                label={label}
                icon={<Icon icon={icon} />}
                size="sm"
              />
            ))}
          </div>
          {ALIGNMENTS_VERTICAL.map(({icon, label}) => (
            <IconButton
              key={label}
              label={label}
              icon={<Icon icon={icon} />}
              size="sm"
            />
          ))}
          <div {...stylex.props(styles.spacer)} />
          <IconButton
            label="More alignment options"
            icon={<Icon icon="moreHorizontal" />}
            size="sm"
          />
        </div>

        <div {...stylex.props(styles.pair)}>
          <NumberInput label="X" value={x} onChange={setX} size="sm" />
          <NumberInput label="Y" value={y} onChange={setY} size="sm" />
        </div>

        <div {...stylex.props(styles.pairWithAction)}>
          <NumberInput
            label="Rotation"
            value={rotation}
            onChange={setRotation}
            size="sm"
          />
          <div {...stylex.props(styles.iconRow)}>
            <IconButton
              label="Rotate 90°"
              icon={<Icon icon={Rotate} />}
              size="sm"
            />
            <IconButton
              label="Flip horizontal"
              icon={<Icon icon={FlipHorizontal} />}
              size="sm"
            />
            <IconButton
              label="Flip vertical"
              icon={<Icon icon={FlipVertical} />}
              size="sm"
            />
          </div>
        </div>
      </div>

      <Divider />

      <div {...stylex.props(styles.section)}>
        <SectionHeader title="Layout" />

        <div {...stylex.props(styles.pairWithAction)}>
          <NumberInput label="Width" value={w} onChange={setW} size="sm" />
          <NumberInput label="Height" value={h} onChange={setH} size="sm" />
          <IconButton
            label="Constrain proportions"
            icon={<Icon icon={ConstrainProportions} />}
            size="sm"
          />
        </div>

        <CheckboxInput label="Clip content" value={clip} onChange={setClip} />
      </div>

      <Divider />

      <div {...stylex.props(styles.section)}>
        <SectionHeader
          title="Appearance"
          actions={
            <>
              <IconButton
                label="Blend mode"
                icon={<Icon icon={Opacity} />}
                size="sm"
              />
              <IconButton
                label="Toggle visibility"
                icon={<Icon icon={Eye} />}
                size="sm"
              />
            </>
          }
        />

        <div {...stylex.props(styles.pair)}>
          <NumberInput
            label="Opacity"
            value={opacity}
            onChange={setOpacity}
            size="sm"
            formatValue={v => `${v}%`}
          />
          <InputGroup label="Corner radius" size="sm">
            <InputGroupText>
              <Icon icon={CornerRadius} />
            </InputGroupText>
            <NumberInput
              label="Corner radius"
              isLabelHidden
              value={corner}
              onChange={setCorner}
              size="sm"
            />
          </InputGroup>
        </div>
      </div>

      <Divider />

      <div {...stylex.props(styles.section)}>
        <SectionHeader
          title="Fill"
          actions={
            <IconButton
              label="Add fill"
              icon={<Icon icon={Plus} />}
              size="sm"
            />
          }
        />

        {FILLS.map(fill => (
          <div key={fill.name} {...stylex.props(styles.fillRow)}>
            <InputGroup label={`${fill.name} colour`} isLabelHidden size="sm">
              <InputGroupText>
                <span {...stylex.props(styles.swatch, fill.swatch)} />
              </InputGroupText>
              <TextInput
                label={`${fill.name} value`}
                isLabelHidden
                value={fill.name}
                onChange={() => {}}
                size="sm"
              />
            </InputGroup>

            <InputGroup label={`${fill.name} opacity`} isLabelHidden size="sm">
              <NumberInput
                label={`${fill.name} opacity value`}
                isLabelHidden
                value={100}
                onChange={() => {}}
                size="sm"
              />
              <InputGroupText>%</InputGroupText>
            </InputGroup>

            <IconButton
              label={`Hide ${fill.name}`}
              icon={<Icon icon={Eye} />}
              size="sm"
            />
            <IconButton
              label={`Remove ${fill.name}`}
              icon={<Icon icon={Minus} />}
              size="sm"
            />
          </div>
        ))}
      </div>

      <Divider />

      {['Stroke', 'Effects', 'Layout grid', 'Export'].map((name, i, all) => (
        <div key={name}>
          <div {...stylex.props(styles.collapsed)}>
            <Text type="body" color="secondary">
              {name}
            </Text>
            <IconButton
              label={`Add ${name.toLowerCase()}`}
              icon={<Icon icon={Plus} />}
              size="sm"
            />
          </div>
          {i < all.length - 1 ? <Divider /> : null}
        </div>
      ))}
    </div>
  );
}
