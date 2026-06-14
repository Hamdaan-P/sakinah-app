import { useCallback, useEffect, useMemo, useState } from 'react';

export type MushafTheme = 'light' | 'dark';

const STORAGE_KEY = 'quran_mushaf_theme_v1';

export interface MushafTokens {
  /** Outer page background (behind the frame) */
  pageBg: string;
  /** Paper / parchment color inside the frame */
  paper: string;
  /** Subtle paper edge (gradient stop) */
  paperEdge: string;
  /** Primary text color (Arabic ink) */
  ink: string;
  /** Secondary text (header chrome) */
  inkMuted: string;
  /** Frame primary line */
  frame: string;
  /** Frame inner accent line */
  frameAccent: string;
  /** Gold ornaments (ayah numbers, surah cartouche) */
  gold: string;
  /** Highlight colour for currently-playing ayah */
  glow: string;
}

const LIGHT: MushafTokens = {
  pageBg: 'linear-gradient(180deg, #2A1F12 0%, #1A1208 100%)',
  paper: '#F5EBD3',
  paperEdge: '#E9DAB6',
  ink: '#2D2110',
  inkMuted: '#6B5634',
  frame: '#9C7A36',
  frameAccent: '#C8A665',
  gold: '#9C7A36',
  glow: 'rgba(196,137,36, 0.28)',
};

const DARK: MushafTokens = {
  pageBg: 'linear-gradient(180deg, #0A0E16 0%, #131C2C 100%)',
  paper: 'linear-gradient(180deg, #10151F 0%, #0F141F 100%)',
  paperEdge: '#10151F',
  ink: '#F5E8C7',
  inkMuted: '#9AA9C0',
  frame: '#D4A853',
  frameAccent: '#E8C97A',
  gold: '#D4A853',
  glow: 'rgba(212,168,83, 0.35)',
};

function load(): MushafTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function useMushafTheme() {
  const [theme, setThemeState] = useState<MushafTheme>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setThemeState((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((t: MushafTheme) => {
    setThemeState(t);
  }, []);

  const tokens = useMemo<MushafTokens>(() => (theme === 'light' ? LIGHT : DARK), [theme]);

  return { theme, toggle, setTheme, tokens };
}
