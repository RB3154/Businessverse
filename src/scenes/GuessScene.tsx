import { useLayoutEffect } from 'react';
import { Bike, HelpCircle, Smartphone, Store, UtensilsCrossed } from 'lucide-react';
import type { SceneDef } from '../config/presentation.config';
import { guessGame as g } from '../data/experience';
import { useEntrance } from '../hooks/useEntrance';
import { useStepScene } from '../hooks/useStepScene';
import { backgroundStore } from '../utils/stores';
import { audioEngine } from '../utils/audioEngine';
import { StepStack } from '../components/shared/StepStack';

const STEPS = ['intro', 'clue-1', 'clue-2', 'clue-3', 'answer', 'ask-1', 'functions', 'order', 'ask-2', 'costs', 'jobs'] as const;
type Step = (typeof STEPS)[number];

/** Steps that share one mounted screen, so clues stack instead of re-entering. */
const screenOf = (s: Step) => (s.startsWith('clue-') ? 'clues' : s);

function Intro() {
  const ref = useEntrance((tl, root, rm) => {
    if (!rm) tl.fromTo(root.querySelector('.gs-title'), { scale: 0.4, rotate: -6 }, { scale: 1, rotate: -2, duration: 0.7, ease: 'back.out(2)' }, 0);
    tl.call(() => audioEngine.play('impact'), undefined, 0.1);
  });
  return (
    <div ref={ref} className="gs-step gs-center">
      <span data-in className="gs-pill">ACT 02</span>
      <h2 data-in className="gs-title">
        {g.title}
      </h2>
      <p data-in className="gs-sub">
        {g.subtitle}
      </p>
    </div>
  );
}

