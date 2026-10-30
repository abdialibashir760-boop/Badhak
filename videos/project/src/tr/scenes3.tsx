import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F, H, W } from "../theme";
import { CITY } from "../data";
import { G } from "../geo";
import { Arrow, MapView, Pt, Route } from "../Map";
import {
  Banknote, Big, Bust, Chapter, Dim, Envelope, Fog, Locomotive, Note, Paper, Photo, Plane, Show, Sfx, Stamp, Tank, Typer, Veil, Wagon, useSc, useT,
} from "../ui";

const Chip: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.gold }) => (
  <div style={{ background: "rgba(0,0,0,.75)", borderLeft: `5px solid ${color}`, padding: "10px 20px", fontFamily: F.head, fontSize: 28, letterSpacing: 4, color: C.paper, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 14 }}>{children}</div>
);

export const Sc7: React.FC = () => {
  const { S } = useSc();
  return (
    <AbsoluteFill>
      <MapView cam={[{ t: 0, lon: 17, lat: 46, k: 1000 }]} fills={[{ names: G.turkey, color: "#5a4a18", from: 0 }, { names: G.axis, color: "#34201e", from: 0 }, { names: G.ussr, color: "#3a1c1a", from: S(3) }]}>
        <Pt lon={32.86} lat={39.93} from={0.5} label="Ankara" color={C.gold} dx={0} dy={26} anchor="middle" />
        <Pt lon={-0.12} lat={51.5} from={S(1)} label="Londra" color={C.steel} dx={0} dy={26} anchor="middle" />
        <Pt lon={13.4} lat={52.52} from={S(2)} label="Berlin" color={C.red} dy={-14} dx={0} anchor="middle" />
        <Arrow from={[32.86, 39.93]} to={[-0.12, 51.5]} at={S(1)} dur={2} color={C.steel} width={6} curve={-0.12} label="1939 · İttifak" />
        <Arrow from={[32.86, 39.93]} to={[13.4, 52.52]} at={S(2)} dur={2} color={C.red} width={6} curve={0.12} label="18 Haziran 1941 · Dostluk paktı" />
        <Arrow from={[19, 52.2]} to={[35, 54]} at={S(3)} dur={1.6} color={C.red} width={9} curve={0.05} label="22 Haziran 1941" />
      </MapView>
      <Chapter label="III · Çifte Oyun" />
      <Note text="Modern sınırlar gösterilmiştir · 1941 kontrolü yaklaşıktır" />
      <Dim from={S(4)} to={S(6)} a={0.82} />
      <Big lines={["İki söz"]} from={S(4)} to={S(6)} size={100} style={{ top: 190 }} />
      <Big lines={["Tek sandalye"]} from={S(5)} to={S(6)} size={100} color={C.gold} style={{ top: 320 }} />
      <Dim from={S(6)} to={S(9)} a={0.55} />
      <Photo src="menemenciogliu" from={S(6)} to={S(9)} w={240} h={320} pos="50% 25%" rot={-2} style={{ left: 60, top: 110 }} caption="Numan Menemencioğlu, 1946" credit="Anefo / Nationaal Archief · CC0" />
      <Typer text="YÖNTEM: OYALAMA" from={S(7)} to={S(9)} size={30} color={C.gold} style={{ left: 60, top: 505 }} />
      <Photo src="papen" from={S(8)} to={S(9)} w={240} h={320} pos="50% 35%" rot={2} style={{ left: 970, top: 110 }} caption="Franz von Papen, 1932" credit="Agence Rol / BnF · Kamu malı" />
      <Dim from={S(9)} a={0.8} />
      <Big lines={["Henüz değil."]} from={S(9)} size={200} color={C.gold} style={{ top: 220 }} />
      <Sfx n="stamp" at={S(1)} v={0.5} />
      <Sfx n="stamp" at={S(2)} v={0.6} />
      <Sfx n="cannon" at={S(3)} v={0.6} />
      <Sfx n="tick" at={S(6)} v={0.8} />
      <Sfx n="thud" at={S(9)} v={1} />
    </AbsoluteFill>
  );
};

