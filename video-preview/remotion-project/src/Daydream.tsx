import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AUDIO_SECONDS, WORDS } from "./narration";

export const DD_FPS = 30;
export const DD_W = 1280;
export const DD_H = 720;
export const DD_FRAMES = Math.ceil(AUDIO_SECONDS * DD_FPS);

const C = {
  bg1: "#0b0820",
  bg2: "#1a1140",
  amber: "#ffb347",
  amberHot: "#ff7a3d",
  pink: "#ff5fa8",
  cyan: "#5ee0ff",
  violet: "#8b6bff",
  cream: "#fff4e0",
  grey: "#6b6f86",
};
const font = '"Poppins","Helvetica Neue",Arial,system-ui,sans-serif';
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// first index of a word (stripped of punctuation) at or after `from`
const idx = (word: string, from = 0) => {
  for (let i = from; i < WORDS.length; i++) {
    if (WORDS[i].w.toLowerCase().replace(/[^a-z-]/g, "") === word) return i;
  }
  return from;
};
const tAt = (i: number) => WORDS[Math.min(i, WORDS.length - 1)].s;

// ---------- scene boundaries (sentence-based, from the transcript) ----------
const B = [0, 25, 48, 94, 133, 161];
const SCENE_T = [...B.map(tAt), AUDIO_SECONDS];

// ---------- primitives ----------
const Glow: React.FC<{ x: number; y: number; r: number; color: string; o?: number }> = ({
  x,
  y,
  r,
  color,
  o = 0.5,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity: o,
    }}
  />
);

const Stars: React.FC<{ n?: number; seed?: string }> = ({ n = 60, seed = "s" }) => {
  const f = useCurrentFrame();
  return (
    <svg width={DD_W} height={DD_H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: n }).map((_, i) => (
        <circle
          key={i}
          cx={random(`${seed}x${i}`) * DD_W}
          cy={random(`${seed}y${i}`) * DD_H}
          r={1 + random(`${seed}r${i}`) * 2.2}
          fill="#fff"
          opacity={0.25 + 0.6 * Math.abs(Math.sin(f / 22 + i))}
        />
      ))}
    </svg>
  );
};

type Pose = "lying" | "sitting" | "standing" | "cheer";

const Person: React.FC<{
  x: number;
  y: number;
  s?: number;
  pose: Pose;
  color?: string;
  phones?: boolean;
}> = ({ x, y, s = 1, pose, color = C.amber, phones }) => {
  const f = useCurrentFrame();
  const breathe = 1 + Math.sin(f / 18) * 0.012;
  const stroke = { stroke: color, strokeWidth: 5, fill: "rgba(255,160,80,0.12)" } as const;
  const glow = { filter: `drop-shadow(0 0 14px ${color})` };
  return (
    <g transform={`translate(${x} ${y}) scale(${s * breathe})`} style={glow}>
      {pose === "lying" && (
        <>
          <rect x={-150} y={-24} width={230} height={48} rx={24} {...stroke} />
          <circle cx={-190} cy={0} r={34} {...stroke} />
          <rect x={70} y={-18} width={100} height={36} rx={18} {...stroke} />
          {phones && <path d="M-224 -4 a34 34 0 0 1 68 0" stroke={C.cream} strokeWidth={6} fill="none" />}
        </>
      )}
      {pose === "sitting" && (
        <>
          <circle cx={0} cy={-120} r={34} {...stroke} />
          <path d="M-46 -78 Q0 -92 46 -78 L56 20 L-56 20 Z" {...stroke} />
          <rect x={-90} y={20} width={180} height={34} rx={17} {...stroke} />
          <rect x={-90} y={54} width={34} height={70} rx={17} {...stroke} />
          <rect x={56} y={54} width={34} height={70} rx={17} {...stroke} />
        </>
      )}
      {pose === "standing" && (
        <>
          <circle cx={0} cy={-150} r={34} {...stroke} />
          <path d="M-42 -108 Q0 -120 42 -108 L38 20 L-38 20 Z" {...stroke} />
          <rect x={-34} y={20} width={28} height={110} rx={14} {...stroke} />
          <rect x={6} y={20} width={28} height={110} rx={14} {...stroke} />
        </>
      )}
      {pose === "cheer" && (
        <>
          <circle cx={0} cy={-150} r={34} {...stroke} />
          <path d="M-42 -108 Q0 -120 42 -108 L38 20 L-38 20 Z" {...stroke} />
          <path d="M-42 -100 L-96 -190 M42 -100 L96 -190" stroke={color} strokeWidth={14} strokeLinecap="round" />
          <rect x={-34} y={20} width={28} height={110} rx={14} {...stroke} />
          <rect x={6} y={20} width={28} height={110} rx={14} {...stroke} />
        </>
      )}
    </g>
  );
};

