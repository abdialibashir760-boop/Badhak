import React from 'react';
import {C, serif} from './theme';
import {eo, win} from './ui';

const AX = '#3a3a3c';
const Txt: React.FC<{x: number; y: number; s: string; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number; serifFont?: boolean; o?: number}> = ({x, y, s, size = 24, color = C.ivory, anchor = 'start', weight = 500, serifFont, o = 1}) => (
  <text x={x} y={y} fontSize={size} fill={color} textAnchor={anchor} fontWeight={weight} opacity={o} fontFamily={serifFont ? serif : 'Inter, sans-serif'}>{s}</text>
);

/** Chart A: Nokia share of global handset units (labelled points from different trackers) */
export const ChartA: React.FC<{t: number; upTo: number}> = ({t, upTo}) => {
  const X0 = 200, X1 = 1720, Y0 = 880, Y1 = 330;
  const xs = (yr: number) => X0 + ((yr - 2000) / 12.6) * (X1 - X0);
  const ys = (v: number) => Y0 - (v / 45) * (Y0 - Y1);
  const pts = [
    {yr: 2000.5, v: 30, label: '≈30%', sub: '2000', color: C.gold, hollow: false},
    {yr: 2008.3, v: 40, label: '≈40%', sub: 'Q4 2007 · Nokia estimate', color: C.gold, hollow: false},
    {yr: 2006.3, v: 37.8, label: '37.8%', sub: '2007 full year · Gartner', color: C.ivory, hollow: true},
    {yr: 2012.2, v: 22.5, label: '22.5%', sub: 'Q1 2012 · Strategy Analytics', color: '#E24B4B', hollow: false},
  ];
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      {[0, 10, 20, 30, 40].map((v) => (
        <g key={v}>
          <line x1={X0} x2={X1} y1={ys(v)} y2={ys(v)} stroke={AX} strokeWidth={1} />
          <Txt x={X0 - 18} y={ys(v) + 8} s={`${v}%`} size={22} color={C.grey} anchor="end" />
        </g>
      ))}
      {[2000, 2004, 2008, 2012].map((yr) => (<Txt key={yr} x={xs(yr)} y={Y0 + 44} s={`${yr}`} size={24} color={C.grey} anchor="middle" />))}
      {pts.slice(0, upTo).map((p, i) => {
        const o = eo(win(t, 0.6 + i * 1.1, 1.3 + i * 1.1));
        const r = 16 * (0.4 + 0.6 * o);
        const dy = p.yr > 2007 && p.yr < 2007.5 ? -10 : 0;
        return (
          <g key={i} opacity={o}>
            <circle cx={xs(p.yr)} cy={ys(p.v)} r={r + 10} fill={p.color} opacity={0.15} />
            <circle cx={xs(p.yr)} cy={ys(p.v)} r={r} fill={p.hollow ? C.ink : p.color} stroke={p.color} strokeWidth={4} />
            <Txt x={xs(p.yr) + (p.yr > 2007 && p.v < 30 ? 0 : 0)} y={ys(p.v) - 38 + dy} s={p.label} size={44} color={p.color} anchor="middle" weight={700} />
            <Txt x={xs(p.yr)} y={ys(p.v) + 58} s={p.sub} size={21} color={C.grey} anchor="middle" />
          </g>
        );
      })}
      <Txt x={X0} y={Y1 - 50} s="Nokia's share of global handset units" size={28} color={C.goldHi} serifFont />
      <Txt x={X0} y={Y0 + 92} s="Points come from different trackers — they are not one continuous series." size={20} color={C.grey} />
    </svg>
  );
};

