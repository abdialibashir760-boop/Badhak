import React from "react";
import {
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { COLORS, Scene, Visual } from "./script";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- shared pieces ----------

const Car: React.FC<{
  x: number;
  y: number;
  scale?: number;
  body?: string;
  headlight?: string;
  rot?: number;
}> = ({ x, y, scale = 1, body = "#4a5470", headlight = "#ffe9a8", rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <path
      d="M-230 0 L-200 -70 Q-170 -120 -90 -122 L70 -122 Q150 -118 190 -62 L240 -30 L240 40 L-230 40 Z"
      fill={body}
    />
    <path
      d="M-170 -62 Q-150 -98 -90 -98 L-10 -98 L-10 -62 Z M10 -98 L70 -98 Q125 -96 150 -62 L10 -62 Z"
      fill="#1b2236"
    />
    <circle cx={-130} cy={42} r={44} fill="#0e121c" />
    <circle cx={-130} cy={42} r={20} fill="#6a738c" />
    <circle cx={130} cy={42} r={44} fill="#0e121c" />
    <circle cx={130} cy={42} r={20} fill="#6a738c" />
    <rect x={206} y={-26} width={34} height={22} rx={8} fill={headlight} />
  </g>
);

const Bike: React.FC<{ x: number; y: number; scale?: number; color?: string }> = ({
  x,
  y,
  scale = 1,
  color = "#ff7a3d",
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={color} strokeWidth={8} fill="none">
    <circle cx={-60} cy={0} r={42} stroke="#cfd6ea" />
    <circle cx={60} cy={0} r={42} stroke="#cfd6ea" />
    <path d="M-60 0 L-15 -60 L45 -60 L60 0 M-15 -60 L10 0 L-60 0 M45 -60 L35 -85" />
  </g>
);

const Sparkles: React.FC<{ n: number; color: string; w: number; h: number; seed: string }> = ({
  n,
  color,
  w,
  h,
  seed,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const x = random(`${seed}x${i}`) * w;
        const y = random(`${seed}y${i}`) * h;
        const r = 3 + random(`${seed}r${i}`) * 7;
        const tw = 0.5 + 0.5 * Math.sin(frame / 5 + i * 1.7);
        return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={0.35 + 0.65 * tw} />;
      })}
    </>
  );
};

const Backdrop: React.FC<{ detective: boolean }> = ({ detective }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: detective
        ? "radial-gradient(ellipse at 50% 40%, #28508f 0%, #14264a 55%, #0a1226 100%)"
        : "radial-gradient(ellipse at 50% 40%, #3a4258 0%, #1d2234 55%, #0c0f19 100%)",
    }}
  />
);

const Road: React.FC<{ offset?: number }> = ({ offset = 0 }) => (
  <g>
    <rect x={0} y={1000} width={1080} height={420} fill="#171c2b" />
    {Array.from({ length: 8 }).map((_, i) => (
      <rect
        key={i}
        x={((i * 220 - offset) % 1760) - 220}
        y={1200}
        width={120}
        height={12}
        fill="#8d97b3"
        opacity={0.7}
      />
    ))}
  </g>
);

// ---------- scenes ----------

const House: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.6 + 0.4 * Math.sin(frame / 12);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(540 980)">
        <polygon points="-380,-40 0,-230 380,-40 0,150" fill="#1d2640" />
        <polygon points="-380,-40 -380,120 0,310 0,150" fill="#26304f" />
        <polygon points="380,-40 380,120 0,310 0,150" fill="#1a2240" />
        <polygon points="-300,-30 0,-180 300,-30 0,120" fill="#3b2a22" />
        <polygon points="-120,-30 -20,-80 80,-30 -20,20" fill="#8d2f3a" />
        <polygon points="40,40 140,-10 240,40 140,90" fill="#2d6b52" />
        <circle cx={-40} cy={-100} r={22} fill={COLORS.yellow} opacity={glow} />
        <polyline
          points="-380,-40 0,150 380,-40"
          fill="none"
          stroke={COLORS.yellow}
          strokeWidth={6}
          strokeDasharray="22 14"
        />
        <polyline
          points="-380,120 0,310 380,120"
          fill="none"
          stroke={COLORS.yellow}
          strokeWidth={6}
          strokeDasharray="22 14"
        />
      </g>
      <Sparkles n={20} color="#ffffff" w={1080} h={1920} seed="house" />
    </svg>
  );
};

const RoadScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const hitT = 0.45;
  const carX = interpolate(t, [0, hitT, 1], [-300, 520, 1500], {
    easing: Easing.in(Easing.quad),
    ...clamp,
  });
  const bikeX = t < hitT ? 640 : interpolate(t, [hitT, 1], [640, 900], clamp);
  const bikeRot = t < hitT ? 0 : interpolate(t, [hitT, hitT + 0.2], [0, -70], clamp);
  const bikeY = t < hitT ? 1150 : interpolate(t, [hitT, hitT + 0.2], [1150, 960], clamp);
  const flash = interpolate(t, [hitT, hitT + 0.03, hitT + 0.12], [0, 0.55, 0], clamp);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <Road offset={frame * 14} />
      <g transform={`rotate(${bikeRot} ${bikeX} ${bikeY})`}>
        <Bike x={bikeX} y={bikeY} scale={1.3} />
      </g>
      <Car x={carX} y={1130} scale={1.5} />
      <rect width={1080} height={1920} fill="#fff" opacity={flash} />
    </svg>
  );
};

const GlassScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <Road />
      {Array.from({ length: 26 }).map((_, i) => {
        const x = 140 + random(`gx${i}`) * 800;
        const y = 1030 + random(`gy${i}`) * 330;
        const s = 10 + random(`gs${i}`) * 30;
        const a = random(`ga${i}`) * 360;
        const appear = interpolate(frame, [i * 2, i * 2 + 10], [0, 1], clamp);
        return (
          <polygon
            key={i}
            transform={`translate(${x} ${y}) rotate(${a}) scale(${appear})`}
            points={`0,${-s} ${s * 0.8},${s * 0.6} ${-s * 0.5},${s * 0.4}`}
            fill={COLORS.glow}
            opacity={0.55 + 0.4 * Math.sin(frame / 6 + i)}
            style={{ filter: "drop-shadow(0 0 10px #4fd8ff)" }}
          />
        );
      })}
      {/* magnifier */}
      <g transform={`translate(${540 + Math.sin(frame / 25) * 120} 1180)`}>
        <circle r={150} fill="rgba(140,230,255,0.12)" stroke="#e8f6ff" strokeWidth={14} />
        <line x1={106} y1={106} x2={230} y2={230} stroke="#e8f6ff" strokeWidth={22} strokeLinecap="round" />
      </g>
    </svg>
  );
};

const SwapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const swapped = t > 0.5;
  const shake = swapped ? 0 : Math.sin(frame * 2) * 3;
  const pulse = swapped ? 0.5 + 0.5 * Math.sin(frame / 4) : 0;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <Road />
      <Car x={500 + shake} y={1050} scale={1.55} headlight={swapped ? "#ffffff" : "#6b5a3a"} />
      {!swapped && (
        <polygon points="760,1000 790,1030 750,1050" fill="#6b5a3a" opacity={0.8} />
      )}
      {swapped && (
        <circle cx={870} cy={1000} r={60 + pulse * 40} fill="#fff" opacity={0.25 + pulse * 0.2} />
      )}
    </svg>
  );
};

const MatchScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const join = interpolate(t, [0.25, 0.7], [1, 0], { easing: Easing.out(Easing.cubic), ...clamp });
  const glow = interpolate(t, [0.7, 0.8], [0, 1], clamp);
  const shard = (flip: boolean) => (
    <polygon
      points="0,-150 130,-40 80,150 -90,110 -120,-20"
      fill={COLORS.glow}
      opacity={0.9}
      transform={flip ? "scale(-1 1)" : undefined}
    />
  );
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${540 - 140 - join * 240} 960)`}>{shard(false)}</g>
      <g transform={`translate(${540 + 140 + join * 240} 960)`}>{shard(true)}</g>
      <circle
        cx={540}
        cy={960}
        r={260}
        fill="none"
        stroke={COLORS.yellow}
        strokeWidth={8}
        opacity={glow}
        style={{ filter: "drop-shadow(0 0 24px #ffcf2e)" }}
      />
      <Sparkles n={26} color="#ffffff" w={1080} h={1920} seed="match" />
    </svg>
  );
};

const WashScene: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = Math.sin(frame / 6) * 70;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <Road />
      <Car x={500} y={1050} scale={1.55} body="#5a6788" />
      <g transform={`translate(${760 + sweep} 1020)`}>
        <rect x={-50} y={-30} width={100} height={60} rx={14} fill="#f2c94c" />
      </g>
      {Array.from({ length: 24 }).map((_, i) => {
        const x = 200 + random(`bx${i}`) * 700;
        const base = 900 + random(`by${i}`) * 300;
        const y = base - ((frame * (1 + random(`bv${i}`) * 2)) % 220);
        return (
          <circle key={i} cx={x} cy={y} r={8 + random(`br${i}`) * 18} fill="none" stroke="#cfe8ff" strokeWidth={3} opacity={0.7} />
        );
      })}
    </svg>
  );
};

const PaintScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <path d="M140 1250 L140 1000 Q540 560 940 1000 L940 1250 Z" fill="#1a2238" />
      <path d="M200 1250 L200 1030 Q540 690 880 1030 L880 1250" fill="none" stroke="#0a0f1c" strokeWidth={90} />
      <circle cx={540} cy={1000} r={230} fill="#0d1322" />
      <circle cx={540} cy={1000} r={120} fill="#6a738c" />
      {Array.from({ length: 34 }).map((_, i) => {
        const a = Math.PI * (1.05 + random(`pa${i}`) * 0.9);
        const r = 330 + random(`pr${i}`) * 110;
        const x = 540 + Math.cos(a) * r;
        const y = 1010 + Math.sin(a) * r;
        const on = 0.55 + 0.45 * Math.sin(frame / 5 + i);
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={10 + random(`pw${i}`) * 22}
            height={6 + random(`ph${i}`) * 10}
            fill="#ff7a3d"
            opacity={on}
            style={{ filter: "drop-shadow(0 0 8px #ff9a5a)" }}
          />
        );
      })}
    </svg>
  );
};

const ShopScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <rect x={0} y={1160} width={1080} height={300} fill="#12151f" />
      <rect x={90} y={760} width={900} height={420} fill="#232b40" stroke="#38425f" strokeWidth={6} />
      <rect x={150} y={820} width={340} height={360} fill="#0e1220" />
      <text x={540} y={730} fontSize={64} fontWeight={900} fill={COLORS.yellow} textAnchor="middle" fontFamily="Arial">
        QUICK FIX AUTO
      </text>
      <Car x={330} y={1100} scale={0.8} />
      {[0, 1, 2].map((i) => {
        const y = 1020 - ((frame * 3 + i * 40) % 160);
        return (
          <g key={i} transform={`translate(${720 + i * 60} ${y}) rotate(${i * 12 - 12})`}>
            <rect x={-50} y={-26} width={100} height={52} rx={6} fill="#4bc27d" />
            <circle r={14} fill="#2b8a58" />
          </g>
        );
      })}
    </svg>
  );
};

const RecorderScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const draw = interpolate(t, [0.1, 0.75], [0, 1], clamp);
  const pts = Array.from({ length: 41 }).map((_, i) => {
    const u = i / 40;
    const speed = u < 0.55 ? 0.78 + Math.sin(u * 14) * 0.02 : 0.78 - (u - 0.55) * 1.6;
    return [140 + u * 800, 1230 - speed * 520] as const;
  });
  const shown = pts.slice(0, Math.max(2, Math.round(pts.length * draw)));
  const d = shown.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <rect x={100} y={650} width={880} height={640} rx={26} fill="#0d1527" stroke="#38507f" strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={140} x2={940} y1={760 + i * 120} y2={760 + i * 120} stroke="#22304f" strokeWidth={2} />
      ))}
      <text x={140} y={720} fill="#8fb4ff" fontSize={34} fontFamily="monospace">
        SPEED KM/H
      </text>
      <path d={d} fill="none" stroke={COLORS.cyan} strokeWidth={10} style={{ filter: "drop-shadow(0 0 10px #4fd8ff)" }} />
      <line
        x1={140 + 0.78 * 800}
        x2={140 + 0.78 * 800}
        y1={740}
        y2={1250}
        stroke={COLORS.red}
        strokeWidth={6}
        strokeDasharray="12 10"
        opacity={draw > 0.9 ? 1 : 0}
      />
      <text x={140 + 0.78 * 800} y={1285} fill={COLORS.red} fontSize={32} fontFamily="monospace" textAnchor="middle" opacity={draw > 0.9 ? 1 : 0}>
        IMPACT
      </text>
    </svg>
  );
};

const CaughtScene: React.FC = () => {
  const frame = useCurrentFrame();
  const trace = 0.5 + 0.5 * Math.sin(frame / 6);
  return (
    <>
      <House />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <ellipse
          cx={440}
          cy={1180}
          rx={120}
          ry={34}
          fill="none"
          stroke={COLORS.glow}
          strokeWidth={8}
          opacity={0.5 + trace * 0.5}
          style={{ filter: "drop-shadow(0 0 18px #4fd8ff)" }}
        />
      </svg>
    </>
  );
};

const VISUALS: Record<Visual, React.FC> = {
  house: House,
  road: RoadScene,
  glass: GlassScene,
  swap: SwapScene,
  match: MatchScene,
  wash: WashScene,
  paint: PaintScene,
  shop: ShopScene,
  recorder: RecorderScene,
  caught: CaughtScene,
};

export const SceneVisual: React.FC<{ scene: Scene }> = ({ scene }) => {
  const V = VISUALS[scene.visual];
  const detective = scene.side === "detectives";
  return (
    <>
      <Backdrop detective={detective} />
      <V />
    </>
  );
};
