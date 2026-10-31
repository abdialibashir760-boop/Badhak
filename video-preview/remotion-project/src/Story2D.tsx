import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import {
  Apartments,
  Bed,
  BigFace,
  Chair,
  Char,
  CeilingLight,
  Corkboard,
  Couch,
  Defs,
  Dust,
  FloorLamp,
  GlassCard,
  H,
  Label,
  LampPost,
  Machine,
  Moped,
  Monitor,
  Planks,
  Poster,
  Road,
  Room,
  Shelf,
  Sky,
  Skyline,
  Table,
  TV,
  Tree,
  Vignette,
  W,
  WindowView,
} from "./Art2D";
import { STORY_SECONDS, SWORDS } from "./storyWords";

export const S2_FPS = 30;
export const S2_FRAMES = Math.ceil(STORY_SECONDS * S2_FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const font = '"Poppins","Helvetica Neue",Arial,system-ui,sans-serif';

// ---------- narration helpers ----------
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9$-]/g, "");
const idx = (word: string, from = 0) => {
  for (let i = from; i < SWORDS.length; i++) if (norm(SWORDS[i].w) === word) return i;
  return from;
};
const tAt = (i: number) => SWORDS[Math.min(i, SWORDS.length - 1)].s;
const tw = (word: string, from = 0) => tAt(idx(word, from));

const iWell = idx("well");
const iBut = idx("but", iWell);
const iThen = idx("then", iBut);
const iRes = idx("researcher", iThen);
const iNight = idx("night", iRes);
const iNext = idx("next", iNight);
const SCENE_T = [0, tAt(iWell), tAt(iBut), tAt(iThen), tAt(iRes), tAt(iNight), tAt(iNext), STORY_SECONDS];
const blinkAt = (t: number) => ((t + 0.7) % 3.3) < 0.14;

// ---------- captions ----------
const CHUNKS = (() => {
  const out: number[][] = [];
  let cur: number[] = [];
  SWORDS.forEach((w, i) => {
    cur.push(i);
    if (/[.?!]$/.test(w.w) || (/,$/.test(w.w) && cur.length >= 3) || cur.length >= 7) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out.map((ix) => ({ text: ix.map((i) => SWORDS[i].w).join(" "), s: SWORDS[ix[0]].s, e: SWORDS[ix[ix.length - 1]].e }));
})();

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / S2_FPS;
  const c = CHUNKS.find((k) => t >= k.s - 0.05 && t <= k.e + 0.3);
  if (!c) return null;
  const o = interpolate(t, [c.s - 0.05, c.s + 0.1, c.e + 0.15, c.e + 0.3], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ maxWidth: 1040, padding: "8px 26px", borderRadius: 16, background: "rgba(8,5,20,0.62)", color: "#fff", fontFamily: font, fontWeight: 600, fontSize: 34, textAlign: "center", lineHeight: 1.25 }}>
        {c.text}
      </div>
    </div>
  );
};

// ---------- shared ----------
const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    <Defs />
    <filter id="blur8">
      <feGaussianBlur stdDeviation="9" />
    </filter>
    {children}
    <Vignette />
  </svg>
);

const DustT: React.FC<{ t: number; n?: number }> = ({ t, n = 30 }) => <Dust t={t} n={n} />;

