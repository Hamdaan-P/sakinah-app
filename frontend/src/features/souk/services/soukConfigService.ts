/**
 * Souk runtime config — frontend overlay.
 *
 * The canonical UI metadata (icons + gradient + accent hex) lives in
 * `_data.tsx` because those bind to React component types that can't live
 * in Firestore. The *category arrays* inside each listing type CAN be
 * tuned without a redeploy, so this service fetches them from the
 * `souk_config/listing_types` Firestore doc and merges over the
 * hardcoded defaults.
 *
 * Usage pattern: import `useListingTypes()` in a component to get the
 * runtime-merged metadata. First call kicks off a fetch; subsequent calls
 * return the cached overlay.
 */

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { LISTING_TYPES as DEFAULT_LISTING_TYPES, REPORT_REASONS as DEFAULT_REPORT_REASONS, type ListingTypeMeta } from '../_data';

interface TaxonomyOverride {
  // Per-type category overrides: { product: ["Books", "Clothing", ...], ... }
  categories?: Record<string, string[]>;
  // Optional override for the full report reasons list.
  report_reasons?: { id: string; label: string }[];
}

// Module-scope cache so repeated calls in a session reuse the result.
let _overlay: TaxonomyOverride | null = null;
let _inFlight: Promise<TaxonomyOverride> | null = null;

async function loadOverlay(): Promise<TaxonomyOverride> {
  if (_overlay) return _overlay;
  if (_inFlight) return _inFlight;
  _inFlight = (async () => {
    try {
      const snap = await getDoc(doc(db, 'souk_config', 'listing_types'));
      if (!snap.exists()) {
        _overlay = {};
        return _overlay;
      }
      _overlay = (snap.data() as TaxonomyOverride) ?? {};
      return _overlay;
    } catch {
      // Firestore offline or rules deny — fall back to TS defaults silently.
      _overlay = {};
      return _overlay;
    } finally {
      _inFlight = null;
    }
  })();
  return _inFlight;
}

/** Hook returning the runtime-merged ListingType metadata. */
export function useListingTypes(): ListingTypeMeta[] {
  const [merged, setMerged] = useState<ListingTypeMeta[]>(DEFAULT_LISTING_TYPES);
  useEffect(() => {
    let cancelled = false;
    void loadOverlay().then((overlay) => {
      if (cancelled) return;
      const catOverrides = overlay.categories ?? {};
      const next = DEFAULT_LISTING_TYPES.map((t) =>
        catOverrides[t.id] && Array.isArray(catOverrides[t.id])
          ? { ...t, categories: catOverrides[t.id]! }
          : t,
      );
      setMerged(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return merged;
}

/** Hook returning the runtime-merged report reasons. */
export function useReportReasons(): { id: string; label: string }[] {
  const [reasons, setReasons] = useState(DEFAULT_REPORT_REASONS);
  useEffect(() => {
    let cancelled = false;
    void loadOverlay().then((overlay) => {
      if (cancelled) return;
      if (overlay.report_reasons && Array.isArray(overlay.report_reasons)) {
        setReasons(overlay.report_reasons);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return reasons;
}

/** Test/dev hook — force the next call to refetch from Firestore. */
export function _resetSoukConfigCache(): void {
  _overlay = null;
  _inFlight = null;
}
