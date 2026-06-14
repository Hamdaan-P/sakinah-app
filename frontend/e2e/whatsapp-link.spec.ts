/**
 * E2E happy-path for the WhatsApp link feature — TL §5 Step 8 deliverable.
 *
 * Covers:
 *   1. Authed user lands on /settings/whatsapp → idle state with CTA visible
 *   2. Click CTA → backend mint token is called → polling kicks off
 *   3. Backend status flips to `linked` → linked view renders
 *   4. Click Unlink → confirmation modal → confirm → unlink call → idle again
 *
 * Backend HTTP is route-intercepted (no real backend dependency), so this
 * spec only requires the Firebase Auth emulator to be running for the
 * AuthGuard to pass. If the emulator isn't reachable the whole describe
 * block is skipped so smoke runs aren't fragile.
 *
 * Run:
 *   firebase emulators:start --only auth,firestore --project demo-zaryahplus
 *   VITE_USE_AUTH_EMULATOR=true npx playwright test whatsapp-link
 */

import { expect, test, Page } from '@playwright/test';
import {
  clearEmulatorUsers,
  createVerifiedUser,
  isEmulatorReachable,
  uniqueTestEmail,
} from './helpers/auth-emulator';

// Track call counts to assert each endpoint hits exactly once per flow step.
type CallCounts = {
  mint: number;
  status: number;
  unlink: number;
};

function setupBackendMocks(page: Page): {
  counts: CallCounts;
  setLinked: (linked: boolean) => void;
} {
  let isLinked = false;
  const counts: CallCounts = { mint: 0, status: 0, unlink: 0 };

  // GET /whatsapp/link/status — driven by `isLinked` flag so tests can flip
  // the backend state between polls.
  page.route('**/whatsapp/link/status', (route) => {
    counts.status += 1;
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        isLinked
          ? {
              linked: true,
              phone: '+918765432100',
              linked_at: '2026-05-16T10:30:00Z',
            }
          : { linked: false, phone: null, linked_at: null },
      ),
    });
  });

  // POST /whatsapp/linking/token — minted token + deep link.
  page.route('**/whatsapp/linking/token', (route) => {
    counts.mint += 1;
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'tok-e2e-abc',
        deep_link: 'https://wa.me/918888888888?text=link%20tok-e2e-abc',
        expires_at: '2026-05-17T12:00:00Z',
      }),
    });
  });

  // DELETE /whatsapp/link — flip backend state back to unlinked.
  page.route('**/whatsapp/link', (route) => {
    if (route.request().method() === 'DELETE') {
      counts.unlink += 1;
      isLinked = false;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unlinked: true }),
      });
    } else {
      route.fallback();
    }
  });

  return {
    counts,
    setLinked: (linked: boolean) => {
      isLinked = linked;
    },
  };
}

test.beforeAll(async () => {
  if (!(await isEmulatorReachable())) {
    test.skip(true, 'Firebase Auth emulator not reachable on 127.0.0.1:9099');
  }
});

test.beforeEach(async () => {
  await clearEmulatorUsers();
});

test.describe('WhatsApp linking — happy path', () => {
  test('idle → mint → polling → linked → unlink → idle', async ({ page }) => {
    const { counts, setLinked } = setupBackendMocks(page);

    // Seed a verified user so AuthGuard lets us into /settings/whatsapp.
    const email = uniqueTestEmail('wa-link');
    await createVerifiedUser(email, 'TestPassword123!');

    // Sign in via the form so the auth store actually picks up the user.
    await page.goto('/login');
    await page.getByLabel(/email/i).first().fill(email);
    await page.getByLabel(/password/i).first().fill('TestPassword123!');
    await page.getByRole('button', { name: /sign in|log in|continue/i }).first().click();
    await expect(page).not.toHaveURL(/\/login\b/, { timeout: 15_000 });

    // ── 1. Idle state ────────────────────────────────────────────────
    await page.goto('/settings/whatsapp');
    await expect(
      page.getByRole('heading', { name: /chat with raya on whatsapp/i }),
    ).toBeVisible({ timeout: 10_000 });
    // The CTA is the primary button.
    const cta = page
      .getByRole('button', { name: /chat with raya on whatsapp/i })
      .first();
    await expect(cta).toBeVisible();

    // Backend status was queried at least once on mount.
    expect(counts.status).toBeGreaterThanOrEqual(1);

    // ── 2. Click CTA → mint token → polling state ────────────────────
    await cta.click();
    await expect.poll(() => counts.mint, { timeout: 5_000 }).toBe(1);
    // After mint the UI shows the waiting hint.
    await expect(
      page.getByText(/whatsapp should have opened/i),
    ).toBeVisible({ timeout: 5_000 });

    // ── 3. Backend flips to linked → page re-renders linked view ─────
    setLinked(true);
    await expect(
      page.getByRole('heading', { name: /whatsapp linked/i }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('+918765432100')).toBeVisible();

    // ── 4. Click Unlink → confirm modal → confirm → idle ─────────────
    await page.getByRole('button', { name: /unlink whatsapp/i }).click();
    await expect(
      page.getByRole('heading', { name: /unlink whatsapp\?/i }),
    ).toBeVisible();
    await page.getByRole('button', { name: /yes, unlink/i }).click();
    await expect.poll(() => counts.unlink, { timeout: 5_000 }).toBe(1);

    // Once unlink resolves, status is re-fetched and the idle CTA returns.
    await expect(
      page.getByRole('button', { name: /chat with raya on whatsapp/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('WhatsApp linking — error path', () => {
  test('mint failure shows inline error and leaves CTA enabled', async ({ page }) => {
    // Status mock returns not-linked; mint endpoint returns 500.
    page.route('**/whatsapp/link/status', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ linked: false, phone: null, linked_at: null }),
      });
    });
    page.route('**/whatsapp/linking/token', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'mint_failed' }),
      });
    });

    const email = uniqueTestEmail('wa-err');
    await createVerifiedUser(email, 'TestPassword123!');
    await page.goto('/login');
    await page.getByLabel(/email/i).first().fill(email);
    await page.getByLabel(/password/i).first().fill('TestPassword123!');
    await page.getByRole('button', { name: /sign in|log in|continue/i }).first().click();
    await expect(page).not.toHaveURL(/\/login\b/, { timeout: 15_000 });

    await page.goto('/settings/whatsapp');
    const cta = page
      .getByRole('button', { name: /chat with raya on whatsapp/i })
      .first();
    await cta.click();

    await expect(
      page.getByText(/couldn.t prepare the link/i),
    ).toBeVisible({ timeout: 5_000 });
    // CTA stays clickable so the user can retry.
    await expect(cta).toBeEnabled();
  });
});
