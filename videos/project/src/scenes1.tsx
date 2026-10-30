import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "./theme";
import { CITY, RAIL, RAIL_E, RAIL_W } from "./data";
import { G } from "./geo";
import { Arrow, Convoy, MapLabel, MapView, Pt, Route } from "./Map";
import {
  Big, Chapter, Count, Dim, Note, Paper, Photo, Plane, Show, Sfx, Stamp, Strike, Typer, Veil, useSc,
} from "./ui";

export const Sc1: React.FC = () => {
  const { S, D } = useSc();
  return (
    <AbsoluteFill>
      <MapView
        cam={[{ t: 0, lon: 35, lat: 38, k: 2300 }, { t: S(1), lon: 35.1, lat: 37.6, k: 3400 }, { t: S(1) + 9, lon: 35.0, lat: 37.0, k: 26000 }]}
        fills={[{ names: G.turkey, color: "#2a2a20", from: S(1) }]}
        dim={0}
      >
        <Route pts={[[34.64, 36.8], [34.89, 36.92], [35.0, 36.99], [35.32, 37.0]]} from={S(1) + 3} dur={2} color="#b9b4a3" width={4} rail />
        <Pt lon={34.64} lat={36.8} from={S(1) + 5} label="Mersin" r={4} color={C.grey} pulse={false} size={16} />
        <Pt lon={35.32} lat={37.0} from={S(1) + 5} label="Adana" r={4} color={C.grey} pulse={false} size={16} />
        <Pt lon={35.0} lat={36.99} from={S(1) + 6} label="Yenice" r={7} color={C.red} dy={-14} dx={0} anchor="middle" size={24} />
        <Route pts={[[34.95, 37.012], [35.05, 37.012]]} from={S(2)} dur={1.2} color={C.gold} width={5} />
        <Route pts={[[34.95, 37.03], [35.05, 37.03]]} from={S(2) + 0.6} dur={1.2} color={C.steel} width={5} />
      </MapView>
      <Veil until={S(1) - 0.2} />
      <Typer text="30 JANUARY 1943" from={0.3} to={S(1) + 5} size={72} style={{ top: 250, left: 0, right: 0 }} align="center" />
      <Typer text="YENICE · NEAR ADANA" from={S(1)} to={S(1) + 5} size={34} color={C.gold} style={{ top: 345, left: 0, right: 0 }} align="center" />
      <Dim from={S(3)} to={S(5)} a={0.55} />
      <Photo src="adana_airport" from={S(3)} to={S(5)} w={520} h={400} rot={-2} pos="50% 35%" style={{ left: 90, top: 120 }} caption="Churchill with Numan Menemencioğlu · Adana, 30 Jan 1943" credit="US Office of War Information · Public domain" />
      <Photo src="cairo_conf" from={S(4)} to={S(5)} w={520} h={400} rot={2} style={{ left: 650, top: 140 }} caption="İnönü with Roosevelt & Churchill · Cairo, Dec 1943" credit="US Army Signal Corps · Public domain" />
      <Dim from={S(5) - 0.1} to={S(9)} a={0.93} />
      <Big lines={["Weak?"]} from={S(5)} to={S(9)} size={120} style={{ top: 70 }} />
      <Big lines={["Scared?"]} from={S(6)} to={S(9)} size={120} style={{ top: 235 }} />
      <Big lines={["Lucky?"]} from={S(7)} to={S(9)} size={120} style={{ top: 400 }} />
      <Strike to={S(9)} from={S(8)} w={430} style={{ left: 420, top: 135, zIndex: 3 }} />
      <Strike to={S(9)} from={S(8) + 0.2} w={520} style={{ left: 380, top: 300, zIndex: 3 }} />
      <Strike to={S(9)} from={S(8) + 0.4} w={430} style={{ left: 420, top: 465, zIndex: 3 }} />
      <Stamp text="They are wrong" from={S(8) + 0.2} to={S(9)} size={58} style={{ left: 410, top: 570 }} />
      <Dim from={S(9) - 0.2} to={S(13)} a={0.95} />
      <Big lines={["Everyone needed", "something it owned"]} from={S(9)} to={S(13)} size={62} style={{ top: 70 }} color={C.paper} />
      <Photo src="chromite1" from={S(10)} to={S(13)} w={330} h={250} color rot={-2} style={{ left: 50, top: 220 }} caption="Chromite ore" credit="USGS specimen · Public domain" />
      <Show from={S(10)} to={S(13)} style={{ left: 50, top: 520 }}><div style={{ fontFamily: F.head, fontSize: 36, letterSpacing: 6, color: C.gold }}>CHROMITE</div></Show>
      <Photo src="bagdad_train" from={S(11)} to={S(13)} w={330} h={250} rot={1} style={{ left: 470, top: 220 }} caption="Baghdad Railway, c. 1900–10" credit="Matson Collection, Library of Congress · Public domain" />
      <Show from={S(11)} to={S(13)} style={{ left: 470, top: 520 }}><div style={{ fontFamily: F.head, fontSize: 36, letterSpacing: 6, color: C.gold }}>RAILWAY</div></Show>
      <Photo src="bernhard20b" from={S(12)} to={S(13)} w={330} h={250} color rot={-1} style={{ left: 890, top: 220 }} caption="Forged £20 note, Operation Bernhard" credit="Prisoners of Sachsenhausen · Public domain" />
      <Show from={S(12)} to={S(13)} style={{ left: 890, top: 520 }}><div style={{ fontFamily: F.head, fontSize: 36, letterSpacing: 6, color: C.gold }}>FORGED MONEY</div></Show>
      <Stamp text="Counterfeit" from={S(12) + 1.8} to={S(13)} size={38} rot={-12} style={{ left: 930, top: 300 }} />
      <Big lines={["The railway", "nobody invaded"]} from={S(13)} size={96} style={{ top: 190 }} />
      <Big lines={["And why."]} from={S(14)} size={60} color={C.gold} style={{ top: 460 }} />
      <Dim from={D - 1.5} a={1} />
      <Sfx n="tick" at={0.35} v={0.8} />
      <Sfx n="whistle" at={S(2)} v={0.35} />
      <Sfx n="swell" at={S(5)} v={0.35} />
      <Sfx n="stamp" at={S(8) + 0.2} v={0.9} />
      <Sfx n="thud" at={S(10)} v={0.6} />
      <Sfx n="clank" at={S(11)} v={0.6} />
      <Sfx n="stamp" at={S(12) + 1.8} v={0.7} />
      <Sfx n="thud" at={S(13)} v={0.9} />
    </AbsoluteFill>
  );
};

