import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, serif, sans} from './theme';
import {Black, Embers, Headline, HBars, Kicker, Photo, SceneProps, Source, Stamp, VideoBG, Vignette, eo, eio, useT, win} from './ui';
import {ChartC} from './charts';

const Center: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
);

/* ---------- photos ---------- */
export const S23: React.FC<SceneProps> = ({d}) => { const t = useT(); return <Photo src="ollila.jpg" d={d} t={t} title="Jorma Ollila" sub={'Chief executive from January 1992.\nRan the mobile phone division from 1990 — and advised against selling it.'} note="Portrait dated 2013" />; };
export const S25: React.FC<SceneProps> = ({d}) => { const t = useT(); return <Photo src="nokia1011.jpg" d={d} t={t} title="Nokia 1011" sub="November 1992 · the first commercially available GSM phone" />; };
export const S33: React.FC<SceneProps> = ({d}) => { const t = useT(); return <Photo src="nokia1100.jpg" d={d} t={t} title="Nokia 1100" sub="Launched 2003" />; };
export const S34: React.FC<SceneProps> = ({d}) => { const t = useT(); return <Photo src="nokia1100.jpg" d={d} t={t} title="Nokia 1100" sub={'Built-in flashlight\nDustproof keypad\nThe game Snake II'} scale0={1.04} />; };
export const S41: React.FC<SceneProps> = ({d}) => { const t = useT(); return <Photo src="iphone.jpg" d={d} t={t} title="iPhone" sub={'Unveiled 9 January 2007\nOn sale in the US 29 June 2007\nFrom $499'} maxH={760} />; };

export const S42: React.FC<SceneProps> = ({d}) => {
  const t = useT();
  const push = 1 + 0.05 * (t / d);
  const Panel: React.FC<{src: string; x: number; title: string; items: string[]; at: number; color: string; cover?: boolean}> = ({src, x, title, items, at, color, cover}) => (
    <div style={{position: 'absolute', left: x, top: 0, width: 960, bottom: 0, overflow: 'hidden'}}>
      <Img src={staticFile(`img/${src}`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.2)', transform: 'scale(1.2)'}} />
      <div style={{position: 'absolute', left: 80, top: 130, fontSize: 28, letterSpacing: 6, fontWeight: 700, color}}>{title}</div>
      <Img src={staticFile(`img/${src}`)} style={{position: 'absolute', left: 580, top: 200, width: 340, height: 600, objectFit: cover ? 'cover' : 'contain', objectPosition: 'center', border: `2px solid ${color}`, boxShadow: '0 20px 60px rgba(0,0,0,.8)', transform: `scale(${push})`}} />
      {items.map((it, i) => (
        <div key={i} style={{position: 'absolute', left: 80, top: 300 + i * 110, opacity: eo(win(t, at + i * 0.9, at + i * 0.9 + 0.6)), transform: `translateX(${(1 - eo(win(t, at + i * 0.9, at + i * 0.9 + 0.6))) * -30}px)`, fontFamily: serif, fontSize: 34, color: C.ivory}}>
          <span style={{display: 'inline-block', width: 40, height: 3, background: color, marginRight: 18, verticalAlign: 'middle'}} />{it}
        </div>
      ))}
    </div>
  );
  return (
    <Black>
      <Panel src="nokia1100.jpg" x={0} title="KEYPAD ERA" items={['Keys', 'Fixed menus', 'Hardware as the product']} at={1} color={C.gold} />
      <Panel src="iphone.jpg" x={960} title="TOUCH ERA" items={['Touch', 'Apps', 'Software as the product']} at={4} color="#E24B4B" cover />
      <div style={{position: 'absolute', left: 958, top: 0, bottom: 0, width: 4, background: C.ink}} />
    </Black>
  );
};
export const S54: React.FC<SceneProps> = ({d}) => {
  const t = useT();
  return (
    <Photo src="n5800.jpg" d={d} t={t} title="Touch came late" sub="Nokia 5800 XpressMusic, a touchscreen Symbian phone">
      <Stamp text="CANCELLED" sub="Touch framework · Oct 2010" t={t} at={5.5} x={110} y={660} />
    </Photo>
  );
};
export const S71: React.FC<SceneProps> = ({d}) => { const t = useT(); return <Photo src="elop.jpg" d={d} t={t} title="Stephen Elop" sub={'A former Microsoft executive.\nNokia chief executive from 10 September 2010.'} note="Photo: Elop on stage at a Nokia event" maxH={640} />; };

/* ---------- Section 4 ---------- */
export const S43: React.FC<SceneProps> = () => {
  const t = useT();
  return (
    <Black>
      <Kicker text="5 November 2007" t={t} />
      <Headline text="Google and its partners announce Android" t={t} y={200} size={72} w={1400} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <polyline points={Array.from({length: 40}, (_, i) => { const x = i / 39; return `${300 + x * 1300},${860 - 330 * Math.pow(eo(win(t, 1.5, 5)), 1) * Math.pow(x, 2.2)}`; }).slice(0, Math.max(2, Math.round(eo(win(t, 1.2, 5)) * 40))).join(' ')} fill="none" stroke="#E24B4B" strokeWidth={8} />
        <line x1={300} x2={1700} y1={880} y2={880} stroke="#3a3a3c" strokeWidth={2} />
      </svg>
    </Black>
  );
};
export const S44: React.FC<SceneProps> = () => {
  const t = useT();
  const Card: React.FC<{y: number; at: number; when: string; text: string}> = ({y, at, when, text}) => (
    <div style={{position: 'absolute', left: 260, top: y, width: 1400, padding: '30px 44px', borderLeft: `8px solid ${C.gold}`, background: 'rgba(201,162,75,0.07)', opacity: eo(win(t, at, at + 0.7)), transform: `translateX(${(1 - eo(win(t, at, at + 0.7))) * 60}px)`}}>
      <div style={{fontSize: 28, letterSpacing: 5, color: C.gold, fontWeight: 700}}>{when}</div>
      <div style={{fontFamily: serif, fontSize: 52, marginTop: 8}}>{text}</div>
    </div>
  );
  return (
    <Black>
      <Kicker text="The platforms multiply" t={t} />
      <Card y={330} at={0.6} when="2008" text="Apple opens an App Store" />
      <Card y={580} at={3.2} when="OCTOBER 2008" text="First Android phone, the HTC Dream, goes on sale in the US" />
    </Black>
  );
};
export const S45: React.FC<SceneProps> = () => {
  const t = useT();
  const crack = eo(win(t, 6, 11));
  return (
    <Black>
      <Kicker text="Nokia net sales" t={t} />
      <HBars bars={[{label: '2007', value: 51.06, color: C.gold}, {label: '2008', value: 50.71, color: C.gold}]} max={60} t={t} fmt={(v) => `€${v.toFixed(1)} bn`} y={330} rowH={190} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <polyline points={`1250,${520 + 0 * crack} 1230,${560} 1275,${600} 1240,${650} 1290,${700} 1262,${750} 1300,${800}`.split(' ').slice(0, 2 + Math.round(crack * 5)).join(' ')} fill="none" stroke={C.ink} strokeWidth={7} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 840, textAlign: 'center', fontFamily: serif, fontSize: 48, opacity: eo(win(t, 4, 5))}}>On paper, nothing was wrong.</div>
      <Source text="Source: Nokia annual results (2007: €51,058M; 2008: €50,710M)" t={t} />
    </Black>
  );
};

