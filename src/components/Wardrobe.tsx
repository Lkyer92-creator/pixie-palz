import type { Element, WardrobeSlot } from '../game';
import './Wardrobe.css';


export type WardrobeItem = {
  id: string;
  slot: WardrobeSlot;
  name: string;
  icon: string;
  cost: number;
  element?: Element;
};


const SLOT_LABELS: Record<WardrobeSlot, string> = {
  halo: 'Halos',
  head: 'Head',
  eyes: 'Eyes',
  neck: 'Neck',
  extra: 'Extras',
};


export const WARDROBE_ITEMS: WardrobeItem[] = [
  { id: 'halo-leaf', slot: 'halo', name: 'Leaf Halo', icon: '🌿', cost: 0 },
  { id: 'halo-vine', slot: 'halo', name: 'Woven Vine Halo', icon: '🍃', cost: 40, element: 'earth' },
  { id: 'halo-cloud', slot: 'halo', name: 'Cloud Halo', icon: '☁️', cost: 40, element: 'air' },
  { id: 'halo-ember', slot: 'halo', name: 'Ember Halo', icon: '🔥', cost: 40, element: 'fire' },
  { id: 'halo-tide', slot: 'halo', name: 'Tide Halo', icon: '🌊', cost: 40, element: 'water' },
  { id: 'halo-bloom', slot: 'halo', name: 'Nightbloom Halo', icon: '🌸', cost: 40, element: 'poison' },
  { id: 'head-bow', slot: 'head', name: 'Star Bow', icon: '🎀', cost: 0 },
  { id: 'head-crown', slot: 'head', name: 'Tiny Crown', icon: '👑', cost: 25 },
  { id: 'head-pitchfork', slot: 'head', name: 'Mini Pitchfork', icon: '😈', cost: 30 },
  { id: 'eyes-shades', slot: 'eyes', name: 'Cool Shades', icon: '🕶️', cost: 0 },
  { id: 'eyes-stars', slot: 'eyes', name: 'Starry Shades', icon: '🤩', cost: 15 },
  { id: 'neck-beads', slot: 'neck', name: 'Berry Beads', icon: '🍒', cost: 0 },
  { id: 'neck-pearl', slot: 'neck', name: 'Moon Pearl', icon: '🌕', cost: 20 },
  { id: 'extra-sparkle', slot: 'extra', name: 'Star Sparkles', icon: '✨', cost: 10 },
  { id: 'extra-trail', slot: 'extra', name: 'Stardust Trail', icon: '🌠', cost: 15 },
];


type WardrobeProps = {
  element: Element;
  moondust: number;
  ownedItems: string[];
  equipped: Partial<Record<WardrobeSlot, string>>;
  onBuy: (itemId: string, cost: number) => boolean;
  onEquip: (slot: WardrobeSlot, itemId: string | null) => void;
};


export default function Wardrobe({ element, moondust, ownedItems, equipped, onBuy, onEquip }: WardrobeProps) {
  const visible = WARDROBE_ITEMS.filter((item) => !item.element || item.element === element);
  const slots: WardrobeSlot[] = ['halo', 'head', 'eyes', 'neck', 'extra'];


  return (
    <div className="pp-wardrobe">
      <div className="pp-wardrobe-balance">
        <span className="pp-wardrobe-balance-icon">🌙</span>
        <span>{moondust} Moon Dust</span>
      </div>
      {slots.map((slot) => {
        const items = visible.filter((item) => item.slot === slot);
        if (items.length === 0) return null;
        const equippedId = equipped[slot] ?? null;
        return (
          <section key={slot} className="pp-wardrobe-slot">
            <h3 className="pp-wardrobe-slot-title">{SLOT_LABELS[slot]}</h3>
            <div className="pp-wardrobe-grid">
              {items.map((item) => {
                const owned = ownedItems.includes(item.id);
                const isEquipped = equippedId === item.id;
                const affordable = moondust >= item.cost;
                return (
                  <div key={item.id} className={`pp-wardrobe-item${isEquipped ? ' is-equipped' : ''}`}>
                    <div className="pp-wardrobe-icon" aria-hidden="true">{item.icon}</div>
                    <div className="pp-wardrobe-name">{item.name}</div>
                    <div className="pp-wardrobe-price">{item.cost === 0 ? 'Free' : `🌙 ${item.cost}`}</div>
                    {!owned ? (
                      <button
                        type="button"
                        className="pp-wardrobe-btn"
                        disabled={!affordable}
                        onClick={() => onBuy(item.id, item.cost)}
                      >
                        {affordable ? 'Get it' : 'Need 🌙'}
                      </button>
                    ) : isEquipped ? (
                      <button
                        type="button"
                        className="pp-wardrobe-btn is-on"
                        onClick={() => onEquip(slot, null)}
                      >
                        ✓ Wearing — remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="pp-wardrobe-btn"
                        onClick={() => onEquip(slot, item.id)}
                      >
                        Wear it
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      <p className="pp-wardrobe-note">Special sparkly halos appear for each pal's element. Hatch every pal to collect them all.</p>
    </div>
  );
}
