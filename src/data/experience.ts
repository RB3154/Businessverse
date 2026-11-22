/**
 * Content for Act 02 (Guess the Business), Act 04 (Career Reveal) and
 * Act 05 (Would You Rather?). Edit freely — components read from here.
 *
 * Brands are used as familiar examples, not endorsements. Only broad,
 * well-established facts are stated; no statistics or company incidents.
 */

/* ---------------- ACT 02 — GUESS THE BUSINESS ---------------- */

export const guessGame = {
  title: 'GUESS THE BUSINESS',
  subtitle: 'Two rounds. Shout your answers.',

  brandRound: {
    label: 'ROUND 1 · THE MYSTERY BRAND',
    prompt: 'WHICH BRAND IS THIS?',
    /** Each clue appears on its own Next. Broad, well-known facts only. */
    clues: [
      'It started as a cooperative of dairy farmers in Anand, Gujarat — not far from Vadodara.',
      'Its mascot is a little girl in a polka-dot dress.',
      'Its billboards joke about whatever is in the news that week.',
    ],
    answer: 'AMUL',
    question: 'WHAT MAKES THIS BRAND SUCCESSFUL?',
    /** The business functions behind the brand. */
    functions: [
      { name: 'MARKETING', line: 'A mascot and topical ads people actually look forward to.' },
      { name: 'DISTRIBUTION', line: 'Getting fresh products into shops across the country, every day.' },
      { name: 'CONSUMER TRUST', line: 'Decades of families buying the same name.' },
      { name: 'PRODUCT DEVELOPMENT', line: 'Butter, milk, cheese, ice cream — one brand, many products.' },
      { name: 'FINANCE', line: 'Paying the farmers who own it — and keeping prices affordable.' },
      { name: 'STRATEGY', line: 'Deciding which markets and products to chase next.' },
    ],
  },

  orderRound: {
    label: 'ROUND 2 · THE ₹199 ORDER',
    setup: 'YOU ORDER A ₹199 MEAL.',
    setupNote: 'On a food-delivery app — think Zomato or Swiggy.',
    question: 'BEFORE THE APP MAKES A SINGLE RUPEE, WHAT DOES IT HAVE TO WORRY ABOUT?',
    reveals: [
      { name: 'CUSTOMER ACQUISITION', line: 'Ads and first-order discounts to get you to install the app at all.' },
      { name: 'DELIVERY COSTS', line: 'Someone has to ride that meal to your door.' },
      { name: 'DISCOUNTS', line: 'That "50% off" is paid for by somebody.' },
      { name: 'PLATFORM ECONOMICS', line: 'Commissions from restaurants, fees from customers — does it add up?' },
      { name: 'CUSTOMER RETENTION', line: 'Will you order again next week, or switch apps?' },
    ],
    careersTitle: 'EACH OF THOSE IS SOMEBODY’S JOB.',
    careers: [
      { role: 'Marketing Manager', owns: 'Customer acquisition' },
      { role: 'Operations Manager', owns: 'Delivery costs' },
      { role: 'Business Analyst', owns: 'Discounts & platform economics' },
      { role: 'Product Manager', owns: 'Customer retention' },
    ],
  },
};

/* ---------------- ACT 04 — CAREER REVEAL ---------------- */

export type RevealStyle = 'detective' | 'billboard' | 'terminal' | 'wireframe' | 'garage';

export interface CareerReveal {
  style: RevealStyle;
  nickname: string;
  scenario: string[];
  role: string;
  explain: string[];
  accent: string;
}

export const careerReveals = {
  prompt: 'WHO DO YOU CALL?',
  footnote: 'There is no single route into any of these — people arrive from many degrees, experiences and skills.',
  reveals: [
    {
      style: 'detective',
      nickname: 'THE STRATEGIST',
      scenario: ['A COMPANY IS LOSING MONEY.', 'THE CEO NEEDS TO KNOW WHY.'],
      role: 'MANAGEMENT CONSULTANT',
      explain: ['Digs through the data, finds the real problem,', 'and recommends what to do about it.'],
      accent: '#EF4444',
    },
    {
      style: 'billboard',
      nickname: 'THE CREATOR',
      scenario: ['A BRAND WANTS TO BECOME', 'THE NEXT BIG THING.'],
      role: 'BRAND MANAGER',
      explain: ['Decides what a brand stands for, who it talks to,', 'and how its ads make people feel.'],
      accent: '#EC4899',
    },
    {
      style: 'terminal',
      nickname: 'THE NUMBERS PERSON',
      scenario: ['AN INVESTOR NEEDS TO DECIDE', 'WHERE TO PUT ₹50 CRORE.'],
      role: 'FINANCIAL ANALYST',
      explain: ['Studies companies and markets to judge', 'which investments are worth the risk.'],
      accent: '#22C55E',
    },
    {
      style: 'wireframe',
      nickname: 'THE BUILDER',
      scenario: ['MILLIONS OF PEOPLE WILL USE AN APP.', 'SOMEONE MUST DECIDE WHAT IT ACTUALLY DOES.'],
      role: 'PRODUCT MANAGER',
      explain: ['Works out what users need and gets designers', 'and engineers building the right thing.'],
      accent: '#38BDF8',
    },
    {
      style: 'garage',
      nickname: 'THE FOUNDER',
      scenario: ['YOU HAVE AN IDEA.', 'NOW TURN IT INTO A BUSINESS.'],
      role: 'ENTREPRENEUR',
      explain: ['Takes the risk, builds the team,', 'and figures it out along the way.'],
      accent: '#F59E0B',
    },
  ] satisfies CareerReveal[],
};

/* ---------------- ACT 05 — WOULD YOU RATHER? ---------------- */

export interface WouldYouRather {
  left: string;
  right: string;
  leftColor: string;
  rightColor: string;
  leftInsight: string;
  rightInsight: string;
  takeaway: string;
}

export const wouldYouRather = {
  title: 'WOULD YOU RATHER?',
  subtitle: 'Hands up for your side.',
  questions: [
    {
      left: '₹1 CRORE SALARY',
      right: 'BUILD A ₹100 CRORE COMPANY',
      leftColor: '#2563EB',
      rightColor: '#F97316',
      leftInsight: 'A secure, well-paid path — think senior roles in consulting, finance or big companies.',
      rightInsight: 'Huge upside, real risk — most startups fail before they get anywhere near ₹100 crore.',
      takeaway: 'Risk vs reward is the oldest trade-off in business.',
    },
    {
      left: 'PLAY IT SAFE',
      right: 'TAKE THE BIG BET',
      leftColor: '#0D9488',
      rightColor: '#DC2626',
      leftInsight: 'Someone has to protect what already works.',
      rightInsight: 'Someone has to chase what comes next.',
      takeaway: 'Great companies need both kinds of people.',
    },
    {
      left: 'CREATE THE PRODUCT',
      right: 'SELL THE PRODUCT',
      leftColor: '#7C3AED',
      rightColor: '#DB2777',
      leftInsight: 'Product managers and designers decide what gets built.',
      rightInsight: 'Marketing, brand and sales decide whether anyone buys it.',
      takeaway: 'The best product in the world fails if nobody hears about it.',
    },
    {
      left: 'RUN A COMPANY',
      right: 'INVEST IN COMPANIES',
      leftColor: '#EA580C',
      rightColor: '#16A34A',
      leftInsight: 'Founders, CEOs and operations leaders make one company work.',
      rightInsight: 'Investment analysts and venture capitalists pick which companies to back.',
      takeaway: 'Both need you to understand how businesses make money.',
    },
  ] satisfies WouldYouRather[],
};