const Callout: React.FC<{
  text: string;
  atWord: number;
  x: number;
  y: number;
  color?: string;
}> = ({ text, atWord, x, y, color = C.pink }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // scene-local frame: the Sequence starts at the scene start, so convert word time
  const start = Math.round((tAt(atWord) - 0) * fps);
  const { sceneStartFrame } = React.useContext(SceneCtx);
  const s = spring({ frame: f - (start - sceneStartFrame), fps, config: { damping: 13 } });
  if (f < start - sceneStartFrame) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,0) scale(${0.7 + 0.3 * s})`,
        opacity: s,
        padding: "10px 24px",
        borderRadius: 999,
        background: color,
        color: "#fff",
        fontFamily: font,
        fontWeight: 700,
        fontSize: 28,
        letterSpacing: 1,
        boxShadow: `0 8px 30px ${color}88`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

const SceneCtx = React.createContext({ sceneStartFrame: 0 });

// ---------- scenes ----------
const Bubble: React.FC<{ x: number; y: number; r: number; delay: number; color: string; icon: string }> = ({
  x,
  y,
  r,
  delay,
  color,
  icon,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 12 } });
  const bob = Math.sin((f + delay * 3) / 20) * 8;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`} opacity={s}>
      <circle r={r} fill={color} opacity={0.22} stroke={color} strokeWidth={3} />
      <text textAnchor="middle" dominantBaseline="central" fontSize={r * 0.9}>
        {icon}
      </text>
    </g>
  );
};

const SceneBed: React.FC = () => (
  <AbsoluteFill>
    <Glow x={640} y={500} r={420} color={C.violet} o={0.35} />
    <Stars seed="bed" />
    <svg width={DD_W} height={DD_H} style={{ position: "absolute", inset: 0 }}>
      <rect x={200} y={470} width={880} height={36} rx={10} fill="#241a52" />
      <rect x={200} y={506} width={880} height={130} fill="#150f33" />
      <rect x={190} y={400} width={36} height={236} rx={10} fill="#2f2368" />
      <Person x={560} y={430} pose="lying" phones />
      <Bubble x={430} y={250} r={58} delay={40} color={C.pink} icon="🎧" />
      <Bubble x={620} y={190} r={66} delay={80} color={C.cyan} icon="🎬" />
      <Bubble x={830} y={260} r={54} delay={120} color={C.amber} icon="💭" />
      <Bubble x={980} y={170} r={42} delay={170} color={C.violet} icon="✨" />
    </svg>
    <Callout text="MALADAPTIVE DAYDREAMING" atWord={idx("maladaptive")} x={640} y={80} color={C.pink} />
  </AbsoluteFill>
);

const SceneDoor: React.FC = () => {
  const f = useCurrentFrame();
  const open = interpolate(f, [30, 130], [0, 1], { easing: Easing.out(Easing.cubic), ...clamp });
  return (
    <AbsoluteFill>
      <Glow x={900} y={380} r={380 + open * 120} color={C.amber} o={0.2 + open * 0.4} />
      <Stars seed="door" n={40} />
      <svg width={DD_W} height={DD_H} style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={560} width={DD_W} height={160} fill="#120c2c" />
        <g transform="translate(900 560)">
          <rect x={-120} y={-330} width={240} height={330} rx={16} fill="#0a061c" stroke={C.amber} strokeWidth={6} />
          <rect
            x={-120 + 240 * (1 - open) * 0}
            y={-330}
            width={240}
            height={330}
            rx={16}
            fill={`rgba(255,179,71,${0.15 + open * 0.75})`}
          />
          <g transform={`skewY(${-6 * (1 - open)}) scale(${1 - open * 0.85} 1)`} style={{ transformOrigin: "-120px 0" }}>
            <rect x={-120} y={-330} width={240} height={330} rx={16} fill="#2a1d5e" stroke={C.violet} strokeWidth={5} />
            <circle cx={90} cy={-160} r={9} fill={C.amber} />
          </g>
        </g>
        <Person x={420} y={470} pose="sitting" />
        <Bubble x={420} y={250} r={0.01 + 56} delay={20} color={C.cyan} icon="💡" />
      </svg>
      <Callout text="COPING MECHANISM" atWord={idx("coping")} x={420} y={120} color={C.violet} />
      <Callout text="IMAGINATION" atWord={idx("imagination")} x={900} y={90} color={C.amberHot} />
      <Callout text="ESCAPE" atWord={idx("escape")} x={900} y={150} color={C.pink} />
    </AbsoluteFill>
  );
};

const CARDS = [
  { word: "car", icon: "🚗", label: "CAR RIDE", color: C.cyan },
  { word: "song,", icon: "🎵", label: "FAVORITE SONG", color: C.pink },
  { word: "bed,", icon: "🛏️", label: "LYING IN BED", color: C.violet },
  { word: "comeback,", icon: "💬", label: "PERFECT COMEBACK", color: C.amber },
  { word: "argument", icon: "⚡", label: "FUTURE ARGUMENT", color: C.amberHot },
] as const;

