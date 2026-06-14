/**
 * Single "Discover" suggestion row with reason chips + Connect button.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkle, UserPlus } from '@phosphor-icons/react';
import type { Suggestion } from '../../services/discoverService';
import { Avatar } from './_primitives';

export function SuggestionRow({
  suggestion,
  pending,
  onConnect,
}: {
  suggestion: Suggestion;
  pending: boolean;
  onConnect: () => void;
}) {
  const p = suggestion.profile;
  const name = p.displayName || p.fullName || 'ZaryahPlus Member';
  const href = p.slug ? `/@${p.slug}` : `/@${p.uid}`;
  const subtitle = [p.profession, p.location].filter(Boolean).join(' · ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="flex items-start gap-3 p-4 rounded-2xl transition-all hover:border-[rgba(212,168,83,0.28)]"
      style={{
        background: 'linear-gradient(180deg, rgba(36,50,70,0.5), rgba(15,23,36,0.7))',
        border: '1px solid rgba(212,168,83,0.12)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      }}
    >
      <Link to={href} className="flex items-start gap-3 flex-1 min-w-0">
        <Avatar name={name} photoUrl={p.photoUrl} size={52} />
        <div className="flex-1 min-w-0">
          <p className="text-[#F5E8C7] text-[15px] font-semibold truncate leading-tight">{name}</p>
          {subtitle && <p className="text-[#7A7363] text-[11px] truncate mt-0.5">{subtitle}</p>}
          {p.bio && <p className="text-[#5C5749] text-[11px] line-clamp-1 mt-1 italic">{p.bio}</p>}
          {suggestion.reasons.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {suggestion.reasons.map((r, i) => {
                const isShukr = r.startsWith('✦');
                return (
                <span
                  key={`${r}-${i}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    background: isShukr ? 'rgba(212,168,83,0.22)' : 'rgba(212,168,83,0.1)',
                    color: isShukr ? '#F5E8C7' : '#D4A853',
                    border: `1px solid rgba(212,168,83,${isShukr ? 0.45 : 0.2})`,
                  }}
                >
                  <Sparkle size={9} weight="fill" />
                  {isShukr ? r.replace(/^✦\s*/, '') : r}
                </span>
                );
              })}
            </div>
          )}
        </div>
      </Link>

      <button
        onClick={onConnect}
        disabled={pending}
        className="flex-shrink-0 px-3.5 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all disabled:opacity-60 hover:scale-105"
        style={{
          background: 'linear-gradient(90deg, #D4A853, #E8C97A)',
          color: '#0A0E16',
          boxShadow: '0 2px 8px rgba(212,168,83,0.25)',
        }}
      >
        <span className="inline-flex items-center gap-1">
          <UserPlus size={13} weight="bold" />
          {pending ? 'Sending…' : 'Connect'}
        </span>
      </button>
    </motion.div>
  );
}