// ---------- 1: hook ----------
const SceneHook: React.FC<{ t: number }> = ({ t }) => {
  const dropStart = tw("dropped");
  const zero2 = tw("zero", idx("dropped"));
  const p = interpolate(t, [dropStart, zero2 + 0.5], [0, 1], clamp);
  const iq = Math.round(100 * (1 - p));
  const worry = t > tw("dropped") - 0.3;
  const end = tw("worrying");
  const mood = t > end ? "happy" : worry ? "worry" : "neutral";
  const bg = interpolate(t, [3.2, 5], [0, 1], clamp);
  const cards = [
    { w: "read,", label: "READ", icon: "book" as const, x: 880, y: 200 },
    { w: "cook,", label: "COOK", icon: "pot" as const, x: 1000, y: 380 },
    { w: "bills?", label: "BILLS", icon: "bill" as const, x: 880, y: 540 },
  ];
  return (
    <Frame>
      <rect width={W} height={H} fill="#05040c" />
      <g opacity={bg} filter="url(#blur8)">
        <Room wall="warm" />
        <WindowView x={80} y={120} w={200} h={330} />
        <FloorLamp x={1150} />
      </g>
      <rect width={W} height={H} fill="#05040c" opacity={0.35 * bg} />
      <DustT t={t} n={50} />
      <BigFace cx={400} cy={370} r={190} mood={mood} t={t} look={Math.sin(t * 1.2)} blink={blinkAt(t)} />
      <text x={760} y={150} fontFamily={font} fontWeight={700} fontSize={30} letterSpacing={6} fill="#fff" opacity={0.9}>
        IQ
      </text>
      <text x={760} y={230} fontFamily={font} fontWeight={900} fontSize={96} fill={p > 0.7 ? "#ff6a5a" : "#ffd36a"} style={{ filter: "drop-shadow(0 0 16px rgba(255,200,100,0.5))" }}>
        {iq}
      </text>
      {cards.map((c) => {
        const a = interpolate(t, [tw(norm(c.w)), tw(norm(c.w)) + 0.4, end, end + 0.4], [0, 1, 1, 0], clamp);
        return a > 0.01 ? <GlassCard key={c.label} x={c.x} y={c.y} label={c.label} icon={c.icon} a={a} /> : null;
      })}
    </Frame>
  );
};

