/**
 * Mock support data + types for SupportPage.
 *
 * Phase 5 split — extracted from SupportPage.tsx so the page component
 * is just JSX + ticket-thread state. The MOCK_* arrays are stand-ins
 * for the eventual Firestore-backed support API; when that lands these
 * arrays get replaced by hooks (`useSupportTickets`, etc.) and the
 * MOCK_ prefix is the breadcrumb that flags every place needing
 * a swap.
 */

// Types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed';
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt: string;
  messageCount: number;
  unreadCount?: number;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'support';
  message: string;
  timestamp: string;
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
  isPopular?: boolean;
  icon: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'Walkthrough' | 'Article' | 'QuickTip';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isFeatured?: boolean;
  views: number;
  completed?: boolean;
  steps?: string[];
  content?: string;
}

// Mock Data
export const MOCK_TICKETS: Ticket[] = [
  {
    id: '1',
    title: 'Unable to calculate Zakat on stocks',
    description: 'Getting an error when trying to calculate Zakat on my stock portfolio. The calculator shows...',
    status: 'Open',
    category: 'Technical',
    priority: 'High',
    createdAt: '2024-01-15',
    messageCount: 3,
    unreadCount: 1,
    messages: [
      { id: 'm1', sender: 'user', message: 'Getting an error when trying to calculate Zakat on my stock portfolio.', timestamp: '2024-01-15 10:30 AM' },
      { id: 'm2', sender: 'support', message: 'Thank you for reaching out. Can you please share a screenshot of the error?', timestamp: '2024-01-15 11:00 AM' },
      { id: 'm3', sender: 'user', message: 'Sure, here is the screenshot. It happens when I click Calculate.', timestamp: '2024-01-15 11:15 AM' },
    ],
  },
  {
    id: '2',
    title: 'Question about Murabaha financing',
    description: 'I need clarification on how Murabaha works for real estate purchases...',
    status: 'InProgress',
    category: 'Islamic Finance',
    priority: 'Medium',
    createdAt: '2024-01-14',
    messageCount: 5,
    messages: [
      { id: 'm1', sender: 'user', message: 'I need clarification on how Murabaha works for real estate purchases.', timestamp: '2024-01-14 09:00 AM' },
      { id: 'm2', sender: 'support', message: 'I can help with that. Murabaha is a cost-plus financing structure...', timestamp: '2024-01-14 10:30 AM' },
    ],
  },
  {
    id: '3',
    title: 'Profile picture not updating',
    description: 'Changed my profile picture but it still shows the old one after refreshing...',
    status: 'Resolved',
    category: 'Account',
    priority: 'Low',
    createdAt: '2024-01-13',
    messageCount: 4,
  },
  {
    id: '4',
    title: 'Billing issue - double charged',
    description: 'I was charged twice for my subscription this month. Transaction IDs: TXN001 and TXN002...',
    status: 'Open',
    category: 'Billing',
    priority: 'Urgent',
    createdAt: '2024-01-12',
    messageCount: 2,
    unreadCount: 1,
  },
  {
    id: '5',
    title: 'Feature request: Dark mode',
    description: 'Would love to see a dark mode option for the app...',
    status: 'Closed',
    category: 'Feature Request',
    priority: 'Low',
    createdAt: '2024-01-10',
    messageCount: 6,
  },
  {
    id: '6',
    title: 'Stock screener filter not working',
    description: 'When I apply Shariah compliance filters, the results are not updating...',
    status: 'InProgress',
    category: 'Bug Report',
    priority: 'High',
    createdAt: '2024-01-09',
    messageCount: 7,
    unreadCount: 2,
  },
  {
    id: '7',
    title: 'How to export Zakat report?',
    description: 'I need to export my Zakat calculation report as PDF for tax purposes...',
    status: 'Resolved',
    category: 'General',
    priority: 'Medium',
    createdAt: '2024-01-08',
    messageCount: 3,
  },
  {
    id: '8',
    title: 'Cannot connect with other users',
    description: 'The networking feature is not allowing me to send connection requests...',
    status: 'Open',
    category: 'Technical',
    priority: 'Medium',
    createdAt: '2024-01-07',
    messageCount: 4,
    unreadCount: 1,
  },
];

