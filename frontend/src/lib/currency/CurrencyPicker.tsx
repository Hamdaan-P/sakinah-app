/**
 * Compact currency picker used by any feature that renders monetary values.
 *
 * Click → dropdown of supported currencies (flag + code + name).
 * Selection persists across sessions via the shared currency store. A small
 * "auto" link resets to browser-locale default for users who want the
 * display to follow their device setting again.
 */

import { useEffect, useRef, useState } from 'react';
import { CaretDown, GlobeHemisphereEast } from '@phosphor-icons/react';
import { useCurrencyStore, SUPPORTED_CURRENCIES, CURRENCY_META } from './store';

export function CurrencyPicker() {
  const displayCurrency = useCurrencyStore((s) => s.displayCurrency);
  const userOverridden = useCurrencyStore((s) => s.userOverridden);
  const setDisplayCurrency = useCurrencyStore((s) => s.setDisplayCurrency);
  const resetToLocale = useCurrencyStore((s) => s.resetToLocale);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  const current = CURRENCY_META[displayCurrency];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] hover:border-[rgba(212,168,83,0.40)] text-[11px] text-[#F5E8C7] transition-colors"
        aria-label="Change display currency"
        aria-expanded={open}
      >
        <span className="text-[13px] leading-none">{current.flag}</span>
        <span className="font-semibold">{displayCurrency}</span>
        <CaretDown size={10} weight="bold" className="text-[#5C5749]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-xl bg-[#101a2a] border border-[rgba(212,168,83,0.30)] shadow-xl overflow-hidden">
          <div className="px-3 py-2 text-[9px] uppercase tracking-widest text-[#5C5749] border-b border-[rgba(212,168,83,0.10)] flex items-center justify-between">
            <span>Display currency</span>
            {userOverridden && (
              <button
                onClick={() => {
                  resetToLocale();
                  setOpen(false);
                }}
                className="flex items-center gap-1 text-[#D4A853] hover:text-[#E8C97A] normal-case tracking-normal"
              >
                <GlobeHemisphereEast size={10} weight="bold" />
                Auto
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {SUPPORTED_CURRENCIES.map((c) => {
              const meta = CURRENCY_META[c];
              const active = c === displayCurrency;
              return (
                <button
                  key={c}
                  onClick={() => {
                    setDisplayCurrency(c);
                    setOpen(false);
                  }}
                  className={[
                    'w-full px-3 py-2 flex items-center gap-2.5 text-left text-[12px] transition-colors',
                    active
                      ? 'bg-[rgba(212,168,83,0.12)] text-[#F5E8C7]'
                      : 'text-[#7A7363] hover:bg-[rgba(212,168,83,0.06)] hover:text-[#F5E8C7]',
                  ].join(' ')}
                >
                  <span className="text-[15px] leading-none">{meta.flag}</span>
                  <span className="font-semibold">{c}</span>
                  <span className="text-[10px] text-[#5C5749] truncate">{meta.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrencyPicker;
