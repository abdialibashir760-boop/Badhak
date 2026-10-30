import React from "react";
import { Sc1, Sc2, Sc3 } from "./scenes1";
import { Sc4, Sc5, Sc5B, Sc6 } from "./scenes2";
import { Sc7, Sc8, Sc9, Sc9B } from "./scenes3";
import { Sc10, Sc10B, Sc11, Sc12, Sc13 } from "./scenes4";

export const SCENES: Record<string, React.FC> = {
  "1": Sc1, "2": Sc2, "3": Sc3, "4": Sc4, "5": Sc5, "5B": Sc5B, "6": Sc6, "7": Sc7, "8": Sc8, "9": Sc9, "9B": Sc9B,
  "10": Sc10, "10B": Sc10B, "11": Sc11, "12": Sc12, "13": Sc13,
};
