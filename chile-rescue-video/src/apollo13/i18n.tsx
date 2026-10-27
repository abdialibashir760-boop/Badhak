import React, { createContext, useContext } from "react";

export type Lang = "en" | "tr";

export type Strings = {
  tag: string;
  home: string;
  lateReplacement: string;
  commander: string;
  lmPilotA: string;
  cmPilotA: string;
  pilot: string;
  grounded: string;
  allSystems: string;
  oxygenTank2: string;
  fuelCells: string;
  power: string;
  oxygen: string;
  aquarius: string;
  odyssey: string;
  lifeboat: string;
  builtFor: string;
  men2: string;
  nowNeeded: string;
  men3: string;
  nearFreezing: string;
  water: string;
  moonGravity: string;
  farthest: string;
  co2: string;
  danger: string;
  full: string;
  lmFilter: string;
  cmFilter: string;
  groundTeam: string;
  bag: string;
  cardboard: string;
  hose: string;
  tape: string;
  signalLost: string;
  noTelemetry: string;
  restartPlan: string;
  plan: string[];
  simulator: string;
  panelMissing: string;
  radioBlackout: string;
  successful: string;
  failure: string;
  // top chips
  chipDist: string;
  chipApr11: string;
  chipApr13: string;
  chipApr17: string;
  chipAlive: string;
  // end card
  endKicker: string;
  endTitleA: string;
  endTitleB: string;
  endSub: string;
  endCta: string;
};

export const STRINGS: Record<Lang, Strings> = {
  en: {
    tag: "APOLLO 13 · 1970",
    home: "HOME",
    lateReplacement: "LATE REPLACEMENT",
    commander: "COMMANDER",
    lmPilotA: "LUNAR MODULE",
    cmPilotA: "COMMAND MODULE",
    pilot: "PILOT",
    grounded: "GROUNDED",
    allSystems: "ALL SYSTEMS NORMAL",
    oxygenTank2: "OXYGEN TANK 2",
    fuelCells: "FUEL CELLS",
    power: "POWER",
    oxygen: "OXYGEN",
    aquarius: "AQUARIUS · LUNAR MODULE",
    odyssey: "ODYSSEY · COMMAND MODULE",
    lifeboat: "LIFEBOAT",
    builtFor: "BUILT FOR",
    men2: "2 MEN · 2 DAYS",
    nowNeeded: "NOW NEEDED",
    men3: "3 MEN · 4 DAYS",
    nearFreezing: "NEAR FREEZING",
    water: "WATER",
    moonGravity: "MOON'S GRAVITY",
    farthest: "FARTHEST EVER",
    co2: "CARBON DIOXIDE (CO₂)",
    danger: "DANGER",
    full: "FULL",
    lmFilter: "LM FILTER · ROUND",
    cmFilter: "CM FILTER · SQUARE",
    groundTeam: "GROUND TEAM",
    bag: "BAG",
    cardboard: "CARDBOARD",
    hose: "HOSE",
    tape: "TAPE",
    signalLost: "SIGNAL LOST",
    noTelemetry: "NO TELEMETRY",
    restartPlan: "RESTART PLAN",
    plan: ["POWER UP SEQUENCE", "ORDER OF SWITCHES", "BATTERY BUDGET", "TIMING"],
    simulator: "SIMULATOR",
    panelMissing: "PANEL MISSING",
    radioBlackout: "RADIO BLACKOUT",
    successful: "SUCCESSFUL",
    failure: "FAILURE",
    chipDist: "~205,000 MILES FROM EARTH",
    chipApr11: "APRIL 11, 1970",
    chipApr13: "APRIL 13, 1970",
    chipApr17: "APRIL 17, 1970",
    chipAlive: "ALL 3 ALIVE",
    endKicker: "NEXT STORY",
    endTitleA: "THE THAI",
    endTitleB: "CAVE RESCUE",
    endSub: "13 TRAPPED · 18 DAYS",
    endCta: "FOLLOW",
  },
  tr: {
    tag: "APOLLO 13 · 1970",
    home: "EV",
    lateReplacement: "SON DAKİKA YEDEĞİ",
    commander: "KOMUTAN",
    lmPilotA: "AY MODÜLÜ",
    cmPilotA: "KOMUTA MODÜLÜ",
    pilot: "PİLOTU",
    grounded: "GÖREVDEN ALINDI",
    allSystems: "TÜM SİSTEMLER NORMAL",
    oxygenTank2: "OKSİJEN TANKI 2",
    fuelCells: "YAKIT HÜCRELERİ",
    power: "ENERJİ",
    oxygen: "OKSİJEN",
    aquarius: "AQUARIUS · AY MODÜLÜ",
    odyssey: "ODYSSEY · KOMUTA MODÜLÜ",
    lifeboat: "CAN SALI",
    builtFor: "TASARIM",
    men2: "2 KİŞİ · 2 GÜN",
    nowNeeded: "ŞİMDİ GEREKEN",
    men3: "3 KİŞİ · 4 GÜN",
    nearFreezing: "DONMA NOKTASINDA",
    water: "SU",
    moonGravity: "AY'IN ÇEKİMİ",
    farthest: "EN UZAK NOKTA",
    co2: "KARBONDİOKSİT (CO₂)",
    danger: "TEHLİKE",
    full: "DOLU",
    lmFilter: "AY MODÜLÜ FİLTRESİ · YUVARLAK",
    cmFilter: "KOMUTA MODÜLÜ FİLTRESİ · KARE",
    groundTeam: "YER EKİBİ",
    bag: "TORBA",
    cardboard: "KARTON",
    hose: "HORTUM",
    tape: "BANT",
    signalLost: "SİNYAL KAYBI",
    noTelemetry: "TELEMETRİ YOK",
    restartPlan: "YENİDEN BAŞLATMA PLANI",
    plan: ["AÇILIŞ SIRASI", "ANAHTAR SIRASI", "PİL BÜTÇESİ", "ZAMANLAMA"],
    simulator: "SİMÜLATÖR",
    panelMissing: "PANEL YOK",
    radioBlackout: "TELSİZ KESİNTİSİ",
    successful: "BAŞARILI",
    failure: "BAŞARISIZLIK",
    chipDist: "DÜNYA'DAN ~330.000 KM",
    chipApr11: "11 NİSAN 1970",
    chipApr13: "13 NİSAN 1970",
    chipApr17: "17 NİSAN 1970",
    chipAlive: "ÜÇÜ DE SAĞ",
    endKicker: "SIRADAKİ HİKÂYE",
    endTitleA: "TAYLAND",
    endTitleB: "MAĞARA KURTARMASI",
    endSub: "13 KİŞİ MAHSUR · 18 GÜN",
    endCta: "TAKİP ET",
  },
};

export const LangContext = createContext<Strings>(STRINGS.en);
export const useL = () => useContext(LangContext);
/** Inline text from the active language (usable inside components without hooks). */
export const Tx: React.FC<{ k: Exclude<keyof Strings, "plan"> }> = ({ k }) => <>{useL()[k]}</>;
