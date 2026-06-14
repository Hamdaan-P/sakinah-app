/**
 * Research home — scholar dashboard with My Drafts / Published, plus a
 * Discover tab to browse other scholars' published work.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Books, Plus, ArrowRight, FileText, Globe, Clock, Spinner } from '@phosphor-icons/react';
import { listMyArticles, listPublishedArticles, createArticle } from '../services/researchService';
import type { ResearchArticle } from '../types/research.types';
import { trackFeature } from '@/lib/analytics';

type Tab = 'mine' | 'discover';

function readingTime(words: number): string {
  const m = Math.max(1, Math.round(words / 220));
  return `${m} min read`;
}

export function ResearchHomePage() {
  useEffect(() => { trackFeature('research'); }, []);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('mine');
  const [mine, setMine] = useState<ResearchArticle[]>([]);
  const [pub, setPub] = useState<ResearchArticle[]>([]);
  const [loadingMine, setLoadingMine] = useState(true);
  const [loadingPub, setLoadingPub] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listMyArticles().then(setMine).catch(() => {}).finally(() => setLoadingMine(false));
    listPublishedArticles(30).then(setPub).catch(() => {}).finally(() => setLoadingPub(false));
  }, []);

  const handleNew = async () => {
    setCreating(true);
    setError('');
    try {
      const art = await createArticle({ title: 'Untitled draft' });
      navigate(`/research/article/${art.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create draft. Try again.');
    } finally {
      setCreating(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'mine', label: 'My Work' },
    { key: 'discover', label: 'Discover' },
  ];

  const list = tab === 'mine' ? mine : pub;
  const loading = tab === 'mine' ? loadingMine : loadingPub;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] pb-24">
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <div className="flex items-center gap-2">
            <Books size={16} weight="fill" className="text-[#D4A853]" />
            <h1 className="text-sm font-semibold text-white">Research</h1>
          </div>
          <button
            onClick={() => navigate('/research/profile')}
            className="text-[11px] text-[#D4A853]/85 font-medium px-2 py-1"
          >
            Profile
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="px-4 pt-5">
        <p className="text-xs text-white/55 leading-relaxed mb-4">
          A workspace for scholars and serious students — search the Qur'an, cite hadith,
          draft articles with structured references, and publish for the community.
        </p>

        <button
          onClick={handleNew}
          disabled={creating}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold hover:bg-[#E8C97A] transition-colors disabled:opacity-50"
        >
          {creating ? <Spinner size={14} className="animate-spin" /> : <Plus size={14} weight="bold" />}
          New article
        </button>

        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-[11px] text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 mt-5 border-b border-white/5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key ? 'text-[#D4A853] border-[#D4A853]' : 'text-white/50 border-transparent hover:text-white/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
            <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-xl bg-white/3 border border-white/10 border-dashed p-6 text-center">
            <FileText size={28} weight="duotone" className="text-white/30 mx-auto mb-2" />
            <p className="text-sm text-white/60 font-medium">
              {tab === 'mine' ? 'No drafts yet' : 'No published articles yet'}
            </p>
            <p className="text-xs text-white/40 mt-1">
              {tab === 'mine' ? 'Tap New article above to start' : 'Be the first to publish'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((a) => <ArticleRow key={a.id} a={a} onClick={() => navigate(`/research/article/${a.id}`)} mine={tab === 'mine'} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleRow({ a, onClick, mine }: { a: ResearchArticle; onClick: () => void; mine: boolean }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl bg-white/3 border border-white/8 hover:border-[#D4A853]/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-[10px] uppercase tracking-wider font-semibold ${
          a.status === 'published' ? 'text-emerald-400' : a.status === 'archived' ? 'text-white/40' : 'text-amber-400'
        }`}>
          {a.status === 'published' ? <Globe size={10} weight="fill" className="inline mr-1" /> : null}
          {a.status}
        </span>
        <ArrowRight size={14} className="text-white/40" />
      </div>
      <p className="text-sm font-semibold text-white line-clamp-2 leading-snug">{a.title || 'Untitled'}</p>
      {a.summary && <p className="text-[11px] text-white/50 line-clamp-2 mt-1">{a.summary}</p>}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-white/40">
        <span className="flex items-center gap-1"><Clock size={10} /> {readingTime(a.wordCount)}</span>
        {!mine && (
          <span className="flex items-center gap-1">
            {a.authorPhotoUrl ? (
              <img src={a.authorPhotoUrl} alt="" className="w-3.5 h-3.5 rounded-full" />
            ) : null}
            {a.authorName}
          </span>
        )}
        {a.tags?.slice(0, 2).map((t) => (
          <span key={t} className="px-1.5 py-0.5 rounded-full bg-white/5">{t}</span>
        ))}
      </div>
    </motion.button>
  );
}

export default ResearchHomePage;
