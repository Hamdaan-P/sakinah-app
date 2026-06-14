/**
 * Helpers for talking to the Firebase Auth emulator REST API directly.
 *
 * Used by E2E tests that need to seed users (with verified email) and
 * tear them down without going through the actual signup UI flow. Going
 * through the UI is fine for the happy-path test, but we also want to
 * exercise the "already-authenticated user lands on a protected route"
 * path, which requires programmatic seeding.
 *
 * Auth emulator REST API:
 *   https://firebase.google.com/docs/emulator-suite/connect_auth#rest_api
 *
 * Project ID is `demo-zaryahplus` to match firebase.json's projectId
 * convention — Firebase emulators treat `demo-*` IDs as never-connecting-
 * to-real-services, so this is safe.
 */

const PROJECT_ID = 'demo-zaryahplus';
const EMULATOR_BASE = 'http://127.0.0.1:9099';

const SIGNUP_URL = `${EMULATOR_BASE}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`;
const NUKE_URL = `${EMULATOR_BASE}/emulator/v1/projects/${PROJECT_ID}/accounts`;

export async function isEmulatorReachable(): Promise<boolean> {
  try {
    const r = await fetch(`${EMULATOR_BASE}/`, { method: 'GET' });
    return r.ok || r.status === 404;
  } catch {
    return false;
  }
}

/** Create an emulator user with a verified email. Returns the local UID + ID token. */
export async function createVerifiedUser(
  email: string,
  password: string,
): Promise<{ uid: string; idToken: string }> {
  const r = await fetch(SIGNUP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  if (!r.ok) {
    throw new Error(`Auth emulator signup failed: ${r.status} ${await r.text()}`);
  }
  const data = await r.json();

  // Mark email as verified via the emulator's update endpoint.
  const updateUrl = `${EMULATOR_BASE}/identitytoolkit.googleapis.com/v1/accounts:update?key=fake-api-key`;
  const u = await fetch(updateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: data.idToken, emailVerified: true }),
  });
  if (!u.ok) {
    throw new Error(`Auth emulator email-verify failed: ${u.status} ${await u.text()}`);
  }

  return { uid: data.localId, idToken: data.idToken };
}

/** Wipe ALL users from the emulator. Call between tests. */
export async function clearEmulatorUsers(): Promise<void> {
  await fetch(NUKE_URL, { method: 'DELETE' });
}

/** Generate a unique-ish test email so concurrent runs don't collide. */
export function uniqueTestEmail(prefix = 'e2e'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.local`;
}
