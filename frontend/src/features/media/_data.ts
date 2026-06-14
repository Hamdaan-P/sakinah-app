/**
 * Static media catalogue — surahs, dua categories, podcast series,
 * prophet stories, and nasheed artists.
 *
 * Phase 5 split — moved out of MediaPage.tsx with no behaviour change.
 */

export const SURAHS = [
  { number: 1, arabic: 'الفاتحة', english: 'Al-Fatiha', verses: 7, type: 'Meccan' },
  { number: 2, arabic: 'البقرة', english: 'Al-Baqarah', verses: 286, type: 'Medinan' },
  { number: 3, arabic: 'آل عمران', english: "Ali 'Imran", verses: 200, type: 'Medinan' },
  { number: 4, arabic: 'النساء', english: 'An-Nisa', verses: 176, type: 'Medinan' },
  { number: 5, arabic: 'المائدة', english: "Al-Ma'idah", verses: 120, type: 'Medinan' },
  { number: 6, arabic: 'الأنعام', english: "Al-An'am", verses: 165, type: 'Meccan' },
  { number: 7, arabic: 'الأعراف', english: "Al-A'raf", verses: 206, type: 'Meccan' },
  { number: 8, arabic: 'الأنفال', english: 'Al-Anfal', verses: 75, type: 'Medinan' },
  { number: 9, arabic: 'التوبة', english: 'At-Tawbah', verses: 129, type: 'Medinan' },
  { number: 10, arabic: 'يونس', english: 'Yunus', verses: 109, type: 'Meccan' },
  { number: 11, arabic: 'هود', english: 'Hud', verses: 123, type: 'Meccan' },
  { number: 12, arabic: 'يوسف', english: 'Yusuf', verses: 111, type: 'Meccan' },
  { number: 13, arabic: 'الرعد', english: "Ar-Ra'd", verses: 43, type: 'Medinan' },
  { number: 14, arabic: 'إبراهيم', english: 'Ibrahim', verses: 52, type: 'Meccan' },
  { number: 15, arabic: 'الحجر', english: 'Al-Hijr', verses: 99, type: 'Meccan' },
  { number: 16, arabic: 'النحل', english: 'An-Nahl', verses: 128, type: 'Meccan' },
  { number: 17, arabic: 'الإسراء', english: 'Al-Isra', verses: 111, type: 'Meccan' },
  { number: 18, arabic: 'الكهف', english: 'Al-Kahf', verses: 110, type: 'Meccan' },
  { number: 19, arabic: 'مريم', english: 'Maryam', verses: 98, type: 'Meccan' },
  { number: 20, arabic: 'طه', english: 'Ta-Ha', verses: 135, type: 'Meccan' },
];

export const DUA_CATEGORIES = [
  { id: 'morning', icon: '☀️', name: 'Morning & Evening', count: 3 },
  { id: 'prayer', icon: '🤲', name: 'Prayer', count: 3 },
  { id: 'travel', icon: '✈️', name: 'Travel', count: 2 },
  { id: 'food', icon: '🍽️', name: 'Food & Drink', count: 3 },
  { id: 'protection', icon: '🛡️', name: 'Protection', count: 2 },
  { id: 'healing', icon: '❤️', name: 'Healing', count: 2 },
  { id: 'forgiveness', icon: '✨', name: 'Forgiveness', count: 2 },
  { id: 'gratitude', icon: '⭐', name: 'Gratitude', count: 2 },
];

export const DUAS: Record<string, { arabic: string; transliteration: string; translation: string; source: string }[]> = {
  morning: [
    {
      arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
      transliteration: 'Asbahna wa asbahal-mulku lillah, walhamdu lillah',
      translation: 'We have entered the morning and with it all the dominion belongs to Allah, and all praise is for Allah.',
      source: 'Muslim',
    },
    {
      arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
      transliteration: 'Amsayna wa amsal-mulku lillah, walhamdu lillah',
      translation: 'We have entered the evening and with it all the dominion belongs to Allah, and all praise is for Allah.',
      source: 'Muslim',
    },
    {
      arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ',
      transliteration: 'Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana abduka',
      translation: 'O Allah, You are my Lord, there is no deity except You. You created me and I am Your servant.',
      source: 'Bukhari',
    },
  ],
  prayer: [
    {
      arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ',
      transliteration: 'Rabbana taqabbal minna innaka antas-sameeul-aleem',
      translation: 'Our Lord, accept this from us. Indeed, You are the Hearing, the Knowing.',
      source: 'Quran 2:127',
    },
    {
      arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلاَةِ وَمِن ذُرِّيَّتِي',
      transliteration: 'Rabbi-jalni muqeemas-salati wa min dhurriyyati',
      translation: 'My Lord, make me an establisher of prayer, and from my descendants.',
      source: 'Quran 14:40',
    },
    {
      arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
      transliteration: "Allahumma a'inni ala dhikrika wa shukrika wa husni ibadatika",
      translation: 'O Allah, help me to remember You, to thank You, and to worship You in the best manner.',
      source: 'Abu Dawud',
    },
  ],
};

