import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { COLORS } from '../_constants';
import { RECITERS } from '../_constants';
import { SURAHS, type PodcastSeries, type ProphetStory, type Surah } from '../_data';
import type {
  ActiveTab,
  PlayingNasheed,
  PlayingPodcastEpisode,
  QuranSubTab,
  ReadingViewMode,
} from '../_types';
import { MediaHeader } from '../components/MediaHeader';
import { HomeTab } from '../components/HomeTab';
import { QuranTab } from '../components/QuranTab';
import { DuasTab } from '../components/DuasTab';
import { PodcastsTab } from '../components/PodcastsTab';
import { StoriesTab } from '../components/StoriesTab';
import { NasheedsTab } from '../components/NasheedsTab';
import { QuranPlayerBar } from '../components/QuranPlayerBar';
import { PodcastPlayerBar } from '../components/PodcastPlayerBar';
import { NasheedPlayerBar } from '../components/NasheedPlayerBar';
import { PodcastSeriesOverlay } from '../components/PodcastSeriesOverlay';
import { StoryOverlay } from '../components/StoryOverlay';

export function MediaPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [quranSubTab, setQuranSubTab] = useState<QuranSubTab>('recitation');
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [showReciterDropdown, setShowReciterDropdown] = useState(false);
  const [playingSurah, setPlayingSurah] = useState<number | null>(null);
  const [selectedReadingSurah, setSelectedReadingSurah] = useState<Surah>(SURAHS[0]);
  const [readingViewMode, setReadingViewMode] = useState<ReadingViewMode>('ayah');
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<number>>(new Set([1, 3]));
  const [quranStreak] = useState(5);
  const [selectedDuaCategory, setSelectedDuaCategory] = useState<string | null>(null);
  const [selectedPodcastSeries, setSelectedPodcastSeries] = useState<PodcastSeries | null>(null);
  const [playingPodcastEpisode, setPlayingPodcastEpisode] = useState<PlayingPodcastEpisode | null>(null);
  const [selectedStory, setSelectedStory] = useState<ProphetStory | null>(null);
  const [playingNasheed, setPlayingNasheed] = useState<PlayingNasheed | null>(null);

  const toggleBookmark = (verseNumber: number) => {
    const newBookmarks = new Set(bookmarkedVerses);
    if (newBookmarks.has(verseNumber)) {
      newBookmarks.delete(verseNumber);
    } else {
      newBookmarks.add(verseNumber);
    }
    setBookmarkedVerses(newBookmarks);
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: COLORS.navy.primary,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <MediaHeader activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 48px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <HomeTab onSelectTab={setActiveTab} />}

          {activeTab === 'quran' && (
            <QuranTab
              quranSubTab={quranSubTab}
              selectedReciter={selectedReciter}
              showReciterDropdown={showReciterDropdown}
              playingSurah={playingSurah}
              selectedReadingSurah={selectedReadingSurah}
              readingViewMode={readingViewMode}
              bookmarkedVerses={bookmarkedVerses}
              quranStreak={quranStreak}
              onChangeSubTab={setQuranSubTab}
              onChangeReciter={(reciter) => {
                setSelectedReciter(reciter);
                setShowReciterDropdown(false);
              }}
              onToggleReciterDropdown={() => setShowReciterDropdown(!showReciterDropdown)}
              onTogglePlaySurah={(num) => setPlayingSurah(playingSurah === num ? null : num)}
              onChangeReadingSurah={setSelectedReadingSurah}
              onChangeViewMode={setReadingViewMode}
              onToggleBookmark={toggleBookmark}
            />
          )}

          {activeTab === 'duas' && (
            <DuasTab
              selectedDuaCategory={selectedDuaCategory}
              onSelectCategory={setSelectedDuaCategory}
            />
          )}

          {activeTab === 'podcasts' && (
            <PodcastsTab onSelectSeries={setSelectedPodcastSeries} />
          )}

          {activeTab === 'stories' && <StoriesTab onSelectStory={setSelectedStory} />}

          {activeTab === 'nasheeds' && (
            <NasheedsTab playingNasheed={playingNasheed} onTogglePlayNasheed={setPlayingNasheed} />
          )}
        </AnimatePresence>
      </div>

      <QuranPlayerBar
        playingSurah={playingSurah}
        selectedReciter={selectedReciter}
        onStop={() => setPlayingSurah(null)}
      />

      <PodcastSeriesOverlay
        selectedPodcastSeries={selectedPodcastSeries}
        playingPodcastEpisode={playingPodcastEpisode}
        onClose={() => setSelectedPodcastSeries(null)}
        onTogglePlayEpisode={setPlayingPodcastEpisode}
      />

      <PodcastPlayerBar
        playingPodcastEpisode={playingPodcastEpisode}
        onStop={() => setPlayingPodcastEpisode(null)}
      />

      <StoryOverlay selectedStory={selectedStory} onClose={() => setSelectedStory(null)} />

      <NasheedPlayerBar
        playingNasheed={playingNasheed}
        playingPodcastEpisode={playingPodcastEpisode}
        playingSurah={playingSurah}
        onStop={() => setPlayingNasheed(null)}
      />
    </div>
  );
}
