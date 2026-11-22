/**
 * ACT 06 — The Next Move. Deliberately short (brief 2 §Act 06): CAT is one
 * possible route into postgraduate management, taken during/after a degree,
 * and not every business career needs an MBA.
 */

export type StageIcon = 'school' | 'degree' | 'skills' | 'exam' | 'mba' | 'career';

export interface PathwayStage {
  short: string;
  title: string;
  icon: StageIcon;
  lead: string;
  lines: string[];
  note?: string;
  /** Marks the stage where IMS's role is introduced. */
  imsStage?: boolean;
}

export const pathwayStages: PathwayStage[] = [
  {
    short: 'CLASS 11–12',
    title: 'CLASS 11–12',
    icon: 'school',
    lead: 'You are here.',
    lines: ['Explore what you enjoy. Stay curious about how businesses work.'],
  },
  {
    short: 'UNDERGRAD',
    title: 'UNDERGRADUATE EDUCATION',
    icon: 'degree',
    lead: 'Commerce, arts, science, engineering — all can lead to business.',
    lines: ['Pick a degree you will actually enjoy studying.'],
  },
  {
    short: 'SKILLS',
    title: 'SKILLS & EXPLORATION',
    icon: 'skills',
    lead: 'Internships, projects, clubs, competitions.',
    lines: ['This is where you find out what you like doing — not just studying.'],
  },
  {
    short: 'PREP',
    title: 'MANAGEMENT PREPARATION',
    icon: 'exam',
    lead: 'CAT is one route into postgraduate management.',
    lines: ['Used by the IIMs and other participating institutions. Taken during or after your degree — not after Class 12.'],
    imsStage: true,
  },
  {
    short: 'MBA',
    title: 'MBA / MANAGEMENT EDUCATION',
    icon: 'mba',
    lead: 'How a whole business works — finance, marketing, strategy, operations.',
    lines: ['One of several ways into management careers.'],
  },
  {
    short: 'CAREERS',
    title: 'CAREER OPPORTUNITIES',
    icon: 'career',
    lead: 'Consulting, brand management, finance, product, entrepreneurship…',
    lines: ['Not every business career needs an MBA — but many doors open with one.'],
  },
];

export const pathwayCopy = {
  question: 'SO WHAT’S YOUR NEXT MOVE?',
  guidance: 'Big ambitions need the right direction, preparation and guidance.',
  imsTag: 'WHERE IMS COMES IN',
  /** Features confirmed on imsindia.com and the IMS Vadodara pages (2026-11-22). */
  imsPillars: ['Classroom learning', 'Personal mentoring', 'Mock tests (SimCATs)', 'Learning resources'],
};
