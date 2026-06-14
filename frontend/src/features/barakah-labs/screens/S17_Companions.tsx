import { useEffect, useState } from 'react';
import { useBarakahFlow } from '../stores/barakah-flow.store';
import { useAuthStore } from '@/core/stores/auth.store';
import { BackHeader } from '../components/Greet';
import { HeartIconFilled } from '../components/icons';
import { useActiveCount } from '../hooks/usePresence';
import {
  subscribeToMyCircles,
  type CircleMembership,
} from '../services/circleService';
import {
  getCachedWisdomFeed,
  subscribeToWisdomFeed,
  type WisdomCard,
} from '../services/wisdomService';
import { CreateCircleModal } from '../components/CreateCircleModal';
import { AnimatePresence, motion } from 'framer-motion';

function formatAgo(ms: number): string {
  if (!ms) return 'just now';
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

function ago(ms: number): string {
  const diff = Date.now() - ms;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  if (days < 14) return 'a week';
  return `${Math.floor(days / 7)} weeks`;
}

export function S17_Companions() {
  const go = useBarakahFlow((s) => s.go);
  const setSelectedCircleId = useBarakahFlow((s) => s.setSelectedCircleId);
  const uid = useAuthStore((s) => s.user?.id);
  const presence = useActiveCount();
  const [ranked, setRanked] = useState<WisdomCard[]>(() => getCachedWisdomFeed(6) ?? []);
  const [wisdomLoaded, setWisdomLoaded] = useState<boolean>(() => getCachedWisdomFeed(6) !== null);
  const [myCircles, setMyCircles] = useState<CircleMembership[]>([]);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  // Rotator state: tick advances every 5s, paused on hover/touch.
  const [streamTick, setStreamTick] = useState(0);
  const [streamPaused, setStreamPaused] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeToMyCircles(uid, setMyCircles);
    return () => unsub();
  }, [uid]);

  const openCircle = (circleId: string) => {
    setSelectedCircleId(circleId);
    go('s18');
  };

  // Wisdom feed — cached fetch via backend, hot-score ranked.
  useEffect(() => {
    const unsub = subscribeToWisdomFeed((cards) => {
      setRanked(cards);
      setWisdomLoaded(true);
    }, 6);
    return () => unsub();
  }, []);

  // Single-card rotator through the hot-ranked pool. 5s cadence, paused on hover/touch.
  useEffect(() => {
    if (streamPaused) return;
    if (ranked.length === 0) return;
    const id = setInterval(() => setStreamTick((t) => t + 1), 5_000);
    return () => clearInterval(id);
  }, [streamPaused, ranked.length]);

  const streamItem = ranked.length > 0 ? ranked[streamTick % ranked.length] : null;

  return (
    <div className="bk-screen">
      <BackHeader to="s01" center={<div className="bk-salam alt">Your trail</div>} />

      <div className="bk-subnav">
        <button className="bk-subnav-item" onClick={() => go('s16')}>Yours</button>
        <div className="bk-subnav-item active">Companions</div>
      </div>

      <div className="bk-body-scroll">
        {/* HERO BAND — centered presence indicator + title */}
        <div className="bk-trail-band">
          <div className="bk-presence">
            <div className="bk-presence-field">
              <svg viewBox="0 0 320 80" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <radialGradient id="bk-far-light" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4FB892" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#4FB892" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {[
                  { cx: 30, cy: 40, r: 10, begin: '0s' },
                  { cx: 80, cy: 20, r: 8, begin: '0.5s' },
                  { cx: 130, cy: 55, r: 11, begin: '1s' },
                  { cx: 180, cy: 30, r: 9, begin: '1.5s' },
                  { cx: 230, cy: 50, r: 10, begin: '2s' },
                  { cx: 280, cy: 25, r: 8, begin: '2.5s' },
                  { cx: 155, cy: 15, r: 7, begin: '0.3s' },
                ].map((c, i) => (
                  <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="url(#bk-far-light)">
                    <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" begin={c.begin} repeatCount="indefinite" />
                  </circle>
                ))}
              </svg>
            </div>
            <div className="bk-presence-title">Right now, you are not alone.</div>
            <div className="bk-presence-meta">
              <span className="bk-breathe-dot" />
              <span>
                {presence === 1
                  ? 'You are noticing right now'
                  : `${presence} are noticing across the world`}
              </span>
            </div>
          </div>
        </div>

        {/* 2-COL GRID — wisdom left, circles right */}
        <div className="bk-trail-grid">
          <div className="bk-trail-left">
            {/* Single-card rotator through the hot-ranked public_blessings pool. */}
            <div
              className="bk-wisdom-rotator"
              onMouseEnter={() => setStreamPaused(true)}
              onMouseLeave={() => setStreamPaused(false)}
              onTouchStart={() => setStreamPaused(true)}
              onTouchEnd={() => setStreamPaused(false)}
            >
              <div className="bk-wisdom-rotator-head">
                <span className="bk-section-eyebrow"><span>Shared by a companion</span></span>
                {streamItem && (
                  <span className="bk-wisdom-rotator-live">
                    <span className="bk-breathe-dot" />
                    <span>{streamPaused ? 'paused' : 'live'}</span>
                  </span>
                )}
              </div>
              {!wisdomLoaded ? (
                <div className="bk-wisdom-empty">Listening…</div>
              ) : !streamItem ? (
                <div className="bk-wisdom-empty">
                  Nothing has been shared yet. When someone ticks "Share with the community"
                  on a noticing, it will surface here.
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${streamItem.id}-${streamTick}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="bk-wisdom"
                  >
                    <div className="bk-wisdom-body">&ldquo;{streamItem.text}&rdquo;</div>
                    <div className="bk-wisdom-foot">
                      <span>From a companion · {ago(streamItem.createdAt)}</span>
                      {streamItem.likesCount > 0 && (
                        <span className="bk-wisdom-rotator-likes">
                          <HeartIconFilled />
                          <span>{streamItem.likesCount}</span>
                        </span>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>

          <div className="bk-trail-right">
            <div className="bk-circles">
              <div className="bk-section-eyebrow"><span>Your circles</span></div>
              {myCircles.length === 0 ? (
                <div className="bk-circle-empty">
                  <div className="bk-circle-empty-t">No circles yet.</div>
                  <div className="bk-circle-empty-m">
                    A circle is a private space for shared noticings — start one to invite people you trust.
                  </div>
                </div>
              ) : (
                myCircles.map((c) => (
                  <button
                    key={c.circleId}
                    className="bk-circle-card"
                    onClick={() => openCircle(c.circleId)}
                  >
                    <div>
                      <div className="bk-circle-name">{c.circleName}</div>
                      <div className="bk-circle-meta">
                        Joined {formatAgo(c.joinedAt)}
                        {c.role === 'owner' ? <> · <span className="live">you started this</span></> : null}
                      </div>
                    </div>
                    <div className="bk-circle-arrow">›</div>
                  </button>
                ))
              )}
              <button className="bk-new-circle" onClick={() => setCreateOpen(true)}>
                + Start a circle of your own
              </button>
            </div>

            <div className="bk-quiet-note">
              You won't find rankings or scores here. The Prophet ﷺ taught us that what is most private about our worship
              is most precious to Allah. So we keep it that way.
            </div>
          </div>
        </div>
      </div>

      <CreateCircleModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => {
          setSelectedCircleId(id);
          go('s18');
        }}
      />
    </div>
  );
}
