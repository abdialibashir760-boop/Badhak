import type React from 'react';
import {DEFAULT_PROPS} from '../config/defaults';
import type {VideoProps} from '../config/types';
import {STONE_PROPS, STONE_PROPS_TR} from '../stone/config';
import {StoneVideo, StoneVideoTR} from '../stone/StoneVideo';
import {Video} from '../video/Video';

export type FilmEntry = {
  id: string;
  /** Remotion composition id used for rendering. */
  composition: string;
  title: string;
  component: React.FC<VideoProps>;
  defaults: VideoProps;
  /** npm script that renders the built-in defaults / a props file. */
  renderScript: string;
  renderPropsScript: string;
  propsFile: string;
};

export const FILMS: FilmEntry[] = [
  {
    id: 'zihni',
    composition: 'ZihniOyunu',
    title: 'Why Your Mind Turns Every Conversation Into a Test',
    component: Video,
    defaults: DEFAULT_PROPS,
    renderScript: 'npm run render',
    renderPropsScript: 'npm run render:props',
    propsFile: 'out/props.json',
  },
  {
    id: 'stone',
    composition: 'StoneAge',
    title: 'What If You Woke Up in the Stone Age?',
    component: StoneVideo,
    defaults: STONE_PROPS,
    renderScript: 'npm run render:stone',
    renderPropsScript: 'npm run render:stone:props',
    propsFile: 'out/stone-props.json',
  },
  {
    id: 'stone-tr',
    composition: 'StoneAgeTR',
    title: 'Taş Devrinde Uyansaydın Ne Olurdu? (Türkçe)',
    component: StoneVideoTR,
    defaults: STONE_PROPS_TR,
    renderScript: 'npm run render:stone-tr',
    renderPropsScript: 'npm run render:stone-tr:props',
    propsFile: 'out/stone-tr-props.json',
  },
];

export const currentFilm = (): FilmEntry => {
  const id = new URLSearchParams(window.location.search).get('film');
  return FILMS.find((f) => f.id === id) ?? FILMS[0];
};
