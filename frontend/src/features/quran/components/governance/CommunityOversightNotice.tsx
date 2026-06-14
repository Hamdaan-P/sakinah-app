/**
 * CommunityOversightNotice
 *
 * Implements PDF Section 9 — "Community participation must NOT result in
 * unsupervised tafsir, personal reinterpretation, emotional manipulation,
 * or viral misinformation. Islamic discussions require oversight, AI
 * moderation assists screening, and sensitive content may require scholarly
 * review."
 *
 * Rendered at the top of every community-generated content surface (circle
 * notes, eventually shared annotations) so the user sees the moderation
 * contract before reading or contributing.
 */

interface Props {
  className?: string;
}

export function CommunityOversightNotice({ className }: Props) {
  return (
    <p
      role="note"
      aria-label="Community oversight notice"
      className={`text-[11px] leading-relaxed text-white/60 italic ${className ?? ''}`}
    >
      Community contributions are moderated. Avoid personal interpretation of Quran and
      hadith — quote from verified sources, or flag content for scholarly review.
    </p>
  );
}
