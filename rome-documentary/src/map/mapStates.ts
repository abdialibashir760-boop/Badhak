// Per-shot map choreography: (progress p∈[0,1], local seconds t) → engine state. Camera, conquest clock τ, overlays.
import { ROUTES } from '../data/history';
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t));
const ramp = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
type Cam = { lon: number; lat: number; W: number };
const cam = (a: Cam, b: Cam, p: number): Cam => ({ lon: lerp(a.lon, b.lon, p), lat: lerp(a.lat, b.lat, p), W: Math.exp(lerp(Math.log(a.W), Math.log(b.W), p)) });
const C = (lon: number, lat: number, W: number): Cam => ({ lon, lat, W });
const hav = (a: number[], b: number[]) => { const R = 6371, r = Math.PI / 180, dLat = (b[1] - a[1]) * r, dLon = (b[0] - a[0]) * r, h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };

export type MapText = { lon: number; lat: number; text: string; a: number; size?: number; color?: string; font?: 'caps' | 'serif'; rot?: number };
export type MapState = { cam: Cam; tau: number; layers?: any; modernMix?: number; footprint?: number; labelsA?: number; texts?: MapText[]; year?: boolean; timeline?: boolean; yr?: number };
const RED = '150,24,26', VIOLET = '88,52,120';

