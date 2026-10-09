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
  'Basic' | 'Stage 1' | 'Stage 2' | 'Item' | 'Supporter' | 'Stadium' | 'Tool';
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
  deluxePackMega: Card[];
  promoB: Card[];
};

/** Schema v1 print; legacy fields and print IDs are retained. */
export interface Print extends Card {
  setId: string;
  number: number;
  packs: string[];
  rules: string[];
  sourceUrl: string;
  /** Content fingerprint: changes when gameplay data is corrected. */
  gameplayId: string;
  alternatePrintIds: string[];
}
export interface Verification {
  status: 'reference-compared';
  checkedAt: string;
  sourceUrl: string;
  sourceHtmlSha256: string;
  cardFileSha256: string;
  supplementarySha256: string;
  checkedFields: string[];
  uncheckedFields: string[];
  unresolvedDifferences: {
    id: string;
    field: string;
    current: unknown;
    reference: unknown;
  }[];
  notes: string[];
}
export interface SetMetadata {
  id: string;
  code: string;
  name: string;
  file: string;
  exportName: string;
  expectedCount: number;
  releaseDate: string | null;
  sourceUrl: string;
  cardCount: number;
  packs: string[];
  verification: Verification;
}
export interface GameplayCard extends Omit<
  Card,
  'id' | 'set' | 'pack' | 'rarity'
> {
  id: string;
  rules: string[];
  printIds: string[];
}
export declare const database: {
  schemaVersion: 1;
  cards: Print[];
  gameplay: GameplayCard[];
  sets: SetMetadata[];
  findById(id: string): Print | undefined;
  findByName(name: string): Print[];
  cardsForSet(setId: string): Print[];
};
