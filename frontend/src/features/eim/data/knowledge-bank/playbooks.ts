/**
 * Investor Playbooks — editorial articles about famous investors' publicly
 * documented strategies, overlaid with the Halal Lens. Each entry uses the
 * real investor's name (it's public information — same as any business-school
 * case study or Morningstar profile).
 *
 * Editorial vs. impersonation: this file is *editorial* content (third-person
 * articles about public investment history). The AI mentor personas in
 * eim_persona_prompts.py stay framework-vague because that surface is a
 * chat agent and impersonation there carries real risk — fabricated quotes,
 * first-person claims, etc. Two different surfaces, two different rules.
 *
 * Quote attribution discipline: use only quotes with strong public sourcing
 * (book + year, public letter, on-record interview). Where the quote is
 * widely repeated but the source is fuzzy, attribute conservatively
 * (e.g., "widely attributed to X"). Never invent a quote.
 *
 * Initial roster per master-plan §6.N; expands in P9 — all bounded by the
 * same Halal Lens discipline.
 */

import type { Playbook } from './schema';

export const PLAYBOOKS: Playbook[] = [
  {
    id: 'buffett',
    name: 'Warren Buffett',
    epithet: 'The Sage of Omaha',
    years_active: '1956–present',
    framework: 'Economic-moat investing · owner-mindset · forever holding',
    bio:
      'Warren Buffett (b. 1930, Omaha, Nebraska) trained under Benjamin Graham at Columbia Business School in the early 1950s, ran the Buffett Partnership Ltd. from 1956 to 1969, and has chaired Berkshire Hathaway since 1965 — turning a failing textile mill into one of the largest holding companies in the world. His investing philosophy evolved from Graham\'s strict "cigar-butt" value investing into a focus on durable, understandable businesses with economic moats (heavily shaped by his partner Charlie Munger). The discipline is mechanical: identify a moat, value the business conservatively, buy with a margin of safety, hold while the moat holds. Annual Berkshire shareholder letters (1977–present, freely available at berkshirehathaway.com) are the canonical public record of the approach.',
    signature_quote:
      'Our favorite holding period is forever.',
    signature_quote_source: 'Warren Buffett, 1988 Berkshire Hathaway shareholder letter',
    minutes: 12,
    tier: 'free',
    principles: [
      {
        name: 'Circle of Competence',
        body:
          'Only invest in businesses you genuinely understand. The size of your circle matters far less than knowing its boundaries. If you cannot explain how the company makes money in two sentences without jargon, it is outside your circle — and outside-the-circle bets are gambling, not investing.',
      },
      {
        name: 'Economic Moats',
        body:
          'A great business is protected from competition by some structural advantage — brand strength, network effects, low-cost production, or high switching costs. Without a moat, profits get competed away over time. With one, profits compound for decades.',
      },
      {
        name: 'Owner-Operator Management',
        body:
          'Read 10 years of CEO letters before buying. Are they rational? Do they think like owners spending their own money, or like agents spending someone else\'s? Capital allocation is 80% of the long-term outcome; management of your money matters as much as management of the products.',
      },
      {
        name: 'Margin of Safety',
        body:
          'Estimate the intrinsic value of the business conservatively, then refuse to pay more than ~2/3 of it. The 1/3 cushion is your protection against being wrong about the future — and you will be wrong sometimes. The concept originates in classical value investing; the moat tradition refines it from "cheap and bad" to "fair price for great" businesses.',
      },
      {
        name: 'Inactivity as Strategy',
        body:
          'The mistake most retail investors make is doing too much. The correct response to "what should I buy this week?" is almost always "nothing, hold what you have, wait for the next obvious opportunity". Patience is structurally rewarded; activity is structurally taxed.',
      },
      {
        name: 'Float as Free Leverage',
        body:
          'A signature edge of this tradition has historically been insurance "float" — premiums collected before claims are paid, invested in the meantime. **For a Muslim investor this principle does not transfer cleanly** — conventional insurance involves gharar + riba in the underwriting, so the entire float-engine is off-limits. The lesson translates to: prefer businesses that collect cash before delivering goods (membership clubs, SaaS annual contracts, pre-paid subscription models).',
      },
    ],
    case_studies: [
      {
        subject: 'Coca-Cola, 1988 onward',
        narrative:
          'Berkshire began accumulating Coca-Cola (KO) stock in 1988, ultimately spending around $1.3 billion to acquire roughly 7% of the company at about 15× earnings. The thesis was simple — a 100-year-old globally recognised brand selling a low-cost product to a growing world population, with pricing power and a global distribution moat. Three decades later, annual dividends from the position alone exceeded the original purchase price each year, and Berkshire has not sold a share. The illustration is of moat plus patience compounding.',
        halal_lens:
          'Coca-Cola typically passes most Shariah screens (low debt-to-assets, halal product, modest interest-bearing cash; minor purification often required). The lesson — buy a dominant brand and hold — applies directly. The framework, not the specific ticker, is the takeaway.',
      },
      {
        subject: "See's Candies, 1972 acquisition",
        narrative:
          "Berkshire (through subsidiary Blue Chip Stamps) acquired See's Candies in 1972 for $25 million. By 2019, See's had returned more than $2 billion in cumulative pre-tax earnings to Berkshire — on a business that sells roughly the same volume of chocolates every year. The genius was pricing power: See's raised prices slightly above inflation annually for decades and customers absorbed it. Buffett has called See's the acquisition that taught him to pay a fair price for a wonderful business rather than a bargain price for a mediocre one — the critical evolution away from pure Graham-style value investing.",
        halal_lens:
          "Pricing power as the marker of moat translates wholesale to halal investing. Look at any halal-screened stock and ask: would this company's customers absorb a 5% price increase next year? If yes, the moat is real.",
      },
      {
        subject: 'GEICO and the insurance float',
        narrative:
          'Buffett first bought GEICO stock in 1951 as a student of Graham (Graham was the chairman). Berkshire took a major stake in 1976 and acquired the company outright in 1996. GEICO became Berkshire\'s flagship insurance operation. Auto-insurance premiums (the "float") sit on the balance sheet for years before claims pay out — and that capital is invested in equities in the meantime. Over decades, this float-leverage effectively doubled returns on Berkshire\'s own capital and is widely considered the most important structural advantage Buffett built.',
        halal_lens:
          'This is the case study a Muslim investor most cannot copy. Conventional insurance underwriting involves gharar (uncertainty) and riba (interest earned on reserves invested in bonds) — Shariah consensus excludes this model. The Halal-Lens substitution: takaful (mutual-insurance) models exist but at smaller scale; for a retail investor the practical takeaway is "look for businesses with structural cash-flow timing advantages" — membership clubs, SaaS annual contracts, pre-paid subscriptions — not "buy an insurance company".',
      },
    ],
    halal_lens: [
      {
        verdict: 'applies_as_is',
        title: 'Long-term ownership of halal businesses',
        body:
          'Own a great business, hold for decades, let compounding do the work. This is core to the moat tradition *and* core to Maqasid al-Mal — hifz al-mal (preservation of wealth) through real productive ownership. The mechanics carry over completely.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Margin of safety',
        body:
          'Pay less than the business is conservatively worth. The discipline is identical for a Muslim investor — perhaps even more important, because the universe of halal-eligible stocks is smaller and patience for the right entry matters more.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Owner-operator management evaluation',
        body:
          'Read the CEO letters, assess rationality, judge capital allocation. The screen for honest, rational, owner-minded management is identical regardless of fiqh.',
      },
      {
        verdict: 'needs_modification',
        title: 'Concentrated portfolio',
        body:
          'Investors in this tradition often run 5-10 positions as 70%+ of their portfolio. For a Muslim retail investor, the smaller halal universe plus diversification across Shariah-screened sectors usually pushes toward 12-20 positions rather than 5-7. The principle (concentrate in your best ideas) holds; the number adjusts.',
      },
      {
        verdict: 'forbidden',
        title: "Berkshire's bank, insurance, and credit-card holdings",
        body:
          'Berkshire has historically held very large positions in Bank of America, American Express, Wells Fargo (now exited), and its own insurance operations (GEICO, General Re). These are off-limits for a Muslim no matter how wide-moat they are. Study the framework, skip the tickers — the framework is the lesson, the historical portfolio is not endorsed.',
      },
      {
        verdict: 'forbidden',
        title: 'Insurance float as a leverage engine',
        body:
          'The float-leverage mechanism doubled Berkshire\'s returns over decades. A Muslim investor cannot copy it — both the underwriting (gharar) and the reserve investment (often in riba-bearing bonds) violate Shariah. The structural insight (cash-flow timing as a competitive edge) still applies to halal businesses like membership clubs, SaaS annual contracts, or pre-paid subscription models.',
      },
    ],
    practical_exercise: {
      title: 'Build a moat-investing halal portfolio in the simulator',
      body:
        'Open the Simulator. Build a 5-position portfolio of halal-screened stocks whose primary business you can describe in two sentences. No banks, no insurance, no leveraged real estate. Run the Sage of Omaha persona analysis on it. Compare with what The Patient Steward says. Iterate. Hold the portfolio in your mind for 3+ years — would you still want to own it if the market closed tomorrow?',
    },
    references: [
      'Berkshire Hathaway annual shareholder letters, 1977–present (berkshirehathaway.com)',
      'Benjamin Graham, The Intelligent Investor (1949) — the foundation of Buffett\'s early framework',
      "Charlie Munger, Poor Charlie's Almanack — companion volume on moats and mental models",
      'AAOIFI Shariah Standard SS 21 — Financial Papers (Shares and Bonds)',
    ],
  },

  {
    id: 'graham',
    name: 'Benjamin Graham',
    epithet: 'The Father of Value Investing',
    years_active: '1914–1956',
    framework: 'Defensive value investing · Mr. Market · margin of safety',
    bio:
      'Benjamin Graham (1894–1976) is the founder of value investing as a discipline. He ran the Graham-Newman Corporation from 1936 to 1956 and taught the security-analysis course at Columbia Business School where his students included Warren Buffett, Walter Schloss, and Irving Kahn. His two foundational books — Security Analysis (co-authored with David Dodd, 1934) and The Intelligent Investor (1949) — defined the concepts every value-investing tradition since has built on: Mr. Market, margin of safety, the distinction between defensive and enterprising investors, the net-net (cigar-butt) method. The 1929 crash wiped out a large share of his clients\' capital; the books that followed are forged from that failure. His lens prizes scepticism of narrative, devotion to numbers, and asset-based downside protection above story or growth projections.',
    signature_quote:
      'In the short run, the market is a voting machine. In the long run, it is a weighing machine.',
    signature_quote_source: 'Benjamin Graham, widely attributed via Security Analysis lectures and The Intelligent Investor',
    minutes: 11,
    tier: 'free',
    principles: [
      {
        name: 'Mr. Market is a moody business partner',
        body:
          'Imagine you co-own a business with an irrational, manic-depressive partner named Mr. Market. Every day he quotes you a price at which he will buy your share or sell you his. Some days he is euphoric and demands extreme prices; other days he is despondent and offers absurd discounts. You do not have to transact. You can simply look at his offer and decide: is the underlying business actually worth more or less than this number?',
      },
      {
        name: 'Margin of Safety',
        body:
          'Never pay more than ~2/3 of your conservative estimate of intrinsic value. The 1/3 gap is your protection against being wrong — about the future, about the company, about yourself. The tradition holds that "the three most important words in investing are margin of safety."',
      },
      {
        name: 'Defensive vs Enterprising Investor',
        body:
          'The framework distinguishes two postures. The **defensive investor** wants safety and freedom from effort; for them, diversified low-cost index ownership and modest active picking is enough. The **enterprising investor** has time and temperament for deep analysis; they can pick individual securities. Most retail investors should be defensive — and accept that label without shame.',
      },
      {
        name: 'Quantitative Balance-Sheet Tests',
        body:
          'For the defensive investor the classical tradition proposes seven hard rules: adequate size, strong financial condition (current ratio ≥ 2), earnings stability across 10 years, dividend record across 20 years, earnings growth ≥ 33% over a decade, moderate P/E (≤ 15), moderate price-to-book (≤ 1.5). Apply the rules; ignore the stories.',
      },
      {
        name: 'The Net-Net (Cigar Butt)',
        body:
          'The most famous quantitative method of the tradition: buy stocks trading below their net current asset value (cash + receivables + inventory minus all debt). Even if the business is dying, the liquidation value protects you. Modern markets rarely produce these any more — later traditions moved past it to "fair price for great" — but the principle (asset-based downside protection) endures.',
      },
      {
        name: 'Avoid Forecasts; Anchor on Past Performance',
        body:
          'The classical framework deeply distrusted forecasts. Buy on what the business has actually demonstrated over 10 years, not on what an analyst projects. Earnings growth is a fact when reported; an estimate is just a story.',
      },
    ],
    case_studies: [
      {
        subject: 'GEICO, 1948',
        narrative:
          'In 1948, Graham-Newman took a 50% stake in the then-tiny Government Employees Insurance Company (GEICO) for roughly $712,000. Ironically, the position was so large that regulators forced Graham-Newman to distribute the shares to its own investors. By the early 1970s, that distributed stake was worth roughly $400 million — a 28% annualised return over nearly 24 years. The position alone outperformed the cumulative return of every other investment in Graham-Newman\'s history combined. Graham\'s lesson: a few great ideas, held long enough, dominate the outcome of an entire disciplined career.',
        halal_lens:
          'Conventional insurance businesses are off-limits for a Muslim investor. The principle (concentrated long-term ownership of one transformative idea will dominate diversified ordinary results) transfers; the security does not.',
      },
      {
        subject: 'The Net-Net Era — Graham-Newman, 1936–1956',
        narrative:
          'In the post-Depression decades the US market was littered with companies trading below their liquidation value. Graham-Newman systematically bought baskets of these "net-nets" — often 30–50 positions at a time — holding each until it doubled or two years had passed. The aggregate compounded at roughly 20% per year. The opportunity has largely vanished as institutional capital and transparency closed the gap — but every market crisis (2008, 2020) briefly reproduces it in pockets.',
        halal_lens:
          'During genuine crisis crashes, a Muslim investor with cash on hand can sometimes find halal-screened businesses trading at less than net current asset value. The discipline — buy assets at a discount, ignore the narrative — is the part of Graham\'s tradition that keeps applying.',
      },
      {
        subject: 'The 1929 crash',
        narrative:
          'In the late 1920s Graham, like most professionals, rode the bull market hard and ignored some of his own developing valuation discipline. The 1929 crash and the 1930–1932 grinding bear market that followed wiped out a large share of Graham-Newman\'s client capital. The decade Graham spent rebuilding produced Security Analysis (1934). The book\'s tone — sceptical of narrative, devoted to numbers — is forged from this failure.',
        halal_lens:
          'Story stocks tempt a Muslim investor as much as any other — a halal-screened crypto firm with no earnings, an Islamic-finance fintech at 30× revenue. Graham\'s rule: do the numbers support the story? If you must answer "the story is the asset", you are speculating.',
      },
    ],
    halal_lens: [
      {
        verdict: 'applies_as_is',
        title: 'Margin of safety',
        body:
          'Pay less than the business is worth. Universal discipline; the fiqh of the buyer does not change the arithmetic.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Mr. Market mental model',
        body:
          'Treating market prices as offers from a moody partner — not as truths to be believed — is one of the most psychologically protective frames a Muslim investor can carry. It aligns with tawakkul: you do your homework, you make your decision, and you don\'t trade your faith for the market\'s mood.',
      },
      {
        verdict: 'applies_as_is',
        title: "Defensive investor's diversified ownership",
        body:
          'The classical defensive-investor recipe (~10-30 broad positions, low effort) maps almost perfectly to an indexing-style halal ETF portfolio for the modern Muslim — a global halal-equity ETF plus a sukuk ETF plus allocated gold. The classical framework would have nodded approvingly.',
      },
      {
        verdict: 'needs_modification',
        title: "The tradition's classical sector breadth",
        body:
          'The tradition historically held banks, insurance companies, and regulated utilities with heavy debt — the standard mid-20th-century diversified equity universe. A modern Muslim investor narrows this universe by roughly 30% (banking + insurance + alcohol + gambling + adult entertainment all excluded). The principle of broad sector diversification holds; the specific sectors shift.',
      },
      {
        verdict: 'forbidden',
        title: 'Bonds as the defensive anchor',
        body:
          'The classical 60/40 split (60% equities, 40% bonds) is the foundation of modern defensive investing in this tradition. For a Muslim, the 40% bond half is off-limits — it is riba. The Halal substitute: sukuk ETFs play the same role structurally — predictable income, lower volatility — through a riba-free legal form. Same allocation, different vehicle.',
      },
      {
        verdict: 'forbidden',
        title: 'Convertible debentures and warrant arbitrage',
        body:
          'Several of the tradition\'s favourite tactical positions (convertible bonds, merger arbitrage with leverage, complex warrant trades) are off-limits — they either bake in riba (the convertible bond is a loan with optionality) or rely on speculation on event timing (gharar). Skip these chapters of the canonical texts; the broader framework still teaches.',
      },
    ],
    practical_exercise: {
      title: "Apply the framework's defensive screen in the simulator",
      body:
        'Open the Simulator. Apply the classical defensive checklist as you build a portfolio: each position must be a real, profitable business with a current ratio ≥ 2, 10-year earnings record, modest P/E and price-to-book. Use the EIM Triple-Shariah screen to ensure halal compliance on top. Run the Father of Value persona analysis. Notice which of your picks the classical lens would not touch even at attractive valuations — and ask whether you should reconsider too.',
    },
    references: [
      'Benjamin Graham, The Intelligent Investor (1949) — the canonical retail text',
      'Benjamin Graham & David Dodd, Security Analysis (1934) — the foundational treatise',
      'Janet Lowe, Benjamin Graham on Value Investing (1994) — biographical context',
      'AAOIFI Shariah Standard SS 21 — Financial Papers (Shares and Bonds)',
    ],
  },

  {
    id: 'lynch',
    name: 'Peter Lynch',
    epithet: 'The Local Genius',
    years_active: '1977–1990 (Magellan Fund) · author/educator since',
    framework: 'Invest in what you know · scuttlebutt research',
    bio:
      'Peter Lynch (b. 1944) managed Fidelity\'s Magellan Fund from 1977 to 1990, compounding at roughly 29.2% annually — one of the best long-running mutual-fund records in history. He grew the fund from about $18 million to $14 billion before retiring at 46. His philosophy is anti-Wall-Street in spirit: spend twenty minutes a year on a stock you understand from daily life, categorise it correctly, hold while the story is intact. His two indispensable books — One Up on Wall Street (1989) and Beating the Street (1993), co-authored with John Rothchild — distil the method in plain language and remain the canonical retail-investor primers on growth investing. The lens prizes ground-truth observation, common-sense categorisation, and patience over institutional consensus.',
    signature_quote:
      "Behind every stock is a company. Find out what it's doing.",
    signature_quote_source: 'Peter Lynch, One Up on Wall Street (1989)',
    minutes: 11,
    tier: 'free',
    principles: [
      {
        name: 'Invest in what you know',
        body:
          'The amateur has an edge over Wall Street on companies whose products they use, whose stores they visit, whose customers they are. By the time a major bank\'s analyst is recommending a regional restaurant chain, you — a customer for ten years — already knew the line was getting longer every Saturday morning. That ground-truth observation is the edge.',
      },
      {
        name: 'Six categories of stocks',
        body:
          'The framework buckets stocks into six types: **slow growers** (3-5% earnings growth, dividend-paying utilities), **stalwarts** (10-12%, big established names), **fast growers** (20%+, smaller fast-growing companies — the multibaggers), **cyclicals** (auto, steel — track the cycle), **turnarounds** (battered companies fixing themselves), **asset plays** (hidden value not on the income statement). The mistake retail investors make is mixing up categories — buying a stalwart and expecting fast-grower returns.',
      },
      {
        name: 'Scuttlebutt — the field-research method',
        body:
          'Visit the stores. Try the products. Talk to suppliers and competitors. Read the 10-K — but only after the ground-level observations have told you whether the story is worth your time. The 10-K confirms or refutes the story; it does not generate it.',
      },
      {
        name: 'PEG ratio (P/E ÷ growth)',
        body:
          "The framework's favourite single metric. A P/E of 20 is expensive for a 5%-grower, cheap for a 40%-grower. PEG < 1 is the rough threshold for an interesting growth stock. Useless for stalwarts and cyclicals — apply it where it fits.",
      },
      {
        name: 'Avoid hot stocks in hot industries',
        body:
          'The stocks Wall Street is most excited about have the most expectations baked into them. The boring stalwart that everyone yawns past usually outperforms the hot story-stock over five years. Boring is a feature.',
      },
      {
        name: 'Stick around long enough for the story to play out',
        body:
          'The tradition holds stocks for years, sometimes decades. The temptation to sell after a 30% gain destroys the multibagger — the stock that goes up 10× was a 2× somewhere along the way. The discipline is to keep checking the story, not the price.',
      },
    ],
    case_studies: [
      {
        subject: 'Dunkin\' Donuts',
        narrative:
          'Lynch\'s canonical scuttlebutt example, recounted in One Up on Wall Street: he noticed his family loved the coffee at Dunkin\' Donuts. Store visits confirmed the product was consistent, lines were long, the company was profitable, the P/E was modest, and the franchising model meant low capital expenditure. He bought the stock for Magellan and it became one of the fund\'s best multi-baggers. The thesis was visible to every customer; Wall Street simply wasn\'t paying attention to a doughnut chain.',
        halal_lens:
          'Dunkin\' is straightforwardly halal — coffee plus doughnuts, no haram revenue. The scuttlebutt method (notice everyday consumer behaviour, buy the stalwart, hold for years) ports cleanly to halal-investing equivalents like Saudi food companies, regional halal-grocery chains, or any consumer-staples brand you actually use.',
      },
      {
        subject: 'La Quinta Motor Inns',
        narrative:
          "A second canonical case from Beating the Street: La Quinta, a no-frills budget hotel chain, was steadily eating Holiday Inn's market in the south-western US in the early 1980s. Lynch's site visits found rooms clean, occupancy high, prices about 30% lower than competitors. The cookie-cutter expansion model meant predictable unit economics per location. Magellan bought heavily and held; the stock multibagged through the decade.",
        halal_lens:
          'Hotel chains can be tricky for Muslim investors when alcohol revenue is significant. A no-frills budget model where the bar/restaurant impure-income component is small can sometimes pass standard AAOIFI screens with purification. The scuttlebutt method survives — buy the better operator at a fair price — but the screening overlay adds a step.',
      },
      {
        subject: 'Avoiding Polaroid in the early 1980s',
        narrative:
          'Polaroid was Wall Street\'s darling in the early 1980s — Edwin Land\'s instant-photography company, a "Nifty Fifty" survivor still trading at a P/E over 80. Lynch refused to touch it. The principle he repeats in One Up on Wall Street: "You can have the best company in the world and still lose money if you pay too much." Polaroid crashed and eventually filed for bankruptcy in 2001. The discipline of not chasing hot stocks at hot multiples saved Magellan from a generation-defining wipeout.',
      },
    ],
    halal_lens: [
      {
        verdict: 'applies_as_is',
        title: 'Invest in halal businesses you actually use',
        body:
          'The scuttlebutt method is fiqh-neutral. A Muslim investor in Karachi can apply it to local consumer-staples names; in London to halal-screened supermarkets; in Mumbai to halal-screened consumer brands. The method scales — just keep the halal-screen overlay.',
      },
      {
        verdict: 'applies_as_is',
        title: 'PEG ratio + category framework',
        body:
          'Both are pure valuation/categorisation tools — no fiqh content. Apply identically. Halal investing benefits from the category discipline because the smaller halal universe rewards better category-fit even more.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Avoid hot stocks at hot multiples',
        body:
          'Universal discipline. The 2021 Pakistani tech listings, the 2024 AI-named SPACs, the 2025 Islamic-fintech IPOs — same warning applies regardless of fiqh status. Multiple matters as much as story.',
      },
      {
        verdict: 'needs_modification',
        title: 'Six-bucket categorisation in the halal universe',
        body:
          'The framework\'s six categories were built on a US market with deep cyclical (autos, steel) and turnaround (retail, airlines) exposure. The halal-screened universe has thinner cyclicals (most autos pass cleanly; banks/airlines often don\'t). Adapt the categories — the framework holds, the population shifts.',
      },
      {
        verdict: 'forbidden',
        title: "This tradition's typical financial-sector holdings",
        body:
          'Funds in this tradition historically held banks, insurance companies, and savings-and-loan institutions — typical 1980s US fund holdings. A Muslim cannot replicate. The method is not the portfolio. Take the method, apply it to halal-screened universe, ignore the historical tickers from that era.',
      },
      {
        verdict: 'forbidden',
        title: 'Sin-stock bargain hunting',
        body:
          'The scuttlebutt tradition was sometimes willing to buy alcohol/gambling/tobacco stocks at deep value. For a Muslim, no valuation makes a sin-revenue business halal. Cigar-butt logic does not transcend the business-activity screen.',
      },
    ],
    practical_exercise: {
      title: 'Run the scuttlebutt method on a halal stock you actually use',
      body:
        'Pick one halal-screened company whose product or service you\'ve personally engaged with in the past month. Write down (a) what you observed about demand, (b) which of the six categories it fits, (c) the PEG if applicable, (d) what would make you sell. Build a 1-position simulator portfolio with it. Re-run that observation note quarterly for a year.',
    },
    references: [
      'Peter Lynch & John Rothchild, One Up on Wall Street (1989)',
      'Peter Lynch & John Rothchild, Beating the Street (1993)',
      'Peter Lynch & John Rothchild, Learn to Earn (1995) — introductory primer',
      'AAOIFI Shariah Standard SS 21 — Financial Papers (Shares and Bonds)',
    ],
  },

  {
    id: 'bogle',
    name: 'John C. Bogle',
    epithet: 'The Index Guardian',
    years_active: '1974–2019 (Vanguard founder)',
    framework: 'Low-cost broad indexing · costs compound against you',
    bio:
      'John "Jack" Bogle (1929–2019) founded The Vanguard Group in 1974 and launched the first retail index mutual fund — the First Index Investment Trust (now the Vanguard 500 Index Fund) — in 1976. He turned passive indexing from a curiosity Wall Street called "un-American" and "guaranteed mediocrity" into the dominant model of global asset management; Vanguard now manages more than $9 trillion. His central insight is structural: investors pay roughly half of their long-term gains to active managers in fees, and across the industry as a whole those active managers cannot beat the market they collectively are. His canonical book Common Sense on Mutual Funds (1999) is the manifesto. The lens prizes humility about forecasting, hostility to costs, and the discipline of doing almost nothing.',
    signature_quote:
      "Don't look for the needle in the haystack. Just buy the haystack.",
    signature_quote_source: 'John C. Bogle, The Little Book of Common Sense Investing (2007)',
    minutes: 10,
    tier: 'free',
    principles: [
      {
        name: 'Costs compound against you the same way returns compound for you',
        body:
          'A 2% expense ratio over 40 years consumes about 60% of your final wealth versus a 0.05% index fund — even before considering the higher pre-fee returns of indices. The maths is brutal and there is no fund manager skilled enough to overcome it consistently for decades. Fight every basis point.',
      },
      {
        name: 'Own the whole market, not pieces of it',
        body:
          'The aggregate of all investors must, by definition, earn the market return minus costs. Active management is therefore a zero-sum game before costs and negative-sum after costs. Owning the whole market via a low-cost index sidesteps the game entirely — you take the market return, which is the average that all active managers collectively cannot beat.',
      },
      {
        name: 'Time in the market beats timing the market',
        body:
          'Missing the best 10 days in a broad equity index over 20 years cuts returns roughly in half — and those best 10 days cluster immediately after the worst days (when most timers are out of the market in fear). The structural advantage of being always invested in low-cost indexed equity is unbeatable for the average investor.',
      },
      {
        name: 'Automate everything; ignore the financial-services industry',
        body:
          'A central insight of this tradition about marketing: the financial industry is incentivised to make you trade, switch, restructure, refinance — every action generates fees for them. Counter-discipline: pick a simple low-cost allocation, automate contributions on payday, never touch it. Boredom is the strategy.',
      },
      {
        name: 'Asset allocation matters more than security selection',
        body:
          'What percentage of your portfolio is in equities vs sukuk vs gold matters far more than which specific equities you pick. Spend 95% of your investing energy on the allocation question; 5% on the security question. Most retail investors invert this and lose.',
      },
    ],
    case_studies: [
      {
        subject: 'Vanguard 500 Index Fund — 1976 launch',
        narrative:
          'Bogle launched the First Index Investment Trust (now the Vanguard 500 Index Fund) in 1976 — the first retail index mutual fund. The IPO raised just $11 million, far short of the $150 million target, and Wall Street called the product "Bogle\'s Folly". By 2000 it was the largest mutual fund in the world. By 2020, passive funds had captured the majority share of US fund flows. The case study is the disruption itself: a contrarian structural idea, mocked at launch, vindicated over decades.',
      },
      {
        subject: 'The Bogleheads three-fund portfolio',
        narrative:
          'The Bogleheads community that grew up around Bogle\'s philosophy distilled his framework into the simplest possible portfolio: a US total-stock-market index (e.g. VTI), an international-stock index (e.g. VXUS), and a total-bond-market index (e.g. BND). Three tickers. Annual rebalancing. Multiple studies have shown this beats roughly 80% of active retail portfolios over 20-year periods. Simplicity scales; complexity destroys edges.',
        halal_lens:
          'The three-fund portfolio for a Muslim is: a halal global-equity ETF (e.g. HLAL or ISDU), a halal sukuk ETF (e.g. SPSK), and allocated gold. Same structural elegance, riba-free vehicles. Bogle\'s method is unusually portable to halal investing because indexing itself is fiqh-neutral — only the underlying screen matters.',
      },
    ],
    halal_lens: [
      {
        verdict: 'applies_as_is',
        title: 'The cost-compounding insight',
        body:
          'Universal. A 1% management fee compounds against you over 40 years regardless of fiqh. Halal ETFs have crept down to 0.30–0.50% — competitive with conventional broad-market funds. Pay the fee for the halal screen; refuse to pay any extra for "active" halal management on top.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Automate and ignore',
        body:
          'The behavioural advice (automate monthly contributions, don\'t watch the market) maps directly to the Islamic discipline of consistent practice (istiqama). The halal-investing application is identical.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Asset allocation > security selection',
        body:
          'Especially true in the halal universe, where individual security selection within already-screened funds adds little value but bond/sukuk vs equity vs gold allocation drives most of long-term outcome.',
      },
      {
        verdict: 'needs_modification',
        title: 'The classic 60/40 portfolio',
        body:
          'The classical indexing recommendation is 60% equity / 40% bonds. For a Muslim, the 40% bond half is off-limits — it is riba. The halal substitute: 60% halal equity ETF / 30% sukuk ETF / 10% allocated gold. Same allocation logic, riba-free vehicles. The principle survives; the specific tickers change.',
      },
      {
        verdict: 'forbidden',
        title: 'Total-market indexing without screening',
        body:
          'The purest recommendation of the tradition — a total-market index fund — owns banks, insurance, alcohol, gambling, defence in proportion to their market cap. A Muslim cannot use this product. The halal substitutes cost roughly 10-25× as much (0.30-0.50% vs 0.03%) but are non-negotiable. This is one place where the halal premium is structural and unavoidable.',
      },
    ],
    practical_exercise: {
      title: 'Build the Muslim three-fund portfolio',
      body:
        'Open the Simulator. Build a single portfolio with three positions: ~65% in a halal global-equity ETF, ~25% in a halal sukuk ETF, ~10% in allocated gold. That\'s it. Run any persona analysis — most will tell you this is 90% of what most retail Muslim investors should ever do.',
    },
    references: [
      'John C. Bogle, Common Sense on Mutual Funds (1999) — the manifesto',
      'John C. Bogle, The Little Book of Common Sense Investing (2007) — short-form primer',
      'Taylor Larimore, The Bogleheads\' Guide to Investing (2006) — community distillation',
      'AAOIFI Shariah Standard SS 21 — Financial Papers (Shares and Bonds)',
    ],
  },

  {
    id: 'dalio',
    name: 'Ray Dalio',
    epithet: 'The All-Weather Strategist',
    years_active: '1975–present (Bridgewater Associates)',
    framework: 'Risk-parity · regime-agnostic balance · All-Weather portfolio',
    bio:
      'Ray Dalio (b. 1949) founded Bridgewater Associates in 1975 out of his New York apartment; it became the world\'s largest hedge fund, managing over $150 billion at its peak. He stepped back from CIO responsibilities in 2022. His macro investing framework is built around the four economic regimes: the question is not "what will the market do" but "is your portfolio balanced across the four possible regimes" — growth rising, growth falling, inflation rising, inflation falling. The lens prizes radical diversification, regime-awareness, and structural balance over forecasting any single outcome. The retail-friendly distillation is the All-Weather portfolio, designed in the 1990s to survive every regime rather than win any single one. His books Principles (2017) and Big Debt Crises (2018) document the philosophy and the long-debt-cycle research.',
    signature_quote:
      'The biggest mistake investors make is to believe that what happened in the recent past is likely to persist.',
    signature_quote_source: 'Ray Dalio, Principles: Life and Work (2017)',
    minutes: 11,
    tier: 'free',
    principles: [
      {
        name: 'Four economic regimes',
        body:
          'Every period of economic history falls into one of four regimes: (1) growth rising + inflation rising, (2) growth rising + inflation falling, (3) growth falling + inflation rising (stagflation), (4) growth falling + inflation falling (deflation). Different assets thrive in each. A portfolio optimised for one regime fails in the other three — and you cannot reliably predict which regime is next.',
      },
      {
        name: 'Risk parity over dollar parity',
        body:
          "Don't allocate 60% to stocks and 40% to bonds by dollar amount — that gives stocks ~90% of the portfolio's risk because they're 3-4× more volatile. Instead, allocate so each asset class contributes equally to portfolio volatility. The result is structurally more balanced and historically smoother than a traditional 60/40.",
      },
      {
        name: 'Diversify, then diversify some more',
        body:
          'The framework holds that the holy grail of investing is to find 15-20 good, uncorrelated return streams. Most retail portfolios have one — equity beta. Adding genuinely uncorrelated streams (real assets, gold, international, regime-balanced) dramatically improves Sharpe ratio. The point is not to find better ideas; it is to combine adequate ideas that don\'t move together.',
      },
      {
        name: 'Pay attention to the credit cycle',
        body:
          'Long-term debt cycles run roughly 50-75 years; short-term cycles run roughly 5-8. The canonical text *Big Debt Crises* maps the patterns. The current global cycle is in its late-stage debt-saturation phase — the implication is structurally lower returns, higher tail risk, and a real case for inflation-hedging assets. The macro frame matters.',
      },
      {
        name: 'Radical transparency about your own thinking',
        body:
          'A core discipline of this tradition: write down your investment decisions, why you made them, what would change your mind. Review honestly. Most investors fail not from bad ideas but from inability to learn from their own track record. Muhasaba (self-accounting) by another name.',
      },
    ],
    case_studies: [
      {
        subject: 'Bridgewater All-Weather portfolio — 1996 onward',
        narrative:
          'Dalio launched the All-Weather strategy at Bridgewater in 1996 as a regime-balanced retirement allocation for his own family trust, later opened to clients. The retail-friendly version popularised by Tony Robbins in Money: Master the Game (2014): 30% stocks, 40% long-term bonds, 15% intermediate bonds, 7.5% gold, 7.5% commodities. Backtested across roughly eight decades, it delivered ~7–9% annualised with substantially lower volatility than a pure-equity portfolio. It was specifically engineered to survive every regime, not to win any single one.',
        halal_lens:
          "The All-Weather portfolio's 55% bond allocation is off-limits for a Muslim — that is the core ribawi half. The halal substitute: replace the 40% long-term bonds with halal sukuk (long-duration sukuk ETFs or direct sovereign sukuk holdings), replace the 15% intermediate bonds with shorter-duration sukuk or cash. Gold and commodities translate directly. The risk-balancing logic survives; the specific instruments change.",
      },
      {
        subject: 'Bridgewater Pure Alpha — flagship macro strategy',
        narrative:
          'Bridgewater\'s flagship Pure Alpha fund has produced roughly 12% annualised returns since its 1991 launch, though the strategy uses substantial leverage and active macro positioning well beyond retail capability. Dalio is open that Pure Alpha\'s edge came from radical diversification + regime-awareness combined with currency, rates, and commodity positioning — not from picking individual stock winners. The retail takeaway is not "do what Bridgewater does" — replicating the spirit (broad regime-balanced exposure) without the leverage and derivatives is what All-Weather is for.',
      },
    ],
    halal_lens: [
      {
        verdict: 'applies_as_is',
        title: 'Four-regime framework',
        body:
          'The economic-regime framework is pure macro analysis — no fiqh content. Apply directly. The Muslim adaptation is in which instruments fill each regime bucket, not in the regime framework itself.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Diversification + uncorrelated return streams',
        body:
          'Universal. Halal portfolios benefit even more than conventional ones from finding genuinely uncorrelated streams because the halal universe is smaller — every additional uncorrelation gain matters disproportionately.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Radical transparency about your own thinking',
        body:
          'Written-down investment decisions + honest review of outcomes is exactly muhasaba in financial form. Aligns perfectly with the Islamic discipline.',
      },
      {
        verdict: 'needs_modification',
        title: 'Bond-heavy regime substitution',
        body:
          "All-Weather's bond half (~55% across long + intermediate) is the largest single conversion challenge for a Muslim investor. Halal substitute: use a sukuk ETF for the long-duration slot and shorter-duration sukuk + halal money-market alternatives for intermediate. Yields are similar; structures are different.",
      },
      {
        verdict: 'forbidden',
        title: "The tradition's leverage and rates positioning",
        body:
          'Flagship macro strategies in this tradition use heavy leverage and rates derivatives — interest-rate swaps, treasury futures, currency forwards. None of these structures are halal for a Muslim — they bake riba into the contracts. The retail-friendly All-Weather doesn\'t use most of this, but anything beyond a vanilla rebalanced multi-asset portfolio probably uses one of these structures.',
      },
      {
        verdict: 'forbidden',
        title: 'Treasury bonds as the safety anchor',
        body:
          'The conventional defensive-asset anchor — US Treasuries — is riba and off-limits. The halal substitute is sovereign sukuk from creditworthy issuers (Saudi, UAE, Indonesia, Malaysia). The credit quality is comparable; the structure is fundamentally different.',
      },
    ],
    practical_exercise: {
      title: 'Build a halal All-Weather portfolio in the simulator',
      body:
        'Open the Simulator. Build a 4-position portfolio approximating halal All-Weather: 30% global halal equity, 40% sukuk ETF, 15% short-duration sukuk or cash equivalent, 15% gold. Run the All-Weather Strategist persona analysis on it. Compare its drawdown profile (via Time-Travel) against a 100% equity halal portfolio for 2018, 2020, and 2022. The regime-balanced version should drop substantially less in each crisis.',
    },
    references: [
      'Ray Dalio, Principles: Life and Work (2017)',
      'Ray Dalio, Big Debt Crises (2018) — long-term debt-cycle methodology',
      'Ray Dalio, The Changing World Order (2021) — macro-history framework',
      'Tony Robbins, Money: Master the Game (2014) — retail All-Weather walkthrough',
      'AAOIFI Shariah Standard SS 21 — Financial Papers (Shares and Bonds)',
    ],
  },

  {
    id: 'munger',
    name: 'Charlie Munger',
    epithet: 'The Latticework Mentor',
    years_active: '1962–2023',
    framework: 'Mental models · multidisciplinary thinking · sit on your hands',
    bio:
      'Charles T. Munger (1924–2023) was Warren Buffett\'s longtime partner and vice-chairman of Berkshire Hathaway from 1978 until his death at 99. Before Berkshire he ran the Munger Partnership (1962–1975) compounding capital at roughly 19% annually, and chaired Wesco Financial. His philosophical contribution to value investing was decisive: he convinced Buffett to evolve from Graham-style "cheap and bad" cigar-butt investing into paying fair prices for great businesses — the moat philosophy that defines modern Berkshire. His insistence on multidisciplinary thinking — that anyone serious about investing must understand the major models from psychology, biology, physics, history, and economics, not just finance — is collected in Poor Charlie\'s Almanack (ed. Peter D. Kaufman, 2005). The lens prizes breadth of knowledge, inversion as a thinking habit, and refusal to act when no decision is required.',
    signature_quote:
      'The big money is not in the buying and the selling. The big money is in the waiting.',
    signature_quote_source: 'Charlie Munger, Poor Charlie\'s Almanack (2005)',
    minutes: 10,
    tier: 'free',
    principles: [
      {
        name: 'Latticework of mental models',
        body:
          'The tradition insists that no single discipline gives you enough explanatory power. You need roughly 80-100 "big ideas" from the major fields — Mr. Market from finance, lollapalooza effects from psychology, autocatalysis from chemistry, scarcity heuristics from biology, power-law distributions from physics — and the ability to reach for the right model at the right time. Investors who think in only finance terms miss most of what is actually happening.',
      },
      {
        name: 'Invert; always invert',
        body:
          'A line the tradition borrows from the 19th-century mathematician Carl Jacobi: do not just ask "how do I succeed?" — also ask "how do I fail?" and avoid those things rigorously. Most investing success comes from not doing stupid things, not from doing brilliant things. The list of things-to-avoid is shorter and more reliable than the list of things-to-pursue.',
      },
      {
        name: 'Recognise lollapalooza effects',
        body:
          'Several psychological biases pulling in the same direction at once produces extreme outcomes — what the tradition calls a "lollapalooza". The Vegas casino combines social proof + reciprocation + commitment + scarcity + Pavlovian conditioning + reward super-response. A crypto Telegram pump combines social proof + FOMO + scarcity + commitment. Spot the stacked biases; step away.',
      },
      {
        name: 'Sit on your hands',
        body:
          'The tradition argues the optimal number of investment decisions in a lifetime might be around 20. Each one done carefully, after deep study, then held. The rest of the time: read, think, observe. The biggest mistakes come from acting when there is no decision to be made.',
      },
      {
        name: 'Avoid envy',
        body:
          "Of all the deadly sins, the tradition holds envy as the stupidest because you don't even enjoy it. The investing application: do not compare your returns to a friend's or a fund's or a news headline. Run your own race. Envy drives more terrible investment decisions than any other single psychological factor.",
      },
    ],
    case_studies: [
      {
        subject: 'The Daily Journal Corporation portfolio',
        narrative:
          'Late in life Munger ran the modest investment portfolio of the Daily Journal Corporation (a small Los Angeles newspaper company he chaired) as a kind of public laboratory. He held it in just 4–5 positions — including a substantial allocation to Chinese companies like Alibaba and BYD that he understood through years of observation. Concentration in his 90s, in companies studied for decades. The contrast with diversified mutual funds is the point: Munger argued you should know 4–5 things deeply, not 400 things superficially.',
      },
      {
        subject: 'Costco — held for three decades',
        narrative:
          "Munger sat on Costco's board from 1997 and held the stock personally from the 1990s onward, refusing to sell despite valuations that often looked stretched. His thesis was the company's relentless customer obsession — Costco systematically returns every efficiency gain to the customer as a lower price (caps margins at 14% on most items). That created the lollapalooza: deeply loyal members, brand strength, structural advantage that competitors couldn't replicate because their shareholders demanded the savings flow upward, not to customers. Munger held 30+ years; the stock returned roughly 20× from his entry.",
        halal_lens:
          'Costco typically passes most halal screens (low debt, no riba dependency, consumer-staples with modest impure income from its tobacco/alcohol sections — usually below the 5% AAOIFI threshold). The pattern — find a structural moat created by management philosophy, hold for decades — translates directly to halal-screened equivalents.',
      },
    ],
    halal_lens: [
      {
        verdict: 'applies_as_is',
        title: 'Multidisciplinary thinking',
        body:
          'Universal. Islamic scholars have always insisted on adab (broad ethical-intellectual cultivation) — Ghazali wrote on physics, theology, ethics, jurisprudence in one career. The latticework discipline of reaching for the right model from any field maps directly to the Muslim scholarly tradition\'s breadth.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Invert; avoid stupidity',
        body:
          'Universally portable. The Muslim investing application: build a sharp list of things you will not do (no riba, no gambling-style trades, no story stocks at speculative multiples, no leverage), then operate freely within what remains.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Recognise lollapalooza effects',
        body:
          'Universal protection against scams, hype cycles, and behavioural traps. The 2021 crypto wave, the 2024 AI-stock mania — both classic stacked-bias lollapaloozas. Recognising the pattern protects faith and capital simultaneously.',
      },
      {
        verdict: 'needs_modification',
        title: 'Sit on your hands + low decision count',
        body:
          'Holds — but a Muslim investor in their 20s may need somewhat more frequent decisions than "20 in a lifetime" because they are building up a portfolio rather than running a multi-decade-old one. The principle (over-act less than instinct demands) is intact; the absolute number adjusts.',
      },
      {
        verdict: 'forbidden',
        title: 'Munger\'s Wells Fargo and US Bancorp positions',
        body:
          'Munger held large positions in Wells Fargo and US Bancorp through Berkshire and personally for decades, defending them publicly even through high-profile scandals (the Wells fake-accounts scandal especially). A Muslim investor cannot copy these holdings — they\'re riba-revenue businesses at their core. The pattern (concentrated long-term ownership of a structurally advantaged company) is right; the specific tickers are forbidden.',
      },
      {
        verdict: 'forbidden',
        title: 'Tobacco / alcohol bargain-hunting',
        body:
          'The tradition has occasionally defended owning structurally advantaged tobacco and alcohol businesses on pure-economic grounds. No valuation argument crosses the haram-business line for a Muslim investor.',
      },
    ],
    practical_exercise: {
      title: 'Write your own inversion list',
      body:
        "Open a notes app. Write the answer to: 'What are the 7 things that, if I do them, will guarantee bad investment outcomes for me?' Include both fiqh-violations and behavioural traps (e.g., riba debt, sin-revenue stocks, leveraged crypto, day-trading, single-stock concentration, panic-selling, hot-name FOMO). Print it. Re-read before every trade decision in the simulator for the next month.",
    },
    references: [
      'Charlie Munger (ed. Peter D. Kaufman), Poor Charlie\'s Almanack (2005)',
      'Tren Griffin, Charlie Munger: The Complete Investor (2015) — secondary synthesis',
      'Daily Journal Corporation annual meeting transcripts (2014–2022)',
      'AAOIFI Shariah Standard SS 21 — Financial Papers (Shares and Bonds)',
    ],
  },

  {
    id: 'lyn_alden',
    name: 'Lyn Alden',
    epithet: 'The Macro Analyst',
    years_active: '2016–present',
    framework: 'Macro-aware investing · monetary regime analysis · scarce assets',
    bio:
      'Lyn Alden (b. ~1986) is an independent macro investment strategist who founded Lyn Alden Investment Strategy in 2016. Her engineering background (aerospace engineering, MBA in financial analysis) gives her work a distinctive evidence-heavy, systems-thinking quality that became widely read in the 2020s. Her framework focuses on monetary debasement — the long-term decline in fiat-currency purchasing power due to expanding money supply — and which assets historically survive that decline (real estate, equities, gold, and the contested asset class of digital scarce assets). Her 2023 book Broken Money is the canonical text. The lens prizes heavy historical evidence, accessible engineering-grade reasoning, and contrarianism where the data demands it.',
    signature_quote:
      'Fiat currencies don\'t collapse overnight. They erode in slow motion across decades.',
    signature_quote_source: 'Lyn Alden, Broken Money (2023) — paraphrased from the monetary-history thesis',
    minutes: 11,
    tier: 'free',
    principles: [
      {
        name: 'Understand which monetary regime you live in',
        body:
          'Different monetary regimes (gold standard, Bretton Woods, post-1971 fiat, post-2008 quantitative-easing era) reward different asset allocations. The post-2008 regime — chronic deficit spending plus central-bank balance-sheet expansion — has structurally favoured scarce assets (equities, real estate, gold) over savers and bonds. Recognising the regime tells you where the headwinds and tailwinds are.',
      },
      {
        name: 'Long-term debt cycles produce structural inflation',
        body:
          'The framework draws heavily on long-term debt-cycle research and on the history of jubilee resets. The conclusion: when sovereign debt-to-GDP crosses roughly 100%, monetary debasement becomes politically inevitable. The 2020s US (debt-to-GDP roughly 130% and rising) is well past that threshold. Implication: hold real assets that the central bank cannot print.',
      },
      {
        name: 'Hold scarce assets in scarce-asset times',
        body:
          'Real estate, equities of asset-heavy businesses, gold, and (in the contested view) digital scarce assets share one property: their supply cannot be expanded as easily as fiat currency. The framework argues this scarcity premium will grow as fiat expansion continues. The conventional 60/40 portfolio, heavy on fiat-denominated bonds, is structurally mis-positioned for this regime.',
      },
      {
        name: 'Liquidity drives risk-asset cycles short-term',
        body:
          'Beneath the macro structural view, near-term asset prices are heavily driven by global dollar liquidity (Treasury General Account flows, Fed balance sheet, dollar index). Investors who track these signals can avoid worst-case entries and identify favourable ones. Useful for medium-term tactical adjustment within a long-term strategic allocation.',
      },
      {
        name: 'Diversify across non-correlated scarce-asset categories',
        body:
          "Real estate behaves differently from equities behaves differently from gold behaves differently from digital scarce assets. Holding a basket across these categories provides more robust protection against any single category's drawdown than concentrating in one. Published portfolios in this tradition run roughly 25-30% equities, 25-30% gold, 5-15% digital scarce assets, 30-40% real estate / real-asset exposure.",
      },
    ],
    case_studies: [
      {
        subject: 'The 2020–2022 inflation call',
        narrative:
          'In early 2020, Alden published a widely-read analysis arguing that COVID-era fiscal stimulus combined with supply-side constraints would produce significant inflation by 2022 — contrary to the prevailing Fed-and-consensus "transitory" view. The call was vindicated when US CPI peaked above 9% in mid-2022. The thesis came from monetary-regime analysis (M2 expansion + supply chain shock), not from forecasting any specific commodity, and made her one of the most-cited macro analysts of the cycle.',
      },
      {
        subject: 'Bitcoin and the digital scarce-asset thesis',
        narrative:
          'Alden moved from Bitcoin-sceptical (her 2017–2019 newsletters) to constructive (from 2020 onward) after extensive technical study, documented in her newsletter and later in Broken Money. The thesis: in a regime of fiat debasement, the world will increasingly want an asset whose supply cannot be expanded by political decision. Despite enormous volatility and immature regulation, Bitcoin has this property in a way no other liquid asset does. Her published portfolios typically include a small allocation (~5%) framed as "optionality on monetary regime change", not a primary holding.',
        halal_lens:
          'Bitcoin remains contested in Shariah scholarship (see Ulama Screening — Mufti Taqi Usmani holds haram; SC Malaysia and Mufti Faraz Adam hold permissible/case-by-case). A Muslim investor following Alden\'s macro framework but constrained by stricter scholarly positions can substitute additional gold + real-estate exposure for the digital-asset slot, capturing the scarce-asset thesis without crossing into contested fiqh territory.',
      },
    ],
    halal_lens: [
      {
        verdict: 'applies_as_is',
        title: 'Monetary-regime awareness',
        body:
          'Pure macroeconomic analysis — no fiqh content. The historical observation that fiat currencies lose purchasing power over decades and scarce assets preserve it is universally portable and aligns with classical Islamic concerns about hoarding nominal currency.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Equities + real estate + gold as scarce-asset anchors',
        body:
          'Three of the framework\'s four scarce-asset categories (equities, real estate, gold) are unambiguously Shariah-compatible. The framework ports directly — halal-screened equities + halal REITs + allocated gold provides most of the allocation philosophy.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Long-term debt-cycle thinking',
        body:
          'Aligns with classical Islamic scepticism of debt-financed prosperity. Hadith literature is rich with warnings about debt-laden economies; the modern macro work arrives at structurally similar conclusions through quantitative analysis.',
      },
      {
        verdict: 'needs_modification',
        title: 'Digital scarce-asset allocation',
        body:
          'A small digital-asset allocation is consistent within this macro framework. A Muslim investor who follows permissive scholarly positions on digital assets may mirror it; one who follows the strict camp cannot. See the Ulama Screening for the spectrum and decide based on the methodology you accept.',
      },
      {
        verdict: 'forbidden',
        title: 'Conventional rate-trading / Treasury positioning',
        body:
          'Some tactical commentary in this tradition covers Treasury positioning (long-duration vs short-duration trades, TIPS, rate cycles). These are riba-bearing instruments — not available to a Muslim investor regardless of how attractive the rate setup looks.',
      },
    ],
    practical_exercise: {
      title: 'Build a halal scarce-asset portfolio',
      body:
        'Open the Simulator. Construct a 4-position portfolio: 35% halal global equity, 35% halal real estate (a halal REIT + property-focused funds), 25% allocated gold, 5% cash equivalents (sukuk-money-market fund). Run the All-Weather Strategist analysis (the macro frame overlaps with the regime-thinking tradition). Compare drawdown over 2020-2024 vs a single-position global-halal-equity portfolio.',
    },
    references: [
      'Lyn Alden, Broken Money (2023)',
      'Lyn Alden Investment Strategy — public newsletter archive at lynalden.com',
      'Ray Dalio, Big Debt Crises (2018) — companion long-debt-cycle framework',
      'AAOIFI Shariah Standard SS 21 — Financial Papers (Shares and Bonds)',
    ],
  },

  {
    id: 'jhunjhunwala',
    name: 'Rakesh Jhunjhunwala',
    epithet: 'The Big Bull of Dalal Street',
    years_active: '1985–2022',
    framework: 'Indian-bazaar long-term conviction · promoter-led compounders',
    bio:
      'Rakesh Jhunjhunwala (1960–2022) started trading on the Bombay Stock Exchange in 1985 with reportedly ₹5,000 in capital and built a fortune valued at roughly $5.8 billion by his death — the most-followed long-term equity investor in Indian market history. He ran his investments through Rare Enterprises (his initials: Rakesh + his wife Rekha). His philosophy is shaped by the Indian market context: heavy weight on promoter quality (the controlling family or founder running the business), respect for demographic and consumption tailwinds, scepticism of foreign-institutional-investor (FII) flow narratives, and patience measured in decades rather than quarters. He famously launched Akasa Air in 2022 just months before his death — proof he stayed an operator-investor to the end.',
    signature_quote:
      'I love volatility because volatility provides opportunity.',
    signature_quote_source: 'Rakesh Jhunjhunwala, widely-quoted Indian financial-press interviews',
    minutes: 10,
    tier: 'free',
    principles: [
      {
        name: 'Promoter quality is 60% of the decision',
        body:
          'In the Indian context, the controlling family or founder running a company matters more than almost anything else. A capable, honest, long-tenured promoter compounds your capital over decades; a weak or self-dealing promoter destroys it regardless of market position. Spend more time understanding the promoter than understanding the numbers.',
      },
      {
        name: "India's structural tailwinds are the macro thesis",
        body:
          'India in the 2000s was where the US was in the 1950s — young population entering consumption, formalising economy, urbanising, financialising. The structural tailwind made "buy the leader, hold for decades" a higher-success-rate strategy in India than in mature markets. This still applies in the 2020s, though selectively.',
      },
      {
        name: 'Bet big on conviction, small on speculation',
        body:
          'The tradition runs a barbell: a small percentage of the portfolio in high-conviction long-term holdings (single names can run 20%+ of net worth at peak), with a separate trading book for shorter-term opportunities. Most retail investors should run only the first half — the trading book requires a level of skill and infrastructure most do not have.',
      },
      {
        name: 'Ignore FII flow narratives',
        body:
          'Indian financial media obsesses over foreign-institutional-investor inflows and outflows. The framework consistently argues these are short-term noise — the long-term fate of an Indian company is determined by its operations, not by quarterly FII positioning. A discipline against being shaken out by macro narrative.',
      },
      {
        name: 'Quarterly earnings volatility is a tax the impatient pay to the patient',
        body:
          'Promoter-led Indian compounders often have lumpy quarterly results — particularly cyclicals and consumer-discretionary names. Traders selling on misses provide cheap entry to long-term holders willing to look 5+ years out. This is one of the structural edges available to retail Indian investors.',
      },
    ],
    case_studies: [
      {
        subject: 'Titan Company — accumulated from 2002',
        narrative:
          'Jhunjhunwala began accumulating Titan Company shares (the Tata Group jewellery, watches, and eyewear brand) in 2002–2003 at roughly ₹3 per share. He held the position through every Indian crisis for nearly two decades, and at his death the stake was valued at over ₹11,000 crore (~$1.3 billion). The thesis: Tata-Group promoter governance + Indian jewellery consumption tailwind + branded scale advantage in an underpenetrated category. Three things understood; three things held.',
        halal_lens:
          "Titan's primary business (jewellery, watches, eyewear) is halal. Triple-Shariah screening typically passes it on AAOIFI but can flag on stricter standards depending on debt and impure-income at any given quarter. Check the EIM Triple-Shariah ring before adding to a halal portfolio — the framework (long-term Indian compounder) applies, the specific screen status varies.",
      },
      {
        subject: 'CRISIL — long-term ratings monopoly',
        narrative:
          "Jhunjhunwala held a substantial long-term position in CRISIL, India's largest credit-rating agency (majority-owned by S&P Global). The thesis was structural: as India's debt markets grew, every issuer needed a rating, and CRISIL was the dominant provider. Boring business, predictable cash flow, near-monopoly position, held for 20+ years.",
        halal_lens:
          "Credit rating of conventional (interest-bearing) debt issuances places CRISIL in fiqh-contested territory — the company itself doesn't earn riba but it directly facilitates riba markets. Many scholars permit ancillary services to ribawi industries (the firm does not itself earn riba); the stricter view treats facilitation as participation. Not a clean halal pass; check Ulama Screening before adopting.",
      },
    ],
    halal_lens: [
      {
        verdict: 'applies_as_is',
        title: 'Promoter-quality emphasis',
        body:
          'Universal. The principle that management quality dominates long-term outcome is fiqh-neutral. For an Indian Muslim investor, look for promoters with track records in halal-line-of-business companies — Asian Paints, Pidilite, Titan (subject to screening), Marico, Britannia. The promoter-first lens is portable; the universe gets filtered by the halal screen.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Long-horizon conviction holding',
        body:
          "Aligns directly with the Islamic discipline of sabr (patience). Multi-decade holding of a quality business is exactly the wealth-stewardship the master plan's hifz al-mal framework encourages.",
      },
      {
        verdict: 'applies_as_is',
        title: 'India structural-tailwind thesis',
        body:
          'Demographic and economic-formalisation drivers are macro facts — no fiqh content. The halal investor in India captures the same tailwind through halal-screened consumer, technology, paint, food, and pharma names.',
      },
      {
        verdict: 'needs_modification',
        title: 'Banking/NBFC holdings in the Rare Enterprises portfolio',
        body:
          "Jhunjhunwala held large positions in Federal Bank, Karur Vysya Bank, and other Indian private-sector banks and NBFCs across his career. These are clear riba businesses — off-limits for a Muslim investor regardless of how strong the promoter or growth profile is. The framework (long-term Indian compounder) survives; the financial-sector application of it does not.",
      },
      {
        verdict: 'forbidden',
        title: 'Jhunjhunwala\'s trading book / leveraged derivatives',
        body:
          'Jhunjhunwala maintained a separate trading book throughout his career using leveraged derivatives on Indian index and bank-sector futures (Nifty, Bank Nifty). None of this is halal — derivative leverage bakes in riba and the speculation-density crosses into gharar. Take the long-term-holding side of his approach; leave the trading side entirely.',
      },
      {
        verdict: 'forbidden',
        title: 'Leveraged cyclical positioning',
        body:
          'Even nominally "long-term" cyclical equity stakes in this tradition were sometimes traded around with margin and short-dated options. The pure equity ownership is halal; the leverage and options layer is not. A Muslim investor copies the equity portion, never the layered structures.',
      },
    ],
    practical_exercise: {
      title: 'Build a halal Indian-compounder portfolio',
      body:
        'Open the Simulator. Build a 5-position portfolio of halal-screened Indian companies whose promoters you can name and describe in one sentence each. Hold for 5+ years in the sim; re-run the Bazaar Patient persona analysis annually to track promoter-quality and tailwind theses.',
    },
    references: [
      'Indian financial-press archives — Economic Times, Mint, Moneycontrol coverage of Rare Enterprises (2005–2022)',
      'Rakesh Jhunjhunwala\'s public CNBC-TV18 / ET Now interview archive',
      'Tata Group / Titan Company annual reports — long-term shareholder commentary',
      'AAOIFI Shariah Standard SS 21 — Financial Papers (Shares and Bonds)',
    ],
  },

  {
    id: 'damani',
    name: 'Radhakishan Damani',
    epithet: 'Mr. White & White',
    years_active: '1980s–present',
    framework: 'Concentrated long-term holding · owner-operator discipline · low-cost retail',
    bio:
      'Radhakishan Damani (b. 1954) began as a Mumbai stockbroker and arbitrageur in the 1980s — famously a mentor to Rakesh Jhunjhunwala during that era. In 2002 he founded DMart (Avenue Supermarts), the Indian discount-retail chain, and ran it as a private company for 15 years before its 2017 IPO at ₹299/share; the stock crossed ₹4,500 by 2024. He is consistently among the wealthiest people in India, known for almost never giving interviews and always wearing white shirts and white trousers — the dress code that earned him the "Mr. White & White" nickname. The discipline he models is the businessman\'s, not just the investor\'s: operational quality is read through the financials of others because it is run inside the business at home. Quiet over loud; build over broadcast.',
    signature_quote:
      'You should be in a business you understand. If you don\'t understand the business, you should not invest.',
    signature_quote_source: 'Radhakishan Damani, paraphrased from the few public talks he has given (notably the early-career CNBC interviews)',
    minutes: 9,
    tier: 'free',
    principles: [
      {
        name: 'Concentrated conviction',
        body:
          'Public-equity portfolios in this tradition reportedly run 10-15 high-conviction names. The discipline does not diversify for diversification\'s sake — it finds very few situations it understands deeply and weights them substantially.',
      },
      {
        name: 'Owner-operator discipline (DMart as the proof)',
        body:
          "DMart runs on a model of buying direct from suppliers, paying them cash within days, running lean owned stores (not leased), and passing savings to customers as everyday-low-price. The edge in evaluating other companies comes from running one: operational quality in others' financials is visible to operators who recognise the pattern from inside their own business.",
      },
      {
        name: 'Avoid leverage',
        body:
          'Despite a successful trading career through the 1980s and 1990s, the wealth Damani built was through unleveraged equity ownership of businesses he understood deeply, and through DMart itself (which famously expanded without taking on heavy debt). The trading career generated the capital; the long-term holdings compounded it. Leverage was largely absent from the compounding phase.',
      },
      {
        name: 'Cash flow over reported earnings',
        body:
          'DMart pays suppliers in days while collecting customer payments instantly — creating structurally strong cash flow that lags reported earnings by very little (a negative working-capital business). Damani applies the same lens to investments: businesses that convert earnings to cash quickly are more valuable than those whose earnings sit in receivables.',
      },
      {
        name: 'Quiet over loud',
        body:
          'Damani gives almost no interviews, makes no public predictions, runs no fund, sells no books. The signal in this for retail investors: most public investing commentary is noise. The investors who actually compound capital tend to be the ones you don\'t hear from much.',
      },
    ],
    case_studies: [
      {
        subject: 'DMart (Avenue Supermarts) — 2002 founding to 2017 IPO and beyond',
        narrative:
          'Damani founded DMart in 2002 and ran it privately for 15 years through unfashionable years (mid-2000s and early 2010s, when Indian organised retail was a graveyard of failed concepts). DMart\'s IPO in 2017 priced at ₹299/share; by 2024 the stock had crossed ₹4,500 — making DMart one of the most successful retail listings in Indian history. The case is the patience of building through the long unfashionable middle, until the model proved itself, then taking it public on the founder\'s terms rather than the bankers\'.',
        halal_lens:
          'DMart\'s primary business (grocery, household goods, apparel) is halal. The retail concept passes Shariah screens cleanly. Discount-retail as a structural advantage translates directly to halal-investor relevance — the same business model would work in halal-only consumer markets globally.',
      },
      {
        subject: 'VST Industries — long-term tobacco holding',
        narrative:
          'A counter-example case from Damani\'s public portfolio: a substantial long-term position in VST Industries, a major Indian tobacco-products company (BAT subsidiary). The position generated strong returns through the 2000s and 2010s. The case from a Muslim perspective is what NOT to copy — a tobacco company is straightforwardly haram for a Muslim investor regardless of how profitable the position.',
        halal_lens:
          "Cigarettes are haram in the consensus modern fiqh position. No valuation, no promoter quality, no operational excellence makes a tobacco position permissible. This is the clearest case of \"study the method, skip the security\" in Damani's public portfolio.",
      },
    ],
    halal_lens: [
      {
        verdict: 'applies_as_is',
        title: 'Concentrated conviction',
        body:
          'Universal. For a Muslim investor with a smaller eligible universe, concentration in deeply-understood halal businesses is structurally appropriate.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Owner-operator discipline',
        body:
          'Universal. The lens of evaluating companies as a businessman rather than as a financial-spreadsheet analyst maps to the classical Islamic encouragement of trade and entrepreneurship.',
      },
      {
        verdict: 'applies_as_is',
        title: 'Avoid leverage',
        body:
          "Strongly aligns with the prohibition of riba-bearing debt. The tradition's discipline of compounding unleveraged equity is one of the cleanest fiqh-respecting investing styles among major modern investing schools.",
      },
      {
        verdict: 'applies_as_is',
        title: 'Cash flow over reported earnings',
        body:
          'Universal accounting discipline. No fiqh content; transfers directly.',
      },
      {
        verdict: 'forbidden',
        title: "Damani's VST Industries / tobacco holdings",
        body:
          "VST Industries and any other tobacco-products positions in Damani's portfolio are off-limits for a Muslim investor regardless of valuation, promoter quality, or returns. Tobacco joins alcohol and pork as a clear consensus exclusion in modern Islamic finance.",
      },
      {
        verdict: 'forbidden',
        title: 'Damani\'s early-career arbitrage trading',
        body:
          'Damani made his initial capital as a 1980s Mumbai arbitrageur, using derivatives, short-selling, and leveraged positions in an era before market regulation matured. The mechanisms (margin, derivatives, short-selling without delivery) are all off-limits for a Muslim. The long-term ownership half of his career is the takeaway; the trading half is not.',
      },
    ],
    practical_exercise: {
      title: 'Find your halal discount-retail equivalent',
      body:
        'Open the Simulator. Identify a halal-screened company in your local market (or global if your broker permits) whose operational discipline you can describe in two sentences — what they do better than competitors, how that translates to cash flow. Build a single-position portfolio. Re-evaluate quarterly using the operational lens, not the price.',
    },
    references: [
      'Avenue Supermarts (DMart) annual reports and DRHP, 2017 onward',
      'Indian financial-press profiles — Forbes India, Outlook Business, Economic Times',
      'DMart investor-day transcripts and concall archives',
      'AAOIFI Shariah Standard SS 21 — Financial Papers (Shares and Bonds)',
    ],
  },
];
