import { ArrowRight, Play, Timer } from 'lucide-react';
import { scenario, type OptionId } from '../../data/businessScenario';
import { useEntrance } from './useEntrance';
import { DecisionCard } from './DecisionCard';
import { CountdownTimer } from './CountdownTimer';

export type DecidePhase = 'options' | 'countdown' | 'vote';

interface Props {
  phase: DecidePhase;
  selected: OptionId | null;
  paused: boolean;
  onSelect: (id: OptionId) => void;
  onStartCountdown: () => void;
  onCountdownDone: () => void;
  onReveal: () => void;
}

/**
 * Steps 2–3: the three options, the 15-second thinking countdown and the
 * hand vote. Stays mounted across all three phases so the cards never re-enter.
 */
export function BusinessScenario({ phase, selected, paused, onSelect, onStartCountdown, onCountdownDone, onReveal }: Props) {
  const ref = useEntrance();

  return (
    <div ref={ref} className={`br-step br-decide phase-${phase}`}>
      <div className="br-decide-head">
        {phase === 'options' && (
          <div key="q" className="br-head-swap">
            <span className="br-kicker">{scenario.question}</span>
            <span className="br-head-title">CHOOSE ONE.</span>
          </div>
        )}
        {phase !== 'options' && (
          <div key="t" className="br-head-swap br-head-timer">
            <CountdownTimer seconds={scenario.countdownSeconds} running={phase === 'countdown'} paused={paused} onDone={onCountdownDone} />
            <div>
              <span className="br-kicker">{phase === 'countdown' ? `${scenario.countdownSeconds} SECONDS` : "TIME'S UP"}</span>
              <span className={`br-head-title ${phase === 'vote' ? 'is-vote' : ''}`}>
                {phase === 'countdown' ? scenario.thinkingPrompt : scenario.votePrompt}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="br-cards">
        {scenario.options.map((o) => (
          <DecisionCard
            key={o.id}
            option={o}
            selected={selected === o.id}
            dimmed={selected !== null && selected !== o.id}
            onSelect={() => onSelect(o.id)}
          />
        ))}
      </div>

      <div className="br-decide-foot">
        {phase === 'options' && (
          <button type="button" className="br-action" onClick={onStartCountdown}>
            <Timer size={24} /> START {scenario.countdownSeconds}-SECOND COUNTDOWN
          </button>
        )}
        {phase === 'countdown' && (
          <button type="button" className="br-action br-action-ghost" onClick={onCountdownDone}>
            <Play size={20} /> SKIP TO VOTE
          </button>
        )}
        {phase === 'vote' && (
          <>
            <span className="br-hint">{selected ? `Class choice: Option ${selected}` : 'Click the winning card or press 1 · 2 · 3'}</span>
            <button type="button" className="br-action" onClick={onReveal}>
              REVEAL CONSEQUENCES <ArrowRight size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
