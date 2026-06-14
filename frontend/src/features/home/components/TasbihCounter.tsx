/**
 * Tasbih Counter - daily dhikr widget.
 *
 * Daily counts persist in localStorage and reset at local midnight. Each dhikr
 * has its own target, active selection, reset action, milestone haptic, and
 * bead-fill progress.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowsClockwise, CaretRight, HandTap } from '@phosphor-icons/react';

interface Dhikr {
  key: string;
  arabic: string;
  translit: string;
  meaning: string;
  target: number;
}

const DHIKRS: Dhikr[] = [
  { key: 'subhanallah', arabic: 'سُبْحَانَ ٱللَّٰه', translit: 'SubhanAllah', meaning: 'Glory be to Allah', target: 33 },
  { key: 'alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّٰه', translit: 'Alhamdulillah', meaning: 'All praise to Allah', target: 33 },
  { key: 'allahuakbar', arabic: 'ٱللَّٰهُ أَكْبَر', translit: 'Allahu akbar', meaning: 'Allah is greatest', target: 33 },
  { key: 'astaghfirullah', arabic: 'أَسْتَغْفِرُ ٱللَّٰه', translit: 'Astaghfirullah', meaning: 'I seek forgiveness from Allah', target: 100 },
  { key: 'lahawla', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰه', translit: 'La hawla wa la quwwata illa billah', meaning: 'No power except with Allah', target: 100 },
  { key: 'salawat', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّد', translit: 'Allahumma salli ala Muhammad', meaning: 'Blessings upon the Prophet', target: 100 },
  { key: 'tahlil', arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰه', translit: 'La ilaha illallah', meaning: 'There is no god but Allah', target: 100 },
  { key: 'hasbunallah', arabic: 'حَسْبُنَا ٱللَّٰهُ وَنِعْمَ ٱلْوَكِيل', translit: 'Hasbunallahu wa nimal wakil', meaning: 'Allah is sufficient for us', target: 40 },
  { key: 'bismillah', arabic: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيم', translit: 'Bismillahir-rahmanir-rahim', meaning: 'In the name of Allah', target: 21 },
  { key: 'rabbighfirli', arabic: 'رَبِّ اغْفِرْ لِي', translit: 'Rabbi-ghfir li', meaning: 'My Lord, forgive me', target: 100 },
];

const STORAGE_NAME = 'tasbih_counts_v1';
const ACTIVE_STORAGE = 'tasbih_active_dhikr_v1';
const RING_CIRCUMFERENCE = 2 * Math.PI * 52;

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface CountState {
  date: string;
  counts: Record<string, number>;
}

function loadState(): CountState {
  try {
    const raw = localStorage.getItem(STORAGE_NAME);
    if (!raw) return { date: todayISO(), counts: {} };
    const parsed = JSON.parse(raw) as CountState;
    if (parsed.date !== todayISO()) {
      return { date: todayISO(), counts: {} };
    }
    return parsed;
  } catch {
    return { date: todayISO(), counts: {} };
  }
}

function saveState(s: CountState) {
  try { localStorage.setItem(STORAGE_NAME, JSON.stringify(s)); } catch { /* ignore */ }
}

