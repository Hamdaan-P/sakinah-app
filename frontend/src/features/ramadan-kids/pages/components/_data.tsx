/**
 * Static content (missions, quizzes, decks, games, crafts) for RamadanKidsPage.
 */

import {
  Moon, BookOpen, Heart, Sparkle, GameController, HandHeart, BookmarkSimple, Sun, Lamp,
  Chat, ArrowRight,
} from '@phosphor-icons/react';
import type { DailyMission, RoutineStep, SeerahQuestion, TrueFalseQuestion, QA } from './_types';

export const DAILY_MISSIONS: DailyMission[] = [
  { title: 'Pray Maghrib together', description: 'Join family for one prayer.', points: 3, icon: <Moon size={16} />, color: '#7AD7F0' },
  { title: 'Read 5 ayahs', description: 'Listen and repeat slowly.', points: 2, icon: <BookOpen size={16} />, color: '#A5F0B3' },
  { title: 'Share something at iftar', description: 'Dates, water, or a smile.', points: 3, icon: <HandHeart size={16} />, color: '#FFB3C1' },
  { title: 'Kind words challenge', description: 'Say 3 nice things today.', points: 2, icon: <Sparkle size={16} />, color: '#FFC15E' },
  { title: 'Dua for parents', description: 'Make a short dua.', points: 2, icon: <Heart size={16} />, color: '#B8A1FF' },
];

export const SEERAH_QUIZ: SeerahQuestion[] = [
  { prompt: 'Where was Prophet Muhammad (PBUH) born?', options: ['Medina', 'Mecca', 'Jerusalem', 'Cairo'], correctIndex: 1, explanation: 'The Prophet (PBUH) was born in Mecca.' },
  { prompt: 'How old was he when the first revelation came?', options: ['25', '30', '40', '50'], correctIndex: 2, explanation: 'Revelation began at age 40 in the Cave of Hira.' },
  { prompt: 'Which city did he migrate to during the Hijrah?', options: ['Mecca', 'Jerusalem', 'Medina', 'Taif'], correctIndex: 2, explanation: 'The Hijrah was the migration to Medina.' },
  { prompt: 'Name of the cave of the first revelation?', options: ['Thawr', 'Safa', 'Hira', 'Arafat'], correctIndex: 2, explanation: 'The first revelation came in the Cave of Hira.' },
  { prompt: 'Battle won while outnumbered?', options: ['Uhud', 'Badr', 'Khandaq', 'Hunayn'], correctIndex: 1, explanation: 'Muslims were outnumbered but won at Badr.' },
];

export const TRUE_FALSE_QUIZ: TrueFalseQuestion[] = [
  { statement: "The Qur'an was revealed over 23 years.", answer: true, explanation: 'Revelation came gradually over about 23 years.' },
  { statement: 'Prophet Muhammad (PBUH) was known as Al-Ameen.', answer: true, explanation: 'Al-Ameen means the trustworthy.' },
  { statement: 'The Hijrah marks the start of the Islamic calendar.', answer: true, explanation: 'The Islamic calendar begins from the Hijrah.' },
  { statement: 'The Battle of Badr happened after Uhud.', answer: false, explanation: 'Badr happened before Uhud.' },
  { statement: 'Fasting in Ramadan is optional for adults.', answer: false, explanation: 'Fasting is mandatory for able adults.' },
  { statement: 'Madinah was formerly called Yathrib.', answer: true, explanation: 'Yathrib was the old name of Madinah.' },
];

export const ROUTINE_STEPS: RoutineStep[] = [
  { time: 'Before Fajr', title: 'Suhoor', description: 'Light meal + intention for the fast.', icon: <Sun size={16} />, color: '#7AD7F0' },
  { time: 'After Fajr', title: 'Quiet Quran Time', description: 'Read or listen to 5 ayahs.', icon: <BookOpen size={16} />, color: '#A5F0B3' },
  { time: 'Afternoon', title: 'Kindness Mission', description: 'Help parents or a friend.', icon: <Heart size={16} />, color: '#FFB3C1' },
  { time: 'Before Maghrib', title: 'Dua Time', description: 'Make dua for family and Ummah.', icon: <HandHeart size={16} />, color: '#B8A1FF' },
  { time: 'After Iftar', title: 'Story + Reflection', description: 'Share a Seerah story together.', icon: <Moon size={16} />, color: '#FFC15E' },
];

export const MCQ_DECK: QA[] = [
  { question: 'Where was Prophet Muhammad (PBUH) born?', answer: 'Mecca', type: 'Multiple Choice' },
  { question: 'How old was he when the first revelation came?', answer: '40 years old', type: 'Multiple Choice' },
  { question: 'Which city did he migrate to during Hijrah?', answer: 'Medina', type: 'Multiple Choice' },
  { question: 'Name of the cave of the first revelation?', answer: 'Cave of Hira', type: 'Multiple Choice' },
  { question: 'Who was his first wife?', answer: 'Khadijah (RA)', type: 'Multiple Choice' },
  { question: 'Who protected him in the early days of Islam?', answer: 'Abu Talib', type: 'Multiple Choice' },
  { question: 'How many children did the Prophet (PBUH) have?', answer: '7 children', type: 'Multiple Choice' },
  { question: 'What treaty was signed for peace with Quraysh?', answer: 'Treaty of Hudaybiyyah', type: 'Multiple Choice' },
];

