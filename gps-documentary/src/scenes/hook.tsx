import React from "react";
import { clamp01, easeInOut, easeOutBack, easeOutCubic, lerp, smoothstep } from "../engine/math3d";
import { SpaceDefs } from "../components/Space";
import { MapView } from "../components/MapView";
import { useShot } from "../components/context";
import { FONT } from "../components/SatModel";
import { HEIGHT, WIDTH } from "../timeline";
import { random } from "remotion";

const PHONE = { w: 420, h: 860, r: 62, inset: 14 };
const SCREEN = { w: PHONE.w - 2 * PHONE.inset, h: PHONE.h - 2 * PHONE.inset };
// Maps icon centre in phone-local coordinates
const MAPS_ICON = { x: -48, y: -118 };

const Bokeh: React.FC = () => {
  const { t } = useShot();
  return (
    <g>
      <rect width={WIDTH} height={HEIGHT} fill="url(#nightBg)" />
      <g filter="url(#blur12)">
        {Array.from({ length: 34 }, (_, i) => {
          const x = random(`bkx${i}`) * WIDTH;
          const y = random(`bky${i}`) * HEIGHT * 0.8 + 40;
          const r = 22 + random(`bkr${i}`) * 70;
          const warm = random(`bkw${i}`) > 0.55;
          return <circle key={i} cx={x + Math.sin(t * 0.4 + i) * 6} cy={y} r={r} fill={warm ? "#ffb25c" : "#4fa8ff"} opacity={0.07 + random(`bko${i}`) * 0.13} />;
        })}
      </g>
      <rect y={HEIGHT * 0.72} width={WIDTH} height={HEIGHT * 0.28} fill="#02040b" opacity={0.55} />
    </g>
  );
};

const HomeScreen: React.FC<{ pressed: number }> = ({ pressed }) => {
  const cols = ["#7a8cff", "#ff8a5c", "#59d6a2", "#ffd05a", "#c77dff", "#5cc8ff", "#ff6b8b", "#9aa7b8"];
  const cell = 92;
  return (
    <g fontFamily={FONT}>
      <rect x={-SCREEN.w / 2} y={-SCREEN.h / 2} width={SCREEN.w} height={SCREEN.h} fill="url(#wall)" />
      <text x={0} y={-SCREEN.h / 2 + 150} textAnchor="middle" fill="#fff" fontSize={96} fontWeight={300} opacity={0.92}>21:42</text>
      <text x={0} y={-SCREEN.h / 2 + 190} textAnchor="middle" fill="#cfe3ff" fontSize={22} opacity={0.8}>Tuesday</text>
      {Array.from({ length: 12 }, (_, i) => {
        const cx = -140 + (i % 4) * cell + 0;
        const cy = -118 + Math.floor(i / 4) * (cell + 22);
        const isMaps = i === 1;
        const x = isMaps ? MAPS_ICON.x : cx + 0;
        return (
          <g key={i} transform={`translate(${x + (isMaps ? 0 : 0)} ${cy}) scale(${isMaps ? 1 - 0.1 * pressed : 1})`}>
            <rect x={-34} y={-34} width={68} height={68} rx={17} fill={isMaps ? "#fff" : cols[i % cols.length]} opacity={isMaps ? 1 : 0.9} />
            {isMaps && (
              <g>
                <rect x={-34} y={-34} width={68} height={68} rx={17} fill="url(#mapsIcon)" />
                <path d="M0 24 C-16 4 -17 -4 -17 -10 a17 17 0 0 1 34 0 C17 -4 16 4 0 24Z" fill="#ff5a4f" />
                <circle cx={0} cy={-10} r={6.5} fill="#fff" />
              </g>
            )}
          </g>
        );
      })}
      <text x={MAPS_ICON.x} y={MAPS_ICON.y + 58} textAnchor="middle" fill="#fff" fontSize={17} opacity={0.9}>Maps</text>
    </g>
  );
};

