/**
 * audioRecorder — thin MediaRecorder wrapper.
 * Records microphone audio, returns a Blob playable via an object URL.
 * No server upload — stays local.
 *
 * Capability quirks:
 *   - iOS Safari only supports `audio/mp4` (with AAC). webm/opus is rejected.
 *   - Android Chrome / Capacitor webview support audio/webm;codecs=opus.
 *   - Capacitor needs the platform mic permission (RECORD_AUDIO on Android,
 *     NSMicrophoneUsageDescription on iOS — both wired up).
 */

import { Capacitor } from '@capacitor/core';

export interface RecordingHandle {
  stop: () => Promise<Blob>;
  cancel: () => void;
  stream: MediaStream;
}

export interface RecorderCapabilities {
  supported: boolean;
  reason?: string;
  mimeType?: string;
  isIOS: boolean;
  isAndroid: boolean;
  isNative: boolean;
}

export function getRecorderCapabilities(): RecorderCapabilities {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  const isIOS = platform === 'ios' || /iP(hone|od|ad)/.test(navigator.userAgent);
  const isAndroid = platform === 'android' || /Android/.test(navigator.userAgent);

  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return {
      supported: false,
      reason: 'Microphone access is not available in this browser.',
      isIOS,
      isAndroid,
      isNative,
    };
  }
  if (typeof MediaRecorder === 'undefined') {
    return {
      supported: false,
      reason: 'Audio recording is not supported in this browser.',
      isIOS,
      isAndroid,
      isNative,
    };
  }

  const mimeType = pickMimeType();
  return { supported: true, mimeType, isIOS, isAndroid, isNative };
}

export async function startRecording(): Promise<RecordingHandle> {
  const caps = getRecorderCapabilities();
  if (!caps.supported) throw new Error(caps.reason || 'Audio recording unavailable.');

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err: unknown) {
    const e = err as DOMException;
    if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
      throw new Error('Microphone permission was denied. Enable it in your device settings.');
    }
    if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
      throw new Error('No microphone detected on this device.');
    }
    if (e.name === 'NotReadableError') {
      throw new Error('Microphone is in use by another app — close it and try again.');
    }
    throw new Error('Could not access the microphone: ' + (e.message || e.name));
  }

  const recorder = new MediaRecorder(stream, caps.mimeType ? { mimeType: caps.mimeType } : undefined);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

  recorder.start(200); // slice every 200ms for smoother flush

  const stop = (): Promise<Blob> =>
    new Promise((resolve) => {
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        resolve(new Blob(chunks, { type: recorder.mimeType || caps.mimeType || 'audio/webm' }));
      };
      recorder.stop();
    });

  const cancel = () => {
    try { recorder.stop(); } catch { /* ignore */ }
    stream.getTracks().forEach((t) => t.stop());
  };

  return { stop, cancel, stream };
}

function pickMimeType(): string | undefined {
  // iOS Safari only honours audio/mp4 — list it first there. On other
  // platforms opus/webm gives smaller files for the same quality.
  const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) || Capacitor.getPlatform() === 'ios';
  const candidates = isIOS
    ? ['audio/mp4', 'audio/aac', 'audio/webm;codecs=opus', 'audio/webm']
    : ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  for (const c of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) return c;
  }
  return undefined;
}

export function blobToUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Quick capability probe — what users see in the UI before hitting record.
 * Returns null if everything is fine, or a human-readable reason it's not.
 */
export function getRecordingUnavailableReason(): string | null {
  const caps = getRecorderCapabilities();
  return caps.supported ? null : caps.reason || 'Audio recording unavailable.';
}
