/**
 * Record-and-check Hifz test extracted from QuranTestPage.
 */

import { useEffect, useRef, useState } from 'react';
import { Record as RecordIcon, Stop } from '@phosphor-icons/react';
import type { HifzSession, QuranLine } from '../../types/quran.types';
import { startRecording, blobToUrl, type RecordingHandle } from '../../services/audioRecorder';
import { getAyahAudioUrl } from '../../services/quranApiService';
import { logRecitation } from '../../services/recitationDiaryService';
import { pushCorrect, pushMistake } from '../../services/hifzEngine';

interface Props {
  session: HifzSession;
  setSession: (s: HifzSession) => void;
  lines: QuranLine[];
  onFinish: (s: HifzSession) => void;
}

export function RecordAndCheckTest({ session, setSession, lines, onFinish }: Props) {
  const [idx, setIdx] = useState(0);
  const [recording, setRecording] = useState(false);
  const [recordUrl, setRecordUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleRef = useRef<RecordingHandle | null>(null);
  const recordStartRef = useRef<number>(0);

  const active = lines[idx];

  // Revoke prior object URL whenever it changes / on unmount to prevent leaks
  useEffect(() => {
    return () => {
      if (recordUrl) URL.revokeObjectURL(recordUrl);
    };
  }, [recordUrl]);

  // Cancel an in-flight recording if the user navigates away mid-record
  useEffect(() => () => handleRef.current?.cancel(), []);

  const begin = async () => {
    setError(null);
    // Reset any existing URL so the effect revokes it
    if (recordUrl) setRecordUrl(null);
    try {
      handleRef.current = await startRecording();
      recordStartRef.current = Date.now();
      setRecording(true);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const finishRec = async () => {
    if (!handleRef.current) return;
    const blob = await handleRef.current.stop();
    setRecordUrl(blobToUrl(blob));
    setRecording(false);
    // Log to diary
    try {
      const durationSec = Math.max(1, Math.round((Date.now() - recordStartRef.current) / 1000));
      const surahId = parseInt(active.verseKey.split(':')[0], 10);
      logRecitation({
        verseKey: active.verseKey,
        surahId: Number.isFinite(surahId) ? surahId : 0,
        durationSec,
      });
    } catch { /* don't break recording on diary error */ }
  };

  const next = (ok: boolean) => {
    if (ok) setSession(pushCorrect(session));
    else setSession(pushMistake(session, { verseKey: active.verseKey, type: 'pronunciation', expected: active.arabic }));
    setRecordUrl(null);
    if (idx + 1 < lines.length) setIdx(idx + 1);
    else onFinish(session);
  };

  return (
    <div className="px-4 py-5 space-y-4 pb-28">
      <div className="flex items-center justify-between text-[11px] text-white/40">
        <span>Ayah {idx + 1} / {lines.length}</span>
        <span>{active.verseKey}</span>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/3 p-4">
        <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Recite this ayah</p>
        <p className="text-2xl font-arabic text-right leading-loose" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
          {active.arabic}
        </p>
      </div>

      <div className="rounded-xl border border-[#4FB892]/20 bg-[#4FB892]/5 p-4 space-y-3">
        <p className="text-[11px] text-white/60">Reference</p>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- audio-only ayah recitation; captions don't apply */}
        <audio src={getAyahAudioUrl(active.verseKey)} controls className="w-full h-10 [color-scheme:dark]" />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
        <p className="text-[11px] text-white/60">Your recording</p>
        {!recording && !recordUrl && (
          <button
            onClick={begin}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 font-medium"
          >
            <RecordIcon size={16} weight="fill" /> Start recording
          </button>
        )}
        {recording && (
          <button
            onClick={finishRec}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/25 border border-red-500/50 text-red-300 font-semibold"
          >
            <Stop size={16} weight="fill" /> Stop
          </button>
        )}
        {recordUrl && (
          <>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption -- audio-only user recitation playback; captions don't apply */}
            <audio src={recordUrl} controls className="w-full h-10 [color-scheme:dark]" />
            <div className="flex gap-2">
              <button onClick={() => next(false)} className="flex-1 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                Needs work
              </button>
              <button onClick={() => next(true)} className="flex-1 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                Correct
              </button>
            </div>
            <button onClick={begin} className="w-full py-1.5 text-xs text-white/60 hover:text-white">
              Re-record
            </button>
          </>
        )}
        {error && <p className="text-[11px] text-red-300">{error}</p>}
      </div>
    </div>
  );
}
