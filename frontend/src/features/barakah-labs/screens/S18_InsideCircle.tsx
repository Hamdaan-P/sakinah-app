import { useEffect, useMemo, useRef, useState } from 'react';
import { useBarakahFlow } from '../stores/barakah-flow.store';
import { useAuthStore } from '@/core/stores/auth.store';
import { BackHeader } from '../components/Greet';
import {
  createPost,
  createReply,
  deletePost,
  subscribeToCircle,
  subscribeToMembers,
  subscribeToPosts,
  subscribeToReplies,
  type Circle,
  type CircleMember,
  type CirclePost,
  type CircleReply,
} from '../services/circleService';
import { InviteMembersModal } from '../components/InviteMembersModal';
import { ViewMembersSheet } from '../components/ViewMembersSheet';
import { refreshCircleSharedSeed } from '../services/rayaService';

// ── Time helpers ──────────────────────────────────────────────────────────

function ago(ms: number): string {
  if (!ms) return 'just now';
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(ms: number): string {
  if (!ms) return 'Today';
  const d = new Date(ms);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((today - target) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function initialOf(name: string): string {
  return name?.trim()?.[0]?.toUpperCase() ?? '?';
}

function firstName(displayName?: string, email?: string): string {
  if (displayName?.trim()) return displayName.trim().split(/\s+/)[0];
  if (email) return email.split('@')[0];
  return 'You';
}

function useAutoGrow(value: string, maxRows: number = 6): React.RefObject<HTMLTextAreaElement | null> {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const style = window.getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight) || 22;
    const max = lineHeight * maxRows + 20;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
  }, [value, maxRows]);
  return ref;
}

// ── Quick-prompt starters (used when composer is empty) ───────────────────

const STARTERS: ReadonlyArray<{ label: string; text: string }> = [
  { label: 'Gratitude', text: "Today I'm grateful for " },
  { label: 'Small mercy', text: 'A small mercy I noticed today: ' },
  { label: 'Sitting with', text: "Something I'm sitting with: " },
];

// ── Message bubble ────────────────────────────────────────────────────────

