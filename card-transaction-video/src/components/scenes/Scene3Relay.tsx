import { AbsoluteFill, interpolate } from "remotion";
import { useCurrentFrame } from "remotion";
import { Captions, slices, type CaptionItem } from "../Captions";
import { Hub } from "../Hub";
import { NetworkDiagram } from "../NetworkDiagram";
import { type NodeVisual } from "../NetworkNode";
import { type LineVisual } from "../FlowLines";
import { NODES } from "../../network";
import { CYCLES, getLatestVisit, getLineBoost, getNodeRuntime, getPacket, getRoundTrip, PHASES } from "../../relay";
import { colors, font } from "../../theme";

// What to say during each of the 13 phases (7 stops + 6 hops) of the slow first run.
const RUN1: string[][] = [
  ["The terminal builds the ISO 8583 message: token, amount, merchant ID."],
  ["Off it goes to the acquirer, the merchant's bank."],
  ["The acquirer checks the merchant account and fraud rules.", "Then it reads the card's first digits (the BIN) to choose a network."],
  ["Forwarded to the card network."],
  ["The network finds the issuing bank and forwards the request."],
  ["On to the issuing bank: the cardholder's own bank."],
  ["Issuer check 1: is the card active, not reported stolen?", "Issuer check 2: is there enough balance or credit limit?", "Issuer check 3: does this purchase look like you?"],
  ["Decision made. Response code 00 means approved. Now the reply returns."],
  ["The network records the decision for settlement later."],
  ["The reply retraces the same route…"],
  ["The acquirer matches the reply to the original request."],
  ["…and heads back to the store."],
  ["The terminal shows ✓ Approved and prints a receipt."],
];

const RUN_FACTS: string[][] = [
  [],
  [
    "Same route, faster. Every hop is a real network link.",
    "ISO 8583 is the shared language banks and networks speak.",
    "Each message is a set of numbered fields: amount, currency, merchant, response…",
    "Response code 00 = approved. 05 = do not honor. 51 = insufficient funds.",
    "A decline travels the exact same route back.",
  ],
  ["Dozens of small checks happen at every stop.", "Most of them run in parallel, in milliseconds.", "The issuer's decision is usually the longest single step."],
  ["Watch the timers: each stop adds tens to hundreds of milliseconds.", "Network travel plus the issuer's checks make up most of the wait."],
  ["Almost real speed…"],
  ["This is real speed: about 2 seconds, start to finish."],
];

function buildCaptions(): CaptionItem[] {
  const out: CaptionItem[] = [
    { from: 0, to: 90, kicker: "The relay race", text: "Now let's follow one payment message, step by step.", color: colors.text },
  ];
  // run 1: synced to its phases
  PHASES.filter((p) => p.cycle === 0).forEach((p, i) => {
    const node = p.kind === "dwell" ? NODES[[0, 1, 2, 3, 2, 1, 0][p.index]] : undefined;
    out.push(...slices(p.t0, p.t1, RUN1[i], node ? node.name : "On the wire", node?.color ?? colors.text));
  });
  // later runs: facts spread over the whole run
  CYCLES.forEach((c, ci) => {
    if (ci === 0) return;
    out.push(...slices(c.start, c.start + c.dur, RUN_FACTS[ci], c.label, colors.text));
  });
  // short bridges between runs
  const bridges = ["Now the same trip, 3× faster.", "Faster again…", "Watch the timers shrink.", "Nearly real time…", "Now at real speed."];
  bridges.forEach((text, i) => {
    out.push({ from: CYCLES[i].start + CYCLES[i].dur, to: CYCLES[i + 1].start, text, kicker: "Speeding up", color: colors.text });
  });
  const last = CYCLES[CYCLES.length - 1];
  out.push({ from: last.start + last.dur, to: 3600, text: "Approved! But no money has actually moved yet…", kicker: "Hold on", color: colors.issuer });
  return out;
}

const captions = buildCaptions();

/** Scene 3: an ISO 8583 packet races around the loop and back while each node reacts. */
export const Scene3Relay: React.FC = () => {
  const frame = useCurrentFrame();
  const packet = getPacket(frame);
  const trip = getRoundTrip(frame);
  const latest = getLatestVisit(frame);

  const nodes: NodeVisual[] = NODES.map((n) => {
    const r = getNodeRuntime(frame, n.index);
    return { scale: 1, dropY: 0, opacity: 1, flash: r.flash, ms: r.ms, load: r.load, spotlight: 0 };
  });
  const lines: LineVisual[] = [0, 1, 2, 3].map((i) => ({ draw: 1, boost: getLineBoost(frame, i) }));

  const node = latest ? NODES[latest.visit.node] : null;
  const reply = latest?.visit.reply ?? false;
  const cycleLabel = trip.cycle >= 0 ? CYCLES[trip.cycle].label : "Authorization";
  const ms = Math.round(trip.ms).toLocaleString("en-US");

  return (
    <AbsoluteFill>
      <NetworkDiagram nodes={nodes} lines={lines}>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", left: 0, top: 0, fontFamily: font }}>
          <defs>
            <linearGradient id="pill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#22D3EE" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
            <filter id="pillGlow" x="-40%" y="-80%" width="180%" height="260%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
          </defs>
          {packet.trail.map((t, k) => (
            <circle key={k} cx={t.x} cy={t.y} r={20 - k * 2} fill="#67E8F9" opacity={(1 - k / 8) * 0.45} />
          ))}
          {packet.visible && (
            <g transform={`translate(${packet.x} ${packet.y}) scale(${packet.scale})`}>
              <rect x={-130} y={-30} width={260} height={60} rx={30} fill="#22D3EE" opacity={0.7} filter="url(#pillGlow)" />
              <rect x={-125} y={-27} width={250} height={54} rx={27} fill="url(#pill)" stroke="#FFFFFF" strokeWidth={2.5} />
              <text x={0} y={9} textAnchor="middle" fontSize={26} fontWeight={800} fill="#FFFFFF">
                ISO 8583 Packet
              </text>
              <text x={0} y={58} textAnchor="middle" fontSize={19} fontWeight={800} letterSpacing={2} fill="#A5F3FC">
                {packet.reply ? "MTI 0110 · RESPONSE" : "MTI 0100 · REQUEST"}
              </text>
            </g>
          )}
        </svg>
      </NetworkDiagram>

      <Hub
        label={cycleLabel.toUpperCase()}
        value={ms}
        sub="ms round trip · illustrative"
        color={node?.color ?? colors.text}
        checklistTitle={node ? `${node.name} ${reply ? "← reply" : "→ request"}` : undefined}
        items={node ? (reply ? node.replyItems : node.items) : undefined}
        progress={latest?.progress ?? 0}
        placeholder="The packet is about to leave the store…"
      />
      <Captions items={captions} />

      {/* real-time reminder pulsing in the corner while the run is slowed down */}
      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 30,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 2,
          color: colors.muted,
          opacity: interpolate(frame, [0, 60], [0, 0.9], { extrapolateRight: "clamp" }),
        }}
      >
        TIMINGS ARE ILLUSTRATIVE
      </div>
    </AbsoluteFill>
  );
};
