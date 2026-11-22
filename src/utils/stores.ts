/**
 * Tiny mutable stores for values that change every frame. Reading them in a
 * requestAnimationFrame loop avoids re-rendering React on every tick.
 */

let sceneProgress = 0;

export const progressStore = {
  get: () => sceneProgress,
  set: (value: number) => {
    sceneProgress = Math.min(1, Math.max(0, value));
  },
  reset: () => {
    sceneProgress = 0;
  },
};

export type BackgroundMode = 'void' | 'drift' | 'warp' | 'nebula';

let backgroundMode: BackgroundMode = 'void';

export const backgroundStore = {
  get: () => backgroundMode,
  set: (mode: BackgroundMode) => {
    backgroundMode = mode;
    document.documentElement.dataset.bg = mode;
  },
};
