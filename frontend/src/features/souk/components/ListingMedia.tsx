import { useState } from 'react';
import { Image as ImageIcon } from '@phosphor-icons/react';
import type { ListingMedia as Media } from '../types/souk.types';
import { LISTING_TYPE_LOOKUP } from '../_data';
import type { ListingType } from '../types/souk.types';

interface Props {
  media: Media[];
  fallbackType: ListingType;
  className?: string;
  /** When true, render a tall hero ratio used on detail page. */
  hero?: boolean;
}

export function ListingMedia({ media, fallbackType, className = '', hero = false }: Props) {
  const [idx, setIdx] = useState(0);
  const meta = LISTING_TYPE_LOOKUP[fallbackType];

  if (media.length === 0) {
    const Icon = meta.icon;
    return (
      <div
        className={`w-full ${hero ? 'aspect-[16/9]' : 'aspect-[4/3]'} rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center border border-[rgba(215,181,106,0.15)] ${className}`}
      >
        <Icon size={hero ? 56 : 32} style={{ color: meta.accent }} />
      </div>
    );
  }

  const current = media[idx];
  return (
    <div className={`relative w-full ${hero ? 'aspect-[16/9]' : 'aspect-[4/3]'} rounded-xl overflow-hidden bg-[#1E293A] ${className}`}>
      {current.kind === 'image' ? (
        <img
          src={current.url}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <video
          src={current.url}
          poster={current.thumb}
          className="w-full h-full object-cover"
          controls={hero}
          muted
          playsInline
        />
      )}
      {media.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {media.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setIdx(i);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === idx ? 'bg-[#D7B56A]' : 'bg-white/40'
              }`}
              aria-label={`media ${i + 1}`}
            />
          ))}
        </div>
      )}
      {media.length > 1 && (
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] flex items-center gap-1">
          <ImageIcon size={10} />
          {idx + 1}/{media.length}
        </span>
      )}
    </div>
  );
}
