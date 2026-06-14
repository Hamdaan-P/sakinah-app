/**
 * Connect/Accept/Decline/Message action button row on the public profile page.
 */

import { useNavigate } from 'react-router-dom';
import {
  ChatCircleDots, Clock, UserCheck, UserPlus, X,
} from '@phosphor-icons/react';
import { useAuthStore } from '@/core/stores/auth.store';
import { openOrCreateConversation } from '@/features/dms/services/dmService';
import { useConnectionStatus } from '@/features/connections/hooks/useConnectionStatus';

interface ConnectionActionButtonsProps {
  isAuthenticated: boolean;
  connection: ReturnType<typeof useConnectionStatus>;
  onUnauthed: () => void;
  otherUid: string;
}

export function ConnectionActionButtons({
  isAuthenticated,
  connection,
  onUnauthed,
  otherUid,
}: ConnectionActionButtonsProps) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const { view, busy, error, connect, accept, decline } = connection;

  async function handleMessage() {
    if (!currentUser?.id) return;
    try {
      const id = await openOrCreateConversation(currentUser.id, otherUid);
      navigate(`/messages/${id}`);
    } catch (err) {
      console.error('Failed to open conversation', err);
    }
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={onUnauthed}
        className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }}
      >
        <UserPlus size={16} weight="bold" />
        Sign in to connect
      </button>
    );
  }

  if (view.kind === 'connected') {
    return (
      <div className="flex-1 flex gap-2">
        <div
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0"
          style={{
            background: 'rgba(42,157,111,0.15)',
            border: '1px solid rgba(42,157,111,0.4)',
            color: '#2A9D6F',
          }}
        >
          <UserCheck size={16} weight="bold" />
          Connected
        </div>
        <button
          onClick={handleMessage}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }}
        >
          <ChatCircleDots size={16} weight="fill" />
          Message
        </button>
      </div>
    );
  }

  if (view.kind === 'request-sent') {
    return (
      <button
        disabled
        className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        style={{
          background: 'rgba(212,168,83,0.1)',
          border: '1px solid rgba(212,168,83,0.3)',
          color: '#D4A853',
        }}
      >
        <Clock size={16} weight="bold" />
        Request sent
      </button>
    );
  }

  if (view.kind === 'request-received') {
    return (
      <div className="flex-1 flex gap-2">
        <button
          onClick={accept}
          disabled={busy}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60"
          style={{ background: 'linear-gradient(90deg, #2A9D6F, #47B585)', color: '#fff' }}
        >
          <UserCheck size={16} weight="bold" />
          Accept
        </button>
        <button
          onClick={decline}
          disabled={busy}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(212,168,83,0.2)',
            color: '#7A7363',
          }}
        >
          <X size={14} />
          Decline
        </button>
      </div>
    );
  }

  // view.kind === 'none' or 'declined'
  const declinedPreviously = view.kind === 'declined';
  return (
    <div className="flex-1">
      <button
        onClick={connect}
        disabled={busy || declinedPreviously}
        title={declinedPreviously ? 'They declined — can’t send again for now.' : undefined}
        className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }}
      >
        <UserPlus size={16} weight="bold" />
        {busy ? 'Sending…' : declinedPreviously ? 'Request declined' : 'Connect'}
      </button>
      {error && <p className="mt-1.5 text-[11px] text-red-400 text-center">{error}</p>}
    </div>
  );
}
