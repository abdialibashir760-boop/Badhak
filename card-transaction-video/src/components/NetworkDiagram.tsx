import { FlowLines, type LineVisual } from "./FlowLines";
import { NetworkNode, type NodeVisual } from "./NetworkNode";
import { NODES } from "../network";

/** The 4-corner loop: cables underneath, glass cards on top, optional overlay (the packet). */
export const NetworkDiagram: React.FC<{
  nodes: NodeVisual[];
  lines: LineVisual[];
  opacity?: number;
  scale?: number;
  children?: React.ReactNode;
}> = ({ nodes, lines, opacity = 1, scale = 1, children }) => (
  <div style={{ position: "absolute", inset: 0, opacity, transform: `scale(${scale})`, transformOrigin: "960px 500px" }}>
    <FlowLines lines={lines} />
    {NODES.map((def) => (
      <NetworkNode key={def.id} def={def} visual={nodes[def.index]} />
    ))}
    {children}
  </div>
);