export const PODCAST_SERIES = [
  {
    id: 1,
    title: 'Umar Ibn Al-Khattab',
    author: 'Ali Muhammad Sallabi',
    description: 'A comprehensive biography of the second Caliph of Islam, exploring his life, leadership, and lasting impact on Islamic civilization.',
    episodes: 18,
    totalDuration: '18 hours',
    coverGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    episodesList: [
      { number: 1, title: 'Early Life and Conversion', duration: '58:30' },
      { number: 2, title: 'Companionship with the Prophet', duration: '62:15' },
      { number: 3, title: 'The Pledge at Aqabah', duration: '55:40' },
      { number: 4, title: 'Migration to Madinah', duration: '59:20' },
      { number: 5, title: 'Battle of Badr', duration: '64:10' },
      { number: 6, title: 'Battle of Uhud', duration: '61:30' },
      { number: 7, title: 'The Treaty of Hudaybiyyah', duration: '57:45' },
      { number: 8, title: 'Conquest of Makkah', duration: '63:20' },
      { number: 9, title: 'Battle of Hunayn', duration: '56:15' },
      { number: 10, title: 'The Farewell Pilgrimage', duration: '60:30' },
      { number: 11, title: 'Succession to the Caliphate', duration: '65:40' },
      { number: 12, title: 'Administrative Reforms', duration: '58:50' },
      { number: 13, title: 'Military Conquests', duration: '62:30' },
      { number: 14, title: 'Justice and Governance', duration: '59:15' },
      { number: 15, title: 'Economic Policies', duration: '57:20' },
      { number: 16, title: 'Social Welfare System', duration: '61:10' },
      { number: 17, title: 'Final Days', duration: '63:45' },
      { number: 18, title: 'Legacy and Impact', duration: '60:00' },
    ],
  },
  {
    id: 2,
    title: 'Abu Bakr As-Siddiq',
    author: 'Ali Muhammad Sallabi',
    description: 'The life story of the first Caliph of Islam, his unwavering faith, and his pivotal role in preserving the Muslim community.',
    episodes: 15,
    totalDuration: '15 hours',
    coverGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    episodesList: [
      { number: 1, title: 'Birth and Early Life', duration: '58:00' },
      { number: 2, title: 'The First Male Convert', duration: '62:30' },
      { number: 3, title: 'Supporting the Prophet', duration: '59:45' },
      { number: 4, title: 'The Night Journey', duration: '57:20' },
      { number: 5, title: 'The Hijrah Companion', duration: '64:15' },
      { number: 6, title: 'Life in Madinah', duration: '60:40' },
      { number: 7, title: 'Military Expeditions', duration: '61:30' },
      { number: 8, title: 'Leading the Hajj', duration: '56:50' },
      { number: 9, title: "The Prophet's Final Days", duration: '63:20' },
      { number: 10, title: 'Election as Caliph', duration: '65:10' },
      { number: 11, title: 'The Ridda Wars', duration: '62:45' },
      { number: 12, title: 'Compilation of the Quran', duration: '58:30' },
      { number: 13, title: 'Military Campaigns', duration: '60:15' },
      { number: 14, title: 'Final Days and Death', duration: '59:40' },
      { number: 15, title: 'His Enduring Legacy', duration: '61:20' },
    ],
  },
];

