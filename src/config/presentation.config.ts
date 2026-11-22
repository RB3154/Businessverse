/**
 * Presentation structure, timing and on-screen copy for the opening and finale.
 * Edit durations, autoplay and text here — no component changes needed.
 * Act-specific content lives in src/data/.
 */

export type ActId = 1 | 2 | 3 | 4 | 5 | 6;

export type SceneId = 'intro' | 'guess' | 'ceo' | 'careers' | 'wyr' | 'pathway' | 'reveal';

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
  { id: 2, code: '02', title: 'Guess the Business' },
  { id: 3, code: '03', title: 'You Are the CEO' },
  { id: 4, code: '04', title: 'The Career Reveal' },
  { id: 5, code: '05', title: 'Would You Rather?' },
  { id: 6, code: '06', title: 'The Next Move' },
];

export const scenes: SceneDef[] = [
  { id: 'intro', act: 1, label: 'Reality Check', durationSec: 50, autoAdvance: true, exit: 'fade' },
  // Acts 02–05 are presenter-led: every reveal and vote waits for →.
  { id: 'guess', act: 2, label: 'Guess the Business', durationSec: 85, autoAdvance: false, exit: 'fade' },
  // The CEO challenge never auto-advances: voting, decisions and reveals are presenter-led.
  { id: 'ceo', act: 3, label: 'You Are the CEO', durationSec: 210, autoAdvance: false, exit: 'fade' },
  { id: 'careers', act: 4, label: 'Career Reveal', durationSec: 120, autoAdvance: false, exit: 'fade' },
  { id: 'wyr', act: 5, label: 'Would You Rather?', durationSec: 65, autoAdvance: false, exit: 'fade' },
  // Fades so the finale can pick the pathway nodes up exactly where they are.
  { id: 'pathway', act: 6, label: 'The Next Move', durationSec: 42, autoAdvance: true, exit: 'fade' },
  // The final screen holds until the presenter advances or restarts.
  { id: 'reveal', act: 6, label: 'IMS', durationSec: 28, autoAdvance: false, exit: 'fade' },
];

export const presentationSettings = {
  /** Cinematic scenes play through on their own. Set false to step every beat manually. */
  autoplay: true,
  showElapsedTime: true,
  /** On-screen controls hide after this much mouse inactivity. */
  controlsAutoHideMs: 2600,
};

export const audioSettings = {
  /** Audio is always muted on load (browser autoplay rules); the start screen or M enables it. */
  masterVolume: 0.7,
  ambientVolume: 0.35,
  effectsVolume: 0.8,
};

/** ACT 01 — The Reality Check. A fast hook, an interruption, a surprise. */
export const introSequence = {
  hook: 'BE HONEST.',
  setupLead: 'WHEN SOMEONE SAYS',
  setupWord: 'COMMERCE...',
  ask: 'WHAT COMES TO MIND?',
  /** Pause after the question so the room can shout answers (seconds). */
  askPause: 2.6,
  usual: ['CA.', 'B.COM.', 'ACCOUNTING.', 'MBA.'],
  interrupt: 'WAIT.',
  notClose: ["THAT'S NOT EVEN CLOSE", 'TO THE WHOLE STORY.'],
  orderLine: 'EVERY TIME YOU ORDER FOOD...',
  machineLine: ["THERE'S AN ENTIRE BUSINESS MACHINE", 'WORKING BEHIND THAT ORDER.'],
  /** Jobs that flash around the order — the "machine". */
  machineParts: ['MARKETING', 'PRICING', 'LOGISTICS', 'DATA', 'FINANCE', 'PRODUCT', 'CUSTOMER SUPPORT', 'STRATEGY'],
  challenge: ["LET'S SEE HOW MUCH OF THE BUSINESS WORLD", 'YOU ACTUALLY KNOW.'],
};

/**
 * ACT 06 pacing. The pathway plays by itself: each stage and the IMS beat
 * stay on screen for stepSec seconds, then it flows into the finale.
 * → skips ahead, Space holds. Set autoAdvance to false to step manually.
 */
export const pathwayTiming = {
  autoAdvance: true,
  stepSec: 6,
};

/** ACT 06 closing copy. */
export const revealSequence = {
  lines: ['YOUR STREAM IS NOT YOUR CEILING.', 'YOUR FUTURE IS NOT PRE-DECIDED.', 'YOUR NEXT MOVE STARTS WITH CURIOSITY.'],
  presentedBy: 'PRESENTED BY IMS',
};
