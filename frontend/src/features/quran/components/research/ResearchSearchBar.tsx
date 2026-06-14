/**
 * ResearchSearchBar — sticky topical-search input for the research workspace.
 */

import { useEffect, useRef, useState } from 'react';

interface Props {
  initialValue?: string;
  loading?: boolean;
  onSubmit: (query: string) => void;
}

export function ResearchSearchBar({ initialValue = '', loading = false, onSubmit }: Props) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus on mount instead of autoFocus prop (eslint jsx-a11y/no-autofocus).
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (trimmed.length >= 2) onSubmit(trimmed);
      }}
      className="flex items-center gap-2"
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search themes, concepts, names…"
        aria-label="Research search input"
        className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryTeal/30"
        // eslint-disable-next-line jsx-a11y/no-autofocus -- deliberate: this is a search-page entry input, user navigated here to type
        autoFocus
      />
      <button
        type="submit"
        disabled={loading || value.trim().length < 2}
        className="rounded-md bg-primaryTeal px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Searching…' : 'Search'}
      </button>
    </form>
  );
}
