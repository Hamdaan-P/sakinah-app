/**
 * Scholar profile editor — opt-in scholar credentials, specialties, bio.
 * Public view of someone else's profile is `?uid=<otherUid>` query param.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Plus, X, Spinner, Check } from '@phosphor-icons/react';
import { getMyScholarProfile, getScholarProfileByUid, upsertScholarProfile } from '../services/researchService';
import type { ResearchScholarProfile } from '../types/research.types';
import { auth } from '@/config/firebase.config';

export function ResearchScholarProfilePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const otherUid = params.get('uid');
  const [profile, setProfile] = useState<ResearchScholarProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // editable fields (only used when this is "my" profile)
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [credentials, setCredentials] = useState<string[]>([]);
  const [credInput, setCredInput] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specInput, setSpecInput] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const isMine = !otherUid || otherUid === auth.currentUser?.uid;

  useEffect(() => {
    const fetcher = isMine ? getMyScholarProfile() : getScholarProfileByUid(otherUid!);
    fetcher
      .then((p) => {
        setProfile(p);
        if (p) {
          setDisplayName(p.displayName);
          setBio(p.bio);
          setCredentials(p.credentials);
          setSpecialties(p.specialties);
          setWebsiteUrl(p.websiteUrl ?? '');
        }
      })
      .finally(() => setLoading(false));
  }, [isMine, otherUid]);

  const save = async () => {
    setSaving(true);
    try {
      await upsertScholarProfile({ displayName, bio, credentials, specialties, websiteUrl });
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  const addItem = (current: string[], setter: (v: string[]) => void, value: string, max: number, inputSetter: (v: string) => void) => {
    const v = value.trim();
    if (!v || current.includes(v)) { inputSetter(''); return; }
    setter([...current, v].slice(0, max));
    inputSetter('');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0A0E16] p-4"><div className="h-32 rounded-xl bg-white/5 animate-pulse" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] pb-24">
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-4 h-14 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          ><ArrowLeft size={18} className="text-white/70" /></button>
          <h1 className="text-sm font-semibold text-white">Scholar Profile</h1>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {!isMine && profile?.isVerified && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3 flex items-center gap-2">
            <ShieldCheck size={16} weight="fill" className="text-emerald-400" />
            <span className="text-xs text-white/85">Verified scholar</span>
          </div>
        )}

        <div>
          <label htmlFor="researchscholarprofilepage-fld-1" className="text-[11px] uppercase tracking-wide text-white/45 font-semibold">Display name</label>
          <input id="researchscholarprofilepage-fld-1"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={!isMine}
            placeholder="As you'd like to be credited"
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853]/40 disabled:opacity-70"
          />
        </div>

        <div>
          <label htmlFor="researchscholarprofilepage-fld-2" className="text-[11px] uppercase tracking-wide text-white/45 font-semibold">Bio</label>
          <textarea id="researchscholarprofilepage-fld-2"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 500))}
            disabled={!isMine}
            rows={4}
            placeholder="Brief background — schools, teachers, areas of focus."
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853]/40 resize-none disabled:opacity-70"
          />
          <p className="text-[10px] text-white/35 mt-1">{bio.length}/500</p>
        </div>

        <div>
          <label htmlFor="researchscholarprofilepage-fld-3" className="text-[11px] uppercase tracking-wide text-white/45 font-semibold">Specialties</label>
          <div className="flex flex-wrap gap-1.5 items-center mt-1.5">
            {specialties.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-[#D4A853]/15 text-[#D4A853] border border-[#D4A853]/25"
              >
                {s}
                {isMine && (
                  <button onClick={() => setSpecialties(specialties.filter((x) => x !== s))} className="text-[#D4A853]/60 hover:text-rose-400">×</button>
                )}
              </span>
            ))}
            {isMine && (
              <input id="researchscholarprofilepage-fld-3"
                value={specInput}
                onChange={(e) => setSpecInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addItem(specialties, setSpecialties, specInput, 6, setSpecInput); } }}
                onBlur={() => addItem(specialties, setSpecialties, specInput, 6, setSpecInput)}
                placeholder="e.g. Tafsir, Hadith Sciences"
                className="flex-1 min-w-[120px] bg-transparent text-[12px] text-white/70 placeholder:text-white/30 focus:outline-none"
              />
            )}
          </div>
        </div>

        <div>
          <label htmlFor="researchscholarprofilepage-fld-4" className="text-[11px] uppercase tracking-wide text-white/45 font-semibold">Credentials</label>
          <div className="space-y-1.5 mt-1.5">
            {credentials.map((c) => (
              <div key={c} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3 border border-white/8">
                <ShieldCheck size={12} className="text-[#D4A853]" />
                <span className="flex-1 text-xs text-white/85">{c}</span>
                {isMine && (
                  <button onClick={() => setCredentials(credentials.filter((x) => x !== c))} className="text-white/30 hover:text-rose-400"><X size={12} /></button>
                )}
              </div>
            ))}
            {isMine && (
              <div className="flex gap-1">
                <input id="researchscholarprofilepage-fld-4"
                  value={credInput}
                  onChange={(e) => setCredInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(credentials, setCredentials, credInput, 8, setCredInput); } }}
                  placeholder="e.g. Madinah University, Ijazah in Hafs"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853]/40"
                />
                <button
                  onClick={() => addItem(credentials, setCredentials, credInput, 8, setCredInput)}
                  className="px-3 rounded-lg bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853]"
                ><Plus size={14} /></button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="researchscholarprofilepage-fld-5" className="text-[11px] uppercase tracking-wide text-white/45 font-semibold">Website (optional)</label>
          <input id="researchscholarprofilepage-fld-5"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            disabled={!isMine}
            placeholder="https://example.com"
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853]/40 disabled:opacity-70"
          />
        </div>

        {isMine && (
          <button
            onClick={save}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold disabled:opacity-50"
          >
            {saving ? <Spinner size={14} className="animate-spin" /> : savedAt ? <Check size={14} /> : null}
            {savedAt ? 'Saved' : 'Save profile'}
          </button>
        )}
      </div>
    </div>
  );
}

export default ResearchScholarProfilePage;
