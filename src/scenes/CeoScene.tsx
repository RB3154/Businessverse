import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { SceneDef } from '../config/presentation.config';
import { scenario, startMeters, type Meters, type OptionId, type ScenarioOption, type Team } from '../data/businessScenario';
import { usePresentation } from '../hooks/usePresentation';
import { useStepScene } from '../hooks/useStepScene';
import { backgroundStore } from '../utils/stores';
import { audioEngine } from '../utils/audioEngine';
import { HudFrame } from '../components/shared/HudFrame';
import { StepStack } from '../components/shared/StepStack';
import { rupees, type DashboardState } from '../components/ceo/Dashboard';
import {
  CrisisStep,
  DecidePanel,
  LockStep,
  OpeningStep,
  ResultStep,
  RolesStep,
  SummaryStep,
  TeamsStep,
  TwistStep,
  type DecidePhase,
  type TeamVotes,
} from '../components/ceo/CeoSteps';

/** Presenter-led steps. This act never auto-advances (brief 2 §Part 7). */
const STEPS = ['opening', 'crisis', 'teams', 'decide-0', 'lock-0', 'result-0', 'twist', 'decide-1', 'lock-1', 'result-1', 'summary', 'roles'] as const;
type Step = (typeof STEPS)[number];

const PHASES: { label: string; steps: Step[] }[] = [
  { label: 'CRISIS', steps: ['opening', 'crisis', 'teams'] },
  { label: 'DECISION 1', steps: ['decide-0', 'lock-0', 'result-0'] },
  { label: 'TWIST', steps: ['twist', 'decide-1', 'lock-1', 'result-1'] },
  { label: 'DAY 30', steps: ['summary', 'roles'] },
];

const clamp = (n: number) => Math.max(4, Math.min(100, n));
function apply(state: DashboardState, option: ScenarioOption, absoluteCash: boolean): DashboardState {
  const meters = { ...state.meters };
  (Object.keys(option.effect.meters) as (keyof Meters)[]).forEach((k) => {
    meters[k] = clamp(meters[k] + (option.effect.meters[k] ?? 0));
  });
  return {
    cash: absoluteCash ? option.effect.cash : state.cash + option.effect.cash,
    meters,
    daysNote: option.effect.daysNote ?? (option.effect.cash < 0 ? `${rupees(-option.effect.cash)} more spent` : state.daysNote),
  };
}

