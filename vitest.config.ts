import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import { URL } from 'url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