function Clues({ count }: { count: number }) {
  const ref = useEntrance();
  useLayoutEffect(() => {
    audioEngine.play(count === 1 ? 'pop' : 'tick');
  }, [count]);
  return (
    <div ref={ref} className="gs-step gs-clues">
      <div data-in className="gs-mystery">
        <HelpCircle size={170} strokeWidth={1.4} />
        <span className="gs-mystery-label">MYSTERY BRAND</span>
      </div>
      <div className="gs-clue-col">
        <span data-in className="gs-round">
          {g.brandRound.label}
        </span>
        <h2 data-in className="gs-h2">
          {g.brandRound.prompt}
        </h2>
        <ol className="gs-clue-list">
          {g.brandRound.clues.slice(0, count).map((c, i) => (
            <li key={c} className="gs-clue">
              <span className="gs-clue-num">CLUE {i + 1}</span>
              {c}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Answer() {
  const ref = useEntrance((tl, root, rm) => {
    tl.call(() => audioEngine.play('ding'), undefined, 0.15);
    if (!rm) tl.fromTo(root.querySelector('.gs-answer'), { scale: 2.4, rotate: 12, autoAlpha: 0 }, { scale: 1, rotate: -4, autoAlpha: 1, duration: 0.55, ease: 'back.out(2.4)' }, 0.1);
  });
  return (
    <div ref={ref} className="gs-step gs-center">
      <span data-in className="gs-round">
        IT’S…
      </span>
      <span className="gs-answer">{g.brandRound.answer}</span>
      <p data-in className="gs-sub">
        A dairy cooperative that turned into one of India’s most recognised brands.
      </p>
    </div>
  );
}

function Ask({ round, text }: { round: string; text: string }) {
  const ref = useEntrance((tl) => tl.call(() => audioEngine.play('impact'), undefined, 0.1));
  return (
    <div ref={ref} className="gs-step gs-center">
      <span data-in className="gs-round">
        {round}
      </span>
      <h2 data-in className="gs-ask">
        {text}
      </h2>
      <span data-in className="gs-shout">
        SHOUT IT OUT!
      </span>
    </div>
  );
}

function Functions() {
  const ref = useEntrance((tl, root) => {
    root.querySelectorAll('.gs-fn').forEach((_, i) => tl.call(() => audioEngine.play('pop'), undefined, 0.35 + i * 0.09));
  });
  return (
    <div ref={ref} className="gs-step">
      <h2 data-in className="gs-h2 gs-h2-center">
        BEHIND ONE BRAND: SIX BUSINESS JOBS.
      </h2>
      <div className="gs-fn-grid">
        {g.brandRound.functions.map((f) => (
          <div key={f.name} data-in className="gs-fn">
            <span className="gs-fn-name">{f.name}</span>
            <span className="gs-fn-line">{f.line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderPhone({ costs }: { costs: boolean }) {
  return (
    <div className="gs-phone" data-in>
      <div className="gs-phone-screen">
        <span className="gs-phone-app">
          <Smartphone size={22} /> FOOD APP
        </span>
        <div className="gs-order">
          <UtensilsCrossed size={46} />
          <span className="gs-order-name">Your meal</span>
          <span className="gs-order-price">₹199</span>
        </div>
        <div className="gs-route">
          <span>
            <Store size={30} /> Restaurant
          </span>
          <span className="gs-route-line" />
          <span>
            <Bike size={30} /> Rider
          </span>
          <span className="gs-route-line" />
          <span>
            <UtensilsCrossed size={26} /> You
          </span>
        </div>
        <span className={`gs-order-status ${costs ? 'is-costs' : ''}`}>{costs ? 'Who pays for all this?' : 'Order placed ✓'}</span>
      </div>
    </div>
  );
}

function Order() {
  const ref = useEntrance((tl) => tl.call(() => audioEngine.play('pop'), undefined, 0.2));
  return (
    <div ref={ref} className="gs-step gs-order-step">
      <OrderPhone costs={false} />
      <div className="gs-order-copy">
        <span data-in className="gs-round">
          {g.orderRound.label}
        </span>
        <h2 data-in className="gs-big">
          {g.orderRound.setup}
        </h2>
        <p data-in className="gs-sub">
          {g.orderRound.setupNote}
        </p>
      </div>
    </div>
  );
}

function Costs() {
  const ref = useEntrance((tl, root) => {
    root.querySelectorAll('.gs-cost').forEach((_, i) => tl.call(() => audioEngine.play('ding'), undefined, 0.4 + i * 0.09));
  });
  return (
    <div ref={ref} className="gs-step gs-order-step">
      <OrderPhone costs />
      <div className="gs-costs">
        {g.orderRound.reveals.map((r, i) => (
          <div key={r.name} data-in className="gs-cost">
            <span className="gs-cost-num">{i + 1}</span>
            <span>
              <span className="gs-cost-name">{r.name}</span>
              <span className="gs-cost-line">{r.line}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Jobs() {
  const ref = useEntrance((tl) => tl.call(() => audioEngine.play('reveal'), undefined, 0.2));
  return (
    <div ref={ref} className="gs-step gs-center">
      <h2 data-in className="gs-h2 gs-h2-center">
        {g.orderRound.careersTitle}
      </h2>
      <div className="gs-jobs">
        {g.orderRound.careers.map((c) => (
          <div key={c.role} data-in className="gs-job">
            <span className="gs-job-owns">{c.owns}</span>
            <span className="gs-job-arrow">↓</span>
            <span className="gs-job-role">{c.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** ACT 02 — Guess the Business. Presenter-led game rounds; each → reveals the next beat. */
export function GuessScene(_props: { def: SceneDef }) {
  const { step: i } = useStepScene(STEPS.length);
  const step = STEPS[i];
  useLayoutEffect(() => backgroundStore.set('void'), []);

  const render = (screen: string) => {
    switch (screen) {
      case 'intro':
        return <Intro />;
      case 'clues':
        return <Clues count={step.startsWith('clue-') ? Number(step.slice(-1)) : 3} />;
      case 'answer':
        return <Answer />;
      case 'ask-1':
        return <Ask round={g.brandRound.label} text={g.brandRound.question} />;
      case 'functions':
        return <Functions />;
      case 'order':
        return <Order />;
      case 'ask-2':
        return <Ask round={g.orderRound.label} text={g.orderRound.question} />;
      case 'costs':
        return <Costs />;
      case 'jobs':
        return <Jobs />;
      default:
        return null;
    }
  };

  return (
    <div className="scene gs-scene">
      <div className="gs-dots" aria-hidden="true" />
      <span className="gs-brandmark">THE BUSINESSVERSE · ACT 02</span>
      <StepStack screen={screenOf(step)} render={render} />
    </div>
  );
}
