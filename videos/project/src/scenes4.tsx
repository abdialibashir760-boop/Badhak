import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F, W } from "./theme";
import { CITY, RAIL } from "./data";
import { G } from "./geo";
import { Arrow, Hatch, MapLabel, MapView, Pt, Route } from "./Map";
import { Big, Bust, Chapter, Dim, Note, Paper, Photo, Rock, Show, Sfx, Stamp, Typer, Veil, useSc } from "./ui";

export const Sc10: React.FC = () => {
  const { S } = useSc();
  return (
    <AbsoluteFill>
      <MapView
        cam={[{ t: 0, lon: 36, lat: 47, k: 950 }, { t: S(7), lon: 32, lat: 46, k: 850 }]}
        fills={[
          { names: G.turkey, color: "#5a4a18", from: 0 },
          { names: G.ussr, color: "#5a2420", from: S(2) },
          { names: G.balkansEast, color: "#43201e", from: S(7) + 2 },
        ]}
      >
        <Arrow from={CITY.moscow} to={[29.0, 41.1]} at={S(3)} dur={2.2} color={C.red} width={8} curve={-0.1} label="Nov 1940 · bases on the Straits" />
        <Pt lon={29.0} lat={41.1} from={S(3) + 2} label="The Straits" color={C.gold} dx={-14} anchor="end" />
        <Arrow from={[44, 50]} to={[20, 47]} at={S(7) + 1} dur={2.4} color={C.red} width={9} curve={0.08} label="Red Army" />
        <MapLabel lon={34} lat={39.2} text="Turkey" from={S(8)} color={C.gold} size={32} spacing={14} />
      </MapView>
      <Chapter label="IV · The Shadow of the Greater Enemy" />
      <Note text="Modern borders shown · 1941 control approximate" />
      <Dim from={S(1)} to={S(3)} a={0.6} />
      <Big lines={["Here’s the twist."]} from={S(0)} to={S(1)} size={80} style={{ top: 280 }} />
      <Big lines={["Not Germany."]} from={S(1)} to={S(2)} size={90} style={{ top: 230 }} />
      <Big lines={["The Soviet Union."]} from={S(2)} to={S(3)} size={90} color={C.red} style={{ top: 250 }} />
      <Photo src="molotov" from={S(3) + 1} to={S(6)} w={440} h={225} rot={-2} style={{ left: 40, top: 370 }} caption="Molotov in Berlin, November 1940" credit="Pravda, 1940 · Public domain" />
      <Photo src="sofia1944" from={S(7)} to={S(8)} w={360} h={225} rot={2} style={{ left: 860, top: 380 }} caption="Red Army tank greeted in Sofia, Sept 1944" credit="Public domain" />
      <Big lines={["Turkey never forgot."]} from={S(5)} to={S(6)} size={58} color={C.gold} style={{ top: 120 }} />
      <Big lines={["The Red Army next door"]} from={S(7)} to={S(8)} size={54} color={C.paper} style={{ top: 470 }} />
      <Dim from={S(8)} a={0.6} />
      <Big lines={["Neutrality isn’t cowardice."]} from={S(8)} to={S(9)} size={66} style={{ top: 250 }} />
      <Big lines={["It is a buffer."]} from={S(9)} size={110} color={C.gold} style={{ top: 250 }} />
      <Sfx n="swell" at={S(2)} v={0.45} />
      <Sfx n="thud" at={S(2)} v={0.7} />
      <Sfx n="cannon" at={S(7) + 1} v={0.5} />
      <Sfx n="thud" at={S(9)} v={0.8} />
    </AbsoluteFill>
  );
};

