import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import type { SceneDef } from '../config/presentation.config';
import { scenario, type OptionId } from '../data/businessScenario';
import { SceneLayerContext, usePresentation } from '../hooks/usePresentation';
import { backgroundStore, progressStore } from '../utils/stores';
import { audioEngine } from '../utils/audioEngine';
import { HudFrame } from '../components/shared/HudFrame';
import { BoardroomEnvironment } from '../components/boardroom/BoardroomEnvironment';
import { BriefStep, RolesStep, VerdictStep, WelcomeStep } from '../components/boardroom/BoardroomSteps';
import { BusinessScenario } from '../components/boardroom/BusinessScenario';
import { ConsequenceReveal } from '../components/boardroom/ConsequenceReveal';

/** Presenter-led steps. The Boardroom never auto-advances (brief §8.7, §15.3). */
const STEPS = ['welcome', 'brief', 'options', 'countdown', 'reveal-A', 'reveal-B', 'reveal-C', 'verdict', 'roles'] as const;
type Step = (typeof STEPS)[number];

const PHASES: { label: string; steps: Step[] }[] = [
  { label: 'BRIEF', steps: ['welcome', 'brief'] },
  { label: 'DECIDE', steps: ['options'] },
  { label: 'VOTE', steps: ['countdown'] },
  { label: 'OUTCOMES', steps: ['reveal-A', 'reveal-B', 'reveal-C', 'verdict'] },
  { label: 'CAREERS', steps: ['roles'] },
];

/** Steps that share one mounted screen (so the decision cards don't re-enter). */
const screenOf = (step: Step) => (step === 'options' || step === 'countdown' ? 'decide' : step);

/** World in the Act 02 closing shot that "opens into" the boardroom (Strategy). */
const PORTAL_ORIGIN = '705px 730px';

function StepStack({ screen, render }: { screen: string; render: (screen: string) => ReactNode }) {
  const [layers, setLayers] = useState([{ key: screen, leaving: false }]);
  useLayoutEffect(() => {
    setLayers((prev) =>
      prev.some((l) => l.key === screen && !l.leaving)
        ? prev
        : [...prev.filter((l) => l.key !== screen).map((l) => ({ ...l, leaving: true })), { key: screen, leaving: false }],
    );
  }, [screen]);
  useEffect(() => {
    if (!layers.some((l) => l.leaving)) return;
    const id = window.setTimeout(() => setLayers((p) => p.filter((l) => !l.leaving)), 450);
    return () => window.clearTimeout(id);
  }, [layers]);
  return (
    <>
      {layers.map((l) => (
        <div key={l.key} className={`br-layer ${l.leaving ? 'is-leaving' : ''}`} aria-hidden={l.leaving}>
          {render(l.key)}
        </div>
      ))}
    </>
  );
}

