import { branding } from '../../config/branding.config';
import { IMSLogo } from '../shared/IMSLogo';

/** Small, refined IMS identification for the opening — never competing with the type. */
export function PresentedBy({ className = '' }: { className?: string }) {
  return (
    <div className={`presented-by ${className}`}>
      <span className="hud-label opacity-70">{branding.presentedByLabel}</span>
      <IMSLogo height={34} />
    </div>
  );
}
