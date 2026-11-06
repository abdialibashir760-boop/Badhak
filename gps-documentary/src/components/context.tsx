import { createContext, useContext } from "react";

export type ShotInfo = { id: string; t: number; dur: number; p: number; frame: number };
export const ShotCtx = createContext<ShotInfo>({ id: "x", t: 0, dur: 1, p: 0, frame: 0 });
export const useShot = () => useContext(ShotCtx);
