/**
 * Audio playback hook for QuranReadingPage. Owns playingKey state and the
 * play/stop/playSurahFrom handlers. Verbatim — no behavior changes.
 */

import { useCallback, useRef, useState } from 'react';
import type { QuranLine } from '../../types/quran.types';
import { getAyahAudioUrl } from '../../services/quranApiService';

export function useAudioPlayer(reciterId: number, lines: QuranLine[]) {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const continuousRef = useRef(false);

  const playAyah = (line: QuranLine) => {
    continuousRef.current = false;
    const url = getAyahAudioUrl(line.verseKey, reciterId);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingKey(line.verseKey);
    audio.play().catch(() => setPlayingKey(null));
    audio.onended = () => setPlayingKey(null);
  };

  const stopAudio = () => {
    continuousRef.current = false;
    audioRef.current?.pause();
    setPlayingKey(null);
  };

  // Continuous playback: plays from a given verse through the end of the surah
  const playSurahFrom = useCallback((startLine: QuranLine) => {
    const startIdx = lines.findIndex((l) => l.verseKey === startLine.verseKey);
    if (startIdx === -1) return;

    // If already playing continuously from this verse, stop
    if (continuousRef.current && playingKey === startLine.verseKey) {
      stopAudio();
      return;
    }

    continuousRef.current = true;

    const playIndex = (idx: number) => {
      if (!continuousRef.current || idx >= lines.length) {
        setPlayingKey(null);
        continuousRef.current = false;
        return;
      }

      const line = lines[idx];
      const url = getAyahAudioUrl(line.verseKey, reciterId);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      setPlayingKey(line.verseKey);
      audio.play().catch(() => {
        setPlayingKey(null);
        continuousRef.current = false;
      });
      audio.onended = () => {
        if (continuousRef.current) {
          playIndex(idx + 1);
        } else {
          setPlayingKey(null);
        }
      };
    };

    playIndex(startIdx);
  }, [lines, reciterId, playingKey]);

  return { playingKey, audioRef, playAyah, stopAudio, playSurahFrom };
}
