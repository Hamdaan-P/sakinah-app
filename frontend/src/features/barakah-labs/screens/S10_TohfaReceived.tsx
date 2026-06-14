import { useEffect, useState } from 'react';
import { useBarakahFlow } from '../stores/barakah-flow.store';
import { useAuthStore } from '@/core/stores/auth.store';
import { HeartIcon } from '../components/icons';
import {
  markTohfaKept,
  subscribeToReceivedTohfas,
  type Tohfa,
} from '../services/tohfaService';
import { getPublicProfileByUid } from '@/features/public-profile/services/publicProfileService';

/**
 * Tohfa inbox surface. Lives outside /messages by design — Tohfas are a
 * separate gift channel, not a chat thread. The user sees the most recent
 * unkept Tohfa first; tapping "Keep this" flips `kept=true` and the next
 * unkept one (if any) takes its place.
 */
export function S10_TohfaReceived() {
  const go = useBarakahFlow((s) => s.go);
  const uid = useAuthStore((s) => s.user?.id ?? null);
  const [tohfas, setTohfas] = useState<Tohfa[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [senderName, setSenderName] = useState<string | null>(null);
  const [keeping, setKeeping] = useState(false);

  useEffect(() => {
    if (!uid) {
      setLoaded(true);
      return;
    }
    const unsub = subscribeToReceivedTohfas(uid, (list) => {
      setTohfas(list);
      setLoaded(true);
    });
    return () => unsub();
  }, [uid]);

  // Show the most-recent unkept Tohfa; fall back to the most recent overall.
  const active: Tohfa | null = tohfas.find((t) => !t.kept) ?? tohfas[0] ?? null;

  // Resolve sender name from public profile.
  useEffect(() => {
    if (!active) {
      setSenderName(null);
      return;
    }
    let alive = true;
    getPublicProfileByUid(active.senderId)
      .then((p) => {
        if (!alive) return;
        const name = p?.displayName?.trim() || p?.fullName?.trim() || 'a companion';
        setSenderName(name);
      })
      .catch(() => {
        if (alive) setSenderName('a companion');
      });
    return () => {
      alive = false;
    };
  }, [active]);

  const onKeep = async () => {
    if (!active || keeping) {
      go('s01');
      return;
    }
    setKeeping(true);
    try {
      if (!active.kept) {
        await markTohfaKept(active.id);
      }
    } catch {
      /* best-effort — proceed regardless */
    } finally {
      setKeeping(false);
      go('s01');
    }
  };

  return (
    <div className="bk-screen bk-receive">
      <div className="bk-receive-meta">
        <div className="bk-receive-prefix">A Tohfa arrived</div>
        <div className="bk-receive-from">
          {active ? (
            <>
              from <span>{senderName ?? '…'}</span> · {timeAgo(active.createdAt)}
            </>
          ) : (
            <>nothing yet</>
          )}
        </div>
      </div>

      <div className="bk-receive-body">
        <div className="bk-receive-letter">
          {!loaded
            ? 'Loading…'
            : active
              ? active.letter.split('\n').map((ln, i) => (
                  <span key={i}>
                    {ln}
                    <br />
                  </span>
                ))
              : (
                <>
                  No Tohfas yet.<br />
                  When someone sends you one, it'll land here.
                </>
              )}
        </div>
        {active?.noticing && (
          <div className="bk-receive-noticing">
            <div className="lbl">From a noticing</div>
            <div className="txt">{active.noticing}</div>
          </div>
        )}
      </div>

      <div className="bk-receive-actions">
        <button className="bk-keep-btn" onClick={onKeep} disabled={keeping}>
          <HeartIcon /> {keeping ? 'Keeping…' : 'Keep this'}
        </button>
        <div className="bk-receive-note">No response is expected. Sit with it as long as you'd like.</div>
      </div>
    </div>
  );
}

function timeAgo(ms: number): string {
  if (!ms) return 'just now';
  const diff = Date.now() - ms;
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
