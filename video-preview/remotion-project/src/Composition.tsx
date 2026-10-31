import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Captions, Chip, TagLabel, TitleCard } from "./Overlays";
import { SceneVisual } from "./Visuals";
import { FPS, HAS_AUDIO, SCENES } from "./script";

export const CaseFile: React.FC = () => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1220" }}>
      {HAS_AUDIO ? <Audio src={staticFile("audio/vo.mp3")} /> : null}
      {SCENES.map((scene, i) => {
        const frames = Math.round(scene.seconds * FPS);
        const from = cursor;
        cursor += frames;
        return (
          <Sequence key={i} from={from} durationInFrames={frames} premountFor={FPS}>
            <AbsoluteFill>
              <SceneVisual scene={scene} />
              {scene.side === "title" ? <TitleCard /> : null}
              <Chip side={scene.side} clock={scene.clock} />
              {(scene.tags ?? []).map((t) => (
                <TagLabel key={t.text} tag={t} sceneFrames={frames} />
              ))}
              <Captions scene={scene} sceneFrames={frames} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
