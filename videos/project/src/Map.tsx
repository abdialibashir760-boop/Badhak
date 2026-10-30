import React, { createContext, useContext } from "react";
import { Easing, interpolateColors, spring, useCurrentFrame } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { REG110, REG50, WORLD110 } from "./geo";
import { C, F, FPS, H, W } from "./theme";

export type Cam = { t: number; lon: number; lat: number; k: number };
export type Fill = { names: string[]; color: string; from: number };
type LL = [number, number];

type Ctx = { p: (lon: number, lat: number) => LL; k: number; t: number };
const MapCtx = createContext<Ctx>({ p: () => [0, 0], k: 1, t: 0 });
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = Easing.out(Easing.cubic);

const camAt = (cam: Cam[], t: number) => {
  if (t <= cam[0].t) return cam[0];
  for (let i = 0; i < cam.length - 1; i++) {
    const a = cam[i];
    const b = cam[i + 1];
    if (t <= b.t) {
      const u = Easing.inOut(Easing.cubic)(clamp((t - a.t) / Math.max(0.001, b.t - a.t)));
      return {
        t,
        lon: a.lon + (b.lon - a.lon) * u,
        lat: a.lat + (b.lat - a.lat) * u,
        k: Math.exp(Math.log(a.k) + (Math.log(b.k) - Math.log(a.k)) * u),
      };
    }
  }
  return cam[cam.length - 1];
};

export const MapView: React.FC<{
  cam: Cam[];
  fills?: Fill[];
  dim?: number;
  stroke?: string;
  children?: React.ReactNode;
}> = ({ cam, fills = [], dim = 0, stroke = C.border, children }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const c = camAt(cam, t);
  const k = c.k * (1 + 0.003 * t);
  const proj = geoMercator()
    .center([c.lon, c.lat])
    .scale(k)
    .translate([W / 2, H / 2])
    .clipExtent([[-80, -80], [W + 80, H + 80]]);
  const path = geoPath(proj);
  const list = k < 650 ? WORLD110 : k < 1700 ? REG110 : REG50;
  const colorFor = (name: string): string => {
    let col = C.land;
    for (const f of fills) {
      if (t >= f.from && f.names.includes(name)) {
        col = interpolateColors(ease(clamp((t - f.from) / 1.2)), [0, 1], [col, f.color]);
      }
    }
    return col;
  };
  const p = (lon: number, lat: number): LL => proj([lon, lat]) as LL;
  return (
    <MapCtx.Provider value={{ p, k, t }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect width={W} height={H} fill={C.sea} />
        {list.map((f, i) => {
          const d = path(f as any);
          if (!d) return null;
          return <path key={i} d={d} fill={colorFor(f.properties.name)} stroke={stroke} strokeWidth={0.7} />;
        })}
        {dim > 0 && <rect width={W} height={H} fill="#000" opacity={dim} />}
        {children}
      </svg>
    </MapCtx.Provider>
  );
};

export const Pt: React.FC<{
  lon: number; lat: number; from: number; label?: string; color?: string; r?: number;
  dx?: number; dy?: number; anchor?: "start" | "middle" | "end"; pulse?: boolean; size?: number; to?: number;
}> = ({ lon, lat, from, to, label, color = C.gold, r = 6, dx = 12, dy = 4, anchor = "start", pulse = true, size = 18 }) => {
  const { p, t } = useContext(MapCtx);
  const frame = useCurrentFrame();
  if (t < from || (to !== undefined && t > to)) return null;
  const [x, y] = p(lon, lat);
  const s = spring({ frame: frame - from * FPS, fps: FPS, config: { damping: 12 } });
  const ph = ((t - from) % 1.6) / 1.6;
  return (
    <g>
      {pulse && <circle cx={x} cy={y} r={r + ph * 30} fill="none" stroke={color} strokeWidth={2} opacity={(1 - ph) * 0.8} />}
      <circle cx={x} cy={y} r={r * s} fill={color} stroke="#000" strokeWidth={1.5} />
      {label && (
        <text x={x + dx} y={y + dy} fill={C.white} fontFamily={F.head} fontSize={size} fontWeight={600} letterSpacing={1.5} textAnchor={anchor}
          style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 4, textTransform: "uppercase" }} opacity={s}>
          {label}
        </text>
      )}
    </g>
  );
};

export const MapLabel: React.FC<{ lon: number; lat: number; text: string; from: number; color?: string; size?: number; spacing?: number }> = ({
  lon, lat, text, from, color = C.white, size = 22, spacing = 6,
}) => {
  const { p, t } = useContext(MapCtx);
  if (t < from) return null;
  const [x, y] = p(lon, lat);
  return (
    <text x={x} y={y} fill={color} fontFamily={F.head} fontSize={size} fontWeight={600} letterSpacing={spacing} textAnchor="middle"
      opacity={clamp((t - from) / 0.6) * 0.95} style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 5, textTransform: "uppercase" }}>
      {text}
    </text>
  );
};

const proj = (p: (a: number, b: number) => LL, pts: LL[]) => pts.map(([a, b]) => p(a, b));
const toD = (xy: LL[]) => xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

