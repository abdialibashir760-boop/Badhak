import { AbsoluteFill, Sequence, interpolate, random, useCurrentFrame } from "remotion";
import { Captions, type CaptionItem } from "../Captions";
import { FrameCanvas, type DrawFn } from "../FrameCanvas";
import { NetworkDiagram } from "../NetworkDiagram";
import { idleNode } from "../NetworkNode";
import { EndScreen } from "./EndScreen";
import { END_SCREEN_FRAME, colors, font, mono, scenes } from "../../theme";

// ---------- layout of the "Midnight Batch Settlement" bucket ----------
const BUCKET = { left: 540, right: 1380, top: 560, bottom: 1010 };
const INNER_LEFT = BUCKET.left + 20;
const INNER_W = BUCKET.right - BUCKET.left - 40;
const FLOOR = BUCKET.bottom - 14;
const COLS = 42;
const COL_W = INNER_W / COLS;
const TOTAL_TILES = 3000;
const TOTAL_AMOUNT = 452_190_000;
const MAX_FILL = 380;
const CELL_H = MAX_FILL / ((TOTAL_TILES / COLS) * 1.08);
const TILE_COLORS = [colors.merchant, colors.acquirer, colors.network, colors.issuer];
const LAND_Y = BUCKET.top + 20;

interface Tile {
  col: number;
  x: number;
  w: number;
  h: number;
  start: number;
  speed: number;
  land: number;
  alpha: number;
  color: string;
}

// Thousands of tiles, generated once with seeded randomness so every render is identical.
const TILES: Tile[] = Array.from({ length: TOTAL_TILES }, (_, i) => {
  const col = Math.floor(random(`tile-col-${i}`) * COLS);
  const start = 30 + random(`tile-start-${i}`) * 1080;
  const speed = 8 + random(`tile-speed-${i}`) * 10;
  return {
    col,
    x: INNER_LEFT + col * COL_W + random(`tile-x-${i}`) * (COL_W - 12),
    w: 8 + random(`tile-w-${i}`) * 8,
    h: 8 + random(`tile-h-${i}`) * 10,
    start,
    speed,
    land: start + (LAND_Y + 40) / speed,
    alpha: 0.28 + random(`tile-a-${i}`) * 0.42,
    color: TILE_COLORS[Math.floor(random(`tile-c-${i}`) * 4)],
  };
});

const landedCount = (frame: number) => {
  let n = 0;
  for (const t of TILES) if (t.land <= frame) n++;
  return n;
};

const drawWaterfall: DrawFn = (ctx, frame) => {
  const heights = new Array<number>(COLS).fill(0);

  ctx.globalCompositeOperation = "lighter";
  for (const t of TILES) {
    if (t.land <= frame) {
      heights[t.col]++;
    } else if (frame >= t.start) {
      const y = -30 + (frame - t.start) * t.speed;
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.fillRect(t.x, y, t.w, t.h);
    }
  }
  ctx.globalCompositeOperation = "source-over";

  // piled-up tiles inside the bucket, one mosaic column at a time
  for (let c = 0; c < COLS; c++) {
    const x = INNER_LEFT + c * COL_W;
    for (let r = 0; r < heights[c]; r++) {
      const shade = random(`cell-${c}-${r}`);
      ctx.globalAlpha = 0.5 + shade * 0.4;
      ctx.fillStyle = TILE_COLORS[(c + r) % 4];
      ctx.fillRect(x + 1, FLOOR - (r + 1) * CELL_H, COL_W - 2, Math.max(1, CELL_H - 0.6));
    }
  }
  ctx.globalAlpha = 1;
};

const formatMoney = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

