import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  BookOpen,
  Egg,
  Gamepad2,
  RotateCcw,
  Sparkles,
  Shirt,
  UserRound,
  House,
  UtensilsCrossed,
} from 'lucide-react';
import PetPortrait from './components/PetPortrait';
import CareActivities from './components/CareActivities';
import Wardrobe, { WARDROBE_ITEMS } from './components/Wardrobe';
import { usePetGame, type CareAction, type CareOption, type Element, type Pet } from './game';
import './App.css';


type View = 'home' | 'feed' | 'play' | 'learn' | 'sleep' | 'wardrobe' | 'profile';
type Game = ReturnType<typeof usePetGame>;
type ActivityResult = { action: CareAction; option: CareOption; detail: string; reward: number };


const ELEMENT_META: Record<Element, { species: string; color: string; glow: string; habitat: string; tagline: string }> = {
  water: { species: 'Ripplet', color: '#4aa8de', glow: 'rgba(74,168,222,.45)', habitat: 'Mistral Springs', tagline: 'a gentle tide of curiosity' },
  earth: { species: 'Mosskin', color: '#7c9a5c', glow: 'rgba(124,154,92,.45)', habitat: 'Fern Hollow', tagline: 'steady roots, warm heart' },
  poison: { species: 'Vexleaf', color: '#9a6bc4', glow: 'rgba(154,107,196,.45)', habitat: 'Thistle Hollow', tagline: 'a little wild, a lot of wonder' },
  fire: { species: 'Cindrel', color: '#e0784a', glow: 'rgba(224,120,74,.45)', habitat: 'Cinder Grove', tagline: 'a bright spark of courage' },
  air: { species: 'Puffwing', color: '#7cc4d4', glow: 'rgba(124,196,212,.45)', habitat: 'Cloudrest', tagline: 'light as a whispered wish' },
};


const STAT_META = [
  { key: 'hunger', label: 'Fullness', icon: '🍽️' },
  { key: 'happiness', label: 'Joy', icon: '😊' },
  { key: 'knowledge', label: 'Learning', icon: '📚' },
  { key: 'energy', label: 'Energy', icon: '⚡' },
  { key: 'health', label: 'Health', icon: '❤️' },
] as const;


function Wallet({ moondust, starbits }: { moondust: number; starbits: number }) {
  return (
    <div className="pp-wallet-bar">
      <span className="pp-wallet-chip" data-testid="status-moondust"><i aria-hidden="true">🌙</i>{moondust}<small>Moon Dust</small></span>
      <span className="pp-wallet-chip" data-testid="status-starbits"><i aria-hidden="true">⭐</i>{starbits}<small>Starbits</small></span>
    </div>
  );
}


function StatMeter({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="stat-meter" data-testid={`meter-${label.toLowerCase()}`}>
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <div className="stat-bar"><i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
      <span className="stat-label">{label}</span>
    </div>
  );
}


function PetScene({ pet, pose, equipped }: { pet: Pet; pose: 'idle' | 'eating' | 'sleeping' | 'learning' | 'playing'; equipped: Game['equipped'] }) {
  const iconFor = (slot: keyof Game['equipped']) => {
    const id = equipped[slot];
    if (!id) return null;
    return WARDROBE_ITEMS.find((item) => item.id === id)?.icon ?? null;
  };
  const wear = (slot: 'halo' | 'head' | 'eyes' | 'neck' | 'extra') => {
    const icon = iconFor(slot);
    if (!icon) return null;
    return <span key={slot} className={`pp-wear pp-wear-${slot}`} aria-hidden="true">{icon}</span>;
  };
  return (
    <div className="pet-scene">
      {wear('halo')}
      {wear('head')}
      <PetPortrait element={pet.element} pose={pose} />
      {wear('eyes')}
      {wear('neck')}
      {wear('extra')}
    </div>
  );
}


