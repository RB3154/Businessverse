import { useRef } from 'react';
import { introSequence, portalSequence as seq, type SceneDef } from '../config/presentation.config';
import { useSceneTimeline } from '../hooks/useSceneTimeline';
import { SplitText } from '../components/shared/AnimatedText';
import { HudFrame } from '../components/shared/HudFrame';
import { PresentedBy } from '../components/intro/PresentedBy';
import { TaglineBlock } from '../components/intro/TaglineBlock';
import { charsIn, sfx } from '../utils/motion';

/** ACT 01 → 02 hand-off: a portal opens behind the tagline and the camera dives through it. */
export function PortalScene(_props: { def: SceneDef }) {
  const hudRef = useRef<HTMLSpanElement>(null);

  const { scope } = useSceneTimeline('portal', (tl, { reducedMotion: rm, autoplay, beats, background, hold }) => {
    const root = scope.current!;
    const $ = (s: string) => root.querySelector(s)!;
    const $$ = (s: string) => root.querySelectorAll(s);

    tl.addLabel('open', 0);
    beats.push('open');
    background(0, 'drift');

    // The tagline carried over from the Intro steps back as the portal ignites.
    tl.to($('.tagline-group'), { scale: rm ? 1 : 0.86, y: rm ? 0 : -24, opacity: 0, filter: rm ? 'none' : 'blur(10px)', duration: 1.4, ease: 'power2.in' }, 1.2);
    sfx(tl, 'rise', 1.3);
    tl.fromTo(
      $('.portal'),
      { scale: rm ? 1 : 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: rm ? 1.2 : 2.4, ease: 'expo.out' },
      1.7,
    );

    // "Loading" readout under the portal.
    const pct = $('.loading-pct');
    const counter = { v: 0 };
    tl.fromTo($('.portal-loading'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 3.3);
    tl.fromTo($('.loading-fill'), { scaleX: 0 }, { scaleX: 1, duration: 2.8, ease: 'power1.inOut' }, 3.5);
    tl.fromTo(
      counter,
      { v: 0 },
      {
        v: 100,
        duration: 2.8,
        ease: 'power1.inOut',
        onUpdate: () => {
          pct.textContent = `${Math.round(counter.v)}%`;
        },
      },
      3.5,
    );
    const dive = 6.6;
    if (!autoplay) hold(dive);
    sfx(tl, 'whoosh', dive - 0.8);
    tl.to([$('.portal-loading'), $('.presented-by')], { autoAlpha: 0, duration: 0.4 }, dive - 0.2);
    background(dive, 'warp');
    tl.to($('.portal'), rm ? { opacity: 0, duration: 1 } : { scale: 9, opacity: 0, duration: 1.7, ease: 'power3.in' }, dive);

    // Arrival.
    const arrive = dive + 1.6;
    if (!rm)
      tl.fromTo($('.flash'), { opacity: 0 }, { keyframes: [{ opacity: 0.6, duration: 0.08 }, { opacity: 0, duration: 1 }] }, arrive - 0.1);
    sfx(tl, 'impact', arrive);
    sfx(tl, 'reveal', arrive + 0.2);
    tl.addLabel('welcome', arrive);
    beats.push('welcome');
    background(arrive + 0.3, 'nebula');
    if (hudRef.current) tl.set(hudRef.current, { textContent: 'SECTOR // BUSINESSVERSE' }, arrive);
    tl.fromTo($('.floor-wrap'), { autoAlpha: 0, y: rm ? 0 : 80 }, { autoAlpha: 1, y: 0, duration: 2.4, ease: 'power3.out' }, arrive);
    tl.fromTo($('.horizon'), { scaleX: 0.3 }, { scaleX: 1, duration: 2.2, ease: 'power3.out' }, arrive);
    tl.set($('.welcome'), { autoAlpha: 1 }, arrive);
    charsIn(tl, $('.welcome-lead'), arrive + 0.2, rm, 0.03);
    const titleChars = $$('.welcome-title .char');
    if (rm) tl.fromTo(titleChars, { opacity: 0 }, { opacity: 1, duration: 0.8 }, arrive + 0.6);
    else
      tl.fromTo(
        titleChars,
        { opacity: 0, scale: 2.2, filter: 'blur(24px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'expo.out', stagger: 0.05 },
        arrive + 0.6,
      );
    tl.fromTo(
      $$('.welcome .support-word'),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out' },
      arrive + 2.2,
    );
    tl.to({}, { duration: 0.01 }, arrive + 3 + seq.welcomeHold);
  });

  return (
    <div ref={scope} className="scene">
      <div className="floor-wrap">
        <div className="horizon" />
        <div className="grid-floor">
          <div className="grid-plane anim-loop" />
        </div>
      </div>

      <div className="portal-wrap">
        <div className="portal">
          <div className="portal-glow" />
          <div className="portal-ring r1 anim-loop" />
          <div className="portal-ring r2 anim-loop" />
          <div className="portal-dash anim-loop" />
          <div className="portal-ring r3 anim-loop" />
          <div className="portal-core" />
        </div>
      </div>

      <div className="portal-loading">
        <span className="hud-label">{seq.loadingLabel}</span>
        <span className="loading-track">
          <span className="loading-fill" />
        </span>
        <span className="hud-label loading-pct tabular-nums">0%</span>
      </div>

      <div className="b-tagline-static">
        <TaglineBlock />
      </div>

      <div className="welcome">
        <SplitText text={seq.welcomeLead} className="welcome-lead persp" />
        <SplitText text={seq.welcomeTitle} className="welcome-title" />
        <div className="tagline-support mt-12">
          {introSequence.supporting.map((word, i) => (
            <span key={word} className="support-word">
              {i > 0 && <span className="support-sep" />}
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="flash" />
      <HudFrame left="THE BUSINESSVERSE · ACT 01" right="SEQ 07 / 07" ref={hudRef} />
      <PresentedBy />
    </div>
  );
}
