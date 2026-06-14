/**
 * Disclaimer Content Registry
 * All disclaimer copy in one centralized file
 */

export interface DisclaimerContent {
  id: string;
  category: DisclaimerCategory;
  title: string;
  body: string;
  shortBody: string;
  arabicPhrase?: string;
  learnMoreRoute?: string;
}

export type DisclaimerCategory =
  | 'PLATFORM'
  | 'AI_CHATBOT'
  | 'FINANCIAL'
  | 'ZAKAT'
  | 'RELIGIOUS'
  | 'INVESTMENT'
  | 'HEALTH'
  | 'MATRIMONY'
  | 'PERSONAL_DATA'
  | 'HALAL_INTIMACY';

export const DISCLAIMERS: Record<string, DisclaimerContent> = {
  PLATFORM: {
    id: 'platform',
    category: 'PLATFORM',
    title: 'About ZaryahPlus',
    body: 'ZaryahPlus is an educational and informational platform designed to serve the global Muslim community. We are not a licensed financial institution, law firm, or religious authority. The content and tools provided are meant to educate, inspire, and assist — not to replace professional advice. We present authentic sources from across the Muslim scholarly tradition to build community and understanding, not to divide. Always consult qualified professionals for decisions affecting your finances, health, or legal matters.',
    shortBody: 'ZaryahPlus is an educational platform, not a licensed institution. Always consult qualified professionals.',
    arabicPhrase: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    learnMoreRoute: '/legal/disclaimers',
  },

  AI_CHATBOT: {
    id: 'ai_chatbot',
    category: 'AI_CHATBOT',
    title: 'AI Assistant Disclaimer',
    body: 'Our AI companions (Raya, Sahaba, Sahabiyat, and Imam personas) are powered by large language models and are not qualified scholars, muftis, or counsellors. Their responses are generated based on training data and may contain inaccuracies. For religious rulings (fatawa), always consult a qualified scholar from your trusted school of thought. For mental health concerns, please reach out to a licensed professional. The AI does not replace human wisdom — it is a tool to support your journey.',
    shortBody: 'AI responses are for guidance only — always verify with qualified scholars and professionals.',
    learnMoreRoute: '/legal/disclaimers',
  },

  FINANCIAL: {
    id: 'financial',
    category: 'FINANCIAL',
    title: 'Financial Information Disclaimer',
    body: 'The financial information, tools, and calculators provided by ZaryahPlus are for educational and informational purposes only. They do not constitute financial advice, investment recommendations, or an offer to buy or sell any securities. Past performance does not guarantee future results. Sharia compliance assessments are based on publicly available screening criteria and may differ from the rulings of your preferred scholars. Always consult a qualified Islamic finance advisor before making investment decisions.',
    shortBody: 'For educational purposes only — not financial advice. Consult a qualified advisor.',
    learnMoreRoute: '/legal/disclaimers',
  },

  ZAKAT: {
    id: 'zakat',
    category: 'ZAKAT',
    title: 'Zakat Calculator Disclaimer',
    body: 'Our Zakat calculator is a helpful tool based on commonly accepted Islamic jurisprudence, but scholars differ on specific calculations, nisab thresholds, and eligible assets. The results are estimates to assist your planning — they are not a fatwa. We recommend verifying your Zakat obligations with a qualified scholar or your local Islamic centre, especially for complex financial situations. May Allah accept your efforts.',
    shortBody: 'Zakat calculations are estimates — scholars differ on specifics. Verify with a qualified scholar.',
    learnMoreRoute: '/legal/disclaimers',
  },

  RELIGIOUS: {
    id: 'religious',
    category: 'RELIGIOUS',
    title: 'Religious Content Notice',
    body: 'ZaryahPlus presents Islamic content from reputable and respected sources across the major schools of thought (madhahib). We believe in the richness of scholarly diversity and present multiple perspectives — not to divide, but to educate and build bridges within our Ummah. Where scholars differ, we aim to show the range of valid opinions. This content is not a substitute for studying with qualified teachers or seeking personalized religious guidance.',
    shortBody: 'We present diverse scholarly views to educate, not divide. Consult qualified scholars for guidance.',
    arabicPhrase: 'اخْتِلَافُ أُمَّتِي رَحْمَة',
    learnMoreRoute: '/legal/disclaimers',
  },

  INVESTMENT: {
    id: 'investment',
    category: 'INVESTMENT',
    title: 'Investment Risk Disclaimer',
    body: 'All investments carry risk, including the potential loss of principal. The investment-related features in ZaryahPlus (including the Screener, Shark Tank, and related tools) are informational only and do not constitute investment advice or solicitation. Sharia screening criteria may vary across scholars and advisory boards. You are solely responsible for your investment decisions. Past performance, ratings, and compliance scores do not guarantee future results or continued Sharia compliance.',
    shortBody: 'All investments carry risk. This is informational only — not investment advice.',
    learnMoreRoute: '/legal/disclaimers',
  },

  HEALTH: {
    id: 'health',
    category: 'HEALTH',
    title: 'Wellbeing & Mental Health Notice',
    body: 'The wellness and companionship features in ZaryahPlus are designed to provide emotional support and Islamic spiritual guidance. They are not a substitute for professional mental health care, therapy, or medical treatment. If you are experiencing a mental health crisis, please contact your local emergency services or a licensed mental health professional immediately. Our AI companions care, but they cannot replace human connection and professional help.',
    shortBody: 'Not a substitute for professional mental health care. Seek help if in crisis.',
    learnMoreRoute: '/legal/disclaimers',
  },

  MATRIMONY: {
    id: 'matrimony',
    category: 'MATRIMONY',
    title: 'Matrimony Service Disclaimer',
    body: 'The matrimony feature is a platform for introduction and connection within the Muslim community. ZaryahPlus does not verify user identities, backgrounds, or claims beyond basic profile information. We strongly recommend involving family (wali) in the process, meeting in appropriate settings, and performing your own due diligence (istikhara and background checks). ZaryahPlus is not responsible for the conduct of any user or the outcome of any connection made through the platform.',
    shortBody: 'A platform for introduction only. Always involve family and do your own due diligence.',
    learnMoreRoute: '/legal/disclaimers',
  },

  PERSONAL_DATA: {
    id: 'personal_data',
    category: 'PERSONAL_DATA',
    title: 'Data & Privacy Notice',
    body: 'We take your privacy seriously. Your personal data, including KYC information, conversation history, and financial data, is stored securely and used only to improve your experience. We do not sell your data to third parties. AI conversation data may be processed by third-party AI providers under strict data processing agreements. You can request deletion of your data at any time through Settings.',
    shortBody: 'Your data is stored securely and never sold. You can request deletion anytime.',
    learnMoreRoute: '/legal/privacy',
  },

  HALAL_INTIMACY: {
    id: 'halal_intimacy',
    category: 'HALAL_INTIMACY',
    title: 'Halal Intimacy Content Notice',
    body: 'The Halal Intimacy section provides educational content about marital relations within Islamic guidelines. All content is sourced from respected Islamic scholars and presented with dignity and modesty. This section is intended for married adults. The information provided is educational and should not replace personal consultation with scholars or healthcare professionals for specific concerns.',
    shortBody: 'Educational content for married adults. Sourced from respected scholars.',
    learnMoreRoute: '/legal/disclaimers',
  },
};
