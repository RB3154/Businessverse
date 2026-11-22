import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import type { ScenarioOption } from '../../data/businessScenario';
import { usePresentation } from '../../hooks/usePresentation';

interface Props {
  option: ScenarioOption;
  /** Mini version for the verdict screen: no labels. */
  compact?: boolean;
  delay?: number;
}

/* Illustrative shapes only — no axis values, nothing that reads as real data. */
const SHAPES = {
  'fork-up': {
    base: 'M0 200 L260 196 L420 192 C470 190 510 150 560 120',
    up: 'M560 120 C700 90 820 60 1000 36',
    down: 'M560 120 C680 150 820 196 1000 214',
    labelUp: [1000, 26],
    labelDown: [1000, 248],
    marker: { x: 420, label: 'CAMPAIGN' },
  },
  runway: {
    base: 'M0 60 L120 62',
    up: 'M120 62 C420 80 720 112 1000 150',
    down: 'M120 62 C300 110 470 190 620 250',
    labelUp: [1000, 134],
    labelDown: [640, 236],
    marker: { x: 120, label: 'COST CUTS' },
  },
  'dip-rise': {
    base: 'M0 150 L240 150 C320 150 360 222 450 222 C500 222 530 200 560 186',
    up: 'M560 186 C700 140 840 70 1000 40',
    down: 'M560 186 C700 196 840 206 1000 212',
    labelUp: [1000, 28],
    labelDown: [1000, 246],
    marker: { x: 560, label: 'LAUNCH' },
  },
} as const;

/** Animated, illustrative outcome sketch for one option. */
export function OutcomeChart({ option, compact, delay = 0.4 }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const { reducedMotion } = usePresentation();
  const s = SHAPES[option.consequence.chart];
  const [labelUp, labelDown] = option.consequence.chartLabels;

  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const ctx = gsap.context(() => {
      const paths = svg.querySelectorAll<SVGPathElement>('.oc-draw');
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      if (reducedMotion) {
        gsap.set(paths, { strokeDashoffset: 0 });
        return;
      }
      const tl = gsap.timeline({ delay });
      tl.to(svg.querySelector('.oc-base'), { strokeDashoffset: 0, duration: 1, ease: 'power1.inOut' });
      tl.to(svg.querySelectorAll('.oc-branch'), { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out', stagger: 0.25 });
      tl.fromTo(svg.querySelectorAll('.oc-label'), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.1 }, '-=0.6');
    }, svg);
    return () => ctx.revert();
  }, [reducedMotion, delay]);

  return (
    <svg ref={ref} className="outcome-chart" viewBox="-20 0 1060 280" style={{ ['--accent' as string]: option.accent }} aria-hidden="true">
      {[70, 140, 210].map((y) => (
        <line key={y} x1="0" x2="1000" y1={y} y2={y} className="oc-grid" />
      ))}
      <line x1={s.marker.x} x2={s.marker.x} y1="12" y2="262" className="oc-marker" />
      {!compact && (
        <text x={s.marker.x + 12} y="270" className="oc-label oc-marker-label">
          {s.marker.label}
        </text>
      )}
      <path d={s.base} className="oc-draw oc-base oc-line" />
      <path d={s.up} className="oc-draw oc-branch oc-line" />
      <path d={s.down} className="oc-draw oc-branch oc-line-muted" />
      {!compact && (
        <>
          <text x={s.labelUp[0]} y={s.labelUp[1]} className="oc-label oc-label-up" textAnchor="end">
            {labelUp}
          </text>
          <text x={s.labelDown[0]} y={s.labelDown[1]} className="oc-label oc-label-down" textAnchor={s.labelDown[0] === 1000 ? 'end' : 'start'}>
            {labelDown}
          </text>
          <text x="0" y="276" className="oc-label oc-axis">
            TIME →
          </text>
        </>
      )}
    </svg>
  );
}