export const Sc2: React.FC = () => {
  const { S, D } = useSc();
  const FR = "#6a2a24";
  return (
    <AbsoluteFill>
      <MapView
        cam={[
          { t: 0, lon: 22, lat: 47, k: 1050 }, { t: S(6), lon: 30, lat: 41, k: 1500 }, { t: S(9) - 1, lon: 34, lat: 40, k: 1150 },
          { t: S(11), lon: 36, lat: 39, k: 2000 }, { t: S(13), lon: 30, lat: 41, k: 1900 }, { t: D, lon: 31, lat: 41, k: 1950 },
        ]}
        fills={[
          { names: G.axis.filter((n) => n !== "Bulgaria" && n !== "Greece"), color: "#4a2824", from: 0.8 },
          { names: ["Bulgaria"], color: FR, from: S(1) },
          { names: ["Greece"], color: FR, from: S(3) },
          { names: G.turkey, color: "#3d3418", from: S(6) },
          { names: G.oil, color: "#2c3a44", from: S(9) },
        ]}
      >
        <Arrow from={[25.5, 42.9]} to={[28.0, 41.5]} at={S(2)} color={C.red} width={7} curve={0.1} />
        <Arrow from={[24.5, 43.4]} to={[26.9, 41.8]} at={S(2) + 0.3} color={C.red} width={5} curve={0.1} />
        <Pt lon={24.9} lat={35.2} from={S(4)} label="Crete" color={C.red} dx={-14} anchor="end" />
        <Pt lon={28.2} lat={36.2} from={S(5)} label="Rhodes" color={C.red} dx={-14} anchor="end" r={5} />
        <Pt lon={27.3} lat={36.85} from={S(5) + 0.4} color={C.red} r={5} />
        <MapLabel lon={26.2} lat={34.0} text="Italian-held islands" from={S(5) + 0.8} color={C.red} size={17} spacing={3} />
        <MapLabel lon={33.5} lat={39.2} text="Turkey" from={S(6)} color={C.gold} size={34} spacing={14} />
        <Pt lon={29.0} lat={41.05} from={S(8)} label="The Straits" r={7} dx={14} dy={-8} />
        <Pt lon={26.4} lat={40.15} from={S(8) + 0.4} r={6} />
        <Route pts={[[36, 37], [40, 36.8], [44.39, 35.47]]} from={S(9)} dur={1.6} color={C.gold} width={4} />
        <Pt lon={44.39} lat={35.47} from={S(9) + 1.2} label="Iraq oil" r={7} dx={0} dy={26} anchor="middle" />
        <Route pts={[[41, 41.4], [45, 41.6], [49.87, 40.4]]} from={S(10)} dur={1.6} color={C.gold} width={4} />
        <Pt lon={49.87} lat={40.4} from={S(10) + 1.2} label="Baku oil" r={7} dx={0} dy={-14} anchor="middle" />
        <Arrow from={[23.3, 42.7]} to={[32.8, 39.9]} at={S(13)} dur={2.2} color={C.red} width={9} curve={0.12} label="Roll south" />
      </MapView>
      <Chapter label="I · The Frontier & The Illusion" />
      <Note text="Modern borders shown · 1941 control approximate" />
      <Show from={S(11)} to={S(13) - 0.5} style={{ left: 30, top: 46 }}>
        <div style={{ width: 470, height: 128, background: "rgba(0,0,0,.78)", borderLeft: `5px solid ${C.gold}` }} />
      </Show>
      <Count value={1000000} from={S(11)} to={S(13) - 0.5} suffix=" men" size={52} style={{ left: 50, top: 52 }} />
      <Show from={S(11)} to={S(13) - 0.5} style={{ left: 52, top: 128 }}>
        <div style={{ whiteSpace: "nowrap", fontFamily: F.head, letterSpacing: 4, color: C.paper, fontSize: 21 }}>FEW MODERN WEAPONS</div>
      </Show>
      <Show from={S(12)} to={S(13) - 0.5} style={{ left: 40, top: 196 }}><div style={{ fontFamily: F.head, fontSize: 22, letterSpacing: 5, color: C.red, background: "rgba(0,0,0,.7)", padding: "4px 14px" }}>NO AIR DEFENCE</div></Show>
      <Show from={S(12)} to={S(13)} x={-200} y={0} dur={1.6} style={{ left: 480, top: 120 }}><Plane size={110} /></Show>
      <Show from={S(12) + 0.7} to={S(13)} x={-200} y={0} dur={1.6} style={{ left: 640, top: 170 }}><Plane size={90} /></Show>
      <Big lines={["So why didn't it?"]} from={S(14)} size={90} style={{ top: 250 }} />
      <Dim from={S(14)} a={0.55} />
      <Sfx n="cannon" at={S(1)} v={0.4} />
      <Sfx n="thud" at={S(3)} v={0.5} />
      <Sfx n="cannon" at={S(13)} v={0.5} />
      <Sfx n="swell" at={S(13)} v={0.35} />
    </AbsoluteFill>
  );
};

