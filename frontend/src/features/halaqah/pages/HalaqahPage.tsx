import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DisclaimerBanner } from '@/components/shared';
import { HalaqahShareSheet } from '../components/HalaqahShareSheet';
import { HalaqahPageHeader } from '../components/HalaqahPageHeader';
import { HalaqahDashboardTab } from '../components/HalaqahDashboardTab';
import { HalaqahBrowseTab } from '../components/HalaqahBrowseTab';
import { HalaqahHostTab } from '../components/HalaqahHostTab';
import { HalaqahMyEventsTab } from '../components/HalaqahMyEventsTab';
import { EventDetailOverlay } from '../components/EventDetailOverlay';
import { HostDashboardOverlay } from '../components/HostDashboardOverlay';
import { mockEvents, hostDashboardEvents } from '../_data';
import type {
  HalaqahEvent,
  HostDashboardTab,
  HostFormData,
  MainTab,
  MyEventsTab,
  ViewMode,
} from '../_types';

export function HalaqahPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedEvent, setSelectedEvent] = useState<HalaqahEvent | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [showHostDashboard, setShowHostDashboard] = useState(false);
  const [hostStep, setHostStep] = useState(0);
  const [hostFormData, setHostFormData] = useState<HostFormData>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [myEventsTab, setMyEventsTab] = useState<MyEventsTab>('upcoming');
  const [hostDashboardTab, setHostDashboardTab] = useState<HostDashboardTab>('all');
  const [hostSearchQuery, setHostSearchQuery] = useState('');

  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const filteredHostEvents = useMemo(() => {
    return hostDashboardEvents.filter((event) => {
      const matchesSearch = event.name.toLowerCase().includes(hostSearchQuery.toLowerCase());
      const matchesStatus = hostDashboardTab === 'all' || event.status === hostDashboardTab;
      return matchesSearch && matchesStatus;
    });
  }, [hostSearchQuery, hostDashboardTab]);

  const handleHostSubmit = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setHostStep(0);
      setHostFormData({});
      setActiveTab('dashboard');
    }, 3000);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <HalaqahPageHeader activeTab={activeTab} onChangeTab={setActiveTab} />

      <div style={{ flex: 1, overflow: 'auto', background: '#10151F' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <HalaqahDashboardTab
              onChangeTab={setActiveTab}
              onOpenHostDashboard={() => setShowHostDashboard(true)}
            />
          )}

          {activeTab === 'browse' && (
            <HalaqahBrowseTab
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              viewMode={viewMode}
              filteredEvents={filteredEvents}
              onChangeSearch={setSearchQuery}
              onChangeCategory={setSelectedCategory}
              onChangeViewMode={setViewMode}
              onSelectEvent={setSelectedEvent}
            />
          )}

          {activeTab === 'host' && (
            <HalaqahHostTab
              showSuccess={showSuccess}
              hostStep={hostStep}
              hostFormData={hostFormData}
              onChangeStep={setHostStep}
              onChangeForm={setHostFormData}
              onSubmit={handleHostSubmit}
              onBackToDashboard={() => {
                setShowSuccess(false);
                setHostStep(0);
                setHostFormData({});
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'myEvents' && (
            <HalaqahMyEventsTab myEventsTab={myEventsTab} onChangeSubTab={setMyEventsTab} />
          )}
        </AnimatePresence>
      </div>

      <EventDetailOverlay
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onShare={() => setShareOpen(true)}
      />

      {/* Share sheet — opens for the currently selected event */}
      {selectedEvent && (
        <HalaqahShareSheet
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          event={{
            id: selectedEvent.id,
            name: selectedEvent.name,
            date: selectedEvent.date,
            startTime: selectedEvent.startTime,
            venue: selectedEvent.venue,
            hostName: selectedEvent.hostName,
            description: selectedEvent.description,
          }}
        />
      )}

      <HostDashboardOverlay
        open={showHostDashboard}
        hostSearchQuery={hostSearchQuery}
        hostDashboardTab={hostDashboardTab}
        filteredHostEvents={filteredHostEvents}
        onClose={() => setShowHostDashboard(false)}
        onChangeSearch={setHostSearchQuery}
        onChangeTab={setHostDashboardTab}
      />

      <div style={{ padding: '0 16px 16px' }}>
        <DisclaimerBanner contentId="RELIGIOUS" variant="subtle" />
      </div>
    </div>
  );
}
