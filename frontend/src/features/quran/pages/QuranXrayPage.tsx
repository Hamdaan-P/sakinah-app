/**
 * QuranXrayPage — full surah X-Ray view.
 *
 * Renders revelation context, key stats grid, timeline, themes, and
 * connected verses. Pulls from /quran/surah/:id/xray. Empty state
 * when no curated entry exists.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { fetchSurahXray, type SurahXray } from '../services/xrayService';
import { AiDisclaimerBanner } from '../components/governance/AiDisclaimerBanner';
import { SourceCitationChip } from '../components/governance/SourceCitationChip';
import { isSurahInTadabburPilot, TADABBUR_PILOT_SURAH_NAMES } from '../config/tadabbur';

export function QuranXrayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const surahId = parseInt(id ?? '', 10);

  const [data, setData] = useState<SurahXray | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(surahId)) {
      setError('Invalid surah id');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSurahXray(surahId)
      .then((r) => { if (!cancelled) setData(r); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [surahId]);

  return (
    <div className="min-h-screen bg-[#0A0E16] text-[#F5E8C7]">
      <header className="px-4 py-4 flex items-center gap-3 border-b border-[rgba(212,168,83,0.15)] sticky top-0 bg-[#0A0E16] z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="text-[#7A7363] hover:text-[#F5E8C7]"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold">Surah X-Ray</h1>
      </header>

      <main className="px-4 py-6 max-w-3xl mx-auto space-y-6">
        <AiDisclaimerBanner />

        {loading && <p className="text-sm text-[#7A7363]" aria-busy="true">Loading…</p>}

        {!loading && error && (
          <p className="text-sm text-[#D4A853]">Could not load X-Ray data: {error}</p>
        )}

        {!loading && !error && !data && (
          <div className="rounded-xl border border-[#D7B56A]/25 bg-[#D7B56A]/5 p-6 space-y-2">
            <p className="text-base text-[#EBDCB8] font-semibold">Coming soon to this surah</p>
            <p className="text-sm text-[#A7B1C0] leading-relaxed">
              {isSurahInTadabburPilot(surahId)
                ? 'No X-Ray data is curated for this surah yet.'
                : `Surah X-Ray is currently piloting on ${TADABBUR_PILOT_SURAH_NAMES}. Themes, revelation context, key stats, and connected verses are being authored for more surahs — check back soon.`}
            </p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <XrayHero data={data} />
            <XrayKeyStats stats={data.key_stats} />
            <XrayThemes themes={data.themes} />
            <XrayTimeline events={data.timeline_events} />
            <XrayConnectedRevelations items={data.connected_revelations} />

            {data.sources.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-wide text-[#7A7363] mb-2">Sources</h2>
                <div className="flex flex-wrap gap-1.5">
                  {data.sources.map((s, i) => (
                    <SourceCitationChip key={i} citation={s} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function XrayHero({ data }: { data: SurahXray }) {
  return (
    <section className="rounded-xl border border-[rgba(212,168,83,0.18)] bg-gradient-to-br from-[#10151F] to-[#0A0E16] p-5">
      <p className="text-xs uppercase tracking-wide text-[#7A7363] mb-1">
        Surah {data.surah_id} · {data.revelation_period}
      </p>
      <h2 className="text-2xl font-semibold text-[#F5E8C7] mb-1">
        {data.name_simple}
      </h2>
      <p className="font-arabic text-2xl text-[#D4A853] mb-3">{data.name_arabic}</p>
      <p className="text-sm text-[#7A7363]">
        Revealed in {data.location}{data.revelation_year_ce ? ` · c. ${data.revelation_year_ce} CE` : ''} · {data.verses_count} verses
      </p>
    </section>
  );
}

function XrayKeyStats({ stats }: { stats: { label: string; value: string }[] }) {
  if (stats.length === 0) return null;
  return (
    <section>
      <h2 className="text-xs uppercase tracking-wide text-[#7A7363] mb-2">Key Stats</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div
            key={i}
            className="rounded-lg border border-[rgba(212,168,83,0.15)] bg-[#10151F]/40 px-3 py-3"
          >
            <p className="text-[10px] uppercase tracking-wide text-[#7A7363]">{s.label}</p>
            <p className="text-base text-[#F5E8C7] mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function XrayThemes({ themes }: { themes: string[] }) {
  if (themes.length === 0) return null;
  return (
    <section>
      <h2 className="text-xs uppercase tracking-wide text-[#7A7363] mb-2">Themes</h2>
      <div className="flex flex-wrap gap-1.5">
        {themes.map((t) => (
          <span
            key={t}
            className="text-xs px-2.5 py-1 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/25 text-[#D4A853]"
          >
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

function XrayTimeline({ events }: { events: SurahXray['timeline_events'] }) {
  if (events.length === 0) return null;
  return (
    <section>
      <h2 className="text-xs uppercase tracking-wide text-[#7A7363] mb-2">Timeline</h2>
      <ol className="space-y-3 border-l-2 border-[#D4A853]/30 pl-4">
        {events.map((e, i) => (
          <li key={i}>
            <p className="text-xs text-[#D4A853] font-semibold">{e.year_ce} CE</p>
            <h3 className="text-sm font-semibold text-[#F5E8C7]">{e.title}</h3>
            <p className="text-sm text-[#7A7363] mt-1 leading-relaxed">{e.description}</p>
            {e.citation && (
              <div className="mt-2">
                <SourceCitationChip citation={e.citation} />
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function XrayConnectedRevelations({ items }: { items: SurahXray['connected_revelations'] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="text-xs uppercase tracking-wide text-[#7A7363] mb-2">Connected Revelations</h2>
      <ul className="space-y-3">
        {items.map((c, i) => (
          <li
            key={i}
            className="rounded-lg border border-[rgba(212,168,83,0.18)] bg-[#10151F]/40 p-3"
          >
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold text-[#F5E8C7]">{c.label}</h3>
              <span className="text-xs text-[#7A7363]">{c.verse_key}</span>
            </div>
            <p className="text-sm text-[#7A7363] leading-relaxed">{c.note}</p>
            {c.citation && (
              <div className="mt-2">
                <SourceCitationChip citation={c.citation} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