export const Sc3: React.FC = () => {
  const { S } = useSc();
  const R0 = S(1) + 0.5;
  return (
    <AbsoluteFill>
      <MapView
        cam={[
          { t: 0, lon: 30, lat: 43, k: 1100 }, { t: S(1), lon: 27, lat: 45, k: 900 }, { t: S(4) - 2, lon: 28, lat: 44.5, k: 950 },
          { t: S(6), lon: 33, lat: 40, k: 1500 }, { t: S(8), lon: 33, lat: 40.5, k: 1600 },
        ]}
        fills={[{ names: G.turkey, color: "#3d3418", from: S(5) }, { names: G.axis, color: "#34201e", from: 0.5 }]}
      >
        <Route pts={RAIL} from={R0} dur={22} color="#cfcab9" width={5} rail />
        <Pt lon={13.4} lat={52.52} from={R0} label="Berlin" r={6} dy={-12} />
        <Pt lon={28.97} lat={41.01} from={R0 + 9.5} label="Istanbul" r={6} dy={-14} />
        <Pt lon={34.87} lat={37.43} from={S(2)} label="Taurus Mountains" r={6} dy={-14} dx={-8} anchor="end" />
        <Pt lon={44.37} lat={33.31} from={R0 + 21} label="Baghdad" r={6} dy={24} dx={0} anchor="middle" />
        <MapLabel lon={33.5} lat={39.0} text="Neutral Turkey" from={S(5)} color={C.gold} size={30} spacing={12} />
        <Convoy pts={RAIL_E} from={S(6)} to={S(7)} speed={0.11} n={4} color={C.red} />
        <Convoy pts={[...RAIL_W].reverse()} from={S(7)} to={S(9)} speed={0.09} n={6} color={C.gold} reverse />
      </MapView>
            <Typer text="1903 · CONSTRUCTION BEGINS" from={S(1) + 0.8} to={S(3)} size={32} style={{ left: 40, top: 560 }} />
      <Typer text="1914–18 · THE GREAT WAR" from={S(3)} to={S(4)} size={32} style={{ left: 40, top: 560 }} />
      <Strike from={S(3) + 1.5} to={S(4)} w={420} style={{ left: 40, top: 584 }} />
      <Typer text="1940 · THE LAST GAP CLOSES" from={S(4)} to={S(6)} size={32} color={C.gold} style={{ left: 40, top: 560 }} />
      <Photo src="kaiser" from={S(1)} to={S(2) + 3} w={230} h={300} pos="50% 20%" style={{ left: 990, top: 40 }} caption="Kaiser Wilhelm II, 1902" credit="Studio of T. H. Voigt · Public domain" />
      <Photo src="bagdad_train" from={S(2) + 2} to={S(4)} w={380} h={230} rot={-2} style={{ left: 40, top: 40 }} caption="Baghdad Railway, c. 1900–10" credit="Matson Collection, Library of Congress · Public domain" />
      <Photo src="balkanzug" from={S(7)} to={S(9) + 2} w={380} h={270} rot={2} style={{ left: 860, top: 40 }} caption="Berlin–Constantinople express coach, 1916" credit="Public domain" />
      <Big lines={["Cargo trains."]} from={S(8)} size={80} style={{ top: 90 }} />
      <Big lines={["Full of rock."]} from={S(9)} size={80} color={C.gold} style={{ top: 180 }} />
      <Photo src="chromite2" from={S(9)} w={250} h={190} color rot={-3} style={{ left: 990, top: 400 }} caption="Chromite" credit="USGS · Public domain" />
      <Paper from={S(6)} to={S(7)} style={{ left: 40, top: 40 }}><span style={{ fontSize: 22 }}>▶ TROOPS TO IRAQ?</span></Paper>
      <Paper from={S(7)} to={S(8)} style={{ left: 40, top: 40 }}><span style={{ fontSize: 22 }}>◀ SOMETHING HEAVIER, WESTWARD</span></Paper>
      <Sfx n="whistle" at={0.3} v={0.4} />
      <Sfx n="rail" at={S(6)} v={0.25} />
      <Sfx n="thud" at={S(9)} v={0.8} />
    </AbsoluteFill>
  );
};
