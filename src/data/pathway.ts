/**
 * ACT 04 — The Unlocked Path. Content is deliberately careful (brief §20):
 * CAT is a postgraduate-entrance exam taken during/after a degree, it is one
 * route among many, and an MBA guarantees no particular job.
 */

export type StageIcon = 'school' | 'degree' | 'exam' | 'mba' | 'career';

export interface PathwayStage {
  short: string;
  title: string;
  icon: StageIcon;
  lead: string;
  lines: string[];
  chipsLabel?: string;
  chips?: string[];
  note?: string;
  /** Marks the stage where IMS's role is introduced. */
  imsStage?: boolean;
}

export const pathwayStages: PathwayStage[] = [
  {
    short: 'CLASS 11 & 12',
    title: 'CLASS 11 & 12',
    icon: 'school',
    lead: 'Where you are right now.',
    lines: ['Explore interests.', 'Develop curiosity.', 'Build foundational skills.'],
  },
  {
    short: 'UNDERGRADUATION',
    title: 'UNDERGRADUATION',
    icon: 'degree',
    lead: 'Three or four years to go deeper.',
    lines: [
      'Pursue a suitable undergraduate degree.',
      'Explore academic and professional interests.',
      'Develop relevant skills and experience.',
    ],
    note: 'Commerce, arts, science or engineering — students from many degrees go on to management.',
  },
  {
    short: 'ENTRANCE PREP',
    title: 'MANAGEMENT ENTRANCE PREPARATION',
    icon: 'exam',
    lead: 'CAT stands for the Common Admission Test.',
    lines: [
      'It is used by the IIMs and other participating institutions for admission to postgraduate management programmes.',
      'Students take it in the final year of their degree or after it — not straight after Class 12.',
    ],
    chipsLabel: 'THE BROAD AREAS IT TESTS',
    chips: ['Verbal Ability & Reading Comprehension', 'Data Interpretation & Logical Reasoning', 'Quantitative Ability'],
    imsStage: true,
  },
  {
    short: 'MBA',
    title: 'MBA / MANAGEMENT EDUCATION',
    icon: 'mba',
    lead: 'Postgraduate management education.',
    lines: ['It builds an understanding of how a whole business works, across areas like:'],
    chips: ['Finance', 'Marketing', 'Strategy', 'Operations', 'Human Resources', 'Business Analytics'],
  },
  {
    short: 'CAREERS',
    title: 'CAREER OPPORTUNITIES',
    icon: 'career',
    lead: 'Some of the directions it can open up.',
    lines: [],
    chips: [
      'Management Consulting',
      'Investment Banking',
      'Brand Management',
      'Corporate Strategy',
      'Product Management',
      'Entrepreneurship',
    ],
    note: 'Different careers have different educational requirements. CAT is one possible route into management education — not the only one.',
  },
];

export const pathwayCopy = {
  question: 'SO HOW DO YOU GET THERE?',
  guidance: 'Big ambitions need the right direction, preparation and guidance.',
  imsTag: 'WHERE IMS COMES IN',
  /** Features confirmed on imsindia.com and the IMS Vadodara pages (2026-11-22). */
  imsPillars: ['Classroom learning', 'Personal mentoring', 'Mock tests (SimCATs)', 'Learning resources'],
};
