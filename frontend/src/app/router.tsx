/* eslint-disable react-refresh/only-export-components --
 * Router config file inherently mixes the `router` export (a route-config
 * object, not a component) with many `lazy()` route components. Splitting
 * them across files would obscure the route map for no HMR benefit — you
 * never edit the router config itself during hot-reload; you edit the
 * page components, which are imported via lazy() and refresh correctly.
 */

/**
 * Application Router
 * Defines all routes for the application
 * Uses MainLayout as shell for authenticated routes (sidebar + bottom nav)
 */

import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { InviteGate } from '@/features/auth/components/InviteGate';
import { MainLayout } from '@/features/navigation/components/MainLayout';
import { DeepKycGuard } from '@/features/kyc/components/DeepKycGuard';
import { AdminGuard } from '@/features/admin/components/AdminGuard';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';
import { ComingSoonWrapper } from '@/components/shared/ComingSoonBanner';
import logoGold from '@/assets/zaryah-logo-gold.png';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const SignupPage = lazy(() => import('@/features/auth/pages/SignupPage'));
const DashboardPage = lazy(() =>
  import('@/features/home/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ProfileSettingsPage = lazy(() =>
  import('@/features/profile/pages/ProfileSettingsPage').then((m) => ({ default: m.ProfileSettingsPage }))
);
const HelpSupportPage = lazy(() =>
  import('@/features/profile/pages/HelpSupportPage').then((m) => ({ default: m.HelpSupportPage }))
);
const AboutPage = lazy(() =>
  import('@/features/profile/pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const QuickKycPage = lazy(() =>
  import('@/features/kyc/pages/QuickKycPage').then((m) => ({ default: m.QuickKycPage }))
);
const DeepKycPage = lazy(() =>
  import('@/features/kyc/pages/DeepKycPage').then((m) => ({ default: m.DeepKycPage }))
);
const NotificationsPage = lazy(() =>
  import('@/features/notifications/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);
const QuranHomePage = lazy(() =>
  import('@/features/quran/pages/QuranHomePage').then((m) => ({ default: m.QuranHomePage }))
);
const QuranReadingPage = lazy(() =>
  import('@/features/quran/pages/QuranReadingPage').then((m) => ({ default: m.QuranReadingPage }))
);
const QuranRecitationPage = lazy(() =>
  import('@/features/quran/pages/QuranRecitationPage').then((m) => ({ default: m.QuranRecitationPage }))
);
const QuranStreakPage = lazy(() =>
  import('@/features/quran/pages/QuranStreakPage').then((m) => ({ default: m.QuranStreakPage }))
);
const QuranBookmarksPage = lazy(() =>
  import('@/features/quran/pages/QuranBookmarksPage').then((m) => ({ default: m.QuranBookmarksPage }))
);
const QuranHifzPage = lazy(() =>
  import('@/features/quran/pages/QuranHifzPage').then((m) => ({ default: m.QuranHifzPage }))
);
const QuranMemorizePage = lazy(() =>
  import('@/features/quran/pages/QuranMemorizePage').then((m) => ({ default: m.QuranMemorizePage }))
);
const QuranTestPage = lazy(() =>
  import('@/features/quran/pages/QuranTestPage').then((m) => ({ default: m.QuranTestPage }))
);
const QuranProgressPage = lazy(() =>
  import('@/features/quran/pages/QuranProgressPage').then((m) => ({ default: m.QuranProgressPage }))
);
const QuranMushafPage = lazy(() =>
  import('@/features/quran/pages/QuranMushafPage').then((m) => ({ default: m.QuranMushafPage }))
);
const QuranConceptSearchPage = lazy(() =>
  import('@/features/quran/pages/QuranConceptSearchPage').then((m) => ({ default: m.QuranConceptSearchPage }))
);
const QuranResearchPage = lazy(() =>
  import('@/features/quran/pages/QuranResearchPage').then((m) => ({ default: m.QuranResearchPage }))
);
const QuranLearningTracksPage = lazy(() =>
  import('@/features/quran/pages/QuranLearningTracksPage').then((m) => ({ default: m.QuranLearningTracksPage }))
);
const QuranLearningTrackDetailPage = lazy(() =>
  import('@/features/quran/pages/QuranLearningTrackDetailPage').then((m) => ({ default: m.QuranLearningTrackDetailPage }))
);
const QuranDailyAyahPage = lazy(() =>
  import('@/features/quran/pages/QuranDailyAyahPage').then((m) => ({ default: m.QuranDailyAyahPage }))
);
const QuranHifzCirclesPage = lazy(() =>
  import('@/features/quran/pages/QuranHifzCirclesPage').then((m) => ({ default: m.QuranHifzCirclesPage }))
);
const QuranHifzCircleDetailPage = lazy(() =>
  import('@/features/quran/pages/QuranHifzCircleDetailPage').then((m) => ({ default: m.QuranHifzCircleDetailPage }))
);
const QuranHifzCircleJoinPage = lazy(() =>
  import('@/features/quran/pages/QuranHifzCircleJoinPage').then((m) => ({ default: m.QuranHifzCircleJoinPage }))
);
const QuranRecitationDiaryPage = lazy(() =>
  import('@/features/quran/pages/QuranRecitationDiaryPage').then((m) => ({ default: m.QuranRecitationDiaryPage }))
);
const QuranGuessAyahPage = lazy(() =>
  import('@/features/quran/pages/QuranGuessAyahPage').then((m) => ({ default: m.QuranGuessAyahPage }))
);
const QuranTajweedPracticePage = lazy(() =>
  import('@/features/quran/pages/QuranTajweedPracticePage').then((m) => ({ default: m.QuranTajweedPracticePage }))
);
const QuranWorkspacePage = lazy(() =>
  import('@/features/quran/pages/QuranWorkspacePage').then((m) => ({ default: m.QuranWorkspacePage }))
);
const QuranWorkspaceEditorPage = lazy(() =>
  import('@/features/quran/pages/QuranWorkspaceEditorPage').then((m) => ({ default: m.QuranWorkspaceEditorPage }))
);
const QuranXrayPage = lazy(() =>
  import('@/features/quran/pages/QuranXrayPage').then((m) => ({ default: m.QuranXrayPage }))
);
const QuranDepthFaqsPage = lazy(() =>
  import('@/features/quran/pages/QuranDepthFaqsPage').then((m) => ({ default: m.QuranDepthFaqsPage }))
);
const QuranSurahQuizPage = lazy(() =>
  import('@/features/quran/pages/QuranSurahQuizPage').then((m) => ({ default: m.QuranSurahQuizPage }))
);
const SoukHomePage = lazy(() =>
  import('@/features/souk').then((m) => ({ default: m.SoukHomePage }))
);
const SoukCategoryPage = lazy(() =>
  import('@/features/souk').then((m) => ({ default: m.SoukCategoryPage }))
);
const SoukListingDetailPage = lazy(() =>
  import('@/features/souk').then((m) => ({ default: m.SoukListingDetailPage }))
);
const SoukCreateListingPage = lazy(() =>
  import('@/features/souk').then((m) => ({ default: m.SoukCreateListingPage }))
);
const SoukMyListingsPage = lazy(() =>
  import('@/features/souk').then((m) => ({ default: m.SoukMyListingsPage }))
);
const SoukSellerProfilePage = lazy(() =>
  import('@/features/souk').then((m) => ({ default: m.SoukSellerProfilePage }))
);
const SoukSavedPage = lazy(() =>
  import('@/features/souk').then((m) => ({ default: m.SoukSavedPage }))
);
const ChatbotPage = lazy(() =>
  import('@/features/chatbot/pages/ChatbotPage').then((m) => ({ default: m.ChatbotPage }))
);
const SharedQuietReportPage = lazy(() =>
  import('@/features/barakah-labs/pages/SharedQuietReportPage').then((m) => ({ default: m.SharedQuietReportPage }))
);
const SettingsPage = lazy(() =>
  import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const ZakatCalculatorPage = lazy(() =>
  import('@/features/zakat/pages/ZakatCalculatorPage').then((m) => ({ default: m.ZakatCalculatorPage }))
);
const HijriCalendarPage = lazy(() =>
  import('@/features/calendar/pages/HijriCalendarPage').then((m) => ({ default: m.HijriCalendarPage }))
);
const EducationPage = lazy(() =>
  import('@/features/education/pages/EducationPage').then((m) => ({ default: m.EducationPage }))
);
const QiblaCompassPage = lazy(() =>
  import('@/features/qibla/pages/QiblaCompassPage').then((m) => ({ default: m.QiblaCompassPage }))
);
const DigitalIdPage = lazy(() =>
  import('@/features/digital-id/pages/DigitalIdPage').then((m) => ({ default: m.DigitalIdPage }))
);
const RamadanKidsPage = lazy(() =>
  import('@/features/ramadan-kids/pages/RamadanKidsPage').then((m) => ({ default: m.RamadanKidsPage }))
);
const FaithHomePage = lazy(() =>
  import('@/features/faith/pages/FaithHomePage').then((m) => ({ default: m.FaithHomePage }))
);
const MasjidFinderPage = lazy(() =>
  import('@/features/faith/pages/MasjidFinderPage').then((m) => ({ default: m.MasjidFinderPage }))
);
const IslamicBankingPage = lazy(() =>
  import('@/features/islamic-banking/pages/IslamicBankingPage').then((m) => ({ default: m.IslamicBankingPage }))
);
const MatrimonyPage = lazy(() =>
  import('@/features/matrimony/pages/MatrimonyPage').then((m) => ({ default: m.MatrimonyPage }))
);
const RealEstatePage = lazy(() =>
  import('@/features/real-estate/pages/RealEstatePage').then((m) => ({ default: m.RealEstatePage }))
);
// KycPage removed — replaced by QuickKycPage + DeepKycPage
const ScreenerPage = lazy(() =>
  import('@/features/screener/pages/ScreenerPage').then((m) => ({ default: m.ScreenerPage }))
);
const BaitUlMaalPage = lazy(() =>
  import('@/features/bait-ul-maal/pages/BaitUlMaalPage').then((m) => ({ default: m.BaitUlMaalPage }))
);
const CommercePage = lazy(() =>
  import('@/features/commerce/pages/CommercePage').then((m) => ({ default: m.CommercePage }))
);
const WalletPage = lazy(() =>
  import('@/features/wallet/pages/WalletPage').then((m) => ({ default: m.WalletPage }))
);
const VoiceCompanionPage = lazy(() =>
  import('@/features/voice-companion/pages/VoiceCompanionPage').then((m) => ({ default: m.VoiceCompanionPage }))
);
const AdminLoginPage = lazy(() =>
  import('@/features/admin/pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const AdminPage = lazy(() =>
  import('@/features/admin/pages/AdminPage').then((m) => ({ default: m.AdminPage }))
);
const HalaqahAdminPage = lazy(() =>
  import('@/features/admin/pages/HalaqahAdminPage').then((m) => ({ default: m.HalaqahAdminPage }))
);
const ChamberV2Page = lazy(() =>
  import('@/features/chamber/pages/ChamberV2Page').then((m) => ({ default: m.ChamberV2Page }))
);
const SupportPage = lazy(() =>
  import('@/features/support/pages/SupportPage').then((m) => ({ default: m.SupportPage }))
);
const FeedbackPage = lazy(() =>
  import('@/features/feedback/pages/FeedbackPage').then((m) => ({ default: m.FeedbackPage }))
);
const MediaPage = lazy(() =>
  import('@/features/media/pages/MediaPage').then((m) => ({ default: m.MediaPage }))
);
// DebtRestructuringPage — Coming Soon
const EventsPage = lazy(() =>
  import('@/features/events/pages/EventsPage').then((m) => ({ default: m.EventsPage }))
);
const HalaqahPage = lazy(() =>
  import('@/features/halaqah/pages/HalaqahPage').then((m) => ({ default: m.HalaqahPage }))
);
const HalaqahPublicEventPage = lazy(() =>
  import('@/features/halaqah/pages/HalaqahPublicEventPage').then((m) => ({ default: m.HalaqahPublicEventPage }))
);
const ResearchHomePage = lazy(() =>
  import('@/features/research/pages/ResearchHomePage').then((m) => ({ default: m.ResearchHomePage }))
);
const ResearchArticlePage = lazy(() =>
  import('@/features/research/pages/ResearchArticlePage').then((m) => ({ default: m.ResearchArticlePage }))
);
const ResearchScholarProfilePage = lazy(() =>
  import('@/features/research/pages/ResearchScholarProfilePage').then((m) => ({ default: m.ResearchScholarProfilePage }))
);
const NotificationSettingsPage = lazy(() =>
  import('@/features/settings/pages/NotificationSettingsPage').then((m) => ({ default: m.NotificationSettingsPage }))
);
const WhatsAppLinkPage = lazy(() =>
  import('@/features/whatsapp-link/pages/WhatsAppLinkPage').then((m) => ({ default: m.WhatsAppLinkPage }))
);
const RayaHubPage = lazy(() =>
  import('@/features/raya-hub/pages/RayaHubPage').then((m) => ({ default: m.RayaHubPage }))
);
// TiswaPage — Coming Soon
const PrayerTimesPage = lazy(() =>
  import('@/features/prayer-times/pages/PrayerTimesPage').then((m) => ({ default: m.PrayerTimesPage }))
);
const BarkaLabsPage = lazy(() =>
  import('@/features/barakah-labs/pages/BarakahLabsRoot').then((m) => ({ default: m.BarakahLabsRoot }))
);
const PurificationCalculatorPage = lazy(() =>
  import('@/features/shariah/pages/PurificationCalculatorPage').then((m) => ({ default: m.PurificationCalculatorPage }))
);
const SharedConversationPage = lazy(() =>
  import('@/features/chatbot/pages/SharedConversationPage').then((m) => ({ default: m.SharedConversationPage }))
);
const PublicProfilePage = lazy(() => import('@/features/public-profile/pages/PublicProfilePage'));
const ConnectionsPage = lazy(() => import('@/features/connections/pages/ConnectionsPage'));
const ConsideredFewPage = lazy(() => import('@/features/sakinah/pages/ConsideredFewPage'));
const SakinahWelcomePage = lazy(() =>
  import('@/features/sakinah/pages/WelcomePage').then((m) => ({ default: m.WelcomePage }))
);
const SakinahRolePage = lazy(() =>
  import('@/features/sakinah/pages/RolePage').then((m) => ({ default: m.RolePage }))
);
const SakinahExpectPage = lazy(() =>
  import('@/features/sakinah/pages/ExpectPage').then((m) => ({ default: m.ExpectPage }))
);
const SakinahOverviewPage = lazy(() =>
  import('@/features/sakinah/pages/OverviewPage').then((m) => ({ default: m.OverviewPage }))
);
const SakinahRegisterPage = lazy(() =>
  import('@/features/sakinah/pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const SakinahNiyyahPage = lazy(() =>
  import('@/features/sakinah/pages/NiyyahPage').then((m) => ({ default: m.NiyyahPage }))
);
const SakinahValuesPage = lazy(() =>
  import('@/features/sakinah/pages/ValuesPage').then((m) => ({ default: m.ValuesPage }))
);
const SakinahMirrorPage = lazy(() =>
  import('@/features/sakinah/pages/MirrorPage').then((m) => ({ default: m.MirrorPage }))
);
const SakinahPortraitPage = lazy(() =>
  import('@/features/sakinah/pages/PortraitPage').then((m) => ({ default: m.PortraitPage }))
);
const SakinahCandidatePage = lazy(() =>
  import('@/features/sakinah/pages/CandidatePage').then((m) => ({ default: m.CandidatePage }))
);
const SakinahMatchFlowPage = lazy(() =>
  import('@/features/sakinah/pages/MatchFlowPage').then((m) => ({ default: m.MatchFlowPage }))
);
const SakinahConversationPage = lazy(() =>
  import('@/features/sakinah/pages/ConversationPage').then((m) => ({ default: m.ConversationPage }))
);
const SakinahDecisionPage = lazy(() =>
  import('@/features/sakinah/pages/DecisionPage').then((m) => ({ default: m.DecisionPage }))
);
const SakinahLivenessPage = lazy(() =>
  import('@/features/sakinah/pages/LivenessPage').then((m) => ({ default: m.LivenessPage }))
);
const SakinahPreferencesPage = lazy(() =>
  import('@/features/sakinah/pages/PreferencesPage').then((m) => ({ default: m.PreferencesPage }))
);
const SakinahSafetyPage = lazy(() =>
  import('@/features/sakinah/pages/SafetyPage').then((m) => ({ default: m.SafetyPage }))
);
const SakinahCommunityPage = lazy(() =>
  import('@/features/sakinah/pages/CommunityPage').then((m) => ({ default: m.CommunityPage }))
);
const SakinahVentPage = lazy(() =>
  import('@/features/sakinah/pages/VentPage').then((m) => ({ default: m.VentPage }))
);
const ConversationsPage = lazy(() => import('@/features/dms/pages/ConversationsPage'));
const ChatPage = lazy(() => import('@/features/dms/pages/ChatPage'));
const LinkedInCallbackPage = lazy(() =>
  import('@/features/auth/pages/LinkedInCallbackPage')
);
const LegalHubPage = lazy(() =>
  import('@/features/legal/pages/LegalHubPage').then((m) => ({ default: m.LegalHubPage }))
);
const PrivacyPolicyPage = lazy(() =>
  import('@/features/legal/pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsOfServicePage = lazy(() =>
  import('@/features/legal/pages/TermsOfServicePage').then((m) => ({ default: m.TermsOfServicePage }))
);
const DisclaimersPage = lazy(() =>
  import('@/features/legal/pages/DisclaimersPage').then((m) => ({ default: m.DisclaimersPage }))
);
const DataDeletionPage = lazy(() =>
  import('@/features/legal/pages/DataDeletionPage').then((m) => ({ default: m.DataDeletionPage }))
);
// EIM — Ethical Investment Mentor
const EimHomePage = lazy(() =>
  import('@/features/eim/pages/EimHomePage').then((m) => ({ default: m.EimHomePage }))
);
const EimLibraryPage = lazy(() =>
  import('@/features/eim/pages/EimLibraryPage').then((m) => ({ default: m.EimLibraryPage }))
);
const EimLevelPage = lazy(() =>
  import('@/features/eim/pages/EimLevelPage').then((m) => ({ default: m.EimLevelPage }))
);
const EimLessonPage = lazy(() =>
  import('@/features/eim/pages/EimLessonPage').then((m) => ({ default: m.EimLessonPage }))
);
const EimSimulatorPage = lazy(() =>
  import('@/features/eim/pages/EimSimulatorPage').then((m) => ({ default: m.EimSimulatorPage }))
);
const EimTimeMachinePage = lazy(() =>
  import('@/features/eim/pages/EimTimeMachinePage').then((m) => ({ default: m.EimTimeMachinePage }))
);
const EimStrategyComparatorPage = lazy(() =>
  import('@/features/eim/pages/EimStrategyComparatorPage').then((m) => ({ default: m.EimStrategyComparatorPage }))
);
const EimScenarioLabPage = lazy(() =>
  import('@/features/eim/pages/EimScenarioLabPage').then((m) => ({ default: m.EimScenarioLabPage }))
);
const EimProjectionPage = lazy(() =>
  import('@/features/eim/pages/EimProjectionPage').then((m) => ({ default: m.EimProjectionPage }))
);
const EimPortfolioPage = lazy(() =>
  import('@/features/eim/pages/EimPortfolioPage').then((m) => ({ default: m.EimPortfolioPage }))
);
const EimMentorPage = lazy(() =>
  import('@/features/eim/pages/EimMentorPage').then((m) => ({ default: m.EimMentorPage }))
);
const EimAnalysisPage = lazy(() =>
  import('@/features/eim/pages/EimAnalysisPage').then((m) => ({ default: m.EimAnalysisPage }))
);
const EimChatHistoryPage = lazy(() =>
  import('@/features/eim/pages/EimChatHistoryPage').then((m) => ({
    default: m.EimChatHistoryPage,
  }))
);
const EimPlaybookPage = lazy(() =>
  import('@/features/eim/pages/EimPlaybookPage').then((m) => ({ default: m.EimPlaybookPage }))
);
const EimCandlesticksPage = lazy(() =>
  import('@/features/eim/pages/EimCandlesticksPage').then((m) => ({ default: m.EimCandlesticksPage }))
);
const EimCandlestickPatternPage = lazy(() =>
  import('@/features/eim/pages/EimCandlestickPatternPage').then((m) => ({ default: m.EimCandlestickPatternPage }))
);
const EimPatternLabPage = lazy(() =>
  import('@/features/eim/pages/EimPatternLabPage').then((m) => ({ default: m.EimPatternLabPage }))
);
const EimScholarFAQsPage = lazy(() =>
  import('@/features/eim/pages/EimScholarFAQsPage').then((m) => ({ default: m.EimScholarFAQsPage }))
);
const EimUlamaPage = lazy(() =>
  import('@/features/eim/pages/EimUlamaPage').then((m) => ({ default: m.EimUlamaPage }))
);
// Mizan Mirror (EIM Phase F1) — premium-only behavioural-finance self-audit.
// Gated end-to-end on VITE_ENABLE_EIM_MIRROR; routes only register when on.
const EimMirrorPage = lazy(() =>
  import('@/features/eim/pages/EimMirrorPage').then((m) => ({ default: m.EimMirrorPage }))
);
const EimMirrorUploadPage = lazy(() =>
  import('@/features/eim/pages/EimMirrorUploadPage').then((m) => ({ default: m.EimMirrorUploadPage }))
);
const EimMirrorReportPage = lazy(() =>
  import('@/features/eim/pages/EimMirrorReportPage').then((m) => ({ default: m.EimMirrorReportPage }))
);
const EimMirrorPreviewPage = lazy(() =>
  import('@/features/eim/pages/EimMirrorPreviewPage').then((m) => ({ default: m.EimMirrorPreviewPage }))
);
// Halal Trading (EIM v2, T1 read-only terminal) — the separate "Halal Trading"
// product section (Model A / A1). Read-only: no KYC gate in v1.
const TradingHomePage = lazy(() =>
  import('@/features/trading/pages/TradingHomePage').then((m) => ({ default: m.TradingHomePage }))
);
const TradingStockDetailPage = lazy(() =>
  import('@/features/trading/pages/StockDetailPage').then((m) => ({ default: m.StockDetailPage }))
);
const TradingWatchlistPage = lazy(() =>
  import('@/features/trading/pages/WatchlistPage').then((m) => ({ default: m.WatchlistPage }))
);

// AEBCD onboarding — Stage A marketing landing at /welcome.
const StageALanding = lazy(() => import('@/features/onboarding/pages/StageALanding'));

/**
 * Feature flag — Mizan Mirror (EIM F1). Reads `VITE_ENABLE_EIM_MIRROR`
 * exactly once at module load. Per master plan §F1.0 prereq #1, Mirror must
 * not be visible to free users until paid tier (F4) ships, so the routes
 * (and the sidebar entry in _constants.ts) are conditionally registered.
 * Flip via `.env.local` or your CI env to enable on dev/staging.
 */
export const EIM_MIRROR_ENABLED =
  (import.meta.env.VITE_ENABLE_EIM_MIRROR as string | undefined) === 'true';

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E16]">
      <div className="flex flex-col items-center gap-4">
        <img
          src={logoGold}
          alt="ZaryahPlus logo"
          className="w-12 h-12 object-contain animate-pulse"
        />
        <p className="text-[#C9A85C] text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Phase 5 — per-route skeleton fallbacks for KYC + wallet. Generic
// "Loading…" spinner is fine for low-friction pages, but KYC/wallet
// are slow to first render (large form + Firebase reads) and the
// abrupt content shift when the chunk lands feels janky. A skeleton
// that approximates the shape of the page reduces perceived load time
// and gives the user something to focus on while the chunk fetches.

function KycSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0E16] px-4 pt-8 pb-16">
      <div className="max-w-md mx-auto space-y-6 animate-pulse">
        {/* Header bar */}
        <div className="h-2 bg-[rgba(212,168,83,0.15)] rounded-full" />
        {/* Title */}
        <div className="h-6 bg-[rgba(212,168,83,0.18)] rounded w-3/4" />
        <div className="h-4 bg-[rgba(212,168,83,0.10)] rounded w-1/2" />
        {/* Form fields */}
        <div className="space-y-5 pt-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-[rgba(212,168,83,0.10)] rounded w-1/3" />
              <div className="h-11 bg-[#10151F] rounded-xl border border-[rgba(212,168,83,0.15)]" />
            </div>
          ))}
        </div>
        {/* CTA */}
        <div className="h-12 bg-[rgba(212,168,83,0.20)] rounded-xl mt-8" />
      </div>
    </div>
  );
}

function WalletSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0E16] px-4 pt-6 pb-16">
      <div className="max-w-md mx-auto space-y-6 animate-pulse">
        {/* Balance hero card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#10151F] to-[#0A0E16] border border-[rgba(212,168,83,0.2)]">
          <div className="h-3 bg-[rgba(212,168,83,0.15)] rounded w-1/4 mb-3" />
          <div className="h-10 bg-[rgba(212,168,83,0.25)] rounded w-1/2 mb-2" />
          <div className="h-3 bg-[rgba(212,168,83,0.10)] rounded w-1/3" />
        </div>
        {/* Action buttons row */}
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 h-20 bg-[#10151F] rounded-xl border border-[rgba(212,168,83,0.15)]" />
          ))}
        </div>
        {/* Recent transactions list */}
        <div className="space-y-3 pt-2">
          <div className="h-4 bg-[rgba(212,168,83,0.15)] rounded w-1/3" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.10)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(212,168,83,0.15)]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[rgba(212,168,83,0.15)] rounded w-2/3" />
                <div className="h-3 bg-[rgba(212,168,83,0.08)] rounded w-1/3" />
              </div>
              <div className="h-3 w-12 bg-[rgba(212,168,83,0.15)] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Wrap lazy components with Suspense. The optional `fallback` prop
