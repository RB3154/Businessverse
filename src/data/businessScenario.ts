/**
 * ACT 03 — You Are the CEO. A fictional startup and hypothetical outcomes:
 * every number here is part of the story, not a prediction or a real
 * statistic (brief §8.3, §20.9). No option is presented as the correct one.
 */

export type OptionId = 'A' | 'B' | 'C';
export type Team = 'growth' | 'survival';

/** Dashboard meters, 0–100. Illustrative only. */
export interface Meters {
  customers: number;
  growth: number;
  cashSafety: number;
  risk: number;
}

export interface Effect {
  /** Cash after this decision, in rupees. */
  cash: number;
  /** Change to each meter. */
  meters: Partial<Meters>;
  /** Short status for the "days left" tile, e.g. "Cash now lasts longer". */
  daysNote?: string;
}

export interface ScenarioOption {
  id: OptionId;
  accent: string;
  title: string;
  description: string;
  /** Which team's priority this option leans towards (for the team badges). */
  leans: Team | 'both';
  benefit: string;
  risk: string;
  effect: Effect;
  headline: string;
  tradeoff: string;
  roles: string[];
}

export interface Decision {
  key: string;
  kicker: string;
  question: string;
  countdownSeconds: number;
  options: ScenarioOption[];
}

export const startMeters: Meters = { customers: 42, growth: 22, cashSafety: 55, risk: 50 };

