/**
 * useQuranInteraction
 * Unified interaction model for tap-word / long-press-ayah / multi-select.
 * Produces a "selection" state that drives the FloatingToolbar + WordPopover.
 */

import { useCallback, useRef, useState } from 'react';

export type SelectionKind = 'word' | 'ayah' | 'range';

export interface QuranSelection {
  kind: SelectionKind;
  verseKeys: string[];      // 1+ entries; for word-kind this is [verseKey]
  wordPosition?: number;    // only for kind === 'word'
  anchor?: { x: number; y: number };  // for popover positioning
}

const LONG_PRESS_MS = 400;

export function useQuranInteraction() {
  const [selection, setSelection] = useState<QuranSelection | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const pressStartKey = useRef<string | null>(null);
  const didLongPress = useRef(false);

  const clear = useCallback(() => {
    setSelection(null);
    didLongPress.current = false;
  }, []);

  const tapWord = useCallback((verseKey: string, wordPosition: number, x: number, y: number) => {
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }
    setSelection({ kind: 'word', verseKeys: [verseKey], wordPosition, anchor: { x, y } });
  }, []);

  const tapAyah = useCallback((verseKey: string, x?: number, y?: number) => {
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }
    // Toggle — if already selected, dismiss
    setSelection((prev) => {
      if (prev?.kind === 'ayah' && prev.verseKeys[0] === verseKey) return null;
      return { kind: 'ayah', verseKeys: [verseKey], anchor: x != null && y != null ? { x, y } : undefined };
    });
  }, []);

  const pressStart = useCallback((verseKey: string) => {
    pressStartKey.current = verseKey;
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => {
      didLongPress.current = true;
      // Start a range selection with just this ayah; the ayah-tap-to-extend flow extends it
      setSelection((prev) => {
        if (prev?.kind === 'range') return prev;
        return { kind: 'range', verseKeys: [verseKey] };
      });
    }, LONG_PRESS_MS);
  }, []);

  const pressEnd = useCallback(() => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  /** Extend an active range selection to include the given ayah. */
  const extendRange = useCallback((verseKey: string) => {
    setSelection((prev) => {
      if (!prev || prev.kind !== 'range') return prev;
      if (prev.verseKeys.includes(verseKey)) return prev;
      return { ...prev, verseKeys: [...prev.verseKeys, verseKey].sort(compareVerseKey) };
    });
  }, []);

  return { selection, setSelection, clear, tapWord, tapAyah, pressStart, pressEnd, extendRange };
}

function compareVerseKey(a: string, b: string): number {
  const [as, av] = a.split(':').map(Number);
  const [bs, bv] = b.split(':').map(Number);
  if (as !== bs) return as - bs;
  return av - bv;
}
