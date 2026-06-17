/**
 * ConversationPage — /sakinah/conversation
 * Stage D · Phase 6: Topic-by-topic guided conversation between Ahmed and Fatima.
 * 8 pre-nikah topics unlock one at a time. No open chat box. No read receipts.
 * No media. No contact info. Intimacy is absent as a topic entirely.
 * Raya guides tone silently. Scholar one tap away.
 * TODO: replace all mock state with sakinahService.getConversation(uid, candidateUid).
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, doc, getDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { SakinahSidebar } from './components/SakinahSidebar';
import { useConversation } from '../hooks';
import { sendMessage, inviteWali, fileSafetyReport, signalReady, getPendingWaliRequest, approveWaliRequest, searchWaliUser, sendWaliRequest } from '../services/sakinahService';
import { db, auth } from '@/config/firebase.config';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

const TOPICS = [
  'Parents & Family',
  'Work',
  'Friends',
  'Habits',
  'Self-image',
  'Responsibility',
  'Expectations',
  'Finances',
] as const;

// Raya's in-curriculum prompt per topic — name is injected at render time.
function getRayaPrompt(idx: number, name: string): string {
  const prompts: Record<number, string> = {
    0: `Family shapes everything we become. Ask ${name} something you genuinely want to know — what home felt like growing up, or what they hope to carry forward.`,
    1: `Work reveals what we value. Ask ${name} how they think about purpose, rhythm, and what a shared life would feel like around it.`,
    2: `The people closest to us reflect who we are. Ask ${name} about someone in their life who shaped them — and how.`,
    3: `Habits are the quiet architecture of a home. Ask ${name} about one they're still working on, and one they're proud of.`,
    4: `Ask ${name} when they feel most at peace with themselves. That answer will tell you a great deal.`,
    5: `Ask ${name} what security means to them — in a home, in a partnership, and in a quiet moment alone.`,
    6: `Ask ${name} what they believe a good marriage asks of each person. Listen carefully.`,
    7: `Ask ${name} how they think about money in a shared life — not the numbers, but what it means to them.`,
  };
  return prompts[idx] ?? prompts[0];
}

function getRayaOpeningText(name: string): string {
  return `A gentle way to begin — ask ${name} what home felt like growing up. What made it feel safe, or what they'd want to do differently.`;
}

// The actual message text placed in the input when "Use this opening" is tapped.
const RAYA_OPENING_MESSAGE =
  "What did home feel like for you growing up? What made it feel safe — or is there anything you'd want to do differently?";

type Msg = { from: 'me' | 'her' | 'raya'; text: string; createdAt?: string; msgType?: string; topicName?: string };

type ToneScenario = { triggers: string[]; responses: [string, string, string] };

const TONE_SCENARIOS: ToneScenario[] = [
  // A — Accusatory / Blaming
  {
    triggers: [
      "you never", "you always", "you don't", "you dont", "you won't",
      "you wont", "you refuse", "you never listen", "you ignore",
      "you don't care", "you dont care", "you only think about",
      "you never think about", "you make me feel", "its always you",
      "it's always you", "typical of you", "you're so selfish",
      "you are so selfish", "you're so rude", "you are so rude",
      "you just dont", "you just don't", "why do you always",
      "why do you never", "you never understand", "you misunderstand",
      "you twist my words", "you blame me", "its your fault",
      "it's your fault", "you caused this", "because of you",
      "you ruined", "you destroyed", "you broke my trust",
      "you hurt me", "you lied", "you deceived", "you manipulated",
      "you gaslight", "you guilt trip", "why cant you",
      "why can't you", "you never appreciate", "you take me for granted",
      "you dismiss", "you belittle", "you embarrass me",
      "you humiliate", "you disrespect", "you don't respect",
      "you dont respect", "you look down on me", "you talk down to me",
      "you make everything about you", "you never compromise",
      "you never apologise", "you never apologize", "you expect too much",
      "you're impossible", "you are impossible", "you're unreasonable",
      "you are unreasonable", "you never change", "you're the problem",
      "you are the problem", "everything is your fault",
      "you started this", "you provoked me", "you pushed me",
      "you tested me", "you drove me to this", "you make me crazy",
      "you make me mad", "you make me angry", "you infuriate me",
      "you frustrate me", "you disappoint me", "you let me down",
      "you failed me", "you betrayed me", "you abandoned me",
      "you left me", "you chose them over me", "you don't prioritise me",
      "you dont prioritise me", "you don't value me", "you dont value me",
      "you don't love me", "you dont love me", "you never loved me",
      "you only care about yourself", "you're selfish", "you are selfish",
      "you're heartless", "you are heartless", "you're cold",
      "you are cold", "you don't feel anything", "you dont feel anything",
    ],
    responses: [
      "It sounds like something important is on your heart 🤍 Sometimes 'I feel...' can open a door that 'You never...' might close. Raya is here with you.",
      "Behind every accusation is usually a need that hasn't been heard yet 🌿 What is it that you're really longing for in this moment?",
      "The heart speaks loudest when it's hurting 🤍 Try sharing how you feel rather than what they did — it's a gentler path to being understood.",
    ],
  },
  // B — Frustrated / Commanding / Shutting Down
  {
    triggers: [
      "stop talking", "stop it", "just stop", "stop messaging",
      "stop texting", "i'm done", "im done", "i am done",
      "forget this", "forget everything", "leave me alone",
      "back off", "drop it", "drop the subject", "change the subject",
      "i give up", "i've given up", "ive given up", "this is pointless",
      "this is useless", "this is going nowhere", "there's no point",
      "there is no point", "what's the point", "whats the point",
      "you're wasting my time", "you are wasting my time",
      "waste of time", "i cant do this", "i can't do this",
      "this is too much", "i dont want to talk", "i don't want to talk",
      "i need space", "give me space", "leave it", "just leave",
      "go away", "i hate this", "this is exhausting", "you're exhausting",
      "you exhaust me", "fed up", "i'm fed up", "im fed up",
      "sick of this", "sick of you", "tired of this", "tired of you",
      "i can't anymore", "i cant anymore", "not doing this",
      "done with this", "done talking", "i'm leaving", "im leaving",
      "i am leaving", "ending this", "shutting down", "closing this",
      "i need to go", "i'm out", "im out", "i am out",
      "stepping away", "taking a break", "need a break",
      "can't handle this", "cant handle this", "too overwhelming",
      "this overwhelms me", "my head hurts", "i can't think",
      "i cant think", "i need to breathe", "let me breathe",
      "i need to calm down", "i need to cool down", "i'm too angry",
      "im too angry", "i am too angry", "speaking when angry",
      "shouldn't speak right now", "not in the right headspace",
      "not in the mood", "i'm not ready", "im not ready",
    ],
    responses: [
      "It's okay to need a moment 🌿 There's no rush here — breathe, rest, and come back when your heart feels ready. Raya will be here.",
      "Sometimes a conversation needs a gentle pause 🤍 Step away, drink some water, take a breath. What you're feeling is valid — and this space will still be here when you return.",
      "Feeling overwhelmed is human 🌿 You don't have to have all the answers right now. Rest, reflect, and return when you're ready — with no pressure at all.",
    ],
  },
  // C — Dismissive / Detached / Emotionally Withdrawing
  {
    triggers: [
      "whatever", "i don't care", "i dont care", "doesn't matter",
      "doesnt matter", "never mind", "nevermind", "forget it",
      "it's fine", "its fine", "i'm fine", "im fine", "i am fine",
      "sure whatever", "yeah yeah", "okay okay", "if you say so",
      "as you wish", "do what you want", "think what you want",
      "believe what you want", "suit yourself", "your loss",
      "not my problem", "not my issue", "not interested",
      "i don't care anymore", "i dont care anymore", "who cares",
      "so what", "big deal", "not a big deal", "doesn't matter anyway",
      "doesnt matter anyway", "nothing matters",
      "meaningless", "irrelevant", "unimportant", "i stopped caring",
      "gave up caring", "lost interest", "not worth it",
      "don't bother", "dont bother", "save it", "spare me",
      "i'm not listening", "im not listening", "not listening",
      "going in one ear", "in one ear out the other",
      "i've heard it all before", "ive heard it all before",
      "same old story", "here we go again", "not this again",
      "same thing again", "broken record", "you always say this",
      "nothing new", "nothing changes", "why bother", "no point",
      "forget about it", "just move on",
      "drop it already", "let it drop", "i'm over it", "im over it",
      "i am over it", "past caring", "beyond caring", "couldn't care less",
      "could care less", "indifferent", "detached",
      "emotionally unavailable", "i feel nothing", "numb",
      "i've shut down", "ive shut down", "closed off", "walled off",
      "don't want to feel", "dont want to feel", "stop feeling",
      "feelings are pointless", "emotions are pointless",
    ],
    responses: [
      "Sometimes the things we brush aside matter most 🤍 Raya noticed — there's no rush, but your feelings deserve to be heard too.",
      "It's okay if words feel hard right now 🌿 Even sitting in silence together is a kind of closeness. You don't have to pretend everything is fine.",
      "Pulling away is sometimes how we protect ourselves 🤍 But you don't have to protect yourself here. This is a safe, gentle space.",
    ],
  },
  // D — Hurtful / Insulting / Personal Attacks
  {
    triggers: [
      "idiot", "stupid", "dumb", "fool", "foolish", "moron", "loser",
      "pathetic", "disgusting", "gross", "ugly", "worthless",
      "useless", "hopeless", "clueless", "brainless", "mindless",
      "childish", "immature", "grow up", "act your age",
      "you're a child", "you are a child", "such a baby", "crybaby",
      "drama queen", "drama king", "so dramatic", "overreacting",
      "you're crazy", "you are crazy", "you're insane", "you are insane",
      "you're mad", "you are mad", "psycho", "unhinged",
      "unstable", "toxic", "poison", "you're toxic", "you are toxic",
      "you're poisonous", "narcissist", "manipulator", "liar", "cheat",
      "cheater", "fraud", "fake", "phony", "hypocrite", "two-faced",
      "backstabber", "traitor", "coward", "spineless",
      "heartless", "soulless", "cold-hearted", "stone cold",
      "you have no heart", "you don't have a heart",
      "you dont have a heart", "monster", "evil", "wicked",
      "selfish pig", "self-centred", "self-centered", "narcissistic",
      "arrogant", "conceited", "full of yourself", "think you're better",
      "think you are better", "high and mighty", "holier than thou",
      "self-righteous", "judgemental", "judgmental", "always judging",
      "condescending", "patronising", "patronizing", "talking down",
      "treating me like a child", "treating me like an idiot",
    ],
    responses: [
      "Words carry weight long after they're sent 🌿 Raya gently invites you to pause before continuing — what you say here becomes part of this story.",
      "Even in hard moments, kindness is always a choice 🤍 Take a breath — you can express how you feel without it becoming something you might regret.",
      "This conversation matters — and so do both of you 🌿 Raya asks that you speak to each other the way you would want to be spoken to.",
    ],
  },
  // E — Threatening / Ultimatum Language
  {
    triggers: [
      "or else", "last warning", "final warning", "last chance",
      "final chance", "this is your last", "don't make me",
      "you'll regret", "you will regret", "i'm warning you",
      "im warning you", "i am warning you", "watch yourself",
      "you better", "you'd better", "you had better",
      "don't push me", "dont push me", "don't test me", "dont test me",
      "don't try me", "dont try me", "you're pushing my buttons",
      "you are pushing my buttons", "you're testing my patience",
      "you are testing my patience", "my patience is running out",
      "i'm losing my patience", "im losing my patience",
      "i am losing my patience",
      "if you don't", "if you dont", "if you won't", "if you wont",
      "if you refuse", "then we're done", "then we are done",
      "then it's over", "then it is over", "i'll end this", "ill end this",
      "i will end this", "i'll leave", "ill leave", "i will leave",
      "don't say i didn't warn you", "dont say i didnt warn you",
      "you'll face consequences", "actions have consequences",
      "you'll see", "youll see", "mark my words",
      "remember this moment", "you'll remember this", "youll remember this",
    ],
    responses: [
      "Ultimatums can close doors that were meant to stay open 🌿 Raya gently asks — what are you really hoping for in this moment?",
      "When we're hurting, we sometimes reach for control 🤍 But this space is about understanding, not pressure. What do you truly need right now?",
      "Pressure rarely brings the connection we're seeking 🌿 Take a gentle breath — there's a softer way to say what's in your heart.",
    ],
  },
];

const SCENARIO_IDS = ['accusatory', 'frustrated', 'dismissive', 'hurtful', 'threatening'] as const;
type ScenarioId = typeof SCENARIO_IDS[number];

function detectTone(text: string, recentMessages?: Msg[]): { response: string; scenarioId: ScenarioId } | null {
  const lower = text.toLowerCase();
  const pick  = (s: ToneScenario) => s.responses[Math.floor(Math.random() * 3)];

  // ── Priority 1: E — Threatening ───────────────────────────────────────────
  const E = TONE_SCENARIOS[4];
  if (E.triggers.some(t => lower.includes(t)))
    return { response: pick(E), scenarioId: 'threatening' };

  // ── Priority 2: D — Insulting/Hurtful ─────────────────────────────────────
  const D = TONE_SCENARIOS[3];

  // Layer 5 — Religious/cultural insults (special Raya response)
  const RELIGIOUS_INSULTS = [
    "kafir", "munafiq", "shaitan", "devil", "evil person",
    "going to hell", "hellfire", "cursed", "damned",
    "allah will punish", "god will punish", "you will suffer",
    "you deserve punishment", "bad muslim", "not a real muslim",
    "fake muslim", "you don't deserve", "unworthy",
  ];
  if (RELIGIOUS_INSULTS.some(w => lower.includes(w)))
    return {
      response: "Our faith calls us to speak with dignity and kindness, even in our most difficult moments 🤍 Raya gently asks you to find words that reflect the best of who you are.",
      scenarioId: 'hurtful',
    };

  // Layer 1 — Question attacks
  const QUESTION_ATTACKS = [
    "how dare", "who do you think", "what is wrong with you",
    "whats wrong with you", "are you serious", "are you kidding",
    "are you joking", "do you even", "do you have any idea",
    "have you lost", "have you gone", "did you really",
    "why would you", "why did you", "how could you",
    "how can you", "what were you thinking", "what are you thinking",
    "what do you think you", "who gave you", "what gives you",
  ];
  if (QUESTION_ATTACKS.some(q => lower.includes(q)))
    return { response: pick(D), scenarioId: 'hurtful' };

  // Layer 2 — Intensity words combined with "you"
  const INTENSITY_WORDS = [
    "stupid", "dumb", "idiot", "fool", "moron", "loser",
    "pathetic", "disgusting", "horrible", "terrible",
    "awful", "useless", "worthless", "hopeless", "clueless",
    "nuts", "mad", "crazy", "insane", "psycho", "mental",
    "ridiculous", "absurd", "unbelievable", "unacceptable",
    "disgraceful", "shameful", "embarrassing", "selfish",
    "heartless", "cruel", "mean", "nasty",
    "rude", "disrespectful", "arrogant", "immature",
    "childish", "toxic", "manipulative", "controlling",
    "impossible", "unbearable", "insufferable", "intolerable",
  ];
  if (lower.includes("you") && INTENSITY_WORDS.some(w => lower.includes(w)))
    return { response: pick(D), scenarioId: 'hurtful' };

  // Layer 3 — Standalone harsh words (intercept regardless of sentence structure)
  const STANDALONE_HARSH = [
    "idiot", "stupid", "dumb", "moron", "loser", "pathetic",
    "disgusting", "worthless", "useless", "hopeless",
    "psycho", "lunatic", "nutcase", "freak", "creep",
    "jerk", "coward", "liar", "cheat", "fraud", "fake",
    "hypocrite", "narcissist", "manipulator", "abuser",
    "shameless", "disgraceful", "despicable", "vile",
    "wicked", "evil", "monster", "horrible person",
    "terrible person", "bad person", "worst person",
  ];
  if (STANDALONE_HARSH.some(w => lower.includes(w)))
    return { response: pick(D), scenarioId: 'hurtful' };

  // Existing Scenario D triggers
  if (D.triggers.some(t => lower.includes(t)))
    return { response: pick(D), scenarioId: 'hurtful' };

  // ── Priority 3: A — Accusatory ────────────────────────────────────────────
  const A = TONE_SCENARIOS[0];
  if (A.triggers.some(t => lower.includes(t)))
    return { response: pick(A), scenarioId: 'accusatory' };

  // ── Priority 4: B — Frustrated ────────────────────────────────────────────
  const B = TONE_SCENARIOS[1];
  if (B.triggers.some(t => lower.includes(t)))
    return { response: pick(B), scenarioId: 'frustrated' };

  // ── Priority 5: C — Dismissive ────────────────────────────────────────────
  const C = TONE_SCENARIOS[2];

  // Layer 4 — Short responses that turn sarcastic/dismissive in a tense conversation
  const SHORT_SARCASTIC = [
    "whatever", "fine", "ok", "okay", "sure", "yeah yeah",
    "if you say so", "as you wish", "great", "fantastic",
    "wonderful", "perfect",
  ];
  const isShortMessage = text.trim().split(/\s+/).length < 6;
  if (isShortMessage && SHORT_SARCASTIC.some(w => lower.includes(w))) {
    const hasNegativeContext = recentMessages?.slice(-5).some(m =>
      m.from !== 'raya' && (
        A.triggers.some(t => m.text.toLowerCase().includes(t)) ||
        B.triggers.some(t => m.text.toLowerCase().includes(t)) ||
        D.triggers.some(t => m.text.toLowerCase().includes(t))
      )
    );
    if (hasNegativeContext)
      return { response: pick(C), scenarioId: 'dismissive' };
  }

  // Existing Scenario C triggers
  if (C.triggers.some(t => lower.includes(t)))
    return { response: pick(C), scenarioId: 'dismissive' };

  return null;
}

function getRephrasedMessage(original: string, scenarioId: ScenarioId): string {
  const t = original.toLowerCase();
  switch (scenarioId) {
    case 'accusatory':
      if (t.includes('understand'))
        return "I sometimes feel like I'm not being fully heard, and that's hard for me 🤍";
      if (t.includes('listen'))
        return "I long to feel truly listened to — it matters deeply to me 🤍";
      if (t.includes('care'))
        return "I've been feeling unseen lately, and I just need to know that I matter to you 🤍";
      if (t.includes('always') || t.includes('never'))
        return "I notice a pattern that's been weighing on me, and I'd love for us to talk about it gently 🌿";
      if (t.includes('fault') || t.includes('caused') || t.includes('ruined'))
        return "I'm hurting right now and I need us to understand each other, not assign blame 🤍";
      if (t.includes('lied') || t.includes('deceived') || t.includes('manipulated'))
        return "Something happened that shook my trust, and I'd really like to talk about it honestly and calmly 🌿";
      return "I have something important on my heart — can we talk about it with gentleness? 🤍";

    case 'frustrated':
      if (t.includes('stop'))
        return "I need a little space right now to gather my thoughts — can we pause and return to this gently? 🌿";
      if (t.includes('give up') || t.includes('pointless') || t.includes('useless'))
        return "I'm feeling overwhelmed right now. I haven't given up on this — I just need a moment to breathe 🤍";
      if (t.includes('done') || t.includes('finished') || t.includes('over'))
        return "I need a short break to calm my heart. This conversation matters to me — can we return to it when we're both at peace? 🌿";
      if (t.includes('space') || t.includes('alone'))
        return "I need a little time to myself right now. It's not about distance — it's about coming back to you with a clearer heart 🤍";
      return "I'm finding this moment difficult. Can we take a gentle pause and return to this together? 🌿";

    case 'dismissive':
      if (t.includes('whatever'))
        return "I think I'm finding it hard to engage right now — can I have a moment? 🤍";
      if (t.includes("don't care") || t.includes('dont care'))
        return "Maybe I'm more affected by this than I'm letting on. Give me a little time 🌿";
      if (t.includes("doesn't matter") || t.includes('doesnt matter'))
        return "It does matter — I'm just struggling to find the words for why right now 🤍";
      if (t.includes('fine') || t.includes('okay'))
        return "I'm still processing how I feel — I'll share more when I find the right words 🌿";
      return "I'm quieter than usual right now, but I'm still here with you 🤍";

    case 'hurtful':
      if (t.includes('immature') || t.includes('childish') || t.includes('grow up'))
        return "I feel hurt when our conversations go in this direction — can we find a calmer way to talk about this? 🌿";
      if (t.includes('selfish') || t.includes('self-centred') || t.includes('self-centered'))
        return "I've been feeling like my needs aren't being considered, and that's been painful for me 🤍";
      if (t.includes('stupid') || t.includes('idiot') || t.includes('dumb') || t.includes('fool'))
        return "I'm frustrated right now, but I don't want frustration to lead my words — can we slow down together? 🌿";
      if (t.includes('toxic') || t.includes('crazy') || t.includes('insane'))
        return "Something between us feels broken right now and I want to fix it, not worsen it 🤍";
      return "I'm feeling hurt and I want to express that without causing more hurt — can we try again gently? 🌿";

    case 'threatening':
      if (t.includes('warning') || t.includes('last chance'))
        return "I'm feeling unheard and I'm scared about where this is heading — can we slow down and talk about what's really going on? 🌿";
      if (t.includes('regret') || t.includes('remember this'))
        return "I'm hurting right now and I want us to find a better way through this together 🤍";
      if (t.includes('leave') || t.includes('done') || t.includes('over'))
        return "Something in me is scared right now. Before anything else — can we just talk, calmly and honestly? 🌿";
      return "I'm carrying a lot right now. What I really need is to feel heard, not to push you away 🤍";
  }
}

type TopicState = 'open' | 'now' | 'locked';

// ── Small reusable Raya orb ───────────────────────────────────────────────────
function RayaOrb({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: size * 0.47,
        color: '#3a2c0c',
        flexShrink: 0,
      }}
    >
      ر
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ConversationPage() {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const { conversation } = useConversation(matchId ?? '');
  const matchName = conversation?.match_name ?? 'Your match';

  const [userRole, setUserRole]                   = useState<string | null>(null);
  const [waliPresent, setWaliPresent]             = useState(false);
  const [waliName, setWaliName]                   = useState('');
  const [waliConfirmation, setWaliConfirmation]   = useState(false);
  const [pendingWaliReq, setPendingWaliReq]       = useState<{ request_id: string; wali_name: string } | null>(null);
  const [waliReqDismissed, setWaliReqDismissed]   = useState(false);
  const [waliReqApproved, setWaliReqApproved]     = useState(false);
  const [waliSearchOpen, setWaliSearchOpen]       = useState(false);
  const [waliSearchQuery, setWaliSearchQuery]     = useState('');
  const [waliSearchResults, setWaliSearchResults] = useState<Array<{ wali_uid: string; wali_name: string }>>([]);
  const [waliSearching, setWaliSearching]         = useState(false);
  const [waliInviteSent, setWaliInviteSent]       = useState(false);
  const [waliInviting, setWaliInviting]           = useState(false);
  const [waliSuccessMsg, setWaliSuccessMsg]       = useState('');
  const [nudgeDismissed, setNudgeDismissed]       = useState(false);
  const [rayaCardDismissed, setRayaCardDismissed] = useState(false);
  const [messageInput, setMessageInput]           = useState('');
  const [rayaIntervention, setRayaIntervention]   = useState<string | null>(null);
  const [rephraseText, setRephraseText]           = useState<string | null>(null);
  const [messages, setMessages]                   = useState<Msg[]>([]);
  const [reportOpen, setReportOpen]               = useState(false);
  const [reportReason, setReportReason]           = useState('Inappropriate behaviour');
  const [reportSubmitted, setReportSubmitted]     = useState(false);
  const [myReady, setMyReady]                     = useState(false);
  const [partnerReady, setPartnerReady]           = useState(false);
  const [liveMatchflowStep, setLiveMatchflowStep] = useState<number | null>(null);
  const [readySending, setReadySending]           = useState(false);
  const [closingStep, setClosingStep]             = useState<0 | 1 | 2 | 3>(0);

  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const messagesEnd    = useRef<HTMLDivElement>(null);
  const waliSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toneGraceRef        = useRef(false);
  const pendingSendRef      = useRef('');
  const pendingScenarioRef  = useRef<ScenarioId>('accusatory');

  // Fetch current user's role from Firestore on mount.
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserRole(data.role || data.sakinah_role || null);
      }
    }).catch(console.error);
  }, []);

  // Real-time message listener.
  // orderBy requires the composite index on (match_id, created_at) which is in
  // firestore.indexes.json. If that index hasn't been deployed the query throws
  // FAILED_PRECONDITION. We sort client-side as a fallback so messages are
  // always visible even if the index is temporarily unavailable.
  useEffect(() => {
    if (!matchId) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const toMsg = (docData: Record<string, unknown>, ts: Timestamp | null): Msg => {
      const fromUid = docData.from_uid as string;
      return {
        from: (fromUid === uid ? 'me' : fromUid === 'raya' ? 'raya' : 'her') as Msg['from'],
        text: docData.text as string,
        createdAt: ts?.toDate?.()?.toISOString(),
        msgType: docData.message_type as string | undefined,
        topicName: docData.topic_name as string | undefined,
      };
    };

    const q = query(
      collection(db, 'sakinah_messages'),
      where('match_id', '==', matchId),
      orderBy('created_at', 'asc')
    );

    // Keep a ref to the fallback listener so we can unsubscribe it on cleanup.
    let fallbackUnsub: (() => void) | null = null;

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => {
            const data = doc.data();
            return toMsg(data, data.created_at as Timestamp | null);
          })
        );
      },
      (err) => {
        // Composite index missing or permission denied — fall back to sorting
        // without orderBy. Remove the failed listener and re-subscribe.
        console.error('[Sakinah] messages onSnapshot error:', err.code, err.message);
        const fallbackQ = query(
          collection(db, 'sakinah_messages'),
          where('match_id', '==', matchId)
        );
        fallbackUnsub = onSnapshot(fallbackQ, (snapshot) => {
          const sorted = [...snapshot.docs].sort((a, b) => {
            const aTs = (a.data().created_at as Timestamp | null)?.toMillis() ?? 0;
            const bTs = (b.data().created_at as Timestamp | null)?.toMillis() ?? 0;
            return aTs - bTs;
          });
          setMessages(sorted.map((doc) => {
            const data = doc.data();
            return toMsg(data, data.created_at as Timestamp | null);
          }));
        }, (fallbackErr) => {
          console.error('[Sakinah] fallback messages onSnapshot error:', fallbackErr.code, fallbackErr.message);
        });
      }
    );

    return () => { unsub(); fallbackUnsub?.(); };
  }, [matchId]);

  // Match doc listener — tracks ready states and live matchflow step.
  useEffect(() => {
    if (!matchId) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'sakinah_matches', matchId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const iAmA = data.user_a_uid === uid;
      setMyReady(iAmA ? !!data.user_a_ready_next : !!data.user_b_ready_next);
      setPartnerReady(iAmA ? !!data.user_b_ready_next : !!data.user_a_ready_next);
      const unlocked: string[] = data.unlocked_topics ?? [];
      const activeTopic = unlocked.length > 0 ? unlocked[unlocked.length - 1] : TOPICS[0];
      const stepIdx = TOPICS.indexOf(activeTopic as typeof TOPICS[number]);
      setLiveMatchflowStep(stepIdx >= 0 ? stepIdx : 0);
      if (data.wali_uid) {
        setWaliPresent(true);
        setWaliName(data.wali_name || 'Your Wali');
      }
    });
    return () => unsub();
  }, [matchId]);

  useEffect(() => {
    if (conversation?.wali_present) {
      setWaliPresent(true);
    }
  }, [conversation?.wali_present]);

  useEffect(() => {
    if (!matchId) return;
    getPendingWaliRequest(matchId)
      .then((data: any) => {
        if (data?.request) setPendingWaliReq(data.request);
      })
      .catch((e) => console.error('getPendingWaliRequest failed:', e));
  }, [matchId]);

  // Scroll to bottom whenever messages update or closing step advances.
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, closingStep]);

  // liveMatchflowStep is kept current by the match doc onSnapshot.
  // Fall back to the REST value only on first load before the snapshot fires.
  const activeTopicIdx = liveMatchflowStep ?? conversation?.matchflow_step ?? 0;
  // isLastTopic: topic 8 (Finances) — "ready to go deeper" becomes "complete our journey".
  const isLastTopic = activeTopicIdx >= TOPICS.length - 1;

  // Closing sequence — fires when both users have signalled ready on the final topic.
  // Both Raya messages and the "Enter The Decision" button appear with timed delays.
  useEffect(() => {
    if (!isLastTopic || !myReady || !partnerReady || closingStep > 0) return;
    setClosingStep(1);
    const t1 = setTimeout(() => setClosingStep(2), 3000);
    const t2 = setTimeout(() => setClosingStep(3), 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isLastTopic, myReady, partnerReady, closingStep]);

  // Auto-grow textarea up to 120px.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [messageInput]);

  const handleSend = async () => {
    const text = messageInput.trim();
    if (!text) return;

    setMessageInput('');

    // Pre-send tone check
    if (!toneGraceRef.current) {
      const result = detectTone(text, messages);
      if (result) {
        pendingSendRef.current = text;
        setRayaIntervention(result.response);
        pendingScenarioRef.current = result.scenarioId;
        toneGraceRef.current = true;
        return;
      }
    } else {
      toneGraceRef.current = false;
    }

    // Only reaches here if no tone match
    if (matchId) {
      await sendMessage(matchId, text);
    }
  };

  const searchWali = async (name: string) => {
    if (name.length < 2) { setWaliSearchResults([]); return; }
    setWaliSearching(true);
    try {
      const res: any = await searchWaliUser(name);
      setWaliSearchResults(res.walis || []);
    } catch (e) {
      console.error('wali search failed:', e);
    } finally {
      setWaliSearching(false);
    }
  };

  const sendWaliInvite = async (waliUid: string) => {
    setWaliInviting(true);
    try {
      await sendWaliRequest(waliUid);
      setWaliInviteSent(true);
      setWaliSearchOpen(false);
      setWaliSearchQuery('');
      setWaliSearchResults([]);
      setWaliSuccessMsg('Your invitation has been sent. They will see it when they log in.');
      setTimeout(() => setWaliSuccessMsg(''), 4000);
    } catch (e) {
      console.error('wali invite failed:', e);
    } finally {
      setWaliInviting(false);
    }
  };

  // Separate human messages from Raya system messages for all logic below.
  const humanMessages = messages.filter(m => m.from === 'me' || m.from === 'her');
  const hasMe  = humanMessages.some(m => m.from === 'me');
  const hasHer = humanMessages.some(m => m.from === 'her');
  const lastHumanMsg = humanMessages.length > 0 ? humanMessages[humanMessages.length - 1] : null;

  // Opening card: only before either person has written anything.
  const showRayaCard = !rayaCardDismissed && messageInput === '' && humanMessages.length === 0;

  // Topic prompt card: visible only when there's someone who still needs to start speaking.
  // Hides once both have exchanged at least one message, and hides if user already sent last.
  const showTopicPromptCard = !(hasMe && hasHer) && lastHumanMsg?.from !== 'me';


  // 24h nudge: last human message must be from the other person and >24h old.
  const showNudge =
    !nudgeDismissed &&
    lastHumanMsg?.from === 'her' &&
    !!lastHumanMsg.createdAt &&
    Date.now() - new Date(lastHumanMsg.createdAt).getTime() >= 24 * 60 * 60 * 1000;

  // Topic completion — "ready to go deeper" button.
  //
  // Each topic announcement is tagged with the topic name it introduces.
  // We look for the announcement that matches the CURRENT topic so we're never
  // fooled by an older announcement from a previous topic (which caused the
  // button to appear immediately after unlock due to a race condition between
  // the match-doc update and the message arriving via onSnapshot).
  //
  // For topic 0 (Parents & Family) there is no announcement, so we count all
  // human messages. For every later topic we wait until we see the matching
  // announcement before counting anything — this is the race-condition guard.
  const currentTopicName = TOPICS[activeTopicIdx];
  let lastCurrentTopicAnnouncementIdx = messages.reduce(
    (last, m, i) =>
      m.from === 'raya' &&
      m.msgType === 'topic_announcement' &&
      m.topicName === currentTopicName
        ? i
        : last,
    -1
  );
  // Fallback for legacy Raya announcements written before the topic_name field
  // was added — if no topic-specific match, use the last topic_announcement.
  if (lastCurrentTopicAnnouncementIdx === -1) {
    lastCurrentTopicAnnouncementIdx = messages.reduce(
      (last, m, i) =>
        m.from === 'raya' && m.msgType === 'topic_announcement' ? i : last,
      -1
    );
  }

  const msgsInTopic = (() => {
    if (activeTopicIdx === 0) {
      // First topic never has an announcement — count all human messages.
      return humanMessages;
    }
    if (lastCurrentTopicAnnouncementIdx === -1) {
      // We haven't received this topic's announcement yet (race condition:
      // match-doc updated before the Raya message arrived). Return empty so
      // the button never fires prematurely.
      return [];
    }
    return messages
      .slice(lastCurrentTopicAnnouncementIdx + 1)
      .filter(m => m.from !== 'raya');
  })();

  const meInTopicCount  = msgsInTopic.filter(m => m.from === 'me').length;
  const herInTopicCount = msgsInTopic.filter(m => m.from === 'her').length;
  // Both users must have each sent at least 3 messages in this topic.
  const enoughExchanged = meInTopicCount >= 3 && herInTopicCount >= 3;
  // Both users must signal on the last topic to enter the closing sequence.
  const journeyComplete = isLastTopic && myReady && partnerReady;
  const showReadyButton = enoughExchanged && !myReady;

  console.log('[ReadyButton]', {
    currentTopicName,
    lastCurrentTopicAnnouncementIdx,
    meInTopicCount,
    herInTopicCount,
    enoughExchanged,
    isLastTopic,
    myReady,
    showReadyButton,
  });

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: PAGE_BG,
        color: '#EDE7DA',
        fontFamily: "'Manrope', sans-serif",
        WebkitFontSmoothing: 'antialiased',
        overflow: 'hidden',
      }}
    >
      <SakinahSidebar activeItem="communication" />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          style={{
            flexShrink: 0,
            padding: '36px 56px 26px',
            borderBottom: '1px solid rgba(255,255,255,.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="sk-back-btn"
              style={{
                width: 34, height: 34, borderRadius: '50%',
                border: '1px solid rgba(212,168,83,.16)',
                background: 'transparent', color: '#D4A853',
                fontSize: 18, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer',
                flexShrink: 0, paddingBottom: 1, lineHeight: 1,
              }}
            >
              ‹
            </button>
            <div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 26, fontWeight: 500, lineHeight: 1.02,
                }}
              >
                Conversation
              </div>
              <div
                style={{
                  fontSize: 11, color: '#5f6675', marginTop: 3,
                  letterSpacing: '0.02em',
                }}
              >
                Phase 6 · with {matchName} · guided by Raya
              </div>
            </div>
            <button
              onClick={() => setReportOpen(true)}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: '#5f6675', cursor: 'pointer', fontSize: 11,
                fontFamily: "'Manrope', sans-serif", letterSpacing: '0.02em',
                padding: '4px 8px', transition: '.2s',
              }}
            >
              Report
            </button>
          </div>
        </div>

        {/* ── Pending Wali Request banner ────────────────────────────────── */}
        {userRole === 'seeker' && <AnimatePresence>
          {pendingWaliReq && !waliReqDismissed && !waliReqApproved && (
            <motion.div
              key="wali-req-banner"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 16, flexWrap: 'wrap',
                padding: '12px 56px',
                background: 'rgba(212,168,83,.05)',
                borderBottom: '1px solid rgba(212,168,83,.14)',
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic', fontSize: 14,
                  color: '#e7c984', lineHeight: 1.45, flex: 1,
                  minWidth: 180,
                }}
              >
                {pendingWaliReq.wali_name} would like to join your journey as your guardian
              </span>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={async () => {
                    try {
                      await approveWaliRequest(pendingWaliReq.request_id);
                      setWaliReqApproved(true);
                      setWaliPresent(true);
                    } catch (e) {
                      console.error('approveWaliRequest failed:', e);
                    }
                  }}
                  style={{
                    padding: '7px 16px', borderRadius: 20,
                    border: '1px solid rgba(212,168,83,.35)',
                    background: 'rgba(212,168,83,.1)',
                    color: '#e7c984', fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', fontFamily: "'Manrope', sans-serif",
                    transition: '.2s',
                  }}
                >
                  Allow
                </button>
                <button
                  onClick={() => setWaliReqDismissed(true)}
                  style={{
                    padding: '7px 16px', borderRadius: 20,
                    border: '1px solid rgba(255,255,255,.08)',
                    background: 'transparent',
                    color: '#9aa0ac', fontSize: 12,
                    cursor: 'pointer', fontFamily: "'Manrope', sans-serif",
                    transition: '.2s',
                  }}
                >
                  Not now
                </button>
              </div>
            </motion.div>
          )}
          {waliReqApproved && (
            <motion.div
              key="wali-approved-confirm"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              style={{
                flexShrink: 0,
                padding: '10px 56px',
                background: 'rgba(212,168,83,.04)',
                borderBottom: '1px solid rgba(212,168,83,.1)',
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic', fontSize: 13.5,
                color: '#e7c984', textAlign: 'center',
              }}
            >
              Your Wali is now present 🤍
            </motion.div>
          )}
        </AnimatePresence>}

        {/* ── Wali presence banner ───────────────────────────────────────── */}
        {waliPresent && (
          <div style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.4)', borderRadius:'10px', padding:'10px 16px', margin:'8px 16px', display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ fontSize:'18px' }}>🛡️</span>
            <div>
              <p style={{ color:'#C9A84C', fontWeight:600, margin:0, fontSize:'13px' }}>{waliName} is now present</p>
              <p style={{ color:'#888', margin:0, fontSize:'12px' }}>Your guardian is supporting this conversation</p>
            </div>
          </div>
        )}

        {/* ── Scrollable body ────────────────────────────────────────────── */}
        <div
          className="sk-page-body"
          style={{ flex: 1, overflowY: 'auto', padding: '20px 56px 12px' }}
        >
          <div style={{ maxWidth: 520, width: '100%' }}>

            {/* ── Wali toggle ──────────────────────────────────────────── */}
            {userRole === 'seeker' && <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.04 }}
              style={{ textAlign: 'center', marginBottom: 18 }}
            >
              <button
                onClick={() => { if (!waliPresent) setWaliSearchOpen(true); }}
                style={{
                  background: 'transparent',
                  border: '1px solid #C9A84C',
                  borderRadius: '999px',
                  color: '#C9A84C',
                  padding: '6px 16px',
                  fontSize: '13px',
                  cursor: waliPresent ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {waliPresent ? '🕌 Wali present' : '🕌 Invite your wali'}
              </button>

              {waliSuccessMsg && (
                <p style={{ color: '#C9A84C', fontSize: '13px', marginTop: '8px', textAlign: 'center' }}>
                  ✓ {waliSuccessMsg}
                </p>
              )}

              {waliSearchOpen && (
                <div style={{
                  background: '#1a1a1a',
                  border: '1px solid #C9A84C',
                  borderRadius: '12px',
                  padding: '16px',
                  marginTop: '8px',
                  width: '100%',
                  maxWidth: '400px',
                }}>
                  <p style={{ color: '#C9A84C', fontSize: '14px', marginBottom: '4px', fontWeight: 600 }}>
                    Find your guardian
                  </p>
                  <p style={{ color: '#888', fontSize: '12px', marginBottom: '12px' }}>
                    Enter their name to invite them
                  </p>
                  <input
                    type="text"
                    placeholder="e.g. Hassan"
                    value={waliSearchQuery}
                    onChange={(e) => {
                      setWaliSearchQuery(e.target.value);
                      if (waliSearchDebounceRef.current) clearTimeout(waliSearchDebounceRef.current);
                      waliSearchDebounceRef.current = setTimeout(() => searchWali(e.target.value), 500);
                    }}
                    style={{
                      width: '100%',
                      background: '#111',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#fff',
                      fontSize: '14px',
                      marginBottom: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                  {waliSearching && (
                    <p style={{ color: '#888', fontSize: '13px' }}>Searching...</p>
                  )}
                  {waliSearchResults.map((result) => (
                    <div key={result.wali_uid} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: '#111',
                      borderRadius: '8px',
                      marginBottom: '8px',
                    }}>
                      <span style={{ color: '#fff', fontSize: '14px' }}>{result.wali_name}</span>
                      <button
                        onClick={() => sendWaliInvite(result.wali_uid)}
                        disabled={waliInviting}
                        style={{
                          background: '#C9A84C',
                          color: '#000',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '13px',
                          cursor: waliInviting ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          opacity: waliInviting ? 0.7 : 1,
                        }}
                      >
                        {waliInviting ? 'Sending...' : 'Invite'}
                      </button>
                    </div>
                  ))}
                  {!waliSearching && waliSearchQuery.length >= 2 && waliSearchResults.length === 0 && (
                    <p style={{ color: '#888', fontSize: '13px' }}>No guardian found with that name</p>
                  )}
                  <button
                    onClick={() => { setWaliSearchOpen(false); setWaliSearchQuery(''); setWaliSearchResults([]); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#888',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginTop: '8px',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>}

            {/* ── Topic curriculum ──────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              style={{
                border: '1px solid rgba(255,255,255,.06)',
                borderRadius: 15, padding: 13, marginBottom: 13,
                background: 'rgba(255,255,255,.012)',
              }}
            >
              <div
                style={{
                  fontSize: 9.5, letterSpacing: '0.24em',
                  textTransform: 'uppercase', color: 'rgba(212,168,83,.5)',
                  marginBottom: 9,
                }}
              >
                Pre-nikah topics · unlock as trust builds
              </div>

              {TOPICS.map((topic, i) => {
                const state: TopicState =
                  i < activeTopicIdx ? 'open' : i === activeTopicIdx ? 'now' : 'locked';
                const icon   = state === 'open' ? '✓' : state === 'now' ? '●' : String(i + 1);
                const status = state === 'open' ? 'Explored' : state === 'now' ? 'Now' : 'Locked';

                return (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: state === 'locked' ? 0.4 : 1, x: 0 }}
                    transition={{ duration: 0.28, delay: 0.20 + i * 0.04 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '7px 0', fontSize: 12.5,
                      color:
                        state === 'open' ? '#EDE7DA'
                        : state === 'now' ? '#e7c984'
                        : '#9aa0ac',
                      cursor: state === 'locked' ? 'default' : 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 19, height: 19, borderRadius: '50%',
                        flexShrink: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 9,
                        border:
                          state === 'now' ? '1px solid #D4A853'
                          : state === 'open' ? '1px solid transparent'
                          : '1px solid rgba(255,255,255,.06)',
                        background:
                          state === 'open' ? 'rgba(127,176,122,.15)' : 'transparent',
                        color:
                          state === 'open' ? '#7FB07A'
                          : state === 'now' ? '#D4A853'
                          : '#5f6675',
                        boxShadow:
                          state === 'now' ? '0 0 0 3px rgba(212,168,83,.12)' : 'none',
                      }}
                    >
                      {icon}
                    </div>
                    <span style={{ flex: 1 }}>{topic}</span>
                    <span
                      style={{
                        fontSize: 9, letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color:
                          state === 'open' ? '#7FB07A'
                          : state === 'now' ? '#D4A853'
                          : '#5f6675',
                      }}
                    >
                      {status}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* ── Raya topic prompt card ────────────────────────────────
                Visible only when this user needs to speak next.
                Hidden once both have exchanged messages.
            ──────────────────────────────────────────────────────────── */}
            <AnimatePresence>
              {showTopicPromptCard && (
                <motion.div
                  key="topic-prompt"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35 }}
                  style={{
                    border: '1px dashed rgba(212,168,83,.28)',
                    borderRadius: 14, padding: '13px 14px',
                    margin: '0 0 13px',
                    background: 'rgba(212,168,83,.025)',
                    display: 'flex', gap: 11, alignItems: 'flex-start',
                  }}
                >
                  <RayaOrb size={30} />
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic', fontSize: 15,
                      lineHeight: 1.48, color: '#EDE7DA',
                      margin: 0, flex: 1, paddingTop: 2,
                    }}
                  >
                    {getRayaPrompt(activeTopicIdx, matchName)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Message bubbles ─────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.36 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}
            >
              {messages.map((msg, i) => {
                if (msg.from === 'raya') {
                  // Hide the ready_nudge that names the current user — they
                  // already know they clicked ready; only the partner should see it.
                  if (msg.msgType === 'ready_nudge') {
                    const myName = auth.currentUser?.displayName ?? '';
                    if (myName && msg.text?.startsWith(myName)) return null;
                  }
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0', gap: 6 }}>
                      <div
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                          padding: '8px 14px', borderRadius: 20,
                          background: 'rgba(212,168,83,.04)',
                          border: '1px solid rgba(212,168,83,.14)',
                          maxWidth: '88%',
                        }}
                      >
                        <RayaOrb size={20} />
                        <span
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontStyle: 'italic', fontSize: 13,
                            color: '#c9a85c', lineHeight: 1.5,
                          }}
                        >
                          {msg.text}
                        </span>
                      </div>
                      <button
                        onClick={() => { /* TODO: open scholar-counsellor support flow */ }}
                        className="sk-scholar-hint"
                        style={{
                          background: 'none', border: 'none', padding: 0,
                          fontFamily: "'Cormorant Garamond', serif",
                          fontStyle: 'italic', fontSize: 11,
                          color: 'rgba(212,168,83,.5)',
                          cursor: 'pointer', letterSpacing: '0.02em',
                        }}
                      >
                        🕌 Need deeper guidance? Speak with a scholar
                      </button>
                    </div>
                  );
                }
                return (
                  <div
                    key={i}
                    style={{
                      maxWidth: '84%',
                      padding: '11px 13px',
                      borderRadius: 15,
                      fontSize: 12.5, lineHeight: 1.55, fontWeight: 300,
                      ...(msg.from === 'me'
                        ? {
                            background: 'rgba(255,255,255,.05)',
                            border: '1px solid rgba(255,255,255,.06)',
                            borderBottomRightRadius: 5, marginLeft: 'auto',
                          }
                        : {
                            background: 'rgba(201,138,138,.06)',
                            border: '1px solid rgba(201,138,138,.18)',
                            borderBottomLeftRadius: 5, marginRight: 'auto',
                          }),
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9, letterSpacing: '0.2em',
                        textTransform: 'uppercase', color: 'rgba(212,168,83,.5)',
                        marginBottom: 4, display: 'block',
                      }}
                    >
                      {msg.from === 'me' ? 'You' : matchName}
                    </span>
                    {msg.text}
                  </div>
                );
              })}
            </motion.div>

            {/* Closing sequence — appears when both users complete the journey */}
            <AnimatePresence>
              {closingStep >= 1 && (
                <motion.div
                  key="closing-msg-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}
                >
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 20,
                    background: 'rgba(212,168,83,.05)',
                    border: '1px solid rgba(212,168,83,.18)',
                    maxWidth: '88%',
                  }}>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic', fontSize: 13,
                      color: '#c9a85c', lineHeight: 1.6, textAlign: 'center',
                    }}>
                      You have walked through eight sacred spaces together — family, work, friendship, habit, self, responsibility, hope, and provision. That is not a small thing. 🤍
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {closingStep >= 2 && (
                <motion.div
                  key="closing-msg-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}
                >
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 20,
                    background: 'rgba(212,168,83,.05)',
                    border: '1px solid rgba(212,168,83,.18)',
                    maxWidth: '88%',
                  }}>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic', fontSize: 13,
                      color: '#c9a85c', lineHeight: 1.6, textAlign: 'center',
                    }}>
                      The next step belongs to you alone. Raya will not decide for you — only carry you gently to the threshold. 🕊️
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {closingStep >= 3 && (
                <motion.div
                  key="enter-decision-btn"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 8px' }}
                >
                  <button
                    onClick={() => navigate(`/sakinah/decision/${matchId}`)}
                    className="sk-enter-decision-btn"
                    style={{
                      padding: '12px 28px',
                      borderRadius: 14,
                      border: '1px solid rgba(212,168,83,.35)',
                      background: 'rgba(212,168,83,.06)',
                      color: '#e7c984',
                      fontSize: 14,
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic',
                      letterSpacing: '0.02em',
                      cursor: 'pointer',
                      transition: '.25s',
                    }}
                  >
                    Enter The Decision 🤍
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll anchor */}
            <div ref={messagesEnd} />
          </div>
        </div>

        {/* ── Footer: Raya card + input + tone mod + scholar link ────────── */}
        <div
          style={{
            flexShrink: 0,
            borderTop: '1px solid rgba(255,255,255,.05)',
            padding: '10px 56px 14px',
          }}
        >
          <div style={{ maxWidth: 520, width: '100%' }}>

            {/* Raya opening suggestion card — floats above input, dismissable */}
            <AnimatePresence>
              {showRayaCard && (
                <motion.div
                  key="raya-card"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    background: 'rgba(212,168,83,.03)',
                    border: '1px solid rgba(212,168,83,.18)',
                    borderRadius: 14, padding: '11px 13px',
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex', gap: 10,
                      alignItems: 'flex-start', marginBottom: 9,
                    }}
                  >
                    <RayaOrb size={24} />
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: 'italic', fontSize: 13.5,
                        lineHeight: 1.48, color: '#EDE7DA',
                        margin: 0, flex: 1,
                      }}
                    >
                      {getRayaOpeningText(matchName)}
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'flex', gap: 7,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      onClick={() => {
                        setMessageInput(RAYA_OPENING_MESSAGE);
                        setRayaCardDismissed(true);
                        textareaRef.current?.focus();
                      }}
                      className="sk-btn-ghost"
                      style={{
                        padding: '5px 12px', borderRadius: 20,
                        fontSize: 11, fontWeight: 500,
                        background: 'rgba(212,168,83,.1)',
                        border: '1px solid rgba(212,168,83,.22)',
                        color: '#e7c984', cursor: 'pointer',
                        fontFamily: "'Manrope', sans-serif",
                      }}
                    >
                      Use this opening
                    </button>
                    <button
                      onClick={() => setRayaCardDismissed(true)}
                      className="sk-btn-ghost"
                      style={{
                        padding: '5px 12px', borderRadius: 20,
                        fontSize: 11, fontWeight: 400,
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,.07)',
                        color: '#9aa0ac', cursor: 'pointer',
                        fontFamily: "'Manrope', sans-serif",
                      }}
                    >
                      I'll write my own
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Topic completion — ready to go deeper / complete our journey */}
            <AnimatePresence>
              {(showReadyButton || (myReady && !journeyComplete)) && (
                <motion.div
                  key="ready-next"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.25 }}
                  style={{ marginBottom: 8 }}
                >
                  {myReady ? (
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        padding: '9px 14px', borderRadius: 12,
                        background: 'rgba(212,168,83,.04)',
                        border: '1px solid rgba(212,168,83,.14)',
                      }}
                    >
                      <RayaOrb size={18} />
                      <span style={{ fontSize: 11, color: '#c9a85c', fontWeight: 300, lineHeight: 1.55 }}>
                        {isLastTopic
                          ? `Waiting for ${matchName} — whenever they're ready 🤍`
                          : `Waiting for ${matchName} to feel ready too 🤍`
                        }
                      </span>
                    </div>
                  ) : (
                    <button
                      disabled={readySending}
                      onClick={async () => {
                        if (!matchId || readySending) return;
                        setReadySending(true);
                        try {
                          await signalReady(matchId);
                        } finally {
                          setReadySending(false);
                        }
                      }}
                      style={{
                        width: '100%', padding: '9px 14px',
                        borderRadius: 12, cursor: 'pointer',
                        background: 'rgba(212,168,83,.04)',
                        border: '1px solid rgba(212,168,83,.22)',
                        color: '#e7c984', fontSize: 11.5,
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: 'italic', lineHeight: 1.5,
                        transition: '.2s', textAlign: 'center',
                        opacity: readySending ? 0.6 : 1,
                      }}
                    >
                      {isLastTopic
                        ? 'Complete our journey together 🤍'
                        : "We've explored this together — ready to go deeper? 🤍"
                      }
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 24h nudge — only when last message from her is >24h old */}
            <AnimatePresence>
              {showNudge && (
                <motion.div
                  key="nudge"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', marginBottom: 8,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,.025)',
                    border: '1px solid rgba(255,255,255,.06)',
                  }}
                >
                  <span style={{ fontSize: 11, color: '#9aa0ac', fontWeight: 300, flex: 1, lineHeight: 1.55 }}>
                    It's been a day — when the time feels right, your words are always welcome 🤍
                  </span>
                  <button
                    onClick={() => setNudgeDismissed(true)}
                    style={{
                      background: 'none', border: 'none',
                      color: '#5f6675', cursor: 'pointer',
                      fontSize: 15, padding: '0 2px',
                      lineHeight: 1, flexShrink: 0,
                      fontFamily: "'Manrope', sans-serif",
                    }}
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scholar footer link — always visible above the input */}
            <div style={{ textAlign: 'center', marginBottom: 9 }}>
              <button
                onClick={() => { /* TODO: open scholar-counsellor support flow */ }}
                className="sk-scholar-footer"
                style={{
                  background: 'none', border: 'none', padding: 0,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic', fontSize: 12,
                  color: 'rgba(212,168,83,.4)',
                  cursor: 'pointer', letterSpacing: '0.03em',
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                }}
              >
                <span style={{ color: 'rgba(212,168,83,.22)', letterSpacing: '-0.02em' }}>———</span>
                🕌 Speak with a scholar
                <span style={{ color: 'rgba(212,168,83,.22)', letterSpacing: '-0.02em' }}>———</span>
              </button>
            </div>

            {/* Input row */}
            <div
              style={{
                display: 'flex', gap: 9,
                alignItems: 'flex-end', marginBottom: 7,
              }}
            >
              <textarea
                ref={textareaRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Write to ${matchName}…`}
                rows={1}
                className="sk-msg-input"
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.09)',
                  borderRadius: 12, padding: '10px 14px',
                  fontSize: 13, color: '#EDE7DA',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 300, lineHeight: 1.5,
                  resize: 'none', outline: 'none',
                  transition: '.2s', overflowY: 'hidden',
                  minHeight: 44,
                }}
              />
              <button
                onClick={handleSend}
                disabled={!messageInput.trim()}
                className="sk-send-btn"
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  flexShrink: 0, border: 'none',
                  background: messageInput.trim()
                    ? 'linear-gradient(135deg, #D4A853, #b98b39)'
                    : 'rgba(255,255,255,.05)',
                  cursor: messageInput.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 17, lineHeight: 1,
                  transition: '.2s',
                  color: messageInput.trim() ? '#0a0e15' : '#5f6675',
                }}
              >
                ↑
              </button>
            </div>

            {/* Raya tone moderation — intercepts before send */}
            <AnimatePresence>
              {rayaIntervention && (
                <motion.div
                  key="raya-tone"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  transition={{ duration: 0.2 }}
                  style={{ marginBottom: 7 }}
                >
                  {rephraseText === null ? (
                    /* ── Phase 1: tone warning + 3 choices ── */
                    <>
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 14px', borderRadius: 20,
                          background: 'rgba(212,168,83,.04)',
                          border: '1px solid rgba(212,168,83,.14)',
                        }}
                      >
                        <RayaOrb size={20} />
                        <span
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontStyle: 'italic', fontSize: 13,
                            color: '#c9a85c', lineHeight: 1.5, flex: 1,
                          }}
                        >
                          {rayaIntervention}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex', gap: 16, justifyContent: 'flex-end',
                          marginTop: 5, paddingRight: 4, flexWrap: 'wrap',
                        }}
                      >
                        <button
                          onClick={async () => {
                            const text = pendingSendRef.current;
                            pendingSendRef.current = '';
                            setRayaIntervention(null);
                            setRephraseText(null);
                            if (matchId && text) await sendMessage(matchId, text);
                          }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 11, color: 'rgba(212,168,83,.7)',
                            fontFamily: "'Manrope', sans-serif", fontWeight: 400,
                            padding: '3px 0', letterSpacing: '0.01em',
                          }}
                        >
                          Send anyway
                        </button>
                        <button
                          onClick={() => {
                            const rephrased = getRephrasedMessage(
                              pendingSendRef.current,
                              pendingScenarioRef.current
                            );
                            setRephraseText(rephrased);
                          }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 11, color: 'rgba(212,168,83,.85)',
                            fontFamily: "'Manrope', sans-serif", fontWeight: 400,
                            padding: '3px 0', letterSpacing: '0.01em',
                          }}
                        >
                          Raya, help me say this better 🤍
                        </button>
                        <button
                          onClick={() => {
                            pendingSendRef.current = '';
                            setRayaIntervention(null);
                            setRephraseText(null);
                            setTimeout(() => textareaRef.current?.focus(), 50);
                          }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 11, color: 'rgba(237,231,218,.4)',
                            fontFamily: "'Manrope', sans-serif", fontWeight: 400,
                            padding: '3px 0', letterSpacing: '0.01em',
                          }}
                        >
                          I'll rewrite it myself
                        </button>
                      </div>
                      <div style={{ textAlign: 'center', marginTop: 8 }}>
                        <button
                          onClick={() => { /* TODO: open scholar-counsellor support flow */ }}
                          className="sk-scholar-hint"
                          style={{
                            background: 'none', border: 'none', padding: 0,
                            fontFamily: "'Cormorant Garamond', serif",
                            fontStyle: 'italic', fontSize: 11,
                            color: 'rgba(212,168,83,.5)',
                            cursor: 'pointer', letterSpacing: '0.02em',
                          }}
                        >
                          🕌 Need deeper guidance? Speak with a scholar
                        </button>
                      </div>
                    </>
                  ) : (
                    /* ── Phase 2: rephrased suggestion ── */
                    <>
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 14px', borderRadius: 20,
                          background: 'rgba(212,168,83,.04)',
                          border: '1px solid rgba(212,168,83,.14)',
                          marginBottom: 8,
                        }}
                      >
                        <RayaOrb size={20} />
                        <span
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontStyle: 'italic', fontSize: 13,
                            color: '#c9a85c', lineHeight: 1.5, flex: 1,
                          }}
                        >
                          Here is one gentle way to say what's in your heart 🤍
                        </span>
                      </div>
                      <div
                        style={{
                          margin: '0 0 0 28px',
                          padding: '10px 14px',
                          borderRadius: 12,
                          border: '1px solid rgba(212,168,83,.3)',
                          background: 'rgba(212,168,83,.025)',
                          fontFamily: "'Cormorant Garamond', serif",
                          fontStyle: 'italic',
                          fontSize: 13.5,
                          color: '#EDE7DA',
                          lineHeight: 1.6,
                        }}
                      >
                        {rephraseText}
                      </div>
                      <div
                        style={{
                          display: 'flex', gap: 16, justifyContent: 'flex-end',
                          marginTop: 5, paddingRight: 4,
                        }}
                      >
                        <button
                          onClick={async () => {
                            const text = rephraseText;
                            pendingSendRef.current = '';
                            setRayaIntervention(null);
                            setRephraseText(null);
                            if (matchId && text) await sendMessage(matchId, text);
                          }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 11, color: 'rgba(212,168,83,.7)',
                            fontFamily: "'Manrope', sans-serif", fontWeight: 400,
                            padding: '3px 0', letterSpacing: '0.01em',
                          }}
                        >
                          Send this 🤍
                        </button>
                        <button
                          onClick={() => {
                            pendingSendRef.current = '';
                            setRayaIntervention(null);
                            setRephraseText(null);
                            setTimeout(() => textareaRef.current?.focus(), 50);
                          }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 11, color: 'rgba(237,231,218,.4)',
                            fontFamily: "'Manrope', sans-serif", fontWeight: 400,
                            padding: '3px 0', letterSpacing: '0.01em',
                          }}
                        >
                          I'll write my own 🌿
                        </button>
                      </div>
                      <div style={{ textAlign: 'center', marginTop: 8 }}>
                        <button
                          onClick={() => { /* TODO: open scholar-counsellor support flow */ }}
                          className="sk-scholar-hint"
                          style={{
                            background: 'none', border: 'none', padding: 0,
                            fontFamily: "'Cormorant Garamond', serif",
                            fontStyle: 'italic', fontSize: 11,
                            color: 'rgba(212,168,83,.5)',
                            cursor: 'pointer', letterSpacing: '0.02em',
                          }}
                        >
                          🕌 Need deeper guidance? Speak with a scholar
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>


          </div>
        </div>
      </main>

      {/* ── Report modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {reportOpen && (
          <motion.div
            key="report-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,.65)',
            }}
            onClick={() => { if (!reportSubmitted) { setReportOpen(false); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#0d1220',
                border: '1px solid rgba(255,255,255,.09)',
                borderRadius: 18, padding: '24px 24px 20px',
                width: 340, maxWidth: 'calc(100vw - 40px)',
              }}
            >
              {reportSubmitted ? (
                <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
                  <div style={{ fontSize: 24, marginBottom: 10, color: '#7FB07A' }}>✓</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#EDE7DA', marginBottom: 8 }}>
                    Report received
                  </div>
                  <p style={{ fontSize: 12, color: '#9aa0ac', fontWeight: 300, lineHeight: 1.65, margin: 0 }}>
                    Your report has been received. We review every report personally.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, marginBottom: 4 }}>
                    Report a concern
                  </div>
                  <p style={{ fontSize: 11.5, color: '#9aa0ac', fontWeight: 300, lineHeight: 1.6, marginBottom: 18 }}>
                    Every report is reviewed by a real person. This is confidential.
                  </p>
                  <div style={{ fontSize: 10, color: '#5f6675', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                    Reason
                  </div>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px',
                      background: 'rgba(255,255,255,.04)',
                      border: '1px solid rgba(255,255,255,.1)',
                      borderRadius: 10, color: '#EDE7DA',
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: 13, marginBottom: 20,
                      outline: 'none', cursor: 'pointer',
                    }}
                  >
                    <option>Inappropriate behaviour</option>
                    <option>Harassment</option>
                    <option>Fake profile</option>
                    <option>Other</option>
                  </select>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setReportOpen(false)}
                      style={{
                        padding: '8px 16px', borderRadius: 20,
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,.08)',
                        color: '#9aa0ac', fontSize: 12, cursor: 'pointer',
                        fontFamily: "'Manrope', sans-serif",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        const partnerUid = conversation?.partner_uid;
                        if (!partnerUid) return;
                        await fileSafetyReport(partnerUid, reportReason);
                        setReportSubmitted(true);
                        setTimeout(() => {
                          setReportOpen(false);
                          setReportSubmitted(false);
                          setReportReason('Inappropriate behaviour');
                        }, 2800);
                      }}
                      style={{
                        padding: '8px 20px', borderRadius: 20,
                        background: 'rgba(220,80,80,.1)',
                        border: '1px solid rgba(220,80,80,.22)',
                        color: '#f08080', fontSize: 12, cursor: 'pointer',
                        fontFamily: "'Manrope', sans-serif",
                      }}
                    >
                      Submit report
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ConversationPage;
