export type EnergyType =
  | 'Grass'
  | 'Fire'
  | 'Water'
  | 'Lightning'
  | 'Psychic'
  | 'Fighting'
  | 'Darkness'
  | 'Metal'
  | 'Dragon'
  | 'Colorless';

export type CardType = 'Pokemon' | 'Trainer';
export type CardSubtype =
  | 'Basic'
  | 'Stage 1'
  | 'Stage 2'
  | 'Item'
  | 'Supporter'
  | 'Stadium'
  | 'Tool';
export type Rarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Rare EX'
  | 'Full Art'
  | 'Full Art EX/Support'
  | 'Immersive'
  | 'One Shiny Star'
  | 'Two Shiny Stars'
  | 'Gold Crown';

export interface Attack {
  name: string;
  damage: string;
  cost: EnergyType[];
  effect?: string;
}

export interface Ability {
  name: string;
  effect: string;
}

export interface Card {
  id: string;
  name: string;
  element: EnergyType | null;
  type: CardType;
  subtype: CardSubtype;
  effect: string | null;
  health: number | null;
  set: string;
  pack: string | null;
  attacks: Attack[];
  retreatCost: number | null;
  weakness: EnergyType | null;
  abilities: Ability[];
  evolvesFrom: string | null;
  rarity: Rarity | null;
}

export declare const en: {
  geneticApex: Card[];
  mythicalIsland: Card[];
  spaceTimeSmackdown: Card[];
  triumphantLight: Card[];
  shiningRevelry: Card[];
  celestialGuardians: Card[];
  extradimensionalCrisis: Card[];
  eeveeGrove: Card[];
  wisdomOfSeaAndSky: Card[];
  secludedSprings: Card[];
  deluxePackEx: Card[];
  promoA: Card[];
  megaRising: Card[];
  crimsonBlaze: Card[];
  fantasticalParade: Card[];
  paldeanWonders: Card[];
  megaShine: Card[];
  pulsingAura: Card[];
  paradoxDrive: Card[];
  everydayWonders: Card[];
  rulerOfTheSkies: Card[];
  teamRocketsAmbition: Card[];
  promoB: Card[];
};
