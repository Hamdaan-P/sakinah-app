/**
 * 1-Minute Shukr Challenge — Solo timed gratitude challenge
 * Type or speak as many blessings as you can in 60 seconds.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';
import { C, cardStyle } from '../barka-labs.constants';
import type { BarkaLabsScreen } from '../pages/BarkaLabsPage';
import { PastAttemptsList } from './one-min/PastAttemptsList';
import { ChallengeInput } from './one-min/ChallengeInput';

interface OneMinChallengeProps {
  onSubmitBlessing: (text: string) => Promise<void>;
  submitting: boolean;
  go: (s: BarkaLabsScreen) => void;
}

type ChallengePhase = 'ready' | 'running' | 'done';
type InputMode = 'type' | 'voice';

export function OneMinChallenge({ onSubmitBlessing, submitting, go }: OneMinChallengeProps) {
  const [phase, setPhase] = useState<ChallengePhase>('ready');
  const [mode, setMode] = useState<InputMode>('type');
  const [timeLeft, setTimeLeft] = useState(60);
  const [text, setText] = useState('');
  const [gratCount, setGratCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Count lines
  useEffect(() => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    setGratCount(lines.length);
  }, [text]);

  // Timer
  useEffect(() => {
    if (phase !== 'running') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setPhase('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const startChallenge = useCallback(() => {
    setPhase('running');
    setTimeLeft(60);
    setText('');
    setGratCount(0);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  const handleDone = useCallback(async () => {
    // Submit each line as a blessing
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    for (const line of lines.slice(0, 5)) { // Submit max 5 to avoid spam
      await onSubmitBlessing(line.trim());
    }
    go('home');
  }, [text, onSubmitBlessing, go]);

  const timerColor = timeLeft <= 10 ? C.rose : timeLeft <= 30 ? C.gold : C.gold;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => go('home')}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={cardStyle}
        >
          <ArrowLeft size={18} className="text-[#EBDCB8]" />
        </button>
        <div className="text-lg font-bold" style={{ fontFamily: 'Cormorant Garamond, serif', color: C.t1 }}>
          1-Minute Shukr Challenge
        </div>
      </div>

      {/* Timer */}
      <div className="text-center py-5">
        <div
          className="text-7xl font-extrabold leading-none"
          style={{ fontFamily: 'Cormorant Garamond, serif', color: phase === 'done' ? C.emL : timerColor }}
        >
          {phase === 'done' ? '✓' : timeLeft}
        </div>
        <div className="text-[11px] mt-1" style={{ color: C.t2 }}>
          {phase === 'done' ? 'Challenge complete!' : 'seconds remaining'}
        </div>
      </div>

      {/* Instructions */}
      <p className="text-center text-[11px] px-5 mb-2" style={{ color: C.t2 }}>
        Write or speak as many things you're grateful for as you can. One per line. Go!
      </p>

      <ChallengeInput
        ref={textareaRef}
        mode={mode}
        text={text}
        phase={phase}
        onModeChange={setMode}
        onTextChange={setText}
      />

      {/* Count */}
      <div className="text-center mt-3">
        <div className="text-3xl font-bold" style={{ fontFamily: 'Cormorant Garamond, serif', color: C.emL }}>
          {gratCount}
        </div>
        <div className="text-[10px]" style={{ color: C.t2 }}>gratitudes logged</div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-5 mt-4">
        {phase === 'ready' && (
          <button
            onClick={startChallenge}
            className="flex-1 py-3.5 rounded-xl text-[13px] font-bold transition-shadow hover:shadow-lg"
            style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`, color: C.bg }}
          >
            Start Challenge 🚀
          </button>
        )}
        {phase === 'running' && (
          <button
            className="flex-1 py-3.5 rounded-xl text-[13px] font-bold opacity-50 cursor-default"
            style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`, color: C.bg }}
          >
            Challenge Running...
          </button>
        )}
        {phase === 'done' && (
          <button
            onClick={handleDone}
            disabled={submitting}
            className="flex-1 py-3.5 rounded-xl text-[13px] font-bold transition-shadow hover:shadow-lg"
            style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`, color: C.bg }}
          >
            {submitting ? 'Saving...' : 'Save & View Results 🎉'}
          </button>
        )}
      </div>

      {/* Link to Journal */}
      <div className=" mt-3">
        <div
          role="button"
          tabIndex={0}
          className="flex items-center justify-between rounded-xl p-3 text-[11px] cursor-pointer transition-colors"
          style={{ background: 'rgba(139,126,200,0.06)', border: `1px solid rgba(139,126,200,0.1)`, color: C.purple }}
          onClick={() => go('journal')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('journal'); } }}
        >
          <span>📖 View all your gratitudes in the journal</span>
          <span>→</span>
        </div>
      </div>

      <PastAttemptsList />

      {/* Back */}
      <div className=" py-5">
        <button
          onClick={() => go('home')}
          className="w-full py-3.5 rounded-xl text-sm font-bold"
          style={{ background: `linear-gradient(135deg, ${C.em}, ${C.emD})`, color: C.t1 }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
