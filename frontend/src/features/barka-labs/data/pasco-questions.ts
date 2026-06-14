/**
 * PASCO 2.0 — 20 Islamic Scenario-Based Assessment
 * Personality, Aptitude, Skills, Character-Optimization
 *
 * Each question has 4 options. Each option maps to 3-5 sub-traits with weights 1-3.
 * Scoring is ipsative: no "right" answer, every choice reveals something.
 */

export interface PascoTrait {
  code: string;
  weight: number;
}

export interface PascoOption {
  label: string;
  description: string;
  value: 'a' | 'b' | 'c' | 'd';
  traits: PascoTrait[];
}

export interface PascoQuestion {
  id: string;
  block: 'P' | 'A' | 'S' | 'CO';
  title: string;
  scenario: string;
  options: PascoOption[];
}

/** Sub-trait definitions */
export const PASCO_SUB_TRAITS: Record<string, { name: string; dimension: string; icon: string }> = {
  P1: { name: 'Openness', dimension: 'Personality', icon: '🌊' },
  P2: { name: 'Conscientiousness', dimension: 'Personality', icon: '🎯' },
  P3: { name: 'Extraversion', dimension: 'Personality', icon: '🗣️' },
  P4: { name: 'Agreeableness', dimension: 'Personality', icon: '🤝' },
  P5: { name: 'Emotional Stability', dimension: 'Personality', icon: '⚖️' },
  A1: { name: 'Analytical', dimension: 'Aptitude', icon: '🔍' },
  A2: { name: 'Creative', dimension: 'Aptitude', icon: '💡' },
  A3: { name: 'Strategic', dimension: 'Aptitude', icon: '♟️' },
  A4: { name: 'Learning Speed', dimension: 'Aptitude', icon: '📚' },
  A5: { name: 'Pattern Recognition', dimension: 'Aptitude', icon: '🧩' },
  S1: { name: 'Communication', dimension: 'Skills', icon: '💬' },
  S2: { name: 'Leadership', dimension: 'Skills', icon: '🏴' },
  S3: { name: 'Emotional Intelligence', dimension: 'Skills', icon: '💖' },
  S4: { name: 'Technical Orientation', dimension: 'Skills', icon: '⚙️' },
  S5: { name: 'Collaboration', dimension: 'Skills', icon: '🤲' },
  CO1: { name: 'Sabr (Patience)', dimension: 'Character', icon: '🌿' },
  CO2: { name: 'Shukr (Gratitude)', dimension: 'Character', icon: '✨' },
  CO3: { name: 'Amanah (Integrity)', dimension: 'Character', icon: '🔐' },
  CO4: { name: 'Adl (Justice)', dimension: 'Character', icon: '⚖️' },
  CO5: { name: 'Rahma (Compassion)', dimension: 'Character', icon: '🕊️' },
};

