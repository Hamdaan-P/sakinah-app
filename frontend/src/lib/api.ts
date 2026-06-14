/**
 * Authenticated API helpers
 * Attaches Firebase ID token + App Check token to every backend request.
 */

import { getToken } from 'firebase/app-check';
import { appCheck, auth } from '@/config/firebase.config';

/**
 * Single source of truth for the backend URL.
 *
 * The dev fallback (`http://localhost:8000`) only kicks in when the build was
 * NOT run with `MODE=production` — vite stamps `import.meta.env.PROD` based on
 * `--mode`, so this guarantees a prod bundle never carries the dev string.
 * Phase 5: the bundle is also CI-grepped for `localhost` to fail any future
 * regression that re-introduces a literal.
 */
const PROD_BACKEND = import.meta.env.VITE_BACKEND_URL as string | undefined;
if (import.meta.env.PROD && !PROD_BACKEND) {
  // Fail loud at module load — never silently fall through to localhost.
  throw new Error(
    'VITE_BACKEND_URL is required in production builds. Set it before running `vite build`.',
  );
}
export const BACKEND_URL = PROD_BACKEND || 'http://localhost:8000';

/**
 * Optional override for the new Rayah Plus Quran endpoints. When set in dev,
 * `/quran/*` and `/chat/islamic` route here while everything else (auth, DNZ,
 * profile, market data, …) keeps hitting the main `BACKEND_URL`. Lets a
 * developer run a local stub for the new endpoints without disconnecting the
 * rest of the app from the prod backend.
 *
 * Set in `.env.local` as `VITE_QURAN_BACKEND_URL=http://localhost:8001`.
 */
const QURAN_BACKEND = import.meta.env.VITE_QURAN_BACKEND_URL as string | undefined;

const QURAN_PATH_PREFIXES = ['/quran/', '/chat/islamic'];

function resolveBackend(path: string): string {
  if (QURAN_BACKEND && QURAN_PATH_PREFIXES.some((p) => path.startsWith(p))) {
    return QURAN_BACKEND;
  }
  return BACKEND_URL;
}

/** Get the current user's Firebase ID token, or null if not logged in. */
async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

/**
 * Get the current Firebase App Check token, or null if App Check isn't
 * initialized (dev, preview builds without site key, init failure).
 *
 * The SDK silently auto-refreshes tokens before they expire — by the time we
 * call getToken() at request time, the cached token is usually <1ms to hand
 * back. `forceRefresh: false` is the default; we explicitly set it so a
 * stale token doesn't add latency on a slow network.
 */
async function getAppCheckToken(): Promise<string | null> {
  if (!appCheck) return null;
  try {
    const result = await getToken(appCheck, /* forceRefresh */ false);
    return result.token;
  } catch {
    // Token grant failed (reCAPTCHA score too low, network, etc.). Returning
    // null lets the request proceed — backend is in observe mode and will
    // log the missing-token case rather than reject. Once App Check rollout
    // flips to enforced, the backend will start returning 401s here.
    return null;
  }
}

/**
 * Build headers with both Firebase Auth bearer token and App Check token.
 * - Authorization: Bearer <Firebase ID token>   (identifies the user)
 * - X-Firebase-AppCheck: <App Check token>      (proves request came from
 *   a real browser running our real frontend, not a Python script)
 */
async function authHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...extra };
  const [idToken, appCheckToken] = await Promise.all([getIdToken(), getAppCheckToken()]);
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }
  if (appCheckToken) {
    headers['X-Firebase-AppCheck'] = appCheckToken;
  }
  return headers;
}

// Slow endpoints: admin queries scan many users; screener runs yfinance +
// Shariah pipeline over the whole watchlist on a cold hit — 10s is not enough.
function defaultTimeoutMs(path: string): number {
  if (
    path.startsWith('/admin/') ||
    path.startsWith('/api/screener/full') ||
    path.startsWith('/api/stock/screen/batch')
  ) return 30000;
  // Raya LLM calls (tafakkur seeds, quiet weekly report, in-page chat) — these
  // can take 20–40s on cache-miss because they invoke Claude.
  if (path.startsWith('/raya/') || path.startsWith('/chat')) return 60000;
  return 10000;
}

/** Authenticated POST request. */
export async function authPost<T>(path: string, body: unknown, timeoutMs?: number): Promise<T> {
  const headers = await authHeaders({ 'Content-Type': 'application/json' });
  const res = await fetch(`${resolveBackend(path)}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs ?? defaultTimeoutMs(path)),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

/** Authenticated POST returning the raw Response so the caller can stream
 *  the body (used by EIM analysis SSE). Does NOT apply the default timeout
 *  — streaming responses are long-lived; caller supplies an AbortSignal
 *  if needed. */
export async function authPostStream(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<Response> {
  const headers = await authHeaders({
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  });
  const res = await fetch(`${resolveBackend(path)}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res;
}

/** Authenticated GET request. */
export async function authGet<T>(path: string): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${resolveBackend(path)}${path}`, {
    headers,
    signal: AbortSignal.timeout(defaultTimeoutMs(path)),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

/** Authenticated multipart/form-data POST. Used for file uploads (e.g. EIM
 * Mizan Mirror tradebook CSV). Don't set Content-Type explicitly — the
 * browser must supply the boundary marker automatically. */
export async function authPostMultipart<T>(
  path: string,
  form: FormData,
  timeoutMs?: number,
): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${resolveBackend(path)}${path}`, {
    method: 'POST',
    headers,
    body: form,
    signal: AbortSignal.timeout(timeoutMs ?? 30000),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

/** Authenticated PATCH request. Partial updates — body fields omitted are
 * left unchanged by the server. */
export async function authPatch<T>(path: string, body: unknown, timeoutMs?: number): Promise<T> {
  const headers = await authHeaders({ 'Content-Type': 'application/json' });
  const res = await fetch(`${resolveBackend(path)}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs ?? defaultTimeoutMs(path)),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

/** Authenticated DELETE request. */
export async function authDelete<T>(path: string): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${resolveBackend(path)}${path}`, {
    method: 'DELETE',
    headers,
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}
