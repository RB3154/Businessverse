import { useLayoutEffect, useState, type ReactNode } from 'react';

export const STAGE_W = 1920;
export const STAGE_H = 1080;

/**
 * Everything is composed on a fixed 1920×1080 stage that is scaled to fit the
 * display, so layout and typography are identical at 1366×768, 1600×900,
 * 1920×1080 and 2560×1440 — nothing reflows, nothing clips.
 */
export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <div
      className="stage"
      style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})` }}
    >
      {children}
    </div>
  );
}
