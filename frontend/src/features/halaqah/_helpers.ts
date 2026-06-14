/**
 * Halaqah helpers. Phase 5 split.
 */

import { eventCategories } from './_data';
import type { EventCategory } from './_types';

export function getCategoryData(categoryId: string): EventCategory {
  return eventCategories.find((c) => c.id === categoryId) || eventCategories[9];
}
