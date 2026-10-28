import axios from 'axios';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CornerDownLeft, Terminal } from 'lucide-react';
import { apiUrl, getApiErrorMessage } from '../lib/api';

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
    setTimeout(() => onAccess(data), 2600);
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
      const response = await axios.post(apiUrl('/api/access/verify'), { password });
      const data = response.data;

      setPassword('');
      if (!data.token || !['birthday', 'wish'].includes(data.page)) {
        throw new Error('The API response is missing a valid page-access token.');
      }
      acceptAccess(data);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'Cannot connect to the password service. Start the backend and configure server/.env.'
          : getApiErrorMessage(requestError)
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

      <AnimatePresence>
        {accepted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 overflow-hidden bg-slate-950/90 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_rgba(10,14,33,0.7)_32%,_rgba(2,6,23,0.96)_72%)]" />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-y-0 left-1/2 flex w-[78%] max-w-6xl -translate-x-1/2 items-center justify-center gap-10">
                <motion.div
                  initial={{ x: 0, rotateY: 0 }}
                  animate={{ x: -220, rotateY: 92 }}
                  transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                  className="relative h-[68vh] w-[38%] rounded-l-[2.5rem] border-r border-white/15 bg-gradient-to-br from-slate-700/90 via-slate-800/90 to-slate-950 shadow-[0_0_40px_rgba(148,163,184,0.2)]"
                  style={{ transformPerspective: '1600px' }}
                >
                  <div className="absolute inset-0 rounded-l-[2.5rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.25),transparent_35%,rgba(15,23,42,0.3))]" />
                  <div className="absolute inset-y-0 right-6 w-px bg-white/10" />
                </motion.div>

                <motion.div
                  initial={{ x: 0, rotateY: 0 }}
                  animate={{ x: 220, rotateY: -92 }}
                  transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                  className="relative h-[68vh] w-[38%] rounded-r-[2.5rem] border-l border-white/15 bg-gradient-to-bl from-slate-700/90 via-slate-800/90 to-slate-950 shadow-[0_0_40px_rgba(148,163,184,0.2)]"
                  style={{ transformPerspective: '1600px' }}
                >
                  <div className="absolute inset-0 rounded-r-[2.5rem] bg-[linear-gradient(225deg,rgba(255,255,255,0.25),transparent_35%,rgba(15,23,42,0.3))]" />
                  <div className="absolute inset-y-0 left-6 w-px bg-white/10" />
                </motion.div>
              </div>
            </motion.div>

            <Angel side="left" delay={0.35} />
            <Angel side="right" delay={0.35} />

            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.8 }}
              className="absolute inset-x-0 top-10 flex items-center justify-center"
            >
              <span className="rounded-full border border-white/20 bg-white/5 px-6 py-2 font-mono text-xs tracking-[0.35em] text-purple-100 uppercase shadow-[0_0_24px_rgba(255,255,255,0.08)]">
                Entry granted
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

function Angel({ side, delay }) {
  const isLeft = side === 'left';

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -70 : 70, y: 28, scale: 0.8 }}
      animate={{ opacity: 1, x: isLeft ? -140 : 140, y: 0, scale: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut', delay }}
      className={`absolute bottom-[16%] ${isLeft ? 'left-[18%]' : 'right-[18%]'}`}
    >
      <div className="relative h-44 w-32">
        <div
          className={`absolute ${isLeft ? 'left-2' : 'right-2'} top-6 h-6 rounded-full bg-white/90 blur-[2px] ${isLeft ? 'rotate-[-22deg]' : 'rotate-[22deg]'}`}
          style={{ width: '5.5rem' }}
        />
        <div
          className={`absolute ${isLeft ? 'left-2' : 'right-2'} top-12 h-20 w-20 rounded-[42%] bg-white/85 blur-[1px] ${isLeft ? 'rotate-[-32deg]' : 'rotate-[32deg]'}`}
        />
        <div
          className={`absolute ${isLeft ? 'left-8' : 'right-8'} top-12 h-20 w-20 rounded-[42%] bg-white/85 blur-[1px] ${isLeft ? 'rotate-[-18deg]' : 'rotate-[18deg]'}`}
        />
        <div className="absolute left-1/2 top-8 h-16 w-14 -translate-x-1/2 rounded-full bg-white/90" />
        <div className="absolute bottom-3 left-1/2 h-20 w-16 -translate-x-1/2 rounded-[38%] bg-white/90 shadow-[0_0_35px_rgba(255,255,255,0.25)]" />
        <div className="absolute left-1/2 top-16 h-[72px] w-2 -translate-x-1/2 rounded-full bg-white/90" />
        <div className="absolute left-1/2 top-[88px] h-4 w-4 -translate-x-1/2 rounded-full bg-slate-900/80" />
      </div>
    </motion.div>
  );
}
