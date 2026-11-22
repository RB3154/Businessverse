import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import type { SceneId } from '../config/presentation.config';
import { presentationSettings } from '../config/presentation.config';
import { backgroundStore, progressStore, type BackgroundMode } from '../utils/stores';
import { SceneLayerContext, usePresentation, type SceneSteps } from './usePresentation';

export interface TimelineContext {
  reducedMotion: boolean;
  autoplay: boolean;
  /** Labels marking each beat, in order. Next/Previous jump between them. */
  beats: string[];
  /** Schedule a background mood; resolved from the playhead so it survives seeking. */
  background: (at: number, mode: BackgroundMode) => void;
  /** Called with the playhead time on every update and after every jump. */
  onTime: (cb: (time: number) => void) => void;
  /** Stop and wait for the presenter (Next) at this time. */
  hold: (at: number) => void;
}

/**
 * Owns a scene's master GSAP timeline: progress reporting, pause/resume,
 * auto-advance on completion and beat-by-beat stepping with the arrow keys.
 * Anything that must stay correct when the presenter jumps between beats
 * (background mood, 3D camera focus) is derived from the playhead time.
 */
export function useSceneTimeline(
  sceneId: SceneId,
  build: (tl: gsap.core.Timeline, ctx: TimelineContext) => void,
) {
  const scope = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const beatsRef = useRef<string[]>([]);
  const syncRef = useRef<() => void>(() => {});
  /** True while the timeline is waiting at a hold point for the presenter. */
  const held = useRef(false);
  const { active } = useContext(SceneLayerContext);
  const { isPaused, reducedMotion, sceneComplete, registerSteps, direction } = usePresentation();
  const live = useRef({ active, isPaused, sceneComplete });
  live.current = { active, isPaused, sceneComplete };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const moods: { at: number; mode: BackgroundMode }[] = [];
      const listeners: ((time: number) => void)[] = [];
      const sync = () => {
        if (!live.current.active) return;
        const time = tl.time();
        progressStore.set(tl.progress());
        let mode: BackgroundMode | null = null;
        for (const m of moods) if (m.at <= time) mode = m.mode;
        if (mode && mode !== backgroundStore.get()) backgroundStore.set(mode);
        listeners.forEach((cb) => cb(time));
      };
      const tl = gsap.timeline({
        paused: true,
        onUpdate: sync,
        onComplete() {
          if (!live.current.active) return;
          progressStore.set(1);
          live.current.sceneComplete(sceneId);
        },
      });
      const beats: string[] = [];
      build(tl, {
        reducedMotion,
        autoplay: presentationSettings.autoplay,
        beats,
        background: (at, mode) => {
          moods.push({ at, mode });
          moods.sort((a, b) => a.at - b.at);
        },
        onTime: (cb) => listeners.push(cb),
        hold: (at) => {
          tl.addPause(at, () => {
            held.current = true;
          });
        },
      });
      beatsRef.current = beats;
      tlRef.current = tl;
      syncRef.current = sync;
      // Arriving backwards lands on the final beat instead of replaying the scene.
      if (direction === -1 && beats.length) tl.seek(beats[beats.length - 1], true);
      sync();
      if (!live.current.isPaused) tl.play();
    }, scope);
    return () => {
      tlRef.current = null;
      ctx.revert();
    };
    // Built once per mount by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!active || isPaused) tl.pause();
    // A timeline waiting at a hold point stays there after resume.
    else if (!held.current && tl.progress() < 1) {
      tl.resume();
    }
  }, [active, isPaused]);

  useEffect(() => {
    if (!active) return;
    const jump = (offset: 1 | -1) => {
      const tl = tlRef.current;
      const beats = beatsRef.current;
      if (!tl || !beats.length) return false;
      const now = tl.time();
      // Index of the beat currently on screen (last label at or before playhead).
      let current = -1;
      beats.forEach((label, i) => {
        if (tl.labels[label] <= now + 0.05) current = i;
      });
      const target = current + offset;
      if (target < 0 || target >= beats.length) return false;
      scope.current?.querySelectorAll('.is-glitching').forEach((el) => el.classList.remove('is-glitching'));
      held.current = false;
      tl.seek(beats[target], true);
      syncRef.current();
      if (!live.current.isPaused) tl.play();
      return true;
    };
    const steps: SceneSteps = { next: () => jump(1), prev: () => jump(-1) };
    return registerSteps(steps);
  }, [active, registerSteps]);

  return { scope, tlRef };
}