// ---------- 2: age 24 ----------
const SceneAge: React.FC<{ t: number; start: number; end: number }> = ({ t, start, end }) => {
  const tBike = tw("deliver", iWell);
  const tTax = tw("taxes", iWell) - 0.3;
  const tMov = tw("movie", iWell) - 0.3;
  const tFur = tw("assemble", iWell) - 0.4;
  const k = t - start;
  if (t < tBike) {
    return (
      <Frame>
        <Sky base={470} sunX={820} />
        <Skyline base={480} seed="a" color="#4a3560" scale={1.0} scroll={k * 3} />
        <Skyline base={500} seed="b" color="#2e2142" scale={0.8} scroll={k * 6} />
        <rect x={0} y={470} width={W} height={H - 470} fill="#1f1a28" />
        <rect x={0} y={560} width={W} height={H - 560} fill="#2a2330" />
        {Array.from({ length: 36 }).map((_, i) => (
          <rect key={i} x={i * 36 + 6} y={455} width={5} height={105} fill="#15111c" />
        ))}
        <rect x={0} y={452} width={W} height={7} fill="#15111c" />
        <rect x={0} y={560} width={W} height={5} fill="#3a3045" />
        <Char x={520} y={585} s={1.5} pose="sit" seat={46} mood="happy" hold="cup" t={t} look={0} blink={blinkAt(t)} />
        <path d="M470 585 L490 540 L560 540 L580 585" stroke="#15111c" strokeWidth={6} fill="none" />
        <DustT t={t} />
        <Label t={t} from={tw("24", iWell) - 0.1} to={tBike + 0.5} x={90} y={90} size={52} anchor="start">
          AGE 24
        </Label>
      </Frame>
    );
  }
  if (t < tTax) {
    const sc = (t - tBike) * 150;
    return (
      <Frame>
        <Sky base={560} sunX={900} />
        <Skyline base={560} seed="c" color="#463357" scale={1.1} scroll={sc * 0.15} />
        <Apartments scroll={sc * 0.5} base={600} />
        <Tree x={((((900 - sc * 0.8) % 1700) + 1700) % 1700) - 200} base={600} />
        <LampPost x={((((300 - sc * 0.8) % 1500) + 1500) % 1500) - 100} base={600} />
        <Road scroll={sc} y={600} />
        <Moped x={520} y={608} t={t} dist={sc} />
        <DustT t={t} />
        <Label t={t} from={tw("exactly", iWell)} to={tTax} x={640} y={110} size={46} color="#ffd36a">
          IQ 100 · AVERAGE
        </Label>
      </Frame>
    );
  }
  if (t < tMov) {
    return (
      <Frame>
        <Room wall="warm" />
        <CeilingLight x={640} />
        <Table x={620} w={300} />
        <rect x={500} y={472} width={60} height={8} fill="#f4f1ea" />
        <rect x={600} y={474} width={46} height={6} fill="#f4f1ea" />
        <Chair x={420} flip={1} />
        <Char x={430} y={600} s={1.5} pose="sit" seat={52} mood="worry" hold="papers" t={t} blink={blinkAt(t)} />
        <Char x={800} y={600} s={1.5} face={-1} pose="point" shirt="#3f8fe0" cap="#3f8fe0" mood="happy" t={t} />
        <DustT t={t} />
        <Label t={t} from={tw("taxes", iWell)} to={tMov} x={640} y={110} size={40}>
          TAXES · WITH HELP
        </Label>
      </Frame>
    );
  }
  if (t < tFur) {
    return (
      <Frame>
        <Room wall="warm" />
        <WindowView x={140} y={110} w={200} h={300} />
        <TV x={930} t={t} />
        <Couch x={560} />
        <Char x={560} y={598} s={1.5} pose="sit" seat={52} mood={Math.sin(t * 2) > 0 ? "surprised" : "happy"} hold={null} t={t} />
        <DustT t={t} />
        <Label t={t} from={tw("movie", iWell)} to={tFur} x={640} y={110} size={40}>
          MOVIE PLOT · MOSTLY
        </Label>
      </Frame>
    );
  }
  const built = interpolate(t, [tFur, end - 1.5], [0.2, 1], clamp);
  return (
    <Frame>
      <Room wall="warm" />
      <WindowView x={820} y={110} w={200} h={300} />
      <FloorLamp x={200} />
      <Shelf x={500} built={built} />
      <Planks x={720} />
      <Char x={640} y={600} s={1.5} pose="point" hold="tool" mood="angry" t={t} />
      <DustT t={t} />
      <Label t={t} from={tw("furniture", iWell)} to={end} x={640} y={110} size={40}>
        FURNITURE · UNWATCHED
      </Label>
    </Frame>
  );
};

