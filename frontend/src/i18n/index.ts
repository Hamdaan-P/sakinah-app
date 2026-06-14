/**
 * i18n configuration for Barka Labs demo page.
 * Supports: English (default), Arabic, Urdu, Tamil.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enDemo from './en/demo.json';
import arDemo from './ar/demo.json';
import urDemo from './ur/demo.json';
import taDemo from './ta/demo.json';

const STORAGE_KEY = 'demo_lang';

// Detect saved language or default to English
const savedLang = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { demo: enDemo },
      ar: { demo: arDemo },
      ur: { demo: urDemo },
      ta: { demo: taDemo },
    },
    lng: savedLang || 'en',
    fallbackLng: 'en',
    defaultNS: 'demo',
    ns: ['demo'],
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

/** Change language and persist to localStorage */
export function setDemoLanguage(lang: string) {
  i18n.changeLanguage(lang);
  localStorage.setItem(STORAGE_KEY, lang);
}

/** Get current language direction */
export function getDemoDir(): 'rtl' | 'ltr' {
  const lang = i18n.language;
  return lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr';
}

/** Check if language has been selected before */
export function hasSelectedLanguage(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

/** Get the display (heading) font family for the current language */
export function getDemoDisplayFont(): string {
  const lang = i18n.language;
  if (lang === 'ar' || lang === 'ur') return "'Amiri', 'Noto Sans', serif";
  if (lang === 'ta') return "'Noto Sans Tamil', 'Noto Sans', sans-serif";
  return "'Cormorant Garamond', serif";
}

/** Get the body font family for the current language */
export function getDemoBodyFont(): string {
  const lang = i18n.language;
  if (lang === 'ar' || lang === 'ur') return "'Amiri', 'Noto Sans', serif";
  if (lang === 'ta') return "'Noto Sans Tamil', 'DM Sans', sans-serif";
  return "'DM Sans', sans-serif";
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' as const },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' as const },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' as const },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' as const },
];

export default i18n;
