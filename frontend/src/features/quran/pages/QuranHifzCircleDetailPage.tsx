/**
 * Hifz Circle detail page — leaderboard of members, recent check-ins,
 * and a "submit today's check-in" composer.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Users, Fire, Trophy, CheckCircle, Spinner, ShareNetwork, SignOut, Copy, VideoCamera, Phone, UserPlus, Sparkle, BookOpen } from '@phosphor-icons/react';
import {
  listMembers,
  listRecentCheckins,
  submitCheckin,
  hasCheckedInToday,
  leaveCircle,
  startCall,
  subscribeToCall,
  getCurrentDisplayName,
  type HifzCircleMember,
  type HifzCheckin,
  type LiveCall,
} from '../services/hifzCirclesService';
import { generateCallSummary } from '../services/hifzCirclesAi';
import { JitsiCallSheet } from '../components/JitsiCallSheet';
import { CircleInviteSheet } from '../components/CircleInviteSheet';
import { CircleNotesPanel } from '../components/CircleNotesPanel';
import { CircleRayaSheet } from '../components/CircleRayaSheet';
import { auth, db } from '@/config/firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import { trackFeature } from '@/lib/analytics';

interface CircleMeta {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
}

export function QuranHifzCircleDetailPage() {
  useEffect(() => { trackFeature('quran_hifz_circle_detail'); }, []);
  const navigate = useNavigate();
  const { circleId = '' } = useParams<{ circleId: string }>();

  const [meta, setMeta] = useState<CircleMeta | null>(null);
  const [members, setMembers] = useState<HifzCircleMember[]>([]);
  const [checkins, setCheckins] = useState<HifzCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [tab, setTab] = useState<'members' | 'feed'>('members');

  const [ayahCount, setAyahCount] = useState(0);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [liveCall, setLiveCall] = useState<LiveCall>({ active: false });
  const [callOpen, setCallOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [rayaOpen, setRayaOpen] = useState(false);
  const lastCallActiveRef = useRef(false);

  useEffect(() => {
    if (!circleId) return;
    const unsub = subscribeToCall(circleId, (call) => {
      // Detect transition: active → inactive (the call just ended).
      if (lastCallActiveRef.current && !call.active) {
        // Best-effort summary; ignore errors so the UI never blocks.
        generateCallSummary(circleId).catch(() => {});
      }
      lastCallActiveRef.current = call.active;
      setLiveCall(call);
    });
    return () => unsub();
  }, [circleId]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [snap, m, c, today] = await Promise.all([
        getDoc(doc(db, 'hifz_circles', circleId)),
        listMembers(circleId),
        listRecentCheckins(circleId, 30),
        hasCheckedInToday(circleId).catch(() => false),
      ]);
      if (snap.exists()) {
        const data = snap.data();
        setMeta({ id: circleId, name: data.name, description: data.description, memberCount: data.memberCount ?? 0 });
      }
      setMembers([...m].sort((a, b) => b.totalAyahsRevised - a.totalAyahsRevised));
      setCheckins(c);
      setCheckedInToday(today);
    } finally {
      setLoading(false);
    }
  }, [circleId]);

  useEffect(() => { reload(); }, [reload]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await submitCheckin(circleId, ayahCount, note);
      setNote('');
      setAyahCount(0);
      await reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Leave this circle? You can rejoin with the invite code anytime.')) return;
    await leaveCircle(circleId);
    navigate('/quran/hifz/circles', { replace: true });
  };

  const handleShare = async () => {
    const text = `Join my Hifz Circle "${meta?.name}" on ZaryahPlus. Invite code: ${circleId}`;
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const myUid = auth.currentUser?.uid;
  const myMember = members.find((m) => m.uid === myUid);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] pb-24">
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <Users size={16} weight="fill" className="text-[#D4A853] shrink-0" />
            <h1 className="text-sm font-semibold text-white truncate">{meta?.name || 'Circle'}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setInviteOpen(true)}
              className="px-2.5 h-9 rounded-full bg-[#D4A853]/15 border border-[#D4A853]/40 text-[#D4A853] text-xs font-semibold flex items-center gap-1"
              aria-label="Invite"
            >
              <UserPlus size={13} weight="fill" /> Invite
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
              aria-label="Share invite"
            >
              <ShareNetwork size={16} className="text-white/70" />
            </button>
          </div>
        </div>
      </div>

      {/* Invite code chip */}
      <div className="px-4 pt-4">
        <div className="rounded-xl bg-gradient-to-r from-[#D4A853]/12 to-[#0F141F]/15 border border-[#D4A853]/25 p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#D4A853]/85 font-semibold">Invite code</p>
            <p className="text-xl font-mono tracking-widest text-[#F5E8C7] font-bold">{circleId}</p>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#D4A853]/10 border border-[#D4A853]/30 text-[#D4A853] text-xs font-medium"
          >
            <Copy size={12} /> {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      {/* Live call card */}
      <div className="px-4 mt-3">
        {liveCall.active ? (
          <button
            onClick={async () => {
              setCallOpen(true);
            }}
            className="w-full rounded-xl bg-gradient-to-r from-red-500/20 to-rose-500/10 border border-red-500/40 p-3 flex items-center gap-3 active:scale-[0.99] transition-transform"
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-red-500/25">
              <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
              <VideoCamera size={18} weight="fill" className="text-red-200 relative" />
            </span>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live now
              </p>
              <p className="text-[11px] text-white/60">
                Tap to join the circle's voice + video call.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-red-200 bg-red-500/30 px-3 py-1 rounded-full">
              Join Live
            </span>
          </button>
        ) : (
          <button
            onClick={async () => {
              try {
                await startCall(circleId);
                setCallOpen(true);
              } catch {
                /* ignore */
              }
            }}
            className="w-full rounded-xl bg-white/3 border border-white/10 hover:border-[#D4A853]/30 p-3 flex items-center gap-3 transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-[#D4A853]/15 flex items-center justify-center">
              <VideoCamera size={18} weight="fill" className="text-[#D4A853]" />
            </span>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">Start live call</p>
              <p className="text-[11px] text-white/55">
                Recite together. Members get a Join button instantly.
              </p>
            </div>
            <Phone size={16} className="text-[#D4A853]" />
          </button>
        )}

        {/* Synced reading entry — visible only while a call is live */}
        {liveCall.active && (
          <button
            onClick={() => {
              const isHost = liveCall.startedBy === myUid;
              const params = new URLSearchParams({ circle: circleId, ...(isHost ? { host: '1' } : { follow: '1' }) });
              navigate(`/quran/read?${params.toString()}`);
            }}
            className="w-full mt-2 rounded-xl bg-[#4FB892]/10 border border-[#4FB892]/30 p-3 flex items-center gap-3 hover:bg-[#4FB892]/15"
          >
            <span className="w-9 h-9 rounded-full bg-[#4FB892]/20 flex items-center justify-center">
              <BookOpen size={16} weight="fill" className="text-[#4FB892]" />
            </span>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">
                {liveCall.startedBy === myUid ? 'Lead the recitation' : 'Follow the host'}
              </p>
              <p className="text-[11px] text-white/55">
                {liveCall.startedBy === myUid
                  ? 'Open the reader — your current ayah is broadcast to members.'
                  : 'Open the reader — auto-scrolls to the host\'s ayah.'}
              </p>
            </div>
          </button>
        )}
      </div>

      {/* My check-in card */}
      <div className="px-4 mt-4">
        {checkedInToday ? (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 flex items-center gap-3">
            <CheckCircle size={22} weight="fill" className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">You've checked in today ✓</p>
              <p className="text-[11px] text-white/55">Streak: {myMember?.currentStreak ?? 1} day{(myMember?.currentStreak ?? 1) !== 1 ? 's' : ''} · {myMember?.totalAyahsRevised ?? 0} total ayahs</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white/3 border border-white/10 p-4">
            <p className="text-[11px] uppercase tracking-wide text-white/55 font-semibold mb-2">Today's check-in</p>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setAyahCount(Math.max(0, ayahCount - 1))}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white/70 font-bold"
              >−</button>
              <input
                type="number"
                value={ayahCount}
                onChange={(e) => setAyahCount(Math.max(0, Math.min(200, parseInt(e.target.value) || 0)))}
                className="flex-1 text-center text-2xl font-bold text-[#D4A853] bg-transparent outline-none"
                min={0}
                max={200}
              />
              <button
                onClick={() => setAyahCount(Math.min(200, ayahCount + 1))}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white/70 font-bold"
              >+</button>
            </div>
            <p className="text-[11px] text-white/40 text-center mb-3">ayahs revised today</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 200))}
              placeholder="What did you revise? (optional)"
              rows={2}
              className="w-full bg-[#0A0E16]/60 border border-white/10 rounded-lg p-2 text-xs text-white/85 placeholder:text-white/30 resize-none focus:outline-none focus:border-[#D4A853]/40 mb-2"
            />
            {error && <p className="text-[11px] text-rose-400 mb-2">{error}</p>}
            <button
              disabled={submitting || ayahCount <= 0}
              onClick={handleSubmit}
              className="w-full py-2.5 rounded-lg bg-[#D4A853] text-[#0A0E16] text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Spinner size={12} className="animate-spin" />} Submit check-in
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 mt-5 border-b border-white/5">
        {(['members', 'feed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'text-[#D4A853] border-[#D4A853]' : 'text-white/50 border-transparent hover:text-white/80'
            }`}
          >
            {t === 'members' ? 'Leaderboard' : 'Recent check-ins'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-14 rounded-xl bg-white/5 animate-pulse" />
            <div className="h-14 rounded-xl bg-white/5 animate-pulse" />
          </div>
        ) : tab === 'members' ? (
          <div className="space-y-2">
            {members.map((m, i) => (
              <motion.div
                key={m.uid}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  m.uid === myUid ? 'bg-[#D4A853]/10 border-[#D4A853]/30' : 'bg-white/3 border-white/8'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  {i === 0 ? (
                    <Trophy size={14} weight="fill" className="text-amber-400" />
                  ) : (
                    <span className="text-[11px] font-semibold text-white/60">#{i + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {m.name}{m.uid === myUid && <span className="text-[10px] text-[#D4A853] ml-1">(you)</span>}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {m.totalAyahsRevised} ayahs · {m.currentStreak} day streak
                  </p>
                </div>
                {m.currentStreak > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-orange-300">
                    <Fire size={12} weight="fill" /> {m.currentStreak}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        ) : checkins.length === 0 ? (
          <p className="text-xs text-white/40 text-center py-8">No check-ins yet — be the first.</p>
        ) : (
          <div className="space-y-2">
            {checkins.map((c) => (
              <div key={c.id} className="rounded-xl bg-white/3 border border-white/8 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white">{c.name}</span>
                  <span className="text-[10px] text-white/40">{c.date}</span>
                </div>
                <p className="text-[11px] text-[#D4A853]/85 font-semibold">{c.ayahsRevised} ayahs revised</p>
                {c.note && (
                  <p className="text-xs text-white/65 italic mt-1.5 leading-relaxed border-l-2 border-[#D4A853]/30 pl-2">
                    {c.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Leave */}
        {myMember && (
          <button
            onClick={handleLeave}
            className="w-full mt-8 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium hover:bg-rose-500/20"
          >
            <SignOut size={12} /> Leave circle
          </button>
        )}
      </div>

      {/* Notes panel */}
      <CircleNotesPanel circleId={circleId} />

      {/* Ask Raya FAB */}
      <button
        onClick={() => setRayaOpen(true)}
        className="fixed bottom-6 right-4 z-30 flex items-center gap-1.5 px-4 py-3 rounded-full bg-[#D4A853] text-[#0A0E16] text-sm font-semibold shadow-2xl"
        style={{ boxShadow: '0 18px 40px -12px rgba(212,168,83,0.55)' }}
        aria-label="Ask Raya"
      >
        <Sparkle size={15} weight="fill" /> Ask Raya
      </button>

      <AnimatePresence>
        {callOpen && (
          <JitsiCallSheet
            circleId={circleId}
            displayName={getCurrentDisplayName()}
            isHost={liveCall.startedBy === myUid}
            onClose={() => setCallOpen(false)}
          />
        )}
      </AnimatePresence>

      <CircleInviteSheet
        open={inviteOpen}
        circleId={circleId}
        circleName={meta?.name ?? ''}
        onClose={() => setInviteOpen(false)}
      />

      <CircleRayaSheet
        open={rayaOpen}
        circleId={circleId}
        onClose={() => setRayaOpen(false)}
      />
    </div>
  );
}

export default QuranHifzCircleDetailPage;
