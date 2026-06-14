import { useBarakahFlow, type Heart } from '../stores/barakah-flow.store';
import { BackHeader } from '../components/Greet';
import { useAuthStore } from '@/core/stores/auth.store';
import { saveHeart } from '../services/heartCheckinService';

// S15_Heavy was removed 2026-05-23. Heavy/numb hearts now go through the
// normal flow — Raya layers a heart_state='heavy' overlay when chatting
// (see prompt_builder/_builders.py and zaryah-brain/projects/doors-redesign-2026.md).
type Next = 's01' | 's03';

const OPTS: { label: Heart }[] = [
  { label: 'still' },
  { label: 'tender' },
  { label: 'heavy' },
  { label: 'bright' },
  { label: 'restless' },
  { label: 'numb' },
];

export function S02_HeartCheckIn() {
  const go = useBarakahFlow((s) => s.go);
  const setHeart = useBarakahFlow((s) => s.setHeart);
  const pendingIntent = useBarakahFlow((s) => s.pendingIntent);
  const setPendingIntent = useBarakahFlow((s) => s.setPendingIntent);
  const uid = useAuthStore((s) => s.user?.id);

  // If the user was intercepted en-route to "Notice a blessing", honor that
  // intent regardless of which heart they pick. Otherwise go back to S01.
  const resolveNext = (): Next => (pendingIntent === 'blessing' ? 's03' : 's01');

  const pick = (heart: Heart) => {
    setHeart(heart);
    if (uid) {
      void saveHeart(uid, heart).catch(() => {
        /* offline — flow store keeps it locally; next online save will overwrite */
      });
    }
    const next = resolveNext();
    setPendingIntent(null);
    go(next);
  };

  const skip = () => {
    // Skip doesn't satisfy the heart-freshness gate, but we should still
    // clear any intent so the user isn't trapped in an intercepted state.
    setPendingIntent(null);
    go('s01');
  };

  return (
    <div className="bk-screen">
      <BackHeader to="s01" />
      <div className="bk-heart-expand">
        <div className="bk-heart-q">How is your heart today?</div>
        <div className="bk-heart-sub">No score. Just a word.</div>
        <div className="bk-heart-grid">
          {OPTS.map((o) => (
            <button
              key={o.label}
              className="bk-heart-opt"
              onClick={() => pick(o.label)}
            >
              {o.label[0].toUpperCase() + o.label.slice(1)}
            </button>
          ))}
        </div>
        <button className="bk-heart-skip" onClick={skip}>Skip for now</button>
      </div>
    </div>
  );
}
