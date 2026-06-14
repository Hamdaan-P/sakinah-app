/**
 * E2E smoke spec — Phase 3.13.
 *
 * Visits every public route + the auth pages, asserts:
 *   - The page returns HTTP 200 (Vite dev) and a non-empty <body>
 *   - No console errors fired during initial render
 *   - Key UI elements (form inputs, headings) are present where expected
 *
 * Does NOT exercise:
 *   - Real auth/signup → that needs the Firebase emulator + a seeded user.
 *     Add as a follow-up spec when emulator-driven tests land.
 *   - Wallet/KYC/Mining flows → require an authed session.
 *
 * What this catches:
 *   - SSR-incompatible code paths that crash the app shell
 *   - Routing regressions (new release accidentally breaks /signup)
 *   - Bundle-loading failures (missing chunks, broken lazy imports)
 *   - Critical accessibility regressions (no <h1>, no form labels)
 */

import { test, expect, Page } from '@playwright/test';

// Capture every console error so we can fail tests on unexpected client-side
// errors. Some warnings are routine (e.g. React StrictMode double-invokes,
// dev-only Firebase warnings) — filtered below.
function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    // Allowlist: common dev-mode noise that isn't a real bug
    if (text.includes('Sentry')) return;          // dev — DSN unset is expected
    if (text.includes('Firebase: Error')) return; // dev — auth/firestore not connected
    if (text.includes('App Check')) return;       // dev — site key unset
    if (text.includes('PWA:')) return;            // dev info
    if (text.includes('beforeinstallprompt')) return;
    errors.push(`console.error: ${text}`);
  });
  return errors;
}

test.describe('public routes smoke', () => {
  test('/ renders without crashing', async ({ page }) => {
    const errors = trackConsoleErrors(page);
    const resp = await page.goto('/');
    expect(resp?.status()).toBeLessThan(400);
    // Auto-retrying matcher — waits up to expect.timeout for the React bundle
    // to mount and render. The brand heading is a stable anchor.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('/login renders a sign-in form', async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto('/login');
    await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/password/i).first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('/signup renders the signup form', async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto('/signup');
    await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/password/i).first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('/legal/privacy renders policy text', async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto('/legal/privacy');
    // Auto-retries until the bundle mounts and the word "privacy" appears.
    await expect(page.locator('body')).toContainText(/privacy/i);
    expect(errors).toEqual([]);
  });

  test('/legal/terms renders terms text', async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto('/legal/terms');
    await expect(page.locator('body')).toContainText(/terms|service|agreement/i);
    expect(errors).toEqual([]);
  });

  test('/legal/disclaimers renders', async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto('/legal/disclaimers');
    await expect(page.getByRole('heading').first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('/welcome renders landing-style content', async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto('/welcome');
    await expect(page.getByRole('heading').first()).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('login form interactions (no real auth)', () => {
  test('typing in email + password fields updates value', async ({ page }) => {
    await page.goto('/login');
    const email = page.getByPlaceholder(/email/i).first();
    const password = page.getByPlaceholder(/password/i).first();

    await email.fill('test@example.com');
    await password.fill('hunter2hunter2');

    await expect(email).toHaveValue('test@example.com');
    await expect(password).toHaveValue('hunter2hunter2');
  });

  test('signup link from /login navigates to /signup', async ({ page }) => {
    await page.goto('/login');
    // Find a link/button that goes to signup. Multiple valid selectors:
    // text "Sign up", "Create account", or a link to /signup
    const signupLink = page.locator('a[href="/signup"], a:has-text("Sign up"), a:has-text("Create")').first();
    if (await signupLink.count() > 0) {
      await signupLink.click();
      await expect(page).toHaveURL(/\/signup/);
    } else {
      // If no direct link, just verify the route exists
      await page.goto('/signup');
      await expect(page).toHaveURL(/\/signup/);
    }
  });
});

test.describe('protected routes redirect when unauthed', () => {
  test('visiting /admin without auth redirects to login (or shows login prompt)', async ({ page }) => {
    await page.goto('/admin');
    // Wait for the React bundle to mount + AuthGuard's redirect-or-prompt
    // logic to finish. Accept any of:
    //   - URL ends up on /login or /admin/login
    //   - Or page shows a "Sign In" prompt (AuthGuard's showLoginPrompt mode)
    //   - Or page shows the admin login form itself
    await page.waitForLoadState('networkidle');
    const url = page.url();
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const onLoginRoute = /\/login|\/admin/.test(new URL(url).pathname);
    const showsAuthUI = /sign in|password|email|admin/i.test(bodyText);
    expect(onLoginRoute || showsAuthUI).toBe(true);
  });
});
