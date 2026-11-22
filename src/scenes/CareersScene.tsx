import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { Lightbulb, LineChart, Megaphone, Search, Smartphone } from 'lucide-react';
import type { SceneDef } from '../config/presentation.config';
import { careerReveals, type CareerReveal, type RevealStyle } from '../data/experience';
import { usePresentation } from '../hooks/usePresentation';
import { useStepScene } from '../hooks/useStepScene';
import { backgroundStore } from '../utils/stores';
import { audioEngine } from '../utils/audioEngine';
import { StepStack } from '../components/shared/StepStack';

const ICONS: Record<RevealStyle, typeof Search> = {
  detective: Search,
  billboard: Megaphone,
  terminal: LineChart,
  wireframe: Smartphone,
  garage: Lightbulb,
};

const TAG: Record<RevealStyle, string> = {
  detective: 'CASE FILE',
  billboard: 'NOW SHOWING',
  terminal: '> MARKET OPEN',
  wireframe: 'NEW PROJECT',
  garage: 'DAY ONE',
};

/** One career: the scenario first, then (on →) the dramatic reveal. */
function Reveal({ c, index, revealed, last }: { c: CareerReveal; index: number; revealed: boolean; last: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion: rm } = usePresentation();
  const Icon = ICONS[c.style];

  // Scenario entrance (on mount).
  useLayoutEffect(() => {
    const root = ref.current!;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(root.querySelector('.cr-tag'), { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0);
      tl.fromTo(root.querySelectorAll('.cr-scenario-line'), rm ? { autoAlpha: 0 } : { autoAlpha: 0, y: 40, filter: 'blur(8px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.45, ease: 'power3.out' }, 0.15);
      tl.fromTo(root.querySelector('.cr-icon'), { autoAlpha: 0, scale: rm ? 1 : 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, 0.2);
      tl.fromTo(root.querySelector('.cr-prompt'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 1.4);
      tl.call(() => audioEngine.play('whoosh'), undefined, 0);
    }, root);
    return () => ctx.revert();
  }, [rm]);

  // The reveal.
  useLayoutEffect(() => {
    if (!revealed) return;
    const root = ref.current!;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.to(root.querySelector('.cr-prompt'), { autoAlpha: 0, duration: 0.2 }, 0);
      tl.fromTo(root.querySelector('.cr-role'), rm ? { autoAlpha: 0 } : { autoAlpha: 0, scale: 1.8, filter: 'blur(14px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.55, ease: 'expo.out' }, 0.1);
      tl.fromTo(root.querySelector('.cr-nick'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.5);
      tl.fromTo(root.querySelectorAll('.cr-explain-line'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.15 }, 0.7);
      if (root.querySelector('.cr-footnote')) tl.fromTo(root.querySelector('.cr-footnote'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 1.4);
      tl.call(() => audioEngine.play('ding'), undefined, 0.1);
    }, root);
    return () => ctx.revert();
  }, [revealed, rm]);

  return (
    <div ref={ref} className={`cr-step cr-${c.style} ${revealed ? 'is-revealed' : ''}`} style={{ '--accent': c.accent } as CSSProperties}>
      <div className="cr-bg" aria-hidden="true" />
      <span className="cr-count">
        {String(index + 1).padStart(2, '0')} / {String(careerReveals.reveals.length).padStart(2, '0')}
      </span>
      <span className="cr-tag">{TAG[c.style]}</span>
      <span className="cr-icon">
        <Icon size={120} strokeWidth={1.3} />
      </span>
      <div className="cr-scenario">
        {c.scenario.map((line) => (
          <span key={line} className="cr-scenario-line">
            {line}
          </span>
        ))}
      </div>
      <span className="cr-prompt">{careerReveals.prompt}</span>
      <div className="cr-answer">
        <span className="cr-nick">{c.nickname}</span>
        <span className="cr-role">{c.role}</span>
        <div className="cr-explain">
          {c.explain.map((line) => (
            <span key={line} className="cr-explain-line">
              {line}
            </span>
          ))}
        </div>
        {last && <p className="cr-footnote">{careerReveals.footnote}</p>}
      </div>
    </div>
  );
}

/** ACT 04 — The Career Reveal. Scenario → "Who do you call?" → reveal, five times. */
export function CareersScene(_props: { def: SceneDef }) {
  const list = careerReveals.reveals;
  const { step } = useStepScene(list.length * 2);
  const k = Math.floor(step / 2);
  const revealed = step % 2 === 1;
  useLayoutEffect(() => backgroundStore.set('void'), []);

  return (
    <div className="scene cr-scene">
      <StepStack
        screen={`career-${k}`}
        render={(screen) => {
          const idx = Number(screen.split('-')[1]);
          return <Reveal c={list[idx]} index={idx} revealed={idx === k ? revealed : true} last={idx === list.length - 1} />;
        }}
      />
      <span className="cr-brandmark">THE BUSINESSVERSE · ACT 04</span>
    </div>
  );
}
