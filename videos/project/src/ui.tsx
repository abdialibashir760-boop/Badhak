import React, { createContext, CSSProperties, useContext } from "react";
import { Audio, Easing, Img, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { C, F, FPS, H, W } from "./theme";

export type SceneData = { id: string; title: string; start: number; dur: number; sentences: { text: string; start: number; dur: number }[] };
type ScCtxT = { sc: SceneData; S: (i: number) => number; E: (i: number) => number; D: number };
export const ScCtx = createContext<ScCtxT>(null as unknown as ScCtxT);
export const useSc = () => useContext(ScCtx);
export const LangCtx = createContext<{ locale: string; silhouette: string }>({ locale: "en-US", silhouette: "Illustrative silhouette" });
export const useT = () => useCurrentFrame() / FPS;

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = Easing.out(Easing.cubic);

/* ---------- sound effects ---------- */
const SFX_DUR: Record<string, number> = { thud: 1.2, stamp: 0.9, tick: 0.1, clank: 0.6, whoosh: 1.8, cannon: 3, swell: 4, whistle: 3.5, rail: 8, shutter: 0.3 };
export const Sfx: React.FC<{ n: keyof typeof SFX_DUR; at: number; v?: number }> = ({ n, at, v = 0.7 }) => (
  <Sequence from={Math.round(at * FPS)} durationInFrames={Math.round(SFX_DUR[n] * FPS)} layout="none">
    <Audio src={staticFile(`sfx/${n}.wav`)} volume={v} />
  </Sequence>
);

/* ---------- reveal helpers ---------- */
export const Show: React.FC<{
  from: number; to?: number; y?: number; x?: number; dur?: number; style?: CSSProperties; children: React.ReactNode;
}> = ({ from, to, y = 18, x = 0, dur = 0.5, style, children }) => {
  const t = useT();
  if (t < from || (to !== undefined && t > to + 0.6)) return null;
  const a = ease(clamp((t - from) / dur));
  const b = to !== undefined ? clamp((to - t) / 0.5) : 1;
  return (
    <div style={{ position: "absolute", opacity: Math.min(a, b), transform: `translate(${(1 - a) * x}px, ${(1 - a) * y}px)`, ...style }}>{children}</div>
  );
};

export const Big: React.FC<{
  lines: string[]; from: number; to?: number; size?: number; color?: string; style?: CSSProperties; font?: string; gap?: number; align?: "left" | "center" | "right";
}> = ({ lines, from, to, size = 84, color = C.white, style, font = F.head, gap = 0.22, align = "center" }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < from || (to !== undefined && t > to + 0.6)) return null;
  const b = to !== undefined ? clamp((to - t) / 0.5) : 1;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, textAlign: align, opacity: b, ...style }}>
      {lines.map((l, i) => {
        const s = spring({ frame: frame - (from + i * gap) * FPS, fps: FPS, config: { damping: 16, stiffness: 140 } });
        return (
          <div key={i} style={{ overflow: "hidden", lineHeight: 1.05, padding: "0 20px" }}>
            <div style={{
              transform: `translateY(${(1 - s) * 105}%)`, fontFamily: font, fontWeight: 700, fontSize: size, color, letterSpacing: 3,
              textTransform: "uppercase", textShadow: "0 4px 0 rgba(0,0,0,.6), 0 0 30px rgba(0,0,0,.7)",
            }}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Typer: React.FC<{
  text: string; from: number; to?: number; cps?: number; size?: number; color?: string; style?: CSSProperties; align?: "left" | "center";
}> = ({ text, from, to, cps = 26, size = 40, color = C.paper, style, align = "left" }) => {
  const t = useT();
  if (t < from || (to !== undefined && t > to + 0.6)) return null;
  const n = Math.min(text.length, Math.floor((t - from) * cps));
  const b = to !== undefined ? clamp((to - t) / 0.5) : 1;
  const caret = n < text.length || Math.floor(t * 2) % 2 === 0;
  return (
    <div style={{ position: "absolute", fontFamily: F.type, fontSize: size, color, textAlign: align, opacity: b, whiteSpace: "pre", textShadow: "0 2px 0 rgba(0,0,0,.6)", ...style }}>
      {text.slice(0, n)}
      <span style={{ opacity: caret ? 1 : 0 }}>▌</span>
    </div>
  );
};

export const Stamp: React.FC<{
  text: string; from: number; to?: number; color?: string; rot?: number; size?: number; style?: CSSProperties;
}> = ({ text, from, to, color = C.red, rot = -6, size = 64, style }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < from || (to !== undefined && t > to + 0.6)) return null;
  const u = clamp((t - from) / 0.16);
  const sc = 2.6 - 1.6 * Easing.out(Easing.quad)(u);
  const b = to !== undefined ? clamp((to - t) / 0.5) : 1;
  const shake = t - from < 0.3 ? Math.sin((t - from) * 90) * 3 * (1 - (t - from) / 0.3) : 0;
  return (
    <div style={{
      position: "absolute", opacity: u * b, transform: `translate(${shake}px, ${shake}px) rotate(${rot}deg) scale(${sc})`,
      border: `7px solid ${color}`, color, padding: "6px 26px", fontFamily: F.head, fontWeight: 700, fontSize: size, letterSpacing: 6,
      textTransform: "uppercase", background: "rgba(0,0,0,.35)", borderRadius: 6, whiteSpace: "nowrap", ...style,
    }}>{text}</div>
  );
};

export const Paper: React.FC<{ from: number; to?: number; style?: CSSProperties; rot?: number; children: React.ReactNode }> = ({ from, to, style, rot = 0, children }) => (
  <Show from={from} to={to} y={40} style={{ ...style }}>
    <div style={{
      background: `linear-gradient(135deg, ${C.paper}, #d8cba8)`, color: C.ink, padding: "22px 28px", borderRadius: 3,
      boxShadow: "0 18px 40px rgba(0,0,0,.65)", transform: `rotate(${rot}deg)`, fontFamily: F.type, fontSize: 24, lineHeight: 1.35, border: "1px solid #b8a97f",
    }}>{children}</div>
  </Show>
);

export const Chapter: React.FC<{ label: string; from?: number }> = ({ label, from = 0.4 }) => (
  <Show from={from} to={from + 4.2} y={0} x={-30} style={{ left: 40, top: 34 }}>
    <div style={{ fontFamily: F.head, fontSize: 22, letterSpacing: 8, color: C.gold, textTransform: "uppercase", borderLeft: `4px solid ${C.gold}`, paddingLeft: 14 }}>{label}</div>
  </Show>
);

export const Note: React.FC<{ text: string; from?: number; to?: number }> = ({ text, from = 0.5, to }) => (
  <Show from={from} to={to} y={0} style={{ right: 34, top: 36 }}>
    <div style={{ fontFamily: F.head, fontSize: 15, letterSpacing: 2, color: C.grey, textTransform: "uppercase", textAlign: "right", maxWidth: 420 }}>{text}</div>
  </Show>
);

/* ---------- silhouette portrait plate (no real likeness) ---------- */
export const Bust: React.FC<{
  name: string; role: string; from: number; to?: number; style?: CSSProperties; hue?: string; hat?: boolean;
}> = ({ name, role, from, to, style, hue = "#7a6a4a", hat = false }) => (
  <Show from={from} to={to} y={30} style={style}>
    <div style={{ width: 250, background: "#14120f", border: `3px solid ${C.paper}`, boxShadow: "0 16px 36px rgba(0,0,0,.7)" }}>
      <svg width={244} height={250} viewBox="0 0 244 250">
        <defs>
          <linearGradient id={`bg-${name.replace(/[^A-Za-z]/g, "")}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={hue} /><stop offset="1" stopColor="#1c1710" /></linearGradient>
          <pattern id={`dots-${name.replace(/[^A-Za-z]/g, "")}`} width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.1" fill="#000" opacity=".25" /></pattern>
        </defs>
        <rect width="244" height="250" fill={`url(#bg-${name.replace(/[^A-Za-z]/g, "")})`} />
        <path d="M22 250 C28 190 70 170 122 170 C174 170 216 190 222 250Z" fill="#0f0d0a" />
        <ellipse cx="122" cy="112" rx="46" ry="56" fill="#0f0d0a" />
        {hat && <path d="M60 78 Q122 30 184 78 L184 90 Q122 70 60 90Z" fill="#0f0d0a" />}
        <rect width="244" height="250" fill={`url(#dots-${name.replace(/[^A-Za-z]/g, "")})`} />
      </svg>
      <div style={{ padding: "10px 12px 12px", background: C.paper, color: C.ink }}>
        <div style={{ fontFamily: F.head, fontWeight: 700, fontSize: 24, letterSpacing: 1.5, textTransform: "uppercase", lineHeight: 1.1 }}>{name}</div>
        <div style={{ fontFamily: F.type, fontSize: 15, marginTop: 3 }}>{role}</div>
      </div>
    </div>
    <div style={{ fontFamily: F.head, fontSize: 11, letterSpacing: 2, color: C.grey, marginTop: 4, textTransform: "uppercase" }}>{useContext(LangCtx).silhouette}</div>
  </Show>
);

export const Bars: React.FC<{
  items: { label: string; value: number; color: string; from: number }[]; max: number; from: number; to?: number; w?: number; h?: number; style?: CSSProperties; unit?: string;
}> = ({ items, max, from, to, w = 760, h = 360, style, unit = "" }) => {
  const frame = useCurrentFrame();
  const { locale } = useContext(LangCtx);
  const t = frame / FPS;
  if (t < from || (to !== undefined && t > to + 0.6)) return null;
  const b = to !== undefined ? clamp((to - t) / 0.5) : 1;
  const bw = w / items.length - 24;
  return (
    <div style={{ position: "absolute", width: w, height: h + 110, opacity: b, ...style }}>
      <svg width={w} height={h + 110}>
        <g transform="translate(0,40)">
        <line x1={0} y1={h} x2={w} y2={h} stroke={C.grey} strokeWidth={2} />
        {items.map((it, i) => {
          const u = ease(clamp((t - it.from) / 0.9));
          const bh = (it.value / max) * h * u;
          const x = i * (w / items.length) + 12;
          return (
            <g key={i}>
              <rect x={x} y={h - bh} width={bw} height={bh} fill={it.color} stroke="#000" strokeWidth={2} />
              {u > 0.2 && <text x={x + bw / 2} y={h - bh - 12} textAnchor="middle" fill={C.white} fontFamily={F.head} fontSize={30} fontWeight={700} opacity={u}>{Math.round(it.value * u).toLocaleString(locale)}{unit}</text>}
              <text x={x + bw / 2} y={h + 36} textAnchor="middle" fill={C.paper} fontFamily={F.head} fontSize={26} letterSpacing={3}>{it.label}</text>
            </g>
          );
        })}
        </g>
      </svg>
    </div>
  );
};

export const Count: React.FC<{ value: number; from: number; to?: number; suffix?: string; prefix?: string; size?: number; color?: string; style?: CSSProperties; dur?: number }> = ({
  value, from, to, suffix = "", prefix = "", size = 100, color = C.gold, style, dur = 1.6,
}) => {
  const t = useT();
  const { locale } = useContext(LangCtx);
  const u = ease(clamp((t - from) / dur));
  return (
    <Show from={from} to={to} style={style}>
      <div style={{ whiteSpace: "nowrap", fontFamily: F.head, fontWeight: 700, fontSize: size, color, letterSpacing: 2, textShadow: "0 4px 0 rgba(0,0,0,.6), 0 0 40px rgba(230,181,60,.35)" }}>
        {prefix}{Math.round(value * u).toLocaleString(locale)}{suffix}
      </div>
    </Show>
  );
};

export const Fog: React.FC<{ from: number; to?: number; opacity?: number }> = ({ from, to, opacity = 0.5 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < from || (to !== undefined && t > to + 0.6)) return null;
  const a = clamp((t - from) / 2) * (to !== undefined ? clamp((to - t) / 0.6) : 1) * opacity;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a, pointerEvents: "none" }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{
          position: "absolute", left: ((i * 330 + frame * (0.6 + i * 0.15)) % (W + 600)) - 300, top: 80 + i * 150, width: 600, height: 260,
          background: "radial-gradient(closest-side, rgba(200,200,210,.35), transparent)", filter: "blur(10px)",
        }} />
      ))}
    </div>
  );
};