export const PASCO_DIMENSIONS = [
  { key: 'P', name: 'Personality', color: '#5B8DEF', traits: ['P1', 'P2', 'P3', 'P4', 'P5'] },
  { key: 'A', name: 'Aptitude', color: '#2A9D6F', traits: ['A1', 'A2', 'A3', 'A4', 'A5'] },
  { key: 'S', name: 'Skills', color: '#D7B56A', traits: ['S1', 'S2', 'S3', 'S4', 'S5'] },
  { key: 'CO', name: 'Character', color: '#8B7EC8', traits: ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'] },
];

export const PASCO_QUESTIONS: PascoQuestion[] = [
  // ═══════ BLOCK 1: PERSONALITY (Q1-Q5) ═══════
  {
    id: 'q1', block: 'P', title: 'The New Masjid',
    scenario: "You've just moved to a new city and visit the local masjid for the first time. After salah, people are mingling in the lobby and you don't know a single person. The chai is being passed around and someone glances your way.",
    options: [
      { label: 'The Connector', description: 'You walk up to the nearest group, introduce yourself, and ask how long they\'ve been coming here.', value: 'a', traits: [{ code: 'P3', weight: 3 }, { code: 'S1', weight: 2 }, { code: 'P4', weight: 1 }] },
      { label: 'The Observer', description: 'You find a quiet corner, take in the vibe, and make mental notes about the community before deciding if this is your place.', value: 'b', traits: [{ code: 'P1', weight: 2 }, { code: 'A5', weight: 2 }, { code: 'P5', weight: 1 }] },
      { label: 'The Helper', description: 'You notice the uncle struggling to stack chairs and jump in to help — that\'s your way in.', value: 'c', traits: [{ code: 'CO5', weight: 2 }, { code: 'P4', weight: 3 }, { code: 'S5', weight: 1 }] },
      { label: 'The Planner', description: 'You go home, look up the masjid\'s events calendar and social media, and come back next week with a plan to join a specific program.', value: 'd', traits: [{ code: 'P2', weight: 3 }, { code: 'A3', weight: 2 }, { code: 'A4', weight: 1 }] },
    ],
  },
  {
    id: 'q2', block: 'P', title: 'Ramadan Iftar Politics',
    scenario: "It's the second week of Ramadan and your family is hosting a big iftar. Your aunt starts making comments about how \"young people these days don't take Ramadan seriously\" — clearly aimed at your cousin who's sitting right there looking uncomfortable.",
    options: [
      { label: 'The Deflector', description: 'You crack a light joke to change the energy and steer the conversation toward something everyone can enjoy.', value: 'a', traits: [{ code: 'P5', weight: 3 }, { code: 'S3', weight: 2 }, { code: 'S1', weight: 1 }] },
      { label: 'The Diplomat', description: 'You gently acknowledge your aunt\'s concern while also checking in on your cousin later privately.', value: 'b', traits: [{ code: 'P4', weight: 3 }, { code: 'CO5', weight: 2 }, { code: 'S3', weight: 2 }] },
      { label: 'The Truth-Teller', description: 'You respectfully push back: "Auntie, everyone\'s Ramadan journey is different" — someone needs to say it.', value: 'c', traits: [{ code: 'P1', weight: 2 }, { code: 'CO4', weight: 3 }, { code: 'S1', weight: 1 }] },
      { label: 'The Quiet Processor', description: 'You stay quiet during dinner but reflect on it deeply afterward — maybe even journal about it.', value: 'd', traits: [{ code: 'P5', weight: 2 }, { code: 'P2', weight: 1 }, { code: 'A1', weight: 2 }, { code: 'CO1', weight: 1 }] },
    ],
  },
  {
    id: 'q3', block: 'P', title: 'Career vs. Family',
    scenario: "Your parents have always envisioned you in a \"stable\" career — medicine, engineering, law. But you've discovered a passion for something completely different: maybe it's art, entrepreneurship, Islamic psychology, or content creation. A family gathering is coming up and you know the question is coming.",
    options: [
      { label: 'The Bridge Builder', description: 'You prepare a thoughtful case showing how your path aligns with Islamic values of excellence and contribution, then present it to your parents before the gathering.', value: 'a', traits: [{ code: 'P2', weight: 3 }, { code: 'A3', weight: 2 }, { code: 'S1', weight: 2 }] },
      { label: 'The Unapologetic', description: 'You own it fully. If it comes up at the gathering, you speak about it with genuine passion and let the excitement do the convincing.', value: 'b', traits: [{ code: 'P3', weight: 3 }, { code: 'P1', weight: 2 }, { code: 'P5', weight: 1 }] },
      { label: 'The Patient One', description: 'You keep working on your passion quietly, building results that will speak for themselves. Actions over arguments.', value: 'c', traits: [{ code: 'CO1', weight: 3 }, { code: 'P2', weight: 2 }, { code: 'P5', weight: 1 }] },
      { label: 'The Seeker', description: 'You consult a mentor or someone your parents respect, hoping they can help bridge the gap between generations.', value: 'd', traits: [{ code: 'P4', weight: 2 }, { code: 'S5', weight: 2 }, { code: 'A3', weight: 1 }, { code: 'CO5', weight: 1 }] },
    ],
  },
  {
    id: 'q4', block: 'P', title: 'Eid Morning Energy',
    scenario: "It's Eid morning. The prayer is done, everyone's dressed up, and the day stretches ahead. Your group chat is blowing up with plans — some people want a big gathering, others want something chill. You have complete freedom to shape your day.",
    options: [
      { label: 'The Social Butterfly', description: 'You\'re bouncing between three Eid gatherings, hugging everyone, taking photos, and making sure no one\'s left out.', value: 'a', traits: [{ code: 'P3', weight: 3 }, { code: 'P4', weight: 2 }, { code: 'S5', weight: 1 }] },
      { label: 'The Curator', description: 'You organize a small, intentional gathering with your closest people — good food, good conversation, maybe a meaningful activity.', value: 'b', traits: [{ code: 'P2', weight: 2 }, { code: 'A2', weight: 2 }, { code: 'S3', weight: 1 }] },
      { label: 'The Free Spirit', description: 'You do something spontaneous — maybe drive somewhere new, try a restaurant you\'ve never been to, or just see where the day takes you.', value: 'c', traits: [{ code: 'P1', weight: 3 }, { code: 'A2', weight: 2 }, { code: 'P5', weight: 1 }] },
      { label: 'The Reflective One', description: 'You spend the morning with family, then carve out solo time to reflect on the month that just passed and set intentions.', value: 'd', traits: [{ code: 'P5', weight: 2 }, { code: 'CO2', weight: 2 }, { code: 'P2', weight: 2 }] },
    ],
  },
  {
    id: 'q5', block: 'P', title: 'The Interfaith Moment',
    scenario: "A non-Muslim colleague or classmate genuinely asks you: \"What's it actually like being Muslim? I feel like I only hear one narrative.\" It's not hostile — they're sincerely curious. You're the only Muslim they know well.",
    options: [
      { label: 'The Storyteller', description: 'You share personal stories — your favorite Ramadan memories, what Jummah feels like, the beauty you experience. You make it human and real.', value: 'a', traits: [{ code: 'P1', weight: 3 }, { code: 'S1', weight: 3 }, { code: 'P3', weight: 1 }] },
      { label: 'The Educator', description: 'You break it down clearly: here\'s what we believe, here\'s what we practice, here\'s what the media gets wrong. Structured and informative.', value: 'b', traits: [{ code: 'A1', weight: 2 }, { code: 'S1', weight: 2 }, { code: 'P2', weight: 2 }] },
      { label: 'The Listener First', description: 'You ask them what they\'ve heard so far, what sparked the curiosity, and then address their specific gaps. It\'s a dialogue, not a lecture.', value: 'c', traits: [{ code: 'S3', weight: 3 }, { code: 'P4', weight: 2 }, { code: 'A5', weight: 1 }] },
      { label: 'The Inviter', description: 'You say "Why don\'t you come see for yourself?" and invite them to an iftar, a community event, or just a casual hangout with your Muslim friends.', value: 'd', traits: [{ code: 'P3', weight: 2 }, { code: 'CO5', weight: 2 }, { code: 'S5', weight: 1 }, { code: 'A2', weight: 1 }] },
    ],
  },

  // ═══════ BLOCK 2: APTITUDE (Q6-Q10) ═══════
  {
    id: 'q6', block: 'A', title: 'Budget Crisis',
    scenario: "Your masjid's annual community dinner is two weeks away. The budget just got slashed in half because a major donor pulled out. The venue is booked, invites are sent, 200 people are coming. The committee is panicking.",
    options: [
      { label: 'The Analyst', description: 'You pull up the full budget spreadsheet, identify every line item, and figure out exactly what can be cut without ruining the experience.', value: 'a', traits: [{ code: 'A1', weight: 3 }, { code: 'A3', weight: 2 }, { code: 'P2', weight: 1 }] },
      { label: 'The Creative Solver', description: 'You propose turning it into a potluck-style event, get local Muslim businesses to sponsor dishes, and turn the constraint into a community-building moment.', value: 'b', traits: [{ code: 'A2', weight: 3 }, { code: 'S5', weight: 2 }, { code: 'A3', weight: 1 }] },
      { label: 'The Mobilizer', description: 'You immediately start making calls — there\'s always someone in the community who can help. You personally reach out to 10 potential donors before the day is over.', value: 'c', traits: [{ code: 'S2', weight: 2 }, { code: 'S1', weight: 2 }, { code: 'P3', weight: 2 }] },
      { label: 'The Pattern Spotter', description: 'You point out this happens every year and suggest the committee build a reserve fund and diversify donors. You\'re already thinking about next year.', value: 'd', traits: [{ code: 'A5', weight: 3 }, { code: 'A3', weight: 2 }, { code: 'A1', weight: 1 }] },
    ],
  },
  {
    id: 'q7', block: 'A', title: 'Scholar Disagreement',
    scenario: "You're researching an Islamic topic that matters to you — maybe it's about finances, relationships, or daily practice. You find that respected scholars have completely opposite opinions, and both sides have strong evidence. People in your circle are getting heated about it.",
    options: [
      { label: 'The Deep Diver', description: 'You go to the primary sources yourself. You want to understand the reasoning behind each position, not just the conclusion.', value: 'a', traits: [{ code: 'A1', weight: 3 }, { code: 'A4', weight: 2 }, { code: 'P1', weight: 1 }] },
      { label: 'The Synthesizer', description: 'You look for the underlying principles both sides agree on and form your own nuanced position that takes the best from each.', value: 'b', traits: [{ code: 'A2', weight: 2 }, { code: 'A5', weight: 3 }, { code: 'P1', weight: 1 }] },
      { label: 'The Pragmatist', description: 'You identify which opinion applies best to your specific life situation and context, and go with that. Scholarly disagreement is a mercy.', value: 'c', traits: [{ code: 'A3', weight: 3 }, { code: 'P5', weight: 2 }, { code: 'P2', weight: 1 }] },
      { label: 'The Quick Study', description: 'You find the most trusted scholar you follow, understand their reasoning well enough to be at peace with it, and move on.', value: 'd', traits: [{ code: 'A4', weight: 3 }, { code: 'P5', weight: 2 }, { code: 'CO1', weight: 1 }] },
    ],
  },
  {
    id: 'q8', block: 'A', title: 'Halal Business Dilemma',
    scenario: "You've been offered a business opportunity or job that pays extremely well. The work itself is halal, but the company's broader portfolio includes some questionable areas. It's not clearly haram, but it's not clearly clean either. You need the money.",
    options: [
      { label: 'The Investigator', description: 'You dig into the company\'s full revenue breakdown, consult with someone knowledgeable, and make a decision based on the actual numbers and principles.', value: 'a', traits: [{ code: 'A1', weight: 3 }, { code: 'CO3', weight: 2 }, { code: 'P2', weight: 1 }] },
      { label: 'The Creative Exit', description: 'You explore whether you can negotiate your role to be distanced from the questionable areas, or propose an alternative arrangement.', value: 'b', traits: [{ code: 'A2', weight: 3 }, { code: 'A3', weight: 2 }, { code: 'CO4', weight: 1 }] },
      { label: 'The Long-Game Thinker', description: 'You weigh this against your 5-year plan. Is this a stepping stone or a trap? You think about where this path leads, not just where it starts.', value: 'c', traits: [{ code: 'A3', weight: 3 }, { code: 'A5', weight: 2 }, { code: 'P2', weight: 1 }] },
      { label: 'The Rapid Learner', description: 'You quickly educate yourself on the Islamic frameworks for financial grey areas and make an informed call fast.', value: 'd', traits: [{ code: 'A4', weight: 3 }, { code: 'A1', weight: 2 }, { code: 'CO3', weight: 1 }] },
    ],
  },
  {
    id: 'q9', block: 'A', title: 'Information Overload',
    scenario: "Your social media feed is flooded with devastating news about Muslims suffering somewhere in the world. Everyone's sharing posts, opinions are flying, fundraisers are popping up, and you're feeling the weight of it. Some information contradicts other information.",
    options: [
      { label: 'The Fact-Checker', description: 'You stop scrolling, find 2-3 verified sources, cross-reference the claims, and only then form an opinion or take action.', value: 'a', traits: [{ code: 'A1', weight: 3 }, { code: 'A5', weight: 1 }, { code: 'P2', weight: 2 }] },
      { label: 'The Meaning-Maker', description: 'You step back from the noise and try to understand the bigger picture: historical context, geopolitical patterns, what\'s actually new.', value: 'b', traits: [{ code: 'A5', weight: 3 }, { code: 'A1', weight: 1 }, { code: 'P5', weight: 2 }] },
      { label: 'The Action-Taker', description: 'You pick ONE concrete thing you can do right now — donate, volunteer, organize — and channel the overwhelm into impact.', value: 'c', traits: [{ code: 'A3', weight: 2 }, { code: 'S2', weight: 2 }, { code: 'P2', weight: 1 }, { code: 'CO5', weight: 1 }] },
      { label: 'The Adaptive Learner', description: 'You use this as a catalyst to deeply learn about the issue, its roots, and what sustainable help looks like.', value: 'd', traits: [{ code: 'A4', weight: 3 }, { code: 'A2', weight: 1 }, { code: 'P1', weight: 2 }] },
    ],
  },
  {
    id: 'q10', block: 'A', title: 'New Skill for Deen',
    scenario: "You decide you want to learn something new that would benefit your deen and your community — maybe it's Arabic, Islamic finance, counseling skills, or Quran memorization. You've tried before and didn't stick with it.",
    options: [
      { label: 'The Systems Builder', description: 'You research the best method, create a structured schedule, set milestones, and track your progress. If the system is right, the results will follow.', value: 'a', traits: [{ code: 'A3', weight: 3 }, { code: 'P2', weight: 2 }, { code: 'A1', weight: 1 }] },
      { label: 'The Pattern Hacker', description: 'You analyze why you failed before, identify the exact friction points, and design around them.', value: 'b', traits: [{ code: 'A5', weight: 3 }, { code: 'A4', weight: 2 }, { code: 'A1', weight: 1 }] },
      { label: 'The Immersion Learner', description: 'You throw yourself in: join a class, find a study partner, change your phone language. Total environment shift.', value: 'c', traits: [{ code: 'A4', weight: 3 }, { code: 'P3', weight: 1 }, { code: 'P1', weight: 2 }] },
      { label: 'The Creative Approach', description: 'You make it enjoyable: gamify it, connect it to something you already love, or create content about it as you learn.', value: 'd', traits: [{ code: 'A2', weight: 3 }, { code: 'A4', weight: 1 }, { code: 'P1', weight: 2 }] },
    ],
  },

  // ═══════ BLOCK 3: SKILLS (Q11-Q15) ═══════
  {
    id: 'q11', block: 'S', title: 'Leading the Halaqah',
    scenario: "You've been asked to lead a weekly halaqah at your masjid. The group is mixed — some people know a lot, some are brand new to practicing, and a few are just there because their friends dragged them. Your first session is tomorrow.",
    options: [
      { label: 'The Facilitator', description: 'You prepare a topic but plan to make it discussion-based. Your job is to create space where everyone feels heard, especially the quiet ones.', value: 'a', traits: [{ code: 'S2', weight: 2 }, { code: 'S3', weight: 3 }, { code: 'S5', weight: 1 }] },
      { label: 'The Communicator', description: 'You craft a compelling opening that hooks everyone regardless of their level. Stories, analogies, real-life examples.', value: 'b', traits: [{ code: 'S1', weight: 3 }, { code: 'A2', weight: 2 }, { code: 'P3', weight: 1 }] },
      { label: 'The Architect', description: 'You design a structured 8-week curriculum with progressive topics. You share the roadmap upfront so everyone sees the journey.', value: 'c', traits: [{ code: 'S2', weight: 3 }, { code: 'A3', weight: 2 }, { code: 'P2', weight: 1 }] },
      { label: 'The Empathizer', description: 'You start by asking the group what they actually need. What questions keep them up at night? You build from their reality.', value: 'd', traits: [{ code: 'S3', weight: 3 }, { code: 'S1', weight: 1 }, { code: 'P4', weight: 2 }] },
    ],
  },
  {
    id: 'q12', block: 'S', title: 'Giving Nasiha',
    scenario: "A close friend is making a decision you genuinely believe is harmful for them — maybe it's a relationship, a financial choice, or a lifestyle pattern. They haven't asked for your opinion. You care about them deeply and you can see where this is heading.",
    options: [
      { label: 'The Gentle Opener', description: 'You find a private, relaxed moment and share your concern with genuine love. You focus on how you feel, not what they\'re doing wrong.', value: 'a', traits: [{ code: 'S1', weight: 3 }, { code: 'S3', weight: 2 }, { code: 'CO5', weight: 2 }] },
      { label: 'The Strategic Questioner', description: 'You ask thoughtful questions that help them see the issue themselves: "Have you thought about...?" You guide without telling.', value: 'b', traits: [{ code: 'S3', weight: 2 }, { code: 'A3', weight: 2 }, { code: 'S1', weight: 1 }, { code: 'CO4', weight: 1 }] },
      { label: 'The Lead-by-Example', description: 'You don\'t say anything directly but share your own similar experience or subtly model the better choice in your own life.', value: 'c', traits: [{ code: 'S3', weight: 1 }, { code: 'CO1', weight: 2 }, { code: 'P4', weight: 2 }, { code: 'S4', weight: 1 }] },
      { label: 'The Direct One', description: 'You tell them straight: "I love you, and I have to be honest with you." You\'d rather risk awkwardness now than watch them suffer later.', value: 'd', traits: [{ code: 'S2', weight: 2 }, { code: 'CO3', weight: 3 }, { code: 'S1', weight: 1 }] },
    ],
  },
  {
    id: 'q13', block: 'S', title: 'Community Conflict',
    scenario: "Two groups in your masjid community are in a heated disagreement — maybe it's about how to run an event, a policy change, or a leadership decision. Both sides feel strongly and it's affecting the community vibe. Someone asks you to help mediate.",
    options: [
      { label: 'The Mediator', description: 'You meet with each side separately first, listen deeply, identify the real needs beneath the positions, then bring them together.', value: 'a', traits: [{ code: 'S3', weight: 3 }, { code: 'S2', weight: 2 }, { code: 'CO4', weight: 2 }] },
      { label: 'The Communicator', description: 'You draft a clear, neutral summary of both positions and share it. Transparency and accurate framing can de-escalate most conflicts.', value: 'b', traits: [{ code: 'S1', weight: 3 }, { code: 'CO4', weight: 2 }, { code: 'A1', weight: 1 }] },
      { label: 'The Team Builder', description: 'You get both sides working on a small shared project together. People who serve together fight less. Action heals what arguments can\'t.', value: 'c', traits: [{ code: 'S5', weight: 3 }, { code: 'S2', weight: 2 }, { code: 'A2', weight: 1 }] },
      { label: 'The Systems Thinker', description: 'You suggest implementing a structured decision-making process: clear criteria, transparent process. Remove the emotion, focus on the system.', value: 'd', traits: [{ code: 'S4', weight: 3 }, { code: 'A1', weight: 2 }, { code: 'A3', weight: 1 }] },
    ],
  },
  {
    id: 'q14', block: 'S', title: 'The Multicultural Masjid',
    scenario: "Your community has Muslims from five different cultural backgrounds. There's growing tension because one culture tends to dominate the masjid's events, food, and leadership style. Others feel sidelined. You've been asked to help plan the next big community event.",
    options: [
      { label: 'The Inclusive Planner', description: 'You create a committee with at least one person from each cultural group and give each real decision-making power.', value: 'a', traits: [{ code: 'S5', weight: 3 }, { code: 'CO4', weight: 2 }, { code: 'S2', weight: 1 }] },
      { label: 'The Cultural Storyteller', description: 'You design the event around sharing: each culture gets a segment to showcase their food, art, or tradition. Turn diversity into the program.', value: 'b', traits: [{ code: 'S1', weight: 2 }, { code: 'A2', weight: 3 }, { code: 'P1', weight: 1 }] },
      { label: 'The Behind-the-Scenes Connector', description: 'You have private conversations with key people from each group, understand their specific frustrations, and address those individually.', value: 'c', traits: [{ code: 'S3', weight: 3 }, { code: 'P4', weight: 2 }, { code: 'CO5', weight: 1 }] },
      { label: 'The Process Designer', description: 'You propose a rotating leadership model for all future events and draft clear guidelines for inclusive planning. Fix the system.', value: 'd', traits: [{ code: 'S4', weight: 2 }, { code: 'A3', weight: 2 }, { code: 'S2', weight: 1 }, { code: 'CO4', weight: 1 }] },
    ],
  },
  {
    id: 'q15', block: 'S', title: 'The Faith Questioner',
    scenario: "Someone you care about — a sibling, friend, or community member — confides that they're struggling with their faith. They're not hostile toward Islam; they're just lost, confused, and maybe a little ashamed to admit it. They chose to tell you.",
    options: [
      { label: 'The Safe Space', description: 'You listen without any judgment or urgency to "fix" them. You validate their courage in speaking up and make sure they know this conversation is safe.', value: 'a', traits: [{ code: 'S3', weight: 3 }, { code: 'CO5', weight: 3 }, { code: 'P4', weight: 1 }] },
      { label: 'The Resourceful Guide', description: 'You share resources that helped you or others: a book, a podcast, a scholar who speaks to doubts with intelligence.', value: 'b', traits: [{ code: 'S1', weight: 2 }, { code: 'A4', weight: 1 }, { code: 'S4', weight: 2 }, { code: 'CO3', weight: 1 }] },
      { label: 'The Companion', description: 'You offer to walk with them. Attend a class together, read something, have regular check-ins. They shouldn\'t do this alone.', value: 'c', traits: [{ code: 'S5', weight: 3 }, { code: 'CO5', weight: 2 }, { code: 'P4', weight: 1 }] },
      { label: 'The Honest Mirror', description: 'You share your own struggles honestly. You let them know that doubt and confusion aren\'t failure — they\'re part of the journey.', value: 'd', traits: [{ code: 'S1', weight: 2 }, { code: 'S3', weight: 2 }, { code: 'P1', weight: 2 }, { code: 'CO1', weight: 1 }] },
    ],
  },

  // ═══════ BLOCK 4: CHARACTER (Q16-Q20) ═══════
  {
    id: 'q16', block: 'CO', title: 'The Unseen Good Deed',
    scenario: "You quietly helped someone in a significant way — maybe you paid off someone's grocery bill, mentored a struggling student for months, or supported a family going through hardship. No one knows it was you. Then a situation comes up where getting credit for it would genuinely benefit you.",
    options: [
      { label: 'The Silent One', description: 'You keep it to yourself. The deed was between you and Allah. Using it for social capital would ruin it for you spiritually.', value: 'a', traits: [{ code: 'CO1', weight: 2 }, { code: 'CO3', weight: 3 }, { code: 'P5', weight: 2 }] },
      { label: 'The Grateful Reframer', description: 'You reflect on how you were even in a position to help. The ability to give was itself a blessing you didn\'t earn.', value: 'b', traits: [{ code: 'CO2', weight: 3 }, { code: 'CO5', weight: 2 }, { code: 'P5', weight: 1 }] },
      { label: 'The Principled One', description: 'You\'d mention it only if it directly helps the cause — like proving capability for a community role. It\'s about effectiveness, not ego.', value: 'c', traits: [{ code: 'CO4', weight: 3 }, { code: 'A3', weight: 2 }, { code: 'CO3', weight: 1 }] },
      { label: 'The Transparent One', description: 'You share it honestly when relevant. Good deeds can inspire others to do the same. Visible virtue can be contagious.', value: 'd', traits: [{ code: 'CO5', weight: 2 }, { code: 'S1', weight: 2 }, { code: 'P1', weight: 2 }] },
    ],
  },
  {
    id: 'q17', block: 'CO', title: 'The Shattered Plan',
    scenario: "You spent months working toward something important — a job, a project, a relationship, a goal you prayed about consistently. It falls through completely, and not because of anything you did wrong. The door just closed. People around you are sympathetic but you're sitting alone with it.",
    options: [
      { label: 'The Steadfast', description: 'You grieve it, but you hold firm. What\'s written for you won\'t miss you, and what missed you was never yours. It hurts, but you trust the process.', value: 'a', traits: [{ code: 'CO1', weight: 3 }, { code: 'P5', weight: 2 }, { code: 'CO3', weight: 1 }] },
      { label: 'The Grateful Anyway', description: 'Even in the disappointment, you actively look for what you gained: the skills, the people you met, the growth. The outcome failed but the journey didn\'t.', value: 'b', traits: [{ code: 'CO2', weight: 3 }, { code: 'P1', weight: 2 }, { code: 'A5', weight: 1 }] },
      { label: 'The Rebuilder', description: 'You give yourself a day or two, then start planning the next move. If this door closed, there\'s a reason another one needs your energy.', value: 'c', traits: [{ code: 'A3', weight: 2 }, { code: 'P2', weight: 2 }, { code: 'CO1', weight: 1 }, { code: 'S2', weight: 1 }] },
      { label: 'The Connector', description: 'You reach out to people you trust. You process it by talking, being around people who get it. You don\'t do pain alone.', value: 'd', traits: [{ code: 'S3', weight: 2 }, { code: 'P3', weight: 1 }, { code: 'CO5', weight: 1 }, { code: 'S5', weight: 2 }] },
    ],
  },
  {
    id: 'q18', block: 'CO', title: 'The Wealth Test',
    scenario: "You receive a significant amount of money unexpectedly — an inheritance, a bonus, or a business windfall. It's more than you need. You've already fulfilled your zakat obligation. The money is sitting there, and you're thinking about what comes next.",
    options: [
      { label: 'The Generous Heart', description: 'You immediately think about who needs it. You give beyond obligation because you know wealth is a test and you\'d rather be on the safe side.', value: 'a', traits: [{ code: 'CO5', weight: 3 }, { code: 'CO2', weight: 2 }, { code: 'P4', weight: 1 }] },
      { label: 'The Trust Builder', description: 'You invest it wisely in halal avenues. Wealth that grows ethically means you can give more in the long run. Stewardship is worship.', value: 'b', traits: [{ code: 'CO3', weight: 3 }, { code: 'A3', weight: 2 }, { code: 'P2', weight: 1 }] },
      { label: 'The Just Allocator', description: 'You divide it thoughtfully: family obligations, savings, sadaqah, personal needs. Every dollar has a purpose.', value: 'c', traits: [{ code: 'CO4', weight: 3 }, { code: 'A1', weight: 2 }, { code: 'P2', weight: 1 }] },
      { label: 'The Patient Sitter', description: 'You don\'t rush. You make istikharah, sit with it, and let clarity come. Big money decisions made in excitement or guilt rarely end well.', value: 'd', traits: [{ code: 'CO1', weight: 3 }, { code: 'P5', weight: 2 }, { code: 'A3', weight: 1 }] },
    ],
  },
  {
    id: 'q19', block: 'CO', title: 'Justice vs. Mercy',
    scenario: "Someone in your community — someone you personally like — is caught in a clear ethical violation. Maybe they mismanaged community funds, lied about something significant, or betrayed someone's trust. The community is divided: some want accountability, others want to forgive and move on.",
    options: [
      { label: 'Justice First', description: 'There must be accountability. Not out of anger, but because trust is the foundation of any community. Mercy without justice enables the next violation.', value: 'a', traits: [{ code: 'CO4', weight: 3 }, { code: 'CO3', weight: 2 }, { code: 'S2', weight: 1 }] },
      { label: 'Mercy First', description: 'People make mistakes. If they\'re genuinely remorseful, the community should help them recover. Public humiliation isn\'t Islamic.', value: 'b', traits: [{ code: 'CO5', weight: 3 }, { code: 'CO1', weight: 1 }, { code: 'P4', weight: 2 }] },
      { label: 'Balanced Process', description: 'You advocate for a private, structured process: the person acknowledges it, makes amends, and there are clear boundaries. Justice AND mercy, sequenced.', value: 'c', traits: [{ code: 'CO4', weight: 2 }, { code: 'CO5', weight: 2 }, { code: 'A3', weight: 1 }, { code: 'S3', weight: 1 }] },
      { label: 'Systemic Fix', description: 'You focus on the system that allowed it. Put checks and balances in place so it can\'t happen again, regardless of what happens to this person.', value: 'd', traits: [{ code: 'CO3', weight: 2 }, { code: 'A5', weight: 2 }, { code: 'S4', weight: 2 }] },
    ],
  },
  {
    id: 'q20', block: 'CO', title: 'The Mirror',
    scenario: "Late at night, in a quiet moment, you're being completely honest with yourself. No performance, no audience. You think about the gap between who you present to the world and who you actually are. The private you — the one who knows your real struggles, your real intentions, your real fears.",
    options: [
      { label: 'The Honest Reckoner', description: 'You sit with the gap and take it seriously. You make a specific, actionable change — even a small one. Self-accounting without action is just guilt.', value: 'a', traits: [{ code: 'CO3', weight: 3 }, { code: 'P2', weight: 2 }, { code: 'CO1', weight: 1 }] },
      { label: 'The Compassionate Self', description: 'You acknowledge the gap with gentleness. You\'re human. Allah sees your struggles and still provides for you. The gap is where growth lives.', value: 'b', traits: [{ code: 'CO2', weight: 2 }, { code: 'CO5', weight: 2 }, { code: 'P5', weight: 2 }] },
      { label: 'The Strategic Grower', description: 'You identify the one area where the gap is widest and build a plan to close it. Not everything at once — just the one thing that would move the needle most.', value: 'c', traits: [{ code: 'A3', weight: 2 }, { code: 'CO4', weight: 2 }, { code: 'P2', weight: 2 }] },
      { label: 'The Vulnerable One', description: 'You share your struggle with someone you trust — a spouse, a close friend, a mentor. Bringing the private into a safe relationship is how you stop carrying it alone.', value: 'd', traits: [{ code: 'S3', weight: 2 }, { code: 'S1', weight: 1 }, { code: 'CO5', weight: 1 }, { code: 'P3', weight: 1 }, { code: 'P1', weight: 2 }] },
    ],
  },
];
