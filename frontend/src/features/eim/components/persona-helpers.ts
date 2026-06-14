/**
 * Persona helper functions extracted from PersonaAvatar.tsx so that file
 * only exports React components (satisfies react-refresh/only-export-components).
 */

import type { Persona, PersonaType } from '../types/eim.types';

const DEFAULT_ACCENT = '#D4A853';

const PERSONA_TYPE_LABELS: Record<PersonaType, string> = {
  scholar: 'Scholar',
  value_investor: 'Conventional',
  macro: 'Macro Strategist',
  islamic_finance: 'Islamic Finance',
  historical: 'Historical Voice',
  compass: 'Personal Counsel',
};

export function getPersonaTypeLabel(personaType: PersonaType): string {
  return PERSONA_TYPE_LABELS[personaType] ?? 'Framework Lens';
}

export function getPersonaAccent(persona: Pick<Persona, 'accent_color'>): string {
  const c = persona.accent_color?.trim();
  return c && c.length > 0 ? c : DEFAULT_ACCENT;
}
