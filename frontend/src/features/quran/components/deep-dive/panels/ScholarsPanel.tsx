/**
 * ScholarsPanel — curated scholar commentary for the ayah.
 *
 * Reads from frontend/src/features/quran/data/scholarCommentary.json. Each
 * entry shows scholar name + affiliation + era + text and a citation chip.
 * Multiple scholars per ayah supported.
 */

import scholarData from '../../../data/scholarCommentary.json';
import { SourceCitationChip } from '../../governance/SourceCitationChip';
import { AiDisclaimerBanner } from '../../governance/AiDisclaimerBanner';
import { isAyahInTadabburPilot, TADABBUR_PILOT_SURAH_NAMES } from '../../../config/tadabbur';
import type { SourceCitation } from '../../../types/quran.types';

interface ScholarEntry {
  scholar: string;
  affiliation: string;
  era: string;
  text: string;
  source: SourceCitation;
}

const data = scholarData as Record<string, ScholarEntry[]>;

interface Props {
  verseKey: string;
}

export function ScholarsPanel({ verseKey }: Props) {
  const entries = data[verseKey] ?? [];

  return (
    <div className="p-4 space-y-4">
      <AiDisclaimerBanner compact />

      {entries.length === 0 ? (
        <p className="text-sm text-[#A7B1C0]">
          {isAyahInTadabburPilot(verseKey)
            ? 'No curated scholar commentary is available for this ayah yet.'
            : `Scholar commentary is currently piloting on ${TADABBUR_PILOT_SURAH_NAMES}. We're sourcing classical and contemporary commentary for more surahs — check back soon.`}
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry, idx) => (
            <li
              key={`${entry.scholar}-${idx}`}
              className="rounded-lg border border-[rgba(212,168,83,0.18)] bg-[#10151F]/50 p-4"
            >
              <header className="mb-2">
                <h3 className="text-sm font-semibold text-[#F5E8C7]">{entry.scholar}</h3>
                <p className="text-xs text-[#7A7363]">
                  {entry.affiliation} · {entry.era}
                </p>
              </header>
              <p className="text-sm text-[#D7D7D7] leading-relaxed whitespace-pre-line mb-3">
                {entry.text}
              </p>
              <SourceCitationChip citation={entry.source} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
