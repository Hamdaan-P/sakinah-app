/**
 * ConversationPage — /sakinah/conversation
 * Stage D · Phase 6: Topic-by-topic guided conversation between Ahmed and Fatima.
 * 8 pre-nikah topics unlock one at a time. No open chat box. No read receipts.
 * No media. No contact info. Intimacy is absent as a topic entirely.
 * Raya guides tone silently. Scholar one tap away.
 * TODO: replace all mock state with sakinahService.getConversation(uid, candidateUid).
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, doc, getDoc, getDocs, deleteDoc, addDoc, updateDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { SakinahSidebar } from './components/SakinahSidebar';
import { useConversation } from '../hooks';
import { sendMessage, checkTone, inviteWali, fileSafetyReport, signalReady, getPendingWaliRequest, approveWaliRequest, searchWaliUser, sendWaliRequest } from '../services/sakinahService';
import { db, auth } from '@/config/firebase.config';
import '../sakinah.css';
import RayaOrbButton from '../components/RayaOrbButton';

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

type Msg = { from: 'me' | 'her' | 'raya'; text: string; createdAt?: string; msgType?: string; topicName?: string; fromUid?: string; senderName?: string };

// ── Raya AI tone moderation ───────────────────────────────────────────────────
// detectTone removed — detection is now server-side via Anthropic API.
// See: POST /conversation/check-tone

const SCENARIO_IDS = ['intimacy', 'rude'] as const;
type ScenarioId = typeof SCENARIO_IDS[number];

const INTIMACY_MESSAGE =
  "Sakinah is a space built on haya (modesty). Conversations about physical intimacy are reserved for after Nikah — this boundary protects the sanctity of what you are building together.";

const RUDENESS_MESSAGE =
  "This space calls for patience and adab (good manners). Raya gently reminds you that how you speak reflects who you are — would you like to rephrase this with more dignity?";function getRephrasedMessage(original: string, _scenarioId: ScenarioId): string {
  const t = original.toLowerCase();
  if (t.includes('stupid') || t.includes('idiot') || t.includes('fool') || t.includes('dumb'))
    return "I'm finding this moment really frustrating, and I'd like to express that without words I might regret 🌿";
  if (t.includes('manners') || t.includes('badtameez') || t.includes('adab') || t.includes('rude') || t.includes('disrespect'))
    return "I felt something in this exchange that unsettled me — can we speak to each other with more care? 🤍";
  if (t.includes('who do you think') || t.includes('how dare') || t.includes('what do you think'))
    return "Something about this moment has made me feel disrespected — I'd love for us to talk about it calmly 🌿";
  return "I'd like to share how I feel — can we try approaching this with a little more gentleness? 🤍";
}

const SHORT_MSG_RISK_WORDS = [
  'hot', 'sexy', 'cute', 'gorgeous', 'handsome', 'beautiful', 'stunning',
  'stupid', 'idiot', 'fool', 'pagal', 'badtameez', 'jahil', 'ghadhaa',
];

const TONE_RISK_SIGNALS = [
  'hot', 'sexy', 'cute', 'babe', 'baby', 'hottie', 'gorgeous', 'handsome',
  'beautiful', 'stunning', 'stupid', 'idiot', 'fool', 'dumb', 'moron',
  'pagal', 'badtameez', 'jahil', 'ghadhaa', 'be-adab', 'rude', 'manners', 'language',
];

const AGGRESSIVE_QUESTION_PATTERNS = ["don't you", 'how dare', "what's wrong"];

const SAFE_RESPONSE_PHRASES = new Set([
  'yes', 'no', 'okay', 'ok', 'alright', 'sure', 'thanks', 'thank you',
  'good', 'fine', 'great', 'alhamdulillah', 'mashallah', 'inshallah',
  'jazakallah', 'salam', 'assalam', 'walaikum', 'how are you',
  'i am fine', 'i am good',
]);

function requiresToneCheck(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const words = lower.split(/\s+/);
  if (SAFE_RESPONSE_PHRASES.has(lower)) return false;
  if (words.length <= 3 && !SHORT_MSG_RISK_WORDS.some(w => lower.includes(w))) return false;
  return (
    words.length > 3 &&
    (
      text.includes('!') ||
      AGGRESSIVE_QUESTION_PATTERNS.some(p => lower.includes(p)) ||
      TONE_RISK_SIGNALS.some(w => lower.includes(w))
    )
  );
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
  const { matchId: pathMatchId } = useParams<{ matchId: string }>();
  const [searchParams] = useSearchParams();
  const matchId = pathMatchId ?? searchParams.get('matchId') ?? undefined;
  const { conversation } = useConversation(matchId ?? '');
  const matchName = conversation?.match_name ?? 'Your match';

  const [userRole, setUserRole]                   = useState<string | null>(null);
  const [roleLoaded, setRoleLoaded]               = useState(false);
  const [userGender, setUserGender]               = useState<string | null>(null);
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
  const [keepGoingClicked, setKeepGoingClicked]     = useState(false);
  const [convNotifications, setConvNotifications]   = useState<any[]>([]);
  const [linkedWaliUid, setLinkedWaliUid]           = useState<string | null>(null);
  const [waliObserveInviteSent, setWaliObserveInviteSent] = useState(false);
  const [waliObserveMsg, setWaliObserveMsg]         = useState<string | null>(null);
  const [waliObserveSearchOpen, setWaliObserveSearchOpen]     = useState(false);
  const [waliObserveSearchQuery, setWaliObserveSearchQuery]   = useState('');
  const [waliObserveSearchResults, setWaliObserveSearchResults] = useState<Array<{ wali_uid: string; wali_name: string }>>([]);
  const [waliObserveSearching, setWaliObserveSearching]       = useState(false);
  const [rayaCardDismissed, setRayaCardDismissed] = useState(false);
  const [messageInput, setMessageInput]           = useState('');
  const [rayaIntervention, setRayaIntervention]   = useState<string | null>(null);
  const [rephraseText, setRephraseText]           = useState<string | null>(null);
  const [rayaThinking, setRayaThinking]           = useState(false);
  const [messages, setMessages]                   = useState<Msg[]>([]);
  const [participantNames, setParticipantNames]   = useState<Record<string, string>>({});
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
  const waliSearchDebounceRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waliObserveDebounceRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSendRef      = useRef('');
  const pendingScenarioRef  = useRef<ScenarioId>('rude');

  // Fetch current user's role from Firestore on mount.
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserRole(data.role || data.sakinah_role || null);
        setUserGender(data.gender?.toLowerCase() || null);
        setLinkedWaliUid(data.wali_uid || null);
      }
      setRoleLoaded(true);
    }).catch((e) => {
      console.error(e);
      setRoleLoaded(true);
    });
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
        fromUid,
        senderName: (docData.senderName ?? docData.displayName ?? undefined) as string | undefined,
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

  // Wali observer: load participant display names from match + profiles.
  useEffect(() => {
    if (userRole !== 'wali' || !matchId) return;
    (async () => {
      try {
        const matchSnap = await getDoc(doc(db, 'sakinah_matches', matchId));
        if (!matchSnap.exists()) return;
        const { user_a_uid, user_b_uid } = matchSnap.data() as { user_a_uid: string; user_b_uid: string };
        const [profA, profB] = await Promise.all([
          getDoc(doc(db, 'sakinah_profiles', user_a_uid)),
          getDoc(doc(db, 'sakinah_profiles', user_b_uid)),
        ]);
        const names: Record<string, string> = {};
        if (profA.exists()) names[user_a_uid] = (profA.data().display_name as string) || user_a_uid;
        if (profB.exists()) names[user_b_uid] = (profB.data().display_name as string) || user_b_uid;
        setParticipantNames(names);
      } catch (e) {
        console.error('[Wali] Failed to load participant names:', e);
      }
    })();
  }, [userRole, matchId]);

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

  // Reset keep-going state whenever the backend resets myReady (new topic started).
  useEffect(() => {
    if (!myReady) setKeepGoingClicked(false);
  }, [myReady]);

  // On load, check if this female seeker already sent a wali observe invite for
  // this match — restores "Wali invited ✓" state across page refreshes.
  useEffect(() => {
    if (userGender !== 'female' || !matchId) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getDocs(query(
      collection(db, 'sakinah_notifications'),
      where('from_uid', '==', uid),
      where('match_id', '==', matchId),
      where('type', '==', 'wali_conversation_invite'),
    ))
      .then(snap => { if (!snap.empty) setWaliObserveInviteSent(true); })
      .catch(console.error);
  }, [userGender, matchId]);

  // Load conversation-scoped notifications (match_id present, not interest_expressed).
  // Kept separate from ConsideredFew's interest_expressed notifications.
  useEffect(() => {
    if (!matchId) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getDocs(query(
      collection(db, 'sakinah_notifications'),
      where('to_uid', '==', uid),
      where('match_id', '==', matchId),
    ))
      .then(snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setConvNotifications(docs);
      })
      .catch(console.error);
  }, [matchId]);

  // When a new topic opens, delete stale conversation notifications from Firestore
  // and immediately clear local state so the UI updates without a page refresh.
  // interest_expressed notifications (no match_id) in ConsideredFewPage are untouched.
  useEffect(() => {
    if (liveMatchflowStep === null || !matchId) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getDocs(query(
      collection(db, 'sakinah_notifications'),
      where('to_uid', '==', uid),
      where('match_id', '==', matchId),
    ))
      .then(snap => {
        snap.docs.forEach(d => deleteDoc(d.ref).catch(console.error));
        setConvNotifications([]);
      })
      .catch(console.error);
  }, [liveMatchflowStep, matchId]);

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
    if (!text || rayaThinking) return;

    pendingSendRef.current = text;

    if (!requiresToneCheck(text)) {
      setMessageInput('');
      if (matchId) await sendMessage(matchId, text);
      return;
    }

    setRayaThinking(true);

    try {
      const check = await checkTone(text);
      setRayaThinking(false);
      if (check.violation) {
        pendingScenarioRef.current = check.type as ScenarioId;
        setRayaIntervention(
          check.type === 'intimacy' ? INTIMACY_MESSAGE : RUDENESS_MESSAGE
        );
        return;
      }
    } catch (e) {
      console.error('send error', e);
      setRayaThinking(false);
    }

    setMessageInput('');
    if (matchId) await sendMessage(matchId, text);
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

  const sendObserveInvite = async (waliUid: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid || !matchId) return;
    const displayName = auth.currentUser?.displayName || matchName;
    try {
      const existing = await getDocs(query(
        collection(db, 'sakinah_notifications'),
        where('to_uid', '==', waliUid),
        where('from_uid', '==', uid),
        where('type', '==', 'wali_conversation_invite'),
      ));
      if (!existing.empty) {
        setWaliObserveInviteSent(true);
        setWaliObserveSearchOpen(false);
        setWaliObserveSearchQuery('');
        setWaliObserveSearchResults([]);
        setWaliObserveMsg(null);
        return;
      }
      await addDoc(collection(db, 'sakinah_notifications'), {
        to_uid: waliUid,
        from_uid: uid,
        from_name: displayName,
        match_id: matchId,
        type: 'wali_conversation_invite',
        message: `${displayName} has invited you to observe their conversation.`,
        created_at: serverTimestamp(),
        read: false,
      });
      setWaliObserveInviteSent(true);
      setWaliObserveSearchOpen(false);
      setWaliObserveSearchQuery('');
      setWaliObserveSearchResults([]);
      setWaliObserveMsg(null);
    } catch (e: any) {
      console.error('Failed to send wali observe invite — full error:', e, 'code:', e?.code, 'message:', e?.message);
      setWaliObserveMsg('Failed to send invite. Please try again.');
    }
  };

  const handleObserveWaliSelect = async (waliUid: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      await updateDoc(doc(db, 'users', uid), { wali_uid: waliUid });
      setLinkedWaliUid(waliUid);
    } catch (e) {
      console.error('Failed to save wali_uid:', e);
    }
    await sendObserveInvite(waliUid);
  };

  const handleInviteWaliToObserve = async () => {
    if (!matchId || waliObserveInviteSent) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    if (!linkedWaliUid) {
      setWaliObserveSearchOpen(prev => !prev);
      return;
    }
    await sendObserveInvite(linkedWaliUid);
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
  // null = role not yet loaded; true = wali observer; false = seeker/no-role
  const isWali: boolean | null = roleLoaded ? userRole === 'wali' : null;

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
                {isWali === true
                  ? 'Observing conversation · guided by Raya'
                  : `Phase 6 · with ${matchName} · guided by Raya`}
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
        {isWali === false && <AnimatePresence>
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

            {/* Wali observer banner */}
            {isWali === true && (
              <div style={{
                textAlign: 'center', padding: '8px 16px', marginBottom: 12,
                borderRadius: 10,
                background: 'rgba(212,168,83,.06)',
                border: '1px solid rgba(212,168,83,.18)',
                fontFamily: "'Manrope', sans-serif",
                fontSize: 11, color: 'rgba(212,168,83,.65)',
                letterSpacing: '0.02em',
              }}>
                You are observing this conversation as a trusted guardian
              </div>
            )}

            {/* Loading state while role is being fetched */}
            {isWali === null && (
              <div style={{
                textAlign: 'center', padding: '32px 0',
                color: '#5f6675', fontFamily: "'Manrope', sans-serif", fontSize: 12,
                letterSpacing: '0.04em',
              }}>
                Loading…
              </div>
            )}

            {/* Floating pill — sticky top of chat area after "Keep going" is clicked */}
            <AnimatePresence>
              {keepGoingClicked && !myReady && isWali === false && (
                <motion.div
                  key="next-chapter-pill"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  style={{ position: 'sticky', top: 8, zIndex: 10, textAlign: 'center', marginBottom: 12 }}
                >
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
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      padding: '8px 18px', borderRadius: 20,
                      background: 'rgba(10,14,21,.82)', backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(212,168,83,.3)',
                      color: '#e7c984',
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic', fontSize: 12.5,
                      cursor: readySending ? 'default' : 'pointer',
                      opacity: readySending ? 0.6 : 1,
                      boxShadow: '0 4px 16px rgba(0,0,0,.4)',
                      transition: '.2s',
                      letterSpacing: '0.01em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Ready to explore the next chapter? →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>


            {/* Invite Wali to observe — female seekers only */}
            {userGender === 'female' && isWali === false && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleInviteWaliToObserve}
                    disabled={waliObserveInviteSent}
                    style={{
                      background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(212,168,83,0.05))',
                      border: '1px solid rgba(212,168,83,0.6)',
                      borderRadius: '12px',
                      padding: '12px 20px',
                      color: '#D4A853',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%',
                      marginBottom: '16px',
                      letterSpacing: '0.02em'
                    }}
                  >
                    {waliObserveInviteSent ? 'Wali invited ✓' : 'Invite your Wali to observe 👁️'}
                  </button>
                </div>

                {waliObserveSearchOpen && !waliObserveInviteSent && (
                  <div style={{ marginTop: 8 }}>
                    <input
                      autoFocus
                      type="text"
                      placeholder="Type your Wali's name..."
                      value={waliObserveSearchQuery}
                      onChange={(e) => {
                        const v = e.target.value;
                        setWaliObserveSearchQuery(v);
                        if (waliObserveDebounceRef.current) clearTimeout(waliObserveDebounceRef.current);
                        waliObserveDebounceRef.current = setTimeout(async () => {
                          if (v.length < 2) { setWaliObserveSearchResults([]); return; }
                          setWaliObserveSearching(true);
                          try {
                            const res: any = await searchWaliUser(v);
                            setWaliObserveSearchResults(res.walis || []);
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setWaliObserveSearching(false);
                          }
                        }, 400);
                      }}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,.04)',
                        border: '1px solid rgba(212,168,83,.22)',
                        borderRadius: 10,
                        padding: '8px 12px',
                        color: '#EDE7DA',
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: 12,
                        boxSizing: 'border-box' as const,
                        outline: 'none',
                      }}
                    />
                    {waliObserveSearching && (
                      <p style={{
                        fontSize: 10.5, color: '#5f6675', margin: '4px 0 0',
                        fontFamily: "'Manrope', sans-serif",
                      }}>
                        Searching...
                      </p>
                    )}
                    {waliObserveSearchResults.map(r => (
                      <div
                        key={r.wali_uid}
                        onClick={() => handleObserveWaliSelect(r.wali_uid)}
                        style={{
                          padding: '8px 12px',
                          marginTop: 4,
                          borderRadius: 8,
                          background: 'rgba(212,168,83,.06)',
                          border: '1px solid rgba(212,168,83,.15)',
                          color: '#EDE7DA',
                          fontFamily: "'Manrope', sans-serif",
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        {r.wali_name}
                      </div>
                    ))}
                  </div>
                )}

                {waliObserveMsg && (
                  <p style={{
                    fontSize: 10.5, color: '#5f6675', margin: '4px 0 0', textAlign: 'center',
                    fontFamily: "'Manrope', sans-serif", lineHeight: 1.4,
                  }}>
                    {waliObserveMsg}
                  </p>
                )}
              </div>
            )}

            {/* ── Wali toggle ──────────────────────────────────────────── */}
            {/* ── Topic curriculum ──────────────────────────────────────── */}
            {isWali !== true && <motion.div
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
            </motion.div>}

            {/* ── Raya topic prompt card ────────────────────────────────
                Visible only when this user needs to speak next.
                Hidden once both have exchanged messages.
            ──────────────────────────────────────────────────────────── */}
            {isWali !== true && <AnimatePresence>
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
            </AnimatePresence>}

            {/* ── Message bubbles ─────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.36 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}
            >
              {messages.map((msg, i) => {
                if (msg.from === 'raya') {
                  if (msg.msgType === 'ready_nudge') {
                    // Hide once the topic has already advanced — a topic_announcement
                    // appearing later in the stream means both were ready and moved on.
                    if (messages.slice(i + 1).some(m => m.msgType === 'topic_announcement')) return null;
                    // Hide when both users are now ready (topic_announcement is imminent).
                    if (partnerReady) return null;
                    // Hide the nudge naming the current user — they already know they clicked ready.
                    const myName = auth.currentUser?.displayName ?? '';
                    if (myName && msg.text?.startsWith(myName)) return null;
                  }
                  // Hide topic_announcements that belong to a previous topic — only the
                  // announcement that opened the current topic is relevant to show.
                  if (msg.msgType === 'topic_announcement' && msg.topicName !== currentTopicName) return null;
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
                      {isWali === true
                        ? (participantNames[msg.fromUid ?? ''] ?? msg.senderName ?? msg.fromUid ?? '')
                        : (msg.from === 'me' ? 'You' : matchName)}
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
        {/* Hidden entirely for wali observers and while role is loading */}
        {isWali === false && <div
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
              {((showReadyButton && !keepGoingClicked) || (myReady && !journeyComplete)) && isWali === false && (
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

            {/* Keep going link — muted, between the ready button and the scholar divider */}
            <AnimatePresence>
              {showReadyButton && !keepGoingClicked && !isLastTopic && isWali === false && (
                <motion.div
                  key="keep-going"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ textAlign: 'center', marginBottom: 6 }}
                >
                  <button
                    onClick={() => setKeepGoingClicked(true)}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic', fontSize: 11,
                      color: 'rgba(212,168,83,.5)',
                      cursor: 'pointer', letterSpacing: '0.02em',
                    }}
                  >
                    Still have more to share? Keep going →
                  </button>
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

            {/* Scholar footer link — visible to seekers only */}
            {isWali === false && <div style={{ textAlign: 'center', marginBottom: 9 }}>
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
            </div>}

            {/* Input row — hidden for wali observers */}
            {isWali === false && <div
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
            </div>}

            {/* Raya is thinking indicator */}
            <AnimatePresence>
              {rayaThinking && (
                <motion.div
                  key="raya-thinking"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 14px', marginBottom: 7, borderRadius: 20,
                    background: 'rgba(212,168,83,.03)',
                    border: '1px solid rgba(212,168,83,.1)',
                  }}
                >
                  <RayaOrb size={18} />
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic', fontSize: 12,
                      color: 'rgba(201,168,92,.5)', lineHeight: 1.5,
                      letterSpacing: '0.02em',
                    }}
                  >
                    Raya is thinking…
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

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
                    /* ── Phase 1: tone warning ── */
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
                        {pendingScenarioRef.current === 'intimacy' ? (
                          /* Intimacy: hard block — no send anyway, no rephrase */
                          <button
                            onClick={() => {
                              pendingSendRef.current = '';
                              setRayaIntervention(null);
                              setRephraseText(null);
                              setMessageInput('');
                              setTimeout(() => textareaRef.current?.focus(), 50);
                            }}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              fontSize: 11, color: 'rgba(237,231,218,.55)',
                              fontFamily: "'Manrope', sans-serif", fontWeight: 400,
                              padding: '3px 0', letterSpacing: '0.01em',
                            }}
                          >
                            I understand
                          </button>
                        ) : pendingScenarioRef.current === 'rude' ? (
                          /* Rude: gentle intercept — rephrase with dignity, write own, send anyway */
                          <>
                            <button
                              onClick={async () => {
                                const text = pendingSendRef.current;
                                pendingSendRef.current = '';
                                setRayaIntervention(null);
                                setRephraseText(null);
                                setMessageInput('');
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
                                pendingSendRef.current = '';
                                setRayaIntervention(null);
                                setRephraseText(null);
                                setMessageInput('');
                                setTimeout(() => textareaRef.current?.focus(), 50);
                              }}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 11, color: 'rgba(237,231,218,.4)',
                                fontFamily: "'Manrope', sans-serif", fontWeight: 400,
                                padding: '3px 0', letterSpacing: '0.01em',
                              }}
                            >
                              I'll write my own
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
                              Rephrase with dignity 🤍
                            </button>
                          </>
                        ) : (
                          /* All other scenarios: standard 3-option panel */
                          <>
                            <button
                              onClick={async () => {
                                const text = pendingSendRef.current;
                                pendingSendRef.current = '';
                                setRayaIntervention(null);
                                setRephraseText(null);
                                setMessageInput('');
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
                                setMessageInput('');
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
                          </>
                        )}
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
                            setMessageInput('');
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
                            setMessageInput('');
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
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>


          </div>
        </div>}
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
      <RayaOrbButton page="conversation" />
    </div>
  );
}

export default ConversationPage;
