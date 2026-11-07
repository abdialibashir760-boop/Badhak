import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, serif, sans} from './theme';
import {Black, Embers, Headline, HBars, Kicker, LowerThird, Photo, SceneProps, Source, Stamp, VideoBG, Vignette, clamp, eo, eio, rng, useT, win} from './ui';
import {ChartA, ChartC, ChartD} from './charts';

const Center: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...style}}>{children}</div>
);
const Note: React.FC<{text: string; t: number; at?: number; y?: number}> = ({text, t, at = 1.2, y = 940}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontSize: 22, color: C.grey, opacity: eo(win(t, at, at + 0.8))}}>{text}</div>
);

/* ---------- Section 1 ---------- */
const Tile: React.FC<{t: number; at: number; value: number; dec: number; pre?: string; suf: string; label: string; x: number; foot?: string}> = ({t, at, value, dec, pre = '', suf, label, x, foot}) => {
  const p = eo(win(t, at, at + 1.6));
  return (
    <div style={{position: 'absolute', left: x, top: 330, width: 520, opacity: eo(win(t, at, at + 0.6)), transform: `translateY(${(1 - eo(win(t, at, at + 0.8))) * 30}px)`}}>
      <div style={{fontFamily: serif, fontSize: 110, color: C.gold, lineHeight: 1}}>{pre}{(value * p).toFixed(dec)}<span style={{fontSize: 52}}>{suf}</span></div>
      <div style={{width: 120, height: 3, background: C.gold, margin: '22px 0 16px'}} />
      <div style={{fontSize: 28, letterSpacing: 4, color: C.ivory, fontWeight: 600}}>{label}</div>
      {foot && <div style={{fontSize: 18, color: C.grey, marginTop: 10}}>{foot}</div>}
    </div>
  );
};
export const S11: React.FC<SceneProps> = () => {
  const t = useT();
  const r = rng(5);
  const dots = Array.from({length: 120}, () => ({x: r() * 1920, y: r() * 1080, s: r() * 3 + 1}));
  const conv = eio(win(t, 0, 3));
  return (
    <Black>
      {dots.map((d, i) => (<div key={i} style={{position: 'absolute', left: d.x + (960 - d.x) * conv * 0.25, top: d.y + (540 - d.y) * conv * 0.25, width: d.s, height: d.s, borderRadius: '50%', background: C.gold, opacity: 0.35 * (1 - conv * 0.6)}} />))}
      <Kicker text="2007 · The peak" t={t} y={140} />
      <Tile t={t} at={0.5} value={437.1} dec={1} suf=" M" label="HANDSETS SHIPPED" x={110} />
      <Tile t={t} at={1.4} value={51.1} dec={1} pre="€" suf=" bn" label="NET SALES" x={720} />
      <Tile t={t} at={2.3} value={7.99} dec={2} pre="€" suf=" bn" label="OPERATING PROFIT" foot="includes €858M net special items" x={1230} />
      <Source text="Source: Nokia 2007 annual results (Form 6-K / press release)" t={t} />
    </Black>
  );
};
export const S12: React.FC<SceneProps> = ({d}) => {
  const t = useT();
  return (<><VideoBG src="c40054" d={d} t={t} dim={0.3} /><LowerThird title="437 million handsets in 2007" sub="Illustrative factory footage" t={t} d={d} /></>);
};
export const S13: React.FC<SceneProps> = () => {
  const t = useT();
  const xs = (yr: number) => 220 + ((yr - 2007) / 7.4) * 1480;
  const L = eo(win(t, 0.2, 1.8));
  return (
    <Black>
      <Kicker text="The collapse, in two dates" t={t} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <line x1={220} x2={220 + 1480 * L} y1={500} y2={500} stroke={C.gold} strokeWidth={4} />
        {[2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014].map((y) => (<g key={y} opacity={L}><line x1={xs(y)} x2={xs(y)} y1={488} y2={512} stroke={C.grey} /><text x={xs(y)} y={548} fontSize={22} fill={C.grey} textAnchor="middle" fontFamily={sans}>{y}</text></g>))}
        <g opacity={eo(win(t, 1.0, 1.6))}><circle cx={xs(2007.5)} cy={500} r={18} fill={C.gold} /><text x={xs(2007.5)} y={450} fontSize={34} fill={C.gold} textAnchor="middle" fontFamily={sans} fontWeight={700}>2007 · the peak</text></g>
        <g opacity={eo(win(t, 3.0, 3.8))}><circle cx={xs(2012.2)} cy={500} r={18} fill="#E24B4B" /><line x1={xs(2012.2)} x2={xs(2012.2)} y1={520} y2={640} stroke="#E24B4B" strokeWidth={3} /></g>
        <g opacity={eo(win(t, 5.0, 5.8))}><circle cx={xs(2014.3)} cy={500} r={18} fill="#E24B4B" /><line x1={xs(2014.3)} x2={xs(2014.3)} y1={520} y2={780} stroke="#E24B4B" strokeWidth={3} /></g>
      </svg>
      <div style={{position: 'absolute', left: xs(2012.2) - 420, top: 650, width: 460, opacity: eo(win(t, 3.2, 4.0))}}>
        <div style={{fontFamily: serif, fontSize: 40, color: '#E24B4B'}}>Q1 2012 · five years on</div>
        <div style={{fontSize: 28, color: C.ivory, marginTop: 10}}>Samsung sells more phones than Nokia</div>
      </div>
      <div style={{position: 'absolute', left: xs(2014.3) - 420, top: 790, width: 560, opacity: eo(win(t, 5.2, 6.0))}}>
        <div style={{fontFamily: serif, fontSize: 40, color: '#E24B4B'}}>25 April 2014 · seven years on</div>
        <div style={{fontSize: 28, color: C.ivory, marginTop: 10}}>Microsoft completes the purchase of Nokia's phone business</div>
      </div>
    </Black>
  );
};
export const S14: React.FC<SceneProps> = () => {
  const t = useT();
  const sw = eio(win(t, 4.2, 5.6));
  const grow = eio(win(t, 0.4, 4));
  const gold = (x: number) => 860 - 440 * Math.pow(x, 0.8) * (x < 0.82 ? 1 : 1 - (x - 0.82) * 1.1 * sw);
  const pts = (fn: (x: number) => number, n: number) => Array.from({length: Math.round(n * 60) + 1}, (_, i) => { const x = i / 60 / 1; return `${300 + x * 1300 * 1},${fn(x)}`; }).slice(0, Math.max(2, Math.round(grow * 61))).join(' ');
  const red = (x: number) => 860 - 360 * Math.pow(x, 1.9);
  return (
    <Black>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <line x1={300} x2={1700} y1={880} y2={880} stroke="#3a3a3c" strokeWidth={2} /><line x1={300} x2={300} y1={300} y2={880} stroke="#3a3a3c" strokeWidth={2} />
        <polyline points={pts(gold, 1)} fill="none" stroke={C.gold} strokeWidth={8} />
        <polyline points={pts(red, 1)} fill="none" stroke="#E24B4B" strokeWidth={6} opacity={eo(win(t, 3.4, 4.4))} />
      </svg>
      <div style={{position: 'absolute', left: 80, top: 520, width: 200, transform: 'rotate(-90deg) translateX(-170px)', transformOrigin: 'left top', fontSize: 26, letterSpacing: 4, fontWeight: 700, color: C.gold}}>
        {t < 5.4 ? 'HANDSETS SOLD' : 'PLATFORMS BUILT'}
      </div>
      <Headline text="Winning on every measure — until the measure changed." t={t} y={130} size={56} w={1500} />
      <Note text="Concept graphic — not data" t={t} at={0.5} y={960} />
    </Black>
  );
};
export const S15: React.FC<SceneProps> = () => {
  const t = useT();
  const p = eo(win(t, 0.2, 1.4));
  return (
    <Black>
      <Center>
        <div style={{opacity: p, letterSpacing: 26 * (1.2 - p * 0.2), fontFamily: serif, fontSize: 92, color: C.gold}}>RISE &amp; RUIN</div>
        <div style={{width: 360 * p, height: 3, background: C.gold, margin: '34px 0'}} />
        <div style={{opacity: eo(win(t, 0.9, 1.8)), fontSize: 38, letterSpacing: 9, color: C.ivory, fontWeight: 600}}>HOW NOKIA LOST THE SMARTPHONE WAR</div>
      </Center>
    </Black>
  );
};

