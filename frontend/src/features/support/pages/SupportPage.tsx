import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Lifebuoy } from '@phosphor-icons/react';

import {
  MOCK_FAQS,
  MOCK_TICKETS,
  MOCK_TUTORIALS,
  type Ticket,
  type Tutorial,
} from '../_supportData';
import { DashboardTab } from './components/DashboardTab';
import { TicketsTab } from './components/TicketsTab';
import { FaqTab } from './components/FaqTab';
import { TutorialsTab } from './components/TutorialsTab';
import { CreateTicketModal } from './components/CreateTicketModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { LiveChatModal } from './components/LiveChatModal';
import { TutorialDetailModal } from './components/TutorialDetailModal';
import { TutorialFiltersModal } from './components/TutorialFiltersModal';


export function SupportPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tickets' | 'faq' | 'tutorials'>('dashboard');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'All' | 'Open' | 'Resolved' | 'Closed'>('All');
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('All');
  const [expandedFaqIds, setExpandedFaqIds] = useState<Set<string>>(new Set());
  const [tutorialSearchQuery, setTutorialSearchQuery] = useState('');
  const [tutorialCategoryFilter, setTutorialCategoryFilter] = useState('All');
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showTutorialDetail, setShowTutorialDetail] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [showTutorialFilters, setShowTutorialFilters] = useState(false);
  const [tutorialTypeFilter, setTutorialTypeFilter] = useState('All');
  const [tutorialDifficultyFilter, setTutorialDifficultyFilter] = useState('All');
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set(['1', '4', '7']));

  // Create Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [ticketDescription, setTicketDescription] = useState('');

  // Stats
  const ticketStats = { total: 23, open: 8, resolved: 12, closed: 3 };

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    let filtered = MOCK_TICKETS;

    if (ticketStatusFilter !== 'All') {
      filtered = filtered.filter(t => t.status === ticketStatusFilter);
    }

    if (ticketSearchQuery.trim()) {
      const query = ticketSearchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [ticketStatusFilter, ticketSearchQuery]);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    let filtered = MOCK_FAQS;

    if (faqCategoryFilter !== 'All' && faqCategoryFilter !== 'Popular') {
      filtered = filtered.filter(f => f.category === faqCategoryFilter);
    } else if (faqCategoryFilter === 'Popular') {
      filtered = filtered.filter(f => f.isPopular);
    }

    if (faqSearchQuery.trim()) {
      const query = faqSearchQuery.toLowerCase();
      filtered = filtered.filter(
        f =>
          f.question.toLowerCase().includes(query) ||
          f.answer.toLowerCase().includes(query) ||
          f.tags.some(tag => tag.toLowerCase().includes(query)),
      );
    }

    return filtered;
  }, [faqCategoryFilter, faqSearchQuery]);

  // Filtered Tutorials
  const filteredTutorials = useMemo(() => {
    let filtered = MOCK_TUTORIALS;

    if (tutorialCategoryFilter !== 'All' && tutorialCategoryFilter !== 'Featured') {
      filtered = filtered.filter(t => t.category === tutorialCategoryFilter);
    } else if (tutorialCategoryFilter === 'Featured') {
      filtered = filtered.filter(t => t.isFeatured);
    }

    if (tutorialTypeFilter !== 'All') {
      filtered = filtered.filter(t => t.type === tutorialTypeFilter);
    }

    if (tutorialDifficultyFilter !== 'All') {
      filtered = filtered.filter(t => t.difficulty === tutorialDifficultyFilter);
    }

    if (tutorialSearchQuery.trim()) {
      const query = tutorialSearchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [tutorialCategoryFilter, tutorialTypeFilter, tutorialDifficultyFilter, tutorialSearchQuery]);

  const toggleFaq = (id: string) => {
    const newExpanded = new Set(expandedFaqIds);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedFaqIds(newExpanded);
  };

  const toggleTutorialCompletion = (id: string) => {
    const newCompleted = new Set(completedTutorials);
    if (newCompleted.has(id)) newCompleted.delete(id);
    else newCompleted.add(id);
    setCompletedTutorials(newCompleted);
  };

  const handleCreateTicket = () => {
    // In real app, would submit to backend
    console.log('Creating ticket:', { ticketSubject, ticketCategory, ticketPriority, ticketDescription });
    setShowCreateTicket(false);
    setTicketSubject('');
    setTicketCategory('General');
    setTicketPriority('Medium');
    setTicketDescription('');
  };

  const handleSelectTicket = (t: Ticket) => {
    setSelectedTicket(t);
    setShowTicketDetail(true);
  };

  const handleSelectTutorial = (t: Tutorial) => {
    setSelectedTutorial(t);
    setShowTutorialDetail(true);
  };

  const tutorialCompletionPercentage = Math.round((completedTutorials.size / MOCK_TUTORIALS.length) * 100);

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Lifebuoy size={32} style={{ color: '#D4A853' }} />
          <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#F5E8C7', margin: 0 }}>Support Center</h1>
        </div>
        <p style={{ fontSize: '16px', color: '#C9C0A8', margin: 0 }}>
          Get help, find answers, and learn how to use ZaryahPlus
        </p>
      </div>

      {/* Tab Pills */}
      <div
        style={{
          display: 'flex', gap: '8px', marginBottom: '32px',
          padding: '6px', background: '#10151F',
          borderRadius: '12px', width: 'fit-content',
        }}
      >
        {(['dashboard', 'tickets', 'faq', 'tutorials'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 24px',
              background: activeTab === tab ? '#161D2C' : 'transparent',
              border: 'none', borderRadius: '8px',
              color: activeTab === tab ? '#F5E8C7' : '#C9C0A8',
              fontSize: '15px',
              fontWeight: activeTab === tab ? '600' : '500',
              cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
            }}
          >
            {tab === 'faq' ? 'FAQ' : tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <DashboardTab
            ticketStats={ticketStats}
            onOpenCreateTicket={() => setShowCreateTicket(true)}
            onOpenLiveChat={() => setShowLiveChat(true)}
            onGoFaq={() => setActiveTab('faq')}
            onGoTutorials={() => setActiveTab('tutorials')}
            onGoTickets={() => setActiveTab('tickets')}
            onSelectTicket={handleSelectTicket}
          />
        )}

        {activeTab === 'tickets' && (
          <TicketsTab
            searchQuery={ticketSearchQuery}
            setSearchQuery={setTicketSearchQuery}
            statusFilter={ticketStatusFilter}
            setStatusFilter={setTicketStatusFilter}
            filteredTickets={filteredTickets}
            onSelectTicket={handleSelectTicket}
            onOpenCreate={() => setShowCreateTicket(true)}
          />
        )}

        {activeTab === 'faq' && (
          <FaqTab
            searchQuery={faqSearchQuery}
            setSearchQuery={setFaqSearchQuery}
            categoryFilter={faqCategoryFilter}
            setCategoryFilter={setFaqCategoryFilter}
            expandedFaqIds={expandedFaqIds}
            toggleFaq={toggleFaq}
            filteredFaqs={filteredFaqs}
            onOpenCreateTicket={() => setShowCreateTicket(true)}
            onOpenLiveChat={() => setShowLiveChat(true)}
          />
        )}

        {activeTab === 'tutorials' && (
          <TutorialsTab
            searchQuery={tutorialSearchQuery}
            setSearchQuery={setTutorialSearchQuery}
            categoryFilter={tutorialCategoryFilter}
            setCategoryFilter={setTutorialCategoryFilter}
            filteredTutorials={filteredTutorials}
            completedTutorials={completedTutorials}
            toggleCompletion={toggleTutorialCompletion}
            tutorialCompletionPercentage={tutorialCompletionPercentage}
            onOpenFilters={() => setShowTutorialFilters(true)}
            onSelectTutorial={handleSelectTutorial}
          />
        )}
      </AnimatePresence>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {showCreateTicket && (
          <CreateTicketModal
            subject={ticketSubject}
            setSubject={setTicketSubject}
            category={ticketCategory}
            setCategory={setTicketCategory}
            priority={ticketPriority}
            setPriority={setTicketPriority}
            description={ticketDescription}
            setDescription={setTicketDescription}
            onClose={() => setShowCreateTicket(false)}
            onSubmit={handleCreateTicket}
          />
        )}
      </AnimatePresence>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {showTicketDetail && selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={() => setShowTicketDetail(false)}
          />
        )}
      </AnimatePresence>

      {/* Live Chat Modal */}
      <AnimatePresence>
        {showLiveChat && (
          <LiveChatModal onClose={() => setShowLiveChat(false)} />
        )}
      </AnimatePresence>

      {/* Tutorial Detail Modal */}
      <AnimatePresence>
        {showTutorialDetail && selectedTutorial && (
          <TutorialDetailModal
            tutorial={selectedTutorial}
            completed={completedTutorials.has(selectedTutorial.id)}
            onClose={() => setShowTutorialDetail(false)}
            onToggleCompletion={() => {
              toggleTutorialCompletion(selectedTutorial.id);
              setShowTutorialDetail(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Tutorial Filters Modal */}
      <AnimatePresence>
        {showTutorialFilters && (
          <TutorialFiltersModal
            typeFilter={tutorialTypeFilter}
            setTypeFilter={setTutorialTypeFilter}
            difficultyFilter={tutorialDifficultyFilter}
            setDifficultyFilter={setTutorialDifficultyFilter}
            onClose={() => setShowTutorialFilters(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
