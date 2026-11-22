import type { ComponentType } from 'react';
import type { SceneDef, SceneId } from '../config/presentation.config';
import { IntroScene } from './IntroScene';
import { PortalScene } from './PortalScene';
import { BusinessverseScene } from './BusinessverseScene';
import { BoardroomScene } from './BoardroomScene';
import { CareerPathScene } from './CareerPathScene';
import { IMSRevealScene } from './IMSRevealScene';

export type SceneComponent = ComponentType<{ def: SceneDef }>;

/** Maps each scene id in presentation.config to its component. */
export const sceneComponents: Record<SceneId, SceneComponent> = {
  intro: IntroScene,
  portal: PortalScene,
  businessverse: BusinessverseScene,
  boardroom: BoardroomScene,
  pathway: CareerPathScene,
  reveal: IMSRevealScene,
};
