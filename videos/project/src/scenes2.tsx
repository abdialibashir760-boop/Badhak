import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "./theme";
import { CITY, RAIL, RAIL_E, RAIL_W, LL } from "./data";
import { G } from "./geo";
import { Arrow, Convoy, MapLabel, MapView, Pt, Route } from "./Map";
import {
  Bars, Big, Chapter, Dim, Locomotive, Note, Paper, Photo, Plane, Rock, Show, Sfx, Stamp, Tank, Typer, Veil, Wagon, useSc, useT,
} from "./ui";

const Panel: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.gold }) => (
  <div style={{ background: "rgba(0,0,0,.72)", borderLeft: `5px solid ${color}`, padding: "12px 22px", fontFamily: F.head, fontSize: 32, letterSpacing: 5, color: C.paper, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 18 }}>{children}</div>
);

export const Sc4: React.FC = () => {
  const { S } = useSc();
  const t = useT();
  return (
    <AbsoluteFill>
      <MapView
        cam={[
          { t: 0, lon: 15, lat: 20, k: 190 }, { t: S(9) - 1, lon: 15, lat: 20, k: 190 }, { t: S(9) + 1.5, lon: 25, lat: 47, k: 900 },
          { t: S(11) - 0.5, lon: 25, lat: 47, k: 900 }, { t: S(11) + 2, lon: 33, lat: 39.2, k: 2400 },
        ]}
        fills={[
          { names: ["Germany"], color: "#6a2a24", from: S(6) },
          { names: ["South Africa", "Zimbabwe", "Finland"], color: "#3d3418", from: S(7) },
          { names: G.turkey, color: "#5a4a18", from: S(10) },
        ]}
      >
        <Pt lon={10} lat={51} from={S(6)} label="Germany: almost none" color={C.red} dx={0} dy={-16} anchor="middle" size={20} />
        <Pt lon={25} lat={-28} from={S(7)} label="South Africa" dy={22} dx={0} anchor="middle" size={16} />
        <Pt lon={30} lat={-19} from={S(7) + 0.4} label="Rhodesia" dx={14} size={16} />
        <Pt lon={165.5} lat={-21.5} from={S(7) + 0.8} label="New Caledonia" dx={-14} anchor="end" size={16} />
        <Route pts={[[25, -28], [18, -34.5], [-10, -10], [-15, 30], [-5, 48], [10, 53.5]]} from={S(8)} dur={1.6} color={C.red} width={3} />
        <Route pts={[[165.5, -21.5], [120, -10], [80, 5], [45, 12], [33, 30], [10, 40]]} from={S(8) + 0.4} dur={1.6} color={C.red} width={3} />
        <Pt lon={-12} lat={12} from={S(8) + 1.4} label="Blockade" color={C.red} dx={14} size={20} />
        <Pt lon={22} lat={44} from={S(9)} label="Balkans" dx={0} dy={22} anchor="middle" size={18} />
        <Pt lon={26} lat={64} from={S(9) + 0.4} label="Finland" size={18} />
        <Pt lon={33} lat={39} from={S(10)} label="Turkey" r={9} dx={0} dy={-18} anchor="middle" size={26} />
        <Pt lon={39.8} lat={38.4} from={S(11) + 1} r={5} color={C.red} />
        <Pt lon={29.1} lat={36.65} from={S(11) + 1.3} r={5} color={C.red} />
        <Pt lon={29.06} lat={40.18} from={S(11) + 1.6} r={5} color={C.red} />
        <MapLabel lon={34} lat={37.5} text="“Empty” mountains?" from={S(11) + 1.2} color={C.paper} size={20} spacing={6} />
      </MapView>
      <Veil until={S(6) - 0.4} />
      <Chapter label="II · The Hidden Resource" />
      <Dim from={0} a={0} />
      <Photo src="chromite1" from={0} to={S(6) - 0.3} w={520} h={380} color rot={-1.5} style={{ left: 70, top: 90 }} caption="Chromite ore" credit="USGS mineral specimen · Public domain" />
      <Big lines={["Chromite"]} from={0.2} to={S(6) - 0.3} size={84} color={C.gold} align="left" style={{ left: 70, top: 525 }} />
      <Show from={S(2)} to={S(6) - 0.3} style={{ left: 660, top: 130 }}><Panel>Armour plate <Tank size={90} /></Panel></Show>
      <Show from={S(3)} to={S(6) - 0.3} style={{ left: 660, top: 260 }}><Panel>Engine parts <Plane size={90} /></Panel></Show>
      <Show from={S(4)} to={S(6) - 0.3} style={{ left: 660, top: 390 }}><Panel>Cutting tools</Panel></Show>
      <Big lines={["Runs on it"]} from={S(5)} to={S(6) - 0.3} size={64} color={C.gold} align="left" style={{ left: 660, top: 520 }} />
      <Big lines={["The pantry of the", "German war economy"]} from={S(12)} size={58} style={{ top: 480 }} color={C.paper} />
      <Dim from={S(12)} a={0.5} />
      <Sfx n="thud" at={0.2} v={0.7} />
      <Sfx n="clank" at={S(2)} v={0.5} />
      <Sfx n="clank" at={S(3)} v={0.4} />
      <Sfx n="tick" at={S(4)} v={0.8} />
      <Sfx n="whoosh" at={S(6)} v={0.3} />
      <Sfx n="stamp" at={S(8) + 1.4} v={0.5} />
      <Sfx n="thud" at={S(12)} v={0.6} />
    </AbsoluteFill>
  );
};

