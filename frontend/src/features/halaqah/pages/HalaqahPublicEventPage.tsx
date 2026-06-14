/**
 * Halaqah Public Event Page — landing target for shared invites.
 * Deep-linkable, no auth required to preview. Captures the ?ref= referrer
 * for attribution.
 *
 * In v1 this reads from the same mock event list as HalaqahPage (since the
 * feature is still mock-data driven). When the host backend ships, swap the
 * data source to a real Firestore read.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Clock, Users, ShieldCheck, ShareNetwork, Star, Sparkle } from '@phosphor-icons/react';
import { logEventLanding, captureIncomingReferral } from '../services/halaqahShareService';
import { HalaqahShareSheet } from '../components/HalaqahShareSheet';

interface PublicEvent {
  id: string;
  name: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  venueAddress: string;
  capacity: number;
  attendeeCount: number;
  description: string;
  hostName: string;
  hostRating: number;
  hostVerified: boolean;
}

// Stub fetch — currently mock-only; gated below so prod deep-links don't surface fake data.
// TODO: replace with Firestore-backed fetch once the public events collection lands.
async function fetchPublicEvent(id: string): Promise<PublicEvent | null> {
  try {
    const mod = await import('../data/mockEvents');
    return mod.MOCK_EVENTS.find((e) => e.id === id) ?? null;
  } catch {
    return null;
  }
}

// Hide the mock-backed page from production users until Firestore wiring lands.
// Set VITE_ENABLE_PUBLIC_HALAQAH=true to opt in (dev/staging).
const PUBLIC_HALAQAH_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_PUBLIC_HALAQAH === 'true';

export function HalaqahPublicEventPage() {
  const { eventId = '' } = useParams<{ eventId: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  const referrer = useMemo(() => params.get('ref'), [params]);

  useEffect(() => {
    if (!PUBLIC_HALAQAH_ENABLED) {
      navigate('/halaqah', { replace: true });
      return;
    }
    captureIncomingReferral();
    if (referrer) void logEventLanding(eventId, referrer);
  }, [eventId, referrer, navigate]);

  useEffect(() => {
    if (!PUBLIC_HALAQAH_ENABLED) return;
    let cancelled = false;
    fetchPublicEvent(eventId).then((e) => { if (!cancelled) { setEvent(e); setLoading(false); } });
    return () => { cancelled = true; };
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E16] p-4">
        <div className="h-12 rounded-lg bg-white/5 animate-pulse mb-4" />
        <div className="h-48 rounded-xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0A0E16] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-white text-lg font-semibold mb-1">Event not found</p>
        <p className="text-white/55 text-sm">The link may be expired or the event was removed.</p>
        <button
          onClick={() => navigate('/halaqah')}
          className="mt-4 px-5 py-2 rounded-lg bg-[#D4A853] text-[#0A0E16] text-sm font-semibold"
        >
          Browse all halaqahs
        </button>
      </div>
    );
  }

  const fillPct = event.capacity > 0 ? Math.min(1, event.attendeeCount / event.capacity) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <span className="text-xs uppercase tracking-wider text-[#D4A853]/85 font-semibold">Halaqah</span>
          <button
            onClick={() => setShareOpen(true)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
            aria-label="Share"
          >
            <ShareNetwork size={16} className="text-white/70" />
          </button>
        </div>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-5"
      >
        {referrer && (
          <div className="rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/25 p-2.5 mb-4 flex items-center gap-2">
            <Sparkle size={14} weight="fill" className="text-[#D4A853]" />
            <p className="text-[11px] text-white/75">A friend invited you to this halaqah.</p>
          </div>
        )}
        <h1 className="text-2xl font-bold text-white leading-tight">{event.name}</h1>
        <p className="text-sm text-white/65 mt-2 leading-relaxed">{event.description}</p>
      </motion.div>

      {/* Logistics card */}
      <div className="px-4 mt-5">
        <div className="rounded-2xl bg-white/3 border border-white/8 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-[#D4A853] shrink-0" />
            <div>
              <p className="text-sm text-white font-medium">{event.date}</p>
              <p className="text-[11px] text-white/50">Date</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-[#D4A853] shrink-0" />
            <div>
              <p className="text-sm text-white font-medium">{event.startTime} – {event.endTime}</p>
              <p className="text-[11px] text-white/50">Time</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-[#D4A853] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm text-white font-medium">{event.venue}</p>
              <p className="text-[11px] text-white/50 truncate">{event.venueAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity */}
      <div className="px-4 mt-4">
        <div className="rounded-2xl bg-white/3 border border-white/8 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-white/55" />
              <p className="text-sm font-semibold text-white">{event.attendeeCount} / {event.capacity} attending</p>
            </div>
            <span className="text-[11px] text-white/50">{Math.round(fillPct * 100)}% full</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D4A853] to-[#E8C97A]"
              style={{ width: `${fillPct * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Host */}
      <div className="px-4 mt-4">
        <p className="text-[11px] uppercase tracking-wide text-white/45 font-semibold mb-2">Hosted by</p>
        <div className="rounded-xl bg-white/3 border border-white/8 p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4A853]/15 flex items-center justify-center text-[#D4A853] font-bold">
            {event.hostName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {event.hostName}
              {event.hostVerified && <ShieldCheck size={12} weight="fill" className="inline-block ml-1.5 text-emerald-400" />}
            </p>
            <p className="text-[11px] text-white/55 flex items-center gap-1">
              <Star size={10} weight="fill" className="text-amber-400" /> {event.hostRating.toFixed(1)} host rating
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-4 left-0 right-0 px-4">
        <div className="flex gap-2 max-w-md mx-auto">
          <button
            onClick={() => setShareOpen(true)}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/85 text-sm font-medium flex items-center gap-1.5"
          >
            <ShareNetwork size={14} /> Share
          </button>
          <button
            onClick={() => navigate('/halaqah')}
            className="flex-1 py-3 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold"
          >
            RSVP & open in app
          </button>
        </div>
      </div>

      <HalaqahShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        event={{
          id: event.id,
          name: event.name,
          date: event.date,
          startTime: event.startTime,
          venue: event.venue,
          hostName: event.hostName,
          description: event.description,
        }}
      />
    </div>
  );
}

export default HalaqahPublicEventPage;
