import { useCurrentFrame } from "remotion";
import { NODE_H, NODE_W, type NodeDef } from "../network";
import { colors, font, mono } from "../theme";

const Icon: React.FC<{ id: NodeDef["id"]; color: string }> = ({ id, color }) => {
  const common = { fill: "none", stroke: color, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="46" height="46" viewBox="0 0 24 24">
      {id === "merchant" && (
        <g {...common}>
          <path d="M3 9l1.5-5h15L21 9" />
          <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
          <path d="M5 12v8h14v-8M10 20v-5h4v5" />
        </g>
      )}
      {id === "acquirer" && (
        <g {...common}>
          <path d="M3 9l9-5 9 5M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18" />
        </g>
      )}
      {id === "network" && (
        <g {...common}>
          <circle cx="12" cy="12" r="2.2" />
          <circle cx="4.5" cy="6" r="1.6" />
          <circle cx="19.5" cy="6" r="1.6" />
          <circle cx="4.5" cy="18" r="1.6" />
          <circle cx="19.5" cy="18" r="1.6" />
          <path d="M10.2 10.6 5.8 7M13.8 10.6 18.2 7M10.2 13.4 5.8 17M13.8 13.4 18.2 17" />
        </g>
      )}
      {id === "issuer" && (
        <g {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M2.5 10h19M6 15h4" />
        </g>
      )}
    </svg>
  );
};

export interface NodeVisual {
  scale: number;
  dropY: number;
  opacity: number;
  flash: number;
  ms: number;
  load: number;
  spotlight: number;
}

export const idleNode = (): NodeVisual => ({ scale: 1, dropY: 0, opacity: 1, flash: 0, ms: 0, load: 0.15, spotlight: 0 });

const BARS = 20;

/** Frosted-glass card for one party in the payment chain. */
export const NetworkNode: React.FC<{ def: NodeDef; visual: NodeVisual }> = ({ def, visual }) => {
  const frame = useCurrentFrame();
  const { scale, dropY, opacity, flash, ms, load, spotlight } = visual;
  const glow = Math.max(flash, spotlight * 0.55);

  return (
    <div
      style={{
        position: "absolute",
        left: def.x,
        top: def.y,
        width: NODE_W,
        height: NODE_H,
        boxSizing: "border-box",
        borderRadius: 34,
        padding: "28px 40px 26px",
        opacity,
        transform: `translateY(${dropY}px) scale(${scale * (1 + spotlight * 0.025)})`,
        background: `linear-gradient(145deg, ${def.color}${Math.round(18 + glow * 60).toString(16).padStart(2, "0")}, ${colors.glass})`,
        border: `2px solid ${def.color}${Math.round(70 + glow * 185).toString(16).padStart(2, "0")}`,
        boxShadow: `0 0 ${24 + glow * 90}px ${def.color}${Math.round(40 + glow * 150).toString(16).padStart(2, "0")}, inset 0 1px 0 rgba(255,255,255,0.12)`,
        backdropFilter: "blur(14px)",
        fontFamily: font,
        color: colors.text,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${def.color}24`,
            border: `1.5px solid ${def.color}88`,
          }}
        >
          <Icon id={def.id} color={def.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1, lineHeight: 1.05 }}>{def.name}</div>
          <div style={{ fontSize: 23, color: colors.muted, marginTop: 4 }}>{def.subtitle}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: mono, fontSize: 50, fontWeight: 700, color: def.color, fontVariantNumeric: "tabular-nums", textShadow: `0 0 ${12 + glow * 24}px ${def.color}` }}>
            {Math.round(ms)}
            <span style={{ fontSize: 26 }}>ms</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 22, fontSize: 18, letterSpacing: 3, fontWeight: 700, color: colors.muted }}>PROCESSING LOAD</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 13, height: 74, marginTop: 8 }}>
        {Array.from({ length: BARS }).map((_, i) => {
          const wave = Math.abs(Math.sin(frame * 0.27 + i * 0.93) * Math.cos(frame * 0.115 + i * 0.41));
          const idle = 0.1 + 0.07 * Math.sin(frame * 0.09 + i * 0.6);
          const h = idle + (0.2 + 0.8 * wave) * load * 0.9;
          return <div key={i} style={{ width: 13, height: 6 + Math.min(1, h) * 66, borderRadius: 5, background: def.color, opacity: 0.4 + Math.min(1, h) * 0.6 }} />;
        })}
      </div>
    </div>
  );
};
