import { useMemo, useState } from 'react';
import { Gift, LockKeyhole, Search, Sparkles, Star } from 'lucide-react';

const SECRET = 'AMRITHA';
const CLUES = [
  'This is the name of the birthday star of the day.',
  'It starts with A and has 7 letters.',
  'It is full of warmth, guidance, and inspiration.',
  'The answer is the name behind this whole surprise.',
];

export default function AmrithaPasswordGame({ onSolve, value, onChange }) {
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState('');
  const [attempts, setAttempts] = useState(0);

  const hint = useMemo(() => {
    return SECRET.split('').map((letter, index) => ({
      letter,
      visible: index === 0 || index === 2 || index === 5,
    }));
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalized = guess.trim().toLowerCase();
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (normalized === 'amritha' || normalized === 'amritha maam' || normalized === 'amritha ma’am') {
      const solvedPassword = 'amritha';
      onChange?.(solvedPassword);
      onSolve?.(solvedPassword);
      setGuess('');
      setResult('Correct! The hidden password is unlocked.');
      return;
    }

    const messages = [
      'Not yet. The clue is hidden in the name of the birthday star.',
      'Close... think of the person this celebration is for.',
      'Almost there. It is the one we are celebrating today.',
      'Try again — the answer is the name behind the surprise.',
    ];

    setResult(messages[Math.min(nextAttempts - 1, messages.length - 1)]);
  };

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-slate-950/70 p-4 shadow-lg backdrop-blur-md sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/15 text-purple-300">
          <Search size={18} />
        </span>
        <div>
          <h3 className="font-display text-lg text-purple-100">Mystery Password</h3>
          <p className="text-sm text-purple-200/60">A small birthday puzzle for Amritha Ma’am.</p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-cyan-100/80">
        <div className="mb-2 flex items-center gap-2 text-cyan-300">
          <LockKeyhole size={14} />
          <span>Hidden clue</span>
        </div>
        <p>The answer is a person, not a number. Look for the name behind the surprise.</p>
      </div>

      <div className="mb-4 flex justify-center gap-2">
        {hint.map(({ letter, visible }, index) => (
          <span
            key={`${letter}-${index}`}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold ${
              visible
                ? 'border-purple-400/60 bg-purple-500/15 text-purple-100'
                : 'border-slate-700 bg-slate-900 text-slate-600'
            }`}
          >
            {visible ? letter : '?'}
          </span>
        ))}
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        {CLUES.map((clue, index) => (
          <div
            key={clue}
            className="rounded-xl border border-pink-500/20 bg-pink-500/5 px-3 py-2 text-xs text-pink-100/80"
          >
            <div className="mb-1 flex items-center gap-2 text-pink-300">
              {index % 2 === 0 ? <Sparkles size={12} /> : <Star size={12} />}
              <span>Clue {index + 1}</span>
            </div>
            <p>{clue}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor="amritha-password-game" className="sr-only">
          Guess the hidden password
        </label>
        <input
          id="amritha-password-game"
          type="text"
          value={guess}
          onChange={(event) => {
            setGuess(event.target.value);
            if (value !== undefined) onChange?.(event.target.value);
          }}
          placeholder="Type the secret name"
          className="w-full rounded-lg border border-purple-500/30 bg-slate-900/70 px-4 py-3 text-purple-100 outline-none placeholder:text-purple-300/35 focus:border-purple-300"
        />

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-pink-400 to-purple-400 px-4 py-3 font-medium text-slate-950 transition-opacity hover:opacity-90"
        >
          <Gift size={16} />
          Unlock the surprise
        </button>

        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-purple-300/55">
          <span>Attempts: {attempts}</span>
          <span>{attempts >= 2 ? 'Think harder' : 'Warm start'}</span>
        </div>

        {result && (
          <p className="text-center text-sm text-purple-200/75">{result}</p>
        )}
      </form>
    </div>
  );
}
