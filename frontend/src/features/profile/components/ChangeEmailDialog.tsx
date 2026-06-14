/**
 * ChangeEmailDialog — modal form for requesting an account email change.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Eye, EyeSlash, Lock, Envelope } from '@phosphor-icons/react';

interface ChangeEmailDialogProps {
  isOpen: boolean;
  currentEmail: string;
  onClose: () => void;
  onSubmit: (currentPassword: string, newEmail: string) => Promise<void>;
}

export function ChangeEmailDialog({ isOpen, currentEmail, onClose, onSubmit }: ChangeEmailDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    if (trimmed === currentEmail.trim().toLowerCase()) {
      setError('New email is the same as your current email');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(currentPassword, trimmed);
      setSentTo(trimmed);
    } catch (err) {
      setError((err as Error).message || 'Failed to request email change');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewEmail('');
    setError('');
    setSentTo(null);
    onClose();
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
          <h2 className="text-xl font-semibold text-white">Change Email</h2>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {sentTo ? (
          <div className="space-y-4">
            <p className="text-white/80 text-sm">
              We've sent a verification link to <span className="text-[#D4A853] font-medium">{sentTo}</span>.
              Open that inbox and click the link to finish switching your account email.
            </p>
            <p className="text-white/50 text-xs">
              Until you click the link, your account email stays as <span className="text-white/70">{currentEmail}</span>.
            </p>
            <button
              onClick={handleClose}
              className="w-full min-h-[54px] px-[22px] py-[14px] rounded-lg bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] font-semibold transition-all"
            >
              Got it
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="block text-white/60 text-sm mb-2">Current Email</span>
              <div className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm">
                {currentEmail || '(unknown)'}
              </div>
            </div>

            <div>
              <label htmlFor="profilecomponents-fld-4" className="block text-white/60 text-sm mb-2">New Email</label>
              <div className="relative">
                <Envelope size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4A853]/60" />
                <input id="profilecomponents-fld-4"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/5 border border-[#D4A853]/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853]/50"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="profilecomponents-fld-5" className="block text-white/60 text-sm mb-2">Current Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4A853]/60" />
                <input id="profilecomponents-fld-5"
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-[#D4A853]/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853]/50"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <p className="text-white/50 text-xs">
              We'll send a verification link to your new email. Your account email only changes once you click that link.
            </p>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 min-h-[52px] px-[22px] py-[14px] rounded-lg border border-white/20 text-white/70 font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 min-h-[54px] px-[22px] py-[14px] rounded-lg bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] font-semibold transition-all disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Verification'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
