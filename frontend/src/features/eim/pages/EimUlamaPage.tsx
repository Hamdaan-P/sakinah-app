/**
 * Ulama Screening — multi-opinion topic browser.
 *
 * Lists topics that have scholarly disagreement; selecting one reveals the
 * Scholar Gate (4-pole side-by-side opinions). Deep-link via ?topic=<id>.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CaretLeft } from '@phosphor-icons/react';
import { eimTrack } from '../analytics';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { FeatureIntro } from '../components/FeatureIntro';
import { FetchError } from '../components/FetchError';
import { ScholarGate } from '../components/ScholarGate';
import { eimService } from '../services/eim.service';

const CATEGORY_LABEL: Record<string, string> = {
  asset_class: 'Asset class',
  instrument: 'Instrument',
  methodology: 'Methodology',
  structure: 'Structure',
};

export function EimUlamaPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(searchParams.get('topic'));

  const topicsQ = useQuery({
    queryKey: ['eim', 'topics'],
    queryFn: eimService.getTopics,
  });
  const scholarsQ = useQuery({
    queryKey: ['eim', 'scholars'],
    queryFn: eimService.getScholars,
  });
  const opinionsQ = useQuery({
    queryKey: ['eim', 'opinions', selectedTopic],
    queryFn: () => eimService.getTopicOpinions(selectedTopic!),
    enabled: !!selectedTopic,
  });
  const topics = topicsQ.data;
  const scholars = scholarsQ.data;
  const opinions = opinionsQ.data;
  const opinionsFetching = opinionsQ.isFetching;
  const fetchError = topicsQ.error ?? scholarsQ.error ?? opinionsQ.error;

  // P10 analytics — fire once per topic selected, including initial deep-link.
  useEffect(() => {
    if (selectedTopic) eimTrack('eim_ulama_screening_viewed');
  }, [selectedTopic]);

  useEffect(() => {
    if (selectedTopic) {
      setSearchParams({ topic: selectedTopic }, { replace: true });
    }
  }, [selectedTopic, setSearchParams]);

  const topic = topics?.find((t) => t.id === selectedTopic);

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-3xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedTopic) {
                setSelectedTopic(null);
                setSearchParams({}, { replace: true });
              } else {
                navigate('/eim');
              }
            }}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853]"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
              EIM · Conscience Layer
            </div>
            <h1 className="text-[20px] font-bold text-[#F5E8C7]">Ulama Screening</h1>
          </div>
          <FeatureIntro featureId="ulama" />
        </header>

        <DisclaimerBanner />

        {fetchError && (
          <FetchError
            error={fetchError}
            retry={() => {
              void topicsQ.refetch();
              void scholarsQ.refetch();
              if (selectedTopic) void opinionsQ.refetch();
            }}
            context="ulama screening data"
          />
        )}

        {!selectedTopic ? (
          <div className="px-3 mt-4 space-y-2.5">
            <div className="px-2 text-[12px] text-[#7A7363] leading-relaxed mb-1">
              Multi-pole scholar opinions on the topics where Muslim investors most often face
              genuine disagreement. Tap any topic to see the spectrum.
            </div>
            {(topics ?? []).map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTopic(t.id)}
                className="w-full text-left rounded-xl border border-[rgba(212,168,83,0.14)] bg-[#101a2a] hover:border-[rgba(212,168,83,0.30)] transition-all p-4"
              >
                <div className="text-[10px] uppercase tracking-wider text-[#D4A853] font-semibold mb-1">
                  {CATEGORY_LABEL[t.category] ?? t.category}
                </div>
                <div className="text-[14px] font-bold text-[#F5E8C7]">{t.title}</div>
                <div className="text-[11px] text-[#7A7363] mt-1 leading-relaxed">
                  {t.summary}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-3 mt-4">
            {opinionsFetching && (
              <div className="text-[12px] text-[#7A7363] text-center py-6 animate-pulse">
                Gathering the scholars' opinions…
              </div>
            )}
            {scholars && opinions && topic && (
              <ScholarGate
                scholars={scholars}
                opinions={opinions}
                topicTitle={topic.title}
                topicSummary={topic.summary}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EimUlamaPage;
