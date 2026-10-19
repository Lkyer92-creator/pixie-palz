import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getPetCareOptions, type CareAction, type CareOption, type Element } from '../game';
import './CareActivities.css';
import './MiniGames.css';

type Props = {
  action: CareAction;
  petName: string;
  element: Element;
  moondust: number;
  onComplete: (option: CareOption, detail: string, reward: number) => void;
  onBack: () => void;
};

type OptionWithEmoji = CareOption & { emoji: string };
type Subject = 'Reading' | 'Math' | 'Science' | 'Writing';
type GameKind = 'blocks' | 'pairs' | 'sequence' | 'aim';

const meta: Record<CareAction, { title: string; kicker: string; intro: string }> = {
  feed: { title: 'Snack time', kicker: 'Feed', intro: 'Pick a tasty treat for' },
  play: { title: 'Play time', kicker: 'Play', intro: 'Choose a game to play with' },
  learn: { title: 'Learn together', kicker: 'Learn', intro: 'Pick a lesson to explore with' },
  sleep: { title: 'Bedtime', kicker: 'Sleep', intro: 'Tuck into a cozy rest with' },
};

const ELEMENT_COLORS: Record<Element, string> = {
  water: '#4aa8ff',
  earth: '#6fbf4a',
  poison: '#a06be8',
  fire: '#ff7a3d',
  air: '#57c7d4',
};

const subjects: { name: Subject; icon: string; tag: string }[] = [
  { name: 'Reading', icon: '📖', tag: 'Stories & words' },
  { name: 'Math', icon: '🔢', tag: 'Numbers & puzzles' },
  { name: 'Science', icon: '🔬', tag: 'Nature & discovery' },
  { name: 'Writing', icon: '✏️', tag: 'Ideas & tales' },
];

const gameInfo: Record<GameKind, { name: string; blurb: string; howto: string; reward: string }> = {
  blocks: {
    name: 'Tumble Tiles',
    blurb: 'Fit the falling shapes into the tray.',
    howto: 'Use the ◀ ▶ buttons to move, and the ⟳ button to spin the piece. Fill a whole row to clear it.',
    reward: '+18 Joy · earn Moon Dust',
  },
  pairs: {
    name: 'Matching Orbs',
    blurb: 'Find the hidden pairs in the garden.',
    howto: 'Tap two orbs to flip them. Match all the pairs to win.',
    reward: '+18 Joy · earn Moon Dust',
  },
  sequence: {
    name: 'Fern-path Memory',
    blurb: 'Repeat the glowing stone pattern.',
    howto: 'Watch the stones light up, then tap them in the same order.',
    reward: '+18 Joy · earn Moon Dust',
  },
  aim: {
    name: 'Laserball',
    blurb: 'Aim the comet at the moving target.',
    howto: 'Drag the sliders to set angle and power, then press Launch.',
    reward: '+18 Joy · earn Moon Dust',
  },
};

const lessonCopy: Record<Subject, { title: string; stem: string; recall: string }> = {
  Reading: {
    title: 'The Brave Little Seed',
    stem: 'A tiny seed slept under the soil. One rainy morning, it felt a tickle and pushed up toward the light.',
    recall: 'What woke the seed up?',
  },
  Math: {
    title: 'Five Fireflies',
    stem: 'Five fireflies glowed in the garden. Two flew home for dinner.',
    recall: 'How many fireflies are still glowing?',
  },
  Science: {
    title: 'Why Leaves Change',
    stem: 'In autumn, leaves turn red and gold. The tree pulls its green color back into its branches for winter.',
    recall: 'Where does the green color go?',
  },
  Writing: {
    title: 'A Door in the Garden',
    stem: 'You find a tiny door at the bottom of an old tree. Something sparkles behind it.',
    recall: 'What do you think is behind the door?',
  },
};

const lessonContent: Record<Subject, { title: string; stem: string; recall: string; choices: string[]; answer: string; praise: string }> = {
  Reading: {
    title: 'The Brave Little Seed',
    stem: 'A tiny seed slept under the soil. One rainy morning, it felt a tickle and pushed up toward the light.',
    recall: 'What woke the seed up?',
    choices: ['A rainy morning', 'A loud drum', 'A snowstorm'],
    answer: 'A rainy morning',
    praise: 'You read with a wonderful imagination!',
  },
  Math: {
    title: 'Five Fireflies',
    stem: 'Five fireflies glowed in the garden. Two flew home for dinner.',
    recall: 'How many fireflies are still glowing?',
    choices: ['3', '5', '7'],
    answer: '3',
    praise: 'Brilliant counting, mathematician!',
  },
  Science: {
    title: 'Why Leaves Change',
    stem: 'In autumn, leaves turn red and gold. The tree pulls its green color back into its branches for winter.',
    recall: 'Where does the green color go?',
    choices: ['Into the branches', 'Into the clouds', 'Into the river'],
    answer: 'Into the branches',
    praise: 'You think like a true scientist!',
  },
  Writing: {
    title: 'A Door in the Garden',
    stem: 'You find a tiny door at the bottom of an old tree. Something sparkles behind it.',
    recall: 'What do you think is behind the door?',
    choices: ['A fairy workshop', 'An empty box', 'A pile of socks'],
    answer: 'A fairy workshop',
    praise: 'What a magical imagination you have!',
  },
};

