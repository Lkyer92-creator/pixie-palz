import { useCallback, useEffect, useMemo, useState } from 'react';


export type Element = 'water' | 'earth' | 'poison' | 'fire' | 'air';
export type GamePhase = 'egg' | 'alive' | 'dead';
export type CareAction = 'feed' | 'play' | 'learn' | 'sleep';
export type WardrobeSlot = 'halo' | 'head' | 'eyes' | 'neck' | 'extra';


export type CareOption = {
  id: string;
  name: string;
  description: string;
  cost: number;
  benefit: string;
  effects: Partial<Record<'hunger' | 'happiness' | 'knowledge' | 'energy' | 'health', number>>;
};


export const CARE_OPTIONS: Record<CareAction, CareOption[]> = {
  feed: [
    { id: 'berry-basket', name: 'Glowberry basket', description: 'A sweet handful of Fern Hollow berries.', cost: 0, benefit: '+30 fullness · +4 joy', effects: { hunger: 30, happiness: 4 } },
    { id: 'honey-cake', name: 'Honeycloud cake', description: 'Soft, warm cake with a golden center.', cost: 12, benefit: '+48 fullness · +8 joy', effects: { hunger: 48, happiness: 8 } },
    { id: 'starfruit-fizz', name: 'Starfruit fizz', description: 'A fizzy treat with a little extra pep.', cost: 20, benefit: '+24 fullness · +10 energy', effects: { hunger: 24, energy: 10 } },
  ],
  play: [
    { id: 'tumble-tiles', name: 'Tumble Tiles', description: 'Fit falling shapes and clear a row together.', cost: 0, benefit: '+18 joy · earn Moon Dust', effects: { happiness: 18, energy: -7, hunger: -4 } },
    { id: 'matching-orbs', name: 'Matching Orbs', description: 'Find matching pairs hidden in the garden.', cost: 0, benefit: '+18 joy · earn Moon Dust', effects: { happiness: 18, energy: -5, hunger: -3 } },
    { id: 'fern-memory', name: 'Fern-path Memory', description: 'Remember the glowing sequence of stones.', cost: 0, benefit: '+18 joy · earn Moon Dust', effects: { happiness: 18, energy: -5, hunger: -3 } },
    { id: 'laserball', name: 'Laserball', description: 'Aim a bright little ball at moving targets.', cost: 0, benefit: '+18 joy · earn Moon Dust', effects: { happiness: 18, energy: -7, hunger: -4 } },
  ],
  learn: [
    { id: 'lesson-reading', name: 'Reading', description: 'Read a short story and answer a question together.', cost: 0, benefit: '+22 learning · +5 joy', effects: { knowledge: 22, happiness: 5, energy: -3 } },
    { id: 'lesson-math', name: 'Math', description: 'Solve a small number puzzle with your pal.', cost: 0, benefit: '+22 learning · +5 joy', effects: { knowledge: 22, happiness: 5, energy: -3 } },
    { id: 'lesson-science', name: 'Science', description: 'Explore a nature fact and make a prediction.', cost: 0, benefit: '+22 learning · +5 joy', effects: { knowledge: 22, happiness: 5, energy: -3 } },
    { id: 'lesson-writing', name: 'Writing', description: 'Build a sentence and choose how the story ends.', cost: 0, benefit: '+22 learning · +5 joy', effects: { knowledge: 22, happiness: 5, energy: -3 } },
  ],
  sleep: [
    { id: 'moss-nest', name: 'Moss-soft nest', description: 'A snug, familiar bed beneath the fern leaves.', cost: 0, benefit: '+38 energy · +4 joy', effects: { energy: 38, happiness: 4 } },
    { id: 'moon-lullaby', name: 'Moonbeam lullaby', description: 'A gentle tune to drift off beneath the stars.', cost: 12, benefit: '+54 energy · +8 health', effects: { energy: 54, health: 8 } },
    { id: 'cloud-comfort', name: 'Cloud-quilt tuck-in', description: 'A warm, fluffy blanket for a restful night.', cost: 20, benefit: '+42 energy · +12 health', effects: { energy: 42, health: 12 } },
  ],
};


type OptionPersonalization = { name: string; description: string };
type PetCareStyle = Partial<Record<CareAction, Record<string, OptionPersonalization>>>;


