import { useEffect, useState } from 'react';
import { useBarakahFlow, type TafSeed } from '../stores/barakah-flow.store';
import { BackHeader } from '../components/Greet';
import { useAuthStore } from '@/core/stores/auth.store';
import { startSession } from '../services/tafakkurService';
import { fetchTafakkurSeeds } from '../services/rayaService';

const FALLBACK_SEEDS: TafSeed[] = [
  {
    context: 'A small steady thread.',
    prompt: 'What in this week wants to be named?',
  },
  {
    context: 'A theme worth sitting with.',
    prompt: 'What did Allah show you today that you almost missed?',
  },
  {
    context: 'When the noticings get quieter.',
    prompt: "What's underneath the quiet?",
  },
];

const DURATIONS: (3 | 7 | 15)[] = [3, 7, 15];

export function S11_TafakkurEntry() {
  const go = useBarakahFlow((s) => s.go);
  const duration = useBarakahFlow((s) => s.tafDuration);
  const setDuration = useBarakahFlow((s) => s.setTafDuration);
  const seed = useBarakahFlow((s) => s.tafSeed);
  const setSeed = useBarakahFlow((s) => s.setTafSeed);
  const setTafSession = useBarakahFlow((s) => s.setTafSession);
  const setTafSessionEndedNaturally = useBarakahFlow((s) => s.setTafSessionEndedNaturally);
  const door = useBarakahFlow((s) => s.door);
  const noticing = useBarakahFlow((s) => s.noticing);
  const uid = useAuthStore((s) => s.user?.id);

  // Silence-door entry: the user just picked "Into silence" with a noticing
  // they want to sit with. Skip the seed picker entirely — their noticing
  // IS the seed. Duration picker is still shown so they can choose 3/7/15.
  const fromSilenceDoor = door === 'silence' && noticing.trim().length > 0;

  const [ownSeed, setOwnSeed] = useState<string>('');
  const [editing, setEditing] = useState<boolean>(false);
  const [seeds, setSeeds] = useState<TafSeed[]>(FALLBACK_SEEDS);
  const [loadingSeeds, setLoadingSeeds] = useState<boolean>(false);

  // Silence-door auto-seed: set tafSeed from the noticing once on entry.
  // Effect re-runs if the user backs out and comes in with a different door
  // or noticing. Idempotent — overwriting tafSeed is harmless.
  useEffect(() => {
    if (!fromSilenceDoor) return;
    setSeed({
      context: 'A noticing you wanted to sit with.',
      prompt: noticing.trim(),
    });
  }, [fromSilenceDoor, noticing, setSeed]);

  useEffect(() => {
    if (!uid) return;
    if (fromSilenceDoor) return; // skip the network round-trip — we don't show seeds in this mode
    let alive = true;
    setLoadingSeeds(true);
    void fetchTafakkurSeeds(uid)
      .then((rs) => {
        if (!alive) return;
        if (rs.length > 0) setSeeds(rs);
      })
      .catch(() => {
        /* keep fallback seeds */
      })
      .finally(() => {
        if (alive) setLoadingSeeds(false);
      });
    return () => {
      alive = false;
    };
  }, [uid, fromSilenceDoor]);

  const begin = async () => {
    setTafSessionEndedNaturally(false);
    if (uid) {
      try {
        const id = await startSession(uid, duration, seed);
        setTafSession(id);
      } catch {
        setTafSession(null);
      }
    }
    go('s12');
  };

  return (
    <div className="bk-screen">
      <BackHeader to={fromSilenceDoor ? 's05' : 's01'} />
      <div className="bk-taf-entry">
        <div className="bk-taf-eyebrow">تَفَكُّر</div>
        <div className="bk-taf-en">Tafakkur · Islamic contemplation</div>
        <div className="bk-taf-intro">
          {fromSilenceDoor
            ? 'You chose the Silence door. Sit with what you noticed. No writing. No visible timer.'
            : 'A time to sit with something. No writing. No visible timer. Just you, and what comes.'}
        </div>

        <div className="bk-taf-durations">
          {DURATIONS.map((d) => (
            <button
              key={d}
              className={`bk-taf-dur ${duration === d ? 'selected' : ''}`}
              onClick={() => setDuration(d)}
            >
              <div className="n">{d}</div>
              <div className="u">minutes</div>
            </button>
          ))}
        </div>

        {fromSilenceDoor ? (
          <div className="bk-taf-proposed">
            <div className="bk-taf-proposed-label">What you&apos;re sitting with</div>
            <div className="bk-taf-seed-card selected" aria-readonly="true">
              <div className="seed-context">A noticing you wanted to sit with.</div>
              <div className="seed-prompt">&ldquo;{noticing.trim()}&rdquo;</div>
            </div>
          </div>
        ) : (
          <>
            <div className="bk-taf-proposed">
              <div className="bk-taf-proposed-label">
                {loadingSeeds ? 'Raya is drawing from your week…' : 'Raya offers · drawn from your week'}
              </div>
              {seeds.map((s, i) => (
                <button
                  key={i}
                  className={`bk-taf-seed-card ${seed?.prompt === s.prompt ? 'selected' : ''}`}
                  onClick={() => {
                    setSeed(s);
                    setEditing(false);
                  }}
                >
                  <div className="seed-context">{s.context}</div>
                  <div className="seed-prompt">&ldquo;{s.prompt}&rdquo;</div>
                </button>
              ))}
            </div>

            {editing ? (
              <div style={{ width: '100%', marginBottom: 16 }}>
                <textarea
                  value={ownSeed}
                  onChange={(e) => setOwnSeed(e.target.value)}
                  placeholder="What do you want to sit with?"
                  style={{
                    width: '100%',
                    minHeight: 70,
                    padding: 12,
                    borderRadius: 12,
                    background: 'rgba(245,232,199,0.025)',
                    border: '1px solid var(--bk-rule)',
                    color: 'var(--bk-ink)',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 16,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  onBlur={() => {
                    if (ownSeed.trim()) {
                      setSeed({ context: 'A seed of your own.', prompt: ownSeed.trim() });
                    }
                  }}
                />
              </div>
            ) : (
              <button className="bk-taf-own-seed" onClick={() => setEditing(true)}>
                + Or write your own seed
              </button>
            )}
          </>
        )}

        <button className="bk-taf-start" onClick={begin}>Begin</button>
      </div>
    </div>
  );
}
