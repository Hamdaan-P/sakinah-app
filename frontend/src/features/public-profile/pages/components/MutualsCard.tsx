/**
 * "Mutual connections" card on the public profile page.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMutualConnections } from '@/features/connections/services/connectionService';
import { getPublicProfileByUid } from '../../services/publicProfileService';
import type { PublicProfile } from '../../types/public-profile.types';
import { SectionCard } from './_primitives';

export function MutualsCard({ profileUid }: { profileUid: string }) {
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'empty' }
    | { kind: 'error' }
    | { kind: 'ok'; count: number; profiles: (PublicProfile | null)[] }
  >({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { mutuals, count } = await getMutualConnections(profileUid);
        if (cancelled) return;
        if (count === 0) return setState({ kind: 'empty' });
        // Fetch up to 5 profile avatars/names for display
        const topFive = mutuals.slice(0, 5);
        const profiles = await Promise.all(topFive.map((uid) => getPublicProfileByUid(uid)));
        if (cancelled) return;
        setState({ kind: 'ok', count, profiles });
      } catch {
        if (!cancelled) setState({ kind: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileUid]);

  if (state.kind === 'empty' || state.kind === 'error') return null;

  return (
    <SectionCard title="Mutual Connections">
      {state.kind === 'loading' && (
        <p className="text-[#5C5749] text-xs">Checking who you both know…</p>
      )}
      {state.kind === 'ok' && (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {state.profiles.slice(0, 5).map((p, i) =>
              p ? (
                <Link
                  key={p.uid}
                  to={`/@${p.slug || p.uid}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold border-2 border-[#0F1724]"
                  style={{
                    background: 'linear-gradient(135deg, #E8C97A, #B8943E)',
                    color: '#0A0E16',
                    fontFamily: "'Cormorant Garamond', serif",
                    zIndex: 5 - i,
                  }}
                  title={p.displayName || p.fullName || ''}
                >
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    ((p.displayName || p.fullName || 'Z')[0] || 'Z').toUpperCase()
                  )}
                </Link>
              ) : null,
            )}
          </div>
          <p className="text-[#C9C0A8] text-sm">
            <span className="text-[#F5E8C7] font-semibold">{state.count}</span>{' '}
            {state.count === 1 ? 'person' : 'people'} you both know
          </p>
        </div>
      )}
    </SectionCard>
  );
}
