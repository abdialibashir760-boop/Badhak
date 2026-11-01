// One place for all timing. When narration is added, re-measure the pauses
// between sentences and update `start`/`end` (seconds) per scene.
export const FPS = 30;

export type Scene = {
  id: string;
  start: number; // seconds
  end: number;
  tr: string; // Turkish narration, shown word by word
  en: string; // English translation
};

export const SCENES: Scene[] = [
  { id: "intro", start: 0, end: 3.6, tr: "Türkçede kelimeler, lego gibi birleşir.", en: "Turkish words snap together like Lego." },
  { id: "root", start: 3.6, end: 7.2, tr: "Önce kök var: ev.", en: "First, the root: ev = house." },
  { id: "plural", start: 7.2, end: 12.4, tr: "Birden fazla mı? Ekle: ler. Evler.", en: "More than one? Add -ler. Houses." },
  { id: "mine", start: 12.4, end: 17.6, tr: "Benim mi? Ekle: im. Evlerim.", en: "Mine? Add -im. My houses." },
  { id: "in", start: 17.6, end: 22.8, tr: "İçinde mi? Ekle: de. Evlerimde.", en: "Inside? Add -de. In my houses." },
  { id: "outro", start: 22.8, end: 26.4, tr: "Tek kelime, koca bir cümle!", en: "One word, a whole sentence!" },
];

export const TOTAL_FRAMES = Math.round(SCENES[SCENES.length - 1].end * FPS);
