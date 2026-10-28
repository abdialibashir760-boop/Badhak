import { createContext, useContext } from "react";
import type { Lang } from "../common/story";

export type Strings = {
  tag: string;
  depth: string;
  water: string;
  mine: string;
  abandoned: string;
  crew1: string;
  crew2: string;
  county: string;
  escaped: string;
  trapped: string;
  map: string;
  air: string;
  within: string;
  bang: string;
  broke: string;
  inches24: string;
  cage22: string;
  alive: string;
  survived: string;
  recapFlood: string;
  recapHole: string;
  recapTaps: string;
  chipJul24: string;
  chipDepth: string;
  chipJul25: string;
  chipJul26: string;
  chipJul27: string;
  chipJul28: string;
  chipHours: string;
  endKicker: string;
  endTitleA: string;
  endTitleB: string;
  endSub: string;
  endCta: string;
};

export const STRINGS: Record<Lang, Strings> = {
  en: {
    tag: "QUECREEK MINE RESCUE · 2002",
    depth: "240 FT",
    water: "WATER",
    mine: "QUECREEK MINE",
    abandoned: "ABANDONED MINE",
    crew1: "CREW 1",
    crew2: "CREW 2",
    county: "SOMERSET COUNTY, PA",
    escaped: "9 ESCAPED",
    trapped: "9 TRAPPED",
    map: "MINE MAP",
    air: "AIR",
    within: "70 FT",
    bang: "BANG!",
    broke: "BIT BROKE",
    inches24: "24 IN",
    cage22: "22 IN CAGE",
    alive: "9 ALIVE",
    survived: "ALL 9 SURVIVED",
    recapFlood: "FLOODED MINE",
    recapHole: "NARROW HOLE",
    recapTaps: "9 TAPS",
    chipJul24: "JULY 24, 2002",
    chipDepth: "240 FT DOWN",
    chipJul25: "JULY 25",
    chipJul26: "JULY 26",
    chipJul27: "JULY 27",
    chipJul28: "JULY 28",
    chipHours: "~77 HOURS",
    endKicker: "NEXT STORY",
    endTitleA: "THE THAI",
    endTitleB: "CAVE RESCUE",
    endSub: "13 TRAPPED · 18 DAYS",
    endCta: "FOLLOW",
  },
  tr: {
    tag: "QUECREEK MADEN KURTARMA · 2002",
    depth: "73 M",
    water: "SU",
    mine: "QUECREEK MADENİ",
    abandoned: "TERK EDİLMİŞ MADEN",
    crew1: "EKİP 1",
    crew2: "EKİP 2",
    county: "SOMERSET İLÇESİ, PA",
    escaped: "9 KİŞİ ÇIKTI",
    trapped: "9 KİŞİ MAHSUR",
    map: "MADEN HARİTASI",
    air: "HAVA",
    within: "21 M",
    bang: "BAM!",
    broke: "UÇ KIRILDI",
    inches24: "61 CM",
    cage22: "56 CM KAFES",
    alive: "9 KİŞİ SAĞ",
    survived: "9'U DA SAĞ KURTULDU",
    recapFlood: "SU DOLU MADEN",
    recapHole: "DAR DELİK",
    recapTaps: "9 VURUŞ",
    chipJul24: "24 TEMMUZ 2002",
    chipDepth: "73 M AŞAĞIDA",
    chipJul25: "25 TEMMUZ",
    chipJul26: "26 TEMMUZ",
    chipJul27: "27 TEMMUZ",
    chipJul28: "28 TEMMUZ",
    chipHours: "~77 SAAT",
    endKicker: "SIRADAKİ HİKÂYE",
    endTitleA: "TAYLAND",
    endTitleB: "MAĞARA KURTARMASI",
    endSub: "13 KİŞİ MAHSUR · 18 GÜN",
    endCta: "TAKİP ET",
  },
};

export const LangContext = createContext<Strings>(STRINGS.en);
export const useL = () => useContext(LangContext);
