/**
 * Connections list panel for CircleInviteSheet.
 */

import { Check, Spinner } from '@phosphor-icons/react';

export interface ConnRow {
  uid: string;
  name: string;
  photoUrl?: string | null;
}

interface Props {
  connections: ConnRow[] | null;
  picked: Set<string>;
  togglePick: (uid: string) => void;
}

export function ConnectionsList({ connections, picked, togglePick }: Props) {
  if (connections === null) {
    return (
      <div className="text-center py-8 text-white/50 text-sm flex items-center justify-center gap-2">
        <Spinner size={14} className="animate-spin" /> Loading your connections…
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <p className="text-center py-12 text-white/50 text-sm">
        You don't have any connections yet. Use the share-link tab instead.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {connections.map((c) => {
        const checked = picked.has(c.uid);
        return (
          <button
            key={c.uid}
            onClick={() => togglePick(c.uid)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
              checked ? 'bg-[#D4A853]/15 border-[#D4A853]/40' : 'bg-white/3 border-white/8 hover:border-white/15'
            }`}
          >
            {c.photoUrl ? (
              <img src={c.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-[#D4A853]">
                {c.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="flex-1 text-sm font-medium truncate">{c.name}</span>
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                checked ? 'bg-[#D4A853] text-[#0A0E16]' : 'bg-white/8'
              }`}
            >
              {checked && <Check size={12} weight="bold" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
