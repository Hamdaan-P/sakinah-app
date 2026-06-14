/**
 * Tajweed Practice — pick a surah, recite, get color-coded word-level
 * feedback (correct / mispronounced / missing) using Web Speech API.
 *
 * Honest scope: this is word-accuracy feedback, NOT a real Tajweed evaluator
 * (which would need Tarteel-style ML models). Still incredibly useful — the
 * user sees exactly which words they skipped or said wrong, in real-time.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Microphone, Stop, ArrowsClockwise, CheckCircle, XCircle, MinusCircle, Lightbulb, Play, Pause } from '@phosphor-icons/react';
import { fetchSurahs, fetchLines } from '../services/quranApiService';
import { scoreRecitation, type TajweedScore } from '../services/tajweedScorer';
import { logRecitation } from '../services/recitationDiaryService';
import { startRecording, blobToUrl, getRecorderCapabilities, type RecordingHandle } from '../services/audioRecorder';
import type { Surah, QuranLine } from '../types/quran.types';
import { trackFeature } from '@/lib/analytics';
import { startListening, isSpeechAvailable, type SpeechSessionHandle } from '@/lib/speechRecognitionMobile';

export function QuranTajweedPracticePage() {
  useEffect(() => { trackFeature('quran_tajweed_practice'); }, []);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const surahParam = parseInt(params.get('surah') || '1');
  const startVerse = parseInt(params.get('start') || '1');
  const endVerse = parseInt(params.get('end') || '7');

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [lines, setLines] = useState<QuranLine[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // ASR availability — true on standalone browsers (Web Speech API) AND inside
  // the Capacitor app via @capacitor-community/speech-recognition. False only
  // on Firefox web or when the plugin's `available()` check returns false; we
  // then fall back to a record-and-self-rate flow.
  const [speechSupported, setSpeechSupported] = useState(true);
  const recordCaps = useRef(getRecorderCapabilities());
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState<TajweedScore | null>(null);
  const [recordStartedAt, setRecordStartedAt] = useState<number | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const speechSessionRef = useRef<SpeechSessionHandle | null>(null);
  const recHandleRef = useRef<RecordingHandle | null>(null);

  // Load surahs + lines
  useEffect(() => {
    Promise.all([fetchSurahs(), fetchLines(surahParam)])
      .then(([s, l]) => {
        setSurahs(s);
        const filtered = l.filter((line) => line.verseNumber >= startVerse && line.verseNumber <= endVerse);
        setLines(filtered.length > 0 ? filtered : l.slice(0, 7));
      })
      .finally(() => setLoading(false));
  }, [surahParam, startVerse, endVerse]);

  useEffect(() => {
    let cancelled = false;
    isSpeechAvailable().then((ok) => {
      if (!cancelled) setSpeechSupported(ok);
    });
    return () => { cancelled = true; };
  }, []);

  // Revoke object URLs when they're swapped out so we don't leak.
  useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  const active = lines[activeIdx];
  // Mode: 'transcribe' = Web Speech API path (auto-score). 'self-rate' = record
  // audio + user picks accuracy. Never both — transcribe is preferred when
  // available because it's automatic and granular.
  const mode: 'transcribe' | 'self-rate' = speechSupported ? 'transcribe' : 'self-rate';
  const canStart = mode === 'transcribe' ? speechSupported : recordCaps.current.supported;

  const logSession = (accuracy: number, label: string) => {
    if (!active) return;
    try {
      const sec = recordStartedAt ? Math.max(1, Math.round((Date.now() - recordStartedAt) / 1000)) : 0;
      const surahName = surahs.find((x) => x.id === surahParam)?.nameSimple;
      logRecitation({
        verseKey: active.verseKey,
        surahId: surahParam,
        surahName,
        durationSec: sec,
        note: `Tajweed practice · ${label}${accuracy > 0 ? ` · ${Math.round(accuracy * 100)}% accuracy` : ''}`,
      });
    } catch { /* non-blocking */ }
  };

  const start = async () => {
    setScore(null);
    setTranscript('');
    setRecordingError(null);
    if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }

    if (mode === 'transcribe') {
      setRecordStartedAt(Date.now());
      setListening(true);
      try {
        const session = await startListening({
          language: 'ar-SA',
          onPartial: (text) => setTranscript(text),
          onFinal: (text) => setTranscript(text),
          onEnd: () => setListening(false),
          onError: () => setListening(false),
        });
        speechSessionRef.current = session;
      } catch {
        setSpeechSupported(false);
        setListening(false);
      }
    } else {
      // Self-rate path — record audio for playback + manual rating.
      try {
        const handle = await startRecording();
        recHandleRef.current = handle;
        setRecordStartedAt(Date.now());
        setListening(true);
      } catch (err) {
        setRecordingError(err instanceof Error ? err.message : 'Could not start recording.');
        setListening(false);
      }
    }
  };

  const stop = async () => {
    if (mode === 'transcribe') {
      await speechSessionRef.current?.stop();
      speechSessionRef.current = null;
      setListening(false);
      if (active && transcript.trim().length > 0) {
        const s = scoreRecitation(active.arabic, transcript);
        setScore(s);
        logSession(s.accuracy, 'transcribed');
      }
    } else {
      // Stop recording, surface playback so user can self-rate.
      const handle = recHandleRef.current;
      if (!handle) { setListening(false); return; }
      try {
        const blob = await handle.stop();
        setAudioUrl(blobToUrl(blob));
      } catch (err) {
        setRecordingError(err instanceof Error ? err.message : 'Recording failed.');
      } finally {
        recHandleRef.current = null;
        setListening(false);
      }
    }
  };

  // Self-rate ratings → synthetic TajweedScore (all words marked the chosen
  // status) so the rest of the UI (colored verse, score card) Just Works.
  const selfRate = (rating: 'all-correct' | 'mostly' | 'some-off' | 'try-again') => {
    if (!active) return;
    const ratingMeta: Record<typeof rating, { acc: number; status: 'correct' | 'mispronounced' | 'missing'; label: string }> = {
      'all-correct': { acc: 1.0, status: 'correct', label: 'self-rated: all correct' },
      'mostly':      { acc: 0.85, status: 'correct', label: 'self-rated: mostly correct' },
      'some-off':    { acc: 0.6, status: 'mispronounced', label: 'self-rated: some off' },
      'try-again':   { acc: 0.3, status: 'missing', label: 'self-rated: needs work' },
    };
    const meta = ratingMeta[rating];
    // Build a TajweedScore-compatible object using the active verse's words
    const refWords = active.arabic.split(/\s+/).filter(Boolean);
    const fakeScore: TajweedScore = {
      words: refWords.map((w) => ({ ref: w, status: meta.status })),
      accuracy: meta.acc,
      correctCount: meta.status === 'correct' ? refWords.length : 0,
      totalCount: refWords.length,
      rawTranscript: '',
    };
    setScore(fakeScore);
    logSession(meta.acc, meta.label);
  };

  const next = () => {
    setScore(null);
    setTranscript('');
    if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }
    if (activeIdx + 1 < lines.length) setActiveIdx((i) => i + 1);
  };

  const retry = () => {
    setScore(null);
    setTranscript('');
    if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }
  };

  const surahName = surahs.find((s) => s.id === surahParam)?.nameSimple || `Surah ${surahParam}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] pb-24">
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <Microphone size={16} weight="fill" className="text-[#D4A853]" />
            <h1 className="text-sm font-semibold text-white truncate">Tajweed Practice</h1>
          </div>
          <div className="w-9" />
        </div>
      </div>

      {/* Surah / range picker */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 items-center mb-3">
          <select
            value={surahParam}
            onChange={(e) => {
              const id = parseInt(e.target.value);
              const s = surahs.find((x) => x.id === id);
              const newEnd = Math.min(7, s?.versesCount ?? 7);
              setParams({ surah: String(id), start: '1', end: String(newEnd) });
              setActiveIdx(0);
              setScore(null);
              setTranscript('');
            }}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white text-xs"
          >
            {surahs.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0A0E16]">
                {s.id}. {s.nameSimple}
              </option>
            ))}
          </select>
        </div>

        <p className="text-[11px] text-white/50 mb-1">
          {surahName} · ayah {activeIdx + 1} of {lines.length}
        </p>
      </div>

      {/* Reference verse */}
      <div className="px-4 mt-2">
        {loading || !active ? (
          <div className="h-32 rounded-xl bg-white/5 animate-pulse" />
        ) : (
          <div className="rounded-2xl bg-white/3 border border-white/8 p-4">
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Recite this</p>
            {/* If we have a score, render word-by-word coloured. Otherwise plain. */}
            {score ? (
              <p dir="rtl" className="font-arabic text-right text-2xl leading-[2.1]">
                {score.words.map((w, i) => (
                  <span
                    key={i}
                    className={`inline-block mx-1 ${
                      w.status === 'correct' ? 'text-emerald-300'
                      : w.status === 'mispronounced' ? 'text-amber-300 underline decoration-amber-400/60 decoration-2 underline-offset-4'
                      : 'text-rose-300/85 line-through decoration-rose-400/60'
                    }`}
                  >
                    {w.ref}
                  </span>
                ))}
              </p>
            ) : (
              <p
                dir="rtl"
                className="font-arabic text-right text-[#F5E8C7] text-2xl leading-[2.1]"
              >
                {active.arabic}
              </p>
            )}
            {active.translation && (
              <p className="text-xs text-white/50 italic mt-3">
                "{active.translation.replace(/<[^>]+>/g, '')}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mode hint — explain the self-rate fallback when transcription is unavailable */}
      {mode === 'self-rate' && !score && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
          <Lightbulb size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-100/85">
            This browser doesn't support live voice recognition. Record your recitation,
            listen back, and rate yourself — sessions still log to your diary.
          </p>
        </div>
      )}

      {recordingError && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2">
          <XCircle size={14} className="text-rose-400 mt-0.5 shrink-0" />
          <p className="text-xs text-rose-100/85">{recordingError}</p>
        </div>
      )}

      {/* Self-rate playback + rating buttons */}
      {mode === 'self-rate' && audioUrl && !score && (
        <div className="mx-4 mt-4 rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
          <p className="text-[11px] uppercase tracking-wider text-white/50">Listen back</p>
          <PlaybackBar src={audioUrl} />
          <p className="text-[11px] uppercase tracking-wider text-white/50 mt-3">How was that?</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => selfRate('all-correct')} className="py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-medium">All correct</button>
            <button onClick={() => selfRate('mostly')} className="py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-100/85 text-xs font-medium">Mostly correct</button>
            <button onClick={() => selfRate('some-off')} className="py-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-medium">Some off</button>
            <button onClick={() => selfRate('try-again')} className="py-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-medium">Try again</button>
          </div>
        </div>
      )}

      {/* Score summary */}
      {score && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 rounded-2xl bg-gradient-to-br from-[#D4A853]/10 to-[#0F141F]/30 border border-[#D4A853]/25 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] uppercase tracking-wide text-[#D4A853]/85 font-semibold">Your recitation</p>
            <span className="text-2xl font-bold text-[#D4A853]">{Math.round(score.accuracy * 100)}%</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Stat icon={<CheckCircle size={14} weight="fill" className="text-emerald-400" />} label="Correct" value={score.words.filter((w) => w.status === 'correct').length} />
            <Stat icon={<MinusCircle size={14} weight="fill" className="text-amber-400" />} label="Off" value={score.words.filter((w) => w.status === 'mispronounced').length} />
            <Stat icon={<XCircle size={14} weight="fill" className="text-rose-400" />} label="Missed" value={score.words.filter((w) => w.status === 'missing').length} />
          </div>

          {/* Override — Web Speech API often mis-recognizes Quranic Arabic
             (it's trained on MSA news/conversational speech, not Uthmani
             recitation). The user knows what they recited; this gives them
             a one-tap override when they reciped fine but the model didn't
             pick it up. */}
          <button
            onClick={() => {
              if (!active) return;
              const fixed: TajweedScore = {
                ...score,
                words: score.words.map((w) => ({ ...w, status: 'correct' })),
                accuracy: 1,
                correctCount: score.totalCount,
              };
              setScore(fixed);
            }}
            className="w-full mb-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium"
          >
            ✓ I recited correctly — override
          </button>

          <p className="text-[11px] text-white/50 leading-relaxed">
            Web Speech recognition is trained on Modern Standard Arabic, not Quranic recitation,
            so it sometimes mis-flags correct ayahs. Use the override above if you know yours was right.
            For full Tajweed evaluation (madd, qalqalah, etc.), play the reference audio alongside.
          </p>
        </motion.div>
      )}

      {/* Controls — sticky bottom bar honouring the device safe-area inset */}
      <div className="fixed left-0 right-0 px-4" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
        <div className="flex gap-2 max-w-md mx-auto">
          {!score ? (
            !listening ? (
              <button
                onClick={start}
                disabled={!canStart || !active}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold disabled:opacity-50 shadow-lg shadow-black/40"
              >
                <Microphone size={16} weight="fill" /> {mode === 'transcribe' ? 'Start reciting' : 'Start recording'}
              </button>
            ) : (
              <button
                onClick={stop}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/30 border border-rose-500/50 text-rose-100 text-sm font-semibold animate-pulse shadow-lg shadow-black/40"
              >
                <Stop size={16} weight="fill" /> {mode === 'transcribe' ? 'Stop & score' : 'Stop recording'}
              </button>
            )
          ) : (
            <>
              <button
                onClick={retry}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white/85 text-sm font-medium shadow-lg shadow-black/40"
              >
                <ArrowsClockwise size={14} /> Retry
              </button>
              <button
                onClick={next}
                disabled={activeIdx + 1 >= lines.length}
                className="flex-1 py-3 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold disabled:opacity-50 shadow-lg shadow-black/40"
              >
                Next ayah
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/8 p-2 text-center">
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <p className="text-base font-bold text-white">{value}</p>
      <p className="text-[9px] text-white/45 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function PlaybackBar({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); } else { void a.play(); }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-[#D4A853] text-[#0A0E16] flex items-center justify-center"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
      </button>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- audio-only Quran recitation playback; captions don't apply to recited Arabic audio */}
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="flex-1 h-9"
        controls
      />
    </div>
  );
}

export default QuranTajweedPracticePage;