const SceneCards: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { sceneStartFrame } = React.useContext(SceneCtx);
  const base = 48;
  const starts = CARDS.map((c) => {
    const k = idx(c.word.replace(/[^a-z]/g, ""), base);
    return Math.round(tAt(k) * fps) - sceneStartFrame;
  });
  let active = 0;
  starts.forEach((s, i) => {
    if (f >= s - 15) active = i;
  });
  const card = CARDS[active];
  const local = f - (starts[active] - 15);
  const pop = spring({ frame: local, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill>
      <Glow x={640} y={330} r={430} color={card.color} o={0.28} />
      <Stars seed="cards" n={50} />
      {/* film strip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 120,
          height: 380,
          background: "#07041a",
          borderTop: "6px dashed #2b2160",
          borderBottom: "6px dashed #2b2160",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 340,
          top: 150,
          width: 600,
          height: 320,
          borderRadius: 26,
          background: `linear-gradient(135deg, ${card.color}55, #1a1140)`,
          border: `4px solid ${card.color}`,
          boxShadow: `0 0 50px ${card.color}77`,
          transform: `scale(${0.85 + 0.15 * pop}) rotate(${(1 - pop) * -4}deg)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 130 }}>{card.icon}</div>
        <div style={{ fontFamily: font, fontWeight: 800, fontSize: 36, color: "#fff", letterSpacing: 3 }}>
          {card.label}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", justifyContent: "center", gap: 14 }}>
        {CARDS.map((c, i) => (
          <div
            key={c.label}
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: i <= active ? c.color : "#2b2160",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const SceneContrast: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { sceneStartFrame } = React.useContext(SceneCtx);
  const swapAt = Math.round(tAt(idx("instead,", 94)) * fps) - sceneStartFrame;
  const dream = interpolate(f, [swapAt - 10, swapAt + 25], [0, 1], clamp);
  return (
    <AbsoluteFill>
      {/* waking world (left) */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 640, height: DD_H, background: "#14122a" }} />
      <svg width={DD_W} height={DD_H} style={{ position: "absolute", inset: 0 }}>
        <rect x={80} y={160} width={200} height={240} fill="#1d1b38" stroke="#2c2a4f" strokeWidth={4} />
        <rect x={0} y={520} width={640} height={200} fill="#0e0c20" />
        <Person x={420} y={400} pose="sitting" color={C.grey} />
        <text x={320} y={110} textAnchor="middle" fill={C.grey} fontFamily={font} fontWeight={700} fontSize={28} letterSpacing={3}>
          WAKING WORLD
        </text>
      </svg>
      {/* daydream (right) */}
      <div style={{ position: "absolute", left: 640, top: 0, width: 640, height: DD_H, background: `linear-gradient(160deg, #2a1a6b, #0b0820)`, opacity: 0.35 + dream * 0.65 }}>
        <Glow x={320} y={300} r={300} color={C.amber} o={0.25 + dream * 0.4} />
      </div>
      <svg width={DD_W} height={DD_H} style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(0 -60)">
        <path d="M640 640 L800 380 L900 480 L1000 300 L1180 640 Z" fill="#241a60" stroke={C.cyan} strokeWidth={4} />
        <Person x={1000} y={300} s={0.55} pose="cheer" color={C.amber} />
        </g>
        {Array.from({ length: 24 }).map((_, i) => (
          <circle
            key={i}
            cx={650 + random(`cx${i}`) * 620}
            cy={30 + random(`cy${i}`) * 260}
            r={2 + random(`cr${i}`) * 3}
            fill="#fff"
            opacity={0.3 + 0.7 * dream * Math.abs(Math.sin(f / 14 + i))}
          />
        ))}
        <text x={960} y={80} textAnchor="middle" fill={C.amber} fontFamily={font} fontWeight={700} fontSize={28} letterSpacing={3}>
          THE STORY
        </text>
      </svg>
      <div style={{ position: "absolute", left: 636, top: 0, width: 8, height: DD_H, background: "#fff", opacity: 0.35 }} />
      <Callout text="COMFORTING… FOR NOW" atWord={idx("comforting")} x={320} y={440} color={C.violet} />
      <Callout text="TEMPORARY RELIEF" atWord={idx("temporary")} x={960} y={440} color={C.pink} />
      <Callout text="ROOT CAUSE REMAINS" atWord={idx("cause")} x={320} y={500} color={C.amberHot} />
    </AbsoluteFill>
  );
};

