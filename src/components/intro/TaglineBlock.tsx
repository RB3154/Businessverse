import { introSequence } from '../../config/presentation.config';
import { MaskedWord, SplitText } from '../shared/AnimatedText';

/**
 * "YOUR STREAM IS NOT YOUR CEILING." — shared by the end of the Intro and the
 * start of the Portal scene, so the hand-off between them is seamless.
 */
export function TaglineBlock() {
  const { lead, emphasis } = introSequence.tagline;
  return (
    <div className="tagline-group absolute inset-x-0 flex flex-col items-center" style={{ top: 340 }}>
      <SplitText text={lead} className="tagline-lead persp" />
      <div className="tagline-emph-wrap">
        <MaskedWord text={emphasis} className="tagline-emph text-gradient-brand" glitch />
      </div>
      <div className="tagline-support">
        {introSequence.supporting.map((word, i) => (
          <span key={word} className="support-word">
            {i > 0 && <span className="support-sep" />}
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
