/**
 * Navigation Types
 * Defines sidebar, bottom nav, top nav, and drawer item structures
 * Matches Flutter's navigation_home.dart 6-section drawer structure
 */

export interface NavItemConfig {
  id: string;
  label: string;
  icon: string;
  path: string;
  /** Only visible when user is authenticated */
  protected?: boolean;
  /** Only visible to admin users */
  adminOnly?: boolean;
  /** Premium badge label (e.g., "AI", "PRO") */
  badge?: string;
}

export interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
}

/** Top navigation pill tabs — mirrors Flutter's horizontal tab bar */
export const TOP_NAV_TABS: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: 'Home', path: '/' },
  { id: 'ai', label: 'Raya', icon: 'Sparkles', path: '/ai-assistant', badge: 'AI' },
  { id: 'quran', label: 'Quran Reading', icon: 'BookOpen', path: '/quran' },
  // Hidden from top bar per request — entries preserved for easy restore:
  // { id: 'connections', label: 'Connections', icon: 'Users', path: '/connections' },
  // { id: 'wallet', label: 'Wallet', icon: 'CreditCard', path: '/wallet' },
  { id: 'barka-labs', label: 'Barakah Labs', icon: 'Sparkle', path: '/barakah-labs' },
];

/** Bottom navigation tabs (mobile) — 4 core tabs.
 *  One shared dock used on every mobile route (home + raya + quran + barakah).
 *  Replaces the previous per-feature docks (HomeReferenceDock, barakah-labs Dock). */
export const BOTTOM_NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: 'Home', path: '/' },
  { id: 'ai', label: 'Raya', icon: 'Sparkles', path: '/ai-assistant', badge: 'AI' },
  { id: 'quran', label: 'Quran', icon: 'BookOpen', path: '/quran' },
  { id: 'barakah', label: 'Barakah', icon: 'Flask', path: '/barakah-labs' },
];

/**
 * Sidebar sections — matches Flutter's 6-section drawer menu
 * Flutter source: navigation_home.dart _buildDrawerContent()
 */
export const SIDEBAR_SECTIONS: NavSectionConfig[] = [
  {
    title: 'Finance',
    items: [
      { id: 'home', label: 'Home', icon: 'Home', path: '/' },
      { id: 'wallet', label: 'Wallet', icon: 'CreditCard', path: '/wallet' },
      { id: 'screener', label: 'Screener', icon: 'BarChart3', path: '/screener' },
      { id: 'zakat', label: 'Zakat', icon: 'Calculator', path: '/zakat' },
      { id: 'eim', label: 'EIM', icon: 'Sparkles', path: '/eim', badge: 'NEW' },
      // Halal Trading (EIM v2, T1) — built but DEFERRED (2026-06-04). Launcher
      // tile hidden so users don't hit the read-only mock; routes/code remain at
      // /features/trading and `/trading` for when trading work resumes.
      // { id: 'halal-trading', label: 'Trading', icon: 'TrendingUp', path: '/trading', badge: 'NEW' },
      { id: 'debt', label: 'Debt', icon: 'Wallet', path: '/debt', badge: 'SOON' },
      { id: 'islamic-banking', label: 'Bank', icon: 'Landmark', path: '/islamic-banking', badge: 'SOON' },
      { id: 'bait-ul-maal', label: 'Bait Maal', icon: 'HandCoins', path: '/bait-ul-maal', badge: 'SOON' },
      { id: 'chamber', label: 'Chamber', icon: 'Briefcase', path: '/chamber', badge: 'SOON' },
      { id: 'shark-tank', label: 'Investors', icon: 'Lightbulb', path: '/shark-tank', badge: 'SOON' },
    ],
  },
  {
    title: 'Islamic',
    items: [
      { id: 'quran', label: 'Quran', icon: 'BookOpen', path: '/quran' },
      { id: 'prayer', label: 'Prayer', icon: 'Clock', path: '/prayer-times' },
      { id: 'faith', label: 'Faith', icon: 'Heart', path: '/faith', badge: 'SOON' },
      { id: 'media', label: 'Media', icon: 'Library', path: '/media', badge: 'SOON' },
      { id: 'education', label: 'Education', icon: 'GraduationCap', path: '/education', badge: 'SOON' },
      { id: 'barka-labs', label: 'Barakah Labs', icon: 'Flask', path: '/barakah-labs' },
      { id: 'ramadan-kids', label: 'Ramadan', icon: 'Star', path: '/ramadan-kids', badge: 'SOON' },
    ],
  },
  {
    title: 'Community',
    items: [
      { id: 'connections', label: 'Connections', icon: 'UserPlus', path: '/connections' },
      { id: 'messages', label: 'Messages', icon: 'ChatCircleDots', path: '/messages' },
      { id: 'halaqah', label: 'Halaqah', icon: 'UsersRound', path: '/halaqah', badge: 'SOON' },
      { id: 'matrimony', label: 'Matrimony', icon: 'HeartHandshake', path: '/sakinah' },
      { id: 'halal-intimacy', label: 'Intimacy', icon: 'HeartPulse', path: '/halal-intimacy', badge: 'SOON' },
      { id: 'events', label: 'Events', icon: 'CalendarDays', path: '/events', badge: 'SOON' },
    ],
  },
  {
    title: 'Services',
    items: [
      { id: 'souk', label: 'Souk', icon: 'Store', path: '/souk' },
      { id: 'commerce', label: 'Commerce', icon: 'Store', path: '/commerce', badge: 'SOON' },
      { id: 'real-estate', label: 'Property', icon: 'Building', path: '/real-estate', badge: 'SOON' },
      { id: 'digital-id', label: 'Digital ID', icon: 'IdCard', path: '/digital-id', badge: 'SOON' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { id: 'ai', label: 'Raya AI', icon: 'Sparkles', path: '/ai-assistant', badge: 'AI' },
      { id: 'raya-agent', label: 'Raya on WA', icon: 'WhatsappLogo', path: '/raya' },
      { id: 'voice', label: 'Voice', icon: 'Mic', path: '/voice-companion', badge: 'SOON' },
      { id: 'halaqah-admin', label: 'Halaqah', icon: 'ShieldCheck', path: '/halaqah-admin' },
      { id: 'tiswa', label: 'TISWA', icon: 'School', path: '/tiswa', badge: 'SOON' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Profile', icon: 'User', path: '/profile' },
      { id: 'notifications', label: 'Alerts', icon: 'Bell', path: '/notifications' },
      { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings' },
      { id: 'support', label: 'Support', icon: 'LifeBuoy', path: '/support' },
      { id: 'help', label: 'Help', icon: 'HelpCircle', path: '/help' },
    ],
  },
];
