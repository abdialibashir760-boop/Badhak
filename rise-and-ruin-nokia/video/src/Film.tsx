import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, FPS, sans, serif} from './theme';
import {Black, Chip, SceneProps, eo, win} from './ui';
import shots from './shots.json';
import labels from './labels.json';
import times from './audio-times.json';
import credits from '../public/img/credits.json';
import * as A from './scenes1';
import * as B from './scenes2';
import * as D from './scenes3';

export const VO_END = times.total;
export const OUTRO = 9;
export const TOTAL_FRAMES = Math.ceil((VO_END + OUTRO) * FPS);

const REG: Record<string, React.FC<SceneProps>> = {
  '1.1': A.S11, '1.2': A.S12, '1.3': A.S13, '1.4': A.S14, '1.5': A.S15,
  '2.1': A.S21, '2.2': A.S22, '2.3': B.S23, '2.4': A.S24, '2.5': B.S25, '2.6': A.S26,
  '3.1': A.S31, '3.2': A.S32, '3.3': B.S33, '3.4': B.S34, '3.5': A.S35, '3.6': A.S36, '3.7': A.S37,
  '4.1': B.S41, '4.2': B.S42, '4.3': B.S43, '4.4': B.S44, '4.5': B.S45,
  '5.1': B.S51, '5.2': B.S52, '5.3': B.S53, '5.4': B.S54, '5.5': B.S55, '5.6': B.S56, '5.7': B.S57,
  '6.1': B.S61, '6.2': B.S62, '6.3': B.S63, '6.4': B.S64, '6.5': B.S65,
  '7.1': B.S71, '7.2': D.S72, '7.3': D.S73, '7.4': D.S74, '7.5': D.S75, '7.6': D.S76, '7.7': D.S77,
  '8.1': D.S81, '8.2': D.S82, '8.3': D.S83, '8.4': D.S84,
  '9.1': D.S91, '9.2': D.S92, '9.3': D.S93, '9.4': D.S94, '9.5': D.S95, '9.6': D.S96,
};

const XF = 6; // crossfade frames

const Shot: React.FC<{Comp: React.FC<SceneProps>; d: number; first: boolean}> = ({Comp, d, first}) => {
  const f = useCurrentFrame();
  const o = first ? 1 : Math.min(1, f / XF);
  return (<AbsoluteFill style={{opacity: o, color: C.ivory, fontFamily: sans}}><Comp d={d} /></AbsoluteFill>);
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 2);
  const ox = (k * 137) % 512, oy = (k * 291) % 512;
  return (<AbsoluteFill style={{backgroundImage: `url(${staticFile('img/grain.png')})`, backgroundPosition: `${ox}px ${oy}px`, opacity: 0.075, mixBlendMode: 'overlay', pointerEvents: 'none'}} />);
};

const LabelChips: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const L = (labels as {start: number; end: number; label: string}[]).find((l) => t >= l.start + 0.4 && t < l.end - 0.2);
  if (!L) return null;
  const kind = L.label.startsWith('FACT') ? 'FACT' : 'INTERP';
  const o = Math.min(1, (t - L.start - 0.4) / 0.4);
  return (<div style={{opacity: o}}><Chip label={L.label} kind={kind as 'FACT' | 'INTERP'} /></div>);
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cr = credits as Record<string, {title: string; artist: string; license: string}>;
  const nice: Record<string, string> = {nokia1011: 'Nokia 1011', nokia1100: 'Nokia 1100', nokia3310: 'Nokia 3310', n95: 'Nokia N95', iphone: 'iPhone (2007)', n5800: 'Nokia 5800', n97: 'Nokia N97 Mini', n9: 'Nokia N9', lumia800: 'Nokia Lumia 800', ollila: 'Jorma Ollila', elop: 'Stephen Elop'};
  const used = ['nokia1011', 'nokia1100', 'iphone', 'n5800', 'ollila', 'elop'];
  return (
    <Black>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: eo(win(t, 0.2, 1.2))}}>
        <div style={{fontFamily: serif, fontSize: 84, letterSpacing: 20, color: C.gold}}>RISE &amp; RUIN</div>
        <div style={{width: 300, height: 3, background: C.gold, margin: '24px auto'}} />
        <div style={{fontSize: 28, letterSpacing: 7, color: C.ivory, fontWeight: 600}}>HOW NOKIA LOST THE SMARTPHONE WAR</div>
      </div>
      <div style={{position: 'absolute', left: 260, right: 260, top: 450, opacity: eo(win(t, 1.2, 2.2)), fontSize: 22, lineHeight: 1.6, color: C.ivory}}>
        <div style={{fontSize: 20, letterSpacing: 5, color: C.gold, fontWeight: 700, marginBottom: 10}}>IMAGE CREDITS · WIKIMEDIA COMMONS</div>
        {used.map((k) => (<div key={k}>{nice[k]} — {cr[k].artist} ({cr[k].license})</div>))}
        <div style={{marginTop: 18, color: C.grey}}>Stock footage: Pixabay (Pixabay Content License) · Charts and graphics: Rise &amp; Ruin</div>
        <div style={{color: C.grey}}>Sources: Doz &amp; Wilson, <i>Ringtone</i> (OUP, 2017) · Vuori &amp; Huy, <i>Administrative Science Quarterly</i> (2016) · Nokia, Microsoft and SEC filings · Strategy Analytics · Canalys · Engadget. Full list in the description.</div>
        <div style={{color: C.grey, marginTop: 10}}>Nokia and other names are trademarks of their owners. Not affiliated with or endorsed by any company named.</div>
      </div>
    </Black>
  );
};

export const Film: React.FC = () => {
  const list = shots as {id: string; start: number; end: number}[];
  return (
    <AbsoluteFill style={{background: C.ink, fontFamily: sans}}>
      {list.map((s, i) => {
        const Comp = REG[s.id];
        if (!Comp) throw new Error('missing scene ' + s.id);
        const from = Math.round(s.start * FPS);
        const next = i + 1 < list.length ? Math.round(list[i + 1].start * FPS) : Math.round(VO_END * FPS);
        const dur = next - from + (i + 1 < list.length ? XF : 0);
        return (
          <Sequence key={s.id} from={from} durationInFrames={Math.max(dur, 2)} layout="none">
            <Shot Comp={Comp} d={(next - from) / FPS} first={i === 0} />
          </Sequence>
        );
      })}
      <Sequence from={Math.round(VO_END * FPS)} durationInFrames={TOTAL_FRAMES - Math.round(VO_END * FPS)} layout="none">
        <Shot Comp={Outro as React.FC<SceneProps>} d={OUTRO} first={false} />
      </Sequence>
      <LabelChips />
      <Grain />
    </AbsoluteFill>
  );
};
