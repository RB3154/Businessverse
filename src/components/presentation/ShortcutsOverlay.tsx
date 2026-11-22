import { usePresentation } from '../../hooks/usePresentation';

const SHORTCUTS: [string, string][] = [
  ['→  /  Page Down', 'Next beat or scene'],
  ['←  /  Page Up', 'Previous beat or scene'],
  ['Space', 'Pause / resume'],
  ['F', 'Fullscreen'],
  ['M', 'Sound on / off'],
  ['R', 'Restart presentation'],
  ['?', 'Show / hide this panel'],
  ['Esc', 'Close panel · exit fullscreen'],
];

export function ShortcutsOverlay() {
  const { showHelp, setShowHelp } = usePresentation();
  if (!showHelp) return null;
  return (
    <div className="help-overlay" onClick={() => setShowHelp(false)} role="dialog" aria-label="Keyboard shortcuts">
      <div className="help-card" onClick={(e) => e.stopPropagation()}>
        <p className="hud-label text-ims mb-6">PRESENTER CONTROLS</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-12 gap-y-5">
          {SHORTCUTS.map(([key, action]) => (
            <div key={key} className="contents">
              <dt className="help-key">{key}</dt>
              <dd className="text-offwhite/80">{action}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