export const MOCK_FAQS: FAQ[] = [
  {
    id: '1',
    category: 'General',
    question: 'What is ZaryahPlus?',
    answer: 'ZaryahPlus is a comprehensive Islamic finance and lifestyle platform that helps Muslims manage their finances in accordance with Shariah principles. It includes features for Zakat calculation, halal stock screening, Islamic banking, networking, and more.',
    tags: ['basics', 'platform', 'overview'],
    isPopular: true,
    icon: '🌟',
  },
  {
    id: '2',
    category: 'General',
    question: 'How do I get started with ZaryahPlus?',
    answer: 'Getting started is easy! Simply create an account, complete your profile, and explore our features. We recommend starting with our onboarding tutorial and then checking out the Dashboard to see all available features.',
    tags: ['getting-started', 'beginner', 'setup'],
    isPopular: true,
    icon: '🚀',
  },
  {
    id: '3',
    category: 'General',
    question: 'Is ZaryahPlus free to use?',
    answer: 'ZaryahPlus offers both free and premium tiers. Basic features like Zakat calculation and halal stock screening are free. Premium features include advanced analytics, priority support, and exclusive content.',
    tags: ['pricing', 'subscription', 'free'],
    isPopular: true,
    icon: '💰',
  },
  {
    id: '4',
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'To reset your password, click on "Forgot Password" on the login page. Enter your email address and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.',
    tags: ['password', 'security', 'login'],
    icon: '🔐',
  },
  {
    id: '5',
    category: 'Account',
    question: 'How do I change my email address?',
    answer: 'Go to Settings > Account > Email. Enter your new email address and verify it by clicking the link we send to your new email. Your old email will remain active until verification is complete.',
    tags: ['email', 'account-settings', 'update'],
    icon: '📧',
  },
  {
    id: '6',
    category: 'Account',
    question: 'How do I delete my account?',
    answer: 'To delete your account, go to Settings > Account > Delete Account. Please note that this action is permanent and will delete all your data including Zakat calculations, saved stocks, and network connections.',
    tags: ['delete', 'account-removal', 'privacy'],
    icon: '🗑️',
  },
  {
    id: '7',
    category: 'Islamic Finance',
    question: 'What is halal investing?',
    answer: 'Halal investing follows Islamic (Shariah) principles. It avoids prohibited industries like alcohol, gambling, and conventional interest-based financial services. Investments must also meet specific financial ratios to ensure they are Shariah-compliant.',
    tags: ['halal', 'shariah', 'investing'],
    isPopular: true,
    icon: '📊',
  },
  {
    id: '8',
    category: 'Islamic Finance',
    question: 'How does Shariah screening work?',
    answer: 'Our Shariah screening process evaluates companies based on business activities and financial ratios. We check that less than 5% of revenue comes from prohibited sources and that debt-to-assets ratios meet Islamic requirements.',
    tags: ['screening', 'compliance', 'shariah'],
    icon: '✅',
  },
  {
    id: '9',
    category: 'Islamic Finance',
    question: 'What is Murabaha financing?',
    answer: 'Murabaha is a cost-plus financing structure where the financier purchases an asset and sells it to the customer at a marked-up price, with payment terms agreed upfront. This avoids interest (riba) by structuring the transaction as a sale rather than a loan.',
    tags: ['murabaha', 'financing', 'islamic-banking'],
    isPopular: true,
    icon: '🏦',
  },
  {
    id: '10',
    category: 'Zakat',
    question: 'How do I calculate my Zakat?',
    answer: 'Use our Zakat Calculator to add all your zakatable assets (cash, savings, gold, silver, investments, business inventory). The calculator automatically determines if you meet the Nisab threshold and calculates 2.5% of your net zakatable wealth.',
    tags: ['zakat', 'calculation', 'nisab'],
    isPopular: true,
    icon: '🧮',
  },
  {
    id: '11',
    category: 'Zakat',
    question: 'What is Nisab?',
    answer: 'Nisab is the minimum amount of wealth a Muslim must possess for one lunar year before Zakat becomes obligatory. It is equivalent to the value of 87.48 grams of gold or 612.36 grams of silver. We update these values daily.',
    tags: ['nisab', 'threshold', 'zakat'],
    icon: '⚖️',
  },
  {
    id: '12',
    category: 'Zakat',
    question: 'Who can receive Zakat?',
    answer: 'Zakat can be given to eight categories mentioned in the Quran: the poor, the needy, Zakat administrators, those whose hearts are to be reconciled, those in bondage, those in debt, in the cause of Allah, and the wayfarer.',
    tags: ['recipients', 'distribution', 'zakat'],
    icon: '🤲',
  },
  {
    id: '13',
    category: 'Stocks',
    question: 'How do I use the stock screener?',
    answer: 'Navigate to the Stock Screener from the main menu. Use filters to search by industry, market cap, and Shariah compliance status. Click on any stock to view detailed compliance information and financial metrics.',
    tags: ['screener', 'stocks', 'tutorial'],
    isPopular: true,
    icon: '📈',
  },
  {
    id: '14',
    category: 'Stocks',
    question: 'What compliance criteria do you use?',
    answer: 'We use AAOIFI standards for Shariah screening: Business activity screening (no prohibited industries), debt ratio (total debt < 30% of market cap), interest-bearing securities (< 30% of assets), and liquid assets (< 50% of total assets).',
    tags: ['criteria', 'aaoifi', 'compliance'],
    icon: '📋',
  },
  {
    id: '15',
    category: 'Stocks',
    question: 'How often is stock data updated?',
    answer: 'Stock prices are updated in real-time during market hours. Shariah compliance status is reviewed quarterly based on annual reports and financial statements. We notify users of any compliance changes.',
    tags: ['updates', 'realtime', 'data'],
    icon: '🔄',
  },
  {
    id: '16',
    category: 'Networking',
    question: 'How do I connect with other users?',
    answer: 'Go to the Networking section and search for users by name, profession, or interests. Click "Connect" on their profile. Once they accept, you can message them directly and see their activity in your feed.',
    tags: ['connections', 'networking', 'social'],
    icon: '🤝',
  },
  {
    id: '17',
    category: 'Networking',
    question: 'How does messaging work?',
    answer: 'Once connected with someone, you can send them direct messages through the Messages section. You can also create group chats with multiple connections. All messages are encrypted for privacy.',
    tags: ['messaging', 'chat', 'privacy'],
    icon: '💬',
  },
  {
    id: '18',
    category: 'Networking',
    question: 'Can I control my profile privacy?',
    answer: 'Yes! Go to Settings > Privacy to control who can see your profile, send you connection requests, and view your activity. You can choose from Public, Connections Only, or Private settings.',
    tags: ['privacy', 'settings', 'profile'],
    icon: '🔒',
  },
  {
    id: '19',
    category: 'Technical',
    question: 'What browsers are supported?',
    answer: 'ZaryahPlus works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience and security.',
    tags: ['browser', 'compatibility', 'technical'],
    icon: '🌐',
  },
  {
    id: '20',
    category: 'Technical',
    question: 'Is there a mobile app?',
    answer: 'Yes! ZaryahPlus is available on both iOS and Android. Download it from the App Store or Google Play Store. Your account syncs across all devices.',
    tags: ['mobile', 'app', 'ios', 'android'],
    isPopular: true,
    icon: '📱',
  },
  {
    id: '21',
    category: 'Technical',
    question: 'How is my data secured?',
    answer: 'We use industry-standard encryption (AES-256) for data at rest and TLS 1.3 for data in transit. All passwords are hashed using bcrypt. We are SOC 2 compliant and never share your data with third parties.',
    tags: ['security', 'encryption', 'privacy'],
    icon: '🛡️',
  },
];

