/**
 * Forgot Password Modal
 * Mirrors Flutter's _showForgotPasswordDialog from login_modern.dart
 */

import { useState } from 'react';
import { useAuthStore } from '@/core/stores/auth.store';
import { FiMail, FiX, FiLoader } from 'react-icons/fi';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose, onSuccess }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resetPassword = useAuthStore((state) => state.resetPassword);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const success = await resetPassword(email);
      if (success) {
        onSuccess();
        onClose();
        setEmail('');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- modal backdrop; explicit Close button & Escape handle a11y */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-gray-900 rounded-2xl border border-[#D4A853]/30 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Reset Password</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-400 text-sm mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {/* Email Input */}
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-[14px] bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A853]/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="min-h-[54px] px-[22px] py-[14px] bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-black font-semibold rounded-lg hover:from-[#D4A853] hover:to-[#E8C97A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
