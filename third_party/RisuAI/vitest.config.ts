import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    svelte(),
  ],
  resolve: {
    alias: [
      { find: 'src/lib/UI/PopupList.svelte', replacement: resolve(__dirname, 'src/headless/shims/PopupList.ts') },
      { find: 'src/lib/Others/HypaV3Modal/types', replacement: resolve(__dirname, 'src/headless/shims/HypaV3Types.ts') },
      { find: 'src', replacement: resolve(__dirname, 'src') },
    ],
    conditions: ['browser'],
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['vitest.setup.ts'],
  },
})