export const MAP_STATES: Record<string, (p: number, t: number) => MapState> = {
  threeContinents: (p) => ({ cam: cam(C(18, 34, 150), C(19, 36, 128), ease(p)), tau: 7.3, year: true, timeline: false, layers: { labels: false, cities: false, compass: false },
    texts: [{ lon: 14, lat: 51.5, text: 'EUROPE', a: ramp(p, 0.1, 0.4), size: 38 }, { lon: 20, lat: 17, text: 'AFRICA', a: ramp(p, 0.35, 0.65), size: 38 }, { lon: 50, lat: 47, text: 'ASIA', a: ramp(p, 0.6, 0.9), size: 38 }] }),
  zoomItaly: (p) => { const q = ease(p); return { cam: cam(C(19, 36, 128), C(12.8, 41.6, 26), q), tau: 7.3 * (1 - ease(ramp(p, 0, 0.55))) , year: true, timeline: true, layers: { romeGlow: ramp(p, 0.5, 1), dim: 0.5 * ramp(p, 0.6, 1), cities: p > 0.8, labels: false, compass: false } }; },
  italyRome: (p, t) => ({ cam: cam(C(12.8, 41.6, 26), C(12.5, 41.9, 13), ease(p)), tau: 0, year: true, timeline: true, layers: { romeGlow: 1, dim: 0.55, labels: false },
    texts: [{ lon: 12.3, lat: 43.1, text: 'TIBER RIVER', a: ramp(p, 0.4, 0.8), size: 15, font: 'serif', color: '30,70,110', rot: -70 }] }),
  etruria: (p) => ({ cam: cam(C(13.2, 41.2, 22), C(13.8, 40.6, 19), ease(p)), tau: 0, year: true, timeline: true, layers: { labels: false, cities: false, romeGlow: 0.35,
    regions: [{ poly: [[10.2, 42.3], [10.6, 43.7], [11.6, 44.0], [12.4, 43.6], [12.4, 42.5], [11.8, 42.0]], color: '70,96,120', a: ramp(p, 0.05, 0.3) }, { poly: [[12.0, 41.3], [12.6, 42.1], [13.3, 41.9], [13.6, 41.3], [13.0, 41.0], [12.4, 41.2]], color: RED, a: ramp(p, 0.25, 0.5) }],
    markers: [{ lon: 14.1, lat: 40.8, label: 'Cumae', color: '30,90,140', a: ramp(p, 0.55, 0.75), size: 15 }, { lon: 17.2, lat: 40.5, label: 'Taras', color: '30,90,140', a: ramp(p, 0.62, 0.82), size: 15 }, { lon: 15.3, lat: 37.1, label: 'Syracuse', color: '30,90,140', a: ramp(p, 0.7, 0.9), size: 15 }, { lon: 12.5, lat: 41.9, label: 'Rome', a: 1, size: 17 }] },
    texts: [{ lon: 11.4, lat: 43.1, text: 'ETRVRIA', a: ramp(p, 0.1, 0.35), size: 17, color: '40,66,92' }, { lon: 13.1, lat: 41.45, text: 'LATIVM', a: ramp(p, 0.3, 0.55), size: 14, color: '110,14,16' }, { lon: 16.6, lat: 38.7, text: 'GREEK COLONIES', a: ramp(p, 0.65, 0.9), size: 14, color: '30,70,110', font: 'serif' }] }),
  conquest: (p) => ({ cam: cam(C(12.9, 41.5, 24), C(13.0, 41.3, 30), ease(p)), tau: 1.85 + 0.9 * ease(p) , year: true, timeline: true, layers: { labels: true } }),
  carthage: (p) => ({ cam: cam(C(12.0, 38.5, 52), C(10.5, 37.5, 38), ease(p)), yr: -264, tau: 2.7, year: true, timeline: true, layers: { carthage: ramp(p, 0.1, 0.5), labels: false,
    markers: [{ lon: 12.5, lat: 41.9, label: 'ROME', a: ramp(p, 0, 0.2), size: 19, align: 'right' }, { lon: 10.32, lat: 36.85, label: 'CARTHAGE', a: ramp(p, 0.4, 0.7), size: 19, color: '60,28,92', dy: 4 }] },
    texts: [{ lon: 18.0, lat: 34.2, text: 'MARE INTERNVM', a: ramp(p, 0.5, 0.9) * 0.8, size: 22, font: 'serif', color: '40,76,92' }] }),
  fleet: (p) => ({ cam: C(13.2, 39.2, 22 + 3 * p), tau: 2.7 + 0.7 * ease(ramp(p, 0.3, 1)), year: true, timeline: true, layers: { carthage: 1 - 0.6 * ramp(p, 0.4, 1), labels: false,
    routes: [{ pts: ROUTES.punicFleet, p: ease(p), color: RED, width: 4, marker: 'ship', dash: true }], markers: [{ lon: 13.58, lat: 37.3, kind: 'battle', a: ramp(p, 0.55, 0.75), label: 'Agrigentum', size: 15 }] } }),
  hannibal: (p) => ({ cam: cam(C(3.0, 41.0, 32), C(10.0, 43.0, 30), ease(ramp(p, 0.1, 1))), yr: -218 + 2 * ease(ramp(p, 0.6, 1)), tau: 3.0, year: true, timeline: true, layers: { carthage: 0.85, labels: false,
    routes: [{ pts: ROUTES.hannibal, p: ease(ramp(p, 0, 0.95)), color: VIOLET, width: 5, marker: 'elephant' }],
    markers: [{ lon: -0.99, lat: 37.6, kind: 'pin', label: 'New Carthage', a: ramp(p, 0, 0.1), size: 15, color: VIOLET }, { lon: 7.0, lat: 44.8, kind: 'pin', label: 'The Alps', a: ramp(p, 0.5, 0.65), size: 15, align: 'right', color: '40,40,60' }, { lon: 16.13, lat: 41.3, kind: 'battle', label: 'Cannae', a: ramp(p, 0.92, 1), size: 16 }] } }),
  scipio: (p) => ({ cam: cam(C(12.0, 39.5, 20), C(10.8, 37.6, 14), ease(p)), yr: -202 + 56 * ease(ramp(p, 0.6, 1)), tau: 3.3 + 0.7 * ease(ramp(p, 0.4, 1)), year: true, timeline: true, layers: { carthage: 1 - ramp(p, 0.5, 1), labels: false,
    routes: [{ pts: ROUTES.scipio, p: ease(ramp(p, 0, 0.85)), color: RED, width: 5, marker: 'army', dash: true }], markers: [{ lon: 9.5, lat: 36.0, kind: 'battle', label: 'Zama', a: ramp(p, 0.8, 1), size: 17, align: 'right' }] } }),
  gaul: (p) => ({ cam: cam(C(4.5, 46.2, 20), C(5.0, 47.2, 15), ease(p)), yr: -58 + 8 * ease(p), tau: 4.25 + 0.7 * ease(p), year: true, timeline: true, layers: { labels: true,
    routes: [{ pts: ROUTES.caesarGaul, p: ease(ramp(p, 0, 0.95)), color: RED, width: 4, marker: 'army' }], markers: [{ lon: 4.5, lat: 47.54, kind: 'battle', label: 'Alesia · 52 BCE', a: ramp(p, 0.55, 0.75), size: 15 }] } }),
  rubicon: (p) => ({ cam: cam(C(12.3, 43.0, 14), C(12.4, 43.3, 8.5), ease(p)), yr: -49, tau: 4.9, year: true, timeline: true, layers: { labels: false, cities: false,
    routes: [{ pts: ROUTES.rubicon, p: ease(ramp(p, 0.25, 1)), color: RED, width: 5, marker: 'army' }],
    markers: [{ lon: 12.45, lat: 44.07, kind: 'pin', label: 'Rubicon', a: ramp(p, 0, 0.2), size: 18, align: 'right', color: '30,70,110' }, { lon: 12.5, lat: 41.9, kind: 'pin', label: 'Rome', a: ramp(p, 0, 0.2), size: 18 }, { lon: 12.2, lat: 44.4, kind: 'pin', label: 'Ravenna', a: ramp(p, 0, 0.2), size: 14, align: 'right' }] } }),
  civilWar: (p) => ({ cam: cam(C(17.0, 39.0, 58), C(14.0, 38.0, 70), ease(p)), yr: -49 + 4 * ease(p), tau: 5.0, year: true, timeline: true, layers: { labels: true,
    routes: [{ pts: ROUTES.caesarWar, p: ease(p), color: RED, width: 4, marker: 'army', dash: true }],
    markers: [{ lon: 22.38, lat: 39.28, kind: 'battle', label: 'Pharsalus', a: ramp(p, 0.3, 0.5), size: 15, dy: -18 }, { lon: 10.9, lat: 35.6, kind: 'battle', label: 'Thapsus', a: ramp(p, 0.65, 0.8), size: 15 }, { lon: -4.75, lat: 37.2, kind: 'battle', label: 'Munda', a: ramp(p, 0.9, 1), size: 15, dy: 18 }] } }),
  egypt: (p) => ({ cam: cam(C(22, 36, 44), C(25, 34, 36), ease(p)), yr: -31 + 1 * ease(p), tau: 5.1 + 0.7 * ease(ramp(p, 0.35, 1)), year: true, timeline: true, layers: { labels: true,
    routes: [{ pts: ROUTES.actium, p: ease(ramp(p, 0, 0.9)), color: RED, width: 4, marker: 'ship', dash: true }],
    markers: [{ lon: 20.74, lat: 38.95, kind: 'battle', label: 'Actium', a: ramp(p, 0.2, 0.4), size: 16, align: 'right' }, { lon: 29.92, lat: 31.2, kind: 'pin', label: 'Alexandria', a: ramp(p, 0.85, 1), size: 16, align: 'right' }] } }),
  trade: (p) => ({ cam: cam(C(14, 40, 60), C(16, 39, 52), ease(p)), tau: 6.4, year: false, timeline: false, layers: { trade: ease(ramp(p, 0.05, 0.9)), labels: false }, texts: [
    { lon: 1, lat: 33.0, text: 'GRAIN · OIL · WINE', a: ramp(p, 0.5, 0.8), size: 15, font: 'serif', color: '24,70,104' }, { lon: 40, lat: 27.0, text: 'SPICES · SILK', a: ramp(p, 0.7, 0.95), size: 15, font: 'serif', color: '110,56,12' }] }),
  extent: (p, t) => ({ cam: cam(C(15, 41, 54), C(18.5, 43.5, 66), ease(p)), tau: 5.2 + 2.05 * ease(ramp(p, 0, 0.85)), year: true, timeline: true, layers: { labels: true } }),
  roads: (p) => ({ cam: cam(C(18, 43, 66), C(15, 42, 50), ease(p)), tau: 7.3, year: false, timeline: false, layers: { roads: ease(ramp(p, 0.05, 0.95)), labels: false } }),
  frontier: (p) => ({ cam: cam(C(15, 42, 50), C(19, 44, 62), ease(p)), tau: 7.3, year: false, timeline: false, layers: { roads: 1, frontier: ease(ramp(p, 0.05, 0.95)), labels: false } }),
  distance: (p) => { const a = [-0.09, 51.5], b = [44.58, 33.09], km = Math.round(hav(a, b) / 100) * 100; return { cam: cam(C(19, 42, 64), C(21, 42.5, 72), ease(p)), tau: 7.3, year: false, timeline: false, layers: { roads: 0.0, labels: false, cities: false,
    routes: [{ pts: [a, [12, 56], [30, 45], b] as any, p: ease(ramp(p, 0.1, 0.7)), color: '214,170,60', width: 4, marker: 'none', dash: true }],
    markers: [{ lon: a[0], lat: a[1], kind: 'pin', label: 'Britannia', a: ramp(p, 0, 0.15), size: 16, align: 'right' }, { lon: b[0], lat: b[1], kind: 'pin', label: 'Mesopotamia', a: ramp(p, 0.65, 0.8), size: 16 }] },
    texts: [{ lon: 22, lat: 53.2, text: `≈ ${km.toLocaleString('en-US')} km`, a: ramp(p, 0.55, 0.8), size: 30, color: '90,12,14' }] }; },
  modern: (p) => ({ cam: cam(C(18.5, 43.5, 66), C(24, 33, 176), ease(ramp(p, 0.08, 0.85))), tau: 7.3, year: false, timeline: false, modernMix: ease(ramp(p, 0.22, 0.6)), footprint: 1, labelsA: ease(ramp(p, 0.55, 0.85)), layers: { labels: true, compass: false } }),
};
