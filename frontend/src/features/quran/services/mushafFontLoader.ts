/**
 * Mushaf font loader.
 *
 * QCF V1/V2 are *per-page* glyph fonts: page N's `code_v1`/`code_v2` glyphs
 * only render correctly in page N's own font file. We inject an `@font-face`
 * on demand (and preload neighbours) so a swipe feels instant while keeping
 * the network footprint tiny (~15-50KB per page, cached by the browser/CDN).
 *
 * The Uthmani-Hafs and IndoPak styles use a single self-hosted font injected
 * once. All faces use `font-display:block` so a slow/late font never flashes
 * special marks as tofu boxes in a fallback that lacks them.
 */

import { QCF_FONT_CDN, SINGLE_FONTS, type MushafStyleId } from '../config/mushafStyles';

const injected = new Set<string>();
let styleEl: HTMLStyleElement | null = null;

function sheet(): HTMLStyleElement {
  if (styleEl && styleEl.isConnected) return styleEl;
  styleEl = document.createElement('style');
  styleEl.dataset.mushafFonts = 'true';
  document.head.appendChild(styleEl);
  return styleEl;
}

function addFace(family: string, url: string, display: 'swap' | 'block' = 'block') {
  if (injected.has(family)) return;
  injected.add(family);
  sheet().appendChild(
    document.createTextNode(
      `@font-face{font-family:'${family}';src:url('${url}') format('woff2');font-display:${display};}`,
    ),
  );
}

/** Family name used for a QCF page's injected face. */
export function qcfPageFamily(style: 'qcf_v1' | 'qcf_v2', page: number): string {
  return `${style === 'qcf_v1' ? 'qcfv1' : 'qcfv2'}-p${page}`;
}

/** Ensure the single Unicode fonts (Hafs / IndoPak) are registered. Idempotent. */
export function ensureSingleFonts(): void {
  addFace(SINGLE_FONTS.uthmaniHafs.family, SINGLE_FONTS.uthmaniHafs.url, 'block');
  addFace(SINGLE_FONTS.indopak.family, SINGLE_FONTS.indopak.url, 'block');
}

/**
 * Resolve the CSS `font-family` to apply for a given style + page, injecting
 * any face that isn't loaded yet. For glyph styles this is the per-page family;
 * for text styles it's the single-font family (registered lazily).
 */
export function ensureFontForPage(style: MushafStyleId, page: number): string {
  if (style === 'qcf_v1' || style === 'qcf_v2') {
    const family = qcfPageFamily(style, page);
    addFace(family, style === 'qcf_v1' ? QCF_FONT_CDN.v1(page) : QCF_FONT_CDN.v2(page), 'block');
    return family;
  }
  ensureSingleFonts();
  return style === 'uthmani_hafs' ? SINGLE_FONTS.uthmaniHafs.family : SINGLE_FONTS.indopak.family;
}

/**
 * Warm the cache for a style around `page` (prev / current / next). For glyph
 * styles this injects the neighbouring page faces; for text styles it just
 * registers the single font once. Safe to call repeatedly.
 */
export function preloadFontsAround(style: MushafStyleId, page: number): void {
  if (style === 'qcf_v1' || style === 'qcf_v2') {
    for (const p of [page, page + 1, page - 1]) {
      if (p >= 1 && p <= 604) ensureFontForPage(style, p);
    }
  } else {
    ensureSingleFonts();
  }
}