// ---------- 3: worry ----------
const SceneWorry: React.FC<{ t: number; start: number; end: number }> = ({ t, start, end }) => {
  const tLie = tw("lie", iBut) - 0.3;
  if (t < tLie) {
    const icons = [
      { w: "rent,", label: "RENT", a0: 0 },
      { w: "job,", label: "JOB", a0: 2.1 },
      { w: "noise", label: "BIKE NOISE", a0: 4.2 },
    ];
    return (
      <Frame>
        <g filter="url(#blur8)" opacity={0.8}>
          <Room wall="warm" />
          <WindowView x={80} y={120} w={200} h={330} />
        </g>
        <rect width={W} height={H} fill="#05040c" opacity={0.4} />
        <DustT t={t} n={40} />
        <BigFace cx={430} cy={400} r={200} mood="worry" t={t} look={Math.sin(t)} blink={blinkAt(t)} />
        {icons.map((ic, i) => {
          const at = tw(norm(ic.w), iBut);
          const a = interpolate(t, [at, at + 0.4, at + 2.4, at + 2.8], [0, 1, 1, 0.4], clamp);
          const ang = t * 0.8 + i * 2.1;
          const x = 430 + Math.cos(ang) * 300;
          const y = 250 + Math.sin(ang) * 120 - i * 10;
          return (
            <g key={ic.label} opacity={a} transform={`translate(${x} ${y})`}>
              <circle r={34} fill="rgba(255,90,70,0.18)" stroke="#ff6a5a" strokeWidth={2} />
              {i === 0 && <rect x={-12} y={-16} width={24} height={32} fill="#ff8a7a" />}
              {i === 1 && <rect x={-18} y={-12} width={36} height={26} rx={4} fill="#ff8a7a" />}
              {i === 2 && <path d="M-16 8 L0 -16 L16 8 Z" fill="#ff8a7a" />}
              <text y={62} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={20} letterSpacing={2} fill="#ffb4a8">
                {ic.label}
              </text>
            </g>
          );
        })}
        <Label t={t} from={tw("worry", iBut)} to={tLie} x={900} y={110} size={36} color="#ffd36a">
          WORRIES · A LOT
        </Label>
      </Frame>
    );
  }
  const nums = tw("numbers", iBut);
  return (
    <Frame>
      <Room wall="blue" />
      <WindowView x={140} y={110} w={220} h={320} night moon={0} />
      <Bed x={660} night w={380} />
      <Char x={780} y={508} s={1.5} pose="lie" mood="worry" look={Math.sin(t)} blink={blinkAt(t * 0.8)} t={t} />
      <DustT t={t} />
      {Array.from({ length: 9 }).map((_, i) => {
        const a = interpolate(t, [nums - 1.5 + i * 0.15, nums - 1.0 + i * 0.15], [0, 1], clamp);
        const x = 480 + random(`nx${i}`) * 400;
        const y = 380 - ((t * 25 + i * 70) % 260);
        const txt = ["7×3=?", "−120", "1,450", "+ ?", "÷ 0", "2,300", "= ?", "−45", "$$"][i];
        return (
          <text key={i} x={x} y={y} opacity={a * 0.8} fontFamily={font} fontWeight={800} fontSize={26} fill="#ff8a7a">
            {txt}
          </text>
        );
      })}
      <Label t={t} from={tw("awake", iBut)} to={tw("awake", iBut) + 2.5} x={640} y={110} size={40} color="#b6a2ff">
        AWAKE AT NIGHT
      </Label>
      <Label t={t} from={nums} to={end} x={640} y={110} size={40} color="#ff8a7a">
        NUMBERS NEVER ADD UP
      </Label>
    </Frame>
  );
};

// ---------- 4: poster ----------
const ScenePoster: React.FC<{ t: number; start: number; end: number }> = ({ t, start }) => {
  const k = t - start;
  const walkDur = 3.4;
  const x = interpolate(k, [0, walkDur], [-120, 470], clamp);
  const walking = k < walkDur;
  const v = tw("volunteers", iThen);
  const card = interpolate(t, [v - 0.2, v + 0.4, v + 4.4, v + 5], [0, 1, 1, 0], { easing: Easing.out(Easing.cubic), ...clamp });
  return (
    <Frame>
      <Room wall="warm" />
      <WindowView x={40} y={110} w={180} h={300} />
      <WindowView x={1060} y={110} w={180} h={300} />
      <CeilingLight x={420} />
      <Corkboard x={600} y={140} />
      <Char x={x} y={600} s={1.5} pose={walking ? "walk" : "stand"} mood="neutral" look={walking ? 0 : 1} t={t} blink={blinkAt(t)} />
      <DustT t={t} />
      {card > 0.01 && (
        <g>
          <rect width={W} height={H} fill="rgba(5,4,12,0.65)" opacity={card} />
          <g transform={`translate(${W / 2 - 200 * card} ${H / 2 - 290 * card * 0.9}) scale(${2 * card})`} opacity={card}>
            <Poster x={0} y={0} s={1} />
          </g>
          {[0, 1, 2, 3].map((i) => (
            <text key={i} x={W / 2 + 280 + (i % 2) * 70} y={200 + i * 70} fontSize={34} fill="#fff" opacity={card * (0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i)))}>
              ✦
            </text>
          ))}
        </g>
      )}
    </Frame>
  );
};

