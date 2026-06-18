/**
 * WaliDashboardPage — /sakinah/wali-dashboard
 * Guardian's home screen. Shows active seeker journeys they are supporting,
 * or a warm waiting state when no invitations have arrived yet.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { getWaliConversations, getPendingWaliInvites, acceptWaliInvite, declineWaliInvite, getWaliNotifications } from '../services/sakinahService';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

interface WaliConversation {
  match_id: string;
  seeker_name: string;
  current_topic: string | null;
  matchflow_step: number;
}

interface WaliInvite {
  request_id: string;
  seeker_name: string;
  match_id: string | null;
}

export function WaliDashboardPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<WaliConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingInvites, setPendingInvites] = useState<WaliInvite[]>([]);
  const [actedInvites, setActedInvites] = useState<Record<string, 'accepted' | 'declined'>>({});
  const [waliNotifications, setWaliNotifications] = useState<any[]>([]);

  const user = getAuth().currentUser;
  const waliName = user?.displayName || 'Guardian';

  const loadData = async () => {
    try {
      const [convoData, inviteData, notifData] = await Promise.all([
        getWaliConversations(),
        getPendingWaliInvites(),
        getWaliNotifications(),
      ]);
      setConversations(convoData.conversations || []);
      setPendingInvites(inviteData.invitations || []);
      setWaliNotifications(notifData.notifications || []);
      console.log('notifications:', notifData);
    } catch (err) {
      console.error('loadData error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PAGE_BG,
        color: '#EDE7DA',
        fontFamily: "'Manrope', sans-serif",
        WebkitFontSmoothing: 'antialiased',
        padding: '48px 24px 80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 40 }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: 'rgba(212,168,83,.55)',
              marginBottom: 8,
            }}
          >
            As-salamu alaykum, {waliName}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 32, fontWeight: 500, lineHeight: 1.1,
                color: '#EDE7DA', margin: 0,
              }}
            >
              Your Dashboard
            </h1>
            <span
              style={{
                fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: '#D4A853',
                border: '1px solid rgba(212,168,83,.3)',
                borderRadius: 20, padding: '4px 10px',
                background: 'rgba(212,168,83,.06)',
              }}
            >
              Guardian
            </span>
          </div>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic', fontSize: 15,
              color: '#5f6675', margin: 0, lineHeight: 1.5,
            }}
          >
            You are here to steward, not to decide.
          </p>
        </motion.div>

        {/* ── Decision notifications ── */}
        {waliNotifications.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '2px', marginBottom: '12px' }}>
              DECISION RECEIVED
            </p>
            {waliNotifications.map((notif) => (
              <div key={notif.notification_id} style={{
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.5)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🤲</span>
                  <p style={{ color: '#C9A84C', fontWeight: 600, margin: 0, fontSize: '15px' }}>
                    Nikah Decision
                  </p>
                </div>
                <p style={{ color: '#fff', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                  {notif.message}
                </p>
                <p style={{ color: '#555', margin: '8px 0 0', fontSize: '12px' }}>
                  In sha Allah, this is the beginning of something blessed.
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Pending invitations ── */}
        {pendingInvites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            style={{ marginBottom: 28 }}
          >
            <div
              style={{
                fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: '#C9A84C', marginBottom: 12,
              }}
            >
              You have been invited
            </div>

            {pendingInvites.map((inv) => (
                <div
                  key={inv.request_id}
                  style={{
                    border: '1px solid rgba(201,168,76,.35)',
                    borderRadius: 16, padding: '18px 20px',
                    background: 'rgba(201,168,76,.04)',
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 17, fontWeight: 500,
                      color: '#EDE7DA', marginBottom: 6,
                    }}
                  >
                    {inv.seeker_name} has invited you to support their journey
                  </div>
                  {actedInvites[inv.request_id] === 'accepted' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C9A84C', fontWeight: 600, fontSize: '14px', marginTop: '8px' }}>
                      <span style={{ fontSize: '18px' }}>✓</span> Accepted — JazakAllah khair
                    </div>
                  ) : actedInvites[inv.request_id] === 'declined' ? (
                    <div style={{ color: '#888', fontSize: '14px', marginTop: '8px' }}>Declined</div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button
                        onClick={async () => {
                          try {
                            await acceptWaliInvite(inv.request_id);
                            setActedInvites(prev => ({ ...prev, [inv.request_id]: 'accepted' }));
                            getWaliConversations()
                              .then((data: any) => setConversations(data?.conversations ?? []))
                              .catch(console.error);
                          } catch (e) {
                            console.error('acceptWaliInvite failed:', e);
                          }
                        }}
                        style={{
                          border: '1px solid #C9A84C',
                          borderRadius: 20, padding: '8px 20px',
                          background: 'rgba(201,168,76,.1)',
                          color: '#C9A84C',
                          fontFamily: "'Manrope', sans-serif",
                          fontSize: 13, fontWeight: 500,
                          cursor: 'pointer', transition: '.2s',
                        }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await declineWaliInvite(inv.request_id);
                            setActedInvites(prev => ({ ...prev, [inv.request_id]: 'declined' }));
                          } catch (e) {
                            console.error('declineWaliInvite failed:', e);
                          }
                        }}
                        style={{
                          border: '1px solid rgba(255,255,255,.08)',
                          borderRadius: 20, padding: '8px 20px',
                          background: 'transparent',
                          color: '#9aa0ac',
                          fontFamily: "'Manrope', sans-serif",
                          fontSize: 13,
                          cursor: 'pointer', transition: '.2s',
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </motion.div>
        )}

        {/* ── Waiting message — only when no active journeys ── */}
        {!loading && conversations.length === 0 && <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            border: '1px solid rgba(255,255,255,.06)',
            borderRadius: 18, padding: '22px 24px',
            background: 'rgba(255,255,255,.01)',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 19, fontWeight: 500,
              color: '#EDE7DA', marginBottom: 8,
            }}
          >
            Waiting for an invitation
          </div>
          <p
            style={{
              fontSize: 13, color: '#9aa0ac', fontWeight: 300,
              lineHeight: 1.65, margin: 0,
            }}
          >
            When your son or daughter invites you from within their conversation,
            their journey will appear here — in sha Allah.
          </p>
        </motion.div>}

        {/* ── Journeys section ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div
            style={{
              fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'rgba(212,168,83,.55)', marginBottom: 16,
            }}
          >
            Journeys you are supporting
          </div>

          {loading && (
            <div
              style={{
                fontSize: 13, color: '#5f6675', fontWeight: 300,
                padding: '20px 0', textAlign: 'center',
              }}
            >
              Loading...
            </div>
          )}

          {!loading && conversations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {conversations.map((conv, i) => (
                <motion.div
                  key={conv.match_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                  style={{
                    border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: 18,
                    padding: '20px 22px',
                    background: 'rgba(255,255,255,.015)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 20, fontWeight: 500,
                        color: '#EDE7DA', marginBottom: 4,
                      }}
                    >
                      {conv.seeker_name}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#5f6675', fontWeight: 300 }}>
                      {conv.current_topic
                        ? `Currently exploring: ${conv.current_topic}`
                        : `Step ${conv.matchflow_step} of the journey`}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/sakinah/conversation/${conv.match_id}`)}
                    style={{
                      flexShrink: 0,
                      border: '1px solid rgba(212,168,83,.28)',
                      borderRadius: 12,
                      padding: '10px 16px',
                      background: 'rgba(212,168,83,.06)',
                      color: '#e7c984',
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: 12.5, fontWeight: 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'background .2s',
                    }}
                  >
                    View conversation
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && conversations.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div
                style={{
                  border: '1px solid rgba(255,255,255,.07)',
                  borderRadius: 22,
                  padding: '32px 28px',
                  background: 'rgba(255,255,255,.015)',
                  textAlign: 'center',
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>🤲</div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22, fontWeight: 500,
                    color: '#EDE7DA', marginBottom: 10,
                  }}
                >
                  Your presence awaits
                </div>
                <p
                  style={{
                    fontSize: 13, color: '#9aa0ac', fontWeight: 300,
                    lineHeight: 1.65, margin: 0,
                  }}
                >
                  A guardian's role begins with an invitation. When they are ready to share
                  their journey, it will appear here — in sha Allah.
                </p>
              </div>

              {/* Raya note */}
              <div
                style={{
                  display: 'flex', gap: 11, alignItems: 'flex-start',
                  padding: '14px 16px',
                  background: 'rgba(212,168,83,.03)',
                  border: '1px solid rgba(212,168,83,.1)',
                  borderRadius: 16,
                }}
              >
                <div
                  style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: '#3a2c0c',
                    marginTop: 1,
                  }}
                >
                  ر
                </div>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic', fontSize: 14.5,
                    color: '#e7c984', lineHeight: 1.55, margin: 0,
                  }}
                >
                  Your role is one of presence and wisdom. The decision will always be theirs.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ── Footer principle ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            textAlign: 'center',
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 13, color: '#3a3530',
            marginTop: 48, lineHeight: 1.6,
          }}
        >
          A wali may steward, never decide — Sakinah
        </motion.p>

      </div>
    </div>
  );
}

export default WaliDashboardPage;
