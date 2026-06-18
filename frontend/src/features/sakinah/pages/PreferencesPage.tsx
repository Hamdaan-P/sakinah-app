/**
 * PreferencesPage — /sakinah/preferences
 * Private: feeds the matching algorithm only. Never shown to a match.
 * 8 sections, one at a time. Nothing is mandatory. All answers stay between the user and Raya.
 */

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { savePreferences, computePool } from '../services/sakinahService';
import { motion, AnimatePresence } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Prefs {
  ageMin: number; ageMax: number;
  heightImportant: boolean; heightCm: number;
  priorMarriage: string; childrenFromPrev: string;
  dailySalah: string; quranRelationship: string; hijabModestDress: string;
  lifestyle: string[];
  educationLevel: string; career: string; financialStability: string; incomeDifference: string;
  geographicRange: string; relocation: string; livingArrangement: string; motherTongue: string;
  children: string; parentingApproach: string; familyCloseness: string;
  emotionalStyle: string; humour: string; conflictResolution: string;
  diet: string; sharedInterests: string[]; socialMedia: string;
  hardLines: string[]; polygynyStance: string; decisionTimeline: string; finalNote: string;
}

const INIT: Prefs = {
  ageMin: 24, ageMax: 34, heightImportant: true, heightCm: 165,
  priorMarriage: '', childrenFromPrev: '',
  dailySalah: '', quranRelationship: '', hijabModestDress: '', lifestyle: [],
  educationLevel: '', career: '', financialStability: '', incomeDifference: '',
  geographicRange: '', relocation: '', livingArrangement: '', motherTongue: '',
  children: '', parentingApproach: '', familyCloseness: '',
  emotionalStyle: '', humour: '', conflictResolution: '',
  diet: '', sharedInterests: [], socialMedia: '',
  hardLines: [], polygynyStance: '', decisionTimeline: '', finalNote: '',
};

const SECTION_META = [
  { title: 'The basics',                eyebrow: 'Basic preferences'         },
  { title: 'Faith & practice',          eyebrow: 'Deen & practice'           },
  { title: 'Work & provision',          eyebrow: 'Education & career'        },
  { title: 'Home & roots',              eyebrow: 'Location & roots'          },
  { title: 'Family life',               eyebrow: 'Family & children'         },
  { title: 'Character & personality',   eyebrow: 'Who they are'              },
  { title: 'Everyday life',             eyebrow: 'Lifestyle & home'          },
  { title: 'Your lines and your heart', eyebrow: 'Dealbreakers & final note' },
];

const RAYA_HELP = [
  {
    id: 'r1',
    icon: '☉',
    label: 'Help me with this question',
    reply:
      "There's no wrong answer here — just honest ones. Think about what has mattered most in your past or what you imagine your daily life together looking like. That feeling is your answer.",
  },
  {
    id: 'r2',
    icon: '?',
    label: 'Why does Raya ask this?',
    reply:
      "These questions help me find someone whose life rhythms match yours — not to judge anyone's choices. You describe what you want; I never use this to exclude unfairly.",
  },
  {
    id: 'r3',
    icon: '⌥',
    label: 'Let me just speak instead',
    reply:
      "Please do — talking is easier than typing. Speak in Urdu, Hindi, Tamil or English. I'll reflect it back so you know you were understood. 🎙 Listening…",
  },
  {
    id: 'r4',
    icon: '◷',
    label: 'I just need a moment',
    reply:
      "Take all the time you need. Your progress is saved — close this and come back tomorrow. The path waits for you, calmly.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Local UI atoms
// ─────────────────────────────────────────────────────────────────────────────

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="sk-pref-chip"
      style={{
        padding: '7px 15px', borderRadius: 30, cursor: 'pointer',
        border: `1px solid ${selected ? 'rgba(212,168,83,.5)' : 'rgba(255,255,255,.1)'}`,
        background: selected ? 'rgba(212,168,83,.09)' : 'rgba(255,255,255,.03)',
        color: selected ? '#e7c984' : '#9aa0ac',
        fontSize: 13, fontFamily: "'Manrope', sans-serif",
        fontWeight: selected ? 500 : 400,
        transition: 'all .15s', letterSpacing: '0.01em',
      }}
    >
      {label}
    </button>
  );
}

function Chips({
  options, value, onChange,
}: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => (
        <Chip key={o} label={o} selected={value === o}
          onClick={() => onChange(value === o ? '' : o)} />
      ))}
    </div>
  );
}

