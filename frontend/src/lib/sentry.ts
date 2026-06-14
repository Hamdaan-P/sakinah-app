/**
 * Sentry initialization for the React frontend.
 *
 * Init is gated on `VITE_SENTRY_DSN` — if unset (e.g. local dev, preview
 * builds), `initSentry()` is a no-op. Production sets the DSN via GitHub
 * Secret + Vite injects it at build time.
 *
 * What's captured:
 *  - Unhandled exceptions in any React render or event handler
 *  - Unhandled promise rejections
 *  - Performance traces for navigation + slow user interactions
 *  - Session replay (with PII masking — see config below) for sessions
 *    that hit an error
 *
 * Privacy posture:
 *  - `sendDefaultPii: false` — Sentry won't auto-attach IPs / cookies / users.
 *  - `Replay({ maskAllText: true, blockAllMedia: true })` — every text node
 *    in the DOM is replaced with a stub in the replay; images/video are
 *    blocked entirely. This is mandatory for an Islamic counseling app
 *    where chat content is sensitive by default.
 */
import * as Sentry from '@sentry/react';

let _initialized = false;

export function initSentry(): boolean {
  if (_initialized) return true;

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    if (import.meta.env.DEV) {
      console.info('[Sentry] VITE_SENTRY_DSN not set — disabled');
    }
    return false;
  }

  const environment = import.meta.env.VITE_ENVIRONMENT || (import.meta.env.PROD ? 'production' : 'development');
  const isProd = environment === 'production';

  Sentry.init({
    dsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // 10% of normal traffic in prod (perf), 100% in dev for visibility.
    tracesSampleRate: isProd ? 0.1 : 1.0,
    // Sample 10% of regular sessions for replay; ALL sessions where an
    // error occurred — that's the actually-useful replay set.
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // CRITICAL: stops Sentry from auto-attaching cookies / IP / user info.
    sendDefaultPii: false,
    // Strip the X-Request-ID from outgoing requests so you can correlate a
    // browser-side error with a backend log line.
    tracePropagationTargets: ['localhost', /^https:\/\/.*\.zaryahplus\.com/, /^https:\/\/.*\.railway\.app/],
  });

  _initialized = true;
  reportWebVitals();
  return true;
}

/**
 * Report Core Web Vitals (LCP / FID / CLS / INP / TTFB) and FCP to Sentry as
 * distribution measurements so you can see real-user perf in the Sentry
 * Performance tab. Each metric callback fires once when its value stabilizes.
 *
 * Units convention:
 *   - LCP, FID, INP, TTFB, FCP → milliseconds
 *   - CLS → unitless score (0–1, lower is better)
 */
function reportWebVitals(): void {
  // Lazy import keeps web-vitals out of the bundle critical path —
  // the metrics module only loads after Sentry is initialized.
  void import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
    const send = (name: string, value: number, unit: 'millisecond' | 'none' = 'millisecond') => {
      // distribution() preserves the per-event value (vs gauge which overwrites)
      // so the dashboard can render p50/p75/p95 over real users.
      Sentry.metrics.distribution(`web_vitals.${name}`, value, { unit });
    };
    onLCP((m) => send('lcp', m.value));
    onINP((m) => send('inp', m.value));
    onCLS((m) => send('cls', m.value, 'none'));
    onFCP((m) => send('fcp', m.value));
    onTTFB((m) => send('ttfb', m.value));
  }).catch((err) => {
    // Non-fatal; perf telemetry is nice-to-have, not load-bearing.
    if (import.meta.env.DEV) console.warn('[Sentry] web-vitals load failed:', err);
  });
}

// Re-export the ErrorBoundary so callers don't need their own @sentry/react import.
export { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
