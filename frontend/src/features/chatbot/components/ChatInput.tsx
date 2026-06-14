/**
 * ChatInput
 * Multi-line input with animated placeholder and send button
 * Mirrors Flutter's enhanced_chat_input.dart
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { PaperPlaneRight, Microphone, MicrophoneSlash } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { QUICK_SUGGESTIONS } from '../types/chatbot.types';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, isSupported, interimTranscript, toggleListening } =
    useSpeechRecognition({
      lang: 'en-US',
      continuous: false,
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          setValue((prev) => (prev ? `${prev} ${text}` : text));
        }
      },
    });

  // Cycle placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % QUICK_SUGGESTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="bg-[#0A0E16]/95 border-t border-[#D4A853]/15 backdrop-blur-lg">
      {/* Full-width row, items vertically centered so the mic, textarea, and
          send button sit on the same line instead of zigzagging when their
          natural heights differ. */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 w-full">
      {/* Attachment — hidden for launch (no handler wired). Restore by uncommenting. */}
      {/*
      <button
        type="button"
        className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[#0F141F]/60 text-[#5C5749] hover:bg-[#0F141F]/80 transition-colors"
        title="Attachments (coming soon)"
      >
        <Paperclip size={16} />
      </button>
      */}

      {/* Mic — speech-to-text */}
      {isSupported && (
        <button
          type="button"
          onClick={toggleListening}
          className={cn(
            'shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all',
            isListening
              ? 'bg-red-500 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]'
              : 'bg-[#4FB892] text-white hover:bg-[#4DA6B8]'
          )}
          title={isListening ? 'Stop listening' : 'Speak your question'}
        >
          {isListening ? (
            <MicrophoneSlash size={16} weight="bold" />
          ) : (
            <Microphone size={16} weight="bold" />
          )}
        </button>
      )}

      {/* Headphone / voice companion — hidden for launch (no handler wired). Restore by uncommenting. */}
      {/*
      <button
        type="button"
        className="hidden sm:flex shrink-0 w-10 h-10 rounded-full items-center justify-center bg-[#4FB892] text-white hover:bg-[#4DA6B8] transition-colors"
        title="Voice companion"
      >
        <Headphones size={16} weight="bold" />
      </button>
      */}

      <div className="flex-1 min-w-0 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? interimTranscript || 'Listening... speak now'
              : placeholder ?? QUICK_SUGGESTIONS[placeholderIdx]
          }
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full resize-none rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 text-sm leading-relaxed',
            'bg-[#0F141F]/50 border border-[#D4A853]/20',
            'text-[#F5E8C7] placeholder:text-[#C9A85C] placeholder:text-xs sm:placeholder:text-sm',
            'focus:outline-none focus:border-[#D4A853]/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        />
      </div>

      {/* Send — always gold so it reads as the primary action; opacity dims
          when there's nothing to send. */}
      <button
        onClick={handleSubmit}
        disabled={!canSend}
        className={cn(
          'shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all',
          'bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-black shadow-[0_4px_12px_rgba(212,168,83,0.4)]',
          canSend
            ? 'hover:shadow-[0_6px_16px_rgba(212,168,83,0.5)]'
            : 'opacity-60 cursor-not-allowed'
        )}
      >
        <PaperPlaneRight size={18} />
      </button>
      </div>
    </div>
  );
}
