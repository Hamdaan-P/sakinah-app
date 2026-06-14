/**
 * Voice Companion Page
 * Voice-based conversation interface with Islamic companion personas
 * Converted from: voice_companion_page.dart + companion_selector.dart +
 *   conversation_display.dart + voice_visualizer.dart + companion_message.dart
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisclaimerBanner, DisclaimerModal } from '@/components/shared';
import { useDisclaimerSeen } from '@/features/legal/hooks/useDisclaimerSeen';
import {
  Microphone,
  MicrophoneSlash,
  PaperPlaneRight,
  WifiHigh,
  WifiSlash,
  CaretDown,
  X,
  Robot,
  Keyboard,
  SpinnerGap,
} from '@phosphor-icons/react';

// ── Companion profiles (matches companion_message.dart) ──

interface CompanionProfile {
  id: string;
  name: string;
  description: string;
}

const COMPANIONS: CompanionProfile[] = [
  { id: 'raya', name: 'Raya', description: 'Your AI Assistant' },
  { id: 'abu_bakr', name: 'Abu Bakr', description: 'The Truthful' },
  { id: 'umar', name: 'Umar', description: 'The Just' },
  { id: 'uthman', name: 'Uthman', description: 'The Generous' },
  { id: 'ali', name: 'Ali', description: 'The Wise' },
  { id: 'khadijah', name: 'Khadijah', description: 'The Supportive' },
  { id: 'aisha', name: 'Aisha', description: 'The Scholar' },
  { id: 'fatimah', name: 'Fatimah', description: 'The Devoted' },
  { id: 'abu_hanifa', name: 'Abu Hanifa', description: 'Imam of Reason' },
  { id: 'malik', name: 'Malik', description: 'Imam of Madinah' },
  { id: 'shafii', name: "Ash-Shafi'i", description: 'Imam of Principles' },
  { id: 'ahmad', name: 'Ahmad', description: 'Imam of Hadith' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'listening' | 'processing' | 'speaking' | 'error';

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; color: string }> = {
  disconnected: { label: 'Disconnected', color: 'text-gray-400' },
  connecting: { label: 'Connecting...', color: 'text-amber-400' },
  connected: { label: 'Ready', color: 'text-emerald-400' },
  listening: { label: 'Listening...', color: 'text-blue-400' },
  processing: { label: 'Thinking...', color: 'text-orange-400' },
  speaking: { label: 'Speaking...', color: 'text-purple-400' },
  error: { label: 'Error', color: 'text-red-400' },
};

export function VoiceCompanionPage() {
  const [voiceSeen, markVoiceSeen] = useDisclaimerSeen('voice');
  const [companion, setCompanion] = useState(COMPANIONS[0]);
  const [showSelector, setShowSelector] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connect = () => {
    setStatus('connecting');
    // Simulate connection
    setTimeout(() => setStatus('connected'), 1500);
  };

  const disconnect = () => {
    setStatus('disconnected');
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (status === 'disconnected') {
      connect();
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      setStatus('processing');
      // Simulate response
      setTimeout(() => {
        const aiMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `As-salamu alaykum! I am ${companion.name}. Voice recording is not yet available in the web version. Please use the text input below to send me a message.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setStatus('connected');
      }, 1500);
    } else {
      setIsRecording(true);
      setStatus('listening');
    }
  };

  const sendTextMessage = () => {
    if (!textInput.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textInput.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTextInput('');
    setStatus('processing');

    // Simulate response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Thank you for your message. As ${companion.name}, I would be happy to discuss this with you. The voice companion feature connects to a WebSocket backend for real-time voice conversation. For now, you can use the text-based AI assistant for detailed responses.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setStatus('connected');
    }, 2000);
  };

  const isActive = status !== 'disconnected' && status !== 'error';

  return (
    <div className="h-dvh flex flex-col">
      {!voiceSeen && <DisclaimerModal contentId="HEALTH" onAccept={markVoiceSeen} />}

      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setShowSelector(true)} className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center">
              <span className="text-[#10151F] font-bold text-sm">{companion.name[0]}</span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <h2 className="text-[#F5E8C7] font-bold">{companion.name}</h2>
                <CaretDown size={16} className="text-[#7A7363] group-hover:text-[#D4A853]" />
              </div>
              <p className="text-[#7A7363] text-xs">{companion.description}</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <span className={`text-xs font-medium ${STATUS_CONFIG[status].color}`}>
              {STATUS_CONFIG[status].label}
            </span>
            {/* Connect button */}
            <button onClick={isActive ? disconnect : connect}
              className={`p-2 rounded-lg ${isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#10151F] text-[#7A7363]'} hover:opacity-80`}>
              {isActive ? <WifiHigh size={20} /> : <WifiSlash size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 overflow-y-auto space-y-3 min-h-[200px]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#10151F] flex items-center justify-center mb-4">
              <Microphone size={32} className="text-[#7A7363]" />
            </div>
            <p className="text-[#F5E8C7] font-semibold mb-1">Press and hold to speak</p>
            <p className="text-[#7A7363] text-sm">Or use text input to send a message</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#D4A853]/20 flex items-center justify-center shrink-0">
                  <Robot size={16} className="text-[#D4A853]" />
                </div>
              )}
              <div className={`px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-[#D4A853] text-[#10151F] rounded-br-sm'
                  : 'bg-[#10151F] text-[#F5E8C7] rounded-bl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}

        {status === 'processing' && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#D4A853]/20 flex items-center justify-center">
              <Robot size={16} className="text-[#D4A853]" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[#10151F] rounded-bl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-[#D4A853]" />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Visualizer + Controls */}
      <div className="px-4 py-6">
        {/* Voice bars (when recording) */}
        {isRecording && (
          <div className="flex items-center justify-center gap-1 mb-4 h-12">
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.div key={i}
                animate={{ height: ['12px', `${20 + Math.random() * 28}px`, '12px'] }}
                transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 rounded-full bg-blue-400" />
            ))}
          </div>
        )}

        {/* Main mic button */}
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={toggleRecording}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-500 shadow-lg shadow-red-500/30'
                : status === 'processing'
                ? 'bg-[#10151F] border-2 border-orange-500/50'
                : 'bg-gradient-to-br from-[#D4A853] to-[#E8C97A] shadow-lg shadow-[#D4A853]/30'
            }`}
          >
            {status === 'processing' ? (
              <SpinnerGap size={32} className="text-orange-400 animate-spin" />
            ) : isRecording ? (
              <MicrophoneSlash size={32} className="text-white" />
            ) : (
              <Microphone size={32} className="text-[#10151F]" />
            )}
            {/* Pulse ring */}
            {isRecording && (
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-red-500" />
            )}
          </button>
        </div>

        {/* Text input toggle */}
        <div className="flex items-center justify-center mb-3">
          <button onClick={() => setShowTextInput(!showTextInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10151F] text-[#7A7363] text-xs hover:text-[#F5E8C7]">
            <Keyboard size={14} />
            {showTextInput ? 'Hide keyboard' : 'Use keyboard'}
          </button>
        </div>

        {/* Text input */}
        {showTextInput && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex gap-2">
            <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendTextMessage()}
              placeholder={`Message ${companion.name}...`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#7A7363] focus:outline-none focus:border-[#D4A853]/50" />
            <button onClick={sendTextMessage} disabled={!textInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#D4A853] text-[#10151F] disabled:opacity-40">
              <PaperPlaneRight size={16} />
            </button>
          </motion.div>
        )}
      </div>

      <div className="px-4 pb-4">
        <DisclaimerBanner contentId="HEALTH" variant="banner" />
      </div>

      {/* Companion Selector Sheet */}
      <AnimatePresence>
        {showSelector && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => setShowSelector(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-[#10151F] rounded-t-3xl max-h-[70vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#10151F] px-5 pt-4 pb-3 border-b border-[rgba(212,168,83,0.2)]/50 flex items-center justify-between z-10">
                <h2 className="text-[#F5E8C7] font-bold text-lg">Choose Companion</h2>
                <button onClick={() => setShowSelector(false)} className="p-1.5 rounded-lg hover:bg-white/10">
                  <X size={20} className="text-[#7A7363]" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {COMPANIONS.map((c) => (
                  <button key={c.id}
                    onClick={() => { setCompanion(c); setShowSelector(false); setMessages([]); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                      companion.id === c.id ? 'bg-[#D4A853]/15 border border-[#D4A853]/30' : 'bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 hover:border-[#D4A853]/30'
                    }`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center shrink-0">
                      <span className="text-[#10151F] font-bold text-sm">{c.name[0]}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#F5E8C7] font-semibold text-sm">{c.name}</h3>
                      <p className="text-[#7A7363] text-xs">{c.description}</p>
                    </div>
                    {companion.id === c.id && <div className="w-3 h-3 rounded-full bg-[#D4A853]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VoiceCompanionPage;
