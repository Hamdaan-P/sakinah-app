import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { trackFeature } from '@/lib/analytics';
import { EventsPageTabs } from '../components/EventsPageTabs';
import { EventsOptionsView } from '../components/EventsOptionsView';
import { EventsBrowseView } from '../components/EventsBrowseView';
import { EventsHostView } from '../components/EventsHostView';
import { EventsMyEventsView } from '../components/EventsMyEventsView';
import { ConferenceDetailOverlay } from '../components/ConferenceDetailOverlay';
import { mockConferences, mockRegistrations } from '../_data';
import { EMPTY_HOST_FORM } from '../_constants';
import type {
  Conference,
  DetailTab,
  EventCategory,
  EventFormat,
  HostForm,
  MainView,
  MyEventsTab,
} from '../_types';

export function EventsPage() {
  useEffect(() => { trackFeature('events'); }, []);
  // Main view state
  const [mainView, setMainView] = useState<MainView>('options');

  // Browse view state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<EventFormat | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('Overview');

  // Host view state
  const [hostStep, setHostStep] = useState(1);
  const [showHostSuccess, setShowHostSuccess] = useState(false);
  const [hostForm, setHostForm] = useState<HostForm>(EMPTY_HOST_FORM);

  // My Events state
  const [myEventsTab, setMyEventsTab] = useState<MyEventsTab>('Upcoming');

  const filteredConferences = useMemo(() => {
    return mockConferences.filter((conf) => {
      const matchesSearch = conf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conf.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conf.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFormat = selectedFormat === 'All' || conf.format === selectedFormat;
      const matchesCategory = selectedCategory === 'All' || conf.category === selectedCategory;
      return matchesSearch && matchesFormat && matchesCategory;
    });
  }, [searchQuery, selectedFormat, selectedCategory]);

  const featuredConference = filteredConferences.find((c) => c.featured);
  const upcomingConferences = filteredConferences.filter((c) => !c.featured);

  const filteredRegistrations = useMemo(() => {
    return mockRegistrations.filter((reg) => {
      if (myEventsTab === 'Upcoming') return reg.status === 'upcoming';
      if (myEventsTab === 'Past') return reg.status === 'past';
      if (myEventsTab === 'Cancelled') return reg.status === 'cancelled';
      return false;
    });
  }, [myEventsTab]);

  const handleSelectConference = (c: Conference) => {
    setSelectedConference(c);
    setDetailTab('Overview');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#10151F' }}>
      <EventsPageTabs mainView={mainView} onChangeView={setMainView} />

      <AnimatePresence mode="wait">
        {mainView === 'options' && (
          <div key="options">
            <EventsOptionsView onChangeView={setMainView} />
          </div>
        )}
        {mainView === 'browse' && (
          <div key="browse">
            <EventsBrowseView
              searchQuery={searchQuery}
              selectedFormat={selectedFormat}
              selectedCategory={selectedCategory}
              showFilters={showFilters}
              featuredConference={featuredConference}
              upcomingConferences={upcomingConferences}
              onChangeSearch={setSearchQuery}
              onChangeFormat={setSelectedFormat}
              onChangeCategory={setSelectedCategory}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onSelectConference={handleSelectConference}
            />
          </div>
        )}
        {mainView === 'host' && (
          <div key="host">
            <EventsHostView
              showHostSuccess={showHostSuccess}
              hostStep={hostStep}
              hostForm={hostForm}
              onChangeStep={setHostStep}
              onChangeForm={setHostForm}
              onSubmit={() => setShowHostSuccess(true)}
              onBackToOptions={() => setMainView('options')}
              onCompleteSuccess={() => {
                setShowHostSuccess(false);
                setHostStep(1);
                setHostForm(EMPTY_HOST_FORM);
                setMainView('options');
              }}
            />
          </div>
        )}
        {mainView === 'myEvents' && (
          <div key="myEvents">
            <EventsMyEventsView
              myEventsTab={myEventsTab}
              filteredRegistrations={filteredRegistrations}
              onChangeSubTab={setMyEventsTab}
              onSelectConference={handleSelectConference}
            />
          </div>
        )}
      </AnimatePresence>

      <ConferenceDetailOverlay
        conference={selectedConference}
        detailTab={detailTab}
        onClose={() => setSelectedConference(null)}
        onChangeTab={setDetailTab}
      />
    </div>
  );
}
