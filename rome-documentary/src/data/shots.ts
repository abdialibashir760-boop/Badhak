// The shot list — pure data (no JSX) so Node tooling (timeline + audio mixer) and Remotion share one source of truth.
// Each shot is timed to the narration: it runs from the start of sentence `from` to the end of sentence `to`.
// Shots sharing the same from/to split that window by weight `w`.
export type ShotKind = 'map' | 'art' | 'card';
export type ShotDef = {
  scene: string; kind: ShotKind; from: string; to?: string; w?: number;
  cap?: [string, string];                 // lower-third: title, subtitle
  tr?: 'fade' | 'wipe' | 'iris' | 'flash'; // transition INTO this shot
  sfx?: string[];                          // ambience tags for the audio mixer
  cam?: [number, number, number, number, number, number]; // art camera: zoom0, zoom1, x0, x1, y0, y1 (px)
  note: string;                            // storyboard description
};
const A = (scene: string, from: string, w: number, note: string, o: Partial<ShotDef> = {}): ShotDef => ({ scene, kind: 'art', from, w, note, ...o });
const M = (scene: string, from: string, w: number, note: string, o: Partial<ShotDef> = {}): ShotDef => ({ scene, kind: 'map', from, w, note, ...o });
const C = (scene: string, from: string, w: number, note: string, o: Partial<ShotDef> = {}): ShotDef => ({ scene, kind: 'card', from, w, note, ...o });