const PET_CARE_STYLES: Record<Element, PetCareStyle> = {
  water: {
    feed: {
      'berry-basket': { name: 'Tidefruit bubbles', description: 'Juicy little bubbles pop with a splash of berry sweetness.' },
      'honey-cake': { name: 'Coral honey cake', description: 'A soft seafoam cake with a golden honey center.' },
      'starfruit-fizz': { name: 'Moon-tide fizz', description: 'A sparkling sip that swirls like a tiny whirlpool.' },
    },
    play: {
      'tumble-tiles': { name: 'Tidepool Tumble Tiles', description: 'Fit falling shapes into a shimmering tidepool.' },
      'matching-orbs': { name: 'Bubble Pair Match', description: 'Find the twin bubbles before they float away.' },
      'fern-memory': { name: 'Ripple-path Memory', description: 'Remember the ripples glowing across the water.' },
      'laserball': { name: 'Wavebeam Laserball', description: 'Guide a bright bubble-ball toward sea-glass targets.' },
    },
    sleep: {
      'moss-nest': { name: 'Tidepool hammock', description: 'A gentle cradle that rocks with a soft ocean hush.' },
      'moon-lullaby': { name: 'Moon-current lullaby', description: 'A watery tune drifts beneath a silver moon.' },
      'cloud-comfort': { name: 'Seafoam quilt', description: 'A foamy blanket wraps your pal in a warm little wave.' },
    },
  },
  earth: {
    feed: {
      'berry-basket': { name: 'Acornberry harvest', description: 'Fresh berries gathered beside the old oak roots.' },
      'honey-cake': { name: 'Hazelnut honey cake', description: 'A warm, nutty cake dusted with pollen sugar.' },
      'starfruit-fizz': { name: 'Dewdrop nectar', description: 'A crisp sip gathered from the morning leaves.' },
    },
    play: {
      'tumble-tiles': { name: 'Acorn Tumble Tiles', description: 'Stack sturdy shapes and clear a row of woodland stones.' },
      'matching-orbs': { name: 'Seedling Pair Match', description: 'Find matching seeds tucked under broad leaves.' },
      'fern-memory': { name: 'Root-path Memory', description: 'Remember the glowing trail through the roots.' },
      'laserball': { name: 'Sunseed Laserball', description: 'Roll a bright seed-ball toward the garden targets.' },
    },
    sleep: {
      'moss-nest': { name: 'Fern-root bed', description: 'A leafy nest tucked safely beneath the old roots.' },
      'moon-lullaby': { name: 'Cricket-song lullaby', description: 'Crickets sing softly while the garden settles.' },
      'cloud-comfort': { name: 'Clover-patch quilt', description: 'A soft blanket smells like clover after the rain.' },
    },
  },
  poison: {
    feed: {
      'berry-basket': { name: 'Violet moonberries', description: 'A tangy handful of berries with a gentle purple glow.' },
      'honey-cake': { name: 'Nightshade honey cake', description: 'A dark berry cake with a sweet golden middle.' },
      'starfruit-fizz': { name: 'Dusk-petal fizz', description: 'A fizzy sip with the bright taste of forest flowers.' },
    },
    play: {
      'tumble-tiles': { name: 'Violet Tumble Tiles', description: 'Fit glowing shapes beneath the curling vines.' },
      'matching-orbs': { name: 'Moonberry Pair Match', description: 'Find matching moonberries in the shadow garden.' },
      'fern-memory': { name: 'Night-bloom Memory', description: 'Remember the tiny lights among the dark leaves.' },
      'laserball': { name: 'Vineglow Laserball', description: 'Send a purple glow-ball through the vine targets.' },
    },
    sleep: {
      'moss-nest': { name: 'Night-bloom pod', description: 'A petal-soft pod closes around your pal at bedtime.' },
      'moon-lullaby': { name: 'Dusk-petal lullaby', description: 'A low, gentle hum helps the flowers fold for night.' },
      'cloud-comfort': { name: 'Violet-leaf blanket', description: 'A cool leaf quilt glimmers softly in the dark.' },
    },
  },
  fire: {
    feed: {
      'berry-basket': { name: 'Emberberries', description: 'Warm berries with a little spark in every bite.' },
      'honey-cake': { name: 'Cinder-caramel cake', description: 'A soft cake with a toasted, golden edge.' },
      'starfruit-fizz': { name: 'Sunflare fizz', description: 'A bubbly sip that crackles with cheerful warmth.' },
    },
    play: {
      'tumble-tiles': { name: 'Ember Tumble Tiles', description: 'Fit bright shapes together without losing your rhythm.' },
      'matching-orbs': { name: 'Spark Pair Match', description: 'Find matching sparks before they dim.' },
      'fern-memory': { name: 'Kindle-path Memory', description: 'Remember the warm lights along the trail.' },
      'laserball': { name: 'Sunflare Laserball', description: 'Fire a glowing ball toward the lantern targets.' },
    },
    sleep: {
      'moss-nest': { name: 'Emberstone nest', description: 'A cozy bed stays warm without getting too hot.' },
      'moon-lullaby': { name: 'Hearth-hum lullaby', description: 'A low, soothing tune keeps the little sparks calm.' },
      'cloud-comfort': { name: 'Ash-soft quilt', description: 'A cloud-light blanket settles like warm evening ash.' },
    },
  },
  air: {
    feed: {
      'berry-basket': { name: 'Cloudberry drift', description: 'Sweet berries ride in on a soft breeze.' },
      'honey-cake': { name: 'Cloudtop honey cake', description: 'A feather-light cake with a honey-sun center.' },
      'starfruit-fizz': { name: 'Skydrop fizz', description: 'A tiny sparkling sip that tastes like cool morning air.' },
    },
    play: {
      'tumble-tiles': { name: 'Cloud Tumble Tiles', description: 'Fit soft shapes together as they drift down.' },
      'matching-orbs': { name: 'Feather Pair Match', description: 'Find matching feathers floating through the clouds.' },
      'fern-memory': { name: 'Breezepath Memory', description: 'Remember the little lights carried on the breeze.' },
      'laserball': { name: 'Skybeam Laserball', description: 'Guide a shining ball through the cloud targets.' },
    },
    sleep: {
      'moss-nest': { name: 'Cloudbank cradle', description: 'A floating bed rocks gently in the evening breeze.' },
      'moon-lullaby': { name: 'Wind-whistle lullaby', description: 'A quiet melody sails past the sleeping stars.' },
      'cloud-comfort': { name: 'Featherlight quilt', description: 'A soft, airy blanket settles over your pal.' },
    },
  },
};