const captions: CaptionItem[] = [
  { from: 75, to: 330, kicker: "Authorization is not payment", text: "So far the bank has only put a hold on your credit limit.", color: colors.issuer },
  { from: 330, to: 640, kicker: "All day long", text: "Merchants collect their approved sales into one batch.", color: colors.merchant },
  { from: 640, to: 930, kicker: "Clearing & settlement", text: "At the end of the day the batch is sent in for settlement.", color: colors.acquirer },
  { from: 930, to: 1200, kicker: "Money finally moves", text: "Issuers pay acquirers, acquirers pay merchants, usually within 1 to 2 business days.", color: colors.network },
];

/** Scene 4: network fades out, thousands of tiles pour into the settlement bucket, then the end screen. */
export const Scene4Settlement: React.FC = () => {
  const frame = useCurrentFrame();

  const netOut = interpolate(frame, [0, 70], [1, 0], { extrapolateRight: "clamp" });
  const nodes = [0, 1, 2, 3].map((i) => ({ ...idleNode(), load: 0.2 + 0.1 * Math.sin(frame / 12 + i) }));
  const lines = [0, 1, 2, 3].map(() => ({ draw: 1, boost: 0 }));

  const landed = landedCount(frame);
  const amount = (landed / TOTAL_TILES) * TOTAL_AMOUNT;
  const done = landed >= TOTAL_TILES;
  const counterIn = interpolate(frame, [40, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bucketIn = interpolate(frame, [30, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shimmer = 0.5 + 0.5 * Math.sin(frame / 7);
  // the settlement graphics sink away as the end screen takes over
  const endAt = END_SCREEN_FRAME - scenes.settlement.from;
  const sceneFade = interpolate(frame, [endAt, endAt + 50], [1, 0.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: sceneFade }}>
      {netOut > 0.001 && <NetworkDiagram nodes={nodes} lines={lines} opacity={netOut} scale={1 - (1 - netOut) * 0.06} />}

      {/* bucket */}
      <div
        style={{
          position: "absolute",
          left: BUCKET.left,
          top: BUCKET.top,
          width: BUCKET.right - BUCKET.left,
          height: BUCKET.bottom - BUCKET.top,
          boxSizing: "border-box",
          borderRadius: "10px 10px 70px 70px",
          border: `4px solid rgba(255,255,255,${0.28 + 0.1 * shimmer})`,
          borderTop: "none",
          background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(6,182,212,0.07))",
          boxShadow: done ? `0 0 ${50 + 40 * shimmer}px ${colors.merchant}77` : `0 0 40px ${colors.acquirer}33`,
          opacity: bucketIn,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: BUCKET.left,
          width: BUCKET.right - BUCKET.left,
          top: BUCKET.top - 62,
          textAlign: "center",
          fontFamily: font,
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: 5,
          textTransform: "uppercase",
          color: colors.text,
          opacity: bucketIn,
        }}
      >
        Midnight Batch Settlement
      </div>

      <FrameCanvas draw={drawWaterfall} />

      {/* big counter */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 100,
          textAlign: "center",
          fontFamily: font,
          opacity: counterIn,
          transform: `translateY(${(1 - counterIn) * 30}px)`,
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 6, color: colors.muted }}>SETTLED IN THIS BATCH</div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 190,
            fontWeight: 800,
            lineHeight: 1.05,
            color: done ? colors.merchant : colors.text,
            fontVariantNumeric: "tabular-nums",
            textShadow: `0 0 ${done ? 60 : 30}px ${done ? colors.merchant : colors.acquirer}, 0 6px 30px rgba(0,0,0,0.9)`,
          }}
        >
          {formatMoney(amount)}
        </div>
        <div style={{ fontSize: 26, fontWeight: 600, color: colors.muted }}>example figure for illustration</div>
      </div>

      <Captions items={captions} top={385} height={90} size={34} />
      </AbsoluteFill>

      <Sequence from={END_SCREEN_FRAME - scenes.settlement.from} durationInFrames={scenes.settlement.duration - (END_SCREEN_FRAME - scenes.settlement.from)} name="YouTube end screen">
        <EndScreen />
      </Sequence>
    </AbsoluteFill>
  );
};
