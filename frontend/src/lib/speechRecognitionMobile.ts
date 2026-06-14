/**
 * Cross-platform speech recognition.
 *
 *  - Native (Capacitor Android/iOS): @capacitor-community/speech-recognition
 *    backed by the OS's built-in SpeechRecognizer / SFSpeechRecognizer.
 *  - Web (Chrome/Safari/Edge): Web Speech API (window.SpeechRecognition).
 *  - Anywhere else (Firefox web, in-app webviews lacking ASR): returns
 *    `available: false` so callers can fall back to record-and-self-rate.
 *
 * Listeners receive `partial` updates as the user speaks and a `final`
 * transcript when recognition ends.
 */

import { isNative } from './native';

export interface SpeechSessionHandle {
  stop: () => Promise<void>;
}

export interface StartListeningOptions {
  language?: string; // BCP-47, default 'ar-SA'
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (err: unknown) => void;
  onEnd?: () => void;
}

interface WebRecognitionLite {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }> }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getWebRecognitionCtor(): (new () => WebRecognitionLite) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => WebRecognitionLite;
    webkitSpeechRecognition?: new () => WebRecognitionLite;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Quick capability probe. On native this checks the plugin; on web checks the
 * Web Speech API. Doesn't request permission — just reports if ASR is
 * theoretically available.
 */
export async function isSpeechAvailable(): Promise<boolean> {
  if (isNative()) {
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      const res = await SpeechRecognition.available();
      return Boolean(res.available);
    } catch {
      return false;
    }
  }
  return getWebRecognitionCtor() !== null;
}

export async function startListening(opts: StartListeningOptions = {}): Promise<SpeechSessionHandle> {
  const language = opts.language ?? 'ar-SA';

  if (isNative()) {
    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');

    // Permission check — request if needed.
    const status = await SpeechRecognition.checkPermissions();
    if (status.speechRecognition !== 'granted') {
      const req = await SpeechRecognition.requestPermissions();
      if (req.speechRecognition !== 'granted') {
        opts.onError?.(new Error('Microphone permission denied'));
        opts.onEnd?.();
        return { stop: async () => {} };
      }
    }

    let lastFinal = '';
    const partialListener = await SpeechRecognition.addListener('partialResults', (data: { matches?: string[] }) => {
      const text = (data.matches?.[0] ?? '').trim();
      if (text) {
        lastFinal = text;
        opts.onPartial?.(text);
      }
    });

    const stopAndCleanup = async () => {
      try {
        await SpeechRecognition.stop();
      } catch {
        // ignore
      }
      try {
        await partialListener.remove();
      } catch {
        // ignore
      }
      if (lastFinal) opts.onFinal?.(lastFinal);
      opts.onEnd?.();
    };

    try {
      // Note: when partialResults is true, native plugin emits the partialResults
      // listener as the user speaks. We treat the last partial as the final.
      await SpeechRecognition.start({
        language,
        maxResults: 1,
        prompt: '',
        partialResults: true,
        popup: false,
      });
    } catch (err) {
      opts.onError?.(err);
      await partialListener.remove().catch(() => {});
      opts.onEnd?.();
      return { stop: async () => {} };
    }

    return { stop: stopAndCleanup };
  }

  // Web fallback
  const Ctor = getWebRecognitionCtor();
  if (!Ctor) {
    opts.onError?.(new Error('Speech recognition not supported in this browser'));
    opts.onEnd?.();
    return { stop: async () => {} };
  }

  const rec = new Ctor();
  rec.lang = language;
  rec.continuous = true;
  rec.interimResults = true;
  let aggregated = '';
  rec.onresult = (e) => {
    let text = '';
    for (let i = 0; i < e.results.length; i++) {
      text += e.results[i][0].transcript + ' ';
    }
    aggregated = text.trim();
    opts.onPartial?.(aggregated);
  };
  rec.onerror = (err) => opts.onError?.(err);
  rec.onend = () => {
    if (aggregated) opts.onFinal?.(aggregated);
    opts.onEnd?.();
  };
  rec.start();

  return {
    stop: async () => {
      try {
        rec.stop();
      } catch {
        // ignore
      }
    },
  };
}
