import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { COLORS } from '../_constants';
import { mockMembers, mockPresentations, myDecks } from '../_data';
import { ChamberTopTabs } from '../components/ChamberTopTabs';
import { ChamberHomeTab } from '../components/ChamberHomeTab';
import { ChamberMembersTab } from '../components/ChamberMembersTab';
import { ChamberReferralsTab } from '../components/ChamberReferralsTab';
import { ChamberAnalyticsTab } from '../components/ChamberAnalyticsTab';
import { ChamberNetworkingTab } from '../components/ChamberNetworkingTab';
import { ChamberPresentationsTab } from '../components/ChamberPresentationsTab';
import { MemberDetailOverlay } from '../components/MemberDetailOverlay';
import { SessionDetailOverlay } from '../components/SessionDetailOverlay';
import { PresentationDetailOverlay } from '../components/PresentationDetailOverlay';
import { UploadPresentationDialog } from '../components/UploadPresentationDialog';
import type {
  AnalyticsPeriod,
  CategoryFilter,
  Member,
  NetworkingSession,
  Presentation,
  PresentationCategory,
  PresentationTab,
  ReferralTab,
  Tab,
} from '../_types';

export function ChamberV2Page() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [referralTab, setReferralTab] = useState<ReferralTab>('new');
  const [presentationTab, setPresentationTab] = useState<PresentationTab>('browse');
  const [presentationCategory, setPresentationCategory] = useState<PresentationCategory>('All');
  const [selectedSession, setSelectedSession] = useState<NetworkingSession | null>(null);
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>('Month');

  const filteredMembers = useMemo(() => {
    return mockMembers.filter((member) => {
      const matchesCategory = categoryFilter === 'All' || member.category === categoryFilter;
      const matchesSearch =
        searchQuery === '' ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchQuery]);

  const filteredPresentations = useMemo(() => {
    const decks = presentationTab === 'browse' ? mockPresentations : myDecks;
    return decks.filter(
      (p) => presentationCategory === 'All' || p.category === presentationCategory,
    );
  }, [presentationCategory, presentationTab]);

  return (
    <div style={{ minHeight: '100vh', background: COLORS.navy.darkest }}>
      <ChamberTopTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <div key="home">
            <ChamberHomeTab onChangeTab={setActiveTab} />
          </div>
        )}
        {activeTab === 'members' && (
          <div key="members">
            <ChamberMembersTab
              searchQuery={searchQuery}
              categoryFilter={categoryFilter}
              filteredMembers={filteredMembers}
              onChangeSearch={setSearchQuery}
              onChangeCategory={setCategoryFilter}
              onSelectMember={setSelectedMember}
            />
          </div>
        )}
        {activeTab === 'referrals' && (
          <div key="referrals">
            <ChamberReferralsTab referralTab={referralTab} onChangeSubTab={setReferralTab} />
          </div>
        )}
        {activeTab === 'analytics' && (
          <div key="analytics">
            <ChamberAnalyticsTab
              analyticsPeriod={analyticsPeriod}
              onChangePeriod={setAnalyticsPeriod}
            />
          </div>
        )}
        {activeTab === 'networking' && (
          <div key="networking">
            <ChamberNetworkingTab onSelectSession={setSelectedSession} />
          </div>
        )}
        {activeTab === 'presentations' && (
          <div key="presentations">
            <ChamberPresentationsTab
              presentationTab={presentationTab}
              presentationCategory={presentationCategory}
              filteredPresentations={filteredPresentations}
              onChangeSubTab={setPresentationTab}
              onChangeCategory={setPresentationCategory}
              onOpenUploadDialog={() => setShowUploadDialog(true)}
              onSelectPresentation={setSelectedPresentation}
            />
          </div>
        )}
      </AnimatePresence>

      <MemberDetailOverlay member={selectedMember} onClose={() => setSelectedMember(null)} />
      <SessionDetailOverlay session={selectedSession} onClose={() => setSelectedSession(null)} />
      <PresentationDetailOverlay
        presentation={selectedPresentation}
        onClose={() => setSelectedPresentation(null)}
      />
      <UploadPresentationDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
      />
    </div>
  );
}
