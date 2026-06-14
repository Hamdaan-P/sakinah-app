/**
 * WhatsApp Link service — wraps the backend endpoints from
 * ``app/routes/whatsapp.py``:
 *
 *   POST   /whatsapp/linking/token   → mint a single-use link token
 *   DELETE /whatsapp/link            → unlink the current user
 *   GET    /whatsapp/link/status     → poll for link state
 *
 * All requests carry the Firebase ID token (via authPost/authGet/authDelete).
 */

import { authDelete, authGet, authPost } from '@/lib/api';
import type {
  LinkStatus,
  MintTokenResponse,
  UnlinkResponse,
} from '../types/whatsappLink.types';

export async function mintLinkToken(): Promise<MintTokenResponse> {
  // POST body is empty — uid is resolved server-side from the auth header.
  return authPost<MintTokenResponse>('/whatsapp/linking/token', {});
}

export async function getLinkStatus(): Promise<LinkStatus> {
  return authGet<LinkStatus>('/whatsapp/link/status');
}

export async function unlinkWhatsApp(): Promise<UnlinkResponse> {
  return authDelete<UnlinkResponse>('/whatsapp/link');
}

/**
 * Open a wa.me deep link. On Capacitor (native shell) uses the Browser
 * plugin if available; falls back to ``window.open`` which the OS
 * handles by deep-linking into the WhatsApp app on iOS/Android, or
 * web.whatsapp.com on desktop.
 *
 * Returns ``true`` if the open call was issued, ``false`` if the env
 * couldn't open URLs (rare, e.g. SSR test contexts).
 */
export async function openDeepLink(url: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    // Dynamic import so Vite doesn't choke on the optional Capacitor
    // plugin when running in the pure-web build.
    const cap = await import('@capacitor/browser').catch(() => null);
    if (cap?.Browser) {
      await cap.Browser.open({ url });
      return true;
    }
  } catch {
    // fall through to window.open
  }
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