// ---------- 5: lab ----------
const Consent: React.FC<{ t: number; a: number }> = ({ t, a }) => (
  <g opacity={a} transform={`translate(${W / 2 - 230} ${60 + (1 - a) * 80})`}>
    <rect width={460} height={640} rx={6} fill="#f1ecdf" />
    <text x={230} y={60} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={30} fill="#2a2330">
      CONSENT FORM
    </text>
    {Array.from({ length: 22 }).map((_, i) => (
      <rect key={i} x={40} y={90 + i * 18} width={380 - (i % 5) * 20} height={4} fill="#c9c3b3" />
    ))}
    <g transform={`translate(${290 + Math.sin(t * 2) * 12} ${380 + Math.cos(t * 2) * 8})`}>
      <circle r={34} fill="rgba(255,220,100,0.25)" stroke="#f2b84a" strokeWidth={6} />
      <line x1={24} y1={24} x2={58} y2={58} stroke="#f2b84a" strokeWidth={8} strokeLinecap="round" />
    </g>
    <text x={50} y={600} fontFamily={font} fontWeight={800} fontSize={16} fill="#6a6370">
      SIGN
    </text>
    <path d="M110 596 q12 -26 26 0 t26 0 t26 0" stroke="#3a4ad8" strokeWidth={3} fill="none" />
  </g>
);

const SceneLab: React.FC<{ t: number; start: number; end: number }> = ({ t, start, end }) => {
  const small = tw("small", iRes) - 0.2;
  const card = interpolate(t, [small, small + 0.5, end - 0.4, end], [0, 1, 1, 0], { easing: Easing.out(Easing.cubic), ...clamp });
  return (
    <Frame>
      <Room wall="blue" />
      <WindowView x={80} y={110} w={150} h={210} night />
      <Monitor x={940} y={150} t={t} />
      <Machine x={360} t={t} />
      <Bed x={650} night w={340} />
      <Char x={660} y={600} s={1.5} face={1} pose="point" shirt="#f4f1ea" pants="#1c1a24" ponytail glasses mood="neutral" t={t} blink={blinkAt(t + 1)} />
      <Char x={880} y={600} s={1.5} face={-1} pose="stand" mood="neutral" look={-1} t={t} blink={blinkAt(t)} />
      <DustT t={t} n={24} />
      <Label t={t} from={tw("lee", iRes)} to={tw("lee", iRes) + 2.6} x={660} y={110} size={36} color="#8fd6ff">
        DR. LEE
      </Label>
      <Label t={t} from={tw("clear", iRes)} to={tw("clear", iRes) + 3} x={660} y={110} size={36} color="#ffd36a">
        CLEARS OLD MEMORIES
      </Label>
      {card > 0.01 && (
        <g>
          <rect width={W} height={H} fill="rgba(5,4,12,0.6)" opacity={card} />
          <Consent t={t} a={card} />
        </g>
      )}
    </Frame>
  );
};

