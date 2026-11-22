import { audioEngine, type Sfx } from './audioEngine';

type TL = gsap.core.Timeline;

const charsOf = (el: Element) => el.querySelectorAll('.char');

/** Characters rise into place from below with a 3D tilt and blur. */
export function charsIn(tl: TL, el: Element, at: number, rm: boolean, stagger = 0.045) {
  const chars = charsOf(el);
  if (rm) {
    tl.fromTo(chars, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'none' }, at);
    return;
  }
  tl.fromTo(
    chars,
    { yPercent: 115, opacity: 0, rotateX: -85, filter: 'blur(10px)' },
    { yPercent: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger },
    at,
  );
}

export function charsOut(tl: TL, el: Element, at: number, rm: boolean) {
  const chars = charsOf(el);
  if (rm) {
    tl.to(chars, { opacity: 0, duration: 0.4 }, at);
    return;
  }
  tl.to(
    chars,
    { yPercent: -100, opacity: 0, filter: 'blur(8px)', duration: 0.5, ease: 'power2.in', stagger: 0.018 },
    at,
  );
}

/** A brief RGB-split glitch on an element carrying the .glitch class. */
export function glitchPulse(tl: TL, el: Element, at: number, rm: boolean, sound = true) {
  if (rm) return;
  tl.call(() => el.classList.add('is-glitching'), undefined, at);
  if (sound) sfx(tl, 'glitch', at);
  tl.call(() => el.classList.remove('is-glitching'), undefined, at + 0.36);
}

export function sfx(tl: TL, name: Sfx, at: number) {
  tl.call(() => audioEngine.play(name), undefined, at);
}

/** Show an element instantly at a time (and keep it hidden before). */
export function show(tl: TL, el: Element | Element[] | NodeListOf<Element>, at: number) {
  tl.set(el, { autoAlpha: 1 }, at);
}

export function hide(tl: TL, el: Element | Element[] | NodeListOf<Element>, at: number) {
  tl.set(el, { autoAlpha: 0 }, at);
}
