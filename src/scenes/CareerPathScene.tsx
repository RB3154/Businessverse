import { Lock } from 'lucide-react';
import { branding } from '../config/branding.config';
import type { SceneDef } from '../config/presentation.config';
import { pathwayCopy, pathwayStages } from '../data/pathway';
import { useSceneTimeline } from '../hooks/useSceneTimeline';
import { SplitText } from '../components/shared/AnimatedText';
import { HudFrame } from '../components/shared/HudFrame';
import { IMSLogo } from '../components/shared/IMSLogo';
import { PathwayStage, STAGE_ICONS } from '../components/pathway/PathwayStage';
import { CURVE_D, NODE_X, PATH_Y, TRACK_D } from '../components/pathway/pathLayout';
import { charsIn, sfx } from '../utils/motion';

const BEAT = 4;

/**
 * ACT 04 — The Unlocked Path. The boardroom's growth line straightens into a
 * pathway; each Next unlocks a stage; the last beat introduces IMS at the
 * entrance-preparation stage.
 */
export function CareerPathScene(_props: { def: SceneDef }) {
  const { scope } = useSceneTimeline('pathway', (tl, { reducedMotion: rm, beats, background, hold }) => {
    const root = scope.current!;
    const $ = (s: string) => root.querySelector(s)!;
    const $$ = (s: string) => root.querySelectorAll(s);
    const mark = (label: string, at: number) => {
      tl.addLabel(label, at);
      beats.push(label);
    };

    background(0, 'drift');
    tl.fromTo($('.hud'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 0.3);

    /* Opening: the growth line draws, the question lands. */
    mark('question', 0);
    const morph = $('.pw-morph') as SVGPathElement;
    const len = morph.getTotalLength();
    tl.set(morph, { attr: { d: CURVE_D } }, 0);
    tl.fromTo(morph, { strokeDasharray: len * 1.2, strokeDashoffset: len * 1.2 }, { strokeDashoffset: 0, duration: rm ? 0.01 : 1.4, ease: 'power2.inOut' }, 0.2);
    tl.set($('.pw-question'), { autoAlpha: 1 }, 0.7);
    charsIn(tl, $('.pw-question'), 0.8, rm, 0.035);
    sfx(tl, 'impact', 0.9);
    hold(3);

    /* Stage 1: the line straightens into the pathway and the nodes appear. */
    const nodes = $$('.pw-node');
    const segs = $$('.pw-seg');
    const labels = $$('.pw-node-label');
    const panels = $$('.pw-panel-slot');
    const t1 = BEAT;
    mark('stage-1', t1);
    tl.to($('.pw-question'), { autoAlpha: 0, y: rm ? 0 : -30, duration: 0.5 }, t1);
    tl.to(morph, { attr: { d: TRACK_D }, duration: rm ? 0.01 : 1.1, ease: 'power3.inOut' }, t1 + 0.1);
    sfx(tl, 'whoosh', t1);
    tl.fromTo(nodes, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' }, t1 + 0.9);
    tl.fromTo(labels, { autoAlpha: 0 }, { autoAlpha: 0.45, duration: 0.6, stagger: 0.08 }, t1 + 1);

    pathwayStages.forEach((_, k) => {
      const t = k === 0 ? t1 + 1.3 : BEAT * (k + 1);
      if (k > 0) {
        mark(`stage-${k + 1}`, t);
        tl.to(panels[k - 1], { autoAlpha: 0, y: rm ? 0 : -24, duration: 0.45, ease: 'power2.in' }, t);
        tl.fromTo(segs[k - 1], { scaleX: 0 }, { scaleX: 1, duration: rm ? 0.01 : 0.8, ease: 'power2.inOut' }, t);
        sfx(tl, 'rise', t - 0.2);
      }
      const unlock = k === 0 ? t : t + 0.7;
      tl.set(nodes[k], { attr: { class: 'pw-node is-unlocked' } }, unlock);
      tl.fromTo(nodes[k].querySelector('.pw-node-pulse'), { scale: 0.6, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 1.1, ease: 'power2.out', immediateRender: false }, unlock);
      tl.to(labels[k], { autoAlpha: 1, duration: 0.4 }, unlock);
      sfx(tl, 'impact', unlock);
      tl.set(panels[k], { autoAlpha: 1, y: 0 }, unlock + 0.15);
      const items = panels[k].querySelectorAll('.pw-panel-visual, .pw-title, .pw-lead, .pw-line, .pw-chips-label, .pw-chip, .pw-note');
      tl.fromTo(
        items,
        rm ? { autoAlpha: 0 } : { autoAlpha: 0, y: 30, filter: 'blur(6px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', stagger: 0.07 },
        unlock + 0.2,
      );
      hold(unlock + 2.4);
    });

    /* IMS: the entrance-preparation stage lights up in IMS blue. */
    const ti = BEAT * (pathwayStages.length + 1);
    mark('ims', ti);
    tl.to(panels[panels.length - 1], { autoAlpha: 0, y: rm ? 0 : -24, duration: 0.45, ease: 'power2.in' }, ti);
    const imsNode = nodes[pathwayStages.findIndex((s) => s.imsStage)];
    tl.set(imsNode, { attr: { class: 'pw-node is-unlocked is-ims' } }, ti + 0.3);
    tl.fromTo(imsNode.querySelector('.pw-node-pulse'), { scale: 0.6, opacity: 1 }, { scale: 3.2, opacity: 0, duration: 1.4, ease: 'power2.out', immediateRender: false }, ti + 0.3);
    tl.fromTo($('.pw-ims-tag'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6 }, ti + 0.5);
    tl.fromTo($('.pw-ims-link'), { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: 'power2.out' }, ti + 0.6);
    tl.set($('.pw-ims'), { autoAlpha: 1 }, ti + 0.6);
    tl.fromTo(
      $$('.pw-ims-guidance, .pw-ims-card'),
      rm ? { autoAlpha: 0 } : { autoAlpha: 0, y: 30 },
      { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.25, ease: 'power3.out' },
      ti + 0.8,
    );
    tl.fromTo($$('.pw-ims-pillar'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 }, ti + 1.6);
    sfx(tl, 'reveal', ti + 0.8);
    tl.to({}, { duration: 0.01 }, ti + 3.5);
  });

  const imsIndex = pathwayStages.findIndex((s) => s.imsStage);

  return (
    <div ref={scope} className="scene pw-scene">
      <svg className="pw-svg" viewBox="0 0 1920 1080" aria-hidden="true">
        <defs>
          {/* userSpaceOnUse: a perfectly flat line has a zero-height bounding box, which would hide a bbox gradient. */}
          <linearGradient id="pw-grad" gradientUnits="userSpaceOnUse" x1="260" y1="0" x2="1660" y2="0">
            <stop offset="0" stopColor="#7657F6" />
            <stop offset="0.6" stopColor="var(--brand-ims-blue)" />
            <stop offset="1" stopColor="#22B9F2" />
          </linearGradient>
        </defs>
        <path className="pw-morph" d={CURVE_D} />
      </svg>

      {NODE_X.slice(1).map((x, i) => (
        <span key={x} className="pw-seg" style={{ left: NODE_X[i], width: x - NODE_X[i], top: PATH_Y - 2 }} />
      ))}

      {pathwayStages.map((s, i) => {
        const Icon = STAGE_ICONS[s.icon];
        return (
          <div key={s.short} className="pw-node-wrap" style={{ left: NODE_X[i], top: PATH_Y }}>
            <span className="pw-node">
              <span className="pw-node-pulse" />
              <span className="pw-node-lock">
                <Lock size={22} />
              </span>
              <span className="pw-node-icon">
                <Icon size={30} strokeWidth={1.8} />
              </span>
            </span>
            <span className="pw-node-label">{s.short}</span>
          </div>
        );
      })}

      <span className="pw-ims-tag" style={{ left: NODE_X[imsIndex], top: PATH_Y - 92 }}>
        {pathwayCopy.imsTag}
      </span>
      <span className="pw-ims-link" style={{ left: NODE_X[imsIndex], top: PATH_Y + 92 }} />

      <SplitText text={pathwayCopy.question} className="pw-question persp" />

      {pathwayStages.map((s, i) => (
        <div key={s.short} className="pw-panel-slot">
          <PathwayStage stage={s} index={i} />
        </div>
      ))}

      <div className="pw-ims">
        <p className="pw-ims-guidance">{pathwayCopy.guidance}</p>
        <div className="pw-ims-card">
          <IMSLogo height={84} />
          <div>
            <p className="pw-ims-desc">{branding.description}</p>
            <div className="pw-ims-pillars">
              {pathwayCopy.imsPillars.map((p) => (
                <span key={p} className="pw-ims-pillar">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <HudFrame left="THE BUSINESSVERSE · ACT 04" />
    </div>
  );
}