// ---------- 6: nights ----------
const SceneNights: React.FC<{ t: number; start: number; end: number }> = ({ t }) => {
  const n1 = iNight;
  const n2 = idx("night", n1 + 1);
  const n3 = idx("night", n2 + 1);
  const night = t < tAt(n2) ? 0 : t < tAt(n3) ? 1 : 2;
  const click = tw("clicking", n3);
  const red = tw("red", n3);
  const some = tw("somebody", n3);
  const closeUp = interpolate(t, [red - 0.2, red + 0.2, some - 0.3, some], [0, 1, 1, 0], clamp);
  const pulse = 0.5 + 0.5 * Math.sin(t * 9);
  return (
    <Frame>
      <Room wall="blue" />
      <WindowView x={80} y={110} w={150} h={210} night moon={night} />
      <Monitor x={940} y={150} t={t} alert={t > click} />
      <Machine x={360} t={t} shake={t > click && t < click + 1.8 ? 1 : 0} redOn={t >= red} />
      <Bed x={660} night w={380} />
      <Char x={790} y={508} s={1.5} pose="lie" mood="sleep" t={t} />
      {[0, 1, 2].map((i) => (
        <text key={i} x={470 + i * 26} y={420 - i * 34 - ((t * 20 + i * 12) % 30)} fontFamily={font} fontWeight={800} fontSize={26 - i * 4} fill="#cfe0ff" opacity={0.8 - i * 0.2}>
          z
        </text>
      ))}
      {t >= some && (
        <g>
          <rect x={1110} y={360} width={110} height={240} fill="#05081a" stroke="#2c3560" strokeWidth={6} />
          <rect x={1118} y={368} width={94} height={232} fill="#1a2350" />
          <Char x={1166} y={600} s={1.4} face={-1} pose="stand" shirt="#2a3050" pants="#14121c" mood="neutral" t={t} rim={false} />
        </g>
      )}
      <DustT t={t} n={24} />
      {[n1, n2, n3].map((n, i) => (
        <Label key={i} t={t} from={tAt(n)} to={tAt(n) + 2.8} x={1180} y={90} size={34} anchor="end">
          {`NIGHT ${i + 1}`}
        </Label>
      ))}
      {closeUp > 0.01 && (
        <g opacity={closeUp}>
          <rect width={W} height={H} fill="#10090f" />
          <circle cx={W / 2} cy={330} r={150 + pulse * 40} fill="url(#glowRed)" />
          <rect x={W / 2 - 150} y={380} width={300} height={170} rx={16} fill="#c9c3cf" />
          <circle cx={W / 2} cy={320} r={78} fill={pulse > 0.5 ? "#ff4a3a" : "#c0281c"} />
          <circle cx={W / 2 - 22} cy={298} r={18} fill="#ffb4a8" opacity={0.7} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={W / 2 - 110 + i * 46} y={470} width={28} height={9} rx={3} fill="#4a4452" />
          ))}
          <text x={W / 2 + 190} y={250} fontFamily={font} fontWeight={900} fontSize={44} fill="#fff" opacity={pulse > 0.5 ? 1 : 0.2}>
            BEEP
          </text>
        </g>
      )}
      <Label t={t} from={some} to={some + 3} x={640} y={110} size={32} color="#ff8a7a">
        “THAT’S NOT SUPPOSED TO HAPPEN”
      </Label>
    </Frame>
  );
};

