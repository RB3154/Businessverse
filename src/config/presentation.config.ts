/**
 * Presentation structure, timing and copy for the opening act.
 * Edit durations, autoplay and on-screen text here — no component changes needed.
 */

export type ActId = 1 | 2 | 3 | 4 | 5;

export type SceneId = 'intro' | 'portal' | 'businessverse' | 'boardroom' | 'pathway' | 'reveal';

export interface ActDef {
  id: ActId;
  code: string;
  title: string;
}

export interface SceneDef {
  id: SceneId;
  act: ActId;
  label: string;
  /** Planned on-screen time in seconds (used for the progress timeline). */
  durationSec: number;
  /** Move on automatically when the scene's timeline finishes (if autoplay is on). */
  autoAdvance: boolean;
  /** How the scene leaves: a plain crossfade or a camera-style push. */
  exit: 'fade' | 'zoom';
}

export const acts: ActDef[] = [
  { id: 1, code: '01', title: 'The Reality Check' },
  { id: 2, code: '02', title: 'Enter the Businessverse' },
  { id: 3, code: '03', title: 'The Boardroom Challenge' },
  { id: 4, code: '04', title: 'The Unlocked Path' },
  { id: 5, code: '05', title: 'The IMS Reveal' },
];

export const scenes: SceneDef[] = [
  { id: 'intro', act: 1, label: 'Reality Check', durationSec: 52, autoAdvance: true, exit: 'fade' },
  { id: 'portal', act: 1, label: 'The Portal', durationSec: 21, autoAdvance: true, exit: 'zoom' },
  // Fades (not zooms) so a world can open into the Boardroom behind it.
  { id: 'businessverse', act: 2, label: 'Career Worlds', durationSec: 105, autoAdvance: false, exit: 'fade' },
  // The Boardroom never auto-advances: voting and reveals are presenter-led.
  { id: 'boardroom', act: 3, label: 'Boardroom', durationSec: 180, autoAdvance: false, exit: 'fade' },
  // Fades so Act 05 can pick the pathway nodes up exactly where they are.
  { id: 'pathway', act: 4, label: 'Career Pathway', durationSec: 135, autoAdvance: false, exit: 'fade' },
  // The final screen holds until the presenter advances or restarts.
  { id: 'reveal', act: 5, label: 'IMS Reveal', durationSec: 105, autoAdvance: false, exit: 'fade' },
];

export const presentationSettings = {
  /** Cinematic scenes play through on their own. Set false to step every beat manually. */
  autoplay: true,
  showElapsedTime: true,
  /** On-screen controls hide after this much mouse inactivity. */
  controlsAutoHideMs: 2600,
};

export const audioSettings = {
  /** Audio is always muted on load (browser autoplay rules); M or the toggle enables it. */
  masterVolume: 0.7,
  ambientVolume: 0.35,
  effectsVolume: 0.8,
};

/** ACT 01 copy. Beat hold times are in seconds. */
export const introSequence = {
  classLine: { text: 'CLASS 11.', hold: 3.2 },
  streamLine: { text: 'COMMERCE.', hold: 3.0 },
  planLine: { text: 'YOU HAVE A PLAN?', hold: 3.4 },
  options: { items: ['CA?', 'B.COM?', 'MBA?'], hold: 3.6 },
  maybeLine: { text: 'OR MAYBE', hold: 3.2 },
  biggerLine: { lines: ['YOUR OPTIONS', 'ARE MUCH'], emphasis: 'BIGGER.', hold: 4.6 },
  tagline: { lead: 'YOUR STREAM IS NOT YOUR', emphasis: 'CEILING.', hold: 9 },
  supporting: ['EXPLORE.', 'THINK.', 'DECIDE.', 'DISCOVER.'],
  /** Career words that burst outward on "YOUR OPTIONS ARE MUCH BIGGER." (up to 10 are shown). */
  burstWords: [
    'MANAGEMENT CONSULTING',
    'BRAND MANAGEMENT',
    'INVESTMENT BANKING',
    'PRODUCT MANAGEMENT',
    'ENTREPRENEURSHIP',
    'BUSINESS ANALYTICS',
    'CORPORATE STRATEGY',
    'FINANCIAL ANALYSIS',
    'CONSUMER INSIGHTS',
    'VENTURE DEVELOPMENT',
  ],
};

/** ACT 05 closing copy. */
export const revealSequence = {
  lines: ["THE FUTURE ISN'T SOMETHING YOU WAIT FOR.", "IT'S SOMETHING YOU PREPARE FOR."],
  words: ['EXPLORE.', 'LEARN.', 'PREPARE.', 'GROW.'],
  journey: 'YOUR JOURNEY STARTS WITH A QUESTION.',
  presentedBy: 'PRESENTED BY IMS',
};

export const portalSequence = {
  loadingLabel: 'ENTERING THE BUSINESSVERSE',
  welcomeLead: 'WELCOME TO THE',
  welcomeTitle: 'BUSINESSVERSE.',
  welcomeHold: 9,
};
