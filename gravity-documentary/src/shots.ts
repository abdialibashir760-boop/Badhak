import type React from 'react';
import type { SectionId } from './timeline';
import type { ShotProps } from './shots/hook';
import { HandDrop, FallFollow, BounceSettle, Ascent, EarthOrbit, CosmicZoom } from './shots/hook';
import {
  NewtonCard, MassPair, NewtonEquation, InverseSquare, AppleEarth, MoonOrbit, EarthSun, NewtonCannon, ActionAtDistance,
} from './shots/newton';
import {
  EinsteinCard, SpacetimeDiagram, MassBendsGrid, WheelerQuote, RubberSheet, AnalogyLimits, GeodesicMarbles, GlobeGeodesics, OrbitGeodesic,
} from './shots/einstein';
import {
  OrbitsCard, SunWell, CoastingPlanet, WhyNotFall, SolarFlythrough, SpeedChart, MercuryPrecession, DescendToEarth,
} from './shots/orbits';
import { TimeCard, TwoClocksSync, TickRates, DivergingClocks, OpticalClocks, GpsConstellation, ClockBudget, PositionDrift } from './shots/time';
import { BallReturn, Worldlines, Montage, WideEarthSolar, GalaxyWide, EndCard } from './shots/finale';

export type Shot = {
  id: string;
  section: SectionId;
  start: number;
  dur: number;
  title: string;
  /** one-line storyboard description: what is on screen and what it explains */
  desc: string;
  Component: React.FC<ShotProps>;
};

type Def = [section: SectionId, dur: number, title: string, desc: string, Component: React.FC<ShotProps>];

