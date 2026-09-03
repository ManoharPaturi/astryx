// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {astryxStylex} from '@astryxdesign/build/vite';

export default defineConfig({
  plugins: [
    // The default libraryPattern is 'node_modules/@astryxdesign/', which never
    // matches in this repo: core resolves to its source, so every Astryx rule
    // was classified as product and the whole sheet collapsed into @layer
    // product. That put core's own styles above @layer astryx-theme and made
    // defineTheme({components}) a silent no-op on the dev server.
    ...astryxStylex({libraryPattern: '/packages/core/src/'}),
    react(),
  ],
  // Templates live outside this app's root (packages/cli/assets/templates).
  server: {fs: {allow: ['../..']}},
});
