/**
 * useGroupedBlessings — derives the filter-aware, date-grouped list of journal
 * entries (own + community) from the raw stores.
 */

import { useMemo } from 'react';
import type { Blessing, PublicBlessing } from '../../types/barka-labs.types';
import { isToday, isYesterday, isThisWeek, groupLabel, type Filter } from './_helpers';
import type { JournalGroup } from './JournalGroups';

export function useGroupedBlessings(
  blessings: Blessing[],
  communityFeed: PublicBlessing[],
  activeFilter: Filter,
): JournalGroup[] {
  const filtered = useMemo(() => {
    let list = blessings;

    switch (activeFilter) {
      case 'Today':
        list = list.filter((b) => { try { return isToday(new Date(b.created_at)); } catch { return false; } });
        break;
      case 'Yesterday':
        list = list.filter((b) => { try { return isYesterday(new Date(b.created_at)); } catch { return false; } });
        break;
      case 'This Week':
        list = list.filter((b) => { try { return isThisWeek(new Date(b.created_at)) && !isToday(new Date(b.created_at)) && !isYesterday(new Date(b.created_at)); } catch { return false; } });
        break;
      case 'Older':
        list = list.filter((b) => { try { return !isThisWeek(new Date(b.created_at)); } catch { return false; } });
        break;
      default:
        break;
    }

    return list;
  }, [blessings, activeFilter]);

  return useMemo(() => {
    const groups: JournalGroup[] = [];

    if (activeFilter === 'All') {
      // "All" view: ONLY others' blessings (community feed). User's own
      // entries surface under the date filters (Today / Yesterday / etc).
      if (communityFeed.length > 0) {
        groups.push({ label: 'From the community', items: communityFeed, isOthers: true });
      }
    } else {
      // Date filters: ONLY the user's own blessings, grouped by date label.
      const map = new Map<string, Blessing[]>();
      for (const b of filtered) {
        try {
          const d = new Date(b.created_at);
          if (isNaN(d.getTime())) continue;
          const label = groupLabel(d);
          if (!map.has(label)) map.set(label, []);
          map.get(label)!.push(b);
        } catch { /* skip */ }
      }
      for (const [label, items] of map) {
        groups.push({ label, items });
      }
    }

    return groups;
  }, [filtered, activeFilter, communityFeed]);
}