const Finger: React.FC<{ tip: [number, number]; press: number }> = ({ tip, press }) => (
  <g transform={`translate(${tip[0]} ${tip[1]}) rotate(24) scale(${1 - 0.05 * press})`}>
    <rect x={-34} y={-8} width={68} height={640} rx={34} fill="url(#skin)" />
    <rect x={-30} y={-4} width={20} height={640} rx={10} fill="#ffffff" opacity={0.1} />
    <path d="M-20 14 q20 -16 40 0 v34 q-20 12 -40 0Z" fill="#f3d3bf" opacity={0.85} />
  </g>
);

export type HandProps = {
  /** 0..1 progress of the tap (finger approaches, presses) */
  tap: number;
  screen: "home" | "map";
  /** map state when screen === "map" */
  mapZoom?: number;
  dotShow?: number;
  pulse?: number;
  /** extra camera scale/translation applied to the whole illustration */
  scale?: number;
  focus?: [number, number];
  glow?: number;
  handOpacity?: number;
};

/** Illustrated phone in a hand against a night street. Draws into a 1920×1080 SVG. */
export const HandPhone: React.FC<HandProps> = ({ tap, screen, mapZoom = 3, dotShow = 0, pulse = 0, scale = 1, focus = [0, 0], glow = 0, handOpacity = 1 }) => {
  const { id: sid, t } = useShot();
  const press = smoothstep(0.78, 0.9, tap) * (1 - smoothstep(0.92, 1, tap));
  const a = easeInOut(clamp01(tap / 0.85));
  const start: [number, number] = [330, 560];
  const target: [number, number] = [MAPS_ICON.x + 10, MAPS_ICON.y + 14];
  const tip: [number, number] = [lerp(start[0], target[0], a), lerp(start[1], target[1], a)];
  const sway = Math.sin(t * 1.3) * 2.2;
  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0 }}>
      <SpaceDefs />
      <defs>
        <linearGradient id="nightBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#050818" /><stop offset="0.6" stopColor="#0a1633" /><stop offset="1" stopColor="#0b1a2e" /></linearGradient>
        <linearGradient id="skin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#e3ab82" /><stop offset="1" stopColor="#b6704a" /></linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1f3f86" /><stop offset="1" stopColor="#0b1b44" /></linearGradient>
        <linearGradient id="mapsIcon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9f0ff" /><stop offset="1" stopColor="#8cc7ff" /></linearGradient>
        <linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a4254" /><stop offset="0.5" stopColor="#1a1f2b" /><stop offset="1" stopColor="#0d1018" /></linearGradient>
        <clipPath id={`${sid}-scr`}><rect x={-SCREEN.w / 2} y={-SCREEN.h / 2} width={SCREEN.w} height={SCREEN.h} rx={PHONE.r - PHONE.inset} /></clipPath>
      </defs>
      <g transform={`translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${scale}) translate(${-WIDTH / 2 - focus[0]} ${-HEIGHT / 2 - focus[1]})`}>
        <Bokeh />
        <g transform={`translate(1090 ${560 + sway}) rotate(-8)`}>
          {/* holding hand: palm and thumb behind, fingertips in front */}
          <g opacity={handOpacity}>
            <path d="M-205 330 C-300 420 -330 640 -250 760 L130 760 C170 640 150 470 140 380 Z" fill="url(#skin)" />
            <rect x={-300} y={-10} width={110} height={300} rx={55} transform="rotate(-18 -245 140)" fill="url(#skin)" />
          </g>
          {/* glow from the screen */}
          <rect x={-PHONE.w / 2 - 30} y={-PHONE.h / 2 - 30} width={PHONE.w + 60} height={PHONE.h + 60} rx={90} fill="#4fa8ff" opacity={0.1 + glow * 0.25} filter="url(#blur20)" />
          <rect x={-PHONE.w / 2} y={-PHONE.h / 2} width={PHONE.w} height={PHONE.h} rx={PHONE.r} fill="url(#body)" stroke="#8fa3c7" strokeWidth={2} />
          <g clipPath={`url(#${sid}-scr)`}>
            {screen === "home" ? (
              <HomeScreen pressed={press} />
            ) : (
              <g transform={`translate(${-SCREEN.w / 2} ${-SCREEN.h / 2})`}>
                <MapView w={SCREEN.w} h={SCREEN.h} zoom={mapZoom} cx={0} cy={0} dot={{ mx: 0, my: 0, show: dotShow, pulse, acc: 60 }} route={0} />
              </g>
            )}
            {press > 0.02 && <circle cx={MAPS_ICON.x} cy={MAPS_ICON.y} r={24 + 60 * (1 - press)} fill="#fff" opacity={0.35 * press} />}
          </g>
          <rect x={-PHONE.w / 2 + 130} y={-PHONE.h / 2 + 26} width={160} height={30} rx={15} fill="#04060c" />
          {/* fingertips of the holding hand (right edge), in front of the body */}
          <g opacity={handOpacity}>
            {[-170, -70, 30, 130].map((y, i) => (
              <rect key={i} x={PHONE.w / 2 - 34} y={y} width={70} height={86} rx={35} fill="url(#skin)" />
            ))}
          </g>
          {screen === "home" && tap > 0 && tap < 1 && <Finger tip={tip} press={press} />}
        </g>
      </g>
    </svg>
  );
};

