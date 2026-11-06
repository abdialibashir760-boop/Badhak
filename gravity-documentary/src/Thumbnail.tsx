import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Space, Planet, Surface, wellHeight, makeView, integrate2D, W, H, FONT, GOLD, INK, type SurfaceBody, type SurfaceLine } from './lib';

/** 1920×1080 poster: Earth in its well, the Moon's path, big title. */
export const Thumbnail: React.FC = () => {
  const view = makeView({ pitch: (30 * Math.PI) / 180, yaw: 0.55, dist: 21, ty: -2.2 });
  const wells = [{ x: 0, z: 0, gm: 16, s: 2.3, amp: 1 }];
  const h = wellHeight(wells);
  const path = integrate2D({ gm: 16, s: 2.3, x: 9, z: 0, vx: 0, vz: -1.25, steps: 700, dt: 0.02, every: 2 });
  const mp = path[Math.floor(path.length * 0.7)];
  const bodies: SurfaceBody[] = [
    { id: 'earth', x: 0, z: 0, y: h(0, 0) + 1.4, radius: 1.6, render: (sx, sy, r) => <Planet kind="earth" cx={sx} cy={sy} r={r} spin={1.2} glow={0.15} /> },
    { id: 'moon', x: mp.x, z: mp.z, y: h(mp.x, mp.z) + 0.45, radius: 0.5, render: (sx, sy, r) => <Planet kind="moon" cx={sx} cy={sy} r={r} /> },
  ];
  const lines: SurfaceLine[] = [{ pts: path.slice(0, Math.floor(path.length * 0.7)), style: 'tr' }];
  return (
    <Space tint="warm">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Surface view={view} height={h} wells={[{ x: 0, z: 0 }]} bodies={bodies} lines={lines} depthScale={7}
          lineStyles={{ tr: { stroke: GOLD, opacity: 0.95, width: 5, glow: 12 } }} />
      </svg>
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(2,4,11,.92) 0%, rgba(2,4,11,.55) 45%, rgba(2,4,11,0) 70%)' }} />
      <div style={{ position: 'absolute', left: 90, top: 190, fontFamily: FONT }}>
        <div style={{ color: GOLD, fontSize: 40, letterSpacing: 10, fontWeight: 700 }}>THE SCIENCE OF</div>
        <div style={{ color: INK, fontSize: 190, fontWeight: 900, lineHeight: 0.95, letterSpacing: 2, marginTop: 14, textShadow: '0 6px 60px rgba(0,0,0,.9)' }}>GRAVITY</div>
        <div style={{ color: INK, fontSize: 64, fontWeight: 700, marginTop: 28, lineHeight: 1.15, textShadow: '0 4px 30px rgba(0,0,0,.9)' }}>What it <span style={{ color: GOLD }}>actually</span> is —<br />and why Einstein<br />changed everything</div>
      </div>
    </Space>
  );
};
