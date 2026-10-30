import { feature } from "topojson-client";
import { geoBounds } from "d3-geo";
import w110 from "world-atlas/countries-110m.json";
import w50 from "world-atlas/countries-50m.json";

export type Feat = { properties: { name: string }; geometry: unknown; type: "Feature" };

const mk = (t: any): Feat[] => (feature(t, t.objects.countries) as any).features;

const EXCLUDE = new Set([
  "China", "India", "Mongolia", "Greenland", "Canada", "United States of America", "Antarctica",
  "Fr. S. Antarctic Lands", "Indonesia", "Pakistan", "Afghanistan", "Nepal", "Bhutan", "Bangladesh",
  "Myanmar", "Thailand", "Laos", "Vietnam", "Cambodia", "Malaysia", "Philippines", "Japan",
  "N. Korea", "S. Korea", "Taiwan", "Brazil", "Argentina", "Chile", "Peru", "Colombia", "Venezuela",
  "Mexico", "Australia", "New Zealand", "Papua New Guinea", "Solomon Is.", "Vanuatu", "Fiji", "Falkland Is.",
]);

const inRegion = (f: Feat): boolean => {
  if (EXCLUDE.has(f.properties.name)) return false;
  const [[w, s], [e, n]] = geoBounds(f as any);
  return e > -30 && w < 110 && n > 8 && s < 78 && !(w > e && f.properties.name !== "Russia" && f.properties.name !== "Fiji");
};

export const WORLD110: Feat[] = mk(w110).filter((f) => f.properties.name !== "Antarctica");
export const REG110: Feat[] = mk(w110).filter(inRegion);
export const REG50: Feat[] = mk(w50).filter(inRegion);

export const G = {
  axis: ["Germany", "Austria", "Czechia", "Slovakia", "Poland", "Hungary", "Romania", "Bulgaria", "Italy", "Greece", "Serbia", "Croatia", "Bosnia and Herz.", "Montenegro", "Slovenia", "Albania", "North Macedonia", "Kosovo", "Denmark", "Norway", "Netherlands", "Belgium", "Luxembourg", "France"],
  ussr: ["Russia", "Ukraine", "Belarus", "Moldova", "Estonia", "Latvia", "Lithuania", "Georgia", "Armenia", "Azerbaijan", "Kazakhstan", "Uzbekistan", "Turkmenistan", "Kyrgyzstan", "Tajikistan"],
  turkey: ["Turkey"],
  oil: ["Iraq", "Iran"],
  uk: ["United Kingdom"],
  balkansEast: ["Romania", "Bulgaria", "Hungary", "Poland", "Czechia", "Slovakia", "Serbia", "Croatia", "Bosnia and Herz.", "Montenegro", "North Macedonia", "Albania", "Greece"],
};