export const Sc10B: React.FC = () => {
  const { S } = useSc();
  return (
    <AbsoluteFill>
      <MapView
        cam={[{ t: 0, lon: 18, lat: 46, k: 1000 }, { t: S(11), lon: 18, lat: 46, k: 1000 }]}
        fills={[{ names: G.turkey, color: "#5a4a18", from: 0 }, { names: G.axis, color: "#34201e", from: 0 }]}
      >
        <Route pts={[[32.86, 39.93], [28.97, 41.01], [23.32, 42.7], [20.46, 44.8], [16.37, 48.21], [13.4, 52.52]]} from={0.3} dur={2} color={C.gold} width={5} fadeTo={S(9)} />
        <Arrow from={CITY.london} to={[32.86, 39.93]} at={S(0) + 1} dur={2.4} color={C.steel} width={7} curve={0.16} label="Ultimatum · April 1944" />
        <Pt lon={32.86} lat={39.93} from={0.5} label="Ankara" color={C.gold} dx={0} dy={26} anchor="middle" />
        <Arrow from={[44, 50]} to={[22, 48]} at={S(11)} dur={2.4} color={C.red} width={9} curve={0.08} />
        <Pt lon={-0.5} lat={49.3} from={S(11) + 3} label="France: weeks away" color={C.steel} dy={26} dx={0} anchor="middle" />
      </MapView>
      <Dim from={S(1)} to={S(7)} a={0.7} />
      <Paper from={S(1)} to={S(7)} style={{ left: 280, top: 60, width: 720 }}>
        <b>END CHROME SHIPMENTS TO GERMANY</b><br />or forget Allied weapons —<br />and a seat at the table.
      </Paper>
      <Big lines={["He stalls"]} from={S(3)} to={S(7)} size={60} align="left" style={{ left: 120, top: 330 }} />
      <Big lines={["Slows deliveries"]} from={S(4)} to={S(7)} size={60} align="left" style={{ left: 120, top: 400 }} />
      <Big lines={["Shaves the quotas"]} from={S(5)} to={S(7)} size={60} align="left" style={{ left: 120, top: 470 }} />
      <Big lines={["Delays"]} from={S(6)} to={S(7)} size={60} align="left" style={{ left: 120, top: 540 }} />
      <Stamp text="No." from={S(7)} to={S(8)} size={170} style={{ left: 480, top: 260 }} color={C.steel} />
      <Stamp text="The chrome stops" from={S(9)} to={S(10) + 4} size={58} style={{ left: 380, top: 120 }} />
      <Photo src="menemenciogliu" from={S(10)} to={S(11) - 0.2} w={240} h={320} pos="50% 25%" rot={-2} style={{ left: 60, top: 200 }} caption="Numan Menemencioğlu · removed from office (reported)" credit="Anefo / Nationaal Archief · CC0" />
      <Dim from={S(12)} a={0.92} />
      <Photo src="chromite2" from={S(12)} w={400} h={300} color rot={-2} style={{ left: 440, top: 70 }} caption="Chromite" credit="USGS · Public domain" />
      <Photo src="normandy1" from={S(11) + 3} to={S(12) - 0.2} w={340} h={230} rot={2} style={{ left: 880, top: 330 }} caption="Omaha Beach, 6 June 1944" credit="US Army Signal Corps · Public domain" />
      <Big lines={["Just rock"]} from={S(12) + 0.3} size={90} color={C.grey} style={{ top: 440 }} />
      <Big lines={["Leverage lasts only", "as long as the war is balanced"]} from={S(14)} size={56} color={C.gold} style={{ top: 30 }} />
      <Sfx n="swell" at={S(0)} v={0.3} />
      <Sfx n="stamp" at={S(7)} v={1} />
      <Sfx n="stamp" at={S(9)} v={1} />
      <Sfx n="thud" at={S(12)} v={0.6} />
      <Sfx n="thud" at={S(14)} v={0.9} />
    </AbsoluteFill>
  );
};

