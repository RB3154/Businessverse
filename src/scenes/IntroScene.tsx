import { useRef } from 'react';
import { introSequence as seq } from '../config/presentation.config';
import { useSceneTimeline } from '../hooks/useSceneTimeline';
import { MaskedWord, SplitText } from '../components/shared/AnimatedText';
import { HudFrame } from '../components/shared/HudFrame';
import { PresentedBy } from '../components/intro/PresentedBy';
import { TaglineBlock } from '../components/intro/TaglineBlock';
import { charsIn, charsOut, glitchPulse, hide, sfx, show } from '../utils/motion';
import type { SceneDef } from '../config/presentation.config';

const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};
/* Hand-placed slots (stage px, word centre) that frame the headline without touching it. */
const BURST_SLOTS: [number, number, number][] = [
  [420, 170, 28], [960, 150, 24], [1500, 170, 28],
  [600, 290, 22], [1340, 290, 24],
  [420, 800, 26], [960, 820, 22], [1500, 800, 28],
  [760, 915, 22], [1340, 915, 24],
];
const BURST = seq.burstWords.slice(0, BURST_SLOTS.length).map((word, i) => ({
  word,
  left: BURST_SLOTS[i][0],
  top: BURST_SLOTS[i][1],
  size: BURST_SLOTS[i][2],
  opacity: 0.22 + rand(i + 120) * 0.26,
}));
const SHARDS = Array.from({ length: 12 }, (_, i) => ({
  left: 960 + (rand(i + 200) - 0.5) * 900,
  dx: (rand(i + 240) - 0.5) * 900,
  dy: -120 - rand(i + 280) * 380,
  rot: (rand(i + 320) - 0.5) * 360,
  w: 18 + rand(i + 360) * 60,
}));

const pad = (n: number) => String(n).padStart(2, '0');

