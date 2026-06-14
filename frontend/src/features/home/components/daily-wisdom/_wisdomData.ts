import type { DailyWisdomEntry } from '../../types/home.types';

export const WISDOM_ENTRIES: DailyWisdomEntry[] = [
  // ══════════════════════════════════════════
  // RAYA — Original AI character (not hadith)
  // ══════════════════════════════════════════
  { companionId: 'raya', companionName: 'Raya', companionTitle: 'Your Islamic Knowledge Guide', companionIcon: '✨', accentColor: '#4FB892', wisdom: 'The best investment is in your akhirah — but managing your dunya wisely is part of the journey.', source: 'Raya (original)', topic: 'Balance' },
  { companionId: 'raya', companionName: 'Raya', companionTitle: 'Your Islamic Knowledge Guide', companionIcon: '✨', accentColor: '#4FB892', wisdom: 'Every question you ask brings you closer to understanding — never stop being curious about your deen.', source: 'Raya (original)', topic: 'Curiosity' },
  { companionId: 'raya', companionName: 'Raya', companionTitle: 'Your Islamic Knowledge Guide', companionIcon: '✨', accentColor: '#4FB892', wisdom: 'Islam is not just a set of rituals — it is a complete system for living a meaningful life.', source: 'Raya (original)', topic: 'Holistic Faith' },

  // ══════════════════════════════════════════
  // ABU BAKR AS-SIDDIQ (ra)
  // ══════════════════════════════════════════
  { companionId: 'abu_bakr', companionName: 'Abu Bakr As-Siddiq', companionTitle: 'The Truthful One', companionIcon: '🕊️', accentColor: '#D4A853', wisdom: 'Whoever worshipped Muhammad ﷺ, let him know that Muhammad has died. And whoever worshipped Allah, let him know that Allah is alive and shall never die.', source: 'Sahih al-Bukhari 3668', topic: 'Faith' },
  { companionId: 'abu_bakr', companionName: 'Abu Bakr As-Siddiq', companionTitle: 'The Truthful One', companionIcon: '🕊️', accentColor: '#D4A853', wisdom: 'I have been given authority over you, and I am not the best of you. If I do well, help me; and if I do wrong, set me right. Truthfulness is a trust, and lying is treachery.', source: 'Tarikh al-Tabari — Inaugural Sermon', topic: 'Leadership' },
  { companionId: 'abu_bakr', companionName: 'Abu Bakr As-Siddiq', companionTitle: 'The Truthful One', companionIcon: '🕊️', accentColor: '#D4A853', wisdom: 'The Prophet ﷺ said: "When people see wrongdoing and do not change it, Allah will soon punish them all."', source: 'Sunan Abu Dawud 4338 — Narrated by Abu Bakr (ra)', topic: 'Standing Up' },

  // ══════════════════════════════════════════
  // UMAR IBN AL-KHATTAB (ra)
  // ══════════════════════════════════════════
  { companionId: 'umar', companionName: 'Umar ibn Al-Khattab', companionTitle: 'The Distinguisher', companionIcon: '⚔️', accentColor: '#E57373', wisdom: 'Hold yourself accountable before you are held accountable, and weigh your deeds before they are weighed for you.', source: 'Sunan al-Tirmidhi — Athar of Umar (ra)', topic: 'Accountability' },
  { companionId: 'umar', companionName: 'Umar ibn Al-Khattab', companionTitle: 'The Distinguisher', companionIcon: '⚔️', accentColor: '#E57373', wisdom: 'We were a people whom Allah honored through Islam. If we seek honor through anything else, Allah will humiliate us.', source: 'Al-Mustadrak of al-Hakim', topic: 'Honor' },
  { companionId: 'umar', companionName: 'Umar ibn Al-Khattab', companionTitle: 'The Distinguisher', companionIcon: '⚔️', accentColor: '#E57373', wisdom: 'Do not be deceived by one who recites the Quran. His recitation is but speech — look instead to those who act upon it.', source: 'Hilyat al-Awliya — Abu Nu\'aym', topic: 'Action' },

  // ══════════════════════════════════════════
  // UTHMAN IBN AFFAN (ra)
  // ══════════════════════════════════════════
  { companionId: 'uthman', companionName: 'Uthman ibn Affan', companionTitle: 'Possessor of Two Lights', companionIcon: '🌙', accentColor: '#81C784', wisdom: 'If our hearts were truly pure, we would never have our fill of the Word of Allah.', source: 'Al-Bidaya wa\'l-Nihaya — Ibn Kathir', topic: 'Quran' },
  { companionId: 'uthman', companionName: 'Uthman ibn Affan', companionTitle: 'Possessor of Two Lights', companionIcon: '🌙', accentColor: '#81C784', wisdom: 'The Prophet ﷺ said: "The best of you are those who learn the Quran and teach it."', source: 'Sahih al-Bukhari 5027 — Narrated by Uthman (ra)', topic: 'Teaching' },
  { companionId: 'uthman', companionName: 'Uthman ibn Affan', companionTitle: 'Possessor of Two Lights', companionIcon: '🌙', accentColor: '#81C784', wisdom: 'I love that Allah adorns the outward appearance of the one who beautifies his inner self for Allah.', source: 'Hilyat al-Awliya — Abu Nu\'aym', topic: 'Sincerity' },

  // ══════════════════════════════════════════
  // ALI IBN ABI TALIB (ra)
  // ══════════════════════════════════════════
  { companionId: 'ali', companionName: 'Ali ibn Abi Talib', companionTitle: 'The Lion of Allah', companionIcon: '🦁', accentColor: '#9575CD', wisdom: 'People are enemies of what they do not know.', source: 'Nahj al-Balagha — Hikma 172', topic: 'Understanding' },
  { companionId: 'ali', companionName: 'Ali ibn Abi Talib', companionTitle: 'The Lion of Allah', companionIcon: '🦁', accentColor: '#9575CD', wisdom: 'Patience is of two kinds: patience over what pains you, and patience against what you desire.', source: 'Nahj al-Balagha — Hikma 55', topic: 'Patience' },
  { companionId: 'ali', companionName: 'Ali ibn Abi Talib', companionTitle: 'The Lion of Allah', companionIcon: '🦁', accentColor: '#9575CD', wisdom: 'The value of every person is in what he does well.', source: 'Nahj al-Balagha — Hikma 81', topic: 'Self-Worth' },
  { companionId: 'ali', companionName: 'Ali ibn Abi Talib', companionTitle: 'The Lion of Allah', companionIcon: '🦁', accentColor: '#9575CD', wisdom: 'Associate with people in such a manner that if you die, they weep over you, and if you live, they long for your company.', source: 'Nahj al-Balagha — Hikma 10', topic: 'Character' },

  // ══════════════════════════════════════════
  // KHADIJAH BINT KHUWAYLID (ra)
  // ══════════════════════════════════════════
  { companionId: 'khadijah', companionName: 'Khadijah bint Khuwaylid', companionTitle: 'Mother of the Believers', companionIcon: '💎', accentColor: '#F06292', wisdom: 'By Allah, Allah will never disgrace you. You keep good relations with your kith and kin, help the poor and the destitute, serve your guests generously, and assist those afflicted by calamity.', source: 'Sahih al-Bukhari 3 — Hadith of the First Revelation', topic: 'Reassurance' },
  { companionId: 'khadijah', companionName: 'Khadijah bint Khuwaylid', companionTitle: 'Mother of the Believers', companionIcon: '💎', accentColor: '#F06292', wisdom: 'Rejoice, O son of my uncle, and be of good cheer. By Him in Whose Hand is Khadijah\'s soul, I hope that you will be the Prophet of this nation.', source: 'Sirah Ibn Hisham — On the First Revelation', topic: 'Belief' },

  // ══════════════════════════════════════════
  // AISHA BINT ABI BAKR (ra)
  // ══════════════════════════════════════════
  { companionId: 'aisha', companionName: 'Aisha bint Abi Bakr', companionTitle: 'Mother of the Believers', companionIcon: '📚', accentColor: '#4FC3F7', wisdom: 'The character of the Prophet ﷺ was the Quran.', source: 'Sahih Muslim 746 — Narrated by Aisha (ra)', topic: 'Prophetic Character' },
  { companionId: 'aisha', companionName: 'Aisha bint Abi Bakr', companionTitle: 'Mother of the Believers', companionIcon: '📚', accentColor: '#4FC3F7', wisdom: 'The Prophet ﷺ used to be at the service of his family at home, and when the time for prayer came, he would go out to pray.', source: 'Sahih al-Bukhari 676 — Narrated by Aisha (ra)', topic: 'Humility' },
  { companionId: 'aisha', companionName: 'Aisha bint Abi Bakr', companionTitle: 'Mother of the Believers', companionIcon: '📚', accentColor: '#4FC3F7', wisdom: 'The Prophet ﷺ said: "The most beloved deed to Allah is the most regular and constant even if it were little."', source: 'Sahih al-Bukhari 6464 — Narrated by Aisha (ra)', topic: 'Consistency' },

  // ══════════════════════════════════════════
  // FATIMAH AZ-ZAHRA (ra)
  // ══════════════════════════════════════════
  { companionId: 'fatimah', companionName: 'Fatimah Az-Zahra', companionTitle: 'Leader of the Women of Paradise', companionIcon: '🌹', accentColor: '#FFB74D', wisdom: 'The Prophet ﷺ said: "Fatimah is a part of me. Whoever angers her has angered me."', source: 'Sahih al-Bukhari 3714', topic: 'Love' },
  { companionId: 'fatimah', companionName: 'Fatimah Az-Zahra', companionTitle: 'Leader of the Women of Paradise', companionIcon: '🌹', accentColor: '#FFB74D', wisdom: 'The Prophet ﷺ taught Fatimah: Say SubhanAllah 33 times, Alhamdulillah 33 times, and Allahu Akbar 34 times before sleep — that is better for you than a servant.', source: 'Sahih al-Bukhari 3705', topic: 'Dhikr' },

  // ══════════════════════════════════════════
  // IMAM ABU HANIFA (rh)
  // ══════════════════════════════════════════
  { companionId: 'imam_abu_hanifa', companionName: 'Imam Abu Hanifa', companionTitle: 'The Greatest Imam', companionIcon: '📖', accentColor: '#A5D6A7', wisdom: 'If something from my opinion contradicts the Book of Allah or the hadith of the Messenger ﷺ, then abandon my opinion.', source: 'Al-Fulani, Iqaz al-Himam', topic: 'Humility' },
  { companionId: 'imam_abu_hanifa', companionName: 'Imam Abu Hanifa', companionTitle: 'The Greatest Imam', companionIcon: '📖', accentColor: '#A5D6A7', wisdom: 'It is not permissible for anyone to accept our opinion if they do not know from where we derived it.', source: 'Hashiyat Ibn Abidin 1/63', topic: 'Scholarship' },
  { companionId: 'imam_abu_hanifa', companionName: 'Imam Abu Hanifa', companionTitle: 'The Greatest Imam', companionIcon: '📖', accentColor: '#A5D6A7', wisdom: 'This knowledge of ours is an opinion. It is the best we have been able to find. Whoever can bring something better, we accept it.', source: 'Jami\' al-Masanid — Abu Hanifa', topic: 'Open-mindedness' },

  // ══════════════════════════════════════════
  // IMAM MALIK IBN ANAS (rh)
  // ══════════════════════════════════════════
  { companionId: 'imam_malik', companionName: 'Imam Malik ibn Anas', companionTitle: 'Imam of Madinah', companionIcon: '🕌', accentColor: '#BCAAA4', wisdom: 'Everyone\'s opinion may be taken or rejected, except the occupant of this grave — meaning the Prophet ﷺ.', source: 'Jami\' Bayan al-\'Ilm — Ibn Abd al-Barr', topic: 'Following Evidence' },
  { companionId: 'imam_malik', companionName: 'Imam Malik ibn Anas', companionTitle: 'Imam of Madinah', companionIcon: '🕌', accentColor: '#BCAAA4', wisdom: 'It is a sign of a scholar\'s depth of knowledge that he says "I don\'t know" when asked about what he does not know.', source: 'Al-Intiqaa — Ibn Abd al-Barr', topic: 'Scholarly Honesty' },
  { companionId: 'imam_malik', companionName: 'Imam Malik ibn Anas', companionTitle: 'Imam of Madinah', companionIcon: '🕌', accentColor: '#BCAAA4', wisdom: 'The later generations of this ummah will not be rectified except by that which rectified its earlier generations.', source: 'Al-Shifa — Qadi Iyad', topic: 'Tradition' },

  // ══════════════════════════════════════════
  // IMAM ASH-SHAFI'I (rh)
  // ══════════════════════════════════════════
  { companionId: 'imam_shafii', companionName: "Imam Ash-Shafi'i", companionTitle: 'Reviver of the Sunnah', companionIcon: '⚖️', accentColor: '#80DEEA', wisdom: 'My opinion is correct with the possibility of being wrong, and another\'s opinion is wrong with the possibility of being correct.', source: 'Adab al-Ikhtilaf — al-Qaradawi', topic: 'Open-mindedness' },
  { companionId: 'imam_shafii', companionName: "Imam Ash-Shafi'i", companionTitle: 'Reviver of the Sunnah', companionIcon: '⚖️', accentColor: '#80DEEA', wisdom: 'If you cannot bear the fatigue of learning, you must bear the pain of ignorance.', source: 'Diwan al-Shafi\'i', topic: 'Perseverance' },
  { companionId: 'imam_shafii', companionName: "Imam Ash-Shafi'i", companionTitle: 'Reviver of the Sunnah', companionIcon: '⚖️', accentColor: '#80DEEA', wisdom: 'I never once debated anyone hoping to win the debate. I always hoped that the truth would come from his side.', source: 'Hilyat al-Awliya — Abu Nu\'aym', topic: 'Sincerity' },

  // ══════════════════════════════════════════
  // IMAM AHMAD IBN HANBAL (rh)
  // ══════════════════════════════════════════
  { companionId: 'imam_ahmad', companionName: 'Imam Ahmad ibn Hanbal', companionTitle: 'Imam of Ahl al-Sunnah', companionIcon: '📜', accentColor: '#CE93D8', wisdom: 'The people are in greater need of knowledge than they are of food and drink, because food is needed once or twice a day, but knowledge is needed at all times.', source: 'Masa\'il al-Imam Ahmad — narrated by his son Abdullah', topic: 'Knowledge' },
  { companionId: 'imam_ahmad', companionName: 'Imam Ahmad ibn Hanbal', companionTitle: 'Imam of Ahl al-Sunnah', companionIcon: '📜', accentColor: '#CE93D8', wisdom: 'Whoever claims there is consensus (ijma\') has lied. Perhaps the people differed and he simply did not know.', source: 'Masa\'il al-Imam Ahmad — narrated by his son Abdullah', topic: 'Intellectual Rigor' },
  { companionId: 'imam_ahmad', companionName: 'Imam Ahmad ibn Hanbal', companionTitle: 'Imam of Ahl al-Sunnah', companionIcon: '📜', accentColor: '#CE93D8', wisdom: 'When I am tried, I remember three things: I am spared from trial in my religion, it could have been worse, and this world is not the final abode.', source: 'Manaqib al-Imam Ahmad — Ibn al-Jawzi', topic: 'Steadfastness' },

  // ══════════════════════════════════════════════════════════════
  //  STORY-BASED INCIDENTS — real moments from their lives
  //  Format: what happened → how they handled it → your takeaway
  // ══════════════════════════════════════════════════════════════

  // ── UTHMAN IBN AFFAN — Business & Finance Focus ──

  { companionId: 'uthman', companionName: 'Uthman ibn Affan', companionTitle: 'Possessor of Two Lights', companionIcon: '🌙', accentColor: '#81C784',
    wisdom: 'When Muslims in Madinah had no clean water, a Jewish man owned the only well (Bi\'r Rumah) and charged high prices. Uthman bought the well for 20,000 dirhams and declared it free for everyone — forever. That well still exists today as a waqf. When you have the means, use them to solve a problem others can\'t.',
    source: 'Sunan al-Tirmidhi 3703 · Sahih al-Bukhari 2778', topic: 'Generous Investment' },

  { companionId: 'uthman', companionName: 'Uthman ibn Affan', companionTitle: 'Possessor of Two Lights', companionIcon: '🌙', accentColor: '#81C784',
    wisdom: 'During a severe famine in Madinah, Uthman\'s trade caravan arrived from Syria — 1,000 camels loaded with food. Merchants rushed to him offering 200%, 500%, even 700% profit. He turned them all down and said: "Someone has offered me more." He donated every grain to the poor. The "someone" was Allah. When profit and people\'s need collide, choose the return that never depreciates.',
    source: 'Tarikh Dimashq — Ibn Asakir', topic: 'Profit vs. Purpose' },

  { companionId: 'uthman', companionName: 'Uthman ibn Affan', companionTitle: 'Possessor of Two Lights', companionIcon: '🌙', accentColor: '#81C784',
    wisdom: 'When the Prophet ﷺ called for funds for the Tabuk expedition, Uthman walked in with 1,000 gold dinars and poured them into his lap, then equipped 300 camels and 70 horses. The Prophet ﷺ said: "Nothing Uthman does after today will harm him." When a cause bigger than you asks for help, don\'t calculate — commit.',
    source: 'Musnad Ahmad 20130 · Sunan al-Tirmidhi 3663', topic: 'All-In Commitment' },

  { companionId: 'uthman', companionName: 'Uthman ibn Affan', companionTitle: 'Possessor of Two Lights', companionIcon: '🌙', accentColor: '#81C784',
    wisdom: 'Even before Islam, Uthman was known in Makkah as an honest trader — no usury, no gambling, no cheating on weights. When his peers cut corners, he built his reputation on trust. That reputation later made him one of the wealthiest men in Arabia. Integrity is not a cost — it\'s your most compounding asset.',
    source: 'Al-Bidaya wa\'l-Nihaya — Ibn Kathir', topic: 'Business Ethics' },

  { companionId: 'uthman', companionName: 'Uthman ibn Affan', companionTitle: 'Possessor of Two Lights', companionIcon: '🌙', accentColor: '#81C784',
    wisdom: 'Every Friday, Uthman would free a slave from his own wealth — not as a penalty or obligation, but as a weekly habit of generosity. He said he did it seeking the Face of Allah. Charity isn\'t just crisis giving — make it a rhythm in your life, no matter how small.',
    source: 'Hilyat al-Awliya — Abu Nu\'aym', topic: 'Consistent Giving' },

  // ── ABU BAKR AS-SIDDIQ — Courage & Sacrifice ──

  { companionId: 'abu_bakr', companionName: 'Abu Bakr As-Siddiq', companionTitle: 'The Truthful One', companionIcon: '🕊️', accentColor: '#D4A853',
    wisdom: 'When Bilal (ra) was being tortured under a boulder in the Makkan sun for saying "Ahad, Ahad" (One God, One God), Abu Bakr walked up to his master Umayyah, paid the price, and set him free. He didn\'t start a campaign or give a speech — he just solved it. When you see injustice within your reach, don\'t wait for someone else.',
    source: 'Sahih al-Bukhari 3544 · Sirah Ibn Hisham', topic: 'Acting on Injustice' },

  { companionId: 'abu_bakr', companionName: 'Abu Bakr As-Siddiq', companionTitle: 'The Truthful One', companionIcon: '🕊️', accentColor: '#D4A853',
    wisdom: 'When the Prophet ﷺ asked for donations for Tabuk, Umar brought half his wealth thinking he\'d finally outdo Abu Bakr. The Prophet asked Abu Bakr: "What did you leave for your family?" He replied: "Allah and His Messenger." He had brought everything he owned. Sometimes belief isn\'t measured in percentages.',
    source: 'Sunan Abu Dawud 1678 · Sunan al-Tirmidhi 3675', topic: 'Total Trust' },

  { companionId: 'abu_bakr', companionName: 'Abu Bakr As-Siddiq', companionTitle: 'The Truthful One', companionIcon: '🕊️', accentColor: '#D4A853',
    wisdom: 'In the Cave of Thawr, with Quraysh\'s trackers right outside, Abu Bakr whispered: "If they look down, they will see us." The Prophet ﷺ replied: "What do you think of two when Allah is the third?" Fear is natural. Courage isn\'t the absence of it — it\'s choosing to stay beside the right people through it.',
    source: 'Sahih al-Bukhari 3653 · Quran 9:40', topic: 'When Fear Overwhelms' },

  { companionId: 'abu_bakr', companionName: 'Abu Bakr As-Siddiq', companionTitle: 'The Truthful One', companionIcon: '🕊️', accentColor: '#D4A853',
    wisdom: 'When the Prophet ﷺ passed away, the companions were in shock. Umar stood with his sword saying the Prophet hadn\'t died. Abu Bakr entered, kissed the Prophet\'s forehead, then stood and said: "Whoever worshipped Muhammad — Muhammad has died. Whoever worships Allah — Allah is alive and shall never die." In your worst moment, be the one who steadies the room.',
    source: 'Sahih al-Bukhari 3668', topic: 'Leading Through Loss' },

  // ── UMAR IBN AL-KHATTAB — Justice & Responsibility ──

  { companionId: 'umar', companionName: 'Umar ibn Al-Khattab', companionTitle: 'The Distinguisher', companionIcon: '⚔️', accentColor: '#E57373',
    wisdom: 'One night Umar was patrolling Madinah and heard a child crying. He found a woman boiling stones in a pot to make her hungry children think food was coming so they\'d fall asleep. He ran back to the storehouse, loaded a sack of flour on his own back, and his servant offered to carry it. Umar said: "Will you carry my burden on the Day of Judgment too?" He cooked for the family himself. Leadership means the weight is yours.',
    source: 'Tabaqat Ibn Sa\'d · Tarikh al-Khulafa — al-Suyuti', topic: 'Carrying the Weight' },

  { companionId: 'umar', companionName: 'Umar ibn Al-Khattab', companionTitle: 'The Distinguisher', companionIcon: '⚔️', accentColor: '#E57373',
    wisdom: 'An Egyptian came to Umar and said: "The governor\'s son whipped me and said \'I am the son of nobles!\'" Umar summoned the governor Amr ibn al-As and his son, handed the Egyptian a whip, and said: "Strike the son of nobles." Then he turned to Amr and said: "Since when have you enslaved people who were born free?" No one is above accountability — not even the children of your allies.',
    source: 'Kanz al-Ummal · Tarikh al-Tabari', topic: 'Nobody Is Above Justice' },

  { companionId: 'umar', companionName: 'Umar ibn Al-Khattab', companionTitle: 'The Distinguisher', companionIcon: '⚔️', accentColor: '#E57373',
    wisdom: 'As Caliph, Umar would walk the streets of Madinah at night, checking on people himself. He once said: "If a mule stumbles in Iraq, I fear Allah will ask me why I did not pave the road for it." Responsibility isn\'t a title — it\'s a weight you feel even when no one is watching.',
    source: 'Al-Farooq — Shibli Nomani · Tarikh al-Khulafa', topic: 'Invisible Responsibility' },

  // ── ALI IBN ABI TALIB — Courage & Principle ──

  { companionId: 'ali', companionName: 'Ali ibn Abi Talib', companionTitle: 'The Lion of Allah', companionIcon: '🦁', accentColor: '#9575CD',
    wisdom: 'On the night of Hijrah, assassins surrounded the Prophet\'s house to kill him. Ali — barely a teenager — volunteered to sleep in the Prophet\'s bed as a decoy, wearing his green cloak. He knew they might kill him at dawn. He lay down anyway. When doing the right thing could cost you everything, that\'s exactly when it matters most.',
    source: 'Sirah Ibn Hisham · Tafsir al-Tabari (Quran 2:207)', topic: 'Risking Everything' },

  { companionId: 'ali', companionName: 'Ali ibn Abi Talib', companionTitle: 'The Lion of Allah', companionIcon: '🦁', accentColor: '#9575CD',
    wisdom: 'At Khaybar, the Muslim army had failed to breach the fortress for days. The Prophet ﷺ said: "Tomorrow I will give the banner to a man who loves Allah and His Messenger, and whom Allah and His Messenger love. Allah will grant victory through him." He gave it to Ali. Ali lifted the fortress gate off its hinges as a shield. When your moment comes, don\'t shrink — rise to it.',
    source: 'Sahih al-Bukhari 4210 · Sahih Muslim 2405', topic: 'Rising to the Moment' },

  { companionId: 'ali', companionName: 'Ali ibn Abi Talib', companionTitle: 'The Lion of Allah', companionIcon: '🦁', accentColor: '#9575CD',
    wisdom: 'As Caliph, Ali\'s armor was stolen. He found it being sold in the marketplace by a non-Muslim. He took the case to a judge — and the judge ruled against Ali because he couldn\'t produce a witness (his son\'s testimony was not accepted). Ali accepted the verdict and walked away without the armor. The man, stunned by such justice, embraced Islam. Principle over power — always.',
    source: 'Manaqib — Ibn al-Jawzi · Tarikh al-Khulafa', topic: 'Principle Over Power' },

  { companionId: 'ali', companionName: 'Ali ibn Abi Talib', companionTitle: 'The Lion of Allah', companionIcon: '🦁', accentColor: '#9575CD',
    wisdom: 'As the fourth Caliph ruling a vast empire, Ali owned one garment and patched it himself. When people asked why, he said his heart would only be soft if his body lived simply. He refused any luxury from the treasury. Wealth is a test — and the test is whether it changes who you are.',
    source: 'Nahj al-Balagha · Tabaqat Ibn Sa\'d', topic: 'Simplicity in Power' },

  // ── KHADIJAH BINT KHUWAYLID — Strength & Support ──

  { companionId: 'khadijah', companionName: 'Khadijah bint Khuwaylid', companionTitle: 'Mother of the Believers', companionIcon: '💎', accentColor: '#F06292',
    wisdom: 'When the Prophet ﷺ came down from the cave of Hira trembling, terrified by the first revelation, he ran to Khadijah saying "Cover me! Cover me!" She held him, covered him with a blanket, and said: "By Allah, Allah will never disgrace you. You keep good ties with your family, you bear the burden of the weak, you earn for the poor, and you help those in distress." In someone\'s worst moment, your belief in them can be the thing that holds them together.',
    source: 'Sahih al-Bukhari 3 · Sahih Muslim 160', topic: 'Being Someone\'s Rock' },

  { companionId: 'khadijah', companionName: 'Khadijah bint Khuwaylid', companionTitle: 'Mother of the Believers', companionIcon: '💎', accentColor: '#F06292',
    wisdom: 'Khadijah was the most successful merchant in Makkah — running caravans to Syria and Yemen in a society that didn\'t expect it from a woman. She hired Muhammad ﷺ based on his reputation for honesty, then proposed marriage to him herself. She knew what she wanted and she moved on it. Don\'t wait for the world to make space for you — make your own.',
    source: 'Sirah Ibn Hisham · Tabaqat Ibn Sa\'d', topic: 'Making Your Own Path' },

  { companionId: 'khadijah', companionName: 'Khadijah bint Khuwaylid', companionTitle: 'Mother of the Believers', companionIcon: '💎', accentColor: '#F06292',
    wisdom: 'During the three-year boycott of Banu Hashim, when Muslims were starving in a valley outside Makkah, Khadijah — once the wealthiest woman in the city — spent her entire fortune smuggling food to the believers. She entered the boycott wealthy and emerged with nothing. She never complained once. When your family needs you, give without counting.',
    source: 'Sirah Ibn Hisham · Al-Bidaya wa\'l-Nihaya', topic: 'Sacrifice for Family' },

  // ── AISHA BINT ABI BAKR — Knowledge & Courage ──

  { companionId: 'aisha', companionName: 'Aisha bint Abi Bakr', companionTitle: 'Mother of the Believers', companionIcon: '📚', accentColor: '#4FC3F7',
    wisdom: 'Aisha corrected senior companions on at least 61 documented occasions when they narrated hadith incorrectly — including Abu Hurayrah and Ibn Umar. She didn\'t stay quiet out of politeness or seniority. She had the knowledge and she spoke up. When you know something is wrong, respectful correction is not arrogance — it\'s responsibility.',
    source: 'Al-Ijaba — al-Zarkashi (61 corrections documented)', topic: 'Speaking Up' },

  { companionId: 'aisha', companionName: 'Aisha bint Abi Bakr', companionTitle: 'Mother of the Believers', companionIcon: '📚', accentColor: '#4FC3F7',
    wisdom: 'Aisha narrated 2,210 hadith — more than almost any other companion. Scholars would travel from across the Muslim world to learn from her, sitting behind a curtain, writing down everything. Urwa ibn al-Zubayr said: "I never saw anyone more knowledgeable in fiqh, medicine, or poetry than Aisha." Your depth of knowledge is your legacy — invest in it.',
    source: 'Siyar A\'lam al-Nubala — al-Dhahabi', topic: 'Building Expertise' },

  // ── FATIMAH AZ-ZAHRA — Patience & Devotion ──

  { companionId: 'fatimah', companionName: 'Fatimah Az-Zahra', companionTitle: 'Leader of the Women of Paradise', companionIcon: '🌹', accentColor: '#FFB74D',
    wisdom: 'Fatimah\'s hands were calloused from grinding grain and carrying water. She asked the Prophet ﷺ for a servant to help. Instead, he taught her: "Say SubhanAllah 33 times, Alhamdulillah 33 times, and Allahu Akbar 34 times before you sleep — that is better for you than a servant." She never asked again. When life is physically exhausting, the strength you need might not be another pair of hands — it might be a shift in your heart.',
    source: 'Sahih al-Bukhari 3705 · Sahih Muslim 2727', topic: 'Strength Beyond the Physical' },

  { companionId: 'fatimah', companionName: 'Fatimah Az-Zahra', companionTitle: 'Leader of the Women of Paradise', companionIcon: '🌹', accentColor: '#FFB74D',
    wisdom: 'Those who knew Fatimah said her walk, her manners, and her way of speaking were exactly like the Prophet ﷺ. Aisha said: "I never saw anyone more resembling the Messenger of Allah in speech and manner than Fatimah." She didn\'t imitate him consciously — she absorbed him through love. The people you deeply love shape who you become.',
    source: 'Sunan Abu Dawud 5217 · Sahih al-Bukhari 3623', topic: 'Becoming Who You Love' },

  // ── IMAM ABU HANIFA — Integrity Under Pressure ──

  { companionId: 'imam_abu_hanifa', companionName: 'Imam Abu Hanifa', companionTitle: 'The Greatest Imam', companionIcon: '📖', accentColor: '#A5D6A7',
    wisdom: 'The Abbasid Caliph al-Mansur offered Abu Hanifa the position of Chief Judge — the most powerful legal position in the empire. Abu Hanifa refused. The Caliph had him imprisoned and flogged. Abu Hanifa still refused. He said he wasn\'t fit for it — but the truth was he wouldn\'t let political power corrupt his scholarship. Some promotions cost more than they pay.',
    source: 'Tarikh Baghdad — al-Khatib · Manaqib Abu Hanifa — al-Muwaffaq', topic: 'Refusing to Compromise' },

  { companionId: 'imam_abu_hanifa', companionName: 'Imam Abu Hanifa', companionTitle: 'The Greatest Imam', companionIcon: '📖', accentColor: '#A5D6A7',
    wisdom: 'Abu Hanifa ran a successful textile business alongside his scholarship. He used the profits to fund his students\' living expenses so they could study full-time without financial stress. He never took a salary for teaching. He combined worldly success with knowledge — and used one to fuel the other. You don\'t have to choose between earning and learning.',
    source: 'Manaqib Abu Hanifa — al-Muwaffaq · Tarikh Baghdad', topic: 'Earning & Learning' },

  // ── IMAM MALIK IBN ANAS — Standing Firm ──

  { companionId: 'imam_malik', companionName: 'Imam Malik ibn Anas', companionTitle: 'Imam of Madinah', companionIcon: '🕌', accentColor: '#BCAAA4',
    wisdom: 'The governor of Madinah ordered Imam Malik to stop teaching a certain hadith about oaths made under coercion being invalid — because it threatened the Caliph\'s forced allegiance. Malik refused. He was publicly flogged so severely his arm was dislocated. He kept teaching the same hadith afterward. Truth doesn\'t bend because it hurts.',
    source: 'Tartib al-Madarik — Qadi Iyad', topic: 'Truth Has a Cost' },

  { companionId: 'imam_malik', companionName: 'Imam Malik ibn Anas', companionTitle: 'Imam of Madinah', companionIcon: '🕌', accentColor: '#BCAAA4',
    wisdom: 'A man traveled from a distant land to ask Imam Malik 40 questions. Malik answered some and for the rest said: "I don\'t know." The man was stunned — "You\'re the Imam of Madinah!" Malik said: "Go and tell the people that Malik does not know." Saying "I don\'t know" when you don\'t is not weakness — it\'s the highest form of honesty.',
    source: 'Al-Intiqaa — Ibn Abd al-Barr', topic: 'Honest Humility' },

  // ── IMAM ASH-SHAFI'I — Wisdom in Disagreement ──

  { companionId: 'imam_shafii', companionName: "Imam Ash-Shafi'i", companionTitle: 'Reviver of the Sunnah', companionIcon: '⚖️', accentColor: '#80DEEA',
    wisdom: 'Imam al-Shafi\'i and Imam Ahmad would often debate fiercely on fiqh rulings. After one intense session, they were seen walking to prayer together. Shafi\'i said: "Can we not disagree and still be brothers?" He separated the idea from the person. When an argument heats up, attack the argument — never the human making it.',
    source: 'Siyar A\'lam al-Nubala — al-Dhahabi', topic: 'Disagreeing with Dignity' },

  { companionId: 'imam_shafii', companionName: "Imam Ash-Shafi'i", companionTitle: 'Reviver of the Sunnah', companionIcon: '⚖️', accentColor: '#80DEEA',
    wisdom: 'Shafi\'i moved from Iraq to Egypt and changed nearly half his legal opinions based on the new evidence and customs he encountered there. His students called it "the new madhab." Most scholars would have defended their old positions to save face. Shafi\'i saw growth as more important than consistency. Changing your mind when you learn more is not weakness — it\'s evolution.',
    source: 'Al-Umm — al-Shafi\'i · Manaqib al-Shafi\'i — al-Bayhaqi', topic: 'Evolving Your Views' },

  // ── IMAM AHMAD IBN HANBAL — Endurance ──

  { companionId: 'imam_ahmad', companionName: 'Imam Ahmad ibn Hanbal', companionTitle: 'Imam of Ahl al-Sunnah', companionIcon: '📜', accentColor: '#CE93D8',
    wisdom: 'During the Mihna (Inquisition), the Caliph demanded scholars publicly declare the Quran was "created" — a political doctrine. Scholars capitulated one by one. Ahmad refused. He was imprisoned for 28 months and flogged until he lost consciousness, repeatedly. He never recanted. He said: "If the scholar stays silent when truth is needed, when will he speak?" When everyone folds, someone has to hold the line.',
    source: 'Manaqib al-Imam Ahmad — Ibn al-Jawzi · Tarikh Baghdad', topic: 'Holding the Line' },

  { companionId: 'imam_ahmad', companionName: 'Imam Ahmad ibn Hanbal', companionTitle: 'Imam of Ahl al-Sunnah', companionIcon: '📜', accentColor: '#CE93D8',
    wisdom: 'After the Mihna ended and Ahmad was vindicated, he was offered wealth and honors by the new Caliph. He refused everything and returned to his simple life of teaching hadith in his mosque. People asked him how he endured it all. He said he just thought of three things: "My religion was spared, it could have been worse, and this dunya is temporary." Endurance doesn\'t require a dramatic speech — just a clear perspective.',
    source: 'Manaqib al-Imam Ahmad — Ibn al-Jawzi', topic: 'Quiet Endurance' },

  // ── RAYA — Relatable Motivation ──

  { companionId: 'raya', companionName: 'Raya', companionTitle: 'Your Islamic Knowledge Guide', companionIcon: '✨', accentColor: '#4FB892',
    wisdom: 'You don\'t need to have it all figured out today. The Sahaba built the greatest civilization in history one decision at a time — sometimes unsure, sometimes afraid, always moving forward. Start where you are.',
    source: 'Raya (original)', topic: 'Starting Where You Are' },

  { companionId: 'raya', companionName: 'Raya', companionTitle: 'Your Islamic Knowledge Guide', companionIcon: '✨', accentColor: '#4FB892',
    wisdom: 'The companions disagreed with each other, made mistakes, and learned from them — that\'s not a flaw in their story, it\'s the point. Growth is messy. Give yourself the same grace you\'d give them.',
    source: 'Raya (original)', topic: 'Grace for Yourself' },
];

/** Deterministic: same companion + wisdom for the entire day */
export function getDailyWisdom(): DailyWisdomEntry {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  return WISDOM_ENTRIES[dayOfYear % WISDOM_ENTRIES.length];
}