export const Sc11: React.FC = () => {
  const { S, D } = useSc();
  return (
    <AbsoluteFill>
      <MapView cam={[{ t: 0, lon: 38, lat: 46, k: 950 }, { t: S(5), lon: 33, lat: 42, k: 1300 }]} fills={[{ names: G.turkey, color: "#5a4a18", from: 0 }, { names: G.axis, color: "#34201e", from: 0 }, { names: G.ussr, color: "#3a1c1a", from: 0 }]}>
        <Pt lon={CITY.stalingrad[0]} lat={CITY.stalingrad[1]} from={S(1)} label="Stalingrad" color={C.red} dx={14} />
        <Pt lon={CITY.kursk[0]} lat={CITY.kursk[1]} from={S(2)} label="Kursk" color={C.red} dx={-14} anchor="end" />
        <Arrow from={[40, 50]} to={[18, 49]} at={S(3)} dur={2.4} color={C.red} width={9} curve={0.08} />
        <Route pts={[[32.86, 39.93], [28.97, 41.01], [23.32, 42.7], [13.4, 52.52]]} from={0.2} dur={0.6} color={C.gold} width={4} fadeTo={S(4) + 1} />
        <Pt lon={32.86} lat={39.93} from={S(5)} label="Ankara" color={C.gold} dx={0} dy={26} anchor="middle" />
      </MapView>
      <Photo src="stalingrad1" from={S(1)} to={S(4)} w={360} h={250} rot={-2} style={{ left: 40, top: 60 }} caption="German troops, Stalingrad, 1942" credit="Propaganda-Kompanie · Public domain" />
      <Photo src="kursk" from={S(2)} to={S(4)} w={360} h={250} rot={2} style={{ left: 440, top: 90 }} caption="Soviet T-34s, Kursk, 1943" credit="Public domain" />
      <Dim from={S(4)} to={S(6)} a={0.55} />
      <Typer text="AUGUST 1944 · RELATIONS WITH GERMANY CUT" from={S(4)} to={S(5)} size={30} color={C.paper} style={{ left: 60, top: 470 }} />
      <Typer text="23 FEBRUARY 1945 · TURKEY DECLARES WAR" from={S(5)} to={S(6)} size={30} color={C.gold} style={{ left: 60, top: 470 }} />
      <Show from={S(5) + 6} to={S(6)} style={{ left: 60, top: 520 }}><div style={{ fontFamily: F.head, fontSize: 24, letterSpacing: 5, color: C.grey }}>VICTORY CERTAIN · A SEAT AT THE NEW UNITED NATIONS</div></Show>
      <Big lines={["Walks in at the very end"]} from={S(6)} size={74} style={{ top: 220 }} />
      <Dim from={S(6)} a={0.7} />
      <Dim from={D - 1.2} a={1} />
      <Sfx n="cannon" at={S(1)} v={0.4} />
      <Sfx n="cannon" at={S(2)} v={0.4} />
      <Sfx n="stamp" at={S(4)} v={0.6} />
      <Sfx n="stamp" at={S(5)} v={0.8} />
    </AbsoluteFill>
  );
};

