import { createContext, useContext } from 'react';
import type { SceneDef } from '../config/presentation.config';

export interface PresentationState {
  sceneIndex: number;
  /** 1 when moving forward, -1 when moving back. */
  direction: 1 | -1;
  isPaused: boolean;
  soundOn: boolean;
  isFullscreen: boolean;
  showHelp: boolean;
  /** False while the standby screen is up, before the presenter starts the show. */
  started: boolean;
  /** Increments on restart so every scene remounts cleanly. */
  runId: number;
}

/** Lets a scene consume Next/Previous to step through its own beats first. */
export interface SceneSteps {
  next?: () => boolean;
  prev?: () => boolean;
}

export interface PresentationApi extends PresentationState {
  scene: SceneDef;
  reducedMotion: boolean;
  /** Leave the standby screen. Sound can only start from a user gesture, so it is chosen here. */
  start: (withSound: boolean) => void;
  next: () => void;
  prev: () => void;
  /** Pass `fromStart` to open the scene at its beginning even when jumping backwards. */
  goTo: (index: number, fromStart?: boolean) => void;
  togglePause: () => void;
  restart: () => void;
  toggleSound: () => void;
  toggleFullscreen: () => void;
  setShowHelp: (show: boolean) => void;
  sceneComplete: (id: SceneDef['id']) => void;
  registerSteps: (steps: SceneSteps) => () => void;
}

export const PresentationContext = createContext<PresentationApi | null>(null);

export function usePresentation(): PresentationApi {
  const api = useContext(PresentationContext);
  if (!api) throw new Error('usePresentation must be used inside <PresentationController>');
  return api;
}

/** Whether the scene layer is the live one (false while it plays its exit). */
export const SceneLayerContext = createContext<{ active: boolean }>({ active: true });
