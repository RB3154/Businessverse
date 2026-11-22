import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Keyboard, Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { presentationSettings } from '../../config/presentation.config';
import { usePresentation } from '../../hooks/usePresentation';
import { ProgressIndicator } from './ProgressIndicator';

/** Hides controls and the cursor when the mouse is idle, so the projector shows only the show. */
function useIdle(ms: number) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let id = 0;
    const wake = () => {
      setIdle(false);
      window.clearTimeout(id);
      id = window.setTimeout(() => setIdle(true), ms);
    };
    wake();
    window.addEventListener('mousemove', wake);
    window.addEventListener('mousedown', wake);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('mousemove', wake);
      window.removeEventListener('mousedown', wake);
    };
  }, [ms]);
  useEffect(() => {
    document.body.classList.toggle('cursor-hidden', idle);
  }, [idle]);
  return idle;
}

export function PresentationControls() {
  const p = usePresentation();
  const idle = useIdle(presentationSettings.controlsAutoHideMs);
  const visible = !idle || p.isPaused;

  const btn = (label: string, onClick: () => void, icon: JSX.Element, extra = '') => (
    <button type="button" className={`ctrl-btn ${extra}`} onClick={onClick} aria-label={label} title={label}>
      {icon}
    </button>
  );

  return (
    <div className={`controls ${visible ? 'is-visible' : ''}`}>
      {p.isPaused && <div className="paused-badge">PAUSED</div>}
      <div className="controls-bar" role="toolbar" aria-label="Presentation controls">
        {btn('Previous (←)', p.prev, <ChevronLeft size={26} />)}
        {btn(p.isPaused ? 'Resume (Space)' : 'Pause (Space)', p.togglePause, p.isPaused ? <Play size={22} /> : <Pause size={22} />, 'is-primary')}
        {btn('Next (→)', p.next, <ChevronRight size={26} />)}
        <span className="ctrl-sep" />
        {btn(p.soundOn ? 'Mute (M)' : 'Sound on (M)', p.toggleSound, p.soundOn ? <Volume2 size={22} /> : <VolumeX size={22} />, p.soundOn ? 'is-on' : '')}
        {btn(p.isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)', p.toggleFullscreen, p.isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />)}
        {btn('Restart (R)', p.restart, <RotateCcw size={21} />)}
        {btn('Shortcuts (?)', () => p.setShowHelp(!p.showHelp), <Keyboard size={22} />)}
      </div>
      <ProgressIndicator expanded={visible} />
    </div>
  );
}