export const PROPHET_STORIES = [
  { name: 'Adam', subtitle: 'The First Human', readingTime: '8 min', wordCount: 1200 },
  { name: 'Idris', subtitle: 'The Truthful', readingTime: '5 min', wordCount: 750 },
  { name: 'Nuh', subtitle: 'The Patient Prophet', readingTime: '12 min', wordCount: 1800 },
  { name: 'Hud', subtitle: 'Prophet to the Aad', readingTime: '7 min', wordCount: 1050 },
  { name: 'Salih', subtitle: 'Prophet to the Thamud', readingTime: '7 min', wordCount: 1000 },
  { name: 'Ibrahim', subtitle: 'Friend of Allah', readingTime: '15 min', wordCount: 2200 },
  { name: 'Ismail', subtitle: 'The Sacrificed Son', readingTime: '10 min', wordCount: 1500 },
  { name: 'Ishaq', subtitle: 'Son of Ibrahim', readingTime: '6 min', wordCount: 900 },
  { name: 'Yaqub', subtitle: 'Father of Twelve Tribes', readingTime: '9 min', wordCount: 1350 },
  { name: 'Yusuf', subtitle: 'The Dreamer', readingTime: '18 min', wordCount: 2700 },
  { name: 'Ayyub', subtitle: 'The Patient One', readingTime: '8 min', wordCount: 1200 },
  { name: "Shu'ayb", subtitle: 'Prophet to Madyan', readingTime: '7 min', wordCount: 1050 },
  { name: 'Musa', subtitle: 'The Speaker to Allah', readingTime: '20 min', wordCount: 3000 },
  { name: 'Harun', subtitle: 'Brother of Musa', readingTime: '8 min', wordCount: 1200 },
  { name: 'Dawud', subtitle: 'The Psalmist King', readingTime: '12 min', wordCount: 1800 },
  { name: 'Sulayman', subtitle: 'The Wise King', readingTime: '14 min', wordCount: 2100 },
  { name: 'Ilyas', subtitle: 'The Zealous Prophet', readingTime: '6 min', wordCount: 900 },
  { name: "Al-Yasa'", subtitle: 'Successor of Ilyas', readingTime: '5 min', wordCount: 750 },
  { name: 'Yunus', subtitle: 'The Man of the Whale', readingTime: '9 min', wordCount: 1350 },
  { name: 'Dhul-Kifl', subtitle: 'The Patient Prophet', readingTime: '5 min', wordCount: 750 },
  { name: 'Zakariyya', subtitle: 'Father of Yahya', readingTime: '7 min', wordCount: 1050 },
  { name: 'Yahya', subtitle: 'John the Baptist', readingTime: '8 min', wordCount: 1200 },
  { name: 'Isa', subtitle: 'The Messiah', readingTime: '16 min', wordCount: 2400 },
  { name: 'Dhul-Qarnayn', subtitle: 'The Two-Horned One', readingTime: '10 min', wordCount: 1500 },
  { name: 'Luqman', subtitle: 'The Wise', readingTime: '6 min', wordCount: 900 },
  { name: 'Uzayr', subtitle: 'The Raised One', readingTime: '5 min', wordCount: 750 },
  { name: 'Muhammad', subtitle: 'The Final Prophet (PBUH)', readingTime: '30 min', wordCount: 4500 },
];

export const NASHEED_ARTISTS = [
  {
    name: 'Maher Zain',
    nasheeds: [
      { title: 'Assalamu Alayka', duration: '4:32' },
      { title: 'Insha Allah', duration: '4:15' },
      { title: 'Ya Nabi Salam Alayka', duration: '5:10' },
      { title: 'The Chosen One', duration: '4:45' },
      { title: "Rahmatun Lil'Alameen", duration: '4:20' },
    ],
  },
  {
    name: 'Sami Yusuf',
    nasheeds: [
      { title: 'Hasbi Rabbi', duration: '5:30' },
      { title: 'Al-Mu\'allim', duration: '4:55' },
      { title: 'Supplication', duration: '4:10' },
      { title: 'You Came To Me', duration: '4:40' },
    ],
  },
  {
    name: 'Native Deen',
    nasheeds: [
      { title: 'M-U-S-L-I-M', duration: '3:45' },
      { title: 'Not Afraid to Stand Alone', duration: '4:20' },
      { title: 'Deen Over Dunya', duration: '3:55' },
    ],
  },
];

export type Surah = (typeof SURAHS)[number];
export type PodcastSeries = (typeof PODCAST_SERIES)[number];
export type ProphetStory = (typeof PROPHET_STORIES)[number];
export type NasheedArtist = (typeof NASHEED_ARTISTS)[number];
