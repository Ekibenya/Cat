import { defineConfig } from 'vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import wasm from 'vite-plugin-wasm';
import { resolve } from 'node:path';

export default defineConfig({
  publicDir: false,
  plugins: [svelte({ preprocess: vitePreprocess() }), wasm()],
  resolve: {
    alias: [
      { find: 'src/lib/UI/PopupList.svelte', replacement: resolve(__dirname, 'src/headless/shims/PopupList.ts') },
      { find: 'src/lib/Others/HypaV3Modal/types', replacement: resolve(__dirname, 'src/headless/shims/HypaV3Types.ts') },
      { find: 'src', replacement: resolve(__dirname, 'src') },
    ],
  },
  build: {
    target: 'baseline-widely-available',
    minify: 'oxc',
    sourcemap: false,
    assetsInlineLimit: 0,
    outDir: 'dist-headless',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/headless/index.ts'),
      formats: ['es'],
      fileName: () => 'risu-headless.js',
    },
    rollupOptions: {
      external: ['@huggingface/transformers'],
    },
  },
  worker: { format: 'es' },
});
