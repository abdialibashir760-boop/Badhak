/**
 * Reusable science-animation library.
 *   math      easing, Kepler solver, seeded random
 *   camera    perspective camera + projection
 *   Space     starfield, nebula backdrop, galaxy, vignette
 *   Planet    shaded planets (Earth, Moon, gas giants, ball, apple) and the Sun
 *   Surface   3D spacetime/potential grid with wells, bodies and surface lines
 *   Diagram   vectors, tags, cards, graphs, stamps
 *   Clock     analog clock driven by an elapsed-seconds value
 *   physics   free fall with bounce, orbit integrator, real planetary data
 *   Type      chapter cards, labels, statements
 */
export * from './math';
export * from './camera';
export * from './theme';
export * from './Space';
export * from './Planet';
export * from './Surface';
export * from './Diagram';
export * from './Clock';
export * from './physics';
export * from './Type';
