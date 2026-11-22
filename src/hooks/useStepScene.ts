import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { progressStore } from '../utils/stores';
import { SceneLayerContext, usePresentation } from './usePresentation';

interface Options {
  /**
   * Called before a normal step forward. Return true to consume the Next
   * press (e.g. to end a countdown) without changing step.
   */
  interceptNext?: (step: number) => boolean;
}

/**
 * Presenter-led scenes made of discrete steps. Next/Previous move between
 * steps (and on to the neighbouring scene at either end); arriving
 * backwards lands on the last step so an accidental skip is easy to undo.
 */
export function useStepScene(count: number, options: Options = {}) {
  const { registerSteps, direction } = usePresentation();
  const { active } = useContext(SceneLayerContext);
  const [step, setStep] = useState(direction === -1 ? count - 1 : 0);
  const live = useRef({ step, options });
  live.current = { step, options };

  const go = useCallback(
    (target: number) => {
      if (target < 0 || target >= count) return false;
      setStep(target);
      return true;
    },
    [count],
  );

  useEffect(() => {
    if (active) progressStore.set(count > 1 ? step / (count - 1) : 1);
  }, [step, active, count]);

  useEffect(() => {
    if (!active) return;
    return registerSteps({
      next: () => {
        const { step: s, options: o } = live.current;
        if (o.interceptNext?.(s)) return true;
        return go(s + 1);
      },
      prev: () => go(live.current.step - 1),
    });
  }, [active, registerSteps, go]);

  return { step, go, active };
}
