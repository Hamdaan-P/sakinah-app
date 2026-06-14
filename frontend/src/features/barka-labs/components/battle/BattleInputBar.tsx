/**
 * Bottom input bar for typing blessings during the active battle phase.
 */

import { forwardRef } from 'react';
import { Spinner, PaperPlaneTilt } from '@phosphor-icons/react';

interface BattleInputBarProps {
  text: string;
  submitting: boolean;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSubmit: () => void;
}

export const BattleInputBar = forwardRef<HTMLInputElement, BattleInputBarProps>(
  function BattleInputBar({ text, submitting, onChange, onKeyDown, onSubmit }, ref) {
    return (
      <div className="px-3 pb-4 pt-2 sm:px-4 sm:pb-6">
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3"
          style={{
            backgroundColor: 'rgba(36,50,70,0.6)',
            border: '1px solid rgba(215,181,106,0.2)',
          }}
        >
          <input
            ref={ref}
            value={text}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a blessing — hit Enter fast!"
            maxLength={500}
            className="flex-1 bg-transparent text-[#EBDCB8] placeholder-[#7F8A9A] text-sm outline-none"
          />
          <button
            onClick={onSubmit}
            disabled={!text.trim() || submitting}
            className="p-1.5 rounded-lg disabled:opacity-30"
            style={{ color: '#D7B56A' }}
          >
            {submitting ? <Spinner size={18} className="animate-spin" /> : <PaperPlaneTilt size={18} weight="fill" />}
          </button>
        </div>
      </div>
    );
  }
);
