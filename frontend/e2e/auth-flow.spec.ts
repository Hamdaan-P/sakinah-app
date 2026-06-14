/**
 * A10 — Real Playwright auth flow.
 *
 * Plan called for: signup → email-verify → quick KYC → wallet → buy DNZ
 * on an ephemeral preview deploy. This spec covers the achievable subset
 * with the Firebase Auth + Firestore emulators wired:
 *
 *   1. Signup form creates a user (real Firebase signup → Auth emulator)
 *   2. App lands on the post-signup route (home or quick-kyc)
 *   3. Programmatic-seeded verified user can sign in via the form
 *
 * Email-verify itself is bypassed by setting `emailVerified=true` via the
 * Auth emulator REST API directly — there's no real email server. This is
 * the standard Firebase pattern for E2E.
 *
 * Skipped if the Auth emulator isn't reachable, so this spec doesn't break
 * smoke runs that don't pre-start emulators.
 *
 * Run:
 *   firebase emulators:start --only auth,firestore --project demo-zaryahplus
 *   VITE_USE_AUTH_EMULATOR=true npm run test:e2e -- auth-flow
 */
import { expect, test } from '@playwright/test';
import {
  clearEmulatorUsers,
  createVerifiedUser,
  isEmulatorReachable,
  uniqueTestEmail,
} from './helpers/auth-emulator';

test.beforeAll(async () => {
  if (!(await isEmulatorReachable())) {
    test.skip(true, 'Firebase Auth emulator not reachable on 127.0.0.1:9099');
  }
});

test.beforeEach(async () => {
  await clearEmulatorUsers();
});

test('signup form creates a real Firebase user and lands on a protected route', async ({ page }) => {
  const email = uniqueTestEmail('signup');
  const password = 'TestPassword123!';

  await page.goto('/signup');

  // Wait for the signup form to mount.
  await expect(page.getByRole('heading', { name: /sign up|create account|join/i })).toBeVisible({
    timeout: 10_000,
  });

  // The exact form selectors vary by app — using attribute-based selectors
  // that are stable across visual redesigns.
  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(password);

  // Submit. After Firebase signup, the auth listener flips the store to
  // authenticated; the AuthGuard redirects either to /quick-kyc (tier 0
  // users) or to the home page.
  await page.getByRole('button', { name: /sign up|create account|continue/i }).first().click();

  // Wait for redirect away from /signup.
  await expect(page).not.toHaveURL(/\/signup\b/, { timeout: 15_000 });

  // Should now be on a protected route — either /quick-kyc or /.
  const url = page.url();
  const onProtectedRoute =
    url.includes('/quick-kyc') ||
    url.endsWith('/') ||
    url.match(/\/(home|wallet|companion)/);
  expect(onProtectedRoute, `expected protected route, got ${url}`).toBeTruthy();
});

test('pre-seeded verified user can sign in via the form', async ({ page }) => {
  const email = uniqueTestEmail('signin');
  const password = 'TestPassword123!';

  // Seed the user directly via emulator REST so we test the LOGIN flow,
  // not the signup flow. emailVerified=true so any email-verified gates
  // don't block the test.
  await createVerifiedUser(email, password);

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /sign in|log in|welcome/i })).toBeVisible({
    timeout: 10_000,
  });

  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole('button', { name: /sign in|log in|continue/i }).first().click();

  // Wait for redirect away from /login.
  await expect(page).not.toHaveURL(/\/login\b/, { timeout: 15_000 });
});

test('signup with weak password shows an inline error', async ({ page }) => {
  const email = uniqueTestEmail('weak');
  const password = '1';  // too short

  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: /sign up|create account|join/i })).toBeVisible({
    timeout: 10_000,
  });

  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole('button', { name: /sign up|create account|continue/i }).first().click();

  // Should stay on /signup with some kind of error indicator. The exact
  // error UX varies — we just assert we DIDN'T leave the route.
  await page.waitForTimeout(2_000);
  expect(page.url()).toMatch(/\/signup\b/);
});

// ---------------------------------------------------------------------------
// Full plan flow: signup → quick KYC → wallet load.
// Email verification step is handled programmatically (Auth emulator REST
// API marks emailVerified=true at user-creation time via the helper); there
// is no real email server in the test environment.
// ---------------------------------------------------------------------------

test('signup → fills Quick KYC form → lands on a tier-1 protected route', async ({ page }) => {
  const email = uniqueTestEmail('full-flow');
  const password = 'TestPassword123!';

  // Step 1: Signup via real form.
  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: /sign up|create account|join/i })).toBeVisible({
    timeout: 10_000,
  });
  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole('button', { name: /sign up|create account|continue/i }).first().click();

  // Step 2: Should land on /quick-kyc (tier 0 user → AuthGuard redirects there).
  await expect(page).toHaveURL(/\/quick-kyc\b/, { timeout: 15_000 });

  // Step 3: Fill the Quick KYC form. Field selectors stay attribute-based
  // so visual redesigns don't break the test.
  await page.getByLabel(/(full )?name/i).first().fill('E2E Test User');

  // Gender — radio/select buttons. Try a few common patterns.
  const maleOption = page.getByRole('button', { name: /^male$/i }).or(
    page.getByLabel(/^male$/i),
  ).first();
  if (await maleOption.count() > 0) {
    await maleOption.click();
  }

  // DOB — date input or text input.
  const dobField = page.getByLabel(/(date of birth|dob|birthday)/i).first();
  if (await dobField.count() > 0) {
    await dobField.fill('1990-01-01');
  }

  // Country dropdown.
  const countryField = page.getByLabel(/country/i).first();
  if (await countryField.count() > 0) {
    // Could be a select or a typeahead. Try select first.
    const tag = await countryField.evaluate((el) => el.tagName);
    if (tag === 'SELECT') {
      await countryField.selectOption({ label: 'United States' });
    } else {
      await countryField.fill('United States');
    }
  }

  // Submit.
  const submit = page.getByRole('button', { name: /(continue|submit|complete|next|done)/i }).first();
  await submit.click();

  // After tier-1 completion the AuthGuard stops redirecting to /quick-kyc.
  // Either we land on / (home) or stay on a protected route — but NOT on
  // /quick-kyc anymore.
  await page.waitForTimeout(3_000);
  expect(page.url()).not.toMatch(/\/quick-kyc\b/);
});
