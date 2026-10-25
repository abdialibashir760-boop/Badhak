import type React from 'react';
import type {SceneProps} from '../../scenes/types';
import {S1Wake} from './S1Wake';
import {S2Wrong} from './S2Wrong';
import {S3Locals} from './S3Locals';
import {S4Food} from './S4Food';
import {S5Wolf} from './S5Wolf';
import {S6Learn} from './S6Learn';
import {S7Night} from './S7Night';

export const STONE_SCENE_COMPONENTS: React.FC<SceneProps>[] = [S1Wake, S2Wrong, S3Locals, S4Food, S5Wolf, S6Learn, S7Night];