/* ---------- Section 5 ---------- */
export const S51: React.FC<SceneProps> = () => {
  const t = useT();
  return (<Black><Kicker text="2006 · Symbian's peak" t={t} y={90} /><ChartC t={t} reveal={0.8} gap={2.4} annot={false} /></Black>);
};
export const S52: React.FC<SceneProps> = () => {
  const t = useT();
  const L = ['Complex development tools', 'Expensive developer kits'];
  return (
    <Black>
      <Kicker text="Why developers stayed away" t={t} />
      <svg width={300} height={300} style={{position: 'absolute', left: 1300, top: 330, opacity: eo(win(t, 0.4, 1.2))}}>
        <rect x={60} y={130} width={180} height={140} rx={14} fill="none" stroke={C.gold} strokeWidth={8} />
        <path d="M100 130 V90 a50 50 0 0 1 100 0 V130" fill="none" stroke={C.gold} strokeWidth={8} />
        <circle cx={150} cy={195} r={14} fill={C.gold} />
      </svg>
      {L.map((s, i) => (<div key={i} style={{position: 'absolute', left: 200, top: 360 + i * 140, fontFamily: serif, fontSize: 64, opacity: eo(win(t, 0.6 + i * 1.2, 1.4 + i * 1.2))}}><span style={{color: C.gold}}>— </span>{s}</div>))}
    </Black>
  );
};
export const S53: React.FC<SceneProps> = () => {
  const t = useT();
  const names = ['S60', 'UIQ', 'MOAP'];
  return (
    <Black>
      <Kicker text="Incompatible interfaces" t={t} />
      {names.map((n, i) => {
        const p = eo(win(t, 0.3 + i * 0.4, 1.1 + i * 0.4));
        const jig = Math.sin(t * 9 + i * 2) * 6 * eo(win(t, 2.2, 2.4));
        return (<div key={i} style={{position: 'absolute', left: 340 + i * 420 + jig, top: 400 + (i === 1 ? 50 : 0), width: 340, height: 260, border: `4px solid ${C.gold}`, borderRadius: i === 1 ? '40px 4px 40px 4px' : '4px 40px 4px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, fontFamily: serif, color: C.goldHi, opacity: p, transform: `translateY(${(1 - p) * 60}px) rotate(${i === 1 ? 3 : -2}deg)`}}>{n}</div>);
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', fontSize: 34, color: C.ivory, opacity: eo(win(t, 2.4, 3.2))}}>An app written for one did not run on another</div>
    </Black>
  );
};
export const S55: React.FC<SceneProps> = () => {
  const t = useT();
  const names = ['Motorola', 'Samsung', 'LG', 'Sony Ericsson'];
  return (
    <Black>
      <Kicker text="2009–2010 · Partners walk away" t={t} />
      {names.map((n, i) => {
        const out = eio(win(t, 3 + i * 1.3, 4.6 + i * 1.3));
        return (<div key={i} style={{position: 'absolute', left: 260 + (i % 2) * 720 + out * (i % 2 ? 1200 : -1200), top: 360 + Math.floor(i / 2) * 200, width: 640, padding: '34px 0', border: `3px solid ${C.gold}`, textAlign: 'center', fontFamily: serif, fontSize: 56, color: C.ivory, opacity: eo(win(t, 0.3 + i * 0.3, 1 + i * 0.3)) * (1 - out)}}>{n}</div>);
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 840, textAlign: 'center', fontSize: 34, color: C.ivory, opacity: eo(win(t, 1.5, 2.3))}}>…moved toward Android or Windows Phone</div>
    </Black>
  );
};
export const S56: React.FC<SceneProps> = () => {
  const t = useT();
  const crack = eo(win(t, 4, 6.5));
  return (
    <Black>
      <Kicker text="Nokia tries to fix it" t={t} />
      <div style={{position: 'absolute', left: 500, top: 320, width: 920, padding: '50px 60px', border: `4px solid ${C.gold}`, background: 'rgba(201,162,75,0.07)'}}>
        <div style={{fontSize: 26, letterSpacing: 5, color: C.gold, fontWeight: 700}}>4 FEBRUARY 2010</div>
        <div style={{fontFamily: serif, fontSize: 56, marginTop: 10}}>Symbian source code published</div>
        <div style={{fontSize: 30, color: C.grey, marginTop: 18}}>Acquisition announced in 2008 · Symbian Foundation launched 2009</div>
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <polyline points={'1010,300 990,400 1040,480 1000,560 1055,640 1020,720'.split(' ').slice(0, 2 + Math.round(crack * 4)).join(' ')} fill="none" stroke={C.ink} strokeWidth={9} />
      </svg>
      <div style={{position: 'absolute', left: 500, top: 760, width: 920, fontFamily: serif, fontSize: 46, color: '#E24B4B', opacity: eo(win(t, 5.5, 6.5))}}>The Foundation disintegrated before the year was out</div>
    </Black>
  );
};
export const S57: React.FC<SceneProps> = () => {
  const t = useT();
  return (
    <Black>
      <Kicker text="Q4 2010 · The crossover" t={t} />
      <Headline text="Android passes Symbian" t={t} y={170} size={64} w={1300} />
      <HBars bars={[{label: 'Android', value: 32.9, color: C.red}, {label: 'Symbian', value: 31.0, color: C.gold}, {label: 'iPhone', value: 16.2, color: C.ivory}]} max={36} t={t} fmt={(v) => `${v.toFixed(1)} M`} y={400} rowH={150} />
      <Source text="Smartphones shipped, Q4 2010 (total 101.2M). Source: Canalys via Engadget / PocketGamer.biz. Some outlets print 33.3M for Android." t={t} />
    </Black>
  );
};

/* ---------- Section 6 ---------- */
export const S61: React.FC<SceneProps> = ({d}) => {
  const t = useT();
  return (<><VideoBG src="c220941" d={d} t={t} dim={0.5} tint={0.15} /><Kicker text="The question" t={t} y={110} /><Headline text="Why couldn't a company with this many engineers, and this much profit, respond?" t={t} y={200} size={64} w={1250} /></>);
};
export const S62: React.FC<SceneProps> = () => {
  const t = useT();
  return (
    <Black>
      <Center>
        <div style={{opacity: eo(win(t, 0.2, 1)), fontSize: 26, letterSpacing: 8, color: C.gold, fontWeight: 700}}>A SCHOLARLY READING</div>
        <div style={{fontFamily: serif, fontSize: 130, color: C.ivory, margin: '26px 0 10px', opacity: eo(win(t, 0.5, 1.4))}}><i>Ringtone</i></div>
        <div style={{fontSize: 38, color: C.goldHi, opacity: eo(win(t, 1.3, 2.1))}}>Yves Doz &amp; Keeley Wilson · INSEAD</div>
        <div style={{fontSize: 28, color: C.grey, marginTop: 10, opacity: eo(win(t, 1.6, 2.4))}}>Oxford University Press, 2017</div>
        <div style={{fontFamily: serif, fontSize: 56, marginTop: 70, opacity: eo(win(t, 5, 6)), textAlign: 'center', width: 1300}}>No single cause — a crisis that began before the results showed it</div>
      </Center>
    </Black>
  );
};
export const S63: React.FC<SceneProps> = () => {
  const t = useT();
  const Box: React.FC<{y: number; label: string; at: number}> = ({y, label, at}) => (<div style={{position: 'absolute', left: 560, top: y, width: 520, height: 130, border: `3px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontSize: 42, opacity: eo(win(t, at, at + 0.6))}}>{label}</div>);
  const A = (x1: number, y1: number, x2: number, y2: number, at: number, label: string, side: 'l' | 'r') => {
    const p = eo(win(t, at, at + 1.2));
    return (<g opacity={p}><line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke="#E24B4B" strokeWidth={6} markerEnd="url(#ah)" /><text x={side === 'r' ? x2 + 24 : x2 - 24} y={(y1 + y2) / 2 + 8} fill={C.ivory} fontSize={26} fontFamily={sans} textAnchor={side === 'r' ? 'start' : 'end'}>{label}</text></g>);
  };
  return (
    <Black>
      <Kicker text="Vuori & Huy · 50+ managers interviewed · 2005–2010" t={t} y={90} />
      <Box y={300} label="Top managers" at={0.4} />
      <Box y={600} label="Middle managers" at={1.0} />
      <div style={{position: 'absolute', left: 1520, top: 285, fontFamily: serif, fontSize: 36, color: C.grey, width: 340, opacity: eo(win(t, 0.4, 1))}}>Competitors<br />&amp; shareholders</div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs><marker id="ah" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto"><path d="M0 0 L12 6 L0 12 z" fill="#E24B4B" /></marker></defs>
        {A(1090, 365, 1440, 335, 2.6, '', 'r')}
        {A(570, 665, 570, 440, 5.6, 'fear of bosses & peers · status', 'l')}
      </svg>
      <div style={{position: 'absolute', left: 1100, top: 395, fontSize: 24, color: C.ivory, width: 400, opacity: eo(win(t, 3.2, 4))}}>fear of competitors<br />and shareholders</div>
    </Black>
  );
};
export const S64: React.FC<SceneProps> = () => {
  const t = useT();
  const p = eio(win(t, 0.4, 5.5));
  const pts = Array.from({length: 61}, (_, i) => i / 60);
  const path = pts.filter((x) => x <= p).map((x) => { const y = x < 0.34 ? 0 : x < 0.67 ? 70 * ((x - 0.34) / 0.33) : 70 + 90 * ((x - 0.67) / 0.33); return `${240 + x * 1300},${700 - y}`; }).join(' ');
  return (
    <Black>
      <Kicker text="How bad news bent" t={t} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {[0.34, 0.67].map((x, i) => (<g key={i} opacity={eo(win(t, 0.3, 1))}><rect x={240 + x * 1300 - 8} y={420} width={16} height={420} fill={C.gold} opacity={0.35} /><text x={240 + x * 1300} y={400} textAnchor="middle" fill={C.goldHi} fontSize={26} fontFamily={sans}>{i === 0 ? 'filter' : 'filter'}</text></g>))}
        <polyline points={path} fill="none" stroke="#E24B4B" strokeWidth={9} />
      </svg>
      <div style={{position: 'absolute', left: 240, top: 780, fontSize: 30, color: C.ivory, opacity: eo(win(t, 0.8, 1.6))}}>Bad news</div>
      <div style={{position: 'absolute', right: 380, top: 480, fontSize: 30, color: C.goldHi, opacity: eo(win(t, 4.8, 5.6)), textAlign: 'right'}}>…softer<br />by the top</div>
      <Note2 t={t} />
    </Black>
  );
};
const Note2: React.FC<{t: number}> = ({t}) => (<div style={{position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', fontSize: 22, color: C.grey, opacity: eo(win(t, 0.6, 1.4))}}>Illustration of the researchers' argument — not data</div>);
export const S65: React.FC<SceneProps> = ({d}) => { const t = useT(); return <VideoBG src="c220941" d={d} t={t} start={6} dim={0.55} tint={0.1} />; };
