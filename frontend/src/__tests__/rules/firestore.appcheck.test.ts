// @vitest-environment node
/**
 * App Check rules tests (A11 layer 2) — DOCUMENTATION-ONLY in emulator.
 *
 * The Firestore emulator does NOT enforce `request.app != null` checks.
 * `request.app` evaluates to non-null in the emulator regardless of
 * whether an `X-Firebase-AppCheck` header was present. This was verified
 * directly via curl against the emulator REST API (see audit deviations
 * doc for the probe + finding).
 *
 * What this means:
 *   - The `appChecked()` rule helper in firestore.rules WILL enforce
 *     correctly in production once App Check is set to "Enforced" in
 *     the Firebase Console (layer 1 — pending user click).
 *   - In the emulator (and therefore in CI), this enforcement cannot
 *     be tested.
 *
 * The tests below are kept as DOCUMENTATION of the intended behavior
 * and will be useful if either (a) the emulator gains App Check
 * enforcement, or (b) we wire CI to run a subset of these against a
 * staging Firebase project. They're skipped in the emulator path.
 */
import { describe, it } from 'vitest';

describe.skip(
  'A11 layer 2 — App Check rule enforcement (emulator does not enforce; prod-only)',
  () => {
    it('would reject auth-only read of dnz_balance without App Check header', () => {
      // In production:
      //   GET /v1/projects/{pid}/databases/(default)/documents/users/{uid}/dnz_balance/current
      //   Headers: Authorization: Bearer <id-token>
      //   → 403 PERMISSION_DENIED (rule appChecked() returns false)
    });
    it('would allow auth + App Check read of dnz_balance', () => {
      // In production:
      //   Same URL, plus header: X-Firebase-AppCheck: <reCAPTCHA-v3-token>
      //   → 200 OK
    });
    it('would reject auth-only read of mining_devices without App Check header', () => {
      // Same shape, different collection.
    });
  },
);
