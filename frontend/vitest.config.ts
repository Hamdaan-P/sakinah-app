import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    // Rules tests need a running Firebase emulator; they run via the
    // separate `npm run test:rules` script that wraps vitest with
    // `firebase emulators:exec`. Excluded from the default `npm test` so
    // unit/component tests stay fast and don't require Java + emulator.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/__tests__/rules/**',
      // Playwright E2E specs (.spec.ts under e2e/) are run by `npm run test:e2e`
      // — vitest must skip them or it'll try to run real-browser tests in jsdom.
      '**/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Per-area gates (A5). Each per-file threshold is set ~2% below the
      // current value to prevent regression while allowing flake. The
      // remediation plan's eventual targets are 90% on stores, 100% on
      // guards, 80% on lib helpers — bump these (never lower without a
      // documented reason) as new tests land.
      //
      // Global gate stays low because most of the codebase still has no
      // tests — chatbot pages, services, etc. Ratcheted up in tandem with
      // the per-file gates below.
      thresholds: {
        lines: 0.5,
        functions: 0.5,
        branches: 0.5,
        statements: 0.5,
        // Per-file gates — plan target met (≥ 90% lines on stores, ≥ 95%
        // on guards). Branches are slightly lower than lines because of
        // the long firebase-error-code if/else mapping chains; raising
        // those needs synthetic error-code tests for every Firebase auth
        // error (low ROI). Set at current achieved values to lock the
        // floor; bump if mapping tests are added later.
        'src/core/stores/auth.store.ts': {
          // Plan target 90% — hit on lines/functions/statements.
          // Branches 72% reflects Firebase error-code if/else chains.
          lines: 90, functions: 90, branches: 70, statements: 90,
        },
        'src/features/kyc/stores/kyc.store.ts': {
          // Plan target 90% — hit on lines/functions/statements.
          lines: 90, functions: 95, branches: 80, statements: 90,
        },
        'src/features/wallet/stores/wallet.store.ts': {
          // Plan target 90% — hit on lines/functions/statements.
          lines: 95, functions: 90, branches: 85, statements: 95,
        },
        'src/features/auth/components/AuthGuard.tsx': {
          // Plan target 100% — at 100% in isolation. Locked at 95.
          lines: 95, functions: 95, branches: 90, statements: 95,
        },
        'src/features/kyc/components/DeepKycGuard.tsx': {
          // Plan target 100% — at ~95% with dismiss + GATED_FEATURE_NAMES tests.
          lines: 90, functions: 75, branches: 88, statements: 90,
        },
      },
      exclude: [
        'node_modules/',
        'dist/',
        'android/',
        'ios/',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
        'src/main.tsx',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
      ],
    },
  },
})
