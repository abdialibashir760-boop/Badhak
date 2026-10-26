import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../theme";
import { hash, noise } from "../utils/animation";
import { joints, Pose, Pt, STAND, LEN } from "../utils/rig";

export type StickmanProps = {
  x: number;
  ground: number;
  scale?: number;
  pose?: Pose;
  /** trembling amplitude in px (stress) */
  tremble?: number;
  /** breathing amplitude in local units */
  breath?: number;
  color?: string;
  /** 0 = the protagonist, 1..4 = secondary characters (hair, cap, long hair, glasses) */
  style?: number;
  opacity?: number;
  shadow?: boolean;
  /** shadow direction: +1 falls to the right, -1 to the left */
  shadowDir?: number;
  seed?: number;
  /** mirror horizontally around x (used for reflections) */
  flip?: boolean;
  /** frame used for the line boil; defaults to the current frame */
  boilFrame?: number;
};

const SW = 7.6; // local stroke width

/** Slightly hand-drawn line a→b; the wobble re-rolls every 3 frames ("line boil"). */
export function sketch(a: Pt, b: Pt, seed: number, step: number, amp = 1.1): string {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const o = (hash(seed * 3.1 + step * 0.77) - 0.5) * 2 * amp * Math.min(1.5, len / 60);
  const cx = (a[0] + b[0]) / 2 + nx * o, cy = (a[1] + b[1]) / 2 + ny * o;
  const j = (k: number) => (hash(seed * 1.7 + step * 1.3 + k) - 0.5) * amp * 0.9;
  return `M ${a[0] + j(1)} ${a[1] + j(2)} Q ${cx} ${cy} ${b[0] + j(3)} ${b[1] + j(4)}`;
}

function headPath(cx: number, cy: number, r: number, seed: number, step: number): string {
  const n = 10;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const rr = r * (1 + (hash(seed + i * 5.3 + step * 0.9) - 0.5) * 0.05);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  // closed Catmull-Rom → cubic Bezier
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  return d + " Z";
}

