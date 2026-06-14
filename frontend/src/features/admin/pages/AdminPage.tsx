/**
 * Admin Dashboard page — orchestrator for the admin tabs.
 *
 * State management (active tab, filters, selected user, modals) lives here.
 * Visual primitives, helpers, and per-tab content are extracted into
 * `../dashboard/`.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Spinner } from '@phosphor-icons/react';
import { auth } from '@/config/firebase.config';
import logoGold from '@/assets/zaryah-logo-gold.png';
import { useAdminStore } from '../stores/admin.store';
import {
  TABS, BG, SURFACE, GOLD, WHITE, TEXT_2, TEXT_3, BORDER,
} from '../dashboard/constants';
import { OverviewTab } from '../dashboard/OverviewTab';
import { UsersTab } from '../dashboard/UsersTab';
import { KycTab } from '../dashboard/KycTab';
import { ReferralsTab } from '../dashboard/ReferralsTab';
import { DnzEconomyTab } from '../dashboard/DnzEconomyTab';
import { ActivityFeedTab } from '../dashboard/ActivityFeedTab';
import { FeatureUsageTab } from '../dashboard/FeatureUsageTab';
import { AiCostsTab } from '../dashboard/AiCostsTab';
import { UserDetailModal } from '../dashboard/UserDetailModal';

export function AdminPage() {
  const navigate = useNavigate();
  const store = useAdminStore();
  const { activeTab, loading, error, stats, referralStats, kycFunnel, dnzEconomy, selectedUser, showUserModal } = store;

  // Get email from Firebase directly (no zustand dependency)
  const firebaseUser = auth.currentUser;

  // Lazy tab loading — only fetch data for the tab that's actually being viewed.
  // Switching back to a loaded tab uses cached data; Refresh button forces a reload.
  useEffect(() => {
    store.loadForTab(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- store is the zustand instance (stable); only re-run on tab change
  }, [activeTab]);

  // Refetch users on filter change (only while on the users tab)
  const { searchQuery, kycFilter, countryFilter, sortBy, sortDir } = store;
  useEffect(() => {
    if (activeTab !== 'users') return;
    const timer = setTimeout(() => store.fetchUsers(1), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- store is a stable zustand instance; we intentionally trigger only on filter changes
  }, [searchQuery, kycFilter, countryFilter, sortBy, sortDir, activeTab]);

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ background: `${BG}ee`, borderColor: BORDER }}>
        <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/login')} className="p-2 rounded-xl hover:bg-white/5 transition-colors" title="Sign out">
              <ArrowLeft size={20} weight="bold" style={{ color: TEXT_2 }} />
            </button>
            <img src={logoGold} alt="ZaryahPlus" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-xl font-black tracking-tight" style={{ color: WHITE }}>Admin Panel</h1>
              <p className="text-xs font-medium" style={{ color: TEXT_3 }}>ZaryahPlus Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => store.loadForTab(activeTab, true)}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: `${GOLD}15`, color: GOLD, border: `1px solid ${BORDER}` }}
            >
              {loading ? <Spinner size={16} className="animate-spin" /> : 'Refresh Data'}
            </button>
            <span className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: `${GOLD}15`, color: GOLD }}>
              {firebaseUser?.email || 'Admin'}
            </span>
            <button
              onClick={() => { auth.signOut(); navigate('/admin/login'); }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-red-500/20"
              style={{ color: '#F87171', border: '1px solid rgba(248,113,113,0.2)' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-6">
        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 mb-8 p-1.5 rounded-2xl" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => store.setTab(key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === key ? '' : 'hover:bg-white/5'
              }`}
              style={activeTab === key ? { background: GOLD, color: BG } : { color: TEXT_2 }}
            >
              <Icon size={18} weight="bold" />
              {label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && !stats && (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Spinner size={40} className="animate-spin mx-auto mb-4" style={{ color: GOLD }} />
              <p className="text-base font-medium" style={{ color: TEXT_2 }}>Loading dashboard...</p>
            </div>
          </div>
        )}

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && stats && <OverviewTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'dnz' && dnzEconomy && <DnzEconomyTab />}
            {activeTab === 'activity' && <ActivityFeedTab />}
            {activeTab === 'features' && <FeatureUsageTab />}
            {activeTab === 'kyc' && kycFunnel && <KycTab />}
            {activeTab === 'referrals' && referralStats && <ReferralsTab />}
            {activeTab === 'ai-costs' && <AiCostsTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* User modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <UserDetailModal user={selectedUser} onClose={store.closeUserModal} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminPage;
