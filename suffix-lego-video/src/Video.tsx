import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FPS, SCENES, Scene } from "./timing";

// Palette follows the Türkçem design: forest green + warm cream.
const C = {
  cream: "#faf5e9",
  creamDark: "#efe6cf",
  forest: "#2f5d3a",
  forestDark: "#1f3f27",
  clay: "#c8643c",
  gold: "#d9a441",
  sea: "#3f7fa6",
  ink: "#1d2a21",
};
const FONT = "Ubuntu, 'Trebuchet MS', 'DejaVu Sans', Verdana, sans-serif";

const f = (s: number) => Math.round(s * FPS);
const scene = (id: string): Scene => SCENES.find((s) => s.id === id)!;

type BrickDef = { text: string; color: string; w: number; appear: number; leave?: number };

const BRICK_H = 150;
const GAP = 6;

// ---------- Brick ----------
const Brick: React.FC<{ def: BrickDef; x: number; y: number; fromX: number; fromY: number }> = ({ def, x, y, fromX, fromY }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - def.appear;
  if (t < 0) return null;
  const p = spring({ frame: t, fps, config: { damping: 11, stiffness: 150, mass: 0.8 } });
  const leave = def.leave !== undefined ? interpolate(frame, [def.leave, def.leave + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const px = x + (1 - p) * fromX;
  const py = y + (1 - p) * fromY;
  const rot = (1 - p) * 18;
  // click ring right after the snap
  const ringT = t - 12;
  const ring = ringT > 0 && ringT < 16 ? ringT / 16 : -1;
  const studs = Math.max(2, Math.round(def.w / 90));
  return (
    <div style={{ position: "absolute", left: px, top: py, width: def.w, height: BRICK_H, opacity: leave, transform: `rotate(${rot}deg) scale(${0.9 + 0.1 * leave})`, transformOrigin: "center" }}>
      {ring >= 0 && (
        <div style={{ position: "absolute", inset: -8, borderRadius: 30, border: `6px solid ${def.color}`, opacity: 1 - ring, transform: `scale(${1 + ring * 0.35})` }} />
      )}
      {Array.from({ length: studs }).map((_, i) => (
        <div key={i} style={{ position: "absolute", top: -22, left: (def.w / studs) * (i + 0.5) - 26, width: 52, height: 28, borderRadius: "14px 14px 4px 4px", background: def.color, filter: "brightness(1.12)", boxShadow: "inset 0 -4px 0 rgba(0,0,0,.18)" }} />
      ))}
      <div style={{ width: "100%", height: "100%", borderRadius: 24, background: def.color, boxShadow: "inset 0 -10px 0 rgba(0,0,0,.2), 0 14px 24px rgba(31,63,39,.25)", display: "flex", alignItems: "center", justifyContent: "center", color: C.cream, fontFamily: FONT, fontWeight: 800, fontSize: 92, letterSpacing: 1 }}>
        {def.text}
      </div>
    </div>
  );
};

// A centered row of bricks; centre follows the currently built width.
const BrickRow: React.FC<{ defs: BrickDef[]; y: number }> = ({ defs, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const widthOf = (d: BrickDef) => {
    const p = frame < d.appear ? 0 : Math.min(1, spring({ frame: frame - d.appear, fps, config: { damping: 20, stiffness: 120 } }));
    const gone = d.leave !== undefined && frame > d.leave + 10 ? 0 : 1;
    return (d.w + GAP) * p * gone;
  };
  const current = defs.reduce((a, d) => a + widthOf(d), 0);
  const startX = (1080 - current) / 2;
  let acc = 0;
  return (
    <>
      {defs.map((d, i) => {
        const x = startX + acc;
        acc += d.w + GAP;
        const dir = i % 2 === 0 ? -1 : 1;
        return <Brick key={i} def={d} x={x} y={y} fromX={dir * 520} fromY={-520} />;
      })}
    </>
  );
};

// ---------- Houses ----------
const House: React.FC<{ x: number; y: number; appear: number; tag?: number; size?: number }> = ({ x, y, appear, tag, size = 240 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - appear;
  if (t < 0) return null;
  const p = spring({ frame: t, fps, config: { damping: 9, stiffness: 160 } });
  const bob = Math.sin((frame + x) / 14) * 3;
  const tagP = tag !== undefined && frame >= tag ? spring({ frame: frame - tag, fps, config: { damping: 10, stiffness: 170 } }) : 0;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y + bob, width: size, height: size, transform: `scale(${p})`, transformOrigin: "50% 100%" }}>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <rect x="35" y="95" width="130" height="90" rx="8" fill={C.creamDark} stroke={C.forestDark} strokeWidth="6" />
        <path d="M20 100 L100 30 L180 100 Z" fill={C.clay} stroke={C.forestDark} strokeWidth="6" strokeLinejoin="round" />
        <rect x="85" y="130" width="30" height="55" rx="6" fill={C.forest} />
        <rect x="48" y="112" width="26" height="26" rx="4" fill={C.sea} />
        <rect x="126" y="112" width="26" height="26" rx="4" fill={C.sea} />
      </svg>
      {tagP > 0 && (
        <div style={{ position: "absolute", top: -62, left: size / 2 - 52, width: 104, textAlign: "center", transform: `scale(${tagP})`, background: C.gold, color: C.ink, fontFamily: FONT, fontWeight: 800, fontSize: 34, borderRadius: 18, padding: "4px 0", boxShadow: "0 6px 0 rgba(0,0,0,.18)" }}>
          benim
        </div>
      )}
    </div>
  );
};

// ---------- Meaning chip under the bricks ----------
const Chip: React.FC<{ appear: number; text: string; color: string; y: number }> = ({ appear, text, color, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - appear;
  if (t < 0) return null;
  const p = spring({ frame: t, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: y, display: "flex", justifyContent: "center", opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
      <div style={{ background: color, color: C.cream, fontFamily: FONT, fontWeight: 700, fontSize: 46, padding: "16px 36px", borderRadius: 999, boxShadow: "0 8px 0 rgba(0,0,0,.18)" }}>{text}</div>
    </div>
  );
};

// ---------- Captions (one big word at a time, like the reference) ----------
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const sc = SCENES.find((s) => frame >= f(s.start) && frame < f(s.end)) ?? SCENES[SCENES.length - 1];
  const words = sc.tr.split(" ");
  const total = words.reduce((a, w) => a + w.length + 2, 0);
  const local = (frame - f(sc.start)) / (f(sc.end) - f(sc.start));
  // leave a short tail so the last word is held
  const prog = Math.min(0.999, local / 0.92) * total;
  let acc = 0;
  let idx = words.length - 1;
  let wordStart = 0;
  for (let i = 0; i < words.length; i++) {
    const len = words[i].length + 2;
    if (prog < acc + len) {
      idx = i;
      wordStart = acc;
      break;
    }
    acc += len;
  }
  const wordFrames = ((words[idx].length + 2) / total) * (f(sc.end) - f(sc.start)) * 0.92;
  const t = (prog - wordStart) / (words[idx].length + 2);
  const pop = interpolate(t, [0, 0.18], [0.82, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  void wordFrames;
  const w = words[idx];
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1400, textAlign: "center", fontFamily: FONT }}>
      <div style={{ fontSize: 130, fontWeight: 800, color: C.cream, transform: `scale(${pop})`, textShadow: `0 0 0 ${C.ink}, 6px 6px 0 ${C.forestDark}, -3px -3px 0 ${C.forestDark}, 3px -3px 0 ${C.forestDark}, -3px 3px 0 ${C.forestDark}`, minHeight: 150 }}>{w}</div>
      <div style={{ marginTop: 18, fontSize: 44, fontWeight: 600, color: C.forestDark, padding: "0 70px", lineHeight: 1.25 }}>{sc.en}</div>
    </div>
  );
};

// ---------- Progress bar ----------
const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 54, left: 60, right: 60, display: "flex", gap: 10 }}>
      {SCENES.map((s) => {
        const p = interpolate(frame, [f(s.start), f(s.end)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={s.id} style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(31,63,39,.2)", overflow: "hidden" }}>
            <div style={{ width: `${p * 100}%`, height: "100%", background: C.forest }} />
          </div>
        );
      })}
    </div>
  );
};

