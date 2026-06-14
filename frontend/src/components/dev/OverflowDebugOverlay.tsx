/**
 * OverflowDebugOverlay — diagnose iOS Safari fit-to-page zoom-out.
 *
 * iOS Safari auto-zooms out when the document is wider than the viewport,
 * making the whole site look "shrunken to ~50%". This overlay finds which
 * element is forcing the overflow so we can fix the layout instead of
 * trying to detect & prompt for browser-zoom (which iOS doesn't expose).
 *
 * Usage:
 *   - Open the site with `?debug=overflow` on any page → overlay activates
 *     for the rest of the session and survives client-side navigation.
 *   - Add `?debug=off` (or tap the close button) to disable.
 *
 * Production cost: zero. The component returns null unless the param/storage
 * flag is set, so it never measures or paints for normal users.
 */

import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'zaryah_debug_overflow';
const SELF_ATTR = 'data-overflow-debug';
const OFFENDER_ATTR = 'data-overflow-offender';

interface Offender {
  el: Element;
  right: number;
  width: number;
  tag: string;
  className: string;
}

function readActiveFlag(): boolean {
  const params = new URLSearchParams(window.location.search);
  const param = params.get('debug');
  if (param === 'overflow') {
    sessionStorage.setItem(STORAGE_KEY, '1');
    return true;
  }
  if (param === 'off') {
    sessionStorage.removeItem(STORAGE_KEY);
    return false;
  }
  return sessionStorage.getItem(STORAGE_KEY) === '1';
}

function clearOutlines() {
  document.querySelectorAll(`[${OFFENDER_ATTR}]`).forEach((el) => {
    el.removeAttribute(OFFENDER_ATTR);
    (el as HTMLElement).style.outline = '';
    (el as HTMLElement).style.outlineOffset = '';
  });
}

export function OverflowDebugOverlay() {
  const [active, setActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return readActiveFlag();
  });
  const [viewport, setViewport] = useState(0);
  const [docWidth, setDocWidth] = useState(0);
  const [offenders, setOffenders] = useState<Offender[]>([]);
  const rafRef = useRef<number | null>(null);

  // Re-evaluate the flag on history changes (SPA navigation can drop ?debug=...).
  useEffect(() => {
    const check = () => setActive(readActiveFlag());
    window.addEventListener('popstate', check);
    return () => window.removeEventListener('popstate', check);
  }, []);

  useEffect(() => {
    if (!active) {
      clearOutlines();
      return;
    }

    const measure = () => {
      const vw = window.innerWidth;
      const dw = document.documentElement.scrollWidth;
      setViewport(vw);
      setDocWidth(dw);

      const found: Offender[] = [];
      // Skip the overlay itself.
      document.querySelectorAll('body *').forEach((el) => {
        if (el.closest(`[${SELF_ATTR}]`)) return;
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.right > vw + 1) {
          found.push({
            el,
            right: rect.right,
            width: rect.width,
            tag: el.tagName.toLowerCase(),
            className: (el.className || '').toString().slice(0, 80),
          });
        }
      });

      const offenderSet = new Set(found.map((o) => o.el));
      document.querySelectorAll(`[${OFFENDER_ATTR}]`).forEach((el) => {
        if (!offenderSet.has(el)) {
          el.removeAttribute(OFFENDER_ATTR);
          (el as HTMLElement).style.outline = '';
          (el as HTMLElement).style.outlineOffset = '';
        }
      });
      found.forEach(({ el }) => {
        if (!el.hasAttribute(OFFENDER_ATTR)) {
          el.setAttribute(OFFENDER_ATTR, '1');
          (el as HTMLElement).style.outline = '2px solid #ff3b30';
          (el as HTMLElement).style.outlineOffset = '-2px';
        }
      });

      found.sort((a, b) => b.right - a.right);
      setOffenders(found.slice(0, 8));
    };

    const schedule = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };

    measure();

    const ro = new ResizeObserver(schedule);
    ro.observe(document.documentElement);
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  if (!active) return null;

  const overflow = docWidth - viewport;
  const overflowing = overflow > 1;

  const dismiss = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    clearOutlines();
    setActive(false);
  };

  return (
    <div
      {...{ [SELF_ATTR]: '1' }}
      style={{
        position: 'fixed',
        top: 'max(env(safe-area-inset-top), 0px)',
        left: 0,
        right: 0,
        zIndex: 2147483647,
        background: overflowing ? 'rgba(255,59,48,0.95)' : 'rgba(16,185,129,0.92)',
        color: '#fff',
        font: '11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace',
        padding: '6px 10px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <strong>OVERFLOW DEBUG</strong>
        <button
          type="button"
          onClick={dismiss}
          style={{
            background: 'rgba(0,0,0,0.3)',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '2px 8px',
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          × close
        </button>
      </div>
      <div>
        viewport: <b>{viewport}px</b> · document: <b>{docWidth}px</b> · overflow:{' '}
        <b>{overflow > 0 ? `+${overflow}px` : '0px'}</b>
      </div>
      {offenders.length > 0 ? (
        <details style={{ marginTop: 4 }} open>
          <summary style={{ cursor: 'pointer' }}>
            top {offenders.length} offender{offenders.length === 1 ? '' : 's'} (red outline)
          </summary>
          <ol style={{ margin: '4px 0 0 18px', padding: 0 }}>
            {offenders.map((o, i) => (
              <li key={i} style={{ marginBottom: 2 }}>
                <code>{o.tag}</code> · right {Math.round(o.right)}px · width {Math.round(o.width)}px
                {o.className && (
                  <>
                    {' · '}
                    <span style={{ opacity: 0.85 }}>{o.className}</span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </details>
      ) : overflowing ? (
        <div>document wider than viewport but no individual element pinned — check fixed / absolute descendants.</div>
      ) : (
        <div>no element overflows the viewport right edge ✓</div>
      )}
    </div>
  );
}
