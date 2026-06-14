import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookmarkSimple } from '@phosphor-icons/react';
import { listSaved, subscribeSavedChanges, hydrateSavedFromServer } from '../services/soukSaveService';
import { fetchListing } from '../services/soukService';
import { FeedCard } from '../components/FeedCard';
import { auth } from '@/config/firebase.config';
import type { Listing, RankedListing } from '../types/souk.types';

export function SoukSavedPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      setLoading(true);
      const uid = auth.currentUser?.uid;
      if (uid) await hydrateSavedFromServer(uid);
      const ids = listSaved();
      if (ids.length === 0) {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
        return;
      }
      const fetched = await Promise.all(ids.map((id) => fetchListing(id).catch(() => null)));
      if (!cancelled) {
        setItems(fetched.filter((l): l is Listing => l !== null));
        setLoading(false);
      }
    }
    refresh();
    const unsub = subscribeSavedChanges(refresh);
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return (
    <div className="min-h-screen pb-12 max-w-6xl mx-auto">
      <div className="px-4 pt-5 pb-3 flex items-center gap-3">
        <Link
          to="/souk"
          className="p-2 rounded-lg bg-[#2C3C55] border border-[rgba(215,181,106,0.2)]"
        >
          <ArrowLeft size={18} className="text-[#EBDCB8]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#EBDCB8]">Saved listings</h1>
          <p className="text-[#A7B1C0] text-xs">{items.length} item{items.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      <div className="px-4">
        {loading ? (
          <p className="text-[#A7B1C0] text-sm py-10 text-center">Loading…</p>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <BookmarkSimple size={42} className="mx-auto text-[#D7B56A]/40 mb-3" />
            <p className="text-[#EBDCB8] font-semibold">Nothing saved yet</p>
            <p className="text-[#A7B1C0] text-sm mt-1 mb-4">
              Tap the bookmark on any listing to keep it here.
            </p>
            <Link
              to="/souk"
              className="inline-block px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D7B56A] to-[#E7CF8C] text-[#1E293A] font-bold text-sm"
            >
              Explore the Souk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {items.map((l, i) => (
              <FeedCard key={l.id} listing={l as RankedListing} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