/* ---------- vector icons ---------- */
export const Rock: React.FC<{ size?: number; rot?: number }> = ({ size = 300, rot = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 300 300" style={{ transform: `rotate(${rot}deg)` }}>
    <defs>
      <linearGradient id="rk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5b5a55" /><stop offset=".55" stopColor="#2b2a27" /><stop offset="1" stopColor="#121210" /></linearGradient>
    </defs>
    <polygon points="40,190 70,100 140,50 220,70 262,140 240,225 160,262 80,250" fill="url(#rk)" stroke="#000" strokeWidth="4" />
    <polygon points="70,100 140,50 150,130 100,160" fill="#6a6962" opacity=".7" />
    <polygon points="140,50 220,70 262,140 150,130" fill="#3f3e39" opacity=".9" />
    <polygon points="150,130 262,140 240,225 170,200" fill="#1a1917" opacity=".9" />
    {[[110, 120], [180, 100], [200, 170], [130, 210], [90, 180], [230, 120]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3 + (i % 3)} fill="#d9d6cc" opacity=".7" />)}
  </svg>
);

export const Locomotive: React.FC<{ size?: number; color?: string }> = ({ size = 260, color = "#d8d4c8" }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 260 130">
    <rect x="30" y="40" width="130" height="50" rx="8" fill={color} stroke="#000" strokeWidth="4" />
    <rect x="150" y="26" width="70" height="64" rx="6" fill={color} stroke="#000" strokeWidth="4" />
    <rect x="164" y="38" width="34" height="26" fill="#222" />
    <rect x="46" y="22" width="26" height="22" fill={color} stroke="#000" strokeWidth="4" />
    <rect x="222" y="82" width="24" height="12" fill="#444" />
    <rect x="20" y="90" width="210" height="10" fill="#333" />
    {[60, 110, 170, 210].map((x) => <circle key={x} cx={x} cy={104} r={17} fill="#171717" stroke="#aaa" strokeWidth="4" />)}
  </svg>
);

