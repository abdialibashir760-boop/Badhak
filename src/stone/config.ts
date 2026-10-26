import {DEFAULT_SETTINGS} from '../config/defaults';
import type {SceneConfig, VideoProps} from '../config/types';
import type {Lang} from './i18n';
import timingEn from './voice-timing.en.json';
import timingTr from './voice-timing.tr.json';

/**
 * "What If You Woke Up in the Stone Age?" — storyboard timings (0–20, 20–45, 45–75, 75–110, 110–150, 150–185, 185–220 s)
 * and narration. Sentences from the brief are verbatim; the short extra lines are marked in NARRATION.md.
 * `[pause:1.5]` inserts 1.5 s of silence; *asterisks* emphasise a word in the subtitles.
 */
const BASE_EN: SceneConfig[] = [
  {
    id: 'wake',
    title: 'You Wake Up in the Wrong World',
    durationSec: 20,
    leadSec: 1,
    tailSec: 3.63,
    narration:
      'Imagine waking up one morning and discovering that your entire world has disappeared. No houses. No phones. No electricity. [pause:0.5] Just trees, wild animals, and a world where surviving until tomorrow is your *biggest achievement.*',
  },
  {
    id: 'wrong',
    title: 'Something Is Very Wrong',
    durationSec: 25,
    leadSec: 0.8,
    tailSec: 3.61,
    narration:
      'You are somewhere in prehistoric Europe, around 30,000 years ago. [pause:0.4] Modern civilization is thousands of years in the future. [pause:0.4] And unfortunately, nobody here has invented a *supermarket.* [pause:2.2] On the plus side: no traffic. On the minus side: no roads.',
  },
  {
    id: 'locals',
    title: 'Meeting the Locals',
    durationSec: 30,
    leadSec: 0.8,
    tailSec: 6.12,
    narration:
      "Eventually, you meet some of the locals. [pause:1] They have skills you don't. They know the landscape, recognize animal tracks, and understand how to make useful tools. [pause:1.2] You, meanwhile, have absolutely no idea how to ask where the nearest *restaurant* is. [pause:1.5] Saying it louder does not help.",
  },
  {
    id: 'food',
    title: 'The Problem With Food',
    durationSec: 35,
    leadSec: 0.8,
    tailSec: 8.7,
    narration:
      'Then your stomach starts complaining. [pause:0.6] You need food, but there are no shops, no packaged snacks, and no delivery apps. [pause:1.5] Finding food requires knowledge, cooperation, and skills you have never needed before. [pause:1.5] Archaeologists find evidence for hunted animals and gathered plants. What they have never found is a *fridge.*',
  },
  {
    id: 'wolf',
    title: 'Nature Does Not Care About You',
    durationSec: 40,
    leadSec: 1,
    tailSec: 8.77,
    narration:
      'And then you notice something watching you from the trees. [pause:3.5] Suddenly, you understand why knowing your environment matters. [pause:2.5] Out here, confidence is not a survival skill. Knowing when to *back away* is. [pause:2.5] Wolves were part of this landscape. Wild, wary, and not interested in being your friend.',
  },
  {
    id: 'learn',
    title: 'Learning to Survive',
    durationSec: 35,
    leadSec: 0.8,
    tailSec: 5.74,
    narration:
      'Slowly, you begin to understand something. [pause:0.8] Survival is not about being the strongest person in the forest. It is about learning, adapting, sharing knowledge, and cooperating with people who understand the world around them. [pause:1.5] Make fire. Shape stone. Build shelter. Share the work. [pause:1] We can only reconstruct how, from the tools and hearths they left behind.',
  },
  {
    id: 'night',
    title: 'Nightfall',
    durationSec: 35,
    leadSec: 2.5,
    tailSec: 8.04,
    narration:
      'By nightfall, you have made it through your first day. You have learned more about survival than you expected. [pause:0.8] Somewhere in the dark, someone is playing a bone flute. Instruments like that are known from Europe at least 35,000 years ago. [pause:0.8] But tomorrow brings another challenge. [pause:1.2] And the Stone Age has no emergency *hotline.*',
  },
];


