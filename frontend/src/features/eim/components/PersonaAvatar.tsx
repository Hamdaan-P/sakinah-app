/**
 * Persona avatar + helpers shared across the mentor picker, analysis chat,
 * and the (future) saved-chat history page.
 *
 * The backend `Persona` carries an `icon` string (a Phosphor icon name, e.g.
 * "Mosque", "Mountains") and an `accent_color` hex. This module:
 *   - Resolves the icon string to a Phosphor component via an explicit
 *     ICON_MAP (keeps the bundle small — we only import what we use).
 *   - Renders the avatar disc with the persona's accent_color when selected
 *     or featured, falling back to the brand gold otherwise.
 *   - Falls back to `avatar_initial` when no icon is set or the name is not
 *     in ICON_MAP — so the UI never breaks if the backend ships a new icon
 *     before this map is updated.
 *
 * Identity rule: this component never renders `inspired_by` or any
 * biographical text. Those fields stay on the model for back-compat but
 * are no longer shown anywhere in the UI (see legal-compliance scrub).
 */

import {
  BookOpen,
  Books,
  ChartLineUp,
  Cloud,
  Compass,
  MagnifyingGlass,
  Mosque,
  Mountains,
  Plant,
  Sun,
  type Icon as PhosphorIcon,
  type IconProps as PhosphorIconProps,
} from '@phosphor-icons/react';
import { type ComponentType } from 'react';
import type { Persona } from '../types/eim.types';
import { getPersonaAccent, getPersonaTypeLabel } from './persona-helpers';

/** Explicit map from backend icon strings to Phosphor components. Add a row
 *  here when the backend ships a new persona icon. Unknown strings render
 *  the avatar_initial fallback. */
const ICON_MAP: Record<string, ComponentType<PhosphorIconProps>> = {
  BookOpen,
  Books,
  ChartLineUp,
  Cloud,
  Compass,
  MagnifyingGlass,
  Mosque,
  Mountains,
  Plant,
  Sun,
};

interface PersonaAvatarProps {
  persona: Pick<Persona, 'icon' | 'avatar_initial' | 'accent_color'>;
  size?: number;
  /** When true, the disc uses the persona's accent tint as a solid gradient
   *  background and the icon/initial flips to dark for contrast. When false,
   *  uses a translucent tint of the accent. */
  selected?: boolean;
}

/** Icons that render better in `fill` weight than the default `duotone`
 *  (sharper silhouette, more visual definition at small sizes). */
const FILL_WEIGHT_ICONS = new Set(['Compass']);

export function PersonaAvatar({ persona, size = 40, selected = false }: PersonaAvatarProps) {
  const accent = getPersonaAccent(persona);
  const IconComp = persona.icon ? (ICON_MAP[persona.icon] as PhosphorIcon | undefined) : undefined;
  const iconSize = Math.round(size * 0.5);
  const iconWeight = persona.icon && FILL_WEIGHT_ICONS.has(persona.icon) ? 'fill' : 'duotone';

  const background = selected
    ? `linear-gradient(135deg, ${accent}, ${lighten(accent)})`
    : `${accent}26`; // 15% alpha — translucent tint
  const foreground = selected ? '#0A0E16' : accent;

  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-bold"
      style={{
        width: size,
        height: size,
        background,
        color: foreground,
        fontSize: Math.round(size * 0.35),
      }}
      aria-hidden
    >
      {IconComp ? <IconComp size={iconSize} weight={iconWeight} /> : persona.avatar_initial}
    </div>
  );
}

interface PersonaTypeBadgeProps {
  persona: Pick<Persona, 'persona_type' | 'accent_color'>;
}

export function PersonaTypeBadge({ persona }: PersonaTypeBadgeProps) {
  const accent = getPersonaAccent(persona);
  const label = getPersonaTypeLabel(persona.persona_type);
  return (
    <span
      className="inline-flex items-center text-[9.5px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded-md"
      style={{
        background: `${accent}1F`, // ~12% alpha
        color: accent,
        border: `1px solid ${accent}40`, // ~25% alpha
      }}
    >
      {label}
    </span>
  );
}

/** Lighten a hex colour by 12% toward white. Used for the avatar's gradient
 *  end-stop when selected. Falls back to the original hex on unparseable input. */
function lighten(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const blend = (c: number) => Math.min(255, Math.round(c + (255 - c) * 0.18));
  const out = (blend(r) << 16) | (blend(g) << 8) | blend(b);
  return `#${out.toString(16).padStart(6, '0').toUpperCase()}`;
}
