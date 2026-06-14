/**
 * ZaryahPlus Typography System
 * Display: Cormorant Garamond, Body: DM Sans (Barakah palette).
 * Colors sourced from Barakah theme tokens in @/lib/theme.ts
 */

const themeColors = {
  primaryGold: '#D4A853',
  textSecondary: '#C9C0A8',
  textTertiary: '#7A7363',
  textLight: '#5C5749',
} as const;

export const typography = {
  // Display styles - Large gold headings
  displayLarge: {
    fontSize: '3.25rem',
    fontWeight: 700,
    color: themeColors.primaryGold,
    letterSpacing: '-0.4px',
    lineHeight: 1.05,
  },
  displayMedium: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: themeColors.primaryGold,
    letterSpacing: '0',
    lineHeight: 1.1,
  },
  displaySmall: {
    fontSize: '2rem',
    fontWeight: 600,
    color: themeColors.primaryGold,
    letterSpacing: '0',
    lineHeight: 1.15,
  },

  // Headline styles - Gold headings
  headlineLarge: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: themeColors.primaryGold,
    lineHeight: 1.25,
  },
  headlineMedium: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: themeColors.primaryGold,
    lineHeight: 1.3,
  },
  headlineSmall: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: themeColors.primaryGold,
    lineHeight: 1.35,
  },

  // Title styles - Gold titles
  titleLarge: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: themeColors.primaryGold,
    letterSpacing: '0.15px',
    lineHeight: 1.4,
  },
  titleMedium: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: themeColors.primaryGold,
    letterSpacing: '0.1px',
    lineHeight: 1.4,
  },
  titleSmall: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: themeColors.textSecondary,
    letterSpacing: '0.1px',
    lineHeight: 1.4,
  },

  // Body styles - White/grey for readability
  bodyLarge: {
    fontSize: '1rem',
    fontWeight: 400,
    color: themeColors.textSecondary,
    lineHeight: 1.6,
  },
  bodyMedium: {
    fontSize: '0.875rem',
    fontWeight: 400,
    color: themeColors.textSecondary,
    lineHeight: 1.6,
  },
  bodySmall: {
    fontSize: '0.75rem',
    fontWeight: 400,
    color: themeColors.textTertiary,
    lineHeight: 1.5,
  },

  // Label styles
  labelLarge: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: themeColors.primaryGold,
    letterSpacing: '0.5px',
  },
  labelMedium: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: themeColors.textSecondary,
    letterSpacing: '0.5px',
  },
  labelSmall: {
    fontSize: '0.625rem',
    fontWeight: 500,
    color: themeColors.textLight,
    letterSpacing: '0.5px',
  },
} as const;

export type TypographyKeys = keyof typeof typography;
