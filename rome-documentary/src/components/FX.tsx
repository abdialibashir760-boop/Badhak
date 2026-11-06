import React, { useEffect, useRef } from 'react';
// Grain is drawn as a tiled CSS background from a data URL generated once (cheap, deterministic per frame).
let tile: string | null = null;
const makeTile = () => { if (tile) return tile; const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!, img = g.createImageData(256, 256); let a = 12345; for (let i = 0; i < img.data.length; i += 4) { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; const v = 128 + ((a / 4294967296) - 0.5) * 130; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; } g.putImageData(img, 0, 0); return (tile = c.toDataURL()); };
export const FilmFX: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 52%, rgba(18,8,0,0.55) 100%)' }} />
    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${makeTile()})`, backgroundPosition: `${(frame * 53) % 256}px ${(frame * 97) % 256}px`, mixBlendMode: 'overlay', opacity: 0.1 }} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,190,110,0.05), rgba(40,20,60,0.06))', mixBlendMode: 'soft-light' }} />
  </div>
);
