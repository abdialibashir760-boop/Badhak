import { LINES } from "./timeline";

/** Start / end (seconds) of a narration line by id. */
export const S = (id: string): number => {
  const l = LINES.find((x) => x.id === id);
  if (!l) throw new Error(`unknown line ${id}`);
  return l.start;
};
export const E = (id: string): number => LINES.find((x) => x.id === id)!.end;