// ───────────────────────── shots
export const S01: React.FC = () => {
  const { t, dur } = useShot();
  return <HandPhone tap={clamp01((t - 0.15) / (dur - 0.3))} screen="home" scale={1} />;
};

/** The same phone, screen now a map; the blue location dot lands almost instantly. */
export const S02: React.FC = () => {
  const { t } = useShot();
  const zoomIn = easeInOut(clamp01(t / 2.2));
  const dotShow = easeOutBack(clamp01((t - 0.35) / 0.5));
  const pulse = (t * 1.1) % 1;
  return <HandPhone tap={1} screen="map" mapZoom={lerp(1.6, 3.2, easeOutCubic(clamp01(t / 0.9)))} dotShow={dotShow} pulse={t > 0.7 ? pulse : 0} scale={lerp(1.0, 1.5, zoomIn)} focus={[lerp(0, 0, zoomIn), 0]} glow={1} />;
};

/** Dive into the screen: the phone grows until the map fills the frame, then the map keeps zooming. */
export const S03: React.FC = () => {
  const { t, dur, p } = useShot();
  const a = easeInOut(clamp01(p / 0.55));
  const scale = lerp(1.5, 4.9, a);
  const mapFade = smoothstep(0.42, 0.66, p);
  const zoom = lerp(15, 110, easeInOut(clamp01((p - 0.4) / 0.6)));
  const pulse = (t * 1.1) % 1;
  return (
    <>
      <HandPhone tap={1} screen="map" mapZoom={3.2} dotShow={1} pulse={pulse} scale={scale} focus={[-70 * a, 0]} glow={1} handOpacity={1 - a} />
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0, opacity: mapFade }}>
        <MapView w={WIDTH} h={HEIGHT} zoom={zoom} cx={0} cy={0} rot={-8 * (1 - clamp01(p / 0.6))} dot={{ mx: 0, my: 0, show: 1, pulse, acc: 60 + zoom * 1.2 }} />
        <rect width={WIDTH} height={HEIGHT} fill="#fff" opacity={smoothstep(0.9, 1, p) * 0.6} />
      </svg>
      <span style={{ display: "none" }}>{dur}</span>
    </>
  );
};

/** Callback shot near the end: the phone again, mirroring the opening. */
export const S47: React.FC = () => {
  const { t } = useShot();
  const pulse = (t * 1.1) % 1;
  return <HandPhone tap={1} screen="map" mapZoom={3.2} dotShow={1} pulse={pulse} scale={lerp(1.0, 1.12, clamp01(t / 2.3))} glow={1} />;
};
