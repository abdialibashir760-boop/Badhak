import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions, type CaptionItem } from "../Captions";
import { Hub } from "../Hub";
import { NetworkDiagram } from "../NetworkDiagram";
import { type NodeVisual } from "../NetworkNode";
import { type LineVisual } from "../FlowLines";
import { NODES } from "../../network";
import { colors } from "../../theme";

const DROP_START = 30;
const DROP_EVERY = 45;
const SPOT_START = 330;
const SPOT_LEN = 420;

const ROLE: [string, string][] = [
  ["1 · The Merchant: where the card is tapped.", "The terminal packages your purchase into a payment message."],
  ["2 · The Acquiring Bank: the merchant's bank.", "It collects payments on the merchant's behalf and routes them onward."],
  ["3 · The Card Network: the switchboard between banks.", "It connects thousands of acquirers to thousands of issuers."],
  ["4 · The Issuing Bank: your bank.", "It holds your account, so it makes the final approve-or-decline call."],
];

const captions: CaptionItem[] = [
  { from: 0, to: 150, kicker: "The cast", text: "Every card payment involves four parties.", color: colors.text },
  { from: 150, to: 330, kicker: "The cast", text: "We'll meet them in the order your payment visits them.", color: colors.text },
  ...NODES.flatMap((n, i) => {
    const s = SPOT_START + i * SPOT_LEN;
    return [
      { from: s, to: s + 210, kicker: n.name, text: ROLE[i][0], color: n.color },
      { from: s + 210, to: s + SPOT_LEN, kicker: n.name, text: ROLE[i][1], color: n.color },
    ];
  }),
  { from: 2010, to: 2130, kicker: "The loop", text: "Four parties, connected in one loop.", color: colors.text },
  { from: 2130, to: 2250, kicker: "Up next", text: "Now let's send a payment message around it.", color: colors.text },
];

/** Scene 2: four glass cards drop in, cables light up, each party gets a spotlight. */
export const Scene2Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spotIndex = Math.floor((frame - SPOT_START) / SPOT_LEN);
  const spotActive = frame >= SPOT_START && spotIndex >= 0 && spotIndex < 4;
  const spotFrame = frame - SPOT_START - spotIndex * SPOT_LEN;
  const spotAmount = spotActive
    ? interpolate(spotFrame, [0, 24, SPOT_LEN - 24, SPOT_LEN], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const nodes: NodeVisual[] = NODES.map((n) => {
    const s = spring({ frame: frame - DROP_START - n.index * DROP_EVERY, fps, config: { mass: 0.5, damping: 10 } });
    const mine = spotActive && spotIndex === n.index ? spotAmount : 0;
    const dim = spotActive && spotIndex !== n.index ? spotAmount * 0.5 : 0;
    const busy = 0.18 + 0.12 * Math.sin(frame / 15 + n.index * 2);
    return {
      scale: 0.35 + 0.65 * s,
      dropY: -(1 - s) * 520,
      opacity: Math.min(1, s * 2.2) * (1 - dim),
      flash: 0,
      ms: 0,
      load: busy + mine * 0.7,
      spotlight: mine,
    };
  });

  // Each cable is drawn once the card at its far end has landed.
  const lineStart = [DROP_START + DROP_EVERY + 18, DROP_START + 2 * DROP_EVERY + 18, DROP_START + 3 * DROP_EVERY + 18, DROP_START + 3 * DROP_EVERY + 55];
  const lines: LineVisual[] = lineStart.map((s) => ({ draw: interpolate(frame, [s, s + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), boost: 0 }));

  const hubIn = interpolate(frame, [200, 240], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const node = spotActive ? NODES[spotIndex] : null;
  const progress = spotActive ? interpolate(spotFrame, [40, 330], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame / 18);

  return (
    <AbsoluteFill>
      <NetworkDiagram nodes={nodes} lines={lines} />
      <Hub
        opacity={hubIn}
        label={node ? "WHAT IT DOES" : "THE LOOP"}
        value={node ? node.name.split(" ")[0] : "4 parties"}
        sub={node ? node.subtitle : `1 loop · about 2 seconds`}
        color={node ? node.color : `rgb(${150 + pulse * 90}, ${190 + pulse * 40}, 255)`}
        checklistTitle={node ? `${node.name} →` : undefined}
        items={node ? node.items : undefined}
        placeholder="Each party's job lights up here as we meet them."
        progress={progress}
      />
      <Captions items={captions} />
    </AbsoluteFill>
  );
};