// ---------- 7: morning + walk home ----------
const SceneHome: React.FC<{ t: number; start: number; end: number }> = ({ t, start, end }) => {
  const tWalk = tw("walk", iNext) - 0.2;
  const del = tw("deleting");
  const fade = interpolate(t, [end - 0.7, end - 0.05], [0, 1], clamp);
  if (t < tWalk) {
    return (
      <Frame>
        <Room wall="warm" />
        <WindowView x={140} y={110} w={200} h={300} scroll={0} />
        <Monitor x={900} y={150} t={t} />
        <Char x={560} y={600} s={1.5} face={1} pose="point" shirt="#f4f1ea" ponytail glasses hold="bill" mood="happy" t={t} blink={blinkAt(t)} />
        <Char x={820} y={600} s={1.5} face={-1} pose="stand" mood="happy" t={t} blink={blinkAt(t + 1)} />
        <DustT t={t} />
        <Label t={t} from={tw("$50", iNext)} to={tw("$50", iNext) + 2.4} x={640} y={110} size={44} color="#7be3a0">
          $50
        </Label>
        <rect width={W} height={H} fill="#000" opacity={fade} />
      </Frame>
    );
  }
  const sc = (t - tWalk) * 70;
  const prog = interpolate(t, [del - 0.2, end - 0.4], [0, 1], clamp);
  const cx = 540;
  return (
    <Frame>
      <Sky base={560} sunX={420} />
      <Skyline base={560} seed="h" color="#463357" scale={1.1} scroll={sc * 0.15} />
      <Apartments scroll={sc * 0.5} base={600} />
      <Tree x={((((900 - sc * 0.8) % 1700) + 1700) % 1700) - 200} base={600} />
      <LampPost x={((((300 - sc * 0.8) % 1500) + 1500) % 1500) - 100} base={600} />
      <Road scroll={sc} y={600} />
      <Char x={cx} y={604} s={1.4} pose="walk" mood={t > del ? "worry" : "neutral"} t={t} blink={blinkAt(t)} />
      <DustT t={t} />
      {t > del - 0.4 && (
        <g transform={`translate(${cx + 60} 235)`} opacity={interpolate(t, [del - 0.4, del], [0, 1], clamp)}>
          <ellipse rx={120} ry={66} fill="rgba(20,16,40,0.55)" stroke="#7fd6ff" strokeWidth={3} />
          {Array.from({ length: 48 }).map((_, i) => {
            const a = random(`bd${i}`) * Math.PI * 2;
            const r = Math.sqrt(random(`br${i}`));
            const thr = random(`bt${i}`) * 0.8;
            const g = interpolate(prog, [thr, thr + 0.2], [0, 1], clamp);
            if (g >= 1) return null;
            return <circle key={i} cx={Math.cos(a) * r * 108} cy={Math.sin(a) * r * 62 - g * 40} r={5 * (1 - g)} fill="#7fd6ff" />;
          })}
        </g>
      )}
      <Label t={t} from={del} to={del + 2.6} x={640} y={110} size={38} color="#ff8a7a">
        DELETING MEMORIES…
      </Label>
      <Label t={t} from={tw("stopping", iNext)} to={end} x={640} y={110} size={34} color="#ff8a7a">
        IT WON’T STOP AT THE USELESS ONES
      </Label>
      <rect width={W} height={H} fill="#000" opacity={fade} />
    </Frame>
  );
};

// ---------- composition ----------
const SceneWrap: React.FC<{ from: number; to: number; render: (t: number, s: number, e: number) => React.ReactNode }> = ({ from, to, render }) => {
  const f = useCurrentFrame();
  const t = from + f / S2_FPS;
  const o = interpolate(f, [0, 8], [0, 1], clamp);
  const zoom = 1 + 0.035 * ((t - from) / Math.max(1, to - from));
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${zoom})` }}>{render(t, from, to)}</AbsoluteFill>
  );
};

export const Story2D: React.FC = () => {
  const frames = SCENE_T.map((s) => Math.round(s * S2_FPS));
  const defs: ((t: number, s: number, e: number) => React.ReactNode)[] = [
    (t) => <SceneHook t={t} />,
    (t, s, e) => <SceneAge t={t} start={s} end={e} />,
    (t, s, e) => <SceneWorry t={t} start={s} end={e} />,
    (t, s, e) => <ScenePoster t={t} start={s} end={e} />,
    (t, s, e) => <SceneLab t={t} start={s} end={e} />,
    (t, s, e) => <SceneNights t={t} start={s} end={e} />,
    (t, s, e) => <SceneHome t={t} start={s} end={e} />,
  ];
  return (
    <AbsoluteFill style={{ background: "#05040c" }}>
      <Audio src={staticFile("audio/story.mp3")} />
      {defs.map((render, i) => (
        <Sequence key={i} from={frames[i]} durationInFrames={Math.max(1, frames[i + 1] - frames[i])} premountFor={S2_FPS}>
          <SceneWrap from={frames[i] / S2_FPS} to={SCENE_T[i + 1]} render={render} />
        </Sequence>
      ))}
      <Captions />
    </AbsoluteFill>
  );
};
