/**
 * QuranTestPage
 * Unified HifzTestEngine UI. Handles 5 test types:
 *  - voice           : Web/native ASR transcribes user recitation, fuzzy-compared
 *  - find-next-ayah  : 4 ayah choices, pick the one that follows the prompt
 *  - ayah-ordering   : drag-sort shuffled ayahs into correct order
 *  - tajweed-check   : self-rate pronunciation against reference audio
 *  - record-and-check: record yourself, A/B vs reference reciter
 *
 * All share the same HifzTestEngine for mistake tracking + SR updates.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { HifzSession, HifzTestType, QuranLine, Surah } from '../types/quran.types';
import { fetchLines, fetchSurahs } from '../services/quranApiService';
import {
  createEmptySession,
  finalizeSession,
  recentAccuracy,
  suggestDifficulty,
} from '../services/hifzEngine';
import { TajweedCheckTest } from './components/TajweedCheckTest';
import { RecordAndCheckTest } from './components/RecordAndCheckTest';
import { VoiceTest } from './components/VoiceTest';
import { FindNextAyahTest } from './components/FindNextAyahTest';
import { OrderingTest } from './components/OrderingTest';
import { ResultScreen } from './components/ResultScreen';

const TEST_TYPES: { id: HifzTestType; label: string; desc: string }[] = [
  { id: 'voice', label: 'Voice', desc: 'Recite aloud; we transcribe & compare' },
  { id: 'find-next-ayah', label: 'Find next ayah', desc: 'Pick the ayah that follows' },
  { id: 'ayah-ordering', label: 'Ayah ordering', desc: 'Reorder shuffled ayahs' },
  { id: 'tajweed-check', label: 'Tajweed check', desc: 'Review tajweed rules ayah-by-ayah' },
  { id: 'record-and-check', label: 'Record & check', desc: 'Record yourself, A/B vs reference reciter' },
];

export function QuranTestPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [surah, setSurah] = useState<Surah | null>(null);
  const [lines, setLines] = useState<QuranLine[]>([]);
  const [testType, setTestType] = useState<HifzTestType>(() => {
    const requested = params.get('type') as HifzTestType | null;
    const allowed: HifzTestType[] = ['voice', 'find-next-ayah', 'ayah-ordering', 'tajweed-check', 'record-and-check'];
    return requested && allowed.includes(requested) ? requested : 'voice';
  });
  const [range, setRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [started, setStarted] = useState(false);
  const [session, setSession] = useState<HifzSession | null>(null);
  const [completed, setCompleted] = useState<HifzSession | null>(null);

  // Init data
  useEffect(() => {
    (async () => {
      const s = await fetchSurahs();
      setSurahs(s);
      const wanted = params.get('surah') ? parseInt(params.get('surah')!) : s.length;
      const chosen = s.find((x) => x.id === wanted) ?? s[s.length - 1];
      setSurah(chosen);
      const l = await fetchLines(chosen.id);
      setLines(l);
      const startKey = params.get('start');
      const endKey = params.get('end');
      const startIdx = startKey ? l.findIndex((x) => x.verseKey === startKey) : 0;
      const endIdx = endKey ? l.findIndex((x) => x.verseKey === endKey) : Math.min(l.length - 1, Math.max(0, startIdx + 2));
      setRange({ start: Math.max(0, startIdx), end: Math.max(startIdx, endIdx) });
    })();
  }, [params]);

  const rangeLines = useMemo(() => lines.slice(range.start, range.end + 1), [lines, range]);

  const startTest = () => {
    if (!surah || rangeLines.length === 0) return;
    const startKey = rangeLines[0].verseKey;
    const endKey = rangeLines[rangeLines.length - 1].verseKey;
    const difficulty = suggestDifficulty(recentAccuracy(5));
    setSession(createEmptySession(testType, surah.id, startKey, endKey, difficulty));
    setStarted(true);
    setCompleted(null);
  };

  const finish = (finalSession: HifzSession, totalItems: number) => {
    const done = finalizeSession(finalSession, totalItems);
    setCompleted(done);
    setStarted(false);
    setSession(null);
  };

  if (!surah) {
    return <div className="min-h-screen bg-[#0A0E16] flex items-center justify-center text-[#D4A853]">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0A0E16]/95 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/10">
          <CaretLeft size={20} className="text-[#D4A853]" />
        </button>
        <div>
          <h1 className="text-base font-bold">Hifz Test</h1>
          <p className="text-[11px] text-white/40">
            {surah.id}. {surah.nameSimple} · {rangeLines.length} ayah{rangeLines.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* Setup panel */}
      {!started && !completed && (
        <div className="px-4 py-5 space-y-4">
          <div>
            <h2 className="text-xs uppercase tracking-wide text-white/60 mb-2">Test type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEST_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTestType(t.id)}
                  className={cn(
                    'text-left p-3 rounded-xl border transition-colors',
                    testType === t.id
                      ? 'bg-[#D4A853]/10 border-[#D4A853]/40 text-white'
                      : 'bg-white/3 border-white/8 text-white/70 hover:border-white/20',
                  )}
                >
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-[11px] text-white/50 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-wide text-white/60 mb-2">Range</h2>
            <div className="flex items-center gap-2">
              <select
                value={surah.id}
                onChange={async (e) => {
                  const s = surahs.find((x) => x.id === parseInt(e.target.value));
                  if (!s) return;
                  setSurah(s);
                  const l = await fetchLines(s.id);
                  setLines(l);
                  setRange({ start: 0, end: Math.min(2, l.length - 1) });
                }}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs"
              >
                {surahs.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0A0E16]">
                    {s.id}. {s.nameSimple}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <label className="text-[11px] text-white/50">
                Start ayah
                <input
                  type="number"
                  min={1}
                  max={lines.length}
                  value={range.start + 1}
                  onChange={(e) => {
                    const n = Math.max(1, Math.min(lines.length, parseInt(e.target.value) || 1)) - 1;
                    setRange((r) => ({ start: n, end: Math.max(n, r.end) }));
                  }}
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs"
                />
              </label>
              <label className="text-[11px] text-white/50">
                End ayah
                <input
                  type="number"
                  min={range.start + 1}
                  max={lines.length}
                  value={range.end + 1}
                  onChange={(e) => {
                    const n = Math.max(range.start + 1, Math.min(lines.length, parseInt(e.target.value) || 1)) - 1;
                    setRange((r) => ({ ...r, end: n }));
                  }}
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs"
                />
              </label>
            </div>
          </div>

          <button
            onClick={startTest}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4A853]/20 border border-[#D4A853]/40 text-[#D4A853] font-semibold hover:bg-[#D4A853]/30"
          >
            Start test →
          </button>

          <p className="text-[11px] text-white/40 text-center">
            Difficulty auto-calibrates from your last 5 sessions (currently: <span className="text-[#D4A853]">{suggestDifficulty(recentAccuracy(5))}</span>).
          </p>
        </div>
      )}

      {/* Active test */}
      {started && session && rangeLines.length > 0 && (
        <ActiveTest
          session={session}
          setSession={setSession}
          lines={rangeLines}
          allLines={lines}
          testType={testType}
          onFinish={finish}
        />
      )}

      {/* Completed screen */}
      {completed && <ResultScreen session={completed} onRetry={() => { setCompleted(null); }} onClose={() => navigate('/quran/hifz')} />}
    </div>
  );
}

