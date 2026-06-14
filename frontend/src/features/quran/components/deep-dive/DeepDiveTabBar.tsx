/**
 * DeepDiveTabBar — the 6-tab strip on the Deep Dive Sheet.
 *
 * Order is significant: Ask comes first because most ayah-taps start
 * with a question; X-Ray and Tafsir form the contextual middle; Hadith,
 * Scholars, and Apply close the sequence with verified context and
 * actionable practice.
 */

export type DeepDiveTab = 'ask' | 'xray' | 'tafsir' | 'hadith' | 'scholars' | 'apply';

// eslint-disable-next-line react-refresh/only-export-components
export const DEEP_DIVE_TABS: { id: DeepDiveTab; label: string }[] = [
  { id: 'ask', label: 'Ask' },
  { id: 'xray', label: 'X-Ray' },
  { id: 'tafsir', label: 'Tafsir' },
  { id: 'hadith', label: 'Hadith' },
  { id: 'scholars', label: 'Scholars' },
  { id: 'apply', label: 'Apply' },
];

interface Props {
  active: DeepDiveTab;
  onChange: (tab: DeepDiveTab) => void;
}

export function DeepDiveTabBar({ active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Deep dive tabs"
      className="flex overflow-x-auto border-b border-[rgba(212,168,83,0.18)] bg-[#0A0E16] sticky top-[56px] z-10"
    >
      {DEEP_DIVE_TABS.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
              ${isActive
                ? 'text-[#D4A853] border-b-2 border-[#D4A853]'
                : 'text-[#7A7363] hover:text-[#F5E8C7]'}`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
