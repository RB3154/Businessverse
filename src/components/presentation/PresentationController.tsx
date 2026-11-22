import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { presentationSettings, scenes, type SceneId } from '../../config/presentation.config';
import { PresentationContext, type PresentationApi, type PresentationState, type SceneSteps } from '../../hooks/usePresentation';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { audioEngine } from '../../utils/audioEngine';
import { isFullscreen, toggleFullscreen as toggleFs } from '../../utils/fullscreen';
import { progressStore } from '../../utils/stores';
import { clamp } from '../../utils/timing';

const initialState: PresentationState = {
  sceneIndex: 0,
  direction: 1,
  isPaused: false,
  soundOn: false,
  isFullscreen: false,
  showHelp: false,
  runId: 0,
};

/** Central state for the whole show: current scene, autoplay, pause, sound, fullscreen. */
export function PresentationController({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<PresentationState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const stepsRef = useRef<SceneSteps | null>(null);

  const goTo = useCallback((index: number, fromStart = false) => {
    setState((s) => {
      const target = clamp(index, 0, scenes.length - 1);
      if (target === s.sceneIndex) return s;
      // Stepping back (←) lands on a scene's last beat; jumping to an act starts it fresh.
      return { ...s, sceneIndex: target, direction: fromStart || target > s.sceneIndex ? 1 : -1 };
    });
  }, []);

  const next = useCallback(() => {
    if (stepsRef.current?.next?.()) return;
    goTo(stateRef.current.sceneIndex + 1);
  }, [goTo]);

  const prev = useCallback(() => {
    if (stepsRef.current?.prev?.()) return;
    goTo(stateRef.current.sceneIndex - 1);
  }, [goTo]);

  const sceneComplete = useCallback(
    (id: SceneId) => {
      const s = stateRef.current;
      const def = scenes[s.sceneIndex];
      if (def.id !== id || s.isPaused) return;
      if (def.autoAdvance && presentationSettings.autoplay) goTo(s.sceneIndex + 1);
    },
    [goTo],
  );

  const togglePause = useCallback(() => setState((s) => ({ ...s, isPaused: !s.isPaused })), []);

  const restart = useCallback(() => {
    stepsRef.current = null;
    progressStore.reset();
    setState((s) => ({ ...s, sceneIndex: 0, direction: 1, isPaused: false, showHelp: false, runId: s.runId + 1 }));
  }, []);

  const toggleSound = useCallback(() => {
    const on = !stateRef.current.soundOn;
    audioEngine.setEnabled(on);
    setState((s) => ({ ...s, soundOn: on }));
  }, []);

  const toggleFullscreen = useCallback(() => void toggleFs(), []);
  const setShowHelp = useCallback((show: boolean) => setState((s) => ({ ...s, showHelp: show })), []);

  const registerSteps = useCallback((steps: SceneSteps) => {
    stepsRef.current = steps;
    return () => {
      if (stepsRef.current === steps) stepsRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onChange = () => setState((s) => ({ ...s, isFullscreen: isFullscreen() }));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    progressStore.reset();
  }, [state.sceneIndex, state.runId]);

  useKeyboardControls({
    next,
    prev,
    togglePause,
    toggleFullscreen,
    restart,
    toggleSound,
    toggleHelp: () => setShowHelp(!stateRef.current.showHelp),
    // The browser exits fullscreen on Escape itself; we only close overlays.
    escape: () => setShowHelp(false),
  });

  const api = useMemo<PresentationApi>(
    () => ({
      ...state,
      scene: scenes[state.sceneIndex],
      reducedMotion,
      next,
      prev,
      goTo,
      togglePause,
      restart,
      toggleSound,
      toggleFullscreen,
      setShowHelp,
      sceneComplete,
      registerSteps,
    }),
    [state, reducedMotion, next, prev, goTo, togglePause, restart, toggleSound, toggleFullscreen, setShowHelp, sceneComplete, registerSteps],
  );

  return <PresentationContext.Provider value={api}>{children}</PresentationContext.Provider>;
}
