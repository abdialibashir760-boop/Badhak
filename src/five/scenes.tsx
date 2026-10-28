import React from 'react';
import {Camera} from '../components/Stage';
import {clamp, easeIn, easeInOut, easeOut, lerp, seg} from '../lib/anim';
import {lerpPose, walkPose, type Pose} from '../lib/pose';
import type {SceneProps} from '../scenes/types';
import {Eli, ELI, withSlump} from './Eli';
import {C} from './palette';
import {FLOOR, Room, Slats} from './art';
import {FaceCU, LaptopCU, PhoneCU, PillowFace, Thumb} from './shots';
import {DOC_KEYS, S, STARTS, batteryAt, fmtClock, clockMinutes, fmtMS, keysTyped, timerLeft} from './timeline';
import {
  Battery,
  LapDesktop,
  LapDoc,
  Seg7,
  ScreenAlertMissed,
  ScreenBanner,
  ScreenBatteryDead,
  ScreenCalendar,
  ScreenChat,
  ScreenFeed,
  ScreenLock,
  ScreenNotes,
  ScreenTimeCard,
  ScreenTimer,
  seg7Width,
} from './ui';

const SANS = "'Inter', system-ui, sans-serif";

type Ctx = {n: number; frame: number; l: number; t: number; d: number};
type Build = (c: Ctx) => React.ReactNode;

/** A scene: 1920×1080 SVG, a global film time `t`, and the scene-local seconds `l`. */
const scene =
  (n: number, build: Build, bg: string = C.void): React.FC<SceneProps> =>
  ({frame, dur}) => {
    const l = frame / 30;
    return (
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, background: bg}}>
        {build({n, frame, l, t: S(n) + l, d: dur / 30})}
      </svg>
    );
  };

const at = (t: number, ...a: Array<[number, number]>) => {
  if (t <= a[0][0]) return a[0][1];
  for (let i = 1; i < a.length; i++) {
    if (t <= a[i][0]) return lerp(a[i - 1][1], a[i][1], easeInOut((t - a[i - 1][0]) / (a[i][0] - a[i - 1][0])));
  }
  return a[a.length - 1][1];
};

const Vignette: React.FC<{k?: number}> = ({k = 0.55}) => (
  <g pointerEvents="none">
    <defs>
      <radialGradient id="vg" cx="50%" cy="50%" r="75%">
        <stop offset="0.55" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity={k} />
      </radialGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#vg)" />
  </g>
);

const Card: React.FC<{lines: Array<{text: string; from: number; to?: number; size?: number; color?: string; weight?: number; y?: number}>; l: number}> = ({lines, l}) => (
  <g fontFamily={SANS} textAnchor="middle">
    {lines.map((ln, i) => {
      const o = seg(l, ln.from, ln.from + 0.5) * (ln.to ? 1 - seg(l, ln.to, ln.to + 0.4) : 1);
      return (
        <text key={i} x={960} y={ln.y ?? 560} fontSize={ln.size ?? 84} fontWeight={ln.weight ?? 300} fill={ln.color ?? C.white} opacity={o} letterSpacing={ln.size && ln.size < 50 ? 10 : 18}>
          {ln.text}
        </text>
      );
    })}
  </g>
);

const Black: React.FC<{o: number}> = ({o}) => <rect width={1920} height={1080} fill="#000" opacity={o} />;

/* ---------------------------------------------------------------- shared poses & helpers */
const DESK = {x: 1010, y: FLOOR, scale: 1.25};
const TYPE: Pose = {...ELI.sit, lean: 14, tilt: 6, aU: 62, aF: 92, bU: 56, bF: 88};
const typePose = (t: number, amp = 1): Pose => {
  const k = Math.sin(t * 17) * 6 * amp;
  const k2 = Math.cos(t * 13) * 6 * amp;
  return {...TYPE, aF: TYPE.aF + k, bF: TYPE.bF + k2};
};

/** keystroke energy 0..1 around global time t (from the shared event list) */
const keyPulse = (t: number) => {
  const last = DOC_KEYS.filter((k) => k.t <= t).at(-1);
  return last ? clamp(1 - (t - last.t) / 0.12) : 0;
};

