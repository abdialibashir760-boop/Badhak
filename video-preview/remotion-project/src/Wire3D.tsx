import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export const W3_FPS = 30;
export const W3_FRAMES = 300; // 10 s
export const W3_W = 1280;
export const W3_H = 720;

const ORANGE = "#ff7a2e";
const FILL = "#2a0c02";
const BLUE = "#3b3bff";
const PINK = "#ff4fb0";
const CYAN = "#4fe0ff";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
const seg = (t: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(t, [a, b], [from, to], { easing: ease, ...clamp });

// ---------------- pose timeline ----------------
export type Pose = {
  pos: [number, number, number];
  rotY: number;
  walk: number; // amplitude 0..1
  phase: number;
  sit: number; // 0..1
  flat?: number; // legs straight out (lying)
  lean: number; // torso rotation about x (negative = back)
  headYaw: number;
  headPitch: number;
  eyeX: number;
  eyeY: number;
  blink: number;
  bubbles: number;
};

const poseAt = (t: number): Pose => {
  // walking along x at z = 0.25, from -1.6 to 2.2
  const walkX = seg(t, 1.9, 5.0, -1.6, 2.2);
  const walking = t > 1.9 && t < 5.0 ? 1 : 0;
  const turn1 = seg(t, 1.4, 1.9, 0, Math.PI / 2); // face +x
  const turn2 = seg(t, 5.0, 5.6, Math.PI / 2, 0); // face +z (back to bed)
  const rotY = t < 5.0 ? turn1 : turn2;
  const sit = seg(t, 5.8, 6.8);
  const lie = seg(t, 7.0, 8.2);
  const rootY = interpolate(sit, [0, 1], [0.95, 0.46]) - lie * 0.06;
  const rootZ = interpolate(sit, [0, 1], [0.25, -0.42]);

  // blinks
  const blinkAt = [0.6, 3.3, 6.2, 8.6];
  let blink = 0;
  for (const b of blinkAt) blink = Math.max(blink, interpolate(Math.abs(t - b), [0, 0.07, 0.16], [1, 0.8, 0], clamp));

  // eye look: left, right, then forward; up at the end
  const eyeX =
    t < 1.4
      ? interpolate(t, [0.1, 0.35, 0.8, 1.0, 1.35], [0, -1, -1, 1, 0], clamp)
      : 0;
  const eyeY = seg(t, 8.0, 8.6, 0, 1);
  const headYaw = t < 1.4 ? interpolate(t, [0.1, 0.4, 0.8, 1.05, 1.35], [0, -0.5, -0.5, 0.5, 0], clamp) : 0;

  return {
    pos: [walkX, rootY, rootZ],
    rotY,
    walk: walking,
    phase: t * 7.2,
    sit,
    lean: -lie * (Math.PI / 2 - 0.1),
    headYaw,
    headPitch: seg(t, 8.0, 8.6, 0, -0.35),
    eyeX,
    eyeY,
    blink,
    bubbles: seg(t, 8.3, 9.2),
    flat: 0,
  };
};

// ---------------- building blocks ----------------
export const ColorCtx = React.createContext(ORANGE);
export const WireMat: React.FC<{ color?: string }> = ({ color }) => {
  const c = React.useContext(ColorCtx);
  return <meshBasicMaterial color={color ?? c} wireframe />;
};

const Limb: React.FC<{ len: number; r0: number; r1: number; color?: string }> = ({ len, r0, r1, color }) => (
  <group position={[0, -len / 2, 0]}>
    <mesh>
      <cylinderGeometry args={[r0, r1, len, 8, 4]} />
      <meshBasicMaterial color={FILL} />
    </mesh>
    <mesh scale={1.015}>
      <cylinderGeometry args={[r0, r1, len, 8, 4]} />
      <WireMat color={color} />
    </mesh>
  </group>
);

export const Ball: React.FC<{ r: number; seg?: number; color?: string }> = ({ r, seg = 14, color }) => (
  <group>
    <mesh>
      <sphereGeometry args={[r, seg, seg - 4]} />
      <meshBasicMaterial color={FILL} />
    </mesh>
    <mesh scale={1.02}>
      <sphereGeometry args={[r, seg, seg - 4]} />
      <WireMat color={color} />
    </mesh>
  </group>
);

export const Person: React.FC<{ p: Pose }> = ({ p }) => {
  const swing = Math.sin(p.phase) * 0.65 * p.walk;
  const swing2 = Math.sin(p.phase + Math.PI) * 0.65 * p.walk;
  const sitA = (Math.PI / 2) * p.sit;
  const kneeL = Math.max(0, -Math.sin(p.phase)) * 0.9 * p.walk + sitA;
  const kneeR = Math.max(0, Math.sin(p.phase)) * 0.9 * p.walk + sitA;
  const bounce = Math.abs(Math.cos(p.phase)) * 0.03 * p.walk;
  return (
    <group position={[p.pos[0], p.pos[1] + bounce, p.pos[2]]} rotation={[0, p.rotY, 0]}>
      {/* pelvis */}
      <Ball r={0.17} />
      {/* legs */}
      {[
        { x: -0.1, sw: swing, kn: kneeL },
        { x: 0.1, sw: swing2, kn: kneeR },
      ].map((l, i) => (
        <group key={i} position={[l.x, -0.05, 0]} rotation={[-sitA - (p.flat ?? 0) * (Math.PI / 2) + l.sw, 0, 0]}>
          <Limb len={0.45} r0={0.075} r1={0.06} />
          <group position={[0, -0.45, 0]} rotation={[l.kn, 0, 0]}>
            <Limb len={0.45} r0={0.06} r1={0.045} />
            <group position={[0, -0.45, 0.05]}>
              <mesh position={[0, 0.0, 0.03]}>
                <boxGeometry args={[0.09, 0.05, 0.2]} />
                <WireMat />
              </mesh>
            </group>
          </group>
        </group>
      ))}
      {/* spine / torso */}
      <group position={[0, 0.05, 0]} rotation={[p.lean, 0, 0]}>
        <group position={[0, 0.28, 0]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.15, 0.55, 10, 5]} />
            <meshBasicMaterial color={FILL} />
          </mesh>
          <mesh scale={1.015}>
            <cylinderGeometry args={[0.2, 0.15, 0.55, 10, 5]} />
            <WireMat />
          </mesh>
        </group>
        {/* arms */}
        {[
          { x: -0.27, sw: swing2 * 0.8 },
          { x: 0.27, sw: swing * 0.8 },
        ].map((a, i) => (
          <group key={i} position={[a.x, 0.52, 0]} rotation={[a.sw - 0.05 * p.sit, 0, a.x > 0 ? -0.08 : 0.08]}>
            <Ball r={0.06} />
            <Limb len={0.32} r0={0.05} r1={0.04} />
            <group position={[0, -0.32, 0]} rotation={[-0.2 - Math.max(0, a.sw) * 0.6, 0, 0]}>
              <Limb len={0.3} r0={0.04} r1={0.032} />
            </group>
          </group>
        ))}
        {/* neck + head */}
        <group position={[0, 0.58, 0]}>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 0.1, 8]} />
            <WireMat />
          </mesh>
          <group position={[0, 0.2, 0]} rotation={[p.headPitch - p.lean * 0.9, p.headYaw, 0]}>
            <Ball r={0.15} seg={18} />
            {[-1, 1].map((side) => (
              <group key={side} position={[side * 0.06, 0.02, 0.125]}>
                <mesh scale={[1, Math.max(0.06, 1 - p.blink), 1]}>
                  <sphereGeometry args={[0.033, 12, 10]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh
                  position={[p.eyeX * 0.012, p.eyeY * 0.012, 0.022]}
                  scale={[1, Math.max(0.06, 1 - p.blink), 1]}
                >
                  <sphereGeometry args={[0.016, 10, 8]} />
                  <meshBasicMaterial color="#05031a" />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
};

const Room: React.FC = () => {
  const edges = (w: number, h: number, d: number) => new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
  return (
    <group>
      <gridHelper args={[16, 32, "#4a44ff", "#2a2599"]} />
      <group position={[0, 0, -2.4]} rotation={[Math.PI / 2, 0, 0]}>
        <gridHelper args={[16, 32, "#4a44ff", "#1d1a70"]} position={[0, 0, -3]} />
      </group>
      <group position={[-4.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <gridHelper args={[16, 32, "#4a44ff", "#1d1a70"]} position={[3, 0, 0]} />
      </group>
      {/* bed */}
      <group position={[2.2, 0.15, -1.2]}>
        <mesh>
          <boxGeometry args={[2.6, 0.3, 1.8]} />
          <meshBasicMaterial color="#0b0830" />
        </mesh>
        <lineSegments geometry={edges(2.6, 0.3, 1.8)}>
          <lineBasicMaterial color={CYAN} />
        </lineSegments>
        <mesh position={[-1.0, 0.2, -0.5]}>
          <boxGeometry args={[0.6, 0.12, 0.5]} />
          <meshBasicMaterial color={BLUE} wireframe />
        </mesh>
        <mesh position={[0, 0.8, -0.9]}>
          <boxGeometry args={[2.6, 1.0, 0.08]} />
          <meshBasicMaterial color={BLUE} wireframe />
        </mesh>
      </group>
      {/* nightstand + lamp */}
      <group position={[3.9, 0.3, -1.6]}>
        <lineSegments geometry={edges(0.5, 0.6, 0.5)}>
          <lineBasicMaterial color={PINK} />
        </lineSegments>
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
          <meshBasicMaterial color={PINK} wireframe />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <coneGeometry args={[0.22, 0.28, 10, 3, true]} />
          <meshBasicMaterial color={PINK} wireframe />
        </mesh>
      </group>
      {/* wardrobe */}
      <lineSegments position={[-2.8, 1.0, -2.1]} geometry={edges(1.2, 2.0, 0.5)}>
        <lineBasicMaterial color={BLUE} />
      </lineSegments>
    </group>
  );
};

const Bubbles: React.FC<{ a: number; t: number }> = ({ a, t }) => (
  <group>
    {[
      [2.0, 1.45, -1.2, 0.3, PINK],
      [2.55, 1.85, -1.2, 0.23, CYAN],
      [1.6, 1.95, -1.2, 0.17, ORANGE],
    ].map(([x, y, z, r, c], i) => (
      <mesh
        key={i}
        position={[x as number, (y as number) + Math.sin(t * 2 + i) * 0.06, z as number]}
        scale={a}
      >
        <icosahedronGeometry args={[r as number, 1]} />
        <meshBasicMaterial color={c as string} wireframe />
      </mesh>
    ))}
  </group>
);

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const k = seg(t, 0, 6.2);
  const k2 = seg(t, 6.2, 9.4);
  const pos = new THREE.Vector3(
    interpolate(k, [0, 1], [-0.8, 2.0]) + k2 * 1.3,
    interpolate(k, [0, 1], [1.7, 1.4]) + k2 * 0.8,
    interpolate(k, [0, 1], [5.4, 3.6]) - k2 * 0.9,
  );
  const look = new THREE.Vector3(
    interpolate(k, [0, 1], [0.1, 2.2]),
    interpolate(k, [0, 1], [1.0, 0.7]) + k2 * 0.2,
    interpolate(k, [0, 1], [0, -0.4]) - k2 * 0.7,
  );
  camera.position.copy(pos);
  camera.lookAt(look);
  camera.updateProjectionMatrix();
  return null;
};

export const Wire3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / W3_FPS;
  const p = poseAt(t);
  return (
    <AbsoluteFill style={{ background: "#070520" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 42, position: [0, 1.6, 5], near: 0.1, far: 60 }}>
        <color attach="background" args={["#070520"]} />
        <CameraRig t={t} />
        <Room />
        <Person p={p} />
        <Bubbles a={p.bubbles} t={t} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