export function getPetCareOptions(action: CareAction, element: Element): CareOption[] {
  const personalization = PET_CARE_STYLES[element]?.[action];
  return CARE_OPTIONS[action].map((option) => {
    const style = personalization?.[option.id];
    return style ? { ...option, ...style } : option;
  });
}


export type Pet = {
  id: string;
  name: string;
  element: Element;
  hunger: number;
  happiness: number;
  knowledge: number;
  energy: number;
  health: number;
  daysTogether: number;
  hatchedAt: number;
  lastUpdated: number;
};


export type SavedGame = {
  pet: Pet | null;
  moondust: number;
  starbits: number;
  playerName: string | null;
  ownedItems: string[];
  equipped: Partial<Record<WardrobeSlot, string>>;
  lastSwipe: number;
};


const STORAGE_KEY = 'pixie-palz-save-v1';
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const FOX_DUST_PENALTY = 8;
const NEGLECT_XP_DRAIN = 2;


const SPECIES: Array<{ element: Element; name: string }> = [
  { element: 'water', name: 'Ripplet' },
  { element: 'earth', name: 'Mosskin' },
  { element: 'poison', name: 'Vexleaf' },
  { element: 'fire', name: 'Cindrel' },
  { element: 'air', name: 'Puffwing' },
];


function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}


function isPet(value: unknown): value is Pet {
  if (!value || typeof value !== 'object') return false;
  const pet = value as Partial<Pet>;
  return (
    typeof pet.id === 'string' &&
    typeof pet.name === 'string' &&
    ['water', 'earth', 'poison', 'fire', 'air'].includes(pet.element ?? '') &&
    ['hunger', 'happiness', 'knowledge', 'energy', 'health', 'daysTogether', 'hatchedAt', 'lastUpdated'].every(
      (key) => typeof pet[key as keyof Pet] === 'number',
    )
  );
}


function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}


function loadGame(): SavedGame {
  const fresh = (): SavedGame => ({
    pet: null, moondust: 0, starbits: 0, playerName: null, ownedItems: [], equipped: {}, lastSwipe: 0,
  });
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh();
    const saved = JSON.parse(raw) as Record<string, unknown>;
    if (saved && typeof saved === 'object' && 'pet' in saved && (saved.pet === null || isPet(saved.pet))) {
      const hasDust = 'moondust' in saved;
      return {
        pet: saved.pet as Pet | null,
        moondust: hasDust ? num(saved.moondust) : num(saved.starbits),
        starbits: hasDust ? num(saved.starbits) : 0,
        playerName: typeof saved.playerName === 'string' && saved.playerName.trim() ? saved.playerName.trim().slice(0, 18) : null,
        ownedItems: Array.isArray(saved.ownedItems) ? (saved.ownedItems as unknown[]).filter((x): x is string => typeof x === 'string') : [],
        equipped: saved.equipped && typeof saved.equipped === 'object' ? (saved.equipped as Partial<Record<WardrobeSlot, string>>) : {},
        lastSwipe: 0,
      };
    }
  } catch {
    // A fresh save is safer than leaving an unreadable save in a broken state.
  }
  return fresh();
}


