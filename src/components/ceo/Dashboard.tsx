import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { TrendingDown } from 'lucide-react';
import type { Meters } from '../../data/businessScenario';
import { scenario } from '../../data/businessScenario';
import { usePresentation } from '../../hooks/usePresentation';

export interface DashboardState {
  cash: number;
  meters: Meters;
  daysNote?: string;
}

interface Props {
  state: DashboardState;
  /** Animate from this state (e.g. before a decision) to `state`. */
  from?: DashboardState;
  compact?: boolean;
  delay?: number;
}

const METERS: { key: keyof Meters; label: string; bad?: boolean }[] = [
  { key: 'customers', label: 'CUSTOMERS' },
  { key: 'growth', label: 'GROWTH' },
  { key: 'cashSafety', label: 'CASH SAFETY' },
  { key: 'risk', label: 'RISK', bad: true },
];

export const rupees = (n: number) => '₹' + Math.max(0, Math.round(n)).toLocaleString('en-IN');

/** SNACKRUSH's live dashboard. Values are illustrative; changes animate. */
export function Dashboard({ state, from, compact, delay = 0.3 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion: rm } = usePresentation();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const start = from ?? state;
    const ctx = gsap.context(() => {
      const cashEl = root.querySelector('.db-cash-value')!;
      const c = { v: start.cash };
      cashEl.textContent = rupees(start.cash);
      gsap.to(c, {
        v: state.cash,
        duration: rm ? 0.01 : 1.6,
        delay,
        ease: 'power2.inOut',
        onUpdate: () => (cashEl.textContent = rupees(c.v)),
      });
      METERS.forEach(({ key }) => {
        const bar = root.querySelector(`[data-meter="${key}"] .db-bar-fill`);
        const delta = root.querySelector(`[data-meter="${key}"] .db-delta`);
        gsap.fromTo(bar, { scaleX: start.meters[key] / 100 }, { scaleX: state.meters[key] / 100, duration: rm ? 0.01 : 1.4, delay: delay + 0.2, ease: 'power3.inOut' });
        if (delta) gsap.fromTo(delta, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, delay: delay + 1.2 });
      });
    }, root);
    return () => ctx.revert();
  }, [state, from, rm, delay]);

  return (
    <div ref={ref} className={`dashboard ${compact ? 'is-compact' : ''}`}>
      <div className="db-head">
        <span className="db-company">{scenario.company}</span>
        <span className="db-live">
          <span className="db-live-dot" /> LIVE · FICTIONAL
        </span>
      </div>
      <div className="db-tiles">
        <div className="db-tile db-tile-cash">
          <span className="db-label">CASH LEFT</span>
          <span className="db-cash-value tabular-nums">{rupees(state.cash)}</span>
        </div>
        <div className="db-tile">
          <span className="db-label">DAYS TO SURVIVE</span>
          <span className="db-days tabular-nums">{scenario.startDays}</span>
          {state.daysNote && <span className="db-note">{state.daysNote}</span>}
        </div>
        <div className="db-tile db-tile-sales">
          <span className="db-label">SALES</span>
          <svg viewBox="0 0 200 70" className="db-spark" aria-hidden="true">
            <path d="M0 14 L30 18 L60 16 L90 28 L120 34 L150 46 L175 52 L200 60" />
          </svg>
          <span className="db-note db-note-bad">
            <TrendingDown size={18} /> {scenario.salesNote}
          </span>
        </div>
      </div>
      <div className="db-meters">
        {METERS.map(({ key, label, bad }) => {
          const before = (from ?? state).meters[key];
          const diff = state.meters[key] - before;
          const good = bad ? diff < 0 : diff > 0;
          return (
            <div key={key} className={`db-meter ${bad ? 'is-risk' : ''}`} data-meter={key}>
              <span className="db-label">{label}</span>
              <span className="db-bar">
                <span className="db-bar-fill" />
              </span>
              {from && diff !== 0 && (
                <span className={`db-delta ${good ? 'is-good' : 'is-bad'}`}>
                  {diff > 0 ? '▲' : '▼'} {Math.abs(diff)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
