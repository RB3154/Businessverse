import { useContext, useEffect, useRef, useState } from 'react';
import { careerWorlds } from '../../data/careerWorlds';
import { SceneLayerContext, usePresentation } from '../../hooks/usePresentation';
import { webglAvailable } from '../../utils/webgl';
import type { Universe } from './universe3d';

type Mode = 'loading' | 'webgl' | 'fallback';

/** Warm the three.js chunk during Act 01 so Act 02 appears instantly. */
export function preloadUniverse() {
  if (webglAvailable()) void import('./universe3d').catch(() => undefined);
}

/* Fallback (no WebGL): the same arc, drawn with CSS orbs. */
const FALLBACK_POS = careerWorlds.map((_, i) => {
  const o = i - 2;
  return { x: 960 + o * 330, y: 560 - Math.sin(i * 1.7) * 40 + o * o * 12 };
});

/**
 * The Businessverse universe. Uses three.js when WebGL is available (loaded as
 * a separate chunk) and falls back to a CSS rendition otherwise, so the act
 * never breaks on weak or locked-down presentation laptops.
 */
export function UniverseView({ focus }: { focus: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const uni = useRef<Universe | null>(null);
  const [mode, setMode] = useState<Mode>(() => (webglAvailable() ? 'loading' : 'fallback'));
  const { isPaused, reducedMotion } = usePresentation();
  const { active } = useContext(SceneLayerContext);
  const focusRef = useRef(focus);
  focusRef.current = focus;

  useEffect(() => {
    if (mode === 'fallback') return;
    let cancelled = false;
    import('./universe3d')
      .then(({ Universe }) => {
        if (cancelled || !canvasRef.current) return;
        uni.current = new Universe(
          canvasRef.current,
          careerWorlds,
          (positions) => {
            positions.forEach((p, i) => {
              const el = labelRefs.current[i];
              if (el) el.style.transform = `translate(${p.x}px, ${p.y}px) translateX(-50%)`;
            });
          },
          reducedMotion,
        );
        uni.current.setFocus(focusRef.current);
        setMode('webgl');
      })
      .catch((error) => {
        console.error('[Businessverse] 3D universe failed; using fallback.', error);
        if (!cancelled) setMode('fallback');
      });
    return () => {
      cancelled = true;
      uni.current?.dispose();
      uni.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    uni.current?.setFocus(focus);
  }, [focus, mode]);

  useEffect(() => {
    uni.current?.setPaused(isPaused || !active);
  }, [isPaused, active, mode]);

  return (
    <div className={`universe ${focus === 0 ? 'show-labels' : ''}`} data-mode={mode}>
      {mode !== 'fallback' && <canvas ref={canvasRef} className="universe-canvas" />}

      {mode === 'fallback' && (
        <div className="fallback-universe" data-focus={focus}>
          {careerWorlds.map((w, i) => {
            const focused = focus === i + 1;
            const p = FALLBACK_POS[i];
            const x = focused ? 560 : p.x;
            const y = focused ? 520 : p.y;
            const scale = focused ? 2.1 : focus === 6 ? 0.8 : 1;
            const dim = focus >= 1 && focus <= 5 && !focused;
            return (
              <div
                key={w.id}
                className="fallback-orb"
                style={{
                  transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`,
                  opacity: dim ? 0.12 : 1,
                  ['--accent' as string]: w.accent,
                }}
              />
            );
          })}
        </div>
      )}

      {careerWorlds.map((w, i) => (
        <div
          key={w.id}
          ref={(el) => (labelRefs.current[i] = el)}
          className="world-label"
          // Labels pop in just after their world arrives.
          style={{
            transitionDelay: focus === 0 ? `${1.9 + i * 0.42}s` : '0s',
            ...(mode === 'fallback'
              ? { transform: `translate(${FALLBACK_POS[i].x}px, ${FALLBACK_POS[i].y + 110}px) translateX(-50%)` }
              : {}),
          }}
        >
          <span className="world-label-index" style={{ color: w.accent }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          {w.domain}
        </div>
      ))}
    </div>
  );
}