function saveGame(game: SavedGame) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  } catch {
    // The current session remains playable if browser storage is unavailable.
  }
}


export function advancePet(pet: Pet, now: number): Pet {
  const elapsed = Math.max(0, now - pet.lastUpdated);
  if (elapsed === 0) return pet;


  const minutes = elapsed / MINUTE;
  const hunger = clamp(pet.hunger - minutes * 0.85);
  const happiness = clamp(pet.happiness - minutes * 0.38);
  const energy = clamp(pet.energy - minutes * 0.28);
  const needsAreCritical = hunger < 12 || happiness < 12 || energy < 12;
  const health = clamp(
    pet.health +
      (needsAreCritical ? -minutes * 0.34 : hunger > 45 && happiness > 45 && energy > 35 ? minutes * 0.08 : 0),
  );


  return {
    ...pet,
    hunger,
    happiness,
    energy,
    health,
    daysTogether: Math.max(1, Math.floor((now - pet.hatchedAt) / DAY) + 1),
    lastUpdated: now,
  };
}


function createPet(now: number, element?: Element): Pet {
  const species = element
    ? SPECIES.find((s) => s.element === element) ?? SPECIES[Math.floor(Math.random() * SPECIES.length)]
    : SPECIES[Math.floor(Math.random() * SPECIES.length)];
  return {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    name: species.name,
    element: species.element,
    hunger: 76,
    happiness: 78,
    knowledge: 8,
    energy: 84,
    health: 100,
    daysTogether: 1,
    hatchedAt: now,
    lastUpdated: now,
  };
}


function applyCareOption(pet: Pet, option: CareOption, now: number): Pet {
  const current = advancePet(pet, now);
  const updated = { ...current };
  for (const key of ['hunger', 'happiness', 'knowledge', 'energy', 'health'] as const) {
    const change = option.effects[key];
    if (change !== undefined) updated[key] = clamp(current[key] + change);
  }
  return { ...updated, lastUpdated: now };
}


