import {useCallback, useEffect, useState} from 'react';
import {DEFAULT_PROPS} from '../config/defaults';
import type {SceneConfig, Settings, VideoProps} from '../config/types';

const KEY = 'zihni-oyunu-project-v1';

const load = (): VideoProps => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROPS;
    const p = JSON.parse(raw) as Partial<VideoProps>;
    if (!Array.isArray(p.scenes) || p.scenes.length !== DEFAULT_PROPS.scenes.length) return DEFAULT_PROPS;
    return {
      ...DEFAULT_PROPS,
      ...p,
      settings: {...DEFAULT_PROPS.settings, ...p.settings},
      scenes: DEFAULT_PROPS.scenes.map((d, i) => ({...d, ...p.scenes![i], id: d.id, title: d.title})),
    };
  } catch {
    return DEFAULT_PROPS;
  }
};

/** Project state (scene timing, narration, settings, audio) persisted in localStorage. */
export const useProject = () => {
  const [project, setProject] = useState<VideoProps>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(project));
    } catch {
      /* storage unavailable: the project simply isn't persisted */
    }
  }, [project]);

  const updateScene = useCallback((i: number, patch: Partial<SceneConfig>) => {
    setProject((p) => ({...p, scenes: p.scenes.map((s, j) => (j === i ? {...s, ...patch} : s))}));
  }, []);
  const setScenes = useCallback((scenes: SceneConfig[]) => setProject((p) => ({...p, scenes})), []);
  const updateSettings = useCallback((patch: Partial<Settings>) => setProject((p) => ({...p, settings: {...p.settings, ...patch}})), []);
  const patch = useCallback((patch: Partial<VideoProps>) => setProject((p) => ({...p, ...patch})), []);
  const reset = useCallback(() => setProject(DEFAULT_PROPS), []);

  return {project, updateScene, setScenes, updateSettings, patch, reset};
};

export const audioDuration = (url: string) =>
  new Promise<number>((ok, fail) => {
    const a = new Audio();
    a.preload = 'metadata';
    a.onloadedmetadata = () => (Number.isFinite(a.duration) ? ok(a.duration) : fail(new Error('Unknown duration')));
    a.onerror = () => fail(new Error('This audio file could not be decoded by the browser.'));
    a.src = url;
  });