export const Wagon: React.FC<{ size?: number; color?: string }> = ({ size = 200, color = "#6b4a32" }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 200 100">
    <rect x="10" y="20" width="180" height="48" fill={color} stroke="#000" strokeWidth="4" />
    {[50, 90, 130].map((x) => <line key={x} x1={x} y1={20} x2={x} y2={68} stroke="#000" strokeWidth="3" />)}
    {[40, 160].map((x) => <circle key={x} cx={x} cy={78} r={13} fill="#171717" stroke="#aaa" strokeWidth="3" />)}
  </svg>
);

export const Banknote: React.FC<{ size?: number }> = ({ size = 260 }) => (
  <svg width={size} height={size * 0.55} viewBox="0 0 260 143">
    <rect x="3" y="3" width="254" height="137" fill="#e9e4cf" stroke="#2d2a20" strokeWidth="4" />
    <rect x="14" y="14" width="232" height="115" fill="none" stroke="#6b6650" strokeWidth="2" />
    <circle cx="130" cy="72" r="34" fill="none" stroke="#6b6650" strokeWidth="3" />
    <text x="130" y="84" textAnchor="middle" fontFamily={F.serif} fontSize="38" fill="#3b3828">£5</text>
    <text x="130" y="36" textAnchor="middle" fontFamily={F.type} fontSize="13" fill="#3b3828">BANK OF ENGLAND</text>
    <text x="130" y="122" textAnchor="middle" fontFamily={F.type} fontSize="11" fill="#3b3828">I PROMISE TO PAY THE BEARER</text>
  </svg>
);