const SceneClosure: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { sceneStartFrame } = React.useContext(SceneCtx);
  const half = Math.round(tAt(idx("others,", 133)) * fps) - sceneStartFrame;
  const doorClose = interpolate(f, [30, 110], [0, 1], { easing: Easing.inOut(Easing.cubic), ...clamp });
  const heart = spring({ frame: f - half, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill>
      <Stars seed="closure" n={40} />
      {/* left: closure */}
      <svg width={DD_W} height={DD_H} style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(320 430)">
          <rect x={-110} y={-300} width={220} height={300} rx={12} fill="#0a061c" stroke={C.cyan} strokeWidth={5} />
          <rect x={-110} y={-300} width={110 * doorClose} height={300} fill="#2a1d5e" />
          <rect x={110 - 110 * doorClose} y={-300} width={110 * doorClose} height={300} fill="#2a1d5e" />
          <text y={70} textAnchor="middle" fill={C.cyan} fontFamily={font} fontWeight={700} fontSize={30} letterSpacing={3}>
            CLOSURE
          </text>
        </g>
        {/* right: excitement + intimacy */}
        <g transform="translate(960 430)">
          <Person x={-70} y={-10} s={0.8} pose="standing" color={C.amber} />
          <Person x={70} y={-10} s={0.8} pose="standing" color={C.pink} />
          <g transform={`translate(0 -215) scale(${heart})`}>
            <path d="M0 40 C-80 -20 -60 -80 0 -40 C60 -80 80 -20 0 40 Z" fill={C.pink} style={{ filter: `drop-shadow(0 0 20px ${C.pink})` }} />
          </g>
          <text y={125} textAnchor="middle" fill={C.pink} fontFamily={font} fontWeight={700} fontSize={30} letterSpacing={3}>
            EXCITEMENT · INTIMACY
          </text>
        </g>
      </svg>
      <Callout text="FOR SOME" atWord={133} x={320} y={90} color={C.cyan} />
      <Callout text="FOR OTHERS" atWord={idx("others,", 133)} x={960} y={90} color={C.pink} />
    </AbsoluteFill>
  );
};

const SceneOutro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 12 } });
  const beat = 1 + Math.sin(f / 7) * 0.06;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Glow x={640} y={330} r={420} color={C.pink} o={0.35} />
      <Stars seed="outro" n={50} />
      <svg width={DD_W} height={DD_H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(640 190) scale(${s * beat * 2.1})`}>
          <path d="M0 40 C-80 -20 -60 -80 0 -40 C60 -80 80 -20 0 40 Z" fill={C.pink} style={{ filter: `drop-shadow(0 0 24px ${C.pink})` }} />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          top: 330,
          fontFamily: font,
          fontWeight: 800,
          fontSize: 72,
          color: C.cream,
          textAlign: "center",
          opacity: s,
        }}
      >
        Follow for more
        <br />
        <span style={{ color: C.amber }}>heartfelt videos</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- captions (3-word window, active word highlighted) ----------
const KEY = new Set([
  "maladaptive", "daydreaming,", "imagination", "happier,", "escape", "private", "control",
  "comeback,", "argument", "temporary", "relief,", "perfectly,", "closure", "intimacy",
]);

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  let i = 0;
  for (let k = 0; k < WORDS.length; k++) if (t >= WORDS[k].s) i = k;
  if (t < WORDS[0].s - 0.1 || t >= SCENE_T[5]) return null;
  const from = Math.max(0, i - 1);
  const win = WORDS.slice(from, from + 3);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 56,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 30,
          padding: "12px 36px",
          borderRadius: 22,
          background: "rgba(8,5,24,0.72)",
          fontFamily: font,
          fontWeight: 800,
          fontSize: 54,
          textTransform: "uppercase",
        }}
      >
        {win.map((w, j) => {
          const active = from + j === i;
          const key = KEY.has(w.w.toLowerCase());
          return (
            <span
              key={from + j}
              style={{
                color: active ? (key ? C.amber : "#fff") : "rgba(255,255,255,0.45)",
                                textShadow: active ? `0 0 18px ${key ? C.amber : "#ffffff55"}` : "none",
              }}
            >
              {w.w.replace(/[.,]/g, "")}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const SCENES: React.FC[] = [SceneBed, SceneDoor, SceneCards, SceneContrast, SceneClosure, SceneOutro];

export const Daydream: React.FC = () => {
  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(160deg, ${C.bg2}, ${C.bg1})` }}
    >
      <Audio src={staticFile("audio/daydream.mp3")} />
      {SCENES.map((S, i) => {
        const from = Math.round(SCENE_T[i] * DD_FPS);
        const to = Math.round(SCENE_T[i + 1] * DD_FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)} premountFor={DD_FPS}>
            <SceneCtx.Provider value={{ sceneStartFrame: from }}>
              <S />
            </SceneCtx.Provider>
          </Sequence>
        );
      })}
      <Captions />
    </AbsoluteFill>
  );
};
