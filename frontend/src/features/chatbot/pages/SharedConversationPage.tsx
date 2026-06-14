/**
 * SharedConversationPage
 * Public read-only view of a shared conversation at /share/:id
 * Shows full scrollable chat with branding + CTA to sign up.
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SpinnerGap, ChatCircleDots } from '@phosphor-icons/react';
import { PremiumIslamicBackground } from '@/components/shared';
import { FormattedText } from '../utils/textFormatter';
import { fetchSharedConversation, type SharedConversation } from '../utils/shareLinkService';
import { getCompanionById } from '../types/chatbot.types';
import logoGold from '@/assets/zaryah-logo-gold.png';

type PageState = 'loading' | 'not-found' | 'display';

export function SharedConversationPage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<PageState>('loading');
  const [convo, setConvo] = useState<(SharedConversation & { id: string }) | null>(null);

  useEffect(() => {
    if (!id) { setState('not-found'); return; }
    fetchSharedConversation(id)
      .then((data) => {
        if (data) { setConvo(data); setState('display'); }
        else setState('not-found');
      })
      .catch(() => setState('not-found'));
  }, [id]);

  // ── Loading state ──
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0E16]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <SpinnerGap size={32} className="text-[#D4A853]" />
        </motion.div>
      </div>
    );
  }

  // ── Not found state ──
  if (state === 'not-found' || !convo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0E16]">
        <div className="text-center px-6">
          <ChatCircleDots size={48} className="text-[#D4A853]/40 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-[#F5E8C7] mb-2">Conversation not found</h1>
          <p className="text-sm text-[#7A7363] mb-6">This link may have expired or doesn't exist.</p>
          <Link
            to="/welcome"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }}
          >
            Go to ZaryahPlus
          </Link>
        </div>
      </div>
    );
  }

  // ── Display state ──
  const companion = getCompanionById(convo.companionId);

  return (
    <div className="h-dvh flex flex-col bg-[#0A0E16] relative">
      <PremiumIslamicBackground variant="subtle" className="absolute inset-0 pointer-events-none" />

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-20 bg-[#0A0E16]/90 backdrop-blur-md border-b border-[#D4A853]/15">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
          <div className="flex items-center gap-3">
            <img src={logoGold} alt="ZaryahPlus" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-sm font-semibold text-[#F5E8C7]">ZaryahPlus</h1>
              <p className="text-[10px] text-[#7A7363]">Shared conversation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F141F]/60 border border-[#D4A853]/20">
            <span className="text-sm">{companion.icon}</span>
            <span className="text-xs text-[#D4A853] font-medium">{companion.name}</span>
          </div>
        </div>
      </header>

      {/* ── Message list ── */}
      <main className="flex-1 min-h-0 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 space-y-3">
          {convo.messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* AI icon */}
              {!msg.isUser && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-[#0F141F]/80 border border-[#D4A853]/30 flex items-center justify-center text-sm mr-2 mt-1">
                  {companion.icon}
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[80%] min-w-0`}>
                {!msg.isUser && (
                  <p className="text-[10px] text-[#D4A853]/60 font-medium mb-1">{companion.name}</p>
                )}
                <div
                  className={
                    msg.isUser
                      ? 'px-4 py-3 rounded-2xl rounded-br-md bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-black'
                      : 'px-4 py-3 rounded-2xl rounded-bl-md bg-[#0F141F]/40 border border-white/5 backdrop-blur-sm'
                  }
                >
                  {msg.isUser ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="text-sm text-white leading-relaxed">
                      <FormattedText text={msg.text} />
                    </div>
                  )}
                </div>
              </div>

              {/* User icon */}
              {msg.isUser && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-[#D4A853]/20 border border-[#D4A853]/30 flex items-center justify-center text-sm ml-2 mt-1">
                  <span className="text-[#D4A853] text-xs font-bold">&#128100;</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </main>

      {/* ── Bottom CTA bar ── */}
      <footer className="sticky bottom-0 z-20 bg-[#0A0E16]/95 backdrop-blur-md border-t border-[#D4A853]/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center gap-3">
          <p className="text-sm text-[#F5E8C7] font-medium text-center sm:text-left flex-1">
            Try <span className="text-[#D4A853]">ZaryahPlus</span> — Your Islamic AI Companion
          </p>
          <div className="flex items-center gap-2">
            <Link
              to="/signup"
              className="px-5 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }}
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="px-5 py-2 rounded-xl text-xs font-bold border border-[#D4A853]/50 text-[#D4A853] hover:bg-[#D4A853]/10 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
