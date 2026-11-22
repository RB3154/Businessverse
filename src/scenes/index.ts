import type { ComponentType } from 'react';
import type { SceneDef, SceneId } from '../config/presentation.config';
import { IntroScene } from './IntroScene';
import { GuessScene } from './GuessScene';
import { CeoScene } from './CeoScene';
import { CareersScene } from './CareersScene';
import { WouldYouRatherScene } from './WouldYouRatherScene';
import { CareerPathScene } from './CareerPathScene';
import { IMSRevealScene } from './IMSRevealScene';

export type SceneComponent = ComponentType<{ def: SceneDef }>;

/** Maps each scene id in presentation.config to its component. */
export const sceneComponents: Record<SceneId, SceneComponent> = {
  intro: IntroScene,
  guess: GuessScene,
  ceo: CeoScene,
  careers: CareersScene,
  wyr: WouldYouRatherScene,
  pathway: CareerPathScene,
  reveal: IMSRevealScene,
};