export function usePetGame() {
  const [saved, setSaved] = useState<SavedGame>(loadGame);
  const [feedback, setFeedback] = useState('');


  const pet = saved.pet;
  const phase: GamePhase = !pet ? 'egg' : pet.health <= 0 ? 'dead' : 'alive';


  useEffect(() => {
    saveGame(saved);
  }, [saved]);


  useEffect(() => {
    const timer = window.setInterval(() => {
      setSaved((current) => {
        if (!current.pet || current.pet.health <= 0) return current;
        const advanced = advancePet(current.pet, Date.now());
        const critical = advanced.hunger < 12 || advanced.happiness < 12 || advanced.energy < 12;
        const drained = critical && current.starbits > 0 ? Math.min(current.starbits, NEGLECT_XP_DRAIN) : 0;
        if (
          advanced.hunger === current.pet.hunger &&
          advanced.happiness === current.pet.happiness &&
          advanced.energy === current.pet.energy &&
          advanced.health === current.pet.health &&
          advanced.daysTogether === current.pet.daysTogether &&
          drained === 0
        ) {
          return current;
        }
        return {
          ...current,
          pet: advanced,
          starbits: current.starbits - drained,
          lastSwipe: drained > 0 ? Date.now() : current.lastSwipe,
        };
      });
    }, 10_000);
    return () => window.clearInterval(timer);
  }, []);


  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(''), 3_500);
    return () => window.clearTimeout(timer);
  }, [feedback]);


  const hatch = useCallback((element?: Element) => {
    if (saved.pet && saved.pet.health > 0) return;
    const nextPet = createPet(Date.now(), element);
    setSaved((current) => ({ ...current, pet: nextPet }));
    setFeedback(`${nextPet.name} hatched! Your ${nextPet.element} pal is ready to meet you.`);
  }, [saved.pet]);


  const chooseCareOption = useCallback(
    (action: CareAction, optionId: string, displayName?: string) => {
      const option = CARE_OPTIONS[action].find((candidate) => candidate.id === optionId);
      if (!option || !saved.pet || saved.pet.health <= 0) return false;
      if (saved.moondust < option.cost) {
        setFeedback(`You need ${option.cost - saved.moondust} more Moon Dust for that treat.`);
        return false;
      }


      const now = Date.now();
      setSaved((current) => {
        if (!current.pet || current.pet.health <= 0 || current.moondust < option.cost) return current;
        return {
          ...current,
          pet: applyCareOption(current.pet, option, now),
          moondust: current.moondust - option.cost,
        };
      });
      setFeedback(`${displayName || option.name} was a lovely choice.`);
      return true;
    },
    [saved.pet, saved.moondust],
  );


  const earnMoonDust = useCallback((amount: number) => {
    const reward = Math.max(0, Math.min(500, Math.floor(amount)));
    if (reward === 0) return;
    setSaved((current) => ({ ...current, moondust: current.moondust + reward }));
    setFeedback(`You earned ${reward} Moon Dust!`);
  }, []);


  const earnStarbits = useCallback((amount: number) => {
    const xp = Math.max(0, Math.min(500, Math.floor(amount)));
    if (xp === 0) return;
    setSaved((current) => ({ ...current, starbits: current.starbits + xp }));
  }, []);


  const loseStarbits = useCallback((amount: number) => {
    const loss = Math.max(0, Math.floor(amount));
    if (loss <= 0) return;
    const breach = saved.starbits - loss < 0;
    const stolenDust = breach ? Math.min(saved.moondust, FOX_DUST_PENALTY) : 0;
    setSaved((current) => ({
      ...current,
      starbits: Math.max(0, current.starbits - loss),
      moondust: current.moondust - Math.min(current.moondust, breach ? FOX_DUST_PENALTY : 0),
      lastSwipe: Date.now(),
    }));
    setFeedback(
      breach && stolenDust > 0
        ? `A sneaky fox swiped your Starbits… and ${stolenDust} Moon Dust!`
        : `A sneaky fox swiped ${Math.min(loss, saved.starbits)} Starbits!`,
    );
  }, [saved.starbits, saved.moondust]);


  const buyItem = useCallback((itemId: string, cost: number) => {
    if (saved.ownedItems.includes(itemId)) return true;
    if (saved.moondust < cost) {
      setFeedback(`You need ${cost - saved.moondust} more Moon Dust for that look.`);
      return false;
    }
    setSaved((current) => {
      if (current.ownedItems.includes(itemId) || current.moondust < cost) return current;
      return { ...current, moondust: current.moondust - cost, ownedItems: [...current.ownedItems, itemId] };
    });
    setFeedback('A new look for your pal!');
    return true;
  }, [saved.ownedItems, saved.moondust]);


  const equipItem = useCallback((slot: WardrobeSlot, itemId: string | null) => {
    setSaved((current) => {
      const equipped = { ...current.equipped };
      if (itemId) equipped[slot] = itemId;
      else delete equipped[slot];
      return { ...current, equipped };
    });
  }, []);


  const setPlayerName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 18);
    if (!trimmed) return false;
    setSaved((current) => ({ ...current, playerName: trimmed }));
    return true;
  }, []);


  const rename = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 18);
    if (!trimmed) return false;
    setSaved((current) =>
      current.pet && current.pet.health > 0
        ? { ...current, pet: { ...current.pet, name: trimmed } }
        : current,
    );
    setFeedback(`A new name for your pal: ${trimmed}!`);
    return true;
  }, []);


  const startOver = useCallback(() => {
    setSaved((current) => ({ ...current, pet: null }));
    setFeedback('');
  }, []);


  return useMemo(
    () => ({
      pet,
      phase,
      moondust: saved.moondust,
      starbits: saved.starbits,
      playerName: saved.playerName,
      ownedItems: saved.ownedItems,
      equipped: saved.equipped,
      lastSwipe: saved.lastSwipe,
      feedback,
      hatch,
      chooseCareOption,
      earnMoonDust,
      earnStarbits,
      loseStarbits,
      buyItem,
      equipItem,
      setPlayerName,
      rename,
      startOver,
    }),
    [pet, phase, saved.moondust, saved.starbits, saved.playerName, saved.ownedItems, saved.equipped, saved.lastSwipe, feedback, hatch, chooseCareOption, earnMoonDust, earnStarbits, loseStarbits, buyItem, equipItem, setPlayerName, rename, startOver],
  );
}
