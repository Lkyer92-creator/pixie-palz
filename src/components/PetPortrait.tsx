type ElementType = 'water' | 'earth' | 'poison' | 'fire' | 'air';
export type PetPose = 'idle' | 'eating' | 'sleeping' | 'learning' | 'playing';

const palettes: Record<ElementType, { main: string; shade: string; light: string; accent: string }> = {
  water: { main: '#76c9cc', shade: '#439da9', light: '#b7e8df', accent: '#f6d987' },
  earth: { main: '#a9c780', shade: '#759b59', light: '#d1e2a6', accent: '#d9a77c' },
  poison: { main: '#b8a0d5', shade: '#876ab1', light: '#dfc9ee', accent: '#9dd28c' },
  fire: { main: '#f0a276', shade: '#c86b59', light: '#ffd49b', accent: '#f7d77d' },
  air: { main: '#a9cbe0', shade: '#729dbb', light: '#d9eff1', accent: '#f1c0ce' },
};

export default function PetPortrait({ element, reacting = false, pose = 'idle' }: { element: ElementType; reacting?: boolean; pose?: PetPose }) {
  const colors = palettes[element] ?? palettes.air;
  return (
    <div className={`pet-display${reacting ? ' reacting' : ''} pose-${pose}`} aria-label={`A little ${element} creature ${pose === 'idle' ? '' : pose}`}>
      <span className="pet-shadow" />
      <svg viewBox="0 0 360 300" role="img" aria-label={`${element} elemental pet`}>
        <defs>
          <linearGradient id="pet-body" x1="0" y1="0" x2=".9" y2="1">
            <stop offset="0%" stopColor={colors.light} />
            <stop offset="100%" stopColor={colors.main} />
          </linearGradient>
          <linearGradient id="pet-belly" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff4d9" />
            <stop offset="100%" stopColor="#f4d9b7" />
          </linearGradient>
        </defs>
        {element === 'air' && <>
          <path d="M99 140C54 87 63 54 99 72c19 10 24 35 30 57M261 140c45-53 36-86 0-68-19 10-24 35-30 57" fill={colors.light} stroke={colors.shade} strokeWidth="5" strokeLinejoin="round" />
          <path d="M84 91l27 30M276 91l-27 30" stroke="#fff8e7" strokeWidth="5" strokeLinecap="round" />
        </>}
        {element === 'water' && <>
          <path d="M105 164c-34-31-33-58-12-65 19-6 33 18 44 39M255 164c34-31 33-58 12-65-19-6-33 18-44 39" fill={colors.light} stroke={colors.shade} strokeWidth="5" />
          <path d="M180 45c-19 27-24 37-24 48a24 24 0 0 0 48 0c0-11-5-21-24-48Z" fill={colors.accent} stroke="#fff4ce" strokeWidth="4" />
        </>}
        {element === 'earth' && <>
          <path d="M111 115 92 71q-4-17 14-9l36 27M249 115l19-44q4-17-14-9l-36 27" fill={colors.light} stroke={colors.shade} strokeWidth="5" strokeLinejoin="round" />
          <path d="m112 96 20 13m116-13-20 13" stroke={colors.accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M167 62q13-17 26 0" fill="none" stroke={colors.accent} strokeWidth="6" strokeLinecap="round" />
        </>}
        {element === 'poison' && <>
          <path d="m120 133-23-19 6 36m137-17 23-19-6 36" fill={colors.accent} stroke={colors.shade} strokeWidth="5" strokeLinejoin="round" />
          <circle cx="94" cy="87" r="10" fill={colors.accent} opacity=".85" />
          <circle cx="268" cy="87" r="7" fill={colors.accent} opacity=".75" />
          <path d="M180 59c-15 18-16 28-7 32 7 3 16-4 18-10 9 6 19-5 12-13-7-7-17-10-23-9Z" fill={colors.light} stroke={colors.shade} strokeWidth="4" />
        </>}
        {element === 'fire' && <>
          <path d="M123 116c-23-41-1-63 18-81 1 25 18 31 17 54m63 27c23-41 1-63-18-81-1 25-18 31-17 54" fill={colors.accent} stroke={colors.shade} strokeWidth="5" strokeLinejoin="round" />
          <path d="M125 166c-29 0-39-18-30-35 15 16 27 10 37-2m103 37c29 0 39-18 30-35-15 16-27 10-37-2" fill="none" stroke={colors.shade} strokeWidth="7" strokeLinecap="round" />
        </>}
        <ellipse cx="180" cy="181" rx="91" ry="93" fill="url(#pet-body)" stroke={colors.shade} strokeWidth="6" />
        <ellipse cx="180" cy="207" rx="54" ry="48" fill="url(#pet-belly)" opacity=".97" />
        <ellipse cx="180" cy="253" rx="25" ry="12" fill={colors.shade} opacity=".86" />
        <ellipse cx="132" cy="255" rx="19" ry="11" fill={colors.main} stroke={colors.shade} strokeWidth="4" />
        <ellipse cx="228" cy="255" rx="19" ry="11" fill={colors.main} stroke={colors.shade} strokeWidth="4" />
        {pose === 'sleeping' ? <>
          <path d="M135 175q12 10 24 0m42 0q12 10 24 0" fill="none" stroke="#453c57" strokeWidth="5" strokeLinecap="round" />
          <path d="M169 189q11 8 22 0" fill="none" stroke="#9b6269" strokeWidth="3" strokeLinecap="round" />
        </> : <>
          <ellipse cx="147" cy="174" rx="11" ry="15" fill="#453c57" />
          <ellipse cx="213" cy="174" rx="11" ry="15" fill="#453c57" />
          <circle cx="150" cy="169" r="3.5" fill="white" /><circle cx="216" cy="169" r="3.5" fill="white" />
        </>}
        <ellipse cx="127" cy="194" rx="11" ry="6" fill="#ed9895" opacity=".7" />
        <ellipse cx="233" cy="194" rx="11" ry="6" fill="#ed9895" opacity=".7" />
        {pose === 'eating'
          ? <ellipse cx="180" cy="194" rx="7" ry="9" fill="#9b6269" />
          : pose !== 'sleeping' && <path d="M173 190q7 7 14 0" fill="none" stroke="#9b6269" strokeWidth="3" strokeLinecap="round" />}
        <path d="M164 149q8-6 16 0m20 0q8-6 16 0" fill="none" stroke={colors.shade} strokeWidth="4" strokeLinecap="round" />
        <path d="M180 72v-13" stroke="#fff9e9" strokeWidth="4" strokeLinecap="round" opacity=".8" />
        <circle cx="175" cy="113" r="5" fill="#fff9e9" opacity=".65" />
      </svg>
    </div>
  );
}