// lets specific routes use a tailored skeleton instead of the generic
// pulse-logo loader.
function LazyPage({
  Component,
  fallback,
}: {
  Component: React.LazyExoticComponent<React.ComponentType>;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback ?? <PageLoader />}>
      <Component />
    </Suspense>
  );
}

// Global error boundary for route-level crashes (e.g. Firestore assertion errors)
function RootErrorBoundary() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : String(error);
  const isFirestoreError = message.includes('INTERNAL ASSERTION FAILED');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E16] px-4">
      <div className="text-center max-w-md">
        <img src={logoGold} alt="ZaryahPlus" className="w-16 h-16 mx-auto mb-6 object-contain" />
        <h1 className="text-xl font-bold text-[#F5E8C7] mb-3">Something went wrong</h1>
        <p className="text-[#7A7363] text-sm mb-6">
          {isFirestoreError
            ? 'A cached data error occurred. Please clear your browser data and refresh.'
            : 'An unexpected error occurred. Please try refreshing the page.'}
        </p>
        <button
          onClick={() => {
            if (isFirestoreError) {
              // Clear IndexedDB to fix Firestore cache corruption
              indexedDB.databases?.().then((dbs) =>
                dbs.forEach((d) => d.name && indexedDB.deleteDatabase(d.name))
              );
            }
            window.location.href = '/';
          }}
          className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16]"
        >
          {isFirestoreError ? 'Clear Cache & Reload' : 'Reload App'}
        </button>
      </div>
    </div>
  );
}