function MultiChips({
  options, values, onChange,
}: { options: string[]; values: string[]; onChange: (v: string[]) => void }) {
  const toggle = (o: string) =>
    values.includes(o) ? onChange(values.filter(x => x !== o)) : onChange([...values, o]);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => (
        <Chip key={o} label={o} selected={values.includes(o)} onClick={() => toggle(o)} />
      ))}
    </div>
  );
}

function Q({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: '#5f6675', marginBottom: 10,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function RayaNote({ text }: { text: string }) {
  return (
    <div style={{
      display: 'flex', gap: 11, alignItems: 'flex-start',
      padding: '13px 15px',
      background: 'rgba(212,168,83,.03)',
      border: '1px solid rgba(212,168,83,.1)',
      borderRadius: 14, marginBottom: 24,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: '#3a2c0c',
        marginTop: 1,
      }}>
        ر
      </div>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
        fontSize: 15, color: '#EDE7DA', lineHeight: 1.5, margin: 0,
      }}>
        {text}
      </p>
    </div>
  );
}

function AgeSlider({
  min, max, onChange,
}: { min: number; max: number; onChange: (lo: number, hi: number) => void }) {
  const LO = 18; const HI = 65;
  const pct = (v: number) => ((v - LO) / (HI - LO)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 16 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#EDE7DA' }}>{min} yrs</span>
        <span style={{ color: '#5f6675', fontSize: 11 }}>to</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#EDE7DA' }}>{max} yrs</span>
      </div>
      <div style={{ position: 'relative', height: 28, margin: '0 6px' }}>
        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0, right: 0, height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: `${pct(min)}%`, right: `${100 - pct(max)}%`, height: 4, background: 'linear-gradient(to right, #c8943c, #D4A853)', borderRadius: 2, transition: 'left .04s, right .04s', pointerEvents: 'none' }} />
        <input type="range" className="sk-range" min={LO} max={HI} value={min}
          onChange={e => onChange(Math.min(+e.target.value, max - 1), max)} />
        <input type="range" className="sk-range" min={LO} max={HI} value={max}
          onChange={e => onChange(min, Math.max(+e.target.value, min + 1))} />
      </div>
    </div>
  );
}

