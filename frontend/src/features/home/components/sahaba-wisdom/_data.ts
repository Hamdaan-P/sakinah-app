/**
 * Sahaba wisdom data + companion-icon/short-name lookups.
 */

import {
  Heart,
  Scales,
  BookOpen,
  Lightbulb,
  Handshake,
  GraduationCap,
  Flower,
  User,
} from '@phosphor-icons/react';
import type { SahabaWisdomData, CompanionId } from '../../types/home.types';

export const ALL_WISDOM: SahabaWisdomData[] = [
  {
    companionId: 'abuBakr',
    companionName: 'Abu Bakr As-Siddiq',
    companionTitle: 'The Truthful One',
    wisdom: '"If you expect the blessings of God, be kind to His people."',
    topic: 'Kindness',
    gradientColors: ['#2B6F6B', '#1E4D4A'],
    question: 'What did Abu Bakr teach about showing kindness to others?',
  },
  {
    companionId: 'umar',
    companionName: 'Umar Ibn Al-Khattab',
    companionTitle: 'The Just Ruler',
    wisdom: '"The most beloved of deeds to Allah is the most consistent, even if small."',
    topic: 'Consistency',
    gradientColors: ['#2B6F6B', '#1E4D4A'],
    question: 'How did Umar emphasize consistency in worship?',
  },
  {
    companionId: 'uthman',
    companionName: 'Uthman Ibn Affan',
    companionTitle: 'The Generous',
    wisdom: '"The best of people are those who are most beneficial to others."',
    topic: 'Service',
    gradientColors: ['#2B6F6B', '#1E4D4A'],
    question: "What was Uthman's approach to helping the community?",
  },
  {
    companionId: 'ali',
    companionName: 'Ali Ibn Abi Talib',
    companionTitle: 'The Gate of Knowledge',
    wisdom: '"Knowledge is better than wealth; knowledge guards you while you guard wealth."',
    topic: 'Knowledge',
    gradientColors: ['#2B6F6B', '#1E4D4A'],
    question: 'What did Ali teach about the value of knowledge?',
  },
  {
    companionId: 'khadijah',
    companionName: 'Khadijah Bint Khuwaylid',
    companionTitle: 'Mother of the Believers',
    wisdom: '"By Allah, He will never disgrace you. You maintain family ties and help those in need."',
    topic: 'Support',
    gradientColors: ['#2B6F6B', '#1E4D4A'],
    question: 'How did Khadijah support the Prophet during difficult times?',
  },
  {
    companionId: 'aisha',
    companionName: 'Aisha Bint Abu Bakr',
    companionTitle: 'The Scholar',
    wisdom: '"The Prophet never hit anything with his hand except when fighting in the cause of Allah."',
    topic: 'Character',
    gradientColors: ['#2B6F6B', '#1E4D4A'],
    question: "What did Aisha narrate about the Prophet's character?",
  },
  {
    companionId: 'fatimah',
    companionName: 'Fatimah Az-Zahra',
    companionTitle: "The Prophet's Daughter",
    wisdom: '"The contentment of the heart is the greatest wealth."',
    topic: 'Contentment',
    gradientColors: ['#2B6F6B', '#1E4D4A'],
    question: 'How did Fatimah find contentment despite living simply?',
  },
];

export function getCompanionIcon(id: CompanionId) {
  const icons: Record<CompanionId, typeof Heart> = {
    abuBakr: Heart,
    umar: Scales,
    uthman: BookOpen,
    ali: Lightbulb,
    khadijah: Handshake,
    aisha: GraduationCap,
    fatimah: Flower,
  };
  return icons[id] || User;
}

export function getShortName(fullName: string): string {
  if (fullName.includes('Aisha')) return 'Aisha';
  if (fullName.includes('Abu Bakr')) return 'Abu Bakr';
  if (fullName.includes('Umar')) return 'Umar';
  if (fullName.includes('Uthman')) return 'Uthman';
  if (fullName.includes('Ali')) return 'Ali';
  if (fullName.includes('Khadijah')) return 'Khadijah';
  if (fullName.includes('Fatimah')) return 'Fatimah';
  return fullName.split(' ')[0];
}
