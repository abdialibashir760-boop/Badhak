import React from 'react';
import * as S1 from './scenes1';
import * as S2 from './scenes2';
import type { SceneProps } from './scenes1';
const Mirror = (C: React.FC<SceneProps>, shift = 300): React.FC<SceneProps> => (props) => <g transform="translate(1920 0) scale(-1 1)"><C {...props} f={props.f + shift} /></g>;
export const ART: Record<string, React.FC<SceneProps>> = {
  aerial: S1.Aerial, colosseum: S1.ColosseumScene, colosseumDusk: S1.ColosseumDusk, market: S1.Market, march: S1.March, horizon: S1.Horizon, sevenHills: S1.SevenHills, ford: S1.Ford, village: S1.Village,
  etruscanTemple: S1.EtruscanTemple, senate: S1.Senate, levy: S1.Levy, formation: S1.Formation, navalBattle: S1.NavalBattle, alps: S1.Alps, cannae: S1.Cannae, resolve: S1.Resolve, zama: S1.Zama, carthageBurns: S1.CarthageBurns,
  camp: S2.Camp, coin: S2.Coin, rubiconRiver: S2.RubiconRiver, dice: S2.Dice, ides: S2.Ides, curiaEmpty: S2.CuriaEmpty, funeral: S2.Funeral, actium: S2.Actium, triumph: S2.Triumph, caesarTriumph: Mirror(S2.Triumph),
  forumAugustus: S2.ForumAugustus, imperialRome: S2.ImperialRome, road: S2.Road, standingArmy: S2.StandingArmy, ostia: S2.Ostia, trajanColumn: S2.TrajanColumn, aqueduct: S2.Aqueduct, pantheon: S2.Pantheon,
  legendEvidence: S2.LegendEvidence, timeline509: S2.Timeline509, augustus: S2.AugustusCard, timelineAll: S2.TimelineAll,
};
