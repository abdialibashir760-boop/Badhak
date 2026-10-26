import {createContext, useContext} from 'react';
import type {SceneTiming} from '../lib/timing';

export type Lang = 'en' | 'tr';
export const LangContext = createContext<Lang>('en');
export const useLang = () => useContext(LangContext);

/**
 * Keywords the choreography and sound design hang off. Each canonical key maps to the word (or word stem) that
 * is spoken at that moment in each language's narration; scenes never hard-code a language.
 */
export const KEYS: Record<Lang, Record<string, string>> = {
  en: {},
  tr: {
    houses: 'Ev', phones: 'Telefon', electricity: 'Elektrik', trees: 'ağaçlar', biggest: 'başarın',
    Modern: 'Modern', thousands: 'binlerce', supermarket: 'süpermarket', plus: 'Artı',
    skills: 'becerileri', landscape: 'Arazi', tracks: 'izlerini', tools: 'aletler', restaurant: 'restoran', louder: 'yüksek',
    stomach: 'karnın', shops: 'dükkân', snacks: 'atıştırmalık', apps: 'uygulaması', Finding: 'Yiyecek', Archaeologists: 'Arkeologlar', never: 'hiç', fridge: 'buzdolabı',
    notice: 'ağaçların', watching: 'izleyen', Suddenly: 'Birden', Out: 'Burada', back: 'geri', Wolves: 'Kurtlar',
    Make: 'Ateş', Shape: 'Taşı', Build: 'Barınak', Share: 'İşi', reconstruct: 'yeniden',
    flute: 'flüt', tomorrow: 'yarın', hotline: 'hattı',
  },
};

/** `K.at('supermarket', fallbackP)` = frame at which that word is spoken, in whichever language is playing. */
export const keysFor = (lang: Lang, tm: SceneTiming) => {
  const k = (key: string) => KEYS[lang][key] ?? key;
  return {at: (key: string, fallbackP: number, nth = 0) => tm.at(k(key), fallbackP, nth), find: (key: string, nth = 0) => tm.find(k(key), nth)};
};
export const useKeys = (tm: SceneTiming) => keysFor(useLang(), tm);

export const TEXT = {
  en: {
    title: ['WHAT', 'IF', 'YOU', 'WOKE', 'UP', 'IN', 'THE', 'STONE', 'AGE?'],
    titleAccent: [7, 8],
    titleSize: 108,
    titleY: 170,
    place: 'WESTERN EUROPE · c. 30,000 YEARS AGO',
    placeNote: 'LATE ICE AGE · SCENES ARE ARTISTIC RECONSTRUCTIONS',
    locals: 'MODERN HUMANS, LIKE YOU — JUST BETTER PREPARED',
    shout: 'RESTAURANT!!!',
    growl: 'GRRRROWL',
    odds: 'ODDS OF SURVIVING THE DAY',
    ending: ['COULD YOU SURVIVE', 'YOUR FIRST DAY?'],
  },
  tr: {
    title: ['TAŞ', 'DEVRİNDE', 'UYANSAYDIN', 'NE', 'OLURDU?'],
    titleAccent: [0, 1],
    titleSize: 92,
    titleY: 118,
    place: 'BATI AVRUPA · YAKLAŞIK 30.000 YIL ÖNCE',
    placeNote: 'SON BUZUL ÇAĞI · SAHNELER SANATSAL YENİDEN KURGULARDIR',
    locals: 'SENİN GİBİ MODERN İNSANLAR — SADECE ÇOK DAHA HAZIRLIKLI',
    shout: 'RESTORAN!!!',
    growl: 'GURRRR',
    odds: 'BUGÜNÜ ATLATMA İHTİMALİ',
    ending: ['İLK GÜNÜNÜ', 'ATLATABİLİR MİYDİN?'],
  },
} satisfies Record<Lang, unknown>;
export const useText = () => TEXT[useLang()];
