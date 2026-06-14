import { useEffect, useState } from 'react';
import { useBarakahFlow, type Recipient } from '../stores/barakah-flow.store';
import { useAuthStore } from '@/core/stores/auth.store';
import { BackHeader } from '../components/Greet';
import { loadConnections } from '../services/connectionsHelper';
import { createQuietReportShare, revokeQuietReportShare } from '../services/shareService';

function absoluteShareUrl(path: string): string {
  // The backend returns just the path (/quiet-report/share/...); attach the
  // app's current origin so users can copy a full URL.
  if (path.startsWith('http')) return path;
  return `${window.location.origin}${path}`;
}

export function S20_ShareReport() {
  const go = useBarakahFlow((s) => s.go);
  const target = useBarakahFlow((s) => s.shareTarget);
  const setTarget = useBarakahFlow((s) => s.setShareTarget);
  const user = useAuthStore((s) => s.user);

  const [contacts, setContacts] = useState<Recipient[]>([]);
  const [creating, setCreating] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    void loadConnections(user.id).then((rs) => {
      if (alive) setContacts(rs);
    });
    return () => {
      alive = false;
    };
  }, [user?.id]);

  const create = async () => {
    if (!target || creating) return;
    setCreating(true);
    setError(null);
    try {
      const r = await createQuietReportShare({
        sharedWithUid: target.id,
        sharedWithName: target.name,
        ttlDays: 7,
      });
      setShareUrl(absoluteShareUrl(r.url));
      setShareToken(r.token);
      setExpiresAt(r.expiresAt);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not create the share link.');
    } finally {
      setCreating(false);
    }
  };

  const copy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* fallthrough — most browsers will at least let them select & copy manually */
    }
  };

  const revoke = async () => {
    if (!shareToken) return;
    try {
      await revokeQuietReportShare(shareToken);
      setShareUrl(null);
      setShareToken(null);
      setExpiresAt(null);
      setError('Link revoked. Anyone with it will see "this link has been revoked."');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not revoke.');
    }
  };

  return (
    <div className="bk-screen">
      <BackHeader to="s19" center={<div className="bk-compose-step">Share this week's report</div>} />
      <div className="bk-share-body">
        {shareUrl ? (
          <>
            <div className="bk-share-title">Your link is ready.</div>
            <div className="bk-share-sub">
              Send this to {target?.name ?? 'them'} however you'd like. It expires in 7 days, and only the person
              with the link can open it.
            </div>

            <div className="bk-share-linkbox">
              <div className="bk-share-linkbox-url">{shareUrl}</div>
              <button className="bk-share-linkbox-copy" onClick={() => void copy()}>
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>

            {expiresAt ? (
              <div className="bk-share-expiry">
                Expires {new Date(expiresAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            ) : null}

            {error ? <div className="bk-modal-error" style={{ marginTop: 16 }}>{error}</div> : null}

            <div className="bk-share-revoke-row">
              <button className="bk-share-revoke" onClick={() => void revoke()}>
                Revoke link
              </button>
              <button className="bk-share-done" onClick={() => go('s19')}>
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bk-share-title">Who would you like to share this with?</div>
            <div className="bk-share-sub">
              This will create a private, time-limited, read-only link. You can revoke it any time.
            </div>

            <div className="bk-share-target-l">From your connections</div>

            {contacts.length === 0 ? (
              <div className="bk-share-target">
                <div className="bk-share-target-avatar">·</div>
                <div>
                  <div className="bk-share-target-name">No connections yet</div>
                  <div className="bk-share-target-role">Add someone in Connections first.</div>
                </div>
              </div>
            ) : (
              contacts.map((c) => (
                <button
                  key={c.id}
                  className={`bk-share-target ${target?.id === c.id ? 'selected' : ''}`}
                  onClick={() => setTarget(c)}
                >
                  <div className="bk-share-target-avatar">{c.name[0]?.toUpperCase() ?? '?'}</div>
                  <div>
                    <div className="bk-share-target-name">{c.name}</div>
                    <div className="bk-share-target-role">{c.role ?? 'A companion'}</div>
                  </div>
                </button>
              ))
            )}

            <div className="bk-share-controls">
              <div className="bk-share-control-row">
                <span className="bk-share-control-l">Access expires after</span>
                <span className="bk-share-control-v">7 days</span>
              </div>
              <div className="bk-share-control-row">
                <span className="bk-share-control-l">Read receipt</span>
                <span className="bk-share-control-v">Off</span>
              </div>
              <div className="bk-share-control-row">
                <span className="bk-share-control-l">Can download a copy</span>
                <span className="bk-share-control-v">No</span>
              </div>
            </div>

            <div className="bk-share-disclaimer">
              <strong>Important.</strong> This is a reflective journal summary, not a clinical assessment. If you are
              sharing this with a doctor or therapist, they should treat it as personal context — not as diagnostic
              information.
            </div>

            {error ? <div className="bk-modal-error" style={{ marginTop: 16 }}>{error}</div> : null}

            <button
              className="bk-share-cta"
              disabled={!target || creating}
              onClick={() => void create()}
            >
              {creating
                ? 'Creating your link…'
                : target
                  ? `Create a link for ${target.name}`
                  : 'Choose someone above'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
