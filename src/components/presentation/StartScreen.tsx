import { Play, VolumeX } from 'lucide-react';
import { branding } from '../../config/branding.config';
import { usePresentation } from '../../hooks/usePresentation';
import { IMSLogo } from '../shared/IMSLogo';

/**
 * Standby screen shown while the room fills up. Deliberately understated so
 * it doesn't give away Act 01. Starting from here is a user gesture, which is
 * what lets the browser play sound.
 */
export function StartScreen() {
  const { started, start } = usePresentation();
  if (started) return null;

  return (
    <div className="start-screen">
      <span className="start-orb" aria-hidden="true">
        <span className="start-orb-ring" />
        <span className="start-orb-ring r2" />
      </span>
      <p className="start-label">STANDBY</p>
      <div className="start-actions">
        <button type="button" className="start-btn" onClick={() => start(true)} autoFocus>
          <Play size={26} /> START WITH SOUND
        </button>
        <button type="button" className="start-btn start-btn-ghost" onClick={() => start(false)}>
          <VolumeX size={22} /> Start muted
        </button>
      </div>
      <p className="start-hint">→ or Enter to start with sound · F fullscreen · M toggles sound at any time · ? shortcuts</p>
      <div className="start-brand">
        <span className="hud-label opacity-70">{branding.presentedByLabel}</span>
        <IMSLogo height={30} />
      </div>
    </div>
  );
}
