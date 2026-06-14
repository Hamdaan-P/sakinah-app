/**
 * RecoverEmailPanel — Layer-3 admin override to force-change a user's auth
 * email. Used inside UserDetailModal.
 */

import { useState } from 'react';
import { ShieldCheck, CaretDown } from '@phosphor-icons/react';
import { adminService } from '../../services/admin.service';
import {
  BG, SURFACE_2, GOLD, WHITE, TEXT_2, BORDER,
} from '../constants';

interface Props {
  userId: string;
  currentEmail: string;
}

export function RecoverEmailPanel({ userId, currentEmail }: Props) {
  const [showRecover, setShowRecover] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverReason, setRecoverReason] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [recoverMsg, setRecoverMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="mb-6">
      <button
        onClick={() => setShowRecover(!showRecover)}
        className="w-full flex items-center justify-between pb-2 border-b mb-3"
        style={{ borderColor: BORDER }}
      >
        <h4 className="text-xs uppercase font-bold tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
          <ShieldCheck size={16} weight="bold" />
          Recover Account Email
        </h4>
        <CaretDown
          size={14}
          weight="bold"
          style={{ color: GOLD, transform: showRecover ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>
      {showRecover && (
        <div className="p-4 rounded-xl space-y-3" style={{ background: BG, border: `1px solid ${BORDER}` }}>
          <p className="text-xs leading-relaxed" style={{ color: TEXT_2 }}>
            Force-update this user's auth email when they're locked out of both their inbox and password. Verify identity out-of-band first (KYC, payment, phone). Action is audit-logged.
          </p>
          <input
            type="email"
            placeholder="New email address"
            value={recoverEmail}
            onChange={(e) => setRecoverEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ background: SURFACE_2, color: WHITE, border: `1px solid ${BORDER}` }}
          />
          <textarea
            placeholder="Reason / how identity was verified (min 10 chars, written to audit log)"
            value={recoverReason}
            onChange={(e) => setRecoverReason(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ background: SURFACE_2, color: WHITE, border: `1px solid ${BORDER}` }}
          />
          {recoverMsg && (
            <p className="text-xs" style={{ color: recoverMsg.ok ? '#10B981' : '#EF4444' }}>
              {recoverMsg.text}
            </p>
          )}
          <button
            disabled={recovering}
            onClick={async () => {
              setRecoverMsg(null);
              if (!window.confirm(`Force-change this user's email from ${currentEmail} to ${recoverEmail}? This is logged.`)) return;
              setRecovering(true);
              try {
                const res = await adminService.recoverEmail(userId, recoverEmail, recoverReason);
                setRecoverMsg({ ok: true, text: `Email updated: ${res.old_email} → ${res.new_email}. User can now do a normal password reset.` });
                setRecoverEmail('');
                setRecoverReason('');
              } catch (err) {
                setRecoverMsg({ ok: false, text: (err as Error).message || 'Failed to update email' });
              } finally {
                setRecovering(false);
              }
            }}
            className="px-4 py-2 rounded-lg text-sm font-bold"
            style={{ background: GOLD, color: '#0A0E16', opacity: recovering ? 0.6 : 1 }}
          >
            {recovering ? 'Updating…' : 'Force-change email'}
          </button>
        </div>
      )}
    </div>
  );
}
