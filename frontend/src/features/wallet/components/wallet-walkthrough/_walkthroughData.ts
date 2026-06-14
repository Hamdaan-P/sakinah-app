/**
 * Step list and shared types for WalletWalkthrough.
 */

import { Coins, Lightning, Gift } from '@phosphor-icons/react';
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
  tooltipSide: 'bottom' | 'top';
}

export const STEPS: WalkthroughStep[] = [
  {
    id: 'balance',
    tourTarget: 'wallet-balance',
    icon: Coins,
    iconColor: '#C9B57A',
    iconBg: 'rgba(201,181,122,0.10)',
    title: 'Your DinarZ Balance',
    subtitle: 'Real value, real currency',
    description:
      "This is your DinarZ (DNZ) balance — the native currency of ZaryahPlus. 1 DNZ ≈ ₹0.70 (~$0.0074 USD). You earn it by using the app, and soon you'll be able to spend it on real services, products, and investments within the platform.",
    tooltipSide: 'bottom',
  },
  {
    id: 'daily',
    tourTarget: 'wallet-daily',
    icon: Lightning,
    iconColor: '#6BAF8D',
    iconBg: 'rgba(107,175,141,0.10)',
    title: 'Daily Earnings',
    subtitle: 'Earn just by showing up',
    description:
      "Every day you have a fresh earning cap. Log in daily for +5 DNZ. Chat with Raya or any companion — every 5 messages earns you +1 DNZ. Use the browser mining extension for passive earning. The progress bar shows how much of your daily cap you've used.",
    tooltipSide: 'bottom',
  },
  {
    id: 'tabs',
    tourTarget: 'wallet-tabs',
    icon: Coins,
    iconColor: '#7AACCA',
    iconBg: 'rgba(122,172,202,0.10)',
    title: 'Explore Your Wallet',
    subtitle: '5 tabs, full control',
    description:
      "Overview shows your earnings at a glance. Transactions logs every DNZ you've earned. Investments shows your Shariah-compliant portfolio. Rewards is where you'll find all the ways to earn more. Settings lets you manage your account and preferences.",
    tooltipSide: 'bottom',
  },
  {
    id: 'referral',
    tourTarget: 'wallet-balance',
    icon: Gift,
    iconColor: '#C48AA0',
    iconBg: 'rgba(196,138,160,0.10)',
    title: 'Refer & Earn Big',
    subtitle: '500 DNZ per referral',
    description:
      "Head to the Rewards tab to find your personal referral code and link. When someone signs up with your code and completes onboarding, you get 500 DNZ — that's the biggest single reward in the app. Share it with friends, family, your community. Build your balance together.",
    tooltipSide: 'bottom',
  },
];

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function getRect(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function scrollToTarget(target: string) {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
}
