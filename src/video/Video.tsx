import React, {useEffect, useMemo, useState} from 'react';
import {Audio, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-ext-400.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-ext-500.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-ext-600.css';
import '@fontsource/cormorant-garamond/latin-700.css';
import '@fontsource/cormorant-garamond/latin-ext-700.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/cormorant-garamond/latin-ext-500-italic.css';
import '@fontsource/cormorant-garamond/latin-600-italic.css';
import '@fontsource/cormorant-garamond/latin-ext-600-italic.css';
import '@fontsource/cormorant-garamond/latin-700-italic.css';
import '@fontsource/cormorant-garamond/latin-ext-700-italic.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-ext-500.css';
import {HEIGHT, VideoProps, WIDTH} from '../config/types';
import {buildSfx} from '../config/sfx';
import {buildTiming, sceneFrames, sceneStarts, totalFrames} from '../lib/timing';
import {FxContext} from '../components/Stage';
import {Grain, Subtitles} from '../components/Overlays';
import {Transition} from '../components/Transitions';
import {easeIn, easeOut, seg} from '../lib/anim';
import {SCENE_COMPONENTS} from '../scenes';
import {BOUNDARIES} from './transitions';

const FONT_FACES = [
  '500 40px "Cormorant Garamond"',
  '600 40px "Cormorant Garamond"',
  '700 40px "Cormorant Garamond"',
  'italic 500 40px "Cormorant Garamond"',
  'italic 600 40px "Cormorant Garamond"',
  'italic 700 40px "Cormorant Garamond"',
  '500 20px "Inter"',
];

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const sample = 'ZİHNİ OYUNU İş çğöşü';
    Promise.all(FONT_FACES.map((f) => document.fonts.load(f, sample)))
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);
};

/** Resolve a user-supplied audio path: absolute/blob URLs pass through, others live under /public. */
export const resolveSrc = (src: string) => (/^(https?:|blob:|data:|\/)/.test(src) ? src : staticFile(src));

const SceneShell: React.FC<{index: number; props: VideoProps}> = ({index, props}) => {
  const frame = useCurrentFrame();
  const scene = props.scenes[index];
  const dur = sceneFrames(scene);
  const tm = useMemo(() => buildTiming(scene), [scene]);
  const Comp = SCENE_COMPONENTS[index];
  const { settings } = props;

  const exitSpec = BOUNDARIES[index];
  const enterSpec = index > 0 ? BOUNDARIES[index - 1] : {kind: 'pulse' as const, frames: 24};
  const eFrames = exitSpec?.frames ?? 36;
  const exitAmt = exitSpec
    ? seg(frame, dur - eFrames, dur - 1, easeIn)
    : seg(frame, dur - 40, dur - 2, easeIn); // final fade to black
  const enterAmt = 1 - seg(frame, 0, enterSpec.frames ?? 16, easeOut);

  return (
    <div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
      {Comp ? <Comp frame={frame} dur={dur} p={frame / dur} tm={tm} /> : null}
      {settings.subtitles ? <Subtitles cues={tm.cues} frame={frame} /> : null}
      {exitAmt > 0 && exitSpec ? <Transition spec={exitSpec} amount={exitAmt} frame={frame} /> : null}
      {exitAmt > 0 && !exitSpec ? <div style={{position: 'absolute', inset: 0, background: '#000', opacity: exitAmt}} /> : null}
      {enterAmt > 0 ? <Transition spec={enterSpec} amount={enterAmt} frame={frame} /> : null}
    </div>
  );
};

export const Video: React.FC<VideoProps> = (props) => {
  useFonts();
  const frame = useCurrentFrame();
  const {scenes, settings} = props;
  const starts = useMemo(() => sceneStarts(scenes), [scenes]);
  const total = totalFrames(scenes);
  const sfx = useMemo(() => buildSfx(scenes), [scenes]);

  const musicVol = (f: number) =>
    settings.musicVolume * interpolate(f, [0, 60, total - 90, total], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <FxContext.Provider value={{effects: settings.effects}}>
      <div style={{position: 'absolute', inset: 0, background: '#000', width: WIDTH, height: HEIGHT, overflow: 'hidden'}}>
        {scenes.map((s, i) => (
          <Sequence key={s.id} from={starts[i]} durationInFrames={sceneFrames(s)} layout="none">
            <SceneShell index={i} props={props} />
          </Sequence>
        ))}
        {settings.grain ? <Grain frame={frame} /> : null}

        {settings.music ? <Audio src={props.musicSrc ? resolveSrc(props.musicSrc) : staticFile('audio/ambient.wav')} loop volume={musicVol} /> : null}
        {settings.sfx
          ? sfx.map((c, i) => (
              <Sequence key={i} from={Math.max(0, c.from)} durationInFrames={c.durationInFrames} layout="none">
                <Audio src={staticFile(`audio/${c.file}`)} volume={c.volume * settings.sfxVolume} />
              </Sequence>
            ))
          : null}
        {props.narrationSrc ? (
          <Sequence from={Math.max(0, Math.round(props.narrationOffsetSec * 30))} layout="none">
            <Audio src={resolveSrc(props.narrationSrc)} volume={settings.narrationVolume} />
          </Sequence>
        ) : null}
      </div>
    </FxContext.Provider>
  );
};