const Desk: React.FC<{frame: number; t: number; pose: Pose; m?: number; lamp?: number; lid?: number; glow?: number; phoneGlow?: number; rain?: number; dark?: number; notes?: number; dust?: number; hairUp?: number; glint?: number; cam?: {x?: number; y?: number; zoom?: number; rot?: number}; plant?: number; pages?: number; rim?: string; rimStrength?: number; tremble?: number; phoneX?: number; extra?: React.ReactNode; eliX?: number; eliPose?: Pose}> = ({
  frame,
  t,
  pose,
  m = 0,
  lamp = 0,
  lid = 0,
  glow = 0,
  phoneGlow = 0,
  rain = 1,
  dark = 0,
  notes = 0,
  dust = 0,
  hairUp = 0,
  glint = 1,
  cam,
  plant = 0,
  pages = 0,
  rim = C.rimCold,
  rimStrength = 1,
  tremble = 0,
  phoneX,
  extra,
}) => (
  <Camera cam={{...cam}}>
    <Room frame={frame} t={t} m={m} lamp={lamp} lid={lid} glow={glow} phoneGlow={phoneGlow} rain={rain} dark={dark} notes={notes} dust={dust} plant={plant} pages={pages} phoneX={phoneX}>
      <Eli {...DESK} facing={-1} pose={pose} frame={frame} rim={rim} rimStrength={rimStrength} hairUp={hairUp} glint={glint} tremble={tremble} />
      {extra}
    </Room>
  </Camera>
);

const HudClock: React.FC<{t: number; x?: number; y?: number}> = ({t, x = 1850, y = 70}) => (
  <g fontFamily={SANS} textAnchor="end" fill={C.white} opacity={0.0}>
    <text x={x} y={y}>{fmtClock(clockMinutes(t))}</text>
  </g>
);
void HudClock;

const MiniTimer: React.FC<{t: number}> = ({t}) => {
  const left = timerLeft(t);
  return (
    <g transform="translate(1700,92)" fontFamily={SANS}>
      <rect x={-120} y={-52} width={240} height={90} rx={16} fill="#0B1020" stroke={C.ash} strokeWidth={3} opacity={0.92} />
      <text y={22} fontSize={54} fontWeight={300} textAnchor="middle" fill={C.amber}>{fmtMS(left)}</text>
    </g>
  );
};

/* ---------------------------------------------------------------- 1: DREAM PROJECT */
const S1 = scene(1, ({frame, l, t}) => {
  const tips: Array<[number, number, number]> = [
    [0, 1150, 980],
    [0.5, 1020, 330],
    [1.3, 960, 330],
    [1.9, 940, 520],
    [2.7, 980, 650],
    [3.3, 960, 830],
    [3.55, 960, 830],
    [4.2, 1250, 1000],
  ];
  const tipX = at(l, ...tips.map((p): [number, number] => [p[0], p[1]]));
  const tipY = at(l, ...tips.map((p): [number, number] => [p[0], p[2]]));
  const tap = Math.max(...tips.slice(1, 7).map((p) => 1 - clamp(Math.abs(l - p[0]) / 0.12)));
  return (
    <>
      <Camera cam={{zoom: 1 + 0.04 * (l / 5)}}>
        <PhoneCU>
          <ScreenCalendar t={t} frame={frame} />
        </PhoneCU>
        <Thumb x={tipX} y={tipY + tap * 10} />
      </Camera>
      <Vignette k={0.7} />
    </>
  );
});

/* ---------------------------------------------------------------- 2: wide establishing (also 8 and 24) */
const knuckle = (l: number) => (l > 1.6 && l < 1.9) || (l > 2.3 && l < 2.6) ? 1 : 0;
const S2 = scene(2, ({frame, l, t}) => {
  const up = seg(l, 3.2, 5.4, easeInOut);
  const pose = lerpPose({...withSlump(ELI.sit, 0.15), aU: 40, aF: 100, bU: 34, bF: 96}, {...ELI.sit, lean: -2, aU: 30, aF: 70, bU: 26, bF: 64}, up);
  return (
    <>
      <Desk frame={frame} t={t} pose={{...pose, shrug: pose.shrug - up * 6 + knuckle(l) * 4}} cam={{zoom: 1 + 0.06 * (l / 7), x: 960 + 20 * (l / 7), y: 540}} glint={0.6 + 0.4 * up} />
      <Vignette />
    </>
  );
});

/* ---------------------------------------------------------------- 3: temptation */
const S3 = scene(3, ({frame, l, t}) => {
  const reach = seg(l, 0.4, 1.6, easeInOut);
  const phoneOn = seg(l, 1.6, 1.8);
  const toPhone = seg(l, 2.7, 4.2, easeInOut);
  const reachPose: Pose = {...TYPE, aU: 40 + 34 * reach, aF: 84 + 16 * reach, lean: 8 + 6 * reach};
  const pose = lerpPose(reachPose, {...TYPE, lean: 22, aU: 70, aF: 100, headDrop: 14}, toPhone);
  const buzz = phoneOn > 0.5 && l < 3.2 ? Math.sin(l * 90) * 2.5 : 0;
  return (
    <>
      <Desk frame={frame} t={t} pose={pose} phoneGlow={phoneOn} cam={{x: 940 + buzz, y: 640, zoom: 1.7, rot: -4}} extra={null} />
      <Vignette />
    </>
  );
});

