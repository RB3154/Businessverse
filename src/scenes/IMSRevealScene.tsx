import { branding } from '../config/branding.config';
import { revealSequence as seq, type SceneDef } from '../config/presentation.config';
import { useSceneTimeline } from '../hooks/useSceneTimeline';
import { SplitText } from '../components/shared/AnimatedText';
import { IMSLogo } from '../components/shared/IMSLogo';
import { NODE_X, PATH_Y } from '../components/pathway/pathLayout';
import { charsIn, sfx } from '../utils/motion';

/**
 * ACT 05 — The IMS Reveal. The pathway converges into one point of light,
 * which becomes the white plate the official logo sits on. Plays through on
 * its own and holds on the final screen until the presenter moves on.
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

    /* The pathway converges. */
    mark('converge', 0);
    tl.to($$('.rv-node'), { left: 960, top: 540, scale: 0.3, duration: rm ? 0.01 : 1.5, ease: 'power3.inOut', stagger: 0.04 }, 0.2);
    tl.to($('.rv-track'), { scaleX: 0, duration: rm ? 0.01 : 1.4, ease: 'power3.inOut' }, 0.2);
    tl.to($$('.rv-node'), { autoAlpha: 0, duration: 0.3 }, 1.6);
    tl.fromTo($('.rv-point'), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(3)' }, 1.5);
    sfx(tl, 'impact', 1.6);
    tl.to($('.rv-point'), { top: 330, duration: rm ? 0.01 : 1.4, ease: 'power3.inOut' }, 2.4);

    /* The future isn't something you wait for… */
    tl.set($('.rv-line-1'), { autoAlpha: 1 }, 2.9);
    charsIn(tl, $('.rv-line-1'), 3, rm, 0.025);
    mark('prepare', 6.4);
    tl.set($('.rv-line-2'), { autoAlpha: 1 }, 6.4);
    charsIn(tl, $('.rv-line-2'), 6.5, rm, 0.025);
    sfx(tl, 'impact', 6.7);

    /* The point of light becomes the logo plate. */
    const tLogo = 10.5;
    mark('logo', tLogo);
    tl.to($$('.rv-line-1, .rv-line-2'), { autoAlpha: 0, y: rm ? 0 : -30, duration: 0.6, ease: 'power2.in' }, tLogo);
    tl.to($('.rv-point'), { top: 470, duration: rm ? 0.01 : 0.9, ease: 'power2.inOut' }, tLogo + 0.2);
    sfx(tl, 'rise', tLogo);
    tl.to($('.rv-point'), { scale: 9, autoAlpha: 0, duration: rm ? 0.01 : 1, ease: 'power2.in' }, tLogo + 1);
    tl.fromTo($('.rv-flash'), { opacity: 0 }, { keyframes: rm ? [{ opacity: 0 }] : [{ opacity: 0.7, duration: 0.1 }, { opacity: 0, duration: 1.2 }] }, tLogo + 1.8);
    tl.fromTo(
      $('.rv-logo'),
      { autoAlpha: 0, scale: rm ? 1 : 0.2, filter: rm ? 'none' : 'blur(20px)' },
      { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'expo.out' },
      tLogo + 1.8,
    );
    tl.fromTo($$('.rv-halo'), { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 2, stagger: 0.2, ease: 'power2.out' }, tLogo + 1.9);
    sfx(tl, 'reveal', tLogo + 1.8);

    /* Explore. Learn. Prepare. Grow. */
    const tWords = tLogo + 4.5;
    mark('words', tWords);
    tl.fromTo($$('.rv-word'), { autoAlpha: 0, y: rm ? 0 : 24 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.55, ease: 'power3.out' }, tWords);
    $$('.rv-word').forEach((_, i) => sfx(tl, 'tick', tWords + i * 0.55));

    /* Final screen — holds until the presenter moves on. */
    const tFinal = tWords + 5;
    mark('final', tFinal);
    tl.to($('.rv-words'), { autoAlpha: 0, duration: 0.5 }, tFinal);
    tl.to($('.rv-logo-wrap'), { y: rm ? 0 : -150, scale: rm ? 1 : 0.72, duration: 1.2, ease: 'power3.inOut' }, tFinal + 0.2);
    tl.set($('.rv-journey'), { autoAlpha: 1 }, tFinal + 1);
    charsIn(tl, $('.rv-journey'), tFinal + 1.1, rm, 0.02);
    tl.fromTo($('.rv-presented'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8 }, tFinal + 2.4);
    const centreEl = root.querySelector('.rv-centre');
    if (centreEl) tl.fromTo(centreEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, tFinal + 2.8);
    tl.to({}, { duration: 0.01 }, tFinal + 3.5);
  });

  const centre = branding.vadodaraCentre;

  return (
    <div ref={scope} className="scene rv-scene">
      <span className="rv-track" style={{ top: PATH_Y - 2, left: NODE_X[0], width: NODE_X[4] - NODE_X[0] }} />
      {NODE_X.map((x) => (
        <span key={x} className="rv-node" style={{ left: x, top: PATH_Y }} />
      ))}
      <span className="rv-point" />

      <SplitText text={seq.lines[0]} className="rv-line rv-line-1 persp" />
      <SplitText text={seq.lines[1]} className="rv-line rv-line-2 persp" />

      <div className="rv-logo-wrap">
        <span className="rv-halo rv-halo-1" />
        <span className="rv-halo rv-halo-2" />
        <div className="rv-logo">
          <IMSLogo height={170} />
        </div>
      </div>

      <div className="rv-words">
        {seq.words.map((w) => (
          <span key={w} className="rv-word">
            {w}
          </span>
        ))}
      </div>

      <SplitText text={seq.journey} className="rv-journey persp" />
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
