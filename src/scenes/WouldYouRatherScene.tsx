import { useContext, useEffect, useLayoutEffect, useState, type CSSProperties } from 'react';
import type { SceneDef } from '../config/presentation.config';
import { wouldYouRather as w, type WouldYouRather } from '../data/experience';
import { useEntrance } from '../hooks/useEntrance';
import { SceneLayerContext } from '../hooks/usePresentation';
import { useStepScene } from '../hooks/useStepScene';
import { backgroundStore } from '../utils/stores';
import { audioEngine } from '../utils/audioEngine';
import { StepStack } from '../components/shared/StepStack';

type Side = 'left' | 'right' | null;

function Intro() {
  const ref = useEntrance((tl, root, rm) => {
    if (!rm) tl.fromTo(root.querySelectorAll('.wyr-intro-half'), { xPercent: (i) => (i === 0 ? -100 : 100) }, { xPercent: 0, duration: 0.6, ease: 'expo.out' }, 0);
    tl.call(() => audioEngine.play('impact'), undefined, 0.3);
  });
  return (
    <div ref={ref} className="wyr-step wyr-intro">
      <span className="wyr-intro-half wyr-l" />
      <span className="wyr-intro-half wyr-r" />
      <div className="wyr-intro-copy">
        <span data-in className="wyr-pill">
          ACT 05
        </span>
        <h2 data-in className="wyr-title">
          {w.title}
        </h2>
        <p data-in className="wyr-sub">
          {w.subtitle}
        </p>
      </div>
    </div>
  );
}

/** One split-screen question. Click a side (or press 1 / 2) to record the room's winner. */
function Question({ q, index, side, result, onPick }: { q: WouldYouRather; index: number; side: Side; result: boolean; onPick: (s: Side) => void }) {
  const ref = useEntrance((tl, root, rm) => {
    if (!rm) tl.fromTo(root.querySelectorAll('.wyr-half'), { yPercent: (i) => (i === 0 ? -100 : 100) }, { yPercent: 0, duration: 0.55, ease: 'expo.out' }, 0);
    tl.fromTo(root.querySelector('.wyr-or'), { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2.5)' }, 0.4);
    tl.call(() => audioEngine.play('whoosh'), undefined, 0);
  });
  useEffect(() => {
    if (result) audioEngine.play(side ? 'confirm' : 'ding');
  }, [result, side]);

  return (
    <div
      ref={ref}
      className={`wyr-step wyr-q ${result ? 'is-result' : ''} ${side ? `picked-${side}` : ''}`}
      style={{ '--lc': q.leftColor, '--rc': q.rightColor } as CSSProperties}
    >
      {(['left', 'right'] as const).map((s) => (
        <button key={s} type="button" className={`wyr-half wyr-${s}`} onClick={() => onPick(side === s ? null : s)} aria-pressed={side === s}>
          <span className="wyr-key">{s === 'left' ? '1' : '2'}</span>
          <span className="wyr-option">{s === 'left' ? q.left : q.right}</span>
          <span className="wyr-insight">{s === 'left' ? q.leftInsight : q.rightInsight}</span>
          {side === s && <span className="wyr-winner">THE ROOM CHOSE THIS</span>}
        </button>
      ))}
      <span className="wyr-or">OR</span>
      <span className="wyr-count">
        {index + 1} / {w.questions.length}
      </span>
      <div className="wyr-takeaway">{q.takeaway}</div>
    </div>
  );
}

/** ACT 05 — Would You Rather? Split-screen hand votes, then the business thinking behind each side. */
export function WouldYouRatherScene(_props: { def: SceneDef }) {
  const total = 1 + w.questions.length * 2;
  const { step } = useStepScene(total);
  const { active } = useContext(SceneLayerContext);
  const [picks, setPicks] = useState<Side[]>(w.questions.map(() => null));
  useLayoutEffect(() => backgroundStore.set('void'), []);

  const qIndex = step === 0 ? -1 : Math.floor((step - 1) / 2);
  const result = step > 0 && (step - 1) % 2 === 1;

  const pick = (i: number, s: Side) => {
    setPicks((p) => p.map((x, k) => (k === i ? s : x)));
    if (s) audioEngine.play('tick');
  };

  useEffect(() => {
    if (!active || qIndex < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key !== '1' && e.key !== '2') return;
      e.preventDefault();
      const s: Side = e.key === '1' ? 'left' : 'right';
      setPicks((p) => p.map((x, k) => (k === qIndex ? (x === s ? null : s) : x)));
      audioEngine.play('tick');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, qIndex]);

  return (
    <div className="scene wyr-scene">
      <StepStack
        screen={qIndex < 0 ? 'intro' : `q-${qIndex}`}
        render={(screen) => {
          if (screen === 'intro') return <Intro />;
          const i = Number(screen.split('-')[1]);
          return <Question q={w.questions[i]} index={i} side={picks[i]} result={i === qIndex ? result : true} onPick={(s) => pick(i, s)} />;
        }}
      />
      <span className="wyr-brandmark">THE BUSINESSVERSE · ACT 05</span>
    </div>
  );
}
