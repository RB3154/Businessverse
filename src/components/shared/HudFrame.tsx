import { forwardRef } from 'react';

interface Props {
  left: string;
  right?: string;
}

/** Gaming-HUD framing: corner brackets and small status labels. */
export const HudFrame = forwardRef<HTMLSpanElement, Props>(function HudFrame({ left, right }, rightRef) {
  return (
    <div className="hud" aria-hidden="true">
      <span className="hud-corner tl" />
      <span className="hud-corner tr" />
      <span className="hud-corner bl" />
      <span className="hud-corner br" />
      <span className="hud-label hud-left">
        <span className="hud-dot" />
        {left}
      </span>
      {right !== undefined && (
        <span className="hud-label hud-right" ref={rightRef}>
          {right}
        </span>
      )}
    </div>
  );
});