const DEFS: Def[] = [
  // ── 0:00–0:25 THE HOOK ──
  ['hook', 4, 'The drop', 'Close, dim, slow-motion: a hand opens and a ball falls to the floor.', HandDrop],
  ['hook', 3.5, 'Follow the fall', 'Camera rides the falling ball past a ruler; speed readout climbs 9.8 m/s every second; GRAVITY title.', FallFollow],
  ['hook', 3.5, 'It feels simple', 'The ball bounces and settles; g ≈ 9.81 m/s² readout; the camera tips up toward the sky.', BounceSettle],
  ['hook', 4.5, 'Leaving the ground', 'Ascent through the atmosphere; sky fades to black, the horizon curves into a planet; altitude counter.', Ascent],
  ['hook', 4.5, 'The question', 'Earth and Moon in orbit light; "Is gravity really a force?"', EarthOrbit],
  ['hook', 5, 'Zoom to the universe', 'Pull back from Earth–Moon to the solar system to the Milky Way; film title appears.', CosmicZoom],
  // ── 0:25–1:05 NEWTON ──
  ['newton', 4.5, 'Chapter I: Newton', 'Chapter card, 1687, with a faint orbit motif.', NewtonCard],
  ['newton', 5.5, 'Masses attract', 'Two spheres; the pull arrows grow as mass increases, then as distance halves.', MassPair],
  ['newton', 3.5, 'The law', 'F = G m₁m₂ / r² builds term by term with plain-language labels and the value of G.', NewtonEquation],
  ['newton', 4.5, 'Inverse-square', 'Animated curve: double the distance, a quarter of the pull.', InverseSquare],
  ['newton', 4.5, 'The apple', 'An apple drops toward the curve of the Earth; forces on both bodies are drawn.', AppleEarth],
  ['newton', 4.5, 'The Moon', 'Moon in orbit with gravity and velocity vectors and a trail.', MoonOrbit],
  ['newton', 4, 'The Earth', 'Earth circles a glowing Sun along an ellipse; gravity vector.', EarthSun],
  ['newton', 5.5, "Newton's cannon", 'Three cannon shots at rising speed: lands near, lands far, never lands (orbit).', NewtonCannon],
  ['newton', 3.5, 'How does it reach?', 'Earth and Moon across the void with a pulsing "?"; Newton on "I frame no hypotheses".', ActionAtDistance],
  // ── 1:05–1:55 EINSTEIN ──
  ['einstein', 4.5, 'Chapter II: Einstein', 'Chapter card, 1915, a grid sagging behind it, field equations.', EinsteinCard],
  ['einstein', 5.5, 'Spacetime diagram', 'Space and time axes, light cone, an object at rest and one moving.', SpacetimeDiagram],
  ['einstein', 6, 'Mass bends the grid', 'A heavy sphere appears; the 3D grid sags and the curvature ripples outward at light speed.', MassBendsGrid],
  ['einstein', 4.5, "Wheeler's summary", 'Typographic quote over a slowly turning grid.', WheelerQuote],
  ['einstein', 5, 'Rubber sheet', 'Heavy ball on a sheet, a marble curving round it; stamped ANALOGY.', RubberSheet],
  ['einstein', 6, 'Where the analogy stops', 'Side-by-side: a sheet bending into a third dimension vs. stacked time-slices of space.', AnalogyLimits],
  ['einstein', 6, 'Straightest paths', 'Marbles cross the grid in parallel straight lines; the curvature bends each differently.', GeodesicMarbles],
  ['einstein', 6.5, 'Paths on a globe', 'Two parallel paths on a globe drift together — curvature, not a force.', GlobeGeodesics],
  ['einstein', 6, 'A small object near a big one', 'A small body follows the straightest path round the well; camera orbits.', OrbitGeodesic],
  // ── 1:55–2:40 ORBITS ──
  ['orbits', 4, 'Chapter III: Orbits', 'Chapter card over a glowing Sun with orbit rings.', OrbitsCard],
  ['orbits', 6, 'The Sun curves spacetime', 'A glowing Sun in a deep well; planets circle on the grid.', SunWell],
  ['orbits', 6, 'Coasting', 'One planet on its path with a motion arrow; "straightest possible path".', CoastingPlanet],
  ['orbits', 8, 'Why not fall in?', 'Four launches from the same point: straight in, falls around, circle, ellipse.', WhyNotFall],
  ['orbits', 8, 'The solar system', 'Fly-through of all eight planets on time-lapsed Kepler orbits; camera pulls back.', SolarFlythrough],
  ['orbits', 5, 'Faster near, slower far', 'Animated bar race of real orbital speeds, Mercury 47.4 km/s to Neptune 5.4 km/s.', SpeedChart],
  ['orbits', 5, "Mercury's shift", 'A precessing ellipse (exaggerated) vs a fixed one; ~43 arc-seconds per century.', MercuryPrecession],
  ['orbits', 3, 'Descend to Earth', 'Zoom from the solar system down to Earth, setting up the next chapter.', DescendToEarth],
  // ── 2:40–3:25 TIME ──
  ['time', 4, 'Chapter IV: Time', 'Chapter card with a giant faint clock face.', TimeCard],
  ['time', 6, 'Two clocks', 'Two identical synchronised clocks: one at the surface, one far above.', TwoClocksSync],
  ['time', 6, 'Deeper = slower', 'Tick tracks over a gravity gradient: the lower clock ticks less often (exaggerated).', TickRates],
  ['time', 6, 'The readings drift', 'Clock faces and digital readouts separate; difference counter (exaggerated).', DivergingClocks],
  ['time', 5, 'Measured over 33 cm', 'Two optical clocks 33 cm apart; the higher one ticks faster, ≈4×10⁻¹⁷.', OpticalClocks],
  ['time', 7, 'GPS constellation', 'Six inclined orbital planes of satellites round Earth; signals to a receiver.', GpsConstellation],
  ['time', 6, 'The clock budget', 'Waterfall: +45.7 µs/day (gravity), −7.2 (speed), net +38.5.', ClockBudget],
  ['time', 5, 'Drift', 'A map where the GPS position slides away from the true one, to ~11 km over a day.', PositionDrift],
  // ── 3:25–4:00 THE BIG PICTURE ──
  ['finale', 6, 'Back to the ball', 'The opening drop again, with warped time-lines around its path.', BallReturn],
  ['finale', 6, 'Worldlines', 'Spacetime diagram: standing still needs a push; free fall is the natural path.', Worldlines],
  ['finale', 6, 'One idea, many effects', 'Four panels: falling, orbits, clocks, spacetime curvature.', Montage],
  ['finale', 6, 'Earth, Moon, Sun', 'Wide cinematic view of the Earth–Moon system with the Sun glaring.', WideEarthSolar],
  ['finale', 6, 'The galaxy', 'Slow push over the Milky Way with the Sun marked.', GalaxyWide],
  ['finale', 5, 'End title', 'WHAT GRAVITY ACTUALLY IS, fade to black.', EndCard],
];

export const SHOTS: Shot[] = (() => {
  let cur = 0;
  return DEFS.map(([section, dur, title, desc, Component], i) => {
    const s: Shot = { id: `s${String(i + 1).padStart(2, '0')}`, section, start: cur, dur, title, desc, Component };
    cur += dur;
    return s;
  });
})();
