import { useRef, useState } from 'react';
import { Plus, X, ImageSquare, Spinner } from '@phosphor-icons/react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '@/config/firebase.config';
import type { ListingMedia } from '../types/souk.types';

interface Props {
  media: ListingMedia[];
  onChange: (next: ListingMedia[]) => void;
  max?: number;
}

const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Direct Firebase Storage upload — avoids needing a signed-URL backend
 * endpoint for Phase A. Each user can write under their own prefix:
 *   souk/{uid}/listings/{timestamp}-{rand}-{name}
 * Storage rules (configured separately) gate writes to that prefix.
 */
export function MediaUploader({ media, onChange, max = 6 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setErr('Sign in to upload media.');
      return;
    }
    setBusy(true);
    setErr(null);
    const next: ListingMedia[] = [...media];
    for (const f of files) {
      if (next.length >= max) break;
      if (f.size > MAX_SIZE) {
        setErr(`"${f.name}" is larger than 5 MB.`);
        continue;
      }
      try {
        const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-40);
        const path = `souk/${uid}/listings/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safe}`;
        const ref = storageRef(storage, path);
        await uploadBytes(ref, f, { contentType: f.type });
        const url = await getDownloadURL(ref);
        next.push({ url, kind: 'image' });
      } catch {
        setErr(`Failed to upload "${f.name}". Try again.`);
      }
    }
    onChange(next);
    setBusy(false);
  }

  function remove(idx: number) {
    const next = media.filter((_, i) => i !== idx);
    onChange(next);
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {media.map((m, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-xl overflow-hidden border border-[rgba(215,181,106,0.2)] bg-[#1E293A]"
          >
            <img src={m.url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="remove image"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {media.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="aspect-square rounded-xl border border-dashed border-[rgba(215,181,106,0.35)] flex flex-col items-center justify-center gap-1 text-[#D7B56A] hover:bg-[#D7B56A]/5 transition-colors"
          >
            {busy ? <Spinner size={20} className="animate-spin" /> : <Plus size={20} />}
            <span className="text-[10px]">{busy ? 'Uploading…' : 'Add'}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={onPick}
      />
      <p className="text-[10px] text-[#A7B1C0] mt-2 flex items-center gap-1">
        <ImageSquare size={11} />
        JPG / PNG / WebP up to 5 MB. {media.length}/{max} uploaded.
      </p>
      {err && <p className="text-rose-400 text-[11px] mt-1">{err}</p>}
    </div>
  );
}
