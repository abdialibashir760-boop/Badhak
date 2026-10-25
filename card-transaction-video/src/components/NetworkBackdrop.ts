import { random } from "remotion";
import type { DrawFn } from "./FrameCanvas";
import { colors } from "../theme";

const N = 70;
const PALETTE = [colors.merchant, colors.acquirer, colors.network, colors.issuer];
const POINTS = Array.from({ length: N }, (_, i) => ({
  x: random(`nb-x-${i}`) * 1920,
  y: random(`nb-y-${i}`) * 1080,
  phase: random(`nb-p-${i}`) * Math.PI * 2,
  amp: 20 + random(`nb-a-${i}`) * 50,
  color: PALETTE[i % 4],
}));

/** Dark "inside the network" backdrop: drifting nodes, links and data pulses running along them. */
export const drawNetworkBackdrop: DrawFn = (ctx, frame) => {
  const pos = POINTS.map((p) => ({
    x: p.x + Math.cos(frame / 70 + p.phase) * p.amp,
    y: p.y + Math.sin(frame / 90 + p.phase) * p.amp,
    color: p.color,
  }));

  ctx.lineWidth = 1.5;
  let linkIndex = 0;
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = pos[i].x - pos[j].x;
      const dy = pos[i].y - pos[j].y;
      const d = Math.hypot(dx, dy);
      if (d > 270) continue;
      ctx.globalAlpha = (1 - d / 270) * 0.45;
      ctx.strokeStyle = pos[i].color;
      ctx.beginPath();
      ctx.moveTo(pos[i].x, pos[i].y);
      ctx.lineTo(pos[j].x, pos[j].y);
      ctx.stroke();

      // a pulse travelling along every 3rd link
      if (linkIndex++ % 3 === 0) {
        const t = ((frame * 0.012 + (i * 7 + j * 3) * 0.13) % 1 + 1) % 1;
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = "#fff";
        ctx.shadowColor = pos[i].color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(pos[i].x - dx * t, pos[i].y - dy * t, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }
  for (const p of pos) {
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};