export const Face: React.FC<{ pose: Pose; r: number; color: string }> = ({ pose, r, color }) => {
  const k = r / LEN.head;
  const g = pose.gaze * 4 * k;
  const ey = -3 * k;
  const open = Math.max(0.0, pose.eyes);
  const eye = (sx: number) => {
    const x = sx * 9.5 * k + g;
    if (pose.joy > 0.5) return <path key={sx} d={`M ${x - 4 * k} ${ey + 1.5 * k} Q ${x} ${ey - 4.5 * k} ${x + 4 * k} ${ey + 1.5 * k}`} stroke={color} strokeWidth={2.4 * k} fill="none" strokeLinecap="round" />;
    if (open < 0.12) return <path key={sx} d={`M ${x - 4 * k} ${ey} L ${x + 4 * k} ${ey}`} stroke={color} strokeWidth={2.4 * k} strokeLinecap="round" />;
    return (
      <g key={sx}>
        <ellipse cx={x} cy={ey} rx={2.9 * k} ry={Math.max(0.9, 3.4 * open) * k} fill={color} />
        {open < 0.6 && <path d={`M ${x - 5 * k} ${ey - 1.6 * k * (1 - open) * 2.2} L ${x + 5 * k} ${ey - 1.6 * k * (1 - open) * 2.2}`} stroke={color} strokeWidth={2 * k} strokeLinecap="round" />}
        {open < 0.6 && <path d={`M ${x - 5 * k} ${ey + 6 * k} Q ${x} ${ey + 8 * k} ${x + 5 * k} ${ey + 6 * k}`} stroke={color} strokeWidth={1.2 * k} fill="none" opacity={0.7} />}
      </g>
    );
  };
  const bw = pose.brow; // worried (+) raises inner ends; angry (-) lowers them
  const browLine = (sx: number) => {
    const x = sx * 9.5 * k + g;
    const inner: Pt = [x - sx * 3 * k, ey - 8 * k - bw * 3.2 * k];
    const outer: Pt = [x + sx * 5.5 * k, ey - 8 * k + bw * 1.6 * k];
    return <path key={"bl" + sx} d={`M ${inner[0]} ${inner[1]} L ${outer[0]} ${outer[1]}`} stroke={color} strokeWidth={2.1 * k} strokeLinecap="round" opacity={Math.min(1, Math.abs(bw) * 2.5)} />;
  };
  const my = 10.5 * k;
  const mw = (7 + Math.abs(pose.smile) * 3.5) * k;
  const curve = pose.smile * 7.5 * k;
  return (
    <g>
      {eye(-1)}{eye(1)}
      {Math.abs(bw) > 0.05 && <>{browLine(-1)}{browLine(1)}</>}
      {pose.mouthO > 0.1 ? (
        <ellipse cx={g * 0.6} cy={my + 1.5 * k} rx={3.6 * k} ry={pose.mouthO * 5.2 * k} fill={color} />
      ) : (
        <path d={`M ${-mw + g * 0.6} ${my} Q ${g * 0.6} ${my + curve * 1.6} ${mw + g * 0.6} ${my}`} stroke={color} strokeWidth={2.5 * k} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
};

export const SmilingMask: React.FC<{ r: number; color?: string; mood?: "smile" | "blank" | "sad" }> = ({ r, color = C.ink, mood = "smile" }) => {
  const k = r / 27;
  return (
    <g>
      <path d={`M ${-r * 1.04} ${-r * 0.05} Q ${-r * 1.2} ${r * 0.25} ${-r * 1.0} ${r * 0.6}`} stroke={color} strokeWidth={1.6 * k} fill="none" />
      <path d={`M ${r * 1.04} ${-r * 0.05} Q ${r * 1.2} ${r * 0.25} ${r * 1.0} ${r * 0.6}`} stroke={color} strokeWidth={1.6 * k} fill="none" />
      <ellipse cx={0} cy={0} rx={r * 1.04} ry={r * 1.1} fill="#faf8f2" stroke={color} strokeWidth={2.6 * k} />
      <path d={`M ${-14 * k} ${-5 * k} Q ${-9.5 * k} ${-12 * k} ${-5 * k} ${-5 * k}`} stroke={color} strokeWidth={2.6 * k} fill="none" strokeLinecap="round" />
      <path d={`M ${5 * k} ${-5 * k} Q ${9.5 * k} ${-12 * k} ${14 * k} ${-5 * k}`} stroke={color} strokeWidth={2.6 * k} fill="none" strokeLinecap="round" />
      {mood === "smile" && <path d={`M ${-14 * k} ${6 * k} Q 0 ${24 * k} ${14 * k} ${6 * k}`} stroke={color} strokeWidth={2.8 * k} fill="none" strokeLinecap="round" />}
      {mood === "blank" && <path d={`M ${-9 * k} ${12 * k} L ${9 * k} ${12 * k}`} stroke={color} strokeWidth={2.8 * k} strokeLinecap="round" />}
      {mood === "sad" && <path d={`M ${-11 * k} ${16 * k} Q 0 ${6 * k} ${11 * k} ${16 * k}`} stroke={color} strokeWidth={2.8 * k} fill="none" strokeLinecap="round" />}
      <path d={`M ${-11 * k} ${8 * k} L ${-14 * k} ${6 * k}`} stroke={color} strokeWidth={1.6 * k} />
    </g>
  );
};

const Hair: React.FC<{ style: number; r: number; color: string }> = ({ style, r, color }) => {
  const k = r / 27;
  if (style === 1) return <path d={`M ${-16 * k} ${-r * 0.78} Q ${-4 * k} ${-r * 1.55} ${6 * k} ${-r * 0.95} Q ${14 * k} ${-r * 1.4} ${19 * k} ${-r * 0.7}`} stroke={color} strokeWidth={4 * k} fill="none" strokeLinecap="round" />;
  if (style === 2) return <g><path d={`M ${-r * 1.02} ${-r * 0.25} Q 0 ${-r * 1.7} ${r * 1.02} ${-r * 0.25} Z`} fill={color} /><path d={`M ${r * 0.5} ${-r * 0.3} L ${r * 1.55} ${-r * 0.2}`} stroke={color} strokeWidth={4 * k} strokeLinecap="round" /></g>;
  if (style === 3) return <path d={`M ${-r * 1.0} ${-r * 0.2} Q ${-r * 1.25} ${r * 1.2} ${-r * 0.7} ${r * 1.7} M ${r * 1.0} ${-r * 0.2} Q ${r * 1.25} ${r * 1.2} ${r * 0.7} ${r * 1.7} M ${-r * 1.0} ${-r * 0.2} Q 0 ${-r * 1.6} ${r * 1.0} ${-r * 0.2}`} stroke={color} strokeWidth={3.6 * k} fill="none" strokeLinecap="round" />;
  if (style === 4) return <g stroke={color} strokeWidth={2.2 * k} fill="none"><circle cx={-9.5 * k} cy={-3 * k} r={6.4 * k} /><circle cx={9.5 * k} cy={-3 * k} r={6.4 * k} /><path d={`M ${-3 * k} ${-3 * k} L ${3 * k} ${-3 * k}`} /></g>;
  return null;
};

export const Stickman: React.FC<StickmanProps> = ({
  x, ground, scale = 1.5, pose = STAND, tremble = 0, breath = 1, color = C.ink, style = 0,
  opacity = 1, shadow = true, shadowDir = 1, seed = 1, flip = false, boilFrame,
}) => {
  const frame = useCurrentFrame();
  const f = boilFrame ?? frame;
  const step = Math.floor(f / 3);
  const b = Math.sin(f * 0.075 + seed) * 1.3 * breath;
  const J = joints(pose, x, ground, scale, b);
  const tx = tremble ? noise(f * 0.9, seed) * tremble : 0;
  const ty = tremble ? noise(f * 1.1, seed + 4) * tremble * 0.5 : 0;
  const sw = SW * scale;
  const line = (a: Pt, c: Pt, s: number) => (
    <g key={s}>
      <path d={sketch(a, c, seed * 11 + s, step)} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <path d={sketch(a, c, seed * 11 + s + 50, step + 1, 1.8)} stroke={color} strokeWidth={sw * 0.28} strokeLinecap="round" fill="none" opacity={0.45} />
    </g>
  );
  const hr = LEN.head * scale;
  // long shadow on the floor: project joints away from a low light
  const skew = 1.1 * shadowDir, flat = 0.16;
  const sp = (p: Pt): Pt => [p[0] + (ground - p[1]) * skew, ground + (ground - p[1]) * flat];
  const shadowSegs: [Pt, Pt][] = [
    [J.hip, J.neck], [J.shoulder, J.elbowL], [J.elbowL, J.handL], [J.shoulder, J.elbowR], [J.elbowR, J.handR],
    [J.hipL, J.kneeL], [J.kneeL, J.footL], [J.hipR, J.kneeR], [J.kneeR, J.footR], [J.neck, J.head],
  ];
  const sh = sp(J.head);
  return (
    <g opacity={opacity} transform={flip ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
      {shadow && (
        <g style={{ filter: "blur(5px)" }} opacity={0.2}>
          {shadowSegs.map(([a, c], i) => {
            const A = sp(a), B = sp(c);
            return <path key={i} d={`M ${A[0]} ${A[1]} L ${B[0]} ${B[1]}`} stroke="#000" strokeWidth={sw * (1.1 + i * 0.0)} strokeLinecap="round" />;
          })}
          <ellipse cx={sh[0]} cy={sh[1]} rx={hr * 1.05} ry={hr * 0.3} fill="#000" />
          <ellipse cx={x} cy={ground + 4} rx={52 * scale} ry={7 * scale} fill="#000" opacity={1.4} />
        </g>
      )}
      <g transform={`translate(${tx} ${ty})`}>
        {line(J.hipL, J.kneeL, 1)}{line(J.kneeL, J.footL, 2)}
        {line(J.hipR, J.kneeR, 3)}{line(J.kneeR, J.footR, 4)}
        {line(J.hip, J.neck, 5)}
        {line(J.shoulder, J.elbowL, 6)}{line(J.elbowL, J.handL, 7)}
        {line(J.shoulder, J.elbowR, 8)}{line(J.elbowR, J.handR, 9)}
        <circle cx={J.handL[0]} cy={J.handL[1]} r={sw * 0.62} fill={color} />
        <circle cx={J.handR[0]} cy={J.handR[1]} r={sw * 0.62} fill={color} />
        <g>
          <path d={headPath(J.head[0], J.head[1], hr, seed, step)} fill={C.paper} stroke={color} strokeWidth={sw * 0.95} strokeLinejoin="round" />
          <path d={headPath(J.head[0] + 1.5, J.head[1] - 1, hr * 0.99, seed + 9, step + 1)} fill="none" stroke={color} strokeWidth={sw * 0.28} opacity={0.4} />
          <g transform={`translate(${J.head[0]} ${J.head[1]}) rotate(${pose.lean + pose.head})`}>
            <Hair style={style} r={hr} color={color} />
            <g opacity={1 - Math.min(1, pose.mask * 1.4)}><Face pose={pose} r={hr} color={color} /></g>
            {pose.mask > 0.01 && (
              <g opacity={Math.min(1, pose.mask * 1.6)} transform={`scale(${0.85 + 0.15 * pose.mask})`}>
                <SmilingMask r={hr} color={color} />
              </g>
            )}
          </g>
        </g>
      </g>
    </g>
  );
};
