import type React from 'react';
import type {SceneProps} from './types';
import {Scene01Hook} from './Scene01Hook';
import {Scene02Exam} from './Scene02Exam';
import {Scene03Replay} from './Scene03Replay';
import {Scene04Blanks} from './Scene04Blanks';
import {Scene05Loop} from './Scene05Loop';
import {Scene06Body} from './Scene06Body';
import {Scene07Avoid} from './Scene07Avoid';
import {Scene08Turn} from './Scene08Turn';
import {Scene09Response} from './Scene09Response';
import {Scene10Ending} from './Scene10Ending';

/** Scene components in film order; configuration (durations, narration) lives in src/config. */
export const SCENE_COMPONENTS: React.FC<SceneProps>[] = [
  Scene01Hook,
  Scene02Exam,
  Scene03Replay,
  Scene04Blanks,
  Scene05Loop,
  Scene06Body,
  Scene07Avoid,
  Scene08Turn,
  Scene09Response,
  Scene10Ending,
];