export const Route: React.FC<{
  pts: LL[]; from: number; dur: number; color?: string; width?: number; rail?: boolean; fadeTo?: number; opacity?: number;
}> = ({ pts, from, dur, color = C.red, width = 4, rail = false, fadeTo, opacity = 1 }) => {
  const { p, t } = useContext(MapCtx);
  if (t < from) return null;
  const d = toD(proj(p, pts));
  const u = ease(clamp((t - from) / dur));
  const op = fadeTo !== undefined ? opacity * (1 - clamp((t - fadeTo) / 0.8) * 0.75) : opacity;
  return (
    <g opacity={op}>
      <path d={d} fill="none" stroke="#000" strokeWidth={width + 3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${u} 2`} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${u} 2`} />
      {rail && u >= 0.999 && <path d={d} fill="none" stroke={C.white} strokeWidth={Math.max(1.2, width * 0.4)} strokeDasharray="7 9" opacity={0.85} />}
    </g>
  );
};

const alongXY = (xy: LL[], u: number): LL => {
  const seg: number[] = [];
  let tot = 0;
  for (let i = 0; i < xy.length - 1; i++) {
    const l = Math.hypot(xy[i + 1][0] - xy[i][0], xy[i + 1][1] - xy[i][1]);
    seg.push(l);
    tot += l;
  }
  let target = u * tot;
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i] || i === seg.length - 1) {
      const f = seg[i] === 0 ? 0 : Math.min(1, target / seg[i]);
      return [xy[i][0] + (xy[i + 1][0] - xy[i][0]) * f, xy[i][1] + (xy[i + 1][1] - xy[i][1]) * f];
    }
    target -= seg[i];
  }
  return xy[xy.length - 1];
};

export const Convoy: React.FC<{
  pts: LL[]; from: number; to: number; speed?: number; n?: number; color?: string; reverse?: boolean; size?: number;
  slow?: { u: number; w: number; amt: number }[];
}> = ({ pts, from, to, speed = 0.06, n = 5, color = C.gold, reverse = false, size = 9, slow = [] }) => {
  const { p, t } = useContext(MapCtx);
  if (t < from || t > to) return null;
  const xy = proj(p, pts);
  const fade = clamp((t - from) / 0.5) * clamp((to - t) / 0.5);
  const tt = t - from;
  return (
    <g opacity={fade}>
      {Array.from({ length: n }).map((_, i) => {
        // base position with local slowdowns at choke points
        let u = ((tt * speed + i / n) % 1 + 1) % 1;
        slow.forEach((s) => {
          const dd = Math.abs(u - s.u);
          if (dd < s.w) u += (s.w - dd) * s.amt * (u < s.u ? 1 : -1) * 0.5;
        });
        u = Math.max(0, Math.min(1, reverse ? 1 - u : u));
        const [x, y] = alongXY(xy, u);
        return <rect key={i} x={x - size} y={y - size * 0.55} width={size * 2} height={size * 1.1} rx={2} fill={color} stroke="#000" strokeWidth={1.5} />;
      })}
    </g>
  );
};

export const Arrow: React.FC<{
  from: LL; to: LL; at: number; dur?: number; color?: string; width?: number; curve?: number; label?: string; fadeAt?: number; hideAt?: number;
}> = ({ from, to, at, dur = 1.2, color = C.red, width = 6, curve = 0.2, label, fadeAt, hideAt }) => {
  const { p, t } = useContext(MapCtx);
  if (t < at || (hideAt !== undefined && t > hideAt)) return null;
  const a = p(from[0], from[1]);
  const b = p(to[0], to[1]);
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const cx = mx - dy * curve;
  const cy = my + dx * curve;
  const u = ease(clamp((t - at) / dur));
  const d = `M${a[0]} ${a[1]} Q${cx} ${cy} ${b[0]} ${b[1]}`;
  const ang = Math.atan2(b[1] - cy, b[0] - cx);
  const op = fadeAt !== undefined ? 1 - clamp((t - fadeAt) / 0.8) * 0.8 : 1;
  const hs = width * 2.4;
  return (
    <g opacity={op}>
      <path d={d} fill="none" stroke="#000" strokeWidth={width + 3} strokeLinecap="round" pathLength={1} strokeDasharray={`${u} 2`} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={`${u} 2`} />
      {u > 0.98 && (
        <polygon
          points={`0,0 ${-hs},${-hs * 0.55} ${-hs},${hs * 0.55}`}
          fill={color}
          stroke="#000"
          strokeWidth={1.5}
          transform={`translate(${b[0]} ${b[1]}) rotate(${(ang * 180) / Math.PI})`}
        />
      )}
      {label && u > 0.5 && (
        <text x={cx} y={cy - 12} fill={C.white} fontFamily={F.head} fontSize={20} fontWeight={600} letterSpacing={2} textAnchor="middle"
          style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 4, textTransform: "uppercase" }}>
          {label}
        </text>
      )}
    </g>
  );
};

export const Hatch: React.FC<{ pts: LL[]; from: number; color?: string }> = ({ pts, from, color = C.red }) => {
  const { p, t } = useContext(MapCtx);
  if (t < from) return null;
  const xy = proj(p, pts);
  return <path d={toD(xy) + " Z"} fill={color} fillOpacity={0.45 * clamp((t - from) / 0.8)} stroke={color} strokeWidth={2} strokeDasharray="6 4" />;
};