export const TF_DECK: QA[] = [
  { question: "The Qur'an was revealed all at once in one night.", answer: 'False - it was revealed over 23 years.', type: 'True / False' },
  { question: 'Prophet Muhammad (PBUH) was called Al-Ameen (the trustworthy).', answer: 'True.', type: 'True / False' },
  { question: 'The Hijrah marks the start of the Islamic calendar.', answer: 'True.', type: 'True / False' },
  { question: 'The Battle of the Trench is also called the Battle of Khandaq.', answer: 'True.', type: 'True / False' },
  { question: 'The Prophet (PBUH) never taught mercy or forgiveness.', answer: 'False - mercy and forgiveness were central to his teachings.', type: 'True / False' },
  { question: 'Fatimah (RA) married Ali ibn Abi Talib.', answer: 'True.', type: 'True / False' },
  { question: 'Muslims paused Umrah for ten years in the Treaty of Hudaybiyyah.', answer: 'True.', type: 'True / False' },
  { question: 'The first person to accept Islam was Abu Bakr (RA).', answer: 'True.', type: 'True / False' },
];

export const FILL_BLANK_DECK: QA[] = [
  { question: "The Prophet's (PBUH) first wife was ________.", answer: 'Khadijah', type: 'Fill the blank' },
  { question: 'The first revelation came in the Cave of ________.', answer: 'Hira', type: 'Fill the blank' },
  { question: 'The treaty signed for peace is the Treaty of ________.', answer: 'Hudaybiyyah', type: 'Fill the blank' },
  { question: 'He was known as Al-______ (the trustworthy).', answer: 'Ameen', type: 'Fill the blank' },
  { question: 'The migration to Medina is called the ________.', answer: 'Hijrah', type: 'Fill the blank' },
  { question: 'The Islamic calendar begins from the year of the ________.', answer: 'Hijrah', type: 'Fill the blank' },
  { question: 'The Battle of ________ was the first major victory.', answer: 'Badr', type: 'Fill the blank' },
];

export const GAMES = [
  { title: 'Memory Match', description: 'Flip lantern cards to match Arabic words and meanings.', icon: <GameController size={18} />, color: '#7AD7F0' },
  { title: 'Balloon Pop', description: 'Pop balloons with the right answers before time ends.', icon: <Sparkle size={18} />, color: '#FFB3C1' },
  { title: 'Lantern Builder', description: 'Collect stars to build your glowing Ramadan lantern.', icon: <Lamp size={18} />, color: '#FFC15E' },
  { title: 'Word Trail', description: 'Drag letters to spell short duas and kind words.', icon: <Chat size={18} />, color: '#A5F0B3' },
  { title: 'Seerah Sprint', description: 'Choose the kind action and sprint ahead of the camel.', icon: <ArrowRight size={18} />, color: '#B8A1FF' },
  { title: 'Daily Quest', description: 'Tiny tasks: share water, say thank you, help parents.', icon: <Sun size={18} />, color: '#FD9F9F' },
];

export const CRAFTS = [
  { title: 'Lantern Craft', description: 'Fold paper, add stickers, glow at night.', icon: <Lamp size={18} />, color: '#FFC15E' },
  { title: 'Moon Calendar', description: 'Color the moon phases each night.', icon: <Moon size={18} />, color: '#7AD7F0' },
  { title: 'Dua Cards', description: 'Write short duas on colorful cards.', icon: <BookmarkSimple size={18} />, color: '#A5F0B3' },
  { title: 'Eid Gift Box', description: 'Decorate a small box for sharing.', icon: <Sparkle size={18} />, color: '#FFB3C1' },
];

export const STORIES = [
  { title: 'Seerah Stories', icon: <Heart size={18} />, color: '#7AD7F0', points: ['Honesty at the marketplace', 'Helping neighbors in Madinah', 'Patience on long journeys'] },
  { title: 'Moral Stories', icon: <Sparkle size={18} />, color: '#FFB3C1', points: ['Sharing iftar with others', 'Keeping promises with friends', 'Speaking kindly at school'] },
  { title: 'Daily Duas', icon: <HandHeart size={18} />, color: '#A5F0B3', points: ['Dua before eating', 'Dua for parents', 'Dua for gratitude'] },
];

export const BADGES = [
  { name: 'Kindness Hero', icon: <HandHeart size={20} />, color: '#D4A853' },
  { name: "Qur'an Explorer", icon: <BookmarkSimple size={20} />, color: '#4CC9F0' },
  { name: 'Seerah Star', icon: <Sparkle size={20} />, color: '#22C55E' },
];