export const Tank: React.FC<{ size?: number; color?: string }> = ({ size = 160, color = "#7a7a6c" }) => (
  <svg width={size} height={size * 0.55} viewBox="0 0 160 88">
    <rect x="10" y="48" width="140" height="28" rx="14" fill="#2a2a25" stroke="#000" strokeWidth="3" />
    <rect x="34" y="24" width="80" height="28" rx="4" fill={color} stroke="#000" strokeWidth="3" />
    <rect x="110" y="32" width="48" height="8" fill={color} stroke="#000" strokeWidth="3" />
    {[28, 56, 84, 112, 134].map((x) => <circle key={x} cx={x} cy={62} r={8} fill="#555" stroke="#000" strokeWidth="2" />)}
  </svg>
);

export const Plane: React.FC<{ size?: number; color?: string }> = ({ size = 160, color = "#8a8a7c" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 160 96">
    <polygon points="8,48 120,40 150,48 120,56" fill={color} stroke="#000" strokeWidth="3" />
    <polygon points="70,44 40,6 56,6 100,42" fill={color} stroke="#000" strokeWidth="3" />
    <polygon points="70,52 40,90 56,90 100,54" fill={color} stroke="#000" strokeWidth="3" />
    <polygon points="14,46 4,28 16,28 28,44" fill={color} stroke="#000" strokeWidth="3" />
  </svg>
);

export const Envelope: React.FC<{ size?: number }> = ({ size = 60 }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 60 42">
    <rect x="2" y="2" width="56" height="38" fill={C.paper} stroke="#000" strokeWidth="3" />
    <polyline points="2,4 30,24 58,4" fill="none" stroke="#000" strokeWidth="3" />
  </svg>
);

export const Strike: React.FC<{ from: number; to?: number; w?: number; style?: CSSProperties }> = ({ from, to, w = 420, style }) => {
  const t = useT();
  if (t < from || (to !== undefined && t > to)) return null;
  const u = ease(clamp((t - from) / 0.35));
  return <div style={{ position: "absolute", height: 10, width: w * u, background: C.red, boxShadow: "0 0 18px rgba(207,58,46,.7)", transform: "rotate(-3deg)", ...style }} />;
};

export const Black: React.FC<{ from: number; to?: number }> = ({ from, to }) => {
  const t = useT();
  const a = clamp((t - from) / 0.6) * (to !== undefined ? 1 - clamp((t - to) / 0.6) : 1);
  return <div style={{ position: "absolute", inset: 0, background: "#000", opacity: a }} />;
};

export const Dim: React.FC<{ from: number; to?: number; a?: number }> = ({ from, to, a = 0.6 }) => {
  const t = useT();
  const o = clamp((t - from) / 0.7) * (to !== undefined ? 1 - clamp((t - to) / 0.7) : 1) * a;
  return <div style={{ position: "absolute", inset: 0, background: "#000", opacity: o }} />;
};

export const Center: React.FC<{ children: React.ReactNode; top?: number; style?: CSSProperties }> = ({ children, top = H / 2, style }) => (
  <div style={{ position: "absolute", left: 0, width: W, top, display: "flex", justifyContent: "center", ...style }}>{children}</div>
);

export const Veil: React.FC<{ until: number }> = ({ until }) => {
  const t = useT();
  const o = t < until ? 1 : 1 - clamp((t - until) / 1.2);
  if (o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, background: "#000", opacity: o }} />;
};

