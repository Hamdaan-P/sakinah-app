/**
 * FloatingToolbar
 * Contextual action bar that appears only when something is selected.
 * Replaces the reference app's always-visible bottom tab bar.
 */

import { motion } from 'framer-motion';
import {
  Play,
  BookmarkSimple,
  Highlighter,
  PencilSimpleLine,
  Trash,
  Copy,
  Target,
  MagnifyingGlass,
  MagnifyingGlassPlus,
  X,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export interface ToolbarAction {
  id: string;
  icon: typeof Play;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'primary' | 'danger';
}

interface Props {
  actions: ToolbarAction[];
  onDismiss: () => void;
  label?: string;
}

/**
 * Preset action builders — callers compose what they need.
 */
// eslint-disable-next-line react-refresh/only-export-components -- preset builder helpers colocated with the FloatingToolbar component
export const toolbarActions = {
  play: (onClick: () => void): ToolbarAction => ({ id: 'play', icon: Play, label: 'Play', onClick, tone: 'primary' }),
  bookmark: (onClick: () => void, active = false): ToolbarAction => ({
    id: 'bookmark',
    icon: BookmarkSimple,
    label: active ? 'Unbookmark' : 'Bookmark',
    onClick,
  }),
  highlight: (onClick: () => void): ToolbarAction => ({ id: 'highlight', icon: Highlighter, label: 'Highlight', onClick }),
  note: (onClick: () => void): ToolbarAction => ({ id: 'note', icon: PencilSimpleLine, label: 'Note', onClick }),
  copy: (onClick: () => void): ToolbarAction => ({ id: 'copy', icon: Copy, label: 'Copy', onClick }),
  test: (onClick: () => void): ToolbarAction => ({ id: 'test', icon: Target, label: 'Test', onClick }),
  search: (onClick: () => void): ToolbarAction => ({ id: 'search', icon: MagnifyingGlass, label: 'Search concepts', onClick }),
  deepDive: (onClick: () => void): ToolbarAction => ({ id: 'deepdive', icon: MagnifyingGlassPlus, label: 'Deep Dive', onClick, tone: 'primary' }),
  deleteAction: (onClick: () => void): ToolbarAction => ({ id: 'delete', icon: Trash, label: 'Delete', onClick, tone: 'danger' }),
};

export function FloatingToolbar({ actions, onDismiss, label }: Props) {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0, scale: 0.92 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 80, opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', damping: 22, stiffness: 320 }}
      className="fixed left-1/2 -translate-x-1/2 bottom-6 z-40 flex items-center gap-1 px-2 py-1.5 rounded-full bg-[#0A0E16]/95 border border-[#D4A853]/30 shadow-2xl shadow-black/60 backdrop-blur-md"
      style={{ boxShadow: '0 10px 40px -10px rgba(212,168,83, 0.35), 0 0 0 1px rgba(212,168,83, 0.15)' }}
    >
      {label && (
        <span className="px-2 text-[11px] font-medium text-[#D4A853] whitespace-nowrap">{label}</span>
      )}
      {actions.map((a) => (
        <button
          key={a.id}
          onClick={a.onClick}
          title={a.label}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors',
            a.tone === 'primary' && 'bg-[#D4A853]/15 text-[#D4A853] hover:bg-[#D4A853]/25',
            a.tone === 'danger' && 'text-red-300 hover:bg-red-500/15',
            (!a.tone || a.tone === 'default') && 'text-white/80 hover:bg-white/10',
          )}
        >
          <a.icon size={14} weight={a.tone === 'primary' ? 'fill' : 'regular'} />
          <span className="hidden sm:inline">{a.label}</span>
        </button>
      ))}
      <button
        onClick={onDismiss}
        className="ml-1 p-1 rounded-full text-white/40 hover:bg-white/10"
        title="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