// ---------- Background ----------
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.cream} 0%, ${C.creamDark} 100%)` }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: (i * 163) % 1080, top: 260 + ((i * 271) % 1300) + Math.sin(frame / 40 + i) * 18, width: 70 + (i % 3) * 40, height: 70 + (i % 3) * 40, borderRadius: "50%", background: i % 2 ? "rgba(63,127,166,.08)" : "rgba(200,100,60,.08)" }} />
      ))}
    </AbsoluteFill>
  );
};

// ---------- Main ----------
export const SuffixLego: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [intro, root, plural, mine, inn, outro] = ["intro", "root", "plural", "mine", "in", "outro"].map(scene);

  const introDefs: BrickDef[] = [
    { text: "ev", color: C.forest, w: 190, appear: 10, leave: f(intro.end) - 14 },
    { text: "ler", color: C.clay, w: 250, appear: 24, leave: f(intro.end) - 14 },
    { text: "im", color: C.gold, w: 190, appear: 38, leave: f(intro.end) - 14 },
    { text: "de", color: C.sea, w: 190, appear: 52, leave: f(intro.end) - 14 },
  ];
  const mainDefs: BrickDef[] = [
    { text: "ev", color: C.forest, w: 190, appear: f(root.start) + 8 },
    { text: "ler", color: C.clay, w: 250, appear: f(plural.start) + 10 },
    { text: "im", color: C.gold, w: 190, appear: f(mine.start) + 10 },
    { text: "de", color: C.sea, w: 190, appear: f(inn.start) + 10 },
  ];

  // whole-word pulse in the outro
  const outroT = frame - f(outro.start);
  const pulse = outroT > 0 ? 1 + 0.06 * Math.sin(outroT / 4) * Math.exp(-outroT / 40) : 1;

  const hx = [250, 540, 830];
  const houseY = 960;
  const boxP = frame >= f(inn.start) + 24 ? spring({ frame: frame - f(inn.start) - 24, fps, config: { damping: 14, stiffness: 100 } }) : 0;

  return (
    <AbsoluteFill>
      <Background />
      <Progress />

      {/* title tag */}
      <div style={{ position: "absolute", top: 110, width: 1080, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.forest, letterSpacing: 3, textTransform: "uppercase" }}>Türkçem · word building</div>

      <div style={{ transform: `scale(${pulse})`, transformOrigin: "540px 600px" }}>
        {frame < f(intro.end) && <BrickRow defs={introDefs} y={480} />}
        {frame >= f(root.start) && <BrickRow defs={mainDefs} y={480} />}
      </div>

      {/* meaning chips */}
      {frame >= f(root.start) && frame < f(plural.start) && <Chip appear={f(root.start) + 22} text="ev = house (root)" color={C.forest} y={690} />}
      {frame >= f(plural.start) && frame < f(mine.start) && <Chip appear={f(plural.start) + 22} text="-ler = more than one" color={C.clay} y={690} />}
      {frame >= f(mine.start) && frame < f(inn.start) && <Chip appear={f(mine.start) + 22} text="-im = my" color={C.gold} y={690} />}
      {frame >= f(inn.start) && frame < f(outro.start) && <Chip appear={f(inn.start) + 22} text="-de = in / at" color={C.sea} y={690} />}
      {frame >= f(outro.start) && <Chip appear={f(outro.start) + 10} text="evlerimde = in my houses" color={C.forestDark} y={690} />}

      {/* houses */}
      {frame >= f(root.start) && (
        <>
          {boxP > 0 && (
            <div style={{ position: "absolute", left: 70, top: houseY - 120, width: 940, height: 420, borderRadius: 40, border: `6px dashed ${C.sea}`, background: "rgba(63,127,166,.10)", opacity: boxP, transform: `scale(${0.9 + 0.1 * boxP})` }}>
              <div style={{ position: "absolute", top: -26, left: 30, background: C.sea, color: C.cream, fontFamily: FONT, fontWeight: 800, fontSize: 36, padding: "4px 22px", borderRadius: 999 }}>in</div>
            </div>
          )}
          <House x={hx[1]} y={houseY} appear={f(root.start) + 24} tag={f(mine.start) + 30} />
          <House x={hx[0]} y={houseY} appear={f(plural.start) + 26} tag={f(mine.start) + 38} />
          <House x={hx[2]} y={houseY} appear={f(plural.start) + 34} tag={f(mine.start) + 46} />
        </>
      )}

      <Captions />
    </AbsoluteFill>
  );
};
