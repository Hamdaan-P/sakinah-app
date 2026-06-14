/**
 * Right Sidebar — feature cards panel
 * Matches Flutter's right sidebar exactly
 * Hidden below xl breakpoint (1280px)
 */

import { useNavigate } from 'react-router-dom';
import { Heart, BookOpen, Bell, ShareNetwork } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

interface FeatureCard {
  id: string;
  title: string;
  subtitle: string;
  icon: Icon;
  accentColor: string;
  bgGlow: string;
  path: string;
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 'health',
    title: 'Health & Fitness',
    subtitle: 'Track your wellness goals',
    icon: Heart,
    accentColor: '#4FB892',
    bgGlow: 'rgba(79,184,146, 0.08)',
    path: '/faith',
  },
  {
    id: 'quran',
    title: 'Quran & Activities',
    subtitle: 'Daily reading streaks',
    icon: BookOpen,
    accentColor: '#4FB892',
    bgGlow: 'rgba(79,184,146, 0.08)',
    path: '/quran',
  },
  {
    id: 'reminders',
    title: 'Reminders',
    subtitle: 'Prayer & task alerts',
    icon: Bell,
    accentColor: '#D4A853',
    bgGlow: 'rgba(212,168,83, 0.1)',
    path: '/prayer',
  },
  {
    id: 'share',
    title: 'Share Highlights',
    subtitle: 'Share your progress',
    icon: ShareNetwork,
    accentColor: '#4FB892',
    bgGlow: 'rgba(79,184,146, 0.08)',
    path: '/network',
  },
];

export function RightSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="hidden xl:flex flex-col w-[300px] h-screen bg-[#0F141F] border-l border-[rgba(212,168,83,0.1)] shrink-0 overflow-y-auto py-6 px-4 scrollbar-hide">
      <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] mb-4 px-1 text-gold-shimmer drop-shadow-[0_1px_8px_rgba(212,168,83,0.45)]">
        Features
      </h2>

      <div className="space-y-3">
        {FEATURE_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => navigate(card.path)}
              className="w-full text-left rounded-xl bg-[#10151F] border border-[#D4A853]/20 p-4 transition-all duration-200 hover:border-[#D4A853]/35 hover:bg-[#161D2C] cursor-pointer"
              style={{ boxShadow: `0 0 20px ${card.bgGlow}` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: card.bgGlow }}
                >
                  <Icon size={22} weight="duotone" className="text-[#D4A853]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#F5E8C7]">{card.title}</h3>
                  <p className="text-xs text-[#C9C0A8]/70 mt-0.5">{card.subtitle}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick stats section */}
      <div className="mt-6">
        <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] mb-4 px-1 text-gold-shimmer drop-shadow-[0_1px_8px_rgba(212,168,83,0.45)]">
          Quick Stats
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Streak" value="7" unit="days" color="#D4A853" highlight path="/quran" navigate={navigate} />
          <StatCard label="Pages" value="42" unit="read" color="#4FB892" path="/quran" navigate={navigate} />
          <StatCard label="Prayers" value="5/5" unit="today" color="#4FB892" path="/prayer" navigate={navigate} />
          <StatCard label="Zakat" value="$0" unit="due" color="#4FB892" path="/zakat" navigate={navigate} />
        </div>
      </div>
    </aside>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
  highlight = false,
  path,
  navigate,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  highlight?: boolean;
  path: string;
  navigate: (path: string) => void;
}) {
  return (
    <button
      onClick={() => navigate(path)}
      className="rounded-xl bg-[#10151F] border border-[#D4A853]/20 p-3 text-center transition-all duration-200 hover:border-[#D4A853]/35 hover:bg-[#161D2C] cursor-pointer"
    >
      <p className="text-lg font-bold" style={{ color: highlight ? color : '#F5E8C7' }}>
        {value}
      </p>
      <p className="text-[10px] text-[#5C5749] mt-0.5">{unit}</p>
      <p className="text-[10px] text-[#C9C0A8] font-medium">{label}</p>
    </button>
  );
}
