/**
 * Mode toggle + text/voice input area for the 1-min Shukr challenge.
 */

import { forwardRef } from 'react';
import { C } from '../../barka-labs.constants';

type InputMode = 'type' | 'voice';
type ChallengePhase = 'ready' | 'running' | 'done';

interface ChallengeInputProps {
  mode: InputMode;
  text: string;
  phase: ChallengePhase;
  onModeChange: (mode: InputMode) => void;
  onTextChange: (text: string) => void;
}

export const ChallengeInput = forwardRef<HTMLTextAreaElement, ChallengeInputProps>(
  function ChallengeInput({ mode, text, phase, onModeChange, onTextChange }, ref) {
    return (
      <>
        {/* Mode Toggle */}
        <div className="flex gap-1.5 px-5 mb-3">
          {(['type', 'voice'] as InputMode[]).map(m => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className="flex-1 py-2.5 rounded-[10px] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              style={{
                border: `1px solid ${mode === m ? C.gold : C.cardB}`,
                background: mode === m ? 'rgba(212,168,83,0.06)' : 'transparent',
                color: mode === m ? C.gold : C.t2,
              }}
            >
              {m === 'type' ? '✏️ Type' : '🎤 Voice'}
            </button>
          ))}
        </div>

        {/* Type Area */}
        {mode === 'type' && (
          <div className="">
            <textarea
              ref={ref}
              value={text}
              onChange={e => onTextChange(e.target.value)}
              disabled={phase !== 'running'}
              placeholder={'1. I\'m grateful for...\n2. \n3. '}
              className="w-full min-h-[200px] rounded-[14px] p-3.5 text-sm outline-none resize-none transition-colors"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: `1px solid ${C.cardB}`,
                color: C.t1,
                lineHeight: 1.8,
              }}
            />
          </div>
        )}

        {/* Voice Area */}
        {mode === 'voice' && (
          <div className=" text-center">
            <button
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto my-3 transition-colors"
              style={{
                border: `2px solid rgba(224,122,107,0.3)`,
                background: 'rgba(224,122,107,0.08)',
                color: C.rose,
              }}
            >
              🎤
            </button>
            <p className="text-[11px]" style={{ color: C.t2 }}>Voice mode coming soon — use Type for now</p>
          </div>
        )}
      </>
    );
  }
);