export const MOCK_TUTORIALS: Tutorial[] = [
  {
    id: '1',
    title: 'Welcome to ZaryahPlus',
    description: 'A complete walkthrough of the platform and its features. Learn how to navigate and make the most of ZaryahPlus.',
    category: 'Getting Started',
    type: 'Walkthrough',
    duration: '5min',
    difficulty: 'Beginner',
    isFeatured: true,
    views: 1250,
    steps: [
      'Create your account and verify email',
      'Complete your profile information',
      'Explore the dashboard and main features',
      'Set up your preferences and notifications',
      'Complete your first action (calculate Zakat or screen a stock)',
    ],
  },
  {
    id: '2',
    title: 'Setting Up Your Profile',
    description: 'Learn how to create a complete profile with photo, bio, and professional information for networking.',
    category: 'Getting Started',
    type: 'Walkthrough',
    duration: '3min',
    difficulty: 'Beginner',
    views: 890,
    steps: [
      'Upload a profile picture',
      'Add your bio and professional information',
      'Set your location and interests',
      'Configure privacy settings',
    ],
  },
  {
    id: '3',
    title: 'Navigating the Dashboard',
    description: 'Understand the layout and how to quickly access different features from the main dashboard.',
    category: 'Getting Started',
    type: 'Article',
    duration: '4min',
    difficulty: 'Beginner',
    views: 1100,
    content: 'The ZaryahPlus dashboard is your central hub for all features. The left sidebar provides quick access to main sections like Zakat, Stocks, Networking, and more. The center panel shows your personalized feed and recent activity. The right sidebar displays notifications and quick actions.',
  },
  {
    id: '4',
    title: 'Calculate Your Zakat',
    description: 'Step-by-step guide to accurately calculating your Zakat using our comprehensive calculator.',
    category: 'Zakat Calculator',
    type: 'Walkthrough',
    duration: '8min',
    difficulty: 'Beginner',
    isFeatured: true,
    views: 2340,
    steps: [
      'Navigate to the Zakat Calculator',
      'Enter your cash and bank balances',
      'Add gold, silver, and jewelry values',
      'Include investment and stock holdings',
      'Add business inventory and assets',
      'Subtract debts and obligations',
      'Review your Nisab status',
      'Generate and save your Zakat report',
    ],
  },
  {
    id: '5',
    title: 'Understanding Nisab',
    description: 'Learn about Nisab thresholds, how they are calculated, and why they matter for Zakat.',
    category: 'Zakat Calculator',
    type: 'Article',
    duration: '5min',
    difficulty: 'Intermediate',
    views: 1560,
    content: 'Nisab is the minimum threshold of wealth that makes Zakat obligatory. It is based on the value of 87.48 grams of gold or 612.36 grams of silver. Scholars recommend using the silver standard as it benefits more recipients. ZaryahPlus automatically checks current precious metal prices to determine if you have reached Nisab.',
  },
  {
    id: '6',
    title: 'Zakat on Investments and Stocks',
    description: 'Advanced guide on calculating Zakat for various investment types including stocks, funds, and real estate.',
    category: 'Zakat Calculator',
    type: 'Article',
    duration: '10min',
    difficulty: 'Advanced',
    views: 980,
    content: 'Calculating Zakat on investments depends on the type and intention. For stocks held as trade, Zakat is due on the current market value. For stocks held for dividends, scholars differ on whether to pay on the full value or just the portion representing zakatable assets. Our calculator supports both methods.',
  },
  {
    id: '7',
    title: 'Using the Stock Screener',
    description: 'Complete tutorial on finding Shariah-compliant stocks and understanding compliance metrics.',
    category: 'Stock Screener',
    type: 'Walkthrough',
    duration: '7min',
    difficulty: 'Beginner',
    isFeatured: true,
    views: 1890,
    steps: [
      'Access the Stock Screener',
      'Apply Shariah compliance filter',
      'Filter by industry and market cap',
      'View stock details and compliance ratios',
      'Check business activity screening',
      'Add stocks to your watchlist',
      'Set up price alerts',
    ],
  },
  {
    id: '8',
    title: 'Shariah Compliance Criteria Explained',
    description: 'Deep dive into AAOIFI standards and how we determine if a stock is Shariah-compliant.',
    category: 'Stock Screener',
    type: 'Article',
    duration: '6min',
    difficulty: 'Intermediate',
    views: 1230,
    content: 'We use AAOIFI standards for screening. Business activity must be halal (no alcohol, gambling, pork, conventional banking). Financial ratios must meet: Total debt < 30% of market cap, interest-bearing securities < 30% of total assets, liquid assets < 50% of total assets. Stocks are re-screened quarterly.',
  },
  {
    id: '9',
    title: 'Advanced Stock Screening Techniques',
    description: 'Learn to use custom filters, compare multiple stocks, and build a halal investment portfolio.',
    category: 'Stock Screener',
    type: 'Article',
    duration: '12min',
    difficulty: 'Advanced',
    views: 670,
    content: 'Beyond basic screening, you can create custom filters combining multiple criteria. Compare stocks side-by-side to analyze financial metrics. Use our portfolio builder to ensure diversification across sectors while maintaining Shariah compliance. Track your portfolio performance and Zakat obligations in real-time.',
  },
  {
    id: '10',
    title: 'Building Your Professional Network',
    description: 'Strategies for connecting with like-minded Muslims and building meaningful professional relationships.',
    category: 'Networking',
    type: 'Walkthrough',
    duration: '5min',
    difficulty: 'Beginner',
    views: 1450,
    steps: [
      'Complete your professional profile',
      'Search for users by industry or interests',
      'PaperPlaneRight personalized connection requests',
      'Engage with posts and discussions',
      'Join relevant communities and groups',
    ],
  },
  {
    id: '11',
    title: 'Professional Profile Tips',
    description: 'Best practices for creating a compelling profile that attracts the right connections.',
    category: 'Networking',
    type: 'Article',
    duration: '4min',
    difficulty: 'Intermediate',
    views: 820,
    content: 'A strong profile includes a professional photo, clear headline, detailed bio highlighting your expertise, and relevant skills. Share your Islamic values and professional goals. Regular activity (posts, comments) increases visibility. Endorsements from connections build credibility.',
  },
  {
    id: '12',
    title: 'Effective Messaging Etiquette',
    description: 'Quick tips for professional and respectful communication on the platform.',
    category: 'Networking',
    type: 'QuickTip',
    duration: '2min',
    difficulty: 'Beginner',
    views: 950,
    content: 'Keep messages concise and professional. Start with Islamic greetings (As-salamu alaykum). Be clear about your purpose. Respect response times. Avoid generic copy-paste messages. Always thank others for their time and assistance.',
  },
  {
    id: '13',
    title: 'Islamic Banking Basics',
    description: 'Introduction to Islamic banking principles and how they differ from conventional banking.',
    category: 'Islamic Finance',
    type: 'Article',
    duration: '8min',
    difficulty: 'Beginner',
    isFeatured: true,
    views: 2100,
    content: 'Islamic banking prohibits riba (interest), gharar (excessive uncertainty), and maysir (gambling). Instead, it uses profit-sharing (Mudarabah), cost-plus financing (Murabaha), leasing (Ijarah), and partnership (Musharakah) structures. All transactions must involve real assets and ethical business practices.',
  },
  {
    id: '14',
    title: 'Sukuk vs Conventional Bonds',
    description: 'Understanding the key differences between Islamic Sukuk and conventional bonds.',
    category: 'Islamic Finance',
    type: 'Article',
    duration: '10min',
    difficulty: 'Advanced',
    views: 540,
    content: 'While conventional bonds are debt instruments paying interest, Sukuk represents ownership in underlying assets. Sukuk holders share in profits and risks of the asset. Returns come from asset performance, not predetermined interest. This makes Sukuk Shariah-compliant investment instruments.',
  },
  {
    id: '15',
    title: 'Comprehensive Halal Investment Guide',
    description: 'Everything you need to know about building and managing a Shariah-compliant investment portfolio.',
    category: 'Islamic Finance',
    type: 'Walkthrough',
    duration: '15min',
    difficulty: 'Intermediate',
    views: 1680,
    steps: [
      'Understand your investment goals and risk tolerance',
      'Learn Shariah compliance criteria',
      'Screen potential investments',
      'Diversify across asset classes',
      'Monitor compliance status regularly',
      'Calculate and purify impermissible income',
      'Track Zakat obligations on investments',
      'Rebalance portfolio annually',
    ],
  },
  {
    id: '16',
    title: 'Keyboard Shortcuts for Faster Navigation',
    description: 'Master keyboard shortcuts to navigate ZaryahPlus like a pro.',
    category: 'Tips & Tricks',
    type: 'QuickTip',
    duration: '2min',
    difficulty: 'Beginner',
    views: 1340,
    content: 'Press "/" to focus search, "N" for notifications, "M" for messages, "C" for new post. Use arrow keys to navigate lists. "?" shows all shortcuts. "Esc" closes modals. Ctrl/Cmd + K opens command palette for quick actions.',
  },
  {
    id: '17',
    title: 'Customizing Your Dashboard',
    description: 'Learn how to rearrange widgets and personalize your dashboard view.',
    category: 'Tips & Tricks',
    type: 'QuickTip',
    duration: '3min',
    difficulty: 'Intermediate',
    views: 780,
    content: 'Click the settings icon on your dashboard to enter edit mode. Drag and drop widgets to rearrange them. Hide widgets you don\'t use. Add new widgets from the widget library. Save custom layouts for different workflows (work, personal, financial).',
  },
];

