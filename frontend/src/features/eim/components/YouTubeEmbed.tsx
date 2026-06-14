/**
 * YouTubeEmbed — privacy-enhanced, responsive 16:9 YouTube player for EIM.
 *
 * Accepts any common YouTube URL form (watch?v=, youtu.be/, /embed/, /shorts/)
 * or a bare 11-char video ID, plus an optional start time (?t= / ?start=).
 * Uses youtube-nocookie.com so no tracking cookies are set until the user
 * actually plays — keeps EIM's calm, non-extractive posture.
 *
 * Renders NOTHING when the URL is empty or unparseable, so callers can pass an
 * optional/empty value safely (e.g. lessons without a video, or a candlestick
 * intro video that hasn't been sourced yet).
 *
 * NOTE: youtube-nocookie.com + youtube.com are allowlisted in the firebase.json
 * CSP `frame-src` directive — keep them in sync if this component moves hosts.
 */

interface YouTubeEmbedProps {
  /** Full YouTube URL or bare 11-char video ID. Empty/undefined → renders nothing. */
  url?: string | null;
  /** Accessible iframe title — describe the video's content for screen readers. */
  title?: string;
  /** Optional eyebrow label shown above the player, e.g. "Watch first". */
  label?: string;
}

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

function parseStart(t: string): number | undefined {
  if (/^\d+$/.test(t)) {
    const n = Number(t);
    return n > 0 ? n : undefined;
  }
  // "1h2m30s" / "2m30s" / "90s" forms
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!m) return undefined;
  const total = Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
  return total > 0 ? total : undefined;
}

/** Extract a YouTube video id (+ optional start seconds) from a URL or bare id. */
function parseYouTube(raw: string): { id: string; start?: number } | null {
  const s = raw.trim();
  if (!s) return null;
  if (ID_RE.test(s)) return { id: s };

  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, '');
  let id = '';
  if (host === 'youtu.be') {
    id = u.pathname.slice(1).split('/')[0];
  } else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    if (u.pathname === '/watch') {
      id = u.searchParams.get('v') ?? '';
    } else {
      const m = u.pathname.match(/^\/(?:embed|shorts|v)\/([^/?]+)/);
      if (m) id = m[1];
    }
  }
  if (!ID_RE.test(id)) return null;

  const t = u.searchParams.get('start') ?? u.searchParams.get('t');
  return { id, start: t ? parseStart(t) : undefined };
}

export function YouTubeEmbed({ url, title = 'Lesson video', label }: YouTubeEmbedProps) {
  const parsed = url ? parseYouTube(url) : null;
  if (!parsed) return null;

  const src =
    `https://www.youtube-nocookie.com/embed/${parsed.id}` +
    `?rel=0&modestbranding=1${parsed.start ? `&start=${parsed.start}` : ''}`;

  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-2.5 sm:p-3">
      {label && (
        <div className="px-1 pb-2 text-[10px] uppercase tracking-widest font-bold text-[#D4A853]">
          {label}
        </div>
      )}
      {/* 16:9 box via the padding-ratio technique (inline styles so it never
          depends on a Tailwind aspect-* utility being generated — the JIT scan
          missed `aspect-video` and the frame collapsed to a strip). Works in
          every browser + Capacitor WebView. */}
      <div
        className="overflow-hidden rounded-xl bg-[#0B121F] border border-[rgba(212,168,83,0.10)]"
        style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}
      >
        <iframe
          src={src}
          title={title}
          loading="lazy"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export default YouTubeEmbed;
