import type { CSSProperties } from 'react';
import { Check } from 'lucide-react';
import type { ScenarioOption } from '../../data/businessScenario';

interface Props {
  option: ScenarioOption;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
}

/** One of the three large decision cards. The presenter clicks (or presses 1/2/3) to record the vote. */
export function DecisionCard({ option, selected, dimmed, onSelect }: Props) {
  return (
    <button
      type="button"
      data-in
      className={`decision-card ${selected ? 'is-selected' : ''} ${dimmed ? 'is-dimmed' : ''}`}
      style={{ '--accent': option.accent } as CSSProperties}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="dc-glow" />
      <span className="dc-head">
        <span className="dc-letter">{option.id}</span>
        <span className="dc-tag">{selected ? <><Check size={18} /> CLASS CHOICE</> : `OPTION ${option.id}`}</span>
      </span>
      <span className="dc-title">{option.title}</span>
      <span className="dc-desc">{option.description}</span>
      <span className="dc-rule" />
      <span className="dc-point">
        <span className="dc-sign dc-plus">+</span>
        <span>
          <span className="dc-point-label">POTENTIAL BENEFIT</span>
          {option.benefit}
        </span>
      </span>
      <span className="dc-point">
        <span className="dc-sign dc-minus">−</span>
        <span>
          <span className="dc-point-label">POTENTIAL RISK</span>
          {option.risk}
        </span>
      </span>
    </button>
  );
}
