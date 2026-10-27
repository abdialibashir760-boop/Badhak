import { createContext, useContext } from "react";
import { LINES as EN_LINES, Line } from "./timeline";

/** Start/end lookups for one language's narration timeline. */
export const makeTL = (lines: Line[]) => ({
  lines,
  S: (id: string): number => {
    const l = lines.find((x) => x.id === id);
    if (!l) throw new Error(`unknown line ${id}`);
    return l.start;
  },
  E: (id: string): number => lines.find((x) => x.id === id)!.end,
});
export type TL = ReturnType<typeof makeTL>;

export const TLContext = createContext<TL>(makeTL(EN_LINES));
export const useTL = () => useContext(TLContext);
