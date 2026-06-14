/**
 * WhatsApp Link — main settings page for the channel.
 *
 * Three UI states:
 *
 *   1. ``not linked``  — explainer + CTA. Tapping CTA mints a token,
 *                         opens the wa.me deep link, starts polling
 *                         for status. Renders a "waiting for you to
 *                         send the message" hint while polling.
 *   2. ``linking``     — token minted, deep link opened. Status query
 *                         polls every 3s for up to 5min.
 *   3. ``linked``      — show the linked phone + "Unlink" button. Unlink
 *                         opens a confirmation modal first.
 *
 * The page is intentionally minimal styling-wise; the host shell's
 * theme + typography apply. Real i18n keys land in
 * ``src/i18n/{en,ar,ur,ta}/whatsapp-link.json`` — for v1 the strings
 * are hardcoded English here; the JSON files exist as scaffolding.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  POLL_INTERVAL_MS,
  POLL_MAX_DURATION_MS,
  useLinkStatus,
  useMintLinkToken,
  useUnlinkWhatsApp,
} from '../hooks/useWhatsAppLink';
import { openDeepLink } from '../services/whatsappLinkService';

export function WhatsAppLinkPage() {
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [pollingStartedAt, setPollingStartedAt] = useState<number | null>(null);
  const [confirmUnlinkOpen, setConfirmUnlinkOpen] = useState(false);

  const isPolling = pollingStartedAt !== null;

  const status = useLinkStatus({
    refetchInterval: isPolling ? POLL_INTERVAL_MS : false,
    enabled: true,
  });

  const mint = useMintLinkToken();
  const unlink = useUnlinkWhatsApp();

  // Stop polling once linked, or after the timeout window.
  useEffect(() => {
    if (!isPolling) return;
    if (status.data?.linked) {
      setPollingStartedAt(null);
      setDeepLink(null);
      return;
    }
    const elapsed = Date.now() - (pollingStartedAt ?? 0);
    if (elapsed > POLL_MAX_DURATION_MS) {
      setPollingStartedAt(null);
    }
  }, [isPolling, pollingStartedAt, status.data?.linked]);

  const handleStartLinking = useCallback(async () => {
    try {
      const result = await mint.mutateAsync();
      setDeepLink(result.deep_link);
      setPollingStartedAt(Date.now());
      await openDeepLink(result.deep_link);
    } catch {
      // The mutation hook surfaces ``mint.error`` for the UI to render.
      // Nothing else to do here.
    }
  }, [mint]);

  const handleConfirmUnlink = useCallback(async () => {
    try {
      await unlink.mutateAsync();
      setConfirmUnlinkOpen(false);
    } catch {
      // surface via ``unlink.error``
    }
  }, [unlink]);

  if (status.isLoading) {
    return (
      <div className="whatsapp-link__loading">
        Loading WhatsApp link status…
      </div>
    );
  }

  if (status.data?.linked) {
    return (
      <div className="whatsapp-link whatsapp-link--linked">
        <h1>WhatsApp linked</h1>
        <p>
          Raya is connected to your WhatsApp at{' '}
          <strong>{status.data.phone}</strong>.
        </p>
        {status.data.linked_at && (
          <p className="whatsapp-link__since">
            Linked on {new Date(status.data.linked_at).toLocaleDateString()}.
          </p>
        )}
        <button
          type="button"
          className="whatsapp-link__unlink-btn"
          onClick={() => setConfirmUnlinkOpen(true)}
        >
          Unlink WhatsApp
        </button>

        {confirmUnlinkOpen && (
          <div className="whatsapp-link__modal" role="dialog" aria-modal="true">
            <h2>Unlink WhatsApp?</h2>
            <p>
              Raya will stop responding on WhatsApp until you link again.
              Your conversation history stays on your account.
            </p>
            <div className="whatsapp-link__modal-actions">
              <button
                type="button"
                onClick={() => setConfirmUnlinkOpen(false)}
                disabled={unlink.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="whatsapp-link__danger-btn"
                onClick={() => void handleConfirmUnlink()}
                disabled={unlink.isPending}
              >
                {unlink.isPending ? 'Unlinking…' : 'Yes, unlink'}
              </button>
            </div>
            {unlink.error && (
              <p className="whatsapp-link__error" role="alert">
                Couldn't unlink — please try again.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Not linked yet (idle or polling).
  return (
    <div className="whatsapp-link">
      <h1>Chat with Raya on WhatsApp</h1>
      <p>
        Link your Zaryah Plus account to WhatsApp so Raya can answer
        you wherever you are — same Raya, same memory, no app required.
      </p>
      <ul>
        <li>Sourced answers to Quran and hadith questions.</li>
        <li>Reminders that fire on time, in your timezone.</li>
        <li>Voice notes welcome — Raya listens and replies.</li>
        <li>Your gratitude (Barka Labs) stays in sync.</li>
      </ul>

      <button
        type="button"
        className="whatsapp-link__cta"
        onClick={() => void handleStartLinking()}
        disabled={mint.isPending || isPolling}
      >
        {mint.isPending
          ? 'Preparing link…'
          : isPolling
            ? 'Waiting for WhatsApp…'
            : 'Chat with Raya on WhatsApp'}
      </button>

      {isPolling && deepLink && (
        <div className="whatsapp-link__waiting">
          <p>
            WhatsApp should have opened with a pre-filled message — just
            tap send to finish linking.
          </p>
          <p className="whatsapp-link__hint">
            If WhatsApp didn't open,{' '}
            <a href={deepLink} target="_blank" rel="noopener noreferrer">
              tap here
            </a>{' '}
            to open it manually.
          </p>
        </div>
      )}

      {mint.error && (
        <p className="whatsapp-link__error" role="alert">
          Couldn't prepare the link — please try again in a moment.
        </p>
      )}
    </div>
  );
}

export default WhatsAppLinkPage;
