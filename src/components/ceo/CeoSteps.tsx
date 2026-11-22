import type { CSSProperties } from 'react';
import { ArrowRight, BarChart3, Boxes, Briefcase, Check, Megaphone, Play, Rocket, Siren, Timer, Truck } from 'lucide-react';
import gsap from 'gsap';
import { scenario, type Decision, type OptionId, type ScenarioOption, type Team } from '../../data/businessScenario';
import { useEntrance } from '../../hooks/useEntrance';
import { audioEngine } from '../../utils/audioEngine';
import { Dashboard, type DashboardState } from './Dashboard';
import { DecisionCard } from './DecisionCard';
import { CountdownTimer } from './CountdownTimer';

export type DecidePhase = 'discuss' | 'countdown' | 'vote';
export type TeamVotes = Partial<Record<Team, OptionId>>;

/* Opening — five lines stacking up, ending in the crisis. */
export function OpeningStep() {
  const ref = useEntrance((tl, root, rm) => {
    const lines = root.querySelectorAll('.ceo-open-line');
    tl.set(lines, { autoAlpha: 0 }, 0);
    lines.forEach((line, i) => {
      const at = 0.2 + i * 0.85;
      tl.fromTo(line, rm ? { autoAlpha: 0 } : { autoAlpha: 0, x: -60, filter: 'blur(8px)' }, { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out' }, at);
      tl.call(() => audioEngine.play(i === 2 ? 'alert' : 'impact'), undefined, at);
    });
  });
  return (
    <div ref={ref} className="ceo-step ceo-open">
      {scenario.opening.map((line, i) => (
        <span key={line} className={`ceo-open-line l${i}`}>
          {line}
        </span>
      ))}
    </div>
  );
}

/* The crisis dashboard. */
export function CrisisStep({ state }: { state: DashboardState }) {
  const ref = useEntrance();
  return (
    <div ref={ref} className="ceo-step ceo-crisis">
      <div data-in className="ceo-crisis-copy">
        <span className="ceo-kicker">{scenario.companyNote}</span>
        <h2 className="ceo-h2">
          SALES ARE FALLING.
          <br />
          <span className="ceo-red">CASH IS RUNNING OUT.</span>
        </h2>
        <p className="ceo-sub">You have one month to turn it around.</p>
      </div>
      <div data-in>
        <Dashboard state={state} />
      </div>
    </div>
  );
}

/* Split the room into two teams. */
export function TeamsStep() {
  const ref = useEntrance((tl, root) => {
    tl.fromTo(root.querySelectorAll('.ceo-team'), { xPercent: (i) => (i === 0 ? -100 : 100) }, { xPercent: 0, duration: 0.7, ease: 'expo.out', stagger: 0.1 }, 0);
    tl.call(() => audioEngine.play('whoosh'), undefined, 0);
  });
  const t = scenario.teams;
  return (
    <div ref={ref} className="ceo-step ceo-teams">
      {(['growth', 'survival'] as Team[]).map((key) => (
        <div key={key} className={`ceo-team ceo-team-${key}`} style={{ '--team': t[key].color } as CSSProperties}>
          <span className="ceo-team-name">{t[key].name}</span>
          <span className="ceo-team-label">{t[key].label}</span>
          <p className="ceo-team-mandate">{t[key].mandate}</p>
          <span className="ceo-team-side">{t[key].side}</span>
        </div>
      ))}
      <span className="ceo-vs">VS</span>
      <span data-in className="ceo-teams-title">
        {t.title}
      </span>
    </div>
  );
}

interface DecideProps {
  decision: Decision;
  phase: DecidePhase;
  selected: OptionId | null;
  votes: TeamVotes;
  paused: boolean;
  hint: boolean;
  onSelect: (id: OptionId) => void;
  onTeamVote: (team: Team, id: OptionId) => void;
  onStart: () => void;
  onCountdownDone: () => void;
  onLock: () => void;
}

/* The decision: discuss → countdown → team vote → lock in. */
export function DecidePanel({ decision, phase, selected, votes, paused, hint, onSelect, onTeamVote, onStart, onCountdownDone, onLock }: DecideProps) {
  const ref = useEntrance();
  return (
    <div ref={ref} className={`ceo-step ceo-decide phase-${phase}`}>
      <div className="ceo-decide-head">
        {phase === 'discuss' && (
          <div key="q" className="ceo-head-swap">
            <span className="ceo-kicker">{decision.kicker}</span>
            <span className="ceo-question">{decision.question}</span>
          </div>
        )}
        {phase !== 'discuss' && (
          <div key="t" className="ceo-head-swap ceo-head-timer">
            <CountdownTimer seconds={decision.countdownSeconds} running={phase === 'countdown'} paused={paused} onDone={onCountdownDone} />
            <div>
              <span className="ceo-kicker">{phase === 'countdown' ? 'DISCUSS WITH YOUR TEAM' : "TIME'S UP"}</span>
              <span className={`ceo-question ${phase === 'vote' ? 'is-vote' : ''}`}>
                {phase === 'countdown' ? 'DECIDE. FAST.' : 'TEAM A, TEAM B — HANDS UP!'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="ceo-cards">
        {decision.options.map((o, i) => (
          <DecisionCard
            key={o.id}
            option={o}
            index={i}
            selected={selected === o.id}
            dimmed={selected !== null && selected !== o.id}
            votes={{ growth: votes.growth === o.id, survival: votes.survival === o.id }}
            showTeams={phase === 'vote'}
            onSelect={() => onSelect(o.id)}
            onTeamVote={(team) => onTeamVote(team, o.id)}
          />
        ))}
      </div>

      <div className="ceo-foot">
        {phase === 'discuss' && (
          <button type="button" className="ceo-action" onClick={onStart}>
            <Timer size={24} /> START {decision.countdownSeconds}-SECOND COUNTDOWN
          </button>
        )}
        {phase === 'countdown' && (
          <button type="button" className="ceo-action ceo-action-ghost" onClick={onCountdownDone}>
            <Play size={20} /> SKIP TO VOTE
          </button>
        )}
        {phase === 'vote' && (
          <>
            <span className={`ceo-hint ${hint ? 'is-flash' : ''}`}>
              {selected ? `Class decision: Option ${selected}` : 'Tap TEAM A / TEAM B on each team’s pick, then press 1 · 2 · 3 to lock the decision'}
            </span>
            <button type="button" className="ceo-action" onClick={onLock} disabled={!selected}>
              LOCK IT IN <ArrowRight size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* Locked in — suspense before the consequences. */
export function LockStep({ option, votes }: { option: ScenarioOption; votes: TeamVotes }) {
  const ref = useEntrance((tl, root, rm) => {
    tl.call(() => audioEngine.play('confirm'), undefined, 0);
    if (!rm) tl.fromTo(root.querySelector('.ceo-lock-card'), { scale: 0.6, rotate: -4 }, { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.8)' }, 0);
    tl.call(() => audioEngine.play('drumroll'), undefined, 1.1);
    tl.fromTo(root.querySelector('.ceo-lock-wait'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, repeat: rm ? 0 : -1, yoyo: true, repeatDelay: 0.3 }, 1.3);
  });
  const teams = (['growth', 'survival'] as Team[]).filter((t) => votes[t] === option.id);
  return (
    <div ref={ref} className="ceo-step ceo-lock" style={{ '--accent': option.accent } as CSSProperties}>
      <span data-in className="ceo-kicker">
        DECISION LOCKED
      </span>
      <div data-in className="ceo-lock-card">
        <span className="dc-letter dc-letter-xl">{option.id}</span>
        <span className="ceo-lock-title">{option.title}</span>
        {teams.length > 0 && (
          <span className="ceo-lock-teams">
            {teams.map((t) => (
              <span key={t} className={`dc-team dc-team-${t} is-on`}>
                {t === 'growth' ? 'TEAM A' : 'TEAM B'} <Check size={16} />
              </span>
            ))}
          </span>
        )}
      </div>
      <span className="ceo-lock-wait">WHAT HAPPENS NEXT…?</span>
    </div>
  );
}

/* The consequences: the dashboard moves, the trade-off lands. */
export function ResultStep({ option, before, after }: { option: ScenarioOption; before: DashboardState; after: DashboardState }) {
  const ref = useEntrance((tl) => tl.call(() => audioEngine.play('reveal'), undefined, 0.2));
  return (
    <div ref={ref} className="ceo-step ceo-result" style={{ '--accent': option.accent } as CSSProperties}>
      <div data-in>
        <Dashboard state={after} from={before} delay={0.6} />
      </div>
      <div className="ceo-result-copy">
        <span data-in className="ceo-kicker">
          YOU CHOSE <strong>{option.id}</strong> · {option.title}
        </span>
        <h2 data-in className="ceo-headline">
          {option.headline}
        </h2>
        <p data-in className="ceo-tradeoff">
          {option.tradeoff}
        </p>
        <div data-in className="ceo-roles-used">
          <span className="ceo-kicker">IN REAL LIFE, THIS CALL BELONGS TO A</span>
          <div className="ceo-role-chips">
            {option.roles.map((r) => (
              <span key={r} className="ceo-role-chip">
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* The twist — breaking news. */
export function TwistStep() {
  const ref = useEntrance((tl, root, rm) => {
    tl.call(() => audioEngine.play('alert'), undefined, 0);
    if (!rm) tl.fromTo(root.querySelector('.ceo-breaking-bar'), { xPercent: -100 }, { xPercent: 0, duration: 0.45, ease: 'expo.out' }, 0);
    tl.fromTo(root.querySelector('.ceo-now-what'), { autoAlpha: 0, scale: rm ? 1 : 1.5 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'expo.out' }, 1.6);
    tl.call(() => audioEngine.play('impact'), undefined, 1.6);
    if (!rm) gsap.to(root.querySelector('.ceo-ticker-track'), { xPercent: -50, duration: 14, ease: 'none', repeat: -1 });
  });
  return (
    <div ref={ref} className="ceo-step ceo-twist">
      <div className="ceo-breaking-bar">
        <span className="ceo-breaking-flag">
          <Siren size={34} /> {scenario.twist.flag}
        </span>
        <span className="ceo-breaking-head">{scenario.twist.headline}</span>
      </div>
      <p data-in className="ceo-twist-sub">
        {scenario.twist.sub}
      </p>
      <span className="ceo-now-what">NOW WHAT?</span>
      <div className="ceo-ticker" aria-hidden="true">
        <span className="ceo-ticker-track">
          {Array.from({ length: 2 }, (_, k) => (
            <span key={k}>
              COMPETITOR SLASHES PRICES · CUSTOMERS COMPARING APPS · SNACKRUSH UNDER PRESSURE · BOARD WANTS A PLAN ·{' '}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

/* Day 30 — the story of the class's company. */
export function SummaryStep({ first, twist, final }: { first: ScenarioOption; twist: ScenarioOption; final: DashboardState }) {
  const ref = useEntrance();
  return (
    <div ref={ref} className="ceo-step ceo-summary">
      <div className="ceo-summary-copy">
        <span data-in className="ceo-day">
          {scenario.summary.title}
        </span>
        <div data-in className="ceo-story">
          <span className="ceo-story-step" style={{ '--accent': first.accent } as CSSProperties}>
            <span className="dc-letter dc-letter-sm">{first.id}</span>
            {first.title}
          </span>
          <ArrowRight size={28} className="ceo-story-arrow" />
          <span className="ceo-story-step" style={{ '--accent': twist.accent } as CSSProperties}>
            <span className="dc-letter dc-letter-sm">{twist.id}</span>
            {twist.title}
          </span>
        </div>
        <p data-in className="ceo-sub">
          {scenario.summary.line}
        </p>
        <h2 data-in className="ceo-verdict">
          {scenario.summary.verdict}
        </h2>
        <p data-in className="ceo-tradeoff">
          {scenario.summary.verdictText}
        </p>
      </div>
      <div data-in>
        <Dashboard state={final} compact />
      </div>
    </div>
  );
}

const ROLE_ICONS = { rocket: Rocket, briefcase: Briefcase, chart: BarChart3, megaphone: Megaphone, truck: Truck, boxes: Boxes };

/* Who actually makes these decisions — highlighting the roles the class just played. */
export function RolesStep({ played, onContinue }: { played: string[]; onContinue: () => void }) {
  const ref = useEntrance((tl) => tl.call(() => audioEngine.play('impact'), undefined, 0.2));
  return (
    <div ref={ref} className="ceo-step ceo-roles-step">
      <h2 data-in className="ceo-roles-title">
        {scenario.rolesTitle}
      </h2>
      <div className="ceo-roles">
        {scenario.roles.map((r) => {
          const Icon = ROLE_ICONS[r.icon];
          const did = played.includes(r.name);
          return (
            <div key={r.name} data-in className={`ceo-role ${did ? 'is-played' : ''}`}>
              {did && <span className="ceo-role-badge">YOU JUST DID THIS JOB</span>}
              <span className="ceo-role-icon">
                <Icon size={38} strokeWidth={1.6} />
              </span>
              <span className="ceo-role-name">{r.name}</span>
              <span className="ceo-role-line">{r.line}</span>
            </div>
          );
        })}
      </div>
      <button data-in type="button" className="ceo-action" onClick={onContinue}>
        CONTINUE <ArrowRight size={24} />
      </button>
    </div>
  );
}