/** Chart C: Symbian share of smartphones */
export const ChartC: React.FC<{t: number; reveal: number; gap: number; annot: boolean}> = ({t, reveal, gap, annot}) => {
  const X0 = 200, X1 = 1760, Y0 = 880, Y1 = 330;
  const xs = (yr: number) => X0 + ((yr - 2006) / 7) * (X1 - X0);
  const ys = (v: number) => Y0 - (v / 80) * (Y0 - Y1);
  const pts: {yr: number; v: number; lo?: number; label: string; sub: string}[] = [
    {yr: 2006.5, v: 73, lo: 67, label: '67–73%', sub: '2006'},
    {yr: 2008.5, v: 52.4, label: '52.4%', sub: '2008'},
    {yr: 2009.5, v: 47.2, label: '47.2%', sub: '2009'},
    {yr: 2010.5, v: 37.6, label: '37.6%', sub: '2010'},
    {yr: 2011.4, v: 22.1, label: '22.1%', sub: 'Q2 2011'},
    {yr: 2012.4, v: 4.4, label: '4.4%', sub: 'Q2 2012 · IDC'},
  ];
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      {[0, 20, 40, 60, 80].map((v) => (
        <g key={v}><line x1={X0} x2={X1} y1={ys(v)} y2={ys(v)} stroke={AX} /><Txt x={X0 - 18} y={ys(v) + 8} s={`${v}%`} size={22} color={C.grey} anchor="end" /></g>
      ))}
      {[2006, 2008, 2010, 2012].map((yr) => (<Txt key={yr} x={xs(yr)} y={Y0 + 44} s={`${yr}`} size={24} color={C.grey} anchor="middle" />))}
      {annot && (
        <g opacity={eo(win(t, 0.4, 1.2))}>
          <line x1={xs(2011.12)} x2={xs(2011.12)} y1={Y1 - 10} y2={Y0} stroke={C.red} strokeWidth={3} strokeDasharray="10 8" />
          <Txt x={xs(2011.12) + 14} y={Y1 + 10} s="11 Feb 2011 · Windows Phone partnership" size={22} color="#E24B4B" />
        </g>
      )}
      {pts.map((p, i) => {
        const o = eo(win(t, reveal + i * gap, reveal + i * gap + 0.8));
        if (o <= 0) return null;
        return (
          <g key={i} opacity={o}>
            {p.lo && <rect x={xs(p.yr) - 18} y={ys(p.v)} width={36} height={ys(p.lo) - ys(p.v)} fill={C.gold} opacity={0.5} />}
            <circle cx={xs(p.yr)} cy={ys(p.v)} r={14} fill={i === 5 ? '#E24B4B' : C.gold} />
            <Txt x={xs(p.yr)} y={ys(p.v) - 30} s={p.label} size={36} color={i === 5 ? '#E24B4B' : C.goldHi} anchor="middle" weight={700} />
            <Txt x={xs(p.yr)} y={(p.lo ? ys(p.lo) : ys(p.v)) + 46} s={p.sub} size={20} color={C.grey} anchor="middle" />
          </g>
        );
      })}
      {annot && (
        <g opacity={eo(win(t, 2.2, 3.0))}>
          <rect x={xs(2009.1)} y={Y0 - 90} width={600} height={78} fill="rgba(11,11,12,.85)" stroke={C.gold} strokeWidth={2} />
          <Txt x={xs(2009.1) + 20} y={Y0 - 58} s="Q3 → Q4 2010: share 39% → 31%" size={28} color={C.goldHi} weight={700} />
          <Txt x={xs(2009.1) + 20} y={Y0 - 28} s="already falling before the announcement" size={22} color={C.ivory} />
        </g>
      )}
      <Txt x={X0} y={Y1 - 50} s="Symbian's share of smartphones sold" size={28} color={C.goldHi} serifFont />
      <Txt x={X0} y={Y0 + 92} s="Canalys through 2010 (as compiled by Wikipedia); IDC for 2012. 2006 sources differ (67% / 73%)." size={20} color={C.grey} />
    </svg>
  );
};

/** Chart D: Nokia smartphone shipments per quarter */
export const ChartD: React.FC<{t: number}> = ({t}) => {
  const Y0 = 860, X0 = 300, SPAN = 1250, UN = 15;
  const xs = (yrs: number) => X0 + (yrs / 1.75) * SPAN;
  const bars = [
    {q: 'Q4 2010', at: 0, v: 28.0, parts: null as null | [number, number]},
    {q: 'Q3 2011', at: 0.75, v: 16.8, parts: null},
    {q: 'Q4 2011', at: 1.0, v: 19.6, parts: null},
    {q: 'Q3 2012', at: 1.75, v: 6.3, parts: [2.9, 3.4] as [number, number]},
  ];
  const mx = xs(0.2);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={X0 - 120} x2={X0 + SPAN + 120} y1={Y0} y2={Y0} stroke={AX} strokeWidth={2} />
      <g opacity={eo(win(t, 0.6, 1.4))}>
        <line x1={mx} x2={mx} y1={300} y2={Y0} stroke={C.red} strokeWidth={3} strokeDasharray="10 8" />
        <Txt x={mx + 14} y={316} s="11 Feb 2011 · Windows Phone partnership" size={22} color="#E24B4B" />
      </g>
      {bars.map((b, i) => {
        const p = eo(win(t, 0.8 + i * 0.9, 1.9 + i * 0.9));
        const h = (b.v / 30) * 520 * p;
        const x = xs(b.at) - 65;
        return (
          <g key={i}>
            {b.parts ? (
              <>
                <rect x={x} y={Y0 - h * (b.parts[1] / b.v)} width={130} height={h * (b.parts[1] / b.v)} fill={C.gold} />
                <rect x={x} y={Y0 - h} width={130} height={h * (b.parts[0] / b.v)} fill={C.goldHi} />
                <Txt x={x + 150} y={Y0 - h * 0.75} s={`Lumia ${b.parts[0]}`} size={22} color={C.goldHi} o={p} />
                <Txt x={x + 150} y={Y0 - h * 0.3} s={`Symbian ${b.parts[1]}`} size={22} color={C.gold} o={p} />
              </>
            ) : (
              <rect x={x} y={Y0 - h} width={130} height={h} fill={`url(#g${i})`} />
            )}
            <defs><linearGradient id={`g${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.goldHi} /><stop offset="1" stopColor={C.gold} /></linearGradient></defs>
            <Txt x={x + 65} y={Y0 - h - 18} s={`${(b.v * p).toFixed(1)}M`} size={40} color={i === 3 ? '#E24B4B' : C.ivory} anchor="middle" weight={700} />
            <Txt x={x + 65} y={Y0 + 44} s={b.q} size={24} color={C.grey} anchor="middle" />
          </g>
        );
      })}
      <Txt x={200} y={260} s="Nokia smartphones shipped per quarter" size={28} color={C.goldHi} serifFont />
      <Txt x={200} y={Y0 + 96} s="Contested: critics blame the announcement; defenders point to Symbian's earlier decline. Bars spaced by real time. Source: Nokia results via press reports." size={20} color={C.grey} />
    </svg>
  );
};