export const SHOTS: ShotDef[] = [
  // ── 1 · THE HOOK ─────────────────────────────────────────────────────────────
  A('aerial', 'hook-0', 3.2, 'Breathtaking aerial descent over ancient Rome at golden hour: the Tiber, forums, temples, insulae stretching to the horizon.', { cap: ['ROMA', 'The Eternal City, c. 117 CE'], sfx: ['city', 'wind'], cam: [1.18, 1.0, 0, 0, -40, 20] }),
  A('colosseum', 'hook-0', 2.7, 'Dolly toward the Colosseum, its three tiers of arches lit by low sun.', { tr: 'fade', sfx: ['city', 'crowd'], cam: [1.0, 1.14, 0, -30, 20, -10] }),
  M('threeContinents', 'hook-0', 2.7, 'Cut to the parchment map: the empire fills the Mediterranean; Europe, Africa and Asia are named.', { tr: 'iris', cap: ['117 CE', 'Three continents under one rule'], sfx: ['wind'] }),
  A('market', 'hook-1', 3.4, 'A busy marketplace: awnings, amphorae, merchants and shoppers.', { tr: 'fade', sfx: ['market'], cam: [1.0, 1.1, 20, -30, 0, 0] }),
  A('march', 'hook-1', 3.3, 'A legion on the march along a paved road, standards held high.', { tr: 'wipe', sfx: ['march'], cam: [1.05, 1.0, 40, -40, 0, 0] }),
  A('horizon', 'hook-1', 3.1, 'Pull back: a vast city rolling away to the horizon beside the Tiber.', { tr: 'fade', sfx: ['city'], cam: [1.2, 1.0, 0, 0, 30, -20] }),
  M('zoomItaly', 'hook-2', 1, 'The map swoops from the whole empire down onto central Italy. The title appears: "How did it happen?"', { tr: 'iris', sfx: ['wind', 'sting'] }),

  // ── 2 · THE BEGINNING ───────────────────────────────────────────────────────
  A('sevenHills', 'beginning-0', 3.4, 'Dawn over the Tiber: low hills, a river crossing, mist, a few huts.', { cap: ['The Tiber', 'A river crossing among low hills'], sfx: ['river', 'birds'], cam: [1.1, 1.0, 20, -20, 0, 0] }),
  M('italyRome', 'beginning-0', 3.2, 'Map of Italy; Rome highlighted with sonar rings as the camera pushes in. (continues through the next sentence)', { tr: 'iris', sfx: ['wind'] }),
  A('ford', 'beginning-1', 1, 'The river crossing in use: merchants, salt traders and cattle at the ford beside the hills.', { tr: 'fade', sfx: ['river', 'market'], cam: [1.0, 1.1, 0, 0, 0, 0] }),
  A('legendEvidence', 'beginning-2', 1, 'Two panels: "Roman tradition — Romulus, 753 BCE" then "Archaeology — villages by the 8th century BCE".', { to: 'beginning-3', kind: 'card', sfx: ['quiet'] }),
  A('village', 'beginning-4', 3.3, 'Hilltop huts and smoke: villages slowly merging into a town.', { tr: 'fade', cap: ['8th century BCE', 'Villages on the Palatine and neighbouring hills'], sfx: ['birds', 'fire'], cam: [1.0, 1.12, 0, 0, 0, 0] }),
  M('etruria', 'beginning-4', 3.4, 'Map: Etruria to the north, Latium around Rome, and Greek colonies to the south.', { tr: 'wipe', sfx: ['wind'] }),
  A('etruscanTemple', 'beginning-4', 3.3, 'A painted terracotta temple in the Etruscan style rising over the young town.', { tr: 'fade', sfx: ['hammer', 'city'], cam: [1.12, 1.0, 0, 0, 0, 0] }),
  C('timeline509', 'beginning-5', 3.5, 'Timeline card: 753 BCE (tradition) → 509 BCE: the last king expelled, the Republic founded.', { tr: 'fade', cap: ['509 BCE', 'By tradition: the Republic begins'], sfx: ['quiet'] }),
  A('senate', 'beginning-5', 3.7, 'The Senate in session: rows of togas, elected magistrates presiding.', { tr: 'fade', sfx: ['crowd'], cam: [1.0, 1.1, 0, 0, 0, 0] }),

  // ── 3 · THE REPUBLIC EXPANDS ────────────────────────────────────────────────
  A('levy', 'republic-0', 1, 'Citizens drilling on the Campus Martius: farmers become soldiers.', { cap: ['The Republic', 'Citizens become soldiers'], sfx: ['march', 'hammer'], cam: [1.0, 1.12, 0, 0, 0, 0] }),
  M('conquest', 'republic-1', 5, 'Territory floods across Italy, red borders spreading; allies bound to Rome by treaty. Year ticker runs to 264 BCE.', { tr: 'fade', sfx: ['wind', 'march'] }),
  A('formation', 'republic-1', 5, 'Top-down view of a legion in manipular formation, checkerboard lines advancing.', { tr: 'wipe', sfx: ['march'] }),
  M('carthage', 'republic-2', 1, 'The Mediterranean: Rome in red, Carthage and its sphere in violet.', { tr: 'fade', cap: ['Carthage', 'A wealthy naval power in North Africa'], sfx: ['sea'] }),
  A('navalBattle', 'republic-3', 2.5, 'Roman warships with boarding bridges clash with Carthaginian galleys.', { tr: 'flash', cap: ['First Punic War', '264–241 BCE'], sfx: ['sea', 'battle'], cam: [1.0, 1.12, 0, 0, 0, 0] }),
  M('fleet', 'republic-3', 2.5, 'Map: the Roman fleet sails from Ostia to Sicily; Sicily turns red.', { tr: 'fade', sfx: ['sea'] }),
  M('hannibal', 'republic-4', 3.6, 'Hannibal\'s route from Iberia across the Alps toward Italy, army and elephants moving.', { tr: 'fade', cap: ['218 BCE', 'Hannibal marches on Italy'], sfx: ['wind'] }),
  A('alps', 'republic-4', 3.7, 'Snowy passes: a column of men and elephants winding over the ridge.', { tr: 'wipe', sfx: ['wind', 'horn'], cam: [1.1, 1.0, 40, -40, 0, 0] }),
  A('cannae', 'republic-4', 3.7, 'Top-down: Hannibal\'s lines envelop the Roman army at Cannae.', { tr: 'flash', cap: ['Cannae', '216 BCE'], sfx: ['battle', 'horn'] }),
  A('resolve', 'republic-5', 1, 'Night on the walls of Rome: torches, sentries, refusal to surrender.', { tr: 'fade', sfx: ['fire', 'crowd'], cam: [1.08, 1.0, 0, 0, 0, 0] }),
  M('scipio', 'republic-6', 2.2, 'Scipio\'s army sails to Africa; route to Zama.', { tr: 'fade', cap: ['Zama', '202 BCE'], sfx: ['sea'] }),
  A('zama', 'republic-6', 2.3, 'War elephants and legion lines meet at Zama.', { tr: 'flash', sfx: ['battle'], cam: [1.0, 1.1, 0, 0, 0, 0] }),
  A('carthageBurns', 'republic-7', 1, 'The skyline of Carthage in flames, smoke rolling over the harbour.', { tr: 'fade', cap: ['146 BCE', 'Carthage destroyed'], sfx: ['fire', 'battle'], cam: [1.1, 1.0, 0, 0, 0, 0] }),

  // ── 4 · JULIUS CAESAR AND POLITICAL TURMOIL ─────────────────────────────────
  A('camp', 'caesar-0', 1, 'The late Republic: a general\'s camp at dusk, legionaries gathering round their commander\'s standards — armies loyal to generals, not the state.', { to: 'caesar-1', tr: 'fade', cap: ['The late Republic', 'Conquest abroad, crisis at home'], sfx: ['fire', 'march', 'crowd'], cam: [1.1, 1.0, 0, 0, 0, 0] }),
  A('coin', 'caesar-2', 1.8, 'A gold denarius turning in the light: Julius Caesar (stylised engraving).', { tr: 'fade', cap: ['Julius Caesar', '100–44 BCE'], sfx: ['quiet'] }),
  M('gaul', 'caesar-2', 2, 'Caesar\'s campaign routes across Gaul to the Rhine and the Channel; Gaul turns red.', { tr: 'wipe', cap: ['Gaul', '58–50 BCE'], sfx: ['wind', 'march'] }),
  M('rubicon', 'caesar-3', 3, 'The route from Ravenna to the Rubicon and on to Rome, January 49 BCE.', { tr: 'fade', cap: ['The Rubicon', 'January 49 BCE'], sfx: ['wind'] }),
  A('rubiconRiver', 'caesar-3', 3, 'Dawn at the river: a column of soldiers at the bank.', { tr: 'fade', sfx: ['river', 'march'], cam: [1.1, 1.0, 0, 0, 0, 0] }),
  A('dice', 'caesar-4', 1, 'A die tumbles across stone and lands ("Alea iacta est" — attributed). Then a source card: ancient writers record different wordings — tradition, not certainty.', { to: 'caesar-5', tr: 'flash', sfx: ['quiet', 'sting'] }),
  M('civilWar', 'caesar-6', 1, 'Civil war: Caesar\'s routes to Pharsalus, Alexandria, Thapsus and Munda.', { tr: 'fade', cap: ['Civil War', '49–45 BCE'], sfx: ['battle', 'wind'] }),
  A('caesarTriumph', 'caesar-7', 3, 'Caesar, victorious over Pompey, receives a triumph and the dictatorship: cheering crowds, laurel, standards.', { tr: 'fade', cap: ['Dictator', '48–44 BCE'], sfx: ['crowd', 'horn', 'march'], cam: [1.05, 1.0, 20, -20, 0, 0] }),
  A('ides', 'caesar-7', 4, 'The Curia: silhouetted senators close around a lone figure. Ides of March, 44 BCE.', { tr: 'flash', cap: ['Ides of March', '44 BCE'], sfx: ['crowd', 'sting'] }),
  A('curiaEmpty', 'caesar-8', 1, 'An empty Senate house, dust in the light: the Republic fatally weakened.', { tr: 'fade', sfx: ['quiet', 'wind'], cam: [1.0, 1.1, 0, 0, 0, 0] }),

  // ── 5 · THE BIRTH OF THE EMPIRE ─────────────────────────────────────────────
  A('funeral', 'empire-0', 1, 'Caesar\'s funeral pyre in the Forum: crowds, fire and smoke.', { to: 'empire-1', tr: 'fade', cap: ['44–31 BCE', 'Thirteen more years of civil war'], sfx: ['fire', 'crowd'], cam: [1.0, 1.1, 0, 0, 0, 0] }),
  M('civilWar2', 'empire-1', 0.001, 'Placeholder removed', { tr: 'fade' }),
  A('actium', 'empire-2', 2.8, 'Naval battle at Actium, ships burning off the Greek coast.', { tr: 'flash', cap: ['Actium', '31 BCE'], sfx: ['sea', 'battle'], cam: [1.0, 1.12, 0, 0, 0, 0] }),
  M('egypt', 'empire-2', 2.8, 'Octavian\'s route to Alexandria; Egypt turns red (30 BCE).', { tr: 'fade', cap: ['Egypt annexed', '30 BCE'], sfx: ['sea'] }),
  C('augustus', 'empire-3', 1, 'Title card: 27 BCE — the Senate grants Octavian the name AVGVSTVS.', { to: 'empire-3', tr: 'fade', cap: ['27 BCE', 'Augustus, first Roman emperor'], sfx: ['crowd', 'horn'] }),
  A('triumph', 'empire-4', 2.5, 'Augustus enters Rome through a triumphal arch; laurel, standards, cheering crowds.', { tr: 'fade', sfx: ['crowd', 'horn', 'march'], cam: [1.05, 1.0, 30, -30, 0, 0] }),
  A('forumAugustus', 'empire-4', 2.5, 'The new marble Rome: temples and colonnades in warm gold.', { tr: 'fade', sfx: ['city', 'hammer'], cam: [1.0, 1.12, 0, 0, 0, 0] }),
  A('imperialRome', 'empire-5', 1, 'Imperial Rome in warm gold: marble temples and the new order.', { tr: 'fade', sfx: ['city', 'horn'], cam: [1.15, 1.0, 0, 0, 0, 0] }),
  A('road', 'empire-6', 3, 'A paved road under construction: surveyors, milestones, carts and soldiers.', { tr: 'fade', cap: ['Infrastructure', 'Roads, ports and cities'], sfx: ['hammer', 'march'], cam: [1.0, 1.15, 0, 0, 0, 0] }),
  A('standingArmy', 'empire-6', 3, 'A professional army in rank: standards, shields, discipline.', { tr: 'wipe', sfx: ['march', 'horn'], cam: [1.1, 1.0, 0, 0, 0, 0] }),
  A('ostia', 'empire-7', 2, 'The harbour at Ostia: grain ships, cranes, amphorae.', { tr: 'fade', cap: ['Pax Romana', 'The Roman peace'], sfx: ['sea', 'market'], cam: [1.0, 1.12, 0, 0, 0, 0] }),
  M('trade', 'empire-7', 4, 'Map: trade lanes bloom across the Mediterranean — grain, oil, spice, amber.', { tr: 'iris', sfx: ['sea', 'wind'] }),

  // ── 6 · THE LEGACY ──────────────────────────────────────────────────────────
  M('extent', 'legacy-0', 6, 'The empire sweeps to its greatest extent under Trajan, 117 CE; Britain to Mesopotamia.', { tr: 'fade', cap: ['117 CE', 'Greatest territorial extent · about 5 million km²'], sfx: ['wind', 'horn'] }),
  A('trajanColumn', 'legacy-0', 3.5, 'Trajan\'s Column, its spiral frieze of campaigns, against a golden sky.', { tr: 'fade', cap: ['Trajan', 'Emperor 98–117 CE'], sfx: ['city'], cam: [1.0, 1.2, 0, 0, 60, -60] }),
  M('roads', 'legacy-1', 2.3, 'Roman roads draw themselves across the provinces.', { tr: 'wipe', sfx: ['wind'] }),
  A('aqueduct', 'legacy-1', 2.3, 'An aqueduct striding across the countryside at sunset.', { tr: 'fade', sfx: ['river', 'birds'], cam: [1.0, 1.1, 30, -30, 0, 0] }),
  M('frontier', 'legacy-1', 2.4, 'Frontiers: fortified limes along the Rhine, Danube and Euphrates.', { tr: 'fade', cap: ['The frontiers', 'Thousands of kilometres of defended border'], sfx: ['wind', 'march'] }),
  M('distance', 'legacy-2', 1, 'Map: a measured arc from Britain to Mesopotamia — size as burden.', { to: 'legacy-3', tr: 'fade', cap: ['A burden of scale', 'Slow messages, costly defence, violent successions'], sfx: ['wind'] }),
  C('timelineAll', 'legacy-4', 1, 'Timeline: 753 BCE → 117 CE with every milestone lit.', { tr: 'fade', sfx: ['quiet'] }),
  A('pantheon', 'legacy-5', 1, 'The Pantheon\'s dome and portico, still standing: concrete, arches, law and engineering.', { tr: 'fade', cap: ['A lasting legacy', 'Law, language, architecture, engineering'], sfx: ['birds', 'city'], cam: [1.0, 1.12, 0, 0, 0, 0] }),
  A('colosseumDusk', 'legacy-5', 1, 'The Colosseum at dusk: arches, engineering and public life that outlasted the empire.', { tr: 'fade', sfx: ['birds', 'city'], cam: [1.1, 1.0, 0, 0, 0, 0] }),
  M('modern', 'legacy-6', 1, 'The camera pulls back from the ancient map into a modern geographical map with today\'s borders; the empire\'s footprint glows red.', { to: 'legacy-6', tr: 'fade', sfx: ['wind', 'horn'] }),
];
// remove the placeholder entry (kept out of the list on purpose)
const idx = SHOTS.findIndex((s) => s.scene === 'civilWar2'); if (idx >= 0) SHOTS.splice(idx, 1);
