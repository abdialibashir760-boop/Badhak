import React from 'react';
import {Camera, HandDrawn, Ground, Particles, Vignette} from '../components/Stage';
import {FACES, HEAD_HOLD, lerpFace, lerpPose, STAND} from '../lib/pose';
import {INK, RED, StickFigure} from '../components/StickFigure';
import {SANS, SERIF} from '../components/Overlays';
import {easeInOut, easeIn, easeOut, lerp, seg} from '../lib/anim';
import {Svg} from './kit';
import type {SceneProps} from './types';

const CX = 960;
const CY = 540;
const PX = 960;
const GY = 800;
const PS = 0.8;
const HEAD_Y = GY - (124 + 104 + 6 + 58) * PS; // head centre of the standing figure
const ZOOM_END = 400 / (58 * PS);

const RINGS = [
  {r: 345, text: 'WHY DID I SAY THAT', size: 34, dir: 1, speed: 1},
  {r: 245, text: 'WHAT IF THEY NOTICED', size: 30, dir: -1, speed: 1.35},
  {r: 150, text: 'AGAIN', size: 28, dir: 1, speed: 1.8},
];

const ringPath = (r: number) => `M ${CX - r} ${CY} a ${r} ${r} 0 1 1 ${2 * r} 0 a ${r} ${r} 0 1 1 ${-2 * r} 0`;

export const Scene05Loop: React.FC<SceneProps> = ({frame, p, tm}) => {
  const tRum = tm.at('rumination', 0.38);
  // 1) zoom into the head (exponential feel), 2) reveal the loop inside, 3) accelerate.
  const zIn = seg(frame, 6, Math.min(tRum - 8, 96), easeInOut);
  const zoom = Math.exp(lerp(0, Math.log(ZOOM_END), zIn));
  const worldFade = 1 - seg(zIn, 0.93, 1);
  const camX = lerp(CX, PX, zIn);
  const camY = lerp(CY, HEAD_Y, zIn);

  const t0 = Math.min(tRum - 8, 96) + 6;
  const loopIn = seg(frame, t0 - 6, t0 + 30, easeOut);
  const t = Math.max(0, frame - t0) / 30; // seconds in the loop
  const intensity = seg(p, 0.35, 0.98, easeIn);
  // angle = integral of an accelerating angular velocity.
  const angle = (k: number) => 14 * k * t + 26 * k * k * t * t * 0.55 + 9 * k * Math.pow(t, 3) * 0.4;
  const shake = 0.4 + 7 * intensity;

  return (
    <>
      <Svg>
        <g style={{opacity: worldFade}}>
          <Camera cam={{x: camX, y: camY, zoom}} frame={frame}>
            <HandDrawn frame={frame}>
              <Ground y={GY} x1={-800} x2={2800} opacity={0.7} />
              <StickFigure x={PX} y={GY} scale={PS} pose={STAND} face={lerpFace(FACES.neutral, FACES.anxious, zIn)} frame={frame} seed={2} idle={0} noBlink />
            </HandDrawn>
            <Particles frame={frame} count={20} opacity={0.3} area={[0, 0, 1920, 900]} />
          </Camera>
        </g>

        {loopIn > 0 ? (
          <Camera cam={{x: CX, y: CY, zoom: 1}} shake={shake * loopIn} frame={frame}>
            <g opacity={loopIn}>
              <HandDrawn frame={frame} strength={3 + 4 * intensity}>
                <circle cx={CX} cy={CY} r={400} fill="#030303" stroke={intensity > 0.6 ? '#d9cfc8' : INK} strokeWidth={8} />
              </HandDrawn>
              <defs>
                {RINGS.map((rg, i) => (
                  <path key={i} id={`ring-${i}`} d={ringPath(rg.r)} />
                ))}
              </defs>
              {RINGS.map((rg, i) => {
                const circ = 2 * Math.PI * rg.r;
                const unit = rg.text + '  ·  ';
                const approx = unit.length * rg.size * 0.74;
                const n = Math.max(1, Math.round(circ / approx));
                const str = unit.repeat(n);
                const a = angle(rg.speed) * rg.dir;
                const ghosts = Math.floor(1 + intensity * 3);
                return (
                  <g key={i}>
                    {Array.from({length: ghosts}, (_, g) => (
                      <g key={g} transform={`rotate(${a - g * rg.dir * (2 + intensity * 7)} ${CX} ${CY})`} opacity={g === 0 ? 1 : 0.28 / g}>
                        <text fontFamily={SERIF} fontStyle={i === 2 ? 'normal' : 'italic'} fontWeight={600} fontSize={rg.size} fill={intensity > 0.5 && i === 1 ? '#d2504b' : INK} letterSpacing={3}>
                          <textPath href={`#ring-${i}`} textLength={circ - 4} lengthAdjust="spacing">
                            {str}
                          </textPath>
                        </text>
                      </g>
                    ))}
                    {/* looping arrowheads riding the ring */}
                    {[0, 120, 240].map((off) => {
                      const th = ((a * 1.0 * rg.dir + off) * Math.PI) / 180 * rg.dir;
                      const rr = rg.r + rg.size * 0.9 + 14;
                      const ax = CX + Math.cos(th) * rr;
                      const ay = CY + Math.sin(th) * rr;
                      const rot = (th * 180) / Math.PI + 90 * rg.dir;
                      return <path key={off} d="M -9 7 L 0 -7 L 9 7" fill="none" stroke={RED} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${ax},${ay}) rotate(${rot})`} opacity={0.85} />;
                    })}
                  </g>
                );
              })}
              {/* trapped in the cycle */}
              <circle cx={CX} cy={CY} r={78} fill="none" stroke={RED} strokeWidth={2} strokeDasharray="6 10" opacity={0.7} transform={`rotate(${-angle(2.4)} ${CX} ${CY})`} />
              <HandDrawn frame={frame}>
                <StickFigure
                  x={CX}
                  y={CY + 66}
                  scale={0.26}
                  pose={lerpPose(STAND, HEAD_HOLD, 0.35 + 0.65 * intensity)}
                  face={lerpFace(FACES.worried, FACES.anxious, intensity)}
                  frame={frame}
                  seed={9}
                  tremble={0.6 + 4 * intensity}
                  idle={0}
                  headScale={1.05}
                />
              </HandDrawn>
            </g>
          </Camera>
        ) : null}

        {loopIn > 0.3 ? (
          <text x={CX} y={96} textAnchor="middle" fontFamily={SANS} fontSize={20} letterSpacing={9} fill={INK} opacity={0.5 * loopIn}>
            RUMINATION
          </text>
        ) : null}
      </Svg>
      <Vignette amount={0.55 + 0.35 * intensity} tint={intensity > 0.2 ? '#1a0505' : '#000'} />
    </>
  );
};