export const Carriage: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2a1c" /><stop offset="1" stopColor="#1e150d" /></linearGradient>
      <radialGradient id="lamp" cx="0.5" cy="0.25" r="0.7"><stop offset="0" stopColor="#f2c36b" stopOpacity=".5" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#wood)" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={110 + i * 400} y={60} width={260} height={230} fill="#1b242b" stroke="#6b4c2c" strokeWidth={12} />
        <line x1={110 + i * 400 + 130} y1={60} x2={110 + i * 400 + 130} y2={290} stroke="#6b4c2c" strokeWidth={8} />
      </g>
    ))}
    <rect width={W} height={H} fill="url(#lamp)" />
    <rect x={0} y={560} width={W} height={160} fill="#2a1d12" />
    <rect x={330} y={470} width={620} height={26} fill="#6b4c2c" stroke="#000" strokeWidth={3} />
    <rect x={620} y={496} width={40} height={90} fill="#4a331e" />
    <ellipse cx={500} cy={458} rx={26} ry={9} fill="#e8dec2" stroke="#000" strokeWidth={2} />
    <ellipse cx={780} cy={458} rx={26} ry={9} fill="#e8dec2" stroke="#000" strokeWidth={2} />
    {/* seated silhouettes */}
    <ellipse cx={330} cy={318} rx={46} ry={52} fill="#070605" />
    <path d="M230 470 C240 380 280 360 330 360 C380 360 420 380 430 470Z" fill="#070605" />
    <ellipse cx={950} cy={318} rx={44} ry={52} fill="#070605" />
    <path d="M850 470 C860 380 900 360 950 360 C1000 360 1040 380 1050 470Z" fill="#070605" />
  </svg>
);

export const Sc8: React.FC = () => {
  const { S } = useSc();
  return (
    <AbsoluteFill>
      <Carriage />
      <Show from={0.5} style={{ left: 190, top: 330 }}><div style={{ fontFamily: F.head, color: C.paper, fontSize: 20, letterSpacing: 4 }}>CHURCHİLL</div></Show>
      <Show from={0.7} style={{ left: 870, top: 330 }}><div style={{ fontFamily: F.head, color: C.paper, fontSize: 20, letterSpacing: 4 }}>İNÖNÜ</div></Show>
      <Dim from={0} to={0.3} a={0} />
      <Show from={S(2)} to={S(5) - 0.2} style={{ left: 130, top: 60 }}><Chip>Uçaklar <Plane size={90} /></Chip></Show>
      <Show from={S(3)} to={S(5) - 0.2} style={{ left: 130, top: 160 }}><Chip>Tanklar <Tank size={80} /></Chip></Show>
      <Show from={S(4)} to={S(5) - 0.2} style={{ left: 130, top: 260 }}><Chip>Lokomotifler ve vagonlar <Locomotive size={110} /><Wagon size={90} /></Chip></Show>
      <Show from={S(4) + 3} to={S(5) - 0.2} style={{ left: 130, top: 360 }}><div style={{ fontFamily: F.type, fontSize: 18, color: C.grey, maxWidth: 560 }}>Aktarılan: 10 lokomotif · 250 vagon (diplomatik kayıtlarda tartışmalı)</div></Show>
      <Big lines={["Önce silah."]} from={S(5)} to={S(7)} size={84} color={C.gold} style={{ top: 110 }} />
      <Big lines={["Sonra konuşuruz."]} from={S(6)} to={S(7)} size={60} style={{ top: 230 }} />
      <Dim from={S(7)} to={S(10)} a={0.86} />
      <Show from={S(8)} to={S(10)} style={{ left: 80, top: 160 }}>
        <div style={{ width: 520, textAlign: "center" }}>
          <div style={{ fontFamily: F.head, fontSize: 40, letterSpacing: 4, color: C.paper }}>ATLARDAN OLUŞAN ORDU</div>
          <div style={{ fontFamily: F.head, fontSize: 30, color: C.grey, margin: "8px 0" }}>KARŞI</div>
          <div style={{ display: "flex", justifyContent: "center" }}><Plane size={140} color="#a64a3c" /></div>
          <div style={{ fontFamily: F.head, fontSize: 40, letterSpacing: 4, color: C.red }}>→ İSTANBUL YANAR</div>
        </div>
      </Show>
      <Show from={S(9)} to={S(10)} style={{ left: 700, top: 200 }}>
        <div style={{ width: 500, textAlign: "center", fontFamily: F.head, fontSize: 40, letterSpacing: 4, color: C.paper }}>HİÇBİR ŞEY YAPMAMAK<div style={{ color: C.gold, marginTop: 12 }}>→ HERKES ÖDEMEYE DEVAM EDER</div></div>
      </Show>
      <Stamp text="Söz yok" from={S(11)} to={S(12)} size={80} style={{ left: 380, top: 250 }} />
      <Dim from={S(12)} a={0.8} />
      <Big lines={["Vagon şimdi nerede?"]} from={S(12)} size={64} style={{ top: 170 }} />
      <Show from={S(12) + 1.5} style={{ left: 0, top: 320, width: W }}>
        <div style={{ textAlign: "center", fontFamily: F.head, fontSize: 40, letterSpacing: 6, color: C.gold }}>BİR İSTASYON? · KONYA? · BİR MÜZE?</div>
      </Show>
      <Show from={S(13)} style={{ left: 0, top: 410, width: W }}>
        <div style={{ textAlign: "center", fontFamily: F.head, fontSize: 28, letterSpacing: 6, color: C.grey }}>KAYNAKLAR ÇELİŞİYOR</div>
      </Show>
      <Sfx n="rail" at={0.2} v={0.12} />
      <Sfx n="clank" at={S(4)} v={0.5} />
      <Sfx n="swell" at={S(7)} v={0.3} />
      <Sfx n="stamp" at={S(11)} v={0.9} />
    </AbsoluteFill>
  );
};