/* ---------- real archival photograph with documentary treatment ---------- */
export const Photo: React.FC<{
  src: string; from: number; to?: number; w: number; h: number; style?: CSSProperties; caption?: string; credit?: string;
  rot?: number; color?: boolean; pos?: string; zoom?: number;
}> = ({ src, from, to, w, h, style, caption, credit, rot = 0, color = false, pos = "50% 50%", zoom = 0.1 }) => {
  const t = useT();
  const z = 1 + zoom * clamp((t - from) / 14);
  return (
    <Show from={from} to={to} y={30} style={style}>
      <div style={{ width: w + 20, background: "#efe8d6", padding: 10, boxShadow: "0 18px 40px rgba(0,0,0,.75)", transform: `rotate(${rot}deg)` }}>
        <div style={{ width: w, height: h, overflow: "hidden", position: "relative", background: "#000" }}>
          <Img src={staticFile(`img/${src}.jpg`)} style={{
            width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${z})`,
            filter: color ? "contrast(1.05) saturate(.9)" : "grayscale(1) contrast(1.08) sepia(.2)",
          }} />
          {caption && (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "22px 12px 8px", background: "linear-gradient(transparent, rgba(0,0,0,.82))" }}>
              <div style={{ fontFamily: F.head, fontWeight: 500, fontSize: 17, letterSpacing: 1.2, color: C.white, textTransform: "uppercase", lineHeight: 1.15 }}>{caption}</div>
              {credit && <div style={{ fontFamily: F.head, fontSize: 11, letterSpacing: 1, color: C.grey, marginTop: 2 }}>{credit}</div>}
            </div>
          )}
        </div>
      </div>
    </Show>
  );
};
