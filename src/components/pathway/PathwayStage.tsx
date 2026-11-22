import { Briefcase, ClipboardCheck, GraduationCap, Landmark, School, Sparkles } from 'lucide-react';
import type { PathwayStage as Stage, StageIcon } from '../../data/pathway';

export const STAGE_ICONS: Record<StageIcon, typeof School> = {
  school: School,
  degree: GraduationCap,
  skills: Sparkles,
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
        {stage.note && <p className="pw-note">{stage.note}</p>}
      </div>
    </div>
  );
}
