/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Teal/Navy palette — REMAPPED to Barakah deep blue-blacks.
        // Token names preserved for backwards compatibility; values are now
        // Barakah palette (no real teal/cyan in this theme).
        primaryTeal: '#0F141F',
        tealMedium: '#10151F',
        tealLight: '#1A2030',
        tealAccent: '#4FB892',   // was cyan; now emerald-soft
        deepSea: '#06080D',

        // Gold colors — Barakah palette
        primaryGold: '#D4A853',
        deepGold: '#B8893A',
        accentGold: '#E8C97A',
        antiqueGold: '#C9A85C',
        paleGold: '#F5E8C7',
        roseGold: '#C97A6B',

        // Backgrounds — Barakah depth hierarchy (near-black → blue-black)
        backgroundPrimary: '#0A0E16',
        backgroundSecondary: '#0F141F',
        backgroundCard: '#10151F',
        backgroundElevated: '#161D2C',
        backgroundModal: '#0D1119',
        backgroundDropdown: '#161D2C',
        backgroundSurface: '#0F141F',
        backgroundCream: '#F5E8C7',
        backgroundWhite: '#FBFCFE',

        // Text colors — Barakah ink scale
        textPrimary: '#F5E8C7',
        textSecondary: '#C9C0A8',
        textTertiary: '#7A7363',
        textLight: '#5C5749',
        textDisabled: '#4A4639',
        textHeading: '#E8C97A',
        textInverse: '#06080D',

        // Borders — Barakah "rule" tones (ink-on-dark, not gold-on-dark)
        border: 'rgba(245, 232, 199, 0.08)',
        borderStrong: 'rgba(245, 232, 199, 0.16)',
        borderFocus: 'rgba(212, 168, 83, 0.6)',
        borderSubtle: 'rgba(245, 232, 199, 0.04)',
        borderTeal: 'rgba(79, 184, 146, 0.25)',  // now emerald
        divider: 'rgba(245, 232, 199, 0.08)',

        // Semantic — kept (signaling roles must stay obvious)
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#3B82F6',

        // Islamic finance indicators — kept (red/green signaling is universal)
        halal: '#22C55E',
        haram: '#DC2626',
        questionable: '#EAB308',
        shariahCompliant: '#059669',

        // Chart & data
        bullish: '#22C55E',
        bearish: '#EF4444',
        neutral: '#D4A853',

        // Accent colors — remapped (no blue/cyan/purple in Barakah palette)
        electricCyan: '#E8C97A',     // was cyan; now gold-warm
        cyanLight: '#F5E8C7',        // ink
        electricPurple: '#4FB892',   // was purple; now emerald-soft
        purpleLight: '#2A9D6F',      // emerald
        coral: '#C97A6B',            // rose
        lavender: '#C9C0A8',         // ink-soft

        // Barakah palette — NEW canonical tokens for new work
        emerald: '#2A9D6F',
        emeraldSoft: '#4FB892',
        rose: '#C97A6B',
        goldWarm: '#E8C97A',
        goldDeep: '#B8893A',
        ink: '#F5E8C7',
        inkSoft: '#C9C0A8',
        inkMute: '#7A7363',
        inkFaint: '#4A4639',
        sheet: '#10151F',
        bgDeep: '#06080D',
        bgSoft: '#0F141F',
        rule: 'rgba(245, 232, 199, 0.08)',
        ruleSoft: 'rgba(245, 232, 199, 0.04)',

        // Carousel/feature card colors — kept distinct, but mapped onto the
        // gold/emerald/rose triad so adjacent cards still read apart.
        carouselGold: '#D4A853',
        carouselTeal: '#2A9D6F',
        carouselEmerald: '#4FB892',
        carouselBlue: '#E8C97A',
        carouselPurple: '#C97A6B',
        carouselOrange: '#B8893A',
        carouselRose: '#C97A6B',

        // Navy accents — REMAPPED to Barakah near-blacks
        navyDark: '#06080D',
        navyMedium: '#0A0E16',
        navyRich: '#0F141F',
        navyBlue: '#1A2030',
        midnightNavy: '#06080D',
        deepSpace: '#06080D',

        // Greys (dark mode optimized — collapsed onto Barakah dark scale)
        grey50: '#1A2030',
        grey100: '#161D2C',
        grey200: '#10151F',
        grey300: '#0F141F',
        grey400: '#0D1119',
        grey500: '#0A0E16',
        grey600: '#080B11',
        grey700: '#06080D',
        grey800: '#06080D',
        grey900: '#04060A',

        // Utility
        black: '#000000',
        white: '#FFFFFF',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['"KFGQPC HAFS Uthmanic Script"', '"Amiri"', '"Traditional Arabic"', '"Noto Naskh Arabic"', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Flutter typography scale
        'display-lg': ['3.25rem', { lineHeight: '1.05', letterSpacing: '-0.4px', fontWeight: '700' }],
        'display-md': ['2.5rem', { lineHeight: '1.1', letterSpacing: '0', fontWeight: '700' }],
        'display-sm': ['2rem', { lineHeight: '1.15', letterSpacing: '0', fontWeight: '600' }],
        'headline-lg': ['1.75rem', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '700' }],
        'headline-md': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '700' }],
        'headline-sm': ['1.25rem', { lineHeight: '1.35', letterSpacing: '0', fontWeight: '600' }],
        'title-lg': ['1.125rem', { lineHeight: '1.4', letterSpacing: '0.15px', fontWeight: '600' }],
        'title-md': ['0.9375rem', { lineHeight: '1.4', letterSpacing: '0.1px', fontWeight: '600' }],
        'title-sm': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.1px', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-md': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'label-lg': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.5px', fontWeight: '500' }],
        'label-md': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.5px', fontWeight: '500' }],
        'label-sm': ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.5px', fontWeight: '500' }],
        'button': ['0.875rem', { lineHeight: '1', letterSpacing: '0.75px', fontWeight: '600' }],
        'button-lg': ['1rem', { lineHeight: '1', letterSpacing: '0.75px', fontWeight: '600' }],
        'overline': ['0.625rem', { lineHeight: '1', letterSpacing: '1.5px', fontWeight: '500' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '400' }],
        'price': ['1.5rem', { lineHeight: '1', letterSpacing: '0.5px', fontWeight: '700' }],
      },
      boxShadow: {
        // Standard elevation system
        'none': 'none',
        'low': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 10px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.05)',
        'high': '0 8px 20px rgba(0, 0, 0, 0.2), 0 4px 10px rgba(0, 0, 0, 0.1)',
        'ultra': '0 16px 40px rgba(0, 0, 0, 0.25), 0 8px 20px rgba(0, 0, 0, 0.15)',

        // Gold glow shadows — Barakah gold rgb 212,168,83
        'gold': '0 4px 20px rgba(212, 168, 83, 0.3)',
        'gold-subtle': '0 2px 16px rgba(212, 168, 83, 0.2)',
        'gold-strong': '0 6px 30px rgba(212, 168, 83, 0.5), 0 0 4px rgba(212, 168, 83, 0.3)',
        'gold-intense': '0 8px 40px rgba(212, 168, 83, 0.6), 0 0 8px rgba(212, 168, 83, 0.4)',
        'gold-ambient': '0 0 24px rgba(212, 168, 83, 0.15)',
        'gold-card': '0 4px 16px rgba(212, 168, 83, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
        'gold-lg': '0 10px 30px rgba(212, 168, 83, 0.3), 0 4px 12px rgba(212, 168, 83, 0.2)',

        // Interactive state shadows
        'hover': '0 4px 16px rgba(212, 168, 83, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
        'pressed': '0 1px 4px rgba(212, 168, 83, 0.1)',
        'focused': '0 0 0 2px rgba(212, 168, 83, 0.4)',

        // Status shadows
        'success': '0 4px 16px rgba(16, 185, 129, 0.3)',
        'error': '0 4px 16px rgba(239, 68, 68, 0.3)',
        'warning': '0 4px 16px rgba(245, 158, 11, 0.3)',
        'info': '0 4px 16px rgba(59, 130, 246, 0.3)',

        // Glass-morphism shadows
        'glass': '0 4px 24px rgba(245, 232, 199, 0.08), 0 2px 12px rgba(0, 0, 0, 0.05)',
        'glass-gold': '0 4px 24px rgba(212, 168, 83, 0.15), 0 2px 12px rgba(0, 0, 0, 0.05)',

        // Border glow
        'gold-border-glow': '0 0 8px rgba(212, 168, 83, 0.2)',
        'gold-border-glow-strong': '0 0 12px rgba(212, 168, 83, 0.4), 0 0 1px rgba(212, 168, 83, 0.2)',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '18px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
        'full': '9999px',
      },
      borderWidth: {
        'hairline': '0.5px',
        DEFAULT: '1px',
        'medium': '1.5px',
        'thick': '2px',
        'extra-thick': '3px',
      },
      spacing: {
        // Flutter 4px-based spacing system aliases
        'xxxs': '4px',
        'xxs': '8px',
        'xs-space': '12px',
        'sm-space': '16px',
        'md-space': '20px',
        'lg-space': '24px',
        'xl-space': '32px',
        'xxl': '40px',
        'xxxl': '48px',
        'huge': '64px',
      },
      transitionDuration: {
        'instant': '100ms',
        'fast': '200ms',
        'normal': '300ms',
        'slow': '500ms',
        'slower': '800ms',
      },
    },
  },
  plugins: [],
}