const PAIR_EMOJIS = ['🌙', '⭐', '🌸', '🍄', '🐚', '🔮'];

function OptionCard({ option, emoji, moondust, onPick, testId }: { option: CareOption; emoji: string; moondust: number; onPick: () => void; testId: string }) {
  const locked = moondust < option.cost;
  return (
    <button type="button" className="pp-option" onClick={onPick} disabled={locked} data-testid={testId}>
      <span className="pp-option-icon" data-action={option.id}>{emoji}</span>
      <span className="pp-option-name">{option.name}</span>
      <span className="pp-option-desc">{option.description}</span>
      <span className="pp-option-benefit">{option.benefit}</span>
      <span className="pp-option-cost">{option.cost === 0 ? 'Free' : `🌙 ${option.cost}`}</span>
      {locked && <span className="pp-option-locked">Need {option.cost - moondust} more Moon Dust</span>}
    </button>
  );
}

function MiniGame({ kind, gameName, element, onDone }: { kind: GameKind; gameName: string; element: Element; onDone: (reward: number, detail: string) => void }) {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'levelDone' | 'done'>('intro');
  const [level, setLevel] = useState(1);
  const [reward, setReward] = useState(0);
  const [blocks, setBlocks] = useState<number[]>([]);
  const [activeBlock, setActiveBlock] = useState(0);
  const [blockPos, setBlockPos] = useState(0);
  const [blockRot, setBlockRot] = useState(0);
  const [deck, setDeck] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [glowing, setGlowing] = useState<number | null>(null);
  const [showingSeq, setShowingSeq] = useState(false);
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(60);
  const [comet, setComet] = useState<{ x: number; y: number } | null>(null);
  const [target, setTarget] = useState({ x: 80, y: 20 });
  const timer = useRef<number | null>(null);

  const resetRound = useCallback(() => {
    setBlocks(Array.from({ length: 12 }, () => Math.floor(Math.random() * 4)));
    setActiveBlock(0); setBlockPos(1); setBlockRot(0);
    const emojis = [...PAIR_EMOJIS].sort(() => Math.random() - 0.5).slice(0, 4);
    setDeck([...emojis, ...emojis].sort(() => Math.random() - 0.5));
    setFlipped([]); setMatched([]);
    const seq = Array.from({ length: 3 + level }, () => Math.floor(Math.random() * 4));
    setSequence(seq); setPlayerSeq([]); setGlowing(null); setShowingSeq(false);
    setComet(null);
    setTarget({ x: 60 + Math.random() * 30, y: 10 + Math.random() * 30 });
  }, [level]);

  const startGame = () => { resetRound(); setPhase('playing'); };
  const nextLevel = () => { setLevel((l) => l + 1); setPhase('playing'); };

  useEffect(() => {
    if (phase === 'playing' && kind === 'sequence' && sequence.length > 0 && !showingSeq && playerSeq.length === 0) {
      setShowingSeq(true);
      let i = 0;
      const show = () => {
        if (i < sequence.length) {
          setGlowing(sequence[i]);
          setTimeout(() => { setGlowing(null); setTimeout(() => { i++; show(); }, 250); }, 600);
        } else {
          setShowingSeq(false);
        }
      };
      show();
    }
  }, [phase, kind, sequence, showingSeq, playerSeq.length]);

  const clearLevel = () => {
    const r = 10 + level * 4;
    setReward((x) => x + r);
    if (level >= 3) {
      setPhase('done');
      onDone(reward + r, `${gameName} — cleared all 3 levels!`);
    } else {
      setPhase('levelDone');
    }
  };

  const dropBlock = () => {
    clearLevel();
  };

  const flipCard = (idx: number) => {
    if (flipped.length >= 2 || flipped.includes(idx) || matched.includes(idx)) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      if (deck[next[0]] === deck[next[1]]) {
        setTimeout(() => {
          setMatched((m) => [...m, ...next]);
          setFlipped([]);
          if (matched.length + 2 >= deck.length) clearLevel();
        }, 600);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  const playSequence = (idx: number) => {
    if (showingSeq) return;
    const next = [...playerSeq, idx];
    setPlayerSeq(next);
    setGlowing(idx);
    setTimeout(() => setGlowing(null), 350);
    if (next.length === sequence.length) {
      const correct = next.every((v, i) => v === sequence[i]);
      if (correct) {
        setTimeout(() => clearLevel(), 500);
      } else {
        setTimeout(() => { setPlayerSeq([]); }, 800);
      }
    }
  };

  const pressGlow = (idx: number) => playSequence(idx);

  const shootComet = () => {
    setComet({ x: 10, y: 90 });
    let t = 0;
    const animate = () => {
      t += 0.08;
      const x = 10 + t * 80;
      const y = 90 - t * 70 + t * t * 20;
      setComet({ x, y });
      const dx = x - target.x, dy = y - target.y;
      if (Math.sqrt(dx * dx + dy * dy) < 12) {
        clearLevel();
        return;
      }
      if (t < 1.2) {
        timer.current = window.setTimeout(animate, 50);
      } else {
        setComet(null);
      }
    };
    animate();
  };

  if (phase === 'intro') {
    const info = gameInfo[kind];
    return (
      <div className="pp-mini-intro">
        <span className="pp-mini-intro-star" style={{ '--star-color': ELEMENT_COLORS[element] } as React.CSSProperties}>⭐</span>
        <h2>{info.name}</h2>
        <p className="pp-mini-line">{info.blurb}</p>
        <p className="pp-mini-howto">{info.howto}</p>
        <p className="pp-mini-reward"><b>{info.reward}</b></p>
        <button type="button" className="action-primary pp-start-btn" onClick={startGame}>Start! 🎮</button>
      </div>
    );
  }

  if (phase === 'levelDone') {
    return (
      <div className="pp-mini-intro">
        <span className="pp-mini-intro-star">🎉</span>
        <h2>Level {level} cleared!</h2>
        <p className="pp-mini-line">Moon Dust earned so far: 🌙 {reward}</p>
        <div className="pp-mini-level-actions">
          <button type="button" className="action-primary" onClick={nextLevel}>Next level →</button>
        </div>
      </div>
    );
  }

  if (phase === 'done') return null;

  return (
    <div className="pp-mini-game">
      <div className="pp-mini-level">Level {level} of 3 · 🌙 {reward}</div>
      {kind === 'blocks' && (
        <div className="pp-blocks-board">
          <div className="pp-blocks-tray">
            {blocks.map((b, i) => (
              <span key={i} className={`pp-block${i < activeBlock ? ' cleared' : ''}`}>🟪</span>
            ))}
          </div>
          <div className="pp-blocks-controls">
            <button type="button" onClick={() => setBlockPos((p) => Math.max(0, p - 1))}>◀</button>
            <button type="button" onClick={() => setBlockRot((r) => (r + 1) % 4)}>⟳</button>
            <button type="button" onClick={() => setBlockPos((p) => Math.min(2, p + 1))}>▶</button>
            <button type="button" className="action-primary" onClick={dropBlock}>Drop ⬇</button>
          </div>
        </div>
      )}
      {kind === 'pairs' && (
        <div className="pp-pairs-board">
          {deck.map((emoji, i) => (
            <button
              key={i}
              type="button"
              className={`pp-orb${flipped.includes(i) || matched.includes(i) ? ' flipped' : ''}`}
              onClick={() => flipCard(i)}
            >
              <span className="pp-north-star" style={{ '--star-color': ELEMENT_COLORS[element] } as React.CSSProperties}>
                {flipped.includes(i) || matched.includes(i) ? emoji : '✦'}
              </span>
            </button>
          ))}
        </div>
      )}
      {kind === 'sequence' && (
        <div className="pp-sequence-board">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              type="button"
              className={`pp-glow${glowing === i ? ' lit' : ''}`}
              style={{ '--star-color': ELEMENT_COLORS[element] } as React.CSSProperties}
              onClick={() => pressGlow(i)}
              disabled={showingSeq}
            >
              {['🟦', '🟩', '🟨', '🟥'][i]}
            </button>
          ))}
          <p className="pp-mini-howto">{showingSeq ? 'Watch carefully…' : 'Repeat the pattern!'}</p>
        </div>
      )}
      {kind === 'aim' && (
        <div className="pp-aim-board">
          <svg viewBox="0 0 100 100" className="pp-aim-svg">
            <circle cx={target.x} cy={target.y} r="6" fill={ELEMENT_COLORS[element]} />
            {comet && <circle cx={comet.x} cy={comet.y} r="3" fill="#ffd76a" />}
            <line x1="10" y1="90" x2="10 + 40 * Math.cos(angle * Math.PI / 180)" y2="90 - 40 * Math.sin(angle * Math.PI / 180)" stroke="#999" strokeWidth="1" />
          </svg>
          <label>Angle: {angle}°<input type="range" min={10} max={80} value={angle} onChange={(e) => setAngle(Number(e.target.value))} /></label>
          <label>Power: {power}%<input type="range" min={20} max={100} value={power} onChange={(e) => setPower(Number(e.target.value))} /></label>
          <button type="button" className="action-primary" onClick={shootComet}>Launch 🚀</button>
        </div>
      )}
    </div>
  );
}

