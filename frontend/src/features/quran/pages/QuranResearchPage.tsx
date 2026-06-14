/**
 * QuranResearchPage — `/quran/research`
 *
 * Cross-source topical research (Quran / hadith / tafsir & books). Fans out a
 * single search to the backend `/quran/research/search` endpoint and renders
 * the bucketed results with per-result citation chips. Users can save items
 * into localStorage-backed collections (researchCollectionsService).
 *
 * Governance: AiDisclaimerBanner at top; per-result citations are required;
 * low-confidence responses surface LowConfidenceNotice with a redirection
 * suggestion (per Workstream 4).
 */

import { useCallback, useEffect, useState } from 'react';
import type { ResearchBucket, ResearchResponse, ResearchResult } from '../types/quran.types';
import { searchResearch } from '../services/researchService';
import {
  ensureDefaultCollection,
  listCollections,
  onCollectionsChange,
  saveResultToCollection,
} from '../services/researchCollectionsService';
import { AiDisclaimerBanner } from '../components/governance/AiDisclaimerBanner';
import { LowConfidenceNotice } from '../components/governance/LowConfidenceNotice';
import { ScholarlyPerspectivesNotice } from '../components/governance/ScholarlyPerspectivesNotice';
import { ResearchSearchBar } from '../components/research/ResearchSearchBar';
import { ResearchResultCard } from '../components/research/ResearchResultCard';
import { CollectionsDrawer } from '../components/research/CollectionsDrawer';
import { StudySheetComposer } from '../components/research/StudySheetComposer';

type Tab = 'all' | ResearchBucket;

const TAB_LABELS: Record<Tab, string> = {
  all: 'All',
  quran: 'Quran',
  hadith: 'Hadith',
  tafsir: 'Tafsir & Books',
};

export function QuranResearchPage() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [collections, setCollections] = useState(() => listCollections());
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saveFlash, setSaveFlash] = useState<string | null>(null);

  // Study-sheet composer state (PDF Section 11 item 3 — guided thematic research).
  const [sheetItems, setSheetItems] = useState<ResearchResult[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => onCollectionsChange(() => setCollections(listCollections())), []);

  // Ensure there is at least one collection so "Save" works on first run.
  useEffect(() => {
    if (collections.length === 0) {
      ensureDefaultCollection();
    } else if (!selectedCollectionId) {
      setSelectedCollectionId(collections[0].id);
    }
  }, [collections, selectedCollectionId]);

  const onSearch = useCallback(async (q: string) => {
    setQuery(q);
    setLoading(true);
    setError(null);
    try {
      const r = await searchResearch({ query: q, limit: 6 });
      setResponse(r);
      setTab('all');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed.');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const onSave = useCallback(
    (result: ResearchResult) => {
      const colId = selectedCollectionId ?? collections[0]?.id;
      if (!colId) return;
      const item = saveResultToCollection(colId, result);
      if (item) {
        setSaveFlash('Saved');
        setTimeout(() => setSaveFlash(null), 1500);
      }
    },
    [selectedCollectionId, collections],
  );

  const buckets = response?.buckets;
  const counts = {
    quran: buckets?.quran.length ?? 0,
    hadith: buckets?.hadith.length ?? 0,
    tafsir: buckets?.tafsir.length ?? 0,
  };
  const total = counts.quran + counts.hadith + counts.tafsir;

  const visible: ResearchResult[] = !buckets
    ? []
    : tab === 'all'
      ? [...buckets.quran, ...buckets.hadith, ...buckets.tafsir]
      : buckets[tab];

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-5">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Topic Research
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Search a theme or concept across Quran verses, verified hadith, and indexed tafsir/books.
        </p>
      </header>

      <AiDisclaimerBanner />

      <div className="space-y-3">
        <ResearchSearchBar initialValue={query} loading={loading} onSubmit={onSearch} />

        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Save to:</span>
            <select
              value={selectedCollectionId ?? ''}
              onChange={(e) => setSelectedCollectionId(e.target.value || null)}
              className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-sm"
              aria-label="Active collection"
            >
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {saveFlash && (
              <span className="text-xs text-primaryTeal" aria-live="polite">
                {saveFlash}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="text-xs px-3 py-1 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Study sheet ({sheetItems.length})
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="text-xs px-3 py-1 rounded border border-primaryTeal/30 text-primaryTeal hover:bg-primaryTeal/10"
            >
              View collections
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-amber-400/40 bg-amber-50/40 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-200 space-y-2"
        >
          <p className="font-medium">Topic Research isn't reachable yet.</p>
          <p className="leading-relaxed">{error}</p>
          <details className="text-xs opacity-90">
            <summary className="cursor-pointer">How to fix this</summary>
            <ol className="list-decimal ml-5 mt-2 space-y-1 leading-relaxed">
              <li>
                The endpoints used by this page live on the
                <code className="mx-1 px-1 rounded bg-amber-100/60 dark:bg-amber-900/40">
                  feature/rayah-plus-quran
                </code>
                branch. Deploy the branch's backend changes to your Railway service, or run the
                backend locally with <code className="mx-1 px-1 rounded bg-amber-100/60 dark:bg-amber-900/40">docker compose up</code>.
              </li>
              <li>
                Update <code className="mx-1 px-1 rounded bg-amber-100/60 dark:bg-amber-900/40">frontend/.env.local</code>
                so <code className="mx-1 px-1 rounded bg-amber-100/60 dark:bg-amber-900/40">VITE_BACKEND_URL</code> points
                at the backend that has these endpoints.
              </li>
              <li>Restart the Vite dev server so the new env value is picked up.</li>
            </ol>
          </details>
        </div>
      )}

      {response && (
        <>
          {!response.meets_threshold && total === 0 ? (
            <LowConfidenceNotice
              suggestion="Try a more specific or narrower term — for example, replace a broad theme with a concrete word or name."
            />
          ) : (
            <>
              <div role="tablist" aria-label="Result buckets" className="flex flex-wrap gap-2">
                {(['all', 'quran', 'hadith', 'tafsir'] as Tab[]).map((t) => {
                  const count = t === 'all' ? total : counts[t as ResearchBucket];
                  const active = tab === t;
                  return (
                    <button
                      key={t}
                      role="tab"
                      aria-selected={active}
                      onClick={() => setTab(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-primaryTeal text-white border-primaryTeal'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {TAB_LABELS[t]} <span className="opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              <ScholarlyPerspectivesNotice
                sources={visible.map((r) =>
                  r.citation.kind === 'quran'
                    ? r.citation.surah_name
                    : r.citation.kind === 'hadith'
                      ? r.citation.collection
                      : r.citation.book,
                )}
              />

              <div className="space-y-3">
                {visible.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No results in this bucket.
                  </p>
                )}
                {visible.map((r, i) => (
                  <ResearchResultCard
                    key={`${r.bucket}-${i}-${r.relevance_score}`}
                    result={r}
                    onSave={onSave}
                    onAddToSheet={(item) => {
                      setSheetItems((prev) =>
                        prev.some(
                          (p) =>
                            p.bucket === item.bucket &&
                            p.excerpt === item.excerpt &&
                            p.relevance_score === item.relevance_score,
                        )
                          ? prev
                          : [...prev, item],
                      );
                      setSaveFlash('Added to sheet');
                      setTimeout(() => setSaveFlash(null), 1500);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <CollectionsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <StudySheetComposer
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        topic={query || 'Quran research'}
        selected={sheetItems}
        onRemove={(idx) => setSheetItems((prev) => prev.filter((_, i) => i !== idx))}
      />
    </main>
  );
}

export default QuranResearchPage;