/** ACT 01 — The Reality Check: kinetic typography on a dark stage. */
export function IntroScene(_props: { def: SceneDef }) {
  const counterRef = useRef<HTMLSpanElement>(null);

  const { scope } = useSceneTimeline('intro', (tl, { reducedMotion: rm, autoplay, beats, background, hold }) => {
    const root = scope.current!;
    const $ = (s: string) => root.querySelector(s)!;
    const $$ = (s: string) => root.querySelectorAll(s);
    const counter = counterRef.current;

    const mark = (n: number, at: number) => {
      const label = `b${n}`;
      tl.addLabel(label, at);
      beats.push(label);
      if (counter) tl.set(counter, { textContent: `SEQ ${pad(n)} / 07` }, at);
    };
    const holdHere = (at: number) => {
      if (!autoplay) hold(at);
    };
    const spotPulse = (at: number) =>
      tl.fromTo($('.spot'), { opacity: 1, scale: 1.08 }, { opacity: 0.35, scale: 1, duration: 2, ease: 'power2.out' }, at);

    background(0, 'void');
    tl.set($$('.beat'), { autoAlpha: 0 }, 0);
    tl.fromTo($('.hud'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.4 }, 0.3);
    tl.fromTo($('.presented-by'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1.6, ease: 'power2.out' }, 0.9);
    if (!rm) tl.fromTo($('.camera'), { scale: 1 }, { scale: 1.06, duration: 50, ease: 'none' }, 0);

    /* 01 — CLASS 11. */
    let t = 1.8;
    const b1 = $('.b-class');
    mark(1, t);
    show(tl, b1, t);
    charsIn(tl, b1, t, rm, 0.07);
    sfx(tl, 'impact', t + 0.1);
    spotPulse(t);
    glitchPulse(tl, $('.b-class .glitch'), t + 1.6, rm);
    t += 1.1 + seq.classLine.hold;
    holdHere(t);
    charsOut(tl, b1, t, rm);
    hide(tl, b1, t + 0.8);

    /* 02 — COMMERCE. */
    t += 1.0;
    const b2 = $('.b-stream');
    const stream = $('.stream-word');
    mark(2, t);
    show(tl, b2, t);
    if (rm) tl.fromTo(stream, { opacity: 0 }, { opacity: 1, duration: 0.8 }, t);
    else
      tl.fromTo(
        stream,
        { letterSpacing: '0.55em', opacity: 0, scale: 1.12, filter: 'blur(16px)' },
        { letterSpacing: '-0.02em', opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.5, ease: 'expo.out' },
        t,
      );
    sfx(tl, 'impact', t + 0.15);
    spotPulse(t);
    tl.fromTo($('.b-stream .beat-tag'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8 }, t + 1.1);
    tl.fromTo($('.b-stream .tag-line'), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power3.out' }, t + 1.1);
    glitchPulse(tl, stream, t + 1.8, rm);
    t += 1.5 + seq.streamLine.hold;
    holdHere(t);
    glitchPulse(tl, stream, t, rm);
    if (!rm) tl.to(stream, { keyframes: [{ x: -26 }, { x: 18 }, { x: -8 }], duration: 0.2, ease: 'none' }, t);
    tl.to(b2, { autoAlpha: 0, duration: rm ? 0.4 : 0.15 }, t + 0.25);

    /* 03 — YOU HAVE A PLAN? (typed) */
    t += 0.8;
    const b3 = $('.b-plan');
    const planChars = b3.querySelectorAll('.char');
    mark(3, t);
    show(tl, b3, t);
    tl.fromTo(planChars, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: 0.08 }, t + 0.3);
    planChars.forEach((c, i) => {
      if (c.textContent?.trim()) sfx(tl, 'tick', t + 0.3 + i * 0.08);
    });
    t += 0.3 + planChars.length * 0.08 + seq.planLine.hold;
    holdHere(t);
    tl.to(b3, { autoAlpha: 0, y: rm ? 0 : -30, duration: 0.6, ease: 'power2.in' }, t);

    /* 04 — CA? B.COM? MBA? */
    t += 0.9;
    const b4 = $('.b-options');
    const opts = b4.querySelectorAll('.opt');
    mark(4, t);
    show(tl, b4, t);
    opts.forEach((opt, i) => {
      const at = t + i * 0.75;
      if (rm) tl.fromTo(opt, { opacity: 0 }, { opacity: 1, duration: 0.6 }, at);
      else
        tl.fromTo(
          opt,
          { y: 90, opacity: 0, filter: 'blur(12px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out' },
          at,
        );
      sfx(tl, 'impact', at + 0.05);
    });
    t += 0.75 * (opts.length - 1) + 0.9 + seq.options.hold;
    holdHere(t);

    /* 05 — OR MAYBE... (options step back, a pause hangs in the air) */
    const b5 = $('.b-maybe');
    mark(5, t);
    tl.to(
      opts,
      rm
        ? { opacity: 0.18, duration: 0.8 }
        : { y: -200, scale: 0.78, opacity: 0.16, filter: 'blur(3px)', duration: 1.3, ease: 'power3.inOut', stagger: 0.05 },
      t,
    );
    show(tl, b5, t + 0.4);
    tl.fromTo(
      $('.maybe-text'),
      { opacity: 0, y: rm ? 0 : 24, letterSpacing: rm ? '0.12em' : '0.32em' },
      { opacity: 1, y: 0, letterSpacing: '0.12em', duration: 1.4, ease: 'power3.out' },
      t + 0.5,
    );
    b5.querySelectorAll('.dot').forEach((dot, i) => {
      tl.fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.25 }, t + 1.6 + i * 0.5);
    });
    t += 1.6 + seq.maybeLine.hold;
    holdHere(t);
    tl.to([b4, b5], { autoAlpha: 0, duration: 0.8 }, t);

    /* 06 — YOUR OPTIONS ARE MUCH BIGGER. */
    sfx(tl, 'rise', t - 0.8);
    t += 1.2;
    const b6 = $('.b-bigger');
    const words = b6.querySelectorAll('.burst-word');
    mark(6, t);
    background(t, 'drift');
    show(tl, b6, t);
    charsIn(tl, $('.big-1'), t, rm, 0.035);
    charsIn(tl, $('.big-2'), t + 0.25, rm, 0.035);
    tl.fromTo($('.b-bigger .mask-inner'), { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'expo.out' }, t + 0.55);
    sfx(tl, 'impact', t + 0.6);
    spotPulse(t + 0.5);
    words.forEach((w, i) => {
      const b = BURST[i];
      tl.set(w, { xPercent: -50, yPercent: -50 }, 0);
      if (rm) tl.fromTo(w, { opacity: 0 }, { opacity: b.opacity, duration: 1 }, t + 0.6);
      else
        tl.fromTo(
          w,
          { x: 960 - b.left, y: 540 - b.top, scale: 0.3, opacity: 0 },
          { x: 0, y: 0, scale: 1, opacity: b.opacity, duration: 2.4, ease: 'expo.out', delay: i * 0.035 },
          t + 0.6,
        );
    });
    if (!rm) tl.fromTo($('.bigger-wrap'), { scale: 1 }, { scale: 1.14, duration: seq.biggerLine.hold + 1.2, ease: 'sine.inOut' }, t + 1.2);
    t += 1.7 + seq.biggerLine.hold;
    holdHere(t);
    if (rm) tl.to(b6, { autoAlpha: 0, duration: 0.6 }, t);
    else {
      tl.to($('.big-lines'), { scale: 1.6, opacity: 0, duration: 0.9, ease: 'power2.in' }, t);
      tl.to($('.burst'), { scale: 1.9, opacity: 0, duration: 1, ease: 'power2.in' }, t);
      hide(tl, b6, t + 1);
    }

    /* 07 — YOUR STREAM IS NOT YOUR CEILING. (the ceiling breaks) */
    t += 1.3;
    const b7 = $('.b-tagline');
    const group = $('.b-tagline .tagline-group');
    const barL = $('.bar-l');
    const barR = $('.bar-r');
    mark(7, t);
    show(tl, b7, t);
    tl.fromTo([barL, barR], { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power3.out' }, t);
    tl.fromTo($('.bar-label'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, t + 0.8);
    sfx(tl, 'tick', t);
    tl.fromTo(group, { y: rm ? 0 : 150 }, { y: rm ? 0 : 150, duration: 0.01 }, t);
    charsIn(tl, $('.b-tagline .tagline-lead'), t + 0.7, rm, 0.03);
    tl.fromTo($('.b-tagline .mask-inner'), { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'expo.out' }, t + 1.7);
    tl.set($$('.b-tagline .support-word'), { opacity: 0 }, t);
    const hit = t + 3.45;
    if (rm) {
      tl.to([barL, barR, $('.bar-label')], { autoAlpha: 0, duration: 0.8 }, hit);
    } else {
      sfx(tl, 'rise', t + 1.4);
      tl.to(group, { y: -40, duration: 0.55, ease: 'power3.in' }, hit - 0.55);
      tl.to(barL, { x: -780, y: -170, rotation: -14, opacity: 0, duration: 1.4, ease: 'power3.out' }, hit);
      tl.to(barR, { x: 780, y: -230, rotation: 16, opacity: 0, duration: 1.4, ease: 'power3.out' }, hit);
      tl.to($('.bar-label'), { autoAlpha: 0, duration: 0.2 }, hit);
      $$('.shard').forEach((s, i) => {
        const d = SHARDS[i];
        tl.fromTo(
          s,
          { autoAlpha: 1, x: 0, y: 0, rotation: 0 },
          { x: d.dx, y: d.dy, rotation: d.rot, autoAlpha: 0, duration: 1.3 + (i % 3) * 0.2, ease: 'power3.out' },
          hit,
        );
      });
      tl.fromTo($('.flash'), { opacity: 0 }, { keyframes: [{ opacity: 0.5, duration: 0.07 }, { opacity: 0, duration: 0.8 }] }, hit);
      tl.to(group, { y: 0, duration: 1, ease: 'back.out(2.2)' }, hit);
      sfx(tl, 'impact', hit);
      glitchPulse(tl, $('.b-tagline .tagline-emph'), hit + 0.05, rm, false);
      spotPulse(hit);
    }
    tl.fromTo(
      $$('.b-tagline .support-word'),
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.18, ease: 'power2.out' },
      hit + 1.1,
    );
    t = hit + 1.1 + seq.tagline.hold;
    tl.to({}, { duration: 0.01 }, t); // hold to the end
  });

  return (
    <div ref={scope} className="scene">
      <div className="spot" />
      <div className="camera absolute inset-0">
        <div className="beat b-class">
          <SplitText text={seq.classLine.text} className="kinetic-xl persp" glitch />
        </div>

        <div className="beat b-stream">
          <span className="stream-word kinetic-xl glitch" data-text={seq.streamLine.text}>
            {seq.streamLine.text}
          </span>
          <span className="beat-tag">
            <span className="tag-line" />
            STREAM SELECTED
          </span>
        </div>

        <div className="beat b-plan">
          <div className="flex items-center">
            <SplitText text={seq.planLine.text} className="kinetic-lg" />
            <span className="type-cursor anim-loop" />
          </div>
        </div>

        <div className="beat b-options">
          <div className="options-row">
            {seq.options.items.map((item, i) => (
              <div key={item} className="opt">
                <span className="opt-tag">OPTION {pad(i + 1)}</span>
                <span className="opt-word">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="beat b-maybe">
          <span className="maybe">
            <span className="maybe-text">{seq.maybeLine.text}</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </span>
        </div>

        <div className="beat b-bigger">
          <div className="burst">
            {BURST.map((b) => (
              <span key={b.word} className="burst-word" style={{ left: b.left, top: b.top, fontSize: b.size }}>
                {b.word}
              </span>
            ))}
          </div>
          <div className="big-lines flex flex-col items-center">
            <SplitText text={seq.biggerLine.lines[0]} className="big-1 kinetic-lg persp" />
            <div className="flex items-baseline gap-[0.28em] kinetic-lg">
              <SplitText text={seq.biggerLine.lines[1]} className="big-2 persp" />
              <span className="bigger-wrap inline-block origin-left">
                <MaskedWord text={seq.biggerLine.emphasis} className="text-gradient-brand" />
              </span>
            </div>
          </div>
        </div>

        <div className="beat b-tagline">
          <div className="ceiling" aria-hidden="true">
            <span className="bar-l" />
            <span className="bar-r" />
            <span className="bar-label">LIMIT</span>
            {SHARDS.map((s, i) => (
              <span key={i} className="shard" style={{ left: s.left, width: s.w }} />
            ))}
          </div>
          <TaglineBlock />
        </div>
      </div>
      <div className="flash" />
      <HudFrame left="THE BUSINESSVERSE · ACT 01" right="SEQ 00 / 07" ref={counterRef} />
      <PresentedBy />
    </div>
  );
}
