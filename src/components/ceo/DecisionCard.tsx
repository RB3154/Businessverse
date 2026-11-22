import type { CSSProperties } from 'react';
import { Check } from 'lucide-react';
import type { ScenarioOption, Team } from '../../data/businessScenario';

interface Props {
  option: ScenarioOption;
  index: number;
  selected: boolean;
  dimmed: boolean;
  votes: Partial<Record<Team, boolean>>;
  showTeams: boolean;
  onSelect: () => void;
  onTeamVote: (team: Team) => void;
}

/**
 * A large decision card. Clicking the card (or pressing 1/2/3) locks in the
 * class decision; the TEAM A / TEAM B chips record how each team voted.
 */
export function DecisionCard({ option, index, selected, dimmed, votes, showTeams, onSelect, onTeamVote }: Props) {
  return (
    <div
      data-in
      className={`decision-card ${selected ? 'is-selected' : ''} ${dimmed ? 'is-dimmed' : ''}`}
      style={{ '--accent': option.accent } as CSSProperties}
    >
      <button type="button" className="dc-hit" onClick={onSelect} aria-pressed={selected} aria-label={`Choose option ${option.id}: ${option.title}`} />
      <span className="dc-glow" />
      <span className="dc-head">
        <span className="dc-letter">{option.id}</span>
        <span className="dc-key">{selected ? <><Check size={18} /> LOCKED IN</> : `PRESS ${index + 1}`}</span>
      </span>
      <span className="dc-title">{option.title}</span>
      <span className="dc-desc">{option.description}</span>
      <span className="dc-rule" />
      <span className="dc-point">
        <span className="dc-sign dc-plus">+</span>
        {option.benefit}
      </span>
      <span className="dc-point">
        <span className="dc-sign dc-minus">−</span>
        {option.risk}
      </span>
      {showTeams && (
        <span className="dc-teams">
          {(['growth', 'survival'] as Team[]).map((team) => (
            <button
              key={team}
              type="button"
              className={`dc-team dc-team-${team} ${votes[team] ? 'is-on' : ''}`}
              onClick={() => onTeamVote(team)}
            >
              {team === 'growth' ? 'TEAM A' : 'TEAM B'} {votes[team] && <Check size={16} />}
            </button>
          ))}
        </span>
      )}
    </div>
  );
}
