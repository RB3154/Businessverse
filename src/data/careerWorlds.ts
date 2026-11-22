/**
 * ACT 02 content — the five career worlds. Edit copy, careers and accent
 * colours here. Career explanations are deliberately plain-language for
 * Class 11 students (brief §20.1).
 */

export type WorldMotif = 'finance' | 'strategy' | 'marketing' | 'innovation' | 'technology';

export interface Career {
  name: string;
  explain: string;
}

export interface CareerWorld {
  id: WorldMotif;
  domain: string;
  /** Title shown on two lines. */
  title: [string, string];
  quote: string;
  accent: string;
  careers: Career[];
}

export const careerWorlds: CareerWorld[] = [
  {
    id: 'finance',
    domain: 'FINANCE',
    title: ['THE WORLD', 'OF MONEY.'],
    quote:
      'Money moves businesses. Someone needs to understand where it goes, how it grows, and what risks come with it.',
    accent: '#F4A340',
    careers: [
      { name: 'Investment Banking', explain: 'Helps companies raise money and handle big deals like mergers.' },
      { name: 'Financial Analysis', explain: 'Studies the numbers to judge how a business is doing.' },
      { name: 'Corporate Finance', explain: "Manages a company's money: budgets, funding and spending." },
    ],
  },
  {
    id: 'strategy',
    domain: 'STRATEGY',
    title: ['THE WORLD OF', 'BIG DECISIONS.'],
    quote: 'Companies face difficult problems. Someone needs to figure out what they should do next.',
    accent: '#A78BFA',
    careers: [
      { name: 'Management Consulting', explain: 'Advises companies on solving their toughest problems.' },
      { name: 'Corporate Strategy', explain: 'Plans where a company should grow over the next few years.' },
      { name: 'Business Strategy', explain: 'Decides how a business will compete and win in its market.' },
    ],
  },
  {
    id: 'marketing',
    domain: 'MARKETING',
    title: ['THE WORLD', 'OF BRANDS.'],
    quote: 'Why do some brands become part of your everyday life while others disappear?',
    accent: '#F472B6',
    careers: [
      { name: 'Brand Management', explain: 'Shapes how people see and feel about a brand.' },
      { name: 'Marketing Strategy', explain: 'Plans how to reach the right customers with the right message.' },
      { name: 'Advertising & Consumer Insights', explain: 'Creates campaigns and studies why people buy what they buy.' },
    ],
  },
  {
    id: 'innovation',
    domain: 'INNOVATION',
    title: ['THE WORLD', 'OF BUILDERS.'],
    quote: 'Every big company started with an idea. Someone had to take the risk and build it.',
    accent: '#34D399',
    careers: [
      { name: 'Entrepreneurship', explain: 'Turning your own idea into a real business.' },
      { name: 'Startup Management', explain: 'Running and growing a young company through its early years.' },
      { name: 'Venture Development', explain: 'Building and scaling new businesses, often with investors.' },
    ],
  },
  {
    id: 'technology',
    domain: 'TECHNOLOGY',
    title: ["THE WORLD OF", "WHAT'S NEXT."],
    quote: 'Technology creates possibilities. Someone needs to decide what should be built and why.',
    accent: '#22B9F2',
    careers: [
      { name: 'Product Management', explain: 'Decides what a tech product should do, and guides the team building it.' },
      { name: 'Business Analytics', explain: 'Uses data to spot patterns and help businesses decide better.' },
      { name: 'Technology Consulting', explain: 'Helps organisations choose and use the right technology.' },
    ],
  },
];

export const universeCopy = {
  overviewTag: 'ACT 02 · ENTER THE BUSINESSVERSE',
  overviewTitle: 'FIVE WORLDS TO EXPLORE.',
  closingLines: ['ONE STREAM.', 'A THOUSAND POSSIBILITIES.'],
};
