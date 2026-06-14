/**
 * XrayPanel (sheet variant) — shows a compact surah-level X-Ray snapshot
 * inside the Deep Dive Sheet. For the full timeline + connected verses,
 * users tap through to /quran/surah/:id/xray.
 *
 * Ayah-level X-Ray is not yet authored (backend stub returns 404).
 */

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchSurahXray, type SurahXray } from '../../../services/xrayService';
import { SourceCitationChip } from '../../governance/SourceCitationChip';
import { AiDisclaimerBanner } from '../../governance/AiDisclaimerBanner';
import { isSurahInTadabburPilot, TADABBUR_PILOT_SURAH_NAMES } from '../../../config/tadabbur';

interface Props {
  verseKey: string;
}

export function XrayPanel({ verseKey }: Props) {
  const surahId = parseInt(verseKey.split(':')[0]!, 10);
  const [data, setData] = useState<SurahXray | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!surahId) return;
    let cancelled = false;
    setLoading(true);
    fetchSurahXray(surahId)
      .then((r) => { if (!cancelled) setData(r); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [surahId]);

  return (
    <div className="p-4 space-y-4">
      <AiDisclaimerBanner compact />

      {loading && <p className="text-sm text-[#7A7363]" aria-busy="true">Loading X-Ray…</p>}

      {!loading && !data && (
        <p className="text-sm text-[#A7B1C0]">
          {isSurahInTadabburPilot(surahId)
            ? 'No X-Ray data for this surah yet.'
            : `Surah X-Ray is currently piloting on ${TADABBUR_PILOT_SURAH_NAMES}. Themes, key stats, and connections are being authored for more surahs — coming soon.`}
        </p>
      )}

      {!loading && data && (
        <>
          <header>
            <h3 className="text-base font-semibold text-[#F5E8C7]">
              {data.name_simple} <span className="font-arabic">{data.name_arabic}</span>
            </h3>
            <p className="text-xs text-[#7A7363] mt-1">
              {data.revelation_period} · {data.location} · {data.verses_count} verses
            </p>
          </header>

          {data.key_stats.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {data.key_stats.map((s, i) => (
                <div
                  key={i}
                  className="rounded-md border border-[rgba(212,168,83,0.15)] bg-[#10151F]/40 px-3 py-2"
                >
                  <p className="text-[10px] uppercase tracking-wide text-[#7A7363]">{s.label}</p>
                  <p className="text-sm text-[#F5E8C7]">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {data.themes.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wide text-[#7A7363] mb-1.5">Themes</h4>
              <div className="flex flex-wrap gap-1.5">
                {data.themes.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/25 text-[#D4A853]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.sources.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.sources.map((s, i) => (
                <SourceCitationChip key={i} citation={s} />
              ))}
            </div>
          )}

          <Link
            to={`/quran/surah/${data.surah_id}/xray`}
            className="inline-block mt-2 text-sm text-[#D4A853] hover:underline"
          >
            Open full X-Ray →
          </Link>
        </>
      )}
    </div>
  );
}
