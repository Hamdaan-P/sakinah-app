/**
 * RayaHubPage — the dedicated "Raya, your Islamic personal agent" surface,
 * now a tabbed hub:
 *
 *   • Overview  — who Raya is, WhatsApp link, capabilities, connectors, privacy.
 *   • Activity  — actions log, reminders, chats (decrypted transcripts), memories.
 *   • Analytics — usage charts (messages, tools, busiest hours).
 *   • Insights  — Raya's read on you (quiet report + weekly insights) + your feedback.
 *
 * The Activity/Analytics/Insights tabs read from the user-scoped
 * `/raya/dashboard/*` endpoints (app/routes/raya_dashboard.py). They're
 * lazy-loaded so the overview (and recharts) only load when opened.
 *
 * Visual language matches the app: dark (#0A0E16 / #10151F) + gold (#D4A853).
 */

import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowSquareOut, BellRinging, BookOpen, Brain, CalendarBlank, ChartBar, ChatCircleDots,
  CheckCircle, Compass, EnvelopeSimple, FilePdf, GlobeHemisphereWest, GoogleDriveLogo,
  HouseSimple, Image as ImageIcon, Lightning, Lock, MagnifyingGlass, PencilSimple,
  ShieldCheck, Sparkle, VideoCamera, Wallet, WhatsappLogo,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { useAuthStore } from '@/core/stores/auth.store';
import {
  POLL_INTERVAL_MS,
  useLinkStatus,
  useMintLinkToken,
  useUnlinkWhatsApp,
} from '@/features/whatsapp-link/hooks/useWhatsAppLink';
import { openDeepLink } from '@/features/whatsapp-link/services/whatsappLinkService';
import { useConnectors, useDisconnect, useStartConnect } from '../hooks/useConnectors';
import type { ConnectorInfo } from '../services/connectorsService';
import { Card, GOLD, SectionTitle, SkeletonRows } from '../components/ui';

const ActivityTab = lazy(() => import('../components/ActivityTab'));
const AnalyticsTab = lazy(() => import('../components/AnalyticsTab'));
const InsightsTab = lazy(() => import('../components/InsightsTab').then((m) => ({ default: m.InsightsTab })));

type TabId = 'overview' | 'activity' | 'analytics' | 'insights';

const TABS: { id: TabId; label: string; icon: Icon }[] = [
  { id: 'overview', label: 'Overview', icon: HouseSimple },
  { id: 'activity', label: 'Activity', icon: Lightning },
  { id: 'analytics', label: 'Analytics', icon: ChartBar },
  { id: 'insights', label: 'Insights', icon: Sparkle },
];

// Map the backend's icon-name strings to phosphor components.
const CONNECTOR_ICONS: Record<string, Icon> = {
  CalendarBlank, EnvelopeSimple, VideoCamera, GoogleDriveLogo,
  GlobeHemisphereWest,
};

// ── Capability tiles — everything Raya does today (all wired) ──
const CAPABILITIES: { icon: Icon; title: string; desc: string }[] = [
  { icon: BookOpen, title: 'Quran & Hadith', desc: 'Verses with Arabic + translation, hadith, scholarly answers.' },
  { icon: Compass, title: 'Prayer & Qibla', desc: 'Prayer times anywhere, qibla direction, Hijri date.' },
  { icon: BellRinging, title: 'Reminders', desc: '“Remind me to…” — delivered to you on WhatsApp.' },
  { icon: MagnifyingGlass, title: 'Web search', desc: 'Live news, weather, scores, current info from the internet.' },
  { icon: Brain, title: 'Memory', desc: 'Remembers what matters to you and recalls it naturally.' },
  { icon: ImageIcon, title: 'Reads images', desc: 'Send a photo — Raya describes and answers about it.' },
  { icon: FilePdf, title: 'Reads PDFs', desc: 'Summarises documents you share.' },
  { icon: PencilSimple, title: 'Drafts messages', desc: 'Helps write replies, notes, and follow-ups.' },
  { icon: Wallet, title: 'Halal finance', desc: 'Shariah stock screening, market data, your DNZ wallet.' },
  { icon: Sparkle, title: 'Daily reflections', desc: 'Gratitude prompts and gentle check-ins (Shukur).' },
];

const VALID_TABS = new Set<string>(TABS.map((t) => t.id));

