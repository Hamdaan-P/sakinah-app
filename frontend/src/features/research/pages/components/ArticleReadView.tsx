/**
 * ArticleReadView — read-only render of a published article for non-authors.
 * Also exports the in-editor `Preview` for the author's own preview tab.
 */

import { ArrowLeft, BookOpen } from '@phosphor-icons/react';
import { expandCitationsInBody } from '../../services/researchService';
import type { ResearchArticle, ResearchCitation } from '../../types/research.types';

export function ArticleReadView({ article, onBack }: { article: ResearchArticle; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] pb-24">
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-4 h-14 flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <BookOpen size={14} className="text-[#D4A853] shrink-0" />
            <h1 className="text-sm font-semibold text-white truncate">{article.title}</h1>
          </div>
        </div>
      </div>
      <div className="px-5 pt-5">
        <div className="flex items-center gap-2 mb-4 text-[11px] text-white/55">
          {article.authorPhotoUrl && <img src={article.authorPhotoUrl} alt="" className="w-5 h-5 rounded-full" />}
          <span className="font-medium">{article.authorName}</span>
          <span>·</span>
          <span>{Math.max(1, Math.round(article.wordCount / 220))} min read</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3 leading-tight">{article.title}</h1>
        {article.summary && <p className="text-sm text-white/70 italic mb-5 leading-relaxed">{article.summary}</p>}
        <article className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">
          {expandCitationsInBody(article.body, article.citations)}
        </article>
        {article.citations.length > 0 && (
          <div className="mt-8 pt-4 border-t border-white/10">
            <h2 className="text-[11px] uppercase tracking-wide text-white/50 font-semibold mb-2">References</h2>
            <ol className="space-y-2 list-decimal list-inside text-xs text-white/70">
              {article.citations.map((c) => (
                <li key={c.id}>
                  <span className="text-[#D4A853] font-mono mr-1">{c.reference}</span>
                  {c.translation}
                  {c.attribution && <span className="text-white/45"> — {c.attribution}</span>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export function ArticlePreview({ article }: { article: { title: string; body: string; citations: ResearchCitation[] } }) {
  const expanded = expandCitationsInBody(article.body, article.citations);
  return (
    <div className="px-5 pt-5">
      <h1 className="text-2xl font-bold text-white mb-4 leading-tight">{article.title || 'Untitled'}</h1>
      <article className="prose prose-invert max-w-none text-sm text-white/85 leading-relaxed whitespace-pre-wrap">
        {expanded}
      </article>
      {article.citations.length > 0 && (
        <div className="mt-8 pt-4 border-t border-white/10">
          <h2 className="text-[11px] uppercase tracking-wide text-white/50 font-semibold mb-2">References</h2>
          <ol className="space-y-2 list-decimal list-inside text-xs text-white/70">
            {article.citations.map((c) => (
              <li key={c.id}>
                <span className="text-[#D4A853] font-mono mr-1">{c.reference}</span>
                {c.translation}
                {c.attribution && <span className="text-white/45"> — {c.attribution}</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
