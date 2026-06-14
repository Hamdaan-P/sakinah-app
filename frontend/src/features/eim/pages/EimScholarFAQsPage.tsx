/**
 * Scholar FAQ Archive — Tier 3 long-form scholar Q&A (master plan §6.L).
 *
 * Browse view with category filter + search + expandable Q&A cards. Each
 * card shows the question + scholar attribution + full answer + citations
 * + tags. This is the deeper scholar layer above the per-investment Ulama
 * Screening opinions.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CaretLeft,
  CaretDown,
  CaretUp,
  MagnifyingGlass,
  Books,
  User,
} from '@phosphor-icons/react';
import { eimTrack } from '../analytics';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { FetchError } from '../components/FetchError';
import { Markdownish } from '../components/Markdownish';
import { eimService } from '../services/eim.service';
import type { ScholarFAQ, ScholarFAQCategory } from '../types/eim.types';

type CategoryFilter = 'all' | ScholarFAQCategory;

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All categories',
  stocks_equities: 'Stocks & equities',
  crypto_digital_assets: 'Crypto & digital assets',
  insurance_takaful: 'Insurance & takaful',
  mortgages_home_finance: 'Mortgages & home finance',
  sukuk_bonds: 'Sukuk & bonds',
  business_models: 'Business models',
  pensions_savings: 'Pensions & savings',
  zakat_purification: 'Zakat & purification',
  employment_income: 'Employment & income',
  general: 'General',
};

export function EimScholarFAQsPage() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const q = useQuery({
    queryKey: ['eim', 'scholar-faqs'],
    queryFn: () => eimService.getScholarFAQs(),
    staleTime: 5 * 60_000,
  });

  const filtered = useMemo(() => {
    const all = q.data ?? [];
    const qLower = query.trim().toLowerCase();
    return all.filter((f) => {
      if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
      if (!qLower) return true;
      return (
        f.question.toLowerCase().includes(qLower) ||
        f.full_answer.toLowerCase().includes(qLower) ||
        f.tags.some((t) => t.toLowerCase().includes(qLower)) ||
        f.scholar_name.toLowerCase().includes(qLower)
      );
    });
  }, [q.data, categoryFilter, query]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // P10 analytics — debounced search firing. One event per *settled* query of
  // ≥2 chars, regardless of typing rate. No query text or PII is sent.
  const lastFiredRef = useRef('');
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    if (trimmed === lastFiredRef.current) return;
    const t = setTimeout(() => {
      lastFiredRef.current = trimmed;
      eimTrack('eim_scholar_faq_searched');
    }, 600);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-4xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/eim')}
            aria-label="Back to EIM home"
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
              EIM · Scholar Archive
            </div>
            <h1 className="text-[20px] font-bold text-[#F5E8C7]">Scholar FAQ Archive</h1>
          </div>
        </header>

        <DisclaimerBanner />

        {/* Description band */}
        <section className="px-5 mt-3">
          <div className="rounded-xl border border-[rgba(123,158,137,0.25)] bg-[rgba(42,157,111,0.05)] p-4 flex items-start gap-3">
            <Books size={18} weight="fill" color="#7BB39A" className="shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-[#D1D9E5] leading-relaxed">
              Long-form scholar Q&amp;A on the recurring questions a Muslim investor asks —
              stocks, crypto, insurance, mortgages, sukuk, pensions, employment. Each entry
              carries a named scholar voice with their full reasoning. <em>This is the deeper
              scholar layer above the per-investment Ulama Screening; ask the cited scholar's
              office for the most current view.</em>
            </p>
          </div>
        </section>

        {/* Search + category filter */}
        <section className="px-5 mt-4 space-y-2">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlass
              size={16}
              weight="bold"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5749]"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Q&A: 'mortgage', 'apple', 'bitcoin', '401k'..."
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#101a2a] border border-[rgba(212,168,83,0.18)] text-[13px] text-[#F5E8C7] placeholder-[#5C5749] focus:outline-none focus:border-[rgba(212,168,83,0.40)]"
            />
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className="h-7 px-2.5 rounded-lg text-[10.5px] font-semibold transition-all"
                style={{
                  background:
                    categoryFilter === c
                      ? 'linear-gradient(90deg, #D4A853, #E8C97A)'
                      : 'rgba(212,168,83,0.06)',
                  color: categoryFilter === c ? '#0A0E16' : '#7A7363',
                  border:
                    categoryFilter === c
                      ? '1px solid transparent'
                      : '1px solid rgba(212,168,83,0.18)',
                }}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </section>

        {/* Results */}
        <div className="px-5 mt-3 text-[11px] text-[#5C5749]">
          {q.isLoading
            ? 'Loading…'
            : `${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'}${
                query || categoryFilter !== 'all' ? ' (filtered)' : ''
              }`}
        </div>

        {q.error && (
          <FetchError
            error={q.error}
            retry={() => void q.refetch()}
            context="scholar FAQ archive"
          />
        )}

        <section className="px-3 mt-2 space-y-2.5">
          {filtered.map((faq) => (
            <FAQCard
              key={faq.id}
              faq={faq}
              expanded={expanded.has(faq.id)}
              onToggle={() => toggle(faq.id)}
            />
          ))}
          {!q.isLoading && filtered.length === 0 && (
            <div className="text-center py-10 text-[12px] text-[#5C5749] italic">
              No entries match these filters.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FAQCard({
  faq,
  expanded,
  onToggle,
}: {
  faq: ScholarFAQ;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 hover:bg-[rgba(212,168,83,0.04)] transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold mb-1">
              {(faq.category as string).replace(/_/g, ' ')}
            </div>
            <h3 className="text-[14.5px] font-bold text-[#F5E8C7] leading-snug">
              {faq.question}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#7A7363]">
              <User size={11} weight="bold" />
              <span className="font-semibold text-[#7BB39A]">{faq.scholar_name}</span>
              <span className="text-[#5C5749]">·</span>
              <span className="text-[#5C5749] italic truncate">{faq.scholar_role}</span>
            </div>
          </div>
          <div className="text-[#D4A853] shrink-0 mt-0.5">
            {expanded ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[rgba(212,168,83,0.12)] p-4 bg-[rgba(212,168,83,0.02)]">
          <div className="text-[13.5px] text-[#D1D9E5] leading-[1.75]">
            <Markdownish text={faq.full_answer} />
          </div>

          {faq.citations.length > 0 && (
            <div className="mt-4 rounded-xl border border-[rgba(212,168,83,0.14)] bg-[rgba(212,168,83,0.04)] p-3.5">
              <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold mb-1.5">
                📚 Citations
              </div>
              <ul className="space-y-1 text-[11.5px] text-[#7A7363]">
                {faq.citations.map((c, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className="text-[#D4A853]">·</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {faq.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {faq.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(212,168,83,0.10)] border border-[rgba(212,168,83,0.18)] text-[#7A7363]"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EimScholarFAQsPage;