function Onboarding({ game }: { game: Game }) {
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<Element | null>(null);
  const [cracking, setCracking] = useState(false);
  const hasName = !!game.playerName;


  const submitName = (e: FormEvent) => {
    e.preventDefault();
    game.setPlayerName(name);
  };


  const chooseOrb = (element: Element) => {
    if (cracking) return;
    setPicked(element);
    setCracking(true);
    window.setTimeout(() => {
      game.hatch(element);
    }, 1400);
  };


  if (!hasName) {
    return (
      <main className="main-wrap">
        <section className="welcome fade-in">
          <div className="eyebrow">welcome to fern hollow</div>
          <h1>Pixie <span>Palz</span></h1>
          <p>Every pal begins as a mystery orb. First — what should Fern Hollow call you?</p>
        </section>
        <div className="scene-card fade-in delay-1">
          <div className="scene-sun" /><div className="scene-cloud" /><div className="scene-hill back" /><div className="scene-hill" /><div className="scene-hill front" />
          <div className="scene-content">
            <form className="pp-name-form" onSubmit={submitName}>
              <label className="pp-field-label" htmlFor="player-name">Your name</label>
              <input
                id="player-name"
                className="pp-text-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lindsey"
                maxLength={18}
                autoComplete="off"
              />
              <button className="action-primary" type="submit" disabled={!name.trim()}>
                Continue <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }


  return (
    <main className="main-wrap">
      <section className="welcome fade-in">
        <div className="eyebrow">welcome, {game.playerName}</div>
        <h1>Choose <span>your orb</span></h1>
        <p>Five mystery orbs, five pals. Pick the one that's calling to you.</p>
      </section>
      <div className="pp-orb-grid fade-in delay-1">
        {(Object.keys(ELEMENT_META) as Element[]).map((element) => {
          const meta = ELEMENT_META[element];
          const selected = picked === element;
          return (
            <button
              key={element}
              type="button"
              className={`pp-orb${selected ? ' selected' : ''}${cracking && selected ? ' cracking' : ''}`}
              style={{ '--orb-color': meta.color, '--orb-glow': meta.glow } as CSSProperties}
              onClick={() => chooseOrb(element)}
              disabled={cracking}
            >
              <span className="pp-orb-ball"><Egg size={44} strokeWidth={1.4} /></span>
              <b>{meta.species}</b>
              <small>{element} pal</small>
            </button>
          );
        })}
      </div>
      {cracking && picked && (
        <p className="pp-hatch-note" role="status">Something is stirring inside the {picked} orb…</p>
      )}
    </main>
  );
}


function CareHome({ game, onNavigate, activity }: { game: Game; onNavigate: (v: View) => void; activity: ActivityResult | null }) {
  const pet = game.pet;
  if (!pet) return null;
  const info = ELEMENT_META[pet.element];
  const careButtons: { action: CareAction; icon: ReactNode; label: string }[] = [
    { action: 'feed', icon: <UtensilsCrossed size={22} />, label: 'Feed' },
    { action: 'play', icon: <Gamepad2 size={22} />, label: 'Play' },
    { action: 'learn', icon: <BookOpen size={22} />, label: 'Learn' },
    { action: 'sleep', icon: <BedDouble size={22} />, label: 'Sleep' },
  ];
  return (
    <main className="main-wrap">
      <section className="welcome fade-in">
        <div className="eyebrow">{info.habitat}</div>
        <h1>{pet.name} <span>the {pet.element} pal</span></h1>
        <p>{info.tagline}</p>
      </section>
      {activity && (
        <div className="activity-toast fade-in" data-testid="toast-activity">
          <Sparkles size={16} />
          <div>
            <b>{activity.option.name}</b>
            <span>{activity.detail}{activity.reward > 0 ? ` · +${activity.reward} 🌙` : ''}</span>
          </div>
        </div>
      )}
      <div className="scene-card fade-in delay-1">
        <div className="scene-sun" /><div className="scene-cloud" /><div className="scene-hill back" /><div className="scene-hill" /><div className="scene-hill front" />
        <div className="scene-content">
          <PetScene pet={pet} pose="idle" equipped={game.equipped} />
          <div className="stat-row">
            {STAT_META.map((stat) => (
              <StatMeter key={stat.key} label={stat.label} value={pet[stat.key]} icon={stat.icon} />
            ))}
          </div>
        </div>
      </div>
      <nav className="care-nav fade-in delay-2" aria-label="Care actions">
        {careButtons.map(({ action, icon, label }) => (
          <button key={action} type="button" className="care-btn" onClick={() => onNavigate(action)} data-testid={`button-care-${action}`}>
            {icon}<span>{label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}


function ProfileTab({ game }: { game: Game }) {
  const pet = game.pet;
  const [editingPlayer, setEditingPlayer] = useState(false);
  const [playerDraft, setPlayerDraft] = useState(game.playerName ?? '');
  const [editingPet, setEditingPet] = useState(false);
  const [petDraft, setPetDraft] = useState(pet?.name ?? '');


  const savePlayer = (e: FormEvent) => {
    e.preventDefault();
    if (game.setPlayerName(playerDraft)) setEditingPlayer(false);
  };
  const savePet = (e: FormEvent) => {
    e.preventDefault();
    if (game.rename(petDraft)) setEditingPet(false);
  };


  return (
    <main className="main-wrap">
      <section className="welcome fade-in">
        <div className="eyebrow">profile</div>
        <h1>Your <span>story</span></h1>
      </section>
      <div className="pp-profile-card fade-in delay-1">
        <div className="pp-profile-row">
          <span className="pp-profile-icon" aria-hidden="true">👤</span>
          <div className="pp-profile-copy">
            <small>You are</small>
            <b>{game.playerName ?? 'A new friend'}</b>
          </div>
          {!editingPlayer && (
            <button type="button" className="pp-link-btn" onClick={() => { setPlayerDraft(game.playerName ?? ''); setEditingPlayer(true); }}>
              Change
            </button>
          )}
        </div>
        {editingPlayer && (
          <form className="pp-inline-form" onSubmit={savePlayer}>
            <input className="pp-text-input" value={playerDraft} onChange={(e) => setPlayerDraft(e.target.value)} maxLength={18} autoComplete="off" />
            <button className="action-primary" type="submit" disabled={!playerDraft.trim()}>Save</button>
          </form>
        )}
        {pet && (
          <>
            <div className="pp-profile-row">
              <span className="pp-profile-icon" aria-hidden="true">🐾</span>
              <div className="pp-profile-copy">
                <small>Your pal</small>
                <b>{pet.name} · {ELEMENT_META[pet.element].species}</b>
              </div>
              {!editingPet && (
                <button type="button" className="pp-link-btn" onClick={() => { setPetDraft(pet.name); setEditingPet(true); }}>
                  Rename
                </button>
              )}
            </div>
            {editingPet && (
              <form className="pp-inline-form" onSubmit={savePet}>
                <input className="pp-text-input" value={petDraft} onChange={(e) => setPetDraft(e.target.value)} maxLength={18} autoComplete="off" />
                <button className="action-primary" type="submit" disabled={!petDraft.trim()}>Save</button>
              </form>
            )}
            <div className="pp-profile-stats">
              <span>📅 {pet.daysTogether} day{pet.daysTogether === 1 ? '' : 's'} together</span>
              <span>🌙 {game.moondust} Moon Dust</span>
              <span>⭐ {game.starbits} Starbits</span>
            </div>
          </>
        )}
      </div>
      <div className="restart-row">
        <button className="restart-link" type="button" onClick={() => {
          if (window.confirm('Start a new story? Your current pal will be tucked into your memories.')) game.startOver();
        }} data-testid="button-start-over"><RotateCcw size={12} /> Begin a new story</button>
      </div>
    </main>
  );
}


function RestingState({ onRestart }: { onRestart: () => void }) {
  return (
    <main className="main-wrap">
      <section className="welcome fade-in"><div className="eyebrow">a quiet moment in fern hollow</div></section>
      <div className="scene-card dead-scene fade-in delay-1">
        <div className="scene-sun" /><div className="scene-cloud" /><div className="scene-hill back" /><div className="scene-hill" /><div className="scene-hill front" />
        <div className="scene-content dead-copy">
          <h1>Your pal has<br />gone to rest.</h1>
          <p>Thank you for sharing your days together. The love you gave was real, and it stays part of Fern Hollow. When you're ready, another mystery orb is waiting.</p>
          <button className="action-primary" type="button" onClick={onRestart} data-testid="button-new-orb"><Sparkles size={16} /> Begin a new story <ArrowRight size={16} /></button>
        </div>
      </div>
    </main>
  );
}


function FoxSwipe() {
  return (
    <div className="fox-swipe" role="status" aria-live="polite">
      <div className="fox-runner" aria-hidden="true">🦊</div>
      <div className="fox-text">A sneaky fox swiped some Starbits!</div>
    </div>
  );
}


function App() {
  const game = usePetGame();
  const [view, setView] = useState<View>('home');
  const [activity, setActivity] = useState<ActivityResult | null>(null);
  const [showFox, setShowFox] = useState(false);
  const lastSwipeRef = useRef(0);


  useEffect(() => {
    if (game.lastSwipe > lastSwipeRef.current) {
      lastSwipeRef.current = game.lastSwipe;
      setShowFox(true);
      const timer = window.setTimeout(() => setShowFox(false), 2300);
      return () => window.clearTimeout(timer);
    }
    lastSwipeRef.current = game.lastSwipe;
    return () => {};
  }, [game.lastSwipe]);


  const navigate = (next: View) => {
    setView(next);
    if (next !== 'home') setActivity(null);
  };


  const completeActivity = (option: CareOption, detail: string, reward = 0) => {
    if (view !== 'feed' && view !== 'play' && view !== 'learn' && view !== 'sleep') return;
    const action: CareAction = view;
    if (!game.chooseCareOption(action, option.id, option.name)) return;
    if (action === 'play' && reward > 0) {
      game.earnMoonDust(reward);
      game.earnStarbits(Math.max(1, Math.round(reward / 2)));
    } else if (action === 'learn') {
      game.earnMoonDust(6);
      game.earnStarbits(8);
    } else {
      game.earnStarbits(2);
    }
    setActivity({ action, option, detail, reward });
    setView('home');
  };


  const careAction: CareAction | null =
    view === 'feed' || view === 'play' || view === 'learn' || view === 'sleep' ? view : null;
  const poseForView: Record<CareAction, 'eating' | 'playing' | 'learning' | 'sleeping'> = {
    feed: 'eating',
    play: 'playing',
    learn: 'learning',
    sleep: 'sleeping',
  };


  return (
    <div className="game-shell">
      <div className="game-content">
        <header className="brand-header">
          <div className="brand"><Sparkles size={18} /><span>Pixie Palz</span></div>
          <Wallet moondust={game.moondust} starbits={game.starbits} />
        </header>


        {game.phase === 'egg' && <Onboarding game={game} />}


        {game.phase === 'alive' && view === 'home' && game.pet && (
          <CareHome game={game} onNavigate={navigate} activity={activity} />
        )}


        {game.phase === 'alive' && careAction && game.pet && (
          <div className="pp-care-screen">
            <button className="pp-back" type="button" onClick={() => setView('home')} data-testid="button-back-to-pet">
              <ArrowLeft size={15} /> Back to {game.pet.name}
            </button>
            <PetScene pet={game.pet} pose={poseForView[careAction]} equipped={game.equipped} />
            <CareActivities
              key={careAction}
              action={careAction}
              petName={game.pet.name}
              element={game.pet.element}
              moondust={game.moondust}
              onBack={() => setView('home')}
              onComplete={completeActivity}
            />
          </div>
        )}


        {game.phase === 'alive' && view === 'wardrobe' && game.pet && (
          <main className="main-wrap">
            <section className="welcome fade-in">
              <div className="eyebrow">dress-up</div>
              <h1>{game.pet.name}'s <span>wardrobe</span></h1>
            </section>
            <div className="fade-in delay-1">
              <Wardrobe
                element={game.pet.element}
                moondust={game.moondust}
                ownedItems={game.ownedItems}
                equipped={game.equipped}
                onBuy={game.buyItem}
                onEquip={game.equipItem}
              />
            </div>
          </main>
        )}


        {game.phase === 'alive' && view === 'profile' && <ProfileTab game={game} />}


        {game.phase === 'dead' && (
          <RestingState onRestart={() => { setView('home'); setActivity(null); game.startOver(); }} />
        )}


        {game.phase === 'alive' && (view === 'home' || view === 'wardrobe' || view === 'profile') && (
          <nav className="pp-tabbar" aria-label="Main">
            <button type="button" className={`pp-tab${view === 'home' ? ' active' : ''}`} onClick={() => navigate('home')}>
              <House size={20} /><span>Home</span>
            </button>
            <button type="button" className={`pp-tab${view === 'wardrobe' ? ' active' : ''}`} onClick={() => navigate('wardrobe')}>
              <Shirt size={20} /><span>Wardrobe</span>
            </button>
            <button type="button" className={`pp-tab${view === 'profile' ? ' active' : ''}`} onClick={() => navigate('profile')}>
              <UserRound size={20} /><span>Profile</span>
            </button>
          </nav>
        )}


        {game.feedback && (
          <div className="pp-feedback-toast" role="status">{game.feedback}</div>
        )}
        {showFox && <FoxSwipe />}
      </div>
    </div>
  );
}


export default App;
