import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'
import { execSync } from 'child_process'

// Phase 6 — surface the deployed git SHA in the bundle so the footer
// version badge can display it for incident triage. Resolution order:
//   1. VITE_APP_VERSION env var (set by CI / GitHub Actions deploy)
//   2. Local `git rev-parse --short HEAD` (dev / one-off builds)
//   3. Fallback "dev" string
function resolveAppVersion(): string {
  if (process.env.VITE_APP_VERSION) return process.env.VITE_APP_VERSION
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return 'dev'
  }
}
const APP_VERSION = resolveAppVersion()

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    // Compile-time constant — replaces `__APP_VERSION__` everywhere in the
    // bundle at build time. Cheaper than a runtime env read on every render.
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
  plugins: [
    react(),
    // Phase 5 — bundle audit. Emits dist/bundle-stats.html when the
    // ANALYZE env var is set (`ANALYZE=1 npm run build`). Treemap shows
    // which deps dominate gzipped + brotli sizes so we can decide what
    // to lazy-load (Three.js, PDF lib, charting are the known suspects).
    // No-op for normal builds — the file is large and would bloat dist.
    ...(process.env.ANALYZE
      ? [
          visualizer({
            filename: 'dist/bundle-stats.html',
            template: 'treemap',
            gzipSize: true,
            brotliSize: true,
            open: false,
          }),
        ]
      : []),
  ],
  assetsInclude: ['**/*.glb'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Phase 5 — strip `console.*` and `debugger` from production builds.
  // Dev keeps the calls so debugging works; this only fires on `vite build`
  // (or any non-dev mode). Sentry still receives errors because we use
  // `Sentry.captureException` / `logger.error`, not bare `console.error`,
  // for things we actually want to know about.
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : {},
  build: {
    // Raise warning threshold — we intentionally have a large 3D chunk.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Split vendor code into dedicated chunks so:
        //  - browser can cache them forever across deploys
        //  - app-code changes don't invalidate the 800KB of framework code
        //  - firebase loads on-demand for pages that don't need it
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/messaging', 'firebase/storage'],
          'vendor-motion': ['framer-motion'],
          'vendor-query': ['@tanstack/react-query', 'zustand'],
          'vendor-i18n': ['i18next', 'react-i18next'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // NOTE: icons (@phosphor-icons/react, react-icons) are intentionally
          // NOT in manualChunks — they use per-icon imports that tree-shake
          // to only the icons each page uses. Bundling them would ship all icons.
          'vendor-utils': ['clsx', 'tailwind-merge'],
        },
      },
    },
  },
}))
