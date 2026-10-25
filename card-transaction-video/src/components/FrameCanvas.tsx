import { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export type DrawFn = (ctx: CanvasRenderingContext2D, frame: number, width: number, height: number) => void;

/** Full-frame canvas that is cleared and redrawn from the current frame number. */
export const FrameCanvas: React.FC<{ draw: DrawFn; style?: React.CSSProperties }> = ({ draw, style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, width, height);
    draw(ctx, frame, width, height);
  }, [draw, frame, width, height]);

  return <canvas ref={ref} width={width} height={height} style={{ position: "absolute", left: 0, top: 0, ...style }} />;
};
