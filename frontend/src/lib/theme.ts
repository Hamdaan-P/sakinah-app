/**
 * Theme tokens — Barakah Labs palette (deep blue-black + warm gold + ink cream).
 * Token names preserved for backwards compatibility with existing imports.
 * Source palette: barakah-labs-mvp-v2.
 */

export const theme = {
  // Primary palette — names kept for compat, values are Barakah deep blue-blacks
  primaryTeal: '#0F141F',
  tealMedium: '#10151F',
  tealLight: '#1A2030',
  tealAccent: '#4FB892', // was cyan; now emerald-soft
  deepSea: '#06080D',

  // Backgrounds — Barakah depth hierarchy
  backgroundPrimary: '#0A0E16',
  backgroundSecondary: '#0F141F',
  backgroundCard: '#10151F',
  backgroundElevated: '#161D2C',
  backgroundModal: '#0D1119',
  backgroundDropdown: '#161D2C',
  backgroundSurface: '#0F141F',

  // Gold palette — Barakah
  primaryGold: '#D4A853',
  accentGold: '#E8C97A',
  deepGold: '#B8893A',
  antiqueGold: '#C9A85C',
  paleGold: '#F5E8C7',
  roseGold: '#C97A6B',

  // Text colors — Barakah ink scale
  textPrimary: '#F5E8C7',
  textSecondary: '#C9C0A8',
  textTertiary: '#7A7363',
  textLight: '#5C5749',
  textDisabled: '#4A4639',
  textHeading: '#E8C97A',

  // Borders — Barakah rule tones
  border: 'rgba(245,232,199,0.08)',
  borderStrong: 'rgba(245,232,199,0.16)',
  borderFocus: 'rgba(212,168,83,0.6)',
  borderSubtle: 'rgba(245,232,199,0.04)',
  divider: 'rgba(245,232,199,0.08)',

  // Semantic — kept (signaling colors stay universal)
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Islamic finance — kept
  halal: '#22C55E',
  haram: '#DC2626',
  questionable: '#EAB308',
  shariahCompliant: '#059669',

  // Barakah-native accents (use these for new work)
  emerald: '#2A9D6F',
  emeraldSoft: '#4FB892',
  rose: '#C97A6B',
  goldWarm: '#E8C97A',
  goldDeep: '#B8893A',
  ink: '#F5E8C7',
  inkSoft: '#C9C0A8',
  inkMute: '#7A7363',
  inkFaint: '#4A4639',
} as const;
