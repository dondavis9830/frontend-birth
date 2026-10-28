import { useMemo, useState } from 'react';
import { Eye, Sparkles } from 'lucide-react';

const SECRET = 'AMRITHA';
const DECOR = ['✦', '•', '◌', '⬢', '✧', '◍', '✺', '◐', '◒', '✹'];

function buildMysteryTiles() {
  const tiles = Array.from({ length: 36 }, (_, index) => ({
    id: index,
    char: DECOR[index % DECOR.length],
    isSecret: false,
  }));

  const positions = [
    2, 5, 8, 12, 15, 19, 22, 27, 31, 34,
  ];

  SECRET.split('').forEach((letter, index) => {
    const targetIndex = positions[index] ?? (index * 3 + 1) % tiles.length;
    tiles[targetIndex] = { id: `letter-${index}`, char: letter, isSecret: true };
  });

  return tiles;
}

export default function HiddenLetterGame() {
  const [guess, setGuess] = useState('');
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState('Find the hidden letters in the picture.');

  const tiles = useMemo(() => buildMysteryTiles(), []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalized = guess.replace(/\s+/g, '').toUpperCase();

    if (normalized === SECRET) {
      setSolved(true);
      setMessage('Correct! You found the hidden letters.');
      return;
    }

    setSolved(false);
    setMessage('Not yet. Look closely at the image and find the hidden letters.');
  };

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-slate-950/75 p-4 shadow-xl backdrop-blur-md sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/15 text-purple-300">
          <Eye size={18} />
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold text-purple-100">Hidden Letter Mystery</h3>
          <p className="text-sm text-purple-200/60">Find the letters hidden inside the image.</p>
        </div>
      </div>

      <div
        className="relative mb-4 overflow-hidden rounded-2xl border border-purple-500/25 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.35),_rgba(15,23,42,0.95)_40%,_rgba(2,6,23,1)_100%)] p-4"
        aria-label="Hidden word image puzzle"
      >
        <div className="grid grid-cols-6 gap-2">
          {tiles.map((tile, index) => (
            <div
              key={`${tile.id}-${index}`}
              className={[
                'flex h-10 items-center justify-center rounded-md border text-sm font-bold transition-all',
                tile.isSecret
                  ? 'border-purple-300/10 bg-purple-500/5 text-purple-200/20 blur-[1px] opacity-30 rotate-[-6deg]'
                  : 'border-white/10 bg-white/5 text-violet-200/70 opacity-90',
              ].join(' ')}
              style={{
                transform: tile.isSecret ? `rotate(${(index % 2 === 0 ? -1 : 1) * 8}deg)` : 'none',
                boxShadow: tile.isSecret ? 'inset 0 0 10px rgba(168, 85, 247, 0.12)' : 'none',
              }}
            >
              {tile.char}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-purple-300/60">
        <Sparkles size={12} />
        <span>Find the letters</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor="hidden-letter-game" className="sr-only">
          Enter the hidden letters
        </label>
        <input
          id="hidden-letter-game"
          type="text"
          value={guess}
          onChange={(event) => setGuess(event.target.value)}
          placeholder="Type the hidden letters"
          className="w-full rounded-lg border border-purple-500/30 bg-slate-900/70 px-4 py-3 text-purple-100 outline-none placeholder:text-purple-300/35 focus:border-purple-300"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-3 font-medium text-slate-950 transition-opacity hover:opacity-90"
        >
          Reveal the answer
        </button>
      </form>

      <p className={`mt-3 text-center text-sm ${solved ? 'text-green-300' : 'text-purple-200/75'}`}>
        {message}
      </p>
    </div>
  );
}