export function RayaHubPage() {
  const { user } = useAuthStore();
  const uid = user?.id;

  // Active tab — initialised from ?tab= and kept in the URL so it's shareable
  // and survives the OAuth round-trip.
  const [tab, setTab] = useState<TabId>(() => {
    const t = new URLSearchParams(window.location.search).get('tab');
    return t && VALID_TABS.has(t) ? (t as TabId) : 'overview';
  });

  const selectTab = (id: TabId) => {
    setTab(id);
    const params = new URLSearchParams(window.location.search);
    if (id === 'overview') params.delete('tab');
    else params.set('tab', id);
    const qs = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash);
  };

  // Link state — poll only while a link attempt is in flight.
  const [polling, setPolling] = useState(false);
  const { data: status } = useLinkStatus(
    polling ? { refetchInterval: POLL_INTERVAL_MS } : undefined,
  );
  const mint = useMintLinkToken();
  const unlink = useUnlinkWhatsApp();
  const pollStop = useRef<ReturnType<typeof setTimeout> | null>(null);

  const linked = !!status?.linked;

  // Stop polling once linked (or after the component unmounts).
  useEffect(() => {
    if (linked && pollStop.current) {
      clearTimeout(pollStop.current);
      setPolling(false);
    }
    return () => {
      if (pollStop.current) clearTimeout(pollStop.current);
    };
  }, [linked]);

  const handleConnect = async () => {
    try {
      const res = await mint.mutateAsync();
      await openDeepLink(res.deep_link);
      setPolling(true);
      // Safety: stop polling after 5 min if the user never completes it.
      pollStop.current = setTimeout(() => setPolling(false), 5 * 60 * 1000);
    } catch {
      /* surfaced via mint.isError below */
    }
  };

  // Connectors
  const { data: connectorsData } = useConnectors();
  const startConnect = useStartConnect();
  const disconnect = useDisconnect();
  const connectors = connectorsData?.connectors ?? [];

  // OAuth round-trip banner — the callback redirects back to /raya?connect=...
  const [connectBanner, setConnectBanner] = useState<'success' | 'error' | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flag = params.get('connect');
    if (flag === 'success' || flag === 'error') {
      setConnectBanner(flag);
      // Strip the query so a refresh doesn't re-show it.
      params.delete('connect');
      const qs = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash);
      const t = setTimeout(() => setConnectBanner(null), 6000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleConnectorToggle = async (id: string, connected: boolean) => {
    if (connected) {
      disconnect.mutate(id);
      return;
    }
    try {
      const { auth_url } = await startConnect.mutateAsync(id);
      window.location.href = auth_url; // full-page redirect into the OAuth consent
    } catch {
      setConnectBanner('error');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#0A0E16] via-[#0F141F] to-[#0F141F] min-h-full">
      <div className="w-full max-w-3xl mx-auto px-4 py-6 pb-28">
        {/* ── Tab bar ── */}
        <div className="flex gap-1 p-1 mb-6 rounded-2xl border border-[#D4A853]/15 bg-[#10151F]/60 sticky top-2 z-10 backdrop-blur">
          {TABS.map(({ id, label, icon: TabIcon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => selectTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  active ? 'bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16]' : 'text-[#C9C0A8]/70 hover:text-[#F5E8C7]'
                }`}
              >
                <TabIcon size={15} weight={active ? 'fill' : 'regular'} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {tab === 'overview' && (
          <OverviewTab
            linked={linked}
            status={status}
            polling={polling}
            mint={mint}
            unlink={unlink}
            onConnect={handleConnect}
            connectors={connectors}
            connectBanner={connectBanner}
            startConnect={startConnect}
            disconnect={disconnect}
            onConnectorToggle={handleConnectorToggle}
          />
        )}

        {tab !== 'overview' && (
          <Suspense fallback={<SkeletonRows rows={5} />}>
            {tab === 'activity' && <ActivityTab />}
            {tab === 'analytics' && <AnalyticsTab />}
            {tab === 'insights' && <InsightsTab uid={uid} />}
          </Suspense>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────── Overview tab ──────────────────────────── */

interface OverviewProps {
  linked: boolean;
  status: { phone?: string | null; linked_at?: string | null; linked?: boolean } | undefined;
  polling: boolean;
  mint: ReturnType<typeof useMintLinkToken>;
  unlink: ReturnType<typeof useUnlinkWhatsApp>;
  onConnect: () => void;
  connectors: ConnectorInfo[];
  connectBanner: 'success' | 'error' | null;
  startConnect: ReturnType<typeof useStartConnect>;
  disconnect: ReturnType<typeof useDisconnect>;
  onConnectorToggle: (id: string, connected: boolean) => void;
}

function OverviewTab({
  linked, status, polling, mint, unlink, onConnect,
  connectors, connectBanner, startConnect, disconnect, onConnectorToggle,
}: OverviewProps) {
  return (
    <>
      {/* ── Hero ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 mb-6 relative overflow-hidden">
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20"
            style={{ background: GOLD }}
          />
          <div className="flex items-center gap-2 mb-3">
            <Sparkle size={22} weight="fill" style={{ color: GOLD }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4A853]/70">
              Your personal agent
            </span>
          </div>
          <h1 className="text-[#F5E8C7] text-2xl font-bold leading-tight mb-2">
            Meet Raya — Islamic intelligence, on WhatsApp
          </h1>
          <p className="text-[#C9C0A8] text-sm leading-relaxed max-w-xl">
            Raya lives in your WhatsApp. Ask anything — Quran and prayer, reminders,
            the web, your finances — and she remembers you across every conversation.
            No new app to open; just message her like a friend.
          </p>
        </Card>
      </motion.div>

      {/* ── Connection ── */}
      <Card className="p-5 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center shrink-0">
            <WhatsappLogo size={26} weight="fill" className="text-[#25D366]" />
          </div>
          <div className="flex-1 min-w-0">
            {linked ? (
              <>
                <p className="text-[#F5E8C7] font-semibold flex items-center gap-1.5">
                  Connected
                  <CheckCircle size={16} weight="fill" className="text-emerald-400" />
                </p>
                <p className="text-[#C9C0A8]/70 text-xs mt-0.5 truncate">
                  {status?.phone || 'WhatsApp linked'}
                  {status?.linked_at
                    ? ` · since ${new Date(status.linked_at).toLocaleDateString()}`
                    : ''}
                </p>
                <button
                  onClick={() => unlink.mutate()}
                  disabled={unlink.isPending}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                >
                  {unlink.isPending ? 'Unlinking…' : 'Unlink WhatsApp'}
                </button>
              </>
            ) : (
              <>
                <p className="text-[#F5E8C7] font-semibold">Connect Raya to WhatsApp</p>
                <p className="text-[#C9C0A8]/70 text-xs mt-0.5">
                  {polling
                    ? 'Waiting for WhatsApp… complete the chat that just opened, then come back.'
                    : 'One tap opens a WhatsApp chat with Raya and links your account.'}
                </p>
                <button
                  onClick={onConnect}
                  disabled={mint.isPending || polling}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-[#0A0E16] bg-gradient-to-r from-[#D4A853] to-[#E8C97A] hover:opacity-95 transition-opacity disabled:opacity-60"
                >
                  <WhatsappLogo size={18} weight="fill" />
                  {mint.isPending ? 'Opening…' : polling ? 'Waiting…' : 'Chat with Raya'}
                  {!mint.isPending && !polling && <ArrowSquareOut size={15} />}
                </button>
                {mint.isError && (
                  <p className="text-red-400 text-xs mt-2">
                    Couldn’t start linking. Please try again.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {/* ── Capabilities (live) ── */}
      <SectionTitle hint="Available now, in any WhatsApp message">
        What Raya can do
      </SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {CAPABILITIES.map(({ icon: CapIcon, title, desc }) => (
          <Card key={title} className="p-3.5">
            <CapIcon size={22} weight="duotone" style={{ color: GOLD }} />
            <p className="text-[#F5E8C7] text-sm font-semibold mt-2">{title}</p>
            <p className="text-[#C9C0A8]/65 text-[11px] leading-snug mt-1">{desc}</p>
          </Card>
        ))}
      </div>

      {/* ── Connectors — real toggles + aspirational "Soon" tiles ── */}
      <SectionTitle hint="Connect your tools — Raya acts on them for you">
        Connectors
      </SectionTitle>

      {connectBanner && (
        <div
          className={`mb-3 rounded-xl px-4 py-2.5 text-sm border ${
            connectBanner === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {connectBanner === 'success'
            ? '✓ Connected. Raya can now use this in your conversations.'
            : 'Couldn’t connect. Please try again.'}
        </div>
      )}

      {/* Google — ONE unified connection (super-button) with capability cards
          below so users see what it unlocks. All four services run off the
          single google_workspace OAuth; the button connects/disconnects them
          all at once. */}
      {(() => {
        const gw = connectors.find((c) => c.id === 'google_workspace');
        if (!gw) return null;
        const busy =
          (startConnect.isPending && startConnect.variables === gw.id) ||
          (disconnect.isPending && disconnect.variables === gw.id);
        const subServices: { icon: Icon; name: string; desc: string }[] = [
          { icon: CalendarBlank,   name: 'Google Calendar', desc: 'Check, create, reschedule and cancel events.' },
          { icon: EnvelopeSimple,  name: 'Gmail',           desc: 'Read, send, reply, forward and trash email.' },
          { icon: VideoCamera,     name: 'Google Meet',     desc: 'Create, reschedule and cancel video calls.' },
          { icon: GoogleDriveLogo, name: 'Drive & Docs',    desc: 'Find, read, create, edit and trash files.' },
        ];
        return (
          <>
            {/* Single super-button controls all four Google services */}
            <Card className="p-4 mb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <GlobeHemisphereWest size={26} weight="duotone" style={{ color: gw.connected ? '#25D366' : GOLD }} />
                  <div className="min-w-0">
                    <p className="text-[#F5E8C7] text-sm font-semibold flex items-center gap-1.5">
                      Google
                      {gw.connected && <CheckCircle size={15} weight="fill" className="text-emerald-400" />}
                    </p>
                    <p className="text-[#C9C0A8]/65 text-[11px] leading-snug mt-0.5">
                      One tap connects all four below — Calendar, Gmail, Meet &amp; Drive.
                    </p>
                  </div>
                </div>
                {gw.available ? (
                  <button
                    onClick={() => onConnectorToggle(gw.id, gw.connected)}
                    disabled={busy}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 whitespace-nowrap ${
                      gw.connected
                        ? 'text-red-400 border border-red-400/30 hover:bg-red-400/10'
                        : 'text-[#0A0E16] bg-gradient-to-r from-[#D4A853] to-[#E8C97A] hover:opacity-95'
                    }`}
                  >
                    {busy ? '…' : gw.connected ? 'Disconnect Google' : 'Connect Google'}
                  </button>
                ) : (
                  <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-[#D4A853]/70 border border-[#D4A853]/30 rounded-full px-2 py-0.5 whitespace-nowrap">
                    Soon
                  </span>
                )}
              </div>
            </Card>

            {/* Capability cards — informational; status follows the super-button */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {subServices.map(({ icon: SvcIcon, name, desc }) => (
                <Card key={name} className="p-3.5">
                  <div className="flex items-start justify-between">
                    <SvcIcon size={22} weight="duotone" style={{ color: gw.connected ? '#25D366' : GOLD }} />
                    {gw.connected && (
                      <CheckCircle size={16} weight="fill" className="text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[#F5E8C7] text-sm font-semibold mt-2">{name}</p>
                  <p className="text-[#C9C0A8]/65 text-[11px] leading-snug mt-1">{desc}</p>
                </Card>
              ))}
            </div>
          </>
        );
      })()}

      {/* Any non-Google connectors (future integrations) — each its own toggle */}
      {connectors.filter((c) => c.id !== 'google_workspace').length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          {connectors.filter((c) => c.id !== 'google_workspace').map((c) => {
            const ConnIcon = CONNECTOR_ICONS[c.icon] ?? CalendarBlank;
            const busy =
              (startConnect.isPending && startConnect.variables === c.id) ||
              (disconnect.isPending && disconnect.variables === c.id);
            return (
              <Card key={c.id} className="p-3.5">
                <div className="flex items-start justify-between">
                  <ConnIcon size={22} weight="duotone" style={{ color: c.connected ? '#25D366' : GOLD }} />
                  {c.connected && (
                    <CheckCircle size={16} weight="fill" className="text-emerald-400" />
                  )}
                </div>
                <p className="text-[#F5E8C7] text-sm font-semibold mt-2">{c.name}</p>
                <p className="text-[#C9C0A8]/65 text-[11px] leading-snug mt-1 mb-3">{c.description}</p>
                {c.available ? (
                  <button
                    onClick={() => onConnectorToggle(c.id, c.connected)}
                    disabled={busy}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                      c.connected
                        ? 'text-red-400 border border-red-400/30 hover:bg-red-400/10'
                        : 'text-[#0A0E16] bg-gradient-to-r from-[#D4A853] to-[#E8C97A] hover:opacity-95'
                    }`}
                  >
                    {busy ? '…' : c.connected ? 'Disconnect' : 'Connect'}
                  </button>
                ) : (
                  <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-[#D4A853]/70 border border-[#D4A853]/30 rounded-full px-2 py-0.5">
                    Soon
                  </span>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Privacy ── */}
      <Card className="p-4 flex items-start gap-3 mt-5">
        <ShieldCheck size={20} weight="duotone" className="text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[#F5E8C7] text-sm font-semibold flex items-center gap-1.5">
            Your conversations are encrypted at rest
            <Lock size={13} weight="fill" className="text-emerald-400" />
          </p>
          <p className="text-[#C9C0A8]/65 text-[11px] leading-snug mt-1">
            Messages are stored encrypted. Raya reads them to help you, but a database
            leak alone reveals nothing. You can export or delete all your data anytime
            from <span className="text-[#D4A853]">Profile → Settings</span>.
          </p>
        </div>
      </Card>

      {/* Secondary link to the full link-management page */}
      <div className="mt-4 text-center">
        <a
          href="/settings/whatsapp"
          className="inline-flex items-center gap-1.5 text-[#C9C0A8]/60 text-xs hover:text-[#D4A853] transition-colors"
        >
          <ChatCircleDots size={14} />
          Manage WhatsApp connection
        </a>
      </div>
    </>
  );
}

export default RayaHubPage;