export const Sc12: React.FC = () => {
  const { S } = useSc();
  return (
    <AbsoluteFill>
      <MapView cam={[{ t: 0, lon: 38, lat: 41, k: 2400 }]} fills={[{ names: G.turkey, color: "#5a4a18", from: 0 }, { names: G.ussr, color: "#5a2420", from: S(5) }]}>
        <Hatch pts={[[42.2, 41.3], [44.0, 41.3], [44.2, 40.2], [42.4, 40.0]]} from={S(5)} />
        <Pt lon={43.1} lat={40.6} from={S(5) + 0.5} label="Kars · Ardahan" color={C.red} dx={-14} anchor="end" />
        <Pt lon={29.0} lat={41.05} from={S(5) + 1.5} label="The Straits" color={C.red} dx={14} dy={-12} />
      </MapView>
      <Veil until={S(4) - 0.3} />
      <Chapter label="V · The Cost of Neutrality" />
      <Big lines={["Kept the cities standing"]} from={S(0)} to={S(1)} size={70} style={{ top: 250 }} />
      <Big lines={["Not innocent"]} from={S(1)} to={S(2)} size={100} color={C.red} style={{ top: 250 }} />
      <Paper from={S(2)} to={S(4) - 0.2} rot={-1.5} style={{ left: 300, top: 150, width: 680 }}>
        <b style={{ fontSize: 30 }}>1942 · WEALTH TAX</b><br />Fell hardest on non-Muslim minorities.<br />Many were forced to sell property to pay it.
      </Paper>
      <Stamp text="A war at home" from={S(3)} to={S(4) - 0.2} size={58} style={{ left: 380, top: 470 }} />
      <Typer text="1945–46 · SOVIET CLAIMS ON EASTERN PROVINCES & THE STRAITS" from={S(5)} to={S(6)} size={22} color={C.paper} style={{ left: 40, top: 650 }} />
      <Typer text="1947 · TRUMAN DOCTRINE" from={S(6)} to={S(7)} size={42} color={C.gold} style={{ left: 60, top: 230 }} />
      <Typer text="1952 · NATO" from={S(6) + 3.2} to={S(7)} size={42} color={C.gold} style={{ left: 60, top: 300 }} />
      <Dim from={S(7)} a={0.8} />
      <Big lines={["It bought time"]} from={S(7)} size={90} style={{ top: 190 }} color={C.paper} />
      <Big lines={["Not safety"]} from={S(8)} size={110} style={{ top: 330 }} color={C.gold} />
      <Sfx n="stamp" at={S(3)} v={0.6} />
      <Sfx n="swell" at={S(4)} v={0.3} />
      <Sfx n="thud" at={S(8)} v={0.9} />
    </AbsoluteFill>
  );
};

export const Sc13: React.FC = () => {
  const { S, D } = useSc();
  return (
    <AbsoluteFill>
      <MapView
        cam={[{ t: 0, lon: 34, lat: 39, k: 2300 }, { t: S(3), lon: 34, lat: 38, k: 1300 }, { t: S(5), lon: 25, lat: 25, k: 260 }]}
        fills={[{ names: G.turkey, color: "#5a4a18", from: 0 }]}
      >
        <Route pts={RAIL} from={0.3} dur={5} color="#cfcab9" width={5} rail />
      </MapView>
      <Dim from={S(1) - 0.3} a={0.7} />
      <Big lines={["Turkey’s neutrality"]} from={S(0)} to={S(1)} size={74} style={{ top: 270 }} />
      <Big lines={["A masterclass in survival?"]} from={S(1)} to={S(2)} size={70} style={{ top: 270 }} />
      <Big lines={["The most successful hedge", "in modern history?"]} from={S(2)} to={S(3)} size={64} color={C.gold} style={{ top: 220 }} />
      <Big lines={["Neutral…"]} from={S(3)} to={S(5)} size={110} style={{ top: 160 }} />
      <Big lines={["…or profiteer?"]} from={S(4)} to={S(5)} size={110} color={C.red} style={{ top: 300 }} />
      <Big lines={["Tell me in the comments"]} from={S(5)} to={S(6)} size={74} color={C.gold} style={{ top: 260 }} />
      <Show from={S(6)} style={{ left: 0, top: 130, width: W }}>
        <div style={{ textAlign: "center", fontFamily: F.head, fontSize: 28, letterSpacing: 8, color: C.grey }}>NEXT</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <div style={{ width: 760, height: 280, border: `4px solid ${C.paper}`, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: F.head, fontSize: 40, letterSpacing: 4, color: C.paper, textAlign: "center", padding: 30 }}>HOW A SINGLE TREATY CLAUSE TURNED A COUNTRY INTO A BATTLEFIELD</div>
          </div>
        </div>
      </Show>
      <Dim from={D - 2.5} a={1} />
      <Sfx n="swell" at={S(3)} v={0.3} />
      <Sfx n="whistle" at={S(6) + 2} v={0.4} />
    </AbsoluteFill>
  );
};
