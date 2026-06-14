/**
 * useSpeechRecognition
 * Hook wrapping the Web Speech API for real-time speech-to-text.
 * Free, no API key needed — works in Chrome, Edge, Safari 14.1+.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// Extend Window for vendor-prefixed API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

type SpeechRecognitionErrorEvent = Event & { error: string; message?: string };

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  onTranscript?: (text: string, isFinal: boolean) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const { lang = 'en-US', continuous = false, onTranscript } = options;

  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognitionAPI;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  // Phase 5 — keep the ref in sync with the latest callback via an
  // effect, not a direct render-time mutation. Mutating refs during
  // render works but violates the React rules-of-hooks "purity" guideline
  // and trips React Compiler / static analyzers.
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // Create recognition instance
  const getRecognition = useCallback(() => {
    if (recognitionRef.current) return recognitionRef.current;
    if (!SpeechRecognitionAPI) return null;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      // Rebuild full transcript from ALL results every time to avoid duplication
      let finalParts = '';
      let interimParts = '';

      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          finalParts += result[0].transcript;
        } else {
          interimParts += result[0].transcript;
        }
      }

      setTranscript(finalParts);
      setInterimTranscript(interimParts);

      if (finalParts) {
        onTranscriptRef.current?.(finalParts, true);
      } else if (interimParts) {
        onTranscriptRef.current?.(interimParts, false);
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      // 'no-speech' and 'aborted' are normal — don't treat as errors
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('Speech recognition error:', e.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [SpeechRecognitionAPI, continuous, lang]);

  const startListening = useCallback(() => {
    const recognition = getRecognition();
    if (!recognition) return;

    setTranscript('');
    setInterimTranscript('');

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      // Already started — ignore
    }
  }, [getRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
  };
}
