/**
 * Step definitions for the first-launch app walkthrough.
 * Separate desktop (sidebar visible) and mobile (bottom nav) variants.
 */

import {
  Sparkle, House, Flask, BookOpen, BookOpenText, Sun, SquaresFour,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

export interface WalkthroughStep {
  id: string;
  tourTarget: string;
  icon: Icon;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  description: string;
  /** Where to place the tooltip relative to the highlighted element */
  tooltipSide: 'bottom' | 'top' | 'right';
}

// ── Desktop steps (sidebar visible) ────────────────────────────────
// Targets all live on `DashboardPage` (md+ block). The previous step list
// pointed at `quick-zakat / quick-screener / quick-wallet` cards that no
// longer exist on the dashboard — replaced with widgets that are actually
// rendered today.
export const DESKTOP_STEPS: WalkthroughStep[] = [
  {
    id: 'welcome',
    tourTarget: 'dashboard-hero',
    icon: House,
    iconColor: '#D4A853',
    iconBg: 'rgba(212,168,83,0.15)',
    title: 'Welcome to ZaryahPlus',
    subtitle: 'The Islamic Super Agent',
    description:
      "This is your home base. Everything you need — prayer, reflection, Raya, and your spiritual practice — lives here. Let us walk you through the widgets you'll use every day.",
    tooltipSide: 'bottom',
  },
  {
    id: 'raya',
    tourTarget: 'raya-cta',
    icon: Sparkle,
    iconColor: '#E8C97A',
    iconBg: 'rgba(212,168,83,0.15)',
    title: 'Meet Raya & The Sahabas',
    subtitle: 'Your personal AI companions',
    description:
      "Raya isn't just a chatbot — Raya remembers your conversations, understands your emotional state, and gives guidance rooted in the Qur'an and Sunnah. You also have 11 other companions: Abu Bakr, Umar, Khadijah, Aisha, the four great Imams — each with their own voice and wisdom.",
    tooltipSide: 'bottom',
  },
  {
    id: 'reflection',
    tourTarget: 'dashboard-reflection',
    icon: BookOpenText,
    iconColor: '#C9C0A8',
    iconBg: 'rgba(245,232,199,0.08)',
    title: 'Daily Reflection',
    subtitle: 'An ayah and a duʿā, every day',
    description:
      "A small Qur'anic verse and a daily duʿā delivered to your home each morning. Tap between the two — keep the ayah on your mind through the day and the duʿā on your tongue.",
    tooltipSide: 'bottom',
  },
  {
    id: 'barakah',
    tourTarget: 'barka-labs',
    icon: Flask,
    iconColor: '#E8C97A',
    iconBg: 'rgba(212,168,83,0.12)',
    title: 'Barakah Labs',
    subtitle: 'Your spiritual lab',
    description:
      "Notice daily blessings, sit in tafakkur, and watch your trail of gratitude grow over the weeks. Open the door any time you want to slow down and remember.",
    tooltipSide: 'bottom',
  },
  {
    id: 'prayer',
    tourTarget: 'dashboard-prayer',
    icon: Sun,
    iconColor: '#D4A853',
    iconBg: 'rgba(212,168,83,0.15)',
    title: 'Prayer Times',
    subtitle: 'Salah, always nearby',
    description:
      "Accurate prayer times for your location with the next-prayer countdown. Tap through for the full schedule, qibla, and notification settings.",
    tooltipSide: 'top',
  },
];

// ── Mobile steps (Stage-E home: greeting + Raya pill + 6-tile grid + dock) ───
// Targets live on `HomeStageEHeader` (greeting / Raya pill / tile grid / Baraka
// tile) and on the shared `BottomNavBar` (`mhome-dock`), which now owns the
// bottom on every mobile route — there's no per-feature dock to swap with.
export const MOBILE_STEPS: WalkthroughStep[] = [
  {
    id: 'welcome',
    tourTarget: 'mhome-greeting',
    icon: House,
    iconColor: '#D4A853',
    iconBg: 'rgba(212,168,83,0.15)',
    title: 'Welcome to ZaryahPlus',
    subtitle: 'The Islamic Super Agent',
    description:
      "Your home base — prayer, portfolio, and reflection in one place. We'll show you around in a few quick taps.",
    tooltipSide: 'bottom',
  },
  {
    id: 'raya',
    tourTarget: 'mhome-raya',
    icon: Sparkle,
    iconColor: '#E8C97A',
    iconBg: 'rgba(212,168,83,0.15)',
    title: 'Meet Raya',
    subtitle: 'Always here. Always listening.',
    description:
      "Tap the pill to ask anything — Raya remembers your conversations and answers from the Qur'an and Sunnah. The Sahaba & Imams are one tap deeper.",
    tooltipSide: 'bottom',
  },
  {
    id: 'shortcuts',
    tourTarget: 'mhome-tiles',
    icon: SquaresFour,
    iconColor: '#C9C0A8',
    iconBg: 'rgba(245,232,199,0.08)',
    title: 'Your Shortcuts',
    subtitle: 'One tap to anywhere',
    description:
      "Barakah Labs, Mizan, Qur'an, Halaqah, and Companions — your main areas, one tap away. Tap any tile to open it.",
    tooltipSide: 'top',
  },
  {
    id: 'baraka',
    tourTarget: 'mhome-baraka',
    icon: Flask,
    iconColor: '#E8C97A',
    iconBg: 'rgba(212,168,83,0.12)',
    title: 'Barakah Labs',
    subtitle: 'Your spiritual lab',
    description:
      "Start with daily Shukr, watch your tree of good deeds grow, and unlock reflections. The featured door — tap to step inside.",
    tooltipSide: 'bottom',
  },
  {
    id: 'dock',
    tourTarget: 'mhome-dock',
    icon: BookOpen,
    iconColor: '#D4A853',
    iconBg: 'rgba(212,168,83,0.15)',
    title: 'Your Compass',
    subtitle: 'Always one tap away',
    description:
      "Home, Raya, Baraka and Discover live here at the bottom. Other tools — Zakat, Screener, Prayer Times — are inside the More tile.",
    tooltipSide: 'top',
  },
];