// Create browser router with routes
export const router = createBrowserRouter([
  // Public routes (no layout shell) — invite-gated.
  // Phase 5 — every public route gets `errorElement: <RootErrorBoundary />`
  // so a render-time crash in (e.g.) the share page or LinkedIn callback
  // shows our recovery UI instead of a blank screen.
  {
    path: '/login',
    element: <LazyPage Component={LoginPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/signup',
    element: <InviteGate><LazyPage Component={SignupPage} /></InviteGate>,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/welcome',
    element: <InviteGate><LazyPage Component={StageALanding} /></InviteGate>,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/share/:id',
    element: <LazyPage Component={SharedConversationPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    // Public viewer for a Barakah Labs Quiet Report shared by another user.
    // No auth required.
    path: '/quiet-report/share/:token',
    element: <LazyPage Component={SharedQuietReportPage} />,
    errorElement: <RootErrorBoundary />,
  },
  // Backwards-compat: old /p/:slug links (including previously-shared QR codes)
  // still resolve to the same page.
  {
    path: '/p/:slug',
    element: <LazyPage Component={PublicProfilePage} />,
    errorElement: <RootErrorBoundary />,
  },
  // Handle-style URLs: /@umar. We route these through a single-segment
  // dynamic param that captures the leading "@" as part of the value, then
  // strip it inside PublicProfilePage. This avoids the literal-plus-dynamic
  // segment pattern (/@:slug) that some routers parse inconsistently.
  {
    path: '/:atHandle',
    element: <LazyPage Component={PublicProfilePage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/auth/linkedin/callback',
    element: <LazyPage Component={LinkedInCallbackPage} />,
    errorElement: <RootErrorBoundary />,
  },

  // Legal routes (public — accessible from signup/about without auth)
  {
    path: '/legal',
    element: <LazyPage Component={LegalHubPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/legal/privacy',
    element: <LazyPage Component={PrivacyPolicyPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/legal/terms',
    element: <LazyPage Component={TermsOfServicePage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/legal/disclaimers',
    element: <LazyPage Component={DisclaimersPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/legal/data-deletion',
    element: <LazyPage Component={DataDeletionPage} />,
    errorElement: <RootErrorBoundary />,
  },

  // Legacy demo redirects
  {
    path: '/demo/barakah-labs',
    element: <Navigate to="/barakah-labs" replace />,
  },
  {
    path: '/demo/barka-labs',
    element: <Navigate to="/barakah-labs" replace />,
  },
  {
    path: '/barka-labs',
    element: <Navigate to="/cyb" replace />,
  },

  // Full-screen routes (no layout shell, no auth required)
  {
    path: '/sakinah/welcome',
    element: <LazyPage Component={SakinahWelcomePage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/role',
    element: <LazyPage Component={SakinahRolePage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/expect',
    element: <LazyPage Component={SakinahExpectPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/overview',
    element: <LazyPage Component={SakinahOverviewPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/register',
    element: <LazyPage Component={SakinahRegisterPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah',
    element: <LazyPage Component={ConsideredFewPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/niyyah',
    element: <LazyPage Component={SakinahNiyyahPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/values',
    element: <LazyPage Component={SakinahValuesPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/mirror',
    element: <LazyPage Component={SakinahMirrorPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/portrait',
    element: <LazyPage Component={SakinahPortraitPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/candidate',
    element: <LazyPage Component={SakinahCandidatePage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/matchflow/:matchId',
    element: <LazyPage Component={SakinahMatchFlowPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/conversation/:matchId',
    element: <LazyPage Component={SakinahConversationPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/decision/:matchId',
    element: <LazyPage Component={SakinahDecisionPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/liveness',
    element: <LazyPage Component={SakinahLivenessPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/preferences',
    element: <LazyPage Component={SakinahPreferencesPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/safety',
    element: <LazyPage Component={SakinahSafetyPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/community',
    element: <LazyPage Component={SakinahCommunityPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/vent',
    element: <LazyPage Component={SakinahVentPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/quick-kyc',
    element: (
      <AuthGuard skipKycCheck>
        <LazyPage Component={QuickKycPage} fallback={<KycSkeleton />} />
      </AuthGuard>
    ),
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/deep-kyc',
    element: (
      <AuthGuard skipKycCheck>
        <LazyPage Component={DeepKycPage} fallback={<KycSkeleton />} />
      </AuthGuard>
    ),
    errorElement: <RootErrorBoundary />,
  },

  // Admin — completely separate gateway
  {
    path: '/admin/login',
    element: <LazyPage Component={AdminLoginPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/admin/dashboard',
    element: (
      <AdminGuard>
        <LazyPage Component={AdminPage} />
      </AdminGuard>
    ),
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/admin',
    element: <LazyPage Component={AdminLoginPage} />,
    errorElement: <RootErrorBoundary />,
  },

  // Authenticated routes with MainLayout (sidebar + bottom nav)
  {
    errorElement: <RootErrorBoundary />,
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <LazyPage Component={DashboardPage} /> },
      { path: 'dashboard', element: <LazyPage Component={DashboardPage} /> },
      { path: 'profile', element: <LazyPage Component={ProfileSettingsPage} /> },
      { path: 'user-overview', element: <Navigate to="/profile" replace /> },
      { path: 'help', element: <LazyPage Component={HelpSupportPage} /> },
      { path: 'about', element: <LazyPage Component={AboutPage} /> },
      { path: 'notifications', element: <LazyPage Component={NotificationsPage} /> },
      { path: 'connections', element: <LazyPage Component={ConnectionsPage} /> },
      { path: 'messages', element: <LazyPage Component={ConversationsPage} /> },
      { path: 'messages/:convId', element: <LazyPage Component={ChatPage} /> },
      // Feature routes — gated features wrapped with DeepKycGuard
      { path: 'screener', element: <DeepKycGuard><LazyPage Component={ScreenerPage} /></DeepKycGuard> },
      { path: 'purification', element: <ComingSoonWrapper><LazyPage Component={PurificationCalculatorPage} /></ComingSoonWrapper> },
      { path: 'ai-assistant', element: <LazyPage Component={ChatbotPage} /> },
      { path: 'zakat', element: <LazyPage Component={ZakatCalculatorPage} /> },
      { path: 'debt', element: <ComingSoonPage featureId="debt-restructuring" /> },
      { path: 'prayer-times', element: <LazyPage Component={PrayerTimesPage} /> },
      { path: 'barka-labs', element: <Navigate to="/barakah-labs" replace /> },
      { path: 'barakah-labs', element: <LazyPage Component={BarkaLabsPage} /> },
      { path: 'quran', element: <LazyPage Component={QuranHomePage} /> },
      { path: 'quran/read', element: <LazyPage Component={QuranReadingPage} /> },
      { path: 'quran/recitation', element: <LazyPage Component={QuranRecitationPage} /> },
      { path: 'quran/streak', element: <LazyPage Component={QuranStreakPage} /> },
      { path: 'quran/bookmarks', element: <LazyPage Component={QuranBookmarksPage} /> },
      { path: 'quran/hifz', element: <LazyPage Component={QuranHifzPage} /> },
      { path: 'quran/hifz/memorize', element: <LazyPage Component={QuranMemorizePage} /> },
      { path: 'quran/hifz/test', element: <LazyPage Component={QuranTestPage} /> },
      { path: 'quran/hifz/progress', element: <LazyPage Component={QuranProgressPage} /> },
      { path: 'quran/mushaf', element: <LazyPage Component={QuranMushafPage} /> },
      { path: 'quran/search', element: <LazyPage Component={QuranConceptSearchPage} /> },
      { path: 'quran/research', element: <LazyPage Component={QuranResearchPage} /> },
      { path: 'quran/tracks', element: <LazyPage Component={QuranLearningTracksPage} /> },
      { path: 'quran/tracks/:trackId', element: <LazyPage Component={QuranLearningTrackDetailPage} /> },
      { path: 'quran/daily-ayah', element: <LazyPage Component={QuranDailyAyahPage} /> },
      { path: 'quran/hifz/circles', element: <LazyPage Component={QuranHifzCirclesPage} /> },
      { path: 'quran/hifz/circles/join', element: <LazyPage Component={QuranHifzCircleJoinPage} /> },
      { path: 'quran/hifz/circles/:circleId', element: <LazyPage Component={QuranHifzCircleDetailPage} /> },
      { path: 'quran/recitation/diary', element: <LazyPage Component={QuranRecitationDiaryPage} /> },
      { path: 'quran/guess-ayah', element: <LazyPage Component={QuranGuessAyahPage} /> },
      { path: 'quran/tajweed-practice', element: <LazyPage Component={QuranTajweedPracticePage} /> },
      { path: 'quran/workspace', element: <LazyPage Component={QuranWorkspacePage} /> },
      { path: 'quran/workspace/:id', element: <LazyPage Component={QuranWorkspaceEditorPage} /> },
      { path: 'quran/surah/:id/xray', element: <LazyPage Component={QuranXrayPage} /> },
      { path: 'quran/surah/:id/depth-faqs', element: <LazyPage Component={QuranDepthFaqsPage} /> },
      { path: 'quran/surah/:id/quiz', element: <LazyPage Component={QuranSurahQuizPage} /> },
      { path: 'souk', element: <LazyPage Component={SoukHomePage} /> },
      { path: 'souk/create', element: <LazyPage Component={SoukCreateListingPage} /> },
      { path: 'souk/saved', element: <LazyPage Component={SoukSavedPage} /> },
      { path: 'souk/my-listings', element: <LazyPage Component={SoukMyListingsPage} /> },
      { path: 'souk/category/:type', element: <LazyPage Component={SoukCategoryPage} /> },
      { path: 'souk/listing/:id', element: <LazyPage Component={SoukListingDetailPage} /> },
      { path: 'souk/seller/:uid', element: <LazyPage Component={SoukSellerProfilePage} /> },
      { path: 'qibla', element: <ComingSoonWrapper><LazyPage Component={QiblaCompassPage} /></ComingSoonWrapper> },
      { path: 'calendar', element: <ComingSoonWrapper><LazyPage Component={HijriCalendarPage} /></ComingSoonWrapper> },
      { path: 'settings', element: <LazyPage Component={SettingsPage} /> },
      { path: 'education', element: <ComingSoonWrapper><LazyPage Component={EducationPage} /></ComingSoonWrapper> },
      { path: 'digital-id', element: <ComingSoonWrapper><LazyPage Component={DigitalIdPage} /></ComingSoonWrapper> },
      { path: 'ramadan-kids', element: <ComingSoonWrapper><LazyPage Component={RamadanKidsPage} /></ComingSoonWrapper> },
      { path: 'faith', element: <ComingSoonWrapper><LazyPage Component={FaithHomePage} /></ComingSoonWrapper> },
      { path: 'faith/masjid-finder', element: <ComingSoonWrapper><LazyPage Component={MasjidFinderPage} /></ComingSoonWrapper> },
      { path: 'islamic-banking', element: <ComingSoonWrapper><DeepKycGuard><LazyPage Component={IslamicBankingPage} /></DeepKycGuard></ComingSoonWrapper> },
      { path: 'matrimony', element: <ComingSoonWrapper><DeepKycGuard><LazyPage Component={MatrimonyPage} /></DeepKycGuard></ComingSoonWrapper> },
      { path: 'real-estate', element: <ComingSoonWrapper><DeepKycGuard><LazyPage Component={RealEstatePage} /></DeepKycGuard></ComingSoonWrapper> },
      { path: 'shark-tank', element: <ComingSoonPage featureId="shark-tank" /> },
      { path: 'chamber', element: <ComingSoonWrapper><DeepKycGuard><LazyPage Component={ChamberV2Page} /></DeepKycGuard></ComingSoonWrapper> },
      { path: 'halal-intimacy', element: <ComingSoonPage featureId="halal-intimacy" /> },
      { path: 'bait-ul-maal', element: <ComingSoonWrapper><LazyPage Component={BaitUlMaalPage} /></ComingSoonWrapper> },
      { path: 'commerce', element: <ComingSoonWrapper><DeepKycGuard><LazyPage Component={CommercePage} /></DeepKycGuard></ComingSoonWrapper> },
      { path: 'wallet', element: <DeepKycGuard><LazyPage Component={WalletPage} fallback={<WalletSkeleton />} /></DeepKycGuard> },
      { path: 'voice-companion', element: <ComingSoonWrapper><LazyPage Component={VoiceCompanionPage} /></ComingSoonWrapper> },
      { path: 'networking', element: <Navigate to="/connections" replace /> },
      { path: 'support', element: <LazyPage Component={SupportPage} /> },
      { path: 'feedback', element: <LazyPage Component={FeedbackPage} /> },
      { path: 'media', element: <ComingSoonWrapper><LazyPage Component={MediaPage} /></ComingSoonWrapper> },
      { path: 'events', element: <ComingSoonWrapper><LazyPage Component={EventsPage} /></ComingSoonWrapper> },
      { path: 'halaqah', element: <ComingSoonWrapper><LazyPage Component={HalaqahPage} /></ComingSoonWrapper> },
      { path: 'halaqah/event/:eventId', element: <LazyPage Component={HalaqahPublicEventPage} /> },
      { path: 'research', element: <LazyPage Component={ResearchHomePage} /> },
      { path: 'research/article/:articleId', element: <LazyPage Component={ResearchArticlePage} /> },
      { path: 'research/profile', element: <LazyPage Component={ResearchScholarProfilePage} /> },
      { path: 'settings/notifications', element: <LazyPage Component={NotificationSettingsPage} /> },
      { path: 'settings/whatsapp', element: <LazyPage Component={WhatsAppLinkPage} /> },
      { path: 'raya', element: <LazyPage Component={RayaHubPage} /> },
      { path: 'halaqah-admin', element: <ComingSoonWrapper><LazyPage Component={HalaqahAdminPage} /></ComingSoonWrapper> },
      { path: 'tiswa', element: <ComingSoonPage featureId="tiswa" /> },
      // EIM — Ethical Investment Mentor
      { path: 'eim', element: <LazyPage Component={EimHomePage} /> },
      { path: 'eim/library', element: <LazyPage Component={EimLibraryPage} /> },
      { path: 'eim/library/:levelId', element: <LazyPage Component={EimLevelPage} /> },
      { path: 'eim/lesson/:lessonId', element: <LazyPage Component={EimLessonPage} /> },
      // Simulator surfaces are financial features — gated behind Deep KYC
      // (build-spec P2-3.a security checklist; W6). Dynamic routes pass an
      // explicit featureName since the static pathname lookup won't match.
      { path: 'eim/simulator', element: <DeepKycGuard featureName="Mizan Simulator"><LazyPage Component={EimSimulatorPage} /></DeepKycGuard> },
      { path: 'eim/time-machine', element: <DeepKycGuard featureName="Mizan Time Machine"><LazyPage Component={EimTimeMachinePage} /></DeepKycGuard> },
      { path: 'eim/time-machine/:sessionId', element: <DeepKycGuard featureName="Mizan Time Machine"><LazyPage Component={EimTimeMachinePage} /></DeepKycGuard> },
      { path: 'eim/strategy-comparator', element: <DeepKycGuard featureName="Strategy Comparator"><LazyPage Component={EimStrategyComparatorPage} /></DeepKycGuard> },
      { path: 'eim/scenario-lab', element: <DeepKycGuard featureName="Scenario Lab"><LazyPage Component={EimScenarioLabPage} /></DeepKycGuard> },
      { path: 'eim/projection', element: <DeepKycGuard featureName="Projection"><LazyPage Component={EimProjectionPage} /></DeepKycGuard> },
      { path: 'eim/portfolio/:portfolioId', element: <DeepKycGuard featureName="Mizan Portfolio"><LazyPage Component={EimPortfolioPage} /></DeepKycGuard> },
      { path: 'eim/mentor', element: <LazyPage Component={EimMentorPage} /> },
      { path: 'eim/analysis', element: <LazyPage Component={EimAnalysisPage} /> },
      { path: 'eim/history', element: <LazyPage Component={EimChatHistoryPage} /> },
      { path: 'eim/playbook/:playbookId', element: <LazyPage Component={EimPlaybookPage} /> },
      { path: 'eim/candlesticks', element: <LazyPage Component={EimCandlesticksPage} /> },
      { path: 'eim/candlesticks/:patternId', element: <LazyPage Component={EimCandlestickPatternPage} /> },
      { path: 'eim/pattern-lab', element: <LazyPage Component={EimPatternLabPage} /> },
      { path: 'eim/scholar-faqs', element: <LazyPage Component={EimScholarFAQsPage} /> },
      { path: 'eim/ulama', element: <LazyPage Component={EimUlamaPage} /> },
      // Mizan Mirror — only registered when VITE_ENABLE_EIM_MIRROR=true.
      // When off, an authenticated user typing /eim/mirror hits the global
      // 404 → Navigate("/") fallback below.
      ...(EIM_MIRROR_ENABLED
        ? [
            { path: 'eim/mirror', element: <DeepKycGuard featureName="Mizan Mirror"><LazyPage Component={EimMirrorPage} /></DeepKycGuard> },
            { path: 'eim/mirror/upload', element: <DeepKycGuard featureName="Mizan Mirror"><LazyPage Component={EimMirrorUploadPage} /></DeepKycGuard> },
            { path: 'eim/mirror/preview', element: <DeepKycGuard featureName="Mizan Mirror"><LazyPage Component={EimMirrorPreviewPage} /></DeepKycGuard> },
            { path: 'eim/mirror/report', element: <DeepKycGuard featureName="Mizan Mirror"><LazyPage Component={EimMirrorReportPage} /></DeepKycGuard> },
          ]
        : []),
      // Halal Trading (EIM v2, T1) — read-only terminal, no KYC gate in v1.
      { path: 'trading', element: <LazyPage Component={TradingHomePage} /> },
      { path: 'trading/watchlist', element: <LazyPage Component={TradingWatchlistPage} /> },
      { path: 'trading/stock/:symbol', element: <LazyPage Component={TradingStockDetailPage} /> },
    ],
  },

  // 404 - Redirect to home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
