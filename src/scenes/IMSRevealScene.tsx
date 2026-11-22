import { branding } from '../config/branding.config';
import { revealSequence as seq, type SceneDef } from '../config/presentation.config';
import { useSceneTimeline } from '../hooks/useSceneTimeline';
import { SplitText } from '../components/shared/AnimatedText';
import { IMSLogo } from '../components/shared/IMSLogo';
import { NODE_X, PATH_Y } from '../components/pathway/pathLayout';
import { charsIn, sfx } from '../utils/motion';

/**
 * ACT 06 finale. The pathway converges into a point of light, the three
 * closing lines land, and the official IMS logo is revealed. Plays by itself
 * and holds on the final screen until the presenter moves on.
 */
export function IMSRevealScene(_props: { def: SceneDef }) {
  const { scope } = useSceneTimeline('reveal', (tl, { reducedMotion: rm, beats, background }) => {
    const root = scope.current!;
    const $ = (s: string) => root.querySelector(s)!;
    const $$ = (s: string) => root.querySelectorAll(s);
    const mark = (label: string, at: number) => {
      tl.addLabel(label, at);
      beats.push(label);
    };

    background(0, 'void');

    /* The pathway converges into one point of light. */
    mark('converge', 0);
    tl.to($$('.rv-node'), { left: 960, top: 540, scale: 0.3, duration: rm ? 0.01 : 1.3, ease: 'power3.inOut', stagger: 0.03 }, 0.15);
    tl.to($('.rv-track'), { scaleX: 0, duration: rm ? 0.01 : 1.2, ease: 'power3.inOut' }, 0.15);
    tl.to($$('.rv-node'), { autoAlpha: 0, duration: 0.25 }, 1.35);
    tl.fromTo($('.rv-point'), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(3)' }, 1.3);
    sfx(tl, 'impact', 1.35);
    tl.to($('.rv-point'), { top: 250, duration: rm ? 0.01 : 1, ease: 'power3.inOut' }, 1.9);

    /* The three closing lines. */
    const lines = $$('.rv-close');
    const starts = [2.4, 4.6, 6.8];
    lines.forEach((line, i) => {
      if (i === 1) mark('lines', starts[i]);
      tl.set(line, { autoAlpha: 1 }, starts[i]);
      charsIn(tl, line, starts[i], rm, 0.02);
      sfx(tl, 'impact', starts[i] + 0.2);
    });

    /* The point of light becomes the logo plate. */
    const tLogo = 10.2;
    mark('logo', tLogo);
    tl.to($('.rv-closing'), { y: rm ? 0 : 150, scale: rm ? 1 : 0.72, autoAlpha: 0.85, duration: 1, ease: 'power3.inOut' }, tLogo);
    tl.to($('.rv-point'), { top: 330, scale: 7, autoAlpha: 0, duration: rm ? 0.01 : 0.9, ease: 'power2.in' }, tLogo);
    tl.fromTo($('.rv-flash'), { opacity: 0 }, { keyframes: rm ? [{ opacity: 0 }] : [{ opacity: 0.6, duration: 0.1 }, { opacity: 0, duration: 1.1 }] }, tLogo + 0.8);
    tl.fromTo(
      $('.rv-logo'),
      { autoAlpha: 0, scale: rm ? 1 : 0.2, filter: rm ? 'none' : 'blur(20px)' },
      { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1.3, ease: 'expo.out' },
      tLogo + 0.8,
    );
    tl.fromTo($$('.rv-halo'), { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.8, stagger: 0.2, ease: 'power2.out' }, tLogo + 0.9);
    sfx(tl, 'reveal', tLogo + 0.8);

    /* Final screen — holds until the presenter moves on. */
    mark('final', tLogo + 2.4);
    tl.fromTo($('.rv-presented'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8 }, tLogo + 2.4);
    const centreEl = root.querySelector('.rv-centre');
    if (centreEl) tl.fromTo(centreEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, tLogo + 2.8);
    tl.to({}, { duration: 0.01 }, tLogo + 3.5);
  });

  const centre = branding.vadodaraCentre;

  return (
    <div ref={scope} className="scene rv-scene">
      <span className="rv-track" style={{ top: PATH_Y - 2, left: NODE_X[0], width: NODE_X[NODE_X.length - 1] - NODE_X[0] }} />
      {NODE_X.map((x) => (
        <span key={x} className="rv-node" style={{ left: x, top: PATH_Y }} />
      ))}
      <span className="rv-point" />

      <div className="rv-closing">
        {seq.lines.map((line, i) => (
          <SplitText key={line} text={line} className={`rv-close rv-close-${i} persp`} />
        ))}
      </div>

      <div className="rv-logo-wrap">
        <span className="rv-halo rv-halo-1" />
        <span className="rv-halo rv-halo-2" />
        <div className="rv-logo">
          <IMSLogo height={150} />
        </div>
      </div>

      <span className="rv-presented">{seq.presentedBy}</span>
      {centre.show && (
        <span className="rv-centre">
          {centre.name} · {centre.address}
        </span>
      )}

      <div className="rv-flash" />
    </div>
  );
}
