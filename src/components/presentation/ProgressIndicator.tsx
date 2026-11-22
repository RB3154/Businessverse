import { useEffect, useRef } from 'react';
import { acts, presentationSettings, scenes } from '../../config/presentation.config';
import { usePresentation } from '../../hooks/usePresentation';
import { progressStore } from '../../utils/stores';
import { formatClock } from '../../utils/timing';

const actTotals = acts.map((a) => scenes.filter((s) => s.act === a.id).reduce((t, s) => t + s.durationSec, 0));
const plannedTotal = actTotals.reduce((a, b) => a + b, 0);

/** Thin act timeline along the bottom edge. Updates via rAF, not React renders. */
export function ProgressIndicator({ expanded }: { expanded: boolean }) {
  const { sceneIndex, scene, isPaused, runId, goTo, started } = usePresentation();
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const clock = useRef<HTMLSpanElement>(null);
  const elapsed = useRef(0);
  const paused = useRef(isPaused);
  // The clock only runs once the show has started.
  paused.current = isPaused || !started;

  useEffect(() => {
    elapsed.current = 0;
  }, [runId]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      if (!paused.current && !document.hidden) elapsed.current += dt;
      const p = progressStore.get();
      acts.forEach((act, ai) => {
        const el = fills.current[ai];
        if (!el) return;
        let done = 0;
        scenes.forEach((s, si) => {
          if (s.act !== act.id) return;
          if (si < sceneIndex) done += s.durationSec;
          else if (si === sceneIndex) done += s.durationSec * p;
        });
        el.style.transform = `scaleX(${done / actTotals[ai]})`;
      });
      if (clock.current) clock.current.textContent = formatClock(elapsed.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sceneIndex]);

  const currentAct = acts.find((a) => a.id === scene.act)!;

  return (
    <div className={`progress ${expanded ? 'is-expanded' : ''}`}>
      <div className="progress-meta">
        <span className="progress-act">
          <span className="text-ims">ACT {currentAct.code}</span>
          <span className="opacity-40 mx-3">/</span>
          {currentAct.title.toUpperCase()}
        </span>
        {presentationSettings.showElapsedTime && (
          <span className="progress-clock">
            <span ref={clock}>00:00</span>
            <span className="opacity-40"> / {formatClock(plannedTotal)}</span>
          </span>
        )}
      </div>
      <div className="progress-track">
        {acts.map((act, ai) => {
          const firstScene = scenes.findIndex((s) => s.act === act.id);
          return (
            <button
              key={act.id}
              type="button"
              className={`progress-seg ${act.id === scene.act ? 'is-current' : ''}`}
              style={{ flexGrow: actTotals[ai] }}
              onClick={() => goTo(firstScene, true)}
              aria-label={`Go to Act ${act.code}: ${act.title}`}
              tabIndex={-1}
            >
              <span className="progress-seg-bg" />
              <span className="progress-seg-fill" ref={(el) => (fills.current[ai] = el)} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
