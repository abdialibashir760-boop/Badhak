import { random } from "remotion";
import type { DrawFn } from "./FrameCanvas";
import { colors } from "../theme";

const PALETTE = [colors.merchant, colors.acquirer, colors.network, colors.issuer, "#FFFFFF"];
const SHARDS = Array.from({ length: 150 }, (_, i) => ({
  angle: random(`shard-a-${i}`) * Math.PI * 2,
  speed: 14 + random(`shard-s-${i}`) * 34,
  len: 14 + random(`shard-l-${i}`) * 42,
  spin: (random(`shard-r-${i}`) - 0.5) * 0.4,
  color: PALETTE[Math.floor(random(`shard-c-${i}`) * PALETTE.length)],
  life: 50 + random(`shard-t-${i}`) * 40,
}));
const DOTS = Array.from({ length: 110 }, (_, i) => ({
  angle: random(`dot-a-${i}`) * Math.PI * 2,
  speed: 6 + random(`dot-s-${i}`) * 22,
  r: 2 + random(`dot-r-${i}`) * 7,
  color: PALETTE[Math.floor(random(`dot-c-${i}`) * PALETTE.length)],
}));

/** Canvas burst: shock rings, flying shards and glowing dots. `start` is the frame of the impact. */
export const makeBurst = (ox: number, oy: number, start: number): DrawFn => (ctx, frame) => {
  const f = frame - start;
  if (f < 0 || f > 100) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // white flash
  if (f < 16) {
    const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, 340);
    g.addColorStop(0, `rgba(255,255,255,${0.75 * (1 - f / 16)})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1920, 1080);
  }

  // expanding rings
  for (let i = 0; i < 4; i++) {
    const t = (f - i * 6) / 55;
    if (t <= 0 || t >= 1) continue;
    const e = 1 - Math.pow(1 - t, 3);
    ctx.beginPath();
    ctx.arc(ox, oy, e * (260 + i * 150), 0, Math.PI * 2);
    ctx.strokeStyle = PALETTE[i];
    ctx.globalAlpha = (1 - t) * 0.9;
    ctx.lineWidth = 10 * (1 - t) + 1;
    ctx.stroke();
  }

  // shards
  ctx.lineCap = "round";
  for (const s of SHARDS) {
    if (f > s.life) continue;
    const dist = s.speed * 11 * (1 - Math.exp(-f / 12));
    const x = ox + Math.cos(s.angle) * dist;
    const y = oy + Math.sin(s.angle) * dist + f * f * 0.05;
    const a = s.angle + s.spin * f;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * s.len, y + Math.sin(a) * s.len);
    ctx.strokeStyle = s.color;
    ctx.globalAlpha = 1 - f / s.life;
    ctx.lineWidth = 4;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 14;
    ctx.stroke();
  }

  // dots
  ctx.shadowBlur = 0;
  for (const d of DOTS) {
    const dist = d.speed * 10 * (1 - Math.exp(-f / 16));
    ctx.beginPath();
    ctx.arc(ox + Math.cos(d.angle) * dist, oy + Math.sin(d.angle) * dist, d.r * (1 - f / 110), 0, Math.PI * 2);
    ctx.fillStyle = d.color;
    ctx.globalAlpha = Math.max(0, 1 - f / 85) * 0.9;
    ctx.fill();
  }
  ctx.restore();
};