/* ---------------------------------------------------------------- 4: the scroll spiral */
const S4 = scene(4, ({frame, l, t}) => {
  const cuts = [0, 1.7, 3.4, 4.9, 6.3, 7.4, 8.4, 9.2];
  const idx = cuts.filter((c) => l >= c).length - 1;
  const face = idx % 2 === 0;
  const speed = l / 10;
  const slump = clamp(idx / 6);
  const thumbY = 840 + (Math.sin(l * 6 * (1 + speed * 3)) * 0.5 + 0.5) * -150;
  const feedTint = <ScreenFeed t={t} frame={frame} />;
  return (
    <>
      {face ? (
        <Camera cam={{zoom: 1.0 + 0.02 * idx}}>
          <FaceCU frame={frame} y={560 + slump * 80} tilt={slump * 10} jaw={slump} x={900 + slump * 30} lightAt={{x: 1500, y: 640}} />
          <rect x={1380} y={380} width={560} height={720} fill={C.rimCold} opacity={0.05 + 0.04 * Math.sin(frame * 0.9)} />
        </Camera>
      ) : (
        <Camera cam={{zoom: 1}}>
          <PhoneCU>{feedTint}</PhoneCU>
          <Thumb x={1020} y={thumbY} />
        </Camera>
      )}
      <rect width={1920} height={1080} fill={C.rimCold} opacity={0.035 * Math.sin(frame * 1.7) + 0.02} />
      <Vignette k={0.75} />
    </>
  );
});

/* ---------------------------------------------------------------- 5: high-angle wide, slump */
const S5 = scene(5, ({frame, l, t}) => {
  const blink = l > 3.4 && l < 3.55;
  return (
    <>
      <Desk
        frame={frame}
        t={t}
        pose={{...withSlump({...ELI.sit, aU: 40, aF: 110, bU: 34, bF: 100}, 1), lean: 36}}
        phoneGlow={0.9}
        dust={0.3}
        glint={blink ? 0 : 0.35}
        cam={{x: 960, y: 500 - l * 2, zoom: 1.12 - l * 0.01, rot: 0}}
        phoneX={1010}
        rain={1}
        dark={0.1}
      />
      <g transform="translate(1790,80)" fontFamily={SANS} fill={C.white}>
        <Battery x={0} y={0} level={batteryAt(t)} flash={Math.sin(frame * 0.4) > 0 ? 1 : 0} />
        <text x={-14} y={6} fontSize={26} textAnchor="end" fontWeight={600} fill={batteryAt(t) <= 20 ? C.amber : C.white}>{batteryAt(t)}%</text>
      </g>
      <Vignette k={0.7} />
    </>
  );
});

/* ---------------------------------------------------------------- 6: screen time */
const S6 = scene(6, ({frame, l, t}) => {
  const rack = seg(l, 1.4, 2.0) * (1 - seg(l, 4.0, 4.6));
  const swipeAway = seg(l, 4.9, 5.1);
  return (
    <>
      {/* the laptop, out of focus behind the phone */}
      <g opacity={0.5 + 0.3 * rack} filter={rack > 0.2 ? undefined : 'blur(0)'}>
        <rect x={80} y={380} width={520} height={330} rx={16} fill="#0D1426" stroke={C.ash} strokeWidth={5} />
        <rect x={110} y={410} width={460} height={270} fill="#101A2E" opacity={0.7} />
      </g>
      <Camera cam={{zoom: 1.0 + 0.02 * (l / 7), rot: 0}}>
        <PhoneCU rot={-swipeAway * 0}>
          <ScreenTimeCard t={t} frame={frame} />
        </PhoneCU>
        <Thumb x={at(l, [0, 1250], [4.4, 1250], [4.6, 960], [5.0, 1080]) } y={at(l, [0, 1000], [4.4, 1000], [4.6, 650], [5.0, 660]) + (l > 4.8 ? 10 : 0)} />
      </Camera>
      <Vignette k={0.7} />
    </>
  );
});

/* ---------------------------------------------------------------- 7: MISSED, then TOMORROW. */
const S7 = scene(7, ({frame, l, t}) => {
  if (l < 3.3) {
    const sag = seg(l, 0.6, 2.8);
    return (
      <>
        <Desk
          frame={frame}
          t={t}
          pose={{...withSlump({...ELI.sit, aU: 40, aF: 100, bU: 34, bF: 96}, 0.5 + 0.5 * sag), headDrop: 10 + 20 * seg(l, 2, 3.2)}}
          phoneGlow={l < 1.6 ? 0.6 : 0}
          cam={{x: 960 + l * 4, y: 520, zoom: 1.15 - l * 0.01}}
          dark={0.08 + 0.1 * sag}
        />
        <Vignette />
      </>
    );
  }
  if (l < 6.6) {
    return (
      <>
        <PhoneCU zoom={1} glow={1}>
          <ScreenAlertMissed t={t} frame={frame} />
        </PhoneCU>
        <Vignette k={0.7} />
      </>
    );
  }
  const o = seg(l, 6.6, 7.1);
  return (
    <>
      <Card l={l} lines={[{text: 'TOMORROW.', from: 6.9, size: 96, weight: 300, color: C.white, y: 580}]} />
      <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={1 - o} />
    </>
  );
});

