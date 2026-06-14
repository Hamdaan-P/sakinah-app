/**
 * useVoiceInput — speech-to-text hook used by InlineLogCard. Encapsulates
 * the SpeechRecognition lifecycle (start/stop, interim/final transcript,
 * error/cleanup) so the card itself stays presentational.
 */

import { useEffect, useRef, useState } from 'react';
import { getSpeechRecognition, type SpeechRecognitionInstance } from './_speech';

interface UseVoiceInputArgs {
  onFinal: (chunk: string) => void;
}

export function useVoiceInput({ onFinal }: UseVoiceInputArgs) {
  const [recording, setRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
  }, []);

  const startRecording = () => {
    const recognition = getSpeechRecognition();
    if (!recognition) {
      alert('Voice input is not supported in this browser. Try Chrome.');
      return;
    }

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e) => {
      let final = '';
      let interim = '';
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        onFinal(final);
        setInterimText('');
      } else {
        setInterimText(interim);
      }
    };

    recognition.onerror = (e) => {
      console.error('[Voice] Error:', e.error);
      setRecording(false);
      setInterimText('');
    };

    recognition.onend = () => {
      setRecording(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
    setInterimText('');
  };

  const toggleRecording = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  return { recording, interimText, startRecording, stopRecording, toggleRecording };
}