/** ACT 03 — You Are the CEO. Two teams, two decisions, a twist, real trade-offs. */
export function CeoScene(_props: { def: SceneDef }) {
  const { isPaused, next: nextScene } = usePresentation();
  const [choices, setChoices] = useState<(OptionId | null)[]>([null, null]);
  const [votes, setVotes] = useState<TeamVotes[]>([{}, {}]);
  const [phases, setPhases] = useState<DecidePhase[]>(['discuss', 'discuss']);
  const [hint, setHint] = useState(false);
  const live = useRef({ choices, phases });
  live.current = { choices, phases };

  const { step: stepIndex, go, active } = useStepScene(STEPS.length, {
    interceptNext: (i) => {
      const s = STEPS[i];
      if (!s.startsWith('decide-')) return false;
      const d = Number(s.slice(-1));
      const phase = live.current.phases[d];
      // → drives the decision: start the countdown, end it, then require a locked choice.
      if (phase === 'discuss') return setPhase(d, 'countdown'), true;
      if (phase === 'countdown') return setPhase(d, 'vote'), true;
      if (!live.current.choices[d]) {
        setHint(true);
        window.setTimeout(() => setHint(false), 900);
        return true;
      }
      return false;
    },
  });
  const step = STEPS[stepIndex];

  function setPhase(d: number, phase: DecidePhase) {
    setPhases((p) => p.map((x, i) => (i === d ? phase : x)));
  }

  useLayoutEffect(() => backgroundStore.set('void'), []);

  // Arriving backwards lands on the roles screen, so make sure the story is complete.
  useEffect(() => {
    if (stepIndex === STEPS.length - 1 && !choices[0] && !choices[1]) {
      setChoices(['A', 'C']);
      setPhases(['vote', 'vote']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1 / 2 / 3 lock the class decision while deciding.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const idx = ['1', '2', '3'].indexOf(e.key);
      const s = STEPS[stepIndex];
      if (idx < 0 || !s.startsWith('decide-')) return;
      e.preventDefault();
      choose(Number(s.slice(-1)), (['A', 'B', 'C'] as OptionId[])[idx]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIndex]);

  function choose(d: number, id: OptionId) {
    setChoices((c) => c.map((x, i) => (i === d ? (x === id ? null : id) : x)));
    if (live.current.phases[d] !== 'vote') setPhase(d, 'vote');
    audioEngine.play('tick');
  }

  function teamVote(d: number, team: Team, id: OptionId) {
    setVotes((v) => v.map((x, i) => (i === d ? { ...x, [team]: x[team] === id ? undefined : id } : x)));
    audioEngine.play('pop');
  }

  const start: DashboardState = useMemo(() => ({ cash: scenario.startCash, meters: startMeters }), []);
  const opt = (d: number) => scenario.decisions[d].options.find((o) => o.id === (choices[d] ?? 'A'))!;
  const after0 = useMemo(() => apply(start, opt(0), true), [choices[0]]); // eslint-disable-line react-hooks/exhaustive-deps
  const after1 = useMemo(() => apply(after0, opt(1), false), [after0, choices[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  const render = (screen: string) => {
    switch (screen) {
      case 'opening':
        return <OpeningStep />;
      case 'crisis':
        return <CrisisStep state={start} />;
      case 'teams':
        return <TeamsStep />;
      case 'decide-0':
      case 'decide-1': {
        const d = Number(screen.slice(-1));
        return (
          <DecidePanel
            decision={scenario.decisions[d]}
            phase={phases[d]}
            selected={choices[d]}
            votes={votes[d]}
            paused={isPaused || !active}
            hint={hint}
            onSelect={(id) => choose(d, id)}
            onTeamVote={(team, id) => teamVote(d, team, id)}
            onStart={() => setPhase(d, 'countdown')}
            onCountdownDone={() => setPhase(d, 'vote')}
            onLock={() => go(stepIndex + 1)}
          />
        );
      }
      case 'lock-0':
      case 'lock-1': {
        const d = Number(screen.slice(-1));
        return <LockStep option={opt(d)} votes={votes[d]} />;
      }
      case 'result-0':
        return <ResultStep option={opt(0)} before={start} after={after0} />;
      case 'result-1':
        return <ResultStep option={opt(1)} before={after0} after={after1} />;
      case 'twist':
        return <TwistStep />;
      case 'summary':
        return <SummaryStep first={opt(0)} twist={opt(1)} final={after1} />;
      case 'roles':
        return <RolesStep played={[...opt(0).roles, ...opt(1).roles]} onContinue={nextScene} />;
      default:
        return null;
    }
  };

  const currentPhase = PHASES.findIndex((p) => p.steps.includes(step));

  return (
    <div className="scene ceo-scene">
      <div className="ceo-grid" aria-hidden="true" />
      <div className="ceo-topbar">
        <span className="ceo-mission">YOU ARE THE CEO · {scenario.company}</span>
        <div className="ceo-phases">
          {PHASES.map((p, i) => (
            <span key={p.label} className={`ceo-phase ${i === currentPhase ? 'is-current' : ''} ${i < currentPhase ? 'is-done' : ''}`}>
              {p.label}
            </span>
          ))}
        </div>
        <span className="ceo-tag">{scenario.fictional}</span>
      </div>
      <StepStack screen={step} render={render} />
      <HudFrame left="THE BUSINESSVERSE · ACT 03" />
    </div>
  );
}