// --- Active test router ----------------------------------------------------

function ActiveTest({
  session,
  setSession,
  lines,
  allLines,
  testType,
  onFinish,
}: {
  session: HifzSession;
  setSession: (s: HifzSession) => void;
  lines: QuranLine[];
  allLines: QuranLine[];
  testType: HifzTestType;
  onFinish: (s: HifzSession, totalItems: number) => void;
}) {
  if (testType === 'voice') {
    return <VoiceTest session={session} setSession={setSession} lines={lines} onFinish={(s) => onFinish(s, lines.length)} />;
  }
  if (testType === 'find-next-ayah') {
    return <FindNextAyahTest session={session} setSession={setSession} lines={lines} allLines={allLines} onFinish={(s) => onFinish(s, lines.length)} />;
  }
  if (testType === 'ayah-ordering') {
    return <OrderingTest session={session} setSession={setSession} lines={lines} onFinish={(s) => onFinish(s, lines.length)} />;
  }
  if (testType === 'tajweed-check') {
    return <TajweedCheckTest session={session} setSession={setSession} lines={lines} onFinish={(s) => onFinish(s, lines.length)} />;
  }
  if (testType === 'record-and-check') {
    return <RecordAndCheckTest session={session} setSession={setSession} lines={lines} onFinish={(s) => onFinish(s, lines.length)} />;
  }
  return null;
}

export default QuranTestPage;
