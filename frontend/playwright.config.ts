import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for Phase 3.13 E2E tests.
 *
 * Tests live in `e2e/` (kept separate from vitest unit tests under `src/__tests__/`).
 * Run via `npm run test:e2e` which:
 *   1. Boots the Vite dev server on port 5173 (via webServer config below)
 *   2. Runs the spec files
 *   3. Tears down
 *
 * For now we only ship Chromium — Firefox/Safari add ~500MB each and we're
 * one-browser-coverage on the smoke flow. Add when platform parity matters.
 */

export default defineConfig({
  testDir: './e2e',
  // 30s per test — generous for slow CI runners + animation waits.
  timeout: 30_000,
  // 5s per assertion — most expect()s should resolve quickly.
  expect: { timeout: 5_000 },
  // Fail the run if .only is left in source (CI catch).
  forbidOnly: !!process.env.CI,
  // Retries: 2 in CI to absorb infra flake; 0 locally for fast feedback.
  retries: process.env.CI ? 2 : 0,
  // Single worker locally (deterministic logs); parallelize in CI.
  workers: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: 'http://localhost:5173',
    // Capture trace + screenshot on failure for the postmortem.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Speed: skip CSS animations.
    reducedMotion: 'reduce',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Auto-start the Vite dev server before running tests. Reuse if already
  // running locally (`vite` already on 5173) so re-runs don't fight for
  // the port.
  //
  // VITE_USE_AUTH_EMULATOR=true wires the Firebase SDK to the Auth +
  // Firestore + Storage emulators (see frontend/src/config/firebase.config.ts).
  // The auth-flow.spec relies on this — it uses the Auth emulator REST API
  // to seed verified users and then drives the UI through real Firebase
  // signin. The smoke specs work either way (they only hit public routes).
  //
  // Run BEFORE `npm run test:e2e`: `firebase emulators:start --only auth,firestore`
  // (or test:e2e wraps via `firebase emulators:exec` — see package.json).
  webServer: {
    command: 'npm run dev',
    port: 5173,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...(process.env.VITE_USE_AUTH_EMULATOR
        ? { VITE_USE_AUTH_EMULATOR: process.env.VITE_USE_AUTH_EMULATOR }
        : {}),
    },
  },
});
