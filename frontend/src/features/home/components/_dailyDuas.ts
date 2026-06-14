/**
 * Curated daily du'ā list. Rotates deterministically by calendar day so every
 * device shows the same du'ā on the same date. Each entry has Arabic +
 * transliteration + translation + short source label.
 *
 * Mostly short, well-known supplications from Quran and authentic hadith.
 */

export interface DailyDua {
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
}

export const DAILY_DUAS: DailyDua[] = [
  {
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā ʿadhāban-nār',
    translation: 'Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    source: 'Qur\'ān 2:201',
  },
  {
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    transliteration: 'Ḥasbun-Allāhu wa niʿmal-wakīl',
    translation: 'Allah is sufficient for us, and He is the best Disposer of affairs.',
    source: 'Qur\'ān 3:173',
  },
  {
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي',
    transliteration: 'Rabbish-raḥ lī ṣadrī wa yassir lī amrī waḥlul ʿuqdatan min lisānī yafqahū qawlī',
    translation: 'My Lord, expand for me my breast, ease for me my task, and untie the knot from my tongue that they may understand my speech.',
    source: 'Qur\'ān 20:25-28',
  },
  {
    arabic: 'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: 'Lā ilāha illā anta subḥānaka innī kuntu minaẓ-ẓālimīn',
    translation: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
    source: 'Qur\'ān 21:87 — du\'ā of Yūnus (AS)',
  },
  {
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: 'Rabbi zidnī ʿilmā',
    translation: 'My Lord, increase me in knowledge.',
    source: 'Qur\'ān 20:114',
  },
  {
    arabic: 'رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا',
    transliteration: 'Rabbanā lā tu\'ākhidhnā in nasīnā aw akhṭa\'nā',
    translation: 'Our Lord, do not take us to account if we forget or make a mistake.',
    source: 'Qur\'ān 2:286',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ',
    transliteration: 'Allāhumma innī aʿūdhu bika minal-hammi wal-ḥazan, wa aʿūdhu bika minal-ʿajzi wal-kasal',
    translation: 'O Allah, I seek refuge in You from anxiety and sorrow, and from weakness and laziness.',
    source: 'Bukhārī',
  },
  {
    arabic: 'اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي',
    transliteration: 'Allāhummah-dinī wa saddidnī',
    translation: 'O Allah, guide me and make me steadfast.',
    source: 'Muslim',
  },
  {
    arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ',
    transliteration: 'Rabbanā taqabbal minnā innaka antas-samīʿul-ʿalīm',
    translation: 'Our Lord, accept this from us. Indeed, You are the Hearing, the Knowing.',
    source: 'Qur\'ān 2:127',
  },
  {
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    transliteration: 'Allāhumma aʿinnī ʿalā dhikrika wa shukrika wa ḥusni ʿibādatik',
    translation: 'O Allah, help me to remember You, to be grateful to You, and to worship You in the best manner.',
    source: 'Abū Dāwūd',
  },
  {
    arabic: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
    transliteration: 'Rabbanā ẓalamnā anfusanā wa in lam taghfir lanā wa tarḥamnā lanakūnanna minal-khāsirīn',
    translation: 'Our Lord, we have wronged ourselves; if You do not forgive us and have mercy on us, we will surely be among the losers.',
    source: 'Qur\'ān 7:23 — du\'ā of Ādam (AS)',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
    transliteration: 'Allāhumma innī as\'alukal-ʿafwa wal-ʿāfiyata fid-dunyā wal-ākhirah',
    translation: 'O Allah, I ask You for pardon and well-being in this world and the Hereafter.',
    source: 'Ibn Mājah',
  },
  {
    arabic: 'رَبِّ هَبْ لِي مِنْ لَدُنْكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ',
    transliteration: 'Rabbi hab lī min ladunka dhurriyyatan ṭayyibah innaka samīʿud-duʿā\'',
    translation: 'My Lord, grant me from Yourself good offspring. Indeed, You are the Hearer of supplication.',
    source: 'Qur\'ān 3:38',
  },
  {
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    transliteration: 'Rabbanā hab lanā min azwājinā wa dhurriyyātinā qurrata aʿyunin waj-ʿalnā lil-muttaqīna imāmā',
    translation: 'Our Lord, grant us comfort in our spouses and offspring, and make us a model for the righteous.',
    source: 'Qur\'ān 25:74',
  },
  {
    arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Allāhumma bārik lanā fīmā razaqtanā wa qinā ʿadhāban-nār',
    translation: 'O Allah, bless what You have provided us and protect us from the punishment of the Fire.',
    source: 'Ibn al-Sunnī',
  },
  {
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    transliteration: 'Allāhumma innaka ʿafuwwun karīmun tuḥibbul-ʿafwa faʿfu ʿannī',
    translation: 'O Allah, You are Most Forgiving, Most Generous; You love forgiveness, so forgive me.',
    source: 'Tirmidhī — Laylat al-Qadr du\'ā',
  },
  {
    arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا',
    transliteration: 'Rabbanā afrigh ʿalaynā ṣabran wa thabbit aqdāmanā',
    translation: 'Our Lord, pour upon us patience and plant firmly our feet.',
    source: 'Qur\'ān 2:250',
  },
  {
    arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ',
    transliteration: 'Yā Ḥayyu yā Qayyūmu biraḥmatika astaghīth, aṣliḥ lī sha\'nī kullah',
    translation: 'O Ever-Living, O Self-Subsisting, by Your mercy I seek aid; rectify for me all of my affairs.',
    source: 'Nasā\'ī',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا',
    transliteration: 'Allāhumma innī as\'aluka ʿilman nāfiʿan wa rizqan ṭayyiban wa ʿamalan mutaqabbalā',
    translation: 'O Allah, I ask You for beneficial knowledge, pure provision, and accepted deeds.',
    source: 'Ibn Mājah',
  },
  {
    arabic: 'رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا',
    transliteration: 'Rabbanagh-fir lanā dhunūbanā wa isrāfanā fī amrinā wa thabbit aqdāmanā',
    translation: 'Our Lord, forgive us our sins and our excesses in our affairs, and plant our feet firmly.',
    source: 'Qur\'ān 3:147',
  },
  {
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    transliteration: 'Ḥasbiyallāhu lā ilāha illā huwa ʿalayhi tawakkaltu wa huwa rabbul-ʿarshil-ʿaẓīm',
    translation: 'Allah is sufficient for me. There is no deity except Him. On Him I rely, and He is the Lord of the Great Throne.',
    source: 'Qur\'ān 9:129',
  },
  {
    arabic: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ، وَعَلَانِيَتَهُ وَسِرَّهُ',
    transliteration: 'Allāhummagh-fir lī dhanbī kullah, diqqahu wa jillah, wa awwalahu wa ākhirah, wa ʿalāniyatahu wa sirrah',
    translation: 'O Allah, forgive me all my sins — small and great, first and last, open and secret.',
    source: 'Muslim',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
    transliteration: 'Allāhumma innī as\'alukal-hudā wat-tuqā wal-ʿafāfa wal-ghinā',
    translation: 'O Allah, I ask You for guidance, piety, chastity, and self-sufficiency.',
    source: 'Muslim',
  },
  {
    arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ',
    transliteration: 'Rabbij-ʿalnī muqīmaṣ-ṣalāti wa min dhurriyyatī rabbanā wa taqabbal duʿā\'',
    translation: 'My Lord, make me an establisher of prayer, and from my descendants. Our Lord, and accept my supplication.',
    source: 'Qur\'ān 14:40',
  },
  {
    arabic: 'اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي',
    transliteration: 'Allāhumma aṣliḥ lī dīnī alladhī huwa ʿiṣmatu amrī, wa aṣliḥ lī dunyāya allatī fīhā maʿāshī',
    translation: 'O Allah, rectify my religion which is the safeguard of my affairs, and rectify my worldly life in which is my livelihood.',
    source: 'Muslim',
  },
  {
    arabic: 'رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
    transliteration: 'Rabbi innī limā anzalta ilayya min khayrin faqīr',
    translation: 'My Lord, indeed I am, for whatever good You would send me, in need.',
    source: 'Qur\'ān 28:24 — du\'ā of Mūsā (AS)',
  },
  {
    arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا',
    transliteration: 'Allāhumma lā sahla illā mā jaʿaltahu sahlā, wa anta tajʿalul-ḥazna idhā shi\'ta sahlā',
    translation: 'O Allah, nothing is easy except what You make easy; and You make difficulty easy if You will.',
    source: 'Ibn Ḥibbān',
  },
  {
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً',
    transliteration: 'Rabbanā lā tuzigh qulūbanā baʿda idh hadaytanā wa hab lanā min ladunka raḥmah',
    translation: 'Our Lord, let not our hearts deviate after You have guided us, and grant us mercy from Yourself.',
    source: 'Qur\'ān 3:8',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ، وَتَحَوُّلِ عَافِيَتِكَ، وَفُجَاءَةِ نِقْمَتِكَ',
    transliteration: 'Allāhumma innī aʿūdhu bika min zawāli niʿmatik, wa taḥawwuli ʿāfiyatik, wa fujā\'ati niqmatik',
    translation: 'O Allah, I seek refuge in You from the loss of Your favour, the decline of Your protection, and the suddenness of Your wrath.',
    source: 'Muslim',
  },
  {
    arabic: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
    transliteration: 'Allāhummak-finī biḥalālika ʿan ḥarāmik, wa aghninī bifaḍlika ʿammān siwāk',
    translation: 'O Allah, suffice me with what You have made lawful so I have no need of what You have forbidden, and make me independent of all but You by Your bounty.',
    source: 'Tirmidhī',
  },
  {
    arabic: 'رَبَّنَا آمَنَّا بِمَا أَنْزَلْتَ وَاتَّبَعْنَا الرَّسُولَ فَاكْتُبْنَا مَعَ الشَّاهِدِينَ',
    transliteration: 'Rabbanā āmannā bimā anzalta wat-tabaʿnar-rasūla fak-tubnā maʿash-shāhidīn',
    translation: 'Our Lord, we believe in what You have revealed and we have followed the messenger, so register us among the witnesses.',
    source: 'Qur\'ān 3:53',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ',
    transliteration: 'Allāhumma innī as\'alukal-jannata wa aʿūdhu bika minan-nār',
    translation: 'O Allah, I ask You for Paradise and seek refuge in You from the Fire.',
    source: 'Abū Dāwūd',
  },
  {
    arabic: 'اللَّهُمَّ آتِ نَفْسِي تَقْوَاهَا، وَزَكِّهَا أَنْتَ خَيْرُ مَنْ زَكَّاهَا، أَنْتَ وَلِيُّهَا وَمَوْلَاهَا',
    transliteration: 'Allāhumma āti nafsī taqwāhā, wa zakkihā anta khayru man zakkāhā, anta waliyyuhā wa mawlāhā',
    translation: 'O Allah, grant my soul its piety and purify it — You are the best to purify it; You are its Guardian and Master.',
    source: 'Muslim',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عِلْمٍ لَا يَنْفَعُ، وَمِنْ قَلْبٍ لَا يَخْشَعُ',
    transliteration: 'Allāhumma innī aʿūdhu bika min ʿilmin lā yanfaʿu, wa min qalbin lā yakhshaʿu',
    translation: 'O Allah, I seek refuge in You from knowledge that does not benefit, and from a heart that does not feel awe.',
    source: 'Muslim',
  },
  {
    arabic: 'رَبَّنَا وَآتِنَا مَا وَعَدْتَنَا عَلَىٰ رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ الْقِيَامَةِ',
    transliteration: 'Rabbanā wa ātinā mā waʿadtanā ʿalā rusulika wa lā tukhzinā yawmal-qiyāmah',
    translation: 'Our Lord, grant us what You promised us through Your messengers and do not disgrace us on the Day of Resurrection.',
    source: 'Qur\'ān 3:194',
  },
  {
    arabic: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
    transliteration: 'Allāhumma mā aṣbaḥa bī min niʿmatin aw bi\'aḥadin min khalqika faminka waḥdaka lā sharīka lak, falakal-ḥamdu wa lakash-shukr',
    translation: 'O Allah, whatever blessing has come to me or any of Your creation this morning is from You alone, without partner; so to You belongs all praise and all thanks.',
    source: 'Abū Dāwūd — morning du\'ā',
  },
  {
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: 'Bismillāhilladhī lā yaḍurru maʿasmihi shay\'un fil-arḍi wa lā fis-samā\', wa huwas-samīʿul-ʿalīm',
    translation: 'In the name of Allah, with Whose name nothing on earth or in the sky can harm — He is the All-Hearing, the All-Knowing.',
    source: 'Tirmidhī — said 3× morning & evening',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ مَا عَمِلْتُ وَمِنْ شَرِّ مَا لَمْ أَعْمَلْ',
    transliteration: 'Allāhumma innī aʿūdhu bika min sharri mā ʿamiltu wa min sharri mā lam aʿmal',
    translation: 'O Allah, I seek refuge in You from the evil of what I have done and from the evil of what I have not done.',
    source: 'Muslim',
  },
  {
    arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    transliteration: 'Allāhumma antas-salām, wa minkas-salām, tabārakta yā dhal-jalāli wal-ikrām',
    translation: 'O Allah, You are Peace, and from You comes peace. Blessed are You, O Owner of Majesty and Honour.',
    source: 'Muslim — after every prayer',
  },
  {
    arabic: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ',
    transliteration: 'Rabbi awziʿnī an ashkura niʿmatakallatī anʿamta ʿalayya wa ʿalā wālidayya wa an aʿmala ṣāliḥan tarḍāh',
    translation: 'My Lord, enable me to be grateful for the blessing You have bestowed upon me and upon my parents, and to do righteousness that pleases You.',
    source: 'Qur\'ān 27:19',
  },
  {
    arabic: 'اللَّهُمَّ أَلْهِمْنِي رُشْدِي وَأَعِذْنِي مِنْ شَرِّ نَفْسِي',
    transliteration: 'Allāhumma alhimnī rushdī wa aʿidhnī min sharri nafsī',
    translation: 'O Allah, inspire me with right guidance and protect me from the evil of my own self.',
    source: 'Tirmidhī',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ، وَقَهْرِ الرِّجَالِ',
    transliteration: 'Allāhumma innī aʿūdhu bika min ghalabatid-dayn, wa qahrir-rijāl',
    translation: 'O Allah, I seek refuge in You from being overcome by debt and being overpowered by men.',
    source: 'Abū Dāwūd',
  },
  {
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    transliteration: 'Subḥān-Allāhi wa biḥamdihi, subḥān-Allāhil-ʿaẓīm',
    translation: 'Glory be to Allah and praise be to Him; glory be to Allah the Magnificent.',
    source: 'Bukhārī & Muslim — beloved to Ar-Raḥmān',
  },
  {
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'Lā ḥawla wa lā quwwata illā billāh',
    translation: 'There is no power and no strength except with Allah.',
    source: 'Bukhārī — a treasure of Paradise',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ وَرَحْمَتِكَ، فَإِنَّهُ لَا يَمْلِكُهَا إِلَّا أَنْتَ',
    transliteration: 'Allāhumma innī as\'aluka min faḍlika wa raḥmatik, fa\'innahu lā yamlikuhā illā ant',
    translation: 'O Allah, I ask You from Your bounty and Your mercy, for none owns them except You.',
    source: 'Ṭabarānī',
  },
  {
    arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbir-ḥamhumā kamā rabbayānī ṣaghīrā',
    translation: 'My Lord, have mercy on them (my parents) as they raised me when I was small.',
    source: 'Qur\'ān 17:24',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنَّ لَكَ الْحَمْدَ، لَا إِلَٰهَ إِلَّا أَنْتَ، الْمَنَّانُ، يَا بَدِيعَ السَّمَاوَاتِ وَالْأَرْضِ',
    transliteration: 'Allāhumma innī as\'aluka bi\'anna lakal-ḥamd, lā ilāha illā ant, al-Mannān, yā Badīʿas-samāwāti wal-arḍ',
    translation: 'O Allah, I ask You — for to You belongs all praise; there is no deity but You, the Bestower, the Originator of the heavens and the earth.',
    source: 'Abū Dāwūd — Ism al-Aʿẓam',
  },
  {
    arabic: 'اللَّهُمَّ اقْسِمْ لَنَا مِنْ خَشْيَتِكَ مَا تَحُولُ بِهِ بَيْنَنَا وَبَيْنَ مَعَاصِيكَ',
    transliteration: 'Allāhumma iqsim lanā min khashyatika mā taḥūlu bihi baynanā wa bayna maʿāṣīk',
    translation: 'O Allah, grant us of Your awe that which will form a barrier between us and disobedience to You.',
    source: 'Tirmidhī',
  },
  {
    arabic: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ',
    transliteration: 'Rabbanagh-fir lanā wa li\'ikhwāninalladhīna sabaqūnā bil-īmān',
    translation: 'Our Lord, forgive us and our brothers who preceded us in faith.',
    source: 'Qur\'ān 59:10',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ حُبَّكَ، وَحُبَّ مَنْ يُحِبُّكَ، وَالْعَمَلَ الَّذِي يُبَلِّغُنِي حُبَّكَ',
    transliteration: 'Allāhumma innī as\'aluka ḥubbak, wa ḥubba man yuḥibbuk, wal-ʿamalalladhī yuballighunī ḥubbak',
    translation: 'O Allah, I ask You for Your love, the love of those who love You, and the deeds that will bring me Your love.',
    source: 'Tirmidhī',
  },
];

/**
 * Pick today's du'ā deterministically — same day = same du'ā for every device.
 */
export function getTodaysDua(): { dua: DailyDua; index: number; date: string } {
  const epoch = Date.UTC(2024, 0, 1);
  const idx = Math.floor((Date.now() - epoch) / 86_400_000) % DAILY_DUAS.length;
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { dua: DAILY_DUAS[idx], index: idx, date };
}
