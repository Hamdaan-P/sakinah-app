/**
 * Raya Hub service — wraps the Raya intelligence endpoints from
 * `app/routes/raya.py`:
 *
 *   GET /raya/tafakkur-seeds/{uid}  → { seeds: [{context, prompt}] }
 *   GET /raya/quiet-report/{uid}    → QuietReport
 *
 * Both require the path uid to match the authed user (backend
 * `require_user_match`), so callers pass the current user's id.
 */

import { authGet } from '@/lib/api';
import type { QuietReport, TafakkurSeedsResponse } from '../types';

export async function getTafakkurSeeds(uid: string): Promise<TafakkurSeedsResponse> {
  return authGet<TafakkurSeedsResponse>(`/raya/tafakkur-seeds/${encodeURIComponent(uid)}`);
}

export async function getQuietReport(uid: string): Promise<QuietReport> {
  return authGet<QuietReport>(`/raya/quiet-report/${encodeURIComponent(uid)}`);
}
