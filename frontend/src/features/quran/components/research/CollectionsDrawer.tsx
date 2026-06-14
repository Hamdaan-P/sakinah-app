/**
 * CollectionsDrawer — slide-in panel listing the user's research collections
 * and the items saved to each. Local-only (localStorage) — same persistence
 * pattern as the existing annotation/highlight managers.
 */

import { useEffect, useState } from 'react';
import type { ResearchCollection } from '../../types/quran.types';
import {
  createCollection,
  deleteCollection,
  listCollections,
  onCollectionsChange,
  removeItemFromCollection,
} from '../../services/researchCollectionsService';
import { SourceCitationChip } from '../governance/SourceCitationChip';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CollectionsDrawer({ open, onClose }: Props) {
  const [collections, setCollections] = useState<ResearchCollection[]>(() => listCollections());
  const [newName, setNewName] = useState('');

  useEffect(() => onCollectionsChange(() => setCollections(listCollections())), []);

  if (!open) return null;

  return (
    <aside
      role="dialog"
      aria-label="Research collections"
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl"
    >
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Saved collections</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close collections"
          className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ✕
        </button>
      </header>

      <div className="border-b border-slate-200 dark:border-slate-800 p-3 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New collection name"
          className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primaryTeal/30"
        />
        <button
          type="button"
          onClick={() => {
            const t = newName.trim();
            if (!t) return;
            createCollection(t);
            setNewName('');
          }}
          className="rounded-md bg-primaryTeal px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          disabled={!newName.trim()}
        >
          Create
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {collections.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No collections yet. Create one to start saving research findings.
          </p>
        )}

        {collections.map((col) => (
          <section
            key={col.id}
            className="rounded-md border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/30 p-3 space-y-2"
          >
            <header className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {col.name}{' '}
                <span className="text-xs text-slate-500">({col.items.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => deleteCollection(col.id)}
                className="text-xs text-slate-500 hover:text-red-500"
              >
                Delete
              </button>
            </header>

            {col.items.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">No saved items.</p>
            )}

            <ul className="space-y-2">
              {col.items.map((item) => (
                <li
                  key={item.id}
                  className="rounded border border-slate-200 dark:border-slate-700 p-2 text-xs space-y-1"
                >
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-3">
                    {item.result.excerpt}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <SourceCitationChip citation={item.result.citation} />
                    <button
                      type="button"
                      onClick={() => removeItemFromCollection(col.id, item.id)}
                      className="text-slate-400 hover:text-red-500"
                      aria-label="Remove from collection"
                    >
                      remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  );
}