export const Sc9: React.FC = () => {
  const { S } = useSc();
  return (
    <AbsoluteFill>
      <MapView
        cam={[{ t: 0, lon: 32.862, lat: 39.918, k: 90000 }, { t: S(5) - 1, lon: 32.862, lat: 39.918, k: 90000 }, { t: S(5) + 1.5, lon: 22, lat: 46, k: 1000 }]}
        fills={[{ names: G.axis, color: "#34201e", from: 0 }, { names: G.turkey, color: "#3d3418", from: 0 }]}
      >
        <Pt lon={32.8575} lat={39.9125} from={0.5} to={S(5)} label="İngiliz elçiliği" color={C.steel} dx={-16} anchor="end" />
        <Pt lon={32.8665} lat={39.9235} from={0.9} to={S(5)} label="Alman elçiliği" color={C.red} dx={16} />
        <Arrow from={[32.8575, 39.9125]} to={[32.8665, 39.9235]} at={S(1) + 3} dur={1.5} color={C.gold} width={4} curve={0.15} label="belgeler" hideAt={S(5)} />
        <Pt lon={13.26} lat={52.77} from={S(7)} label="SS atölyesi" color={C.red} dy={-14} dx={0} anchor="middle" />
        <Pt lon={32.86} lat={39.93} from={S(6)} label="Ankara" color={C.gold} dx={0} dy={26} anchor="middle" />
        <Arrow from={[13.26, 52.77]} to={[32.86, 39.93]} at={S(7)} dur={2.4} color={C.gold} width={5} curve={0.12} />
      </MapView>
      <Note text="Büyükelçilik konumları şematiktir" from={0.4} to={S(5)} />
      <Dim from={S(1)} to={S(5)} a={0.35} />
      <Bust name="Elyesa Bazna" role="Uşak · kod adı “Cicero”" from={S(1)} to={S(5) - 0.5} style={{ left: 40, top: 80 }} hue="#5a4d3a" />
      <Paper from={S(2)} to={S(5) - 0.5} rot={-2} style={{ left: 880, top: 70, width: 330 }}>MÜTTEFİK KONFERANSLARI<br /><span style={{ color: "#8a2a1c", fontWeight: 700 }}>ÇOK GİZLİ</span></Paper>
      <Paper from={S(3)} to={S(5) - 0.5} rot={2} style={{ left: 880, top: 220, width: 330 }}>FRANSA ÇIKARMASI?<br /><span style={{ color: "#8a2a1c", fontWeight: 700 }}>ÇOK GİZLİ</span></Paper>
      <Big lines={["Bir pazar yeri"]} from={S(4)} to={S(5) - 0.5} size={90} style={{ top: 450 }} />
      <Photo src="bernhard20b" from={S(5) + 1.5} to={S(8)} w={440} h={290} color rot={-1} style={{ left: 420, top: 200 }} caption="Sahte 20 sterlinlik banknot, Bernhard Operasyonu, 1937" credit="Sachsenhausen tutukluları · Kamu malı" />
      <Stamp text="Sahte" from={S(6)} to={S(8)} size={64} rot={-10} style={{ left: 480, top: 300 }} />
      <Typer text="BERNHARD OPERASYONU" from={S(7)} to={S(8) + 2} size={34} color={C.gold} style={{ left: 60, top: 600 }} />
      <Dim from={S(8) + 1.5} a={0.8} />
      <Big lines={["Yıllarca", "hiç gerçek olmamış bir servetle yaşadı"]} from={S(8) + 1.5} to={S(9)} size={52} style={{ top: 240 }} />
      <Big lines={["Berlin bile ona tam güvenmedi"]} from={S(9)} to={S(10)} size={50} color={C.paper} style={{ top: 280 }} />
      <Big lines={["Herkes herkesi gözetliyor"]} from={S(10)} size={64} color={C.gold} style={{ top: 280 }} />
      <Sfx n="shutter" at={S(1) + 1} v={0.5} />
      <Sfx n="shutter" at={S(1) + 2.2} v={0.5} />
      <Sfx n="stamp" at={S(2) + 0.6} v={0.5} />
      <Sfx n="stamp" at={S(3) + 0.6} v={0.5} />
      <Sfx n="stamp" at={S(6)} v={1} />
      <Sfx n="tick" at={S(7)} v={0.8} />
    </AbsoluteFill>
  );
};