function HeightSlider({
  value, important, onValue, onImportant,
}: { value: number; important: boolean; onValue: (v: number) => void; onImportant: (v: boolean) => void }) {
  const LO = 140; const HI = 200;
  const pct = ((value - LO) / (HI - LO)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{
          fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace",
          color: important ? '#EDE7DA' : '#5f6675', transition: 'color .2s',
        }}>
          {value} cm
        </span>
        <button type="button" onClick={() => onImportant(!important)} style={{
          fontSize: 11.5, padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
          border: `1px solid ${!important ? 'rgba(212,168,83,.45)' : 'rgba(255,255,255,.1)'}`,
          background: !important ? 'rgba(212,168,83,.08)' : 'transparent',
          color: !important ? '#e7c984' : '#5f6675',
          fontFamily: "'Manrope', sans-serif", transition: 'all .15s',
        }}>
          Not important
        </button>
      </div>
      <div style={{ position: 'relative', height: 28, margin: '0 6px', opacity: important ? 1 : 0.3, transition: 'opacity .2s' }}>
        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0, right: 0, height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0, width: `${pct}%`, height: 4, background: '#D4A853', borderRadius: 2, transition: 'width .04s', pointerEvents: 'none' }} />
        <input type="range" className="sk-range" min={LO} max={HI} value={value}
          onChange={e => { if (important) onValue(+e.target.value); }}
          style={{ pointerEvents: important ? undefined : 'none' }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function PreferencesPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState(0);
  const [prefs, setPrefs] = useState<Prefs>(INIT);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [section]);

  function set<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    setPrefs(prev => ({ ...prev, [key]: value }));
  }

  const [rayaOpen, setRayaOpen] = useState(false);
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  function openRaya() { setActiveHelp(null); setRayaOpen(true); }
  function toggleHelp(id: string) { setActiveHelp(prev => prev === id ? null : id); }

  const isLast = section === 7;
  const goBack = () => setSection(s => s - 1);
  const advance = () => {
    if (isLast) {
      savePreferences(prefs as unknown as Record<string, unknown>)
        .then(() => computePool().catch(() => {}))
        .catch((err) => console.error('savePreferences failed:', err));
      navigate('/sakinah');
    } else {
      setSection(s => s + 1);
    }
  };
  const meta = SECTION_META[section];

  function sectionBody(): ReactNode {
    switch (section) {

      case 0: return (
        <>
          <RayaNote text="These are yours alone. They help Raya find people who genuinely fit — they are never shown to anyone you meet." />
          <Q label="Age range">
            <AgeSlider min={prefs.ageMin} max={prefs.ageMax}
              onChange={(lo, hi) => setPrefs(p => ({ ...p, ageMin: lo, ageMax: hi }))} />
          </Q>
          <Q label="Height preference">
            <HeightSlider value={prefs.heightCm} important={prefs.heightImportant}
              onValue={v => set('heightCm', v)} onImportant={v => set('heightImportant', v)} />
          </Q>

          <Q label="Prior marriage">
            <Chips options={['Never married only', 'Open to divorced', 'Open to widowed', 'Open to all']}
              value={prefs.priorMarriage} onChange={v => set('priorMarriage', v)} />
          </Q>
          <Q label="Children from previous marriage">
            <Chips options={['Prefer no', 'Open to it', 'Not important']}
              value={prefs.childrenFromPrev} onChange={v => set('childrenFromPrev', v)} />
          </Q>
        </>
      );

      case 1: return (
        <>
          <RayaNote text="You describe what matters to you — never what disqualifies someone." />
          <Q label="Daily salah">
            <Chips options={['All 5 consistently', 'Most days', 'Growing in practice', 'Not important to me']}
              value={prefs.dailySalah} onChange={v => set('dailySalah', v)} />
          </Q>
          <Q label="Quran relationship">
            <Chips options={['Memorised portions', 'Regular recitation', 'Learning', 'Not important']}
              value={prefs.quranRelationship} onChange={v => set('quranRelationship', v)} />
          </Q>
          <Q label="Hijab & modest dress">
            <Chips options={['Important to me', 'Preferred', 'Not important']}
              value={prefs.hijabModestDress} onChange={v => set('hijabModestDress', v)} />
          </Q>
          <Q label="Lifestyle — select all that matter">
            <MultiChips options={['No smoking', 'No alcohol', 'Halal food strictly', 'Not important']}
              values={prefs.lifestyle} onChange={v => set('lifestyle', v)} />
          </Q>
        </>
      );

      case 2: return (
        <>
          <Q label="Education level">
            <Chips options={['Secondary', 'Undergraduate', 'Postgraduate', 'Not important']}
              value={prefs.educationLevel} onChange={v => set('educationLevel', v)} />
          </Q>
          <Q label="Career">
            <Chips options={['I prefer she works', 'I prefer she focuses on home', 'Either works for me']}
              value={prefs.career} onChange={v => set('career', v)} />
          </Q>
          <Q label="Financial stability">
            <Chips options={['Very important', 'Somewhat important', 'Not important']}
              value={prefs.financialStability} onChange={v => set('financialStability', v)} />
          </Q>
          <Q label="Income difference">
            <Chips options={['I prefer similar levels', 'Open to any difference', 'Not important']}
              value={prefs.incomeDifference} onChange={v => set('incomeDifference', v)} />
          </Q>
        </>
      );

      case 3: return (
        <>
          <Q label="Geographic range">
            <Chips options={['Same city', 'Same country', 'Open to anywhere']}
              value={prefs.geographicRange} onChange={v => set('geographicRange', v)} />
          </Q>
          <Q label="Relocation">
            <Chips options={['I can relocate', 'I cannot relocate', 'Open to discussion']}
              value={prefs.relocation} onChange={v => set('relocation', v)} />
          </Q>
          <Q label="Living arrangement">
            <Chips options={['Independent home', 'Open to joint family', 'Either works']}
              value={prefs.livingArrangement} onChange={v => set('livingArrangement', v)} />
          </Q>
          <Q label="Mother tongue">
            <Chips options={['Same language important', 'Not important']}
              value={prefs.motherTongue} onChange={v => set('motherTongue', v)} />
          </Q>
        </>
      );

      case 4: return (
        <>
          <Q label="Children">
            <Chips options={['Yes, I want children', 'Open to it', 'Not sure yet', 'No']}
              value={prefs.children} onChange={v => set('children', v)} />
          </Q>
          <Q label="Parenting approach">
            <Chips options={['Strong Islamic foundation', 'Balanced approach', 'Either works']}
              value={prefs.parentingApproach} onChange={v => set('parentingApproach', v)} />
          </Q>
          <Q label="Family closeness">
            <Chips options={['Very close-knit', 'Moderately close', 'Independent style']}
              value={prefs.familyCloseness} onChange={v => set('familyCloseness', v)} />
          </Q>

        </>
      );

      case 5: return (
        <>
          <Q label="Emotional style">
            <Chips options={['Expressive', 'Reserved', 'In between']}
              value={prefs.emotionalStyle} onChange={v => set('emotionalStyle', v)} />
          </Q>
          <Q label="Humour">
            <Chips options={['Important to me', 'Nice to have', 'Not important']}
              value={prefs.humour} onChange={v => set('humour', v)} />
          </Q>
          <Q label="Conflict resolution">
            <Chips options={['Talk it out immediately', 'Need time first', 'Either']}
              value={prefs.conflictResolution} onChange={v => set('conflictResolution', v)} />
          </Q>
        </>
      );

      case 6: return (
        <>
          <Q label="Diet">
            <Chips options={['Strictly halal', 'Halal where possible', 'Not important']}
              value={prefs.diet} onChange={v => set('diet', v)} />
          </Q>
          <Q label="Shared interests — select all that resonate">
            <MultiChips
              options={['Reading', 'Travel', 'Cooking', 'Sports', 'Arts', 'Nature', 'Community work', 'Islamic study']}
              values={prefs.sharedInterests} onChange={v => set('sharedInterests', v)} />
          </Q>
          <Q label="Social media use">
            <Chips options={['Minimal use', 'Moderate', 'Not important to me']}
              value={prefs.socialMedia} onChange={v => set('socialMedia', v)} />
          </Q>

        </>
      );

      case 7: return (
        <>
          <RayaNote text="These are completely private. They help Raya protect your time — no one will ever see them." />
          <Q label="Hard lines — between you and Raya only">
            <MultiChips
              options={['Smoking', 'Alcohol', 'No intention of children', 'Not practising', 'Significant age gap', 'Relocation required', 'Joint family required']}
              values={prefs.hardLines} onChange={v => set('hardLines', v)} />
          </Q>
          <Q label="Polygyny stance">
            <Chips options={['Not open to it', 'Open to discussion', 'Preferred']}
              value={prefs.polygynyStance} onChange={v => set('polygynyStance', v)} />
          </Q>
          <Q label="Decision timeline">
            <Chips options={['Within 6 months', 'Within a year', 'When it feels right', 'No timeline']}
              value={prefs.decisionTimeline} onChange={v => set('decisionTimeline', v)} />
          </Q>
          <Q label="One thing you want matches to know about you">
            <div>
              <textarea
                className="sk-msg-input"
                placeholder="Not a sales pitch — just one true thing."
                maxLength={150}
                value={prefs.finalNote}
                onChange={e => set('finalNote', e.target.value)}
                rows={3}
                style={{
                  width: '100%', resize: 'none', boxSizing: 'border-box',
                  fontFamily: "'Manrope', sans-serif", fontSize: 14,
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 14, color: '#EDE7DA', outline: 'none', display: 'block',
                }}
              />
              <div style={{ fontSize: 10.5, color: '#5f6675', textAlign: 'right', marginTop: 5 }}>
                {prefs.finalNote.length} / 150
              </div>
            </div>
          </Q>
        </>
      );

      default: return null;
    }
  }

  return (
    <div style={{
      display: 'flex', height: '100vh', background: PAGE_BG,
      color: '#EDE7DA', fontFamily: "'Manrope', sans-serif",
      WebkitFontSmoothing: 'antialiased', overflow: 'hidden',
    }}>
      <SakinahSidebar activeItem="preferences" />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0, position: 'relative' }}>

        {/* ── Header ── */}
        <div style={{ flexShrink: 0, padding: '24px 56px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          {/* Progress bar */}
          <div style={{ height: 2, background: 'rgba(212,168,83,.1)', borderRadius: 1, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{
              height: '100%',
              width: `${((section + 1) / 8) * 100}%`,
              background: 'linear-gradient(to right, #c8943c, #D4A853)',
              borderRadius: 1, transition: 'width .4s ease',
            }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 20 }}>
            <div>
              <div style={{
                fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'rgba(212,168,83,.55)', marginBottom: 5,
              }}>
                {meta.eyebrow}
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500 }}>
                {meta.title}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                fontSize: 10.5, color: '#5f6675',
                fontFamily: "'JetBrains Mono', monospace", paddingBottom: 2,
              }}>
                {section + 1} / 8
              </div>
              <div
                onClick={openRaya}
                style={{
                  width: 38, height: 38, borderRadius: '50%', cursor: 'pointer',
                  background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 20,
                  color: '#3a2c0c', boxShadow: '0 4px 14px rgba(212,168,83,.3)',
                  flexShrink: 0, transition: 'transform .2s',
                }}
                title="Ask Raya"
              >
                ر
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div ref={bodyRef} className="sk-page-body" style={{ flex: 1, overflowY: 'auto', padding: '28px 56px 0' }}>
          <div style={{ maxWidth: 560, width: '100%' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.2 }}
              >
                {sectionBody()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          flexShrink: 0, padding: '16px 56px 28px',
          borderTop: '1px solid rgba(255,255,255,.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            {section > 0 && (
              <button
                type="button"
                onClick={goBack}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,.15)',
                  color: '#9aa0ac', fontSize: 13.5, cursor: 'pointer',
                  fontFamily: "'Manrope', sans-serif", fontWeight: 500,
                  padding: '9px 18px', borderRadius: 10,
                  letterSpacing: '0.02em',
                }}
              >
                ← Previous
              </button>
            )}
            <button
              type="button"
              onClick={advance}
              style={{
                background: 'none', border: 'none',
                color: '#5f6675', fontSize: 12.5, cursor: 'pointer',
                fontFamily: "'Manrope', sans-serif", padding: '6px 0',
                letterSpacing: '0.02em',
              }}
            >
              Skip this section
            </button>
          </div>
          <button
            type="button"
            onClick={advance}
            className="sk-btn-gold"
            style={{
              padding: '13px 28px', borderRadius: 14, border: 'none', cursor: 'pointer',
              fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 14,
              letterSpacing: '0.3px',
              background: 'linear-gradient(135deg, #D4A853, #b98b39)',
              color: '#0a0e15',
            }}
          >
            {isLast ? 'Save — see who Raya found →' : 'Continue →'}
          </button>
        </div>

        {/* ── Raya scrim ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {rayaOpen && (
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRayaOpen(false)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(5,7,11,.6)',
                zIndex: 90,
                backdropFilter: 'blur(2px)',
              }}
            />
          )}
        </AnimatePresence>

        {/* ── Raya bottom sheet ─────────────────────────────────────────── */}
        <AnimatePresence>
          {rayaOpen && (
            <motion.div
              key="sheet"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              exit={{ y: '110%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 95,
                background: 'linear-gradient(180deg, #141b29, #0f1521)',
                borderTop: '1px solid rgba(212,168,83,.16)',
                borderRadius: '26px 26px 0 0',
                padding: '20px 20px 28px',
                maxHeight: '76%',
                overflowY: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              <div style={{ width: 38, height: 4, borderRadius: 4, background: 'rgba(212,168,83,.16)', margin: '0 auto 14px' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                <div
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Cormorant Garamond', serif", fontSize: 19,
                    color: '#3a2c0c', flexShrink: 0,
                  }}
                >
                  ر
                </div>
                <div>
                  <b style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, display: 'block' }}>
                    Raya
                  </b>
                  <span style={{ fontSize: 10, color: '#7FB07A', letterSpacing: '0.04em' }}>
                    ● always here to help
                  </span>
                </div>
                <button
                  onClick={() => setRayaOpen(false)}
                  style={{
                    marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                    color: '#6b7280', fontSize: 22, lineHeight: 1,
                    minWidth: 44, minHeight: 44, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8, flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
                  aria-label="Close Raya panel"
                >
                  ×
                </button>
              </div>

              <p style={{ fontSize: 12.5, color: '#9aa0ac', fontWeight: 300, lineHeight: 1.6, marginBottom: 14 }}>
                Salaam. Stuck on a question, unsure how to answer, or just want to talk it through — I'm right here.
              </p>

              {RAYA_HELP.map((item) => (
                <div key={item.id}>
                  <div
                    onClick={() => toggleHelp(item.id)}
                    style={{
                      border: '1px solid rgba(255,255,255,.06)',
                      borderRadius: 13, padding: '12px 14px', marginBottom: 8,
                      fontSize: 12.5, cursor: 'pointer', display: 'flex',
                      alignItems: 'center', gap: 11, color: '#EDE7DA',
                      transition: 'border-color .2s',
                    }}
                  >
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", color: '#D4A853', fontSize: 16, flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                  <AnimatePresence>
                    {activeHelp === item.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          fontSize: 12.5, color: '#EDE7DA', fontWeight: 300, lineHeight: 1.6,
                          borderLeft: '2px solid #D4A853', padding: '4px 0 4px 13px', marginBottom: 14,
                        }}>
                          {item.reply}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

export default PreferencesPage;
