import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ColorCtx, Person, Pose } from "./Wire3D";
import { STORY_SECONDS, SWORDS } from "./storyWords";

export const ST_FPS = 30;
export const ST_W = 1280;
export const ST_H = 720;
export const ST_FRAMES = Math.ceil(STORY_SECONDS * ST_FPS);

const OR = "#ff7a2e";
const BLUE = "#3b3bff";
const CYAN = "#4fe0ff";
const PINK = "#ff4fb0";
const RED = "#ff3b3b";
const YEL = "#ffd36a";
const VIOLET = "#b58cff";
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

// ---------- captions ----------
const CHUNKS = (() => {
  const out: number[][] = [];
  let cur: number[] = [];
  SWORDS.forEach((w, i) => {
    cur.push(i);
    const end = /[.?!]$/.test(w.w) || (/,$/.test(w.w) && cur.length >= 3) || cur.length >= 7;
    if (end) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out.map((ix) => ({
    text: ix.map((i) => SWORDS[i].w).join(" "),
    s: SWORDS[ix[0]].s,
    e: SWORDS[ix[ix.length - 1]].e,
  }));
})();

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / ST_FPS;
  const c = CHUNKS.find((k) => t >= k.s - 0.05 && t <= k.e + 0.3);
  if (!c) return null;
  const o = interpolate(t, [c.s - 0.05, c.s + 0.1, c.e + 0.15, c.e + 0.3], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 38, display: "flex", justifyContent: "center", opacity: o }}>
      <div
        style={{
          maxWidth: 1060,
          padding: "10px 28px",
          borderRadius: 18,
          background: "rgba(6,4,24,0.78)",
          color: "#fff",
          fontFamily: font,
          fontWeight: 700,
          fontSize: 38,
          textAlign: "center",
          lineHeight: 1.25,
        }}
      >
        {c.text}
      </div>
    </div>
  );
};