export const Sc5: React.FC = () => {
  const { S } = useSc();
  return (
    <AbsoluteFill>
      <MapView cam={[{ t: 0, lon: 18, lat: 45, k: 1000 }]} fills={[{ names: G.turkey, color: "#5a4a18", from: 0 }]}>
        <Arrow from={[39.8, 38.4]} to={CITY.berlin} at={S(12)} dur={1.8} color={C.red} width={7} curve={0.12} label="Germany" />
        <Arrow from={[39.8, 38.4]} to={CITY.london} at={S(12) + 1} dur={2.2} color={C.steel} width={7} curve={-0.15} label="Britain · USA" />
        <Pt lon={39.8} lat={38.4} from={S(11)} label="Chrome mine" color={C.gold} dx={0} dy={26} anchor="middle" />
      </MapView>
      <Veil until={S(10) - 0.3} />
      <Paper from={0} to={S(10) - 0.3} style={{ left: 40, top: 50, width: 400 }}>
        <div style={{ fontWeight: 700, fontSize: 28 }}>TRADE AGREEMENT</div>
        <div>ANKARA · OCTOBER 1941</div>
        <div style={{ marginTop: 10, fontSize: 20 }}>Signed by: Karl Clodius (German negotiator)</div>
        <div style={{ fontSize: 20 }}>Turkish chromite ↔ German weapons</div>
      </Paper>
      <Bars
        from={S(2)} to={S(10) - 0.3} max={90000} w={760} h={300} style={{ left: 480, top: 90 }}
        items={[
          { label: "1941", value: 45000, color: C.steel, from: S(2) }, { label: "1942", value: 45000, color: C.steel, from: S(2) + 1.2 },
          { label: "1943", value: 90000, color: C.red, from: S(3) }, { label: "1944", value: 90000, color: C.red, from: S(4) },
        ]}
      />
      <Show from={S(2)} to={S(10) - 0.3} style={{ left: 480, top: 470 }}><div style={{ fontFamily: F.head, fontSize: 22, letterSpacing: 4, color: C.grey }}>TONS OF CHROMITE PER YEAR</div></Show>
      <Show from={S(5)} to={S(10) - 0.3} style={{ left: 60, top: 380 }}>
        <Panel color={C.steel}>In return: weapons <Tank size={70} /></Panel>
      </Show>
      <Stamp text="A loaded gun" from={S(7)} to={S(10) - 0.3} size={54} style={{ left: 60, top: 520 }} />
      <Show from={S(8)} to={S(10) - 0.3} style={{ left: 880, top: 500 }}><div style={{ fontFamily: F.head, fontSize: 34, letterSpacing: 6, color: C.gold }}>BACK-LOADED ▶</div></Show>
      <Stamp text="Pre-emptive buying" from={S(13)} to={S(15)} size={46} rot={-5} style={{ left: 380, top: 120 }} />
      <Big lines={["A mineral deposit", "is a front line"]} from={S(15)} size={64} style={{ top: 470 }} />
      <Dim from={S(15)} a={0.4} />
      <Chapter label="II · The Hidden Resource" from={0.2} />
      <Sfx n="tick" at={0.3} v={0.8} />
      <Sfx n="thud" at={S(2)} v={0.4} />
      <Sfx n="thud" at={S(3)} v={0.5} />
      <Sfx n="thud" at={S(4)} v={0.6} />
      <Sfx n="stamp" at={S(7)} v={0.9} />
      <Sfx n="stamp" at={S(13)} v={0.7} />
      <Sfx n="thud" at={S(15)} v={0.8} />
    </AbsoluteFill>
  );
};

