import { useEffect, useState } from 'react';
import { useBarakahFlow } from '../stores/barakah-flow.store';
import { BackHeader } from '../components/Greet';
import { CheckIcon } from '../components/icons';
import { useAuthStore } from '@/core/stores/auth.store';
import { getResearchConsent, setResearchConsent } from '../services/researchConsentService';

const PROMISES = [
  {
    bold: 'Aggregated only.',
    rest: ' Your actual words are never shared. Only patterns — frequency, texture, themes.',
  },
  {
    bold: 'Anonymous.',
    rest: ' Your name, contacts, and identifiable details never leave the app.',
  },
  {
    bold: 'Revocable.',
    rest: ' You can withdraw at any time. Past contributions will be removed.',
  },
  {
    bold: 'Never sold.',
    rest: ' Data is shared only with named academic partners under written agreement. No commercial use.',
  },
];

export function S21_Research() {
  const on = useBarakahFlow((s) => s.researchOptIn);
  const setOn = useBarakahFlow((s) => s.setResearchOptIn);
  const uid = useAuthStore((s) => s.user?.id);
  const [saving, setSaving] = useState(false);

  // Hydrate from Firestore on mount so the toggle reflects the true server value
  // (and not a stale localStorage cache from another device).
  useEffect(() => {
    if (!uid) return;
    let alive = true;
    void getResearchConsent(uid)
      .then((v) => {
        if (alive) setOn(v);
      })
      .catch(() => {
        /* keep local cache */
      });
    return () => {
      alive = false;
    };
  }, [uid, setOn]);

  const toggle = async () => {
    const next = !on;
    setOn(next);
    if (uid && !saving) {
      setSaving(true);
      try {
        await setResearchConsent(uid, next);
      } catch {
        // Revert local state on failure
        setOn(!next);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="bk-screen bk-research">
      <BackHeader to="s19" center={<div className="bk-compose-step">Contribute to research</div>} />
      <div className="bk-research-body">
        <div className="bk-research-title">Help build the first dataset of Muslim inner life.</div>
        <div className="bk-research-sub">
          There is almost no peer-reviewed data on Muslim mental wellbeing, especially in India. Your week of
          reflection — anonymised and aggregated — could quietly help change that.
        </div>

        <div className="bk-research-partner">
          <div className="l">Research partner</div>
          <div className="n">Jamia Millia Islamia · Dept. of Psychology</div>
          <div className="m">Ethics-approved study on faith-aligned wellbeing in Indian Muslim populations. Pending IRB renewal · 2026.</div>
        </div>

        <div className="bk-research-promise">
          {PROMISES.map((p, i) => (
            <div key={i} className="bk-research-promise-row">
              <div className="bk-research-promise-icon"><CheckIcon /></div>
              <div className="bk-research-promise-t">
                <strong>{p.bold}</strong>{p.rest}
              </div>
            </div>
          ))}
        </div>

        <div className="bk-research-toggle-row">
          <button
            className={`bk-research-toggle ${on ? 'on' : ''}`}
            onClick={toggle}
            disabled={saving}
            aria-pressed={on}
            aria-label="Contribute anonymously"
          />
          <div className="bk-research-toggle-text">
            <div className="t">Contribute anonymously</div>
            <div className="m">{on ? 'On · thank you for helping. Revoke any time.' : 'Off · you can change this any time'}</div>
          </div>
        </div>

        <div className="bk-research-fine">
          Your participation is optional and does not affect your use of Barakah Labs.{' '}
          <button type="button" style={{ background: 'transparent', border: 0, padding: 0, color: 'var(--bk-gold)', borderBottom: '1px solid rgba(212,168,83,0.3)', cursor: 'pointer', font: 'inherit' }}>
            Read the full consent form →
          </button>
        </div>
      </div>
    </div>
  );
}