export const Sc9B: React.FC = () => {
  const { S } = useSc();
  const t = useT();
  const node = (x: number, y: number, label: string, color: string, from: number) => (
    <Show from={from} to={undefined} style={{ left: x - 80, top: y - 80 }}>
      <svg width={160} height={160}><circle cx={80} cy={80} r={64} fill="rgba(0,0,0,.6)" stroke={color} strokeWidth={6} /></svg>
      <div style={{ position: "absolute", top: 62, width: 160, textAlign: "center", fontFamily: F.head, fontSize: 22, letterSpacing: 3, color: C.paper }}>{label}</div>
    </Show>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #1a1713, #0b0a08)" }} />
      <Typer text="SONBAHAR 1943 · İLK TESLİMATLAR" from={S(1)} to={S(8)} size={32} color={C.gold} style={{ left: 60, top: 60 }} />
      <Paper from={S(2)} to={S(3)} rot={-3} style={{ left: 120, top: 220, width: 300 }}>TUTANAKLAR<br /><b style={{ color: "#8a2a1c" }}>ÇOK GİZLİ</b></Paper>
      <Paper from={S(2) + 1.2} to={S(3)} rot={2} style={{ left: 450, top: 200, width: 300 }}>STRATEJİ<br /><b style={{ color: "#8a2a1c" }}>ÇOK GİZLİ</b></Paper>
      <Paper from={S(2) + 2.4} to={S(3)} rot={-1} style={{ left: 780, top: 230, width: 300 }}>BİR ÇIKARMAYI ANDIRAN KOD ADI<br /><b style={{ color: "#8a2a1c" }}>ÇOK GİZLİ</b></Paper>
      <Big lines={["Ve Berlin omuz silkiyor."]} from={S(3)} to={S(4)} size={86} style={{ top: 260 }} />
      <Paper from={S(4)} to={S(6)} style={{ left: 140, top: 230, width: 400 }}><span style={{ fontSize: 30 }}>✔ BAZI YETKİLİLER İNANIYOR</span></Paper>
      <Paper from={S(5)} to={S(6)} style={{ left: 700, top: 230, width: 400 }}><span style={{ fontSize: 30 }}>? DİĞERLERİ TUZAK SANIYOR</span></Paper>
      <Big lines={["Okundu · Tartışıldı · Dosyalandı"]} from={S(6)} to={S(7)} size={74} color={C.gold} style={{ top: 280 }} />
      <Typer text="İLKBAHAR 1944" from={S(7)} to={S(10)} size={32} color={C.red} style={{ left: 60, top: 112 }} />
      <Bust name="Cecilie Kapp" role="Alman büyükelçiliği sekreteri" from={S(7)} to={S(9)} style={{ left: 515, top: 140 }} hue="#4a443a" />
      <Show from={S(7) + 3} to={S(9)} style={{ left: 380, top: 470 }}><div style={{ fontFamily: F.head, fontSize: 32, letterSpacing: 5, color: C.gold }}>MÜTTEFİKLERE SIĞINIYOR (İDDİA EDİLDİ)</div></Show>
      <Stamp text="Olay çöküyor" from={S(8)} to={S(10)} size={60} style={{ left: 330, top: 560 }} />
      <Dim from={S(9) + 1} to={S(10)} a={0.9} />
      <Show from={S(10) + 0.3} style={{ left: 0, top: 0, width: W, height: H }}>
        <svg width={W} height={H}>
          {[[640, 230], [420, 440], [860, 440]].map(([x, y], i) => (
            <g key={i}>
              {[[640, 230], [420, 440], [860, 440]].map(([x2, y2], j) => (j !== i ? <line key={j} x1={x} y1={y} x2={x2} y2={y2} stroke={C.gold} strokeWidth={2} strokeDasharray="6 8" opacity={0.7} /> : null))}
            </g>
          ))}
        </svg>
      </Show>
      {node(640, 230, "BRITAIN", C.steel, S(11))}
      {node(420, 440, "GERMANY", C.red, S(11) + 0.6)}
      {node(860, 440, "USSR", "#9a3a2c", S(11) + 1.2)}
      <Fog from={S(13)} opacity={0.6} />
      <Big lines={["Türkiye'nin ihtiyaç duyduğu sis"]} from={S(14)} size={64} color={C.gold} style={{ top: 560 }} />
      <Sfx n="shutter" at={S(1)} v={0.5} />
      <Sfx n="stamp" at={S(2) + 0.3} v={0.4} />
      <Sfx n="thud" at={S(3)} v={0.7} />
      <Sfx n="stamp" at={S(8)} v={0.9} />
      <Sfx n="swell" at={S(13)} v={0.3} />
    </AbsoluteFill>
  );
};