const ORE: LL[] = [...RAIL_E.slice(0, 5).reverse(), ...RAIL_W.slice().reverse().slice(1)];

export const Sc5B: React.FC = () => {
  const { S } = useSc();
  return (
    <AbsoluteFill>
      <MapView
        cam={[
          { t: 0, lon: 34, lat: 39, k: 2100 }, { t: S(4) - 0.5, lon: 34, lat: 39.5, k: 2000 }, { t: S(4) + 6, lon: 25, lat: 44, k: 1150 },
          { t: S(6), lon: 28, lat: 41.5, k: 2800 }, { t: S(9), lon: 29, lat: 41.8, k: 2800 },
        ]}
        fills={[{ names: G.turkey, color: "#3d3418", from: 0 }, { names: G.axis, color: "#34201e", from: 0 }]}
      >
        <Route pts={RAIL} from={0.3} dur={1.5} color="#5d5a50" width={4} />
        <Pt lon={39.8} lat={38.4} from={S(1)} label="Chrome mine" color={C.red} dx={14} dy={-10} />
        <Pt lon={29.1} lat={36.65} from={S(1) + 0.5} color={C.red} />
        <Pt lon={29.06} lat={40.18} from={S(1) + 1} color={C.red} />
        <Route pts={[[39.8, 38.4], [38.3, 38.35]]} from={S(2)} dur={1} color={C.gold} width={3} />
        <Route pts={[[29.1, 36.65], [28.0, 37.8], [30.5, 39.77]]} from={S(2) + 0.4} dur={1.4} color={C.gold} width={3} />
        <Route pts={[[29.06, 40.18], [30.52, 39.77]]} from={S(2) + 0.8} dur={1} color={C.gold} width={3} />
        <Convoy pts={ORE} from={S(4)} to={S(11)} speed={0.05} n={7} color={C.gold} slow={[{ u: 0.24, w: 0.05, amt: 1 }, { u: 0.34, w: 0.05, amt: 1 }]} />
        <Pt lon={28.97} lat={41.01} from={S(5)} label="Choke point" color={C.red} dx={16} dy={-12} />
        <Pt lon={26.0} lat={42.0} from={S(5) + 0.6} label="Choke point" color={C.red} dx={-16} anchor="end" dy={-12} />
        <MapLabel lon={19} lat={46.5} text="Orient line → Reich" from={S(4) + 6} color={C.paper} size={20} spacing={6} />
      </MapView>
      <Photo src="balkanzug" from={S(4)} to={S(5) + 3} w={360} h={260} rot={2} style={{ left: 860, top: 40 }} caption="Berlin–Constantinople express coach, 1916" credit="Public domain" />
      <Typer text="NOT ENOUGH WAGONS. NOT ENOUGH LOCOMOTIVES." from={S(6)} to={S(8)} size={28} color={C.red} style={{ left: 40, top: 40 }} />
      <Show from={S(9)} to={S(11)} style={{ left: 60, top: 300 }}>
        <div style={{ background: "rgba(0,0,0,.75)", padding: 16, borderLeft: `5px solid ${C.gold}` }}>
          <Locomotive size={240} /><Wagon size={170} /><div style={{ fontFamily: F.head, fontSize: 24, letterSpacing: 4, color: C.gold }}>CHURCHILL’S OFFER</div>
        </div>
      </Show>
      <Big lines={["A freight wagon", "is a bargaining chip"]} from={S(10)} to={S(12)} size={60} style={{ top: 520 }} />
      <Dim from={S(11)} a={0.6} />
      <Big lines={["The railway isn’t scenery."]} from={S(12)} size={70} style={{ top: 230 }} />
      <Big lines={["It is the lever."]} from={S(13)} size={100} color={C.gold} style={{ top: 340 }} />
      <Sfx n="rail" at={S(4)} v={0.22} />
      <Sfx n="clank" at={S(5)} v={0.5} />
      <Sfx n="clank" at={S(9)} v={0.5} />
      <Sfx n="thud" at={S(13)} v={0.9} />
    </AbsoluteFill>
  );
};

