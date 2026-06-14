import { defineConfig } from 'vitest/config'
import path from 'path'

/**
 * Separate vitest config for Firebase rules tests (P3.9 / P3.10).
 *
 * The default vitest.config.ts EXCLUDES __tests__/rules/** so unit tests
 * stay fast (no Java/emulator required). This config is the inverse:
 *  - INCLUDES only __tests__/rules/**
 *  - Uses node env (rules tests are HTTP-based, no DOM needed)
 *  - Skips coverage thresholds (rules tests don't contribute to lib coverage)
 *
 * Driven by `npm run test:rules` which wraps with `firebase emulators:exec`.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/__tests__/rules/**/*.test.{ts,tsx}'],
  },
})
