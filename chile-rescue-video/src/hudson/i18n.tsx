import { createContext, useContext } from "react";
import type { Lang } from "../common/story";

export type Strings = {
  tag: string;
  runway: string;
  tooFar: string;
  river: string;
  lga: string;
  teterboro: string;
  captain: string;
  officer: string;
  route: string;
  date: string;
  aircraft: string;
  thrust: string;
  glider: string;
  checklist: string;
  brace: string;
  rafts: string;
  threeHalf: string;
  ferry: string;
  survivors: string;
  engines: string;
  delay: string;
  strike: string;
  turn: string;
  miracle: string;
  tragedy: string;
  skill: string;
  training: string;
  decisions: string;
  chipBoard: string;
  chipDate: string;
  chipTime: string;
  chipFerry: string;
  chipAll: string;
  endKicker: string;
  endTitleA: string;
  endTitleB: string;
  endSub: string;
  endCta: string;
};

export const STRINGS: Record<Lang, Strings> = {
  en: {
    tag: "FLIGHT 1549 · 2009",
    runway: "RUNWAY",
    tooFar: "TOO FAR",
    river: "HUDSON RIVER",
    lga: "LAGUARDIA",
    teterboro: "TETERBORO",
    captain: "CAPT. SULLENBERGER",
    officer: "F/O SKILES",
    route: "LAGUARDIA → CHARLOTTE",
    date: "JAN 15, 2009",
    aircraft: "AIRBUS A320",
    thrust: "THRUST",
    glider: "GLIDER",
    checklist: "ENGINE RESTART CHECKLIST",
    brace: "BRACE FOR IMPACT",
    rafts: "RAFTS",
    threeHalf: "3½ MIN",
    ferry: "FERRY",
    survivors: "155",
    engines: "BIRDS IN BOTH ENGINES",
    delay: "TIME TO REALIZE",
    strike: "BIRD STRIKE",
    turn: "TURN BACK",
    miracle: "MIRACLE",
    tragedy: "TRAGEDY",
    skill: "SKILL",
    training: "TRAINING",
    decisions: "QUICK DECISIONS",
    chipBoard: "155 PEOPLE ON BOARD",
    chipDate: "JANUARY 15, 2009",
    chipTime: "~3:31 P.M.",
    chipFerry: "FIRST FERRY: 3 MIN",
    chipAll: "ALL 155 SURVIVED",
    endKicker: "NEXT STORY",
    endTitleA: "THE THAI",
    endTitleB: "CAVE RESCUE",
    endSub: "13 TRAPPED · 18 DAYS",
    endCta: "FOLLOW",
  },
  tr: {
    tag: "UÇUŞ 1549 · 2009",
    runway: "PİST",
    tooFar: "ÇOK UZAK",
    river: "HUDSON NEHRİ",
    lga: "LAGUARDIA",
    teterboro: "TETERBORO",
    captain: "KPT. SULLENBERGER",
    officer: "YRD. PLT. SKILES",
    route: "LAGUARDIA → CHARLOTTE",
    date: "15 OCAK 2009",
    aircraft: "AIRBUS A320",
    thrust: "İTKİ",
    glider: "PLANÖR",
    checklist: "MOTOR YENİDEN ÇALIŞTIRMA LİSTESİ",
    brace: "ÇARPMAYA HAZIRLANIN",
    rafts: "BOTLAR",
    threeHalf: "3,5 DK",
    ferry: "FERİBOT",
    survivors: "155",
    engines: "İKİ MOTORDA DA KUŞ",
    delay: "FARK ETME SÜRESİ",
    strike: "KUŞ ÇARPMASI",
    turn: "GERİ DÖNÜŞ",
    miracle: "MUCİZE",
    tragedy: "FELAKET",
    skill: "BECERİ",
    training: "EĞİTİM",
    decisions: "HIZLI KARARLAR",
    chipBoard: "UÇAKTA 155 KİŞİ",
    chipDate: "15 OCAK 2009",
    chipTime: "~15.31",
    chipFerry: "İLK FERİBOT: 3 DK",
    chipAll: "155 KİŞİNİN HEPSİ SAĞ",
    endKicker: "SIRADAKİ HİKÂYE",
    endTitleA: "TAYLAND",
    endTitleB: "MAĞARA KURTARMASI",
    endSub: "13 KİŞİ MAHSUR · 18 GÜN",
    endCta: "TAKİP ET",
  },
};

export const LangContext = createContext<Strings>(STRINGS.en);
export const useL = () => useContext(LangContext);
