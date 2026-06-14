/**
 * S13_TafakkurEnd — what came to you after the sit.
 *
 * Cleaned 2026-05-23 to share the bk-door-action button row used by S06
 * (Trials / Fear / Dua / Action doors) so post-sit choices read with the
 * same visual language as post-door choices. Three clear paths:
 *
 *   - Talk to Raya  → primary gold. Goes to S14 with the reflection so
 *                     Raya opens already knowing what came up.
 *   - Save to trail → secondary. Finalizes the sit + lands on home.
 *   - Just rest     → tertiary. Same finalization, lighter framing for
 *                     when the user wrote nothing or doesn't want to keep
 *                     anything in particular.
 */
import { useBarakahFlow, type Screen } from '../stores/barakah-flow.store';
import { BackHeader } from '../components/Greet';
import { useAuthStore } from '@/core/stores/auth.store';
import { endSession } from '../services/tafakkurService';

export function S13_TafakkurEnd() {
  const go = useBarakahFlow((s) => s.go);
  const reflection = useBarakahFlow((s) => s.tafReflection);
  const setReflection = useBarakahFlow((s) => s.setTafReflection);
  const sessionId = useBarakahFlow((s) => s.tafSessionId);
  const endedNaturally = useBarakahFlow((s) => s.tafSessionEndedNaturally);
  const setSession = useBarakahFlow((s) => s.setTafSession);
  const uid = useAuthStore((s) => s.user?.id);

  const finish = async (next: Screen) => {
    if (uid && sessionId) {
      try {
        await endSession(uid, sessionId, reflection, endedNaturally);
      } catch {
        /* leave it — partial session is acceptable, can be reconciled later */
      }
      setSession(null);
    }
    go(next);
  };

  const hasReflection = reflection.trim().length > 0;

  return (
    <div className="bk-screen">
      <BackHeader to="s11" />

      <div className="bk-taf-end-body">
        <div className="bk-taf-end-q">What came to you?</div>
        <div className="bk-taf-end-area">
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="No pressure to write. A word, a sentence, or nothing — all are fine."
          />
        </div>
      </div>

      <div className="bk-door-actions-row">
        <button
          type="button"
          className="bk-door-action bk-door-action-private"
          onClick={() => void finish('s01')}
        >
          Just rest
          <span className="bk-door-action-sub">close without keeping it</span>
        </button>
        <button
          type="button"
          className="bk-door-action bk-door-action-public"
          onClick={() => void finish('s01')}
          disabled={!hasReflection}
        >
          Save to trail
          <span className="bk-door-action-sub">
            {hasReflection ? 'keep what came to you' : 'write a little first'}
          </span>
        </button>
        <button
          type="button"
          className="bk-door-action bk-door-action-raya"
          onClick={() => void finish('s14')}
        >
          Talk to Raya →
          <span className="bk-door-action-sub">go deeper together</span>
        </button>
      </div>

      <div className="bk-compose-helper">
        {hasReflection
          ? 'Whatever you choose, the sit is complete.'
          : 'You can leave the field empty. The sit is yours.'}
      </div>
    </div>
  );
}
