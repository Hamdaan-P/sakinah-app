import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, CaretRight, UsersThree, Chat } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { SahabaWisdomData, CompanionId } from '../types/home.types';
import { ALL_WISDOM, getCompanionIcon, getShortName } from './sahaba-wisdom/_data';

interface SahabaWisdomCarouselProps {
  onAskSahaba: (companionId: CompanionId, question: string) => void;
  className?: string;
}

export function SahabaWisdomCarousel({ onAskSahaba, className }: SahabaWisdomCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const wisdomItems = useMemo(() => {
    return [...ALL_WISDOM].sort(() => Math.random() - 0.5);
  }, []);

  const goToPrevious = () => {
    setCurrentPage((prev) => (prev === 0 ? wisdomItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => (prev === wisdomItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="p-1.5 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #D4A853, #C9A85C)',
              boxShadow: '0 2px 8px rgba(212,168,83,0.3)',
            }}
          >
            <UsersThree size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">Wisdom of the Sahaba</h3>
            <p className="text-[#D4A853]/80 text-xs">Tap to ask them directly</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-white/40">
          <CaretLeft size={14} />
          <CaretRight size={14} />
        </div>
      </div>

      {/* Carousel */}
      <div className="relative px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) goToNext();
              else if (info.offset.x > 50) goToPrevious();
            }}
            className="cursor-grab active:cursor-grabbing"
          >
            <WisdomCard
              data={wisdomItems[currentPage]}
              onAsk={() =>
                onAskSahaba(wisdomItems[currentPage].companionId, wisdomItems[currentPage].question)
              }
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {wisdomItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              index === currentPage
                ? 'w-5 bg-[#D4A853] shadow-[0_0_6px_rgba(212,168,83,0.5)]'
                : 'w-1.5 bg-white/30'
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface WisdomCardProps {
  data: SahabaWisdomData;
  onAsk: () => void;
}

function WisdomCard({ data, onAsk }: WisdomCardProps) {
  const Icon = getCompanionIcon(data.companionId);
  const shortName = getShortName(data.companionName);

  return (
    <motion.div
      onClick={onAsk}
      className="relative overflow-hidden rounded-xl p-3.5 cursor-pointer border border-[#D4A853]/25"
      style={{
        background: 'linear-gradient(135deg, #0F141F, #0A0E16)',
        boxShadow: '0 6px 20px rgba(43,111,107, 0.18)',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background pattern */}
      <div className="absolute -right-5 -top-5 opacity-[0.08]">
        <Icon size={96} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Top row with avatar and topic */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">{shortName}</p>
              <p className="text-white/80 text-[10px]">{data.companionTitle}</p>
            </div>
          </div>
          <span className="px-2 py-1 rounded-lg bg-white/20 text-white text-[10px] font-semibold">
            {data.topic}
          </span>
        </div>

        {/* Wisdom quote */}
        <p className="text-white/95 text-xs italic leading-relaxed mb-3 line-clamp-3">{data.wisdom}</p>

        {/* Ask button */}
        <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/20 border border-white/30">
          <Chat size={14} className="text-white" />
          <span className="text-white text-xs font-semibold">Ask {shortName}</span>
        </div>
      </div>
    </motion.div>
  );
}
