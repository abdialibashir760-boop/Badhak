import { useCurrentFrame } from "remotion";
import { LINES } from "../network";

export interface LineVisual {
  /** 0-1: how much of the cable has been drawn. */
  draw: number;
  /** 0-1: extra glow because the packet is on this cable. */
  boost: number;
}

const PERIOD = 260;

/** The four cables. Bright gradients slide along each one forever. */
export const FlowLines: React.FC<{ lines: LineVisual[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const offset = (frame * 7) % PERIOD;

  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <filter id="cableGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        {LINES.map((l) => {
          const dx = l.to.x - l.from.x;
          const dy = l.to.y - l.from.y;
          const len = Math.hypot(dx, dy);
          const ux = dx / len;
          const uy = dy / len;
          return (
            <linearGradient
              key={l.id}
              id={`flow-${l.id}`}
              gradientUnits="userSpaceOnUse"
              spreadMethod="repeat"
              x1={l.from.x}
              y1={l.from.y}
              x2={l.from.x + ux * PERIOD}
              y2={l.from.y + uy * PERIOD}
              gradientTransform={`translate(${ux * offset} ${uy * offset})`}
            >
              <stop offset="0" stopColor={l.fromColor} stopOpacity="0" />
              <stop offset="0.42" stopColor={l.fromColor} stopOpacity="1" />
              <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="0.58" stopColor={l.toColor} stopOpacity="1" />
              <stop offset="1" stopColor={l.toColor} stopOpacity="0" />
            </linearGradient>
          );
        })}
      </defs>

      {LINES.map((l, i) => {
        const v = lines[i] ?? { draw: 1, boost: 0 };
        if (v.draw <= 0) return null;
        const d = `M ${l.from.x} ${l.from.y} L ${l.to.x} ${l.to.y}`;
        const dash = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - v.draw } as const;
        return (
          <g key={l.id}>
            <path d={d} fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth={6} strokeLinecap="round" {...dash} />
            <path d={d} fill="none" stroke={`url(#flow-${l.id})`} strokeWidth={14} strokeLinecap="round" opacity={0.55 + v.boost * 0.45} filter="url(#cableGlow)" {...dash} />
            <path d={d} fill="none" stroke={`url(#flow-${l.id})`} strokeWidth={6 + v.boost * 3} strokeLinecap="round" {...dash} />
          </g>
        );
      })}
    </svg>
  );
};
