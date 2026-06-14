/**
 * Static / mock data for the Halaqah page.
 *
 * Barrel re-export — individual data lives in:
 *  - `./_categories.tsx`  — JSX icons for category list
 *  - `./_mockEvents.ts`   — mock event records
 *
 * Phase 5 P1 split: kept this barrel because many files import from `./_data`.
 */

export { eventCategories } from './_categories';
export {
  mockEvents,
  myUpcomingEvents,
  myPastEvents,
  myCancelledEvents,
  hostDashboardEvents,
} from './_mockEvents';
