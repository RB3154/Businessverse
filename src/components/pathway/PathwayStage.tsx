import { Briefcase, ClipboardCheck, GraduationCap, Landmark, School } from 'lucide-react';
import type { PathwayStage as Stage, StageIcon } from '../../data/pathway';

export const STAGE_ICONS: Record<StageIcon, typeof School> = {
  school: School,
  degree: GraduationCap,
  exam: ClipboardCheck,
  mba: Landmark,
  career: Briefcase,
};

/** The detail panel for one stage of the pathway. */
export function PathwayStage({ stage, index }: { stage: Stage; index: number }) {
  const Icon = STAGE_ICONS[stage.icon];
  return (
    <div className="pw-panel">
      <div className="pw-panel-visual">
        <span className="pw-visual-ring" />
        <Icon size={110} strokeWidth={1.2} />
        <span className="pw-visual-num">STAGE {String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="pw-panel-body">
        <h2 className="pw-title">{stage.title}</h2>
        <span className="pw-timer" aria-hidden="true">
          <span className="pw-timer-fill" />
        </span>
        <p className="pw-lead">{stage.lead}</p>
        {stage.lines.map((line) => (
          <p key={line} className="pw-line">
            {line}
          </p>
        ))}
        {stage.chips && (
          <div className="pw-chips-wrap">
            {stage.chipsLabel && <span className="pw-chips-label">{stage.chipsLabel}</span>}
            <div className={`pw-chips ${stage.chips.length <= 3 ? 'is-wide' : ''}`}>
              {stage.chips.map((c) => (
                <span key={c} className="pw-chip">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
        {stage.note && <p className="pw-note">{stage.note}</p>}
      </div>
    </div>
  );
}
