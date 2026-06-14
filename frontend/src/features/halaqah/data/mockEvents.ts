/**
 * Public-event preview dataset. Used by HalaqahPublicEventPage.
 *
 * This is a slim subset of fields needed for the deep-link landing page.
 * When the host backend ships, replace consumers with a real
 * Firestore fetch (collection: halaqah_events).
 */

export interface PublicEventData {
  id: string;
  name: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  venueAddress: string;
  capacity: number;
  attendeeCount: number;
  description: string;
  hostName: string;
  hostRating: number;
  hostVerified: boolean;
}

export const MOCK_EVENTS: PublicEventData[] = [
  {
    id: '1',
    name: 'Weekly Quran Study Circle',
    category: 'quran',
    date: '2026-05-02',
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    venue: 'Masjid Al-Noor',
    venueAddress: '123 Main Street, Downtown',
    capacity: 30,
    attendeeCount: 22,
    description: 'In-depth study of Surah Al-Kahf with Tafsir insights and reflection on its timeless wisdom.',
    hostName: 'Ustadh Ahmad',
    hostRating: 4.9,
    hostVerified: true,
  },
  {
    id: '2',
    name: 'Family Iftar Gathering',
    category: 'family',
    date: '2026-05-04',
    startTime: '6:30 PM',
    endTime: '9:00 PM',
    venue: 'Community Hall',
    venueAddress: '88 Park Avenue',
    capacity: 60,
    attendeeCount: 41,
    description: 'A beautiful evening for families to connect, share meals, and strengthen community bonds.',
    hostName: 'Sister Aisha',
    hostRating: 4.8,
    hostVerified: true,
  },
  {
    id: '3',
    name: 'Dawah Skills Workshop',
    category: 'dawah',
    date: '2026-05-09',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    venue: 'Islamic Centre',
    venueAddress: '45 Crescent Lane',
    capacity: 25,
    attendeeCount: 12,
    description: 'Learn effective dawah strategies, communication techniques, and how to share Islam with wisdom.',
    hostName: 'Br. Yusuf',
    hostRating: 4.7,
    hostVerified: false,
  },
  {
    id: '4',
    name: 'Hadith Reflections Series',
    category: 'hadith',
    date: '2026-05-12',
    startTime: '7:30 PM',
    endTime: '9:00 PM',
    venue: 'Masjid Al-Rahma',
    venueAddress: '212 Hilltop Road',
    capacity: 40,
    attendeeCount: 18,
    description: 'Weekly reflection on Riyad as-Saliheen — practical applications of the Sunnah for modern life.',
    hostName: 'Ustadh Hassan',
    hostRating: 4.9,
    hostVerified: true,
  },
];
