import type { CSSProperties } from 'react';
import { ArrowRight, BarChart3, Boxes, Briefcase, Megaphone, Rocket } from 'lucide-react';
import gsap from 'gsap';
import { scenario, type OptionId } from '../../data/businessScenario';
import { useEntrance } from './useEntrance';
import { OutcomeChart } from './OutcomeChart';
import { audioEngine } from '../../utils/audioEngine';

/* Step 0 — welcome */
export function WelcomeStep() {
  const ref = useEntrance((tl) => tl.call(() => audioEngine.play('impact'), undefined, 0.2));
  return (
    <div ref={ref} className="br-step br-center">
      <h2 data-in className="br-welcome-1">
        {scenario.welcome[0]}
      </h2>
      <p data-in className="br-welcome-2 text-gradient-brand">
        {scenario.welcome[1]}
      </p>
    </div>
  );
}

/* Step 1 — the brief: funds and a flattening growth line */
export function BriefStep() {
  const ref = useEntrance((tl, root, rm) => {
    const amount = root.querySelector('.br-funds-amount')!;
    const counter = { v: 0 };
    const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
    if (rm) amount.textContent = scenario.fundsDisplay;
    else
      tl.fromTo(
        counter,
        { v: 0 },
        { v: scenario.funds, duration: 1.6, ease: 'power2.out', onUpdate: () => (amount.textContent = fmt(counter.v)) },
        0.3,
      );
    const line = root.querySelector<SVGPathElement>('.br-growth-line')!;
    const len = line.getTotalLength();
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: rm ? 0 : len });
    if (!rm) tl.to(line, { strokeDashoffset: 0, duration: 2, ease: 'power1.inOut' }, 0.8);
    tl.fromTo(root.querySelector('.br-growth-flag'), { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.5 }, rm ? 0.2 : 2.6);
  });
  return (
    <div ref={ref} className="br-step">
      <div className="br-brief">
        <div className="br-brief-left">
          <span data-in className="br-kicker">
            {scenario.fundsLabel}
          </span>
          <span data-in className="br-funds-amount tabular-nums">
            ₹0
          </span>
          <span data-in className="br-kicker br-kicker-muted">
            AVAILABLE FUNDS
          </span>
        </div>
        <div data-in className="br-panel br-growth">
          <div className="br-panel-head">
            <span>GROWTH</span>
            <span className="br-growth-flag">SLOWING</span>
          </div>
          <svg viewBox="0 0 700 300" className="br-growth-svg" aria-hidden="true">
            {[60, 130, 200, 270].map((y) => (
              <line key={y} x1="0" x2="700" y1={y} y2={y} className="oc-grid" />
            ))}
            <path className="br-growth-line" d="M0 270 C120 250 200 170 300 120 C380 82 440 74 520 72 C590 71 640 72 700 73" />
          </svg>
          <p className="br-growth-caption">{scenario.growthLine}</p>
        </div>
      </div>
      <p data-in className="br-question">
        {scenario.question}
      </p>
    </div>
  );
}

/* Step 7 — verdict */
export function VerdictStep({ selected }: { selected: OptionId | null }) {
  const ref = useEntrance((tl) => tl.call(() => audioEngine.play('reveal'), undefined, 0.3));
  return (
    <div ref={ref} className="br-step">
      <div className="br-verdict-cols">
        {scenario.options.map((o, i) => (
          <div
            key={o.id}
            data-in
            className={`br-panel br-verdict-col ${selected === o.id ? 'is-selected' : ''}`}
            style={{ '--accent': o.accent } as CSSProperties}
          >
            <div className="br-verdict-head">
              <span className="dc-letter dc-letter-sm">{o.id}</span>
              <span className="br-verdict-title">{o.title}</span>
            </div>
            <OutcomeChart option={o} compact delay={0.4 + i * 0.2} />
            <p className="br-verdict-lesson">{o.consequence.lesson}</p>
          </div>
        ))}
      </div>
      <h2 data-in className="br-verdict-big">
        {scenario.verdictTitle}
      </h2>
      <p data-in className="br-verdict-text">
        {scenario.verdictText}
      </p>
    </div>
  );
}

const ROLE_ICONS = { rocket: Rocket, briefcase: Briefcase, chart: BarChart3, megaphone: Megaphone, boxes: Boxes };

/* Step 8 — who makes these decisions */
export function RolesStep({ onContinue }: { onContinue: () => void }) {
  const ref = useEntrance((tl) => tl.call(() => audioEngine.play('impact'), undefined, 0.2));
  return (
    <div ref={ref} className="br-step br-center">
      <h2 data-in className="br-roles-title">
        {scenario.rolesTitle}
      </h2>
      <div className="br-roles">
        {scenario.roles.map((r) => {
          const Icon = ROLE_ICONS[r.icon];
          return (
            <div key={r.name} data-in className="br-role">
              <span className="br-role-icon">
                <Icon size={40} strokeWidth={1.6} />
              </span>
              <span className="br-role-name">{r.name}</span>
              <span className="br-role-line">{r.line}</span>
            </div>
          );
        })}
      </div>
      <p data-in className="br-roles-statement">
        {scenario.rolesStatement}
      </p>
      <button data-in type="button" className="br-action" onClick={onContinue}>
        CONTINUE <ArrowRight size={24} />
      </button>
    </div>
  );
}
