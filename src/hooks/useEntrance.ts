import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePresentation } from './usePresentation';

/**
 * Staggered entrance for every `[data-in]` element inside the returned ref,
 * in DOM order. `extra` adds step-specific motion in the same GSAP context.
 */
/** Only the animated properties — inline custom properties like --accent must survive. */
const CLEAR = 'opacity,visibility,transform,filter';

export function useEntrance<T extends HTMLElement = HTMLDivElement>(
  extra?: (tl: gsap.core.Timeline, root: T, rm: boolean) => void,
  deps: unknown[] = [],
) {
  const ref = useRef<T>(null);
  const { reducedMotion: rm } = usePresentation();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const items = root.querySelectorAll('[data-in]');
      if (rm) tl.fromTo(items, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, stagger: 0.05, clearProps: CLEAR });
      else
        tl.fromTo(
          items,
          { autoAlpha: 0, y: 36, filter: 'blur(6px)' },
          // clearProps hands styling back to CSS (hover, selected and dimmed states).
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', stagger: 0.09, clearProps: CLEAR },
        );
      extra?.(tl, root, rm);
    }, root);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
