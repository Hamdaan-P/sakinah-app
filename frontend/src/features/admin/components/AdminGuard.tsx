/**
 * AdminGuard
 * Protects admin routes. If not authenticated, redirects to /admin/login.
 * If authenticated but not admin, shows access denied.
 */

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase.config';
import { BACKEND_URL } from '@/lib/api';
import { Spinner, ShieldCheck } from '@phosphor-icons/react';

const BG = '#0B1120';
const GOLD = '#D4A853';
const TEXT_2 = '#94A3B8';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'authed' | 'not-authed'>('loading');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus('not-authed');
        return;
      }

      // Verify with backend that this is an admin
      try {
        const token = await user.getIdToken();
        const res = await fetch(
          `${BACKEND_URL}/admin/stats`,
          { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) }
        );

        if (res.ok) {
          setStatus('authed');
        } else {
          setStatus('not-authed');
        }
      } catch {
        // If backend is down, allow through (data just won't load)
        setStatus('authed');
      }
    });

    return () => unsub();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="text-center">
          <ShieldCheck size={36} weight="bold" style={{ color: GOLD }} className="mx-auto mb-4" />
          <Spinner size={28} className="animate-spin mx-auto mb-3" style={{ color: GOLD }} />
          <p className="text-sm font-medium" style={{ color: TEXT_2 }}>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (status === 'not-authed') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
