import { useEffect, useRef } from 'react';
import { usePresentation } from '../../hooks/usePresentation';
import { backgroundStore, type BackgroundMode } from '../../utils/stores';

/**
 * One persistent, full-window particle field that every scene shares, so the
 * atmosphere carries continuously across acts. Scenes change its mood through
 * backgroundStore ('void' → 'drift' → 'warp' → 'nebula'); the field eases
 * between moods rather than cutting.
 */

interface Mood {
  speed: number;
  alpha: number;
  streak: number;
}

const MOODS: Record<BackgroundMode, Mood> = {
  void: { speed: 0.012, alpha: 0.35, streak: 0 },
  drift: { speed: 0.05, alpha: 0.85, streak: 0 },
  warp: { speed: 1.9, alpha: 1, streak: 1 },
  nebula: { speed: 0.03, alpha: 0.9, streak: 0 },
};

const COLORS = ['245,245,250', '245,245,250', '167,139,250', '34,185,242', '4,129,254'];

interface Star {
  x: number;
  y: number;
  z: number;
  c: string;
}

export function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reducedMotion } = usePresentation();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const count = reducedMotion ? 90 : 240;
    const spawn = (z = Math.random()): Star => ({
      x: (Math.random() * 2 - 1) * 1.6,
      y: (Math.random() * 2 - 1) * 1.0,
      z: Math.max(0.04, z),
      c: COLORS[(Math.random() * COLORS.length) | 0],
    });
    const stars: Star[] = Array.from({ length: count }, () => spawn());
    const mood: Mood = { ...MOODS[backgroundStore.get()] };

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const target = MOODS[backgroundStore.get()];
      const k = 1 - Math.pow(0.02, dt); // frame-rate independent easing
      const targetSpeed = reducedMotion ? Math.min(target.speed, 0.02) : target.speed;
      mood.speed += (targetSpeed - mood.speed) * k;
      mood.alpha += (target.alpha - mood.alpha) * k;
      mood.streak += ((reducedMotion ? 0 : target.streak) - mood.streak) * k;

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const fov = Math.max(w, h) * 0.5;

      for (const s of stars) {
        const pz = s.z;
        s.z -= mood.speed * dt;
        if (s.z <= 0.04) {
          Object.assign(s, spawn(1));
          continue;
        }
        const sx = cx + (s.x / s.z) * fov;
        const sy = cy + (s.y / s.z) * fov;
        if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) {
          Object.assign(s, spawn(1));
          continue;
        }
        const depth = 1 - s.z;
        const a = Math.min(1, depth * 1.2) * mood.alpha;
        if (mood.streak > 0.05) {
          const tz = Math.min(1, pz + mood.speed * 0.06 * mood.streak);
          const tx = cx + (s.x / tz) * fov;
          const ty = cy + (s.y / tz) * fov;
          ctx.strokeStyle = `rgba(${s.c},${a})`;
          ctx.lineWidth = 0.6 + depth * 2;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${s.c},${a})`;
          const r = 0.4 + depth * 1.9;
          ctx.fillRect(sx - r / 2, sy - r / 2, r, r);
        }
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  return (
    <div className="bg-root" aria-hidden="true">
      <div className="atmos atmos-a" />
      <div className="atmos atmos-b" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="bg-grain" />
      <div className="bg-vignette" />
    </div>
  );
}
