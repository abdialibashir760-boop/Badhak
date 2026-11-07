import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, serif, sans} from './theme';
import {Black, Embers, Headline, HBars, Kicker, SceneProps, Source, VideoBG, Vignette, clamp, eo, eio, rng, useT, win} from './ui';
import {ChartC, ChartD} from './charts';

const Center: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
);

/* ---------- Section 7 ---------- */
export const S72: React.FC<SceneProps> = () => {
  const t = useT();
  return (
    <Black>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 100%, rgba(255,120,30,0.28) 0%, rgba(11,11,12,0) 60%)'}} />
      <Embers t={t} />
      <Kicker text="8 February 2011" t={t} y={140} />
      <Center>
        <div style={{fontFamily: serif, fontSize: 110, textAlign: 'center', opacity: eo(win(t, 0.5, 1.6)), lineHeight: 1.15}}>The <span style={{color: C.gold}}>“burning platform”</span><br />memo</div>
        <div style={{fontSize: 32, color: C.goldHi, marginTop: 40, width: 1100, textAlign: 'center', opacity: eo(win(t, 3, 4)), lineHeight: 1.4}}>It opens with a story about a man on a burning oil platform.<br /><span style={{color: C.grey, fontSize: 24}}>Leaked to Engadget; later reported as confirmed by multiple sources</span></div>
      </Center>
    </Black>
  );
};
const QUOTES = ['We fell behind, we missed big trends, and we lost time.', 'The first iPhone shipped in 2007, and we still don\'t have a product that is close to their experience.', 'The battle of devices has now become a war of ecosystems.'];
export const S73: React.FC<SceneProps> = ({d}) => {
  const t = useT();
  const lens = QUOTES.map((q) => q.length);
  const tot = lens.reduce((a, b) => a + b, 0);
  let acc = 0;
  const ranges = lens.map((l) => { const a = acc / tot * d; acc += l; return [a, acc / tot * d] as [number, number]; });
  return (
    <Black>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 110%, rgba(255,120,30,0.18) 0%, rgba(11,11,12,0) 55%)'}} />
      <Embers t={t} n={40} seed={4} />
      {QUOTES.map((q, i) => {
        const [a, b] = ranges[i];
        const o = eo(win(t, a, a + 0.5)) * (1 - eo(win(t, b - 0.25, b)));
        return (<div key={i} style={{position: 'absolute', left: 200, width: 1520, top: 300, opacity: o, fontFamily: serif, fontSize: 70, lineHeight: 1.25, fontStyle: 'italic', color: C.ivory, transform: `translateY(${(1 - eo(win(t, a, a + 0.8))) * 24}px)`}}><span style={{color: C.gold}}>“</span>{q}<span style={{color: C.gold}}>”</span></div>);
      })}
      <div style={{position: 'absolute', left: 200, bottom: 100, fontSize: 24, color: C.grey}}>Stephen Elop, internal memo · reported by Engadget, 8 Feb 2011</div>
    </Black>
  );
};
export const S74: React.FC<SceneProps> = () => {
  const t = useT();
  const Row: React.FC<{y: number; at: number; mark: string; text: string; sub: string; color: string}> = ({y, at, mark, text, sub, color}) => (
    <div style={{position: 'absolute', left: 260, top: y, display: 'flex', alignItems: 'center', gap: 40, opacity: eo(win(t, at, at + 0.7)), transform: `translateX(${(1 - eo(win(t, at, at + 0.7))) * 50}px)`}}>
      <div style={{width: 100, height: 100, border: `5px solid ${color}`, color, borderRadius: '50%', fontSize: 62, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{mark}</div>
      <div><div style={{fontFamily: serif, fontSize: 60}}>{text}</div><div style={{fontSize: 28, color: C.grey, marginTop: 4}}>{sub}</div></div>
    </div>
  );
  return (
    <Black>
      <Kicker text="11 February 2011 · London" t={t} />
      <Headline text="Nokia announces a partnership with Microsoft" t={t} y={170} size={58} w={1500} />
      <Row y={390} at={2.2} mark="✕" text="Symbian" sub="to be phased out" color="#E24B4B" />
      <Row y={560} at={4.4} mark="✕" text="MeeGo" sub="its own next-generation system — sidelined" color="#E24B4B" />
      <Row y={730} at={6.6} mark="✓" text="Windows Phone" sub="the primary smartphone platform" color={C.gold} />
    </Black>
  );
};
export const S75: React.FC<SceneProps> = () => {
  const t = useT();
  return (
    <Black>
      <Kicker text="Elop's stated reasoning" t={t} />
      <div style={{position: 'absolute', left: 200, top: 270, width: 1500, fontFamily: serif, fontSize: 64, lineHeight: 1.3, fontStyle: 'italic', opacity: eo(win(t, 0.5, 1.4))}}><span style={{color: C.gold}}>“</span>…a collision course with Samsung<span style={{color: C.gold}}>”</span></div>
      <div style={{position: 'absolute', left: 200, top: 520, width: 1500, fontFamily: serif, fontSize: 64, lineHeight: 1.3, fontStyle: 'italic', opacity: eo(win(t, 4.5, 5.4))}}><span style={{color: C.gold}}>“</span>…we would have difficulty differentiating.<span style={{color: C.gold}}>”</span></div>
      <div style={{position: 'absolute', left: 200, bottom: 120, fontSize: 24, color: C.grey}}>Stephen Elop, as reported by TechRadar and Computing · his explanation of why Nokia avoided Android</div>
    </Black>
  );
};
export const S76: React.FC<SceneProps> = () => { const t = useT(); return (<Black><Kicker text="Smartphone shipments" t={t} y={90} /><ChartD t={t} /></Black>); };
export const S77: React.FC<SceneProps> = () => {
  const t = useT();
  const Side: React.FC<{x: number; title: string; text: string; color: string; at: number}> = ({x, title, text, color, at}) => (
    <div style={{position: 'absolute', left: x, top: 300, width: 780, padding: 44, border: `3px solid ${color}`, background: 'rgba(11,11,12,.7)', opacity: eo(win(t, at, at + 0.7))}}>
      <div style={{fontSize: 28, letterSpacing: 6, fontWeight: 700, color}}>{title}</div>
      <div style={{fontFamily: serif, fontSize: 50, marginTop: 18, lineHeight: 1.25}}>{text}</div>
    </div>
  );
  return (
    <Black>
      <Kicker text="Was it the wrong turn?" t={t} />
      <Side x={120} title="CRITICS" text="Announcing the future killed demand for the present — the Osborne effect." color="#E24B4B" at={0.5} />
      <Side x={1020} title="DEFENDERS" text="Symbian's share was already falling before the announcement." color={C.gold} at={3.2} />
    </Black>
  );
};

/* ---------- Section 8 ---------- */
export const S81: React.FC<SceneProps> = () => {
  const t = useT();
  return (
    <Black>
      <Kicker text="Q1 2012 · First place changes hands" t={t} />
      <HBars bars={[{label: 'Samsung', value: 93.5, color: C.red}, {label: 'Nokia', value: 82.7, color: C.gold}]} max={100} t={t} fmt={(v) => `${v.toFixed(1)} M`} y={340} rowH={190} />
      <div style={{position: 'absolute', left: 120, top: 780, fontFamily: serif, fontSize: 42, opacity: eo(win(t, 3.6, 4.6))}}>Nokia had held the top spot since 1998 · its share of units: <span style={{color: '#E24B4B'}}>22.5%</span></div>
      <Source text="Handsets shipped, Q1 2012. Source: Strategy Analytics via Business Wire (IDC: Samsung 93.8M, Nokia 82.7M)" t={t} />
    </Black>
  );
};
export const S82: React.FC<SceneProps> = () => {
  const t = useT();
  const W = 1500, a = eo(win(t, 1, 2.6)), b = eo(win(t, 2.6, 4));
  return (
    <Black>
      <Kicker text="3 September 2013 · Microsoft buys Nokia's phones" t={t} y={110} />
      <div style={{position: 'absolute', left: 210, top: 320, display: 'flex'}}>
        <div style={{width: W * (3.79 / 5.44) * a, height: 150, background: `linear-gradient(90deg, ${C.gold}, ${C.goldHi})`}} />
        <div style={{width: W * (1.65 / 5.44) * b, height: 150, background: C.ivory}} />
      </div>
      <div style={{position: 'absolute', left: 210, top: 490, width: W * (3.79 / 5.44), opacity: a}}><div style={{fontFamily: serif, fontSize: 64, color: C.goldHi}}>€3.79 bn</div><div style={{fontSize: 28}}>Devices &amp; Services business</div></div>
      <div style={{position: 'absolute', left: 210 + W * (3.79 / 5.44), top: 490, width: W * (1.65 / 5.44), opacity: b}}><div style={{fontFamily: serif, fontSize: 64}}>€1.65 bn</div><div style={{fontSize: 28}}>patent licence</div></div>
      <div style={{position: 'absolute', left: 210, top: 690, opacity: eo(win(t, 5, 6)), fontFamily: serif, fontSize: 80}}>€5.44 bn <span style={{fontSize: 32, color: C.grey}}>in all</span></div>
      <div style={{position: 'absolute', left: 210, top: 830, fontSize: 32, opacity: eo(win(t, 9, 10)), lineHeight: 1.5}}>Completed <b style={{color: C.gold}}>25 April 2014</b> · about <b style={{color: C.gold}}>25,000</b> people moved to Microsoft — Elop among them</div>
      <Source text="Sources: Windows Central, The Next Web (final price slightly higher after balance-sheet adjustments)" t={t} />
    </Black>
  );
};
export const S83: React.FC<SceneProps> = () => {
  const t = useT();
  const R = 300, cx = 960, cy = 520;
  const slices = [{name: 'Phones', sub: 'Devices & Services → Microsoft', a0: -90, a1: 0, color: '#E24B4B'}, {name: 'Network equipment', sub: '', a0: 0, a1: 90, color: C.gold}, {name: 'Maps (HERE)', sub: '', a0: 90, a1: 180, color: C.goldHi}, {name: 'Technology licensing', sub: '', a0: 180, a1: 270, color: '#b9983f'}];
  const pol = (r: number, deg: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  const lift = eio(win(t, 3.4, 5.4));
  return (
    <Black>
      <Kicker text="What Microsoft bought" t={t} y={90} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {slices.map((s, i) => {
          const [x0, y0] = pol(R, s.a0), [x1, y1] = pol(R, s.a1);
          const mid = (s.a0 + s.a1) / 2, off = i === 0 ? lift * 220 : 0;
          const ox = Math.cos((mid * Math.PI) / 180) * off, oy = Math.sin((mid * Math.PI) / 180) * off;
          const lx = cx + Math.cos((mid * Math.PI) / 180) * (R + 70) + ox, ly = cy + Math.sin((mid * Math.PI) / 180) * (R + 70) + oy;
          return (<g key={i} transform={`translate(${ox} ${oy})`} opacity={eo(win(t, 0.3 + i * 0.3, 1 + i * 0.3))}>
            <path d={`M${cx} ${cy} L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z`} fill={s.color} fillOpacity={i === 0 ? 0.85 : 0.3} stroke={s.color} strokeWidth={4} />
            <text x={lx - ox} y={ly - oy} fontSize={30} fontWeight={700} fill={C.ivory} textAnchor={Math.cos((mid * Math.PI) / 180) > 0 ? 'start' : 'end'} fontFamily={sans}>{s.name}</text>
          </g>);
        })}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', fontFamily: serif, fontSize: 54, opacity: eo(win(t, 5.5, 6.5))}}>Microsoft bought Nokia's phones. <span style={{color: C.gold}}>Not Nokia.</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', fontSize: 22, color: C.grey}}>Illustrative — slices not to scale</div>
    </Black>
  );
};
export const S84: React.FC<SceneProps> = () => {
  const t = useT();
  return (
    <Black>
      <Kicker text="July 2015 · For Microsoft, it ended badly" t={t} y={120} color="#E24B4B" />
      <Center>
        <div style={{fontFamily: serif, fontSize: 220, color: '#E24B4B', lineHeight: 1, opacity: 1 - 0.35 * eo(win(t, 3, 10))}}>≈ $7.6 bn</div>
        <div style={{fontSize: 40, letterSpacing: 6, marginTop: 20}}>IMPAIRMENT CHARGE</div>
        <div style={{fontFamily: serif, fontSize: 56, marginTop: 50, opacity: eo(win(t, 5, 6))}}>up to <span style={{color: C.gold}}>7,800</span> job cuts</div>
      </Center>
      <Source text="Source: Microsoft Form 8-K, July 2015" t={t} />
    </Black>
  );
};

/* ---------- Section 9 ---------- */
export const S91: React.FC<SceneProps> = ({d}) => {
  const t = useT();
  const cards = [
    {when: 'AUGUST 2015', text: 'HERE maps sold to a consortium of German carmakers', val: '€2.8 bn'},
    {when: 'JANUARY 2016', text: 'Alcatel-Lucent acquisition completed', val: '€15.6 bn'},
    {when: 'MAY 2016', text: 'Nokia-brand phones return, built under licence by HMD', val: ''},
    {when: 'TODAY', text: 'A network-infrastructure company', val: '≈ €20 bn revenue'},
  ];
  return (
    <>
      <VideoBG src="c199377" d={d} t={t} dim={0.62} tint={0.15} />
      <Kicker text="Nokia itself endured" t={t} y={90} />
      {cards.map((c, i) => (
        <div key={i} style={{position: 'absolute', left: 140, top: 200 + i * 175, width: 1640, padding: '16px 34px', borderLeft: `7px solid ${C.gold}`, background: 'rgba(11,11,12,.7)', opacity: eo(win(t, 1 + i * 4.5, 1.7 + i * 4.5)), transform: `translateX(${(1 - eo(win(t, 1 + i * 4.5, 1.7 + i * 4.5))) * 60}px)`}}>
          <div style={{fontSize: 24, letterSpacing: 5, color: C.gold, fontWeight: 700}}>{c.when}</div>
          <div style={{fontFamily: serif, fontSize: 38, marginTop: 4}}>{c.text} {c.val && <span style={{color: C.goldHi}}>· {c.val}</span>}</div>
        </div>
      ))}
    </>
  );
};
export const S92: React.FC<SceneProps> = () => <Black />;
export const S93: React.FC<SceneProps> = ({d}) => { const t = useT(); return (<><VideoBG src="c19598" d={d} t={t} dim={0.45} tint={0.3} /><div style={{position: 'absolute', left: 120, bottom: 140, fontFamily: serif, fontSize: 70, width: 1100, lineHeight: 1.15, opacity: eo(win(t, 0.5, 1.5)), textShadow: '0 4px 30px #000'}}>Market share measures <span style={{color: C.gold}}>yesterday's</span> game.</div></>); };
export const S94: React.FC<SceneProps> = ({d}) => { const t = useT(); return (<><VideoBG src="c220941" d={d} t={t} start={5} dim={0.5} tint={0.1} /><div style={{position: 'absolute', left: 120, bottom: 140, fontFamily: serif, fontSize: 70, width: 1200, lineHeight: 1.15, opacity: eo(win(t, 0.5, 1.5)), textShadow: '0 4px 30px #000'}}>Dominance makes bad news <span style={{color: '#E24B4B'}}>expensive.</span></div></>); };
export const S95: React.FC<SceneProps> = () => {
  const t = useT();
  return (
    <Black>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 70%, rgba(255,120,30,0.2) 0%, rgba(11,11,12,0) 55%)'}} />
      <Embers t={t} n={30} seed={9} />
      <Center><div style={{fontFamily: serif, fontSize: 84, textAlign: 'center', width: 1300, lineHeight: 1.2, opacity: eo(win(t, 0.4, 1.4))}}>Every response has a <span style={{color: C.gold}}>cost.</span></div></Center>
    </Black>
  );
};
export const S96: React.FC<SceneProps> = ({d}) => {
  const t = useT();
  const r = rng(77);
  const tiers = [{w: 1100, h: 90, y: 760}, {w: 880, h: 110, y: 650}, {w: 680, h: 120, y: 530}, {w: 480, h: 130, y: 400}, {w: 300, h: 150, y: 250}, {w: 120, h: 130, y: 120}];
  const wins: {x: number; y: number; off: number}[] = [];
  tiers.forEach((tr) => { const nx = Math.floor(tr.w / 36), ny = Math.floor((tr.h - 16) / 30); for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) wins.push({x: 960 - tr.w / 2 + 10 + i * 36, y: tr.y + 10 + j * 30, off: 0.04 + r() * 0.92}); });
  const p = eio(win(t, 1, d - 4));
  const glow = 1 - p * 0.85;
  return (
    <Black>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(11,11,12,1) 0%, rgba(110,20,20,${0.45 * glow}) 88%)`}} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs><linearGradient id="rf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.3" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
        {[false, true].map((refl) => (
          <g key={String(refl)} transform={refl ? 'translate(0 1700) scale(1 -1)' : undefined} opacity={refl ? 0.22 : 1}>
            {tiers.map((tr, i) => (<rect key={i} x={960 - tr.w / 2} y={tr.y} width={tr.w} height={tr.h + 8} fill="#141311" stroke="#2a2619" strokeWidth={2} />))}
            {wins.map((w, i) => {
              const lit = clamp((w.off - p) * 14, 0, 1);
              const fl = lit > 0 && lit < 1 ? 0.5 + 0.5 * Math.sin(t * 40 + i) : 1;
              return <rect key={i} x={w.x} y={w.y} width={22} height={16} fill={C.goldHi} opacity={lit * fl * 0.95} />;
            })}
          </g>
        ))}
        <rect x={0} y={850} width={1920} height={230} fill="url(#rf)" opacity={0.1} />
      </svg>
      <Vignette />
    </Black>
  );
};
