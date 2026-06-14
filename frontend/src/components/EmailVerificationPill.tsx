import { useState } from 'react';
import { useAuthStore } from '@/core/stores/auth.store';
import { auth } from '@/config/firebase.config';

/**
 * Inline status pill shown next to the user's email on the Profile page.
 * Green check when verified; yellow "Verify now" when not — clicking sends a
 * fresh verification link and reloads the Firebase user so the pill updates
 * once they click the link in their inbox.
 *
 * Pure UI / no nag — only appears where the user is already managing their
 * account, so no banner spam.
 */
export function EmailVerificationPill() {
  const user = useAuthStore((s) => s.user);
  const resend = useAuthStore((s) => s.resendVerificationEmail);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!user || user.isAnonymous) return null;

  const verified = user.emailVerified;

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      // First refresh — they may have already clicked the link in another tab.
      await auth.currentUser?.reload().catch(() => { /* best-effort */ });
      if (auth.currentUser?.emailVerified) {
        setFeedback('Email verified.');
        return;
      }
      const ok = await resend();
      setFeedback(ok ? 'Verification link sent — check your inbox.' : 'Could not send. Try again in a minute.');
    } finally {
      setBusy(false);
    }
  };

  if (verified) {
    return (
      <span
        title="Email verified"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          marginLeft: 8,
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          background: 'rgba(16,185,129,0.15)',
          color: '#34D399',
          border: '1px solid rgba(16,185,129,0.3)',
        }}
      >
        ✓ Verified
      </span>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
      <button
        onClick={handleClick}
        disabled={busy}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          background: 'rgba(212,168,83,0.18)',
          color: '#FFE9A8',
          border: '1px solid rgba(212,168,83,0.4)',
          cursor: busy ? 'wait' : 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? 'Sending…' : 'Verify now'}
      </button>
      {feedback && (
        <span style={{ fontSize: 11, color: '#7A7363' }}>{feedback}</span>
      )}
    </span>
  );
}
