/**
 * Shared types for the Islamic Media page.
 */

export type ActiveTab = 'home' | 'quran' | 'duas' | 'podcasts' | 'stories' | 'nasheeds';
export type QuranSubTab = 'recitation' | 'reading';
export type ReadingViewMode = 'focus' | 'ayah' | 'page';

export interface PlayingNasheed {
  artist: string;
  title: string;
}

export interface PlayingPodcastEpisode {
  seriesId: number;
  episodeNumber: number;
}
