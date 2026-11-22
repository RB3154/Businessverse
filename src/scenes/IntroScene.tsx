import { useRef } from 'react';
import { ShoppingBag } from 'lucide-react';
import { introSequence as seq, type SceneDef } from '../config/presentation.config';
import { useSceneTimeline } from '../hooks/useSceneTimeline';
import { SplitText } from '../components/shared/AnimatedText';
import { HudFrame } from '../components/shared/HudFrame';
import { PresentedBy } from '../components/intro/PresentedBy';
import { charsIn, glitchPulse, hide, sfx, show } from '../utils/motion';

const pad = (n: number) => String(n).padStart(2, '0');

/* The "business machine" around a food order: parts placed on a ring. */
const PARTS = seq.machineParts.map((name, i, all) => {
  const a = (i / all.length) * Math.PI * 2 - Math.PI / 2;
  return { name, x: Math.cos(a) * 520, y: Math.sin(a) * 195 };
});

/**
 * ACT 01 — The Reality Check. High-contrast editorial typography on black:
 * a hook in the first second, the usual answers, a red interruption, then
 * the surprise that sets up the game. Plays by itself (~30 s).
 */
export function IntroScene(_props: { def: SceneDef }) {
  const counterRef = useRef<HTMLSpanElement>(null);

  const { scope } = useSceneTimeline('intro', (tl, { reducedMotion: rm, autoplay, beats, background, hold }) => {
    const root = scope.current!;
    const $ = (s: string) => root.querySelector(s)!;
    const $$ = (s: string) => root.querySelectorAll(s);
    const counter = counterRef.current;
    let n = 0;
    const mark = (at: number) => {
      n += 1;
      const label = `b${n}`;
      tl.addLabel(label, at);
      beats.push(label);
      if (counter) tl.set(counter, { textContent: `${pad(n)} / 09` }, at);
    };
    const holdHere = (at: number) => {
      if (!autoplay) hold(at);
    };
    const slam = (el: Element, at: number) =>
      rm
        ? tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, at)
        : tl.fromTo(el, { autoAlpha: 0, scale: 1.6, filter: 'blur(10px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.45, ease: 'expo.out' }, at);
    const out = (els: Element | Element[] | NodeListOf<Element>, at: number) =>
      tl.to(els, { autoAlpha: 0, y: rm ? 0 : -30, duration: 0.3, ease: 'power2.in' }, at);

    background(0, 'void');
    tl.set($$('.ix-beat'), { autoAlpha: 0 }, 0);
    tl.fromTo($('.hud'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 0.2);
    tl.fromTo($('.presented-by'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 0.6);

    /* 1 — BE HONEST. */
    let t = 0.3;
    mark(t);
    show(tl, $('.ix-hook'), t);
    slam($('.ix-hook .ix-huge'), t);
    sfx(tl, 'impact', t);
    t += 1.6;
    holdHere(t);
    out($('.ix-hook'), t);

    /* 2 — WHEN SOMEONE SAYS COMMERCE... */
    t += 0.35;
    mark(t);
    show(tl, $('.ix-setup'), t);
    charsIn(tl, $('.ix-setup-lead'), t, rm, 0.02);
    slam($('.ix-setup-word'), t + 0.55);
    sfx(tl, 'impact', t + 0.55);
    t += 2.3;

    /* 3 — WHAT COMES TO MIND? (pause for the room) */
    mark(t);
    tl.to($('.ix-setup-word'), { autoAlpha: 0, duration: 0.2 }, t);
    show(tl, $('.ix-ask'), t);
    slam($('.ix-ask .ix-big'), t + 0.1);
    sfx(tl, 'tick', t + 0.1);
    t += 0.5 + seq.askPause;
    holdHere(t);
    out([$('.ix-setup'), $('.ix-ask')], t);

    /* 4 — CA. B.COM. ACCOUNTING. MBA. */
    t += 0.35;
    mark(t);
    show(tl, $('.ix-usual'), t);
    $$('.ix-usual-item').forEach((item, i) => {
      slam(item, t + i * 0.42);
      sfx(tl, 'impact', t + i * 0.42);
    });
    t += 0.42 * seq.usual.length + 0.9;
    holdHere(t);

    /* 5 — WAIT. (strike-through, red interruption, record scratch) */
    mark(t);
    tl.fromTo($$('.ix-strike'), { scaleX: 0 }, { scaleX: 1, duration: 0.22, stagger: 0.05, ease: 'power2.out' }, t);
    sfx(tl, 'scratch', t);
    show(tl, $('.ix-wait'), t + 0.3);
    tl.fromTo($('.ix-wait'), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: rm ? 0.01 : 0.18, ease: 'power3.out' }, t + 0.3);
    slam($('.ix-wait .ix-huge'), t + 0.38);
    glitchPulse(tl, $('.ix-wait .ix-huge'), t + 0.7, rm, false);
    hide(tl, $('.ix-usual'), t + 0.5);
    t += 1.8;
    holdHere(t);
    tl.to($('.ix-wait'), { clipPath: 'inset(100% 0 0 0)', duration: rm ? 0.01 : 0.35, ease: 'power3.in' }, t);
    hide(tl, $('.ix-wait'), t + 0.36);

    /* 6 — THAT'S NOT EVEN CLOSE TO THE WHOLE STORY. */
    t += 0.4;
    mark(t);
    show(tl, $('.ix-notclose'), t);
    $$('.ix-notclose .split').forEach((line, i) => charsIn(tl, line, t + i * 0.25, rm, 0.018));
    t += 2.4;
    holdHere(t);
    out($('.ix-notclose'), t);

    /* 7 — EVERY TIME YOU ORDER FOOD... */
    t += 0.35;
    mark(t);
    show(tl, $('.ix-order'), t);
    charsIn(tl, $('.ix-order-line'), t, rm, 0.022);
    tl.fromTo($('.ix-bag'), { autoAlpha: 0, scale: rm ? 1 : 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, t + 0.7);
    sfx(tl, 'pop', t + 0.7);
    t += 2.2;

    /* 8 — THE BUSINESS MACHINE behind the order */
    mark(t);
    tl.to($('.ix-order-line'), { y: rm ? 0 : -150, scale: 0.6, duration: 0.6, ease: 'power3.inOut' }, t);
    tl.to($('.ix-bag'), { scale: 0.75, duration: 0.6 }, t);
    tl.fromTo($$('.ix-wire'), { scaleX: 0 }, { scaleX: 1, duration: 0.4, stagger: 0.07, ease: 'power2.out' }, t + 0.4);
    $$('.ix-part').forEach((part, i) => {
      tl.fromTo(part, { autoAlpha: 0, scale: rm ? 1 : 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2.2)' }, t + 0.5 + i * 0.12);
      sfx(tl, 'tick', t + 0.5 + i * 0.12);
    });
    show(tl, $('.ix-machine-text'), t + 1.3);
    $$('.ix-machine-text .split').forEach((line, i) => charsIn(tl, line, t + 1.3 + i * 0.25, rm, 0.014));
    t += 4.6;
    holdHere(t);
    out($('.ix-order'), t);

    /* 9 — LET'S SEE HOW MUCH YOU ACTUALLY KNOW. */
    t += 0.4;
    mark(t);
    show(tl, $('.ix-challenge'), t);
    charsIn(tl, $('.ix-challenge-1'), t, rm, 0.015);
    slam($('.ix-challenge-2'), t + 0.8);
    sfx(tl, 'rise', t);
    sfx(tl, 'impact', t + 0.85);
    t += 3.4;
    tl.to({}, { duration: 0.01 }, t);
  });

  return (
    <div ref={scope} className="scene ix-scene">
      <div className="ix-beat ix-hook">
        <span className="ix-huge">{seq.hook}</span>
      </div>

      <div className="ix-beat ix-setup">
        <SplitText text={seq.setupLead} className="ix-setup-lead persp" />
        <span className="ix-setup-word ix-huge">{seq.setupWord}</span>
      </div>

      <div className="ix-beat ix-ask">
        <span className="ix-big">{seq.ask}</span>
      </div>

      <div className="ix-beat ix-usual">
        {seq.usual.map((u) => (
          <span key={u} className="ix-usual-item">
            {u}
            <span className="ix-strike" />
          </span>
        ))}
      </div>

      <div className="ix-beat ix-wait">
        <span className="ix-huge glitch" data-text={seq.interrupt}>
          {seq.interrupt}
        </span>
      </div>

      <div className="ix-beat ix-notclose">
        {seq.notClose.map((line) => (
          <SplitText key={line} text={line} className="ix-line persp" />
        ))}
      </div>

      <div className="ix-beat ix-order">
        <SplitText text={seq.orderLine} className="ix-order-line persp" />
        <div className="ix-machine">
          {PARTS.map((p) => (
            <span
              key={p.name}
              className="ix-wire"
              style={{ width: Math.hypot(p.x, p.y) - 70, transform: `rotate(${Math.atan2(p.y, p.x)}rad)` }}
            />
          ))}
          <span className="ix-bag">
            <ShoppingBag size={86} strokeWidth={1.6} />
            <span className="ix-bag-price">₹199</span>
          </span>
          {PARTS.map((p) => (
            <span key={p.name} className="ix-part" style={{ left: p.x, top: p.y }}>
              {p.name}
            </span>
          ))}
        </div>
        <div className="ix-machine-text">
          {seq.machineLine.map((line) => (
            <SplitText key={line} text={line} className="ix-line-sm persp" />
          ))}
        </div>
      </div>

      <div className="ix-beat ix-challenge">
        <SplitText text={seq.challenge[0]} className="ix-challenge-1 persp" />
        <span className="ix-challenge-2">{seq.challenge[1]}</span>
      </div>

      <HudFrame left="THE BUSINESSVERSE · ACT 01" right="01 / 09" ref={counterRef} />
      <PresentedBy />
    </div>
  );
}
