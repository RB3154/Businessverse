/**
 * ACT 03 — The Boardroom Challenge. A hypothetical scenario: outcomes are
 * illustrations of trade-offs, not predictions (brief §8.3, §20.9).
 * No option is presented as the correct one (brief §8.5).
 */

export type OptionId = 'A' | 'B' | 'C';

export interface ScenarioOption {
  id: OptionId;
  accent: string;
  title: string;
  description: string;
  benefit: string;
  risk: string;
  consequence: {
    /** Shape of the illustrative outcome chart. */
    chart: 'fork-up' | 'runway' | 'dip-rise';
    chartLabels: [string, string];
    explanation: string;
    advantage: string;
    disadvantage: string;
    lesson: string;
  };
}

export const scenario = {
  mission: 'MISSION 001 · STARTUP SURVIVAL',
  welcome: ['WELCOME TO THE BOARDROOM.', 'TODAY, YOU MAKE THE DECISIONS.'],
  fundsLabel: 'YOUR STARTUP HAS',
  funds: 1000000,
  fundsDisplay: '₹10,00,000',
  growthLine: 'GROWTH HAS SLOWED.',
  question: "WHAT'S YOUR NEXT MOVE?",
  disclaimer: 'HYPOTHETICAL SCENARIO',
  countdownSeconds: 15,
  thinkingPrompt: 'THINK IT THROUGH.',
  votePrompt: 'HANDS UP! WHO VOTES A, B OR C?',

  options: [
    {
      id: 'A',
      accent: '#F472B6',
      title: 'INVEST IN MARKETING.',
      description: 'Allocate ₹4 lakh towards marketing campaigns to attract new customers.',
      benefit: 'Increased visibility and customer acquisition.',
      risk: 'Marketing expenditure may not generate sufficient returns.',
      consequence: {
        chart: 'fork-up',
        chartLabels: ['IF THE CAMPAIGN WORKS', "IF IT DOESN'T"],
        explanation:
          'More people hear about the startup. Some become paying customers — but nobody knows in advance how many.',
        advantage: 'A chance to win many new customers quickly and get noticed in the market.',
        disadvantage: "If the campaign doesn't convert, ₹4 lakh is spent and only ₹6 lakh is left.",
        lesson: 'Spending to grow works best when you know who your customers are and what they respond to.',
      },
    },
    {
      id: 'B',
      accent: '#34D399',
      title: 'REDUCE OPERATIONAL COSTS.',
      description: 'Improve operational efficiency and reduce unnecessary expenses.',
      benefit: 'Improved cost structure and cash preservation.',
      risk: 'Excessive cost-cutting may affect service quality or growth.',
      consequence: {
        chart: 'runway',
        chartLabels: ['CASH WITH COST CUTS', 'CASH WITHOUT'],
        explanation:
          'The startup stops wasting money and works more efficiently. The same funds now last longer.',
        advantage: 'Stronger finances and more time to work out the next move.',
        disadvantage: 'Cut too deep and customers may notice poorer service — and growth can stall further.',
        lesson: "Saving money buys time — but time alone doesn't create growth.",
      },
    },
    {
      id: 'C',
      accent: '#22B9F2',
      title: 'DEVELOP A NEW PRODUCT.',
      description: 'Invest in creating a new product or improving the existing offering.',
      benefit: 'Potential new revenue opportunities and improved competitiveness.',
      risk: 'Development requires time, money and uncertain market acceptance.',
      consequence: {
        chart: 'dip-rise',
        chartLabels: ['IF CUSTOMERS LOVE IT', "IF THEY DON'T"],
        explanation:
          'The team spends months building something new. Money goes out first; results only come after launch.',
        advantage: 'New ways to earn money and a stronger position against competitors.',
        disadvantage: 'It takes time and money, and customers may not want what gets built.',
        lesson: 'Innovation is a bet. Research and testing with real customers reduce the risk.',
      },
    },
  ] satisfies ScenarioOption[],

  verdictTitle: 'NO SINGLE RIGHT ANSWER.',
  verdictText:
    'Real business decisions depend on available data, company objectives, financial conditions and market circumstances.',

  rolesTitle: 'WHO MAKES THESE DECISIONS?',
  roles: [
    { icon: 'rocket', name: 'Entrepreneurs', line: 'Start businesses and make the big calls.' },
    { icon: 'briefcase', name: 'Management Consultants', line: 'Help companies analyse problems and pick a path.' },
    { icon: 'chart', name: 'Financial Analysts', line: 'Work out what each option means for the money.' },
    { icon: 'megaphone', name: 'Marketing Managers', line: 'Decide how to reach and win customers.' },
    { icon: 'boxes', name: 'Product Managers', line: 'Decide what to build next, and why.' },
  ] as const,
  rolesStatement:
    'Business decisions require more than good ideas. They require analytical thinking, financial understanding, strategy and the ability to make informed choices.',
};

export type ScenarioRole = (typeof scenario.roles)[number];
