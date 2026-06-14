/**
 * ChangePasswordDialog — modal form for changing the account password.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Eye, EyeSlash, Lock } from '@phosphor-icons/react';

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Set-mode (hasPassword=false): currentPassword is passed as '' and ignored.
   * Change-mode (hasPassword=true): currentPassword is the user's existing password.
   */
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  /** Whether the account already has an email/password credential. */
  hasPassword?: boolean;
  /** Send a password-reset / setup link to this email (universal fallback). */
  onSendResetLink?: () => Promise<void>;
}

export function ChangePasswordDialog({
  isOpen,
  onClose,
  onSubmit,
  hasPassword = true,
  onSendResetLink,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const title = hasPassword ? 'Change Password' : 'Set Password';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      // In set-mode there is no current password to re-auth against.
      await onSubmit(hasPassword ? currentPassword : '', newPassword);
      onClose();
    } catch (err) {
      setError((err as Error).message || `Failed to ${hasPassword ? 'change' : 'set'} password`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetLink = async () => {
    if (!onSendResetLink) return;
    setError('');
    setIsLoading(true);
    try {
      await onSendResetLink();
      setResetSent(true);
    } catch (err) {
      setError((err as Error).message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-gradient-to-br from-[#1a2f3a] to-[#0d1f29] rounded-2xl border border-[#D4A853]/20 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {!hasPassword && (
          <p className="text-white/50 text-sm mb-4 -mt-2">
            Your account signs in with Google/Facebook and has no password yet. Set one
            below to also sign in with your email.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {hasPassword && (
            <div>
              <label htmlFor="profilecomponents-fld-1" className="block text-white/60 text-sm mb-2">Current Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4A853]/60" />
                <input id="profilecomponents-fld-1"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-[#D4A853]/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853]/50"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showCurrent ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="profilecomponents-fld-2" className="block text-white/60 text-sm mb-2">New Password</label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4A853]/60" />
              <input id="profilecomponents-fld-2"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/5 border border-[#D4A853]/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853]/50"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showNew ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="profilecomponents-fld-3" className="block text-white/60 text-sm mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4A853]/60" />
              <input id="profilecomponents-fld-3"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/5 border border-[#D4A853]/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853]/50"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showConfirm ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {resetSent && (
            <p className="text-green-400 text-sm">
              We've emailed you a link to {hasPassword ? 'reset' : 'set'} your password.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[52px] px-[22px] py-[14px] rounded-lg border border-white/20 text-white/70 font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 min-h-[54px] px-[22px] py-[14px] rounded-lg bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] font-semibold hover:from-[#D4A853] hover:to-[#E8C97A] transition-all disabled:opacity-50"
            >
              {isLoading
                ? (hasPassword ? 'Changing...' : 'Setting...')
                : (hasPassword ? 'Change Password' : 'Set Password')}
            </button>
          </div>

          {onSendResetLink && (
            <button
              type="button"
              onClick={handleSendResetLink}
              disabled={isLoading}
              className="w-full text-center text-sm text-[#D4A853]/80 hover:text-[#D4A853] transition-colors disabled:opacity-50 pt-1"
            >
              {hasPassword
                ? "Forgot your current password? Email me a reset link"
                : "Prefer email? Send me a setup link instead"}
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
}