export function TasbihCounter() {
  const [state, setState] = useState<CountState>(() => loadState());
  const [activeIdx, setActiveIdx] = useState<number>(() => {
    try {
      const stored = parseInt(localStorage.getItem(ACTIVE_STORAGE) ?? '0', 10);
      return Number.isFinite(stored) && stored >= 0 && stored < DHIKRS.length ? stored : 0;
    } catch {
      return 0;
    }
  });
  const [bump, setBump] = useState(0);
  const [isMilestone, setIsMilestone] = useState(false);
  const [isSwitchOpen, setIsSwitchOpen] = useState(false);

  const dhikr = DHIKRS[activeIdx];
  const count = state.counts[dhikr.key] ?? 0;
  const inCycle = count % dhikr.target;
  const displayCount = count > 0 && inCycle === 0 ? dhikr.target : inCycle;
  const progress = count > 0 && inCycle === 0 ? 1 : inCycle / dhikr.target;
  const cycles = Math.floor(count / dhikr.target);
  const showMilestone = isMilestone && cycles > 0 && inCycle === 0;

  useEffect(() => {
    const check = setInterval(() => {
      const today = todayISO();
      if (state.date !== today) setState({ date: today, counts: {} });
    }, 60_000);
    return () => clearInterval(check);
  }, [state.date]);

  const handleTap = useCallback(() => {
    const next = count + 1;
    const milestone = next % dhikr.target === 0;
    const updated: CountState = {
      date: todayISO(),
      counts: { ...state.counts, [dhikr.key]: next },
    };
    setState(updated);
    saveState(updated);
    setBump((b) => b + 1);
    setIsMilestone(milestone);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(milestone ? [20, 30, 20] : 6); } catch { /* ignore */ }
    }
  }, [count, dhikr, state.counts]);

  const handleSelect = useCallback((idx: number) => {
    setActiveIdx(idx);
    setIsMilestone(false);
    setIsSwitchOpen(false);
    try { localStorage.setItem(ACTIVE_STORAGE, String(idx)); } catch { /* ignore */ }
  }, []);

  const handleReset = useCallback(() => {
    const updated: CountState = {
      date: todayISO(),
      counts: { ...state.counts, [dhikr.key]: 0 },
    };
    setState(updated);
    saveState(updated);
    setIsMilestone(false);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([10, 40, 10]); } catch { /* ignore */ }
    }
  }, [dhikr, state.counts]);

  const totalToday = useMemo(
    () => Object.values(state.counts).reduce((a, b) => a + b, 0),
    [state.counts]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-br from-[#0F141F]/60 to-[#0A0E16]"
    >
      <div className="relative flex flex-col items-center gap-4 px-4 py-5">
        <div className="absolute right-4 top-4 z-30">
          <button
            type="button"
            onClick={() => setIsSwitchOpen((open) => !open)}
            className="inline-flex h-8 cursor-pointer select-none items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[12px] text-[#5C5749] transition-colors hover:border-[#D4A853]/30 hover:bg-white/[0.06] hover:text-[#D4A853]"
            aria-expanded={isSwitchOpen}
            aria-controls="tasbih-switch-menu"
            aria-label="Switch dhikr"
          >
            <span className="inline-flex items-center gap-1">
              Switch
              <CaretRight
                size={11}
                className={['transition-transform', isSwitchOpen ? 'rotate-90' : ''].join(' ')}
              />
            </span>
          </button>

          <AnimatePresence>
            {isSwitchOpen && (
              <motion.div
                id="tasbih-switch-menu"
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="absolute right-0 top-10 w-[calc(100vw-3rem)] max-w-[19rem] overflow-hidden rounded-xl border border-white/10 bg-[#182231] shadow-[0_18px_36px_rgba(0,0,0,0.38)]"
                role="listbox"
                aria-label="Choose dhikr"
              >
                <div className="max-h-[18rem] overflow-y-auto py-1">
                  {DHIKRS.map((item, idx) => {
                    const itemCount = state.counts[item.key] ?? 0;
                    const isActive = idx === activeIdx;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleSelect(idx)}
                        className={[
                          'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors',
                          isActive ? 'bg-[#D4A853]/15 text-[#F5E8C7]' : 'text-[#7A7363] hover:bg-white/[0.05] hover:text-[#F5E8C7]',
                        ].join(' ')}
                        role="option"
                        aria-selected={isActive}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium">{item.translit}</span>
                          <span className="block truncate text-[11px] text-[#5C5749]">{item.meaning}</span>
                        </span>
                        <span className="shrink-0 text-[12px] tabular-nums text-[#D4A853]">
                          {itemCount}/{item.target}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          onClick={handleTap}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 520, damping: 30 }}
          className="group relative h-[120px] w-[120px] rounded-full cursor-pointer touch-manipulation select-none outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0E16]"
          aria-label={`Tap to count ${dhikr.translit}`}
        >
          <span className="absolute inset-[-9px] rounded-full border border-[#D4A853]/25 bg-[#D4A853]/5 opacity-80 transition-opacity duration-200 group-hover:opacity-100" />
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 120 120"
          >
            <circle cx="60" cy="60" r="52" stroke="rgba(212,168,83,0.12)" strokeWidth="4" fill="none" />
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke="url(#tasbihGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={(1 - progress) * RING_CIRCUMFERENCE}
              className="transition-all duration-200"
            />
            <defs>
              <linearGradient id="tasbihGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D4A853" />
                <stop offset="100%" stopColor="#E8C97A" />
              </linearGradient>
            </defs>
          </svg>
          <div
            className="absolute inset-[14px] rounded-full flex flex-col items-center justify-center border border-[#D4A853]/20 transition-all duration-200 group-hover:border-[#D4A853]/45 group-hover:shadow-[0_0_24px_rgba(212,168,83,0.22)]"
            style={{
              background: 'radial-gradient(circle at 35% 30%, rgba(212,168,83,0.22), rgba(10,14,22,0.9) 75%)',
              boxShadow: 'inset 0 5px 16px rgba(255,255,255,0.06), inset 0 -12px 20px rgba(0,0,0,0.26), 0 10px 24px rgba(0,0,0,0.26)',
            }}
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={bump}
                initial={{ scale: 0.88, opacity: 0.85 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: isMilestone ? 360 : 620, damping: 32, mass: 0.45 }}
                className="text-[30px] font-bold text-[#F5E8C7] tabular-nums leading-none"
              >
                {displayCount}
              </motion.span>
            </AnimatePresence>
            <span className="mt-1 text-[11px] text-[#5C5749]">of {dhikr.target}</span>
          </div>

          <motion.span
            aria-hidden="true"
            className="absolute -right-1 -bottom-1 grid h-9 w-9 place-items-center rounded-full border border-[#E8C97A]/45 bg-[#D4A853] text-[#0A0E16] shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <HandTap size={19} weight="fill" />
          </motion.span>

          <AnimatePresence>
            {bump > 0 && (
              <motion.span
                key={bump}
                aria-hidden="true"
                initial={{ opacity: 0, y: 4, scale: 0.9 }}
                animate={{ opacity: [0, 1, 0], y: [4, -12, -18], scale: [0.9, 1, 0.96] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, times: [0, 0.28, 1], ease: 'easeOut' }}
                className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 text-[13px] font-bold text-[#E8C97A]"
              >
                +1
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="inline-flex items-center gap-2 text-[13px] text-[#5C5749]">
          <HandTap size={16} weight="fill" className="text-[#D4A853]" />
          <span>Tap here to count</span>
        </div>

        <div className="w-full border-t border-white/8 pt-4 text-center">
          <p
            className="font-arabic mx-auto max-w-[22rem] text-[#F5E8C7] text-[25px] leading-relaxed"
            dir="rtl"
          >
            {dhikr.arabic}
          </p>
          <p className="mt-2 text-[14px] font-medium text-[#F5E8C7]">{dhikr.translit}</p>
          <p className="mt-0.5 text-[11px] text-[#5C5749]">{dhikr.meaning}</p>
        </div>
      </div>

      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#D4A853]/20 bg-[#D4A853]/10 px-4 py-2 text-center text-[12px] font-medium text-[#D4A853]">
              {cycles} x {dhikr.target} complete for {dhikr.translit}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between border-t border-white/8 px-4 py-3">
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-[#F5E8C7]">{cycles}</span>
          <span className="text-[11px] text-[#5C5749]">completed rounds</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[15px] font-semibold text-[#F5E8C7]">{totalToday}</span>
          <span className="text-[11px] text-[#5C5749]">today total</span>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-[#5C5749] transition-colors hover:text-[#F5E8C7] hover:bg-white/5"
          aria-label={`Reset ${dhikr.translit}`}
        >
          <ArrowsClockwise size={12} /> Reset
        </button>
      </div>
    </motion.div>
  );
}

export default TasbihCounter;