function MessageBubble({
  circleId,
  post,
  meUid,
  meName,
  onDelete,
}: {
  circleId: string;
  post: CirclePost;
  meUid: string | null | undefined;
  meName: string;
  onDelete: (postId: string) => void;
}) {
  const [replies, setReplies] = useState<CircleReply[]>([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const replyRef = useAutoGrow(text, 4);

  useEffect(() => {
    const unsub = subscribeToReplies(circleId, post.id, setReplies);
    return () => unsub();
  }, [circleId, post.id]);

  const send = async () => {
    if (!meUid || !text.trim() || sending) return;
    setSending(true);
    try {
      await createReply(circleId, post.id, meUid, meName, text);
      setText('');
      setOpen(false);
    } catch {
      /* keep simple */
    } finally {
      setSending(false);
    }
  };

  const isMine = !!(meUid && post.authorUid === meUid);

  const handleDelete = () => {
    if (window.confirm('Delete this noticing? This cannot be undone.')) {
      onDelete(post.id);
    }
  };

  return (
    <div className={`bk-c2-msg ${isMine ? 'mine' : ''}`}>
      <div className="bk-c2-msg-avatar" aria-hidden>{initialOf(post.authorName)}</div>
      <div className="bk-c2-msg-content">
        <div className="bk-c2-msg-head">
          <span className="bk-c2-msg-author">
            {isMine ? 'You' : (post.authorName || 'A companion')}
          </span>
          <span className="bk-c2-msg-time" title={new Date(post.createdAt).toLocaleString()}>
            {ago(post.createdAt)}
          </span>
        </div>
        <div className="bk-c2-msg-body">{post.text}</div>

        {replies.length > 0 && (
          <div className="bk-c2-msg-replies">
            {replies.map((r) => (
              <div key={r.id} className="bk-c2-msg-reply">
                <div className="bk-c2-msg-reply-head">
                  <span>{r.authorName || 'A companion'}</span>
                  <span className="bk-c2-msg-reply-time">{ago(r.createdAt)}</span>
                </div>
                <div className="bk-c2-msg-reply-body">{r.text}</div>
              </div>
            ))}
          </div>
        )}

        {open ? (
          <div className="bk-c2-reply-compose">
            <textarea
              ref={replyRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a reply…"
              maxLength={2000}
              rows={1}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              disabled={sending}
            />
            <div className="bk-c2-reply-actions">
              <button
                type="button"
                className="bk-c2-reply-cancel"
                onClick={() => {
                  setOpen(false);
                  setText('');
                }}
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bk-c2-reply-send"
                onClick={() => void send()}
                disabled={sending || !text.trim()}
              >
                {sending ? 'Sending…' : 'Reply'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bk-c2-msg-actions">
            <button type="button" className="bk-c2-reply-link" onClick={() => setOpen(true)}>
              Reply
            </button>
            {isMine && (
              <button type="button" className="bk-c2-delete-link" onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pending (optimistic) bubble — same shell, no reply/delete actions ─────

function PendingBubble({
  text,
  meName,
  createdAt,
  failed,
  onRetry,
  onDiscard,
}: {
  text: string;
  meName: string;
  createdAt: number;
  failed: boolean;
  onRetry: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className={`bk-c2-msg mine pending ${failed ? 'failed' : ''}`}>
      <div className="bk-c2-msg-avatar" aria-hidden>{initialOf(meName)}</div>
      <div className="bk-c2-msg-content">
        <div className="bk-c2-msg-head">
          <span className="bk-c2-msg-author">You</span>
          <span className="bk-c2-msg-time" title={new Date(createdAt).toLocaleString()}>
            {failed ? 'failed' : 'sending…'}
          </span>
        </div>
        <div className="bk-c2-msg-body">{text}</div>
        {failed && (
          <div className="bk-c2-msg-actions">
            <button type="button" className="bk-c2-reply-link" onClick={onRetry}>
              Retry
            </button>
            <button type="button" className="bk-c2-delete-link" onClick={onDiscard}>
              Discard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Feed renderer with day separators ─────────────────────────────────────

type PendingPost = { tempId: string; text: string; createdAt: number; failed: boolean };

type FeedItem =
  | { kind: 'sep'; key: string; label: string }
  | { kind: 'real'; key: string; post: CirclePost }
  | { kind: 'pending'; key: string; post: PendingPost };

function buildFeedItems(real: CirclePost[], pending: PendingPost[]): FeedItem[] {
  const realAsc = [...real].sort((a, b) => a.createdAt - b.createdAt);
  const pendAsc = [...pending].sort((a, b) => a.createdAt - b.createdAt);
  const items: FeedItem[] = [];
  let lastDay: string | null = null;

  const push = (ms: number, item: FeedItem) => {
    const key = dayKey(ms);
    if (key !== lastDay) {
      items.push({ kind: 'sep', key: `sep-${key}-${items.length}`, label: dayLabel(ms) });
      lastDay = key;
    }
    items.push(item);
  };

  for (const p of realAsc) {
    push(p.createdAt, { kind: 'real', key: `r-${p.id}`, post: p });
  }
  for (const p of pendAsc) {
    push(p.createdAt, { kind: 'pending', key: `p-${p.tempId}`, post: p });
  }
  return items;
}

// ── Main screen ───────────────────────────────────────────────────────────

export function S18_InsideCircle() {
  const go = useBarakahFlow((s) => s.go);
  const circleId = useBarakahFlow((s) => s.selectedCircleId);
  const user = useAuthStore((s) => s.user);
  const meUid = user?.id;
  const meName = useMemo(() => firstName(user?.displayName, user?.email), [user]);

  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [posts, setPosts] = useState<CirclePost[]>([]);
  const [pending, setPending] = useState<PendingPost[]>([]);

  const [composer, setComposer] = useState('');
  const [posting, setPosting] = useState(false);
  const composerRef = useAutoGrow(composer, 6);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [refreshingSeed, setRefreshingSeed] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const isOwner = !!(circle && meUid && circle.createdBy === meUid);
  const memberUidSet = useMemo(() => new Set(members.map((m) => m.uid)), [members]);
  const feedItems = useMemo(() => buildFeedItems(posts, pending), [posts, pending]);

  // Drop pending whose text matches a server-delivered post by me within 60s
  // (the subscription has caught up — show the real one, not the temp).
  useEffect(() => {
    if (pending.length === 0 || !meUid) return;
    setPending((prev) =>
      prev.filter(
        (p) =>
          !posts.some(
            (s) =>
              s.authorUid === meUid &&
              s.text.trim() === p.text.trim() &&
              Math.abs(s.createdAt - p.createdAt) < 60_000,
          ),
      ),
    );
  }, [posts, meUid, pending.length]);

  // Auto-scroll feed to bottom when new posts / pendings arrive.
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [posts.length, pending.length]);

  const refreshSeed = async () => {
    if (!circleId || refreshingSeed) return;
    setRefreshingSeed(true);
    setToast(null);
    try {
      await refreshCircleSharedSeed(circleId);
      setToast('A new reflection prompt is ready.');
      window.setTimeout(() => setToast(null), 3500);
    } catch (e: unknown) {
      setToast(e instanceof Error ? e.message : 'Could not refresh the prompt.');
      window.setTimeout(() => setToast(null), 4500);
    } finally {
      setRefreshingSeed(false);
    }
  };

  useEffect(() => {
    if (!circleId) return;
    const unsubCircle = subscribeToCircle(circleId, setCircle);
    const unsubMembers = subscribeToMembers(circleId, setMembers);
    const unsubPosts = subscribeToPosts(circleId, setPosts);
    return () => {
      unsubCircle();
      unsubMembers();
      unsubPosts();
    };
  }, [circleId]);

  if (!circleId) {
    return (
      <div className="bk-screen">
        <BackHeader to="s17" />
        <div className="bk-circle-bailout">
          <div className="bk-circle-bailout-title">Pick a circle first</div>
          <div className="bk-circle-bailout-sub">
            Open one of your circles from the Companions tab, or start a new one.
          </div>
          <button className="bk-modal-confirm" style={{ maxWidth: 280 }} onClick={() => go('s17')}>
            Back to companions
          </button>
        </div>
      </div>
    );
  }

  const doCreate = async (tempId: string, text: string) => {
    if (!meUid) return;
    try {
      await createPost(circleId, meUid, meName, text);
      // Success — the subscription will deliver the server version. Effect
      // above will dedupe the temp out. If the server is slow, the temp
      // hangs around briefly which is fine.
    } catch {
      setPending((prev) => prev.map((p) => (p.tempId === tempId ? { ...p, failed: true } : p)));
      setToast("Couldn't share — tap Retry on the message.");
      window.setTimeout(() => setToast(null), 4000);
    }
  };

  const submitPost = () => {
    if (!meUid || !composer.trim() || posting) return;
    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const text = composer.trim();
    const createdAt = Date.now();
    setPending((prev) => [...prev, { tempId, text, createdAt, failed: false }]);
    setComposer('');
    setPosting(true);
    void doCreate(tempId, text).finally(() => setPosting(false));
  };

  const retryPending = (tempId: string) => {
    const p = pending.find((x) => x.tempId === tempId);
    if (!p) return;
    setPending((prev) => prev.map((x) => (x.tempId === tempId ? { ...x, failed: false } : x)));
    void doCreate(tempId, p.text);
  };

  const discardPending = (tempId: string) => {
    setPending((prev) => prev.filter((x) => x.tempId !== tempId));
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(circleId, postId);
      setToast('Noticing removed.');
      window.setTimeout(() => setToast(null), 2500);
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Could not remove it.');
      window.setTimeout(() => setToast(null), 4000);
    }
  };

  const handleComposerKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      submitPost();
    }
  };

  const handleStarter = (text: string) => {
    setComposer(text);
    window.setTimeout(() => composerRef.current?.focus(), 0);
  };

  const memberCount = members.length || circle?.memberCount || 1;
  const visibleAvatars = members.slice(0, 6);
  const extraAvatars = Math.max(0, members.length - visibleAvatars.length);
  const sharedSeed = circle?.sharedSeed;
  const showChips = composer.length === 0;

  return (
    <div className="bk-screen bk-c2-screen">
      <BackHeader to="s17" />

      <div className="bk-c2-header">
        <div className="bk-c2-header-main">
          <div className="bk-c2-name">{circle?.name ?? 'Loading…'}</div>
          <div className="bk-c2-meta">
            <span className="bk-c2-lock" aria-hidden>
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
                <rect x="1" y="6" width="9" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1" />
                <path d="M3 6V3.5a2.5 2.5 0 1 1 5 0V6" stroke="currentColor" strokeWidth="1" />
              </svg>
            </span>
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'} · private</span>
          </div>
        </div>
        {isOwner ? (
          <button
            type="button"
            className="bk-c2-invite"
            onClick={() => setInviteOpen(true)}
            aria-label="Invite to circle"
          >
            + Invite
          </button>
        ) : null}
      </div>

      {members.length > 0 && (
        <button
          type="button"
          className="bk-c2-avatars bk-c2-avatars-btn"
          aria-label={`Circle members (${members.length}). Tap to view all.`}
          onClick={() => setMembersOpen(true)}
        >
          {visibleAvatars.map((m) => (
            <div
              key={m.uid}
              className={`bk-c2-avatar ${m.uid === meUid ? 'you' : ''}`}
              title={m.displayName || 'A companion'}
            >
              {initialOf(m.displayName)}
            </div>
          ))}
          {extraAvatars > 0 && (
            <div className="bk-c2-avatar more" title={`${extraAvatars} more`}>
              +{extraAvatars}
            </div>
          )}
          <span className="bk-c2-avatars-link" aria-hidden>view all</span>
        </button>
      )}

      {sharedSeed ? (
        <div className="bk-c2-prompt">
          <div className="bk-c2-prompt-row">
            <span className="bk-c2-prompt-label">This week's reflection prompt</span>
            {isOwner ? (
              <button
                type="button"
                className="bk-c2-prompt-refresh"
                onClick={() => void refreshSeed()}
                disabled={refreshingSeed}
              >
                {refreshingSeed ? 'Refreshing…' : 'Refresh'}
              </button>
            ) : null}
          </div>
          <div className="bk-c2-prompt-text">&ldquo;{sharedSeed.prompt}&rdquo;</div>
          <div className="bk-c2-prompt-meta">{sharedSeed.context}</div>
        </div>
      ) : isOwner ? (
        <div className="bk-c2-prompt empty">
          <div className="bk-c2-prompt-label">This week's reflection prompt</div>
          <div className="bk-c2-prompt-text muted">
            No prompt yet — ask Raya to draw one from this circle's recent noticings.
          </div>
          <button
            type="button"
            className="bk-c2-prompt-offer"
            onClick={() => void refreshSeed()}
            disabled={refreshingSeed}
          >
            {refreshingSeed ? 'Raya is drawing one…' : '+ Offer a prompt for this week'}
          </button>
        </div>
      ) : null}

      <div className="bk-c2-feed" ref={feedRef}>
        {feedItems.length === 0 ? (
          <div className="bk-c2-empty">
            <div className="bk-c2-empty-title">It&apos;s quiet here.</div>
            <div className="bk-c2-empty-body">
              Share what you noticed today — a small mercy, a quiet gratitude, anything
              that caught your heart. Only people in this circle can read it.
            </div>
            <div className="bk-c2-empty-eg">
              e.g. &ldquo;I felt calm during fajr today&rdquo;
            </div>
          </div>
        ) : (
          feedItems.map((it) => {
            if (it.kind === 'sep') {
              return (
                <div key={it.key} className="bk-c2-day-sep">
                  <span>{it.label}</span>
                </div>
              );
            }
            if (it.kind === 'pending') {
              return (
                <PendingBubble
                  key={it.key}
                  text={it.post.text}
                  meName={meName}
                  createdAt={it.post.createdAt}
                  failed={it.post.failed}
                  onRetry={() => retryPending(it.post.tempId)}
                  onDiscard={() => discardPending(it.post.tempId)}
                />
              );
            }
            return (
              <MessageBubble
                key={it.key}
                circleId={circleId}
                post={it.post}
                meUid={meUid}
                meName={meName}
                onDelete={(id) => void handleDeletePost(id)}
              />
            );
          })
        )}
      </div>

      {showChips && (
        <div className="bk-c2-chips" aria-label="Quick start prompts">
          {STARTERS.map((s) => (
            <button
              key={s.label}
              type="button"
              className="bk-c2-chip"
              onClick={() => handleStarter(s.text)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="bk-c2-composer">
        <textarea
          ref={composerRef}
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
          onKeyDown={handleComposerKey}
          placeholder="Share what you noticed today…"
          maxLength={4000}
          rows={1}
          disabled={posting}
          aria-label="Share with the circle"
        />
        <button
          type="button"
          className="bk-c2-send"
          onClick={submitPost}
          disabled={posting || !composer.trim()}
          aria-label="Share with the circle"
        >
          {posting ? '…' : 'Share'}
        </button>
      </div>

      <InviteMembersModal
        open={inviteOpen}
        circleId={circleId}
        existingMemberUids={memberUidSet}
        onClose={() => setInviteOpen(false)}
        onInvited={(added) => {
          setToast(
            added === 0
              ? 'Already in the circle.'
              : added === 1
                ? 'One companion invited.'
                : `${added} companions invited.`,
          );
          window.setTimeout(() => setToast(null), 3500);
        }}
      />

      <ViewMembersSheet
        open={membersOpen}
        members={members}
        meUid={meUid}
        onClose={() => setMembersOpen(false)}
      />

      {toast ? <div className="bk-circle-toast">{toast}</div> : null}
    </div>
  );
}