export const Sc6: React.FC = () => {
  const { S } = useSc();
  return (
    <AbsoluteFill>
      <MapView cam={[{ t: 0, lon: 20, lat: 46, k: 950 }]} fills={[{ names: G.axis, color: "#34201e", from: 0 }, { names: G.turkey, color: "#3d3418", from: 0 }]}>
        <Pt lon={33} lat={39} from={0.5} label="Anatolia" color={C.gold} dx={0} dy={-14} anchor="middle" />
        <Arrow from={[33, 39]} to={CITY.essen} at={S(1)} dur={1.6} color={C.gold} width={6} curve={0.12} label="Chrome" />
        <Pt lon={7.0} lat={51.5} from={S(1) + 1.4} label="The Ruhr" color={C.red} dx={-14} anchor="end" />
        <Arrow from={CITY.essen} to={CITY.kursk} at={S(3)} dur={1.2} color={C.red} width={5} curve={-0.12} />
        <Arrow from={CITY.essen} to={CITY.normandy} at={S(3) + 0.5} dur={1.2} color={C.red} width={5} curve={0.15} />
        <Arrow from={CITY.essen} to={CITY.ardennes} at={S(3) + 1} dur={0.8} color={C.red} width={5} curve={0.2} />
        <Pt lon={36.2} lat={51.7} from={S(3) + 1.2} label="Kursk" dx={-12} anchor="end" />
        <Pt lon={-0.5} lat={49.3} from={S(3) + 1.6} label="Normandy" dy={26} dx={0} anchor="middle" />
        <Pt lon={5.8} lat={50.0} from={S(3) + 2} label="The Bulge" dx={14} dy={30} />
      </MapView>
      <Show from={S(2)} to={S(4)} style={{ left: 60, top: 560 }}><Panel color={C.red}>Alloy steel → armour plate · aircraft engines</Panel></Show>
      <Photo src="kursk" from={S(3)} to={S(4) + 1} w={300} h={190} rot={2} style={{ left: 960, top: 40 }} caption="Soviet T-34s, Kursk, 1943" credit="Public domain" />
      <Photo src="normandy2" from={S(3) + 1.5} to={S(4) + 1} w={300} h={230} rot={-2} style={{ left: 40, top: 330 }} caption="US troops, Omaha Beach, 6 June 1944" credit="US Army Signal Corps · Public domain" />
      <Photo src="speer" from={S(4)} to={S(5)} w={230} h={290} rot={-1.5} style={{ left: 40, top: 40 }} caption="Albert Speer, Nuremberg" credit="Public domain" />
      <Paper from={S(4)} to={S(5)} style={{ left: 330, top: 60, width: 420 }}>
        <div style={{ fontWeight: 700 }}>ALBERT SPEER · ARMAMENTS MINISTER</div>
        <div style={{ fontSize: 21 }}>Later claimed: without Turkish chromite, the war machine would stop within months.</div>
        <div style={{ fontSize: 16, color: "#6b2a20" }}>His own claim — historians disagree.</div>
      </Paper>
      <Dim from={S(5)} to={S(13) - 0.2} a={0.88} />
      <Bars
        from={S(6)} to={S(10)} max={232000} w={520} h={300} style={{ left: 60, top: 110 }}
        items={[{ label: "TOTAL", value: 232000, color: C.steel, from: S(6) + 0.2 }, { label: "TURKEY", value: 46000, color: C.gold, from: S(6) + 1.6 }]}
      />
      <Show from={S(6)} to={S(10)} style={{ left: 60, top: 520 }}><div style={{ fontFamily: F.head, fontSize: 22, letterSpacing: 4, color: C.grey }}>GERMAN CHROMITE STOCKS · US ESTIMATE · EARLY 1944 · TONS</div></Show>
      <Big lines={["Economise"]} from={S(7)} to={S(10)} size={74} align="left" style={{ left: 660, top: 110 }} />
      <Big lines={["Substitute"]} from={S(8)} to={S(10)} size={74} align="left" style={{ left: 660, top: 210 }} />
      <Big lines={["Stretch"]} from={S(9)} to={S(10)} size={74} align="left" color={C.gold} style={{ left: 660, top: 310 }} />
      <Big lines={["How much stretch?"]} from={S(10)} to={S(13) - 0.2} size={90} style={{ top: 140 }} />
      <Big lines={["Berlin can’t know.", "The Allies can’t know."]} from={S(11)} to={S(13) - 0.2} size={56} color={C.paper} style={{ top: 300 }} />
      <Stamp text="Neither side dared invade" from={S(13)} size={60} rot={-3} style={{ left: 230, top: 300 }} />
      <Sfx n="tick" at={S(1)} v={0.7} />
      <Sfx n="whoosh" at={S(3)} v={0.4} />
      <Sfx n="cannon" at={S(3) + 1.2} v={0.4} />
      <Sfx n="thud" at={S(6) + 0.2} v={0.5} />
      <Sfx n="stamp" at={S(13)} v={1} />
      <Note text="Estimates are contested" from={S(6)} to={S(10)} />
    </AbsoluteFill>
  );
};
