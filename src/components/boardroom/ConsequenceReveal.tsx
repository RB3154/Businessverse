import type { CSSProperties } from 'react';
import { Lightbulb, Minus, Plus } from 'lucide-react';
import type { ScenarioOption } from '../../data/businessScenario';
import { scenario } from '../../data/businessScenario';
import { audioEngine } from '../../utils/audioEngine';
import { useEntrance } from './useEntrance';
import { OutcomeChart } from './OutcomeChart';

/** Steps 4–6: what might happen with one option — outcome, explanation, trade-offs, lesson. */
export function ConsequenceReveal({ option, isChoice }: { option: ScenarioOption; isChoice: boolean }) {
  const ref = useEntrance((tl) => tl.call(() => audioEngine.play('whoosh'), undefined, 0));
  const c = option.consequence;
  const index = scenario.options.findIndex((o) => o.id === option.id) + 1;

  return (
    <div ref={ref} className="br-step br-reveal" style={{ '--accent': option.accent } as CSSProperties}>
      <div className="br-reveal-left">
        <span data-in className="br-kicker">
          OUTCOME {index} / {scenario.options.length}
        </span>
        <span data-in className="dc-letter dc-letter-xl">
          {option.id}
        </span>
        <h2 data-in className="br-reveal-title">
          {option.title}
        </h2>
        {isChoice && (
          <span data-in className="br-choice-chip">
            THE CLASS CHOSE THIS
          </span>
        )}
      </div>

      <div className="br-reveal-right">
        <div data-in className="br-panel br-chart-panel">
          <div className="br-panel-head">
            <span>WHAT MIGHT HAPPEN</span>
            <span className="br-panel-note">ILLUSTRATIVE</span>
          </div>
          <OutcomeChart option={option} delay={0.6} />
        </div>
        <p data-in className="br-reveal-explain">
          {c.explanation}
        </p>
        <div className="br-tradeoffs">
          <div data-in className="br-tradeoff is-plus">
            <span className="br-tradeoff-label">
              <Plus size={20} /> POTENTIAL ADVANTAGE
            </span>
            {c.advantage}
          </div>
          <div data-in className="br-tradeoff is-minus">
            <span className="br-tradeoff-label">
              <Minus size={20} /> POTENTIAL DISADVANTAGE
            </span>
            {c.disadvantage}
          </div>
        </div>
        <div data-in className="br-lesson">
          <Lightbulb size={28} />
          <span>
            <span className="br-lesson-label">BUSINESS LESSON</span>
            {c.lesson}
          </span>
        </div>
      </div>
    </div>
  );
}