export const scenario = {
  company: 'SNACKRUSH',
  companyNote: 'A fictional snack-delivery startup',
  fictional: 'FICTIONAL COMPANY · HYPOTHETICAL OUTCOMES',
  opening: ['CONGRATULATIONS.', "YOU'RE THE CEO.", 'YOUR STARTUP IS IN TROUBLE.', '₹10,00,000 LEFT.', '30 DAYS TO SURVIVE.'],
  startCash: 1000000,
  startDays: 30,
  salesNote: 'Sales falling for 3 months',

  teams: {
    title: 'SPLIT THE ROOM.',
    growth: {
      name: 'TEAM A',
      label: 'GROWTH',
      side: 'Left side of the room',
      mandate: 'Win customers. Get big. A company that stops growing dies slowly.',
      color: '#F97316',
    },
    survival: {
      name: 'TEAM B',
      label: 'SURVIVAL',
      side: 'Right side of the room',
      mandate: 'Protect the cash. A company that runs out of money dies fast.',
      color: '#22C55E',
    },
  },

  decisions: [
    {
      key: 'first',
      kicker: 'DECISION 1 OF 2',
      question: "YOU HAVE ₹10 LAKH. WHAT'S YOUR NEXT MOVE?",
      countdownSeconds: 15,
      options: [
        {
          id: 'A',
          accent: '#F472B6',
          title: 'INVEST ₹4 LAKH IN MARKETING',
          description: 'Ads, influencers and first-order discounts to pull in new customers.',
          leans: 'growth',
          benefit: 'More visibility and new customers.',
          risk: 'No guarantee the money comes back.',
          effect: { cash: 600000, meters: { customers: 24, growth: 26, cashSafety: -24, risk: 14 }, daysNote: 'Cash drops to ₹6 lakh' },
          headline: 'SIGN-UPS JUMP. THE BANK BALANCE DROPS.',
          tradeoff: 'New customers arrive — but only some keep ordering. ₹4 lakh is spent either way.',
          roles: ['Marketing Manager', 'Financial Analyst'],
        },
        {
          id: 'B',
          accent: '#34D399',
          title: 'CUT OPERATIONAL COSTS',
          description: 'Renegotiate suppliers, cut waste, run leaner operations.',
          leans: 'survival',
          benefit: 'Cash lasts longer. Costs come down.',
          risk: 'Cut too deep and customers feel it.',
          effect: { cash: 1000000, meters: { customers: -8, growth: -6, cashSafety: 28, risk: -12 }, daysNote: 'Cash now lasts longer' },
          headline: 'MORE TIME ON THE CLOCK. LESS FUEL IN THE TANK.',
          tradeoff: 'The money lasts longer — but slower deliveries mean some customers drift away.',
          roles: ['Operations Manager', 'Financial Analyst'],
        },
        {
          id: 'C',
          accent: '#38BDF8',
          title: 'LAUNCH A NEW PRODUCT',
          description: 'Spend ₹3 lakh building a new snack box nobody else offers.',
          leans: 'both',
          benefit: 'A new way to earn and stand out.',
          risk: 'Costs money now; customers may not want it.',
          effect: { cash: 700000, meters: { customers: 6, growth: 16, cashSafety: -16, risk: 22 }, daysNote: 'Cash drops to ₹7 lakh' },
          headline: 'SOMETHING NEW ON THE MENU. NOBODY KNOWS IF IT WILL SELL.',
          tradeoff: 'If customers love it, it changes everything. If not, ₹3 lakh is gone.',
          roles: ['Product Manager', 'Entrepreneur'],
        },
      ],
    },
    {
      key: 'twist',
      kicker: 'DECISION 2 OF 2',
      question: 'NOW WHAT?',
      countdownSeconds: 10,
      options: [
        {
          id: 'A',
          accent: '#FB7185',
          title: 'MATCH THE PRICE CUT',
          description: 'Drop your prices by 30% too. Keep every customer.',
          leans: 'growth',
          benefit: 'Customers have no reason to leave.',
          risk: 'Every order now earns much less.',
          effect: { cash: -150000, meters: { customers: 6, growth: 0, cashSafety: -22, risk: 16 } },
          headline: 'YOU KEPT THE CUSTOMERS. YOU LOST THE MARGIN.',
          tradeoff: 'Price wars are easy to start and expensive to win. The richer company usually lasts longer.',
          roles: ['Financial Analyst', 'Management Consultant'],
        },
        {
          id: 'B',
          accent: '#A78BFA',
          title: 'STAY PREMIUM',
          description: "Don't cut prices. Sell better quality and a stronger brand.",
          leans: 'survival',
          benefit: 'Profit per order stays healthy.',
          risk: 'Price-hunters will leave.',
          effect: { cash: 0, meters: { customers: -14, growth: 4, cashSafety: 8, risk: 10 } },
          headline: 'SOME CUSTOMERS LEFT. THE LOYAL ONES STAYED.',
          tradeoff: 'It only works if the quality is genuinely better — and customers can tell.',
          roles: ['Brand Manager', 'Marketing Manager'],
        },
        {
          id: 'C',
          accent: '#FBBF24',
          title: 'FIGHT SMART',
          description: 'Loyalty points and combo deals the competitor does not have.',
          leans: 'both',
          benefit: 'A reason to stay that is not just price.',
          risk: 'Costs money and takes time to work.',
          effect: { cash: -80000, meters: { customers: 10, growth: 10, cashSafety: -8, risk: 4 } },
          headline: 'CUSTOMERS GOT A REASON TO STAY.',
          tradeoff: 'Cheaper than a price war — but the competitor can copy it next month.',
          roles: ['Product Manager', 'Marketing Manager'],
        },
      ],
    },
  ] satisfies Decision[],

  twist: {
    flag: 'BREAKING',
    headline: 'YOUR COMPETITOR JUST CUT PRICES BY 30%.',
    sub: 'Your customers have noticed.',
  },

  summary: {
    title: 'DAY 30.',
    line: 'Every choice bought something — and cost something.',
    verdict: 'NO SINGLE RIGHT ANSWER.',
    verdictText: 'Real decisions depend on data, goals, money and what competitors do next.',
  },

  rolesTitle: 'WHO ACTUALLY MAKES THESE DECISIONS?',
  roles: [
    { icon: 'rocket', name: 'Entrepreneur', line: 'Starts the company and makes the big calls.' },
    { icon: 'briefcase', name: 'Management Consultant', line: 'Diagnoses the problem and recommends a plan.' },
    { icon: 'chart', name: 'Financial Analyst', line: 'Works out what every option does to the money.' },
    { icon: 'megaphone', name: 'Marketing Manager', line: 'Decides how to win — and keep — customers.' },
    { icon: 'truck', name: 'Operations Manager', line: 'Makes the deliveries, suppliers and costs work.' },
    { icon: 'boxes', name: 'Product Manager', line: 'Decides what to build next, and why.' },
  ] as const,
};

export type ScenarioRole = (typeof scenario.roles)[number];