/* ---------------------------------------------------------------- 8: five repeats */
const S8 = scene(8, ({frame, l, t}) => {
  const rep = Math.min(4, Math.floor(l / 2));
  const k = (l % 2) / 2;
  const days = ['WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const slump = rep * 0.25;
  const pose = lerpPose(withSlump({...ELI.sit, aU: 40, aF: 100, bU: 34, bF: 96}, slump), withSlump({...ELI.sit, lean: -2}, slump * 0.3), 1 - seg(k, 0.1, 0.5));
  const flash = k < 0.04 ? 0.5 : 0;
  return (
    <>
      <Desk frame={frame} t={t} pose={pose} notes={rep * 2} dust={0.2 + rep * 0.2} phoneGlow={k > 0.5 ? 0.7 : 0} cam={{zoom: 1.04}} dark={0.05 * rep} glint={1 - rep * 0.18} />
      <text x={1810} y={1010} fontFamily={SANS} fontSize={46} fontWeight={700} textAnchor="end" fill={C.white} opacity={0.75}>
        {days[rep]} · 8:00 PM
      </text>
      <Black o={flash} />
      <Vignette />
    </>
  );
});

/* ---------------------------------------------------------------- 9: top-down on the pillow */
const S9 = scene(9, ({frame, l, t}) => {
  const trem = l < 4.6 ? Math.sin(l * 31) * (2 + l) : 0;
  const drop = seg(l, 4.6, 5.3, easeIn);
  const py = lerp(150, 760, drop);
  const hold = 1 - drop * 0.9;
  return (
    <>
      <Camera cam={{rot: -10, zoom: 1.0 + 0.04 * (l / 8), y: 540 + 10 * (l / 8)}}>
        <PillowFace frame={frame} t={t} light={hold} />
        <g transform={`translate(${960 + trem},${py}) scale(${lerp(0.55, 0.42, drop)})`}>
          <rect x={-250} y={-470} width={500} height={940} rx={56} fill="#05070D" stroke={C.ash} strokeWidth={5} />
          <g transform="translate(-230,-450) scale(0.98)">
            <clipPath id="s9clip"><rect width={460} height={900} rx={42} /></clipPath>
            <g clipPath="url(#s9clip)"><ScreenFeed t={S(4) + 2 + l * 0.5} frame={frame} /></g>
          </g>
        </g>
        <text x={1700} y={110} fontFamily={SANS} fontSize={38} fill={C.white} textAnchor="end" opacity={0.7} fontWeight={600}>
          1:12 AM · <tspan fill={C.amber}>{batteryAt(t)}%</tspan>
        </text>
      </Camera>
      <Vignette k={0.8} />
      <Black o={0.15 * drop} />
    </>
  );
});

/* ---------------------------------------------------------------- 10: the ghost timer */
const S10 = scene(10, ({frame, l}) => {
  const scale = lerp(1, 1.6, seg(l, 0, 9));
  const zoom = lerp(1.7, 1.0, seg(l, 2, 6));
  const secs = 4 * 3600 - Math.floor(l * 0.5);
  const txt = `${String(Math.floor(secs / 3600)).padStart(2, '0')}:${fmtMS((secs % 3600))}`;
  const w = seg7Width(txt, 130);
  const flick = Math.sin(frame * 1.3) > 0.82 ? 0.55 : 1;
  const cover = seg(l, 3.5, 7.5, easeIn);
  return (
    <>
      <Camera cam={{x: 960, y: 500, zoom}}>
        <rect x={-600} y={-400} width={3200} height={1100} fill="#0A0D17" />
        <g transform={`translate(960,230) scale(${scale}) translate(${-w / 2},-65)`}>
          <Seg7 text={txt} x={0} y={0} h={130} color={C.alarm} opacity={0.9 * flick} />
        </g>
        <text x={960} y={380} fontFamily={SANS} fontSize={30} textAnchor="middle" fill={C.alarm} letterSpacing={12} opacity={0.8 * flick}>NOT STARTED</text>
        <rect x={-400} y={FLOOR - 160} width={2800} height={400} fill="#0C101B" />
        <g>
          <rect x={560} y={780} width={800} height={FLOOR - 780} fill="#1A2238" stroke="#04060B" strokeWidth={4} />
          <path d={`M 560,790 Q 960,${760 + cover * 6} 1360,790 L 1360,830 L 560,830 Z`} fill="#232C48" stroke="#04060B" strokeWidth={4} />
          <ellipse cx={680} cy={770} rx={84} ry={22} fill="#2B3558" stroke="#04060B" strokeWidth={3.5} />
          <Eli x={940} y={812} scale={0.95} pose={ELI.lying} frame={frame} facing={-1} glint={1 - cover} rimStrength={0.4} shadow={false} />
          <path d={`M 560,790 Q 960,${760 - cover * 30} 1360,790 L 1360,${830 + 10} L 560,${830 + 10} Z`} fill="#2E3A5E" stroke="#04060B" strokeWidth={4} opacity={cover} />
          <ellipse cx={680} cy={764 - cover * 3} rx={84} ry={22} fill="#2B3558" opacity={cover} />
        </g>
        <rect x={-600} y={-400} width={3200} height={1100} fill={C.alarm} opacity={0.05 * flick} />
      </Camera>
      <Vignette k={0.8} />
    </>
  );
});

/* ---------------------------------------------------------------- 11: battery dies */
const S11 = scene(11, ({frame, l, t}) => {
  const dead = l > 2.5;
  const out = seg(l, 2.6, 4.2, easeOut);
  const tap = l > 1.0 && l < 2.5;
  return (
    <>
      <Camera cam={{zoom: lerp(1.0, 0.55, out), x: 960, y: 540}}>
        <PhoneCU dead={dead} glow={dead ? 0 : 1}>
          <ScreenBatteryDead t={t} frame={frame} />
        </PhoneCU>
        {!dead ? <Thumb x={1260} y={tap ? 770 + Math.sin(l * 9) * 4 : 1010} opacity={tap ? 1 : 0} /> : null}
      </Camera>
      <Slats opacity={seg(l, 3.0, 5.2) * 3} />
      <Black o={0.92 * seg(l, 3.0, 5.0)} />
      <Vignette k={0.7} />
    </>
  );
});

/* ---------------------------------------------------------------- 12: plug in */
const S12 = scene(12, ({frame, l, t}) => {
  if (l < 3.0) {
    const orbit = l / 3;
    return (
      <>
        <Camera cam={{x: 1480 - orbit * 90, y: 640, zoom: 1.5, rot: orbit * 2}}>
          <Room frame={frame} t={t} dark={0.45} phoneGlow={0} rain={1}>
            <Eli x={1450} y={FLOOR} scale={1.25} facing={-1} pose={withSlump(ELI.sitEdge, 0.5 + 0.2 * Math.sin(l * 2.2))} frame={frame} rimStrength={0.5} glint={0.4} />
          </Room>
        </Camera>
        <Vignette k={0.7} />
      </>
    );
  }
  const hover = l > 6.2 && l < 9.5;
  return (
    <>
      <PhoneCU>
        <ScreenLock t={t} frame={frame} />
      </PhoneCU>
      <Thumb x={at(l, [3, 1300], [6.0, 1300], [7.2, 1040]) } y={at(l, [3, 1100], [6.0, 1100], [7.2, 880]) + (hover ? Math.sin(l * 2) * 6 : 0)} opacity={seg(l, 5.8, 6.3)} />
      <Vignette k={0.7} />
    </>
  );
});

/* ---------------------------------------------------------------- 13: the rule */
const S13 = scene(13, ({frame, l, t}) => {
  const face = l > 6.8;
  const nod = Math.sin(seg(l, 7.6, 8.4) * Math.PI) * 5;
  return (
    <>
      {face ? (
        <Camera cam={{zoom: 1.0 + 0.02 * (l - 6.8)}}>
          <FaceCU frame={frame} y={560} x={900} tilt={nod} jaw={0.2} lightAt={{x: 1500, y: 700}} light={C.rimCold} glint={1} />
        </Camera>
      ) : (
        <Camera cam={{zoom: 1 + 0.03 * (l / 7)}}>
          <PhoneCU>
            <ScreenNotes t={t} frame={frame} />
          </PhoneCU>
          <Thumb x={at(l, [0, 1260], [2, 1020], [4, 1180], [6.6, 1060])} y={at(l, [0, 1000], [2, 760], [4, 820], [6.6, 740])} />
        </Camera>
      )}
      <Vignette k={0.7} />
    </>
  );
});

/* ---------------------------------------------------------------- 14: the timer wheel */
const S14 = scene(14, ({frame, l, t}) => {
  const press = seg(l, 5.4, 5.55) * (1 - seg(l, 5.55, 5.7));
  const warm = seg(l, 5.5, 6.2);
  return (
    <>
      <rect width={1920} height={1080} fill={C.gold} opacity={0.05 * warm} />
      <Camera cam={{zoom: 1 + 0.03 * (l / 7)}}>
        <PhoneCU tint={warm > 0.2 ? C.amber : C.rimCold}>
          <ScreenTimer t={t} frame={frame} />
        </PhoneCU>
        <Thumb
          x={at(l, [0, 1250], [0.6, 1000], [3.7, 1000], [4.6, 960], [5.4, 960], [6.2, 1260])}
          y={at(l, [0, 1000], [0.6, 560], [3.7, 560], [4.6, 790], [5.4, 800], [6.2, 1050]) + press * 12}
        />
      </Camera>
      <Vignette k={0.65} />
    </>
  );
});

/* ---------------------------------------------------------------- 15: out of bed, to the desk */
const S15 = scene(15, ({frame, l, t}) => {
  const getUp = seg(l, 0.2, 2.2, easeInOut);
  const walk = seg(l, 2.2, 6.0, easeInOut);
  const sitDown = seg(l, 6.0, 7.6 - 0.6, easeOut);
  const x = lerp(1450, 1010, walk);
  const dist = walk * 440;
  const base = lerpPose(withSlump(ELI.sitEdge, 0.6), ELI.stand, getUp);
  let pose = walk > 0 && walk < 1 ? walkPose(dist, {...base, lean: 4}, 0.9) : base;
  pose = lerpPose(pose, {...ELI.sit, aU: 30, aF: 80, bU: 24, bF: 70}, sitDown);
  const facing: 1 | -1 = -1;
  const camX = lerp(1400, 1050, walk);
  return (
    <>
      <Camera cam={{x: camX, y: lerp(760, 640, walk), zoom: lerp(1.9, 1.3, walk)}}>
        <Room frame={frame} t={t} dark={0.25} phoneGlow={0.9} phoneX={950}>
          <Eli x={x} y={FLOOR} scale={1.25} facing={facing} pose={pose} frame={frame} rimStrength={0.7} glint={0.7} />
        </Room>
      </Camera>
      <g fontFamily={SANS} textAnchor="end">
        <text x={1840} y={96} fontSize={54} fontWeight={300} fill={C.amber}>{fmtMS(timerLeft(t))}</text>
      </g>
      <Vignette />
    </>
  );
});

/* ---------------------------------------------------------------- 16: opening the laptop */
const S16 = scene(16, ({frame, l, t}) => {
  const lid = at(l, [0, 0], [1.2, 0.0], [2.0, 0.28], [2.6, 0.28], [3.6, 1]);
  const glow = seg(l, 2.2, 4.2);
  if (l < 3.0) {
    return (
      <>
        <Desk frame={frame} t={t} pose={{...TYPE, aU: 50, aF: 90}} lid={lid} glow={glow} dust={0.6} phoneGlow={0.4} cam={{x: 760, y: 680, zoom: 3.0}} />
        <Vignette k={0.7} />
      </>
    );
  }
  return (
    <>
      <Desk frame={frame} t={t} pose={{...ELI.sit, lean: 6 + 6 * seg(l, 3.5, 7), aU: 48, aF: 88, bU: 40, bF: 84}} lid={lid} glow={glow} phoneGlow={0.3} cam={{x: 940, y: 640, zoom: 1.7}} glint={1} />
      <Vignette k={0.6} />
    </>
  );
});

/* ---------------------------------------------------------------- 17: first words */
const S17 = scene(17, ({frame, l, t}) => {
  const rack = seg(l, 0.2, 1.4);
  return (
    <>
      <Camera cam={{zoom: 1}}>
        <LaptopCU t={t} zoom={0.78} cy={470} handsY={1030}>
          <LapDoc t={t} frame={frame} />
        </LaptopCU>
        <rect width={1920} height={1080} fill="#000" opacity={0.32 * (1 - rack)} />
      </Camera>
      <MiniTimer t={t} />
      <Vignette k={0.6} />
    </>
  );
});

/* ---------------------------------------------------------------- 18: the phone buzzes */
const S18 = scene(18, ({frame, l, t}) => {
  if (l < 3.2) {
    const shake = Math.sin(frame * 2.6) * 5 * (l > 0.3 && l < 3 ? 1 : 0);
    return (
      <>
        <Camera cam={{zoom: 1}}>
          <g transform={`translate(${shake},0)`}>
            <PhoneCU>
              <ScreenBanner t={t} frame={frame} />
            </PhoneCU>
          </g>
          <Thumb x={at(l, [0, 1700], [2.2, 1700], [3.0, 1100]) } y={at(l, [0, 1100], [2.2, 1100], [3.0, 900])} opacity={seg(l, 2.0, 2.6)} />
        </Camera>
        <Black o={l > 3.0 && l < 3.07 ? 0.0 : 0} />
        <rect width={1920} height={1080} fill={C.alarm} opacity={l > 3.0 && l < 3.07 ? 0.25 : 0} />
        <Vignette k={0.65} />
      </>
    );
  }
  return (
    <>
      <Desk frame={frame} t={t} pose={typePose(t, 0.8)} lid={1} glow={1} phoneGlow={0} hairUp={0.4} cam={{x: 960, y: 630, zoom: 1.5}} />
      <Black o={l < 3.7 ? 0.5 * (1 - seg(l, 3.2, 3.7)) : 0} />
      <Vignette />
    </>
  );
});

/* ---------------------------------------------------------------- 19: flow */
const S19 = scene(19, ({frame, l, t}) => {
  const k = keyPulse(t);
  if (l > 5.0) {
    return (
      <>
        <LaptopCU t={t} zoom={0.82} cy={450} handsY={1010}>
          <LapDoc t={t} frame={frame} />
        </LaptopCU>
        <rect width={1920} height={1080} fill={C.gold} opacity={0.02} />
        <MiniTimer t={t} />
        <Vignette k={0.55} />
      </>
    );
  }
  const orbit = l / 5;
  return (
    <>
      <Desk
        frame={frame}
        t={t}
        pose={{...typePose(t, 1.3), lean: 8 - orbit * 4 + k * 2}}
        lid={1}
        glow={1}
        hairUp={seg(l, 0.5, 3)}
        cam={{x: lerp(900, 1040, orbit), y: 640, zoom: 1.55, rot: lerp(-2, 2, orbit)}}
        tremble={0}
      />
      <Vignette k={0.55} />
    </>
  );
});

/* ---------------------------------------------------------------- 20: the bell */
const S20 = scene(20, ({frame, l, t}) => {
  if (l < 4.6) {
    const press = l > 4.0 && l < 4.3;
    return (
      <>
        <rect width={1920} height={1080} fill={C.amber} opacity={l > 2.7 && l < 4.4 ? 0.05 : 0} />
        <Camera cam={{zoom: 1 + 0.02 * l * 0.2}}>
          <PhoneCU tint={C.amber}>
            <ScreenTimer t={t} frame={frame} />
          </PhoneCU>
          <Thumb x={at(l, [0, 1700], [3.4, 1700], [4.0, 1010]) } y={at(l, [0, 1100], [3.4, 1100], [4.0, 640]) + (press ? 12 : 0)} opacity={seg(l, 3.2, 3.8)} />
        </Camera>
        <Vignette k={0.65} />
      </>
    );
  }
  const smile = seg(l, 5.0, 5.6);
  return (
    <>
      <Desk frame={frame} t={t} pose={l < 5.2 ? {...TYPE, aF: 100, bF: 96} : typePose(t, 0.6)} lid={1} glow={1} hairUp={0.7} glint={1 + smile * 0.0} cam={{x: 960, y: 620, zoom: 1.4 + 0.1 * smile}} />
      <Vignette />
    </>
  );
});

/* ---------------------------------------------------------------- 21: the lamp (locked wide) */
const S21 = scene(21, ({frame, l, t}) => {
  const lamp = seg(l, 1.4, 2.6);
  const m = seg(l, 1.6, 5.8) * 0.18;
  const reach = seg(l, 1.0, 1.4) * (1 - seg(l, 1.6, 2.2));
  const stretch = seg(l, 3.0, 4.0) * (1 - seg(l, 4.4, 5.0));
  const pose = lerpPose(typePose(t, 0.9), {...ELI.sit, lean: -8, aU: 170, aF: 175, bU: 168, bF: 172}, stretch);
  const reachPose: Pose = {...pose, aU: lerp(pose.aU, 100, reach), aF: lerp(pose.aF, 120, reach), lean: pose.lean + reach * 8};
  const lid = 1 - seg(l, 6.0, 6.9);
  return (
    <>
      <Desk frame={frame} t={t} pose={l > 5.0 && l < 6 ? {...ELI.sit, lean: 2} : reachPose} m={m} lamp={lamp} lid={lid} glow={lid} rain={lerp(1, 0.35, seg(l, 0, 7))} hairUp={0.8} cam={{zoom: 1}} />
      <g fontFamily={SANS} opacity={0}>
        <text x={100} y={100}>{keysTyped(t)}</text>
      </g>
      <Vignette k={0.4 + 0.1 * (1 - lamp)} />
    </>
  );
});

/* ---------------------------------------------------------------- 22: to bed, lightly */
const S22 = scene(22, ({frame, l, t}) => {
  const walk = seg(l, 0.3, 2.6, easeInOut);
  const lie = seg(l, 2.8, 3.8, easeOut);
  const x = lerp(1010, 1560, walk);
  const base = walk < 1 ? walkPose(walk * 540, {...ELI.stand, lean: -2}, 0.8) : ELI.stand;
  const sit = seg(l, 0, 0.3);
  const pose = lerpPose(lerpPose({...ELI.sit}, base, sit), ELI.lying, lie);
  const y = lerp(FLOOR, 812, lie);
  const lampOff = l > 4.4 ? 0 : 1;
  return (
    <>
      <Camera cam={{x: lerp(1000, 1500, seg(l, 0.5, 4)), y: lerp(560, 660, seg(l, 0, 6)), zoom: 1.0 + 0.2 * seg(l, 1, 5)}}>
        <Room frame={frame} t={t} m={0.2} lamp={lampOff * (1 - seg(l, 4.4, 4.6))} lid={0} rain={0.35 - 0.15 * seg(l, 0, 6)} sink={0.15 * lie} duvetCover={seg(l, 3.9, 4.8)} dark={0.2 * seg(l, 4.4, 6)} phoneGlow={0} streetlight={0.6}>
          <Eli x={x} y={y} scale={1.25} facing={1} pose={pose} frame={frame} rim={C.gold} rimStrength={0.55} shadow={lie < 0.3} />
        </Room>
      </Camera>
      <g transform="translate(1310,808)" fontFamily={SANS}>
        <text y={-80} x={0} textAnchor="middle" fontSize={26} fontWeight={700} fill={C.sage} opacity={seg(l, 3.4, 4.4) * 0.9}>12:51 AM</text>
      </g>
      <Vignette k={0.55} />
    </>
  );
});

/* ---------------------------------------------------------------- 23: ritual montage, sunrise */
const S23 = scene(23, ({frame, l, t}) => {
  const day = Math.min(2, Math.floor(l / 2));
  const k = (l % 2) / 2;
  const days = ['WED', 'THU', 'FRI'];
  const sun = seg(l, 0, 1.6);
  const keys = Math.sin(l * 31) * 0.5;
  void keys;
  return (
    <>
      {l < 1.3 ? (
        <g>
          <rect width={1920} height={1080} fill={C.sky} opacity={1} />
          <rect width={1920} height={1080} fill={C.gold} opacity={0.65 * (1 - sun)} />
          <g opacity={0.8}>
            {Array.from({length: 8}, (_, i) => (
              <circle key={i} cx={420 + i * 160} cy={260 + ((i * 97) % 380)} r={26 + (i % 3) * 14} fill="#fff" opacity={0.6} />
            ))}
          </g>
        </g>
      ) : (
        <Desk
          frame={frame}
          t={t}
          pose={typePose(t * 0.8, 0.8 + day * 0.4)}
          m={1}
          lamp={0}
          lid={1}
          glow={0.5}
          rain={0}
          plant={day / 2}
          pages={[1, 3, 9][day]}
          hairUp={1}
          rim={C.gold}
          cam={{zoom: 1.0 + 0.08 * k, x: 960 + (day - 1) * 30}}
        />
      )}
      {l >= 1.3 ? (
        <>
          <text x={110} y={110} fontFamily={SANS} fontSize={44} fontWeight={800} fill={C.rose}>
            {days[day]}
          </text>
          <text x={110} y={165} fontFamily={SANS} fontSize={34} fontWeight={500} fill="#3C4457">
            05:00 · {[1, 3, 9][day]} {day === 0 ? 'page' : 'pages'}
          </text>
          <text x={1810} y={110} fontFamily={SANS} fontSize={40} fontWeight={800} fill={C.rose} textAnchor="end">
            DAY {day + 2}
          </text>
        </>
      ) : null}
      <Black o={l > 1.2 && l < 1.34 ? 0.5 : 0} />
      <Vignette k={0.2} />
    </>
  );
}, C.sky);

/* ---------------------------------------------------------------- 24: final wide + end cards */
const S24 = scene(24, ({frame, l, t}) => {
  const phoneEnd = l > 4.9;
  return (
    <>
      {!phoneEnd ? (
        <Desk
          frame={frame}
          t={t}
          pose={typePose(t * 0.7, 0.7)}
          m={1}
          lid={1}
          glow={0.4}
          rain={0}
          plant={1}
          pages={9}
          hairUp={1}
          rim={C.gold}
          cam={{zoom: 1.04 - 0.04 * seg(l, 0, 4), x: 960, y: 540}}
        />
      ) : (
        <>
          <rect width={1920} height={1080} fill="#0B0F1A" />
          <PhoneCU tint={C.amber} zoom={0.8}>
            <ScreenTimer t={t} frame={frame} />
          </PhoneCU>
        </>
      )}
      {!phoneEnd ? (
        <>
          <rect width={1920} height={1080} fill="#FFF1D6" opacity={0.04} />
          <Card
            l={l}
            lines={[
              {text: '5 MINUTES.', from: 1.0, to: 2.6, size: 110, color: '#2A2420', weight: 500, y: 980},
              {text: 'THEN DECIDE.', from: 2.5, to: 4.6, size: 110, color: '#2A2420', weight: 500, y: 980},
            ]}
          />
        </>
      ) : null}
      {phoneEnd ? (
        <Card l={l} lines={[{text: 'THE 5-MINUTE RULE', from: 5.0, size: 64, color: C.white, weight: 300, y: 1010}]} />
      ) : null}
      <Black o={seg(l, 5.4, 5.95)} />
    </>
  );
}, C.cream);

export const FIVE_SCENES: React.FC<SceneProps>[] = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24];

void STARTS;
void ScreenChat;
void LapDesktop;
void easeOut;
