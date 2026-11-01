import { useEffect, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { BackSide, DoubleSide, SRGBColorSpace, Texture, TextureLoader } from "three";

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const DURATION = 900; // 30 s

// Safe zones: top 15% and bottom 20% stay clear of captions/UI.
const SAFE_TOP = HEIGHT * 0.15;
const SAFE_BOTTOM = HEIGHT * 0.2;
const STAGGER = 4;

const CAPTIONS = [
  { from: 0, text: "It should have collapsed." },
  { from: 210, text: "You see..." },
  { from: 420, text: "Soft soil made it lean." },
  { from: 660, text: "The flaw that bent it, saved it." },
];

const Tower: React.FC = () => {
  const floors = Array.from({ length: 8 });
  return (
    <group rotation={[0, 0.5, 0.07]} position={[-1.6, 0, -4]}>
      {floors.map((_, i) => (
        <group key={i}>
          <mesh position={[0, 0.5 + i * 1.05, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.1 - i * 0.03, 1.15 - i * 0.03, 1, 12]} />
            <meshStandardMaterial color={i % 2 ? "#f3ead7" : "#e6d9bd"} flatShading />
          </mesh>
          <mesh position={[0, 0.5 + i * 1.05, 0]} scale={[1.07, 1.02, 1.07]}>
            <cylinderGeometry args={[1.1 - i * 0.03, 1.15 - i * 0.03, 1, 12]} />
            <meshBasicMaterial color="#000" side={BackSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const Cutout: React.FC<{ texture: Texture }> = ({ texture }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - STAGGER * 3, fps, config: { damping: 12, stiffness: 110 } });
  return (
    <group>
      <mesh position={[1.3, 2, 2.97]} scale={[pop * 1.06, pop * 1.03, 1]}>
        <planeGeometry args={[2, 4]} />
        <meshBasicMaterial map={texture} color="#000" transparent alphaTest={0.4} side={DoubleSide} />
      </mesh>
      <mesh position={[1.3, 2, 3]} scale={[pop, pop, 1]} castShadow>
        <planeGeometry args={[2, 4]} />
        <meshStandardMaterial map={texture} transparent alphaTest={0.4} side={DoubleSide} />
      </mesh>
    </group>
  );
};

const Scene: React.FC<{ texture: Texture }> = ({ texture }) => {
  const frame = useCurrentFrame();
  // Slow eased dolly forward over the whole clip.
  const z = interpolate(frame, [0, DURATION], [16, 8], { easing: Easing.inOut(Easing.cubic) });
  const y = interpolate(frame, [0, DURATION], [5, 3], { easing: Easing.inOut(Easing.cubic) });
  return (
    <>
      <color attach="background" args={["#ffd9a0"]} />
      <fog attach="fog" args={["#ffd9a0", 14, 30]} />
      <CameraRig z={z} y={y} />
      <ambientLight intensity={0.9} color="#3b5bb5" />
      <directionalLight position={[6, 9, 5]} intensity={2.6} color="#ffb766" castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#6fa356" flatShading />
      </mesh>
      <>
        <Tower />
        <Cutout texture={texture} />
        
        
      </>
    </>
  );
};


const CameraRig: React.FC<{ z: number; y: number }> = ({ z, y }) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(0, y, z);
  camera.lookAt(0, 2.2, 0);
  return null;
};

const Caption: React.FC<{ from: number; text: string }> = ({ from, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - from, fps, config: { damping: 15, stiffness: 120 } });
  const hide = interpolate(frame, [from + 180, from + 195], [1, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < from) return null;
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        fontWeight: 900,
        fontSize: 96,
        textAlign: "center",
        color: "#fff",
        WebkitTextStroke: "10px #111",
        paintOrder: "stroke fill",
        opacity: p * hide,
        transform: `translateY(${interpolate(p, [0, 1], [60, 0])}px)`,
        padding: "0 60px",
      }}
    >
      {text}
    </div>
  );
};

export const Main: React.FC = () => {
  const [texture, setTexture] = useState<Texture | null>(null);
  const [handle] = useState(() => delayRender("Loading cutout texture"));
  useEffect(() => {
    new TextureLoader().load(
      staticFile("cutout.png"),
      (t) => {
        t.colorSpace = SRGBColorSpace;
        setTexture(t);
        continueRender(handle);
      },
      undefined,
      () => cancelRender(new Error("Could not load cutout.png")),
    );
  }, [handle]);
  if (!texture) return null;
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffd9a0" }}>
      <ThreeCanvas width={WIDTH} height={HEIGHT} shadows camera={{ fov: 50, near: 0.1, far: 60 }}>
        <Scene texture={texture} />
      </ThreeCanvas>
      <AbsoluteFill
        style={{
          top: SAFE_TOP,
          height: HEIGHT - SAFE_TOP - SAFE_BOTTOM,
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {CAPTIONS.map((c) => (
          <Caption key={c.from} {...c} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
