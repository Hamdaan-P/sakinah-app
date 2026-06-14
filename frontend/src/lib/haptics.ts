/**
 * Haptics + page-flip sound utilities.
 *
 * Native haptics route through @capacitor/haptics; the web fallback uses
 * navigator.vibrate where available. The page-flip sound is synthesized
 * on the fly via Web Audio so we don't ship a binary asset.
 *
 * Mirrors the dynamic-import pattern used in lib/native.ts so the web
 * bundle doesn't pay the cost of the Capacitor plugin code path.
 */

import { isNative } from './native';

type HapticImpact = 'light' | 'medium' | 'heavy';

async function impact(style: HapticImpact): Promise<void> {
  if (isNative()) {
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      const map = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      } as const;
      await Haptics.impact({ style: map[style] });
      return;
    } catch {
      // fall through to web fallback
    }
  }
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    const ms = style === 'light' ? 10 : style === 'medium' ? 20 : 30;
    navigator.vibrate(ms);
  }
}

async function success(): Promise<void> {
  if (isNative()) {
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      await Haptics.notification({ type: NotificationType.Success });
      return;
    } catch {
      // fall through
    }
  }
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate([10, 30, 10]);
  }
}

export const haptic = {
  light: () => impact('light'),
  medium: () => impact('medium'),
  heavy: () => impact('heavy'),
  success,
};

// ---------- page-flip sound (Web Audio synth) ----------

let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (audioCtx) return audioCtx;
  const Ctor = (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  if (!Ctor) return null;
  audioCtx = new Ctor();
  return audioCtx;
}

/**
 * Plays a short, soft paper-rustle. Synthesized = ~50ms of filtered white
 * noise with a fast attack/decay envelope. No-op if Web Audio is unavailable
 * or the user hasn't interacted yet (Safari's autoplay policy).
 */
export function playPageFlipSound(volume = 0.25): void {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const duration = 0.18;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2400;
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + duration);
  } catch {
    // ignore
  }
}
