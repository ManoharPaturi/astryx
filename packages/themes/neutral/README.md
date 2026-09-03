# @astryxdesign/theme-neutral

Muted, minimal aesthetic with system fonts. Uses [Lucide](https://lucide.dev) icons.

## Install

```bash
npm install @astryxdesign/theme-neutral
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

function App() {
  return <XDSTheme theme={neutralTheme}>{/* your app */}</XDSTheme>;
}
```

### Import paths

| Path                                    | Use case                                                    |
| --------------------------------------- | ----------------------------------------------------------- |
| `@astryxdesign/theme-neutral`           | Source build (StyleX compilation via `@astryxdesign/build`) |
| `@astryxdesign/theme-neutral/built`     | Pre-built dist (Tailwind, plain CSS, or no build step)      |
| `@astryxdesign/theme-neutral/theme.css` | Pre-built CSS file (import in your stylesheet)              |

If you're using `@astryxdesign/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

## Approved palette

The repository keeps Neutral's approved palette in `src/neutralPalettes.ts` for
theme authoring and audits. It is not part of `defineTheme`, the built theme, or
runtime CSS. Neutral currently uses 21 numbered stops in each light and dark
ramp, but that layout is a Neutral decision rather than a requirement for other
themes.

Neutral is the reference implementation for palette-aware theme templates.
Templates may follow its ownership, review, and alignment workflow without
copying its colors or stop layout.

Use semantic theme tokens in components. When a theme color is selected from the
palette, retain the reviewed hex value explicitly in the theme so later palette
edits cannot silently recolor rendered UI.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import '@astryxdesign/theme-neutral/theme.css';
```

This is required for component-level theme overrides (colors, radii, typography) to take effect.

This theme uses system fonts; no external font loading is required.

## Related Packages

| Package                                                                              | Description                               |
| ------------------------------------------------------------------------------------ | ----------------------------------------- |
| [`@astryxdesign/core`](https://github.com/facebook/astryx/tree/main/packages/core)   | Core components and theme system          |
| [`@astryxdesign/build`](https://github.com/facebook/astryx/tree/main/packages/build) | Build plugins for StyleX source builds    |
| [`@astryxdesign/cli`](https://github.com/facebook/astryx/tree/main/packages/cli)     | CLI tooling including `astryx docs theme` |