// ---------- HTML label ----------
const Tag: React.FC<{
  t: number;
  from: number;
  to: number;
  x: number;
  y: number;
  color?: string;
  size?: number;
  children: React.ReactNode;
}> = ({ t, from, to, x, y, color = BLUE, size = 30, children }) => {
  if (t < from || t > to) return null;
  const o = interpolate(t, [from, from + 0.2, to - 0.25, to], [0, 1, 1, 0], clamp);
  const s = interpolate(t, [from, from + 0.25], [0.8, 1], { easing: Easing.out(Easing.back(2)), ...clamp });
  const dark = color === YEL;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,0) scale(${s})`,
        opacity: o,
        padding: "10px 26px",
        borderRadius: 999,
        background: color,
        color: dark ? "#241a00" : "#fff",
        fontFamily: font,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: 1.5,
        whiteSpace: "nowrap",
        boxShadow: `0 8px 28px ${color}88`,
      }}
    >
      {children}
    </div>
  );
};

// ---------- 3D scaffolding ----------
const CamRig: React.FC<{ pos: number[]; look: number[] }> = ({ pos, look }) => {
  const { camera } = useThree();
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  camera.updateProjectionMatrix();
  return null;
};

const Stage: React.FC<{ pos: number[]; look: number[]; children: React.ReactNode }> = ({ pos, look, children }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#070520" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 42, position: [0, 1.6, 5], near: 0.1, far: 160 }}>
        <color attach="background" args={["#070520"]} />
        <CamRig pos={pos} look={look} />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

const edges = (w: number, h: number, d: number) => new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));

const Box: React.FC<{ p: [number, number, number]; s: [number, number, number]; color: string; fill?: string }> = ({
  p,
  s,
  color,
  fill = "#0b0830",
}) => (
  <group position={p}>
    <mesh>
      <boxGeometry args={s} />
      <meshBasicMaterial color={fill} />
    </mesh>
    <lineSegments geometry={edges(s[0], s[1], s[2])}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  </group>
);

const RoomShell: React.FC = () => (
  <group>
    <gridHelper args={[16, 32, "#4a44ff", "#2a2599"]} />
    <group position={[0, 0, -2.4]} rotation={[Math.PI / 2, 0, 0]}>
      <gridHelper args={[16, 32, "#4a44ff", "#1d1a70"]} position={[0, 0, -3]} />
    </group>
    <group position={[-4.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <gridHelper args={[16, 32, "#4a44ff", "#1d1a70"]} position={[3, 0, 0]} />
    </group>
  </group>
);

const City: React.FC = React.memo(() => (
  <group>
    <gridHelper args={[160, 160, "#4a44ff", "#25208a"]} />
    {Array.from({ length: 24 }).map((_, i) => {
      const w = 2.4 + random(`bw${i}`) * 1.2;
      const h = 3 + random(`bh${i}`) * 4.5;
      const x = -12 + i * 3.6;
      const rows = Math.floor(h / 1.1);
      return (
        <group key={i} position={[x, 0, -9 - random(`bz${i}`) * 2]}>
          <Box p={[0, h / 2, 0]} s={[w, h, 2]} color={BLUE} />
          {Array.from({ length: rows * 2 }).map((_, k) => {
            if (random(`win${i}-${k}`) < 0.45) return null;
            const r = Math.floor(k / 2);
            const c = k % 2;
            return (
              <mesh key={k} position={[(c - 0.5) * (w * 0.5), 0.7 + r * 1.05, 1.02]}>
                <boxGeometry args={[0.38, 0.5, 0.02]} />
                <meshBasicMaterial color={YEL} />
              </mesh>
            );
          })}
        </group>
      );
    })}
    {Array.from({ length: 14 }).map((_, k) => (
      <group key={k} position={[-8 + k * 6, 0, -3]}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 2.4, 6]} />
          <meshBasicMaterial color={PINK} wireframe />
        </mesh>
        <mesh position={[0, 2.45, 0]}>
          <sphereGeometry args={[0.13, 8, 6]} />
          <meshBasicMaterial color={YEL} />
        </mesh>
      </group>
    ))}
  </group>
));

const P = (o: Partial<Pose>): Pose => ({
  pos: [0, 0.95, 0],
  rotY: 0,
  walk: 0,
  phase: 0,
  sit: 0,
  flat: 0,
  lean: 0,
  headYaw: 0,
  headPitch: 0,
  eyeX: 0,
  eyeY: 0,
  blink: 0,
  bubbles: 0,
  ...o,
});
const blinkAt = (t: number) => interpolate((t + 0.6) % 3.1, [0, 0.07, 0.16], [1, 0.8, 0], clamp);

const Dots: React.FC<{ n?: number; r: number; progress: number; color: string; center: [number, number, number]; spin?: number }> = ({
  n = 120,
  r,
  progress,
  color,
  center,
  spin = 0,
}) => (
  <group position={center} rotation={[0, spin, 0]}>
    <mesh>
      <icosahedronGeometry args={[r * 1.08, 1]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.22 * (1 - progress * 0.6)} />
    </mesh>
    {Array.from({ length: n }).map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      const thr = random(`dot${i}`);
      const gone = interpolate(progress, [thr * 0.8, thr * 0.8 + 0.2], [0, 1], clamp);
      const sc = 1 - gone;
      if (sc <= 0.02) return null;
      return (
        <mesh key={i} position={[Math.cos(th) * rad * r, y * r + gone * 0.7, Math.sin(th) * rad * r]} scale={sc}>
          <octahedronGeometry args={[0.05, 0]} />
          <meshBasicMaterial color={color} />
        </mesh>
      );
    })}
  </group>
);

const Bed: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <Box p={[0, 0.15, 0]} s={[2.6, 0.3, 1.2]} color={CYAN} />
    <Box p={[-1.26, 0.55, 0]} s={[0.08, 0.9, 1.2]} color={BLUE} />
    <mesh position={[-0.95, 0.36, 0]}>
      <boxGeometry args={[0.5, 0.12, 0.7]} />
      <meshBasicMaterial color={BLUE} wireframe />
    </mesh>
  </group>
);

// ---------- scene 1: hook ----------
const SceneHook: React.FC<{ t: number }> = ({ t }) => {
  const dropStart = tw("dropped");
  const zero2 = tw("zero", idx("dropped"));
  const p = interpolate(t, [dropStart, zero2 + 0.4], [0, 1], clamp);
  const iq = Math.round(100 * (1 - p));
  const look = Math.sin(t * 1.3);
  const icons = [
    { w: "read,", label: "READ", x: -1.9, y: 1.9, c: CYAN },
    { w: "cook,", label: "COOK", x: 1.9, y: 1.9, c: PINK },
    { w: "bills?", label: "BILLS", x: 0, y: 3.0, c: YEL },
  ].map((o) => ({ ...o, at: tw(norm(o.w)) }));
  const end = tw("worrying");
  return (
    <>
      <Stage pos={[0, 1.4, 5.4 - t * 0.05]} look={[0, 1.4, 0]}>
        <RoomShell />
        <group position={[0, 1.5, 0]} rotation={[0, 0.35 * Math.sin(t * 0.8), 0]}>
          <mesh>
            <sphereGeometry args={[1, 22, 16]} />
            <meshBasicMaterial color="#2a0c02" transparent opacity={0.3} depthWrite={false} />
          </mesh>
          <mesh scale={1.015}>
            <sphereGeometry args={[1, 22, 16]} />
            <meshBasicMaterial color={OR} wireframe />
          </mesh>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.36, 0.14, 0.9]}>
              <mesh scale={[1, Math.max(0.06, 1 - (t > end ? 1 : blinkAt(t))), 1]}>
                <sphereGeometry args={[0.12, 12, 10]} />
                <meshBasicMaterial color="#fff" />
              </mesh>
              <mesh position={[look * 0.05, 0, 0.08]} scale={[1, Math.max(0.06, 1 - (t > end ? 1 : blinkAt(t))), 1]}>
                <sphereGeometry args={[0.055, 10, 8]} />
                <meshBasicMaterial color="#05031a" />
              </mesh>
            </group>
          ))}
          <Dots r={0.62} progress={p} color={CYAN} center={[0, 0.25, -0.1]} spin={t * 0.6} />
        </group>
        {icons.map((ic, i) => {
          const a = interpolate(t, [ic.at, ic.at + 0.4, end, end + 0.4], [0, 1, 1, 0], clamp);
          if (a <= 0.01) return null;
          return (
            <group key={i} position={[ic.x, ic.y + Math.sin(t * 2 + i) * 0.06, 0.6]} scale={a} rotation={[0.3, t, 0]}>
              <mesh>
                <boxGeometry args={[0.55, 0.4, 0.15]} />
                <meshBasicMaterial color={ic.c} wireframe />
              </mesh>
            </group>
          );
        })}
      </Stage>
      <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center", fontFamily: font, fontWeight: 900 }}>
        <span style={{ fontSize: 40, color: "#fff", letterSpacing: 6 }}>IQ </span>
        <span style={{ fontSize: 92, color: p > 0.6 ? RED : YEL, textShadow: `0 0 30px ${p > 0.6 ? RED : YEL}` }}>{iq}</span>
      </div>
      {icons.map((ic) => (
        <Tag key={ic.label} t={t} from={ic.at} to={ic.at + 2.4} x={640} y={190} color={ic.c === YEL ? YEL : ic.c === CYAN ? BLUE : PINK}>
          {ic.label}?
        </Tag>
      ))}
    </>
  );
};

// ---------- bike ----------
const Bike: React.FC<{ x: number }> = ({ x }) => {
  const spin = -x / 0.32;
  return (
    <group position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      {[-0.55, 0.55].map((z) => (
        <group key={z} position={[0, 0.32, z]} rotation={[spin, 0, 0]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.32, 0.02, 6, 24]} />
            <meshBasicMaterial color={CYAN} wireframe />
          </mesh>
          <mesh>
            <boxGeometry args={[0.02, 0.62, 0.02]} />
            <meshBasicMaterial color={CYAN} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.02, 0.02, 0.62]} />
            <meshBasicMaterial color={CYAN} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.06, 0.06, 1.1]} />
        <meshBasicMaterial color={PINK} />
      </mesh>
      <mesh position={[0, 0.95, 0.5]}>
        <boxGeometry args={[0.5, 0.04, 0.04]} />
        <meshBasicMaterial color={PINK} />
      </mesh>
      <Box p={[0, 1.0, -0.66]} s={[0.5, 0.45, 0.45]} color={YEL} fill="#2a1d00" />
    </group>
  );
};

const SceneBike: React.FC<{ t: number; dur: number; start: number }> = ({ t, dur, start }) => {
  const k = (t - start) / dur;
  const bx = interpolate(k, [0, 1], [0, 19]);
  const pose = P({ pos: [bx, 0.95 - 0.49 * 0.7, -0.02], rotY: Math.PI / 2, sit: 0.7, walk: 0.5, phase: t * 6, lean: 0.18, blink: blinkAt(t) });
  const cam = interpolate(k, [0, 1], [0, 1]);
  return (
    <>
      <Stage pos={[bx + 0.8 - cam * 0.4, 1.4 + cam * 0.2, 5.4 - cam * 0.8]} look={[bx + 1.2, 0.85, 0]}>
        <City />
        <Bike x={bx} />
        <Person p={pose} />
      </Stage>
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 48,
          fontFamily: font,
          fontWeight: 900,
          color: "#fff",
          fontSize: 54,
          opacity: interpolate(t, [tw("24") - 0.1, tw("24") + 0.3], [0, 1], clamp),
        }}
      >
        AGE 24
      </div>
      <Tag t={t} from={tw("exactly")} to={tw("exactly") + 4.4} x={640} y={120} color={YEL} size={40}>
        IQ 100 = AVERAGE
      </Tag>
      <Tag t={t} from={tw("taxes")} to={tw("taxes") + 2.6} x={640} y={120} color={BLUE}>
        TAXES · WITH HELP
      </Tag>
      <Tag t={t} from={tw("movie")} to={tw("movie") + 2.6} x={640} y={120} color={PINK}>
        MOVIE PLOT · MOSTLY
      </Tag>
      <Tag t={t} from={tw("furniture")} to={tw("furniture") + 3.2} x={640} y={120} color={BLUE}>
        FURNITURE · UNWATCHED
      </Tag>
    </>
  );
};

// ---------- scene 3: worry ----------
const SceneWorry: React.FC<{ t: number; start: number }> = ({ t, start }) => {
  const k = t - start;
  const lean = -(Math.PI / 2);
  const pose = P({
    pos: [0.3 + 2.2, 0.46, -1.2],
    rotY: Math.PI / 2,
    flat: 1,
    lean,
    headPitch: lean * 0.9 + 0.25,
    headYaw: Math.sin(k * 0.6) * 0.3,
    eyeX: 0,
    eyeY: 0.6,
    blink: blinkAt(t * 0.7),
  });
  const items = [
    { w: "rent,", label: "RENT", x: -0.7, y: 1.5, c: RED },
    { w: "job,", label: "JOB", x: 0.1, y: 2.1, c: PINK },
    { w: "noise", label: "WEIRD NOISE", x: 0.9, y: 1.6, c: YEL },
  ].map((o) => ({ ...o, at: tw(o.w, iBut) }));
  const nums = tw("numbers", iBut);
  return (
    <>
      <Stage pos={[2.8 + Math.sin(k * 0.3) * 0.6, 2.4, 3.8]} look={[2.2, 0.7, -1.2]}>
        <RoomShell />
        <Bed x={2.2} z={-1.2} />
        <Person p={pose} />
        {items.map((it, i) => {
          const a = interpolate(t, [it.at, it.at + 0.4], [0, 1], clamp);
          return (
            <mesh key={i} position={[1.6 + it.x + 0.6, 1.7 + it.y * 0.25 + Math.sin(t * 2 + i) * 0.06, -1.2]} scale={a} rotation={[t, t * 0.7, 0]}>
              <icosahedronGeometry args={[0.25, 1]} />
              <meshBasicMaterial color={it.c} wireframe />
            </mesh>
          );
        })}
        {Array.from({ length: 14 }).map((_, i) => {
          const a = interpolate(t, [nums, nums + 0.5], [0, 1], clamp);
          return (
            <mesh
              key={i}
              position={[
                1.0 + random(`nx${i}`) * 2.4,
                1.4 + ((t * 0.4 + random(`ny${i}`) * 2) % 1.6),
                -1.2 + (random(`nz${i}`) - 0.5) * 0.6,
              ]}
              scale={a * 0.8}
            >
              <octahedronGeometry args={[0.07, 0]} />
              <meshBasicMaterial color={RED} />
            </mesh>
          );
        })}
      </Stage>
      {items.map((it) => (
        <Tag key={it.label} t={t} from={it.at} to={it.at + 2.2} x={640} y={110} color={it.c === YEL ? YEL : it.c}>
          {it.label}
        </Tag>
      ))}
      <Tag t={t} from={tw("awake")} to={tw("awake") + 2.4} x={640} y={110} color={VIOLET}>
        AWAKE AT 3 AM
      </Tag>
      <Tag t={t} from={nums} to={nums + 3.6} x={640} y={110} color={RED}>
        NUMBERS NEVER ADD UP
      </Tag>
    </>
  );
};

// ---------- scene 4: poster ----------
const ScenePoster: React.FC<{ t: number; start: number }> = ({ t, start }) => {
  const k = t - start;
  const walkDur = 3.2;
  const walking = k < walkDur;
  const x = interpolate(k, [0, walkDur], [-3.6, -0.7], clamp);
  const turn = interpolate(k, [walkDur, walkDur + 0.6], [Math.PI / 2, Math.PI], { easing: Easing.inOut(Easing.cubic), ...clamp });
  const pose = P({
    pos: [x, 0.95, -1.2],
    rotY: turn,
    walk: walking ? 1 : 0,
    phase: t * 7.2,
    headPitch: walking ? 0 : 0.12,
    eyeX: walking ? 0 : Math.sin(t * 2) * 0.8,
    eyeY: walking ? 0 : 0.3,
    blink: blinkAt(t),
  });
  const v = tw("volunteers");
  return (
    <>
      <Stage pos={[1.4 - k * 0.04, 1.5, 4.2 - k * 0.08]} look={[-0.2, 1.3, -1.4]}>
        <RoomShell />
        <Box p={[0.7, 1.55, -2.3]} s={[1.3, 1.7, 0.04]} color={CYAN} fill="#10153f" />
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0.7, 2.1 - i * 0.28, -2.26]}>
            <boxGeometry args={[0.9 - (i === 3 ? 0.4 : 0), 0.06, 0.01]} />
            <meshBasicMaterial color={i === 0 ? RED : "#8fa2ff"} />
          </mesh>
        ))}
        <mesh position={[0.7, 2.45, -2.25]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshBasicMaterial color={RED} />
        </mesh>
        <Person p={pose} />
      </Stage>
      <Tag t={t} from={v} to={v + 3} x={640} y={110} color={RED} size={40}>
        VOLUNTEERS NEEDED
      </Tag>
      <Tag t={t} from={tw("memory", iThen)} to={tw("memory", iThen) + 2.5} x={640} y={110} color={BLUE} size={40}>
        MEMORY STUDY
      </Tag>
      <Tag t={t} from={tw("three", iThen)} to={tw("three", iThen) + 3.5} x={640} y={110} color={YEL} size={40}>
        3 NIGHTS · $50
      </Tag>
    </>
  );
};

// ---------- scenes 5 & 6: lab ----------
const Sine: React.FC<{ t: number; w: number; h: number; color: string }> = ({ t, w, h, color }) => {
  const geo = new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 40 }).map((_, i) => new THREE.Vector3(-w / 2 + (i / 39) * w, Math.sin(i * 0.55 - t * 6) * h, 0)),
  );
  return <primitive object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color }))} />;
};

const Lab: React.FC<{ t: number; night: number; showHall: boolean; redOn: boolean; shake: boolean; showDoc: boolean }> = ({
  t,
  night,
  showHall,
  redOn,
  shake,
  showDoc,
}) => {
  const lean = -(Math.PI / 2);
  const patient = P({
    pos: [1.3, 0.74, -0.8],
    rotY: Math.PI / 2,
    flat: 1,
    lean,
    headPitch: lean * 0.9 + 0.2,
    blink: night >= 0 ? 1 : blinkAt(t),
    eyeY: 0.5,
  });
  const doc = P({ pos: [0.2, 0.95, 0.8], rotY: Math.PI, headYaw: Math.sin(t * 1.2) * 0.25, blink: blinkAt(t + 1) });
  const hall = P({ pos: [3.5, 0.95, -0.2], rotY: -Math.PI / 2, blink: blinkAt(t + 2) });
  const jx = shake ? Math.sin(t * 70) * 0.012 : 0;
  const pulse = 0.5 + 0.5 * Math.sin(t * 8);
  return (
    <group>
      <RoomShell />
      {/* cot */}
      <Box p={[0.9, 0.56, -0.8]} s={[2.5, 0.1, 0.9]} color={CYAN} />
      {[-1, 1].flatMap((a) => [-1, 1].map((b) => (
        <mesh key={`${a}${b}`} position={[0.9 + a * 1.1, 0.25, -0.8 + b * 0.35]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 6]} />
          <meshBasicMaterial color={CYAN} wireframe />
        </mesh>
      )))}
      <Person p={patient} />
      {/* machine */}
      <group position={[-1.6 + jx, 0, -1.6]}>
        <Box p={[0, 0.95, 0]} s={[0.7, 1.9, 0.6]} color={BLUE} fill="#0b0a30" />
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 0.5 + i * 0.28, 0.31]}>
            <boxGeometry args={[0.4, 0.06, 0.01]} />
            <meshBasicMaterial color={i === 3 && redOn ? RED : CYAN} />
          </mesh>
        ))}
        <mesh position={[0.1, 2.0, 0.4]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshBasicMaterial color={redOn ? (pulse > 0.5 ? RED : "#550000") : "#144"} />
        </mesh>
        <mesh position={[0.9, 1.95, 0.2]} rotation={[0, 0, 0.12]}>
          <cylinderGeometry args={[0.035, 0.035, 1.9, 6]} />
          <meshBasicMaterial color={CYAN} wireframe />
        </mesh>
      </group>
      <mesh position={[0.3, 1.45, -0.8]}>
        <sphereGeometry args={[0.22, 12, 10]} />
        <meshBasicMaterial color={redOn ? RED : CYAN} wireframe />
      </mesh>
      {/* monitor */}
      <Box p={[-0.5, 1.9, -2.3]} s={[1.0, 0.6, 0.05]} color={CYAN} fill="#04122a" />
      <group position={[-0.5, 1.9, -2.26]}>
        <Sine t={t} w={0.8} h={redOn ? 0.18 : 0.09} color={redOn ? RED : "#57ffb0"} />
      </group>
      {/* window + moon */}
      <Box p={[2.6, 1.9, -2.36]} s={[1.3, 1.5, 0.05]} color={BLUE} fill="#050320" />
      <mesh position={[2.6, 1.55 + night * 0.28, -2.3]}>
        <sphereGeometry args={[0.26, 14, 10]} />
        <meshBasicMaterial color="#cfe8ff" wireframe />
      </mesh>
      {showDoc ? (
        <ColorCtx.Provider value={CYAN}>
          <Person p={doc} />
        </ColorCtx.Provider>
      ) : null}
      {showHall ? (
        <>
          <lineSegments position={[3.9, 1.05, -0.2]} geometry={edges(0.1, 2.1, 1.0)}>
            <lineBasicMaterial color={VIOLET} />
          </lineSegments>
          <ColorCtx.Provider value={VIOLET}>
            <Person p={hall} />
          </ColorCtx.Provider>
        </>
      ) : null}
    </group>
  );
};

const SceneLab: React.FC<{ t: number; start: number; end: number }> = ({ t, start, end }) => {
  const k = (t - start) / (end - start);
  return (
    <>
      <Stage pos={[2.4 + Math.sin(k * 2) * 0.5, 1.9 - k * 0.2, 3.9 - k * 0.5]} look={[0.2, 0.9, -0.8]}>
        <Lab t={t} night={-1} showHall={false} redOn={false} shake={false} showDoc />
      </Stage>
      <Tag t={t} from={tw("lee", iRes)} to={tw("lee", iRes) + 2.6} x={640} y={110} color={CYAN}>
        DR. LEE
      </Tag>
      <Tag t={t} from={tw("machine", iRes)} to={tw("machine", iRes) + 2.8} x={640} y={110} color={BLUE}>
        THE MACHINE
      </Tag>
      <Tag t={t} from={tw("clear", iRes)} to={tw("clear", iRes) + 3.2} x={640} y={110} color={PINK}>
        CLEARS OLD MEMORIES
      </Tag>
      <Tag t={t} from={tw("small", iRes)} to={tw("small", iRes) + 3} x={640} y={110} color={YEL}>
        SMALL PRINT? SKIPPED.
      </Tag>
    </>
  );
};

const SceneNights: React.FC<{ t: number; start: number; end: number }> = ({ t, start, end }) => {
  const n1 = iNight;
  const n2 = idx("night", n1 + 1);
  const n3 = idx("night", n2 + 1);
  const night = t < tAt(n2) ? 0 : t < tAt(n3) ? 1 : 2;
  const click = tw("clicking", n3);
  const redOn = t >= tw("red", n3);
  const hall = tw("somebody", n3);
  const k = (t - start) / (end - start);
  const jump = t > click ? 0.3 : 0;
  return (
    <>
      <Stage pos={[2.2 + Math.sin(k * 3) * 0.4 - jump, 1.8, 3.8 - k * 0.3]} look={[0.9, 0.9, -0.8]}>
        <Lab t={t} night={night} showHall={t >= hall} redOn={redOn} shake={t > click && t < click + 1.6} showDoc={false} />
      </Stage>
      {[n1, n2, n3].map((n, i) => (
        <Tag key={i} t={t} from={tAt(n)} to={tAt(n) + 2.6} x={640} y={100} color={i === 2 ? RED : BLUE} size={44}>
          NIGHT {i + 1}
        </Tag>
      ))}
      <Tag t={t} from={tw("nothing", n1)} to={tw("nothing", n1) + 1.6} x={640} y={175} color={VIOLET}>
        NOTHING HAPPENS
      </Tag>
      <Tag t={t} from={tw("nothing", n2)} to={tw("nothing", n2) + 1.6} x={640} y={175} color={VIOLET}>
        NOTHING HAPPENS
      </Tag>
      <Tag t={t} from={click} to={click + 2.2} x={640} y={175} color={YEL}>
        CLICK · CLICK · CLICK
      </Tag>
      <Tag t={t} from={tw("red", n3)} to={tw("red", n3) + 2.2} x={640} y={175} color={RED}>
        RED LIGHT
      </Tag>
      <Tag t={t} from={tw("supposed", n3)} to={tw("supposed", n3) + 3} x={640} y={175} color={RED}>
        &quot;NOT SUPPOSED TO HAPPEN&quot;
      </Tag>
    </>
  );
};

// ---------- scene 7: walk home ----------
const SceneHome: React.FC<{ t: number; start: number; end: number }> = ({ t, start, end }) => {
  const k = (t - start) / (end - start);
  const x = interpolate(k, [0, 1], [0, 15]);
  const pose = P({ pos: [x, 0.95, 0], rotY: Math.PI / 2, walk: 1, phase: t * 7.2, blink: blinkAt(t) });
  const del = tw("deleting");
  const prog = interpolate(t, [del - 0.2, end - 0.4], [0, 1], clamp);
  const fade = interpolate(t, [end - 0.7, end - 0.05], [0, 1], clamp);
  return (
    <>
      <Stage pos={[x + 1.0, 1.5, 4.4]} look={[x + 0.4, 1.4, 0]}>
        <City />
        <Person p={pose} />
        <Dots r={0.34} n={70} progress={prog} color={CYAN} center={[x, 2.45, 0]} spin={t} />
      </Stage>
      <Tag t={t} from={tw("$50", iNext)} to={tw("$50", iNext) + 2.4} x={640} y={110} color={YEL}>
        $50 · EASY MONEY
      </Tag>
      <Tag t={t} from={tw("normal", iNext)} to={tw("normal", iNext) + 2.4} x={640} y={110} color={BLUE}>
        A NORMAL DAY…
      </Tag>
      <Tag t={t} from={del} to={del + 2.4} x={640} y={110} color={RED} size={36}>
        DELETING MEMORIES…
      </Tag>
      <Tag t={t} from={tw("stopping", iNext)} to={end} x={640} y={110} color={RED} size={36}>
        IT WON’T STOP AT THE USELESS ONES
      </Tag>
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: fade }} />
    </>
  );
};

// ---------- composition ----------
const SceneWrap: React.FC<{ from: number; to: number; render: (t: number, s: number, e: number) => React.ReactNode }> = ({ from, to, render }) => {
  const f = useCurrentFrame();
  const t = from + f / ST_FPS;
  const o = interpolate(f, [0, 6], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity: o }}>{render(t, from, to)}</AbsoluteFill>;
};

export const Story3D: React.FC = () => {
  const frames = SCENE_T.map((s) => Math.round(s * ST_FPS));
  const S = (i: number) => SCENE_T[i];
  const defs: ((t: number, s: number, e: number) => React.ReactNode)[] = [
    (t) => <SceneHook t={t} />,
    (t, s, e) => <SceneBike t={t} start={s} dur={e - s} />,
    (t, s) => <SceneWorry t={t} start={s} />,
    (t, s) => <ScenePoster t={t} start={s} />,
    (t, s, e) => <SceneLab t={t} start={s} end={e} />,
    (t, s, e) => <SceneNights t={t} start={s} end={e} />,
    (t, s, e) => <SceneHome t={t} start={s} end={e} />,
  ];
  return (
    <AbsoluteFill style={{ background: "#070520" }}>
      <Audio src={staticFile("audio/story.mp3")} />
      {defs.map((render, i) => (
        <Sequence key={i} from={frames[i]} durationInFrames={Math.max(1, frames[i + 1] - frames[i])} premountFor={ST_FPS}>
          <SceneWrap from={frames[i] / ST_FPS} to={S(i + 1)} render={render} />
        </Sequence>
      ))}
      <Captions />
    </AbsoluteFill>
  );
};
