import { useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audioEngine';

interface Props {
  seconds: number;
  running: boolean;
  paused: boolean;
  onDone: () => void;
}

const R = 88;
const CIRC = 2 * Math.PI * R;

/**
 * Thinking countdown. Pauses with the presentation, and when it reaches zero
 * it only reports back — it never advances the challenge by itself (brief §8.7).
 */
export function CountdownTimer({ seconds, running, paused, onDone }: Props) {
  const ring = useRef<SVGCircleElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const live = useRef({ paused, onDone });
  live.current = { paused, onDone };

  useEffect(() => {
    if (!running) {
      if (ring.current) ring.current.style.strokeDashoffset = String(CIRC);
      if (num.current) num.current.textContent = '0';
      return;
    }
    let raf = 0;
    let elapsed = 0;
    let last = performance.now();
    let shown = seconds;
    if (num.current) num.current.textContent = String(seconds);
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      // Wall-clock based so a slow frame rate never stretches the 15 seconds.
      if (!live.current.paused && !document.hidden) elapsed += Math.min(dt, 1);
      const remaining = Math.max(0, seconds - elapsed);
      if (ring.current) ring.current.style.strokeDashoffset = String(CIRC * (1 - remaining / seconds));
      const whole = Math.ceil(remaining);
      if (whole !== shown) {
        shown = whole;
        if (num.current) num.current.textContent = String(whole);
        audioEngine.play(whole === 0 ? 'impact' : 'tick');
      }
      if (remaining <= 0) {
        live.current.onDone();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, seconds]);

  return (
    <div className={`countdown ${running ? 'is-running' : 'is-done'}`} role="timer" aria-label="Thinking time">
      <svg viewBox="0 0 200 200" className="countdown-svg">
        <circle cx="100" cy="100" r={R} className="countdown-track" />
        <circle
          ref={ring}
          cx="100"
          cy="100"
          r={R}
          className="countdown-ring"
          strokeDasharray={CIRC}
          strokeDashoffset={running ? 0 : CIRC}
          transform="rotate(-90 100 100)"
        />
      </svg>
      <span ref={num} className="countdown-num tabular-nums">
        {running ? seconds : 0}
      </span>
    </div>
  );
}
