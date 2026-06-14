/**
 * Theme tokens + tab definitions for the Islamic Media page.
 *
 * Phase 5 split — these used to live as in-file `const` blocks at the
 * top of MediaPage.tsx. Moving them out is purely mechanical; no
 * behaviour change.
 */

import {
  House,
  BookOpen,
  Microphone,
  Radio,
  MusicNotes,
} from '@phosphor-icons/react';

export const COLORS = {
  navy: {
    primary: '#10151F',
    secondary: '#10151F',
    tertiary: '#161D2C',
    quaternary: '#161D2C',
  },
  gold: {
    primary: '#D4A853',
    secondary: '#E8C97A',
  },
  text: {
    cream: '#F5E8C7',
    secondary: '#C9C0A8',
    muted: '#7A7363',
  },
  border: 'rgba(212,168,83,0.2)',
  teal: '#14B8A6',
} as const;

export const RECITERS = [
  'Mishari Alafasy',
  'Abdul Basit',
  'Al-Minshawi',
  'As-Sudais',
  'Ash-Shuraim',
  'Al-Husary',
  'Al-Muaiqly',
];

export const TABS = [
  { id: 'home' as const, label: 'Home', icon: House },
  { id: 'quran' as const, label: 'Quran', icon: BookOpen },
  { id: 'duas' as const, label: 'Duas', icon: Microphone },
  { id: 'podcasts' as const, label: 'Podcasts', icon: Radio },
  { id: 'stories' as const, label: 'Stories', icon: BookOpen },
  { id: 'nasheeds' as const, label: 'Nasheeds', icon: MusicNotes },
];

export const HOME_CATEGORIES = [
  {
    title: 'Prophet Stories',
    description: 'Historical narratives of the prophets',
    gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
    tab: 'stories' as const,
  },
  {
    title: 'Podcast Library',
    description: 'Audio lecture series',
    gradient: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
    tab: 'podcasts' as const,
  },
  {
    title: 'Quran & Duas',
    description: 'Recitation, reading, and supplications',
    gradient: `linear-gradient(135deg, ${COLORS.gold.primary} 0%, ${COLORS.gold.secondary} 100%)`,
    tab: 'quran' as const,
  },
  {
    title: 'Nasheed',
    description: 'Islamic songs collection',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    tab: 'nasheeds' as const,
  },
];