/** ACT 03 — The Boardroom Challenge. */
export function BoardroomScene(_props: { def: SceneDef }) {
  const { isPaused, registerSteps, direction, reducedMotion, next: nextScene } = usePresentation();
  const { active } = useContext(SceneLayerContext);
  const [stepIndex, setStepIndex] = useState(direction === -1 ? STEPS.length - 1 : 0);
  const [timerDone, setTimerDone] = useState(direction === -1);
  const [selected, setSelected] = useState<OptionId | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const state = useRef({ stepIndex, timerDone });
  state.current = { stepIndex, timerDone };
  const step = STEPS[stepIndex];

  // Act 02 → 03: the Strategy world expands into the boardroom.
  useLayoutEffect(() => {
    backgroundStore.set('drift');
    const root = rootRef.current;
    if (!root || direction !== 1 || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        root,
        { clipPath: `circle(0px at ${PORTAL_ORIGIN})` },
        { clipPath: `circle(2300px at ${PORTAL_ORIGIN})`, duration: 1.4, ease: 'power1.inOut', clearProps: 'clipPath' },
      );
      gsap.fromTo('.br-portal-ring', { scale: 0, opacity: 1 }, { scale: 26, opacity: 0, duration: 1.4, ease: 'power1.inOut' });
    }, root);
    audioEngine.play('whoosh');
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (active) progressStore.set(stepIndex / (STEPS.length - 1));
  }, [stepIndex, active]);

  const goStep = useCallback((target: number) => {
    const { stepIndex: from } = state.current;
    if (target < 0 || target >= STEPS.length) return false;
    // Entering the countdown from the options always starts a fresh timer.
    if (STEPS[target] === 'countdown' && from < target) setTimerDone(false);
    setStepIndex(target);
    return true;
  }, []);

  const next = useCallback(() => {
    const { stepIndex: i, timerDone: done } = state.current;
    // Next during the countdown ends the thinking time; it never skips the vote.
    if (STEPS[i] === 'countdown' && !done) {
      setTimerDone(true);
      return true;
    }
    return goStep(i + 1);
  }, [goStep]);

  const prev = useCallback(() => goStep(state.current.stepIndex - 1), [goStep]);

  useEffect(() => {
    if (!active) return;
    return registerSteps({ next, prev });
  }, [active, registerSteps, next, prev]);

  // Presenter-controlled selection: 1/2/3 or A/B/C record the class vote.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const map: Record<string, OptionId> = { '1': 'A', '2': 'B', '3': 'C', a: 'A', b: 'B', c: 'C', A: 'A', B: 'B', C: 'C' };
      const id = map[e.key];
      const i = state.current.stepIndex;
      if (!id || i < 2 || i > 7) return;
      e.preventDefault();
      setSelected((cur) => (cur === id ? null : id));
      audioEngine.play('tick');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  const select = (id: OptionId) => {
    setSelected((cur) => (cur === id ? null : id));
    audioEngine.play('tick');
  };

  const render = (screen: string) => {
    switch (screen) {
      case 'welcome':
        return <WelcomeStep />;
      case 'brief':
        return <BriefStep />;
      case 'decide':
        return (
          <BusinessScenario
            phase={step === 'options' ? 'options' : timerDone ? 'vote' : 'countdown'}
            selected={selected}
            paused={isPaused || !active}
            onSelect={select}
            onStartCountdown={() => goStep(STEPS.indexOf('countdown'))}
            onCountdownDone={() => setTimerDone(true)}
            onReveal={() => goStep(STEPS.indexOf('reveal-A'))}
          />
        );
      case 'reveal-A':
      case 'reveal-B':
      case 'reveal-C': {
        const option = scenario.options.find((o) => `reveal-${o.id}` === screen)!;
        return <ConsequenceReveal option={option} isChoice={selected === option.id} />;
      }
      case 'verdict':
        return <VerdictStep selected={selected} />;
      case 'roles':
        return <RolesStep onContinue={nextScene} />;
      default:
        return null;
    }
  };

  return (
    <div ref={rootRef} className="scene br-scene">
      <BoardroomEnvironment />
      <span className="br-portal-ring" aria-hidden="true" style={{ left: PORTAL_ORIGIN.split(' ')[0], top: PORTAL_ORIGIN.split(' ')[1] }} />

      <div className="br-topbar">
        <span className="br-mission">{scenario.mission}</span>
        <div className="br-phases">
          {PHASES.map((p, i) => {
            const current = p.steps.includes(step);
            const done = PHASES.findIndex((ph) => ph.steps.includes(step)) > i;
            return (
              <span key={p.label} className={`br-phase ${current ? 'is-current' : ''} ${done ? 'is-done' : ''}`}>
                {p.label}
              </span>
            );
          })}
        </div>
        <div className="br-topbar-right">
          <span className="br-tag">{scenario.disclaimer}</span>
          <span className={`br-funds-chip ${stepIndex >= 1 ? 'is-visible' : ''}`}>
            FUNDS <strong>{scenario.fundsDisplay}</strong>
          </span>
        </div>
      </div>

      <StepStack screen={screenOf(step)} render={render} />

      <HudFrame left="THE BUSINESSVERSE · ACT 03" />
    </div>
  );
}
