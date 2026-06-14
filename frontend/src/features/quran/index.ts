// Side-effect import: registers the auth listener that auto-syncs Quran
// localStorage state to Firestore for signed-in users.
import './services/quranSyncService';

export { QuranHomePage } from './pages/QuranHomePage';
export { QuranReadingPage } from './pages/QuranReadingPage';
export { QuranRecitationPage } from './pages/QuranRecitationPage';
export { QuranStreakPage } from './pages/QuranStreakPage';
export { QuranBookmarksPage } from './pages/QuranBookmarksPage';
export { QuranHifzPage } from './pages/QuranHifzPage';
export { QuranMemorizePage } from './pages/QuranMemorizePage';
export { QuranTestPage } from './pages/QuranTestPage';
export { QuranProgressPage } from './pages/QuranProgressPage';
export { QuranWorkspacePage } from './pages/QuranWorkspacePage';
export { QuranWorkspaceEditorPage } from './pages/QuranWorkspaceEditorPage';
export type {
  Surah,
  QuranLine,
  QuranSearchResult,
  QuranWord,
  Highlight,
  HighlightCategory,
  Annotation,
  HifzStatus,
  HifzSession,
  HifzMistake,
  MemorizeMode,
  RevisionPlanItem,
} from './types/quran.types';