export default function CareActivities({ action, petName, element, moondust, onComplete, onBack }: Props) {
  const [selectedOption, setSelectedOption] = useState<CareOption | null>(null);
  const [activeGame, setActiveGame] = useState<GameKind | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [lesson, setLesson] = useState<(typeof lessonContent)[Subject] | null>(null);
  const [lessonStep, setLessonStep] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const options = useMemo(() => {
    const base = getPetCareOptions(action, element);
    const emojiMap: Record<CareAction, string[]> = {
      feed: ['🍓', '🍰', '🥤'],
      play: ['🧩', '🔮', '🌿', '🎯'],
      learn: ['📖', '🔢', '🔬', '✏️'],
      sleep: ['🛏️', '🌙', '☁️'],
    };
    return base.map((opt, i) => ({ ...opt, emoji: emojiMap[action][i % emojiMap[action].length] }));
  }, [action, element]);

  const gameOptionIds: Record<GameKind, string> = {
    blocks: 'tumble-tiles',
    pairs: 'matching-orbs',
    sequence: 'fern-memory',
    aim: 'laserball',
  };

  const lessonOptions = useMemo(() => {
    return subjects.map((s) => {
      const opt = options.find((o) => o.id === `lesson-${s.name.toLowerCase()}`);
      return { subject: s, option: opt! };
    }).filter((x) => x.option);
  }, [options]);

  const startLesson = (name: Subject, option: CareOption) => {
    setSubject(name);
    setLesson(lessonContent[name]);
    setLessonStep(0);
    setAnswer(null);
    setChecked(false);
    setSelectedOption(option);
  };

  const finishLesson = () => {
    if (!lesson || !selectedOption) return;
    onComplete(selectedOption, `${lesson.title} — ${lesson.praise}`, 0);
  };

  const advanceLesson = () => {
    if (lessonStep === 0) {
      setLessonStep(1);
    } else if (lessonStep === 1) {
      if (answer === lesson?.answer) {
        setChecked(true);
        setTimeout(() => setLessonStep(2), 1200);
      } else {
        setChecked(true);
      }
    } else {
      finishLesson();
    }
  };

  return (
    <div className="pp-care">
      <div className="pp-care-inner">
        <header className="pp-care-head">
          <button className="pp-back" type="button" onClick={onBack}><ArrowLeft size={15} />Back</button>
          <div className="pp-heading-copy">
            <span className="pp-eyebrow">{meta[action].kicker}</span>
            <h1>{meta[action].title}</h1>
            <p>{meta[action].intro} <b>{petName}</b>.</p>
          </div>
          <span className="pp-wallet"><i>🌙</i>{moondust}<small>Moon Dust</small></span>
        </header>
        <p className="pp-personal-note">Made special for a {element} pal 💜</p>
        {(action === 'feed' || action === 'sleep') && (
          <section className="pp-options-section">
            <div className="pp-section-title">
              <div><span className="pp-kicker">Choose a treat</span><h2>What sounds yummy?</h2></div>
              <span className="pp-count">{options.length} options</span>
            </div>
            <div className="pp-options-grid">
              {options.map((opt) => (
                <OptionCard key={opt.id} option={opt} emoji={opt.emoji} moondust={moondust} onPick={() => onComplete(opt, opt.description, 0)} testId={`option-${opt.id}`} />
              ))}
            </div>
          </section>
        )}
        {action === 'play' && !activeGame && (
          <section className="pp-options-section">
            <div className="pp-section-title">
              <div><span className="pp-kicker">Choose a game</span><h2>What shall we play?</h2></div>
            </div>
            <div className="pp-options-grid">
              {(Object.keys(gameInfo) as GameKind[]).map((k) => {
                const opt = options.find((o) => o.id === gameOptionIds[k]);
                return (
                  <button key={k} type="button" className="pp-option" onClick={() => {
                    setSelectedOption(opt ?? null);
                    setActiveGame(k);
                  }}>
                    <span className="pp-option-icon">🎮</span>
                    <span className="pp-option-name">{gameInfo[k].name}</span>
                    <span className="pp-option-desc">{gameInfo[k].blurb}</span>
                    <span className="pp-option-benefit">{gameInfo[k].reward}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
        {action === 'play' &&
          activeGame && selectedOption && (
            <MiniGame kind={activeGame} gameName={selectedOption.name} element={element} onDone={(reward, detail) => onComplete(selectedOption, detail, reward)} />
          )}
        {action === 'learn' && !subject && (
          <section className="pp-options-section">
            <div className="pp-section-title">
              <div><span className="pp-kicker">Choose your lesson</span><h2>What shall we explore?</h2></div>
            </div>
            <div className="pp-subject-grid">
              {lessonOptions.map(({ subject: item, option }) => (
                <button key={item.name} type="button" className="pp-subject-card" onClick={() => startLesson(item.name, option)} data-testid={`subject-${item.name.toLowerCase()}`}>
                  <span className={`pp-subject-mark subject-${item.name.toLowerCase()}`}>{item.icon}</span>
                  <span className="pp-subject-copy"><b>{item.name}</b><small>{item.tag}</small></span>
                  <span className="pp-subject-cost">{option.cost === 0 ? 'Free' : `🌙 ${option.cost}`}</span>
                  <span className="pp-subject-desc">{option.description}</span>
                  <span className="pp-subject-benefit">{option.benefit}</span>
                  {moondust < option.cost && <span className="pp-lock-copy">Need {option.cost - moondust} more Moon Dust</span>}
                </button>
              ))}
            </div>
            <p className="pp-footnote">Each lesson has a story, a question, and a proud finish.</p>
          </section>
        )}
        {action === 'learn' && subject && lesson && (
          <section className="pp-lesson" data-testid="panel-lesson">
            <div className="pp-lesson-top">
              <button className="pp-back" type="button" onClick={() => { setSubject(null); setSelectedOption(null); setLessonStep(0); }} data-testid="button-lesson-back"><ArrowLeft size={15} />Lessons</button>
              <span className="pp-lesson-progress" data-testid="status-lesson-progress">Lesson {lessonStep + 1} of 3</span>
            </div>
            <div className="pp-lesson-content">
              <div className="pp-lesson-illustration" aria-hidden="true"><span>{lessonStep === 1 ? '?' : lessonStep === 2 ? '✓' : '✦'}</span></div>
              {lessonStep === 0 && (
                <div className="pp-lesson-copy">
                  <span className="pp-kicker">{subject} with {petName}</span>
                  <h2>{lesson.title}</h2>
                  <p className="pp-lesson-line">{lesson.stem}</p>
                  <p className="pp-lesson-line">{lesson.recall}</p>
                </div>
              )}
              {lessonStep === 1 && (
                <div className="pp-lesson-copy">
                  <span className="pp-kicker">Your turn</span>
                  <h2>{lesson.title}</h2>
                  <p className="pp-lesson-line">{lesson.stem}</p>
                  <div className="pp-answers">
                    {lesson.choices.map((choice) => (
                      <button key={choice} type="button" className={`pp-answer${answer === choice ? ' picked' : ''}`} onClick={() => setAnswer(choice)} data-testid={`answer-${choice}`}>
                        {choice}
                      </button>
                    ))}
                  </div>
                  {checked && (
                    <p className={`pp-answer-feedback${answer === lesson.answer ? ' right' : ''}`} role="status">
                      {answer === lesson.answer ? lesson.praise : 'Not quite — try again!'}
                    </p>
                  )}
                </div>
              )}
              {lessonStep === 2 && (
                <div className="pp-lesson-copy">
                  <span className="pp-kicker">Proud finish</span>
                  <h2>{lesson.praise}</h2>
                  <p className="pp-lesson-line">{petName} loved learning {subject.toLowerCase()} with you.</p>
                </div>
              )}
              <div className="pp-lesson-actions">
                {lessonStep < 2 ? (
                  <button type="button" className="action-primary" onClick={advanceLesson} data-testid="button-lesson-next">
                    {lessonStep === 0 ? 'Start question →' : 'Check answer ✓'}
                  </button>
                ) : (
                  <button type="button" className="action-primary" onClick={finishLesson} data-testid="button-lesson-finish">
                    Finish lesson 🎉
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
