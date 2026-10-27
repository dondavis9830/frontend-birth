import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CornerDownLeft, Terminal } from 'lucide-react';
import { apiUrl, readApiResponse } from '../lib/api';

const COMMANDS = [
  '$ initializing special_project...',
  '$ loading memories...',
  '$ compiling gratitude...',
  '$ checking happiness levels...',
  "$ trainer detected: Amritha Ma'am",
  '$ surprise status: READY',
];

export default function TerminalIntro({ onAccess }) {
  const [printed, setPrinted] = useState([]);
  const [showPasswords, setShowPasswords] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let index = 0;
    let cancelled = false;
    const timers = [];

    const typeNext = () => {
      if (cancelled) return;
      if (index >= COMMANDS.length) {
        timers.push(setTimeout(() => setShowPasswords(true), 500));
        return;
      }

      const command = COMMANDS[index];
      setPrinted((previous) => [...previous, command]);
      index += 1;
      timers.push(setTimeout(typeNext, 650));
    };

    timers.push(setTimeout(typeNext, 600));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  const acceptAccess = (data) => {
    setAccepted(true);
    setTimeout(() => onAccess(data), 700);
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    setError('');
    if (!password) {
      setError('Enter the password first.');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(apiUrl('/api/access/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await readApiResponse(response);

      setPassword('');
      if (!data.token || !['birthday', 'wish'].includes(data.page)) {
        throw new Error('The API response is missing a valid page-access token.');
      }
      acceptAccess(data);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'Cannot connect to the password service. Start the backend and configure server/.env.'
          : requestError.message
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.section
      className="relative flex min-h-screen items-center justify-center px-4 py-16"
      initial={{ opacity: 1 }}
      animate={{ opacity: accepted ? 0 : 1 }}
      transition={{ duration: 0.7 }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
        <FloatingChars />
      </div>

      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-950/80 shadow-[0_0_50px_rgba(168,85,247,0.25)] backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-purple-500/20 bg-slate-900/80 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-3 flex items-center gap-2 font-mono text-xs text-purple-200/70">
            <Terminal size={13} className="text-purple-400" />
            amritha_birthday_surprise — terminal
          </span>
        </div>

        <div className="space-y-1.5 px-5 py-6 font-mono text-sm leading-relaxed sm:px-7 sm:text-[15px]">
          {printed.map((line, index) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={
                line.includes('READY')
                  ? 'text-yellow-300'
                  : line.includes('Amritha')
                    ? 'text-pink-400'
                    : 'text-purple-100/85'
              }
            >
              {line}
              {index === COMMANDS.length - 1 && (
                <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-purple-400 align-middle" />
              )}
            </motion.div>
          ))}

          <AnimatePresence>
            {showPasswords && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 pt-4"
              >
                <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-3.5 py-2.5 text-pink-300">
                  WARNING: An unusually special person has a birthday today.
                </div>
                <p className="font-sans text-purple-200/80">
                  This experience was created with love by your students. Enter the password
                  for the page you want to open.
                </p>

                <form
                  onSubmit={submitPassword}
                  className="mx-auto w-full max-w-xl rounded-2xl border border-purple-500/25 bg-slate-950/75 p-5 shadow-xl backdrop-blur-md sm:p-7"
                >
                  <label
                    htmlFor="intro-password"
                    className="mb-2 block text-sm font-medium text-purple-100"
                  >
                    Enter password
                  </label>
                  <input
                    id="intro-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    maxLength={256}
                    placeholder="Enter your password"
                    disabled={busy}
                    className="w-full rounded-lg border border-purple-500/30 bg-slate-900/70 px-4 py-3 font-sans text-purple-100 outline-none placeholder:text-purple-300/35 focus:border-purple-300"
                  />
                  {error && (
                    <p role="alert" className="mt-3 text-center font-sans text-sm text-red-300">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-3 font-sans font-medium text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                  >
                    {busy ? 'Checking password…' : 'Submit'}
                    {!busy && <CornerDownLeft size={16} />}
                  </button>
                </form>

                <p className="text-center font-sans text-xs text-purple-300/50">
                  Admin? <a href="/admin" className="underline hover:text-purple-200">Sign in here</a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}

function FloatingChars() {
  const chars = ['{ }', '</>', '()', '=>', 'const', '&&', '||', 'npm', 'git', '[]'];
  return (
    <div className="absolute inset-0">
      {chars.map((character, index) => (
        <span
          key={character}
          className="absolute font-mono text-xs text-purple-400/15"
          style={{
            top: `${(index * 97) % 90}%`,
            left: `${(index * 53) % 92}%`,
            animation: `float ${5 + (index % 4)}s ease-in-out infinite`,
            animationDelay: `${index * 0.7}s`,
          }}
        >
          {character}
        </span>
      ))}
    </div>
  );
}
