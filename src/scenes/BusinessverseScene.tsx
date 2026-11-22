import { useState, type CSSProperties } from 'react';
import { careerWorlds, universeCopy } from '../data/careerWorlds';
import { universeTiming, type SceneDef } from '../config/presentation.config';
import { useSceneTimeline } from '../hooks/useSceneTimeline';
import { SplitText, MaskedWord } from '../components/shared/AnimatedText';
import { HudFrame } from '../components/shared/HudFrame';
import { IMSLogo } from '../components/shared/IMSLogo';
import { UniverseView } from '../components/businessverse/UniverseView';
import { charsIn, sfx } from '../utils/motion';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * ACT 02 — Enter the Businessverse. Overview → five worlds → "One stream. A
 * thousand possibilities." The worlds wait for → unless universeTiming.autoAdvance
 * is on, in which case they advance on a timer shown as a thin line on each panel.
 * Focus: 0 overview, 1–5 worlds, 6 closing.
 */
export function BusinessverseScene(_props: { def: SceneDef }) {
  const [focus, setFocus] = useState(0);

  const { scope } = useSceneTimeline('businessverse', (tl, { reducedMotion: rm, autoplay, beats, background, onTime, hold }) => {
    const OV = universeTiming.overviewSec;
    const WS = universeTiming.worldSec;
    const auto = autoplay && universeTiming.autoAdvance;
    /** Presenter-led: stop here and wait for →. */
    const wait = (at: number) => {
      if (!auto) hold(at);
    };
    const root = scope.current!;
    const $ = (s: string) => root.querySelector(s)!;
    const $$ = (s: string) => root.querySelectorAll(s);
    const starts: number[] = [];
    const mark = (label: string, at: number) => {
      tl.addLabel(label, at);
      beats.push(label);
      starts.push(at);
    };
    onTime((time) => {
      let f = 0;
      starts.forEach((s, i) => {
        if (s <= time + 0.01) f = i;
      });
      setFocus((prev) => (prev === f ? prev : f));
    });

    background(0, 'nebula');
    tl.fromTo($('.hud'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 0.4);
    tl.fromTo($('.corner-brand'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 0.8);

    /* Overview */
    mark('overview', 0);
    tl.set($('.bv-overview'), { autoAlpha: 1 }, 0);
    tl.fromTo($('.bv-overview .hud-label'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.4);
    charsIn(tl, $('.bv-overview-title'), 1.6, rm, 0.03);
    tl.fromTo($('.universe'), { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0);
    wait(4);

    /* Worlds */
    const panels = $$('.world-panel');
    panels.forEach((panel, k) => {
      const t = OV + k * WS;
      mark(`world-${k + 1}`, t);
      if (k === 0) {
        tl.to($('.bv-overview'), { autoAlpha: 0, y: rm ? 0 : -20, duration: 0.5 }, t);
        tl.fromTo($('.bv-scrim'), { opacity: 0 }, { opacity: 1, duration: 1.4 }, t + 0.4);
      }
      else tl.to(panels[k - 1], { autoAlpha: 0, x: rm ? 0 : -40, duration: 0.5, ease: 'power2.in' }, t);
      sfx(tl, 'whoosh', t);
      tl.set(panel, { autoAlpha: 1, x: 0 }, t + 0.5);
      tl.fromTo(panel.querySelector('.wp-tag'), { autoAlpha: 0, x: rm ? 0 : 30 }, { autoAlpha: 1, x: 0, duration: 0.7 }, t + 0.7);
      panel.querySelectorAll('.wp-title .split').forEach((line, li) => charsIn(tl, line, t + 0.8 + li * 0.2, rm, 0.025));
      sfx(tl, 'impact', t + 0.9);
      tl.fromTo(panel.querySelector('.wp-quote'), { autoAlpha: 0, y: rm ? 0 : 16 }, { autoAlpha: 1, y: 0, duration: 0.8 }, t + 1.5);
      panel.querySelectorAll('.wp-career').forEach((row, ri) => {
        const at = t + 1.9 + ri * 0.18;
        tl.fromTo(row, { autoAlpha: 0, x: rm ? 0 : 40 }, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out' }, at);
        tl.fromTo(row.querySelector('.wp-career-line'), { scaleY: 0 }, { scaleY: 1, duration: 0.6 }, at + 0.1);
        sfx(tl, 'tick', at);
      });
      if (auto) tl.fromTo(panel.querySelector('.wp-timer-fill'), { scaleX: 0 }, { scaleX: 1, duration: WS - 0.8, ease: 'none' }, t + 0.6);
      wait(t + 3.4);
    });

    /* Closing */
    const tc = OV + panels.length * WS;
    mark('closing', tc);
    tl.to(panels[panels.length - 1], { autoAlpha: 0, x: rm ? 0 : -40, duration: 0.5, ease: 'power2.in' }, tc);
    sfx(tl, 'rise', tc);
    tl.to($('.bv-scrim'), { opacity: 0, duration: 1 }, tc);
    tl.set($('.bv-closing'), { autoAlpha: 1 }, tc + 0.8);
    tl.fromTo($('.bv-closing-scrim'), { opacity: 0 }, { opacity: 1, duration: 1.4 }, tc + 0.6);
    charsIn(tl, $('.bv-closing-1'), tc + 1, rm, 0.05);
    tl.fromTo($('.bv-closing .mask-inner'), { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: 'expo.out' }, tc + 1.8);
    sfx(tl, 'impact', tc + 1.9);
    sfx(tl, 'reveal', tc + 2);
    tl.to({}, { duration: 0.01 }, tc + 5);
  });

  return (
    <div ref={scope} className="scene">
      <UniverseView focus={focus} />

      <div className="bv-scrim" />

      <div className="bv-overview">
        <span className="hud-label text-ims">{universeCopy.overviewTag}</span>
        <SplitText text={universeCopy.overviewTitle} className="bv-overview-title persp" />
      </div>

      {careerWorlds.map((w, i) => (
        <div key={w.id} className="world-panel" style={{ '--accent': w.accent } as CSSProperties}>
          <div className="wp-tag">
            <span>WORLD {pad(i + 1)} / {pad(careerWorlds.length)}</span>
            <span className="wp-dot" />
            <span className="wp-domain">{w.domain}</span>
          </div>
          <h2 className="wp-title">
            <SplitText text={w.title[0]} className="persp" />
            <SplitText text={w.title[1]} className="persp wp-title-accent" />
          </h2>
          <span className="wp-timer" aria-hidden="true">
            <span className="wp-timer-fill" />
          </span>
          <p className="wp-quote">“{w.quote}”</p>
          <ul className="wp-careers">
            {w.careers.map((c) => (
              <li key={c.name} className="wp-career">
                <span className="wp-career-line" />
                <div>
                  <span className="wp-career-name">{c.name}</span>
                  <span className="wp-career-explain">{c.explain}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="bv-closing-scrim" />
      <div className="bv-closing">
        <SplitText text={universeCopy.closingLines[0]} className="bv-closing-1 persp" />
        <MaskedWord text={universeCopy.closingLines[1]} className="bv-closing-2 text-gradient-brand" />
      </div>

      <HudFrame left="THE BUSINESSVERSE · ACT 02" />
      <div className="corner-brand">
        <IMSLogo height={24} />
      </div>
    </div>
  );
}
