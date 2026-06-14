/**
 * Scroll helpers — the app body is `h-screen overflow-hidden` and MainLayout's
 * `<main>` is the actual scrolling element, so `window.scrollTo` is a no-op on
 * any authenticated route. Use `scrollMainToTop()` whenever a page or sub-page
 * changes internal state (step, tab, ayah index, etc.) and you want the reader
 * to land at the top.
 *
 * Route changes are already handled at MainLayout level — only intra-page
 * state changes need this helper.
 */

export function scrollMainToTop(behavior: ScrollBehavior = 'auto'): void {
  if (typeof document === 'undefined') return;
  const main = document.querySelector('main');
  if (main) {
    main.scrollTo({ top: 0, left: 0, behavior });
    return;
  }
  // Fallback for pages rendered outside MainLayout (public routes:
  // login, signup, /welcome, /shared/*, /u/*, /legal/*) where body
  // is the natural scroller.
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, left: 0, behavior });
  }
}
