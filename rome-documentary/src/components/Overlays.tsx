import React from 'react';
import { TIMELINE } from '../data/timeline.generated';
const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * cl(t));
const PANEL: React.CSSProperties = { background: 'linear-gradient(180deg, rgba(243,231,198,0.94), rgba(226,204,156,0.94))', border: '2px solid rgba(88,54,30,0.9)', boxShadow: '0 10px 28px rgba(20,10,2,0.5), inset 0 0 0 5px rgba(243,231,198,0.5), inset 0 0 0 6px rgba(88,54,30,0.6)', color: '#2a1a10' };

export const YearBadge: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ ...PANEL, position: 'absolute', left: 64, top: 56, padding: '14px 30px 12px', textAlign: 'center' }}>
    <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 58, letterSpacing: 3, color: '#8f1d1b', lineHeight: 1 }}>{label}</div>
  </div>
);
const EVENTS: [number, string][] = [[-753, 'Founding'], [-509, 'Republic'], [-264, 'Punic Wars'], [-146, 'Carthage'], [-49, 'Rubicon'], [-27, 'Augustus'], [117, 'Trajan']];
export const TimelineBar: React.FC<{ year: number }> = ({ year }) => {
  const x = (y: number) => ((y + 753) / 870) * 100, pos = cl(x(year), 0, 100);
  return (
    <div style={{ position: 'absolute', left: 150, right: 150, bottom: 52, height: 74 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 30, height: 6, background: 'rgba(40,24,10,0.55)', borderRadius: 3 }} />
      <div style={{ position: 'absolute', left: 0, width: `${pos}%`, top: 30, height: 6, background: 'linear-gradient(90deg,#d9a93f,#a3201f)', borderRadius: 3 }} />
      {EVENTS.map(([y, n], i) => { const on = year >= y - 1; return <div key={i} style={{ position: 'absolute', left: `${x(y)}%`, top: 0, transform: 'translateX(-50%)', textAlign: 'center', opacity: on ? 1 : 0.55 }}>
        <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 600, fontSize: 20, color: '#2a1a10', textShadow: '0 0 6px rgba(242,230,196,1), 0 0 10px rgba(242,230,196,0.9)', whiteSpace: 'nowrap' }}>{n}</div>
        <div style={{ margin: '4px auto 0', width: 14, height: 14, borderRadius: 7, background: on ? '#a3201f' : '#d9c79d', border: '2px solid #2a1a10' }} /></div>; })}
      <div style={{ position: 'absolute', left: `${pos}%`, top: 24, width: 18, height: 18, marginLeft: -9, borderRadius: 9, background: '#ffd36a', border: '3px solid #2a1a10', boxShadow: '0 0 14px rgba(255,200,90,0.9)' }} />
    </div>
  );
};
export const LowerThird: React.FC<{ title: string; sub: string; f: number; fps: number; hasTimeline?: boolean }> = ({ title, sub, f, fps, hasTimeline }) => {
  const t = f / fps, a = ease(t / 0.5) * (1 - ease((t - 3.3) / 0.5)); if (a <= 0.01) return null;
  return (
    <div style={{ ...PANEL, position: 'absolute', left: 64, bottom: hasTimeline ? 150 : 76, padding: '16px 34px 14px 26px', opacity: a, transform: `translateX(${(1 - ease(t / 0.5)) * -60}px)`, minWidth: 360, borderLeft: '10px solid #a3201f' }}>
      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 34, letterSpacing: 4, color: '#2a1a10' }}>{title.toUpperCase()}</div>
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 600, fontSize: 27, color: '#6a3a1a', marginTop: 2 }}>{sub}</div>
    </div>
  );
};
const CHAPTERS: Record<string, string> = { beginning: 'I · THE BEGINNING', republic: 'II · THE REPUBLIC EXPANDS', caesar: 'III · JULIUS CAESAR AND POLITICAL TURMOIL', empire: 'IV · THE BIRTH OF THE EMPIRE', legacy: 'V · THE LEGACY' };
export const ChapterCard: React.FC<{ time: number }> = ({ time }) => {
  const first: Record<string, number> = {}; for (const s of TIMELINE.sentences) if (!(s.section in first)) first[s.section] = s.start;
  for (const [sec, label] of Object.entries(CHAPTERS)) { const t0 = first[sec] - 0.2, t = time - t0; if (t > 0 && t < 3.6) { const a = ease(t / 0.6) * (1 - ease((t - 2.9) / 0.7));
    return <div style={{ position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * -14}px)` }}><span style={{ ...PANEL, display: 'inline-block', padding: '12px 44px', fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 30, letterSpacing: 9 }}>{label}</span></div>; } }
  return null;
};
export const TitleOverlay: React.FC<{ time: number }> = ({ time }) => {
  const a = ease((time - 0.5) / 1.0) * (1 - ease((time - 5.0) / 0.9)); if (a <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a, background: 'radial-gradient(ellipse at 50% 50%, rgba(8,4,0,0.62), rgba(8,4,0,0) 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 600, fontSize: 28, letterSpacing: 18, color: '#d9a93f', marginBottom: 26 }}>A HISTORICAL DOCUMENTARY</div>
      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 86, lineHeight: 1.12, letterSpacing: 6, color: '#f6e7c4', textShadow: '0 4px 30px rgba(0,0,0,0.8)', maxWidth: 1500 }}>HOW ROME BECAME THE<br />MOST POWERFUL EMPIRE<br />IN THE ANCIENT WORLD</div>
      <div style={{ width: 360, height: 3, background: '#d9a93f', margin: '34px 0 0' }} />
    </div>
  );
};
export const EndCard: React.FC<{ time: number }> = ({ time }) => {
  const t0 = TIMELINE.total - 5.2, a = ease((time - t0) / 1.2); if (a <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 300, opacity: a, background: 'linear-gradient(180deg, rgba(10,6,2,0), rgba(10,6,2,0.88))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 56, textAlign: 'center' }}>
      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 42, letterSpacing: 8, color: '#f6e7c4' }}>ROME DID NOT BECOME POWERFUL OVERNIGHT</div>
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 600, fontSize: 30, color: '#d9c79d', marginTop: 10 }}>Historical sources in the description · Music and visuals are original works</div>
    </div>
  );
};
