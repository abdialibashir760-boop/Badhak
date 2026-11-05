import React from 'react';
import { clamp01 } from './physics';

const Idx: React.FC<{ up?: string; down?: string }> = ({ up, down }) => (
  <span style={{ display: 'inline-flex', flexDirection: 'column', verticalAlign: 'middle', fontSize: '0.6em', lineHeight: 1, margin: '0 0.08em' }}>
    <span style={{ minHeight: '1em' }}>{up ?? ''}</span>
    <span style={{ minHeight: '1em' }}>{down ?? ''}</span>
  </span>
);

const PHASES = [
  {
    from: 0,
    to: 2,
    name: 'Flat spacetime',
    title: 'No mass, no curvature',
    body: 'Far from any mass, free objects travel in straight lines.',
    eq: { label: 'Flat (Minkowski) metric', node: <>ds² = −c²dt² + dx² + dy² + dz²</> },
  },
  {
    from: 2,
    to: 5,
    name: 'Mass curves it',
    title: 'Mass tells spacetime how to curve',
    body: 'Earth’s mass–energy bends the grid. The change spreads outward at the speed of light.',
    eq: {
      label: 'Einstein field equations',
      node: (
        <>
          <i>G</i>
          <Idx down="μν" /> = (8π<i>G</i>/<i>c</i>⁴) <i>T</i>
          <Idx down="μν" />
        </>
      ),
    },
  },
  {
    from: 5,
    to: 8,
    name: 'Matter follows',
    title: 'Spacetime tells matter how to move',
    body: 'The Moon feels no force. It follows the straightest possible path — a geodesic — through the curved grid.',
    eq: {
      label: 'Geodesic equation',
      node: (
        <>
          d²<i>x</i>
          <Idx up="μ" />/dτ² + Γ
          <Idx up="μ" down="αβ" /> (d<i>x</i>
          <Idx up="α" />/dτ)(d<i>x</i>
          <Idx up="β" />/dτ) = 0
        </>
      ),
    },
  },
  {
    from: 8,
    to: 10,
    name: 'The whole system',
    title: 'One geometry for the whole system',
    body: 'Earth and Moon both bend the grid — the Moon only about 1/81 as much.',
    eq: {
      label: 'Weak-field limit',
      node: (
        <>
          <i>g</i>
          <Idx down="00" /> ≈ −(1 + 2Φ/<i>c</i>²), Φ = −<i>GM</i>/<i>r</i>
        </>
      ),
    },
  },
];

const FONT = `'Helvetica Neue', 'Liberation Sans', Arial, sans-serif`;
const SERIF = `'Cambria Math', 'STIX Two Math', 'DejaVu Serif', 'Liberation Serif', serif`;

function fade(t: number, from: number, to: number, isLast: boolean) {
  const inn = clamp01((t - from) / 0.4);
  const out = isLast ? 1 : clamp01((to - t) / 0.3);
  return Math.min(inn, out);
}

export const Overlay: React.FC<{ t: number }> = ({ t }) => {
  const phaseIndex = PHASES.findIndex((p, i) => t < p.to || i === PHASES.length - 1);
  return (
    <>
      {/* soft scrim so captions stay readable over the grid */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 560, background: 'linear-gradient(to top, rgba(4,7,15,.82) 0%, rgba(4,7,15,.55) 45%, rgba(4,7,15,0) 100%)' }} />
      {/* title */}
      <div style={{ position: 'absolute', left: 72, top: 56, fontFamily: FONT, color: '#9fb6d8', letterSpacing: 6, fontSize: 24, fontWeight: 600 }}>
        HOW GRAVITY BENDS SPACETIME
      </div>

      {PHASES.map((p, i) => {
        const o = fade(t, p.from, p.to, i === PHASES.length - 1);
        if (o <= 0) return null;
        return (
          <React.Fragment key={p.name}>
            <div
              style={{
                position: 'absolute', left: 72, bottom: 170, width: 1240, fontFamily: FONT, opacity: o,
                transform: `translateY(${(1 - o) * 14}px)`,
              }}
            >
              <div style={{ color: '#ffffff', fontSize: 54, fontWeight: 700, lineHeight: 1.1, textShadow: '0 2px 18px rgba(0,0,0,.6)' }}>{p.title}</div>
              <div style={{ color: '#c4d4ee', fontSize: 30, marginTop: 14, lineHeight: 1.35, textShadow: '0 2px 12px rgba(0,0,0,.7)' }}>{p.body}</div>
            </div>
            <div
              style={{
                position: 'absolute', right: 72, top: 48, opacity: o, fontFamily: FONT,
                background: 'rgba(10,18,36,.62)', border: '1px solid rgba(140,190,255,.28)', borderRadius: 18, padding: '16px 30px 20px',
                transform: `translateY(${(1 - o) * -10}px)`,
              }}
            >
              <div style={{ color: '#8fb0de', fontSize: 22, letterSpacing: 2, textTransform: 'uppercase' }}>{p.eq.label}</div>
              <div style={{ color: '#f2f7ff', fontFamily: SERIF, fontStyle: 'italic', fontSize: 44, marginTop: 8 }}>{p.eq.node}</div>
            </div>
          </React.Fragment>
        );
      })}

      {/* footnote */}
      <div
        style={{
          position: 'absolute', right: 72, bottom: 118, fontFamily: FONT, fontSize: 21, color: '#8ea6c8',
          opacity: 0.85 * clamp01((t - 4.5) / 0.6), textAlign: 'right', width: 640,
        }}
      >
        Schematic: height shows the gravitational potential Φ; depth is hugely exaggerated, sizes and distances are not to scale.
      </div>

      {/* progress */}
      <div style={{ position: 'absolute', left: 72, right: 72, bottom: 48, display: 'flex', gap: 10, fontFamily: FONT }}>
        {PHASES.map((p, i) => {
          const fill = clamp01((t - p.from) / (p.to - p.from));
          return (
            <div key={p.name} style={{ flex: p.to - p.from }}>
              <div style={{ fontSize: 22, color: i === phaseIndex ? '#e8f1ff' : '#6f86a8', marginBottom: 8, fontWeight: 600 }}>{p.name}</div>
              <div style={{ height: 5, borderRadius: 3, background: 'rgba(150,180,230,.2)', overflow: 'hidden' }}>
                <div style={{ width: `${fill * 100}%`, height: '100%', background: '#7fc3ff' }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
