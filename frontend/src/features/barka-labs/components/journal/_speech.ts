/**
 * Minimal SpeechRecognition type shim + factory used by InlineLogCard.
 */

export type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export function getSpeechRecognition(): SpeechRecognitionInstance | null {
  const SR = (window as unknown as Record<string, unknown>).SpeechRecognition
    || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
  if (!SR) return null;
  return new (SR as new () => SpeechRecognitionInstance)();
}
