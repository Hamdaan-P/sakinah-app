/**
 * SimSessionNameEditor — inline rename for a sim session (Sprint 6 Phase 2).
 *
 * Click the pencil icon to switch into edit mode, type, Enter to save,
 * Escape to cancel. Used as the page H1 when a session is open in
 * EimTimeMachinePage. Falls back to portfolio.name for legacy sessions
 * that don't have a session-level name field set.
 */

import { useEffect, useRef, useState } from 'react';
import { Check, PencilSimple, X } from '@phosphor-icons/react';
import { useSimStore } from '../stores/sim.store';
import type { SimSession } from '../types/eim.types';

export interface SimSessionNameEditorProps {
  session: SimSession;
}

export function SimSessionNameEditor({ session }: SimSessionNameEditorProps) {
  const displayName = session.name?.trim() || session.portfolio.name;
  const renameSession = useSimStore((s) => s.renameSession);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the input value in sync if the session is renamed elsewhere
  // (e.g. by a parallel browser tab on the same account).
  useEffect(() => {
    if (!editing) setValue(displayName);
  }, [displayName, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const save = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === displayName) {
      setEditing(false);
      setValue(displayName);
      return;
    }
    setSaving(true);
    try {
      await renameSession(session.id, trimmed);
      setEditing(false);
    } catch {
      // Error is surfaced via store.error banner; revert local input.
      setValue(displayName);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setValue(displayName);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void save();
            else if (e.key === 'Escape') cancel();
          }}
          disabled={saving}
          maxLength={80}
          className="text-[20px] font-bold text-[#F5E8C7] bg-[#0F1724] border border-[rgba(212,168,83,0.35)] rounded-lg px-2 py-0.5 min-w-0 flex-1"
        />
        <button
          onClick={() => void save()}
          disabled={saving}
          className="w-7 h-7 rounded-md bg-[rgba(95,201,134,0.15)] border border-[rgba(95,201,134,0.40)] text-[#5FC986] flex items-center justify-center disabled:opacity-60"
          aria-label="Save name"
        >
          <Check size={12} weight="bold" />
        </button>
        <button
          onClick={cancel}
          disabled={saving}
          className="w-7 h-7 rounded-md bg-[#0F1724] border border-[rgba(212,168,83,0.18)] text-[#7A7363] flex items-center justify-center disabled:opacity-60"
          aria-label="Cancel rename"
        >
          <X size={12} weight="bold" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <h1 className="text-[20px] font-bold text-[#F5E8C7] truncate" title={displayName}>
        {displayName}
      </h1>
      <button
        onClick={() => setEditing(true)}
        className="w-7 h-7 rounded-md text-[#7A7363] hover:text-[#D4A853] flex items-center justify-center flex-shrink-0"
        aria-label="Rename session"
        title="Rename"
      >
        <PencilSimple size={12} weight="bold" />
      </button>
    </div>
  );
}