/* ---------- Section 2 ---------- */
export const S21: React.FC<SceneProps> = ({d}) => {
  const t = useT();
  return (<><VideoBG src="c87599" d={d} t={t} dim={0.3} tint={0.3} /><Kicker text="1865" t={t} y={110} /><LowerThird title="A pulp mill in Finland" sub="Illustrative footage" t={t} d={d} /></>);
};
export const S22: React.FC<SceneProps> = () => {
  const t = useT();
  const items = [{l: 'FORESTRY', fx: -700, fy: -400}, {l: 'CABLE', fx: 700, fy: -400}, {l: 'RUBBER', fx: -700, fy: 400}, {l: 'ELECTRONICS', fx: 700, fy: 400}];
  const m = eio(win(t, 1.0, 4.0));
  return (
    <Black>
      <Kicker text="1967 · The merger" t={t} />
      {items.map((it, i) => {
        const gx = (i % 2) * 290 - 145, gy = Math.floor(i / 2) * 190 - 95;
        return (
          <div key={i} style={{position: 'absolute', left: 960 + gx + it.fx * (1 - m) - 140, top: 560 + gy + it.fy * (1 - m) - 90, width: 280, height: 180, border: `3px solid ${C.gold}`, background: `rgba(201,162,75,${0.08 + m * 0.18})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, letterSpacing: 4, fontWeight: 700, color: C.goldHi}}>{it.l}</div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', fontFamily: serif, fontSize: 50, color: C.ivory, opacity: eo(win(t, 4.2, 5.2))}}>One group: forestry, cable, rubber and electronics</div>
    </Black>
  );
};
export const S24: React.FC<SceneProps> = () => {
  const t = useT();
  const r = rng(21);
  const nodes = Array.from({length: 14}, () => ({x: 260 + r() * 1400, y: 300 + r() * 500}));
  const links = nodes.flatMap((n, i) => nodes.slice(i + 1).map((m, j) => ({a: n, b: m, d: Math.hypot(n.x - m.x, n.y - m.y), k: i * 20 + j})).filter((l) => l.d < 380));
  return (
    <Black>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {links.map((l, i) => (<line key={i} x1={l.a.x} y1={l.a.y} x2={l.a.x + (l.b.x - l.a.x) * eo(win(t, 0.3 + (i % 20) * 0.2, 1.5 + (i % 20) * 0.2))} y2={l.a.y + (l.b.y - l.a.y) * eo(win(t, 0.3 + (i % 20) * 0.2, 1.5 + (i % 20) * 0.2))} stroke={C.gold} strokeWidth={2} opacity={0.6} />))}
        {nodes.map((n, i) => (<circle key={i} cx={n.x} cy={n.y} r={9} fill={C.goldHi} opacity={eo(win(t, 0.1 + i * 0.1, 0.8 + i * 0.1))} />))}
      </svg>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,11,12,.85) 0%, rgba(11,11,12,0) 38%, rgba(11,11,12,0) 62%, rgba(11,11,12,.9) 100%)'}} />
      <Kicker text="1 July 1991" t={t} />
      <Headline text="The first GSM call — on a network built by Nokia" t={t} y={190} size={60} w={1500} />
      <div style={{position: 'absolute', left: 120, bottom: 110, fontSize: 28, color: C.ivory, opacity: eo(win(t, 4, 5)), width: 1300}}>One digital standard meant a phone could work across borders.</div>
      <Note text="Abstract network graphic — not a map" t={t} at={0.5} y={1020} />
    </Black>
  );
};
export const S26: React.FC<SceneProps> = () => {
  const t = useT();
  const Y0 = 800, sc = 150;
  const cols = [{yr: '1991', v: -0.4, label: 'LOSS', x: 480}, {yr: '1995', v: 1, label: '≈ $1 bn', x: 960}, {yr: '1999', v: 4, label: 'almost $4 bn', x: 1440}];
  return (
    <Black>
      <Kicker text="Operating profit" t={t} />
      <Headline text="From loss to almost four billion dollars" t={t} y={170} size={54} w={1500} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <line x1={300} x2={1700} y1={Y0} y2={Y0} stroke="#3a3a3c" strokeWidth={2} />
        {cols.map((c, i) => {
          const p = eo(win(t, 1 + i * 1.3, 2.3 + i * 1.3));
          const h = c.v * sc * p;
          return (<g key={i}>
            <rect x={c.x - 80} y={h >= 0 ? Y0 - h : Y0} width={160} height={Math.abs(h)} fill={c.v < 0 ? C.red : C.gold} />
            <text x={c.x} y={h >= 0 ? Y0 - h - 18 : Y0 + Math.abs(h) + 44} fontSize={38} fontWeight={700} fill={c.v < 0 ? '#E24B4B' : C.goldHi} textAnchor="middle" fontFamily={sans} opacity={p}>{c.label}</text>
            <text x={c.x} y={Y0 + 130} fontSize={26} fill={C.grey} textAnchor="middle" fontFamily={sans}>{c.yr}</text>
          </g>);
        })}
      </svg>
      <div style={{position: 'absolute', left: 1130, top: 330, width: 560, padding: '18px 24px', border: `2px solid ${C.gold}`, background: 'rgba(11,11,12,.8)', opacity: eo(win(t, 9.5, 10.5)), fontSize: 30}}>
        <b style={{color: C.goldHi}}>October 1998</b><br />Nokia overtakes Motorola as the best-selling mobile phone brand
      </div>
      <Source text="Source: Nokia, as summarised in Wikipedia (Nokia). Figures approximate; 1991 shown only as a loss." t={t} />
    </Black>
  );
};

/* ---------- Section 3 ---------- */
export const S31: React.FC<SceneProps> = () => {
  const t = useT();
  return (
    <Black>
      <Kicker text="2000" t={t} y={90} />
      <ChartA t={t} upTo={1} />
      <div style={{position: 'absolute', left: 900, top: 330, width: 800, fontFamily: serif, fontSize: 46, lineHeight: 1.25, opacity: eo(win(t, 2, 3))}}>Almost twice the share of its nearest rival, <span style={{color: C.gold}}>Motorola</span></div>
      <Source text="Source: Wikipedia (Nokia), citing contemporary reporting" t={t} />
    </Black>
  );
};
export const S32: React.FC<SceneProps> = () => {
  const t = useT();
  return (
    <Black>
      <Kicker text="At its 2000 peak" t={t} />
      <div style={{position: 'absolute', left: 140, top: 340, opacity: eo(win(t, 0.2, 0.8))}}>
        <div style={{fontFamily: serif, fontSize: 190, color: C.gold, lineHeight: 1}}>≈4%</div>
        <div style={{fontSize: 30, letterSpacing: 3, marginTop: 14}}>OF FINLAND'S GDP</div>
      </div>
      <div style={{position: 'absolute', left: 1020, top: 340, opacity: eo(win(t, 0.9, 1.5))}}>
        <div style={{fontFamily: serif, fontSize: 190, color: C.gold, lineHeight: 1}}>≈70%</div>
        <div style={{fontSize: 30, letterSpacing: 3, marginTop: 14}}>OF HELSINKI EXCHANGE VALUE</div>
      </div>
    </Black>
  );
};
export const S35: React.FC<SceneProps> = () => {
  const t = useT();
  return (
    <Black>
      <Center>
        <div style={{fontFamily: serif, fontSize: 84, textAlign: 'center', width: 1400, lineHeight: 1.2, opacity: eo(win(t, 0.2, 1.1))}}>Designed with <span style={{color: C.gold}}>developing countries</span> in mind</div>
      </Center>
    </Black>
  );
};
export const S36: React.FC<SceneProps> = () => {
  const t = useT();
  const p = eo(win(t, 0.3, 2.2));
  return (
    <Black>
      <Center>
        <div style={{fontFamily: serif, fontSize: 250, color: C.gold, lineHeight: 1}}>{Math.round(250 * p)} M+<span style={{fontSize: 120, verticalAlign: 'super', color: C.ivory, opacity: eo(win(t, 2.4, 3))}}>*</span></div>
        <div style={{fontSize: 32, letterSpacing: 6, marginTop: 22}}>NOKIA 1100 · REPORTED SALES</div>
        <div style={{fontSize: 26, color: C.grey, marginTop: 28, opacity: eo(win(t, 3, 4))}}>* Company-linked sources and Reuters · widely repeated, not independently audited</div>
      </Center>
    </Black>
  );
};
export const S37: React.FC<SceneProps> = () => {
  const t = useT();
  return (
    <Black>
      <Kicker text="2007 · More than one in three phones" t={t} y={90} />
      <ChartA t={t} upTo={3} />
      <Source text="Sources: Nokia Q4 2007 release (via Softpedia); Gartner (via TechCrunch)" t={t} />
    </Black>
  );
};
