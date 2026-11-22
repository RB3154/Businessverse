import type { CSSProperties } from 'react';

interface SplitProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  /** Adds the glitch layers (driven by the .is-glitching class). */
  glitch?: boolean;
}

/**
 * Splits text into per-character spans (`.char`) for kinetic typography,
 * keeping words unbroken and the full string available to screen readers.
 */
export function SplitText({ text, className = '', style, glitch }: SplitProps) {
  const words = text.split(' ');
  return (
    <span
      className={`split ${glitch ? 'glitch' : ''} ${className}`}
      style={style}
      data-text={glitch ? text : undefined}
      aria-label={text}
      role="text"
    >
      {words.map((word, wi) => (
        <span key={wi} className="word" aria-hidden="true">
          {[...word].map((ch, ci) => (
            <span key={ci} className="char">
              {ch}
            </span>
          ))}
          {wi < words.length - 1 && <span className="char char-space">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

/** A word revealed through a mask (used for gradient words that can't be split). */
export function MaskedWord({ text, className = '', glitch }: { text: string; className?: string; glitch?: boolean }) {
  return (
    <span className="mask-line">
      <span className={`mask-inner inline-block ${glitch ? 'glitch' : ''} ${className}`} data-text={glitch ? text : undefined}>
        {text}
      </span>
    </span>
  );
}
