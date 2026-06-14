import js from '@eslint/js'
import globals from 'globals'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'android', 'ios', 'node_modules', 'coverage', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      // Phase 5 — accessibility lint. `recommended` is the conservative
      // subset (alt text, ARIA roles, keyboard handlers on clickables,
      // label-for-input). It does NOT enforce things like color contrast
      // — that needs Playwright/axe-core at test time. We add that
      // separately in `frontend/playwright/a11y.spec.ts`.
      //
      // 174 violations across the codebase today; rather than block CI
      // on all of them, we ratchet:
      //   - Default: every rule is `warn` (visible signal, no break).
      //   - Per-file override below: critical-flow pages (login, signup,
      //     KYC, wallet) treat every a11y rule as `error` so a regression
      //     on the routes every user touches gets caught.
      // Phase 5 follow-up: walk the codebase, fix violations file-by-file,
      // promote each cleaned file into the strict list.
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // React Compiler advisory rules (eslint-plugin-react-hooks v7).
      // This codebase doesn't use the React Compiler — these rules flag
      // patterns that work fine in classic React but might confuse RC.
      // Off until/unless we adopt React Compiler. The foundational hooks
      // rules ('rules-of-hooks', 'exhaustive-deps') stay at default — those
      // catch real bugs.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/incompatible-library': 'off',

      // Phase 4 of the remediation plan tightens backend types and
      // replaces dict/Any with TypedDicts/Pydantic. The frontend 'any'
      // cleanup rides along. Too pervasive (~25 sites) to fix in Phase 0.
      '@typescript-eslint/no-explicit-any': 'warn',

      // HMR-boundary rule — dev-time concern, not a bug. Many of these are
      // legitimately mixed (page component + a helper export). Warn for now;
      // Phase 5 page-component splits will reduce naturally.
      'react-refresh/only-export-components': 'warn',

      // Honor the underscore-prefix convention for "intentionally unused".
      // E.g. `function f(_unused, used) {}` and `const [, _v] = ...`.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Empty catch is a code smell but not always a bug — best-effort
      // operations (e.g., optional analytics, fire-and-forget cleanup) use
      // it intentionally. Allow when there is a comment inside the block
      // explaining why the failure is acceptable.
      'no-empty': ['error', { allowEmptyCatch: false }],

      // jsx-a11y rules — default to `warn` for the whole codebase. The
      // critical-flow files re-enable them as `error` in the override
      // block below.
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/media-has-caption': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',

      // Phase 5 — single source of truth for the backend URL. Only
      // `src/lib/api.ts` is allowed to mention `localhost:8000`; everywhere
      // else must `import { BACKEND_URL } from '@/lib/api'`. Catches
      // accidental re-introduction of the dev fallback in feature code.
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/localhost:8000/]",
          message:
            "Hardcoded 'localhost:8000' is forbidden outside src/lib/api.ts. Import BACKEND_URL from '@/lib/api' instead.",
        },
        {
          selector: "TemplateElement[value.raw=/localhost:8000/]",
          message:
            "Hardcoded 'localhost:8000' is forbidden outside src/lib/api.ts. Import BACKEND_URL from '@/lib/api' instead.",
        },
      ],
    },
  },
  // The ESLint rule above intentionally exempts `src/lib/api.ts` — that file
  // is the one allowed place for the dev fallback string.
  {
    files: ['src/lib/api.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  // Test-file overrides — `any` is legitimate in mocks/stubs where
  // matching the full SDK type would multiply test code with no benefit.
  {
    files: ['src/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Phase 5 — strict a11y on the critical-flow pages every user touches.
  // A regression here means the auth/KYC/wallet path becomes inaccessible
  // to screen-reader / keyboard users. Block the merge instead of warning.
  // Add files to this list after they've been audited and pass clean.
  {
    files: [
      'src/features/auth/pages/LoginPage.tsx',
      'src/features/auth/pages/SignupPage.tsx',
      'src/features/kyc/pages/QuickKycPage.tsx',
      'src/features/kyc/pages/DeepKycPage.tsx',
      'src/features/wallet/pages/WalletPage.tsx',
    ],
    rules: {
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/no-autofocus': 'error',
      'jsx-a11y/media-has-caption': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
    },
  },
])
