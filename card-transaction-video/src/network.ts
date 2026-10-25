import { colors } from "./theme";

export const NODE_W = 600;
export const NODE_H = 270;

export interface NodeDef {
  index: number;
  id: "merchant" | "acquirer" | "network" | "issuer";
  name: string;
  subtitle: string;
  color: string;
  x: number;
  y: number;
  /** What this party does on the way to the issuer. */
  items: string[];
  /** What it does when the answer comes back. */
  replyItems: string[];
  /** Illustrative processing time on the request leg / reply leg (ms). */
  ms: number;
  replyMs: number;
}

// Clockwise from the top-left corner.
export const NODES: NodeDef[] = [
  {
    index: 0,
    id: "merchant",
    name: "Merchant",
    subtitle: "Store + payment terminal",
    color: colors.merchant,
    x: 150,
    y: 90,
    items: ["Reads a secure card token", "Builds the ISO 8583 message", "Encrypts and signs the packet"],
    replyItems: ["Receives the response code", "Shows ✓ Approved on screen", "Prints or sends the receipt"],
    ms: 42,
    replyMs: 96,
  },
  {
    index: 1,
    id: "acquirer",
    name: "Acquiring Bank",
    subtitle: "The merchant's bank",
    color: colors.acquirer,
    x: 1170,
    y: 90,
    items: ["Validates the merchant account", "Runs merchant-side fraud rules", "Reads the BIN to pick the network"],
    replyItems: ["Matches reply to the request", "Attaches the approval code", "Relays it to the terminal"],
    ms: 84,
    replyMs: 57,
  },
  {
    index: 2,
    id: "network",
    name: "Card Network",
    subtitle: "Links every bank",
    color: colors.network,
    x: 1170,
    y: 640,
    items: ["Finds the issuing bank", "Applies network rules and scoring", "Forwards the request"],
    replyItems: ["Receives the issuer's decision", "Records it for settlement", "Relays it to the acquirer"],
    ms: 61,
    replyMs: 38,
  },
  {
    index: 3,
    id: "issuer",
    name: "Issuing Bank",
    subtitle: "Your bank",
    color: colors.issuer,
    x: 150,
    y: 640,
    items: ["Card active and not reported stolen?", "Enough balance or credit limit?", "Does this look like you? (fraud model)"],
    replyItems: ["Code 00 sent: approved", "A hold is placed on your funds", "Decision logged for settlement"],
    ms: 213,
    replyMs: 213,
  },
];

export const nodeCenter = (n: NodeDef) => ({ x: n.x + NODE_W / 2, y: n.y + NODE_H / 2 });

export interface Pt {
  x: number;
  y: number;
}

export interface LineDef {
  id: string;
  from: Pt;
  to: Pt;
  fromColor: string;
  toColor: string;
}

// The four cables of the loop (card edge to card edge).
export const LINES: LineDef[] = [
  { id: "m-a", from: { x: 750, y: 225 }, to: { x: 1170, y: 225 }, fromColor: colors.merchant, toColor: colors.acquirer },
  { id: "a-n", from: { x: 1470, y: 360 }, to: { x: 1470, y: 640 }, fromColor: colors.acquirer, toColor: colors.network },
  { id: "n-i", from: { x: 1170, y: 775 }, to: { x: 750, y: 775 }, fromColor: colors.network, toColor: colors.issuer },
  { id: "i-m", from: { x: 450, y: 640 }, to: { x: 450, y: 360 }, fromColor: colors.issuer, toColor: colors.merchant },
];

/** The packet visits Merchant, Acquirer, Network, Issuer and then goes back the same way. */
export const VISIT_NODES = [0, 1, 2, 3, 2, 1, 0] as const;

// Where the packet enters and leaves each of the 7 visits.
export const ARRIVE: Pt[] = [
  { x: 750, y: 225 },
  { x: 1170, y: 225 },
  { x: 1470, y: 640 },
  { x: 750, y: 775 },
  { x: 1170, y: 775 },
  { x: 1470, y: 360 },
  { x: 750, y: 225 },
];
export const DEPART: Pt[] = [
  { x: 750, y: 225 },
  { x: 1470, y: 360 },
  { x: 1170, y: 775 },
  { x: 750, y: 775 },
  { x: 1470, y: 640 },
  { x: 1170, y: 225 },
  { x: 750, y: 225 },
];
/** Which cable each of the 6 hops uses (index into LINES). */
export const HOP_LINE = [0, 1, 2, 2, 1, 0] as const;
