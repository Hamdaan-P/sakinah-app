/**
 * Research Article Editor — title + body + tags + citations.
 * Citations panel lets the author search the Qur'an and add ayah refs that
 * the body can interleave via [[ref:cite-id]] tokens.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, FloppyDisk, Globe, Trash, Quotes, Spinner, Eye, Archive } from '@phosphor-icons/react';
import {
  getArticle,
  updateArticle,
  publishArticle,
  archiveArticle,
  deleteArticle,
} from '../services/researchService';
import type { ResearchArticle, ResearchCitation } from '../types/research.types';
import { trackFeature } from '@/lib/analytics';
import { auth } from '@/config/firebase.config';
import { CitationPanel } from './components/CitationPanel';
import { ArticlePreview, ArticleReadView } from './components/ArticleReadView';

export function ResearchArticlePage() {
  useEffect(() => { trackFeature('research_article'); }, []);
  const navigate = useNavigate();
  const { articleId = '' } = useParams<{ articleId: string }>();

  const [article, setArticle] = useState<ResearchArticle | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [citations, setCitations] = useState<ResearchCitation[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCitePanel, setShowCitePanel] = useState(false);
  const [error, setError] = useState('');

  // Load
  useEffect(() => {
    let cancelled = false;
    getArticle(articleId).then((a) => {
      if (cancelled || !a) { setLoading(false); return; }
      setArticle(a);
      setTitle(a.title);
      setSummary(a.summary);
      setBody(a.body);
      setTags(a.tags);
      setCitations(a.citations);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [articleId]);

  // Auto-save (debounced)
  useEffect(() => {
    if (!dirty || !article) return;
    const t = setTimeout(async () => {
      setSaving(true);
      try {
        await updateArticle(article.id, { title, summary, body, tags, citations });
        setSavedAt(Date.now());
        setDirty(false);
      } finally {
        setSaving(false);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [dirty, article, title, summary, body, tags, citations]);

  const onChange = useCallback(() => setDirty(true), []);

  const handlePublish = async () => {
    if (!article) return;
    if (!confirm('Publish this article? It will be visible to all users.')) return;
    setSaving(true);
    setError('');
    try {
      // Final save first
      await updateArticle(article.id, { title, summary, body, tags, citations });
      await publishArticle(article.id);
      navigate('/research', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not publish. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!article || !confirm('Archive this article? It will no longer appear in Discover.')) return;
    await archiveArticle(article.id);
    navigate('/research', { replace: true });
  };

  const handleDelete = async () => {
    if (!article || !confirm('Delete forever? This cannot be undone.')) return;
    await deleteArticle(article.id);
    navigate('/research', { replace: true });
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || tags.includes(t)) { setTagInput(''); return; }
    setTags([...tags, t].slice(0, 8));
    setTagInput('');
    onChange();
  };

  const insertCitationToken = (citationId: string) => {
    setBody((b) => b + ` [[ref:${citationId}]]`);
    onChange();
  };

  const addCitation = (cit: ResearchCitation) => {
    setCitations((c) => [...c, cit]);
    onChange();
    return cit;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E16] p-4">
        <div className="h-12 rounded-lg bg-white/5 animate-pulse mb-4" />
        <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
      </div>
    );
  }
  if (!article) {
    return (
      <div className="min-h-screen bg-[#0A0E16] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-white">Article not found.</p>
        <button onClick={() => navigate('/research')} className="mt-3 text-[#D4A853] text-sm">Back to Research</button>
      </div>
    );
  }
  if (article.authorUid !== auth.currentUser?.uid) {
    // Read-only view for someone else's published article
    return <ArticleReadView article={article} onBack={() => navigate(-1)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] pb-32">
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-4 h-14 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className={`text-[10px] uppercase tracking-wide font-semibold ${
              article.status === 'published' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {article.status}
            </span>
            <span className="text-[11px] text-white/45">
              {saving ? <span className="inline-flex items-center gap-1"><Spinner size={10} className="animate-spin" />Saving…</span>
                : dirty ? 'Unsaved'
                : savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}`
                : 'Saved'}
            </span>
          </div>
          <button
            onClick={() => setShowPreview((s) => !s)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
            aria-label={showPreview ? 'Edit' : 'Preview'}
          >
            {showPreview ? <FloppyDisk size={14} className="text-white/70" /> : <Eye size={14} className="text-white/70" />}
          </button>
        </div>
      </div>

      {showPreview ? (
        <ArticlePreview article={{ ...article, title, body, citations }} />
      ) : (
        <div className="px-4 pt-5 space-y-4">
          {/* Title */}
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); onChange(); }}
            placeholder="Article title"
            className="w-full bg-transparent text-2xl font-bold text-white border-b border-white/10 pb-2 focus:outline-none focus:border-[#D4A853]/40"
          />

          {/* Summary */}
          <textarea
            value={summary}
            onChange={(e) => { setSummary(e.target.value); onChange(); }}
            placeholder="One-paragraph summary (used in lists & shares)"
            rows={2}
            className="w-full bg-white/3 border border-white/10 rounded-lg p-3 text-sm text-white/85 placeholder:text-white/30 resize-none focus:outline-none focus:border-[#D4A853]/40"
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#D4A853]/15 text-[#D4A853] border border-[#D4A853]/25"
              >
                {t}
                <button
                  onClick={() => { setTags(tags.filter((x) => x !== t)); onChange(); }}
                  className="text-[#D4A853]/60 hover:text-rose-400"
                >×</button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
              onBlur={addTag}
              placeholder="add tag…"
              className="flex-1 min-w-[80px] bg-transparent text-[11px] text-white/70 placeholder:text-white/30 focus:outline-none"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] uppercase tracking-wide text-white/45 font-semibold">Body (markdown)</p>
              <button
                onClick={() => setShowCitePanel(true)}
                className="text-[11px] text-[#D4A853] flex items-center gap-1"
              >
                <Quotes size={11} weight="fill" /> Add citation
              </button>
            </div>
            <textarea
              value={body}
              onChange={(e) => { setBody(e.target.value); onChange(); }}
              placeholder="Write your article…&#10;Use [[ref:cite-id]] to embed citations from the panel."
              rows={16}
              className="w-full bg-white/3 border border-white/10 rounded-lg p-3 text-sm text-white/85 placeholder:text-white/30 resize-none focus:outline-none focus:border-[#D4A853]/40 font-mono"
            />
          </div>

          {/* Citations list */}
          {citations.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/45 font-semibold mb-2">Citations</p>
              <div className="space-y-2">
                {citations.map((c) => (
                  <div key={c.id} className="rounded-xl bg-white/3 border border-white/8 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] uppercase tracking-wide text-[#D4A853]/85 font-semibold">
                        {c.source} · {c.reference}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => insertCitationToken(c.id)}
                          className="text-[10px] text-emerald-300 hover:text-emerald-200"
                          title="Insert into body"
                        >+ insert</button>
                        <button
                          onClick={() => { setCitations(citations.filter((x) => x.id !== c.id)); onChange(); }}
                          className="text-white/30 hover:text-rose-400"
                        ><Trash size={12} /></button>
                      </div>
                    </div>
                    {c.arabic && <p dir="rtl" className="font-arabic text-right text-[#F5E8C7] text-base leading-loose mb-1">{c.arabic}</p>}
                    {c.translation && <p className="text-xs text-white/70 italic">"{c.translation}"</p>}
                    {c.attribution && <p className="text-[10px] text-white/40 mt-1">— {c.attribution}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action bar */}
          {error && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-[11px] text-red-300">
              {error}
            </div>
          )}
          <div className="flex gap-2 pt-3">
            {article.status !== 'published' && (
              <button
                onClick={handlePublish}
                disabled={saving || title.trim().length < 3}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold disabled:opacity-50"
              >
                <Globe size={14} weight="bold" /> Publish
              </button>
            )}
            <button
              onClick={handleArchive}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/85 text-sm font-medium"
            >
              <Archive size={14} /> Archive
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm font-medium"
              aria-label="Delete"
            >
              <Trash size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Citation search panel */}
      <AnimatePresence>
        {showCitePanel && (
          <CitationPanel
            onClose={() => setShowCitePanel(false)}
            onAdd={(cit) => addCitation(cit)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ResearchArticlePage;
