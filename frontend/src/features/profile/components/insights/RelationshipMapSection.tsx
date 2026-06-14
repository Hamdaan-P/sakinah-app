/**
 * RelationshipMapSection — list of people mentioned in conversations with
 * valence + typical emotions per person.
 */

import { Users } from '@phosphor-icons/react';
import type { RelationshipData } from '../_insightsTypes';
import { Section } from './_primitives';

interface RelationshipMapSectionProps {
  relationshipList: Array<[string, RelationshipData[string]]>;
}

export function RelationshipMapSection({ relationshipList }: RelationshipMapSectionProps) {
  return (
    <Section title="Relationship Map" icon={Users} delay={0.55}>
      <div className="space-y-3">
        <p className="text-[#7A7363] text-[12px] leading-relaxed mb-1">
          People mentioned across conversations — Raya tracks emotional dynamics around each relationship.
        </p>
        {relationshipList.slice(0, 10).map(([name, rel]) => (
          <div key={name} className="flex items-center gap-3 py-1.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold flex-shrink-0"
              style={{
                background: rel.valence === 'positive' ? 'rgba(42,157,111,0.15)' :
                           rel.valence === 'negative' ? 'rgba(239,68,68,0.15)' :
                           'rgba(212,168,83,0.12)',
                color: rel.valence === 'positive' ? '#2A9D6F' :
                       rel.valence === 'negative' ? '#ef4444' : '#D4A853',
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#C9C0A8] text-[13px] font-medium capitalize">{name}</p>
              <p className="text-[#5C5749] text-[11px]">
                {[rel.relationship_type, `${rel.mention_count} mentions`, rel.valence].filter(Boolean).join(' · ')}
              </p>
            </div>
            {rel.typical_emotions?.length ? (
              <div className="flex gap-1">
                {rel.typical_emotions.slice(0, 2).map((e, i) => (
                  <span
                    key={`${e}-${i}`}
                    className="text-[#5C5749] text-[10px] px-1.5 py-0.5 rounded bg-[#0A0E16]/60 capitalize"
                  >
                    {e}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  );
}