const BASE_TR: SceneConfig[] = [
  {
    id: 'wake',
    title: 'Yanlış Dünyada Uyanıyorsun',
    durationSec: 20,
    leadSec: 1,
    tailSec: 3.5,
    narration:
      'Bir sabah uyanıp tüm dünyanın ortadan kaybolduğunu keşfettiğini hayal et. Ev yok. Telefon yok. Elektrik yok. [pause:0.5] Sadece ağaçlar, yabani hayvanlar ve yarına kadar hayatta kalmanın *en büyük başarın* olduğu bir dünya.',
  },
  {
    id: 'wrong',
    title: 'Bir Şeyler Çok Yanlış',
    durationSec: 25,
    leadSec: 0.8,
    tailSec: 1.5,
    narration:
      "Tarih öncesi Avrupa'dasın, yaklaşık 30 bin yıl önce. [pause:0.4] Modern uygarlık, binlerce yıl sonrasında. [pause:0.4] Ve ne yazık ki burada kimse henüz *süpermarketi* icat etmemiş. [pause:2.2] Artı tarafı: trafik yok. Eksi tarafı: yol da yok.",
  },
  {
    id: 'locals',
    title: 'Yerlilerle Tanışma',
    durationSec: 30,
    leadSec: 0.8,
    tailSec: 1.5,
    narration:
      'Sonunda bölgenin insanlarıyla tanışırsın. [pause:1] Senin sahip olmadığın becerileri var. Araziyi bilirler, hayvan izlerini tanırlar ve işe yarar aletler yapmayı bilirler. [pause:1.2] Sen ise en yakın *restoranın* nerede olduğunu nasıl soracağına dair hiçbir fikre sahip değilsin. [pause:1.5] Daha yüksek sesle söylemek de işe yaramaz.',
  },
  {
    id: 'food',
    title: 'Yemek Sorunu',
    durationSec: 35,
    leadSec: 0.8,
    tailSec: 1.2,
    narration:
      'Sonra karnın guruldamaya başlar. [pause:0.6] Yiyeceğe ihtiyacın var ama ne dükkân var, ne paketli atıştırmalık, ne de yemek siparişi uygulaması. [pause:1.5] Yiyecek bulmak; bilgi, iş birliği ve daha önce hiç ihtiyaç duymadığın becerileri gerektirir. [pause:1.5] Arkeologlar, avlanan hayvanlara ve toplanan bitkilere dair kanıtlar buluyor. Ama hiç bulamadıkları şey: bir *buzdolabı.*',
  },
  {
    id: 'wolf',
    title: 'Doğa Seni Umursamaz',
    durationSec: 40,
    leadSec: 1,
    tailSec: 1.5,
    narration:
      'Ve sonra ağaçların arasından seni izleyen bir şey fark edersin. [pause:3.5] Birden, çevreni tanımanın neden önemli olduğunu anlarsın. [pause:2.5] Burada özgüven bir hayatta kalma becerisi değildir. Ne zaman *geri çekileceğini* bilmek ise öyledir. [pause:2.5] Kurtlar bu manzaranın bir parçasıydı. Vahşi, temkinli ve senin arkadaşın olmakla hiç ilgilenmeyen.',
  },
  {
    id: 'learn',
    title: 'Hayatta Kalmayı Öğrenmek',
    durationSec: 35,
    leadSec: 0.8,
    tailSec: 1.5,
    narration:
      'Yavaş yavaş bir şeyi anlamaya başlarsın. [pause:0.8] Hayatta kalmak, ormandaki en güçlü kişi olmakla ilgili değildir. Öğrenmek, uyum sağlamak, bilgiyi paylaşmak ve çevresindeki dünyayı bilen insanlarla iş birliği yapmakla ilgilidir. [pause:1.5] Ateş yak. Taşı şekillendir. Barınak kur. İşi paylaş. [pause:1] Bunun nasıl yapıldığını ancak geride bıraktıkları aletlerden ve ocaklardan *yeniden kurgulayabiliriz.*',
  },
  {
    id: 'night',
    title: 'Akşam Çöküyor',
    durationSec: 35,
    leadSec: 2.5,
    tailSec: 3.5,
    narration:
      "Akşam olduğunda ilk gününü atlatmış olursun. Hayatta kalma konusunda beklediğinden çok daha fazlasını öğrenmişsindir. [pause:0.8] Karanlıkta bir yerlerde biri kemik *flüt* çalıyor. Bunun gibi çalgılar Avrupa'dan en az 35 bin yıl öncesine ait olarak biliniyor. [pause:0.8] Ama yarın yeni bir zorluk getirecek. [pause:1.2] Ve Taş Devri'nde acil yardım *hattı* yok.",
  },
];

/** Untimed scenes per language (the voice-over scripts read these). */
export const BASE_SCENES: Record<Lang, SceneConfig[]> = {en: BASE_EN, tr: BASE_TR};

type VoiceTiming = Record<string, {leadSec: number; tailSec: number; sentenceSec: Array<[number, number]>}>;

/** Per-scene lead/tail and measured sentence times, generated by `node scripts/make-stone-voice.mjs` from the recording. */
const TIMING: Record<Lang, VoiceTiming> = {en: timingEn as unknown as VoiceTiming, tr: timingTr as unknown as VoiceTiming};
export const stoneScenes = (lang: Lang): SceneConfig[] => BASE_SCENES[lang].map((s) => ({...s, ...TIMING[lang][s.id]}));
export const STONE_SCENES = stoneScenes('en');
export const STONE_SCENES_TR = stoneScenes('tr');

const stoneProps = (lang: Lang): VideoProps => ({
  scenes: stoneScenes(lang),
  settings: {...DEFAULT_SETTINGS, musicVolume: 0.5, sfxVolume: 0.7},
  narrationSrc: lang === 'en' ? 'stone/audio/voiceover.mp3' : 'stone/audio/voiceover-tr.mp3',
  narrationOffsetSec: 0,
  musicSrc: null,
});
export const STONE_PROPS = stoneProps('en');
export const STONE_PROPS_TR = stoneProps('tr');
